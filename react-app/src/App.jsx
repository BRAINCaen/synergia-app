// src/App.jsx - AVEC AUTO-CRÉATION INTÉGRÉE
import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import authService from './modules/auth/services/authService.js'
import useAuthStore from './shared/stores/authStore'
import AppRoutes from './routes'
import './assets/styles/globals.css'

function App() {
  const { setUser, setLoading } = useAuthStore()
  const [autoCreating, setAutoCreating] = useState(false)
  const [creationStatus, setCreationStatus] = useState('')

  useEffect(() => {
    let unsubscribe = null;
    
    const initAuth = async () => {
      try {
        // 👂 ÉCOUTE AVEC AUTO-CRÉATION INTÉGRÉE
        unsubscribe = authService.onAuthStateChanged(async (user) => {
          if (user) {
            console.log('👤 Utilisateur connecté:', user.email);
            
            setAutoCreating(true);
            setCreationStatus('Vérification du profil...');
            
            try {
              // L'auto-création est déjà gérée dans authService.onAuthStateChanged
              // On récupère l'utilisateur avec son profil complet
              
              if (user.profile) {
                setCreationStatus('Profil chargé !');
                
                // 🎉 NOTIFICATION SI NOUVEAU PROFIL
                if (user.profile.metadata?.source === 'auto_creation') {
                  console.log('🎉 Bienvenue ! Votre profil a été créé automatiquement');
                  // Optionnel : afficher une notification de bienvenue
                  showWelcomeNotification(user);
                }
                
                setUser({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  profile: user.profile
                });
              } else {
                // Profil manquant, déclencher création manuelle
                setCreationStatus('Création du profil...');
                const result = await authService.fixCurrentUser();
                
                if (result.success) {
                  setCreationStatus('Profil créé ! Rechargement...');
                  setTimeout(() => window.location.reload(), 1500);
                } else {
                  setCreationStatus('Erreur création profil');
                  console.error('❌ Échec création profil:', result.error);
                }
              }
              
            } catch (error) {
              console.error('❌ Erreur traitement utilisateur:', error);
              setCreationStatus('Erreur de traitement');
              
              // Fallback : utilisateur sans profil complet
              setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                profile: {}
              });
            } finally {
              setAutoCreating(false);
              setTimeout(() => setCreationStatus(''), 3000);
            }
          } else {
            setUser(null)
            setAutoCreating(false);
            setCreationStatus('');
          }
          setLoading(false)
        });

      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        setLoading(false);
        setAutoCreating(false);
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

  // 🎉 NOTIFICATION DE BIENVENUE
  const showWelcomeNotification = (user) => {
    // Créer une notification de bienvenue stylée
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-500 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🎉</div>
        <div>
          <div class="font-bold">Bienvenue dans Synergia !</div>
          <div class="text-sm opacity-90">Votre profil a été créé automatiquement</div>
          <div class="text-xs opacity-75">+50 XP • Badge "Bienvenue" débloqué</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animation de sortie
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  };

  return (
    <BrowserRouter>
      <div className="App">
        {/* 🔄 INDICATEUR AUTO-CRÉATION */}
        {autoCreating && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="font-medium">{creationStatus}</span>
          </div>
        )}
        
        {/* 🛠️ BOUTON DEBUG (seulement en développement) */}
        {import.meta.env.DEV && (
          <button
            onClick={async () => {
              setAutoCreating(true);
              setCreationStatus('Correction manuelle...');
              const result = await authService.fixCurrentUser();
              setCreationStatus(result.success ? 'Corrigé !' : 'Erreur');
              setAutoCreating(false);
              if (result.success) {
                setTimeout(() => window.location.reload(), 1000);
              }
            }}
            disabled={autoCreating}
            className="fixed bottom-4 left-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm shadow-lg z-50 disabled:opacity-50 transition-all"
            title="Forcer la création/correction du profil utilisateur"
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
