export default function AuroraBackground({ mood = "neutral" }) {
  const colors = {
    neutral: ["#38bdf8", "#a855f7", "#ec4899"],
    good: ["#22c55e", "#38bdf8", "#14b8a6"],
    alert: ["#ef4444", "#f97316", "#eab308"],
    thinking: ["#a855f7", "#8b5cf6", "#d946ef"],
  }[mood] || ["#38bdf8", "#a855f7", "#ec4899"];

  return (
    <div className="aurora-bg">
      <div className="aurora-blob" style={{ background: colors[0], top: "10%", left: "15%" }} />
      <div className="aurora-blob" style={{ background: colors[1], top: "50%", left: "60%" }} />
      <div className="aurora-blob" style={{ background: colors[2], top: "70%", left: "20%" }} />
    </div>
  );
}