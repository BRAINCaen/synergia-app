// ==========================================
// 📁 react-app/src/App.jsx
// APP D'URGENCE - VERSION ULTRA-MINIMALE
// ==========================================

import React, { useState, useEffect } from 'react';

// ==========================================
// 🔧 COMPOSANT ULTRA-SIMPLE SANS DEPENDENCIES
// ==========================================

const EmergencyApp = () => {
  const [status, setStatus] = useState('Chargement...');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚨 App d\'urgence démarrée');
    
    // Test basique Firebase
    const testFirebase = async () => {
      try {
        // Import dynamique pour éviter les erreurs de build
        const { auth } = await import('./core/firebase.js');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        console.log('🔥 Firebase importé avec succès');
        setStatus('Firebase connecté');
        
        // Observer l'auth
        onAuthStateChanged(auth, (user) => {
          console.log('👤 Utilisateur:', user?.email || 'Non connecté');
          setUser(user);
          setStatus(user ? `Connecté: ${user.email}` : 'Non connecté');
        });
        
      } catch (err) {
        console.error('❌ Erreur Firebase:', err);
        setError(err.message);
        setStatus('Erreur Firebase');
      }
    };

    testFirebase();
  }, []);

  // Fonction de connexion Google
  const handleGoogleLogin = async () => {
    try {
      setStatus('Connexion en cours...');
      
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('./core/firebase.js');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Connexion réussie:', result.user.email);
      setUser(result.user);
      setStatus(`Connecté: ${result.user.email}`);
      
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      setError(err.message);
      setStatus('Erreur de connexion');
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('./core/firebase.js');
      
      await signOut(auth);
      setUser(null);
      setStatus('Déconnecté');
      console.log('👋 Déconnexion réussie');
      
    } catch (err) {
      console.error('❌ Erreur déconnexion:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Header d'urgence */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚨 Mode Urgence Synergia
          </h1>
          <p className="text-gray-400 text-lg">
            Application en mode diagnostic minimal
          </p>
        </div>

        {/* Status principal */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {error ? '❌' : user ? '✅' : '🔄'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {error ? 'Erreur Critique' : user ? 'Connexion Réussie' : 'Test en Cours'}
            </h2>
            <p className="text-gray-400 mb-6">
              {error || status}
            </p>

            {/* Actions */}
            <div className="space-y-4">
              {!user ? (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  🔍 Tester Connexion Google
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  👋 Se Déconnecter
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Recharger Page
              </button>
            </div>
          </div>
        </div>

        {/* Informations de debug */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">🔧 Informations Debug</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">React:</span>
              <span className="text-green-400">✅ Fonctionnel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Firebase:</span>
              <span className={error ? "text-red-400" : "text-green-400"}>
                {error ? "❌ Erreur" : "✅ Connecté"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auth:</span>
              <span className={user ? "text-green-400" : "text-yellow-400"}>
                {user ? "✅ Connecté" : "⏳ En attente"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">URL:</span>
              <span className="text-white">{window.location.pathname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Temps:</span>
              <span className="text-white">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Si utilisateur connecté, informations */}
        {user && (
          <div className="mt-6 bg-green-900/20 border border-green-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4">👤 Utilisateur Connecté</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nom:</span>
                <span className="text-white">{user.displayName || 'Non défini'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">UID:</span>
                <span className="text-white text-xs">{user.uid?.substring(0, 20)}...</span>
              </div>
            </div>
          </div>
        )}

        {/* Message de récupération */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            🔧 Cette version d'urgence teste les composants de base.<br/>
            Si tout fonctionne ici, le problème vient des stores complexes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyApp;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('🚨 App d\'urgence chargée');
console.log('🔧 Version ultra-minimale sans stores complexes');
console.log('🛡️ Tests Firebase directs sans intermédiaires');
