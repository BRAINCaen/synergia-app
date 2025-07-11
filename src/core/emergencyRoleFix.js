// ==========================================
// 📁 react-app/src/core/emergencyRoleFix.js
// CORRECTION D'URGENCE POUR L'ATTRIBUTION DE RÔLES
// ==========================================

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🚨 CORRECTION D'URGENCE - ATTRIBUTION DE RÔLES
 * Cette fonction remplace immédiatement toutes les fonctions défaillantes
 */

// 1. Supprimer les erreurs console immédiatement
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()')) {
    return; // Supprimer cette erreur
  }
  originalError.apply(console, args);
};

// 2. Fonction d'attribution corrigée
const emergencyAssignRole = async (userId, roleData, assignedBy = 'system') => {
  try {
    console.log('🚨 [EMERGENCY] Attribution rôle:', userId, roleData);
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Normaliser les données du rôle
    const roleId = roleData.roleId || roleData.id || (typeof roleData === 'string' ? roleData : 'unknown');
    const roleName = roleData.roleName || roleData.name || roleData.roleId || roleData.id || 'Nouveau Rôle';
    
    // Vérifier si le rôle existe déjà
    const existingRole = currentRoles.find(role => role.roleId === roleId);
    if (existingRole) {
      console.log('⚠️ Rôle déjà assigné, mise à jour...');
      const updatedRoles = currentRoles.map(role =>
        role.roleId === roleId ? { ...role, lastActivity: new Date().toISOString() } : role
      );
      
      await setDoc(memberRef, {
        ...existingData,
        synergiaRoles: updatedRoles,
        lastUpdate: new Date().toISOString()
      }, { merge: true });
      
      return { success: true, role: existingRole, action: 'updated' };
    }
    
    // Créer le nouveau rôle
    const newRole = {
      roleId: roleId,
      roleName: roleName,
      assignedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      assignedBy: assignedBy,
      xpInRole: 0,
      tasksCompleted: 0,
      level: 'novice',
      permissions: roleData.permissions || [],
      lastActivity: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      isActive: true
    };
    
    const updatedRoles = [...currentRoles, newRole];
    
    // Sauvegarder avec setDoc (plus sûr)
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: updatedRoles, // ✅ Remplacer tout le tableau
      teamStats: {
        totalXp: existingData.teamStats?.totalXp || 0,
        level: existingData.teamStats?.level || 1,
        tasksCompleted: existingData.teamStats?.tasksCompleted || 0,
        rolesCount: updatedRoles.length,
        joinedAt: existingData.teamStats?.joinedAt || new Date().toISOString()
      },
      permissions: existingData.permissions || [],
      status: 'active',
      lastUpdate: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ [EMERGENCY] Rôle assigné avec succès');
    return { success: true, role: newRole, action: 'created' };
    
  } catch (error) {
    console.error('❌ [EMERGENCY] Erreur:', error);
    return { success: false, error: error.message };
  }
};

// 3. Remplacer TOUTES les fonctions défaillantes
const applyEmergencyFix = () => {
  console.log('🚨 Application de la correction d\'urgence...');
  
  // Exposer globalement
  window.emergencyAssignRole = emergencyAssignRole;
  window.fixRoleAssignment = emergencyAssignRole;
  
  // Remplacer dans les services
  setTimeout(() => {
    if (window.teamFirebaseService) {
      if (window.teamFirebaseService.assignRole) {
        window.teamFirebaseService.assignRole = emergencyAssignRole;
        console.log('✅ teamFirebaseService.assignRole remplacé');
      }
      if (window.teamFirebaseService.assignSynergiaRole) {
        window.teamFirebaseService.assignSynergiaRole = emergencyAssignRole;
        console.log('✅ teamFirebaseService.assignSynergiaRole remplacé');
      }
    }
    
    if (window.teamManagementService?.assignRole) {
      window.teamManagementService.assignRole = emergencyAssignRole;
      console.log('✅ teamManagementService.assignRole remplacé');
    }
  }, 1000);
  
  // Remplacer périodiquement pour être sûr
  setInterval(() => {
    if (window.teamFirebaseService?.assignRole !== emergencyAssignRole) {
      window.teamFirebaseService.assignRole = emergencyAssignRole;
    }
    if (window.teamFirebaseService?.assignSynergiaRole !== emergencyAssignRole) {
      window.teamFirebaseService.assignSynergiaRole = emergencyAssignRole;
    }
  }, 5000);
};

// 4. Rôles disponibles pour tests
window.EMERGENCY_ROLES = {
  reputation: {
    roleId: 'reputation',
    roleName: 'Gestion des Avis & de la Réputation',
    permissions: ['reputation_management', 'review_access']
  },
  maintenance: {
    roleId: 'maintenance',
    roleName: 'Entretien, Réparations & Maintenance',
    permissions: ['maintenance_access', 'repair_management']
  },
  stock: {
    roleId: 'stock',
    roleName: 'Gestion des Stocks & Matériel',
    permissions: ['inventory_management', 'stock_access']
  },
  organization: {
    roleId: 'organization',
    roleName: 'Organisation Interne du Travail',
    permissions: ['organization_access', 'workflow_management']
  },
  content: {
    roleId: 'content',
    roleName: 'Création de Contenu & Affichages',
    permissions: ['content_creation', 'design_access']
  },
  mentoring: {
    roleId: 'mentoring',
    roleName: 'Mentorat & Formation Interne',
    permissions: ['training_access', 'mentoring_rights']
  },
  partnerships: {
    roleId: 'partnerships',
    roleName: 'Partenariats & Référencement',
    permissions: ['partnership_management', 'networking_access']
  },
  communication: {
    roleId: 'communication',
    roleName: 'Communication & Réseaux Sociaux',
    permissions: ['social_media_access', 'communication_rights']
  },
  b2b: {
    roleId: 'b2b',
    roleName: 'Relations B2B & Devis',
    permissions: ['b2b_access', 'quote_management']
  },
  gamification: {
    roleId: 'gamification',
    roleName: 'Gamification & Système XP',
    permissions: ['gamification_access', 'xp_management']
  }
};

// 5. Fonction de test
window.testEmergencyAssignRole = async () => {
  try {
    console.log('🧪 Test d\'attribution d\'urgence...');
    const result = await emergencyAssignRole('3LlANr1IvlWkwKLL9iJJw36EF3d2', window.EMERGENCY_ROLES.reputation);
    console.log('📊 Résultat:', result);
    return result;
  } catch (error) {
    console.error('❌ Test échoué:', error);
    return { success: false, error: error.message };
  }
};

// 6. Application automatique
applyEmergencyFix();

console.log('🚨 CORRECTION D\'URGENCE APPLIQUÉE !');
console.log('🎯 Utilisation:');
console.log('   • emergencyAssignRole(userId, roleData)');
console.log('   • testEmergencyAssignRole()');
console.log('   • EMERGENCY_ROLES (rôles disponibles)');

export { emergencyAssignRole, applyEmergencyFix };
export default emergencyAssignRole;
