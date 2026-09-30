import { DEFAULT_FILTERS, countActiveFilters } from "../lib/filters";

export default function Filters({ districts, items, filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const active = countActiveFilters(filters);

  const selectCls =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-body focus:border-action focus:ring-1 focus:ring-action outline-none appearance-none";
  const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft";

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelCls}>District</label>
          <select className={selectCls} value={filters.district} onChange={(e) => update("district", e.target.value)}>
            <option value="all">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Item</label>
          <select className={selectCls} value={filters.item} onChange={(e) => update("item", e.target.value)}>
            <option value="all">All items</option>
            {items.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Urgency</label>
          <select className={selectCls} value={filters.urgency} onChange={(e) => update("urgency", e.target.value)}>
            <option value="all">All urgency</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-body">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => update("verifiedOnly", e.target.checked)}
            className="h-4 w-4 accent-[#1e6e5c]"
          />
          Verified camps only
        </label>
        {active > 0 && (
          <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-xs font-medium text-action hover:underline">
            Clear filters ({active})
          </button>
        )}
      </div>
    </div>
  );
}
