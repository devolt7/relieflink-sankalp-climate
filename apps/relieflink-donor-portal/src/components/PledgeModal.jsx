import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPledge } from "../services/dataService";
import { isValidContact } from "../lib/format";
import { useDonor } from "../context/DonorContext";
import VerifiedBadge from "./VerifiedBadge";

const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft";
const inputCls =
  "w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-action focus:ring-1 focus:ring-action";

export default function PledgeModal({ need, camp, onClose }) {
  const navigate = useNavigate();
  const { donorName, donorContact, rememberDonor } = useDonor();
  const available = need.quantityNeeded - need.quantityFulfilled - (need.inTransit || 0);

  const [name, setName] = useState(donorName);
  const [contact, setContact] = useState(donorContact);
  const [quantity, setQuantity] = useState(String(Math.min(10, available)));
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const qty = Number(quantity);
  const errors = {
    name: name.trim().length < 2 ? "Enter your name" : null,
    contact: !isValidContact(contact) ? "Enter a 10-digit phone number or a valid email" : null,
    quantity: !Number.isInteger(qty) || qty < 1 ? "Enter at least 1" : qty > available ? `Only ${available} can still be pledged` : null,
  };
  const valid = !errors.name && !errors.contact && !errors.quantity;
  const show = (k) => touched[k] && errors[k];
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, contact: true, quantity: true });
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await createPledge({
        needId: need.id,
        donorName: name.trim(),
        donorContact: contact.trim(),
        quantity: qty,
        note: note.trim(),
      });
      rememberDonor(name.trim(), contact.trim());
      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong recording your pledge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {done ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fulfilled-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e6e5c" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-display text-base font-semibold text-ink">Pledge recorded</h3>
            <p className="mt-1 text-sm text-body-soft">
              {camp.name} can see you're bringing {qty} × {need.item.toLowerCase()}. It counts as delivered once the
              camp confirms receipt.
            </p>
            <p className="mt-3 rounded-lg bg-paper-dim px-3 py-2 text-left text-xs text-body">
              <strong className="text-ink">Next:</strong> when you send it, mark it <em>Dispatched</em> in My Pledges so
              the camp knows it's on the way.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-paper-dim"
              >
                Done
              </button>
              <button
                onClick={() => navigate("/my-pledges")}
                className="flex-1 rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-action-hover"
              >
                My pledges
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-display text-base font-semibold text-ink">Pledge: {need.item}</h3>
            <p className="mt-1 text-xs text-body-soft">
              {camp.name} still needs {available} more. Tell them what you're bringing.
            </p>
            {camp.verification !== "verified" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-moderate-soft px-3 py-2 text-xs text-moderate">
                <VerifiedBadge verification={camp.verification} />
                <span>This camp hasn't been verified yet. Consider calling them before you send anything.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
              <div>
                <label className={labelCls}>Your name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} onBlur={blur("name")} placeholder="Full name" className={inputCls} />
                {show("name") && <p className="mt-1 text-xs text-critical">{errors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone or email</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onBlur={blur("contact")}
                  placeholder="So the camp can reach you"
                  inputMode="email"
                  className={inputCls}
                />
                {show("contact") && <p className="mt-1 text-xs text-critical">{errors.contact}</p>}
              </div>
              <div>
                <label className={labelCls}>Quantity (max {available})</label>
                <input
                  type="number"
                  min={1}
                  max={available}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={blur("quantity")}
                  className={`${inputCls} font-mono-data`}
                />
                {show("quantity") && <p className="mt-1 text-xs text-critical">{errors.quantity}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  Note <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 300))}
                  rows={2}
                  placeholder="e.g. arriving Friday by truck"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {error && <p className="text-xs text-critical">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-body transition-colors hover:bg-paper-dim"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Pledging…" : "Confirm pledge"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
