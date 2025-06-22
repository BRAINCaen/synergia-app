// src/App.jsx - VERSION CORRIGÉE
import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import authService from './modules/auth/services/authService.js'
import userService from './services/userService.js'
import useAuthStore from './shared/stores/authStore'
import AppRoutes from './routes'
import './assets/styles/globals.css'

function App() {
  const { setUser, setLoading } = useAuthStore()
  const [fixingUser, setFixingUser] = useState(false)

  useEffect(() => {
    let unsubscribe = null;
    
    const initAuth = async () => {
      try {
        // Écouter les changements d'authentification avec auto-correction
        unsubscribe = authService.onAuthStateChanged(async (user) => {
          if (user) {
            console.log('👤 Utilisateur connecté:', user.email);
            
            // ✅ AUTO-FIX : Vérifier et corriger le document utilisateur
            setFixingUser(true);
            try {
              const wasCreated = await userService.ensureUserDocument(user);
              
              if (wasCreated) {
                console.log('✅ Document utilisateur créé automatiquement');
              }
              
              // Récupérer le profil complet
              const { profile } = await userService.getUserProfile(user.uid, user);
              
              setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                profile: profile || {}
              });
              
            } catch (error) {
              console.error('❌ Erreur auto-correction utilisateur:', error);
              // Même en cas d'erreur, on garde l'utilisateur connecté
              setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                profile: {}
              });
            } finally {
              setFixingUser(false);
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        });

      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUser, setLoading]);

  // Fonction manuelle pour corriger l'utilisateur actuel
  const handleFixUser = async () => {
    if (fixingUser) return;
    
    setFixingUser(true);
    try {
      const result = await authService.fixCurrentUser();
      if (result.success) {
        console.log('✅', result.message);
        // Recharger le profil
        window.location.reload();
      } else {
        console.error('❌', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur correction manuelle:', error);
    } finally {
      setFixingUser(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        {/* Bouton de debug en développement */}
        {import.meta.env.DEV && fixingUser && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            🔧 Correction en cours...
          </div>
        )}
        
        {/* Bouton de correction manuelle en cas de problème */}
        {import.meta.env.DEV && (
          <button
            onClick={handleFixUser}
            disabled={fixingUser}
            className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm shadow-lg z-50 disabled:opacity-50"
            title="Corriger les problèmes utilisateur"
          >
            🛠️ Fix User
          </button>
        )}
        
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
