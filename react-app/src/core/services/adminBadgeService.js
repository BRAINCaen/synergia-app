// ==========================================
// 📁 react-app/src/core/services/adminBadgeService.js
// SERVICE ADMIN DES BADGES - FONCTION isAdmin CORRIGÉE
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
  onSnapshot,
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
 * 🛡️ SERVICE ADMIN POUR LA GESTION DES BADGES
 */
class AdminBadgeService {
  constructor() {
    this.COLLECTION_NAME = 'badges';
    this.USERS_COLLECTION = 'users';
  }

  /**
   * 🛡️ VÉRIFIER LES PERMISSIONS ADMIN (FONCTION CORRIGÉE)
   */
  checkAdminPermissions(user) {
    if (!user) {
      console.warn('⚠️ checkAdminPermissions: user manquant');
      return false;
    }

    // Vérifier toutes les méthodes possibles d'admin
    const isRoleAdmin = user.role === 'admin';
    const isProfileRoleAdmin = user.profile?.role === 'admin';
    const hasAdminFlag = user.isAdmin === true;
    const hasAdminPermissions = user.permissions?.includes('admin_access');

    const isAdmin = isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasAdminPermissions;

    console.log('🔍 checkAdminPermissions détails:', {
      userEmail: user.email,
      isRoleAdmin,
      isProfileRoleAdmin,
      hasAdminFlag,
      hasAdminPermissions,
      finalResult: isAdmin
    });

    return isAdmin;
  }

  /**
   * 🏆 CRÉER UN BADGE PERSONNALISÉ
   */
  async createCustomBadge(badgeData, imageFile = null) {
    try {
      console.log('🏆 Création badge personnalisé:', badgeData.name);
      
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await this.uploadBadgeImage(imageFile, badgeData.name);
      }

      const newBadge = {
        ...badgeData,
        imageUrl,
        isCustom: true,
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        isActive: badgeData.isActive !== undefined ? badgeData.isActive : true,
        version: '1.0'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newBadge);
      
      console.log(`✅ Badge créé avec ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...newBadge,
        success: true
      };

    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      throw error;
    }
  }

  /**
   * 📸 UPLOAD D'IMAGE DE BADGE
   */
  async uploadBadgeImage(imageFile, badgeName) {
    try {
      const fileName = `badges/${badgeName}-${Date.now()}.png`;
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
   * 🎖️ ATTRIBUER UN BADGE À UN UTILISATEUR
   */
  async awardBadgeToUser(userId, badgeId, reason = 'Attribution manuelle') {
    try {
      console.log(`🎖️ Attribution badge ${badgeId} à ${userId}`);
      
      // Vérifier que le badge existe
      const badgeDoc = await getDoc(doc(db, this.COLLECTION_NAME, badgeId));
      if (!badgeDoc.exists()) {
        throw new Error('Badge introuvable');
      }

      const badgeData = badgeDoc.data();
      
      // Récupérer le profil utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur introuvable');
      }

      const userData = userDoc.data();
      const currentBadges = userData.gamification?.badges || [];
      
      // Vérifier si l'utilisateur a déjà ce badge
      const alreadyHas = currentBadges.some(badge => badge.badgeId === badgeId);
      if (alreadyHas) {
        throw new Error('L\'utilisateur possède déjà ce badge');
      }

      // Ajouter le badge
      const newBadge = {
        badgeId,
        name: badgeData.name,
        description: badgeData.description,
        icon: badgeData.icon,
        xpReward: badgeData.xpReward || 0,
        awardedAt: new Date(),
        awardedBy: 'admin',
        reason
      };

      const updatedBadges = [...currentBadges, newBadge];
      
      // Calculer les nouveaux XP
      const newXpAmount = badgeData.xpReward || 0;
      const currentXp = userData.gamification?.totalXp || 0;
      const newTotalXp = currentXp + newXpAmount;

      // Mettre à jour l'utilisateur
      await updateDoc(userRef, {
        'gamification.badges': updatedBadges,
        'gamification.totalXp': newTotalXp,
        'gamification.badgesUnlocked': updatedBadges.length,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Badge attribué avec succès: +${newXpAmount} XP`);
      
      return {
        success: true,
        message: `Badge "${badgeData.name}" attribué avec succès`,
        xpAwarded: newXpAmount
      };

    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR TOUTES LES BADGES
   */
  async getAllBadges() {
    try {
      console.log('📊 Récupération de tous les badges...');
      
      const badgesQuery = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(badgesQuery);
      const badges = [];
      
      snapshot.forEach(doc => {
        badges.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        });
      });
      
      console.log(`✅ ${badges.length} badges récupérés`);
      return badges;
      
    } catch (error) {
      console.error('❌ Erreur récupération badges:', error);
      throw error;
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES DES BADGES
   */
  async getBadgeStatistics() {
    try {
      console.log('📊 Calcul statistiques badges...');
      
      // Tous les badges
      const allBadges = await this.getAllBadges();
      
      // Tous les utilisateurs
      const usersRef = collection(db, this.USERS_COLLECTION);
      const usersSnapshot = await getDocs(usersRef);
      
      const stats = {
        totalBadges: allBadges.length,
        customBadges: allBadges.filter(b => b.isCustom).length,
        systemBadges: allBadges.filter(b => !b.isCustom).length,
        badgesByRole: {},
        totalUsers: usersSnapshot.size,
        totalBadgesAwarded: 0,
        averageBadgesPerUser: 0,
        topBadges: [],
        recentlyCreated: allBadges
          .filter(b => b.createdAt)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      };
      
      // Compter badges par rôle
      allBadges.forEach(badge => {
        const role = badge.role || 'Général';
        stats.badgesByRole[role] = (stats.badgesByRole[role] || 0) + 1;
      });
      
      // Compter badges attribués
      let totalAwarded = 0;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userBadges = userData.gamification?.badges || [];
        totalAwarded += userBadges.length;
      });
      
      stats.totalBadgesAwarded = totalAwarded;
      stats.averageBadgesPerUser = usersSnapshot.size > 0 
        ? Math.round(totalAwarded / usersSnapshot.size * 10) / 10 
        : 0;
      
      console.log('✅ Statistiques calculées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques badges:', error);
      throw error;
    }
  }

  /**
   * 👥 OBTENIR TOUS LES UTILISATEURS AVEC LEURS BADGES
   */
  async getAllUsersWithBadges() {
    try {
      console.log('👥 Récupération utilisateurs avec badges...');
      
      const usersRef = collection(db, this.USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          badgeCount: (userData.gamification?.badges || []).length
        });
      });
      
      // Trier par nombre de badges
      users.sort((a, b) => b.badgeCount - a.badgeCount);
      
      console.log('✅ Utilisateurs récupérés:', users.length);
      return users;
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN BADGE
   */
  async deleteBadge(badgeId) {
    try {
      console.log(`🗑️ Suppression badge: ${badgeId}`);
      
      // Supprimer le badge
      await deleteDoc(doc(db, this.COLLECTION_NAME, badgeId));
      
      console.log('✅ Badge supprimé avec succès');
      
      return {
        success: true,
        message: 'Badge supprimé avec succès'
      };
      
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHER DES BADGES
   */
  async searchBadges(searchTerm, filters = {}) {
    try {
      const allBadges = await this.getAllBadges();
      
      let filtered = allBadges;
      
      // Filtre par terme de recherche
      if (searchTerm) {
        filtered = filtered.filter(badge =>
          badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtre par rôle
      if (filters.role && filters.role !== 'all') {
        filtered = filtered.filter(badge => badge.role === filters.role);
      }
      
      // Filtre par type (custom/system)
      if (filters.type === 'custom') {
        filtered = filtered.filter(badge => badge.isCustom);
      } else if (filters.type === 'system') {
        filtered = filtered.filter(badge => !badge.isCustom);
      }
      
      // Filtre par XP
      if (filters.minXP) {
        filtered = filtered.filter(badge => (badge.xpReward || 0) >= filters.minXP);
      }
      
      return filtered;
      
    } catch (error) {
      console.error('❌ Erreur recherche badges:', error);
      throw error;
    }
  }

  /**
   * 🚀 IMPORTER DES BADGES EN LOT
   */
  async importBadges(badgesArray) {
    try {
      console.log('🚀 Import badges en lot...', badgesArray.length);
      
      const results = {
        success: 0,
        errors: []
      };
      
      for (const badgeData of badgesArray) {
        try {
          await this.createCustomBadge(badgeData);
          results.success++;
        } catch (error) {
          results.errors.push({
            badge: badgeData,
            error: error.message
          });
        }
      }
      
      console.log('✅ Import terminé:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Erreur import badges:', error);
      throw error;
    }
  }

  /**
   * 🔔 DÉCLENCHER UNE NOTIFICATION DE BADGE
   */
  triggerBadgeNotification(badge) {
    const event = new CustomEvent('badgeEarned', {
      detail: { badge }
    });
    window.dispatchEvent(event);
  }
}

// Export du service admin
export const adminBadgeService = new AdminBadgeService();
export default adminBadgeService;

// Fonctions utilitaires
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
