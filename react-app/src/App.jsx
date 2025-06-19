// src/App.jsx
import React, { useState, useEffect } from "react";
import Login from "./modules/auth/components/Login.jsx";
import Dashboard from "./modules/dashboard/components/Dashboard.jsx";
import authService from "./modules/auth/services/authService.js";
import { APP_CONFIG } from "./core/config.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`🚀 Synergia ${APP_CONFIG.version} - ${APP_CONFIG.description}`);
    console.log('🔧 Mode:', APP_CONFIG.isDevelopment ? 'Développement' : 'Production');
    console.log('✨ Fonctionnalités actives:', Object.entries(APP_CONFIG.features)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(', '));

    // Observer les changements d'état d'authentification
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white text-lg">Chargement de Synergia...</p>
        <p className="text-gray-400 text-sm mt-2">v{APP_CONFIG.version}</p>
      </div>
    );
  }

  // Affichage conditionnel basé sur l'état d'authentification
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
