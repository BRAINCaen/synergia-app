// src/App.jsx
import React, { useState, useEffect } from "react";
import { auth } from "./core/firebase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Synergia v2.0 - Démarrage...');
    
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-center">
          <p className="text-white text-xl mb-2">⚡ Synergia</p>
          <p className="text-gray-400 text-sm">v2.0 - Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
