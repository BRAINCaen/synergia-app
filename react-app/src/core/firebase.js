// ==========================================
// 📁 react-app/src/core/firebase.js
// Configuration Firebase TEMPORAIRE - Mode OFFLINE
// ==========================================

console.log('🚨 FIREBASE DÉSACTIVÉ TEMPORAIREMENT - MODE OFFLINE');
console.log('⚠️ Utilisation de données simulées en attendant nouveau projet Firebase');

// ⭐ SIMULATION COMPLÈTE - PAS DE FIREBASE DU TOUT
export const authService = {
  signInWithGoogle: async () => {
    console.log('🔐 Simulation connexion Google...');
    
    // Simuler un délai de connexion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      user: {
        uid: 'mock-user-123',
        email: 'alan.boehme61@gmail.com',
        displayName: 'Alan Boehme',
        photoURL: null,
        emailVerified: true
      }
    };
    
    console.log('✅ Connexion simulée réussie');
    return mockUser;
  },

  signOut: async () => {
    console.log('🚪 Déconnexion simulée...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Déconnexion simulée réussie');
  },

  onAuthStateChanged: (callback) => {
    console.log('👀 Simulation écoute auth changes...');
    
    // Simuler un utilisateur connecté après 1 seconde
    setTimeout(() => {
      const mockUser = {
        uid: 'mock-user-123',
        email: 'alan.boehme61@gmail.com',
        displayName: 'Alan Boehme',
        photoURL: null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };
      
      console.log('🔄 Simulation état auth : Utilisateur connecté');
      callback(mockUser);
    }, 1000);

    // Retourner une fonction de nettoyage
    return () => {
      console.log('🧹 Nettoyage listener auth simulé');
    };
  },

  get currentUser() {
    return {
      uid: 'mock-user-123',
      email: 'alan.boehme61@gmail.com',
      displayName: 'Alan Boehme'
    };
  }
};

// ⭐ EXPORTS SIMULÉS - PAS DE FIREBASE
export const auth = null;
export const db = null;
export const storage = null;

// Alias pour compatibilité
export const firebaseDb = null;
export const firebaseAuth = null;

export default null;

console.log('✅ Firebase simulé initialisé - AUCUNE ERREUR POSSIBLE');
console.log('🎯 Créez un nouveau projet Firebase et remplacez cette config');
