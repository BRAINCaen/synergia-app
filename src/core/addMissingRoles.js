// ==========================================
// 📁 react-app/src/core/addMissingRoles.js
// AJOUTER LES RÔLES B2B ET GAMIFICATION
// ==========================================

import { ultimateAssignRole } from './ultimateRoleFix.js';

/**
 * 🎮 AJOUTER LES RÔLES MANQUANTS AU SYSTÈME
 */

// 1. ÉTENDRE LES RÔLES SYNERGIA AVEC B2B ET GAMIFICATION
const ADDITIONAL_ROLES = {
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '🤝',
    color: 'bg-indigo-600',
    description: 'Gestion des relations entreprises et devis',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['b2b_management', 'quote_generation', 'enterprise_relations']
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-purple-600',
    description: 'Gestion du système de gamification',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['gamification_management', 'xp_system', 'badge_creation']
  }
};

// 2. FUSIONNER AVEC LES RÔLES EXISTANTS
const EXTENDED_ROLES_SYNERGIA = {
  ...window.ROLES_SYNERGIA,
  ...ADDITIONAL_ROLES
};

// 3. FONCTION D'ASSIGNATION ÉTENDUE
const extendedAssignRole = async (userId, roleId, assignedBy = 'system') => {
  try {
    console.log('🎯 [EXTENDED] Assignation rôle étendu:', { userId, roleId, assignedBy });
    
    // Vérifications de base
    if (!userId || !roleId) {
      throw new Error('userId et roleId sont requis');
    }
    
    // Vérifier dans les rôles étendus
    if (!EXTENDED_ROLES_SYNERGIA[roleId]) {
      throw new Error(`Rôle ${roleId} introuvable. Rôles disponibles: ${Object.keys(EXTENDED_ROLES_SYNERGIA).join(', ')}`);
    }
    
    const roleData = EXTENDED_ROLES_SYNERGIA[roleId];
    
    // Utiliser la logique de ultimateAssignRole mais avec les rôles étendus
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase.js');
    
    // Récupérer le document du membre
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    // Récupérer ou initialiser les données
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Vérifier si le rôle existe déjà
    const existingRoleIndex = currentRoles.findIndex(role => role.roleId === roleId);
    
    if (existingRoleIndex !== -1) {
      console.log('⚠️ Rôle déjà assigné, mise à jour...');
      // Mettre à jour le rôle existant
      currentRoles[existingRoleIndex] = {
        ...currentRoles[existingRoleIndex],
        lastActivity: new Date().toISOString(),
        isActive: true,
        permissions: roleData.permissions
      };
    } else {
      // Créer un nouveau rôle
      const newRole = {
        roleId: roleId,
        roleName: roleData.name,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'débutant',
        permissions: roleData.permissions || [],
        lastActivity: new Date().toISOString(),
        isActive: true,
        roleIcon: roleData.icon,
        roleColor: roleData.color,
        difficulty: roleData.difficulty
      };
      
      currentRoles.push(newRole);
    }
    
    // Calculer les stats mises à jour
    const updatedStats = {
      totalXp: existingData.teamStats?.totalXp || 0,
      level: existingData.teamStats?.level || 1,
      tasksCompleted: existingData.teamStats?.tasksCompleted || 0,
      rolesCount: currentRoles.length,
      joinedAt: existingData.teamStats?.joinedAt || new Date().toISOString()
    };
    
    // Fusionner toutes les permissions
    const allPermissions = [
      ...(existingData.permissions || []),
      ...roleData.permissions
    ].filter((perm, index, arr) => arr.indexOf(perm) === index); // Dédupliqué
    
    // Mettre à jour le document complet avec setDoc
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: currentRoles,
      teamStats: updatedStats,
      permissions: allPermissions,
      status: 'active',
      lastUpdate: new Date().toISOString(),
      lastRoleUpdate: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ [EXTENDED] Rôle "${roleData.name}" assigné avec succès !`);
    
    return {
      success: true,
      message: `Rôle "${roleData.name}" assigné avec succès`,
      role: roleData,
      totalRoles: currentRoles.length,
      newPermissions: roleData.permissions
    };
    
  } catch (error) {
    console.error('❌ [EXTENDED] Erreur assignation rôle:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

// 4. FONCTION POUR ASSIGNER LES RÔLES MANQUANTS
const assignMissingRoles = async (userId) => {
  try {
    console.log('🎯 [MISSING] Assignation des rôles manquants...');
    
    // Assigner B2B
    console.log('📝 Assignation B2B...');
    const b2bResult = await extendedAssignRole(userId, 'b2b', 'extended-system');
    console.log('✅ B2B:', b2bResult);
    
    // Petite pause
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Assigner Gamification
    console.log('📝 Assignation Gamification...');
    const gamificationResult = await extendedAssignRole(userId, 'gamification', 'extended-system');
    console.log('✅ Gamification:', gamificationResult);
    
    return {
      success: true,
      message: 'Rôles B2B et Gamification assignés',
      results: {
        b2b: b2bResult,
        gamification: gamificationResult
      }
    };
    
  } catch (error) {
    console.error('❌ [MISSING] Erreur:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 5. FONCTION DE TEST COMPLET
const testAllRoles = async (userId) => {
  try {
    console.log('🧪 [TEST] Test de tous les rôles...');
    
    // Obtenir les rôles actuels
    const { getUserRoles } = await import('./ultimateRoleFix.js');
    const currentRoles = await getUserRoles(userId);
    
    console.log('📊 Rôles avant:', currentRoles.count);
    
    // Assigner les rôles manquants
    const result = await assignMissingRoles(userId);
    
    // Vérifier après
    const updatedRoles = await getUserRoles(userId);
    
    console.log('📊 Rôles après:', updatedRoles.count);
    console.log('🎭 Tous les rôles:', updatedRoles.roles.map(r => `${r.roleIcon || '🔸'} ${r.roleName}`));
    
    return {
      success: true,
      before: currentRoles.count,
      after: updatedRoles.count,
      allRoles: updatedRoles.roles
    };
    
  } catch (error) {
    console.error('❌ [TEST] Erreur:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 6. EXPOSER GLOBALEMENT
if (typeof window !== 'undefined') {
  // Mettre à jour les rôles globaux
  window.EXTENDED_ROLES_SYNERGIA = EXTENDED_ROLES_SYNERGIA;
  window.ADDITIONAL_ROLES = ADDITIONAL_ROLES;
  
  // Fonctions d'assignation étendues
  window.extendedAssignRole = extendedAssignRole;
  window.assignMissingRoles = assignMissingRoles;
  window.testAllRoles = testAllRoles;
  
  // Raccourcis pour les nouveaux rôles
  window.assignB2B = (userId) => extendedAssignRole(userId, 'b2b', 'direct');
  window.assignGamification = (userId) => extendedAssignRole(userId, 'gamification', 'direct');
  
  // Fonction pour obtenir TOUS les rôles (anciens + nouveaux)
  window.getAllAvailableRoles = () => {
    console.log('🎯 TOUS LES RÔLES DISPONIBLES:');
    Object.entries(EXTENDED_ROLES_SYNERGIA).forEach(([id, role]) => {
      console.log(`${role.icon} ${role.name} (${id}) - ${role.difficulty}`);
    });
    return EXTENDED_ROLES_SYNERGIA;
  };
  
  console.log('🎮 [EXTENDED] Système de rôles étendu chargé !');
  console.log('🆕 Nouveaux rôles ajoutés: B2B, Gamification');
  console.log('📚 Utilisation:');
  console.log('  • assignMissingRoles(userId) - Assigner B2B + Gamification');
  console.log('  • assignB2B(userId) - Assigner B2B seulement');
  console.log('  • assignGamification(userId) - Assigner Gamification seulement');
  console.log('  • testAllRoles(userId) - Test complet');
  console.log('  • getAllAvailableRoles() - Voir tous les rôles');
}

export { extendedAssignRole, assignMissingRoles, testAllRoles, EXTENDED_ROLES_SYNERGIA };
export default assignMissingRoles;
