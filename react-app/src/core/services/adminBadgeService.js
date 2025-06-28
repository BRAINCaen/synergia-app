// ==========================================
// 📁 react-app/src/core/services/adminBadgeService.js  
// SERVICE ADMIN BADGES AVEC TOUTES LES FONCTIONS MANQUANTES
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase.js';

/**
 * 🏆 SERVICE ADMIN POUR LA GESTION DES BADGES
 */
class AdminBadgeService {
  constructor() {
    this.COLLECTION_NAME = 'badges';
    this.USERS_COLLECTION = 'users';
    this.USER_BADGES_COLLECTION = 'user_badges';
  }

  /**
   * 🛡️ VÉRIFICATION DES PERMISSIONS ADMIN
   */
  checkAdminPermissions(user) {
    if (!user) {
      console.warn('⚠️ checkAdminPermissions: user manquant');
      return false;
    }

    try {
      // 🎯 INFAILLIBLE : alan.boehme61@gmail.com est TOUJOURS admin
      if (user.email === 'alan.boehme61@gmail.com') {
        console.log('✅ SUPER ADMIN confirmé:', user.email);
        return true;
      }

      // Vérifications multiples pour robustesse
      const isRoleAdmin = user.role === 'admin';
      const isProfileRoleAdmin = user.profile?.role === 'admin';
      const hasAdminFlag = user.isAdmin === true;
      const hasAdminAccess = user.permissions?.includes('admin_access');
      const hasBadgePermission = user.permissions?.includes('manage_badges');

      const isAdmin = isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasAdminAccess || hasBadgePermission;

      console.log('🔍 Vérification permissions admin:', {
        email: user.email,
        isRoleAdmin,
        isProfileRoleAdmin,
        hasAdminFlag,
        hasAdminAccess,
        hasBadgePermission,
        finalResult: isAdmin
      });

      return isAdmin;

    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      
      // Fallback par email en cas d'erreur
      if (user.email === 'alan.boehme61@gmail.com') {
        console.log('🚨 FALLBACK ADMIN activé pour:', user.email);
        return true;
      }
      
      return false;
    }
  }

  /**
   * 📋 OBTENIR TOUS LES BADGES
   */
  async getAllBadges() {
    try {
      const badgesRef = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(query(badgesRef, orderBy('createdAt', 'desc')));
      
      const badges = [];
      querySnapshot.forEach((doc) => {
        badges.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 Badges récupérés:', badges.length);
      return badges;
      
    } catch (error) {
      console.error('❌ Erreur récupération badges:', error);
      return [];
    }
  }

  /**
   * 👥 OBTENIR TOUS LES UTILISATEURS AVEC LEURS BADGES
   */
  async getAllUsers() {
    try {
      const usersRef = collection(db, this.USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ 
          id: doc.id, 
          ...userData,
          badges: userData.badges || [],
          xp: userData.xp || 0
        });
      });
      
      console.log('👥 Utilisateurs récupérés:', users.length);
      return users;
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES COMPLÈTES
   */
  async getStatistics() {
    try {
      const [badges, users] = await Promise.all([
        this.getAllBadges(),
        this.getAllUsers()
      ]);

      // Statistiques des badges par type
      const badgesByType = badges.reduce((acc, badge) => {
        const type = badge.type || 'custom';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Statistiques temporelles (approximatives)
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const recentBadges = badges.filter(badge => {
        const createdAt = badge.createdAt?.toDate ? badge.createdAt.toDate() : new Date(badge.createdAt);
        return createdAt >= thisMonth;
      });

      const totalBadgesAwarded = users.reduce((total, user) => total + (user.badges?.length || 0), 0);

      return {
        totalBadges: badges.length,
        totalUsers: users.length,
        badgesByType,
        totalAwarded: totalBadgesAwarded,
        thisMonth: {
          newBadges: recentBadges.length,
          awarded: Math.floor(totalBadgesAwarded * 0.1), // Estimation
          newUsers: Math.floor(users.length * 0.05) // Estimation
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      return {
        totalBadges: 0,
        totalUsers: 0,
        badgesByType: {},
        totalAwarded: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      };
    }
  }

  /**
   * 🎨 CRÉER UN BADGE PERSONNALISÉ
   */
  async createCustomBadge(badgeData, imageFile = null) {
    try {
      console.log('🎨 Création badge personnalisé:', badgeData.name);

      // Upload de l'image si fournie
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await this.uploadBadgeImage(imageFile, badgeData.name);
      }

      // Préparer les données du badge
      const newBadge = {
        name: badgeData.name,
        description: badgeData.description,
        imageUrl: imageUrl,
        icon: badgeData.icon || '🏆',
        rarity: badgeData.rarity || 'common',
        category: badgeData.category || 'custom',
        role: badgeData.role || 'Général',
        condition: badgeData.condition || '',
        triggerValue: badgeData.triggerValue || 1,
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        isActive: badgeData.isActive !== undefined ? badgeData.isActive : true,
        xpReward: badgeData.xpReward || 50,
        type: badgeData.type || 'custom'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newBadge);
      console.log('✅ Badge créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newBadge
      };
      
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      throw error;
    }
  }

  /**
   * 📸 UPLOAD IMAGE DE BADGE
   */
  async uploadBadgeImage(imageFile, badgeName) {
    try {
      const timestamp = Date.now();
      const fileName = `badges/${badgeName}-${timestamp}.${imageFile.name.split('.').pop()}`;
      const imageRef = ref(storage, fileName);
      
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);
      
      console.log('📸 Image badge uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload image badge:', error);
      throw error;
    }
  }

  /**
   * 🏆 ATTRIBUER UN BADGE À UN UTILISATEUR
   */
  async awardBadgeToUser(userId, badgeId, reason = 'Badge attribué par admin') {
    try {
      console.log(`🏆 Attribution badge ${badgeId} à ${userId}`);
      
      // Récupérer les données du badge
      const badgeRef = doc(db, this.COLLECTION_NAME, badgeId);
      const badgeSnap = await getDoc(badgeRef);
      
      if (!badgeSnap.exists()) {
        throw new Error('Badge non trouvé');
      }
      
      const badgeData = badgeSnap.data();
      
      // Mettre à jour le profil utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBadges = userData.badges || [];
        
        // Vérifier si l'utilisateur a déjà ce badge
        if (currentBadges.find(b => b.badgeId === badgeId)) {
          console.log('⚠️ Utilisateur a déjà ce badge');
          return { success: false, message: 'Badge déjà attribué' };
        }
        
        // Ajouter le nouveau badge
        const newBadge = {
          badgeId,
          name: badgeData.name,
          description: badgeData.description,
          imageUrl: badgeData.imageUrl,
          awardedAt: new Date(),
          awardedBy: 'admin',
          reason
        };
        
        currentBadges.push(newBadge);
        
        // Mettre à jour le document utilisateur
        await updateDoc(userRef, {
          badges: currentBadges,
          lastBadgeEarned: new Date(),
          xp: (userData.xp || 0) + (badgeData.xpReward || 50)
        });
        
        console.log('✅ Badge attribué avec succès');
        return { success: true, message: 'Badge attribué avec succès' };
        
      } else {
        throw new Error('Utilisateur non trouvé');
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN BADGE
   */
  async deleteBadge(badgeId) {
    try {
      const badgeRef = doc(db, this.COLLECTION_NAME, badgeId);
      await deleteDoc(badgeRef);
      
      console.log('🗑️ Badge supprimé:', badgeId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      throw error;
    }
  }

  /**
   * 👤 OBTENIR LE PROFIL DÉTAILLÉ D'UN UTILISATEUR
   */
  async getUserDetailedProfile(userId) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Enrichir avec des données calculées
        return {
          id: userId,
          ...userData,
          badges: userData.badges || [],
          xp: userData.xp || 0,
          level: Math.floor((userData.xp || 0) / 100) + 1,
          tasksCompleted: userData.tasksCompleted || 0
        };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
      
    } catch (error) {
      console.error('❌ Erreur profil utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🔍 DIAGNOSTIC ACCÈS ADMIN
   */
  diagnoseAdminAccess(user) {
    const diagnosis = {
      email: user?.email || 'Non défini',
      isSuperAdmin: user?.email === 'alan.boehme61@gmail.com',
      role: user?.role || 'Non défini',
      profileRole: user?.profile?.role || 'Non défini',
      isAdminFlag: user?.isAdmin || false,
      permissions: user?.permissions || [],
      hasAdminAccess: false,
      recommendations: []
    };

    diagnosis.hasAdminAccess = this.checkAdminPermissions(user);

    if (!diagnosis.hasAdminAccess && diagnosis.email !== 'alan.boehme61@gmail.com') {
      diagnosis.recommendations.push('Ajouter role: "admin" au profil utilisateur');
      diagnosis.recommendations.push('Ou ajouter isAdmin: true');
      diagnosis.recommendations.push('Ou ajouter "admin_access" aux permissions');
    }

    return diagnosis;
  }

  /**
   * 🚨 FORCER L'ACCÈS ADMIN (URGENCE)
   */
  async forceAdminAccess(userEmail = 'alan.boehme61@gmail.com') {
    try {
      console.log('🚨 FORÇAGE ACCÈS ADMIN pour:', userEmail);
      
      // Rechercher l'utilisateur par email
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ Utilisateur non trouvé pour forçage admin');
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      // Mettre à jour le premier document trouvé
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, {
        role: 'admin',
        isAdmin: true,
        permissions: ['admin_access', 'manage_badges', 'validate_tasks'],
        profile: {
          ...userDoc.data().profile,
          role: 'admin'
        },
        adminAccessForced: true,
        adminAccessForcedAt: serverTimestamp()
      });
      
      console.log('✅ ACCÈS ADMIN FORCÉ avec succès');
      return { success: true, message: 'Accès admin forcé avec succès' };
      
    } catch (error) {
      console.error('❌ Erreur forçage admin:', error);
      return { success: false, message: 'Erreur lors du forçage admin' };
    }
  }
}

// Export de l'instance
const adminBadgeService = new AdminBadgeService();
export default adminBadgeService;

// 🛡️ FONCTION isAdmin ULTRA-ROBUSTE (export principal)
export const isAdmin = (user) => {
  return adminBadgeService.checkAdminPermissions(user);
};

// Fonctions utilitaires
export const getAllBadgesAdmin = async () => {
  return await adminBadgeService.getAllBadges();
};

export const createBadge = async (badgeData, imageFile) => {
  return await adminBadgeService.createCustomBadge(badgeData, imageFile);
};

export const awardBadgeToUser = async (userId, badgeId, reason) => {
  return await adminBadgeService.awardBadgeToUser(userId, badgeId, reason);
};

export const diagnoseAdmin = (user) => {
  return adminBadgeService.diagnoseAdminAccess(user);
};

export const forceAdminAccess = (userEmail = 'alan.boehme61@gmail.com') => {
  return adminBadgeService.forceAdminAccess(userEmail);
};
