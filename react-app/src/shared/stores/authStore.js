// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE D'URGENCE - VERSION ULTRA-SIMPLIFIÉE
// ==========================================

import { create } from 'zustand';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../../core/firebase.js';

// ==========================================
// 🔧 VERSION D'URGENCE SANS COMPLEXITÉ
// ==========================================

// Provider Google
const googleProvider = new GoogleAuthProvider();

// Store ultra-simplifié
export const useAuthStore = create((set, get) => {
  
  // État minimal
  const initialState = {
    user: null,
    loading: true,
    error: null
  };

  // Fonction de mise à jour utilisateur
  const setUser = (user) => {
    console.log('👤 Mise à jour utilisateur:', user?.email || 'Déconnexion');
    set({ user, loading: false, error: null });
  };

  // Fonction d'erreur
  const setError = (error) => {
    console.error('❌ Erreur auth:', error);
    set({ error: error.message, loading: false });
  };

  // Fonction de chargement
  const setLoading = (loading) => {
    set({ loading });
  };

  // ==========================================
  // 🔐 MÉTHODES D'AUTHENTIFICATION
  // ==========================================

  const methods = {
    
    // Connexion Google
    signInWithGoogle: async () => {
      try {
        setLoading(true);
        console.log('🔍 Tentative connexion Google...');
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log('✅ Connexion Google réussie:', user.email);
        setUser(user);
        return user;
        
      } catch (error) {
        console.error('❌ Erreur connexion Google:', error);
        setError(error);
        throw error;
      }
    },

    // Connexion email
    signInWithEmail: async (email, password) => {
      try {
        setLoading(true);
        console.log('📧 Tentative connexion email:', email);
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        console.log('✅ Connexion email réussie:', user.email);
        setUser(user);
        return user;
        
      } catch (error) {
        console.error('❌ Erreur connexion email:', error);
        setError(error);
        throw error;
      }
    },

    // Inscription
    signUp: async (email, password) => {
      try {
        setLoading(true);
        console.log('📝 Tentative inscription:', email);
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        console.log('✅ Inscription réussie:', user.email);
        setUser(user);
        return user;
        
      } catch (error) {
        console.error('❌ Erreur inscription:', error);
        setError(error);
        throw error;
      }
    },

    // Déconnexion
    signOut: async () => {
      try {
        console.log('👋 Déconnexion...');
        await firebaseSignOut(auth);
        setUser(null);
        console.log('✅ Déconnexion réussie');
        
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        setError(error);
        throw error;
      }
    },

    // Vérifier l'état d'auth
    checkAuthState: () => {
      console.log('🔍 Vérification état authentification...');
      
      // Observer les changements d'état
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('🔔 Auth state changed:', user ? 'Connecté' : 'Déconnecté');
        
        if (user) {
          console.log('✅ Utilisateur connecté:', user.email);
          setUser(user);
        } else {
          console.log('❌ Aucun utilisateur connecté');
          setUser(null);
        }
      }, (error) => {
        console.error('❌ Erreur observer auth:', error);
        setError(error);
      });

      // Stocker la fonction de désabonnement
      set({ unsubscribe });
      
      return unsubscribe;
    },

    // Réinitialiser l'erreur
    clearError: () => {
      set({ error: null });
    }
  };

  // ==========================================
  // 🚀 INITIALISATION AUTO
  // ==========================================
  
  // Démarrer l'observation de l'auth au chargement du store
  setTimeout(() => {
    try {
      methods.checkAuthState();
      console.log('🚀 AuthStore auto-initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation AuthStore:', error);
      set({ error: error.message, loading: false });
    }
  }, 100);

  // Retourner l'état et les méthodes
  return {
    ...initialState,
    ...methods
  };
});

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ AuthStore d\'urgence chargé');
console.log('🔧 Version ultra-simplifiée sans complexité');
console.log('🛡️ Gestion d\'erreurs renforcée');

// Export par défaut pour compatibilité
export default useAuthStore;
