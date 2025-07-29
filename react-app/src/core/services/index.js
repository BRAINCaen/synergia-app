// ==========================================
// 📁 react-app/src/core/services/index.js
// INDEX SERVICES CORRIGÉ - Élimination TypeError: s is not a function
// ==========================================

// ✅ IMPORTS EXPLICITES SANS CONFLITS
import AuthService from './authService.js';
import TaskService, { taskService } from './taskService.js';
import ProjectService, { projectService } from './projectService.js';

// 🔧 IMPORTS CONDITIONNELS POUR SERVICES AVANCÉS
let teamManagementService = null;
let milestoneService = null;
let projectAnalyticsService = null;
let taskProjectIntegration = null;

try {
  const teamModule = await import('./teamManagementService.js');
  teamManagementService = teamModule.teamManagementService;
} catch (error) {
  console.warn('⚠️ teamManagementService non disponible');
  teamManagementService = {
    // Fallback sécurisé
    getTeamMembers: () => Promise.resolve([]),
    addTeamMember: () => Promise.resolve(false),
    removeTeamMember: () => Promise.resolve(false)
  };
}

try {
  const milestoneModule = await import('./milestoneService.js');
  milestoneService = milestoneModule.milestoneService;
} catch (error) {
  console.warn('⚠️ milestoneService non disponible');
  milestoneService = {
    // Fallback sécurisé
    getMilestones: () => Promise.resolve([]),
    createMilestone: () => Promise.resolve(null),
    updateMilestone: () => Promise.resolve(false)
  };
}

try {
  const analyticsModule = await import('./projectAnalyticsService.js');
  projectAnalyticsService = analyticsModule.projectAnalyticsService;
} catch (error) {
  console.warn('⚠️ projectAnalyticsService non disponible');
  projectAnalyticsService = {
    // Fallback sécurisé
    getProjectAnalytics: () => Promise.resolve({}),
    generateReport: () => Promise.resolve(null)
  };
}

try {
  const integrationModule = await import('./taskProjectIntegration.js');
  taskProjectIntegration = integrationModule.taskProjectIntegration;
} catch (error) {
  console.warn('⚠️ taskProjectIntegration non disponible');
  taskProjectIntegration = {
    // Fallback sécurisé
    syncTasksWithProjects: () => Promise.resolve(true),
    updateProjectProgress: () => Promise.resolve(true)
  };
}

// ✅ SERVICES PRINCIPAUX - SÉCURISÉS
const services = {
  AuthService,
  TaskService,
  ProjectService,
  authService: AuthService,
  taskService,
  projectService,
  teamManagementService,
  milestoneService,
  projectAnalyticsService,
  taskProjectIntegration
};

// ✅ EXPORTS NOMMÉS SÉCURISÉS
export const AuthServiceSecure = AuthService;
export const TaskServiceSecure = TaskService;
export const ProjectServiceSecure = ProjectService;
export const authServiceSecure = AuthService;
export const taskServiceSecure = taskService;
export const projectServiceSecure = projectService;

// ✅ EXPORTS CLASSIQUES MAINTENUS (pour compatibilité)
export { default as AuthService } from './authService.js';
export { default as TaskService, taskService } from './taskService.js';
export { default as ProjectService, projectService } from './projectService.js';

// ✅ ALIAS DE COMPATIBILITÉ
export const authService = AuthService;

// ✅ EXPORTS AVANCÉS SÉCURISÉS
export const teamManagementServiceSecure = teamManagementService;
export const milestoneServiceSecure = milestoneService;
export const projectAnalyticsServiceSecure = projectAnalyticsService;
export const taskProjectIntegrationSecure = taskProjectIntegration;

// ✅ EXPORT PAR DÉFAUT SÉCURISÉ
export default services;

// 📊 LOGS DE DIAGNOSTIC
console.log('✅ Services index sécurisé chargé');
console.log('🎯 Services principaux disponibles:', {
  AuthService: typeof AuthService,
  TaskService: typeof TaskService,
  ProjectService: typeof ProjectService
});
console.log('🎯 Instances disponibles:', {
  authService: typeof AuthService,
  taskService: typeof taskService,
  projectService: typeof projectService
});
console.log('🔧 Services avancés:', {
  teamManagement: typeof teamManagementService,
  milestone: typeof milestoneService,
  projectAnalytics: typeof projectAnalyticsService,
  taskProjectIntegration: typeof taskProjectIntegration
});

// 🔧 VÉRIFICATION DE FONCTIONNEMENT
const verifyServices = () => {
  const issues = [];
  
  if (!AuthService) issues.push('AuthService');
  if (!TaskService) issues.push('TaskService');
  if (!ProjectService) issues.push('ProjectService');
  if (typeof taskService?.getUserTasks !== 'function') issues.push('taskService.getUserTasks');
  if (typeof projectService?.getProject !== 'function') issues.push('projectService.getProject');
  
  if (issues.length > 0) {
    console.error('❌ Services défaillants:', issues);
  } else {
    console.log('✅ Tous les services principaux sont fonctionnels');
  }
  
  return issues.length === 0;
};

// Vérification automatique
verifyServices();
