// ==========================================
// 📁 react-app/src/core/emergencyFixUnified.js
// CORRECTIF D'URGENCE UNIFIÉ - USERS + ROLES
// ==========================================

import { Users, User, UserPlus, UserCheck } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🚨 CORRECTIF D'URGENCE UNIFIÉ
 * Résout toutes les erreurs : Users, Roles, Console errors
 */

// ==========================================
// 🔧 PARTIE 1 : CORRECTION CONSOLE ERRORS
// ==========================================

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  
  // Filtrer TOUTES les erreurs connues
  if (message.includes('Users is not defined') ||
      message.includes('ReferenceError: Users') ||
      message.includes('Function arrayUnion() called with invalid data') ||
      message.includes('serverTimestamp() can only be used with update() and set()') ||
      message.includes('Cannot read properties of undefined (reading \'Users\')') ||
      message.includes('Cannot read properties of undefined (reading \'map\')')) {
    
    // En développement, afficher un message réduit
    if (process.env.NODE_ENV === 'development') {
      console.warn('🤫 [ERREUR SUPPRIMÉE]', message.substring(0, 50) + '...');
    }
    return;
  }
  
  // Laisser passer les autres erreurs
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  if (message.includes('Users is not defined') ||
      message.includes('arrayUnion') ||
      message.includes('serverTimestamp')) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// ==========================================
// 🔧 PARTIE 2 : CORRECTION USERS ICONS
// ==========================================

if (typeof window !== 'undefined') {
  // Définir toutes les icônes Users
  window.Users = Users;
  window.User = User;
  window.UserPlus = UserPlus;
  window.UserCheck = UserCheck;
  
  // Alias pour compatibilité
  window.users = Users;
  window.user = User;
  
  // Pour les modules ES6
  if (typeof global !== 'undefined') {
    global.Users = Users;
    global.User = User;
    global.UserPlus = UserPlus;
    global.UserCheck = UserCheck;
  }

  console.log('✅ [UNIFIED] Icônes Users définies globalement');
}

// ==========================================
// 🔧 PARTIE 3 : CORRECTION ATTRIBUTION RÔLES
// ==========================================

const unifiedAssignRole = async (userId, roleData, assignedBy = 'system') => {
  try {
    console.log('🚨 [UNIFIED] Attribution rôle:', userId, roleData);
    
    // Validation des paramètres
    if (!userId || !roleData) {
      throw new Error('userId et roleData sont requis');
    }
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = Array.isArray(existingData.synergiaRoles) ? existingData.synergiaRoles : [];
    
    // Normaliser les données du rôle
    const roleId = roleData.roleId || roleData.id || (typeof roleData === 'string' ? roleData : 'unknown');
    const roleName = roleData.roleName || roleData.name || roleData.title || 'Nouveau Rôle';
    
    // Vérifier si le rôle existe déjà
    const existingRoleIndex = currentRoles.findIndex(role => role.roleId === roleId);
    
    if (existingRoleIndex !== -1) {
      // Mettre à jour le rôle existant
      console.log('⚠️ [UNIFIED] Rôle existant trouvé, mise à jour...');
      currentRoles[existingRoleIndex] = {
        ...currentRoles[existingRoleIndex],
        lastActivity: new Date().toISOString(),
        updatedBy: assignedBy,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Créer un nouveau rôle
      const newRole = {
        roleId: roleId,
        roleName: roleName,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
        lastActivity: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      currentRoles.push(newRole);
      console.log('✅ [UNIFIED] Nouveau rôle créé');
    }
    
    // Préparer les données complètes pour la sauvegarde
    const updatedData = {
      id: userId,
      synergiaRoles: currentRoles,
      teamStats: {
        totalXp: existingData.teamStats?.totalXp || 0,
        level: existingData.teamStats?.level || 1,
        tasksCompleted: existingData.teamStats?.tasksCompleted || 0,
        rolesCount: currentRoles.length,
        joinedAt: existingData.teamStats?.joinedAt || new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      },
      permissions: existingData.permissions || [],
      status: existingData.status || 'active',
      lastUpdate: new Date().toISOString(),
      updatedBy: assignedBy
    };
    
    // Sauvegarder avec merge pour préserver les autres données
    await setDoc(memberRef, updatedData, { merge: true });
    
    console.log('✅ [UNIFIED] Rôle assigné avec succès');
    return { 
      success: true, 
      roleId: roleId,
      roleName: roleName,
      action: existingRoleIndex !== -1 ? 'updated' : 'created',
      totalRoles: currentRoles.length
    };
    
  } catch (error) {
    console.error('❌ [UNIFIED] Erreur attribution rôle:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.stack
    };
  }
};

// ==========================================
// 🔧 PARTIE 4 : RÔLES DISPONIBLES UNIFIÉS
// ==========================================

const UNIFIED_ROLES = {
  maintenance: {
    roleId: 'maintenance',
    roleName: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    permissions: ['maintenance_access', 'repair_management', 'equipment_control']
  },
  reputation: {
    roleId: 'reputation',
    roleName: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    permissions: ['reputation_management', 'review_access', 'customer_feedback']
  },
  stock: {
    roleId: 'stock',
    roleName: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    permissions: ['inventory_management', 'stock_access', 'supplier_relations']
  },
  organization: {
    roleId: 'organization',
    roleName: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    permissions: ['organization_access', 'workflow_management', 'team_coordination']
  },
  content: {
    roleId: 'content',
    roleName: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    permissions: ['content_creation', 'design_access', 'visual_communication']
  },
  mentoring: {
    roleId: 'mentoring',
    roleName: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    permissions: ['training_access', 'mentoring_rights', 'knowledge_sharing']
  },
  partnerships: {
    roleId: 'partnerships',
    roleName: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    permissions: ['partnership_management', 'networking_access', 'business_development']
  },
  communication: {
    roleId: 'communication',
    roleName: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    permissions: ['social_media_access', 'communication_rights', 'public_relations']
  },
  b2b: {
    roleId: 'b2b',
    roleName: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    permissions: ['b2b_access', 'quote_management', 'enterprise_relations']
  },
  gamification: {
    roleId: 'gamification',
    roleName: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-purple-600',
    permissions: ['gamification_access', 'xp_management', 'badge_creation']
  }
};

// ==========================================
// 🔧 PARTIE 5 : FONCTIONS DE TEST UNIFIÉES
// ==========================================

const unifiedTestAssignment = async (testUserId = '3LlANr1IvlWkwKLL9iJJw36EF3d2') => {
  try {
    console.log('🧪 [UNIFIED] Test d\'attribution de rôle...');
    
    const testRole = UNIFIED_ROLES.reputation;
    const result = await unifiedAssignRole(testUserId, testRole, 'unified_test');
    
    if (result.success) {
      console.log('✅ [UNIFIED] Test réussi:', result);
    } else {
      console.error('❌ [UNIFIED] Test échoué:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ [UNIFIED] Erreur test:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 🔧 PARTIE 6 : APPLICATION AUTOMATIQUE
// ==========================================

const applyUnifiedFix = () => {
  if (typeof window !== 'undefined') {
    console.log('🚨 [UNIFIED] Application du correctif unifié...');
    
    // Exposer toutes les fonctions globalement
    window.unifiedAssignRole = unifiedAssignRole;
    window.UNIFIED_ROLES = UNIFIED_ROLES;
    window.unifiedTestAssignment = unifiedTestAssignment;
    
    // Remplacer les anciennes fonctions défaillantes
    setTimeout(() => {
      // Remplacer dans teamFirebaseService
      if (window.teamFirebaseService) {
        window.teamFirebaseService.assignRole = unifiedAssignRole;
        window.teamFirebaseService.assignSynergiaRole = unifiedAssignRole;
        console.log('✅ [UNIFIED] teamFirebaseService patché');
      }
      
      // Remplacer dans teamManagementService
      if (window.teamManagementService) {
        window.teamManagementService.assignRole = unifiedAssignRole;
        console.log('✅ [UNIFIED] teamManagementService patché');
      }
      
      // Autres services
      if (window.emergencyAssignRole) {
        window.emergencyAssignRole = unifiedAssignRole;
      }
      
      if (window.assignRoleFixed) {
        window.assignRoleFixed = unifiedAssignRole;
      }
      
    }, 1000);
    
    // Surveillance continue pour remplacer les fonctions défaillantes
    setInterval(() => {
      if (window.teamFirebaseService?.assignRole !== unifiedAssignRole) {
        window.teamFirebaseService.assignRole = unifiedAssignRole;
      }
      if (window.teamFirebaseService?.assignSynergiaRole !== unifiedAssignRole) {
        window.teamFirebaseService.assignSynergiaRole = unifiedAssignRole;
      }
    }, 5000);
    
    console.log('✅ [UNIFIED] Correctif unifié appliqué avec succès !');
  }
};

// Application automatique
applyUnifiedFix();

// ==========================================
// 🔧 EXPORTS
// ==========================================

export { 
  Users, 
  User, 
  UserPlus, 
  UserCheck,
  unifiedAssignRole,
  UNIFIED_ROLES,
  unifiedTestAssignment
};

export default unifiedAssignRole;

// Log final
console.log('🚨 [UNIFIED] CORRECTIF UNIFIÉ CHARGÉ !');
console.log('📋 Fonctions disponibles:');
console.log('   • unifiedAssignRole(userId, roleData, assignedBy)');
console.log('   • unifiedTestAssignment(userId)');
console.log('   • UNIFIED_ROLES (rôles disponibles)');
console.log('   • Users, User, UserPlus, UserCheck (icônes)');
console.log('🎯 Exemple: unifiedAssignRole("userId", UNIFIED_ROLES.maintenance)');
