// ==========================================
// 📁 react-app/src/shared/stores/index.js
// INDEX STORES CORRIGÉ - Élimination TypeError: s is not a function
// ==========================================

// ✅ IMPORTS EXPLICITES SANS CONFLITS
import { useAuthStore } from './authStore.js';
import { useTaskStore } from './taskStore.js';
import { useProjectStore } from './projectStore.js';
import { useGameStore } from './gameStore.js';

// ✅ EXPORTS EXPLICITES - Évite l'optimisation problématique de Vite
const stores = {
  useAuthStore,
  useTaskStore,
  useProjectStore,
  useGameStore
};

// ✅ EXPORTS NOMMÉS SÉCURISÉS
export const useAuthStoreSecure = useAuthStore;
export const useTaskStoreSecure = useTaskStore;
export const useProjectStoreSecure = useProjectStore;
export const useGameStoreSecure = useGameStore;

// ✅ EXPORTS CLASSIQUES MAINTENUS
export { useAuthStore };
export { useTaskStore };
export { useProjectStore };
export { useGameStore };

// ✅ ALIAS DE COMPATIBILITÉ POUR GAMIFICATION
export { useGameStore as useGamificationStore };

// ✅ EXPORT PAR DÉFAUT SÉCURISÉ
export default stores;

// 📊 LOGS DE DIAGNOSTIC
console.log('✅ Stores index sécurisé chargé');
console.log('🎯 Stores disponibles:', Object.keys(stores));
console.log('🛡️ Types vérifiés:', {
  authStore: typeof useAuthStore,
  taskStore: typeof useTaskStore,
  projectStore: typeof useProjectStore,
  gameStore: typeof useGameStore
});

// 🔧 VÉRIFICATION DE FONCTIONNEMENT
const verifyStores = () => {
  const issues = [];
  
  if (typeof useAuthStore !== 'function') issues.push('authStore');
  if (typeof useTaskStore !== 'function') issues.push('taskStore');
  if (typeof useProjectStore !== 'function') issues.push('projectStore');
  if (typeof useGameStore !== 'function') issues.push('gameStore');
  
  if (issues.length > 0) {
    console.error('❌ Stores défaillants:', issues);
  } else {
    console.log('✅ Tous les stores sont fonctionnels');
  }
  
  return issues.length === 0;
};

// Vérification automatique
verifyStores();
