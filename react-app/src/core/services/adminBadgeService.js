// ==========================================
// 📁 react-app/src/core/services/adminBadgeService.js
// 🚨 HOTFIX URGENT - CORRECTION ERREUR UNDEFINED
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
    this.TEAM_MEMBERS_COLLECTION = 'teamMembers';
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
      console.error('❌ Erreur vérification permissions:', error);
      return false;
    }
  }

  /**
   * 🎯 DIAGNOSTIC ACCÈS ADMIN
   */
  diagnoseAdminAccess(user) {
    console.log('🔧 [DIAGNOSTIC] Diagnostic accès admin pour:', user?.email);

    if (!user) {
      return {
        hasAccess: false,
        reason: 'Utilisateur non connecté',
        suggestions: ['Se connecter avec un compte admin']
      };
    }

    const isMainAdmin = user.email === 'alan.boehme61@gmail.com';
    const hasRole = user.role === 'admin';
    const hasProfileRole = user.profile?.role === 'admin';

    return {
      hasAccess: isMainAdmin || hasRole || hasProfileRole,
      isMainAdmin,
      hasRole,
      hasProfileRole,
      userEmail: user.email,
      userRole: user.role,
      suggestions: isMainAdmin ? 
        ['Accès admin confirmé'] : 
        ['Contacter alan.boehme61@gmail.com', 'Vérifier les permissions utilisateur']
    };
  }

  /**
   * 🚨 FORCER L'ACCÈS ADMIN (Dev uniquement)
   */
  forceAdminAccess(userEmail = 'alan.boehme61@gmail.com') {
    console.log('🚨 [DEV] Forçage accès admin pour:', userEmail);
    
    if (typeof window !== 'undefined') {
      // Simuler les permissions admin dans sessionStorage
      window.sessionStorage.setItem('forceAdminAccess', 'true');
      window.sessionStorage.setItem('adminEmail', userEmail);
    }
    
    return {
      success: true,
      message: 'Accès admin forcé (développement)',
      email: userEmail
    };
  }

  /**
   * 📋 RÉCUPÉRER TOUS LES BADGES
   */
  async getAllBadges() {
    try {
      console.log('📋 Récupération de tous les badges...');
      
      const badgesSnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const badges = [];
      
      badgesSnapshot.forEach((doc) => {
        badges.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Badges récupérés:', badges.length);
      return badges;
      
    } catch (error) {
      console.error('❌ Erreur récupération badges:', error);
      throw error;
    }
  }

  /**
   * 👥 RÉCUPÉRER TOUS LES UTILISATEURS
   */
  async getAllUsers() {
    try {
      console.log('👥 Récupération de tous les utilisateurs...');
      
      const usersSnapshot = await getDocs(collection(db, this.USERS_COLLECTION));
      const users = [];
      
      usersSnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Utilisateurs récupérés:', users.length);
      return users;
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * 🤖 RÉCUPÉRER UN UTILISATEUR AVEC SES BADGES (INTELLIGENCE ARTIFICIELLE)
   */
  async getAIUserWithBadges(userId) {
    try {
      console.log('🤖 Récupération utilisateur IA avec badges:', userId);
      
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }
      
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('⚠️ Utilisateur non trouvé:', userId);
        return null;
      }
      
      const userData = userSnap.data();
      const userBadges = userData.badges || [];
      
      // Enrichir avec des données calculées
      const enrichedUser = {
        id: userSnap.id,
        ...userData,
        badges: userBadges,
        badgeCount: userBadges.length,
        totalXpFromBadges: userBadges.reduce((total, badge) => total + (badge.xpReward || 0), 0),
        lastBadgeReceived: userBadges.length > 0 ? userBadges[userBadges.length - 1] : null,
        badgesByCategory: this.categorizeBadges(userBadges),
        progressScore: this.calculateProgressScore(userData)
      };
      
      console.log('✅ Utilisateur IA récupéré:', enrichedUser.id);
      return enrichedUser;
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur IA:', error);
      return null;
    }
  }

  /**
   * 📊 CATÉGORISER LES BADGES
   */
  categorizeBadges(badges) {
    const categories = {};
    
    badges.forEach(badge => {
      const category = badge.category || badge.type || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(badge);
    });
    
    return categories;
  }

  /**
   * 📈 CALCULER LE SCORE DE PROGRESSION
   */
  calculateProgressScore(userData) {
    const xp = userData.xp || 0;
    const badgeCount = (userData.badges || []).length;
    const completedTasks = userData.tasksCompleted || 0;
    
    return Math.round((xp * 0.5) + (badgeCount * 10) + (completedTasks * 2));
  }

  /**
   * 🏆 ATTRIBUER UN BADGE À UN UTILISATEUR - VERSION HOTFIX 🚨
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
      console.log('📊 Données badge récupérées:', badgeData);
      
      // 🔧 ESSAYER PLUSIEURS COLLECTIONS UTILISATEUR
      let userRef = null;
      let userSnap = null;
      let collectionUsed = null;
      
      // Tenter d'abord la collection 'users'
      try {
        userRef = doc(db, this.USERS_COLLECTION, userId);
        userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          collectionUsed = this.USERS_COLLECTION;
          console.log('✅ Utilisateur trouvé dans collection users');
        }
      } catch (error) {
        console.log('⚠️ Pas d\'accès à la collection users, essai teamMembers');
      }
      
      // Si pas trouvé dans users, essayer teamMembers
      if (!userSnap || !userSnap.exists()) {
        try {
          userRef = doc(db, this.TEAM_MEMBERS_COLLECTION, userId);
          userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            collectionUsed = this.TEAM_MEMBERS_COLLECTION;
            console.log('✅ Utilisateur trouvé dans collection teamMembers');
          }
        } catch (error) {
          console.log('⚠️ Pas d\'accès à la collection teamMembers');
        }
      }
      
      // 🚨 ALTERNATIVE : Créer un enregistrement de badge séparé
      if (!userSnap || !userSnap.exists()) {
        console.log('🔄 Création enregistrement badge séparé dans user_badges');
        
        const badgeRecord = {
          userId: userId,
          badgeId: badgeId,
          name: badgeData.name || 'Badge sans nom',
          description: badgeData.description || 'Aucune description',
          awardedAt: serverTimestamp(),
          awardedBy: 'admin',
          reason: reason || 'Badge attribué par admin',
          xpReward: badgeData.xpReward || 50
        };
        
        // Ajouter à la collection badges séparée
        await addDoc(collection(db, this.USER_BADGES_COLLECTION), badgeRecord);
        
        console.log('✅ Badge enregistré dans user_badges collection');
        return { 
          success: true, 
          message: 'Badge attribué avec succès (enregistrement séparé)', 
          badge: badgeRecord,
          method: 'separate_collection'
        };
      }
      
      // 🎯 CONTINUER AVEC LA MÉTHODE NORMALE SI UTILISATEUR TROUVÉ
      const userData = userSnap.data();
      const currentBadges = userData.badges || [];
      
      // Vérifier si l'utilisateur a déjà ce badge
      if (currentBadges.find(b => b.badgeId === badgeId)) {
        console.log('⚠️ Utilisateur a déjà ce badge');
        return { success: false, message: 'Badge déjà attribué' };
      }
      
      // 🚨 HOTFIX - ÉLIMINER TOUTES LES VALEURS UNDEFINED
      const newBadge = {};
      
      // Ajouter seulement les valeurs définies
      newBadge.badgeId = badgeId;
      newBadge.awardedAt = serverTimestamp();
      newBadge.awardedBy = 'admin';
      newBadge.reason = reason || 'Badge attribué par admin';
      
      // Vérifier chaque propriété du badge avant ajout
      if (badgeData.name && badgeData.name !== undefined) {
        newBadge.name = badgeData.name;
      } else {
        newBadge.name = 'Badge sans nom';
      }
      
      if (badgeData.description && badgeData.description !== undefined) {
        newBadge.description = badgeData.description;
      } else {
        newBadge.description = 'Aucune description';
      }
      
      if (badgeData.icon && badgeData.icon !== undefined) {
        newBadge.icon = badgeData.icon;
      } else {
        newBadge.icon = '🏆';
      }
      
      // 🎯 CORRECTION CRITIQUE : Ne pas ajouter imageUrl si undefined
      if (badgeData.imageUrl && badgeData.imageUrl !== undefined && badgeData.imageUrl !== null) {
        newBadge.imageUrl = badgeData.imageUrl;
      }
      
      if (badgeData.xpReward && badgeData.xpReward !== undefined) {
        newBadge.xpReward = badgeData.xpReward;
      } else {
        newBadge.xpReward = 50;
      }
      
      if (badgeData.type && badgeData.type !== undefined) {
        newBadge.type = badgeData.type;
      } else {
        newBadge.type = 'achievement';
      }
      
      if (badgeData.rarity && badgeData.rarity !== undefined) {
        newBadge.rarity = badgeData.rarity;
      } else {
        newBadge.rarity = 'common';
      }
      
      console.log('✅ Badge préparé (sans undefined):', newBadge);
      
      const updatedBadges = [...currentBadges, newBadge];
      
      // 🚨 HOTFIX - Préparer données update sans undefined
      const updateData = {};
      updateData.badges = updatedBadges;
      updateData.lastBadgeReceived = newBadge;
      updateData.badgeCount = updatedBadges.length;
      updateData.lastUpdate = serverTimestamp();
      
      // Calculer XP de manière sécurisée
      const currentXp = userData.xp || 0;
      const badgeXp = newBadge.xpReward || 0;
      updateData.xp = currentXp + badgeXp;
      
      console.log('✅ Données update préparées (sans undefined):', updateData);
      console.log('📁 Collection utilisée:', collectionUsed);
      
      // 🔧 TENTATIVE DE MISE À JOUR AVEC GESTION D'ERREUR
      try {
        await updateDoc(userRef, updateData);
        console.log('✅ Badge attribué avec succès via', collectionUsed);
        return { 
          success: true, 
          message: 'Badge attribué avec succès', 
          badge: newBadge,
          method: 'user_profile_update',
          collection: collectionUsed
        };
      } catch (updateError) {
        console.error('❌ Erreur mise à jour profil utilisateur:', updateError);
        
        // 🚨 PLAN B : Enregistrement séparé
        console.log('🔄 Plan B: Enregistrement badge séparé');
        
        const badgeRecord = {
          userId: userId,
          badgeId: badgeId,
          ...newBadge,
          userEmail: userData.email || 'email_inconnu',
          userName: userData.displayName || userData.email || 'utilisateur_inconnu'
        };
        
        await addDoc(collection(db, this.USER_BADGES_COLLECTION), badgeRecord);
        
        console.log('✅ Badge enregistré via plan B');
        return { 
          success: true, 
          message: 'Badge attribué avec succès (méthode alternative)', 
          badge: badgeRecord,
          method: 'fallback_collection'
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 🗑️ RETIRER UN BADGE D'UN UTILISATEUR
   */
  async removeBadgeFromUser(userId, badgeId) {
    try {
      console.log(`🗑️ Retrait badge ${badgeId} de ${userId}`);
      
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBadges = userData.badges || [];
        
        // Filtrer le badge à retirer
        const updatedBadges = currentBadges.filter(b => b.badgeId !== badgeId);
        
        if (updatedBadges.length === currentBadges.length) {
          return { success: false, message: 'Badge non trouvé chez cet utilisateur' };
        }
        
        // Recalculer l'XP
        const removedBadge = currentBadges.find(b => b.badgeId === badgeId);
        const xpToRemove = removedBadge?.xpReward || 0;
        
        const updateData = {
          badges: updatedBadges,
          xp: Math.max(0, (userData.xp || 0) - xpToRemove),
          badgeCount: updatedBadges.length,
          lastUpdate: serverTimestamp()
        };
        
        await updateDoc(userRef, updateData);
        
        console.log('✅ Badge retiré avec succès');
        return { success: true, message: 'Badge retiré avec succès' };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
      
    } catch (error) {
      console.error('❌ Erreur retrait badge:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES AVANCÉES
   */
  async getAdvancedStats() {
    try {
      console.log('📊 Calcul statistiques avancées...');
      
      const badges = await this.getAllBadges();
      const users = await this.getAllUsers();
      
      // Calculer les statistiques
      const totalBadges = badges.length;
      const totalUsers = users.length;
      
      let totalAwarded = 0;
      let totalXpDistributed = 0;
      const badgeUsage = {};
      const recentAwards = [];
      
      users.forEach(user => {
        const userBadges = user.badges || [];
        totalAwarded += userBadges.length;
        
        userBadges.forEach(badge => {
          totalXpDistributed += badge.xpReward || 0;
          badgeUsage[badge.badgeId] = (badgeUsage[badge.badgeId] || 0) + 1;
          
          if (badge.awardedAt) {
            recentAwards.push({
              ...badge,
              userId: user.id,
              userEmail: user.email
            });
          }
        });
      });
      
      const mostPopularBadgeId = Object.keys(badgeUsage).reduce(
        (a, b) => badgeUsage[a] > badgeUsage[b] ? a : b, Object.keys(badgeUsage)[0]
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
      
      // Préparer badge sans undefined
      const badge = {};
      badge.createdAt = serverTimestamp();
      badge.createdBy = 'admin';
      badge.isActive = true;
      badge.isCustom = true;
      
      // Ajouter seulement les valeurs définies
      if (badgeData.name && badgeData.name !== undefined) {
        badge.name = badgeData.name;
      } else {
        badge.name = 'Badge sans nom';
      }
      
      if (badgeData.description && badgeData.description !== undefined) {
        badge.description = badgeData.description;
      } else {
        badge.description = 'Aucune description';
      }
      
      if (badgeData.icon && badgeData.icon !== undefined) {
        badge.icon = badgeData.icon;
      } else {
        badge.icon = '🏆';
      }
      
      if (imageUrl) {
        badge.imageUrl = imageUrl;
      } else if (badgeData.imageUrl && badgeData.imageUrl !== undefined) {
        badge.imageUrl = badgeData.imageUrl;
      }
      
      if (badgeData.xpReward && badgeData.xpReward !== undefined) {
        badge.xpReward = badgeData.xpReward;
      } else {
        badge.xpReward = 50;
      }
      
      if (badgeData.rarity && badgeData.rarity !== undefined) {
        badge.rarity = badgeData.rarity;
      } else {
        badge.rarity = 'common';
      }
      
      if (badgeData.category && badgeData.category !== undefined) {
        badge.category = badgeData.category;
      } else {
        badge.category = 'custom';
      }
      
      if (badgeData.type && badgeData.type !== undefined) {
        badge.type = badgeData.type;
      } else {
        badge.type = 'achievement';
      }
      
      console.log('✅ Badge préparé (sans undefined):', badge);
      
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
   * 👥 RÉCUPÉRER TOUS LES UTILISATEURS AVEC LEURS BADGES
   */
  async getAllUsersWithBadges() {
    try {
      const users = await this.getAllUsers();
      
      return users.map(user => ({
        ...user,
        badgeCount: (user.badges || []).length,
        totalXpFromBadges: (user.badges || []).reduce((total, badge) => total + (badge.xpReward || 0), 0),
        lastBadgeReceived: (user.badges || []).length > 0 ? (user.badges || [])[user.badges.length - 1] : null
      }));
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs avec badges:', error);
      return [];
    }
  }

  /**
   * 🔍 RECHERCHER DES UTILISATEURS
   */
  async searchUsers(searchTerm) {
    try {
      const users = await this.getAllUsers();
      
      if (!searchTerm || searchTerm.trim() === '') {
        return users;
      }
      
      const term = searchTerm.toLowerCase();
      
      return users.filter(user => 
        (user.email || '').toLowerCase().includes(term) ||
        (user.displayName || '').toLowerCase().includes(term) ||
        (user.firstName || '').toLowerCase().includes(term) ||
        (user.lastName || '').toLowerCase().includes(term)
      );
      
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LA PROGRESSION BADGES D'UN UTILISATEUR
   */
  async getUserBadgeProgress(userId) {
    try {
      const user = await this.getAIUserWithBadges(userId);
      const allBadges = await this.getAllBadges();
      
      if (!user) {
        return { availableBadges: 0, earnedBadges: 0, progress: [] };
      }
      
      const earnedBadgeIds = (user.badges || []).map(b => b.badgeId);
      const availableBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));
      
      return {
        availableBadges: availableBadges.length,
        earnedBadges: earnedBadgeIds.length,
        totalBadges: allBadges.length,
        progress: availableBadges.map(badge => ({
          ...badge,
          progress: Math.random() * 100, // Simulé pour l'instant
          nextRequirement: 'Critère non défini'
        }))
      };
      
    } catch (error) {
      console.error('❌ Erreur calcul progression badges:', error);
      return { availableBadges: 0, earnedBadges: 0, progress: [] };
    }
  }
}

// ✅ EXPORT PRINCIPAL
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

export const getAIUserWithBadges = async (userId) => {
  return await adminBadgeService.getAIUserWithBadges(userId);
};

export const getAllUsersWithBadges = async () => {
  return await adminBadgeService.getAllUsersWithBadges();
};

export const searchUsers = async (searchTerm) => {
  return await adminBadgeService.searchUsers(searchTerm);
};

export const getUserBadgeProgress = async (userId) => {
  return await adminBadgeService.getUserBadgeProgress(userId);
};
