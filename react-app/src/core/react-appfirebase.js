// src/core/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD7uBuAQaOhZ02owkZEuMKC5Vji6PrB2f8",
  authDomain: "synergia-app-f27e7.firebaseapp.com",
  projectId: "synergia-app-f27e7",
  storageBucket: "synergia-app-f27e7.appspot.com",
  messagingSenderId: "201912738922",
  appId: "1:201912738922:web:2fcc1e49293bb632899613",
  measurementId: "G-EGJ79SCMWX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

let analytics = null;
isAnalyticsSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export { app, auth, db, storage, analytics, provider };
