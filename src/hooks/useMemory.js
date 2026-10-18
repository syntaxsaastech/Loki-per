// src/hooks/useMemory.js
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

export function useMemory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        setUid(user.uid);

        const q = query(collection(db, "memories"), where("uid", "==", user.uid));
        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Sort newest first
          list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setMemories(list);
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
    return () => unsub();
  }, []);

  const saveMemory = async (key, value, category) => {
    if (!uid) return;
    await addDoc(collection(db, "memories"), {
      uid,
      key,
      value,
      category,
      createdAt: serverTimestamp(),
    });
  };

  const deleteMemory = async (id) => {
    await deleteDoc(doc(db, "memories", id));
  };

  // 👇 NEW: Search function for the "What did I decide?" feature
  const searchMemories = (searchTerm) => {
    if (!searchTerm.trim()) return memories;
    const lower = searchTerm.toLowerCase();
    return memories.filter(
      (m) =>
        m.key.toLowerCase().includes(lower) ||
        m.value.toLowerCase().includes(lower) ||
        m.category.toLowerCase().includes(lower)
    );
  };

  return { memories, loading, saveMemory, deleteMemory, searchMemories };
}