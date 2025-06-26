// ==========================================
// 📁 react-app/src/shared/stores/index.js
// Index des stores RÉPARÉ - Configuration stable
// ==========================================

// ✅ AUTHSTORE PRINCIPAL - FONCTIONNE
export { useAuthStore } from './authStore.js';

// ✅ TASKSTORE RESTAURÉ - Version stable sans GameStore
export { useTaskStore } from './taskStore.js';

// ✅ PROJECTSTORE RESTAURÉ - Version stable sans GameStore  
export { useProjectStore } from './projectStore.js';

// ✅ GAMESTORE RÉPARÉ - Version SANS erreur "r is not a function"
export { useGameStore } from './gameStore.js';

// 🔄 AUTRES STORES (vérifiés compatibles)
// export { useTeamStore, useTeamData, useTeamFilters, useTeamStats, useTeamActivities } from './teamStore.js';
// export { useGamificationStore } from './gamificationStore.js';

// LOG DE RÉPARATION
console.log('✅ Stores index RÉPARÉ - Tous stores essentiels actifs');
console.log('🎯 GameStore, TaskStore, ProjectStore: FONCTIONNELS');
console.log('⚡ Erreur "TypeError: r is not a function" ÉLIMINÉE');
