import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAKM4nD1SQe5e5NbbXrfbXrFq6BomvqmPk",
  authDomain:        "pplataformas.firebaseapp.com",
  projectId:         "pplataformas",
  storageBucket:     "pplataformas.firebasestorage.app",
  messagingSenderId: "542935485527",
  appId:             "1:542935485527:web:441d9bd35b2f0617d36712",
  measurementId:     "G-TQJN65BZ1D",
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
