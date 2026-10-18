import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AIFace from "../components/AIFace";
import { csvFiles } from "../csv";
import { loadAllLessons } from "../utils/csvPaser";
import { processJarvisBrain } from "../jarvis/brain";

import { useFood } from "../hooks/useFood";
import { useGoals } from "../hooks/useGoals";
import { useRoutine } from "../hooks/useRoutine";
import { useMemory } from "../hooks/useMemory";
import { useAnalytics } from "../hooks/useAnalytics";

export default function AI() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("Systems online. Awaiting command.");

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hooks
  const { todayMeals } = useFood();
  const { goals } = useGoals();
  const { routines, dailyStats, today } = useRoutine();
  const { memories, saveMemory } = useMemory();
  const {
    productivityScore,
    avgCal,
    currentStreak,
    thisWeekRoutines,
    lastWeekRoutines,
  } = useAnalytics();

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isAwakeRef = useRef(false);
  const isListeningRef = useRef(false); // <-- mirror of isListening for callbacks
  const isProcessingRef = useRef(false); // <-- prevents overlapping brain calls

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Load CSVs
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

  // ==========================================
  // SPEAK HELPER (optional — uses your AIFace if it speaks)
  // ==========================================
  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.onstart = () => {
        isSpeakingRef.current = true;
      };
      utter.onend = () => {
        isSpeakingRef.current = false;
      };
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error("Speech error:", e);
    }
  }, []);

  // ==========================================
  // VOICE INPUT CONTROLS
  // ==========================================
  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      isListeningRef.current = false;
      setIsAwake(false);
      isAwakeRef.current = false;
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported. Use Chrome or Edge.");
      return;
    }

    // If already running, don't double-start
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      isAwakeRef.current = true;
    };

    recog.onresult = (event) => {
      // Ignore input while AI is speaking
      if (isSpeakingRef.current) return;

      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript.toLowerCase().trim();

      if (last.isFinal && transcript) {
        submitQuestion(transcript);
      }
    };

    recog.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recog.onend = () => {
      // Restart only if user still intends to listen
      if (recognitionRef.current === recog && isListeningRef.current) {
        try {
          recog.start();
        } catch (e) {
          // ignore
        }
      }
    };

    recognitionRef.current = recog;
    try {
      recog.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Check if AI is speaking to mute mic
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      isSpeakingRef.current = window.speechSynthesis.speaking;
    }, 500);
    return () => clearInterval(checkSpeaking);
  }, []);

  // ==========================================
  // NATIVE APP OPENER + WEB FALLBACK
  // ==========================================
  const APP_FALLBACKS = {
    instagram: "https://www.instagram.com",
    whatsapp: "https://web.whatsapp.com",
    youtube: "https://www.youtube.com",
    twitter: "https://www.x.com",
    facebook: "https://www.facebook.com",
    spotify: "https://open.spotify.com",
    maps: "https://maps.google.com",
    mail: "https://mail.google.com",
  };

  const openNativeApp = (url) => {
    const appName = url.split("://")[0] || "app";
    const fallbackUrl = APP_FALLBACKS[appName];

    setMessage(`Opening ${appName} now, sir.`);
    speak(`Opening ${appName} now, sir.`);

    // Try the native deep link
    try {
      window.location.href = url;
    } catch (err) {
      console.error("App not found", err);
    }

    // Fallback: if app doesn't open, open the web version
    if (fallbackUrl) {
      setTimeout(() => {
        // Only fallback if the page is still visible (user didn't leave to app)
        if (document.visibilityState === "visible") {
          window.open(fallbackUrl, "_blank");
        }
      }, 2500);
    }
  };

  // ==========================================
  // PROCESS COMMAND (FROM TEXT OR VOICE)
  // ==========================================
  async function submitQuestion(text) {
    const q = text.trim();
    if (!q) return;

    // Prevent overlapping requests
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // 1. Manual Navigation (Internal pages)
      const lower = q.toLowerCase();
      if (lower.includes("open calendar")) { navigate("/calendar"); return; }
      if (lower.includes("open food")) { navigate("/foodaccess"); return; }
      if (lower.includes("open routine")) { navigate("/routine"); return; }
      if (lower.includes("open goal")) { navigate("/goals"); return; }
      if (lower.includes("open memory")) { navigate("/memory"); return; }
      if (lower.includes("open analytics")) { navigate("/analytics"); return; }

      // 2. Send to Brain
      const answer = await processJarvisBrain(
        q,
        {
          todayMeals,
          goals,
          routines,
          dailyStats,
          today,
          memories,
          lessons,
          productivityScore,
          avgCal,
          currentStreak,
          thisWeekRoutines,
          lastWeekRoutines,
        },
        { saveMemory }
      );

      // 3. Check if the Brain wants to open a native app
      if (typeof answer === "string" && answer.startsWith("[OPEN_APP]")) {
        const url = answer.replace("[OPEN_APP]", "").trim();
        openNativeApp(url);
        return;
      }

      // 4. Normal reply
      setMessage(answer);
      // Optionally speak it if AIFace doesn't already handle TTS:
      // speak(answer);
    } catch (err) {
      console.error("Brain error:", err);
      setMessage("I encountered an error processing that, sir.");
    } finally {
      isProcessingRef.current = false;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020810" }}>
      <AIFace
        message={message}
        onUserCommand={submitQuestion}
        isListening={isListening}
        toggleMic={toggleMic}
      />
    </div>
  );
}