import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function WeightGraph({ data, goalWeight }) {
  if (!data || !data.length) {
    return (
      <div className="chart-card">
        <h3>⚖️ Weight Trajectory</h3>
        <div className="routine-empty">No weight data yet.</div>
      </div>
    );
  }

  const min = Math.min(...data.map((d) => d.weight)) - 1;
  const max = Math.max(...data.map((d) => d.weight)) + 1;

  return (
    <div className="chart-card">
      <h3>⚖️ Weight Trajectory (Predicted)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            domain={[min, max]}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#e0f2fe",
            }}
            formatter={(v) => [`${v} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#a855f7"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#a855f7" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {goalWeight && (
        <p className="weight-note">
          🎯 Goal: <b>{goalWeight} kg</b>
        </p>
      )}
    </div>
  );
}