// ==========================================
// 📁 react-app/src/core/services/adminService.js
// SERVICE ADMIN UNIVERSEL CORRIGÉ
// ==========================================

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🛡️ SERVICE ADMIN UNIVERSEL
 * Fonction isAdmin() corrigée et robuste
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
      
      // 6. Vérification par permissions alternatives
      const hasManagePermissions = Array.isArray(user.permissions) && 
        (user.permissions.includes('manage_users') || 
         user.permissions.includes('manage_badges') ||
         user.permissions.includes('full_access'));

      // Résultat final : au moins une méthode doit être vraie
      const isAdmin = isAdminEmail || isRoleAdmin || hasAdminFlag || 
                     isProfileRoleAdmin || hasAdminPermissions || hasManagePermissions;

      // Log détaillé pour debugging
      console.log('🔍 isAdmin - Vérification complète:', {
        userEmail: user.email,
        userUid: user.uid,
        checks: {
          isAdminEmail,
          isRoleAdmin,
          hasAdminFlag,
          isProfileRoleAdmin,
          hasAdminPermissions,
          hasManagePermissions
        },
        userData: {
          role: user.role,
          isAdmin: user.isAdmin,
          profileRole: user.profile?.role,
          permissions: user.permissions
        },
        finalResult: isAdmin
      });

      return isAdmin;

    } catch (error) {
      console.error('❌ Erreur dans isAdmin:', error);
      
      // En cas d'erreur, vérification de secours par email
      const isAdminEmail = this.adminEmails.includes(user.email);
      console.log(`🛡️ Vérification de secours par email: ${isAdminEmail}`);
      return isAdminEmail;
    }
  }

  /**
   * 🔍 VÉRIFICATION ASYNC AVEC FIREBASE
   * Pour une vérification complète avec la base de données
   */
  async checkAdminWithFirebase(user) {
    if (!user?.uid) {
      console.warn('⚠️ checkAdminWithFirebase: uid manquant');
      return false;
    }

    try {
      // Vérifier le cache d'abord
      const cacheKey = `admin_${user.uid}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        console.log('📦 Résultat admin depuis le cache:', cached.isAdmin);
        return cached.isAdmin;
      }

      // Vérification rapide avec les données du user
      const quickCheck = this.isAdmin(user);
      if (quickCheck) {
        // Mettre en cache
        this.cache.set(cacheKey, {
          isAdmin: true,
          timestamp: Date.now(),
          method: 'quick_check'
        });
        return true;
      }

      // Vérification complète avec Firebase
      console.log('🔍 Vérification Firebase pour:', user.email);
      
      const userRef = doc(db, 'users', user.email);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const mergedUser = { ...user, ...userData };
        
        const firebaseCheck = this.isAdmin(mergedUser);
        
        // Mettre en cache
        this.cache.set(cacheKey, {
          isAdmin: firebaseCheck,
          timestamp: Date.now(),
          method: 'firebase_check'
        });
        
        console.log('✅ Vérification Firebase terminée:', firebaseCheck);
        return firebaseCheck;
      }
      
      // Si aucun document Firebase, vérification de secours par email
      const fallbackCheck = this.adminEmails.includes(user.email);
      
      this.cache.set(cacheKey, {
        isAdmin: fallbackCheck,
        timestamp: Date.now(),
        method: 'fallback_email'
      });
      
      return fallbackCheck;

    } catch (error) {
      console.error('❌ Erreur vérification Firebase:', error);
      
      // En cas d'erreur, vérification de secours
      const fallbackCheck = this.adminEmails.includes(user.email);
      console.log(`🛡️ Vérification de secours: ${fallbackCheck}`);
      return fallbackCheck;
    }
  }

  /**
   * 🚀 FORCER L'ACCÈS ADMIN POUR UN UTILISATEUR
   * Méthode d'urgence pour débloquer l'accès
   */
  forceAdminAccess(userEmail) {
    if (!this.adminEmails.includes(userEmail)) {
      this.adminEmails.push(userEmail);
      console.log(`🛡️ Accès admin forcé pour: ${userEmail}`);
    }
    
    // Vider le cache pour cette utilisateur
    for (const [key] of this.cache) {
      if (key.includes(userEmail)) {
        this.cache.delete(key);
      }
    }
    
    return true;
  }

  /**
   * 🔧 DIAGNOSTIQUE ADMIN
   * Pour débugger les problèmes d'accès
   */
  diagnoseAdminAccess(user) {
    if (!user) return { error: 'Utilisateur manquant' };

    const diagnosis = {
      userInfo: {
        email: user.email,
        uid: user.uid,
        role: user.role,
        isAdmin: user.isAdmin,
        profileRole: user.profile?.role,
        permissions: user.permissions
      },
      checks: {
        isAdminEmail: this.adminEmails.includes(user.email),
        isRoleAdmin: user.role === 'admin',
        hasAdminFlag: user.isAdmin === true,
        isProfileRoleAdmin: user.profile?.role === 'admin',
        hasAdminPermissions: Array.isArray(user.permissions) && user.permissions.includes('admin_access'),
        hasManagePermissions: Array.isArray(user.permissions) && 
          (user.permissions.includes('manage_users') || user.permissions.includes('manage_badges'))
      },
      recommendations: []
    };

    // Générer des recommandations
    if (!diagnosis.checks.isAdminEmail) {
      diagnosis.recommendations.push('Ajouter l\'email à la liste des admins');
    }
    if (!diagnosis.checks.isRoleAdmin) {
      diagnosis.recommendations.push('Définir role: "admin" dans Firebase');
    }
    if (!diagnosis.checks.hasAdminFlag) {
      diagnosis.recommendations.push('Définir isAdmin: true dans Firebase');
    }
    if (!diagnosis.checks.hasAdminPermissions) {
      diagnosis.recommendations.push('Ajouter "admin_access" aux permissions');
    }

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

// Fonction async pour vérification complète
export const checkAdminWithFirebase = async (user) => {
  return await adminService.checkAdminWithFirebase(user);
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
// 💡 INSTRUCTIONS D'UTILISATION
// ==========================================

/*
🛡️ UTILISATION SIMPLE :

import { isAdmin } from '../core/services/adminService.js';

// Dans un composant React
const MyComponent = () => {
  const { user } = useAuthStore();
  
  if (!isAdmin(user)) {
    return <div>Accès refusé</div>;
  }
  
  return <div>Contenu admin</div>;
};

🔍 DIAGNOSTIC AVANCÉ :

import { diagnoseAdmin } from '../core/services/adminService.js';

// Pour débugger
const diagnosis = diagnoseAdmin(user);
console.log('Diagnostic admin:', diagnosis);

🚀 FORÇAGE D'URGENCE :

import { forceAdminAccess } from '../core/services/adminService.js';

// Dans la console du navigateur
forceAdminAccess('alan.boehme61@gmail.com');

🔧 MIGRATION DES COMPOSANTS EXISTANTS :

1. Remplacer tous les imports existants :
   - De: import { isAdmin } from '../../core/services/adminBadgeService.js';
   - Vers: import { isAdmin } from '../../core/services/adminService.js';

2. La fonction isAdmin() fonctionne de la même manière mais est plus robuste

3. Tous les composants admin existants fonctionneront automatiquement
*/
