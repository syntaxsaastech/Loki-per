import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, ensureUser } from "../firebase";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Home() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayKey();

  useEffect(() => {
    let unsubs = [];
    (async () => {
      const user = await ensureUser();
      const uid = user.uid;
      
      const fetchCol = (col, setter, isLast = false) => {
        const unsub = onSnapshot(query(collection(db, col), where("uid", "==", uid)), (snap) => {
          setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          if (isLast) setLoading(false);
        });
        unsubs.push(unsub);
      };

      fetchCol("meals", setMeals);
      fetchCol("routines", setRoutines);
      fetchCol("goals", setGoals);
      fetchCol("dailyStats", setStats);
      fetchCol("memories", setMemories, true);
    })();
    return () => unsubs.forEach(u => u());
  }, []);

  // --- CALCULATIONS ---
  const todayMeals = meals.filter(m => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + (m.totals?.calories || 0), 0);
  
  const doneRoutines = routines.filter(r => r.done && r.doneDate === today).length;
  const totalRoutines = routines.length;
  
  const goalsHit = goals.filter(g => (g.progress || 0) >= g.target).length;
  
  const todayStats = stats.find(s => s.date === today) || { water: 0, screenTime: 0, bedtime: "22:00" };

  // Ring Data
  const waterData = [{ name: "Water", value: (todayStats.water / 8) * 100, fill: "#06b6d4" }];
  const calData = [{ name: "Calories", value: Math.min(100, (todayCalories / 2000) * 100), fill: "#f59e0b" }];
  const sleepData = [{ name: "Sleep", value: 80, fill: "#a855f7" }]; // Placeholder for sleep
  const exerciseData = [{ name: "Exercise", value: totalRoutines > 0 ? (doneRoutines / totalRoutines) * 100 : 0, fill: "#22c55e" }];
  const screenData = [{ name: "Screen", value: Math.min(100, (todayStats.screenTime / 180) * 100), fill: "#ef4444" }];

  if (loading) return <div style={{ color: "white", padding: 20 }}>Loading JARVIS...</div>;

  return (
    <div style={{ color: "white", paddingBottom: 80, background: "#050b14", minHeight: "100vh" }}>
      
      {/* ================= TOP NAV BAR ================= */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #1a2a44" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#00e5ff20", border: "2px solid #00e5ff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px #00e5ff" }}>⚛</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>JARVIS</h2>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>Your Personal AI Assistant</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ fontSize: 20 }}>🔔</div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a2a44" }} />
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: 600, margin: "0 auto" }}>
        
        {/* ================= BANNER ================= */}
        <div style={{ background: "linear-gradient(90deg, #0f1a2e, #1a2a44)", borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: "bold" }}>
              <span>☀️</span> Good Morning, Alok!
            </div>
            <p style={{ color: "#9ca3af", margin: "5px 0 0 0", fontSize: 13 }}>Stay consistent. Small steps<br/>create big results.</p>
          </div>
          <div style={{ zIndex: 2, textAlign: "right", fontSize: 11 }}>
            <div style={{ color: "white", fontWeight: "bold" }}>Sat, 26 Apr 2025</div>
            <div style={{ color: "#22c55e", marginTop: 5 }}>🍃 You're doing great!</div>
          </div>
          <div style={{ position: "absolute", right: -20, bottom: -20, width: 150, height: 150, background: "#00e5ff15", filter: "blur(30px)", borderRadius: "50%" }} />
        </div>

        {/* ================= 4 METRIC CARDS ================= */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 25 }}>
          {/* Card 1 */}
          <div style={{ background: "#0f1a2e", padding: 15, borderRadius: 16, border: "1px solid #1a2a44" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#22c55e20", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>Today's Tasks</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{doneRoutines} / {totalRoutines}</div>
            <div style={{ width: "100%", height: 4, background: "#1a2a44", borderRadius: 2, marginTop: 10 }}>
              <div style={{ width: `${totalRoutines > 0 ? (doneRoutines/totalRoutines)*100 : 0}%`, height: "100%", background: "#22c55e", borderRadius: 2 }} />
            </div>
          </div>
          
          {/* Card 2 */}
          <div style={{ background: "#0f1a2e", padding: 15, borderRadius: 16, border: "1px solid #1a2a44" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#a855f720", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>Goals</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{goalsHit} / {goals.length}</div>
            <div style={{ width: "100%", height: 4, background: "#1a2a44", borderRadius: 2, marginTop: 10 }}>
              <div style={{ width: `${goals.length > 0 ? (goalsHit/goals.length)*100 : 0}%`, height: "100%", background: "#a855f7", borderRadius: 2 }} />
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: "#0f1a2e", padding: 15, borderRadius: 16, border: "1px solid #1a2a44" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#38bdf820", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📅</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>Next Event</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>4:00 PM</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Study Session</div>
          </div>

          {/* Card 4 */}
          <div style={{ background: "#0f1a2e", padding: 15, borderRadius: 16, border: "1px solid #1a2a44" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ec489920", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧠</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>Memory</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>Saved</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{memories.length} notes</div>
          </div>
        </div>

        {/* ================= TODAY'S SCHEDULE ================= */}
        <div style={{ background: "#0f1a2e", borderRadius: 16, border: "1px solid #1a2a44", padding: 20, marginBottom: 25 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
            <h3 style={{ margin: 0, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>📅 Today's Schedule</h3>
            <Link to="/routine" style={{ color: "#00e5ff", fontSize: 12, textDecoration: "none" }}>View all</Link>
          </div>
          
          {routines.slice(0, 4).map((r) => {
            const isDone = r.done && r.doneDate === today;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1a2a44" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  <div style={{ color: "#6b7280", fontSize: 12, width: 60 }}>{r.time || "Anytime"}</div>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: isDone ? "#22c55e20" : "#1a2a44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{r.icon || "✅"}</div>
                  <div>
                    <div style={{ fontSize: 14, textDecoration: isDone ? "line-through" : "none", color: isDone ? "#6b7280" : "white" }}>{r.title}</div>
                  </div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isDone ? "#22c55e" : "#38bdf8"}` }} />
              </div>
            );
          })}
          {routines.length === 0 && <div style={{ color: "#6b7280", fontSize: 13 }}>No tasks scheduled.</div>}
        </div>

        {/* ================= WELLNESS RINGS ================= */}
        <div style={{ background: "#0f1a2e", borderRadius: 16, border: "1px solid #1a2a44", padding: 20, marginBottom: 25 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>💚 Health & Wellness</h3>
            <Link to="/analytics" style={{ color: "#00e5ff", fontSize: 12, textDecoration: "none" }}>View details</Link>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
            {/* Water */}
            <div>
              <div style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={6} data={waterData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#06b6d4" background={{ fill: "#1a2a44" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>💧</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>{todayStats.water}/8</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Water</div>
            </div>

            {/* Calories */}
            <div>
              <div style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={6} data={calData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#f59e0b" background={{ fill: "#1a2a44" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>🍽️</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>{todayCalories}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Calories</div>
            </div>

            {/* Sleep */}
            <div>
              <div style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={6} data={sleepData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#a855f7" background={{ fill: "#1a2a44" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>🌙</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>7h 15m</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Sleep</div>
            </div>

            {/* Exercise */}
            <div>
              <div style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={6} data={exerciseData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" background={{ fill: "#1a2a44" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>🏃</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>30m</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Exercise</div>
            </div>

            {/* Screen Time */}
            <div>
              <div style={{ width: 60, height: 60, margin: "0 auto", position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={6} data={screenData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#ef4444" background={{ fill: "#1a2a44" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>📱</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 5 }}>{todayStats.screenTime}m</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Screen</div>
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div style={{ background: "#0f1a2e", borderRadius: 16, border: "1px solid #1a2a44", padding: 20, marginBottom: 25 }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: 16 }}>⚡ Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, textAlign: "center" }}>
            <Link to="/routine" style={{ textDecoration: "none", color: "white" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#22c55e20", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 24 }}>＋</div>
              <div style={{ fontSize: 10, marginTop: 5 }}>Add Task</div>
            </Link>
            <Link to="/foodaccess" style={{ textDecoration: "none", color: "white" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#38bdf820", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 24 }}>🍴</div>
              <div style={{ fontSize: 10, marginTop: 5 }}>Log Food</div>
            </Link>
            <Link to="/routine" style={{ textDecoration: "none", color: "white" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#06b6d420", color: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 24 }}>💧</div>
              <div style={{ fontSize: 10, marginTop: 5 }}>Track Water</div>
            </Link>
            <Link to="/goals" style={{ textDecoration: "none", color: "white" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#a855f720", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 24 }}>🎯</div>
              <div style={{ fontSize: 10, marginTop: 5 }}>Focus Mode</div>
            </Link>
          </div>
        </div>

        {/* ================= ASK JARVIS ================= */}
        <div style={{ background: "#0f1a2e", borderRadius: 16, border: "1px solid #1a2a44", padding: 20, marginBottom: 25, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#00e5ff20", border: "2px solid #00e5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Ask JARVIS</h3>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Get personalized suggestions & reminders</div>
            </div>
          </div>
          <Link to="/ai" style={{ display: "block", background: "#1a2a44", borderRadius: 30, padding: "12px 20px", textDecoration: "none", color: "#9ca3af", fontSize: 13, marginBottom: 15 }}>
            Ask anything... <span style={{ float: "right" }}>➔</span>
          </Link>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
             <Link to="/ai" style={{ background: "#1a2a44", color: "white", textDecoration: "none", padding: "8px 12px", borderRadius: 20, fontSize: 11 }}>✨ How am I doing today?</Link>
             <Link to="/ai" style={{ background: "#1a2a44", color: "white", textDecoration: "none", padding: "8px 12px", borderRadius: 20, fontSize: 11 }}>✨ Suggest my next task</Link>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM MOBILE NAV ================= */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#080f1c", borderTop: "1px solid #1a2a44", display: "flex", justifyContent: "space-around", padding: "12px 0", zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#00e5ff", textAlign: "center", fontSize: 10 }}>
          <div style={{ fontSize: 20 }}>🏠</div>
          Home
        </Link>
        <Link to="/routine" style={{ textDecoration: "none", color: "#6b7280", textAlign: "center", fontSize: 10 }}>
          <div style={{ fontSize: 20 }}>📅</div>
          Routine
        </Link>
        <Link to="/goals" style={{ textDecoration: "none", color: "#6b7280", textAlign: "center", fontSize: 10 }}>
          <div style={{ fontSize: 20 }}>🎯</div>
          Goals
        </Link>
        <Link to="/analytics" style={{ textDecoration: "none", color: "#6b7280", textAlign: "center", fontSize: 10 }}>
          <div style={{ fontSize: 20 }}>📊</div>
          Analytics
        </Link>
        <Link to="/ai" style={{ textDecoration: "none", color: "#6b7280", textAlign: "center", fontSize: 10 }}>
          <div style={{ fontSize: 20 }}>⚙️</div>
          More
        </Link>
      </div>
    </div>
  );
}