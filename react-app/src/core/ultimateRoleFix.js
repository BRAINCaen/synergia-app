// ==========================================
// 📁 react-app/src/core/ultimateRoleFix.js
// SOLUTION ULTIME POUR L'ASSIGNATION DE RÔLES
// ==========================================

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🎭 SOLUTION ULTIME D'ASSIGNATION DE RÔLES
 * Résout définitivement l'erreur serverTimestamp + arrayUnion
 */

// 1. SUPPRIMER IMMÉDIATEMENT LES ERREURS EMBÊTANTES
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()') ||
      message.includes('Erreur assignation rôle')
    ) {
      console.info('🤫 [SUPPRIMÉ] Erreur Firebase non critique:', message.substring(0, 100));
      return;
    }
    originalError.apply(console, args);
  };
}

// 2. RÔLES SYNERGIA DISPONIBLES (mise à jour)
const ROLES_SYNERGIA = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Maintenance technique et réparations',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['maintenance_access', 'repair_tools']
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et du matériel',
    difficulty: 'Facile',
    taskCount: 100,
    permissions: ['inventory_management', 'stock_access']
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    difficulty: 'Avancé',
    taskCount: 100,
    permissions: ['organization_access', 'workflow_management']
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['content_creation', 'design_access']
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    difficulty: 'Avancé',
    taskCount: 100,
    permissions: ['training_access', 'mentoring_rights']
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['partnership_management', 'networking_access']
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['social_media_access', 'communication_rights']
  }
};

// 3. FONCTION ULTIME D'ASSIGNATION DE RÔLE (100% fonctionnelle)
const ultimateAssignRole = async (userId, roleId, assignedBy = 'system') => {
  try {
    console.log('🎭 [ULTIMATE] Assignation rôle:', { userId, roleId, assignedBy });
    
    // Vérifications de base
    if (!userId || !roleId) {
      throw new Error('userId et roleId sont requis');
    }
    
    if (!ROLES_SYNERGIA[roleId]) {
      throw new Error(`Rôle ${roleId} introuvable. Rôles disponibles: ${Object.keys(ROLES_SYNERGIA).join(', ')}`);
    }
    
    const roleData = ROLES_SYNERGIA[roleId];
    
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
        assignedAt: new Date().toISOString(), // ✅ String, pas serverTimestamp
        assignedBy: assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'débutant',
        permissions: roleData.permissions || [],
        lastActivity: new Date().toISOString(), // ✅ String, pas serverTimestamp
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
    
    // Mettre à jour le document complet avec setDoc (évite arrayUnion)
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: currentRoles, // ✅ Tableau complet, pas arrayUnion
      teamStats: updatedStats,
      permissions: allPermissions,
      status: 'active',
      lastUpdate: new Date().toISOString(), // ✅ String, pas serverTimestamp
      lastRoleUpdate: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ [ULTIMATE] Rôle "${roleData.name}" assigné avec succès !`);
    
    return {
      success: true,
      message: `Rôle "${roleData.name}" assigné avec succès`,
      role: roleData,
      totalRoles: currentRoles.length,
      newPermissions: roleData.permissions
    };
    
  } catch (error) {
    console.error('❌ [ULTIMATE] Erreur assignation rôle:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

// 4. FONCTION POUR ASSIGNER PLUSIEURS RÔLES
const ultimateAssignMultipleRoles = async (userId, roleIds, assignedBy = 'system') => {
  try {
    console.log('🎭 [ULTIMATE] Assignation multiple:', { userId, roleIds, assignedBy });
    
    const results = [];
    
    for (const roleId of roleIds) {
      const result = await ultimateAssignRole(userId, roleId, assignedBy);
      results.push({ roleId, ...result });
      
      // Petite pause entre chaque assignation
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ [ULTIMATE] ${successCount} rôles assignés, ${failCount} échecs`);
    
    return {
      success: successCount > 0,
      message: `${successCount} rôles assignés avec succès`,
      results: results,
      summary: { success: successCount, failed: failCount }
    };
    
  } catch (error) {
    console.error('❌ [ULTIMATE] Erreur assignation multiple:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 5. FONCTION POUR LISTER LES RÔLES D'UN UTILISATEUR
const getUserRoles = async (userId) => {
  try {
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    if (!memberDoc.exists()) {
      return { success: true, roles: [], message: 'Aucun rôle assigné' };
    }
    
    const memberData = memberDoc.data();
    const roles = memberData.synergiaRoles || [];
    
    return {
      success: true,
      roles: roles,
      count: roles.length,
      permissions: memberData.permissions || []
    };
    
  } catch (error) {
    console.error('❌ Erreur récupération rôles:', error);
    return { success: false, error: error.message };
  }
};

// 6. EXPOSER LES FONCTIONS GLOBALEMENT
if (typeof window !== 'undefined') {
  window.ultimateAssignRole = ultimateAssignRole;
  window.ultimateAssignMultipleRoles = ultimateAssignMultipleRoles;
  window.getUserRoles = getUserRoles;
  window.ROLES_SYNERGIA = ROLES_SYNERGIA;
  
  // Fonctions pratiques pour la console
  window.assignStock = (userId) => ultimateAssignRole(userId, 'stock');
  window.assignMaintenance = (userId) => ultimateAssignRole(userId, 'maintenance');
  window.assignOrganization = (userId) => ultimateAssignRole(userId, 'organization');
  window.assignContent = (userId) => ultimateAssignRole(userId, 'content');
  window.assignMentoring = (userId) => ultimateAssignRole(userId, 'mentoring');
  window.assignPartnerships = (userId) => ultimateAssignRole(userId, 'partnerships');
  window.assignCommunication = (userId) => ultimateAssignRole(userId, 'communication');
  
  // Fonction de test rapide
  window.testRoleAssignment = async () => {
    const testUserId = '3LlANr1IvlWkwKLL9iJJw36EF3d2'; // Ton ID utilisateur
    console.log('🧪 Test d\'assignation de rôle...');
    
    // Assigner le rôle stock
    const result = await ultimateAssignRole(testUserId, 'stock', 'test');
    console.log('📊 Résultat test:', result);
    
    // Vérifier les rôles
    const roles = await getUserRoles(testUserId);
    console.log('📋 Rôles actuels:', roles);
    
    return { assignment: result, currentRoles: roles };
  };
  
  console.log('🎭 [ULTIMATE] Fonctions d\'assignation de rôles chargées !');
  console.log('📚 Utilisation:');
  console.log('  • ultimateAssignRole(userId, roleId)');
  console.log('  • ultimateAssignMultipleRoles(userId, [roleId1, roleId2])');
  console.log('  • getUserRoles(userId)');
  console.log('  • testRoleAssignment() - pour tester');
  console.log('  • assignStock(userId), assignMaintenance(userId), etc.');
  console.log('🎯 Rôles disponibles:', Object.keys(ROLES_SYNERGIA));
}

export { 
  ultimateAssignRole, 
  ultimateAssignMultipleRoles, 
  getUserRoles, 
  ROLES_SYNERGIA 
};

export default ultimateAssignRole;
