import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClTUP24o-g9kpC4FhOF6tdgawujGcRpc4",
  authDomain: "tags-91b32.firebaseapp.com",
  projectId: "tags-91b32",
  storageBucket: "tags-91b32.firebasestorage.app",
  messagingSenderId: "957084761912",
  appId: "1:957084761912:web:3500a46f290e9983144bcd",
  measurementId: "G-6P6F9N86TJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
const analytics = getAnalytics(app);
export const storage = getStorage(app);