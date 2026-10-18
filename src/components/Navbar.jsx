import { NavLink } from "react-router-dom";

const LINKS = [
  { path: "/", label: "Home" },
  { path: "/foodaccess", label: "Food" },
  { path: "/routine", label: "Routine" },
  { path: "/calendar", label: "Calendar" },
  { path: "/goals", label: "Goals" },
  { path: "/analytics", label: "📊 Analytics" },
  { path: "/memory", label: "🧠 Memory" },
  { path: "/ai", label: "🏥 Ai" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">Loki Personal</div>
      <ul className="nav-links">
        {LINKS.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}