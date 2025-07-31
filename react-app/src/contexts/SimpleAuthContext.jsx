// ==========================================
// 📁 react-app/src/contexts/SimpleAuthContext.jsx
// VERSION AVEC TIMEOUT DE SÉCURITÉ POUR ÉVITER BLOCAGE
// ==========================================

import React, { createContext, useContext, useState, useEffect } from 'react';

console.log('🔐 [AUTH] SimpleAuth Context - Version avec timeout de sécurité');

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
 * 🔐 PROVIDER D'AUTHENTIFICATION AVEC TIMEOUT DE SÉCURITÉ
 */
export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  console.log('🔐 [AUTH] Provider initialisé');

  // ==========================================
  // ⏰ TIMEOUT DE SÉCURITÉ CRITIQUE
  // ==========================================
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ [AUTH] Timeout de sécurité atteint - Déblocage forcé');
      setLoading(false);
      setInitialized(true);
      setError('Initialisation Firebase en timeout - Mode dégradé activé');
    }, 5000); // 5 secondes maximum

    return () => clearTimeout(safetyTimeout);
  }, []);

  // ==========================================
  // 🔄 INITIALISATION FIREBASE AVEC TIMEOUT
  // ==========================================
  useEffect(() => {
    let initializationAborted = false;

    const initializeFirebase = async () => {
      try {
        console.log('🔄 [AUTH] Chargement Firebase...');
        
        // Timeout pour l'initialisation Firebase
        const firebaseTimeout = setTimeout(() => {
          if (!initializationAborted) {
            console.warn('⚠️ [AUTH] Firebase timeout - Passage en mode dégradé');
            setFirebaseReady(false);
            setLoading(false);
            setInitialized(true);
            setError('Firebase non disponible - Mode dégradé');
          }
        }, 3000);
        
        // Import Firebase auth avec timeout
        const authModule = await Promise.race([
          import('firebase/auth'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout import auth')), 2000))
        ]);
        
        signInWithPopup = authModule.signInWithPopup;
        signOut = authModule.signOut;
        onAuthStateChanged = authModule.onAuthStateChanged;
        GoogleAuthProvider = authModule.GoogleAuthProvider;
        
        // Import Firebase config avec timeout
        const firebaseModule = await Promise.race([
          import('../core/firebase.js'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout import firebase')), 2000))
        ]);
        
        auth = firebaseModule.auth;
        
        clearTimeout(firebaseTimeout);
        
        if (!initializationAborted) {
          console.log('✅ [AUTH] Firebase chargé avec succès');
          setFirebaseReady(true);
          setError(null);
        }
        
      } catch (error) {
        if (!initializationAborted) {
          console.error('❌ [AUTH] Erreur chargement Firebase:', error);
          setFirebaseReady(false);
          setLoading(false);
          setInitialized(true);
          setError(`Erreur Firebase: ${error.message}`);
        }
      }
    };
    
    initializeFirebase();
    
    return () => {
      initializationAborted = true;
    };
  }, []);

  // ==========================================
  // 🔐 INITIALISATION AUTH AVEC TIMEOUT
  // ==========================================
  useEffect(() => {
    if (!firebaseReady || !auth || !onAuthStateChanged) {
      return;
    }

    console.log('🔄 [AUTH] Initialisation de l\'authentification...');

    let authAborted = false;

    // Timeout pour l'auth
    const authTimeout = setTimeout(() => {
      if (!authAborted) {
        console.warn('⚠️ [AUTH] Auth timeout - Déblocage forcé');
        setLoading(false);
        setInitialized(true);
        setIsAuthenticated(false);
        setUser(null);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (authAborted) return;
      
      console.log('🔔 [AUTH] Auth state changed:', firebaseUser ? '✅ Connecté' : '❌ Déconnecté');
      
      clearTimeout(authTimeout);
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      setInitialized(true);
      setError(null);
    });

    return () => {
      authAborted = true;
      clearTimeout(authTimeout);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [firebaseReady]);

  // ==========================================
  // 🔑 FONCTIONS D'AUTHENTIFICATION
  // ==========================================
  const signInWithGoogle = async () => {
    if (!auth || !GoogleAuthProvider || !signInWithPopup) {
      return { 
        success: false, 
        error: 'Firebase non initialisé - Mode dégradé actif' 
      };
    }

    try {
      console.log('🔄 [AUTH] Tentative de connexion Google...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ [AUTH] Connexion Google réussie');
      return { 
        success: true, 
        user: result.user 
      };
    } catch (error) {
      console.error('❌ [AUTH] Erreur connexion Google:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  const signOutUser = async () => {
    if (!auth || !signOut) {
      return { 
        success: false, 
        error: 'Firebase non initialisé' 
      };
    }

    try {
      console.log('🔄 [AUTH] Déconnexion...');
      await signOut(auth);
      console.log('✅ [AUTH] Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Erreur déconnexion:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // ==========================================
  // 📤 VALEUR DU CONTEXTE
  // ==========================================
  const value = {
    user,
    loading,
    isAuthenticated,
    initialized,
    firebaseReady,
    error,
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
 * 🛡️ HOC POUR PROTÉGER LES ROUTES AVEC TIMEOUT
 */
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { user, loading, isAuthenticated, error } = useSimpleAuth();
    
    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f23',
          color: 'white',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderTop: '3px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          <p>🔄 Vérification de l'authentification...</p>
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '10px' }}>
              ⚠️ {error}
            </p>
          )}
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

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('🔐 SimpleAuth Context avec timeout de sécurité créé');
console.log('✅ Timeout global: 5 secondes maximum');
console.log('⏰ Timeout Firebase: 3 secondes maximum');
console.log('🛡️ Mode dégradé: Activé en cas de problème');
console.log('🚀 Build: Compatible avec Netlify et stable');
