export default function ActionConfirm({ action, onConfirm, onCancel, executing }) {
  if (!action) return null;
  const p = action.preview;

  return (
    <div className="action-confirm">
      <div className="ac-title">🎬 {p.title}</div>

      {p.items && (
        <div className="ac-items">
          {p.items.map((it, i) => (
            <div key={i} className="ac-item">
              • {it.name} ({it.grams}g) — {it.calories} kcal
            </div>
          ))}
          <div className="ac-total">
            Total: <b>{p.items.reduce((s, i) => s + i.calories, 0)} kcal</b> ({p.mealTime})
          </div>
        </div>
      )}

      {p.title2 && <div className="ac-item">• {p.title2}</div>}
      {p.goalName && <div className="ac-item">Goal: {p.goalName} → {p.value}</div>}

      <div className="ac-actions">
        <button className="ac-confirm" onClick={onConfirm} disabled={executing}>
          {executing ? "Working…" : "✓ Confirm"}
        </button>
        <button className="ac-cancel" onClick={onCancel} disabled={executing}>✕ Cancel</button>
      </div>
    </div>
  );
}