const CATEGORY_META = {
  general:    { icon: "💭", color: "#38bdf8", label: "General" },
  personal:   { icon: "👤", color: "#a855f7", label: "Personal" },
  health:     { icon: "🏥", color: "#ef4444", label: "Health" },
  preference: { icon: "⭐", color: "#eab308", label: "Preference" },
  goal:       { icon: "🎯", color: "#22c55e", label: "Goal" },
  decision:   { icon: "⚖️", color: "#f97316", label: "Decision" },
  event:      { icon: "🎉", color: "#ec4899", label: "Life Event" },
  lesson:     { icon: "📚", color: "#14b8a6", label: "Lesson" },
};

export default function MemoryCard({ memory, onDelete, onClick }) {
  const meta = CATEGORY_META[memory.category] || CATEGORY_META.general;

  // Format the Firebase timestamp into a readable date
  const formatDate = (seconds) => {
    if (!seconds) return "Just now";
    return new Date(seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="memory-card"
      style={{ borderLeftColor: meta.color }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="mc-icon" title={meta.label}>
        {meta.icon}
      </div>

      <div className="mc-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="mc-key">{memory.key}</div>
          {memory.createdAt && (
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              {formatDate(memory.createdAt.seconds)}
            </span>
          )}
        </div>
        
        <div className="mc-value">{memory.value}</div>
        
        <div
          className="mc-category"
          style={{
            background: `${meta.color}20`,
            color: meta.color,
            borderColor: `${meta.color}50`,
          }}
        >
          {meta.label}
        </div>
      </div>

      {onDelete && (
        <button
          className="mc-del"
          onClick={(e) => {
            e.stopPropagation(); // Prevents the card onClick from firing
            onDelete(memory.id);
          }}
          title="Delete memory"
        >
          🗑️
        </button>
      )}
    </div>
  );
}