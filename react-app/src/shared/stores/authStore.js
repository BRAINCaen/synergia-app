// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE ULTRA-SIMPLIFIÉ - SANS FIREBASE COMPLEXE
// ==========================================

import { create } from 'zustand';

/**
 * 🔐 STORE D'AUTHENTIFICATION ULTRA-SIMPLE
 * Version qui marche sans Firebase complexe
 */
export const useAuthStore = create((set, get) => ({
  // État initial
  user: null,
  loading: false,
  error: null,

  // ==========================================
  // 🚀 CONNEXION SIMULÉE (POUR TEST)
  // ==========================================
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔐 Simulation connexion Google...');
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créer un utilisateur simulé
      const mockUser = {
        uid: 'mock-user-' + Date.now(),
        email: 'test@synergia.com',
        displayName: 'Utilisateur Test',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true
      };
      
      set({ 
        user: mockUser, 
        loading: false, 
        error: null 
      });
      
      console.log('✅ Connexion simulée réussie:', mockUser.email);
      return mockUser;
      
    } catch (error) {
      console.error('❌ Erreur connexion simulée:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // ==========================================
  // 🚪 DÉCONNEXION SIMULÉE
  // ==========================================
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🚪 Simulation déconnexion...');
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        user: null, 
        loading: false, 
        error: null 
      });
      
      console.log('✅ Déconnexion simulée réussie');
      
    } catch (error) {
      console.error('❌ Erreur déconnexion simulée:', error);
      set({ 
        error: error.message, 
        loading: false 
      });
      throw error;
    }
  },

  // ==========================================
  // 🔄 INITIALISATION (VIDE POUR ÉVITER LES ERREURS)
  // ==========================================
  initializeAuth: () => {
    console.log('🔄 Auth initialisé (mode simulation)');
    return () => {}; // Fonction de nettoyage vide
  },

  // ==========================================
  // 🧹 ACTIONS UTILITAIRES
  // ==========================================
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  // ==========================================
  // 🔧 MÉTHODES DE TEST
  // ==========================================
  loginAsAdmin: () => {
    const adminUser = {
      uid: 'admin-' + Date.now(),
      email: 'admin@synergia.com',
      displayName: 'Admin Synergia',
      photoURL: 'https://via.placeholder.com/150',
      emailVerified: true,
      role: 'admin',
      isAdmin: true
    };
    
    set({ user: adminUser, loading: false, error: null });
    console.log('👑 Connexion admin simulée');
    return adminUser;
  },

  loginAsUser: () => {
    const normalUser = {
      uid: 'user-' + Date.now(),
      email: 'user@synergia.com',
      displayName: 'Utilisateur Normal',
      photoURL: 'https://via.placeholder.com/150',
      emailVerified: true,
      role: 'user'
    };
    
    set({ user: normalUser, loading: false, error: null });
    console.log('👤 Connexion utilisateur simulée');
    return normalUser;
  }
}));

// ==========================================
// 🚀 FONCTIONS UTILITAIRES GLOBALES
// ==========================================

// Fonction pour tester rapidement
if (typeof window !== 'undefined') {
  window.testLogin = () => {
    const store = useAuthStore.getState();
    store.signInWithGoogle();
  };
  
  window.testAdmin = () => {
    const store = useAuthStore.getState();
    store.loginAsAdmin();
  };
  
  window.testLogout = () => {
    const store = useAuthStore.getState();
    store.signOut();
  };
  
  console.log('🔧 Fonctions test disponibles: testLogin(), testAdmin(), testLogout()');
}

console.log('🔐 AuthStore ultra-simplifié chargé');
console.log('✅ Prêt pour les tests sans Firebase');
