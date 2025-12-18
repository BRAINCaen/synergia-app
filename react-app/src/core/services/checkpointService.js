// ==========================================
// react-app/src/core/services/checkpointService.js
// SERVICE CHECKPOINTS - Bilans Trimestriels Gamifiés
// ==========================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// CONSTANTES ET CONFIGURATION
// ==========================================

export const CHECKPOINT_STATUS = {
  DRAFT: 'draft',           // Brouillon, pas encore soumis
  REFLECTION: 'reflection', // En attente d'auto-réflexion
  FEEDBACK: 'feedback',     // En attente de feedbacks peers
  REVIEW: 'review',         // En attente de review Maître de Guilde
  COMPLETED: 'completed',   // Checkpoint terminé et validé
  CANCELLED: 'cancelled'    // Annulé
};

export const CHECKPOINT_QUARTERS = {
  Q1: { label: 'T1 - Janvier à Mars', months: [0, 1, 2] },
  Q2: { label: 'T2 - Avril à Juin', months: [3, 4, 5] },
  Q3: { label: 'T3 - Juillet à Septembre', months: [6, 7, 8] },
  Q4: { label: 'T4 - Octobre à Décembre', months: [9, 10, 11] }
};

// XP Configuration
const XP_CONFIG = {
  completeReflection: 30,    // Auto-réflexion complétée
  givePeerFeedback: 20,      // Donner un feedback
  checkpointCompleted: 100,  // Checkpoint clôturé par Maître de Guilde
  bonusEarlyCompletion: 25   // Bonus si terminé avant la deadline
};

// Questions d'auto-réflexion
export const REFLECTION_QUESTIONS = [
  {
    id: 'proudest_moments',
    question: 'Quelles sont tes plus grandes fiertés ce trimestre ?',
    placeholder: 'Les quêtes accomplies, les défis relevés, les moments où tu as brillé...',
    type: 'textarea',
    required: true
  },
  {
    id: 'learnings',
    question: 'Qu\'as-tu appris de nouveau ?',
    placeholder: 'Nouvelles compétences, nouvelles connaissances, nouvelles méthodes...',
    type: 'textarea',
    required: true
  },
  {
    id: 'challenges',
    question: 'Quelles difficultés as-tu rencontrées ?',
    placeholder: 'Les obstacles, les moments difficiles, ce qui t\'a freiné...',
    type: 'textarea',
    required: true
  },
  {
    id: 'improvements',
    question: 'Qu\'aimerais-tu améliorer ?',
    placeholder: 'Ce que tu voudrais faire mieux, tes axes de progression...',
    type: 'textarea',
    required: true
  },
  {
    id: 'support_needed',
    question: 'De quel soutien aurais-tu besoin ?',
    placeholder: 'Formation, mentorat, outils, ressources, accompagnement...',
    type: 'textarea',
    required: false
  }
];

// Questions de feedback peer
export const PEER_FEEDBACK_QUESTIONS = [
  {
    id: 'strengths',
    question: 'Quelles sont les forces de cet aventurier que tu as observées ?',
    placeholder: 'Ce qu\'il/elle fait particulièrement bien...',
    type: 'textarea',
    required: true
  },
  {
    id: 'collaboration',
    question: 'Comment s\'est passée ta collaboration avec lui/elle ?',
    placeholder: 'Tes interactions, le travail d\'équipe, la communication...',
    type: 'textarea',
    required: true
  },
  {
    id: 'impact',
    question: 'Quel impact positif a-t-il/elle eu sur l\'équipe ?',
    placeholder: 'Sa contribution à l\'ambiance, aux projets, à l\'entraide...',
    type: 'textarea',
    required: true
  },
  {
    id: 'suggestion',
    question: 'As-tu une suggestion constructive à partager ?',
    placeholder: 'Un conseil bienveillant, une idée d\'amélioration...',
    type: 'textarea',
    required: false
  }
];

// ==========================================
// SERVICE CHECKPOINTS
// ==========================================

class CheckpointService {
  constructor() {
    this.listeners = new Map();
    this.collectionName = 'checkpoints';
    console.log('🏁 CheckpointService initialisé');
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Obtenir le trimestre actuel
   */
  getCurrentQuarter() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    if (month <= 2) return { quarter: 'Q1', year, label: CHECKPOINT_QUARTERS.Q1.label };
    if (month <= 5) return { quarter: 'Q2', year, label: CHECKPOINT_QUARTERS.Q2.label };
    if (month <= 8) return { quarter: 'Q3', year, label: CHECKPOINT_QUARTERS.Q3.label };
    return { quarter: 'Q4', year, label: CHECKPOINT_QUARTERS.Q4.label };
  }

  /**
   * Obtenir l'ID unique d'un checkpoint (userId_year_quarter)
   */
  getCheckpointId(userId, year, quarter) {
    return `${userId}_${year}_${quarter}`;
  }

  /**
   * Calculer la deadline du checkpoint (fin du trimestre + 2 semaines)
   */
  getCheckpointDeadline(year, quarter) {
    const quarterEndMonths = { Q1: 2, Q2: 5, Q3: 8, Q4: 11 };
    const endMonth = quarterEndMonths[quarter];

    // Dernier jour du trimestre + 2 semaines de grâce
    const deadline = new Date(year, endMonth + 1, 0); // Dernier jour du mois
    deadline.setDate(deadline.getDate() + 14); // +2 semaines

    return deadline;
  }

  // ==========================================
  // GÉNÉRATION DU RÉCAP AUTOMATIQUE
  // ==========================================

  /**
   * Générer le récap automatique des accomplissements du trimestre
   */
  async generateQuarterlyRecap(userId, year, quarter) {
    try {
      console.log('📊 Génération récap trimestre:', { userId, year, quarter });

      const quarterMonths = CHECKPOINT_QUARTERS[quarter].months;
      const startDate = new Date(year, quarterMonths[0], 1);
      const endDate = new Date(year, quarterMonths[2] + 1, 0, 23, 59, 59);

      // Récupérer les données de l'utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Récupérer les quêtes accomplies dans le trimestre
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('completedBy', '==', userId),
        where('status', '==', 'approved')
      );
      const tasksSnapshot = await getDocs(tasksQuery);

      let completedQuests = [];
      let totalXpEarned = 0;

      tasksSnapshot.forEach((doc) => {
        const task = doc.data();
        const completedAt = task.completedAt?.toDate?.() || task.approvedAt?.toDate?.();
        if (completedAt && completedAt >= startDate && completedAt <= endDate) {
          completedQuests.push({
            id: doc.id,
            title: task.title,
            xp: task.xpReward || 0,
            completedAt: completedAt
          });
          totalXpEarned += task.xpReward || 0;
        }
      });

      // Récupérer les boosts reçus
      const boostsQuery = query(
        collection(db, 'boosts'),
        where('toUserId', '==', userId)
      );
      const boostsSnapshot = await getDocs(boostsQuery);

      let boostsReceived = [];
      boostsSnapshot.forEach((doc) => {
        const boost = doc.data();
        const createdAt = boost.createdAt?.toDate?.();
        if (createdAt && createdAt >= startDate && createdAt <= endDate) {
          boostsReceived.push({
            id: doc.id,
            type: boost.type,
            fromUserName: boost.fromUserName,
            message: boost.message,
            createdAt: createdAt
          });
        }
      });

      // Récupérer les badges débloqués (depuis userBadges ou gamification)
      const badges = userData.gamification?.badges || [];
      const unlockedBadges = badges.filter(badge => {
        const unlockedAt = badge.unlockedAt?.toDate?.();
        return unlockedAt && unlockedAt >= startDate && unlockedAt <= endDate;
      });

      // Calculer les statistiques
      const recap = {
        period: {
          quarter,
          year,
          label: CHECKPOINT_QUARTERS[quarter].label,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate)
        },

        quests: {
          total: completedQuests.length,
          list: completedQuests.slice(0, 10), // Top 10
          totalXp: totalXpEarned
        },

        boosts: {
          total: boostsReceived.length,
          byType: this.groupBoostsByType(boostsReceived),
          list: boostsReceived.slice(0, 5) // 5 derniers
        },

        badges: {
          total: unlockedBadges.length,
          list: unlockedBadges
        },

        level: {
          current: userData.gamification?.level || 1,
          totalXp: userData.gamification?.totalXp || 0,
          xpThisQuarter: totalXpEarned
        },

        // Statistiques supplémentaires
        stats: {
          averageXpPerQuest: completedQuests.length > 0
            ? Math.round(totalXpEarned / completedQuests.length)
            : 0,
          mostActiveMonth: this.getMostActiveMonth(completedQuests, quarterMonths),
          topSkillsUsed: [] // À enrichir avec le skill tree
        },

        generatedAt: serverTimestamp()
      };

      console.log('✅ Récap généré:', recap);
      return recap;

    } catch (error) {
      console.error('❌ Erreur génération récap:', error);
      throw error;
    }
  }

  /**
   * Grouper les boosts par type
   */
  groupBoostsByType(boosts) {
    return boosts.reduce((acc, boost) => {
      acc[boost.type] = (acc[boost.type] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Trouver le mois le plus actif
   */
  getMostActiveMonth(quests, quarterMonths) {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const byMonth = quests.reduce((acc, quest) => {
      const month = quest.completedAt.getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    let maxMonth = quarterMonths[0];
    let maxCount = 0;

    for (const [month, count] of Object.entries(byMonth)) {
      if (count > maxCount) {
        maxCount = count;
        maxMonth = parseInt(month);
      }
    }

    return { month: monthNames[maxMonth], count: maxCount };
  }

  // ==========================================
  // GESTION DES CHECKPOINTS
  // ==========================================

  /**
   * Créer ou récupérer un checkpoint pour un utilisateur
   */
  async getOrCreateCheckpoint(userId, year = null, quarter = null) {
    try {
      const current = this.getCurrentQuarter();
      year = year || current.year;
      quarter = quarter || current.quarter;

      const checkpointId = this.getCheckpointId(userId, year, quarter);
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (checkpointSnap.exists()) {
        return { id: checkpointId, ...checkpointSnap.data() };
      }

      // Générer le récap automatique
      const recap = await this.generateQuarterlyRecap(userId, year, quarter);

      // Créer le nouveau checkpoint
      const newCheckpoint = {
        userId,
        year,
        quarter,
        status: CHECKPOINT_STATUS.REFLECTION,

        // Récap auto-généré
        recap,

        // Auto-réflexion (à remplir par l'utilisateur)
        selfReflection: {
          completed: false,
          completedAt: null,
          answers: {}
        },

        // Feedbacks peers
        peerFeedback: {
          requestedPeers: [],      // IDs des peers sollicités
          receivedFeedbacks: [],   // Feedbacks reçus
          minRequired: 2,
          maxAllowed: 3
        },

        // Objectifs pour le prochain trimestre
        goals: {
          items: [],
          validatedByManager: false,
          validatedAt: null
        },

        // Review du Maître de Guilde
        managerReview: {
          managerId: null,
          managerName: null,
          notes: '',
          completedAt: null
        },

        // Métadonnées
        deadline: Timestamp.fromDate(this.getCheckpointDeadline(year, quarter)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,

        // XP
        xpEarned: 0
      };

      await setDoc(checkpointRef, newCheckpoint);
      console.log('✅ Checkpoint créé:', checkpointId);

      return { id: checkpointId, ...newCheckpoint };

    } catch (error) {
      console.error('❌ Erreur getOrCreateCheckpoint:', error);
      throw error;
    }
  }

  /**
   * Récupérer un checkpoint par ID
   */
  async getCheckpoint(checkpointId) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (!checkpointSnap.exists()) {
        return null;
      }

      return { id: checkpointId, ...checkpointSnap.data() };
    } catch (error) {
      console.error('❌ Erreur getCheckpoint:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les checkpoints d'un utilisateur
   */
  async getUserCheckpoints(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('year', 'desc')
      );

      const snapshot = await getDocs(q);
      const checkpoints = [];

      snapshot.forEach((doc) => {
        checkpoints.push({ id: doc.id, ...doc.data() });
      });

      // Trier par année puis par trimestre
      checkpoints.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        const quarters = ['Q4', 'Q3', 'Q2', 'Q1'];
        return quarters.indexOf(a.quarter) - quarters.indexOf(b.quarter);
      });

      return checkpoints;
    } catch (error) {
      console.error('❌ Erreur getUserCheckpoints:', error);
      return [];
    }
  }

  // ==========================================
  // AUTO-RÉFLEXION
  // ==========================================

  /**
   * Sauvegarder l'auto-réflexion
   */
  async saveSelfReflection(checkpointId, answers, isComplete = false) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (!checkpointSnap.exists()) {
        throw new Error('Checkpoint non trouvé');
      }

      const checkpoint = checkpointSnap.data();
      const wasAlreadyComplete = checkpoint.selfReflection?.completed;

      const updates = {
        'selfReflection.answers': answers,
        'selfReflection.completed': isComplete,
        updatedAt: serverTimestamp()
      };

      if (isComplete && !wasAlreadyComplete) {
        updates['selfReflection.completedAt'] = serverTimestamp();
        updates.status = CHECKPOINT_STATUS.FEEDBACK;

        // Attribuer XP pour complétion de réflexion
        await this.awardXP(checkpoint.userId, XP_CONFIG.completeReflection, 'Auto-réflexion complétée');
        updates.xpEarned = (checkpoint.xpEarned || 0) + XP_CONFIG.completeReflection;
      }

      await updateDoc(checkpointRef, updates);

      console.log('✅ Auto-réflexion sauvegardée');
      return {
        success: true,
        xpEarned: isComplete && !wasAlreadyComplete ? XP_CONFIG.completeReflection : 0
      };

    } catch (error) {
      console.error('❌ Erreur saveSelfReflection:', error);
      throw error;
    }
  }

  // ==========================================
  // FEEDBACK PEERS
  // ==========================================

  /**
   * Demander un feedback à un peer
   */
  async requestPeerFeedback(checkpointId, peerId) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (!checkpointSnap.exists()) {
        throw new Error('Checkpoint non trouvé');
      }

      const checkpoint = checkpointSnap.data();
      const requestedPeers = checkpoint.peerFeedback?.requestedPeers || [];

      if (requestedPeers.length >= checkpoint.peerFeedback.maxAllowed) {
        throw new Error('Nombre maximum de peers atteint');
      }

      if (requestedPeers.includes(peerId)) {
        throw new Error('Ce peer a déjà été sollicité');
      }

      if (peerId === checkpoint.userId) {
        throw new Error('Impossible de se demander un feedback à soi-même');
      }

      // Ajouter le peer à la liste
      requestedPeers.push(peerId);

      await updateDoc(checkpointRef, {
        'peerFeedback.requestedPeers': requestedPeers,
        updatedAt: serverTimestamp()
      });

      // TODO: Envoyer une notification au peer
      console.log('✅ Feedback demandé à:', peerId);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur requestPeerFeedback:', error);
      throw error;
    }
  }

  /**
   * Soumettre un feedback peer
   */
  async submitPeerFeedback(checkpointId, fromUserId, fromUserName, answers) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (!checkpointSnap.exists()) {
        throw new Error('Checkpoint non trouvé');
      }

      const checkpoint = checkpointSnap.data();
      const receivedFeedbacks = checkpoint.peerFeedback?.receivedFeedbacks || [];

      // Vérifier si ce peer a déjà donné un feedback
      if (receivedFeedbacks.some(f => f.fromUserId === fromUserId)) {
        throw new Error('Tu as déjà donné ton feedback');
      }

      // Ajouter le feedback
      const feedback = {
        fromUserId,
        fromUserName,
        answers,
        submittedAt: new Date().toISOString()
      };

      receivedFeedbacks.push(feedback);

      // Vérifier si on a assez de feedbacks pour passer en review
      const newStatus = receivedFeedbacks.length >= checkpoint.peerFeedback.minRequired
        ? CHECKPOINT_STATUS.REVIEW
        : checkpoint.status;

      await updateDoc(checkpointRef, {
        'peerFeedback.receivedFeedbacks': receivedFeedbacks,
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Attribuer XP au peer qui donne le feedback
      await this.awardXP(fromUserId, XP_CONFIG.givePeerFeedback, 'Feedback peer donné');

      console.log('✅ Feedback peer soumis');
      return { success: true, xpEarned: XP_CONFIG.givePeerFeedback };

    } catch (error) {
      console.error('❌ Erreur submitPeerFeedback:', error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes de feedback en attente pour un utilisateur
   */
  async getPendingFeedbackRequests(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('peerFeedback.requestedPeers', 'array-contains', userId),
        where('status', 'in', [CHECKPOINT_STATUS.FEEDBACK, CHECKPOINT_STATUS.REVIEW])
      );

      const snapshot = await getDocs(q);
      const requests = [];

      snapshot.forEach((doc) => {
        const checkpoint = doc.data();
        // Vérifier si l'utilisateur n'a pas déjà donné son feedback
        const alreadyGiven = checkpoint.peerFeedback?.receivedFeedbacks?.some(
          f => f.fromUserId === userId
        );

        if (!alreadyGiven) {
          requests.push({
            checkpointId: doc.id,
            userId: checkpoint.userId,
            quarter: checkpoint.quarter,
            year: checkpoint.year
          });
        }
      });

      return requests;
    } catch (error) {
      console.error('❌ Erreur getPendingFeedbackRequests:', error);
      return [];
    }
  }

  // ==========================================
  // OBJECTIFS
  // ==========================================

  /**
   * Définir les objectifs pour le prochain trimestre
   */
  async setGoals(checkpointId, goals) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);

      await updateDoc(checkpointRef, {
        'goals.items': goals,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Objectifs définis');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur setGoals:', error);
      throw error;
    }
  }

  // ==========================================
  // REVIEW MAÎTRE DE GUILDE
  // ==========================================

  /**
   * Compléter le checkpoint (Maître de Guilde)
   */
  async completeCheckpoint(checkpointId, managerId, managerName, notes = '') {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);
      const checkpointSnap = await getDoc(checkpointRef);

      if (!checkpointSnap.exists()) {
        throw new Error('Checkpoint non trouvé');
      }

      const checkpoint = checkpointSnap.data();

      if (checkpoint.status === CHECKPOINT_STATUS.COMPLETED) {
        throw new Error('Ce checkpoint est déjà terminé');
      }

      // Calculer bonus si terminé avant deadline
      const deadline = checkpoint.deadline?.toDate?.() || new Date();
      const isEarly = new Date() < deadline;
      const bonusXp = isEarly ? XP_CONFIG.bonusEarlyCompletion : 0;
      const totalXpForCompletion = XP_CONFIG.checkpointCompleted + bonusXp;

      await updateDoc(checkpointRef, {
        status: CHECKPOINT_STATUS.COMPLETED,
        'managerReview.managerId': managerId,
        'managerReview.managerName': managerName,
        'managerReview.notes': notes,
        'managerReview.completedAt': serverTimestamp(),
        'goals.validatedByManager': true,
        'goals.validatedAt': serverTimestamp(),
        completedAt: serverTimestamp(),
        xpEarned: (checkpoint.xpEarned || 0) + totalXpForCompletion,
        updatedAt: serverTimestamp()
      });

      // Attribuer XP à l'aventurier
      await this.awardXP(checkpoint.userId, totalXpForCompletion, 'Checkpoint validé');

      // TODO: Vérifier et attribuer le badge "Checkpoint Master" si 4 checkpoints

      console.log('🎉 Checkpoint terminé !');
      return {
        success: true,
        xpEarned: totalXpForCompletion,
        bonusXp,
        isEarly
      };

    } catch (error) {
      console.error('❌ Erreur completeCheckpoint:', error);
      throw error;
    }
  }

  /**
   * Récupérer les checkpoints en attente de review (pour admin)
   */
  async getPendingReviews() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', CHECKPOINT_STATUS.REVIEW)
      );

      const snapshot = await getDocs(q);
      const checkpoints = [];

      for (const docSnap of snapshot.docs) {
        const checkpoint = docSnap.data();

        // Récupérer les infos utilisateur
        const userDoc = await getDoc(doc(db, 'users', checkpoint.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        checkpoints.push({
          id: docSnap.id,
          ...checkpoint,
          user: {
            uid: checkpoint.userId,
            displayName: userData.displayName || 'Aventurier',
            photoURL: userData.photoURL
          }
        });
      }

      return checkpoints;
    } catch (error) {
      console.error('❌ Erreur getPendingReviews:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les checkpoints (pour admin)
   */
  async getAllCheckpoints(filters = {}) {
    try {
      let q = collection(db, this.collectionName);
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.year) {
        constraints.push(where('year', '==', filters.year));
      }
      if (filters.quarter) {
        constraints.push(where('quarter', '==', filters.quarter));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      const checkpoints = [];

      for (const docSnap of snapshot.docs) {
        const checkpoint = docSnap.data();

        // Récupérer les infos utilisateur
        const userDoc = await getDoc(doc(db, 'users', checkpoint.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        checkpoints.push({
          id: docSnap.id,
          ...checkpoint,
          user: {
            uid: checkpoint.userId,
            displayName: userData.displayName || 'Aventurier',
            photoURL: userData.photoURL
          }
        });
      }

      return checkpoints;
    } catch (error) {
      console.error('❌ Erreur getAllCheckpoints:', error);
      return [];
    }
  }

  // ==========================================
  // STATISTIQUES
  // ==========================================

  /**
   * Obtenir les statistiques des checkpoints
   */
  async getCheckpointStats(year = null) {
    try {
      year = year || new Date().getFullYear();

      const q = query(
        collection(db, this.collectionName),
        where('year', '==', year)
      );

      const snapshot = await getDocs(q);

      const stats = {
        total: 0,
        byStatus: {},
        byQuarter: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        completionRate: 0,
        averageXpEarned: 0
      };

      let totalXp = 0;
      let completedCount = 0;

      snapshot.forEach((doc) => {
        const checkpoint = doc.data();
        stats.total++;
        stats.byStatus[checkpoint.status] = (stats.byStatus[checkpoint.status] || 0) + 1;
        stats.byQuarter[checkpoint.quarter] = (stats.byQuarter[checkpoint.quarter] || 0) + 1;

        if (checkpoint.status === CHECKPOINT_STATUS.COMPLETED) {
          completedCount++;
          totalXp += checkpoint.xpEarned || 0;
        }
      });

      stats.completionRate = stats.total > 0
        ? Math.round((completedCount / stats.total) * 100)
        : 0;
      stats.averageXpEarned = completedCount > 0
        ? Math.round(totalXp / completedCount)
        : 0;

      return stats;
    } catch (error) {
      console.error('❌ Erreur getCheckpointStats:', error);
      return null;
    }
  }

  // ==========================================
  // XP ET RÉCOMPENSES
  // ==========================================

  /**
   * Attribuer de l'XP à un utilisateur
   */
  async awardXP(userId, amount, reason) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const currentXp = userSnap.data().gamification?.totalXp || 0;
      const newTotalXp = currentXp + amount;

      // Import dynamique pour éviter la dépendance circulaire
      const { calculateLevel } = await import('./levelService.js');
      const newLevel = calculateLevel(newTotalXp);

      await updateDoc(userRef, {
        'gamification.totalXp': newTotalXp,
        'gamification.level': newLevel,
        'gamification.lastXpGain': amount,
        'gamification.lastXpReason': reason,
        lastActivity: serverTimestamp()
      });

      console.log(`+${amount} XP pour ${reason}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur awardXP:', error);
      return false;
    }
  }

  // ==========================================
  // SUBSCRIPTIONS TEMPS RÉEL
  // ==========================================

  /**
   * S'abonner aux changements d'un checkpoint
   */
  subscribeToCheckpoint(checkpointId, callback) {
    try {
      const checkpointRef = doc(db, this.collectionName, checkpointId);

      const unsubscribe = onSnapshot(checkpointRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      });

      this.listeners.set(`checkpoint_${checkpointId}`, unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur subscribeToCheckpoint:', error);
      return () => {};
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
    console.log('🧹 Listeners Checkpoint nettoyés');
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export const checkpointService = new CheckpointService();
export default checkpointService;
