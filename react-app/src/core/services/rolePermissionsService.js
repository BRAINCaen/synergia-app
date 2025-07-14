// ==========================================
// 📁 react-app/src/core/services/rolePermissionsService.js
// SERVICE GESTION DES PERMISSIONS PAR RÔLE SYNERGIA
// ==========================================

import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔐 SERVICE DE GESTION DES PERMISSIONS PAR RÔLE
 * Gère les permissions d'administration selon les rôles Synergia
 */
class RolePermissionsService {
  constructor() {
    this.ROLE_PERMISSIONS_COLLECTION = 'rolePermissions';
    this.USERS_COLLECTION = 'users';
  }

  /**
   * 🛡️ VÉRIFIER SI UN UTILISATEUR A UNE PERMISSION SPÉCIFIQUE
   */
  async hasPermission(userId, permission) {
    try {
      console.log('🔍 Vérification permission:', { userId, permission });
      
      // Récupérer l'utilisateur et ses rôles
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return false;
      }
      
      const userData = userDoc.data();
      const userRoles = userData.synergiaRoles || [];
      
      // Vérifier chaque rôle de l'utilisateur
      for (const userRole of userRoles) {
        const hasRolePermission = await this.roleHasPermission(userRole.roleId, permission);
        if (hasRolePermission) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * 🎭 VÉRIFIER SI UN RÔLE A UNE PERMISSION
   */
  async roleHasPermission(roleId, permission) {
    try {
      const rolePermRef = doc(db, this.ROLE_PERMISSIONS_COLLECTION, roleId);
      const rolePermDoc = await getDoc(rolePermRef);
      
      if (!rolePermDoc.exists()) {
        return false;
      }
      
      const rolePermData = rolePermDoc.data();
      return rolePermData.permissions?.includes(permission) || false;
      
    } catch (error) {
      console.error('❌ Erreur vérification permission rôle:', error);
      return false;
    }
  }

  /**
   * 📋 OBTENIR TOUTES LES PERMISSIONS D'UN UTILISATEUR
   */
  async getUserPermissions(userId) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const userData = userDoc.data();
      const userRoles = userData.synergiaRoles || [];
      
      const allPermissions = new Set();
      
      // Collecter toutes les permissions de tous les rôles
      for (const userRole of userRoles) {
        const rolePermissions = await this.getRolePermissions(userRole.roleId);
        rolePermissions.forEach(permission => allPermissions.add(permission));
      }
      
      return Array.from(allPermissions);
      
    } catch (error) {
      console.error('❌ Erreur récupération permissions utilisateur:', error);
      return [];
    }
  }

  /**
   * 🎯 OBTENIR LES PERMISSIONS D'UN RÔLE
   */
  async getRolePermissions(roleId) {
    try {
      const rolePermRef = doc(db, this.ROLE_PERMISSIONS_COLLECTION, roleId);
      const rolePermDoc = await getDoc(rolePermRef);
      
      if (!rolePermDoc.exists()) {
        return [];
      }
      
      const rolePermData = rolePermDoc.data();
      return rolePermData.permissions || [];
      
    } catch (error) {
      console.error('❌ Erreur récupération permissions rôle:', error);
      return [];
    }
  }

  /**
   * 💾 DÉFINIR LES PERMISSIONS D'UN RÔLE
   */
  async setRolePermissions(roleId, permissions, updatedBy = 'system') {
    try {
      console.log('💾 Définition permissions rôle:', { roleId, permissions });
      
      const rolePermRef = doc(db, this.ROLE_PERMISSIONS_COLLECTION, roleId);
      
      const permissionData = {
        roleId,
        permissions: Array.isArray(permissions) ? permissions : [permissions],
        updatedAt: new Date().toISOString(),
        updatedBy
      };
      
      await setDoc(rolePermRef, permissionData, { merge: true });
      
      console.log('✅ Permissions rôle mises à jour');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur définition permissions rôle:', error);
      throw error;
    }
  }

  /**
   * ➕ AJOUTER UNE PERMISSION À UN RÔLE
   */
  async addPermissionToRole(roleId, permission, updatedBy = 'system') {
    try {
      const currentPermissions = await this.getRolePermissions(roleId);
      
      if (!currentPermissions.includes(permission)) {
        const newPermissions = [...currentPermissions, permission];
        await this.setRolePermissions(roleId, newPermissions, updatedBy);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur ajout permission:', error);
      throw error;
    }
  }

  /**
   * ➖ RETIRER UNE PERMISSION D'UN RÔLE
   */
  async removePermissionFromRole(roleId, permission, updatedBy = 'system') {
    try {
      const currentPermissions = await this.getRolePermissions(roleId);
      const newPermissions = currentPermissions.filter(p => p !== permission);
      
      await this.setRolePermissions(roleId, newPermissions, updatedBy);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression permission:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR UN RAPPORT COMPLET DES PERMISSIONS
   */
  async getPermissionsReport() {
    try {
      console.log('📊 Génération rapport permissions...');
      
      // Récupérer tous les utilisateurs
      const usersRef = collection(db, this.USERS_COLLECTION);
      const usersSnapshot = await getDocs(usersRef);
      
      // Récupérer toutes les permissions de rôles
      const rolePermRef = collection(db, this.ROLE_PERMISSIONS_COLLECTION);
      const rolePermSnapshot = await getDocs(rolePermRef);
      
      const rolePermissions = {};
      rolePermSnapshot.forEach(doc => {
        rolePermissions[doc.id] = doc.data();
      });
      
      const report = {
        totalUsers: 0,
        usersWithRoles: 0,
        rolesReport: {},
        permissionsReport: {},
        usersByRole: {},
        generatedAt: new Date().toISOString()
      };
      
      // Analyser chaque utilisateur
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userRoles = userData.synergiaRoles || [];
        
        report.totalUsers++;
        
        if (userRoles.length > 0) {
          report.usersWithRoles++;
          
          userRoles.forEach(userRole => {
            const roleId = userRole.roleId;
            
            // Compter les utilisateurs par rôle
            if (!report.usersByRole[roleId]) {
              report.usersByRole[roleId] = [];
            }
            report.usersByRole[roleId].push({
              id: doc.id,
              email: userData.email,
              displayName: userData.displayName
            });
            
            // Compter les permissions
            const rolePerms = rolePermissions[roleId]?.permissions || [];
            rolePerms.forEach(permission => {
              if (!report.permissionsReport[permission]) {
                report.permissionsReport[permission] = 0;
              }
              report.permissionsReport[permission]++;
            });
          });
        }
      });
      
      // Compléter le rapport des rôles
      Object.keys(rolePermissions).forEach(roleId => {
        const roleData = rolePermissions[roleId];
        report.rolesReport[roleId] = {
          permissions: roleData.permissions || [],
          permissionCount: (roleData.permissions || []).length,
          userCount: report.usersByRole[roleId]?.length || 0,
          lastUpdated: roleData.updatedAt,
          updatedBy: roleData.updatedBy
        };
      });
      
      console.log('✅ Rapport permissions généré');
      return report;
      
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * 🔧 INITIALISER LES PERMISSIONS PAR DÉFAUT
   */
  async initializeDefaultPermissions() {
    try {
      console.log('🔧 Initialisation permissions par défaut...');
      
      const defaultRolePermissions = {
        mentoring: {
          permissions: ['onboarding_admin', 'training_access', 'mentoring_rights'],
          adminSections: ['Onboarding', 'Formation']
        },
        organization: {
          permissions: ['planning_admin', 'timetrack_admin', 'tasks_admin', 'projects_admin'],
          adminSections: ['Planning', 'Pointeuse', 'Tâches', 'Projets']
        },
        gamemaster: {
          permissions: ['session_admin', 'user_management', 'analytics_admin', 'full_access'],
          adminSections: ['Sessions', 'Utilisateurs', 'Analytics', 'Système']
        },
        reputation: {
          permissions: ['reviews_admin', 'communication_admin', 'social_media_admin'],
          adminSections: ['Avis', 'Communication', 'Réseaux Sociaux']
        },
        content: {
          permissions: ['content_admin', 'design_admin', 'media_admin'],
          adminSections: ['Contenu', 'Design', 'Médias']
        },
        maintenance: {
          permissions: ['maintenance_admin', 'equipment_admin', 'technical_admin'],
          adminSections: ['Maintenance', 'Équipement', 'Technique']
        },
        stock: {
          permissions: ['inventory_admin', 'stock_admin', 'suppliers_admin'],
          adminSections: ['Inventaire', 'Stock', 'Fournisseurs']
        },
        partnerships: {
          permissions: ['partnerships_admin', 'external_relations_admin', 'marketing_admin'],
          adminSections: ['Partenariats', 'Relations Externes', 'Marketing']
        }
      };
      
      // Créer les documents de permissions pour chaque rôle
      for (const [roleId, roleConfig] of Object.entries(defaultRolePermissions)) {
        await this.setRolePermissions(roleId, roleConfig.permissions, 'system');
        
        // Ajouter les sections d'administration
        const rolePermRef = doc(db, this.ROLE_PERMISSIONS_COLLECTION, roleId);
        await updateDoc(rolePermRef, {
          adminSections: roleConfig.adminSections
        });
      }
      
      console.log('✅ Permissions par défaut initialisées');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur initialisation permissions:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER LES ACCÈS POUR UNE SECTION SPÉCIFIQUE
   */
  async canAccessSection(userId, section) {
    try {
      const sectionPermissions = {
        'Onboarding': ['onboarding_view', 'onboarding_edit', 'onboarding_admin'],
        'Planning': ['planning_view', 'planning_edit', 'planning_admin'],
        'Pointeuse': ['timetrack_view', 'timetrack_edit', 'timetrack_admin'],
        'Tâches': ['tasks_view', 'tasks_edit', 'tasks_admin'],
        'Projets': ['projects_view', 'projects_edit', 'projects_admin'],
        'Analytics': ['analytics_view', 'analytics_admin'],
        'Utilisateurs': ['users_view', 'users_edit', 'user_management']
      };
      
      const requiredPermissions = sectionPermissions[section] || [];
      
      for (const permission of requiredPermissions) {
        const hasPermission = await this.hasPermission(userId, permission);
        if (hasPermission) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erreur vérification accès section:', error);
      return false;
    }
  }

  /**
   * 🎯 OBTENIR LE NIVEAU D'ACCÈS POUR UNE SECTION
   */
  async getAccessLevel(userId, section) {
    try {
      const adminPermission = `${section.toLowerCase()}_admin`;
      const editPermission = `${section.toLowerCase()}_edit`;
      const viewPermission = `${section.toLowerCase()}_view`;
      
      if (await this.hasPermission(userId, adminPermission)) {
        return 'admin';
      } else if (await this.hasPermission(userId, editPermission)) {
        return 'edit';
      } else if (await this.hasPermission(userId, viewPermission)) {
        return 'view';
      }
      
      return 'none';
      
    } catch (error) {
      console.error('❌ Erreur détermination niveau accès:', error);
      return 'none';
    }
  }

  /**
   * 🔄 SYNCHRONISER LES PERMISSIONS AVEC LES RÔLES ACTUELS
   */
  async syncPermissionsWithCurrentRoles() {
    try {
      console.log('🔄 Synchronisation permissions avec rôles actuels...');
      
      // Récupérer tous les utilisateurs
      const usersRef = collection(db, this.USERS_COLLECTION);
      const usersSnapshot = await getDocs(usersRef);
      
      const rolesInUse = new Set();
      
      // Identifier tous les rôles en cours d'utilisation
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userRoles = userData.synergiaRoles || [];
        
        userRoles.forEach(userRole => {
          rolesInUse.add(userRole.roleId);
        });
      });
      
      // Initialiser les permissions pour les rôles en cours d'utilisation
      for (const roleId of rolesInUse) {
        const existingPermissions = await this.getRolePermissions(roleId);
        
        if (existingPermissions.length === 0) {
          // Initialiser avec les permissions par défaut si aucune n'existe
          await this.initializeDefaultPermissions();
        }
      }
      
      console.log(`✅ Synchronisation terminée pour ${rolesInUse.size} rôles`);
      return { 
        success: true, 
        rolesProcessed: Array.from(rolesInUse),
        totalRoles: rolesInUse.size
      };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation permissions:', error);
      throw error;
    }
  }
}

// Créer et exporter l'instance du service
const rolePermissionsService = new RolePermissionsService();

// Méthodes utilitaires exportées
export const checkPermission = (userId, permission) => 
  rolePermissionsService.hasPermission(userId, permission);

export const getUserPermissions = (userId) => 
  rolePermissionsService.getUserPermissions(userId);

export const canAccessSection = (userId, section) => 
  rolePermissionsService.canAccessSection(userId, section);

export const getAccessLevel = (userId, section) => 
  rolePermissionsService.getAccessLevel(userId, section);

export default rolePermissionsService;
