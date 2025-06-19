import React from "react";
import { auth } from "../core/firebase";

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <img
          src={user.photoURL || 'https://api.dicebear.com/7.x/personas/svg?seed=' + user.email}
          alt="avatar"
          className="mx-auto mb-4 w-24 h-24 rounded-full shadow-lg"
        />
        <h1 className="text-3xl font-bold mb-2">{user.displayName || user.email}</h1>
        <p className="mb-4">Bienvenue sur le dashboard Synergia 🎉</p>
        <button
          className="bg-pink-600 hover:bg-pink-700 rounded p-2 px-8 font-bold"
          onClick={() => { auth.signOut(); onLogout(); }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
