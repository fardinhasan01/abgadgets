// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // ✅ Important

const firebaseConfig = {
  apiKey: "AIzaSyCngkkSssUDBlFV_bTa4F1eXwKZTmytDsk",
  authDomain: "ab-gadgets-prime.firebaseapp.com",
  projectId: "ab-gadgets-prime",
  storageBucket: "ab-gadgets-prime.appspot.com", // ✅ fixed
  messagingSenderId: "474049729314",
  appId: "1:474049729314:web:bb3ff1641c749ac95ccb7b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // ✅ Make sure this exists

export { db, storage, auth }; // ✅ This must include `auth`
