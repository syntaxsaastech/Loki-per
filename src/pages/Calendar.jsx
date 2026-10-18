import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, ensureUser } from "../firebase";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(key) {
  const [y, m, d] = key.split("-");
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  
  const [routines, setRoutines] = useState([]);
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState([]);
  
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubRoutines = () => {};
    let unsubMeals = () => {};
    let unsubGoals = () => {};

    (async () => {
      try {
        const user = await ensureUser();

        const qRoutines = query(collection(db, "routines"), where("uid", "==", user.uid));
        unsubRoutines = onSnapshot(qRoutines, (snap) => {
          setRoutines(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });

        const qMeals = query(collection(db, "meals"), where("uid", "==", user.uid));
        unsubMeals = onSnapshot(qMeals, (snap) => {
          setMeals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });

        const qGoals = query(collection(db, "goals"), where("uid", "==", user.uid));
        unsubGoals = onSnapshot(qGoals, (snap) => {
          setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });

      } catch (err) {
        console.error("Calendar load error:", err);
        setLoading(false);
      }
    })();

    return () => { unsubRoutines(); unsubMeals(); unsubGoals(); };
  }, []);

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(new Date());

  const routinesByDate = routines.reduce((acc, r) => {
    if (r.doneDate) {
      if (!acc[r.doneDate]) acc[r.doneDate] = [];
      acc[r.doneDate].push(r);
    }
    return acc;
  }, {});

  const mealsByDate = meals.reduce((acc, m) => {
    if (m.date) {
      if (!acc[m.date]) acc[m.date] = [];
      acc[m.date].push(m);
    }
    return acc;
  }, {});

  const goalsByDate = goals.reduce((acc, g) => {
    if (g.lastReset) {
      if (!acc[g.lastReset]) acc[g.lastReset] = [];
      acc[g.lastReset].push(g);
    }
    return acc;
  }, {});

  // ---------- HELPER: CALCULATE DAY RATING ----------
  const getDayRating = (dayKey) => {
    // 👇 If the day is in the future, return neutral (no color)
    if (dayKey > todayKey) return "neutral";

    const dayRoutines = routinesByDate[dayKey] || [];
    const dayMeals = mealsByDate[dayKey] || [];
    const dayGoals = goalsByDate[dayKey] || [];

    let score = 0;
    let totalFactors = 0;

    // 1. Check Routines
    if (routines.length > 0) {
      totalFactors++;
      if (dayRoutines.length / routines.length >= 0.7) score += 2;
      else if (dayRoutines.length > 0) score += 1;
    }

    // 2. Check Goals
    if (dayGoals.length > 0) {
      totalFactors++;
      const completedGoals = dayGoals.filter(g => (g.progress || 0) >= g.target).length;
      if (completedGoals / dayGoals.length >= 0.7) score += 2;
      else if (completedGoals > 0) score += 1;
    }

    // 3. Check Food
    if (dayMeals.length > 0) {
      totalFactors++;
      const totalCalories = dayMeals.reduce((sum, m) => sum + (m.totals?.calories || 0), 0);
      if (totalCalories >= 1500 && totalCalories <= 2500) score += 2;
      else if (totalCalories > 1000) score += 1;
    }

    // If no data was recorded at all for a past day, it's a "bad" day (or neutral if no routines exist)
    if (totalFactors === 0) return "neutral"; 

    const avgScore = score / (totalFactors * 2);
    if (avgScore >= 0.7) return "good";
    if (avgScore >= 0.4) return "medium";
    return "bad";
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } 
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } 
    else setMonth(month + 1);
  };
  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-cell empty" />);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = toKey(date);
    
    const dayRoutines = routinesByDate[key] || [];
    const dayMeals = mealsByDate[key] || [];
    const dayGoals = goalsByDate[key] || [];
    
    const hasData = dayRoutines.length > 0 || dayMeals.length > 0 || dayGoals.length > 0;
    const isToday = key === todayKey;
    
    // Get the rating for the calendar cell border
    const rating = getDayRating(key);
    const ratingColor = 
      rating === "good" ? "#22c55e" : 
      rating === "medium" ? "#eab308" : 
      rating === "bad" ? "#ef4444" : "transparent";

    cells.push(
      <div
        key={key}
        className={`cal-cell ${isToday ? "today" : ""} ${hasData ? "has-data" : ""}`}
        onClick={() => setSelectedDay(key)}
        style={{ borderBottom: ratingColor !== "transparent" ? `4px solid ${ratingColor}` : "none" }}
      >
        <div className="cal-day-num">{d}</div>
        {hasData && (
          <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginTop: "2px" }}>
            {dayMeals.length > 0 && <span style={{ fontSize: "8px" }}>🍱</span>}
            {dayRoutines.length > 0 && <span style={{ fontSize: "8px" }}>📅</span>}
            {dayGoals.length > 0 && <span style={{ fontSize: "8px" }}>🎯</span>}
          </div>
        )}
      </div>
    );
  }

  // Rating logic for the Modal Header
  const selectedRating = selectedDay ? getDayRating(selectedDay) : "neutral";
  const modalHeaderColor = 
    selectedRating === "good" ? "#22c55e" : 
    selectedRating === "medium" ? "#eab308" : 
    selectedRating === "bad" ? "#ef4444" : "#00e5ff";
  
  const ratingText = 
    selectedRating === "good" ? "🌟 Good Day" : 
    selectedRating === "medium" ? "⚖️ Average Day" : 
    selectedRating === "bad" ? "⚠️ Bad Day" : "No Rating";

  return (
    <div className="page">
      <h1>📆 Calendar</h1>
      <p className="page-sub">
        See your daily history. Tap any day to view Food, Routine, and Goals.
      </p>

      {loading && <p className="routine-empty">Loading…</p>}

      {!loading && (
        <>
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={prevMonth}>←</button>
            <div className="cal-title">{MONTHS[month]} {year}</div>
            <button className="cal-nav-btn" onClick={nextMonth}>→</button>
          </div>

          <button className="btn-today" onClick={goToday}>📍 Go to Today</button>

          <div className="cal-weekdays">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">{w}</div>
            ))}
          </div>

          <div className="cal-grid">{cells}</div>
        </>
      )}

      {/* ---------- DAY DETAIL MODAL ---------- */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ border: `2px solid ${modalHeaderColor}` }}>
            
            {/* COLOR CODED HEADER */}
            <div className="modal-header" style={{ borderBottom: `2px solid ${modalHeaderColor}`, paddingBottom: "10px" }}>
              <div>
                <h2 style={{ color: modalHeaderColor, margin: 0 }}>{formatLongDate(selectedDay)}</h2>
                <div style={{ color: modalHeaderColor, fontSize: "14px", fontWeight: "bold" }}>{ratingText}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedDay(null)}>✕</button>
            </div>

            <div className="modal-body">
              
              {/* 1. FOOD SECTION */}
              <h3 className="modal-subtitle">🍱 Food Log</h3>
              {(!mealsByDate[selectedDay] || mealsByDate[selectedDay].length === 0) ? (
                <p className="modal-empty">No food logged on this day.</p>
              ) : (
                <div className="modal-list">
                  {mealsByDate[selectedDay].map((m) => (
                    <div key={m.id} className="modal-item" style={{ borderLeftColor: "#f59e0b" }}>
                      <div className="modal-item-icon">🍽️</div>
                      <div className="modal-item-info">
                        <div className="modal-item-title">{m.name} ({m.time})</div>
                        <div className="modal-item-meta">🔥 {m.totals?.calories} kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. ROUTINE SECTION */}
              <h3 className="modal-subtitle">📅 Routine</h3>
              {(!routinesByDate[selectedDay] || routinesByDate[selectedDay].length === 0) ? (
                <p className="modal-empty">No routines completed.</p>
              ) : (
                <div className="modal-list">
                  {routinesByDate[selectedDay].map((r) => (
                    <div key={r.id} className="modal-item" style={{ borderLeftColor: r.color }}>
                      <div className="modal-item-icon">{r.icon}</div>
                      <div className="modal-item-info">
                        <div className="modal-item-title">{r.title}</div>
                        <div className="modal-item-meta">{r.slot}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. GOALS SECTION */}
              <h3 className="modal-subtitle">🎯 Goals</h3>
              {(!goalsByDate[selectedDay] || goalsByDate[selectedDay].length === 0) ? (
                <p className="modal-empty">No goal progress recorded.</p>
              ) : (
                <div className="modal-list">
                  {goalsByDate[selectedDay].map((g) => (
                    <div key={g.id} className="modal-item" style={{ borderLeftColor: g.color }}>
                      <div className="modal-item-icon">{g.icon}</div>
                      <div className="modal-item-info">
                        <div className="modal-item-title">{g.name}</div>
                        <div className="modal-item-meta">Progress: {g.progress} / {g.target} {g.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}