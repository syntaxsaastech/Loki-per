import { useState, useEffect, useRef } from "react";

export default function AIFace({
  message = "Good evening. All systems are online. How may I assist you today?",
  autoSpeak = false,
}) {
  const [speaking, setSpeaking] = useState(false);
  const [wave, setWave] = useState(0);
  const [booted, setBooted] = useState(false);
  const waveTimer = useRef(null);
  const bootTimer = useRef(null);

  // ---------- BOOT SEQUENCE ----------
  useEffect(() => {
    bootTimer.current = setTimeout(() => setBooted(true), 1500);
    return () => clearTimeout(bootTimer.current);
  }, []);

  // Force browser to load voices immediately
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ---------- SPEAK FUNCTION (FEMALE VOICE) ----------
  const speak = (text = message) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.15; // Higher pitch for female voice

    const voices = window.speechSynthesis.getVoices();
    
    // Target known female voices across all operating systems
    const preferred =
      voices.find((v) => v.name.includes("Google US English")) || // Chrome/Android
      voices.find((v) => v.name.includes("Samantha")) ||         // Mac/iOS
      voices.find((v) => v.name.includes("Victoria")) ||         // Mac
      voices.find((v) => v.name.includes("Zira")) ||             // Windows
      voices.find((v) => v.name.includes("Aria")) ||             // Windows 11
      voices.find((v) => v.name.includes("Jenny")) ||            // Windows 10
      voices.find((v) => v.name.toLowerCase().includes("female")) || // Generic
      voices.find((v) => v.lang === "en-US") || 
      voices[0];
      
    if (preferred) utter.voice = preferred;

    utter.onstart = () => {
      setSpeaking(true);
      const waveLoop = () => {
        setWave(Math.random());
        waveTimer.current = setTimeout(waveLoop, 90);
      };
      waveLoop();
    };

    utter.onend = () => {
      setSpeaking(false);
      clearTimeout(waveTimer.current);
    };

    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (autoSpeak) {
      const t = setTimeout(() => speak(), 800);
      return () => clearTimeout(t);
    }
  }, [autoSpeak]);

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    clearTimeout(waveTimer.current);
  };

  const bars = Array.from({ length: 28 }, () => {
    return speaking ? 15 + Math.random() * 60 : 4;
  });

  // Generate random points for the neural network
  const neuralNodes = [
    { cx: 80, cy: 80 }, { cx: 240, cy: 60 }, { cx: 400, cy: 100 },
    { cx: 100, cy: 240 }, { cx: 380, cy: 240 },
    { cx: 60, cy: 400 }, { cx: 240, cy: 420 }, { cx: 420, cy: 380 },
    { cx: 140, cy: 140 }, { cx: 340, cy: 140 },
    { cx: 140, cy: 340 }, { cx: 340, cy: 340 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=Share+Tech+Mono&display=swap');

        * { box-sizing: border-box; }

        .jarvis-root {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 60px 20px 50px;
          min-height: 100vh;
          background: radial-gradient(ellipse at center, #071a2e 0%, #020a14 60%, #000000 100%);
          overflow: hidden;
          font-family: 'Orbitron', sans-serif;
        }

        /* Background grid */
        .jarvis-root::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 229, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.06) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridScroll 30s linear infinite;
          pointer-events: none;
        }
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        /* Vignette */
        .jarvis-root::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%);
          pointer-events: none;
        }

        /* ============ HUD CORNERS ============ */
        .hud-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border-color: rgba(0, 229, 255, 0.6);
          border-style: solid;
          border-width: 0;
          z-index: 1;
        }
        .hud-tl { top: 20px; left: 20px; border-top-width: 2px; border-left-width: 2px; }
        .hud-tr { top: 20px; right: 20px; border-top-width: 2px; border-right-width: 2px; }
        .hud-bl { bottom: 20px; left: 20px; border-bottom-width: 2px; border-left-width: 2px; }
        .hud-br { bottom: 20px; right: 20px; border-bottom-width: 2px; border-right-width: 2px; }

        /* ============ TOP STATUS BAR ============ */
        .hud-topbar {
          display: flex;
          gap: 30px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 3px;
          color: rgba(0, 229, 255, 0.85);
          text-transform: uppercase;
          z-index: 3;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hud-topbar span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot-live {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff;
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* ============ NEURAL NETWORK BG ============ */
        .neural-bg {
          position: absolute;
          width: 480px;
          height: 480px;
          z-index: 1;
          opacity: 0.4;
          pointer-events: none;
        }
        
        .neural-line {
          stroke: #00e5ff;
          stroke-width: 1px;
          stroke-dasharray: 4 4;
          animation: dash 20s linear infinite;
        }

        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }

        .neural-node {
          fill: #00e5ff;
          animation: nodePulse 2s ease-in-out infinite;
        }

        @keyframes nodePulse {
          0%, 100% { r: 3; opacity: 0.6; }
          50% { r: 5; opacity: 1; box-shadow: 0 0 10px #00e5ff; }
        }

        /* ============ CORE AREA ============ */
        .core-area {
          position: relative;
          width: 480px;
          height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        /* ============ RINGS ============ */
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid transparent;
          pointer-events: none;
        }

        /* Outer dashed ring */
        .ring-r1 {
          width: 460px;
          height: 460px;
          border: 1px dashed rgba(0, 229, 255, 0.25);
          animation: spin 40s linear infinite;
        }
        .ring-r1::before,
        .ring-r1::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: #00e5ff;
          border-radius: 50%;
          box-shadow: 0 0 12px #00e5ff;
        }
        .ring-r1::before { top: -4px; left: 50%; margin-left: -4px; }
        .ring-r1::after { bottom: -4px; left: 50%; margin-left: -4px; }

        /* Ring 2 */
        .ring-r2 {
          width: 400px;
          height: 400px;
          border-top: 2px solid rgba(0, 229, 255, 0.7);
          border-right: 2px solid transparent;
          border-bottom: 2px solid rgba(0, 229, 255, 0.7);
          border-left: 2px solid transparent;
          animation: spin 8s linear infinite;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
        }

        /* Ring 3 */
        .ring-r3 {
          width: 340px;
          height: 340px;
          border-top: 1px solid rgba(0, 150, 255, 0.5);
          border-bottom: 1px solid rgba(0, 150, 255, 0.5);
          border-left: 1px solid transparent;
          border-right: 1px solid transparent;
          animation: spin 5s linear infinite reverse;
        }

        /* Ring 4 with ticks */
        .ring-r4 {
          width: 300px;
          height: 300px;
          border: 2px dotted rgba(0, 229, 255, 0.4);
          animation: spin 20s linear infinite;
        }

        /* Ring 5 segmented */
        .ring-r5 {
          width: 250px;
          height: 250px;
          border: 3px solid transparent;
          border-top-color: #00e5ff;
          border-bottom-color: #00e5ff;
          animation: spin 3s linear infinite;
          filter: drop-shadow(0 0 8px #00e5ff);
        }

        /* Ring 6 (inner thin) */
        .ring-r6 {
          width: 190px;
          height: 190px;
          border: 1px solid rgba(0, 229, 255, 0.6);
          animation: spin 6s linear infinite reverse;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ============ SCAN LINE ============ */
        .scan-line {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          animation: scan 4s linear infinite;
          pointer-events: none;
        }
        .scan-line::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, rgba(0,229,255,0.9), transparent);
          transform-origin: left center;
          box-shadow: 0 0 10px #00e5ff;
        }
        @keyframes scan {
          to { transform: rotate(360deg); }
        }

        /* ============ CORE ORB ============ */
        .core-orb {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%,
            #ffffff 0%,
            #c8f6ff 15%,
            #00e5ff 40%,
            #0077aa 70%,
            #003a55 100%);
          box-shadow:
            0 0 40px rgba(0, 229, 255, 0.9),
            0 0 80px rgba(0, 229, 255, 0.6),
            0 0 140px rgba(0, 150, 255, 0.4),
            inset 0 0 30px rgba(255, 255, 255, 0.8);
          animation: coreFloat 3s ease-in-out infinite;
          z-index: 3;
        }

        .core-orb.active {
          animation: coreSpeak 0.4s ease-in-out infinite;
        }

        @keyframes coreFloat {
          0%, 100% {
            transform: scale(1);
            box-shadow:
              0 0 40px rgba(0, 229, 255, 0.9),
              0 0 80px rgba(0, 229, 255, 0.5),
              0 0 140px rgba(0, 150, 255, 0.3);
          }
          50% {
            transform: scale(1.08);
            box-shadow:
              0 0 60px rgba(0, 229, 255, 1),
              0 0 120px rgba(0, 229, 255, 0.7),
              0 0 200px rgba(0, 150, 255, 0.5);
          }
        }

        @keyframes coreSpeak {
          0%, 100% {
            transform: scale(1.05);
            box-shadow:
              0 0 60px rgba(0, 229, 255, 1),
              0 0 120px rgba(0, 229, 255, 0.8),
              0 0 200px rgba(0, 150, 255, 0.6);
          }
          50% {
            transform: scale(1.18);
            box-shadow:
              0 0 90px rgba(0, 229, 255, 1),
              0 0 180px rgba(0, 229, 255, 0.9),
              0 0 280px rgba(0, 150, 255, 0.7);
          }
        }

        /* Inner white core */
        .core-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 20px #ffffff, 0 0 40px #c8f6ff;
          animation: innerPulse 2s ease-in-out infinite;
        }
        @keyframes innerPulse {
          0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }

        /* ============ RIPPLE (speaking) ============ */
        .ripple {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid #00e5ff;
          animation: rippleOut 1.2s ease-out infinite;
          pointer-events: none;
        }
        .ripple:nth-child(2) { animation-delay: 0.4s; }
        .ripple:nth-child(3) { animation-delay: 0.8s; }

        @keyframes rippleOut {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        /* ============ HUD RING LABELS ============ */
        .ring-label {
          position: absolute;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(0, 229, 255, 0.7);
          letter-spacing: 2px;
          text-transform: uppercase;
          pointer-events: none;
        }
        .label-top { top: 12px; left: 50%; transform: translateX(-50%); }
        .label-bottom { bottom: 12px; left: 50%; transform: translateX(-50%); }
        .label-left { left: 4px; top: 50%; transform: translateY(-50%) rotate(-90deg); }
        .label-right { right: 4px; top: 50%; transform: translateY(-50%) rotate(90deg); }

        /* ============ SPEECH BUBBLE ============ */
        .jarvis-bubble {
          position: relative;
          max-width: 520px;
          padding: 20px 32px;
          background: rgba(4, 20, 35, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 4px;
          color: #c8f6ff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 15px;
          line-height: 1.7;
          text-align: center;
          letter-spacing: 0.5px;
          box-shadow:
            0 0 30px rgba(0, 229, 255, 0.2),
            inset 0 0 30px rgba(0, 229, 255, 0.05);
          transition: all 0.4s ease;
          z-index: 3;
        }

        .jarvis-bubble::before,
        .jarvis-bubble::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: #00e5ff;
          border-style: solid;
        }
        .jarvis-bubble::before {
          top: -1px; left: -1px;
          border-width: 2px 0 0 2px;
        }
        .jarvis-bubble::after {
          bottom: -1px; right: -1px;
          border-width: 0 2px 2px 0;
        }

        .jarvis-bubble.active {
          border-color: #00e5ff;
          box-shadow:
            0 0 50px rgba(0, 229, 255, 0.5),
            inset 0 0 30px rgba(0, 229, 255, 0.1);
          color: #ffffff;
        }

        /* Typing cursor effect */
        .bubble-cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: #00e5ff;
          margin-left: 4px;
          vertical-align: middle;
          animation: cursorBlink 1s step-end infinite;
        }
        @keyframes cursorBlink {
          50% { opacity: 0; }
        }

        /* ============ WAVEFORM ============ */
        .waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 70px;
          z-index: 3;
        }
        .wave-bar {
          width: 4px;
          background: linear-gradient(to top, #0077aa, #00e5ff, #c8f6ff);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.7);
          transition: height 0.09s linear, opacity 0.2s;
        }

        /* ============ BUTTONS ============ */
        .jarvis-controls {
          display: flex;
          gap: 16px;
          z-index: 3;
        }
        .jarvis-btn {
          position: relative;
          padding: 14px 36px;
          background: rgba(0, 229, 255, 0.08);
          border: 1.5px solid #00e5ff;
          color: #00e5ff;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .jarvis-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.3), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        .jarvis-btn:hover::before {
          transform: translateX(100%);
        }
        .jarvis-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
          transform: translateY(-2px);
        }
        .jarvis-btn.stop {
          border-color: #ff4444;
          color: #ff6666;
          background: rgba(255, 68, 68, 0.08);
        }
        .jarvis-btn.stop:hover {
          background: rgba(255, 68, 68, 0.2);
          box-shadow: 0 0 25px rgba(255, 68, 68, 0.6);
        }

        /* ============ BOTTOM STATUS ============ */
        .hud-bottom {
          display: flex;
          gap: 30px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(0, 229, 255, 0.6);
          text-transform: uppercase;
          z-index: 3;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* ============ PARTICLES ============ */
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #00e5ff;
          border-radius: 50%;
          box-shadow: 0 0 8px #00e5ff, 0 0 16px #00e5ff;
          animation: particleFloat linear infinite;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes particleFloat {
          0% { transform: translateY(300px) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-300px) translateX(20px); opacity: 0; }
        }

        /* ============ BOOT OVERLAY ============ */
        .boot-overlay {
          position: fixed;
          inset: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          font-family: 'Share Tech Mono', monospace;
          color: #00e5ff;
          font-size: 16px;
          letter-spacing: 4px;
          transition: opacity 0.6s ease;
        }
        .boot-overlay.done {
          opacity: 0;
          pointer-events: none;
        }
        .boot-text::after {
          content: "";
          animation: dots 1.2s steps(4) infinite;
        }
        @keyframes dots {
          0% { content: ""; }
          25% { content: "."; }
          50% { content: ".."; }
          75% { content: "..."; }
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 600px) {
          .core-area {
            width: 340px;
            height: 340px;
          }
          .neural-bg {
            width: 340px;
            height: 340px;
          }
          .ring-r1 { width: 320px; height: 320px; }
          .ring-r2 { width: 280px; height: 280px; }
          .ring-r3 { width: 240px; height: 240px; }
          .ring-r4 { width: 210px; height: 210px; }
          .ring-r5 { width: 175px; height: 175px; }
          .ring-r6 { width: 135px; height: 135px; }
          .core-orb { width: 90px; height: 90px; }
          .jarvis-bubble { font-size: 13px; padding: 16px 20px; }
          .hud-topbar, .hud-bottom { gap: 16px; font-size: 9px; letter-spacing: 1.5px; }
        }
      `}</style>

      {/* Boot overlay */}
      <div className={`boot-overlay ${booted ? "done" : ""}`}>
        <div className="boot-text">INITIALIZING J.A.R.V.I.S.</div>
      </div>

      <div className="jarvis-root">
        {/* HUD corners */}
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}

        {/* Top status bar */}
        <div className="hud-topbar">
          <span><span className="dot-live" />SYSTEM ONLINE</span>
          <span><span className="dot-live" />NEURAL LINK ACTIVE</span>
          <span><span className="dot-live" />AI CORE STABLE</span>
          <span>J.A.R.V.I.S v4.2.1</span>
        </div>

        {/* ---------- CORE ---------- */}
        <div className="core-area">
          
          {/* NEURAL NETWORK SVG */}
          <svg className="neural-bg" viewBox="0 0 480 480">
            {/* Lines connecting nodes */}
            {neuralNodes.map((n1, i) =>
              neuralNodes.slice(i + 1).map((n2, j) => {
                // Only connect some nodes to look organic
                if (Math.random() > 0.4) return null;
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={n1.cx}
                    y1={n1.cy}
                    x2={n2.cx}
                    y2={n2.cy}
                    className="neural-line"
                  />
                );
              })
            )}
            {/* Nodes */}
            {neuralNodes.map((n, i) => (
              <circle
                key={i}
                cx={n.cx}
                cy={n.cy}
                r="3"
                className="neural-node"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              />
            ))}
          </svg>

          {/* Rings */}
          <div className="ring ring-r1" />
          <div className="ring ring-r2" />
          <div className="ring ring-r3" />
          <div className="ring ring-r4" />
          <div className="ring ring-r5" />
          <div className="ring ring-r6" />

          {/* Scan line */}
          <div className="scan-line" />

          {/* Ring labels */}
          <div className="ring-label label-top">ARC REACTOR v4</div>
          <div className="ring-label label-bottom">STABLE</div>
          <div className="ring-label label-left">0x00FF · CORE</div>
          <div className="ring-label label-right">SYS.OK</div>

          {/* Ripples when speaking */}
          {speaking && (
            <>
              <div className="ripple" />
              <div className="ripple" />
              <div className="ripple" />
            </>
          )}

          {/* Energy core */}
          <div className={`core-orb ${speaking ? "active" : ""}`}>
            <div className="core-inner" />
          </div>
        </div>

        {/* ---------- SPEECH BUBBLE ---------- */}
        <div className={`jarvis-bubble ${speaking ? "active" : ""}`}>
          {message}
          <span className="bubble-cursor" />
        </div>

        {/* ---------- WAVEFORM ---------- */}
        <div className="waveform">
          {bars.map((h, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                height: speaking
                  ? `${Math.max(6, h * (0.4 + wave * 1.2))}px`
                  : "4px",
                opacity: speaking ? 1 : 0.25,
              }}
            />
          ))}
        </div>

        {/* ---------- CONTROLS ---------- */}
        <div className="jarvis-controls">
          {!speaking ? (
            <button className="jarvis-btn" onClick={() => speak()}>
              ▶ Engage
            </button>
          ) : (
            <button className="jarvis-btn stop" onClick={stop}>
              ■ Standby
            </button>
          )}
        </div>

        {/* Bottom status */}
        <div className="hud-bottom">
          <span>PWR ▮▮▮▮▮ 100%</span>
          <span>NET · SECURE</span>
          <span>CPU 12% · MEM 34%</span>
          <span>UPTIME 0:00:00</span>
        </div>
      </div>
    </>
  );
}