import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMuXEiOR9evPJSFtpO5SHTtrNr-YJatxA",
  authDomain: "lokesh-per.firebaseapp.com",
  projectId: "lokesh-per",
  storageBucket: "lokesh-per.firebasestorage.app",
  messagingSenderId: "94758828136",
  appId: "1:94758828136:web:0ce5be5458cdf696d963dd",
  measurementId: "G-GW0D4MZ4B4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function ensureUser() {
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}