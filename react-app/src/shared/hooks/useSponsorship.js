// ==========================================
// react-app/src/shared/hooks/useSponsorship.js
// HOOK PARRAINAGE - SYNERGIA v4.0
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import sponsorshipService, {
  SPONSORSHIP_STATUS,
  MENTEE_MILESTONES,
  SPONSORSHIP_BADGES
} from '../../core/services/sponsorshipService.js';

export const useSponsorship = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sponsorships, setSponsorships] = useState([]);
  const [stats, setStats] = useState(null);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [availableMentees, setAvailableMentees] = useState([]);

  // Charger les données initiales
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // S'abonner aux parrainages en temps réel
    const unsubscribe = sponsorshipService.subscribeToUserSponsorships(
      user.uid,
      (updatedSponsorships) => {
        setSponsorships(updatedSponsorships);
        setLoading(false);
      }
    );

    // Charger les stats
    loadStats();

    // Charger les utilisateurs disponibles
    loadAvailableUsers();

    return () => unsubscribe();
  }, [user?.uid]);

  // Charger les stats
  const loadStats = useCallback(async () => {
    if (!user?.uid) return;

    const userStats = await sponsorshipService.getUserSponsorshipStats(user.uid);
    setStats(userStats);
  }, [user?.uid]);

  // Charger les utilisateurs disponibles
  const loadAvailableUsers = useCallback(async () => {
    if (!user?.uid) return;

    const [mentors, mentees] = await Promise.all([
      sponsorshipService.getAvailableMentors(user.uid),
      sponsorshipService.getAvailableMentees(user.uid)
    ]);

    setAvailableMentors(mentors);
    setAvailableMentees(mentees);
  }, [user?.uid]);

  // Créer un parrainage
  const createSponsorship = useCallback(async (sponsorshipData) => {
    const result = await sponsorshipService.createSponsorship({
      ...sponsorshipData,
      createdBy: user?.uid
    });

    if (result.success) {
      await loadStats();
      await loadAvailableUsers();
    }

    return result;
  }, [user?.uid, loadStats, loadAvailableUsers]);

  // Enregistrer une réunion
  const recordMeeting = useCallback(async (sponsorshipId, meetingData) => {
    const result = await sponsorshipService.recordMeeting(sponsorshipId, meetingData);

    if (result.success) {
      await loadStats();
    }

    return result;
  }, [loadStats]);

  // Valider un jalon
  const completeMilestone = useCallback(async (sponsorshipId, milestoneId) => {
    const result = await sponsorshipService.completeMilestone(sponsorshipId, milestoneId);

    if (result.success) {
      await loadStats();
    }

    return result;
  }, [loadStats]);

  // Terminer un parrainage
  const completeSponsorship = useCallback(async (sponsorshipId) => {
    const result = await sponsorshipService.completeSponsorship(sponsorshipId);

    if (result.success) {
      await loadStats();
    }

    return result;
  }, [loadStats]);

  // Annuler un parrainage
  const cancelSponsorship = useCallback(async (sponsorshipId, reason) => {
    const result = await sponsorshipService.cancelSponsorship(sponsorshipId, reason);

    if (result.success) {
      await loadStats();
      await loadAvailableUsers();
    }

    return result;
  }, [loadStats, loadAvailableUsers]);

  // Vérifier les jalons automatiques
  const checkMilestones = useCallback(async () => {
    if (!user?.uid) return;

    await sponsorshipService.checkAutomaticMilestones(user.uid);
  }, [user?.uid]);

  // Données filtrées
  const activeSponsorships = sponsorships.filter(s => s.status === 'active');
  const completedSponsorships = sponsorships.filter(s => s.status === 'completed');
  const asMentor = sponsorships.filter(s => s.role === 'mentor');
  const asMentee = sponsorships.filter(s => s.role === 'mentee');

  return {
    loading,
    sponsorships,
    activeSponsorships,
    completedSponsorships,
    asMentor,
    asMentee,
    stats,
    availableMentors,
    availableMentees,
    createSponsorship,
    recordMeeting,
    completeMilestone,
    completeSponsorship,
    cancelSponsorship,
    checkMilestones,
    refreshData: loadStats,
    SPONSORSHIP_STATUS,
    MENTEE_MILESTONES,
    SPONSORSHIP_BADGES
  };
};

export default useSponsorship;
