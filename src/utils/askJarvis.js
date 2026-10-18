/**
 * askJarvis — sends a question to the backend AI and gets an answer.
 * Backend: /api/chat → OpenAI GPT-4o-mini (or any LLM you configure)
 */

export async function askJarvis(question, history = []) {
  if (!question || !question.trim()) {
    return "I didn't catch that. Please try again.";
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.trim(),
        history: history.slice(-6), // last 6 messages for context
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Backend error:", err);
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.answer) {
      return "I couldn't find an answer for that.";
    }

    return data.answer;
  } catch (err) {
    console.error("askJarvis failed:", err);
    return "Sorry, I couldn't reach the AI. Check that the backend is running.";
  }
}

// ---------- Streaming version (optional) ----------
export async function askJarvisStream(question, history = [], onChunk) {
  try {
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.trim(),
        history: history.slice(-6),
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error("No stream body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          if (json.text && onChunk) onChunk(json.text);
        } catch {
          // ignore malformed chunks
        }
      }
    }
  } catch (err) {
    console.error("Stream failed:", err);
    if (onChunk) onChunk("Sorry, stream failed.");
  }
}