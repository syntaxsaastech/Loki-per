// src/pages/Analytics.jsx
import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar, Legend
} from "recharts";

const COLORS = { protein: "#22c55e", carbs: "#3b82f6", fat: "#eab308", water: "#06b6d4", routines: "#a855f7" };

export default function Analytics() {
  const [view, setView] = useState("Weekly");
  const {
    loading, avgCal, macros, totalHabits, missedToday, currentStreak, bestStreak,
    formattedBestHour, thisWeekRoutines, lastWeekRoutines, weekDifference,
    last7DaysData, heatmapData
  } = useAnalytics();

  if (loading) return <div className="page"><p className="routine-empty">Crunching data...</p></div>;

  const macroData = [
    { name: "Protein", value: Math.round(macros.protein), color: COLORS.protein },
    { name: "Carbs", value: Math.round(macros.carbs), color: COLORS.carbs },
    { name: "Fat", value: Math.round(macros.fat), color: COLORS.fat },
  ];

  return (
    <div className="page" style={{ paddingBottom: 50 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📊 Life Overview Analytics</h1>
        <select value={view} onChange={(e) => setView(e.target.value)} style={{ padding: 10, borderRadius: 8, background: "#111", color: "white", border: "1px solid #333" }}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>
      <p className="page-sub">Your complete productivity, health, and habit trends.</p>

      {/* ============ TOP STATS ============ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15, marginBottom: 30 }}>
        <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", padding: 20, borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#22c55e" }}>{currentStreak}</div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>Current Streak</div>
        </div>
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", padding: 20, borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#ef4444" }}>{missedToday}</div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>Missed Today</div>
        </div>
        <div style={{ background: "rgba(0, 229, 255, 0.1)", border: "1px solid #00e5ff", padding: 20, borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#00e5ff" }}>{Math.round(avgCal)}</div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>Avg Calories</div>
        </div>
        <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid #eab308", padding: 20, borderRadius: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#eab308" }}>{formattedBestHour}</div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase" }}>Most Productive</div>
        </div>
      </div>

      {/* ============ COMPARE THIS WEEK VS LAST WEEK ============ */}
      <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16, marginBottom: 30 }}>
        <h3 style={{ margin: "0 0 15px 0", color: "white" }}>📈 This Week vs Last Week</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 120 }}>
          
          {/* Last Week Bar */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 20, color: "#aaa", marginBottom: 5 }}>{lastWeekRoutines}</div>
            <div style={{ height: Math.max(10, (lastWeekRoutines / (thisWeekRoutines || 1)) * 80), background: "#333", borderRadius: 8, width: "40%", margin: "0 auto" }} />
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Last Week</div>
          </div>

          {/* This Week Bar */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 20, color: "#a855f7", marginBottom: 5 }}>{thisWeekRoutines}</div>
            <div style={{ height: Math.max(10, (thisWeekRoutines / (lastWeekRoutines || 1)) * 80), background: "#a855f7", borderRadius: 8, width: "40%", margin: "0 auto" }} />
            <div style={{ fontSize: 12, color: "white", marginTop: 10 }}>This Week</div>
          </div>

          {/* Difference */}
          <div style={{ flex: 1, textAlign: "center", color: weekDifference >= 0 ? "#22c55e" : "#ef4444", fontSize: 24, fontWeight: "bold" }}>
            {weekDifference >= 0 ? "+" : ""}{weekDifference}
            <div style={{ fontSize: 11, color: "#aaa", fontWeight: "normal", textTransform: "uppercase" }}>Difference</div>
          </div>

        </div>
      </div>

      {/* ============ WEEKLY LINE CHART ============ */}
      <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16, marginBottom: 30 }}>
        <h3 style={{ margin: "0 0 20px 0", color: "white" }}>📅 Habit Trends (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={last7DaysData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
            <YAxis stroke="#aaa" fontSize={12} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="routines" name="Routines Done" stroke={COLORS.routines} strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="calories" name="Calories" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
        {/* BAR CHART (Water) */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16 }}>
          <h3 style={{ margin: "0 0 20px 0", color: "white" }}>💧 Water Intake</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
              <YAxis stroke="#aaa" fontSize={12} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
              <Bar dataKey="water" name="Glasses" fill={COLORS.water} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART (Macros) */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16 }}>
          <h3 style={{ margin: "0 0 20px 0", color: "white" }}>🥧 Macros</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={macroData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {macroData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============ 30-DAY HEATMAP ============ */}
      <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 5px 0", color: "white" }}>🔥 Calendar Activity Heatmap</h3>
            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 15 }}>Last 30 days of routine completion.</p>
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>Best Streak: <span style={{ color: "#22c55e", fontWeight: "bold" }}>{bestStreak} days</span></div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8 }}>
          {heatmapData.map((day, i) => (
            <div 
              key={i} title={`${day.date}: ${day.pct}%`}
              style={{
                height: 30, borderRadius: 6,
                background: day.pct === 0 ? "#1e293b" : day.pct < 30 ? "#0ea5e9" : day.pct < 70 ? "#38bdf8" : day.pct < 100 ? "#00e5ff" : "#22c55e",
                opacity: day.pct === 0 ? 0.3 : 1,
                transition: "all 0.3s"
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15, fontSize: 11, color: "#aaa" }}>
          <span>Less</span>
          <div style={{ width: 12, height: 12, background: "#1e293b", borderRadius: 3 }} />
          <div style={{ width: 12, height: 12, background: "#0ea5e9", borderRadius: 3 }} />
          <div style={{ width: 12, height: 12, background: "#38bdf8", borderRadius: 3 }} />
          <div style={{ width: 12, height: 12, background: "#00e5ff", borderRadius: 3 }} />
          <div style={{ width: 12, height: 12, background: "#22c55e", borderRadius: 3 }} />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}