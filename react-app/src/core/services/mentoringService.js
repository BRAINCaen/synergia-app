// ==========================================
// react-app/src/core/services/mentoringService.js
// SERVICE MENTORING - SYNERGIA v4.0
// Module Mentorat: Sessions de coaching
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
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadFile, deleteFile } from './storageService.js';

// ==========================================
// CONSTANTES MENTORAT
// ==========================================

export const MENTORING_STATUS = {
  scheduled: {
    id: 'scheduled',
    label: 'Planifiee',
    emoji: '📅',
    color: 'blue',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  in_progress: {
    id: 'in_progress',
    label: 'En cours',
    emoji: '🎯',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  completed: {
    id: 'completed',
    label: 'Terminee',
    emoji: '✅',
    color: 'green',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400'
  },
  cancelled: {
    id: 'cancelled',
    label: 'Annulee',
    emoji: '❌',
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  }
};

export const SESSION_TYPES = {
  onboarding: {
    id: 'onboarding',
    label: 'Integration',
    emoji: '🚀',
    description: 'Accueil et integration d\'un nouveau membre',
    duration: 60,
    xpMentor: 50,
    xpMentee: 30
  },
  skill_transfer: {
    id: 'skill_transfer',
    label: 'Transfert de competences',
    emoji: '📚',
    description: 'Transmission de savoir-faire specifique',
    duration: 45,
    xpMentor: 40,
    xpMentee: 35
  },
  career_coaching: {
    id: 'career_coaching',
    label: 'Coaching carriere',
    emoji: '🎯',
    description: 'Accompagnement developpement professionnel',
    duration: 30,
    xpMentor: 35,
    xpMentee: 25
  },
  problem_solving: {
    id: 'problem_solving',
    label: 'Resolution probleme',
    emoji: '🧩',
    description: 'Aide sur un probleme specifique',
    duration: 30,
    xpMentor: 30,
    xpMentee: 40
  },
  feedback: {
    id: 'feedback',
    label: 'Feedback',
    emoji: '💬',
    description: 'Session de retour et amelioration',
    duration: 20,
    xpMentor: 25,
    xpMentee: 25
  },
  pair_working: {
    id: 'pair_working',
    label: 'Travail en binome',
    emoji: '👥',
    description: 'Travail collaboratif sur une tache',
    duration: 60,
    xpMentor: 45,
    xpMentee: 45
  }
};

export const MENTORING_TOPICS = [
  { id: 'technical', label: 'Technique', emoji: '💻' },
  { id: 'soft_skills', label: 'Soft Skills', emoji: '🤝' },
  { id: 'processes', label: 'Processus', emoji: '📋' },
  { id: 'tools', label: 'Outils', emoji: '🛠️' },
  { id: 'communication', label: 'Communication', emoji: '💬' },
  { id: 'leadership', label: 'Leadership', emoji: '👑' },
  { id: 'organization', label: 'Organisation', emoji: '📊' },
  { id: 'creativity', label: 'Creativite', emoji: '🎨' }
];

export const FEEDBACK_RATINGS = {
  excellent: { id: 'excellent', label: 'Excellent', emoji: '🌟', value: 5 },
  good: { id: 'good', label: 'Tres bien', emoji: '😊', value: 4 },
  satisfactory: { id: 'satisfactory', label: 'Satisfaisant', emoji: '👍', value: 3 },
  needs_improvement: { id: 'needs_improvement', label: 'A ameliorer', emoji: '💪', value: 2 },
  poor: { id: 'poor', label: 'Insuffisant', emoji: '😕', value: 1 }
};

// Niveaux de difficulte - affecte uniquement les XP du mentee
export const DIFFICULTY_LEVELS = {
  beginner: {
    id: 'beginner',
    label: 'Debutant',
    emoji: '🌱',
    description: 'Notions de base, aucune prerequis',
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    xpMultiplier: 1.0  // XP de base
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediaire',
    emoji: '📈',
    description: 'Necessite des connaissances prealables',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    xpMultiplier: 1.5  // +50% XP pour le mentee
  },
  advanced: {
    id: 'advanced',
    label: 'Avance',
    emoji: '🚀',
    description: 'Sujet complexe, expertise requise',
    color: 'orange',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    xpMultiplier: 2.0  // +100% XP pour le mentee
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    emoji: '💎',
    description: 'Niveau expert, maitrise complete',
    color: 'purple',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    xpMultiplier: 2.5  // +150% XP pour le mentee
  }
};

// ==========================================
// SERVICE MENTORING
// ==========================================

class MentoringService {
  constructor() {
    this.collectionName = 'mentoring_sessions';
    this.relationshipsCollection = 'mentoring_relationships';
  }

  // ==========================================
  // GESTION DES SESSIONS
  // ==========================================

  /**
   * Creer une nouvelle session de mentorat
   */
  async createSession(sessionData) {
    try {
      const session = {
        mentorId: sessionData.mentorId,
        mentorName: sessionData.mentorName || 'Mentor',
        menteeId: sessionData.menteeId,
        menteeName: sessionData.menteeName || 'Mentee',
        type: sessionData.type || 'skill_transfer',
        topic: sessionData.topic || 'technical',
        difficulty: sessionData.difficulty || 'beginner', // Niveau de difficulte
        title: sessionData.title || 'Session de mentorat',
        description: sessionData.description || '',
        objectives: sessionData.objectives || [],
        scheduledDate: sessionData.scheduledDate ? Timestamp.fromDate(new Date(sessionData.scheduledDate)) : null,
        duration: sessionData.duration || SESSION_TYPES[sessionData.type]?.duration || 30,
        status: 'scheduled',
        notes: '',
        mentorFeedback: null,
        menteeFeedback: null,
        xpAwarded: false,
        documents: [], // Documents supports de formation
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), session);

      return { success: true, sessionId: docRef.id };
    } catch (error) {
      console.error('Erreur creation session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Demarrer une session
   */
  async startSession(sessionId) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);

      await updateDoc(sessionRef, {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur demarrage session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Terminer une session
   */
  async completeSession(sessionId, completionData = {}) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session non trouvee' };
      }

      const session = sessionDoc.data();

      await updateDoc(sessionRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        notes: completionData.notes || session.notes || '',
        objectivesCompleted: completionData.objectivesCompleted || [],
        updatedAt: serverTimestamp()
      });

      // Attribuer les XP si pas deja fait
      if (!session.xpAwarded) {
        await this.awardSessionXP(sessionId);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur completion session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Annuler une session
   */
  async cancelSession(sessionId, reason = '') {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);

      await updateDoc(sessionRef, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur annulation session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Modifier une session (difficulté, titre, description, etc.)
   * Seul le créateur (mentor) peut modifier la session avant qu'elle soit terminée
   */
  async updateSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session non trouvée' };
      }

      const session = sessionDoc.data();

      // Empêcher la modification d'une session terminée ou annulée
      if (session.status === 'completed' || session.status === 'cancelled') {
        return { success: false, error: 'Impossible de modifier une session terminée ou annulée' };
      }

      // Champs autorisés à la modification
      const allowedFields = ['title', 'description', 'difficulty', 'type', 'topic', 'objectives', 'duration', 'scheduledDate'];
      const filteredUpdates = {};

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          if (field === 'scheduledDate' && updates[field]) {
            filteredUpdates[field] = Timestamp.fromDate(new Date(updates[field]));
          } else {
            filteredUpdates[field] = updates[field];
          }
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return { success: false, error: 'Aucune modification à appliquer' };
      }

      filteredUpdates.updatedAt = serverTimestamp();

      await updateDoc(sessionRef, filteredUpdates);

      console.log('✅ Session mise à jour:', sessionId, filteredUpdates);
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajouter des notes a une session
   */
  async updateSessionNotes(sessionId, notes) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);

      await updateDoc(sessionRef, {
        notes,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur mise a jour notes:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Soumettre un feedback
   */
  async submitFeedback(sessionId, userId, feedbackData) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session non trouvee' };
      }

      const session = sessionDoc.data();
      const isMentor = session.mentorId === userId;

      const feedback = {
        rating: feedbackData.rating,
        comment: feedbackData.comment || '',
        highlights: feedbackData.highlights || [],
        improvements: feedbackData.improvements || [],
        submittedAt: serverTimestamp()
      };

      const updateData = {
        updatedAt: serverTimestamp()
      };

      if (isMentor) {
        updateData.mentorFeedback = feedback;
      } else {
        updateData.menteeFeedback = feedback;
      }

      await updateDoc(sessionRef, updateData);

      // Attribuer XP bonus pour feedback
      await this.awardFeedbackXP(userId);

      return { success: true };
    } catch (error) {
      console.error('Erreur soumission feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // GESTION DES DOCUMENTS
  // ==========================================

  /**
   * Ajouter un document a une session
   * @param {string} sessionId - ID de la session
   * @param {File} file - Fichier a uploader
   * @param {string} uploadedBy - ID de l'utilisateur qui upload
   * @returns {Promise<{success: boolean, document?: object, error?: string}>}
   */
  async addDocument(sessionId, file, uploadedBy) {
    try {
      console.log('📁 [MENTORING] Upload document pour session:', sessionId);

      // Validation du fichier
      if (!file) {
        return { success: false, error: 'Aucun fichier fourni' };
      }

      // Types de fichiers autorises
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Type de fichier non autorise. Formats acceptes: PDF, Excel, PowerPoint, Word, Videos, Images'
        };
      }

      // Generer le chemin de stockage
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `mentoring/${sessionId}/documents/${timestamp}_${safeFileName}`;

      // Upload du fichier
      const downloadURL = await uploadFile(storagePath, file);

      // Creer l'objet document
      const document = {
        id: `doc_${timestamp}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        storagePath: storagePath,
        uploadedBy: uploadedBy,
        uploadedAt: new Date().toISOString()
      };

      // Mettre a jour la session avec le nouveau document
      const sessionRef = doc(db, this.collectionName, sessionId);
      await updateDoc(sessionRef, {
        documents: arrayUnion(document),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [MENTORING] Document ajoute:', document.name);
      return { success: true, document };
    } catch (error) {
      console.error('❌ [MENTORING] Erreur ajout document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un document d'une session
   * @param {string} sessionId - ID de la session
   * @param {object} document - Document a supprimer
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeDocument(sessionId, document) {
    try {
      console.log('🗑️ [MENTORING] Suppression document:', document.name);

      // Supprimer le fichier du storage
      if (document.url) {
        await deleteFile(document.url);
      }

      // Retirer le document de la session
      const sessionRef = doc(db, this.collectionName, sessionId);
      await updateDoc(sessionRef, {
        documents: arrayRemove(document),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [MENTORING] Document supprime');
      return { success: true };
    } catch (error) {
      console.error('❌ [MENTORING] Erreur suppression document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les documents d'une session
   * @param {string} sessionId - ID de la session
   * @returns {Promise<object[]>} Liste des documents
   */
  async getSessionDocuments(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      return session?.documents || [];
    } catch (error) {
      console.error('❌ [MENTORING] Erreur recuperation documents:', error);
      return [];
    }
  }

  // ==========================================
  // ATTRIBUTION XP
  // ==========================================

  /**
   * Attribuer les XP de session
   */
  async awardSessionXP(sessionId) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) return;

      const session = sessionDoc.data();
      if (session.xpAwarded) return;

      const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.skill_transfer;
      const difficulty = DIFFICULTY_LEVELS[session.difficulty] || DIFFICULTY_LEVELS.beginner;

      // XP pour le mentor (fixe, pas affecte par la difficulte)
      const mentorRef = doc(db, 'users', session.mentorId);
      const mentorDoc = await getDoc(mentorRef);
      if (mentorDoc.exists()) {
        const mentorData = mentorDoc.data();
        const currentXP = mentorData.gamification?.totalXp || 0;
        await updateDoc(mentorRef, {
          'gamification.totalXp': currentXP + sessionType.xpMentor,
          'gamification.mentoringXp': (mentorData.gamification?.mentoringXp || 0) + sessionType.xpMentor,
          'gamification.sessionsAsMentor': (mentorData.gamification?.sessionsAsMentor || 0) + 1
        });
        console.log(`✅ XP Mentor: +${sessionType.xpMentor} XP`);
      }

      // XP pour le mentee (multiplie par la difficulte)
      const menteeRef = doc(db, 'users', session.menteeId);
      const menteeDoc = await getDoc(menteeRef);
      if (menteeDoc.exists()) {
        const menteeData = menteeDoc.data();
        const currentXP = menteeData.gamification?.totalXp || 0;
        // Appliquer le multiplicateur de difficulte uniquement pour le mentee
        const menteeXP = Math.round(sessionType.xpMentee * difficulty.xpMultiplier);
        await updateDoc(menteeRef, {
          'gamification.totalXp': currentXP + menteeXP,
          'gamification.mentoringXp': (menteeData.gamification?.mentoringXp || 0) + menteeXP,
          'gamification.sessionsAsMentee': (menteeData.gamification?.sessionsAsMentee || 0) + 1
        });
        console.log(`✅ XP Mentee: +${menteeXP} XP (base ${sessionType.xpMentee} × ${difficulty.xpMultiplier} difficulte ${difficulty.label})`);
      }

      // Marquer XP comme attribue
      await updateDoc(sessionRef, { xpAwarded: true });
    } catch (error) {
      console.error('Erreur attribution XP session:', error);
    }
  }

  /**
   * Attribuer XP bonus pour feedback
   */
  async awardFeedbackXP(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentXP = userData.gamification?.totalXp || 0;
        await updateDoc(userRef, {
          'gamification.totalXp': currentXP + 10 // +10 XP pour feedback
        });
      }
    } catch (error) {
      console.error('Erreur attribution XP feedback:', error);
    }
  }

  // ==========================================
  // RECUPERATION DES SESSIONS
  // ==========================================

  /**
   * Obtenir TOUTES les sessions (pour admins)
   */
  async getAllSessions(status = null) {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      if (status) {
        q = query(
          collection(db, this.collectionName),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'admin' // Pour identifier la vue admin
      }));
    } catch (error) {
      console.error('Erreur recuperation toutes sessions:', error);
      return [];
    }
  }

  /**
   * Mettre à jour la progression d'un objectif individuel
   * Permet au mentor de cocher les objectifs au fur et à mesure
   */
  async updateObjectiveProgress(sessionId, objectiveIndex, completed) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session non trouvée' };
      }

      const session = sessionDoc.data();

      // Initialiser objectivesProgress s'il n'existe pas
      const objectivesProgress = session.objectivesProgress || {};
      objectivesProgress[objectiveIndex] = {
        completed,
        completedAt: completed ? new Date().toISOString() : null
      };

      await updateDoc(sessionRef, {
        objectivesProgress,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Objectif ${objectiveIndex} mis à jour: ${completed ? 'validé' : 'non validé'}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour objectif:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir les sessions d'un utilisateur
   */
  async getUserSessions(userId, role = 'both', status = null) {
    try {
      let sessions = [];

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
        sessions = [...sessions, ...snapshot.docs.map(doc => ({
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
        sessions = [...sessions, ...snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: 'mentee'
        }))];
      }

      // Trier par date
      return sessions.sort((a, b) => {
        const dateA = a.scheduledDate?.toDate?.() || a.createdAt?.toDate?.() || new Date();
        const dateB = b.scheduledDate?.toDate?.() || b.createdAt?.toDate?.() || new Date();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Erreur recuperation sessions:', error);
      return [];
    }
  }

  /**
   * Obtenir une session par ID
   */
  async getSession(sessionId) {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) return null;

      return { id: sessionDoc.id, ...sessionDoc.data() };
    } catch (error) {
      console.error('Erreur recuperation session:', error);
      return null;
    }
  }

  /**
   * Obtenir les sessions a venir
   */
  async getUpcomingSessions(userId) {
    try {
      const now = new Date();
      const sessions = await this.getUserSessions(userId, 'both', 'scheduled');

      return sessions.filter(s => {
        const scheduledDate = s.scheduledDate?.toDate?.();
        return scheduledDate && scheduledDate > now;
      }).sort((a, b) => {
        const dateA = a.scheduledDate?.toDate?.() || new Date();
        const dateB = b.scheduledDate?.toDate?.() || new Date();
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Erreur sessions a venir:', error);
      return [];
    }
  }

  // ==========================================
  // STATISTIQUES
  // ==========================================

  /**
   * Obtenir les stats de mentorat d'un utilisateur
   */
  async getUserMentoringStats(userId) {
    try {
      const allSessions = await this.getUserSessions(userId, 'both');

      const asMentor = allSessions.filter(s => s.role === 'mentor');
      const asMentee = allSessions.filter(s => s.role === 'mentee');

      const completedAsMentor = asMentor.filter(s => s.status === 'completed');
      const completedAsMentee = asMentee.filter(s => s.status === 'completed');

      // Calculer temps total
      const totalMinutesMentor = completedAsMentor.reduce((sum, s) => sum + (s.duration || 30), 0);
      const totalMinutesMentee = completedAsMentee.reduce((sum, s) => sum + (s.duration || 30), 0);

      // Calculer XP total
      const totalXPMentor = completedAsMentor.reduce((sum, s) => {
        const type = SESSION_TYPES[s.type] || SESSION_TYPES.skill_transfer;
        return sum + type.xpMentor;
      }, 0);

      const totalXPMentee = completedAsMentee.reduce((sum, s) => {
        const type = SESSION_TYPES[s.type] || SESSION_TYPES.skill_transfer;
        return sum + type.xpMentee;
      }, 0);

      // Rating moyen recu
      const ratingsReceived = allSessions
        .filter(s => s.status === 'completed')
        .map(s => {
          if (s.role === 'mentor' && s.menteeFeedback?.rating) {
            return FEEDBACK_RATINGS[s.menteeFeedback.rating]?.value || 0;
          }
          if (s.role === 'mentee' && s.mentorFeedback?.rating) {
            return FEEDBACK_RATINGS[s.mentorFeedback.rating]?.value || 0;
          }
          return null;
        })
        .filter(r => r !== null);

      const avgRating = ratingsReceived.length > 0
        ? (ratingsReceived.reduce((a, b) => a + b, 0) / ratingsReceived.length).toFixed(1)
        : null;

      return {
        asMentor: {
          total: asMentor.length,
          completed: completedAsMentor.length,
          scheduled: asMentor.filter(s => s.status === 'scheduled').length,
          totalMinutes: totalMinutesMentor,
          totalXP: totalXPMentor
        },
        asMentee: {
          total: asMentee.length,
          completed: completedAsMentee.length,
          scheduled: asMentee.filter(s => s.status === 'scheduled').length,
          totalMinutes: totalMinutesMentee,
          totalXP: totalXPMentee
        },
        overall: {
          totalSessions: allSessions.length,
          completedSessions: completedAsMentor.length + completedAsMentee.length,
          totalMinutes: totalMinutesMentor + totalMinutesMentee,
          totalXP: totalXPMentor + totalXPMentee,
          avgRating
        }
      };
    } catch (error) {
      console.error('Erreur stats mentorat:', error);
      return null;
    }
  }

  /**
   * S'abonner aux sessions en temps reel
   */
  subscribeToUserSessions(userId, callback) {
    const q1 = query(
      collection(db, this.collectionName),
      where('mentorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const q2 = query(
      collection(db, this.collectionName),
      where('menteeId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    let sessions1 = [];
    let sessions2 = [];

    const unsub1 = onSnapshot(q1, (snapshot) => {
      sessions1 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'mentor'
      }));
      callback([...sessions1, ...sessions2]);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      sessions2 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'mentee'
      }));
      callback([...sessions1, ...sessions2]);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }

  /**
   * S'abonner à TOUTES les sessions en temps réel (pour admins)
   */
  subscribeToAllSessions(callback) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'admin'
      }));
      callback(sessions);
    });
  }

  // ==========================================
  // RECUPERATION UTILISATEURS POUR MATCHING
  // ==========================================

  /**
   * Obtenir les utilisateurs disponibles pour le mentorat
   */
  async getAvailableUsers(currentUserId) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      return snapshot.docs
        .filter(doc => doc.id !== currentUserId)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || data.email || 'Utilisateur',
            email: data.email || '',
            avatar: data.customization?.avatar || '👤',
            level: data.gamification?.level || 1,
            totalXp: data.gamification?.totalXp || 0,
            sessionsAsMentor: data.gamification?.sessionsAsMentor || 0,
            sessionsAsMentee: data.gamification?.sessionsAsMentee || 0
          };
        })
        .sort((a, b) => b.level - a.level);
    } catch (error) {
      console.error('Erreur recuperation utilisateurs:', error);
      return [];
    }
  }
}

// Export singleton
export const mentoringService = new MentoringService();
export default mentoringService;
