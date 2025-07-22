// ==========================================
// 📁 react-app/src/contexts/SimpleAuthContext.jsx
// CONTEXT D'AUTHENTIFICATION SIMPLE SANS ZUSTAND
// ==========================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Import sécurisé de Firebase
let auth = null;
try {
  const firebaseModule = await import('../core/firebase.js');
  auth = firebaseModule.auth;
  console.log('✅ [SIMPLE-AUTH] Firebase auth importé');
} catch (error) {
  console.error('❌ [SIMPLE-AUTH] Erreur import Firebase:', error);
}

// Créer le provider Google
const googleProvider = new GoogleAuthProvider();

// Créer le contexte
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => ({ success: false, error: 'Non implémenté' }),
  signOut: async () => ({ success: false, error: 'Non implémenté' }),
  initialized: false
});

/**
 * 🔐 PROVIDER D'AUTHENTIFICATION SIMPLE
 */
export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  console.log('🔐 [SIMPLE-AUTH] Provider initialisé');

  // Initialiser l'authentification
  useEffect(() => {
    if (!auth) {
      console.error('❌ [SIMPLE-AUTH] Firebase auth non disponible');
      setLoading(false);
      setInitialized(true);
      return;
    }

    console.log('🔄 [SIMPLE-AUTH] Initialisation de l\'authentification...');

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔔 [SIMPLE-AUTH] Auth state changed:', firebaseUser ? 'Connecté' : 'Déconnecté');
      
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ [SIMPLE-AUTH] Utilisateur connecté:', userData.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('ℹ️ [SIMPLE-AUTH] Aucun utilisateur connecté');
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, []);

  /**
   * 🚀 CONNEXION AVEC GOOGLE
   */
  const signInWithGoogle = async () => {
    if (!auth) {
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      setLoading(true);
      console.log('🔐 [SIMPLE-AUTH] Tentative de connexion Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      const userData = result.user;
      
      console.log('✅ [SIMPLE-AUTH] Connexion Google réussie:', userData.email);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [SIMPLE-AUTH] Erreur connexion Google:', error);
      
      let errorMessage = 'Erreur de connexion';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion annulée par l\'utilisateur';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloquée par le navigateur';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * 🚪 DÉCONNEXION
   */
  const signOut = async () => {
    if (!auth) {
      return { success: false, error: 'Firebase non disponible' };
    }

    try {
      setLoading(true);
      console.log('🚪 [SIMPLE-AUTH] Déconnexion...');
      
      await firebaseSignOut(auth);
      
      console.log('✅ [SIMPLE-AUTH] Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ [SIMPLE-AUTH] Erreur déconnexion:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    isAuthenticated,
    initialized,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 🪝 HOOK POUR UTILISER L'AUTHENTIFICATION
 */
export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useSimpleAuth doit être utilisé dans SimpleAuthProvider');
  }
  
  return context;
};

/**
 * 🛡️ HOC POUR PROTÉGER LES ROUTES
 */
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated } = useSimpleAuth();
    
    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f23',
          color: 'white'
        }}>
          🔄 Vérification de l'authentification...
        </div>
      );
    }
    
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Export par défaut
export default SimpleAuthProvider;

// Logs de confirmation
console.log('🔐 SimpleAuth Context créé sans Zustand');
console.log('✅ Compatible avec React 18 et production');
