// ==========================================
// react-app/src/core/services/sponsorshipService.js
// SERVICE PARRAINAGE - SYNERGIA v4.0
// Système de parrainage mentor/filleul avec bonus XP
// ==========================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// CONSTANTES PARRAINAGE
// ==========================================

export const SPONSORSHIP_STATUS = {
  active: {
    id: 'active',
    label: 'Actif',
    emoji: '🤝',
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400'
  },
  completed: {
    id: 'completed',
    label: 'Terminé',
    emoji: '🎓',
    color: 'blue',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  paused: {
    id: 'paused',
    label: 'En pause',
    emoji: '⏸️',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  cancelled: {
    id: 'cancelled',
    label: 'Annulé',
    emoji: '❌',
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  }
};

// Jalons du filleul qui déclenchent des bonus pour le parrain
export const MENTEE_MILESTONES = {
  first_week: {
    id: 'first_week',
    label: 'Première semaine complétée',
    emoji: '📅',
    description: 'Le filleul a complété sa première semaine',
    mentorXpBonus: 25,
    menteeXpBonus: 15,
    daysRequired: 7
  },
  first_quest: {
    id: 'first_quest',
    label: 'Première quête validée',
    emoji: '⚔️',
    description: 'Le filleul a validé sa première quête',
    mentorXpBonus: 30,
    menteeXpBonus: 20,
    questsRequired: 1
  },
  level_5: {
    id: 'level_5',
    label: 'Niveau 5 atteint',
    emoji: '⭐',
    description: 'Le filleul a atteint le niveau 5',
    mentorXpBonus: 50,
    menteeXpBonus: 25,
    levelRequired: 5
  },
  ten_quests: {
    id: 'ten_quests',
    label: '10 quêtes validées',
    emoji: '🏆',
    description: 'Le filleul a validé 10 quêtes',
    mentorXpBonus: 75,
    menteeXpBonus: 40,
    questsRequired: 10
  },
  first_month: {
    id: 'first_month',
    label: 'Premier mois complété',
    emoji: '📆',
    description: 'Le filleul a complété son premier mois',
    mentorXpBonus: 100,
    menteeXpBonus: 50,
    daysRequired: 30
  },
  level_10: {
    id: 'level_10',
    label: 'Niveau 10 atteint',
    emoji: '🌟',
    description: 'Le filleul a atteint le niveau 10',
    mentorXpBonus: 100,
    menteeXpBonus: 50,
    levelRequired: 10
  },
  autonomy: {
    id: 'autonomy',
    label: 'Autonomie acquise',
    emoji: '🎓',
    description: 'Le filleul est devenu autonome (fin du parrainage)',
    mentorXpBonus: 150,
    menteeXpBonus: 75,
    manual: true
  }
};

// Badges de parrainage
export const SPONSORSHIP_BADGES = {
  first_mentee: {
    id: 'first_mentee',
    name: 'Premier Parrain',
    emoji: '🤝',
    description: 'A accueilli son premier filleul',
    menteesRequired: 1
  },
  experienced_mentor: {
    id: 'experienced_mentor',
    name: 'Mentor Expérimenté',
    emoji: '🎯',
    description: 'A accompagné 3 filleuls jusqu\'à l\'autonomie',
    menteesRequired: 3
  },
  master_mentor: {
    id: 'master_mentor',
    name: 'Maître Mentor',
    emoji: '👑',
    description: 'A accompagné 10 filleuls jusqu\'à l\'autonomie',
    menteesRequired: 10
  }
};

// ==========================================
// SERVICE PARRAINAGE
// ==========================================

class SponsorshipService {
  constructor() {
    this.collectionName = 'sponsorships';
    this.milestonesCollection = 'sponsorship_milestones';
  }

  // ==========================================
  // GESTION DES PARRAINAGES
  // ==========================================

  /**
   * Créer une nouvelle relation de parrainage
   */
  async createSponsorship(sponsorshipData) {
    try {
      // Vérifier que le filleul n'a pas déjà un parrain actif
      const existingQuery = query(
        collection(db, this.collectionName),
        where('menteeId', '==', sponsorshipData.menteeId),
        where('status', '==', 'active')
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        return {
          success: false,
          error: 'Ce collaborateur a déjà un parrain actif'
        };
      }

      const sponsorship = {
        mentorId: sponsorshipData.mentorId,
        mentorName: sponsorshipData.mentorName || 'Parrain',
        mentorEmail: sponsorshipData.mentorEmail || '',
        mentorAvatar: sponsorshipData.mentorAvatar || '👤',
        menteeId: sponsorshipData.menteeId,
        menteeName: sponsorshipData.menteeName || 'Filleul',
        menteeEmail: sponsorshipData.menteeEmail || '',
        menteeAvatar: sponsorshipData.menteeAvatar || '👤',
        startDate: serverTimestamp(),
        expectedEndDate: sponsorshipData.expectedEndDate
          ? Timestamp.fromDate(new Date(sponsorshipData.expectedEndDate))
          : Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // 90 jours par défaut
        status: 'active',
        goals: sponsorshipData.goals || [],
        notes: sponsorshipData.notes || '',
        milestonesCompleted: [],
        totalMentorXpEarned: 0,
        totalMenteeXpEarned: 0,
        meetingsCount: 0,
        lastMeetingDate: null,
        createdAt: serverTimestamp(),
        createdBy: sponsorshipData.createdBy || sponsorshipData.mentorId,
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), sponsorship);

      // Mettre à jour les compteurs des utilisateurs
      await this.updateUserSponsorshipCounts(sponsorshipData.mentorId, 'mentor');
      await this.updateUserSponsorshipCounts(sponsorshipData.menteeId, 'mentee');

      // Attribuer XP initial pour le parrain (acceptation du parrainage)
      await this.awardXP(sponsorshipData.mentorId, 20, 'Nouveau parrainage accepté');

      return { success: true, sponsorshipId: docRef.id };
    } catch (error) {
      console.error('Erreur création parrainage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour un parrainage
   */
  async updateSponsorship(sponsorshipId, updateData) {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);

      await updateDoc(sponsorshipRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour parrainage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enregistrer une réunion/point de suivi
   */
  async recordMeeting(sponsorshipId, meetingData = {}) {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);
      const sponsorshipDoc = await getDoc(sponsorshipRef);

      if (!sponsorshipDoc.exists()) {
        return { success: false, error: 'Parrainage non trouvé' };
      }

      const data = sponsorshipDoc.data();

      await updateDoc(sponsorshipRef, {
        meetingsCount: (data.meetingsCount || 0) + 1,
        lastMeetingDate: serverTimestamp(),
        lastMeetingNotes: meetingData.notes || '',
        updatedAt: serverTimestamp()
      });

      // Bonus XP pour les réunions régulières
      await this.awardXP(data.mentorId, 10, 'Point de suivi parrainage');
      await this.awardXP(data.menteeId, 10, 'Point de suivi parrainage');

      return { success: true };
    } catch (error) {
      console.error('Erreur enregistrement réunion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Valider un jalon
   */
  async completeMilestone(sponsorshipId, milestoneId) {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);
      const sponsorshipDoc = await getDoc(sponsorshipRef);

      if (!sponsorshipDoc.exists()) {
        return { success: false, error: 'Parrainage non trouvé' };
      }

      const data = sponsorshipDoc.data();
      const milestone = MENTEE_MILESTONES[milestoneId];

      if (!milestone) {
        return { success: false, error: 'Jalon non trouvé' };
      }

      // Vérifier si déjà complété
      if (data.milestonesCompleted?.includes(milestoneId)) {
        return { success: false, error: 'Jalon déjà validé' };
      }

      // Mettre à jour le parrainage
      const newMilestones = [...(data.milestonesCompleted || []), milestoneId];
      await updateDoc(sponsorshipRef, {
        milestonesCompleted: newMilestones,
        totalMentorXpEarned: (data.totalMentorXpEarned || 0) + milestone.mentorXpBonus,
        totalMenteeXpEarned: (data.totalMenteeXpEarned || 0) + milestone.menteeXpBonus,
        updatedAt: serverTimestamp()
      });

      // Attribuer les XP
      await this.awardXP(data.mentorId, milestone.mentorXpBonus, `Jalon parrainage: ${milestone.label}`);
      await this.awardXP(data.menteeId, milestone.menteeXpBonus, `Jalon parrainage: ${milestone.label}`);

      // Enregistrer le jalon
      await addDoc(collection(db, this.milestonesCollection), {
        sponsorshipId,
        milestoneId,
        mentorId: data.mentorId,
        menteeId: data.menteeId,
        mentorXpAwarded: milestone.mentorXpBonus,
        menteeXpAwarded: milestone.menteeXpBonus,
        completedAt: serverTimestamp()
      });

      // Si c'est le jalon "autonomy", terminer le parrainage
      if (milestoneId === 'autonomy') {
        await this.completeSponsorship(sponsorshipId);
      }

      return { success: true, milestone };
    } catch (error) {
      console.error('Erreur validation jalon:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Terminer un parrainage (filleul autonome)
   */
  async completeSponsorship(sponsorshipId) {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);
      const sponsorshipDoc = await getDoc(sponsorshipRef);

      if (!sponsorshipDoc.exists()) {
        return { success: false, error: 'Parrainage non trouvé' };
      }

      const data = sponsorshipDoc.data();

      await updateDoc(sponsorshipRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Mettre à jour les compteurs
      await this.updateUserCompletedSponsorships(data.mentorId);

      // Vérifier les badges du mentor
      await this.checkMentorBadges(data.mentorId);

      return { success: true };
    } catch (error) {
      console.error('Erreur fin parrainage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Annuler un parrainage
   */
  async cancelSponsorship(sponsorshipId, reason = '') {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);

      await updateDoc(sponsorshipRef, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur annulation parrainage:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // RÉCUPÉRATION DES DONNÉES
  // ==========================================

  /**
   * Obtenir les parrainages d'un utilisateur
   */
  async getUserSponsorships(userId, role = 'both', status = null) {
    try {
      let sponsorships = [];

      if (role === 'mentor' || role === 'both') {
        let q = query(
          collection(db, this.collectionName),
          where('mentorId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        if (status) {
          q = query(
            collection(db, this.collectionName),
            where('mentorId', '==', userId),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
          );
        }

        const snapshot = await getDocs(q);
        sponsorships = [...sponsorships, ...snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: 'mentor'
        }))];
      }

      if (role === 'mentee' || role === 'both') {
        let q = query(
          collection(db, this.collectionName),
          where('menteeId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        if (status) {
          q = query(
            collection(db, this.collectionName),
            where('menteeId', '==', userId),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
          );
        }

        const snapshot = await getDocs(q);
        sponsorships = [...sponsorships, ...snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: 'mentee'
        }))];
      }

      return sponsorships;
    } catch (error) {
      console.error('Erreur récupération parrainages:', error);
      return [];
    }
  }

  /**
   * Obtenir tous les parrainages actifs (pour admin)
   */
  async getAllActiveSponsorships() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur récupération parrainages actifs:', error);
      return [];
    }
  }

  /**
   * Obtenir un parrainage par ID
   */
  async getSponsorship(sponsorshipId) {
    try {
      const sponsorshipRef = doc(db, this.collectionName, sponsorshipId);
      const sponsorshipDoc = await getDoc(sponsorshipRef);

      if (!sponsorshipDoc.exists()) return null;

      return { id: sponsorshipDoc.id, ...sponsorshipDoc.data() };
    } catch (error) {
      console.error('Erreur récupération parrainage:', error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques de parrainage d'un utilisateur
   */
  async getUserSponsorshipStats(userId) {
    try {
      const allSponsorships = await this.getUserSponsorships(userId, 'both');

      const asMentor = allSponsorships.filter(s => s.role === 'mentor');
      const asMentee = allSponsorships.filter(s => s.role === 'mentee');

      const activeMentorships = asMentor.filter(s => s.status === 'active');
      const completedMentorships = asMentor.filter(s => s.status === 'completed');

      // Calculer XP total gagné
      const totalMentorXP = asMentor.reduce((sum, s) => sum + (s.totalMentorXpEarned || 0), 0);
      const totalMenteeXP = asMentee.reduce((sum, s) => sum + (s.totalMenteeXpEarned || 0), 0);

      // Calculer le nombre total de réunions
      const totalMeetings = asMentor.reduce((sum, s) => sum + (s.meetingsCount || 0), 0);

      return {
        asMentor: {
          total: asMentor.length,
          active: activeMentorships.length,
          completed: completedMentorships.length,
          totalXpEarned: totalMentorXP,
          totalMeetings
        },
        asMentee: {
          total: asMentee.length,
          active: asMentee.filter(s => s.status === 'active').length,
          completed: asMentee.filter(s => s.status === 'completed').length,
          totalXpEarned: totalMenteeXP
        },
        overall: {
          totalSponsorships: allSponsorships.length,
          totalXpEarned: totalMentorXP + totalMenteeXP
        }
      };
    } catch (error) {
      console.error('Erreur stats parrainage:', error);
      return null;
    }
  }

  // ==========================================
  // VÉRIFICATION AUTOMATIQUE DES JALONS
  // ==========================================

  /**
   * Vérifier les jalons automatiques pour un filleul
   */
  async checkAutomaticMilestones(menteeId) {
    try {
      // Récupérer le parrainage actif du filleul
      const sponsorships = await this.getUserSponsorships(menteeId, 'mentee', 'active');

      if (sponsorships.length === 0) return;

      const sponsorship = sponsorships[0];

      // Récupérer les données du filleul
      const menteeRef = doc(db, 'users', menteeId);
      const menteeDoc = await getDoc(menteeRef);

      if (!menteeDoc.exists()) return;

      const menteeData = menteeDoc.data();
      const gamification = menteeData.gamification || {};

      // Calculer les jours depuis le début
      const startDate = sponsorship.startDate?.toDate?.() || new Date();
      const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Vérifier chaque jalon automatique
      const completedMilestones = sponsorship.milestonesCompleted || [];

      for (const [milestoneId, milestone] of Object.entries(MENTEE_MILESTONES)) {
        if (milestone.manual) continue; // Skip manual milestones
        if (completedMilestones.includes(milestoneId)) continue; // Already completed

        let shouldComplete = false;

        // Vérifier les conditions
        if (milestone.daysRequired && daysSinceStart >= milestone.daysRequired) {
          shouldComplete = true;
        }
        if (milestone.questsRequired && (gamification.tasksCompleted || 0) >= milestone.questsRequired) {
          shouldComplete = true;
        }
        if (milestone.levelRequired && (gamification.level || 1) >= milestone.levelRequired) {
          shouldComplete = true;
        }

        if (shouldComplete) {
          await this.completeMilestone(sponsorship.id, milestoneId);
        }
      }
    } catch (error) {
      console.error('Erreur vérification jalons:', error);
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Attribuer des XP à un utilisateur
   */
  async awardXP(userId, amount, source) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const gamification = userData.gamification || {};

      await updateDoc(userRef, {
        'gamification.totalXp': (gamification.totalXp || 0) + amount,
        'gamification.spendableXp': (gamification.spendableXp || 0) + amount,
        'gamification.sponsorshipXp': (gamification.sponsorshipXp || 0) + amount,
        'gamification.lastActivityAt': serverTimestamp(),
        'gamification.lastXpGain': {
          amount,
          source: 'sponsorship',
          details: source,
          timestamp: new Date().toISOString()
        },
        updatedAt: serverTimestamp()
      });

      console.log(`🤝 +${amount} XP parrainage pour ${userId}: ${source}`);
    } catch (error) {
      console.error('Erreur attribution XP:', error);
    }
  }

  /**
   * Mettre à jour les compteurs de parrainage d'un utilisateur
   */
  async updateUserSponsorshipCounts(userId, role) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const gamification = userData.gamification || {};

      if (role === 'mentor') {
        await updateDoc(userRef, {
          'gamification.menteesCount': (gamification.menteesCount || 0) + 1
        });
      } else {
        await updateDoc(userRef, {
          'gamification.hasSponsor': true
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour compteurs:', error);
    }
  }

  /**
   * Mettre à jour les parrainages complétés
   */
  async updateUserCompletedSponsorships(mentorId) {
    try {
      const userRef = doc(db, 'users', mentorId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const gamification = userData.gamification || {};

      await updateDoc(userRef, {
        'gamification.completedMentorships': (gamification.completedMentorships || 0) + 1
      });
    } catch (error) {
      console.error('Erreur mise à jour parrainages complétés:', error);
    }
  }

  /**
   * Vérifier et attribuer les badges de mentor
   */
  async checkMentorBadges(mentorId) {
    try {
      const userRef = doc(db, 'users', mentorId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const gamification = userData.gamification || {};
      const completedMentorships = gamification.completedMentorships || 0;
      const currentBadges = gamification.sponsorshipBadges || [];

      for (const [badgeId, badge] of Object.entries(SPONSORSHIP_BADGES)) {
        if (currentBadges.includes(badgeId)) continue;

        if (completedMentorships >= badge.menteesRequired) {
          const newBadges = [...currentBadges, badgeId];
          await updateDoc(userRef, {
            'gamification.sponsorshipBadges': newBadges
          });

          console.log(`🏅 Badge parrainage débloqué pour ${mentorId}: ${badge.name}`);
        }
      }
    } catch (error) {
      console.error('Erreur vérification badges:', error);
    }
  }

  /**
   * Obtenir les utilisateurs disponibles pour être parrains
   */
  async getAvailableMentors(excludeUserId = null) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      return snapshot.docs
        .filter(doc => doc.id !== excludeUserId)
        .map(doc => {
          const data = doc.data();
          const gamification = data.gamification || {};

          return {
            id: doc.id,
            displayName: data.displayName || data.prenom || data.nom || (data.email ? data.email.split('@')[0] : null) || 'Utilisateur',
            email: data.email || '',
            avatar: data.customization?.avatar || data.avatar || '👤',
            level: gamification.level || 1,
            totalXp: gamification.totalXp || 0,
            menteesCount: gamification.menteesCount || 0,
            completedMentorships: gamification.completedMentorships || 0,
            sponsorshipBadges: gamification.sponsorshipBadges || []
          };
        })
        .filter(user => user.level >= 3) // Niveau minimum pour être parrain
        .sort((a, b) => b.completedMentorships - a.completedMentorships);
    } catch (error) {
      console.error('Erreur récupération mentors:', error);
      return [];
    }
  }

  /**
   * Obtenir les utilisateurs qui peuvent être parrainés
   */
  async getAvailableMentees(excludeUserId = null) {
    try {
      // Récupérer les IDs des utilisateurs déjà parrainés
      const activeQuery = query(
        collection(db, this.collectionName),
        where('status', '==', 'active')
      );
      const activeSnapshot = await getDocs(activeQuery);
      const sponsoredUserIds = activeSnapshot.docs.map(doc => doc.data().menteeId);

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      return snapshot.docs
        .filter(doc => doc.id !== excludeUserId && !sponsoredUserIds.includes(doc.id))
        .map(doc => {
          const data = doc.data();
          const gamification = data.gamification || {};

          return {
            id: doc.id,
            displayName: data.displayName || data.prenom || data.nom || (data.email ? data.email.split('@')[0] : null) || 'Utilisateur',
            email: data.email || '',
            avatar: data.customization?.avatar || data.avatar || '👤',
            level: gamification.level || 1,
            totalXp: gamification.totalXp || 0,
            createdAt: data.createdAt
          };
        })
        .sort((a, b) => (a.level || 1) - (b.level || 1)); // Les plus récents/bas niveaux en premier
    } catch (error) {
      console.error('Erreur récupération mentees:', error);
      return [];
    }
  }

  /**
   * S'abonner aux parrainages en temps réel
   */
  subscribeToUserSponsorships(userId, callback) {
    const q1 = query(
      collection(db, this.collectionName),
      where('mentorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const q2 = query(
      collection(db, this.collectionName),
      where('menteeId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    let sponsorships1 = [];
    let sponsorships2 = [];

    const unsub1 = onSnapshot(q1, (snapshot) => {
      sponsorships1 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'mentor'
      }));
      callback([...sponsorships1, ...sponsorships2]);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      sponsorships2 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'mentee'
      }));
      callback([...sponsorships1, ...sponsorships2]);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }
}

// Export singleton
export const sponsorshipService = new SponsorshipService();
export default sponsorshipService;
