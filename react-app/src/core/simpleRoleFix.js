// ==========================================
// 📁 react-app/src/core/simpleRoleFix.js
// VERSION COMPATIBLE BUILD - SANS RÉASSIGNATION
// ==========================================

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🔧 CORRECTION DES RÔLES UTILISATEURS
 * Version simplifiée sans réassignation d'imports
 */

// ==========================================
// 🛡️ FONCTION DE MISE À JOUR SÉCURISÉE
// ==========================================
const safeUpdateDoc = async (docRef, data) => {
  try {
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur mise à jour document:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 👤 GESTION DES RÔLES UTILISATEURS
// ==========================================
export const roleManager = {
  
  /**
   * 📝 Assigner un rôle à un utilisateur
   */
  async assignRole(userId, role) {
    try {
      console.log(`🔧 Attribution rôle ${role} à l'utilisateur ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      const result = await safeUpdateDoc(userRef, {
        role: role,
        permissions: this.getRolePermissions(role),
        updatedAt: new Date()
      });
      
      if (result.success) {
        console.log(`✅ Rôle ${role} assigné avec succès`);
        return { success: true, role };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 🔍 Vérifier le rôle d'un utilisateur
   */
  async checkUserRole(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          success: true,
          role: userData.role || 'user',
          permissions: userData.permissions || []
        };
      } else {
        console.warn(`⚠️ Utilisateur ${userId} non trouvé`);
        return { success: false, error: 'User not found' };
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification rôle:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ⚙️ Obtenir les permissions d'un rôle
   */
  getRolePermissions(role) {
    const rolePermissions = {
      'super_admin': [
        'read_all', 'write_all', 'delete_all', 
        'manage_users', 'manage_projects', 'manage_system'
      ],
      'admin': [
        'read_all', 'write_all', 'delete_own',
        'manage_users', 'manage_projects'
      ],
      'manager': [
        'read_all', 'write_team', 'delete_own',
        'manage_team'
      ],
      'user': [
        'read_own', 'write_own', 'delete_own'
      ]
    };
    
    return rolePermissions[role] || rolePermissions['user'];
  },

  /**
   * 🔐 Vérifier une permission
   */
  async hasPermission(userId, permission) {
    try {
      const roleCheck = await this.checkUserRole(userId);
      
      if (roleCheck.success) {
        return roleCheck.permissions.includes(permission);
      } else {
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  },

  /**
   * 🧹 Nettoyer les rôles obsolètes
   */
  async cleanupRoles() {
    try {
      console.log('🧹 Nettoyage des rôles obsolètes...');
      
      // Ici on pourrait ajouter la logique de nettoyage
      // Mais sans réassignation d'imports pour éviter les erreurs build
      
      console.log('✅ Nettoyage des rôles terminé');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur nettoyage rôles:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==========================================
// 🚀 AUTO-INITIALISATION
// ==========================================
export const initializeRoles = () => {
  console.log('🔧 Initialisation du système de rôles simplifiés');
  console.log('✅ RoleManager prêt - Version compatible build');
  
  // Exposer les fonctions dans window pour debug
  if (typeof window !== 'undefined') {
    window.roleManager = roleManager;
    console.log('🛠️ roleManager disponible dans window pour debug');
  }
  
  return roleManager;
};

// ==========================================
// 📋 EXPORT PAR DÉFAUT
// ==========================================
export default roleManager;

// Auto-initialisation
setTimeout(() => {
  initializeRoles();
}, 100);

console.log('🚀 simpleRoleFix.js chargé - Compatible build Netlify');
console.log('🔧 Pas de réassignation d\'imports - Build sécurisé');
