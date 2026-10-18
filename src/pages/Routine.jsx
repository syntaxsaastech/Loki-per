import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";
import ProgressRing from "../components/ProgressRing";

const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

const CATEGORIES = [
  { id: "exercise", label: "Exercise", icon: "🏋️", color: "#22c55e" },
  { id: "study", label: "Study", icon: "📚", color: "#3b82f6" },
  { id: "money", label: "Save Money", icon: "💰", color: "#eab308" },
  { id: "nosocial", label: "Avoid Social Media", icon: "📵", color: "#ef4444" },
  { id: "sleep", label: "Sleep Early", icon: "😴", color: "#a855f7" },
  { id: "water", label: "Drink Water", icon: "💧", color: "#06b6d4" },
  { id: "meditation", label: "Meditation", icon: "🧘", color: "#14b8a6" },
  { id: "custom", label: "Custom", icon: "⭐", color: "#f97316" },
];

// Date Helpers
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getPastDateKey(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDisplayDate(d = new Date()) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function Routine() {
  const [routines, setRoutines] = useState([]);
  const [history, setHistory] = useState({}); // Stores past history by date
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState("Morning");
  const [category, setCategory] = useState("exercise");
  const [limit, setLimit] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(getTodayKey());
  const [uid, setUid] = useState(null);

  // 1. Load Current Habits
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        setUid(user.uid);
        const q = query(collection(db, "routines"), where("uid", "==", user.uid));
        unsub = onSnapshot(q, (snapshot) => {
          setRoutines(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      } catch (err) {
        console.error("Auth error:", err);
        setLoading(false);
      }
    })();
    return () => unsub();
  }, []);

  // 2. Load History (Past 7 days)
  useEffect(() => {
    if (!uid) return;
    
    // We fetch all routines, and we will filter them by date for the history
    const q = query(collection(db, "routines"), where("uid", "==", uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const allRoutines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Group completed routines by date
      const histMap = {};
      allRoutines.forEach(r => {
        if (r.doneDate) {
          if (!histMap[r.doneDate]) histMap[r.doneDate] = [];
          histMap[r.doneDate].push(r);
        }
      });
      setHistory(histMap);
    });
    
    return () => unsub();
  }, [uid]);

  const addRoutine = async () => {
    if (!title.trim() || !uid) return;
    const cat = CATEGORIES.find((c) => c.id === category);
    await addDoc(collection(db, "routines"), {
      uid, title: title.trim(), slot, category, icon: cat.icon, color: cat.color,
      limit: limit.trim(), time, done: false, doneDate: null, createdAt: serverTimestamp(),
    });
    setTitle(""); setLimit(""); setTime(""); setShowForm(false);
  };

  const toggleDone = async (routine) => {
    const isDone = !routine.done || routine.doneDate !== today;
    await updateDoc(doc(db, "routines", routine.id), {
      done: isDone,
      doneDate: isDone ? today : null,
    });
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, "routines", id));
  };

  // Stats for Today
  const doneToday = routines.filter((r) => r.done && r.doneDate === today).length;
  const total = routines.length;
  const progress = total > 0 ? Math.round((doneToday / total) * 100) : 0;

  // Generate Past 7 Days array for History
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const dateKey = getPastDateKey(i);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);
    
    // Count how many routines were completed on this day
    const completedThatDay = history[dateKey]?.length || 0;
    const dayProgress = total > 0 ? Math.round((completedThatDay / total) * 100) : 0;
    
    let label = "Today";
    if (i === 1) label = "Yesterday";
    if (i > 1) label = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    return {
      key: dateKey,
      label,
      completed: completedThatDay,
      progress: dayProgress,
      isToday: i === 0
    };
  });

  return (
    <div className="page" style={{ paddingBottom: 50 }}>
      <h1>📅 Daily Routine</h1>
      <div className="routine-date">{formatDisplayDate()}</div>
      <p className="page-sub">Build discipline. Auto-saved to the cloud.</p>

      {/* TOP SUMMARY */}
      <div style={{ display: "flex", alignItems: "center", gap: 30, background: "rgba(0,229,255,0.05)", padding: 20, borderRadius: 16, marginBottom: 30 }}>
        <ProgressRing progress={progress} size={120} strokeWidth={10} color="#00e5ff">
          <div style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>{progress}%</div>
        </ProgressRing>
        <div>
          <h2 style={{ margin: 0, color: "white" }}>Today's Progress</h2>
          <p style={{ margin: "5px 0 0 0", color: "#aaa" }}>
            You completed <b>{doneToday}</b> out of <b>{total}</b> habits.
          </p>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 10, padding: "8px 16px", fontSize: 13 }}>
            {showForm ? "✕ Cancel" : "＋ Add Routine"}
          </button>
        </div>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div style={{ background: "rgba(0,0,0,0.4)", padding: 20, borderRadius: 12, marginBottom: 30 }}>
          <input placeholder="What do you want to do? (e.g., 30 min jogging)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 10, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, background: "#111", color: "white" }}>{TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, background: "#111", color: "white" }}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, background: "#111", color: "white" }} />
            <input placeholder="Limit/Target" value={limit} onChange={(e) => setLimit(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 8, background: "#111", color: "white" }} />
          </div>
          <button className="btn-primary" onClick={addRoutine} style={{ width: "100%" }}>Save Routine</button>
        </div>
      )}

      {/* CURRENT HABITS LIST */}
      {loading && <p className="routine-empty">Loading from Firebase…</p>}
      {TIME_SLOTS.map((s) => {
        const items = routines.filter((r) => r.slot === s).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        if (!items.length) return null;
        return (
          <div key={s} style={{ marginBottom: 20 }}>
            <h3 style={{ color: "#00e5ff", fontSize: 13, textTransform: "uppercase" }}>{s}</h3>
            {items.map((r) => {
              const isDone = r.done && r.doneDate === today;
              return (
                <div key={r.id} style={{ background: isDone ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.05)", borderLeft: `4px solid ${r.color}`, padding: 15, borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", opacity: isDone ? 0.6 : 1 }} onClick={() => toggleDone(r)}>
                  <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{r.icon}</span>
                    <div>
                      <div style={{ color: "white", fontWeight: "bold", textDecoration: isDone ? "line-through" : "none" }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>🕐 {formatTime(r.time)} {r.limit && `• 🎯 ${r.limit}`}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{isDone ? "✅" : "⭕"}</span>
                    <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ============ HISTORY SECTION ============ */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ color: "white", marginBottom: 15 }}>📊 Progress History</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {past7Days.map((day) => (
            <div key={day.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: day.isToday ? "rgba(0, 229, 255, 0.1)" : "rgba(255,255,255,0.03)", padding: 15, borderRadius: 12, border: day.isToday ? "1px solid #00e5ff" : "1px solid transparent" }}>
              
              <div style={{ width: 120 }}>
                <div style={{ color: day.isToday ? "#00e5ff" : "white", fontWeight: "bold" }}>{day.label}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{day.completed} completed</div>
              </div>

              {/* Progress Bar */}
              <div style={{ flex: 1, margin: "0 20px" }}>
                <div style={{ width: "100%", height: 8, background: "#222", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${day.progress}%`, height: "100%", background: day.progress === 100 ? "#22c55e" : "#00e5ff", transition: "width 0.5s ease" }} />
                </div>
              </div>

              <div style={{ width: 40, textAlign: "right", color: "white", fontWeight: "bold" }}>
                {day.progress}%
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}