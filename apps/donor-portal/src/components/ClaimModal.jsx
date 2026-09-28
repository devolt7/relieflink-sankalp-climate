import { useState } from "react";
import { submitClaim } from "../services/dataService";

export default function ClaimModal({ need, campName, onClose }) {
  const remaining = need.quantityNeeded - need.quantityFulfilled;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState(Math.min(10, remaining));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const valid = name.trim().length > 1 && contact.trim().length > 3 && quantity > 0 && quantity <= remaining;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitClaim({
        needId: need.id,
        donorName: name.trim(),
        donorContact: contact.trim(),
        quantityClaimed: Number(quantity),
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong submitting your claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fulfilled-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e6e5c" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-display text-base font-semibold text-ink">Claim recorded</h3>
            <p className="mt-1 text-sm text-body-soft">
              {campName} has been notified you're bringing {quantity} {need.item.toLowerCase()}.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white hover:bg-action-hover transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-base font-semibold text-ink">Claim: {need.item}</h3>
            <p className="mt-1 text-xs text-body-soft">
              {campName} needs {remaining} more. Tell them what you're bringing.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
                  Your name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
                  Phone or email
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="So the camp can reach you"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
                  Quantity (max {remaining})
                </label>
                <input
                  type="number"
                  min={1}
                  max={remaining}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm font-mono-data outline-none focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>

              {error && <p className="text-xs text-critical">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-body hover:bg-paper-dim transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!valid || submitting}
                  className="flex-1 rounded-lg bg-action px-4 py-2.5 text-sm font-medium text-white hover:bg-action-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Confirm claim"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
