import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { URGENCY, URGENCY_ORDER } from "./urgency";

export default function UrgencyChart({ byUrgency }) {
  const data = URGENCY_ORDER.map((level) => ({
    level,
    count: byUrgency[level] ?? 0,
  }));

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-body-soft">Open needs by urgency</p>
      <div className="mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ece7" vertical={false} />
            <XAxis dataKey="level" tick={{ fontSize: 12, fill: "#64726d" }} axisLine={{ stroke: "#d8ded9" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64726d" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#f4f6f4" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #d8ded9", fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.level} fill={URGENCY[d.level].hex} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
