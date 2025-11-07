// ==========================================
// 📁 react-app/src/shared/stores/gamificationStore.js
// STORE CENTRALISÉ POUR LA SYNCHRONISATION XP TEMPS RÉEL
// ==========================================

import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 🎮 STORE GAMIFICATION CENTRALISÉ
 * Synchronise les XP en temps réel pour TOUS les utilisateurs
 */
export const useGamificationStore = create((set, get) => ({
  // État
  usersGamification: new Map(), // Map<userId, gamificationData>
  listeners: new Map(), // Map<userId, unsubscribe function>
  
  /**
   * 🚀 DÉMARRER LA SYNCHRONISATION POUR UN UTILISATEUR
   */
  startUserSync: (userId) => {
    const { listeners, usersGamification } = get();
    
    // Éviter les doublons
    if (listeners.has(userId)) {
      console.log(`⚠️ [GAMIF-STORE] Listener déjà actif pour ${userId}`);
      return;
    }
    
    console.log(`🚀 [GAMIF-STORE] Démarrage sync pour ${userId}`);
    
    // Créer un listener temps réel sur ce user
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        
        const userData = snapshot.data();
        const gamification = userData.gamification || {};
        
        console.log(`🔄 [GAMIF-STORE] XP mis à jour pour ${userId}: ${gamification.totalXp || 0} XP`);
        
        // Mettre à jour le store
        const newMap = new Map(usersGamification);
        newMap.set(userId, {
          totalXp: gamification.totalXp || 0,
          level: gamification.level || 1,
          weeklyXp: gamification.weeklyXp || 0,
          monthlyXp: gamification.monthlyXp || 0,
          badges: gamification.badges || [],
          lastUpdate: new Date()
        });
        
        set({ usersGamification: newMap });
      },
      (error) => {
        console.error(`❌ [GAMIF-STORE] Erreur listener ${userId}:`, error);
      }
    );
    
    // Sauvegarder la fonction d'unsubscribe
    const newListeners = new Map(listeners);
    newListeners.set(userId, unsubscribe);
    set({ listeners: newListeners });
  },
  
  /**
   * 🛑 ARRÊTER LA SYNCHRONISATION POUR UN UTILISATEUR
   */
  stopUserSync: (userId) => {
    const { listeners } = get();
    const unsubscribe = listeners.get(userId);
    
    if (unsubscribe) {
      console.log(`🛑 [GAMIF-STORE] Arrêt sync pour ${userId}`);
      unsubscribe();
      
      const newListeners = new Map(listeners);
      newListeners.delete(userId);
      set({ listeners: newListeners });
    }
  },
  
  /**
   * 🚀 DÉMARRER LA SYNCHRONISATION POUR PLUSIEURS UTILISATEURS
   */
  startMultipleSync: (userIds) => {
    console.log(`🚀 [GAMIF-STORE] Démarrage sync pour ${userIds.length} utilisateurs`);
    userIds.forEach(userId => get().startUserSync(userId));
  },
  
  /**
   * 🧹 NETTOYER TOUS LES LISTENERS
   */
  cleanup: () => {
    const { listeners } = get();
    console.log(`🧹 [GAMIF-STORE] Nettoyage de ${listeners.size} listeners`);
    
    listeners.forEach(unsubscribe => unsubscribe());
    set({ listeners: new Map(), usersGamification: new Map() });
  },
  
  /**
   * 📊 OBTENIR LES XP D'UN UTILISATEUR
   */
  getUserXp: (userId) => {
    const { usersGamification } = get();
    return usersGamification.get(userId) || null;
  }
}));
