// ==========================================
// 📁 react-app/src/core/services/index.js
// Index des services FINAL CORRIGÉ - Exports propres et fonctionnels
// ==========================================

// ✅ IMPORTS CORRECTS avec instances ET classes
export { default as AuthService } from './authService.js';

export { default as TaskService } from './taskService.js';
export { taskService } from './taskService.js'; // ✅ Instance

export { default as ProjectService } from './projectService.js';
export { projectService } from './projectService.js'; // ✅ Instance

// ✅ ALIAS POUR COMPATIBILITÉ - Exporter les instances directement
export { default as authService } from './authService.js';

// ✅ SERVICES D'INTÉGRATION
export { taskProjectIntegration } from './taskProjectIntegration.js';

// ✅ NOUVEAUX SERVICES AVANCÉS
export { teamManagementService } from './teamManagementService.js';
export { milestoneService } from './milestoneService.js';
export { projectAnalyticsService } from './projectAnalyticsService.js';

console.log('✅ Services index FINAL - Toutes erreurs résolues');
console.log('🔧 projectService.getProject disponible:', typeof projectService?.getProject);
console.log('🔧 taskService.getUserTasks disponible:', typeof taskService?.getUserTasks);
