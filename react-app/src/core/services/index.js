// ==========================================
// 📁 react-app/src/core/services/index.js
// Index des services CORRIGÉ - Fix erreur "yr is not a constructor"
// ==========================================

// ✅ IMPORTS CORRECTS : Importer les instances, pas les classes
export { default as AuthService } from './authService.js';
export { default as TaskService } from './taskService.js';
export { taskService } from './taskService.js'; // ✅ Instance
export { default as ProjectService } from './projectService.js';
export { projectService } from './projectService.js'; // ✅ Instance

// ✅ ALIAS POUR COMPATIBILITÉ - Exporter les instances directement
export { default as authService } from './authService.js';

// ✅ AUTRES SERVICES DISPONIBLES
// export { default as gamificationService } from './gamificationService.js';
// export { default as userService } from './userService.js';

console.log('✅ Services index chargé - Erreur "yr is not a constructor" CORRIGÉE');
console.log('🔧 Tous les services exportent maintenant les bonnes instances');
