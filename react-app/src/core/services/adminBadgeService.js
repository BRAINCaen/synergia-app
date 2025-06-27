// ==========================================
// 📁 react-app/src/core/services/adminBadgeService.js
// SERVICE ADMIN POUR LA GESTION COMPLÈTE DES BADGES
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  query, 
  where,
  orderBy 
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
  
  /**
   * 🎖️ Obtenir TOUS les badges (tous rôles confondus) - ADMIN ONLY
   */
  async getAllBadges() {
    try {
      console.log('🔍 Admin: Récupération de tous les badges...');
      
      const badgesRef = collection(db, 'badges');
      const querySnapshot = await getDocs(badgesRef);
      
      const badges = [];
      querySnapshot.forEach((doc) => {
        badges.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Admin: Badges récupérés:', badges.length);
      return badges;
      
    } catch (error) {
      console.error('❌ Erreur récupération badges admin:', error);
      throw error;
    }
  }

  /**
   * 🎨 Créer un nouveau badge custom
   */
  async createCustomBadge(badgeData, imageFile = null) {
    try {
      console.log('🎨 Admin: Création badge custom...', badgeData);
      
      let imageUrl = badgeData.icon; // Fallback sur l'emoji/icône
      
      // Upload de l'image si fournie
      if (imageFile) {
        imageUrl = await this.uploadBadgeImage(imageFile, badgeData.id);
      }
      
      const badge = {
        ...badgeData,
        id: badgeData.id || `custom_${Date.now()}`,
        icon: imageUrl,
        isCustom: true,
        createdAt: new Date(),
        createdBy: badgeData.createdBy || 'admin'
      };
      
      // Sauvegarder dans Firebase
      const badgeRef = doc(db, 'badges', badge.id);
      await setDoc(badgeRef, badge);
      
      console.log('✅ Badge custom créé:', badge.id);
      return badge;
      
    } catch (error) {
      console.error('❌ Erreur création badge custom:', error);
      throw error;
    }
  }

  /**
   * 📷 Upload d'image pour badge
   */
  async uploadBadgeImage(imageFile, badgeId) {
    try {
      console.log('📷 Upload image badge:', badgeId);
      
      // Créer une référence unique
      const timestamp = Date.now();
      const fileName = `badges/${badgeId}_${timestamp}.${imageFile.name.split('.').pop()}`;
      const storageRef = ref(storage, fileName);
      
      // Upload du fichier
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Image badge uploadée:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload image badge:', error);
      throw error;
    }
  }

  /**
   * ✏️ Modifier un badge existant
   */
  async updateBadge(badgeId, updates, newImageFile = null) {
    try {
      console.log('✏️ Admin: Modification badge:', badgeId);
      
      let updateData = { ...updates };
      
      // Upload nouvelle image si fournie
      if (newImageFile) {
        updateData.icon = await this.uploadBadgeImage(newImageFile, badgeId);
      }
      
      updateData.updatedAt = new Date();
      
      const badgeRef = doc(db, 'badges', badgeId);
      await updateDoc(badgeRef, updateData);
      
      console.log('✅ Badge modifié:', badgeId);
      return updateData;
      
    } catch (error) {
      console.error('❌ Erreur modification badge:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Supprimer un badge
   */
  async deleteBadge(badgeId) {
    try {
      console.log('🗑️ Admin: Suppression badge:', badgeId);
      
      const badgeRef = doc(db, 'badges', badgeId);
      await deleteDoc(badgeRef);
      
      console.log('✅ Badge supprimé:', badgeId);
      
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      throw error;
    }
  }

  /**
   * 🎁 Attribuer manuellement un badge à un utilisateur
   */
  async awardBadgeToUser(userId, badgeId, reason = 'Attribution manuelle admin') {
    try {
      console.log('🎁 Admin: Attribution badge:', badgeId, 'à', userId);
      
      // Récupérer les infos du badge
      const badgeRef = doc(db, 'badges', badgeId);
      const badgeDoc = await getDoc(badgeRef);
      
      if (!badgeDoc.exists()) {
        throw new Error('Badge introuvable');
      }
      
      const badgeData = badgeDoc.data();
      
      // Créer l'objet badge pour l'utilisateur
      const userBadge = {
        ...badgeData,
        earnedAt: new Date(),
        earnedBy: userId,
        reason,
        awardedByAdmin: true
      };
      
      // Ajouter le badge à l'utilisateur
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        badges: arrayUnion(userBadge),
        'gamification.totalXp': increment(badgeData.xpReward || 0),
        'gamification.lastBadgeEarned': new Date()
      });
      
      // Déclencher notification
      this.triggerBadgeNotification(userBadge);
      
      console.log('✅ Badge attribué avec succès');
      return userBadge;
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les statistiques globales des badges
   */
  async getBadgeStatistics() {
    try {
      console.log('📊 Admin: Récupération statistiques badges...');
      
      // Tous les badges
      const allBadges = await this.getAllBadges();
      
      // Tous les utilisateurs
      const usersRef = collection(db, 'users');
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
        const userBadges = userData.badges || [];
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
   * 👥 Obtenir tous les utilisateurs avec leurs badges
   */
  async getAllUsersWithBadges() {
    try {
      console.log('👥 Admin: Récupération utilisateurs avec badges...');
      
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          ...userData,
          badgeCount: (userData.badges || []).length
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
   * 🔍 Rechercher des badges
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
   * 🚀 Importer des badges en lot
   */
  async importBadges(badgesArray) {
    try {
      console.log('🚀 Admin: Import badges en lot...', badgesArray.length);
      
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
   * 🔔 Déclencher une notification de badge
   */
  triggerBadgeNotification(badge) {
    const event = new CustomEvent('badgeEarned', {
      detail: { badge }
    });
    window.dispatchEvent(event);
  }

  /**
   * 🛡️ Vérifier les permissions admin
   */
  checkAdminPermissions(user) {
    return user?.role === 'admin' || user?.isAdmin === true;
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
