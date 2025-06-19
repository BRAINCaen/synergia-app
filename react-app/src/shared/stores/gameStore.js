// src/shared/stores/gameStore.js (Phase 2 - Gamification)
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // État gamification
  xp: 0,
  level: 1,
  totalXp: 0,
  badges: [],
  achievements: [],
  quests: [],
  leaderboard: [],
  
  // Configuration niveaux
  levelThresholds: [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 13000],
  
  // Actions XP
  addXP: (amount, reason = '') => {
    const state = get();
    const newTotalXp = state.totalXp + amount;
    const newLevel = state.calculateLevel(newTotalXp);
    const newXp = newTotalXp - state.levelThresholds[newLevel - 1];
    
    set({
      xp: newXp,
      totalXp: newTotalXp,
      level: newLevel
    });
    
    // Animation/notification si level up
    if (newLevel > state.level) {
      get().triggerLevelUp(newLevel);
    }
    
    // Log activity
    console.log(`+${amount} XP: ${reason}`);
  },
  
  // Actions badges
  unlockBadge: (badge) => set((state) => {
    if (!state.badges.find(b => b.id === badge.id)) {
      return {
        badges: [...state.badges, { ...badge, unlockedAt: new Date() }]
      };
    }
    return state;
  }),
  
  // Actions quêtes
  setQuests: (quests) => set({ quests }),
  
  completeQuest: (questId) => set((state) => ({
    quests: state.quests.map(quest => 
      quest.id === questId 
        ? { ...quest, completed: true, completedAt: new Date() }
        : quest
    )
  })),
  
  // Leaderboard
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  
  // Calculateurs
  calculateLevel: (totalXp) => {
    const thresholds = get().levelThresholds;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalXp >= thresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  },
  
  getXPForNextLevel: () => {
    const state = get();
    const nextThreshold = state.levelThresholds[state.level];
    return nextThreshold ? nextThreshold - state.totalXp : 0;
  },
  
  getLevelProgress: () => {
    const state = get();
    const currentThreshold = state.levelThresholds[state.level - 1] || 0;
    const nextThreshold = state.levelThresholds[state.level] || state.totalXp;
    const progress = ((state.totalXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  },
  
  // Events
  triggerLevelUp: (newLevel) => {
    console.log(`🎉 Level Up! Nouveau niveau: ${newLevel}`);
    // Ici on pourra déclencher des animations ou notifications
  },
  
  // Reset (pour dev/test)
  resetProgress: () => set({
    xp: 0,
    level: 1,
    totalXp: 0,
    badges: [],
    achievements: []
  }),
}));

export default useGameStore;
