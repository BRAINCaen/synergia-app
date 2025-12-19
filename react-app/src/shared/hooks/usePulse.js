// ==========================================
// react-app/src/shared/hooks/usePulse.js
// HOOK PULSE - SYNERGIA v4.0
// Module Pulse: Check-in quotidien
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import {
  pulseService,
  MOOD_LEVELS,
  ENERGY_LEVELS,
  PULSE_CATEGORIES
} from '../../core/services/pulseService.js';

/**
 * Hook pour gerer les pulses quotidiens
 */
export const usePulse = (options = {}) => {
  const { autoInit = true, realTimeTeam = false } = options;
  const { user } = useAuthStore();

  // Etats
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPulseToday, setHasPulseToday] = useState(false);
  const [todayPulse, setTodayPulse] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [teamPulse, setTeamPulse] = useState(null);
  const [error, setError] = useState(null);

  // Charger les donnees initiales
  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Verifier si pulse fait aujourd'hui
      const hasPulse = await pulseService.hasPulseToday(user.uid);
      setHasPulseToday(hasPulse);

      if (hasPulse) {
        const pulse = await pulseService.getTodayPulse(user.uid);
        setTodayPulse(pulse);
      }

      // Charger stats utilisateur
      const stats = await pulseService.getUserPulseStats(user.uid);
      setUserStats(stats);

      // Charger pulse equipe
      const team = await pulseService.getTeamPulse(7);
      setTeamPulse(team);

    } catch (err) {
      console.error('Erreur chargement pulse:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initialisation
  useEffect(() => {
    if (autoInit && user?.uid) {
      loadData();
    }
  }, [autoInit, user?.uid, loadData]);

  // Temps reel pour equipe
  useEffect(() => {
    if (!realTimeTeam) return;

    const unsubscribe = pulseService.subscribeToTeamPulse(async () => {
      const team = await pulseService.getTeamPulse(7);
      setTeamPulse(team);
    });

    return () => unsubscribe();
  }, [realTimeTeam]);

  // Soumettre un pulse
  const submitPulse = useCallback(async (pulseData) => {
    if (!user?.uid) return { success: false, error: 'Non connecte' };
    if (hasPulseToday) return { success: false, error: 'Pulse deja fait aujourd\'hui' };

    setSubmitting(true);
    setError(null);

    try {
      const result = await pulseService.submitPulse(user.uid, pulseData);

      if (result.success) {
        setHasPulseToday(true);
        const pulse = await pulseService.getTodayPulse(user.uid);
        setTodayPulse(pulse);

        // Recharger les stats
        const stats = await pulseService.getUserPulseStats(user.uid);
        setUserStats(stats);

        const team = await pulseService.getTeamPulse(7);
        setTeamPulse(team);
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      console.error('Erreur soumission pulse:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, [user?.uid, hasPulseToday]);

  // Rafraichir
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Etats
    loading,
    submitting,
    error,
    hasPulseToday,
    todayPulse,
    userStats,
    teamPulse,

    // Actions
    submitPulse,
    refresh,

    // Constantes
    MOOD_LEVELS,
    ENERGY_LEVELS,
    PULSE_CATEGORIES
  };
};

export default usePulse;
