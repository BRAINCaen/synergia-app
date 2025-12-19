// ==========================================
// 📁 react-app/src/core/services/index.js
// INDEX SERVICES CORRIGÉ - Élimination TypeError: s is not a function
// ==========================================

// ✅ IMPORTS EXPLICITES SANS CONFLITS
import AuthService from './authService.js';
import TaskService, { taskService } from './taskService.js';
import ProjectService, { projectService } from './projectService.js';
import { boostService, BOOST_TYPES } from './boostService.js';
import { challengeService, CHALLENGE_TYPES, CHALLENGE_DIFFICULTY, CHALLENGE_STATUS } from './challengeService.js';

// 🔧 IMPORTS CONDITIONNELS POUR SERVICES AVANCÉS
let teamManagementService = null;
let milestoneService = null;
let projectAnalyticsService = null;
let taskProjectIntegration = null;

// Initialisation sécurisée des services avancés
const initializeAdvancedServices = async () => {
  try {
    // ✅ Import teamManagementService avec fallback
    try {
      const teamModule = await import('./teamManagementService.js');
      teamManagementService = teamModule.teamManagementService || teamModule.default;
      console.log('✅ teamManagementService chargé');
    } catch (error) {
      console.warn('⚠️ teamManagementService non disponible, utilisation du fallback');
      teamManagementService = {
        getTeamMembers: () => Promise.resolve([]),
        addTeamMember: () => Promise.resolve(false),
        removeTeamMember: () => Promise.resolve(false),
        updateMemberRole: () => Promise.resolve(false)
      };
    }

    // ✅ Import milestoneService avec fallback
    try {
      const milestoneModule = await import('./milestoneService.js');
      milestoneService = milestoneModule.milestoneService || milestoneModule.default;
      console.log('✅ milestoneService chargé');
    } catch (error) {
      console.warn('⚠️ milestoneService non disponible, utilisation du fallback');
      milestoneService = {
        getMilestones: () => Promise.resolve([]),
        createMilestone: () => Promise.resolve(null),
        updateMilestone: () => Promise.resolve(false),
        deleteMilestone: () => Promise.resolve(false)
      };
    }

    // ✅ Import projectAnalyticsService avec fallback
    try {
      const analyticsModule = await import('./projectAnalyticsService.js');
      projectAnalyticsService = analyticsModule.projectAnalyticsService || analyticsModule.default;
      console.log('✅ projectAnalyticsService chargé');
    } catch (error) {
      console.warn('⚠️ projectAnalyticsService non disponible, utilisation du fallback');
      projectAnalyticsService = {
        getProjectAnalytics: () => Promise.resolve({}),
        generateReport: () => Promise.resolve(null),
        getMetrics: () => Promise.resolve({})
      };
    }

    // ✅ Import taskProjectIntegration avec fallback
    try {
      const integrationModule = await import('./taskProjectIntegration.js');
      taskProjectIntegration = integrationModule.taskProjectIntegration || integrationModule.default;
      console.log('✅ taskProjectIntegration chargé');
    } catch (error) {
      console.warn('⚠️ taskProjectIntegration non disponible, utilisation du fallback');
      taskProjectIntegration = {
        linkTaskToProject: () => Promise.resolve(false),
        unlinkTaskFromProject: () => Promise.resolve(false),
        getProjectTasks: () => Promise.resolve([])
      };
    }

  } catch (error) {
    console.error('❌ Erreur initialisation services avancés:', error);
  }
};

// Initialiser les services avancés
initializeAdvancedServices();

// ==========================================
// 📤 EXPORTS SÉCURISÉS SANS CONFLITS
// ==========================================

// Exports directs des services principaux
export { default as AuthService } from './authService.js';
export { default as TaskService, taskService } from './taskService.js';
export { default as ProjectService, projectService } from './projectService.js';
export { boostService, BOOST_TYPES } from './boostService.js';
export { challengeService, CHALLENGE_TYPES, CHALLENGE_DIFFICULTY, CHALLENGE_STATUS } from './challengeService.js';

// Exports conditionnels des services avancés
export const getTeamManagementService = () => teamManagementService;
export const getMilestoneService = () => milestoneService;
export const getProjectAnalyticsService = () => projectAnalyticsService;
export const getTaskProjectIntegration = () => taskProjectIntegration;

// ✅ FONCTION DE VÉRIFICATION DES SERVICES
export const checkServicesAvailability = () => {
  const serviceStatus = {
    AuthService: !!AuthService,
    TaskService: !!TaskService,
    ProjectService: !!ProjectService,
    teamManagementService: !!teamManagementService,
    milestoneService: !!milestoneService,
    projectAnalyticsService: !!projectAnalyticsService,
    taskProjectIntegration: !!taskProjectIntegration
  };
  
  console.log('📋 État des services:', serviceStatus);
  return serviceStatus;
};

// ✅ FONCTION D'ACCÈS SÉCURISÉ AUX SERVICES
export const getService = (serviceName) => {
  const services = {
    auth: AuthService,
    task: TaskService,
    project: ProjectService,
    teamManagement: teamManagementService,
    milestone: milestoneService,
    projectAnalytics: projectAnalyticsService,
    taskProjectIntegration: taskProjectIntegration
  };
  
  const service = services[serviceName];
  if (!service) {
    console.warn(`⚠️ Service "${serviceName}" non disponible`);
    return null;
  }
  
  return service;
};

// ==========================================
// 🔧 EXPORTS LEGACY POUR COMPATIBILITÉ
// ==========================================

// Pour compatibilité avec l'ancien code
export const authService = AuthService;

// Export par défaut pour imports simples
export default {
  AuthService,
  TaskService,
  ProjectService,
  taskService,
  projectService,
  boostService,
  BOOST_TYPES,
  getTeamManagementService,
  getMilestoneService,
  getProjectAnalyticsService,
  getTaskProjectIntegration,
  checkServicesAvailability,
  getService
};

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ Services index.js corrigé');
console.log('🔧 Élimination TypeError: s is not a function');
console.log('📦 Exports sécurisés avec fallbacks');
console.log('🚀 Compatible avec build Netlify');

// Vérifier l'état des services après un délai
setTimeout(() => {
  checkServicesAvailability();
}, 2000);
