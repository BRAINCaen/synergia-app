// ==========================================
// react-app/src/core/services/teamChallengeService.js
// SERVICE DEFIS D'EQUIPE - SYNERGIA v4.0
// XP collectifs verses dans la cagnotte
// ==========================================

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  collection,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  increment,
  onSnapshot,
  limit,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { notificationService } from './notificationService.js';

// Types de Defis d'Equipe
export const TEAM_CHALLENGE_TYPES = {
  reputation: {
    id: 'reputation',
    label: 'Reputation',
    emoji: '⭐',
    description: 'Avis clients, notes, satisfaction',
    color: 'from-yellow-500 to-amber-500',
    examples: ['Atteindre 2000 avis Google', '100% satisfaction client']
  },
  sales: {
    id: 'sales',
    label: 'Ventes',
    emoji: '💰',
    description: 'Objectifs de vente collectifs',
    color: 'from-green-500 to-emerald-500',
    examples: ['500 ventes ce mois', 'CA mensuel de 50000€']
  },
  quality: {
    id: 'quality',
    label: 'Qualite',
    emoji: '✨',
    description: 'Standards de qualite a atteindre',
    color: 'from-blue-500 to-cyan-500',
    examples: ['Zero defaut cette semaine', '99% de livraisons a temps']
  },
  productivity: {
    id: 'productivity',
    label: 'Productivite',
    emoji: '🚀',
    description: 'Objectifs de performance collective',
    color: 'from-purple-500 to-pink-500',
    examples: ['Traiter 1000 dossiers', 'Reduire delai de 20%']
  },
  teamwork: {
    id: 'teamwork',
    label: 'Cohesion',
    emoji: '🤝',
    description: 'Objectifs d\'equipe et collaboration',
    color: 'from-indigo-500 to-violet-500',
    examples: ['100% participation reunion', 'Mentorat de 5 nouveaux']
  },
  innovation: {
    id: 'innovation',
    label: 'Innovation',
    emoji: '💡',
    description: 'Idees et ameliorations collectives',
    color: 'from-orange-500 to-red-500',
    examples: ['10 idees implementees', 'Lancer 2 nouveaux process']
  }
};

// Niveaux de recompense XP
export const TEAM_CHALLENGE_REWARDS = {
  small: {
    id: 'small',
    label: 'Petit',
    emoji: '🥉',
    xpReward: 500,
    description: 'Objectif court terme'
  },
  medium: {
    id: 'medium',
    label: 'Moyen',
    emoji: '🥈',
    xpReward: 1000,
    description: 'Objectif hebdomadaire'
  },
  large: {
    id: 'large',
    label: 'Grand',
    emoji: '🥇',
    xpReward: 2500,
    description: 'Objectif mensuel'
  },
  epic: {
    id: 'epic',
    label: 'Epique',
    emoji: '🏆',
    xpReward: 5000,
    description: 'Objectif majeur'
  }
};

// Statuts des Defis d'Equipe
export const TEAM_CHALLENGE_STATUS = {
  pending_approval: {
    id: 'pending_approval',
    label: 'En attente',
    emoji: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  active: {
    id: 'active',
    label: 'En cours',
    emoji: '🎯',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  completed: {
    id: 'completed',
    label: 'Accompli',
    emoji: '🏆',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  failed: {
    id: 'failed',
    label: 'Non atteint',
    emoji: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  }
};

/**
 * SERVICE DEFIS D'EQUIPE
 */
class TeamChallengeService {
  constructor() {
    this.collectionName = 'team_challenges';
    this.listeners = new Map();
  }

  // ==========================================
  // CREATION DE DEFI D'EQUIPE
  // ==========================================

  /**
   * Creer un nouveau defi d'equipe
   */
  async createTeamChallenge(challengeData, user) {
    try {
      const { title, description, type, rewardLevel, targetValue, unit, deadline } = challengeData;

      if (!title?.trim()) {
        throw new Error('Le titre du defi est requis');
      }

      if (!type || !TEAM_CHALLENGE_TYPES[type]) {
        throw new Error('Type de defi invalide');
      }

      if (!rewardLevel || !TEAM_CHALLENGE_REWARDS[rewardLevel]) {
        throw new Error('Niveau de recompense invalide');
      }

      if (!targetValue || targetValue <= 0) {
        throw new Error('Objectif cible invalide');
      }

      const xpReward = TEAM_CHALLENGE_REWARDS[rewardLevel].xpReward;

      const newChallenge = {
        title: title.trim(),
        description: description?.trim() || '',
        type,
        typeInfo: TEAM_CHALLENGE_TYPES[type],
        rewardLevel,
        rewardInfo: TEAM_CHALLENGE_REWARDS[rewardLevel],
        xpReward,
        targetValue: Number(targetValue),
        currentValue: 0,
        unit: unit?.trim() || 'unites',
        status: 'pending_approval',
        deadline: deadline || null,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
        completedAt: null,
        contributions: [],
        contributorsCount: 0
      };

      const docRef = await addDoc(collection(db, this.collectionName), newChallenge);

      console.log(`🎯 [TEAM_CHALLENGE] Defi d'equipe cree: "${title}"`);

      return {
        success: true,
        challengeId: docRef.id,
        message: `Defi d'equipe "${title}" cree ! En attente de validation.`
      };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur creation:', error);
      throw error;
    }
  }

  // ==========================================
  // APPROBATION / REJET (ADMIN)
  // ==========================================

  /**
   * Approuver un defi d'equipe
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

      // Notifier l'equipe
      try {
        await notificationService.notifyAll({
          type: 'team_challenge_started',
          title: '🎯 Nouveau Defi d\'Equipe !',
          message: `Le defi "${challenge.title}" est lance ! Objectif: ${challenge.targetValue} ${challenge.unit}`,
          icon: '🎯',
          link: '/challenges'
        });
      } catch (notifError) {
        console.warn('Erreur notification:', notifError);
      }

      console.log(`✅ [TEAM_CHALLENGE] Defi approuve: ${challengeId}`);

      return { success: true, message: 'Defi d\'equipe lance !' };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur approbation:', error);
      throw error;
    }
  }

  /**
   * Rejeter un defi d'equipe
   */
  async rejectChallenge(challengeId, adminUser, reason) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);

      await updateDoc(challengeRef, {
        status: 'failed',
        rejectionReason: reason || 'Non approuve',
        rejectedBy: adminUser.uid,
        updatedAt: serverTimestamp()
      });

      console.log(`❌ [TEAM_CHALLENGE] Defi rejete: ${challengeId}`);

      return { success: true, message: 'Defi rejete' };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur rejet:', error);
      throw error;
    }
  }

  // ==========================================
  // CONTRIBUTION A UN DEFI
  // ==========================================

  /**
   * Ajouter une contribution au defi
   */
  async contributeToChallenge(challengeId, user, amount, description = '') {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      if (challenge.status !== 'active') {
        throw new Error('Ce defi n\'est pas actif');
      }

      if (amount <= 0) {
        throw new Error('Montant de contribution invalide');
      }

      const contribution = {
        odId: Date.now().toString(),
        oderId: user.uid,
        userName: user.displayName || user.email,
        amount: Number(amount),
        description: description.trim(),
        createdAt: new Date().toISOString()
      };

      const newCurrentValue = (challenge.currentValue || 0) + Number(amount);
      const isCompleted = newCurrentValue >= challenge.targetValue;

      // Mettre a jour le defi
      await updateDoc(challengeRef, {
        currentValue: newCurrentValue,
        contributions: arrayUnion(contribution),
        contributorsCount: increment(1),
        updatedAt: serverTimestamp(),
        ...(isCompleted && {
          status: 'completed',
          completedAt: serverTimestamp()
        })
      });

      console.log(`📈 [TEAM_CHALLENGE] Contribution: +${amount} ${challenge.unit} par ${user.displayName}`);

      // Si le defi est complete, verser les XP dans la cagnotte
      if (isCompleted) {
        await this.awardTeamPoolXP(challenge.xpReward, challenge.title);
      }

      return {
        success: true,
        message: `+${amount} ${challenge.unit} ajoute !`,
        newValue: newCurrentValue,
        completed: isCompleted
      };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur contribution:', error);
      throw error;
    }
  }

  /**
   * Mettre a jour la valeur actuelle (admin)
   */
  async updateCurrentValue(challengeId, newValue, adminUser) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();
      const isCompleted = newValue >= challenge.targetValue;

      await updateDoc(challengeRef, {
        currentValue: Number(newValue),
        updatedAt: serverTimestamp(),
        updatedBy: adminUser.uid,
        ...(isCompleted && challenge.status === 'active' && {
          status: 'completed',
          completedAt: serverTimestamp()
        })
      });

      // Si le defi vient d'etre complete
      if (isCompleted && challenge.status === 'active') {
        await this.awardTeamPoolXP(challenge.xpReward, challenge.title);
      }

      console.log(`📊 [TEAM_CHALLENGE] Valeur mise a jour: ${newValue}/${challenge.targetValue}`);

      return {
        success: true,
        message: 'Valeur mise a jour',
        completed: isCompleted
      };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur mise a jour:', error);
      throw error;
    }
  }

  // ==========================================
  // VERSEMENT XP DANS LA CAGNOTTE
  // ==========================================

  /**
   * Verser les XP dans la cagnotte d'equipe
   */
  async awardTeamPoolXP(xpAmount, challengeTitle) {
    try {
      const poolRef = doc(db, 'teamPool', 'main');
      const poolSnap = await getDoc(poolRef);

      if (poolSnap.exists()) {
        await updateDoc(poolRef, {
          totalXP: increment(xpAmount),
          lastContribution: serverTimestamp()
        });
      } else {
        // Creer le pool s'il n'existe pas avec setDoc
        await setDoc(poolRef, {
          totalXP: xpAmount,
          currentLevel: 'BRONZE',
          lastContribution: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }

      // Ajouter dans l'historique
      await addDoc(collection(db, 'teamContributions'), {
        type: 'team_challenge_reward',
        amount: xpAmount,
        description: `Defi d'equipe accompli: ${challengeTitle}`,
        createdAt: serverTimestamp()
      });

      // Notifier l'equipe
      try {
        await notificationService.notifyAll({
          type: 'team_challenge_completed',
          title: '🏆 Defi d\'Equipe Accompli !',
          message: `"${challengeTitle}" - +${xpAmount} XP verses dans la cagnotte !`,
          icon: '🏆',
          link: '/challenges'
        });
      } catch (notifError) {
        console.warn('Erreur notification:', notifError);
      }

      console.log(`💰 [TEAM_POOL] +${xpAmount} XP pour defi: ${challengeTitle}`);

    } catch (error) {
      console.error('❌ [TEAM_POOL] Erreur versement XP:', error);
    }
  }

  // ==========================================
  // LECTURE DES DEFIS
  // ==========================================

  /**
   * Recuperer tous les defis d'equipe
   */
  async getAllChallenges(limitCount = 50) {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
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

      return challenges;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur lecture:', error);
      return [];
    }
  }

  /**
   * Recuperer les defis actifs
   */
  async getActiveChallenges() {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
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

      return challenges;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur lecture actifs:', error);
      return [];
    }
  }

  /**
   * Recuperer les defis en attente (admin)
   */
  async getPendingChallenges() {
    try {
      const pendingQuery = query(
        collection(db, this.collectionName),
        where('status', '==', 'pending_approval'),
        orderBy('createdAt', 'desc')
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

      return challenges;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur lecture pending:', error);
      return [];
    }
  }

  /**
   * Statistiques des defis d'equipe
   */
  async getTeamChallengeStats() {
    try {
      const challenges = await this.getAllChallenges(500);

      const stats = {
        total: challenges.length,
        active: challenges.filter(c => c.status === 'active').length,
        pending: challenges.filter(c => c.status === 'pending_approval').length,
        completed: challenges.filter(c => c.status === 'completed').length,
        failed: challenges.filter(c => c.status === 'failed').length,
        totalXpEarned: challenges
          .filter(c => c.status === 'completed')
          .reduce((sum, c) => sum + (c.xpReward || 0), 0),
        byType: {}
      };

      // Stats par type
      Object.keys(TEAM_CHALLENGE_TYPES).forEach(type => {
        stats.byType[type] = challenges.filter(c => c.type === type && c.status === 'completed').length;
      });

      return stats;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur stats:', error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        totalXpEarned: 0,
        byType: {}
      };
    }
  }

  // ==========================================
  // ABONNEMENTS TEMPS REEL
  // ==========================================

  /**
   * S'abonner a tous les defis d'equipe
   */
  subscribeToAllChallenges(callback) {
    try {
      const challengesQuery = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
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
        callback(challenges);
      });

      this.listeners.set('all_challenges', unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur abonnement:', error);
      return () => {};
    }
  }

  /**
   * S'abonner aux defis actifs
   */
  subscribeToActiveChallenges(callback) {
    try {
      const activeQuery = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(activeQuery, (snapshot) => {
        const challenges = [];
        snapshot.forEach((doc) => {
          challenges.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        callback(challenges);
      });

      this.listeners.set('active_challenges', unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur abonnement actifs:', error);
      return () => {};
    }
  }

  /**
   * S'abonner aux defis en attente (admin)
   */
  subscribeToPendingChallenges(callback) {
    try {
      const pendingQuery = query(
        collection(db, this.collectionName),
        where('status', '==', 'pending_approval')
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
        callback(challenges);
      });

      this.listeners.set('pending_challenges', unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur abonnement pending:', error);
      return () => {};
    }
  }

  // ==========================================
  // SUPPRESSION
  // ==========================================

  /**
   * Supprimer un defi (admin ou createur si pending)
   */
  async deleteChallenge(challengeId, userId, isAdmin = false) {
    try {
      const challengeRef = doc(db, this.collectionName, challengeId);
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        throw new Error('Defi non trouve');
      }

      const challenge = challengeSnap.data();

      // Verifier les permissions
      if (!isAdmin && challenge.createdBy !== userId) {
        throw new Error('Permission refusee');
      }

      if (!isAdmin && challenge.status !== 'pending_approval') {
        throw new Error('Seuls les defis en attente peuvent etre supprimes');
      }

      await deleteDoc(challengeRef);

      console.log(`🗑️ [TEAM_CHALLENGE] Defi supprime: ${challengeId}`);

      return { success: true, message: 'Defi supprime' };

    } catch (error) {
      console.error('❌ [TEAM_CHALLENGE] Erreur suppression:', error);
      throw error;
    }
  }

  // ==========================================
  // NETTOYAGE
  // ==========================================

  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('🧹 [TEAM_CHALLENGE] Listeners nettoyes');
  }
}

// Export singleton
export const teamChallengeService = new TeamChallengeService();
export default teamChallengeService;
