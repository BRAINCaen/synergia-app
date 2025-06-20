// src/shared/stores/authStore.js
import { create } from 'zustand';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../core/firebase';

export const useAuthStore = create((set, get) => ({
  // État d'authentification
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,

  // Actions d'authentification
  
  // Connexion avec email/mot de passe
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      set({ 
        user,
        isLoading: false,
        error: null 
      });
      
      console.log('✅ Connexion réussie:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      let errorMessage = 'Erreur de connexion';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion réseau';
          break;
        default:
          errorMessage = error.message || 'Erreur inconnue';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      throw error;
    }
  },

  // Inscription avec email/mot de passe
  register: async (email, password, displayName = null) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mettre à jour le profil avec le nom d'affichage si fourni
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      set({ 
        user: { ...user, displayName },
        isLoading: false,
        error: null 
      });
      
      console.log('✅ Inscription réussie:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      
      let errorMessage = 'Erreur d\'inscription';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'L\'inscription par email est désactivée';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion réseau';
          break;
        default:
          errorMessage = error.message || 'Erreur inconnue';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      throw error;
    }
  },

  // Connexion avec Google
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      set({ 
        user,
        isLoading: false,
        error: null 
      });
      
      console.log('✅ Connexion Google réussie:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      
      let errorMessage = 'Erreur de connexion Google';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Connexion annulée par l\'utilisateur';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bloquée par le navigateur';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Demande de connexion annulée';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Un compte existe déjà avec un autre mode de connexion';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion réseau';
          break;
        default:
          errorMessage = error.message || 'Erreur inconnue';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await signOut(auth);
      
      set({ 
        user: null,
        isLoading: false,
        error: null 
      });
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      
      set({ 
        isLoading: false, 
        error: 'Erreur lors de la déconnexion' 
      });
      
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  updateUserProfile: async (updates) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      set({ isLoading: true, error: null });

      await updateProfile(currentUser, updates);
      
      // Mettre à jour l'état local
      const updatedUser = { ...currentUser, ...updates };
      set({ 
        user: updatedUser,
        isLoading: false,
        error: null 
      });

      console.log('✅ Profil mis à jour');
      return updatedUser;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      
      set({ 
        isLoading: false, 
        error: 'Erreur lors de la mise à jour du profil' 
      });
      
      throw error;
    }
  },

  // Réinitialiser les erreurs
  clearError: () => set({ error: null }),

  // Définir l'utilisateur (utilisé par l'écoute auth)
  setUser: (user) => set({ 
    user, 
    isLoading: false,
    isInitialized: true 
  }),

  // Définir l'état de chargement
  setLoading: (isLoading) => set({ isLoading }),

  // Initialiser l'écoute d'authentification
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ 
        user,
        isLoading: false,
        isInitialized: true,
        error: null
      });
      
      if (user) {
        console.log('👤 Utilisateur connecté:', user.email);
      } else {
        console.log('👤 Utilisateur déconnecté');
      }
    }, (error) => {
      console.error('❌ Erreur écoute auth:', error);
      set({ 
        user: null,
        isLoading: false,
        isInitialized: true,
        error: 'Erreur d\'authentification'
      });
    });

    return unsubscribe;
  },

  // Reset complet du store
  resetAuthStore: () => set({
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false
  }),

  // Getters/sélecteurs
  getters: {
    isAuthenticated: () => !!get().user,
    isEmailVerified: () => get().user?.emailVerified || false,
    getUserDisplayName: () => {
      const user = get().user;
      return user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';
    },
    getUserInitials: () => {
      const user = get().user;
      if (user?.displayName) {
        return user.displayName
          .split(' ')
          .map(name => name[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return user?.email?.[0]?.toUpperCase() || 'U';
    }
  }
}));

// Hooks sélecteurs pour optimiser les re-renders
export const useUser = () => useAuthStore(state => state.user);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useIsAuthenticated = () => useAuthStore(state => !!state.user);

// Hook pour les getters
export const useAuthGetters = () => useAuthStore(state => state.getters);

// Hook d'initialisation à utiliser dans App.jsx
export const useAuthInitialization = () => {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const isInitialized = useAuthStore(state => state.isInitialized);
  
  return { initializeAuth, isInitialized };
};
