import { useState } from "react";
import { useMemory } from "../hooks/useMemory";
import MemoryList from "../components/memory/MemoryList";

const CATEGORIES = [
  { id: "general", label: "General", icon: "💭" },
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "preference", label: "Preference", icon: "⭐" },
  { id: "goal", label: "Goal", icon: "🎯" },
  { id: "decision", label: "Decision", icon: "⚖️" },
  { id: "event", label: "Life Event", icon: "🎉" },
  { id: "lesson", label: "Lesson", icon: "📚" },
];

export default function Memory() {
  const { memories, loading, saveMemory, deleteMemory, searchMemories } = useMemory();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("general");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSave = async () => {
    if (!key.trim() || !value.trim()) return;
    await saveMemory(key, value, category);
    setKey("");
    setValue("");
  };

  // Filter by category AND search query
  let filtered = filter === "all" ? memories : memories.filter((m) => m.category === filter);
  if (searchQuery) {
    filtered = searchMemories(searchQuery).filter(m => filter === "all" || m.category === filter);
  }

  return (
    <div className="page">
      <h1>🧠 Personal Memory Vault</h1>
      <p className="page-sub">
        Everything JARVIS remembers about you. Say <b>"remember my name is Lokesh"</b> to add, or search your vault below.
      </p>

      {/* Add form */}
      <div className="memory-form" style={{ flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <input
            placeholder="Topic (e.g., Business decision, Lokesh's birthday)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={{ flex: 1 }}
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "180px" }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        
        <textarea
          placeholder="Details (e.g., Decided to buy a new laptop next month)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(0,229,255,0.2)",
            color: "white",
            fontFamily: "inherit"
          }}
        />
        
        <button className="btn-primary" onClick={handleSave} style={{ alignSelf: "flex-end" }}>
          💾 Save to Vault
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ margin: "20px 0" }}>
        <input
          placeholder='🔍 Search your vault... (e.g., "laptop" or "decide")'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "16px", 
            fontSize: "16px", 
            borderRadius: "8px", 
            background: "rgba(4, 20, 35, 0.8)", 
            border: "2px solid #00e5ff", 
            color: "white" 
          }}
        />
      </div>

      {/* Filters */}
      <div className="memory-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({memories.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = memories.filter((m) => m.category === c.id).length;
          if (!count) return null;
          return (
            <button
              key={c.id}
              className={filter === c.id ? "active" : ""}
              onClick={() => setFilter(c.id)}
            >
              {c.icon} {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading && <p className="routine-empty">Loading vault…</p>}
      {!loading && (
        <MemoryList memories={filtered} onDelete={deleteMemory} />
      )}
    </div>
  );
}