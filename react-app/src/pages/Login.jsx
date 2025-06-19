// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../core/firebase.js";
import useAuthStore from "../shared/stores/authStore.js";

export default function Login() {
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserIfNotExists(userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      // L'auth store sera mis à jour automatiquement via onAuthStateChanged
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await createUserIfNotExists(res.user);
      // L'auth store sera mis à jour automatiquement
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        status: "active",
        version: "2.0"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <h1 className="text-3xl font-bold">⚡ Synergia</h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-2">
            {isRegister ? "Créer un compte" : "Connexion"}
          </h2>
          <p className="text-gray-500 text-sm">v2.0 - Architecture Modulaire</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <input
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 rounded-lg p-3 mt-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "⏳ Chargement..." : (isRegister ? "Créer le compte" : "Se connecter")}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <button
            className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg p-3 font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            onClick={handleGoogle}
            type="button"
            disabled={loading}
          >
            <span>🔗</span> Connexion avec Google
          </button>

          <div className="mt-6 text-center">
            <button
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              disabled={loading}
            >
              {isRegister ? "Déjà inscrit ? Se connecter" : "Créer un compte"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Synergia v2.0 • Architecture Modulaire • 2025
          </p>
        </div>
      </div>
    </div>
  );
}
