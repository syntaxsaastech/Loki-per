import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AIFace from "../components/AIFace";
import { csvFiles } from "../csv";
import { loadAllLessons } from "../utils/csvPaser"; 

export default function AI() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("Click 'Activate JARVIS' to start.");
  
  const [isActive, setIsActive] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [voiceError, setVoiceError] = useState("");
  const [debugTranscript, setDebugTranscript] = useState("");

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false); 
  const isAwakeRef = useRef(false);

  const ROUTES = {
    health: "/health",
    routine: "/routine", 
    calendar: "/calendar",
  };

  useEffect(() => {
    try {
      const all = loadAllLessons(csvFiles);
      setLessons(all);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const toggleActivation = () => {
    if (isActive) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      setIsActive(false);
      setIsAwake(false);
      isAwakeRef.current = false;
      setMessage("Systems offline.");
      window.speechSynthesis.cancel();
    } else {
      setIsActive(true);
      setVoiceError("");
      setMessage(`${getGreeting()}. JARVIS is online. Say "Hey Buddy" or "Jarvis" to wake me.`);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice input not supported. Use Chrome or Edge.");
      setIsActive(false);
      return;
    }
    
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true; 
    recog.lang = "en-US";

    recog.onstart = () => { 
      setVoiceError(""); 
      setDebugTranscript("🎤 Mic is listening...");
    };
    
    recog.onresult = (event) => {
      if (isSpeakingRef.current) return;

      let transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      setDebugTranscript(`👂 Heard: "${transcript}"`);

      if (!isAwakeRef.current) {
        if (
          transcript.includes("hey buddy") || 
          transcript.includes("buddy") || 
          transcript.includes("jarvis")
        ) {
          isAwakeRef.current = true;
          setIsAwake(true);
          setMessage(`${getGreeting()}. How can I help you today?`);
          setDebugTranscript(`✅ Wake word detected: "${transcript}"`);
          return; 
        }
      }

      if (isAwakeRef.current) {
        if (event.results[event.results.length - 1].isFinal) {
          setQuestion(transcript);
          submitQuestion(transcript);
        }
      }
    };

    recog.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        setVoiceError("Microphone denied. Please allow access in browser settings.");
        setIsActive(false);
      } else {
        setVoiceError(`Mic Error: ${event.error}`);
      }
    };
    
    recog.onend = () => {
      if (recognitionRef.current === recog && isActive) {
        try { recog.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recog;
    try { recog.start(); } catch (e) {}

    return () => { 
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [isActive]);

  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      isSpeakingRef.current = window.speechSynthesis.speaking;
    }, 500);
    return () => clearInterval(checkSpeaking);
  }, []);

  // ---------- NLP SMARTER SEARCH ----------
  function findLesson(q) {
    const lower = q.toLowerCase();
    let best = null;
    let bestScore = 0;

    for (const lesson of lessons) {
      let score = 0;
      const topicWords = lesson.topic.toLowerCase().split(/[_\s]+/);
      
      for (const w of topicWords) {
        if (w.length > 2 && lower.includes(w)) score += 15;
      }
      
      const qWords = lower.split(/\s+/).filter((w) => w.length > 2);
      for (const w of qWords) {
        if (lesson.topic.toLowerCase().includes(w)) score += 10;
        if (lesson.question.toLowerCase().includes(w)) score += 5;
        if (lesson.answer.toLowerCase().includes(w)) score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        best = lesson;
      }
    }
    // Lowered threshold so it catches more natural language
    return bestScore >= 3 ? best : null; 
  }

  function getAnswer(q) {
    const lower = q.toLowerCase();
    
    // Navigation
    if (lower.includes("open calendar") || lower.includes("go to calendar")) {
      navigate(ROUTES.calendar);
      return "Opening your calendar now.";
    }
    if (lower.includes("open health") || lower.includes("go to health")) {
      navigate(ROUTES.health);
      return "Opening your health dashboard.";
    }
    if (lower.includes("open routine") || lower.includes("go to routine")) {
      navigate(ROUTES.routine);
      return "Opening your routine.";
    }

    // Teaching - Greeting
    if (lower.includes("can you teach") || lower.includes("do you know") || lower.includes("teach me aptitude")) {
      return `Yes, I have ${lessons.length} aptitude topics ready. You can ask for a specific topic like "Time and Work", or a level like "Basic" or "Intermediate".`;
    }

    // Teaching - By Category / Level
    if (lower === "basic" || lower.includes("basic aptitude") || lower.includes("beginner")) {
      const basics = lessons.filter(l => l.level?.toLowerCase().includes("beginner") || l.level?.toLowerCase().includes("basic")).map(l => l.topic).slice(0, 10);
      return `Here are some basic topics: ${basics.join(", ")}. Which one would you like to learn?`;
    }
    
    if (lower.includes("quantitative") || lower.includes("quant")) {
      const qa = lessons.filter(l => l.category?.includes("Quant")).map(l => l.topic).slice(0, 10);
      return `Here are some Quantitative topics: ${qa.join(", ")}. Which one would you like to learn?`;
    }

    if (lower.includes("logical") || lower.includes("reasoning")) {
      const lr = lessons.filter(l => l.category?.includes("Logical")).map(l => l.topic).slice(0, 10);
      return `Here are some Logical Reasoning topics: ${lr.join(", ")}. Which one would you like to learn?`;
    }

    // Find specific topic
    const lesson = findLesson(q);
    if (lesson) {
      const parts = [];
      parts.push(`Let me teach you ${lesson.topic} from ${lesson.category || 'Aptitude'}.`);
      parts.push(lesson.answer);
      if (lesson.examples) parts.push(`For example: ${lesson.examples}`);
      return parts.join(" ");
    }

    // NLP Fallback
    return `I couldn't find an exact match for that. Try saying "Teach me Time and Work", "Basic topics", or "Open Calendar".`;
  }

  const askQuestion = (e) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;
    submitQuestion(question.trim());
  };

  function submitQuestion(text) {
    const q = text.trim();
    if (!q) return;
    const answer = getAnswer(q);
    setMessage(answer);
    setQuestion("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020a14", position: "relative" }}>
      <AIFace message={message} autoSpeak={true} />

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(4, 20, 35, 0.95)", backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(0, 229, 255, 0.5)", padding: "16px 20px", zIndex: 50,
        fontFamily: "'Share Tech Mono', monospace", color: "#c8f6ff",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          
          <div style={{ fontSize: 10, color: "rgba(0,229,255,0.7)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
            <span>
              {loading ? "⟳ LOADING..." : `◢ SYSTEM READY · ${lessons.length} TOPICS`}
            </span>
            {isActive && (
              <span style={{ color: isAwake ? "#00ff88" : "#ffaa00", animation: "pulse 1s infinite" }}>
                {isAwake ? "● LISTENING TO COMMAND" : "● MIC ACTIVE (SAY 'JARVIS')"}
              </span>
            )}
          </div>

          {isActive && (
            <div style={{ fontSize: 11, color: "#00e5ff", marginBottom: 8, fontStyle: "italic", opacity: 0.8 }}>
              {debugTranscript}
            </div>
          )}

          {voiceError && (
            <div style={{ fontSize: 11, color: "#ff8888", marginBottom: 8, padding: "6px 10px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.4)", borderRadius: 4 }}>
              ⚠ {voiceError}
            </div>
          )}

          <form onSubmit={askQuestion} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='Type "Teach me Profit and Loss" or use voice...'
              disabled={loading}
              style={{
                flex: 1, padding: "12px 16px",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(0,229,255,0.4)",
                borderRadius: 4, color: "#c8f6ff", fontFamily: "'Share Tech Mono', monospace", fontSize: 13, outline: "none",
              }}
            />
            <button
              type="submit" disabled={!question.trim() || loading}
              style={{
                padding: "12px 28px", background: "rgba(0,229,255,0.15)", border: "1.5px solid #00e5ff",
                color: "#00e5ff", fontFamily: "Orbitron, sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                cursor: question.trim() && !loading ? "pointer" : "not-allowed", borderRadius: 2,
              }}
            >
              Ask ▶
            </button>
          </form>

          <button
            onClick={toggleActivation}
            style={{
              width: "100%",
              padding: "16px",
              background: isActive ? "rgba(255, 68, 68, 0.15)" : "rgba(0, 229, 255, 0.15)",
              border: `2px solid ${isActive ? "#ff4444" : "#00e5ff"}`,
              color: isActive ? "#ff6666" : "#00e5ff",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: "bold",
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: 4,
              boxShadow: isActive ? "0 0 20px rgba(255, 68, 68, 0.4)" : "0 0 20px rgba(0, 229, 255, 0.4)",
              transition: "all 0.3s ease"
            }}
          >
            {isActive ? "⏹ Deactivate JARVIS" : "🎤 Activate JARVIS"}
          </button>

        </div>
      </div>
      
      <div style={{ height: 240 }} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}