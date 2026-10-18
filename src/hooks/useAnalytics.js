// src/hooks/useAnalytics.js
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, ensureUser } from "../firebase";

export function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState([]);

  const getDateKey = (daysAgo = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    let unsubs = [];
    (async () => {
      try {
        const user = await ensureUser();
        const uid = user.uid;

        const fetchCol = (colName, setter, isLast = false) => {
          const unsub = onSnapshot(query(collection(db, colName), where("uid", "==", uid)), (snap) => {
            setter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            if (isLast) setLoading(false);
          });
          unsubs.push(unsub);
        };

        fetchCol("meals", setMeals);
        fetchCol("routines", setRoutines);
        fetchCol("goals", setGoals);
        fetchCol("dailyStats", setStats, true);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // ---------- METRICS & CALCULATIONS ----------
  const todayKey = getDateKey(0);
  const yesterdayKey = getDateKey(1);

  // 1. Meals & Macros (Last 7 days)
  let totalCalories7 = 0, macros = { protein: 0, carbs: 0, fat: 0 };
  const caloriesByDate = {};
  meals.forEach(m => {
    if (!m.date) return;
    const cals = m.totals?.calories || 0;
    caloriesByDate[m.date] = (caloriesByDate[m.date] || 0) + cals;
    
    const d = new Date(m.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (d >= sevenDaysAgo) {
      totalCalories7 += cals;
      macros.protein += m.totals?.protein || 0;
      macros.carbs += m.totals?.carbs || 0;
      macros.fat += m.totals?.fat || 0;
    }
  });
  const avgCal = totalCalories7 / 7;

  // 2. Routines & Streaks
  const routinesByDate = {};
  routines.forEach(r => {
    if (r.done && r.doneDate) {
      routinesByDate[r.doneDate] = (routinesByDate[r.doneDate] || 0) + 1;
    }
  });

  const totalHabits = routines.length;
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Calculate streaks (over last 30 days)
  for (let i = 0; i < 30; i++) {
    const key = getDateKey(i);
    const completed = routinesByDate[key] || 0;
    if (completed > 0) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak; // If streak continues to today
    } else {
      if (i === 0) currentStreak = 0; // Streak broken today
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  // 3. Most Productive Hours
  const hoursMap = {};
  meals.forEach(m => {
    if (m.createdAt?.seconds) {
      const hour = new Date(m.createdAt.seconds * 1000).getHours();
      hoursMap[hour] = (hoursMap[hour] || 0) + 1;
    }
  });
  let bestHour = "N/A";
  let maxHourCount = 0;
  Object.keys(hoursMap).forEach(h => {
    if (hoursMap[h] > maxHourCount) { maxHourCount = hoursMap[h]; bestHour = h; }
  });
  const formattedBestHour = bestHour !== "N/A" ? `${bestHour}:00 - ${parseInt(bestHour)+1}:00` : "Not enough data";

  // 4. Compare This Week vs Last Week
  let thisWeekRoutines = 0;
  let lastWeekRoutines = 0;
  for (let i = 0; i < 7; i++) thisWeekRoutines += routinesByDate[getDateKey(i)] || 0;
  for (let i = 7; i < 14; i++) lastWeekRoutines += routinesByDate[getDateKey(i)] || 0;
  const weekDifference = thisWeekRoutines - lastWeekRoutines;

  // 5. Missed Routines
  const completedToday = routinesByDate[todayKey] || 0;
  const missedToday = Math.max(0, totalHabits - completedToday);

  // 6. Heatmap Data (30 Days)
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const key = getDateKey(29 - i);
    const done = routinesByDate[key] || 0;
    const pct = totalHabits > 0 ? Math.round((done / totalHabits) * 100) : 0;
    return { date: key, pct };
  });

  // 7. Chart Data (Last 7 Days)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = getDateKey(6 - i);
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      calories: caloriesByDate[key] || 0,
      routines: routinesByDate[key] || 0,
      water: stats.find(s => s.date === key)?.water || 0,
    };
  });

  return {
    loading, avgCal, macros, totalHabits, missedToday,
    currentStreak, bestStreak, formattedBestHour,
    thisWeekRoutines, lastWeekRoutines, weekDifference,
    last7DaysData, heatmapData
  };
}