// ==========================================
// 📁 react-app/src/shared/stores/index.js
// Index des stores NETTOYÉ COMPLET - Sans GameStore
// ==========================================

// ✅ EXPORT PRINCIPAL FONCTIONNEL
export { useAuthStore } from './authStore.js';

// 🚨 GAMESTORE COMPLÈTEMENT DÉSACTIVÉ POUR DEBUG
// L'erreur "TypeError: r is not a function" vient probablement du GameStore
// Tous les imports GameStore sont commentés jusqu'à résolution

// DÉSACTIVÉ TEMPORAIREMENT :
// export { useGameStore } from './gameStore.js';

// AUTRES STORES (vérifier qu'ils n'importent pas GameStore) :
// export { useTaskStore } from './taskStore.js';
// export { useProjectStore } from './projectStore.js';
// export { useTeamStore, useTeamData, useTeamFilters, useTeamStats, useTeamActivities } from './teamStore.js';
// export { useGamificationStore } from './gamificationStore.js';

// LOG DE DEBUG
console.log('✅ Stores index chargé - SEUL authStore actif');
console.log('⚠️ GameStore et autres stores désactivés temporairement');
console.log('🎯 Objectif: Éliminer erreur "TypeError: r is not a function"');
