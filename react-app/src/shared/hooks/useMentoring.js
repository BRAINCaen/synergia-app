// ==========================================
// react-app/src/shared/hooks/useMentoring.js
// HOOK MENTORING - SYNERGIA v4.0
// Module Mentorat: Sessions de coaching
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import {
  mentoringService,
  MENTORING_STATUS,
  SESSION_TYPES,
  MENTORING_TOPICS,
  FEEDBACK_RATINGS
} from '../../core/services/mentoringService.js';

/**
 * Hook pour gerer les sessions de mentorat
 */
export const useMentoring = (options = {}) => {
  const { realTime = true } = options;
  const { user } = useAuthStore();

  // Etats
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [error, setError] = useState(null);

  // Sessions filtrees
  const scheduledSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'scheduled');
  }, [sessions]);

  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'completed');
  }, [sessions]);

  const inProgressSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'in_progress');
  }, [sessions]);

  const mentorSessions = useMemo(() => {
    return sessions.filter(s => s.role === 'mentor');
  }, [sessions]);

  const menteeSessions = useMemo(() => {
    return sessions.filter(s => s.role === 'mentee');
  }, [sessions]);

  // Charger les donnees
  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Charger les sessions
      const userSessions = await mentoringService.getUserSessions(user.uid);
      setSessions(userSessions);

      // Charger les sessions a venir
      const upcoming = await mentoringService.getUpcomingSessions(user.uid);
      setUpcomingSessions(upcoming);

      // Charger les stats
      const userStats = await mentoringService.getUserMentoringStats(user.uid);
      setStats(userStats);

      // Charger les utilisateurs disponibles
      const users = await mentoringService.getAvailableUsers(user.uid);
      setAvailableUsers(users);

    } catch (err) {
      console.error('Erreur chargement mentoring:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initialisation
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    if (!realTime) {
      loadData();
      return;
    }

    // Temps reel
    setLoading(true);

    const unsubscribe = mentoringService.subscribeToUserSessions(user.uid, (newSessions) => {
      // Trier par date
      const sorted = newSessions.sort((a, b) => {
        const dateA = a.scheduledDate?.toDate?.() || a.createdAt?.toDate?.() || new Date();
        const dateB = b.scheduledDate?.toDate?.() || b.createdAt?.toDate?.() || new Date();
        return dateB - dateA;
      });
      setSessions(sorted);
      setLoading(false);
    });

    // Charger aussi stats et users (pas en temps reel)
    (async () => {
      const userStats = await mentoringService.getUserMentoringStats(user.uid);
      setStats(userStats);

      const users = await mentoringService.getAvailableUsers(user.uid);
      setAvailableUsers(users);

      const upcoming = await mentoringService.getUpcomingSessions(user.uid);
      setUpcomingSessions(upcoming);
    })();

    return () => unsubscribe();
  }, [user?.uid, realTime, loadData]);

  /**
   * Creer une nouvelle session
   */
  const createSession = useCallback(async (sessionData) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    setCreating(true);
    setError(null);

    try {
      const result = await mentoringService.createSession({
        ...sessionData,
        mentorId: sessionData.mentorId || user.uid,
        mentorName: sessionData.mentorName || user.displayName || 'Mentor'
      });

      if (result.success) {
        // Recharger les stats
        const userStats = await mentoringService.getUserMentoringStats(user.uid);
        setStats(userStats);
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error('Erreur creation session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  }, [user?.uid, user?.displayName]);

  /**
   * Demarrer une session
   */
  const startSession = useCallback(async (sessionId) => {
    try {
      const result = await mentoringService.startSession(sessionId);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur demarrage session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Terminer une session
   */
  const completeSession = useCallback(async (sessionId, completionData = {}) => {
    try {
      const result = await mentoringService.completeSession(sessionId, completionData);
      if (result.success) {
        // Recharger les stats
        const userStats = await mentoringService.getUserMentoringStats(user.uid);
        setStats(userStats);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur completion session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.uid]);

  /**
   * Annuler une session
   */
  const cancelSession = useCallback(async (sessionId, reason = '') => {
    try {
      const result = await mentoringService.cancelSession(sessionId, reason);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur annulation session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Mettre a jour les notes
   */
  const updateNotes = useCallback(async (sessionId, notes) => {
    try {
      const result = await mentoringService.updateSessionNotes(sessionId, notes);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur mise a jour notes:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Soumettre un feedback
   */
  const submitFeedback = useCallback(async (sessionId, feedbackData) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    try {
      const result = await mentoringService.submitFeedback(sessionId, user.uid, feedbackData);
      if (result.success) {
        // Recharger les stats
        const userStats = await mentoringService.getUserMentoringStats(user.uid);
        setStats(userStats);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur soumission feedback:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.uid]);

  /**
   * Obtenir une session par ID
   */
  const getSession = useCallback(async (sessionId) => {
    try {
      return await mentoringService.getSession(sessionId);
    } catch (err) {
      console.error('Erreur recuperation session:', err);
      return null;
    }
  }, []);

  /**
   * Ajouter un document a une session
   */
  const addDocument = useCallback(async (sessionId, file) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };

    try {
      const result = await mentoringService.addDocument(sessionId, file, user.uid);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur ajout document:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.uid]);

  /**
   * Supprimer un document d'une session
   */
  const removeDocument = useCallback(async (sessionId, document) => {
    try {
      const result = await mentoringService.removeDocument(sessionId, document);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      console.error('Erreur suppression document:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Rafraichir les donnees
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Etats
    loading,
    creating,
    error,

    // Donnees
    sessions,
    scheduledSessions,
    completedSessions,
    inProgressSessions,
    mentorSessions,
    menteeSessions,
    upcomingSessions,
    stats,
    availableUsers,

    // Actions
    createSession,
    startSession,
    completeSession,
    cancelSession,
    updateNotes,
    submitFeedback,
    getSession,
    refresh,

    // Documents
    addDocument,
    removeDocument,

    // Constantes
    MENTORING_STATUS,
    SESSION_TYPES,
    MENTORING_TOPICS,
    FEEDBACK_RATINGS
  };
};

export default useMentoring;
