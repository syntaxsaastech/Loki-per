import { useRef, useState } from "react";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recogRef = useRef(null);

  const listen = () => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      setError("Speech Recognition not supported. Use Chrome or Edge.");
      return;
    }

    // Stop any previous session
    try {
      recogRef.current?.stop();
    } catch {}

    const recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    let got = false;

    recog.onstart = () => {
      setListening(true);
      setError("");
    };

    recog.onend = () => setListening(false);

    recog.onerror = (e) => {
      setListening(false);
      if (e.error === "no-speech") {
        setError("I didn't hear anything. Try again.");
      } else if (e.error === "not-allowed") {
        setError("Microphone access denied.");
      } else if (e.error !== "aborted") {
        setError(`Error: ${e.error}`);
      }
    };

    recog.onresult = (e) => {
      if (got) return;
      got = true;
      const text = e.results[0][0].transcript;
      console.log("🎤 Heard:", text);
      setTranscript(text);
    };

    recogRef.current = recog;
    setTranscript("");
    try {
      recog.start();
    } catch (err) {
      console.error("Recog start error:", err);
    }
  };

  const stop = () => {
    try {
      recogRef.current?.stop();
    } catch {}
    setListening(false);
  };

  const reset = () => setTranscript("");

  return {
    listen,
    stop,
    reset,
    listening,
    transcript,
    error,
  };
}