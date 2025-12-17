// ==========================================
// 📁 react-app/src/core/services/challengeService.js
// SERVICE DÉFIS PERSONNELS ET CAMPAGNES - SYNERGIA v4.0
// ==========================================

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
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

// 🎯 Types de Défis
export const CHALLENGE_TYPES = {
  competence: {
    id: 'competence',
    label: 'Competence',
    emoji: '🚀',
    description: 'Developper une nouvelle competence',
    color: 'from-blue-500 to-cyan-500'
  },
  improvement: {
    id: 'improvement',
    label: 'Amelioration',
    emoji: '📈',
    description: 'Ameliorer un processus ou une pratique',
    color: 'from-green-500 to-emerald-500'
  },
  contribution: {
    id: 'contribution',
    label: 'Contribution',
    emoji: '🤝',
    description: 'Contribuer a l\'equipe ou au projet',
    color: 'from-purple-500 to-pink-500'
  },
  innovation: {
    id: 'innovation',
    label: 'Innovation',
    emoji: '💡',
    description: 'Proposer une idee ou solution nouvelle',
    color: 'from-yellow-500 to-orange-500'
  }
};

// 🎚️ Niveaux de difficulte
export const CHALLENGE_DIFFICULTY = {
  easy: {
    id: 'easy',
    label: 'Facile',
    emoji: '🟢',
    xpReward: 50,
    color: 'text-green-400'
  },
  medium: {
    id: 'medium',
    label: 'Moyen',
    emoji: '🟡',
    xpReward: 100,
    color: 'text-yellow-400'
  },
  hard: {
    id: 'hard',
    label: 'Difficile',
    emoji: '🔴',
    xpReward: 200,
    color: 'text-red-400'
  }
};

// 📊 Statuts des Défis
export const CHALLENGE_STATUS = {
  pending_approval: {
    id: 'pending_approval',
    label: 'En attente du Sceau',
    emoji: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20'
  },
  active: {
    id: 'active',
    label: 'En cours',
    emoji: '⚔️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20'
  },
  pending_validation: {
    id: 'pending_validation',
    label: 'En attente validation',
    emoji: '🔍',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20'
  },
  completed: {
    id: 'completed',
    label: 'Accompli',
    emoji: '🏆',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20'
  },
  rejected: {
    id: 'rejected',
    label: 'Rejete',
    emoji: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20'
  }
};

/**
 * 🎯 SERVICE DÉFIS PERSONNELS
 */
class ChallengeService {
  constructor() {
    this.collectionName = 'personal_challenges';
    this.listeners = new Map();
  }

  // ==========================================
  // 📝 CRÉATION DE DÉFI
  // ==========================================

  /**
   * Créer un nouveau défi personnel
   * @param {Object} challengeData - Données du défi
   * @param {Object} user - Utilisateur créateur
   */
  async createChallenge(challengeData, user) {
    try {
      const { title, description, type, difficulty, campaignId } = challengeData;

      if (!title?.trim()) {
        throw new Error('Le titre du defi est requis');
      }

      if (!type || !CHALLENGE_TYPES[type]) {
        throw new Error('Type de defi invalide');
      }

      if (!difficulty || !CHALLENGE_DIFFICULTY[difficulty]) {
        throw new Error('Difficulte invalide');
      }

      const xpReward = CHALLENGE_DIFFICULTY[difficulty].xpReward;

      const newChallenge = {
        userId: user.uid,
        userName: user.displayName || user.email || 'Aventurier',
        userEmail: user.email,
        title: title.trim(),
        description: description?.trim() || '',
        type,
        typeInfo: CHALLENGE_TYPES[type],
        difficulty,
        difficultyInfo: CHALLENGE_DIFFICULTY[difficulty],
        xpReward,
        status: 'pending_approval',
        campaignId: campaignId || null,
        proof: null,
        proofDescription: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
        completedAt: null,
        validatedAt: null,
        validatedBy: null,
        rejectionReason: null
      };

      const docRef = await addDoc(collection(db, this.collectionName), newChallenge);

      console.log(`🎯 [CHALLENGE] Defi cree: "${title}" par ${user.displayName}`);

      return {
        success: true,
        challengeId: docRef.id,
        message: `Defi "${title}" cree ! En attente du Sceau du Maitre de Guilde.`
      };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur creation:', error);
      throw error;
    }
  }

  // ==========================================
  // 👑 VALIDATION MAÎTRE DE GUILDE
  // ==========================================

  /**
   * Approuver un défi (Maître de Guilde)
   */
  async approveChallenge(challengeId, adminUser) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      if (challenge.status !== 'pending_approval') {
        throw new Error('Ce defi n\'est pas en attente d\'approbation');
      }

      await updateDoc(challengeRef, {
        status: 'active',
        approvedAt: serverTimestamp(),
        approvedBy: adminUser.uid,
        approvedByName: adminUser.displayName || adminUser.email,
        updatedAt: serverTimestamp()
      });

      // Notifier l'utilisateur
      try {
        await notificationService.createNotification({
          userId: challenge.userId,
          type: 'challenge_approved',
          title: '🎯 Defi approuve !',
          message: `Votre defi "${challenge.title}" a ete approuve. C'est parti !`,
          icon: '✅',
          link: '/challenges',
          data: { challengeId }
        });
      } catch (notifError) {
        console.warn('Erreur notification:', notifError);
      }

      console.log(`✅ [CHALLENGE] Defi approuve: ${challengeId}`);

      return { success: true, message: 'Defi approuve avec succes' };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur approbation:', error);
      throw error;
    }
  }

  /**
   * Rejeter un défi (Maître de Guilde)
   */
  async rejectChallenge(challengeId, adminUser, reason) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      await updateDoc(challengeRef, {
        status: 'rejected',
        rejectionReason: reason || 'Aucune raison specifiee',
        rejectedBy: adminUser.uid,
        rejectedByName: adminUser.displayName || adminUser.email,
        updatedAt: serverTimestamp()
      });

      // Notifier l'utilisateur
      try {
        await notificationService.createNotification({
          userId: challenge.userId,
          type: 'challenge_rejected',
          title: '🔄 Defi renvoye',
          message: `Votre defi "${challenge.title}" doit etre revu. Raison: ${reason || 'Non specifiee'}`,
          icon: '🔄',
          link: '/challenges',
          data: { challengeId, reason }
        });
      } catch (notifError) {
        console.warn('Erreur notification:', notifError);
      }

      console.log(`❌ [CHALLENGE] Defi rejete: ${challengeId}`);

      return { success: true, message: 'Defi rejete' };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur rejet:', error);
      throw error;
    }
  }

  // ==========================================
  // ✅ SOUMISSION ET VALIDATION
  // ==========================================

  /**
   * Soumettre un défi accompli (avec preuve)
   */
  async submitChallengeCompletion(challengeId, userId, proof) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      if (challenge.userId !== userId) {
        throw new Error('Vous ne pouvez soumettre que vos propres defis');
      }

      if (challenge.status !== 'active') {
        throw new Error('Ce defi n\'est pas actif');
      }

      await updateDoc(challengeRef, {
        status: 'pending_validation',
        proof: proof.url || null,
        proofDescription: proof.description || '',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`📤 [CHALLENGE] Defi soumis pour validation: ${challengeId}`);

      return {
        success: true,
        message: 'Defi soumis ! En attente du Sceau du Maitre de Guilde.'
      };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur soumission:', error);
      throw error;
    }
  }

  /**
   * Valider l'accomplissement d'un défi (Maître de Guilde)
   */
  async validateChallengeCompletion(challengeId, adminUser) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      if (challenge.status !== 'pending_validation') {
        throw new Error('Ce defi n\'est pas en attente de validation');
      }

      // Mettre à jour le défi
      await updateDoc(challengeRef, {
        status: 'completed',
        validatedAt: serverTimestamp(),
        validatedBy: adminUser.uid,
        validatedByName: adminUser.displayName || adminUser.email,
        updatedAt: serverTimestamp()
      });

      // Attribuer les XP à l'utilisateur
      await this.awardChallengeXP(challenge.userId, challenge.xpReward, challenge.title);

      // Notifier l'utilisateur
      try {
        await notificationService.createNotification({
          userId: challenge.userId,
          type: 'challenge_completed',
          title: '🏆 Defi accompli !',
          message: `Felicitations ! Votre defi "${challenge.title}" est valide. +${challenge.xpReward} XP`,
          icon: '🏆',
          link: '/challenges',
          data: { challengeId, xpAwarded: challenge.xpReward }
        });
      } catch (notifError) {
        console.warn('Erreur notification:', notifError);
      }

      console.log(`🏆 [CHALLENGE] Defi valide: ${challengeId} - +${challenge.xpReward} XP`);

      return {
        success: true,
        message: `Defi valide ! ${challenge.xpReward} XP attribues.`,
        xpAwarded: challenge.xpReward
      };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur validation:', error);
      throw error;
    }
  }

  /**
   * Attribuer les XP pour un défi accompli
   */
  async awardChallengeXP(userId, xpAmount, challengeTitle) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn('Utilisateur non trouve pour XP:', userId);
        return;
      }

      await updateDoc(userRef, {
        totalXp: increment(xpAmount),
        spendableXp: increment(xpAmount),
        'stats.challengesCompleted': increment(1),
        updatedAt: serverTimestamp()
      });

      // Ajouter dans l'historique XP
      await addDoc(collection(db, 'xp_history'), {
        userId,
        amount: xpAmount,
        type: 'challenge_completed',
        description: `Defi accompli: ${challengeTitle}`,
        createdAt: serverTimestamp()
      });

      console.log(`💎 [XP] +${xpAmount} XP pour ${userId} (defi: ${challengeTitle})`);

    } catch (error) {
      console.error('❌ [XP] Erreur attribution XP:', error);
    }
  }

  // ==========================================
  // 📖 LECTURE DES DÉFIS
  // ==========================================

  /**
   * Récupérer les défis d'un utilisateur
   */
  async getUserChallenges(userId, limitCount = 50) {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        limit(limitCount)
      );

      const snapshot = await getDocs(challengesQuery);
      const challenges = [];

      snapshot.forEach((doc) => {
        challenges.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        });
      });

      // Tri cote client
      challenges.sort((a, b) => b.createdAt - a.createdAt);

      return challenges;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur lecture defis:', error);
      return [];
    }
  }

  /**
   * Récupérer les défis d'une campagne
   */
  async getCampaignChallenges(campaignId, limitCount = 50) {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        where('campaignId', '==', campaignId),
        limit(limitCount)
      );

      const snapshot = await getDocs(challengesQuery);
      const challenges = [];

      snapshot.forEach((doc) => {
        challenges.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      challenges.sort((a, b) => b.createdAt - a.createdAt);

      return challenges;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur lecture defis campagne:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les défis en attente (Admin)
   */
  async getPendingChallenges() {
    try {
      const pendingQuery = query(
        collection(db, this.collectionName),
        where('status', 'in', ['pending_approval', 'pending_validation']),
        limit(100)
      );

      const snapshot = await getDocs(pendingQuery);
      const challenges = [];

      snapshot.forEach((doc) => {
        challenges.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      challenges.sort((a, b) => b.createdAt - a.createdAt);

      return challenges;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur lecture defis en attente:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques de défis d'un utilisateur
   */
  async getUserChallengeStats(userId) {
    try {
      const challenges = await this.getUserChallenges(userId, 500);

      const stats = {
        total: challenges.length,
        pending: challenges.filter(c => c.status === 'pending_approval').length,
        active: challenges.filter(c => c.status === 'active').length,
        pendingValidation: challenges.filter(c => c.status === 'pending_validation').length,
        completed: challenges.filter(c => c.status === 'completed').length,
        rejected: challenges.filter(c => c.status === 'rejected').length,
        totalXpEarned: challenges
          .filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + (c.xpReward || 0), 0),
        byType: {},
        byDifficulty: {}
      };

      // Stats par type
      Object.keys(CHALLENGE_TYPES).forEach(type => {
        stats.byType[type] = challenges.filter(c => c.type === type && c.status === 'completed').length;
      });

      // Stats par difficulté
      Object.keys(CHALLENGE_DIFFICULTY).forEach(diff => {
        stats.byDifficulty[diff] = challenges.filter(c => c.difficulty === diff && c.status === 'completed').length;
      });

      return stats;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur stats:', error);
      return {
        total: 0,
        pending: 0,
        active: 0,
        pendingValidation: 0,
        completed: 0,
        rejected: 0,
        totalXpEarned: 0,
        byType: {},
        byDifficulty: {}
      };
    }
  }

  // ==========================================
  // 🔄 ABONNEMENTS TEMPS RÉEL
  // ==========================================

  /**
   * S'abonner aux défis d'un utilisateur
   */
  subscribeToUserChallenges(userId, callback) {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        limit(50)
      );

      const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
        const challenges = [];
        snapshot.forEach((doc) => {
          challenges.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        challenges.sort((a, b) => b.createdAt - a.createdAt);
        callback(challenges);
      });

      this.listeners.set(`challenges_${userId}`, unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur abonnement:', error);
      return () => {};
    }
  }

  /**
   * S'abonner aux défis en attente (Admin)
   */
  subscribeToPendingChallenges(callback) {
    try {
      const pendingQuery = query(
        collection(db, this.collectionName),
        where('status', 'in', ['pending_approval', 'pending_validation']),
        limit(100)
      );

      const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
        const challenges = [];
        snapshot.forEach((doc) => {
          challenges.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        challenges.sort((a, b) => b.createdAt - a.createdAt);
        callback(challenges);
      });

      this.listeners.set('pending_challenges', unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur abonnement pending:', error);
      return () => {};
    }
  }

  // ==========================================
  // 🧹 NETTOYAGE
  // ==========================================

  /**
   * Supprimer un défi (si en attente d'approbation)
   */
  async deleteChallenge(challengeId, userId) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      if (challenge.userId !== userId) {
        throw new Error('Vous ne pouvez supprimer que vos propres defis');
      }

      if (challenge.status !== 'pending_approval' && challenge.status !== 'rejected') {
        throw new Error('Seuls les defis en attente ou rejetes peuvent etre supprimes');
      }

      await deleteDoc(challengeRef);

      console.log(`🗑️ [CHALLENGE] Defi supprime: ${challengeId}`);

      return { success: true, message: 'Defi supprime' };

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * Nettoyer tous les listeners
   */
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 [CHALLENGE] Listeners nettoyes');
  }
}

// Export singleton
export const challengeService = new ChallengeService();
export default challengeService;
