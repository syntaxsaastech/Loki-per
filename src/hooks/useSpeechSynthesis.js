import { useState, useEffect } from "react";

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load voices (they load async in Chrome)
  useEffect(() => {
    const load = () => {
      const list = window.speechSynthesis?.getVoices() || [];
      if (list.length) {
        setVoices(list);
        // Pick female voice by default
        const preferred = list.find((v) =>
          /Google UK English Female|Samantha|Karen|Victoria|Zira|Moira|Fiona/i.test(
            v.name
          )
        );
        if (preferred) setSelectedVoice(preferred);
        else if (list[0]) setSelectedVoice(list[0]);
      }
    };

    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text, options = {}) => {
    if (!window.speechSynthesis || !text) {
      options.onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = options.lang || "en-US";
    u.rate = options.rate ?? 0.95;
    u.pitch = options.pitch ?? 1.15;
    u.volume = options.volume ?? 1;

    if (options.voice) u.voice = options.voice;
    else if (selectedVoice) u.voice = selectedVoice;

    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      options.onEnd?.();
    };
    u.onerror = (e) => {
      console.error("TTS error:", e);
      setSpeaking(false);
      options.onError?.(e);
    };

    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const pause = () => window.speechSynthesis?.pause();
  const resume = () => window.speechSynthesis?.resume();

  const setVoice = (voice) => setSelectedVoice(voice);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    voices,
    selectedVoice,
    setVoice,
  };
}