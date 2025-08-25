// ==========================================
// 📁 react-app/src/core/services/adminService.js
// SERVICE ADMIN UNIVERSEL - VERSION COMPLÈTE AVEC hasPermission
// ==========================================

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛡️ SERVICE ADMIN UNIVERSEL
 * Fonction isAdmin() et hasPermission() complètes
 */
class AdminService {
  constructor() {
    this.adminEmails = [
      'alan.boehme61@gmail.com' // Email admin principal
    ];
    this.cache = new Map(); // Cache des vérifications
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * 🛡️ FONCTION isAdmin() CORRIGÉE ET ROBUSTE
   * Vérifie TOUTES les méthodes possibles d'admin
   */
  isAdmin(user) {
    if (!user) {
      console.warn('⚠️ isAdmin: user manquant');
      return false;
    }

    try {
      // 1. Vérification par email (méthode de secours)
      const isAdminEmail = this.adminEmails.includes(user.email);
      
      // 2. Vérification par rôle (principale)
      const isRoleAdmin = user.role === 'admin';
      
      // 3. Vérification par flag isAdmin
      const hasAdminFlag = user.isAdmin === true;
      
      // 4. Vérification par rôle dans le profil
      const isProfileRoleAdmin = user.profile?.role === 'admin';
      
      // 5. Vérification par permissions
      const hasAdminPermissions = Array.isArray(user.permissions) && 
        user.permissions.includes('admin_access');
      
      // 6. Vérification par rôle manager (niveau élevé)
      const isManager = user.role === 'manager';
      
      // Résultat final - Vrai si au moins une condition est remplie
      const result = isAdminEmail || isRoleAdmin || hasAdminFlag || 
                    isProfileRoleAdmin || hasAdminPermissions || isManager;
      
      if (result) {
        console.log('✅ Accès admin accordé pour:', user.email);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      return false; // En cas d'erreur, refus par sécurité
    }
  }

  /**
   * 🔑 FONCTION hasPermission() - NOUVELLE FONCTION AJOUTÉE
   * Vérifie si un utilisateur a une permission spécifique
   */
  hasPermission(user, permission) {
    if (!user || !permission) {
      console.warn('⚠️ hasPermission: paramètres manquants', { user: !!user, permission });
      return false;
    }

    try {
      // 1. Si l'utilisateur est admin, il a toutes les permissions
      if (this.isAdmin(user)) {
        return true;
      }

      // 2. Vérification dans le tableau permissions
      if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
        return true;
      }

      // 3. Vérification dans profile.permissions
      if (Array.isArray(user.profile?.permissions) && user.profile.permissions.includes(permission)) {
        return true;
      }

      // 4. Permissions par rôle
      const rolePermissions = this.getRolePermissions(user.role);
      if (rolePermissions.includes(permission)) {
        return true;
      }

      // 5. Permissions spéciales par email pour dev
      if (user.email === 'alan.boehme61@gmail.com') {
        return true; // Admin principal a toutes les permissions
      }

      return false;

    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false; // En cas d'erreur, refus par sécurité
    }
  }

  /**
   * 🎭 OBTENIR LES PERMISSIONS PAR RÔLE
   */
  getRolePermissions(role) {
    const rolePermissionsMap = {
      'admin': [
        'admin_access',
        'manage_users',
        'manage_badges',
        'validate_tasks',
        'validate_xp',
        'view_analytics',
        'manage_projects',
        'system_config',
        'full_access',
        'manage_rewards',
        'manage_permissions'
      ],
      'manager': [
        'manage_users',
        'validate_tasks',
        'view_analytics',
        'manage_projects',
        'manage_team'
      ],
      'lead': [
        'validate_tasks',
        'view_analytics',
        'manage_projects'
      ],
      'member': [
        'view_basic',
        'edit_own_profile'
      ]
    };

    return rolePermissionsMap[role] || [];
  }

  /**
   * 🔍 VÉRIFICATION ADMIN AVEC FIREBASE (VERSION ASYNC)
   */
  async checkAdminWithFirebase(user) {
    if (!user?.uid) return false;

    try {
      // Vérifier le cache d'abord
      const cacheKey = `admin_${user.uid}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        return cached.isAdmin;
      }

      // Récupérer depuis Firebase
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur non trouvé dans Firestore:', user.uid);
        return this.isAdmin(user); // Fallback sur vérification locale
      }

      const userData = userDoc.data();
      const combinedUser = { ...user, ...userData };
      const result = this.isAdmin(combinedUser);

      // Mettre en cache
      this.cache.set(cacheKey, {
        isAdmin: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur vérification Firebase admin:', error);
      return this.isAdmin(user); // Fallback sur vérification locale
    }
  }

  /**
   * 🔑 VÉRIFICATION PERMISSION AVEC FIREBASE (VERSION ASYNC)
   */
  async checkPermissionWithFirebase(user, permission) {
    if (!user?.uid) return false;

    try {
      // Récupérer les données utilisateur complètes depuis Firebase
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('⚠️ Utilisateur non trouvé dans Firestore:', user.uid);
        return this.hasPermission(user, permission); // Fallback sur vérification locale
      }

      const userData = userDoc.data();
      const combinedUser = { ...user, ...userData };
      
      return this.hasPermission(combinedUser, permission);

    } catch (error) {
      console.error('❌ Erreur vérification Firebase permission:', error);
      return this.hasPermission(user, permission); // Fallback sur vérification locale
    }
  }

  /**
   * 🚀 FONCTION DE FORÇAGE ADMIN (URGENCE)
   */
  async forceAdminAccess(userEmail = 'alan.boehme61@gmail.com') {
    try {
      console.log('🚀 Forçage accès admin pour:', userEmail);
      
      const userRef = doc(db, 'users', userEmail);
      
      const adminConfig = {
        role: 'admin',
        isAdmin: true,
        permissions: [
          'admin_access',
          'manage_users',
          'manage_badges',
          'validate_tasks',
          'validate_xp',
          'view_analytics',
          'manage_projects',
          'system_config',
          'full_access'
        ],
        profile: {
          role: 'admin',
          permissions: [
            'admin_access',
            'full_access'
          ]
        },
        adminSince: new Date(),
        lastAdminUpdate: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userRef, adminConfig, { merge: true });
      
      // Nettoyer le cache
      this.clearCache();
      
      console.log('✅ Accès admin forcé avec succès');
      return { success: true, message: 'Accès admin configuré' };
      
    } catch (error) {
      console.error('❌ Erreur forçage admin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 DIAGNOSTIC COMPLET DES PERMISSIONS
   */
  diagnoseAdminAccess(user) {
    if (!user) return { error: 'Utilisateur manquant' };

    const diagnosis = {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      checks: {
        isAdminEmail: this.adminEmails.includes(user.email),
        isRoleAdmin: user.role === 'admin',
        hasAdminFlag: user.isAdmin === true,
        isProfileRoleAdmin: user.profile?.role === 'admin',
        hasAdminPermissions: Array.isArray(user.permissions) && user.permissions.includes('admin_access'),
        isManager: user.role === 'manager'
      },
      permissions: user.permissions || [],
      profilePermissions: user.profile?.permissions || [],
      rolePermissions: this.getRolePermissions(user.role),
      finalResult: false,
      shouldHaveAccess: false
    };

    diagnosis.finalResult = this.isAdmin(user);
    diagnosis.shouldHaveAccess = diagnosis.checks.isAdminEmail || 
                               diagnosis.checks.isRoleAdmin || 
                               diagnosis.checks.hasAdminFlag;

    return diagnosis;
  }

  /**
   * 🧹 NETTOYER LE CACHE
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache admin nettoyé');
  }
}

// Instance singleton
export const adminService = new AdminService();

// Fonction globale isAdmin améliorée
export const isAdmin = (user) => {
  return adminService.isAdmin(user);
};

// ✅ FONCTION hasPermission EXPORTÉE - CORRECTIF BUILD
export const hasPermission = (user, permission) => {
  return adminService.hasPermission(user, permission);
};

// Fonction async pour vérification complète
export const checkAdminWithFirebase = async (user) => {
  return await adminService.checkAdminWithFirebase(user);
};

// ✅ FONCTION ASYNC hasPermission AVEC FIREBASE
export const checkPermissionWithFirebase = async (user, permission) => {
  return await adminService.checkPermissionWithFirebase(user, permission);
};

// Fonction de diagnostic
export const diagnoseAdmin = (user) => {
  return adminService.diagnoseAdminAccess(user);
};

// Fonction d'urgence
export const forceAdminAccess = (userEmail = 'alan.boehme61@gmail.com') => {
  return adminService.forceAdminAccess(userEmail);
};

// Export par défaut
export default adminService;

// ==========================================
// 💡 INSTRUCTIONS D'UTILISATION MISES À JOUR
// ==========================================

/*
🛡️ UTILISATION SIMPLE :

import { isAdmin, hasPermission } from '../core/services/adminService.js';

// Dans un composant React
const MyComponent = () => {
  const { user } = useAuthStore();
  
  if (!isAdmin(user)) {
    return <div>Accès refusé</div>;
  }
  
  // Vérifier permission spécifique
  if (!hasPermission(user, 'manage_users')) {
    return <div>Permission insuffisante</div>;
  }
  
  return <div>Contenu admin</div>;
};

🔑 VÉRIFICATION DE PERMISSIONS :

// Permissions disponibles :
- 'admin_access' : Accès admin général
- 'manage_users' : Gestion des utilisateurs  
- 'manage_badges' : Gestion des badges
- 'validate_tasks' : Validation des tâches
- 'validate_xp' : Validation de l'XP
- 'view_analytics' : Accès aux analyses
- 'manage_projects' : Gestion des projets
- 'system_config' : Configuration système
- 'full_access' : Accès complet

🔍 DIAGNOSTIC AVANCÉ :

import { diagnoseAdmin } from '../core/services/adminService.js';

// Pour débugger
const diagnosis = diagnoseAdmin(user);
console.log('Diagnostic admin:', diagnosis);

🚀 FORÇAGE D'URGENCE :

import { forceAdminAccess } from '../core/services/adminService.js';

// Dans la console du navigateur
forceAdminAccess('alan.boehme61@gmail.com');

✅ CORRECTIONS APPLIQUÉES :
- Ajout de la fonction hasPermission() manquante
- Export correct de hasPermission
- Gestion des permissions par rôle
- Version async avec Firebase
- Cache optimisé
- Diagnostic complet
*/
