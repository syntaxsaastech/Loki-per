// src/jarvis/brain.js
import { 
  GREETING_PROMPTS, GREETING_RESPONSES, 
  HOW_ARE_YOU_PROMPTS, HOW_ARE_YOU_RESPONSES, 
  ASK_PROMPTS, ASK_RESPONSES, 
  BYE_PROMPTS, BYE_RESPONSES, 
  JOKE_RESPONSES 
} from "./greetings";

// ================================================================
// 1. SMALL HELPERS
// ================================================================
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function clean(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[_\-/]/g, " ")
    .replace(/[^a-z0-9% ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a, b, max = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

const sentence = (t) => {
  const s = String(t || "").trim().replace(/[.;\s]+$/, "");
  return s ? s + "." : "";
};

const titleCase = (s) =>
  String(s || "").trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const localKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const utcKey = (d = new Date()) => d.toISOString().slice(0, 10);

// ================================================================
// 2. TRAINING
// ================================================================
const TRAIN_KEY = "jarvis_training";

function loadTraining() {
  try {
    if (typeof localStorage === "undefined") return [];
    const list = JSON.parse(localStorage.getItem(TRAIN_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function saveTraining(list) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(TRAIN_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

function handleTrainCommand(q) {
  const lower = q.trim().toLowerCase();
  if (/^(forget|clear|reset) (all )?(my )?training$/.test(lower)) {
    saveTraining([]);
    return "Done. I forgot everything you trained me.";
  }
  const m = q.match(/^\s*train\s*:?\s*(.+?)\s*=\s*([\s\S]+)$/i);
  if (!m) {
    if (/^\s*train\b/i.test(q)) return 'To teach me, say or type: train: your phrase = my reply';
    return null;
  }
  const prompt = clean(m[1]);
  const response = m[2].trim();
  if (!prompt || !response) return 'To teach me, say or type: train: your phrase = my reply';
  const list = loadTraining().filter((t) => clean(t.prompt) !== prompt);
  list.push({ prompt: m[1].trim(), response });
  saveTraining(list);
  return `Got it. When you say "${m[1].trim()}", I will reply "${response}".`;
}

function trainedReply(c) {
  const list = loadTraining();
  for (const t of list) if (clean(t.prompt) === c) return t.response;
  if (c.length >= 6) {
    for (const t of list) {
      const p = clean(t.prompt);
      if (p.length >= 6 && levenshtein(c, p, 1) <= 1) return t.response;
    }
  }
  return null;
}

// ================================================================
// 3. CALCULATOR
// ================================================================
function evalExpr(src) {
  const s = src.replace(/\s+/g, "");
  let i = 0;
  const fail = () => { throw new Error("bad expr"); };

  function number() {
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) fail();
    i += m[0].length;
    return parseFloat(m[0]);
  }
  function primary() {
    if (s[i] === "(") { i++; const v = expr(); if (s[i] !== ")") fail(); i++; return v; }
    return number();
  }
  function unary() {
    if (s[i] === "-") { i++; return -unary(); }
    if (s[i] === "+") { i++; return unary(); }
    return primary();
  }
  function power() {
    const base = unary();
    if (s[i] === "^") { i++; return Math.pow(base, power()); }
    return base;
  }
  function term() {
    let v = power();
    while (s[i] === "*" || s[i] === "/") { const op = s[i++]; const r = power(); v = op === "*" ? v * r : v / r; }
    return v;
  }
  function expr() {
    let v = term();
    while (s[i] === "+" || s[i] === "-") { const op = s[i++]; const r = term(); v = op === "+" ? v + r : v - r; }
    return v;
  }
  const result = expr();
  if (i !== s.length) fail();
  return result;
}

const fmtNum = (n) => (!Number.isFinite(n) ? "undefined" : String(parseFloat(n.toFixed(6))));
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const isPrime = (n) => {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

function tryMath(raw) {
  let s = String(raw).toLowerCase().replace(/,/g, "").replace(/\?+$/, "").trim();
  let m;
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/))) return `${m[1]}% of ${m[2]} is ${fmtNum((parseFloat(m[1]) * parseFloat(m[2])) / 100)}.`;
  if ((m = s.match(/(?:square root|sqrt|root) of (\d+(?:\.\d+)?)/))) return `The square root of ${m[1]} is ${fmtNum(Math.sqrt(parseFloat(m[1])))}.`;
  if ((m = s.match(/cube root of (\d+(?:\.\d+)?)/))) return `The cube root of ${m[1]} is ${fmtNum(Math.cbrt(parseFloat(m[1])))}.`;
  if ((m = s.match(/\bsquare of (\d+(?:\.\d+)?)/))) return `${m[1]} squared is ${fmtNum(parseFloat(m[1]) ** 2)}.`;
  if ((m = s.match(/\bcube of (\d+(?:\.\d+)?)/))) return `${m[1]} cubed is ${fmtNum(parseFloat(m[1]) ** 3)}.`;
  if ((m = s.match(/factorial of (\d+)/))) {
    const n = parseInt(m[1], 10);
    if (n > 20) return "That factorial is too big for me. Try 20 or less.";
    let f = 1n;
    for (let k = 2n; k <= BigInt(n); k++) f *= k;
    return `${n}! is ${f.toString()}.`;
  }
  if ((m = s.match(/\b(hcf|gcd|lcm) of ((?:\d+(?:\s*(?:,|and)\s*)?)+)/))) {
    const nums = m[2].match(/\d+/g).map(Number);
    if (nums.length >= 2) {
      const val = m[1] === "lcm" ? nums.reduce((a, b) => (a * b) / gcd(a, b)) : nums.reduce((a, b) => gcd(a, b));
      return `The ${m[1].toUpperCase()} of ${nums.join(", ")} is ${val}.`;
    }
  }
  if ((m = s.match(/\bis (\d+) (?:a )?prime/))) {
    const n = parseInt(m[1], 10);
    return isPrime(n) ? `Yes, ${n} is a prime number.` : `No, ${n} is not a prime number.`;
  }

  s = s
    .replace(/^(?:what is|whats|what s|calculate|calc|compute|solve|evaluate|find|tell me|how much is)\s*/, "")
    .replace(/\bplus\b/g, "+").replace(/\bminus\b/g, "-")
    .replace(/\b(?:times|multiplied by|into)\b/g, "*").replace(/\b(?:divided by|over)\b/g, "/")
    .replace(/\bto the power of\b/g, "^").replace(/(\d)\s*x\s*(\d)/g, "$1*$2")
    .replace(/[×]/g, "*").replace(/[÷]/g, "/").replace(/=+\s*$/, "").trim();

  if (/^[0-9+\-*/().^\s]+$/.test(s) && /\d/.test(s) && /[+\-*/^]/.test(s.replace(/^\s*-/, ""))) {
    try { const v = evalExpr(s); return `${s.replace(/\s+/g, " ")} = ${fmtNum(v)}`; } catch { return null; }
  }
  return null;
}

// ================================================================
// 4. QUIZ
// ================================================================
let pendingQuiz = null;
function handleQuizAnswer(c, raw) {
  if (!pendingQuiz) return null;
  if (/^(answer|show answer|show me the answer|solution|i give up|give up|tell me the answer|what is the answer)$/.test(c)) {
    const p = pendingQuiz;
    pendingQuiz = null;
    return `Answer: ${p.a}.${p.work ? " " + sentence(p.work) : ""}`;
  }
  if (/^[\d\s.,:%/a-z]{1,25}$/i.test(raw.trim()) && /\d/.test(raw)) {
    const given = (raw.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const wanted = (pendingQuiz.a.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (wanted.length && given.length && given[0] === wanted[0]) {
      const p = pendingQuiz; pendingQuiz = null;
      return `Correct! The answer is ${p.a}.`;
    }
    return 'Not quite. Try again, or say "answer" to see the solution.';
  }
  pendingQuiz = null;
  return null;
}

// ================================================================
// 5. KNOWLEDGE SEARCH (CSV)
// ================================================================
const STOP = new Set(
  ("a an the of in on at to for from with by and or is are was were am be do does did can could should would will " +
    "i me my mine you your we our it its this that these those what whats which who whom how why when where " +
    "tell teach explain show give about please jarvis hey buddy " +
    "symptom symptoms sign signs treatment treatments cure cures remedy remedies medicine medicines tablet tablets " +
    "ayurvedic ayurveda ayurved herbal english allopathic allopathy home gharelu natural " +
    "have has had having got suffering suffer feel feeling get " +
    "cause causes diet eat avoid prevent prevention doctor " +
    "formula formulas rule rules example examples tip tips trick shortcut method steps step practice quiz question " +
    "child children kid kids baby infant toddler son daughter boy girl teen teenager elderly old pregnant pregnancy " +
    "severe moderate mild very bad worst serious emergency lesson topic meaning define definition " +
    "any some there here need want like know learn study").split(/\s+/)
);
const TOPIC_STOP = new Set(["and", "of", "the", "a", "an", "in", "for", "to", "with"]);

const ALIASES = [
  ["loose motions", "diarrhoea"], ["loose motion", "diarrhoea"], ["diarrhea", "diarrhoea"],
  ["stomach ache", "stomach pain"], ["stomach pain", "stomach pain"], ["tummy pain", "stomach pain"],
  ["belly pain", "stomach pain"], ["abdominal pain", "stomach pain"], ["tummy ache", "stomach pain"],
  ["high blood pressure", "hypertension"], ["high bp", "hypertension"], ["blood pressure", "hypertension"],
  ["low bp", "fainting"], ["sugar problem", "diabetes type 2"], ["diabetes", "diabetes type 2"],
  ["diabetic", "diabetes type 2"], ["sugar", "diabetes type 2"],
  ["gas trouble", "gas and bloating"], ["gas", "gas and bloating"], ["bloating", "gas and bloating"],
  ["acid reflux", "acidity gerd"], ["acidity", "acidity gerd"], ["heartburn", "acidity gerd"],
  ["cold", "common cold"], ["runny nose", "common cold"], ["flu", "influenza flu"],
  ["throat pain", "sore throat"], ["throat infection", "sore throat"],
  ["loss of hair", "hair fall"], ["hair loss", "hair fall"], ["pimples", "acne"], ["pimple", "acne"],
  ["piles", "piles haemorrhoids"], ["haemorrhoids", "piles haemorrhoids"], ["hemorrhoids", "piles haemorrhoids"],
  ["uti", "urinary tract infection"], ["urine infection", "urinary tract infection"],
  ["period pain", "menstrual cramps"], ["periods pain", "menstrual cramps"], ["menstrual pain", "menstrual cramps"],
  ["pcos", "pcos"], ["pcod", "pcos"], ["thyroid", "hypothyroidism"], ["tiredness", "fatigue and weakness"],
  ["weakness", "fatigue and weakness"], ["fatigue", "fatigue and weakness"], ["tired", "fatigue and weakness"],
  ["sleeplessness", "insomnia"], ["cant sleep", "insomnia"], ["no sleep", "insomnia"],
  ["tension", "stress"], ["dizziness", "vertigo"], ["dizzy", "vertigo"],
  ["throwing up", "vomiting and nausea"], ["vomiting", "vomiting and nausea"], ["nausea", "vomiting and nausea"],
  ["body pain", "joint pain arthritis"], ["joint pain", "joint pain arthritis"], ["arthritis", "joint pain arthritis"],
  ["swelling in legs", "swollen legs oedema"], ["swollen legs", "swollen legs oedema"], ["edema", "swollen legs oedema"],
  ["eye pain", "eye strain"], ["red eye", "conjunctivitis red eye"], ["pink eye", "conjunctivitis red eye"],
  ["ear ache", "ear pain"], ["earache", "ear pain"], ["tooth pain", "toothache"],
  ["breathing problem", "breathlessness"], ["shortness of breath", "breathlessness"],
  ["heart attack", "chest pain"], ["sun stroke", "heat stroke"], ["sunstroke", "heat stroke"],
  ["worms", "intestinal worms"], ["jaundice", "jaundice"], ["rash", "urticaria hives"], ["hives", "urticaria hives"],
  ["ringworm", "fungal infection ringworm"], ["fungal infection", "fungal infection ringworm"],
  ["bad smell mouth", "bad breath"], ["gum bleeding", "bleeding gums"], ["cuts", "cuts and wounds"],
  ["wound", "cuts and wounds"], ["burn", "minor burns"], ["burns", "minor burns"],
  ["ratio", "ratio and proportion"], ["proportion", "ratio and proportion"],
  ["alligation", "mixtures and alligation"], ["mixture", "mixtures and alligation"],
  ["pipes", "pipes and cisterns"], ["cistern", "pipes and cisterns"],
  ["boats", "boats and streams"], ["streams", "boats and streams"],
  ["speed distance", "time speed distance"], ["tsd", "time speed distance"],
  ["profit", "profit and loss"], ["loss", "profit and loss"], ["interest", "simple interest"],
  ["hcf", "hcf lcm"], ["lcm", "hcf lcm"], ["di", "data interpretation"],
  ["trig", "trigonometry"], ["heights and distances", "height distance"],
  ["log", "logarithms"], ["logs", "logarithms"], ["permutations", "permutation"], ["combinations", "combination"],
].sort((a, b) => b[0].length - a[0].length);

const ALIAS_REGEX = ALIASES.map(([from, to]) => [new RegExp(`\\b${from}\\b`, "g"), to]);

function applyAliases(c) {
  let out = c;
  for (const [re, to] of ALIAS_REGEX) {
    if (re.test(out)) {
      re.lastIndex = 0;
      out = out.replace(re, (match, offset, whole) => {
        const before = whole.slice(0, offset);
        const after = whole.slice(offset + match.length);
        if (to.split(" ").some((w) => w && (before.endsWith(w + " ") || after.startsWith(" " + w)))) return match;
        return to;
      });
    }
    re.lastIndex = 0;
  }
  return out;
}

function stem(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}

function tokensOf(c, stopSet) {
  return c.split(" ").filter((t) => t && !stopSet.has(t)).map(stem);
}

function tokenScore(qt, tt) {
  if (qt === tt) return 1;
  if (qt.length >= 5 && tt.length >= 5 && levenshtein(qt, tt, 1) <= 1) return 0.85;
  if (qt.length >= 4 && tt.length >= 4) {
    let p = 0;
    while (p < qt.length && p < tt.length && qt[p] === tt[p]) p++;
    if (p >= 5 && p >= 0.75 * Math.min(qt.length, tt.length)) return 0.7;
  }
  return 0;
}

const INDEX_CACHE = new WeakMap();
function getIndex(lessons) {
  let idx = INDEX_CACHE.get(lessons);
  if (idx) return idx;
  idx = lessons.map((lesson) => {
    const topicClean = clean(lesson.topic);
    return {
      lesson,
      topicClean,
      topicTokens: tokensOf(topicClean, TOPIC_STOP),
      qTokens: lesson.kind === "grammar" ? tokensOf(clean(lesson.question), STOP) : [],
    };
  });
  INDEX_CACHE.set(lessons, idx);
  return idx;
}

function bestTokenMatch(qt, tokens) {
  let best = 0;
  for (const tt of tokens) {
    const s = tokenScore(qt, tt);
    if (s > best) best = s;
    if (best === 1) break;
  }
  return best;
}

function searchLessons(cq, lessons) {
  const qTokens = tokensOf(applyAliases(cq), STOP);
  if (qTokens.length === 0) return [];
  const aliased = applyAliases(cq);
  const results = [];

  for (const item of getIndex(lessons)) {
    let score = 0;
    if (item.topicClean && new RegExp(`\\b${item.topicClean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(aliased)) {
      score = 100 + item.topicClean.length;
    } else if (item.topicTokens.length) {
      let tMatched = 0;
      for (const tt of item.topicTokens) tMatched += bestTokenMatch(tt, qTokens);
      let qMatched = 0;
      for (const qt of qTokens) qMatched += bestTokenMatch(qt, item.topicTokens);
      if (tMatched > 0) {
        const ratioT = tMatched / item.topicTokens.length;
        const ratioQ = qMatched / qTokens.length;
        score = 40 * ratioT + 40 * ratioQ;
      }
    }
    if (item.qTokens.length && score < 100) {
      let m = 0;
      for (const qt of qTokens) m += bestTokenMatch(qt, item.qTokens);
      const ratio = m / Math.max(qTokens.length, 1);
      if (ratio >= 0.8) score = Math.max(score, 50 + 20 * ratio);
    }
    if (score > 0) results.push({ lesson: item.lesson, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ---------------- medical reply ----------------
const AUDIENCES = [
  ["child", /\b(child|children|kid|kids|baby|infant|toddler|son|daughter|boy|girl)\b/],
  ["elderly", /\b(elderly|old age|old man|old woman|grandfather|grandmother|grandma|grandpa|senior citizen|seniors?)\b/],
  ["pregnant", /\b(pregnan\w*|expecting)\b/],
  ["teen", /\b(teen|teens|teenager|adolescent)\b/],
  ["chronic", /\b(diabetic|hypertensive|with diabetes|with bp|with kidney|kidney patient|bp patient|sugar patient)\b/],
];
const AUDIENCE_NOTES = {
  child: { en: "For children: use only child-formulation medicines as per the label or your pediatrician, never aspirin, and see a pediatrician early.", ay: "For children: only simple measures like warm water and light food; herbs only through a registered Ayurvedic pediatric practitioner.", home: "Do not give honey under 1 year; avoid strong herbal teas or essential oils." },
  elderly: { en: "For people over 60: avoid ibuprofen or diclofenac-type painkillers unless your doctor approves, and have your other medicines checked.", ay: "Use gentle measures under practitioner guidance and watch digestion and hydration.", home: "Test hot packs on the skin to avoid burns and move gently to avoid falls." },
  pregnant: { en: "In pregnancy: do not take any medicine, supplement or herb without asking your obstetrician.", ay: "In pregnancy: avoid unsupervised herbs and strong laxatives; only under a qualified practitioner who knows you are pregnant.", home: "Avoid herbal teas, essential oils and hot baths unless your obstetrician agrees." },
  teen: { en: "For teens: use OTC medicines only as per label for age and weight, and avoid aspirin under 16.", ay: "Use only mild measures; formulations should be guided by a registered practitioner.", home: "Stay hydrated and rest; avoid energy drinks." },
  chronic: { en: "With diabetes, BP or kidney disease: ask your doctor before any medicine, because some raise sugar or BP or harm kidneys.", ay: "Herbs can interact with diabetes, BP and kidney medicines; avoid sugar-based preparations and never stop prescribed medicines.", home: "Limit honey, jaggery and sugary home remedies and check your sugar or BP if symptoms last." },
};

function detectAudience(c) { for (const [name, re] of AUDIENCES) if (re.test(c)) return name; return "adult"; }
function detectSeverity(c) {
  if (/\b(severe|very bad|unbearable|worst|serious|critical|emergency|extreme)\b/.test(c)) return "severe";
  if (/\b(moderate|getting worse|worse|worsening)\b/.test(c)) return "moderate";
  return "mild";
}
function medicalSections(c) {
  const s = new Set();
  if (/\b(ayurved\w*|herbal|kadha|natural|traditional)\b/.test(c)) s.add("ayurvedic");
  if (/\b(home|gharelu|remed\w*|household)\b/.test(c)) s.add("home");
  if (/\b(english|allopath\w*|medicines?|tablets?|drugs?|pills?|medication)\b/.test(c)) s.add("english");
  if (/\b(symptoms?|signs?)\b/.test(c)) s.add("symptoms");
  if (/\b(causes?|why)\b/.test(c)) s.add("causes");
  if (/\b(diet|eat|food|foods|drink)\b/.test(c)) s.add("diet");
  if (/\bavoid\b/.test(c)) s.add("avoid");
  if (/\bprevent\w*\b/.test(c)) s.add("prevention");
  if (/\b(see a doctor|see doctor|when to see|red flags?|dangerous|warning signs?|hospital)\b/.test(c)) s.add("doctor");
  return s;
}

function medicalReply(lesson, c) {
  const aud = detectAudience(c);
  const sev = detectSeverity(c);
  const wanted = medicalSections(c);
  const notes = AUDIENCE_NOTES[aud];
  const lines = [`${lesson.topic} (${lesson.group || "Medical"})`];
  const add = (label, text) => { const s = sentence(text); if (s) lines.push(`${label}: ${s}`); };
  const order = wanted.size ? ["symptoms", "causes", "english", "ayurvedic", "home", "diet", "avoid", "prevention", "doctor"].filter((k) => wanted.has(k)) : ["symptoms", "english", "ayurvedic", "home", "doctor"];
  const care = lesson.care?.[sev] || lesson.care?.mild || null;

  for (const key of order) {
    if (key === "symptoms") add("Symptoms", lesson.symptoms);
    if (key === "causes") add("Causes", lesson.causes);
    if (key === "english") { add("English (allopathic) treatment", lesson.english); if (notes) lines.push(notes.en); }
    if (key === "ayurvedic") { add("Ayurvedic (traditional use)", lesson.ayurvedic); if (notes) lines.push(notes.ay); }
    if (key === "home") { add("Home remedy", lesson.home); if (notes) lines.push(notes.home); }
    if (key === "diet") add("Good to eat", lesson.diet);
    if (key === "avoid") add("Avoid", lesson.avoid);
    if (key === "prevention") add("Prevention", lesson.prevention);
    if (key === "doctor") add("See a doctor if", (care && care.doctor) || lesson.doctor);
  }
  if (care && care.level && (wanted.size === 0 || sev !== "mild" || /emergency/i.test(care.level))) lines.push(`Care level (${sev}): ${care.level}.`);
  if (!lesson.symptoms && !lesson.english && lesson.answer) lines.push(lesson.answer);
  lines.push("This is general information, not a diagnosis. Please consult a doctor.");
  return lines.join("\n");
}

// ---------------- aptitude reply ----------------
function aptitudeReply(lesson, c, raw) {
  const wantsPractice = /\b(practice|quiz|test me|question|questions)\b/.test(c);
  if (wantsPractice) {
    if (lesson.questions && lesson.questions.length) {
      const q = pick(lesson.questions);
      pendingQuiz = { a: q.a, work: q.work, topic: lesson.topic };
      return `${lesson.topic} practice:\n${q.q}\nType your answer, or say "answer" to see it.`;
    }
    if (lesson.examples.length) return `${lesson.topic}: I have a worked example.\n${sentence(lesson.examples[0])}`;
  }

  const want = new Set();
  if (/\bformulas?\b/.test(c)) want.add("formula");
  if (/\brules?\b/.test(c)) want.add("rule");
  if (/\b(examples?|solve|sample)\b/.test(c)) want.add("example");
  if (/\b(tips?|tricks?|shortcuts?|fast|quick)\b/.test(c)) want.add("tip");
  if (/\b(mistakes?|errors?)\b/.test(c)) want.add("mistake");
  if (/\b(steps?|how to solve|procedure)\b/.test(c)) want.add("steps");

  const lines = [`${lesson.topic} (${lesson.category})`];
  const all = want.size === 0;
  if (all || want.has("formula")) lesson.formulas.slice(0, all ? 2 : 6).forEach((f) => lines.push(`Formula: ${sentence(f)}`));
  if (all || want.has("rule")) lesson.rules.slice(0, all ? 2 : 6).forEach((r) => lines.push(`Rule: ${sentence(r)}`));
  if (all || want.has("example")) lesson.examples.slice(0, all ? 1 : 3).forEach((e) => lines.push(`Example: ${sentence(e)}`));
  if (want.has("steps") && lesson.steps.length) lines.push(`Steps: ${lesson.steps.map((s, i) => `${i + 1}. ${s}`).join(" ")}`);
  if (want.has("tip")) [...lesson.fast, ...lesson.tips].slice(0, 3).forEach((t) => lines.push(`Tip: ${sentence(t)}`));
  else if (all && lesson.tips[0]) lines.push(`Tip: ${sentence(lesson.tips[0])}`);
  if (want.has("mistake")) lesson.mistakes.slice(0, 3).forEach((m) => lines.push(`Common mistake: ${sentence(m)}`));
  if (lines.length === 1) lines.push(lesson.answer || "I don't have details for this topic yet.");
  if (lesson.questions && lesson.questions.length) lines.push(`Say "practice ${lesson.topic}" for a question.`);
  return lines.join("\n");
}

// ---------------- grammar reply ----------------
function grammarReply(lesson, c) {
  const wantsExamples = /\b(examples?|sentences?)\b/.test(c);
  const ex = (lesson.examplesList || []).slice(0, 3);
  if (wantsExamples && ex.length) return `${lesson.topic} examples:\n${ex.join("\n")}`;
  const lines = [`${lesson.topic}: ${sentence(lesson.answer)}`];
  if (ex.length) lines.push(`Examples: ${ex.join(" | ")}`);
  return lines.join("\n");
}

function knowledgeReply(lessons, cq, raw) {
  if (!lessons || lessons.length === 0) return null;
  const results = searchLessons(cq, lessons);
  if (!results.length || results[0].score < 45) return null;

  const top = results[0];
  const lesson = top.lesson;
  let reply;
  if (lesson.kind === "medical") reply = medicalReply(lesson, cq);
  else if (lesson.kind === "aptitude") reply = aptitudeReply(lesson, cq, raw);
  else reply = grammarReply(lesson, cq);

  const alts = results.slice(1, 4).filter((r) => r.lesson.kind === lesson.kind && r.score >= top.score - 8 && r.score >= 45).map((r) => r.lesson.topic);
  if (alts.length) reply += `\nRelated: ${alts.join(", ")}.`;
  return reply;
}

// ================================================================
// 6. PERSONAL DATA
// ================================================================
const MEAL_WORDS = [
  [/\b(breakfast|morning)\b/, "Morning", "breakfast"],
  [/\b(lunch|afternoon)\b/, "Afternoon", "lunch"],
  [/\bevening\b/, "Evening", "evening meal"],
  [/\b(dinner|night)\b/, "Night", "dinner"],
  [/\bsnacks?\b/, "Snack", "snack"],
];

function foodReply(c, data) {
  const meals = Array.isArray(data.todayMeals) ? data.todayMeals : [];
  if (meals.length === 0) return "You haven't logged any food today.";
  for (const [re, time, label] of MEAL_WORDS) {
    if (re.test(c)) {
      const names = meals.filter((m) => m.time === time).map((m) => m.name);
      return names.length ? `For ${label} you had: ${names.join(", ")}.` : `No ${label} logged today.`;
    }
  }
  const total = meals.reduce((s, m) => s + (m.totals?.calories || 0), 0);
  if (/\bcalor/.test(c)) return `You have eaten about ${Math.round(total)} calories today from ${meals.length} meal(s).`;
  return `Today you ate: ${meals.map((m) => m.name).join(", ")}. Total: ${Math.round(total)} calories.`;
}

function routineReply(data) {
  const routines = Array.isArray(data.routines) ? data.routines : [];
  if (routines.length === 0) return "You have no routines yet. Add some on the Routine page.";
  const done = routines.filter((r) => r.done && r.doneDate === data.today);
  const pending = routines.filter((r) => !(r.done && r.doneDate === data.today));
  if (pending.length === 0) return `You completed all ${routines.length} routines today. Great job!`;
  const next = pending.slice(0, 3).map((r) => r.title).join(", ");
  return `You completed ${done.length} of ${routines.length} routines today. Next: ${next}.`;
}

function waterReply(data) {
  const ds = data.dailyStats;
  let glasses = 0;
  if (Array.isArray(ds)) glasses = ds.find((s) => s.date === data.today)?.water || 0;
  else if (ds && typeof ds === "object") glasses = ds.water || 0;
  return `You have drunk ${glasses} glass${glasses === 1 ? "" : "es"} of water today.`;
}

function goalsReply(data) {
  const goals = Array.isArray(data.goals) ? data.goals : [];
  if (goals.length === 0) return "You have no goals yet. Add some on the Goals page.";
  const keys = new Set([localKey(), utcKey(), data.today]);
  const lines = goals.slice(0, 6).map((g) => {
    const value = keys.has(g.lastReset) ? g.progress || 0 : 0;
    return `${g.name || g.title || "Goal"}: ${value}/${g.target || 0} ${g.unit || ""}`.trim();
  });
  const hit = goals.filter((g) => keys.has(g.lastReset) && (g.progress || 0) >= (g.target || Infinity)).length;
  return `You have ${goals.length} goals and completed ${hit} today.\n${lines.join("\n")}`;
}

function progressReply(data) {
  const routines = Array.isArray(data.routines) ? data.routines : [];
  let score = data.productivityScore;
  if (typeof score !== "number" || Number.isNaN(score)) {
    const done = routines.filter((r) => r.done && r.doneDate === data.today).length;
    score = routines.length ? Math.round((done / routines.length) * 100) : 0;
  }
  const streak = data.currentStreak || 0;
  let msg = `Your productivity score is ${score}%. You have a ${streak}-day streak.`;
  if (typeof data.thisWeekRoutines === "number" && typeof data.lastWeekRoutines === "number") {
    msg += ` This week you finished ${data.thisWeekRoutines} routines (last week ${data.lastWeekRoutines}).`;
  }
  return msg + " Keep it up!";
}

// ---- memory ----
async function trySaveMemory(q, hooks) {
  let key = null, value = null, m;
  if ((m = q.match(/^\s*(?:my name is|i am called|call me)\s+(.{1,40}?)\s*[.!]?\s*$/i))) { key = "name"; value = titleCase(m[1]); }
  else if ((m = q.match(/^\s*remember(?:\s+that)?\s+(?:my\s+)?(.+?)\s+(?:is|are|=)\s+(.+?)\s*[.!]?\s*$/i))) { key = m[1].trim().toLowerCase(); value = m[2].trim(); }
  else if ((m = q.match(/^\s*my\s+(favou?rite\s+\w+(?:\s\w+)?|age|birthday|city|phone|email|hobby|job|college|school)\s+(?:is|=)\s+(.+?)\s*[.!]?\s*$/i))) { key = m[1].trim().toLowerCase(); value = m[2].trim(); }
  if (!key || !value) return null;
  if (!hooks || typeof hooks.saveMemory !== "function") return "I can't save memories right now.";
  let ok;
  try { ok = await hooks.saveMemory(key, value, "personal"); } catch { ok = false; }
  if (ok === false) return "I couldn't save that yet because I'm still connecting. Please try again in a moment.";
  return `Got it. I will remember that your ${key} is ${value}.`;
}

function tryReadMemory(c, data) {
  const memories = Array.isArray(data.memories) ? data.memories : [];
  if (/^(what do you (remember|know) about me|show (me )?my memories|what do you remember)$/.test(c)) {
    if (!memories.length) return "I don't have any memories about you yet. Say \"my name is ...\" or \"remember my ... is ...\".";
    return "Here is what I remember:\n" + memories.slice(0, 8).map((m) => `${m.key}: ${m.value}`).join("\n");
  }
  let key = null;
  if (/^who am i$/.test(c)) key = "name";
  else {
    const m = c.match(/^(?:what s |whats |what is |tell me |do you (?:know|remember) )my (.+)$/);
    if (m) key = m[1].replace(/\b(please|again)\b/g, "").trim();
  }
  if (!key) return null;
  const found = memories.find((x) => clean(x.key) === key) || memories.find((x) => clean(x.key).includes(key) || key.includes(clean(x.key)));
  if (found) return `Your ${found.key} is ${found.value}.`;
  if (key === "name") return 'I don\'t know your name yet. Say "my name is ..." to teach me.';
  return `I don't know your ${key} yet. Say "remember my ${key} is ..." to teach me.`;
}

// ================================================================
// 7. MAIN FUNCTION
// ================================================================
export async function processJarvisBrain(q, data = {}, hooks = {}) {
  let raw = String(q || "").trim();
  if (!raw) return "I didn't catch that. Please try again.";

  raw = raw.replace(/^\s*(?:hey|ok|okay|hi|hello)?\s*(?:jarvis|buddy)\b[\s,:.!-]*/i, "").trim();
  if (!raw) return "Yes, I'm listening. What can I do for you?";

  let c = clean(raw);
  if (!c) return "I didn't catch that. Please try again.";

  // 0. practice-question answers
  const quiz = handleQuizAnswer(c, raw);
  if (quiz) return quiz;

  // 1. teach commands
  const trained = handleTrainCommand(raw);
  if (trained) return trained;

  // 2. your own trained phrases
  const mine = trainedReply(c);
  if (mine) return mine;

  // ==========================================
  // 3. GREETINGS & HUMAN CHAT
  // ==========================================
  if (GREETING_PROMPTS.includes(c) || GREETING_PROMPTS.some(g => c === g || c.startsWith(g + " "))) {
    return pick(GREETING_RESPONSES);
  }
  if (HOW_ARE_YOU_PROMPTS.includes(c)) {
    return pick(HOW_ARE_YOU_RESPONSES);
  }
  if (ASK_PROMPTS.some(p => c.includes(p))) {
    return pick(ASK_RESPONSES);
  }
  if (BYE_PROMPTS.includes(c)) {
    return pick(BYE_RESPONSES);
  }
  if (c.includes("joke")) {
    return pick(JOKE_RESPONSES);
  }

  // Catch typos like "haii", "helo"
  if (c.length < 20 && /^(hi|hey|hai|helo|hola|sup|yo|hru|whats up)/.test(c)) {
    return pick(GREETING_RESPONSES);
  }

  // ==========================================
  // 4. OPEN NATIVE APPS
  // ==========================================
  const apps = {
    instagram: "instagram://app",
    whatsapp: "whatsapp://app",
    facebook: "fb://",
    twitter: "twitter://",
    x: "twitter://",
    linkedin: "linkedin://",
    youtube: "youtube://",
    spotify: "spotify://",
    maps: "maps://",
    camera: "camera://",
    settings: "app-settings:",
    phone: "tel:",
    messages: "sms:",
    email: "mailto:",
    gmail: "googlegmail://",
    chrome: "googlechrome://"
  };

  for (const [appName, url] of Object.entries(apps)) {
    if (c.includes(appName) && (c.includes("open") || c.includes("go") || c.includes("launch"))) {
      return `[OPEN_APP]${url}`;
    }
  }

  // ==========================================
  // 5. SAVE TO MEMORY
  // ==========================================
  const saved = await trySaveMemory(raw, hooks);
  if (saved) return saved;

  // 6. time and date
  if (/\b(what time is it|current time|time now|whats the time|what is the time|tell me the time)\b/.test(c)) {
    return `It is ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`;
  }
  if (/\b(todays date|what is the date|whats the date|what day is it|what day is today|which day is it|today date|current date)\b/.test(c)) {
    return `Today is ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`;
  }

  // 7. calculator
  const math = tryMath(raw);
  if (math) return math;

  // 8. your data
  if (/\b(what (did )?i (eat|ate|have eaten|had)|what have i eaten|my (meals?|food|diet|calories)|how many calories|calories (today|so far)|did i eat)\b/.test(c)) return foodReply(c, data);
  if (/\b(my (routines?|habits?|tasks?)|what should i do|what do i have to do|whats next|what is next|pending tasks?|routine today)\b/.test(c)) return routineReply(data);
  if (/\b(water|hydrat\w*)\b/.test(c) && /\b(how|much|many|drink|drunk|drank|intake|glass\w*|today)\b/.test(c)) return waterReply(data);
  if (/\b(my goals?|goal progress|goals today)\b/.test(c)) return goalsReply(data);
  if (/\b(my progress|my productivity|productivity score|my streak|how am i doing|how is my day|hows my day)\b/.test(c)) return progressReply(data);

  // 9. read memory
  const mem = tryReadMemory(c, data);
  if (mem) return mem;

  // 10. who are you
  if (/\b(who (made|created|built|developed) you|who is your (creator|maker|owner)|your creator)\b/.test(c)) {
    return "I am JARVIS, your personal AI assistant created by Lokesh. I'm here to help you conquer the day.";
  }

  // 11. CSV knowledge
  const info = knowledgeReply(data.lessons, c, raw);
  if (info) return info;

  // 12. fallback
  const lessons = Array.isArray(data.lessons) ? data.lessons : [];
  const count = (k) => lessons.filter((l) => l.kind === k).length;
  return (
    "I'm not sure about that yet. Try:\n" +
    `Medical (${count("medical")} topics): "leg pain", "ayurvedic treatment for fever"\n` +
    `Aptitude (${count("aptitude")} topics): "time and work formula", "practice average"\n` +
    `Grammar (${count("grammar")} topics): "what is a noun"\n` +
    'Your data: "what did I eat", "my routine", "how much water"\n' +
    'Or teach me: train: your phrase = my reply'
  );
}