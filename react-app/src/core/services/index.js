// ==========================================
// 📁 react-app/src/core/services/index.js
// Index des services CORRIGÉ - Compatible avec structure existante
// ==========================================

// ✅ IMPORTS COMPATIBLES avec la structure existante
export { default as AuthService } from './authService.js';
export { default as TaskService } from './taskService.js';
export { default as ProjectService } from './projectService.js';

// ✅ ALIAS POUR COMPATIBILITÉ (si ces services utilisent des classes statiques)
export { default as authService } from './authService.js';
export { default as taskService } from './taskService.js';
export { default as projectService } from './projectService.js';

// ✅ AUTRES SERVICES (à vérifier/ajouter selon disponibilité)
// export { default as teamService } from './teamService.js';
// export { default as gamificationService } from './gamificationService.js';

console.log('✅ Services index chargé - Compatible avec structure existante');
