-- ============================================================================
-- ReliefLink — Pledge flow (F3)         Owner: Person 2 (Donor Portal)
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Pledged -> Dispatched -> Received
--   * donor pledges            -> create_pledge()
--   * donor marks dispatched   -> mark_pledge_dispatched()
--   * CAMP confirms received   -> confirm_pledge_received()   (Person 1 calls this)
--   * quantity_fulfilled on the need only goes up when the camp confirms.
--
-- Nothing here touches the old `claims` table or process_claim().
-- Works whatever type needs.id is (uuid / bigint / text).
-- ============================================================================

-- 1. Table (need_id type is copied from needs.id) ---------------------------
DO $$
DECLARE need_id_type text;
BEGIN
  SELECT format_type(a.atttypid, a.atttypmod) INTO need_id_type
  FROM pg_attribute a
  WHERE a.attrelid = 'public.needs'::regclass AND a.attname = 'id';

  EXECUTE format($f$
    CREATE TABLE IF NOT EXISTS public.pledges (
      id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      need_id            %s NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
      donor_name         text NOT NULL,
      donor_contact      text NOT NULL,
      donor_contact_key  text NOT NULL,
      quantity           integer NOT NULL CHECK (quantity > 0),
      note               text,
      status             text NOT NULL DEFAULT 'pledged'
                         CHECK (status IN ('pledged','dispatched','received','cancelled')),
      created_at         timestamptz NOT NULL DEFAULT now(),
      dispatched_at      timestamptz,
      received_at        timestamptz
    )$f$, need_id_type);
END $$;

CREATE INDEX IF NOT EXISTS pledges_need_idx    ON public.pledges (need_id);
CREATE INDEX IF NOT EXISTS pledges_contact_idx ON public.pledges (donor_contact_key);

-- Direct table access is closed; everything goes through the functions below
-- (SECURITY DEFINER), so donor phone numbers / emails are never exposed.
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

-- 2. Helpers ----------------------------------------------------------------
-- Same person = same key: emails lower-cased, phones reduced to last 10 digits.
CREATE OR REPLACE FUNCTION public.norm_contact(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p LIKE '%@%' THEN lower(btrim(p))
    ELSE right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10)
  END
$$;

-- 3. create_pledge ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_pledge(
  p_need_id text, p_donor_name text, p_donor_contact text,
  p_quantity integer, p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n         public.needs%ROWTYPE;
  in_flight integer;
  available integer;
  new_id    uuid;
  ckey      text := public.norm_contact(p_donor_contact);
BEGIN
  IF length(btrim(coalesce(p_donor_name, ''))) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter your name.');
  END IF;
  IF ckey IS NULL OR length(ckey) < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a valid phone number or email.');
  END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be at least 1.');
  END IF;

  SELECT * INTO n FROM public.needs WHERE id::text = p_need_id AND archived = false FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'This need is no longer available.');
  END IF;

  SELECT coalesce(sum(quantity), 0) INTO in_flight
  FROM public.pledges WHERE need_id = n.id AND status IN ('pledged', 'dispatched');

  available := n.quantity_needed - n.quantity_fulfilled - in_flight;
  IF available <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Every remaining unit of this need is already pledged.');
  END IF;
  IF p_quantity > available THEN
    RETURN jsonb_build_object('success', false, 'error', format('Only %s more can be pledged for this need.', available));
  END IF;

  INSERT INTO public.pledges (need_id, donor_name, donor_contact, donor_contact_key, quantity, note)
  VALUES (n.id, btrim(p_donor_name), btrim(p_donor_contact), ckey, p_quantity,
          nullif(left(btrim(coalesce(p_note, '')), 300), ''))
  RETURNING id INTO new_id;

  -- Touch the need so every open portal gets a realtime event and refreshes.
  UPDATE public.needs SET updated_at = now() WHERE id = n.id;

  RETURN jsonb_build_object('success', true, 'pledge_id', new_id);
END $$;

-- 4. get_public_pledges: donation history (no contact details) ----------------
CREATE OR REPLACE FUNCTION public.get_public_pledges() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'need_id', need_id::text, 'donor_name', donor_name, 'quantity', quantity,
    'status', status, 'created_at', created_at,
    'dispatched_at', dispatched_at, 'received_at', received_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  FROM public.pledges WHERE status <> 'cancelled'
$$;

-- 5. get_my_pledges: everything a donor pledged, matched by phone/email --------
CREATE OR REPLACE FUNCTION public.get_my_pledges(p_contact text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'need_id', p.need_id::text, 'item', n.item,
    'camp_id', c.id::text, 'camp_name', c.name, 'district', c.district,
    'camp_phone', c.contact_phone, 'donor_name', p.donor_name,
    'quantity', p.quantity, 'note', p.note, 'status', p.status,
    'created_at', p.created_at, 'dispatched_at', p.dispatched_at, 'received_at', p.received_at
  ) ORDER BY p.created_at DESC), '[]'::jsonb)
  FROM public.pledges p
  JOIN public.needs n ON n.id = p.need_id
  JOIN public.camps c ON c.id = n.camp_id
  WHERE p.donor_contact_key = public.norm_contact(p_contact)
    AND length(public.norm_contact(p_contact)) >= 5
$$;

-- 6. Donor actions -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_pledge_dispatched(p_pledge_id uuid, p_contact text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pl public.pledges%ROWTYPE;
BEGIN
  SELECT * INTO pl FROM public.pledges
  WHERE id = p_pledge_id AND donor_contact_key = public.norm_contact(p_contact) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Pledge not found.'); END IF;
  IF pl.status <> 'pledged' THEN
    RETURN jsonb_build_object('success', false, 'error', format('This pledge is already %s.', pl.status));
  END IF;
  UPDATE public.pledges SET status = 'dispatched', dispatched_at = now() WHERE id = pl.id;
  UPDATE public.needs SET updated_at = now() WHERE id = pl.need_id;
  RETURN jsonb_build_object('success', true);
END $$;

CREATE OR REPLACE FUNCTION public.cancel_pledge(p_pledge_id uuid, p_contact text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pl public.pledges%ROWTYPE;
BEGIN
  SELECT * INTO pl FROM public.pledges
  WHERE id = p_pledge_id AND donor_contact_key = public.norm_contact(p_contact) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Pledge not found.'); END IF;
  IF pl.status <> 'pledged' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pledges that have not been dispatched can be cancelled.');
  END IF;
  UPDATE public.pledges SET status = 'cancelled' WHERE id = pl.id;
  UPDATE public.needs SET updated_at = now() WHERE id = pl.need_id;
  RETURN jsonb_build_object('success', true);
END $$;

-- 7. Camp action (Person 1 wires the "Mark Received" button to this) -----------
CREATE OR REPLACE FUNCTION public.confirm_pledge_received(p_pledge_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pl public.pledges%ROWTYPE;
  n  public.needs%ROWTYPE;
  new_fulfilled integer;
BEGIN
  SELECT * INTO pl FROM public.pledges WHERE id = p_pledge_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Pledge not found.'); END IF;
  IF pl.status NOT IN ('pledged', 'dispatched') THEN
    RETURN jsonb_build_object('success', false, 'error', format('This pledge is already %s.', pl.status));
  END IF;

  UPDATE public.pledges SET status = 'received', received_at = now() WHERE id = pl.id;

  SELECT * INTO n FROM public.needs WHERE id = pl.need_id FOR UPDATE;
  new_fulfilled := least(n.quantity_needed, n.quantity_fulfilled + pl.quantity);

  -- literals (not a CASE) so this also works if needs.status is an enum
  IF new_fulfilled >= n.quantity_needed THEN
    UPDATE public.needs SET quantity_fulfilled = new_fulfilled, status = 'fulfilled', updated_at = now() WHERE id = n.id;
  ELSIF new_fulfilled > 0 THEN
    UPDATE public.needs SET quantity_fulfilled = new_fulfilled, status = 'partially_fulfilled', updated_at = now() WHERE id = n.id;
  ELSE
    UPDATE public.needs SET quantity_fulfilled = new_fulfilled, updated_at = now() WHERE id = n.id;
  END IF;

  RETURN jsonb_build_object('success', true, 'quantity_fulfilled', new_fulfilled);
END $$;

-- 8. Permissions -----------------------------------------------------------------
GRANT EXECUTE ON FUNCTION
  public.create_pledge(text, text, text, integer, text),
  public.get_public_pledges(),
  public.get_my_pledges(text),
  public.mark_pledge_dispatched(uuid, text),
  public.cancel_pledge(uuid, text),
  public.confirm_pledge_received(uuid)
TO anon, authenticated;
