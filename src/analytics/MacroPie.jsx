import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#eab308"];

export default function MacroPie({ macros }) {
  const data = [
    { name: "Protein", value: macros.protein || 0 },
    { name: "Carbs", value: macros.carbs || 0 },
    { name: "Fat", value: macros.fat || 0 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <h3>🥧 Macros (Last 7 Days)</h3>
        <div className="routine-empty">No macro data yet.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>🥧 Macros (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) =>
              `${name}: ${Math.round(value)}g`
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#e0f2fe",
            }}
            formatter={(v, n) => [`${Math.round(v)}g`, n]}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: "0.85rem" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}