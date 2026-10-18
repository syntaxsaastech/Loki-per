export default function Waveform({ levels, color = "#38bdf8" }) {
  return (
    <div className="waveform">
      {levels.map((lvl, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: `${Math.max(4, lvl * 100)}%`,
            background: color,
            opacity: 0.4 + lvl * 0.6,
          }}
        />
      ))}
    </div>
  );
}