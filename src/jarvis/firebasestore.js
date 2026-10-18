// src/jarvis/firebaseStore.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, ensureUser } from "../firebase";

// Save a memory to Firebase
export async function saveMemoryToCloud(key, value) {
  try {
    const user = await ensureUser();
    const memRef = doc(db, "jarvis_memory", user.uid); // 1 document per user
    
    // Get existing memories
    const docSnap = await getDoc(memRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};

    // Update with new memory
    await setDoc(memRef, {
      ...existingData,
      [key.toLowerCase()]: value,
      lastUpdated: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Error saving memory to cloud:", error);
    return false;
  }
}

// Load all memories from Firebase
export async function getMemoriesFromCloud() {
  try {
    const user = await ensureUser();
    const memRef = doc(db, "jarvis_memory", user.uid);
    const docSnap = await getDoc(memRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {};
  } catch (error) {
    console.error("Error loading memory from cloud:", error);
    return {};
  }
}