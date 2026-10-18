// src/utils/csvPaser.js
// Fast CSV parser + lesson builders for: Medical, Aptitude, English Grammar.
// Works with BOTH old and new column names (see the header detection below).

// ---------------------------------------------------------------
// 1. FAST CSV PARSER (handles quotes, commas, new lines, BOM)
// ---------------------------------------------------------------
export function parseCSV(input) {
  let text = String(input || "");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const n = text.length;
  const rows = [];
  let i = 0;

  while (i < n) {
    const row = [];
    let endOfRow = false;

    while (!endOfRow) {
      let field = "";

      if (text.charCodeAt(i) === 34) {
        // quoted field
        let j = i + 1;
        while (true) {
          const q = text.indexOf('"', j);
          if (q === -1) { field += text.slice(j); j = n; break; }
          if (text.charCodeAt(q + 1) === 34) { field += text.slice(j, q + 1); j = q + 2; continue; }
          field += text.slice(j, q);
          j = q + 1;
          break;
        }
        i = j;
        // ignore stray text between closing quote and delimiter
        while (i < n) {
          const c = text.charCodeAt(i);
          if (c === 44 || c === 10 || c === 13) break;
          field += text[i];
          i++;
        }
      } else {
        let j = i;
        while (j < n) {
          const c = text.charCodeAt(j);
          if (c === 44 || c === 10 || c === 13) break;
          j++;
        }
        field = text.slice(i, j);
        i = j;
      }

      row.push(field);
      const c = text.charCodeAt(i);
      if (c === 44) {
        i++;
        if (i >= n) { row.push(""); endOfRow = true; }
      } else {
        if (c === 13 && text.charCodeAt(i + 1) === 10) i += 2;
        else i++;
        endOfRow = true;
      }
    }

    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------
// 2. SMALL HELPERS
// ---------------------------------------------------------------
const normHeader = (h) =>
  String(h || "").replace(/^\ufeff/, "").trim().toLowerCase().replace(/[\s\-]+/g, "_");

function findCol(headers, names) {
  for (const n of names) {
    const k = headers.indexOf(n);
    if (k !== -1) return k;
  }
  return -1;
}
const cell = (r, i) => (i >= 0 && r[i] != null ? String(r[i]).trim() : "");
const addUnique = (arr, v, max = 12) => {
  if (v && !arr.includes(v) && arr.length < max) arr.push(v);
};
const cutAt = (text, regex) => {
  const m = regex.exec(text);
  return (m ? text.slice(0, m.index) : text).trim().replace(/[.;\s]+$/, "");
};

// ---------------------------------------------------------------
// 3. MEDICAL  (new: Condition/English_Treatment/... , old: disease/symptoms/treatment)
// ---------------------------------------------------------------
function medicalLessons(rows, headers, sourceName) {
  const iName = findCol(headers, ["condition", "disease", "illness", "name", "topic"]);
  const iGroup = findCol(headers, ["category", "group"]);
  const iAud = findCol(headers, ["audience"]);
  const iSev = findCol(headers, ["severity"]);
  const iDur = findCol(headers, ["duration"]);
  const iSym = findCol(headers, ["symptoms"]);
  const iCause = findCol(headers, ["likely_causes", "causes"]);
  const iEng = findCol(headers, ["english_treatment", "english", "allopathic_treatment", "allopathic", "treatment", "medicine"]);
  const iAyu = findCol(headers, ["ayurvedic_treatment", "ayurvedic", "ayurveda"]);
  const iHome = findCol(headers, ["home_treatment", "home_remedy", "home_remedies", "home"]);
  const iDiet = findCol(headers, ["diet_do", "diet"]);
  const iAvoid = findCol(headers, ["avoid"]);
  const iCare = findCol(headers, ["care_level"]);
  const iDoc = findCol(headers, ["when_to_see_doctor", "red_flags", "see_doctor"]);
  const iPrev = findCol(headers, ["prevention"]);
  const hasVariants = iAud >= 0 && iSev >= 0;

  const map = new Map();

  for (let k = 1; k < rows.length; k++) {
    const r = rows[k];
    const name = cell(r, iName);
    if (!name) continue;

    let L = map.get(name);
    if (!L) {
      L = {
        topic: name, category: "Medical", kind: "medical", level: "general", source: sourceName,
        group: cell(r, iGroup) || "Medical",
        symptoms: "", causes: "", english: "", ayurvedic: "", home: "", diet: "", avoid: "",
        doctor: "", prevention: "", care: {}, _base: false,
      };
      map.set(name, L);
    }

    const aud = cell(r, iAud).toLowerCase();
    const sev = cell(r, iSev).toLowerCase();
    const dur = cell(r, iDur).toLowerCase();
    const isBase = !hasVariants || (aud.startsWith("adult") && sev === "mild" && dur.startsWith("acute"));

    if (isBase && !L._base) {
      L._base = true;
      L.symptoms = cell(r, iSym);
      L.causes = cell(r, iCause);
      // remove the generic audience/severity sentences that the generator appended
      L.english = cutAt(cell(r, iEng), /\.\s+(Start with self-care|Get a doctor's assessment|Do not self-treat)/);
      L.ayurvedic = cutAt(cell(r, iAyu), /\.\s+(Use classical formulations|Use gentle measures|Limit to simple|Use only mild|Avoid unsupervised|Herbs can interact)/);
      L.home = cell(r, iHome).replace(/[.\s]+$/, "");
      L.diet = cell(r, iDiet);
      L.avoid = cell(r, iAvoid);
      L.prevention = cell(r, iPrev);
      L.doctor = cell(r, iDoc);
    }

    // care level + doctor advice for each severity (adult, acute rows)
    if (!hasVariants) {
      L.care.mild = { level: cell(r, iCare), doctor: cell(r, iDoc) };
    } else if (aud.startsWith("adult") && dur.startsWith("acute") && sev) {
      L.care[sev] = { level: cell(r, iCare), doctor: cell(r, iDoc) };
    }
  }

  const out = [];
  for (const L of map.values()) {
    delete L._base;
    L.question = `What is ${L.topic}?`;
    L.answer = [
      L.symptoms && `Symptoms: ${L.symptoms}.`,
      L.english && `English treatment: ${L.english}.`,
      L.ayurvedic && `Ayurvedic: ${L.ayurvedic}.`,
      L.home && `Home remedy: ${L.home}.`,
    ].filter(Boolean).join(" ");
    L.examples = "";
    out.push(L);
  }
  return out;
}

// ---------------------------------------------------------------
// 4. APTITUDE  (Content_Type style OR Type style with Question rows)
// ---------------------------------------------------------------
function aptitudeLessons(rows, headers, sourceName) {
  const iCat = findCol(headers, ["category"]);
  const iTopic = findCol(headers, ["topic"]);
  const iType = findCol(headers, ["content_type", "type"]);
  const iStmt = findCol(headers, ["statement"]);
  const iAns = findCol(headers, ["main_answer", "answer"]);
  const iRule = findCol(headers, ["rules", "rule"]);
  const iForm = findCol(headers, ["formula"]);
  const iEx = findCol(headers, ["example", "eg"]);
  const iLvl = findCol(headers, ["difficulty", "level"]);
  const iTip = findCol(headers, ["exam_tip", "tip"]);

  const map = new Map();

  for (let k = 1; k < rows.length; k++) {
    const r = rows[k];
    const topic = cell(r, iTopic);
    if (!topic) continue;

    let L = map.get(topic);
    if (!L) {
      L = {
        topic, category: cell(r, iCat) || "Aptitude", kind: "aptitude", level: cell(r, iLvl) || "Mixed",
        source: sourceName, rules: [], formulas: [], examples: [], tips: [], mistakes: [], fast: [],
        steps: [], when: [], questions: [],
      };
      map.set(topic, L);
    }

    const type = cell(r, iType).toLowerCase();
    const stmt = cell(r, iStmt);
    const ans = cell(r, iAns);

    addUnique(L.rules, cell(r, iRule), 6);
    addUnique(L.formulas, cell(r, iForm), 6);
    addUnique(L.tips, cell(r, iTip), 4);

    if (type.includes("worked example")) {
      addUnique(L.examples, cell(r, iEx) || stmt, 4);
    } else if (type.includes("common mistake")) addUnique(L.mistakes, stmt, 4);
    else if (type.includes("fast method")) addUnique(L.fast, stmt, 4);
    else if (type.includes("exam tip")) addUnique(L.tips, stmt, 4);
    else if (type.startsWith("step") || type.includes("final check")) addUnique(L.steps, stmt, 8);
    else if (type.includes("when to use")) addUnique(L.when, stmt, 3);
    else if (type === "question" && stmt && ans) {
      if (L.questions.length < 300) L.questions.push({ q: stmt, a: ans, work: cell(r, iEx) });
    }
  }

  const out = [];
  for (const L of map.values()) {
    if (L.examples.length === 0 && L.questions.length > 0) {
      const q = L.questions[0];
      L.examples.push(`${q.q} Answer: ${q.a}.`);
    }
    L.question = `Explain ${L.topic}`;
    L.answer = [L.formulas[0], L.rules[0]].filter(Boolean).join(" ");
    out.push(L);
  }
  return out;
}

// ---------------------------------------------------------------
// 5. GRAMMAR  (topic, level, question, answer, example1..5)
// ---------------------------------------------------------------
function grammarLessons(rows, headers, sourceName) {
  const iTopic = headers.findIndex((h) => h.includes("topic"));
  const iQ = headers.findIndex((h) => h.includes("question"));
  const iA = headers.findIndex((h) => h.includes("answer"));
  const iLvl = headers.findIndex((h) => h.includes("level"));
  const iCat = headers.findIndex((h) => h.includes("category"));
  const exIdx = headers.map((h, i) => (h.includes("example") ? i : -1)).filter((i) => i >= 0);

  const out = [];
  for (let k = 1; k < rows.length; k++) {
    const r = rows[k];
    const topic = cell(r, iTopic);
    if (!topic) continue;
    const examplesList = exIdx.map((i) => cell(r, i)).filter(Boolean);
    out.push({
      topic: topic.replace(/_/g, " "),
      category: cell(r, iCat) || "Grammar",
      kind: "grammar",
      level: cell(r, iLvl) || "Mixed",
      question: cell(r, iQ),
      answer: cell(r, iA),
      examples: examplesList.join(" "),
      examplesList,
      source: sourceName,
    });
  }
  return out;
}

// ---------------------------------------------------------------
// 6. PUBLIC API
// ---------------------------------------------------------------
export function rowsToLessons(rows, sourceName = "csv") {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map(normHeader);

  const isMedical =
    (headers.includes("condition") || headers.includes("disease")) && headers.includes("symptoms");
  if (isMedical) return medicalLessons(rows, headers, sourceName);

  const isAptitude =
    headers.includes("topic") && headers.includes("main_answer") &&
    (headers.includes("content_type") || headers.includes("type"));
  if (isAptitude) return aptitudeLessons(rows, headers, sourceName);

  return grammarLessons(rows, headers, sourceName);
}

// Sync version (kept for old code)
export function loadAllLessons(csvFiles) {
  const all = [];
  for (const f of csvFiles) {
    try {
      all.push(...rowsToLessons(parseCSV(f.raw), f.name));
    } catch (err) {
      console.error(`CSV load failed for ${f.name}:`, err);
    }
  }
  return all;
}

// Async version: parses one file at a time so the page never freezes
export async function loadAllLessonsAsync(csvFiles, onProgress) {
  const all = [];
  for (const f of csvFiles) {
    await new Promise((res) => setTimeout(res, 0));
    try {
      const lessons = rowsToLessons(parseCSV(f.raw), f.name);
      all.push(...lessons);
      if (onProgress) onProgress(f.name, lessons.length);
    } catch (err) {
      console.error(`CSV load failed for ${f.name}:`, err);
    }
  }
  return all;
}