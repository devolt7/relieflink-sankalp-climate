export default function Filters({ districts, items, filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const selectCls =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-body focus:border-action focus:ring-1 focus:ring-action outline-none appearance-none";

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
          District
        </label>
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
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
          Item
        </label>
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
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-body-soft">
          Urgency
        </label>
        <select className={selectCls} value={filters.urgency} onChange={(e) => update("urgency", e.target.value)}>
          <option value="all">All urgency</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Moderate">Moderate</option>
        </select>
      </div>
    </div>
  );
}
