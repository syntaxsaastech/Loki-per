import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#040914", color: "white", fontFamily: "sans-serif" }}>
      
      {/* ============ SIDEBAR ============ */}
      <div style={{ width: 250, background: "#080f1c", borderRight: "1px solid #1a2a44", padding: "20px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px", marginBottom: 40, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #00e5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#00e5ff", boxShadow: "0 0 15px #00e5ff" }}>⚛</div>
          <div>
            <h2 style={{ margin: 0, color: "white", fontSize: 18 }}>JARVIS</h2>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Your Personal AI Assistant</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 5, padding: "0 10px" }}>
          {[
            { path: "/", label: "Home", icon: "🏠" },
            { path: "/routine", label: "Routine", icon: "📅" },
            { path: "/goals", label: "Goals", icon: "🎯" },
            { path: "/foodaccess", label: "Food & Nutrition", icon: "🍱" },
            { path: "/calendar", label: "Calendar", icon: "📅" },
            { path: "/analytics", label: "Analytics", icon: "📊" },
            { path: "/memory", label: "Memory", icon: "🧠" },
            { path: "/ai", label: "Ask JARVIS", icon: "🤖" },
          ].map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 15, padding: "12px 15px", borderRadius: 10, textDecoration: "none",
                background: isActive ? "linear-gradient(90deg, #00e5ff30, transparent)" : "transparent",
                color: isActive ? "#00e5ff" : "#9ca3af",
                borderLeft: isActive ? "3px solid #00e5ff" : "3px solid transparent"
              })}
            >
              <span>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: 20 }}>
          <div style={{ background: "#0f1a2e", padding: 15, borderRadius: 12, border: "1px solid #1a2a44" }}>
            <div style={{ color: "#eab308", fontSize: 12, fontWeight: "bold" }}>⭐ You're doing great!</div>
            <div style={{ color: "#6b7280", fontSize: 11, marginTop: 5 }}>Check steps every day lead to big results.</div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP BAR */}
        <div style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a2a44" }}>
          <div style={{ background: "#080f1c", padding: "10px 20px", borderRadius: 20, display: "flex", alignItems: "center", gap: 10, width: 400, border: "1px solid #1a2a44" }}>
            <span>🔍</span>
            <input type="text" placeholder="Ask JARVIS anything... (e.g. 'What should I focus on today?')" style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right", fontSize: 12 }}>
              <div style={{ color: "#6b7280" }}>Sat, 26 Apr 2025</div>
              <div style={{ color: "white" }}>Good morning, Alok! ☀️</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a2a44", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ padding: 30, overflowY: "auto", height: "calc(100vh - 70px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}