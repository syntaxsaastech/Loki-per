import { useState, useEffect, useRef } from "react";

export default function AIFace({
  message = "Good evening. All systems are online.",
  onUserCommand, // To send the final text to the Brain
  isListening,
  toggleMic,
}) {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [wave, setWave] = useState(0);
  
  // Refs for tracking voice state
  const baseTextRef = useRef(""); // The text before you started speaking
  const waveTimer = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // ==========================================
  // NEURAL NETWORK BACKGROUND (Smooth Canvas)
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${1 - dist / 150})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5ff";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
      requestRef.current = requestAnimationFrame(draw);
    };

    draw();
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // ==========================================
  // AI SPEAKING (If Brain replies)
  // ==========================================
  const speak = (textToSpeak = message) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.rate = 0.95;
    utter.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.name.includes("Google US English")) || voices[0];
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
    if (message) speak(message);
  }, [message]);

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    clearTimeout(waveTimer.current);
  };

  // ==========================================
  // TEXT SUBMISSION
  // ==========================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onUserCommand(text.trim());
    setText(""); // Clear after sending
  };

  const handleVoiceEdit = (transcript) => {
    let newText = baseTextRef.current;
    const lower = transcript.toLowerCase();

    // 1. CLEAR ALL
    if (lower.includes("clear all") || lower.includes("delete all")) {
      setText("");
      baseTextRef.current = "";
      return;
    }

    // 2. DELETE LAST WORD (e.g., "delete that", "scratch that")
    if (lower.includes("delete that") || lower.includes("scratch that") || lower.includes("remove that")) {
      newText = newText.trim().split(" ").slice(0, -1).join(" ");
      if (newText.length > 0) newText += " ";
      setText(newText);
      baseTextRef.current = newText;
      return;
    }

    // 3. REMOVE SPECIFIC WORD (e.g., "remove world")
    const removeMatch = lower.match(/remove\s+([a-z0-9]+)/);
    if (removeMatch) {
      const wordToRemove = removeMatch[1];
      const regex = new RegExp(`\\b${wordToRemove}\\b`, "gi");
      newText = newText.replace(regex, "").replace(/\s+/g, " ").trim();
      if (newText.length > 0) newText += " ";
      setText(newText);
      baseTextRef.current = newText;
      return;
    }

    // 4. NORMAL DICTATION (Append text)
    // If it's a standard word, add it to the text
    if (transcript.trim()) {
      newText += transcript.trim() + " ";
      setText(newText);
      baseTextRef.current = newText;
    }
  };

  // Handle live voice results (passed from parent or speech API)
  const handleVoiceResult = (transcript) => {
    handleVoiceEdit(transcript);
  };

  const bars = Array.from({ length: 30 }, () => speaking ? 10 + Math.random() * 50 : 4);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');

        .jarvis-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #020810;
          font-family: 'Orbitron', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .canvas-bg { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .center-content { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 800px; padding: 20px; }

        /* Core Orb */
        .core-wrapper { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
        .core-orb {
          width: 90px; height: 90px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #00e5ff 40%, #0077aa 80%);
          box-shadow: 0 0 50px #00e5ff, 0 0 100px #00e5ff44, inset 0 0 30px #fff;
          z-index: 5; transition: all 0.3s ease;
        }
        .core-orb.speaking { animation: pulse 0.4s infinite alternate; box-shadow: 0 0 80px #00e5ff, 0 0 150px #00e5ff88, inset 0 0 40px #fff; }
        @keyframes pulse { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }

        /* Rings */
        .ring { position: absolute; border-radius: 50%; pointer-events: none; }
        .r1 { width: 150px; height: 150px; border: 2px solid transparent; border-top-color: #00e5ff; border-bottom-color: #00e5ff; animation: spin 3s linear infinite; }
        .r2 { width: 200px; height: 200px; border: 1px dashed #0077aa; animation: spin 8s linear infinite reverse; }
        .r3 { width: 260px; height: 260px; border: 1px solid rgba(0, 229, 255, 0.3); border-left-color: #00e5ff; border-right-color: #00e5ff; animation: spin 12s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Speech Bubble */
        .bubble {
          position: relative; width: 100%; max-width: 600px; background: rgba(2, 8, 16, 0.85);
          border: 1px solid rgba(0, 229, 255, 0.5); border-radius: 8px; padding: 15px 25px;
          color: #c8f6ff; font-family: 'Share Tech Mono', monospace; font-size: 16px; line-height: 1.5;
          text-align: center; box-shadow: 0 0 30px rgba(0, 229, 255, 0.2); margin-bottom: 20px;
        }
        .bubble.active { border-color: #00e5ff; color: #fff; box-shadow: 0 0 40px rgba(0, 229, 255, 0.5); }

        /* Waveform */
        .waveform { display: flex; align-items: center; gap: 3px; height: 40px; margin-bottom: 20px; }
        .bar { width: 3px; background: #00e5ff; border-radius: 2px; box-shadow: 0 0 10px #00e5ff; transition: height 0.1s ease; }

        /* INPUT AREA */
        .input-area { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 10px; }
        
        .dictation-box {
          width: 100%; min-height: 80px; background: rgba(0, 20, 40, 0.6);
          border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 15px;
          color: #fff; font-family: 'Share Tech Mono', monospace; font-size: 16px; outline: none;
          resize: none; box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.1);
        }
        .dictation-box:focus { border-color: #00e5ff; box-shadow: 0 0 15px rgba(0, 229, 255, 0.3); }

        .controls-row { display: flex; gap: 10px; justify-content: center; }

        .mic-btn {
          width: 60px; height: 60px; border-radius: 50%; border: 2px solid #00e5ff;
          background: rgba(0, 229, 255, 0.1); color: #00e5ff; font-size: 24px; cursor: pointer;
          transition: all 0.3s;
        }
        .mic-btn.listening { background: rgba(255, 68, 68, 0.2); border-color: #ff4444; color: #ff4444; animation: pulseRed 1s infinite alternate; }
        @keyframes pulseRed { 0% { transform: scale(1); box-shadow: 0 0 10px #ff4444; } 100% { transform: scale(1.1); box-shadow: 0 0 30px #ff4444; } }

        .submit-btn {
          padding: 0 30px; background: #00e5ff; border: none; color: #000;
          font-family: 'Orbitron', sans-serif; font-weight: bold; border-radius: 30px; cursor: pointer;
          font-size: 14px; letter-spacing: 1px; transition: all 0.2s;
        }
        .submit-btn:hover { background: #fff; box-shadow: 0 0 20px #00e5ff; }

        .stop-speak-btn {
          padding: 10px 30px; background: transparent; border: 1px solid #ff4444; color: #ff4444;
          border-radius: 30px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px;
          margin-top: 10px; transition: all 0.2s;
        }
        .stop-speak-btn:hover { background: rgba(255, 68, 68, 0.2); }
      `}</style>

      <div className="jarvis-container">
        <canvas ref={canvasRef} className="canvas-bg" />

        <div className="center-content">
          
          {/* CORE */}
          <div className="core-wrapper">
            <div className="ring r3" />
            <div className="ring r2" />
            <div className="ring r1" />
            <div className={`core-orb ${speaking ? "speaking" : ""}`} />
          </div>

          {/* AI SPEECH */}
          <div className={`bubble ${speaking ? "active" : ""}`}>
            {message}
          </div>

          {/* WAVEFORM */}
          <div className="waveform">
            {bars.map((h, i) => (
              <div key={i} className="bar" style={{
                height: speaking ? `${Math.max(4, h * (0.5 + wave))}px` : "4px",
                opacity: speaking ? 1 : 0.2,
              }} />
            ))}
          </div>

          {/* STOP SPEAKING BUTTON */}
          {speaking && (
            <button className="stop-speak-btn" onClick={stop}>
              ■ Stop Speaking
            </button>
          )}

          {/* DICTATION & INPUT */}
          <div className="input-area">
            <textarea
              className="dictation-box"
              placeholder="Click the mic and speak. Say 'remove [word]' or 'delete that' to edit."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                baseTextRef.current = e.target.value;
              }}
            />

            <div className="controls-row">
              <button 
                className={`mic-btn ${isListening ? 'listening' : ''}`} 
                onClick={toggleMic}
                title="Start/Stop Voice Input"
              >
                🎤
              </button>
              
              <button className="submit-btn" onClick={handleSubmit}>
                Send ▶
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden listener to catch voice results from parent (if you use a custom hook) */}
      {/* The dictation logic works if you pass the transcript back to handleVoiceResult */}
    </>
  );
}