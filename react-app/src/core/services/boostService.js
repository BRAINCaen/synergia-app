// ==========================================
// react-app/src/core/services/boostService.js
// Service Boost - Micro-feedback entre Aventuriers
// ==========================================

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  increment,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { notificationService } from './notificationService.js';

// Types de Boost disponibles
export const BOOST_TYPES = {
  competence: {
    id: 'competence',
    label: 'Compétence',
    emoji: '🧠',
    description: 'Reconnaître une expertise technique',
    color: 'from-blue-500 to-cyan-500'
  },
  effort: {
    id: 'effort',
    label: 'Effort',
    emoji: '💪',
    description: 'Saluer un travail acharné',
    color: 'from-orange-500 to-yellow-500'
  },
  collaboration: {
    id: 'collaboration',
    label: 'Collaboration',
    emoji: '🤝',
    description: 'Remercier pour l\'entraide',
    color: 'from-green-500 to-emerald-500'
  },
  innovation: {
    id: 'innovation',
    label: 'Innovation',
    emoji: '💡',
    description: 'Célébrer une idée créative',
    color: 'from-purple-500 to-pink-500'
  }
};

// XP Configuration
const XP_CONFIG = {
  received: 5,  // XP pour le receveur
  given: 2      // XP pour le donneur (encourager les boosts)
};

class BoostService {
  constructor() {
    this.listeners = new Map();
    this.collectionName = 'boosts';
  }

  /**
   * Envoyer un Boost a un collegue
   */
  async sendBoost(fromUser, toUser, type, message = '') {
    try {
      // Validation
      if (!fromUser?.uid || !toUser?.uid) {
        throw new Error('Utilisateurs invalides');
      }

      if (fromUser.uid === toUser.uid) {
        throw new Error('Impossible de s\'envoyer un Boost a soi-meme');
      }

      if (!BOOST_TYPES[type]) {
        throw new Error('Type de Boost invalide');
      }

      // Creer le document Boost
      const boostData = {
        fromUserId: fromUser.uid,
        fromUserName: fromUser.displayName || fromUser.email || 'Aventurier',
        fromUserPhoto: fromUser.photoURL || null,
        toUserId: toUser.uid,
        toUserName: toUser.displayName || toUser.email || 'Aventurier',
        toUserPhoto: toUser.photoURL || null,
        type: type,
        typeInfo: BOOST_TYPES[type],
        message: message.trim(),
        xpAwarded: XP_CONFIG.received,
        xpGiven: XP_CONFIG.given,
        createdAt: serverTimestamp(),
        read: false
      };

      // Ajouter le Boost a Firestore
      const boostRef = await addDoc(collection(db, this.collectionName), boostData);

      // Mettre a jour les stats des deux utilisateurs
      await this.updateUserBoostStats(fromUser.uid, 'sent', type);
      await this.updateUserBoostStats(toUser.uid, 'received', type);

      // Ajouter l'XP aux deux utilisateurs
      await this.awardBoostXP(fromUser.uid, XP_CONFIG.given, 'Boost envoye');
      await this.awardBoostXP(toUser.uid, XP_CONFIG.received, `Boost recu: ${BOOST_TYPES[type].label}`);

      // Envoyer une notification au destinataire
      try {
        await notificationService.notifyBoostReceived(toUser.uid, {
          boostId: boostRef.id,
          boostType: type,
          boostEmoji: BOOST_TYPES[type].emoji,
          boostLabel: BOOST_TYPES[type].label,
          fromUserName: fromUser.displayName || fromUser.email || 'Un Aventurier',
          message: message.trim(),
          xpAmount: XP_CONFIG.received
        });
      } catch (notifError) {
        console.warn('Erreur notification boost (non bloquante):', notifError);
      }

      console.log(`Boost envoye de ${fromUser.displayName} a ${toUser.displayName} (${type})`);

      return {
        success: true,
        boostId: boostRef.id,
        xpGiven: XP_CONFIG.given,
        xpAwarded: XP_CONFIG.received,
        message: `Boost ${BOOST_TYPES[type].emoji} envoye a ${toUser.displayName}!`
      };

    } catch (error) {
      console.error('Erreur sendBoost:', error);
      throw error;
    }
  }

  /**
   * Recuperer les Boosts recus par un utilisateur
   */
  async getUserBoostsReceived(userId, limitCount = 50) {
    try {
      console.log('⚡ [BOOST] getUserBoostsReceived - userId:', userId);
      // Requete sans orderBy pour eviter le besoin d'index composite
      const boostsQuery = query(
        collection(db, this.collectionName),
        where('toUserId', '==', userId),
        limit(limitCount)
      );

      const snapshot = await getDocs(boostsQuery);
      console.log('⚡ [BOOST] getUserBoostsReceived - snapshot size:', snapshot.size);
      const boosts = [];

      snapshot.forEach((doc) => {
        console.log('⚡ [BOOST] Doc received:', doc.id, doc.data());
        boosts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      // Tri cote client par date decroissante
      boosts.sort((a, b) => b.createdAt - a.createdAt);

      return boosts;

    } catch (error) {
      console.error('❌ [BOOST] Erreur getUserBoostsReceived:', error);
      return [];
    }
  }

  /**
   * Recuperer les Boosts envoyes par un utilisateur
   */
  async getUserBoostsSent(userId, limitCount = 50) {
    try {
      console.log('⚡ [BOOST] getUserBoostsSent - userId:', userId);
      // Requete sans orderBy pour eviter le besoin d'index composite
      const boostsQuery = query(
        collection(db, this.collectionName),
        where('fromUserId', '==', userId),
        limit(limitCount)
      );

      const snapshot = await getDocs(boostsQuery);
      console.log('⚡ [BOOST] getUserBoostsSent - snapshot size:', snapshot.size);
      const boosts = [];

      snapshot.forEach((doc) => {
        console.log('⚡ [BOOST] Doc sent:', doc.id, doc.data());
        boosts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      // Tri cote client par date decroissante
      boosts.sort((a, b) => b.createdAt - a.createdAt);

      return boosts;

    } catch (error) {
      console.error('❌ [BOOST] Erreur getUserBoostsSent:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques de Boost d'un utilisateur
   */
  async getBoostStats(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return this.getDefaultBoostStats();
      }

      const userData = userSnap.data();
      return userData.boostStats || this.getDefaultBoostStats();

    } catch (error) {
      console.error('Erreur getBoostStats:', error);
      return this.getDefaultBoostStats();
    }
  }

  /**
   * Stats par defaut
   */
  getDefaultBoostStats() {
    return {
      totalReceived: 0,
      totalSent: 0,
      receivedByType: {
        competence: 0,
        effort: 0,
        collaboration: 0,
        innovation: 0
      },
      sentByType: {
        competence: 0,
        effort: 0,
        collaboration: 0,
        innovation: 0
      },
      lastReceivedAt: null,
      lastSentAt: null,
      xpFromBoosts: 0
    };
  }

  /**
   * Marquer un Boost comme lu
   */
  async markBoostAsRead(boostId) {
    try {
      const boostRef = doc(db, this.collectionName, boostId);
      await updateDoc(boostRef, {
        read: true,
        readAt: serverTimestamp()
      });

      console.log(`Boost ${boostId} marque comme lu`);
      return { success: true };

    } catch (error) {
      console.error('Erreur markBoostAsRead:', error);
      throw error;
    }
  }

  /**
   * Marquer tous les Boosts non lus comme lus
   */
  async markAllBoostsAsRead(userId) {
    try {
      const unreadQuery = query(
        collection(db, this.collectionName),
        where('toUserId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(unreadQuery);
      const updatePromises = [];

      snapshot.forEach((docSnap) => {
        updatePromises.push(
          updateDoc(doc(db, this.collectionName, docSnap.id), {
            read: true,
            readAt: serverTimestamp()
          })
        );
      });

      await Promise.all(updatePromises);

      console.log(`${snapshot.size} Boosts marques comme lus`);
      return { success: true, count: snapshot.size };

    } catch (error) {
      console.error('Erreur markAllBoostsAsRead:', error);
      throw error;
    }
  }

  /**
   * Compter les Boosts non lus
   */
  async getUnreadBoostCount(userId) {
    try {
      const unreadQuery = query(
        collection(db, this.collectionName),
        where('toUserId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(unreadQuery);
      return snapshot.size;

    } catch (error) {
      console.error('Erreur getUnreadBoostCount:', error);
      return 0;
    }
  }

  /**
   * S'abonner aux nouveaux Boosts (temps reel)
   */
  subscribeToUserBoosts(userId, callback) {
    try {
      // Requete sans orderBy pour eviter le besoin d'index composite
      const boostsQuery = query(
        collection(db, this.collectionName),
        where('toUserId', '==', userId),
        limit(20)
      );

      const unsubscribe = onSnapshot(boostsQuery, (snapshot) => {
        const boosts = [];
        snapshot.forEach((doc) => {
          boosts.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        // Tri cote client par date decroissante
        boosts.sort((a, b) => b.createdAt - a.createdAt);
        callback(boosts);
      });

      this.listeners.set(`boosts_${userId}`, unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('Erreur subscribeToUserBoosts:', error);
      throw error;
    }
  }

  /**
   * Mettre a jour les stats utilisateur
   */
  async updateUserBoostStats(userId, direction, type) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn(`Utilisateur ${userId} introuvable pour mise a jour stats`);
        return;
      }

      const currentStats = userSnap.data().boostStats || this.getDefaultBoostStats();
      const updates = {};

      if (direction === 'sent') {
        updates['boostStats.totalSent'] = increment(1);
        updates[`boostStats.sentByType.${type}`] = increment(1);
        updates['boostStats.lastSentAt'] = serverTimestamp();
      } else if (direction === 'received') {
        updates['boostStats.totalReceived'] = increment(1);
        updates[`boostStats.receivedByType.${type}`] = increment(1);
        updates['boostStats.lastReceivedAt'] = serverTimestamp();
      }

      await updateDoc(userRef, updates);

    } catch (error) {
      console.error('Erreur updateUserBoostStats:', error);
    }
  }

  /**
   * Ajouter XP pour un Boost
   */
  async awardBoostXP(userId, amount, reason) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const currentXp = userSnap.data().gamification?.totalXp || 0;
      const newTotalXp = currentXp + amount;
      const newLevel = Math.floor(newTotalXp / 100) + 1;

      await updateDoc(userRef, {
        'gamification.totalXp': newTotalXp,
        'gamification.level': newLevel,
        'gamification.lastXpGain': amount,
        'gamification.lastXpReason': reason,
        'boostStats.xpFromBoosts': increment(amount),
        lastActivity: serverTimestamp()
      });

      console.log(`+${amount} XP pour ${reason}`);

    } catch (error) {
      console.error('Erreur awardBoostXP:', error);
    }
  }

  /**
   * Obtenir le classement des Boosts
   */
  async getBoostLeaderboard(limitCount = 10) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('boostStats.totalReceived', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(usersQuery);
      const leaderboard = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.boostStats?.totalReceived > 0) {
          leaderboard.push({
            uid: doc.id,
            displayName: data.displayName || data.email || 'Aventurier',
            photoURL: data.photoURL,
            totalReceived: data.boostStats?.totalReceived || 0,
            totalSent: data.boostStats?.totalSent || 0,
            receivedByType: data.boostStats?.receivedByType || {}
          });
        }
      });

      return leaderboard;

    } catch (error) {
      console.error('Erreur getBoostLeaderboard:', error);
      return [];
    }
  }

  /**
   * Boosts recents de l'equipe (feed d'activite)
   */
  async getRecentTeamBoosts(limitCount = 20) {
    try {
      const boostsQuery = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(boostsQuery);
      const boosts = [];

      snapshot.forEach((doc) => {
        boosts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      return boosts;

    } catch (error) {
      console.error('Erreur getRecentTeamBoosts:', error);
      return [];
    }
  }

  /**
   * Nettoyer les listeners
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('Listeners Boost nettoyes');
  }
}

// Export singleton
export const boostService = new BoostService();
export default boostService;
