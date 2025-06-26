// ==========================================
// 📁 react-app/src/shared/stores/gameStore.js
// GameStore COMPLÈTEMENT DÉSACTIVÉ - Version stub
// ==========================================

// 🚨 GAMESTORE TEMPORAIREMENT SUPPRIMÉ POUR DEBUG
// Ce fichier ne fait plus rien pour éviter l'erreur "r is not a function"

console.log('⚠️ GameStore stub chargé - Fonctionnalités désactivées temporairement');

// Export minimal pour éviter les erreurs d'import
export const useGameStore = () => {
  console.warn('🚨 GameStore désactivé - Retour de données par défaut');
  
  return {
    // Données par défaut pour éviter les erreurs
    userStats: {
      level: 2,
      totalXp: 175,
      currentXp: 75,
      badges: ['welcome'],
      tasksCompleted: 12,
      loginStreak: 3
    },
    leaderboard: [],
    notifications: [],
    loading: false,
    error: null,
    
    // Méthodes stub qui ne font rien
    initializeGameStore: async () => {
      console.log('🚨 GameStore.initializeGameStore() désactivé');
      return Promise.resolve(true);
    },
    
    cleanup: () => {
      console.log('🚨 GameStore.cleanup() désactivé');
    },
    
    addXP: async () => {
      console.log('🚨 GameStore.addXP() désactivé');
      return Promise.resolve({ success: true });
    },
    
    getUserStats: () => ({
      level: 2,
      totalXp: 175,
      currentXp: 75,
      badges: ['welcome'],
      tasksCompleted: 12,
      loginStreak: 3
    }),
    
    getLevelProgress: () => 75,
    
    markNotificationsAsRead: () => {
      console.log('🚨 GameStore.markNotificationsAsRead() désactivé');
    },
    
    removeNotification: () => {
      console.log('🚨 GameStore.removeNotification() désactivé');
    },
    
    dailyLogin: async () => {
      console.log('🚨 GameStore.dailyLogin() désactivé');
      return Promise.resolve({ success: true });
    }
  };
};

// Export par défaut
export default useGameStore;

// 🚨 NE PAS EXPORTER VERS WINDOW - C'EST ÇA QUI CAUSE L'ERREUR
// Plus d'export vers window.useGameStore

console.log('✅ GameStore stub initialisé - Aucune erreur attendue');
