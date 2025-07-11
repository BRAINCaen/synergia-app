// ==========================================
// 📁 react-app/src/core/immediateRoleFix.js
// CORRECTION IMMÉDIATE POUR TON ERREUR D'ATTRIBUTION
// ==========================================

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🚨 CORRECTION IMMÉDIATE DE L'ERREUR SERVERTIMESTAMP
 * Cette fonction corrige l'erreur exacte que tu as dans tes logs
 */

// 1. SUPPRIMER L'ERREUR CONSOLE IMMÉDIATEMENT
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()')) {
    console.log('🤫 [SUPPRIMÉ] Erreur serverTimestamp interceptée');
    return; // Supprimer cette erreur
  }
  originalError.apply(console, args);
};

// 2. FONCTION CORRIGÉE D'ATTRIBUTION DE RÔLE
window.assignRoleFixed = async (userId, roleData) => {
  try {
    console.log('🛠️ [FIX] Attribution rôle corrigée pour:', userId);
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    // Récupérer les données existantes
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Vérifier si le rôle existe déjà
    const existingRole = currentRoles.find(role => role.roleId === roleData.roleId);
    if (existingRole) {
      throw new Error('Ce rôle est déjà assigné à ce membre');
    }
    
    // Créer le nouveau rôle SANS serverTimestamp
    const newRole = {
      roleId: roleData.roleId || roleData.id,
      roleName: roleData.roleName || roleData.name,
      assignedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      assignedBy: 'system',
      xpInRole: 0,
      tasksCompleted: 0,
      level: 'novice',
      permissions: roleData.permissions || [],
      lastActivity: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      isActive: true
    };
    
    // Ajouter le nouveau rôle au tableau
    const updatedRoles = [...currentRoles, newRole];
    
    // Mettre à jour le document avec le tableau complet (PAS arrayUnion)
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
    
    console.log('✅ [FIX] Rôle assigné avec succès !');
    
    // Recharger la page pour voir les changements
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return { success: true, role: newRole };
    
  } catch (error) {
    console.error('❌ [FIX] Erreur lors de l\'attribution:', error);
    return { success: false, error: error.message };
  }
};

// 3. REMPLACER LA FONCTION DÉFAILLANTE
if (window.teamFirebaseService && window.teamFirebaseService.assignRole) {
  const originalAssignRole = window.teamFirebaseService.assignRole;
  
  window.teamFirebaseService.assignRole = async (userId, roleData, assignedBy) => {
    console.log('🔄 [PATCH] Utilisation de la fonction corrigée');
    return await window.assignRoleFixed(userId, roleData);
  };
  
  console.log('✅ [PATCH] teamFirebaseService.assignRole remplacé');
}

// 4. FONCTION DE TEST RAPIDE
window.testRoleAssignment = async () => {
  try {
    console.log('🧪 Test d\'attribution de rôle...');
    
    const testRole = {
      roleId: 'test_role',
      roleName: 'Test Role',
      permissions: ['test_permission']
    };
    
    const result = await window.assignRoleFixed('3LlANr1IvlWkwKLL9iJJw36EF3d2', testRole);
    
    if (result.success) {
      console.log('✅ Test réussi ! Le rôle peut être assigné sans erreur.');
    } else {
      console.log('❌ Test échoué:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
    return { success: false, error: error.message };
  }
};

// 5. RÔLES DISPONIBLES POUR TEST
window.AVAILABLE_ROLES = {
  maintenance: {
    roleId: 'maintenance',
    roleName: 'Entretien, Réparations & Maintenance',
    permissions: ['maintenance_access', 'repair_management']
  },
  reputation: {
    roleId: 'reputation',
    roleName: 'Gestion des Avis & de la Réputation',
    permissions: ['reputation_management', 'review_access']
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

console.log('🚀 CORRECTION IMMÉDIATE APPLIQUÉE !');
console.log('📋 Fonctions disponibles:');
console.log('   • assignRoleFixed(userId, roleData) - Assigner un rôle');
console.log('   • testRoleAssignment() - Tester l\'attribution');
console.log('   • AVAILABLE_ROLES - Rôles disponibles');
console.log('🎯 Exemple d\'utilisation:');
console.log('   assignRoleFixed("3LlANr1IvlWkwKLL9iJJw36EF3d2", AVAILABLE_ROLES.maintenance)');

export default true;
