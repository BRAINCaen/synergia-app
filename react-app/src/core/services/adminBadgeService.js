// ==========================================
// 📁 react-app/src/core/services/adminBadgeService.js  
// SERVICE ADMIN BADGES AVEC TOUTES LES FONCTIONS CORRIGÉES
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
   * 👥 OBTENIR TOUS LES UTILISATEURS
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
          // Calculer le nombre de badges pour chaque utilisateur
          badgeCount: (userData.badges || []).length,
          lastBadge: userData.lastBadgeReceived || null
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
   * 🤖 FONCTION MANQUANTE : getAIUserWithBadges
   * Cette fonction était appelée mais n'existait pas
   */
  async getAIUserWithBadges(userId) {
    try {
      console.log('🤖 Récupération utilisateur avec badges:', userId);
      
      // Récupérer les données utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.warn('⚠️ Utilisateur non trouvé:', userId);
        return null;
      }
      
      const userData = userSnap.data();
      
      // Enrichir avec des informations de badges détaillées
      const userBadges = userData.badges || [];
      const enrichedBadges = [];
      
      // Pour chaque badge de l'utilisateur, récupérer les détails complets
      for (const badge of userBadges) {
        try {
          if (badge.badgeId) {
            const badgeRef = doc(db, this.COLLECTION_NAME, badge.badgeId);
            const badgeSnap = await getDoc(badgeRef);
            
            if (badgeSnap.exists()) {
              enrichedBadges.push({
                ...badge,
                ...badgeSnap.data(),
                id: badge.badgeId
              });
            } else {
              // Garder le badge même si les détails ne sont pas trouvés
              enrichedBadges.push(badge);
            }
          } else {
            enrichedBadges.push(badge);
          }
        } catch (badgeError) {
          console.warn('⚠️ Erreur récupération détails badge:', badgeError);
          enrichedBadges.push(badge);
        }
      }
      
      const result = {
        id: userSnap.id,
        ...userData,
        badges: enrichedBadges,
        badgeCount: enrichedBadges.length,
        totalXpFromBadges: enrichedBadges.reduce((total, badge) => {
          return total + (badge.xpReward || 0);
        }, 0)
      };
      
      console.log('✅ Utilisateur avec badges enrichi:', {
        userId: result.id,
        email: result.email,
        badgeCount: result.badgeCount,
        totalXp: result.totalXpFromBadges
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur getAIUserWithBadges:', error);
      return null;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES BADGES
   */
  async getBadgeStatistics() {
    try {
      console.log('📊 Calcul statistiques badges...');
      
      const [badges, users] = await Promise.all([
        this.getAllBadges(),
        this.getAllUsers()
      ]);
      
      // Calculer les statistiques
      const totalBadges = badges.length;
      const totalUsers = users.length;
      
      let totalAwarded = 0;
      let totalXpDistributed = 0;
      const badgeUsage = {};
      const recentAwards = [];
      
      // Analyser chaque utilisateur
      users.forEach(user => {
        const userBadges = user.badges || [];
        totalAwarded += userBadges.length;
        
        userBadges.forEach(badge => {
          // Compter l'usage de chaque badge
          if (badge.badgeId) {
            badgeUsage[badge.badgeId] = (badgeUsage[badge.badgeId] || 0) + 1;
          }
          
          // XP total distribué
          totalXpDistributed += badge.xpReward || 0;
          
          // Badges récents (dernières 24h)
          if (badge.awardedAt && badge.awardedAt.toDate) {
            const awardDate = badge.awardedAt.toDate();
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            if (awardDate > oneDayAgo) {
              recentAwards.push({
                ...badge,
                userName: user.displayName || user.email,
                userId: user.id,
                awardedAt: awardDate
              });
            }
          }
        });
      });
      
      // Badge le plus populaire
      const mostPopularBadgeId = Object.keys(badgeUsage).reduce((a, b) => 
        badgeUsage[a] > badgeUsage[b] ? a : b, Object.keys(badgeUsage)[0]
      );
      
      const mostPopularBadge = badges.find(b => b.id === mostPopularBadgeId);
      
      const stats = {
        totalBadges,
        totalUsers,
        totalAwarded,
        totalXpDistributed,
        averageBadgesPerUser: totalUsers > 0 ? (totalAwarded / totalUsers).toFixed(1) : 0,
        badgeUsage,
        mostPopularBadge: mostPopularBadge ? {
          ...mostPopularBadge,
          awardCount: badgeUsage[mostPopularBadgeId] || 0
        } : null,
        recentAwards: recentAwards.sort((a, b) => b.awardedAt - a.awardedAt).slice(0, 10),
        thisMonth: {
          newBadges: badges.filter(b => {
            if (!b.createdAt || !b.createdAt.toDate) return false;
            const createdDate = b.createdAt.toDate();
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            return createdDate >= thisMonth;
          }).length,
          awarded: recentAwards.length,
          newUsers: users.filter(u => {
            if (!u.createdAt || !u.createdAt.toDate) return false;
            const createdDate = u.createdAt.toDate();
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            return createdDate >= thisMonth;
          }).length
        }
      };
      
      console.log('✅ Statistiques calculées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      return {
        totalBadges: 0,
        totalUsers: 0,
        totalAwarded: 0,
        totalXpDistributed: 0,
        averageBadgesPerUser: 0,
        badgeUsage: {},
        mostPopularBadge: null,
        recentAwards: [],
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      };
    }
  }

  /**
   * 🆕 CRÉER UN BADGE PERSONNALISÉ
   */
  async createCustomBadge(badgeData, imageFile = null) {
    try {
      console.log('🆕 Création badge personnalisé:', badgeData.name);
      
      let imageUrl = null;
      
      // Upload de l'image si fournie
      if (imageFile) {
        imageUrl = await this.uploadBadgeImage(imageFile);
      }
      
      // Données du badge
      const badge = {
        name: badgeData.name,
        description: badgeData.description,
        imageUrl: imageUrl || badgeData.imageUrl || '/default-badge.png',
        xpReward: badgeData.xpReward || 50,
        rarity: badgeData.rarity || 'common',
        category: badgeData.category || 'custom',
        isCustom: true,
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        isActive: true
      };
      
      // Ajouter à Firestore
      const badgeRef = await addDoc(collection(db, this.COLLECTION_NAME), badge);
      
      console.log('✅ Badge créé avec succès:', badgeRef.id);
      return { success: true, badgeId: badgeRef.id, ...badge };
      
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      throw error;
    }
  }

  /**
   * 📸 UPLOAD IMAGE BADGE
   */
  async uploadBadgeImage(imageFile) {
    try {
      const fileName = `badges/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
          awardedAt: serverTimestamp(),
          awardedBy: 'admin',
          reason: reason,
          xpReward: badgeData.xpReward || 50
        };
        
        const updatedBadges = [...currentBadges, newBadge];
        
        // Mettre à jour le profil
        await updateDoc(userRef, {
          badges: updatedBadges,
          lastBadgeReceived: newBadge,
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
      console.log('🗑️ Suppression badge:', badgeId);
      
      const badgeRef = doc(db, this.COLLECTION_NAME, badgeId);
      await deleteDoc(badgeRef);
      
      console.log('✅ Badge supprimé avec succès');
      return { success: true, message: 'Badge supprimé avec succès' };
      
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
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  }

  /**
   * 🔧 DIAGNOSTICS ADMIN
   */
  diagnoseAdminAccess(user) {
    const checks = {
      userExists: !!user,
      hasEmail: !!user?.email,
      isSuperAdmin: user?.email === 'alan.boehme61@gmail.com',
      roleAdmin: user?.role === 'admin',
      profileRoleAdmin: user?.profile?.role === 'admin',
      hasAdminFlag: user?.isAdmin === true,
      hasPermissions: !!user?.permissions?.length,
      hasAdminAccess: user?.permissions?.includes('admin_access'),
      hasBadgePermission: user?.permissions?.includes('manage_badges')
    };

    const isAdmin = checks.isSuperAdmin || checks.roleAdmin || checks.profileRoleAdmin || 
                   checks.hasAdminFlag || checks.hasAdminAccess || checks.hasBadgePermission;

    return {
      isAdmin,
      checks,
      recommendation: isAdmin ? 
        'Accès admin confirmé' : 
        'Aucun accès admin détecté - contactez un administrateur'
    };
  }

  /**
   * 🚨 FORCER L'ACCÈS ADMIN (Emergency)
   */
  async forceAdminAccess(userEmail = 'alan.boehme61@gmail.com') {
    try {
      console.log('🚨 FORÇAGE ACCÈS ADMIN pour:', userEmail);
      
      // Rechercher l'utilisateur par email
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('❌ Utilisateur non trouvé:', userEmail);
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

// ✅ EXPORT PRINCIPAL CORRIGÉ
const adminBadgeService = new AdminBadgeService();
export { adminBadgeService };
export default adminBadgeService;

// 🛡️ FONCTIONS UTILITAIRES EXPORT
export const isAdmin = (user) => {
  return adminBadgeService.checkAdminPermissions(user);
};

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

// 🤖 EXPORT DE LA FONCTION MANQUANTE
export const getAIUserWithBadges = async (userId) => {
  return await adminBadgeService.getAIUserWithBadges(userId);
};
