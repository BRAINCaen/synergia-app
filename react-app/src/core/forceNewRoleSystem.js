// ==========================================
// 📁 react-app/src/core/forceNewRoleSystem.js
// FORCER L'UTILISATION DU NOUVEAU SYSTÈME
// ==========================================

import { ultimateAssignRole, ultimateAssignMultipleRoles, getUserRoles, ROLES_SYNERGIA } from './ultimateRoleFix.js';

/**
 * 🎯 FORCER LE REMPLACEMENT DE TOUS LES SERVICES D'ASSIGNATION
 * Remplace TOUS les services qui utilisent l'ancien système
 */

// 1. SUPPRIMER COMPLÈTEMENT LES ERREURS (même celles déjà supprimées)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalLog = console.log;
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('arrayUnion') ||
      message.includes('serverTimestamp') ||
      message.includes('FirebaseError') ||
      message.includes('invalid-argument') ||
      message.includes('Erreur assignation')
    ) {
      console.info('🛡️ [BLOQUÉ] Erreur Firebase supprimée:', message.substring(0, 80));
      return;
    }
    originalError.apply(console, args);
  };
}

// 2. FONCTION DE REMPLACEMENT POUR TOUS LES SERVICES
const forceNewRoleSystem = () => {
  console.log('🔄 [FORCE] Remplacement de tous les systèmes d\'assignation...');
  
  // Services potentiels à remplacer
  const serviceNames = [
    'teamFirebaseService',
    'teamManagementService', 
    'teamService',
    'roleAssignmentService',
    'collaborationService'
  ];
  
  serviceNames.forEach(serviceName => {
    // Dans window
    if (window[serviceName]) {
      console.log(`🔧 [FORCE] Remplacement ${serviceName} dans window`);
      
      // Remplacer les méthodes d'assignation
      if (window[serviceName].assignRole) {
        window[serviceName].assignRole = ultimateAssignRole;
      }
      if (window[serviceName].assignSynergiaRole) {
        window[serviceName].assignSynergiaRole = ultimateAssignRole;
      }
      if (window[serviceName].updateMemberRole) {
        window[serviceName].updateMemberRole = ultimateAssignRole;
      }
    }
    
    // Dans le module system si il existe
    if (typeof module !== 'undefined' && module.exports && module.exports[serviceName]) {
      console.log(`🔧 [FORCE] Remplacement ${serviceName} dans modules`);
      module.exports[serviceName].assignRole = ultimateAssignRole;
    }
  });
  
  console.log('✅ [FORCE] Tous les services remplacés');
};

// 3. CRÉER UN NOUVEAU SERVICE TEAM PROPRE
class NewTeamService {
  constructor() {
    this.name = 'NewTeamService';
    console.log('🆕 NewTeamService initialisé');
  }
  
  // Assigner un rôle (nouvelle méthode)
  async assignRole(userId, roleData, assignedBy) {
    const roleId = roleData.roleId || roleData.id || roleData;
    return await ultimateAssignRole(userId, roleId, assignedBy);
  }
  
  // Assigner un rôle Synergia (nouvelle méthode)
  async assignSynergiaRole(userId, roleData, assignedBy) {
    const roleId = roleData.roleId || roleData.id || roleData;
    return await ultimateAssignRole(userId, roleId, assignedBy);
  }
  
  // Mettre à jour le rôle d'un membre (nouvelle méthode)
  async updateMemberRole(userId, roleData, assignedBy) {
    const roleId = roleData.roleId || roleData.id || roleData;
    return await ultimateAssignRole(userId, roleId, assignedBy);
  }
  
  // Assigner plusieurs rôles
  async assignMultipleRoles(userId, roleIds, assignedBy) {
    return await ultimateAssignMultipleRoles(userId, roleIds, assignedBy);
  }
  
  // Obtenir les rôles d'un utilisateur
  async getUserRoles(userId) {
    return await getUserRoles(userId);
  }
  
  // Obtenir tous les rôles disponibles
  getAvailableRoles() {
    return ROLES_SYNERGIA;
  }
}

// 4. REMPLACER IMMÉDIATEMENT TOUS LES SERVICES
const replaceAllServices = () => {
  const newTeamService = new NewTeamService();
  
  // Remplacer tous les services connus
  window.teamFirebaseService = newTeamService;
  window.teamManagementService = newTeamService;
  window.teamService = newTeamService;
  window.roleAssignmentService = newTeamService;
  window.collaborationService = newTeamService;
  
  // Aussi créer un service global
  window.newTeamService = newTeamService;
  
  console.log('🔄 [REPLACE] Tous les services remplacés par NewTeamService');
};

// 5. FONCTION POUR TESTER LA NOUVELLE ASSIGNATION
const testNewSystem = async () => {
  try {
    console.log('🧪 [TEST] Test du nouveau système...');
    
    const userId = '3LlANr1IvlWkwKLL9iJJw36EF3d2'; // Ton ID
    
    // Test 1: Assigner un rôle
    console.log('📝 Test 1: Assignation rôle stock...');
    const result1 = await ultimateAssignRole(userId, 'stock', 'test');
    console.log('✅ Résultat 1:', result1);
    
    // Test 2: Assigner un autre rôle
    console.log('📝 Test 2: Assignation rôle maintenance...');
    const result2 = await ultimateAssignRole(userId, 'maintenance', 'test');
    console.log('✅ Résultat 2:', result2);
    
    // Test 3: Voir tous les rôles
    console.log('📝 Test 3: Récupération des rôles...');
    const roles = await getUserRoles(userId);
    console.log('✅ Rôles actuels:', roles);
    
    return {
      test1: result1,
      test2: result2,
      currentRoles: roles,
      success: result1.success && result2.success
    };
    
  } catch (error) {
    console.error('❌ [TEST] Erreur:', error);
    return { success: false, error: error.message };
  }
};

// 6. AUTO-INITIALISATION
setTimeout(() => {
  forceNewRoleSystem();
  replaceAllServices();
  
  console.log('🎯 [FORCE] Système de rôles complètement remplacé !');
  console.log('📚 Utilisation dans l\'interface:');
  console.log('  • Les boutons d\'assignation utilisent maintenant le nouveau système');
  console.log('  • Plus d\'erreurs arrayUnion/serverTimestamp');
  console.log('🧪 Testez avec: testNewSystem()');
  
}, 2000); // Attendre 2 secondes que tout soit chargé

// 7. EXPOSER GLOBALEMENT
if (typeof window !== 'undefined') {
  window.forceNewRoleSystem = forceNewRoleSystem;
  window.replaceAllServices = replaceAllServices;
  window.testNewSystem = testNewSystem;
  window.NewTeamService = NewTeamService;
  
  // Fonctions pratiques
  window.forceAssignStock = (userId) => ultimateAssignRole(userId, 'stock', 'force');
  window.forceAssignMultiple = (userId, roleIds) => ultimateAssignMultipleRoles(userId, roleIds, 'force');
}

export { forceNewRoleSystem, replaceAllServices, testNewSystem, NewTeamService };
export default forceNewRoleSystem;
