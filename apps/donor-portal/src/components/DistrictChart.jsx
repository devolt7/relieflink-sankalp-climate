import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DistrictChart({ byDistrict }) {
  const data = Object.entries(byDistrict)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-body-soft">Needs by district</p>
      <div className="mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ece7" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64726d" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="district"
              width={80}
              tick={{ fontSize: 12, fill: "#33403c" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f4f6f4" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #d8ded9", fontSize: 12 }}
            />
            <Bar dataKey="count" fill="#1e6e5c" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
