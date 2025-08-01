// ==========================================
// 📁 react-app/src/shared/stores/gamificationStore.js
// ALIAS DE COMPATIBILITÉ - Exporte gameStore.js
// ==========================================

// Re-export du gameStore pour compatibilité avec les anciens imports
export { useGameStore as useGamificationStore } from './gameStore.js';

// Export par défaut
export { useGameStore as default } from './gameStore.js';

// Log de compatibilité
console.log('🔄 gamificationStore.js : Alias de compatibilité vers gameStore.js');
