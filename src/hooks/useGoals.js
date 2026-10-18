import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        setUid(user.uid);

        const q = query(collection(db, "goals"), where("uid", "==", user.uid));
        unsub = onSnapshot(q, (snap) => {
          setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
    return () => unsub();
  }, []);

  const addGoal = async (goal) => {
    if (!uid) return;
    await addDoc(collection(db, "goals"), {
      ...goal,
      uid,
      progress: 0,
      lastReset: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
    });
  };

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db, "goals", id));
  };

  const incrementGoal = async (goal, amt) => {
    const today = new Date().toISOString().slice(0, 10);
    const currentProgress = goal.progress || 0;
    let newProgress = currentProgress + amt;

    // Reset if it's a new day
    const newLastReset = goal.lastReset === today ? goal.lastReset : today;
    if (goal.lastReset !== today) newProgress = amt;

    await updateDoc(doc(db, "goals", goal.id), {
      progress: newProgress,
      lastReset: newLastReset,
    });
  };

  const logProgress = async (id, val) => {
    const today = new Date().toISOString().slice(0, 10);
    await updateDoc(doc(db, "goals", id), { progress: val, lastReset: today });
  };

  const resetGoalToday = async (id) => {
    await updateDoc(doc(db, "goals", id), {
      progress: 0,
      lastReset: new Date().toISOString().slice(0, 10),
    });
  };

  const getTodayValue = (id) => {
    const goal = goals.find((g) => g.id === id);
    const today = new Date().toISOString().slice(0, 10);
    if (goal && goal.lastReset === today) return goal.progress || 0;
    return 0;
  };

  const getProgress = (id) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return 0;
    const val = getTodayValue(id);
    return Math.min(100, Math.round((val / goal.target) * 100));
  };

  return { goals, loading, addGoal, deleteGoal, incrementGoal, logProgress, resetGoalToday, getTodayValue, getProgress };
}