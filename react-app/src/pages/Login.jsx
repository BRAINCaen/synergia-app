import React, { useState } from "react";
import { auth, db, provider } from "../core/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserIfNotExists(userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      await createUserIfNotExists(res.user);
      onLogin(res.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const createUserIfNotExists = async (user) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        role: "member",
        level: 1,
        xp: 0,
        joinedAt: new Date(),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">{isRegister ? "Créer un compte" : "Connexion"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="p-2 rounded bg-gray-700 text-white"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Adresse email"
            required
          />
          <input
            className="p-2 rounded bg-gray-700 text-white"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 rounded p-2 mt-2 font-bold"
            type="submit"
          >
            {isRegister ? "Créer le compte" : "Se connecter"}
          </button>
        </form>
        <button
          className="w-full mt-4 bg-red-600 hover:bg-red-700 rounded p-2 font-bold flex items-center justify-center gap-2"
          onClick={handleGoogle}
          type="button"
        >
          <span>🔗</span> Connexion avec Google
        </button>
        <div className="mt-4 text-center">
          <button
            className="underline text-blue-300"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}
