import ProgressRing from "./ProgressRing";

export default function GoalCard({ goal, value, progress, onIncrement, onReset, onDelete }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, marginBottom: 15, display: "flex", alignItems: "center", border: `1px solid ${goal.color}40`, boxShadow: `0 4px 15px ${goal.color}20` }}>
      
      {/* Progress Ring */}
      <div style={{ marginRight: 20 }}>
        <ProgressRing progress={progress} size={80} strokeWidth={8} color={goal.color}>
          <div style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
            {progress}%
          </div>
        </ProgressRing>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{goal.icon}</span>
          <h3 style={{ margin: 0, color: "white" }}>{goal.name}</h3>
        </div>
        <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
          {value} / {goal.target} {goal.unit}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button 
          onClick={() => onIncrement(1)}
          style={{ background: goal.color, color: "#000", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, fontWeight: "bold", cursor: "pointer" }}
        >
          +
        </button>
        <button 
          onClick={onReset}
          style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
        >
          Reset
        </button>
        <button 
          onClick={onDelete}
          style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 20, cursor: "pointer" }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}