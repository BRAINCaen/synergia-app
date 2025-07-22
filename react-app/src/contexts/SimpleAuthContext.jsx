// ==========================================
// 📁 react-app/src/contexts/SimpleAuthContext.jsx
// CONTEXT D'AUTHENTIFICATION SIMPLE SANS BLOCAGE
// ==========================================

import React, { createContext, useContext, useState, useEffect } from 'react';

console.log('🔐 [SIMPLE-AUTH] Context en cours de chargement...');

// Variables globales pour Firebase
let auth = null;
let GoogleAuthProvider = null;
let signInWithPopup = null;
let signOut = null;
let onAuthStateChanged = null;

// Créer le contexte
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => ({ success: false, error: 'Non initialisé' }),
  signOut: async () => ({ success: false, error: 'Non initialisé' }),
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
  const [firebaseReady, setFirebaseReady] = useState(false);

  console.log('🔐 [SIMPLE-AUTH] Provider initialisé');

  // Initialiser Firebase de manière asynchrone
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🔄 [SIMPLE-AUTH] Chargement Firebase...');
        
        // Import Firebase auth
        const authModule = await import('firebase/auth');
        signInWithPopup = authModule.signInWithPopup;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;
        GoogleAuthProvider = authModule.GoogleAuthProvider;
        
        // Import Firebase config
        const firebaseModule = await import('../core/firebase.js');
        auth = firebaseModule.auth;
        
        console.log('✅ [SIMPLE-AUTH] Firebase chargé avec succès');
        setFirebaseReady(true);
        
      } catch (error) {
        console.error('❌ [SIMPLE-AUTH] Erreur chargement Firebase:', error);
        setLoading(false);
        setInitialized(true);
      }
    };
    
    initializeFirebase();
  }, []);

  // Initialiser l'authentification une fois Firebase prêt
  useEffect(() => {
    if (!firebaseReady || !auth || !onAuthStateChanged) {
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
  }, [firebaseReady]);

  /**
   * 🚀 CONNEXION AVEC GOOGLE
   */
  const signInWithGoogle = async () => {
    if (!auth || !signInWithPopup || !GoogleAuthProvider) {
      return { success: false, error: 'Firebase non initialisé' };
    }

    try {
      setLoading(true);
      console.log('🔐 [SIMPLE-AUTH] Tentative de connexion Google...');
      
      const googleProvider = new GoogleAuthProvider();
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
  const signOutUser = async () => {
    if (!auth || !signOut) {
      return { success: false, error: 'Firebase non initialisé' };
    }

    try {
      setLoading(true);
      console.log('🚪 [SIMPLE-AUTH] Déconnexion...');
      
      await signOut(auth);
      
      console.log('✅ [SIMPLE-AUTH] Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ [SIMPLE-AUTH] Erreur déconnexion:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Timeout de sécurité - après 10 secondes, débloquer l'interface
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!initialized) {
        console.warn('⚠️ [SIMPLE-AUTH] Timeout atteint, déblocage forcé');
        setLoading(false);
        setInitialized(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [initialized]);

  // Valeur du contexte
  const value = {
    user,
    loading,
    isAuthenticated,
    initialized,
    firebaseReady,
    signInWithGoogle,
    signOut: signOutUser
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
console.log('🔐 SimpleAuth Context créé avec imports asynchrones');
console.log('✅ Compatible avec React 18 et production');
console.log('⏰ Timeout de sécurité : 10 secondes');
