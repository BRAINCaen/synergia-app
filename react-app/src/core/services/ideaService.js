// ==========================================
// react-app/src/core/services/ideaService.js
// SERVICE BOÎTE À IDÉES - SYNERGIA v4.0
// 💡 Système de soumission et vote d'idées
// ==========================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';
import notificationService from './notificationService.js';
import xpHistoryService from './xpHistoryService.js';

// 📊 CONSTANTES XP
export const IDEA_XP = {
  SUBMIT: 10,        // Soumettre une idée
  ADOPTED: 100,      // Idée adoptée par le Maître de Guilde
  IMPLEMENTED: 200,  // Idée implémentée par l'auteur
  VOTE: 2            // Voter pour une idée (bonus auteur)
};

// 📋 STATUTS D'IDÉE
export const IDEA_STATUS = {
  PENDING: 'pending',           // En attente de votes
  POPULAR: 'popular',           // Populaire (5+ votes)
  UNDER_REVIEW: 'under_review', // En cours de review par Maître de Guilde
  ADOPTED: 'adopted',           // Adoptée
  IMPLEMENTED: 'implemented',   // Implémentée
  REJECTED: 'rejected'          // Rejetée
};

// 🏷️ CATÉGORIES D'IDÉES
export const IDEA_CATEGORIES = {
  FEATURE: { id: 'feature', label: 'Nouvelle fonctionnalité', icon: '✨', color: 'purple' },
  IMPROVEMENT: { id: 'improvement', label: 'Amélioration', icon: '🔧', color: 'blue' },
  BUG: { id: 'bug', label: 'Correction de bug', icon: '🐛', color: 'red' },
  UX: { id: 'ux', label: 'Expérience utilisateur', icon: '🎨', color: 'pink' },
  PROCESS: { id: 'process', label: 'Processus interne', icon: '⚙️', color: 'gray' },
  GAMIFICATION: { id: 'gamification', label: 'Gamification', icon: '🎮', color: 'green' },
  OTHER: { id: 'other', label: 'Autre', icon: '💡', color: 'yellow' }
};

// 🎖️ SEUILS
export const IDEA_THRESHOLDS = {
  POPULAR: 5,     // Votes pour devenir populaire
  HOT: 10,        // Votes pour être "hot"
  TRENDING: 3,    // Votes en 24h pour être trending
  QUORUM: 3       // Votes minimum requis pour pouvoir adopter une idée
};

/**
 * Service de gestion de la Boîte à Idées
 */
export const ideaService = {

  /**
   * 🧙 Soumettre une nouvelle idée (+10 XP auto)
   */
  async submitIdea(userId, userName, ideaData) {
    try {
      console.log('💡 [IDEAS] Soumission idée par:', userName);

      const newIdea = {
        // Contenu
        title: ideaData.title,
        description: ideaData.description,
        category: ideaData.category || 'other',

        // Auteur
        authorId: userId,
        authorName: userName,

        // Statut
        status: IDEA_STATUS.PENDING,

        // Votes
        votes: [],
        voteCount: 0,

        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Review
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: null,

        // Implémentation
        implementedAt: null,
        implementedBy: null
      };

      const docRef = await addDoc(collection(db, 'ideas'), newIdea);
      console.log('✅ [IDEAS] Idée créée:', docRef.id);

      // Attribuer XP à l'auteur
      await this.awardXpToUser(userId, IDEA_XP.SUBMIT, 'Idée soumise');

      // Incrémenter compteur d'idées de l'utilisateur
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.ideasSubmitted': increment(1),
        updatedAt: serverTimestamp()
      });

      // 🔔 NOTIFIER TOUS LES UTILISATEURS DE LA NOUVELLE IDÉE
      try {
        await notificationService.notifyAllUsersNewIdea({
          ideaId: docRef.id,
          ideaTitle: ideaData.title,
          authorId: userId,
          authorName: userName,
          category: ideaData.category || 'other'
        });
        console.log('🔔 [IDEAS] Tous les utilisateurs notifiés de la nouvelle idée');
      } catch (notifError) {
        console.warn('⚠️ [IDEAS] Erreur notification nouvelle idée:', notifError);
      }

      return {
        success: true,
        ideaId: docRef.id,
        xpAwarded: IDEA_XP.SUBMIT
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur soumission:', error);
      throw error;
    }
  },

  /**
   * 👥 Voter pour une idée
   */
  async voteForIdea(ideaId, voterId, voterName) {
    try {
      console.log('👍 [IDEAS] Vote pour idée:', ideaId, 'par:', voterName);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();

      // Vérifier si l'utilisateur a déjà voté
      if (ideaData.votes?.some(v => v.oderId === voterId)) {
        throw new Error('Vous avez déjà voté pour cette idée');
      }

      // Ne pas pouvoir voter pour sa propre idée
      if (ideaData.authorId === voterId) {
        throw new Error('Vous ne pouvez pas voter pour votre propre idée');
      }

      const vote = {
        oderId: voterId,
        voterName,
        votedAt: new Date().toISOString()
      };

      const newVoteCount = (ideaData.voteCount || 0) + 1;

      // Mettre à jour le statut si populaire
      let newStatus = ideaData.status;
      if (newVoteCount >= IDEA_THRESHOLDS.POPULAR && ideaData.status === IDEA_STATUS.PENDING) {
        newStatus = IDEA_STATUS.POPULAR;
      }

      await updateDoc(ideaRef, {
        votes: arrayUnion(vote),
        voteCount: increment(1),
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [IDEAS] Vote enregistré, total:', newVoteCount);

      // 🔔 NOTIFIER L'AUTEUR DU VOTE
      try {
        await notificationService.notifyIdeaVoted({
          ideaId,
          ideaTitle: ideaData.title,
          authorId: ideaData.authorId,
          voterName,
          voteCount: newVoteCount
        });
        console.log('🔔 [IDEAS] Auteur notifié du vote');
      } catch (notifError) {
        console.warn('⚠️ [IDEAS] Erreur notification vote:', notifError);
      }

      return {
        success: true,
        newVoteCount,
        becamePopular: newStatus === IDEA_STATUS.POPULAR && ideaData.status !== IDEA_STATUS.POPULAR
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur vote:', error);
      throw error;
    }
  },

  /**
   * 👎 Retirer son vote
   */
  async removeVote(ideaId, oderId) {
    try {
      console.log('👎 [IDEAS] Retrait vote:', ideaId);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();
      const voteToRemove = ideaData.votes?.find(v => v.oderId === oderId);

      if (!voteToRemove) {
        throw new Error('Vote non trouvé');
      }

      const newVoteCount = Math.max(0, (ideaData.voteCount || 1) - 1);

      // Revenir au statut pending si plus assez de votes
      let newStatus = ideaData.status;
      if (newVoteCount < IDEA_THRESHOLDS.POPULAR && ideaData.status === IDEA_STATUS.POPULAR) {
        newStatus = IDEA_STATUS.PENDING;
      }

      await updateDoc(ideaRef, {
        votes: arrayRemove(voteToRemove),
        voteCount: newVoteCount,
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      return { success: true, newVoteCount };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur retrait vote:', error);
      throw error;
    }
  },

  /**
   * 👑 Review par le Maître de Guilde - Adopter une idée (+100 XP auteur)
   * Requiert que le quorum de votes soit atteint
   */
  async adoptIdea(ideaId, reviewerId, reviewerName, comment = '') {
    try {
      console.log('👑 [IDEAS] Adoption idée:', ideaId, 'par:', reviewerName);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();
      const voteCount = ideaData.voteCount || 0;

      // Vérifier que le quorum est atteint
      if (voteCount < IDEA_THRESHOLDS.QUORUM) {
        throw new Error(`Quorum non atteint. ${voteCount}/${IDEA_THRESHOLDS.QUORUM} votes requis.`);
      }

      await updateDoc(ideaRef, {
        status: IDEA_STATUS.ADOPTED,
        reviewedBy: reviewerId,
        reviewerName,
        reviewedAt: serverTimestamp(),
        reviewComment: comment,
        updatedAt: serverTimestamp()
      });

      // Attribuer XP à l'auteur
      await this.awardXpToUser(ideaData.authorId, IDEA_XP.ADOPTED, 'Idée adoptée');

      // Incrémenter compteur d'idées adoptées
      const userRef = doc(db, 'users', ideaData.authorId);
      await updateDoc(userRef, {
        'gamification.ideasAdopted': increment(1),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [IDEAS] Idée adoptée, +100 XP pour:', ideaData.authorName);

      // 🔔 NOTIFIER L'AUTEUR QUE SON IDÉE A ÉTÉ ADOPTÉE
      try {
        await notificationService.notifyIdeaAdopted({
          ideaId,
          ideaTitle: ideaData.title,
          authorId: ideaData.authorId,
          reviewerName,
          xpAwarded: IDEA_XP.ADOPTED
        });
        console.log('🔔 [IDEAS] Auteur notifié de l\'adoption');
      } catch (notifError) {
        console.warn('⚠️ [IDEAS] Erreur notification adoption:', notifError);
      }

      return {
        success: true,
        authorId: ideaData.authorId,
        xpAwarded: IDEA_XP.ADOPTED
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur adoption:', error);
      throw error;
    }
  },

  /**
   * 🏗️ Marquer comme implémentée (+200 XP si par l'auteur)
   */
  async markAsImplemented(ideaId, implementerId, implementerName) {
    try {
      console.log('🏗️ [IDEAS] Implémentation idée:', ideaId);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();
      const isAuthorImplementing = ideaData.authorId === implementerId;

      await updateDoc(ideaRef, {
        status: IDEA_STATUS.IMPLEMENTED,
        implementedAt: serverTimestamp(),
        implementedBy: implementerId,
        implementerName,
        updatedAt: serverTimestamp()
      });

      let xpAwarded = 0;

      // Bonus XP si l'auteur implémente lui-même
      if (isAuthorImplementing) {
        await this.awardXpToUser(implementerId, IDEA_XP.IMPLEMENTED, 'Idée implémentée par auteur');
        xpAwarded = IDEA_XP.IMPLEMENTED;

        // Incrémenter compteur d'idées implémentées
        const userRef = doc(db, 'users', implementerId);
        await updateDoc(userRef, {
          'gamification.ideasImplemented': increment(1),
          updatedAt: serverTimestamp()
        });
      }

      console.log('✅ [IDEAS] Idée implémentée', isAuthorImplementing ? '(+200 XP auteur)' : '');

      // 🔔 NOTIFIER TOUS LES UTILISATEURS DE L'IMPLÉMENTATION
      try {
        await notificationService.notifyIdeaImplemented({
          ideaId,
          ideaTitle: ideaData.title,
          authorName: ideaData.authorName,
          implementerName
        });
        console.log('🔔 [IDEAS] Tous les utilisateurs notifiés de l\'implémentation');
      } catch (notifError) {
        console.warn('⚠️ [IDEAS] Erreur notification implémentation:', notifError);
      }

      return {
        success: true,
        isAuthorImplementing,
        xpAwarded
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur implémentation:', error);
      throw error;
    }
  },

  /**
   * ❌ Rejeter une idée
   */
  async rejectIdea(ideaId, reviewerId, reviewerName, reason = '') {
    try {
      console.log('❌ [IDEAS] Rejet idée:', ideaId);

      const ideaRef = doc(db, 'ideas', ideaId);

      await updateDoc(ideaRef, {
        status: IDEA_STATUS.REJECTED,
        reviewedBy: reviewerId,
        reviewerName,
        reviewedAt: serverTimestamp(),
        reviewComment: reason,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur rejet:', error);
      throw error;
    }
  },

  /**
   * 🔄 Relancer le vote sur une idée (ADMIN uniquement)
   * Remet l'idée en statut PENDING et réinitialise les votes
   */
  async relaunchVote(ideaId, adminId, adminName, reason = '') {
    try {
      console.log('🔄 [IDEAS] Relance vote idée:', ideaId, 'par:', adminName);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();
      const previousStatus = ideaData.status;
      const previousVoteCount = ideaData.voteCount || 0;

      // Réinitialiser l'idée pour un nouveau vote
      await updateDoc(ideaRef, {
        status: IDEA_STATUS.PENDING,
        votes: [],
        voteCount: 0,
        // Garder un historique des relances
        voteHistory: arrayUnion({
          relaunchedAt: new Date().toISOString(),
          relaunchedBy: adminId,
          relaunchedByName: adminName,
          reason: reason,
          previousStatus,
          previousVoteCount
        }),
        // Réinitialiser le review
        reviewedBy: null,
        reviewerName: null,
        reviewedAt: null,
        reviewComment: null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [IDEAS] Vote relancé, précédent statut:', previousStatus, 'votes:', previousVoteCount);

      // Notifier l'auteur de la relance
      try {
        await notificationService.sendNotification(ideaData.authorId, {
          type: 'idea_vote_relaunched',
          title: '🔄 Vote relancé sur votre idée',
          message: `L'admin ${adminName} a relancé le vote sur "${ideaData.title}"${reason ? `: ${reason}` : ''}`,
          data: { ideaId, ideaTitle: ideaData.title }
        });
      } catch (notifError) {
        console.warn('⚠️ [IDEAS] Erreur notification relance:', notifError);
      }

      return {
        success: true,
        previousStatus,
        previousVoteCount
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur relance vote:', error);
      throw error;
    }
  },

  /**
   * 📋 Récupérer toutes les idées
   */
  async getAllIdeas(filters = {}) {
    try {
      console.log('📋 [IDEAS] Récupération idées avec filtres:', filters);

      let q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));

      // Filtrer par statut
      if (filters.status) {
        q = query(collection(db, 'ideas'),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        );
      }

      // Filtrer par catégorie
      if (filters.category) {
        q = query(collection(db, 'ideas'),
          where('category', '==', filters.category),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);

      const ideas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
        implementedAt: doc.data().implementedAt?.toDate()
      }));

      // Tri par votes si demandé
      if (filters.sortBy === 'votes') {
        ideas.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      }

      console.log('✅ [IDEAS] Idées récupérées:', ideas.length);
      return ideas;
    } catch (error) {
      console.error('❌ [IDEAS] Erreur récupération:', error);
      throw error;
    }
  },

  /**
   * 📊 Récupérer les idées populaires (pour review)
   */
  async getPopularIdeas() {
    try {
      const q = query(
        collection(db, 'ideas'),
        where('status', 'in', [IDEA_STATUS.POPULAR, IDEA_STATUS.PENDING]),
        orderBy('voteCount', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        .filter(idea => (idea.voteCount || 0) >= IDEA_THRESHOLDS.POPULAR);
    } catch (error) {
      console.error('❌ [IDEAS] Erreur idées populaires:', error);
      // Fallback si l'index n'existe pas
      const allIdeas = await this.getAllIdeas();
      return allIdeas.filter(i =>
        (i.voteCount || 0) >= IDEA_THRESHOLDS.POPULAR &&
        [IDEA_STATUS.POPULAR, IDEA_STATUS.PENDING].includes(i.status)
      );
    }
  },

  /**
   * 👤 Récupérer les idées d'un utilisateur
   */
  async getUserIdeas(userId) {
    try {
      const q = query(
        collection(db, 'ideas'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('❌ [IDEAS] Erreur idées utilisateur:', error);
      throw error;
    }
  },

  /**
   * 🔔 Compter les idées non votées par l'utilisateur
   * (Idées en attente de votes que l'utilisateur n'a pas encore votées)
   */
  async getUnvotedCount(userId) {
    try {
      const ideas = await this.getAllIdeas();
      // Filtrer les idées votables (pending ou popular) que l'utilisateur n'a pas votées
      // et dont il n'est pas l'auteur
      const unvoted = ideas.filter(idea => {
        // Exclure les idées de l'utilisateur (il ne peut pas voter pour lui-même)
        if (idea.authorId === userId) return false;
        // Seulement les idées en attente ou populaires (votables)
        if (![IDEA_STATUS.PENDING, IDEA_STATUS.POPULAR].includes(idea.status)) return false;
        // Vérifier si l'utilisateur a déjà voté
        const hasVoted = idea.votes?.some(v => v.oderId === userId);
        return !hasVoted;
      });
      return unvoted.length;
    } catch (error) {
      console.error('❌ [IDEAS] Erreur comptage non votées:', error);
      return 0;
    }
  },

  /**
   * 📊 Statistiques des idées
   */
  async getIdeaStats() {
    try {
      const ideas = await this.getAllIdeas();

      return {
        total: ideas.length,
        pending: ideas.filter(i => i.status === IDEA_STATUS.PENDING).length,
        popular: ideas.filter(i => i.status === IDEA_STATUS.POPULAR).length,
        adopted: ideas.filter(i => i.status === IDEA_STATUS.ADOPTED).length,
        implemented: ideas.filter(i => i.status === IDEA_STATUS.IMPLEMENTED).length,
        rejected: ideas.filter(i => i.status === IDEA_STATUS.REJECTED).length,
        totalVotes: ideas.reduce((sum, i) => sum + (i.voteCount || 0), 0)
      };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur stats:', error);
      return { total: 0, pending: 0, popular: 0, adopted: 0, implemented: 0, rejected: 0, totalVotes: 0 };
    }
  },

  /**
   * ✏️ Modifier une idée (auteur uniquement)
   */
  async updateIdea(ideaId, userId, updateData) {
    try {
      console.log('✏️ [IDEAS] Modification idée:', ideaId);

      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      const ideaData = ideaDoc.data();

      // Seul l'auteur peut modifier son idée
      if (ideaData.authorId !== userId) {
        throw new Error('Seul l\'auteur peut modifier cette idée');
      }

      // Ne pas permettre la modification si l'idée est déjà adoptée/implémentée/rejetée
      if ([IDEA_STATUS.IMPLEMENTED, IDEA_STATUS.REJECTED].includes(ideaData.status)) {
        throw new Error('Cette idée ne peut plus être modifiée');
      }

      // Filtrer les champs modifiables
      const allowedFields = ['title', 'description', 'category'];
      const sanitizedUpdate = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          sanitizedUpdate[field] = updateData[field];
        }
      }

      if (Object.keys(sanitizedUpdate).length === 0) {
        throw new Error('Aucun champ à modifier');
      }

      await updateDoc(ideaRef, {
        ...sanitizedUpdate,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [IDEAS] Idée modifiée:', ideaId);

      return { success: true };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur modification:', error);
      throw error;
    }
  },

  /**
   * 🗑️ Supprimer une idée
   */
  async deleteIdea(ideaId, userId) {
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idée non trouvée');
      }

      // Seul l'auteur ou un admin peut supprimer
      const ideaData = ideaDoc.data();
      if (ideaData.authorId !== userId) {
        throw new Error('Non autorisé');
      }

      await deleteDoc(ideaRef);
      console.log('✅ [IDEAS] Idée supprimée:', ideaId);

      return { success: true };
    } catch (error) {
      console.error('❌ [IDEAS] Erreur suppression:', error);
      throw error;
    }
  },

  /**
   * 💰 Attribuer XP à un utilisateur
   */
  async awardXpToUser(userId, xpAmount, reason) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const currentXp = userSnap.exists() ? (userSnap.data().gamification?.totalXp || 0) : 0;

      await updateDoc(userRef, {
        'gamification.totalXp': increment(xpAmount),
        updatedAt: serverTimestamp()
      });

      // 📊 ENREGISTRER DANS L'HISTORIQUE XP
      await xpHistoryService.logXPEvent({
        userId,
        type: 'other',
        amount: xpAmount,
        balance: currentXp + xpAmount,
        source: 'idea',
        description: reason
      });

      console.log(`💰 [IDEAS] +${xpAmount} XP pour ${userId}: ${reason}`);
    } catch (error) {
      console.error('❌ [IDEAS] Erreur attribution XP:', error);
    }
  }
};

export default ideaService;
