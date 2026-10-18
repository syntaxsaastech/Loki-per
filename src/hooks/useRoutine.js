// src/hooks/useRoutine.js
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useRoutine() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const [today, setToday] = useState(getTodayKey());

  // Daily Stats (Water, Screen Time, Sleep)
  const [dailyStats, setDailyStats] = useState({
    water: 0,
    screenTime: 0,
    bedtime: "22:00",
    wakeup: "06:00",
    breakTimer: 0
  });
  const [statsId, setStatsId] = useState(null);

  // Auto-update today at midnight
  useEffect(() => {
    const timer = setInterval(() => setToday(getTodayKey()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. Load Habits
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        setUid(user.uid);
        
        const q = query(collection(db, "routines"), where("uid", "==", user.uid));
        unsub = onSnapshot(q, (snapshot) => {
          setRoutines(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
      } catch (err) {
        console.error("Auth error:", err);
      }
    })();
    return () => unsub();
  }, []);

  // 2. Load/Save Daily Stats
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "dailyStats"), 
      where("uid", "==", uid), 
      where("date", "==", today)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setStatsId(snapshot.docs[0].id);
        setDailyStats({
          water: data.water || 0,
          screenTime: data.screenTime || 0,
          bedtime: data.bedtime || "22:00",
          wakeup: data.wakeup || "06:00",
          breakTimer: data.breakTimer || 0
        });
      } else {
        setStatsId(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [uid, today]);

  // 3. Actions
  const addRoutine = async (title, slot, category, icon, color) => {
    if (!title.trim() || !uid) return;
    await addDoc(collection(db, "routines"), {
      uid, title: title.trim(), slot, category, icon, color,
      done: false, doneDate: null, createdAt: serverTimestamp(),
    });
  };

  const toggleDone = async (routine) => {
    const isDone = !routine.done || routine.doneDate !== today;
    await updateDoc(doc(db, "routines", routine.id), {
      done: isDone,
      doneDate: isDone ? today : null,
    });
  };

  const deleteRoutine = async (id) => {
    await deleteDoc(doc(db, "routines", id));
  };

  const updateDailyStats = async (newStats) => {
    if (!uid) return;
    setDailyStats(newStats);

    if (statsId) {
      await updateDoc(doc(db, "dailyStats", statsId), newStats);
    } else {
      const docRef = await addDoc(collection(db, "dailyStats"), {
        uid, date: today, ...newStats, createdAt: serverTimestamp(),
      });
      setStatsId(docRef.id);
    }
  };

  return {
    routines,
    dailyStats,
    loading,
    today,
    addRoutine,
    toggleDone,
    deleteRoutine,
    updateDailyStats
  };
}