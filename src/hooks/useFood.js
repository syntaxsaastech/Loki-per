import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useFood() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uid, setUid] = useState(null);
  
  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        setUid(user.uid);

        const q = query(collection(db, "meals"), where("uid", "==", user.uid));
        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setMeals(list);
          setLoading(false);
        });
      } catch (err) {
        console.error("Meals load error:", err);
        setError("Could not load meals.");
        setLoading(false);
      }
    })();
    return () => unsub();
  }, []);

  const saveMeal = async (mealName, mealTime, items, totals) => {
    if (!uid) throw new Error("Not signed in yet.");
    if (!mealName.trim()) throw new Error("Meal name required.");
    if (items.length === 0) throw new Error("Add at least one item.");

    try {
      await addDoc(collection(db, "meals"), {
        uid,
        name: mealName.trim(),
        time: mealTime,
        date: today,
        items,
        totals: {
          calories: +totals.calories.toFixed(1),
          protein: +totals.protein.toFixed(1),
          carbs: +totals.carbs.toFixed(1),
          fat: +totals.fat.toFixed(1),
          sodium: +totals.sodium.toFixed(1),
          potassium: +totals.potassium.toFixed(1),
          cholesterol: +totals.cholesterol.toFixed(1),
          fiber: +totals.fiber.toFixed(1),
          sugar: +totals.sugar.toFixed(1),
        },
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Save meal error:", err);
      throw new Error(err.message);
    }
  };

  const deleteMeal = async (id) => {
    try {
      await deleteDoc(doc(db, "meals", id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Calculate Totals for a specific date
  const getDailyTotals = (dateString) => {
    const dailyMeals = meals.filter((m) => m.date === dateString);
    return dailyMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.totals?.calories || 0),
        protein: acc.protein + (m.totals?.protein || 0),
        carbs: acc.carbs + (m.totals?.carbs || 0),
        fat: acc.fat + (m.totals?.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return {
    meals,
    todayMeals: meals.filter((m) => m.date === today),
    yesterdayMeals: meals.filter((m) => m.date === yesterday),
    todayTotals: getDailyTotals(today),
    yesterdayTotals: getDailyTotals(yesterday),
    loading,
    error,
    uid,
    today,
    yesterday,
    saveMeal,
    deleteMeal,
  };
}