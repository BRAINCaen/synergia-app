// src/App.jsx - Version Refactorisée avec Architecture Modulaire
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase.js';
import useAuthStore from './shared/stores/authStore.js';
import useNotificationStore from './shared/stores/notificationStore.js';
import AppRoutes from './routes/index.js';
import ToastContainer from './shared/components/ui/ToastContainer.jsx';
import './index.css';

function App() {
  const { setUser, setLoading } = useAuthStore();
  const { success, error } = useNotificationStore();

  useEffect(() => {
    // Initialiser le loading
    setLoading(true);

    // Écouter les changements d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Utilisateur connecté
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous
          };
          
          setUser(userData);
          
          // Notification de bienvenue (seulement pour nouvelles sessions)
          const isNewSession = !sessionStorage.getItem('synergia-session');
          if (isNewSession) {
            success(`Bienvenue ${userData.displayName || userData.email} !`);
            sessionStorage.setItem('synergia-session', 'true');
          }
          
        } else {
          // Utilisateur déconnecté
          setUser(null);
          sessionStorage.removeItem('synergia-session');
        }
      } catch (err) {
        console.error('Erreur auth state change:', err);
        error('Erreur de connexion');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Enregistrer le service worker pour PWA
    registerServiceWorker();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [setUser, setLoading, success, error]);

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-900">
        {/* Routes principales */}
        <AppRoutes />
        
        {/* Container de notifications toast */}
        <ToastContainer />
        
        {/* Bouton d'installation PWA */}
        <PWAInstallButton />
      </div>
    </BrowserRouter>
  );
}

// Composant pour le bouton d'installation PWA
const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstall, setShowInstall] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA installée avec succès');
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Installation PWA: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 z-50 flex items-center space-x-2"
    >
      <span>📱</span>
      <span>Installer l'app</span>
    </button>
  );
};

// Fonction pour enregistrer le service worker
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré:', registration.scope);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nouvelle version disponible');
                  // Vous pouvez ajouter une notification ici
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('❌ Échec enregistrement Service Worker:', error);
        });
    });
  }
};

export default App;
