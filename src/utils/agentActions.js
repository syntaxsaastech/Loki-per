import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";
import { FOOD_DATABASE } from "../data/nutritionData";

// ============================================================
// PARSE COMMAND → ACTION
// ============================================================
export async function parseAgentCommand(text) {
  const t = text.toLowerCase().trim();

  // ---------- LOG MEAL ----------
  if (/^(log|add|i ate|i had|record)\s/.test(t)) {
    return await parseMealCommand(t);
  }

  // ---------- ADD ROUTINE ----------
  if (/^add\s+.+\s+to\s+(my\s+)?(routine|habits?)/.test(t)) {
    return parseRoutineCommand(t);
  }

  // ---------- UPDATE GOAL ----------
  if (/^mark\s+\w+\s+as\s+\d+/.test(t)) {
    return parseGoalCommand(t);
  }

  // ---------- SET REMINDER ----------
  if (/^remind\s+me/.test(t)) {
    return parseReminderCommand(t);
  }

  return null;
}

// ============================================================
// PARSE MEAL COMMAND
// ============================================================
async function parseMealCommand(t) {
  const mealTime = detectMealTime(t);

  // Extract food + quantity pairs
  const items = extractFoods(t);

  if (!items.length) return null;

  return {
    type: "log_meal",
    preview: {
      title: "Log meal",
      items: items.map((i) => ({
        name: i.food.name,
        grams: i.grams,
        calories: Math.round((i.food.calories * i.grams) / 100),
      })),
      mealTime,
    },
    execute: async () => {
      const user = await ensureUser();
      const totals = items.reduce(
        (acc, i) => {
          const f = i.grams / 100;
          return {
            calories: acc.calories + i.food.calories * f,
            protein: acc.protein + i.food.protein * f,
            carbs: acc.carbs + i.food.carbs * f,
            fat: acc.fat + i.food.fat * f,
            fiber: acc.fiber + (i.food.fiber || 0) * f,
            sodium: acc.sodium + (i.food.sodium || 0) * f,
            potassium: acc.potassium + (i.food.potassium || 0) * f,
            cholesterol: acc.cholesterol + (i.food.cholesterol || 0) * f,
          };
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sodium: 0,
          potassium: 0,
          cholesterol: 0,
        }
      );

      await addDoc(collection(db, "meals"), {
        uid: user.uid,
        name: items.map((i) => i.food.name).join(" + "),
        time: mealTime,
        date: new Date().toISOString().slice(0, 10),
        items: items.map((i) => ({
          foodId: i.food.id,
          name: i.food.name,
          grams: i.grams,
          calories: +((i.food.calories * i.grams) / 100).toFixed(1),
        })),
        totals,
        createdAt: serverTimestamp(),
      });

      return `Logged ${Math.round(totals.calories)} calories for ${mealTime.toLowerCase()}.`;
    },
  };
}

function detectMealTime(t) {
  if (t.includes("breakfast") || t.includes("morning")) return "Morning";
  if (t.includes("lunch") || t.includes("afternoon")) return "Afternoon";
  if (t.includes("dinner") || t.includes("night")) return "Night";
  if (t.includes("snack") || t.includes("evening")) return "Evening";
  return "Morning";
}

function extractFoods(t) {
  const found = [];

  FOOD_DATABASE.forEach((food) => {
    // Match food name (short version before any parentheses)
    const shortName = food.name.toLowerCase().split("(")[0].trim();
    if (!shortName) return;

    const idx = t.indexOf(shortName);
    if (idx === -1) return;

    // Look for a number before the food name
    const before = t.slice(Math.max(0, idx - 25), idx).trim();
    const qtyMatch = before.match(
      /(\d+(\.\d+)?)\s*(g|gram|grams|nos|no|pieces?|bowls?|cups?|plates?|rotis?|servings?)?\s*$/
    );

    let grams = 100;
    if (qtyMatch) {
      const num = Number(qtyMatch[1]);
      const unit = qtyMatch[3] || "";

      // Convert common units to grams
      if (unit.match(/g|gram/)) grams = num;
      else if (unit.match(/bowl|cup|serving|plate/)) grams = num * 150;
      else if (unit.match(/roti|piece|no/)) grams = num * 50;
      else if (num <= 10) grams = num * 100; // heuristic
      else grams = num;
    } else if (shortName.match(/roti|chapati|idli|dosa/)) {
      grams = 50; // default single serving
    }

    found.push({ food, grams });
  });

  return found;
}

// ============================================================
// PARSE ROUTINE COMMAND
// ============================================================
function parseRoutineCommand(t) {
  const m = t.match(/^add\s+(.+?)\s+to\s+(my\s+)?(routine|habits?)/);
  if (!m) return null;

  const title = m[1].trim();

  return {
    type: "add_routine",
    preview: {
      title: "Add habit",
      title2: title,
    },
    execute: async () => {
      const user = await ensureUser();
      await addDoc(collection(db, "routines"), {
        uid: user.uid,
        title,
        slot: "Morning",
        category: "custom",
        icon: "⭐",
        color: "#f97316",
        limit: "",
        time: "",
        done: false,
        doneDate: null,
        createdAt: serverTimestamp(),
      });
      return `Added "${title}" to your routine.`;
    },
  };
}

// ============================================================
// PARSE GOAL COMMAND
// ============================================================
function parseGoalCommand(t) {
  const m = t.match(/^mark\s+(\w+)\s+as\s+(\d+)/);
  if (!m) return null;

  const goalName = m[1];
  const value = Number(m[2]);

  return {
    type: "update_goal",
    preview: {
      title: "Update goal",
      goalName,
      value,
    },
    execute: async () => {
      const user = await ensureUser();

      // Find goal
      const goalsQ = query(
        collection(db, "goals"),
        where("uid", "==", user.uid)
      );
      const goalsSnap = await getDocs(goalsQ);
      const goal = goalsSnap.docs.find((d) =>
        d.data().name.toLowerCase().includes(goalName)
      );

      if (!goal) return `Couldn't find a goal named "${goalName}".`;

      // Find or create today's log
      const today = new Date().toISOString().slice(0, 10);
      const logsQ = query(
        collection(db, "goalLogs"),
        where("uid", "==", user.uid)
      );
      const logsSnap = await getDocs(logsQ);
      const existing = logsSnap.docs.find(
        (d) => d.data().goalId === goal.id && d.data().date === today
      );

      if (existing) {
        await updateDoc(doc(db, "goalLogs", existing.id), { value });
      } else {
        await addDoc(collection(db, "goalLogs"), {
          uid: user.uid,
          goalId: goal.id,
          date: today,
          value,
          createdAt: serverTimestamp(),
        });
      }

      return `Marked ${goal.data().name} as ${value}.`;
    },
  };
}

// ============================================================
// PARSE REMINDER COMMAND
// ============================================================
function parseReminderCommand(t) {
  const m = t.match(/^remind\s+me\s+(?:to\s+)?(.+?)(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/);
  if (!m) return null;

  const task = m[1].trim();
  const hour = m[2] ? Number(m[2]) : null;
  const minute = m[3] ? Number(m[3]) : 0;
  const ampm = m[4];

  return {
    type: "set_reminder",
    preview: {
      title: "Set reminder",
      task,
      time: hour !== null ? `${hour}:${String(minute).padStart(2, "0")} ${ampm || ""}` : "No time",
    },
    execute: async () => {
      if (!("Notification" in window)) {
        return "Notifications not supported.";
      }

      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      if (hour !== null) {
        // Schedule at specific time
        let h = hour;
        if (ampm === "pm" && h < 12) h += 12;
        if (ampm === "am" && h === 12) h = 0;

        const now = new Date();
        const target = new Date();
        target.setHours(h, minute, 0, 0);
        if (target < now) target.setDate(target.getDate() + 1);

        const delay = target.getTime() - now.getTime();

        setTimeout(() => {
          new Notification("⏰ Reminder", {
            body: task,
            icon: "/icon-192.png",
          });
        }, delay);

        return `Reminder set for ${target.toLocaleTimeString()}.`;
      } else {
        // Immediate
        new Notification("⏰ Reminder", { body: task });
        return `Reminder: ${task}`;
      }
    },
  };
}

// ============================================================
// EXECUTE ACTION
// ============================================================
export async function executeAction(action) {
  if (!action || typeof action.execute !== "function") {
    throw new Error("Invalid action");
  }
  return await action.execute();
}