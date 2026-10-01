import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import { useDonor } from "../context/DonorContext";
import { cancelPledge, confirmPledgeReceived, markPledgeDispatched } from "../services/dataService";
import { isValidContact } from "../lib/format";
import PledgeTracker from "../components/PledgeTracker";
import PledgeStatusPill from "../components/PledgeStatusPill";
import StatCard from "../components/StatCard";
import { HeartHandshake } from "lucide-react";

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "received", label: "Received" },
];

function ContactLookup({ onSubmit }) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = touched && !isValidContact(value);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (isValidContact(value)) onSubmit(value.trim());
      }}
      className="mx-auto max-w-sm rounded-2xl border border-line bg-white p-6 text-center"
    >
      <h2 className="font-display text-base font-semibold text-ink">Find your pledges</h2>
      <p className="mt-1 text-xs text-body-soft">Enter the phone number or email you used when pledging.</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Phone or email"
        inputMode="email"
        className="mt-4 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-action focus:ring-1 focus:ring-action"
      />
      {invalid && <p className="mt-1 text-left text-xs text-critical">Enter a 10-digit phone number or a valid email</p>}
      <button type="submit" className="mt-3 w-full rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-action-hover">
        Show my pledges
      </button>

      <div className="mt-4 pt-3 border-t border-line text-left">
        <p className="text-[11px] text-body-soft mb-1.5">Quick demonstration:</p>
        <button
          type="button"
          onClick={() => {
            setValue("+91 98765 43210");
            onSubmit("+91 98765 43210");
          }}
          className="w-full text-center rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-action hover:bg-paper-dim transition"
        >
          Load Demo Pledges (+91 98765 43210)
        </button>
      </div>
    </form>
  );
}

function PledgeCard({ pledge, contact, demo, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const cancelled = pledge.status === "Cancelled";
  const btn = "rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50";

  return (
    <li className={`rounded-xl border border-line bg-white p-4 ${cancelled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {pledge.quantity} × {pledge.item}
          </p>
          <p className="truncate text-xs text-body-soft">
            {pledge.campName} · {pledge.district}
          </p>
        </div>
        <PledgeStatusPill status={pledge.status} />
      </div>

      {!cancelled && (
        <div className="mt-4">
          <PledgeTracker pledge={pledge} />
        </div>
      )}

      {pledge.note && <p className="mt-3 rounded-lg bg-paper-dim px-3 py-2 text-xs text-body">“{pledge.note}”</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pledge.status === "Pledged" && (
          <>
            <button
              disabled={busy}
              onClick={() => run(() => markPledgeDispatched(pledge.id, contact))}
              className={`${btn} bg-action text-white hover:bg-action-hover`}
            >
              I've dispatched this
            </button>
            <button
              disabled={busy}
              onClick={() => window.confirm("Cancel this pledge? The camp will see the units as needed again.") && run(() => cancelPledge(pledge.id, contact))}
              className={`${btn} border border-line text-body hover:bg-paper-dim`}
            >
              Cancel pledge
            </button>
          </>
        )}
        {pledge.status === "Dispatched" && <p className="text-xs text-body-soft">On its way — waiting for the camp to confirm receipt.</p>}
        {pledge.status === "Received" && <p className="text-xs font-medium text-fulfilled">Received by the camp — thank you.</p>}
        {pledge.campPhone && !cancelled && (
          <a href={`tel:${pledge.campPhone}`} className="font-mono-data ml-auto text-xs text-action hover:underline">
            Call camp · {pledge.campPhone}
          </a>
        )}
      </div>

      {demo && (pledge.status === "Pledged" || pledge.status === "Dispatched") && (
        <button
          disabled={busy}
          onClick={() => run(() => confirmPledgeReceived(pledge.id))}
          className={`${btn} mt-3 w-full border border-line bg-paper text-body hover:bg-paper-dim font-medium`}
        >
          Confirm Camp Delivery Received (Field Demo)
        </button>
      )}
      {error && <p className="mt-2 text-xs text-critical">{error}</p>}
    </li>
  );
}

export default function MyPledgesPage() {
  const { donorContact, rememberDonor, forgetDonor, donorName, myPledges, pledgesLoading, pledgesError, refreshMyPledges } = useDonor();
  const [tab, setTab] = useState("all");
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";

  const live = myPledges.filter((p) => p.status !== "Cancelled");
  const inProgress = live.filter((p) => p.status === "Pledged" || p.status === "Dispatched");
  const received = live.filter((p) => p.status === "Received");
  const units = (list) => list.reduce((s, p) => s + p.quantity, 0);

  const visible = myPledges.filter((p) => {
    if (tab === "active") return p.status === "Pledged" || p.status === "Dispatched";
    if (tab === "received") return p.status === "Received";
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
      <BreadcrumbBar
        backTo="/donor"
        backLabel="Relief Map"
        current="My Pledges & Tracking"
        category="Donor Portfolio"
        subtitle={
          donorContact ? (
            <span>
              Verified pledges for <strong className="text-ink font-mono-data">{donorContact}</strong> ·{" "}
              <button onClick={forgetDonor} className="text-action font-semibold hover:underline">
                switch contact
              </button>
            </span>
          ) : (
            "Track dispatched supplies from pledge to confirmed delivery at relief camps."
          )
        }
        actions={
          <Link
            to="/donor"
            className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3 py-1.5 text-xs font-semibold text-white hover:bg-action-hover transition shadow-xs"
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Pledge More</span>
          </Link>
        }
      />

      {!donorContact ? (
        <ContactLookup onSubmit={(c) => rememberDonor(donorName, c)} />
      ) : pledgesError ? (
        <div className="rounded-xl border border-line bg-white p-6 text-center text-sm text-critical">{pledgesError.message}</div>
      ) : pledgesLoading ? (
        <div className="py-16 text-center text-sm text-body-soft">Loading your pledges…</div>
      ) : myPledges.length === 0 ? (
        <div className="rounded-xl border border-line bg-white px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold text-ink">No pledges found for this contact</p>
          <p className="mt-1 text-xs text-body-soft">Pledge to a camp's need and it will show up here.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link to="/donor" className="rounded-lg bg-action px-4 py-2 text-sm font-medium text-white hover:bg-action-hover">
              Browse Relief Camps on Map
            </Link>
            <button
              onClick={() => rememberDonor(donorName, "+91 98765 43210")}
              className="rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-body hover:bg-paper-dim"
            >
              Load Demo Pledges
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Pledges" value={live.length} />
            <StatCard label="On the way" value={units(inProgress)} sub="units" />
            <StatCard label="Delivered" value={units(received)} sub="units" tone="action" />
          </div>

          <div className="flex gap-1 rounded-lg bg-paper-dim p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.id ? "bg-white text-ink shadow-sm" : "text-body-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-body-soft">Nothing in this tab yet.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map((p) => (
                <PledgeCard key={p.id} pledge={p} contact={donorContact} demo={demo} onChanged={refreshMyPledges} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
