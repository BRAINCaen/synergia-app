// ==========================================
// react-app/src/core/services/teamRewardVotingService.js
// SERVICE DE VOTE POUR RECOMPENSES EQUIPE
// Permet aux utilisateurs de voter pour choisir
// comment utiliser les XP d'equipe
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
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';
import notificationService from './notificationService.js';

/**
 * Statuts de session de vote
 */
export const VOTE_SESSION_STATUS = {
  ACTIVE: 'active',           // Session ouverte aux votes
  CLOSED: 'closed',           // Session terminee, en attente validation admin
  APPROVED: 'approved',       // Recompense approuvee par admin
  REJECTED: 'rejected',       // Recompense refusee par admin
  COMPLETED: 'completed'      // Recompense distribuee
};

/**
 * Seuils pour les votes
 */
export const VOTE_THRESHOLDS = {
  REQUIRE_ALL_MEMBERS: true,  // Tout le monde doit voter
  QUORUM_PERCENTAGE: 100      // % de l'equipe qui doit voter pour valider
};

class TeamRewardVotingService {
  constructor() {
    this.SESSIONS_COLLECTION = 'team_reward_votes';
    this.REWARDS_COLLECTION = 'rewards';
    console.log('🗳️ TeamRewardVotingService initialise');
  }

  // ==========================================
  // 📊 GESTION DES SESSIONS DE VOTE
  // ==========================================

  /**
   * Creer une nouvelle session de vote
   * @param {string} creatorId - ID du createur
   * @param {string} creatorName - Nom du createur
   * @param {number} teamXP - XP equipe disponibles
   * @param {number} teamSize - Nombre de membres dans l'equipe
   */
  async createVoteSession(creatorId, creatorName, teamXP, teamSize = 1) {
    try {
      // Verifier qu'il n'y a pas deja une session active
      const existingSession = await this.getActiveSession();
      if (existingSession) {
        return {
          success: false,
          error: 'Une session de vote est deja en cours'
        };
      }

      const sessionData = {
        createdBy: creatorId,
        creatorName: creatorName,
        teamXPAvailable: teamXP,
        teamSize: teamSize,  // Nombre total de membres qui doivent voter
        status: VOTE_SESSION_STATUS.ACTIVE,
        votes: {},           // { rewardId: [{ odId, odName, votedAt }] }
        voteCounts: {},      // { rewardId: count } pour tri rapide
        totalVoters: 0,      // Nombre de votants uniques
        votersList: [],      // Liste des IDs qui ont vote
        winningRewardId: null,
        createdAt: serverTimestamp(),
        closedAt: null,
        approvedAt: null,
        approvedBy: null
      };

      const docRef = await addDoc(
        collection(db, this.SESSIONS_COLLECTION),
        sessionData
      );

      console.log('✅ Session de vote creee:', docRef.id);

      return {
        success: true,
        sessionId: docRef.id
      };
    } catch (error) {
      console.error('❌ Erreur creation session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Recuperer la session de vote active
   */
  async getActiveSession() {
    try {
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('status', '==', VOTE_SESSION_STATUS.ACTIVE)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      };
    } catch (error) {
      console.error('❌ Erreur recuperation session:', error);
      return null;
    }
  }

  /**
   * Recuperer une session cloturee (en attente de validation)
   */
  async getClosedSession() {
    try {
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('status', '==', VOTE_SESSION_STATUS.CLOSED)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      };
    } catch (error) {
      console.error('❌ Erreur recuperation session cloturee:', error);
      return null;
    }
  }

  /**
   * Recuperer une session par ID
   */
  async getSession(sessionId) {
    try {
      const docRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date()
      };
    } catch (error) {
      console.error('❌ Erreur recuperation session:', error);
      return null;
    }
  }

  // ==========================================
  // 🗳️ GESTION DES VOTES
  // ==========================================

  /**
   * Voter pour une recompense
   * @param {string} sessionId - ID de la session
   * @param {string} rewardId - ID de la recompense
   * @param {string} userId - ID de l'utilisateur
   * @param {string} userName - Nom de l'utilisateur
   */
  async voteForReward(sessionId, rewardId, userId, userName) {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return { success: false, error: 'Session non trouvee' };
      }

      if (session.status !== VOTE_SESSION_STATUS.ACTIVE) {
        return { success: false, error: 'La session de vote est terminee' };
      }

      // Verifier si l'utilisateur a deja vote pour cette recompense
      const rewardVotes = session.votes[rewardId] || [];
      const hasAlreadyVoted = rewardVotes.some(v => v.odId === userId);

      if (hasAlreadyVoted) {
        return { success: false, error: 'Vous avez deja vote pour cette recompense' };
      }

      // Construire le nouveau vote
      const newVote = {
        odId: userId,
        odName: userName,
        votedAt: new Date().toISOString()
      };

      // Mettre a jour les votes
      const updatedVotes = { ...session.votes };
      if (!updatedVotes[rewardId]) {
        updatedVotes[rewardId] = [];
      }
      updatedVotes[rewardId].push(newVote);

      // Mettre a jour les compteurs
      const updatedCounts = { ...session.voteCounts };
      updatedCounts[rewardId] = (updatedCounts[rewardId] || 0) + 1;

      // Ajouter le votant a la liste s'il n'y est pas deja
      const updatedVotersList = session.votersList.includes(userId)
        ? session.votersList
        : [...session.votersList, userId];

      // Sauvegarder
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        votes: updatedVotes,
        voteCounts: updatedCounts,
        votersList: updatedVotersList,
        totalVoters: updatedVotersList.length
      });

      console.log(`✅ Vote enregistre: ${userName} -> recompense ${rewardId}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur vote:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retirer son vote pour une recompense
   */
  async removeVote(sessionId, rewardId, userId) {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return { success: false, error: 'Session non trouvee' };
      }

      if (session.status !== VOTE_SESSION_STATUS.ACTIVE) {
        return { success: false, error: 'La session de vote est terminee' };
      }

      const rewardVotes = session.votes[rewardId] || [];
      const voteIndex = rewardVotes.findIndex(v => v.odId === userId);

      if (voteIndex === -1) {
        return { success: false, error: 'Vote non trouve' };
      }

      // Retirer le vote
      const updatedVotes = { ...session.votes };
      updatedVotes[rewardId] = rewardVotes.filter(v => v.odId !== userId);

      // Mettre a jour le compteur
      const updatedCounts = { ...session.voteCounts };
      updatedCounts[rewardId] = Math.max(0, (updatedCounts[rewardId] || 1) - 1);

      // Verifier si l'utilisateur a encore des votes ailleurs
      const hasOtherVotes = Object.values(updatedVotes).some(
        votes => votes.some(v => v.odId === userId)
      );

      const updatedVotersList = hasOtherVotes
        ? session.votersList
        : session.votersList.filter(id => id !== userId);

      // Sauvegarder
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        votes: updatedVotes,
        voteCounts: updatedCounts,
        votersList: updatedVotersList,
        totalVoters: updatedVotersList.length
      });

      console.log(`✅ Vote retire pour recompense ${rewardId}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur retrait vote:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les votes d'un utilisateur dans une session
   */
  getUserVotes(session, userId) {
    if (!session || !session.votes) return [];

    const userVotes = [];
    Object.entries(session.votes).forEach(([rewardId, votes]) => {
      if (votes.some(v => v.odId === userId)) {
        userVotes.push(rewardId);
      }
    });
    return userVotes;
  }

  // ==========================================
  // 📋 CLOTURE ET VALIDATION
  // ==========================================

  /**
   * Cloturer une session et determiner le gagnant
   */
  async closeSession(sessionId, closedByUserId, closedByName) {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return { success: false, error: 'Session non trouvee' };
      }

      if (session.status !== VOTE_SESSION_STATUS.ACTIVE) {
        return { success: false, error: 'Session deja cloturee' };
      }

      // Determiner la recompense gagnante (plus de votes)
      let winningRewardId = null;
      let maxVotes = 0;

      Object.entries(session.voteCounts).forEach(([rewardId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winningRewardId = rewardId;
        }
      });

      // Verifier que tout le monde a vote
      const teamSize = session.teamSize || 1;
      if (session.totalVoters < teamSize) {
        const remaining = teamSize - session.totalVoters;
        return {
          success: false,
          error: `Il manque encore ${remaining} vote(s). Tout le monde doit voter !`
        };
      }

      // Mettre a jour la session
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: VOTE_SESSION_STATUS.CLOSED,
        winningRewardId: winningRewardId,
        closedAt: serverTimestamp(),
        closedBy: closedByUserId,
        closedByName: closedByName
      });

      // Notifier les admins
      await this.notifyAdminsOfWinner(session, winningRewardId, maxVotes);

      console.log(`✅ Session cloturee, gagnant: ${winningRewardId} avec ${maxVotes} votes`);

      return {
        success: true,
        winningRewardId,
        voteCount: maxVotes
      };
    } catch (error) {
      console.error('❌ Erreur cloture session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Admin approuve la recompense votee
   */
  async approveWinningReward(sessionId, adminId, adminName) {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return { success: false, error: 'Session non trouvee' };
      }

      if (session.status !== VOTE_SESSION_STATUS.CLOSED) {
        return { success: false, error: 'La session doit etre cloturee avant approbation' };
      }

      if (!session.winningRewardId) {
        return { success: false, error: 'Aucune recompense gagnante' };
      }

      // Mettre a jour la session
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: VOTE_SESSION_STATUS.APPROVED,
        approvedAt: serverTimestamp(),
        approvedBy: adminId,
        approvedByName: adminName
      });

      // Notifier tous les votants
      await this.notifyVotersOfApproval(session, adminName);

      console.log(`✅ Recompense approuvee par ${adminName}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Admin rejette la recompense votee
   */
  async rejectWinningReward(sessionId, adminId, adminName, reason = '') {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return { success: false, error: 'Session non trouvee' };
      }

      if (session.status !== VOTE_SESSION_STATUS.CLOSED) {
        return { success: false, error: 'La session doit etre cloturee avant rejet' };
      }

      // Mettre a jour la session
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: VOTE_SESSION_STATUS.REJECTED,
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
        rejectedByName: adminName,
        rejectionReason: reason
      });

      // Notifier tous les votants
      await this.notifyVotersOfRejection(session, adminName, reason);

      console.log(`❌ Recompense rejetee par ${adminName}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🔔 NOTIFICATIONS
  // ==========================================

  async notifyAdminsOfWinner(session, winningRewardId, voteCount) {
    try {
      // Recuperer les infos de la recompense
      const rewardDoc = await getDoc(doc(db, this.REWARDS_COLLECTION, winningRewardId));
      const rewardData = rewardDoc.exists() ? rewardDoc.data() : { name: 'Recompense inconnue' };

      await notificationService.notifyAllAdmins({
        title: '🗳️ Vote recompense equipe termine',
        message: `La recompense "${rewardData.name}" a remporte ${voteCount} votes. En attente de votre validation.`,
        type: 'team_reward_vote',
        data: {
          sessionId: session.id,
          rewardId: winningRewardId,
          rewardName: rewardData.name,
          voteCount
        }
      });
    } catch (error) {
      console.error('❌ Erreur notification admins:', error);
    }
  }

  async notifyVotersOfApproval(session, adminName) {
    try {
      const rewardDoc = await getDoc(doc(db, this.REWARDS_COLLECTION, session.winningRewardId));
      const rewardData = rewardDoc.exists() ? rewardDoc.data() : { name: 'Recompense' };

      for (const odId of session.votersList) {
        await notificationService.createNotification(odId, {
          title: '✅ Recompense equipe approuvee !',
          message: `La recompense "${rewardData.name}" a ete approuvee par ${adminName}. Felicitations a toute l equipe !`,
          type: 'team_reward_approved',
          data: {
            sessionId: session.id,
            rewardId: session.winningRewardId
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur notification voters:', error);
    }
  }

  async notifyVotersOfRejection(session, adminName, reason) {
    try {
      const rewardDoc = await getDoc(doc(db, this.REWARDS_COLLECTION, session.winningRewardId));
      const rewardData = rewardDoc.exists() ? rewardDoc.data() : { name: 'Recompense' };

      for (const odId of session.votersList) {
        await notificationService.createNotification(odId, {
          title: '❌ Recompense equipe refusee',
          message: `La recompense "${rewardData.name}" a ete refusee.${reason ? ` Raison: ${reason}` : ''}`,
          type: 'team_reward_rejected',
          data: {
            sessionId: session.id,
            rewardId: session.winningRewardId,
            reason
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur notification voters:', error);
    }
  }

  // ==========================================
  // 🔄 LISTENERS TEMPS REEL
  // ==========================================

  /**
   * Ecouter la session active en temps reel
   */
  subscribeToActiveSession(callback) {
    try {
      // Requete simplifiee pour eviter les index composites
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('status', '==', VOTE_SESSION_STATUS.ACTIVE)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // Verifier s'il y a une session cloturee en attente
          this.getClosedSession().then(closedSession => {
            callback(closedSession);
          });
          return;
        }

        const doc = snapshot.docs[0];
        callback({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      }, (error) => {
        console.error('❌ Erreur subscription session:', error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur subscription:', error);
      return () => {};
    }
  }

  /**
   * Recuperer l'historique des sessions
   */
  async getSessionHistory(limit = 10) {
    try {
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const sessions = [];

      snapshot.forEach(doc => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return sessions.slice(0, limit);
    } catch (error) {
      console.error('❌ Erreur historique:', error);
      return [];
    }
  }

  // ==========================================
  // 📊 STATISTIQUES
  // ==========================================

  /**
   * Obtenir le classement des recompenses par votes
   */
  getRewardRanking(session) {
    if (!session || !session.voteCounts) return [];

    return Object.entries(session.voteCounts)
      .map(([rewardId, count]) => ({ rewardId, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Verifier si le quorum est atteint
   */
  isQuorumReached(session, teamSize) {
    if (!session || teamSize === 0) return false;

    const participationRate = (session.totalVoters / teamSize) * 100;
    return participationRate >= VOTE_THRESHOLDS.QUORUM_PERCENTAGE;
  }
}

// Creer et exporter l'instance du service
const teamRewardVotingService = new TeamRewardVotingService();
export default teamRewardVotingService;
