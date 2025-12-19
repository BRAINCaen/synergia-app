// ==========================================
// react-app/src/core/services/retrospectiveService.js
// SERVICE RETROSPECTIVES - BILANS DE CAMPAGNE
// MODULE 10 - SYNERGIA v4.0
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 📊 CONSTANTES XP
export const RETRO_XP = {
  PARTICIPATE: 25,      // Participer à une rétro
  ANIMATE: 40,          // Animer une rétro
  FACILITATOR_BADGE: 5  // Nombre de rétros animées pour le badge
};

// 🎭 RÔLES RÉTROSPECTIVE
export const RETRO_ROLES = {
  ANIMATOR: {
    id: 'animator',
    label: 'Animateur',
    icon: '🎯',
    description: 'Anime la session et facilite les échanges'
  },
  SCRIBE: {
    id: 'scribe',
    label: 'Scribe',
    icon: '📝',
    description: 'Note les points clés de la discussion'
  },
  TIMEKEEPER: {
    id: 'timekeeper',
    label: 'Time-keeper',
    icon: '⏱️',
    description: 'Veille au respect du timing'
  }
};

// 📋 SECTIONS DE LA RÉTROSPECTIVE
export const RETRO_SECTIONS = {
  WENT_WELL: {
    id: 'went_well',
    label: 'Ce qui a bien marché',
    icon: '✅',
    color: 'green'
  },
  TO_IMPROVE: {
    id: 'to_improve',
    label: 'Ce qu\'on peut améliorer',
    icon: '❌',
    color: 'red'
  },
  IDEAS: {
    id: 'ideas',
    label: 'Idées pour la prochaine fois',
    icon: '💡',
    color: 'yellow'
  },
  ACTIONS: {
    id: 'actions',
    label: 'Actions définies',
    icon: '📋',
    color: 'blue'
  }
};

// 📊 STATUTS RÉTROSPECTIVE
export const RETRO_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

/**
 * Service de gestion des rétrospectives
 */
export const retrospectiveService = {

  /**
   * Créer une nouvelle rétrospective pour une campagne
   */
  async createRetrospective(campaignId, campaignTitle, creatorId, creatorName) {
    try {
      console.log('📦 [RETRO] Création rétrospective pour campagne:', campaignId);

      const retroData = {
        campaignId,
        campaignTitle,
        status: RETRO_STATUS.DRAFT,

        // Rôles assignés
        roles: {
          animator: null,
          scribe: null,
          timekeeper: null
        },

        // Sections de contenu
        sections: {
          went_well: [],
          to_improve: [],
          ideas: [],
          actions: []
        },

        // Participants
        participants: [],

        // Métadonnées
        createdBy: creatorId,
        createdByName: creatorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Durée prévue (en minutes)
        plannedDuration: 30,
        actualDuration: null,

        // Date de la session
        scheduledDate: null,
        completedAt: null
      };

      const docRef = await addDoc(collection(db, 'retrospectives'), retroData);
      console.log('✅ [RETRO] Rétrospective créée:', docRef.id);

      return { id: docRef.id, ...retroData };
    } catch (error) {
      console.error('❌ [RETRO] Erreur création rétrospective:', error);
      throw error;
    }
  },

  /**
   * Récupérer la rétrospective d'une campagne
   */
  async getRetrospectiveByCampaign(campaignId) {
    try {
      console.log('📦 [RETRO] Récupération rétro pour campagne:', campaignId);

      const q = query(
        collection(db, 'retrospectives'),
        where('campaignId', '==', campaignId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('📦 [RETRO] Aucune rétrospective trouvée');
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
      };
    } catch (error) {
      console.error('❌ [RETRO] Erreur récupération rétrospective:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour les rôles de la rétrospective
   */
  async updateRoles(retroId, roles) {
    try {
      console.log('🎭 [RETRO] Mise à jour rôles:', roles);

      const retroRef = doc(db, 'retrospectives', retroId);
      await updateDoc(retroRef, {
        roles,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Rôles mis à jour');
    } catch (error) {
      console.error('❌ [RETRO] Erreur mise à jour rôles:', error);
      throw error;
    }
  },

  /**
   * Ajouter un item à une section
   */
  async addSectionItem(retroId, sectionId, item, userId, userName) {
    try {
      console.log('📝 [RETRO] Ajout item section:', sectionId);

      const retroRef = doc(db, 'retrospectives', retroId);
      const retroDoc = await getDoc(retroRef);

      if (!retroDoc.exists()) {
        throw new Error('Rétrospective non trouvée');
      }

      const currentSections = retroDoc.data().sections || {};
      const currentSection = currentSections[sectionId] || [];

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: item.content,
        createdBy: userId,
        createdByName: userName,
        createdAt: new Date().toISOString(),
        // Pour les actions, on ajoute des champs supplémentaires
        ...(sectionId === 'actions' && {
          assignedTo: item.assignedTo || null,
          assignedToName: item.assignedToName || null,
          deadline: item.deadline || null,
          completed: false
        })
      };

      await updateDoc(retroRef, {
        [`sections.${sectionId}`]: [...currentSection, newItem],
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Item ajouté');
      return newItem;
    } catch (error) {
      console.error('❌ [RETRO] Erreur ajout item:', error);
      throw error;
    }
  },

  /**
   * Supprimer un item d'une section
   */
  async removeSectionItem(retroId, sectionId, itemId) {
    try {
      console.log('🗑️ [RETRO] Suppression item:', itemId);

      const retroRef = doc(db, 'retrospectives', retroId);
      const retroDoc = await getDoc(retroRef);

      if (!retroDoc.exists()) {
        throw new Error('Rétrospective non trouvée');
      }

      const currentSections = retroDoc.data().sections || {};
      const currentSection = currentSections[sectionId] || [];
      const updatedSection = currentSection.filter(item => item.id !== itemId);

      await updateDoc(retroRef, {
        [`sections.${sectionId}`]: updatedSection,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Item supprimé');
    } catch (error) {
      console.error('❌ [RETRO] Erreur suppression item:', error);
      throw error;
    }
  },

  /**
   * Marquer une action comme terminée
   */
  async toggleActionComplete(retroId, actionId, completed) {
    try {
      console.log('✅ [RETRO] Toggle action:', actionId, completed);

      const retroRef = doc(db, 'retrospectives', retroId);
      const retroDoc = await getDoc(retroRef);

      if (!retroDoc.exists()) {
        throw new Error('Rétrospective non trouvée');
      }

      const currentActions = retroDoc.data().sections?.actions || [];
      const updatedActions = currentActions.map(action =>
        action.id === actionId ? { ...action, completed } : action
      );

      await updateDoc(retroRef, {
        'sections.actions': updatedActions,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Action mise à jour');
    } catch (error) {
      console.error('❌ [RETRO] Erreur toggle action:', error);
      throw error;
    }
  },

  /**
   * Ajouter un participant à la rétrospective
   */
  async addParticipant(retroId, userId, userName) {
    try {
      console.log('👥 [RETRO] Ajout participant:', userName);

      const retroRef = doc(db, 'retrospectives', retroId);
      const retroDoc = await getDoc(retroRef);

      if (!retroDoc.exists()) {
        throw new Error('Rétrospective non trouvée');
      }

      const currentParticipants = retroDoc.data().participants || [];

      // Vérifier si déjà participant
      if (currentParticipants.some(p => p.id === userId)) {
        console.log('👥 [RETRO] Déjà participant');
        return;
      }

      await updateDoc(retroRef, {
        participants: [...currentParticipants, {
          id: userId,
          name: userName,
          joinedAt: new Date().toISOString()
        }],
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Participant ajouté');
    } catch (error) {
      console.error('❌ [RETRO] Erreur ajout participant:', error);
      throw error;
    }
  },

  /**
   * Démarrer la rétrospective
   */
  async startRetrospective(retroId) {
    try {
      console.log('🚀 [RETRO] Démarrage rétrospective');

      const retroRef = doc(db, 'retrospectives', retroId);
      await updateDoc(retroRef, {
        status: RETRO_STATUS.IN_PROGRESS,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Rétrospective démarrée');
    } catch (error) {
      console.error('❌ [RETRO] Erreur démarrage:', error);
      throw error;
    }
  },

  /**
   * Terminer la rétrospective et attribuer les XP
   */
  async completeRetrospective(retroId, actualDuration) {
    try {
      console.log('🏁 [RETRO] Fin rétrospective');

      const retroRef = doc(db, 'retrospectives', retroId);
      const retroDoc = await getDoc(retroRef);

      if (!retroDoc.exists()) {
        throw new Error('Rétrospective non trouvée');
      }

      const retroData = retroDoc.data();

      await updateDoc(retroRef, {
        status: RETRO_STATUS.COMPLETED,
        actualDuration,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Rétrospective terminée');

      // Retourner les infos pour l'attribution des XP
      return {
        participants: retroData.participants || [],
        animator: retroData.roles?.animator,
        xpParticipate: RETRO_XP.PARTICIPATE,
        xpAnimate: RETRO_XP.ANIMATE
      };
    } catch (error) {
      console.error('❌ [RETRO] Erreur fin rétrospective:', error);
      throw error;
    }
  },

  /**
   * Planifier la date de la rétrospective
   */
  async scheduleRetrospective(retroId, scheduledDate, plannedDuration) {
    try {
      console.log('📅 [RETRO] Planification:', scheduledDate);

      const retroRef = doc(db, 'retrospectives', retroId);
      await updateDoc(retroRef, {
        scheduledDate,
        plannedDuration,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [RETRO] Rétrospective planifiée');
    } catch (error) {
      console.error('❌ [RETRO] Erreur planification:', error);
      throw error;
    }
  },

  /**
   * Supprimer une rétrospective
   */
  async deleteRetrospective(retroId) {
    try {
      console.log('🗑️ [RETRO] Suppression rétrospective:', retroId);

      await deleteDoc(doc(db, 'retrospectives', retroId));

      console.log('✅ [RETRO] Rétrospective supprimée');
    } catch (error) {
      console.error('❌ [RETRO] Erreur suppression:', error);
      throw error;
    }
  },

  /**
   * Compter les rétrospectives animées par un utilisateur
   */
  async countAnimatedRetros(userId) {
    try {
      const q = query(
        collection(db, 'retrospectives'),
        where('roles.animator.id', '==', userId),
        where('status', '==', RETRO_STATUS.COMPLETED)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('❌ [RETRO] Erreur comptage rétros:', error);
      return 0;
    }
  }
};

export default retrospectiveService;
