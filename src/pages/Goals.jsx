import { useState } from "react";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "../components/GoalCard";
import ProgressRing from "../components/ProgressRing";

export default function Goals() {
  const {
    goals, loading, addGoal, deleteGoal, incrementGoal, resetGoalToday, getTodayValue, getProgress,
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "", target: 8, unit: "glasses", icon: "💧", color: "#06b6d4",
  });

  // Calculate Overall Progress for the big ring at the top
  const totalGoals = goals.length;
  const overallProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + getProgress(g.id), 0) / totalGoals)
    : 0;

  const saveGoal = async () => {
    if (!newGoal.name.trim()) return;
    await addGoal(newGoal);
    setNewGoal({ name: "", target: 8, unit: "glasses", icon: "💧", color: "#06b6d4" });
    setShowForm(false);
  };

  return (
    <div className="page">
      <h1>🎯 Daily Goals</h1>
      <p className="page-sub">Track your water, steps, and study targets. Watch the rings fill up!</p>

      {/* ============ OVERALL DASHBOARD ============ */}
      <div style={{ display: "flex", alignItems: "center", gap: 30, background: "rgba(0,229,255,0.05)", padding: 20, borderRadius: 16, marginBottom: 30 }}>
        <ProgressRing progress={overallProgress} size={120} strokeWidth={10} color="#a855f7">
          <div style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>{overallProgress}%</div>
        </ProgressRing>
        <div>
          <h2 style={{ margin: 0, color: "white" }}>Overall Today</h2>
          <p style={{ margin: "5px 0 0 0", color: "#aaa" }}>You are {overallProgress}% close to hitting all your goals!</p>
        </div>
      </div>

      {/* ============ ADD BUTTON ============ */}
      <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: 20 }}>
        {showForm ? "✕ Cancel" : "＋ Add New Goal"}
      </button>

      {/* ============ ADD FORM ============ */}
      {showForm && (
        <div style={{ background: "rgba(0,0,0,0.4)", padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <input
            placeholder="Goal Name (e.g., Drink Water)"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            style={{ width: "100%", padding: 12, marginBottom: 10, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
          />
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              type="number"
              placeholder="Target (e.g., 8)"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) || 0 })}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
            />
            <input
              placeholder="Unit (e.g., glasses)"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
             <input
              placeholder="Icon (💧)"
              value={newGoal.icon}
              onChange={(e) => setNewGoal({ ...newGoal, icon: e.target.value })}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }}
            />
            <input
              type="color"
              value={newGoal.color}
              onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
              style={{ width: 50, borderRadius: 8, border: "none", cursor: "pointer" }}
            />
          </div>
          <button className="btn-primary" onClick={saveGoal} style={{ width: "100%" }}>
            Save Goal to Firebase
          </button>
        </div>
      )}

      {/* ============ GOALS LIST ============ */}
      {loading && <p style={{ color: "#aaa" }}>Loading goals from Firebase…</p>}
      {!loading && goals.length === 0 && <p style={{ color: "#aaa" }}>🌱 No goals yet. Add one above!</p>}

      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          value={getTodayValue(goal.id)}
          progress={getProgress(goal.id)}
          onIncrement={(amt) => incrementGoal(goal, amt)}
          onReset={() => resetGoalToday(goal.id)}
          onDelete={() => deleteGoal(goal.id)}
        />
      ))}
    </div>
  );
}