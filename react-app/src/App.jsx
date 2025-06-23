import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase';
import { useAuthStore } from './shared/stores/authStore';

// 🔧 CORRECT : Utiliser le système de routing existant
import AppRoutes from './routes/index';

function App() {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          // Utilisateur connecté
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };
          setUser(userData);
        } else {
          // Utilisateur déconnecté
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur authentification:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setUser, setLoading, setError]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
