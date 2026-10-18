// src/utils/csvPaser.js

export function parseCSV(text) {
  const rows = [];
  let cur = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) { row.push(cur); cur = ""; }
    else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); row = []; cur = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else cur += c;
  }
  if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function rowsToLessons(rows, sourceName) {
  if (rows.length < 2) return [];
  
  const headers = rows[0].map((x) => x.trim().toLowerCase());
  
  // Dynamically find the column indexes
  const topicIdx = headers.findIndex(h => h.includes("topic"));
  const qIdx = headers.findIndex(h => h.includes("question") || h.includes("statement"));
  const aIdx = headers.findIndex(h => h.includes("answer") || h.includes("explanation") || h.includes("core concept"));
  const exIdx = headers.findIndex(h => h.includes("example") || h.includes("formula"));
  const lvlIdx = headers.findIndex(h => h.includes("level") || h.includes("difficulty"));
  const catIdx = headers.findIndex(h => h.includes("category"));

  // Check if this is the Aptitude file
  const isAptitude = headers.includes("category") && headers.includes("main_answer");
  const coreTypes = ["core concept", "key rule", "formula"];
  const lessonsMap = new Map();

  rows.slice(1).forEach((r) => {
    const topic = (r[topicIdx] || "").trim();
    if (!topic) return;

    if (isAptitude) {
      const type = (r[headers.indexOf("content_type")] || "").trim().toLowerCase();
      const statement = (r[headers.indexOf("statement")] || "").trim();
      const rule = (r[headers.indexOf("rules")] || "").trim();
      const formula = (r[headers.indexOf("formula")] || "").trim();
      const example = (r[headers.indexOf("example")] || "").trim();
      const category = (r[catIdx] || "").trim();
      const level = (r[lvlIdx] || "").trim();

      const current = lessonsMap.get(topic) || {
        topic, category, level, question: "", answer: "", examples: "", source: sourceName,
      };

      if (coreTypes.includes(type)) {
        current.question = statement;
        current.answer = statement + " " + rule + " " + formula;
      }
      if (type === "worked example" && example) {
        current.examples += example + ". ";
      }
      lessonsMap.set(topic, current);
    } else {
      // Grammar file parsing
      const examples = rows[0]
        .map((h, i) => h.toLowerCase().includes("example") ? r[i] : null)
        .filter(Boolean).join(" ");

      lessonsMap.set(topic + Math.random(), {
        topic: topic,
        category: (r[catIdx] || "Grammar").trim(),
        level: (r[lvlIdx] || "Mixed").trim(),
        question: (r[qIdx] || "").trim(),
        answer: (r[aIdx] || "").trim(),
        examples: examples,
        source: sourceName
      });
    }
  });

  return Array.from(lessonsMap.values());
}

export function loadAllLessons(csvFiles) {
  const all = [];
  for (const f of csvFiles) {
    const rows = parseCSV(f.raw);
    all.push(...rowsToLessons(rows, f.name));
  }
  return all;
}