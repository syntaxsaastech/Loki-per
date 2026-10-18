import { streakColor } from "../../utils/analyticsCalc";

export default function StreakHeatmap({ streak, dates }) {
  const total = streak?.length || 0;

  if (!total) {
    return (
      <div className="chart-card">
        <h3>🔥 Routine Streak (Last 30 Days)</h3>
        <div className="routine-empty">No routine data yet.</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>🔥 Routine Streak (Last 30 Days)</h3>

      <div className="heatmap">
        {streak.map((pct, i) => (
          <div
            key={i}
            className="heat-cell"
            title={`${dates?.[i] || ""}: ${pct}%`}
            style={{ background: streakColor(pct) }}
          />
        ))}
      </div>

      <div className="heatmap-legend">
        <span>0%</span>
        <span className="hl-swatch" style={{ background: streakColor(0) }} />
        <span className="hl-swatch" style={{ background: streakColor(20) }} />
        <span className="hl-swatch" style={{ background: streakColor(50) }} />
        <span className="hl-swatch" style={{ background: streakColor(80) }} />
        <span className="hl-swatch" style={{ background: streakColor(100) }} />
        <span>100%</span>
      </div>
    </div>
  );
}