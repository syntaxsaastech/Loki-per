import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function CalorieChart({ data, target = 2200 }) {
  if (!data || !data.length) {
    return <div className="routine-empty">No calorie data yet.</div>;
  }

  return (
    <div className="chart-card">
      <h3>📈 Calories (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="calLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} interval={4} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#e0f2fe",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v) => [`${v} kcal`, "Calories"]}
          />
          <ReferenceLine
            y={target}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{ value: "Target", fill: "#22c55e", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="url(#calLine)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#38bdf8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}