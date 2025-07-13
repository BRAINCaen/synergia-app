// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE CORRIGÉE - SANS DOUBLE DÉCLARATION
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import AppRouter from './components/routing/AppRouter.jsx';

// ✅ Imports Firebase pour initialisation
import { auth } from './core/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA v3.5
 * Configuration complète et optimisée
 */
function App() {
  const { setUser, setLoading, initializeAuth } = useAuthStore();

  // 🎯 Initialisation Firebase au démarrage
  useEffect(() => {
    console.log('🚀 Initialisation Synergia v3.5...');
    
    // Initialiser l'authentification
    initializeAuth();
    
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Utilisateur connecté:', firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        console.log('👤 Aucun utilisateur connecté');
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup
    return () => {
      console.log('🧹 Nettoyage App.jsx');
      unsubscribe();
    };
  }, [setUser, setLoading, initializeAuth]);

  return (
    <Router>
      <div className="App">
        <AppRouter />
      </div>
    </Router>
  );
}

export default App;
