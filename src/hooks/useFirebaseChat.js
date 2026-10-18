import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, ensureUser } from "../firebase";

export function useFirebaseChat({ maxMessages = 50 } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- LOAD ----------
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const user = await ensureUser();
        const q = query(
          collection(db, "chats"),
          where("uid", "==", user.uid)
        );

        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
          setMessages(list.slice(0, maxMessages));
          setLoading(false);
        });
      } catch (err) {
        console.error("Chat load error:", err);
        setLoading(false);
      }
    })();

    return () => unsub();
  }, [maxMessages]);

  // ---------- SAVE MESSAGE ----------
  const saveMessage = async (role, content) => {
    if (!content) return;
    try {
      const user = await ensureUser();
      await addDoc(collection(db, "chats"), {
        uid: user.uid,
        role, // "user" | "assistant"
        content,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Save message error:", err);
    }
  };

  // ---------- DELETE ALL ----------
  const clearHistory = async () => {
    try {
      const user = await ensureUser();
      for (const m of messages) {
        await deleteDoc(doc(db, "chats", m.id));
      }
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  // ---------- DELETE ONE ----------
  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, "chats", id));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // ---------- HELPERS ----------
  // Returns messages in chronological order for AI context
  const getContext = () => {
    return [...messages]
      .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
      .map((m) => ({ role: m.role, content: m.content }));
  };

  return {
    messages,
    loading,
    saveMessage,
    clearHistory,
    deleteMessage,
    getContext,
  };
}