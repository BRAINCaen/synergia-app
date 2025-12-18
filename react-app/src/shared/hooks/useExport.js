// ==========================================
// react-app/src/shared/hooks/useExport.js
// HOOK EXPORT - SYNERGIA v4.0
// Module 17: Export des donnees
// ==========================================

import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { exportService } from '../../core/services/exportService.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { calculateLevel, getFullProgressInfo } from '../../core/services/levelService.js';

/**
 * Hook pour exporter les donnees utilisateur
 */
export const useExport = () => {
  const { user } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [error, setError] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  /**
   * Charger les donnees completes de l'utilisateur
   */
  const loadUserData = useCallback(async () => {
    if (!user?.uid) return null;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      const gamification = data.gamification || {};
      const totalXp = gamification.totalXp || 0;
      const level = calculateLevel(totalXp);
      const levelInfo = getFullProgressInfo(totalXp);

      return {
        // Infos basiques
        displayName: data.displayName || user.displayName || 'Utilisateur',
        email: data.email || user.email || '',

        // Stats de niveau
        level,
        totalXp,
        levelProgress: levelInfo.progress,
        xpToNextLevel: levelInfo.xpToNext,
        rank: gamification.rank || getRankFromLevel(level),

        // Stats de taches
        tasksCompleted: gamification.tasksCompleted || 0,
        tasksThisWeek: gamification.tasksThisWeek || 0,
        questsCompleted: gamification.questsCompleted || 0,
        questsActive: gamification.questsActive || 0,
        completionRate: gamification.completionRate || 0,

        // Streaks
        streak: gamification.loginStreak || 0,

        // Badges
        badges: gamification.badges || [],
        badgesCount: (gamification.badges || []).length,
        badgesTotal: 20, // Total de badges disponibles

        // Equipe
        teamContributions: gamification.teamContributions || 0,
        poolContributions: gamification.poolContributions || 0,
        teamStats: {
          poolXP: data.teamStats?.poolXP || 0,
          challengesCompleted: data.teamStats?.challengesCompleted || 0,
          totalContributions: data.teamStats?.totalContributions || 0,
          rank: data.teamStats?.rank || 'N/A',
          activeMembers: data.teamStats?.activeMembers || 0
        },

        // Historique XP
        xpHistory: gamification.xpHistory || []
      };
    } catch (err) {
      console.error('Erreur chargement donnees export:', err);
      throw err;
    }
  }, [user?.uid, user?.displayName, user?.email]);

  /**
   * Export PDF
   */
  const exportToPDF = useCallback(async (options = {}) => {
    if (exporting) return { success: false, error: 'Export en cours' };

    setExporting(true);
    setExportType('pdf');
    setError(null);

    try {
      const userData = await loadUserData();
      if (!userData) {
        throw new Error('Impossible de charger les donnees utilisateur');
      }

      const result = await exportService.exportStatsToPDF(userData, options);
      setLastExport({ type: 'pdf', fileName: result.fileName, date: new Date() });
      return result;
    } catch (err) {
      console.error('Erreur export PDF:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setExporting(false);
      setExportType(null);
    }
  }, [exporting, loadUserData]);

  /**
   * Export Excel
   */
  const exportToExcel = useCallback(async (options = {}) => {
    if (exporting) return { success: false, error: 'Export en cours' };

    setExporting(true);
    setExportType('excel');
    setError(null);

    try {
      const userData = await loadUserData();
      if (!userData) {
        throw new Error('Impossible de charger les donnees utilisateur');
      }

      const result = await exportService.exportStatsToExcel(userData, options);
      setLastExport({ type: 'excel', fileName: result.fileName, date: new Date() });
      return result;
    } catch (err) {
      console.error('Erreur export Excel:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setExporting(false);
      setExportType(null);
    }
  }, [exporting, loadUserData]);

  /**
   * Export JSON
   */
  const exportToJSON = useCallback(async (options = {}) => {
    if (exporting) return { success: false, error: 'Export en cours' };

    setExporting(true);
    setExportType('json');
    setError(null);

    try {
      const userData = await loadUserData();
      if (!userData) {
        throw new Error('Impossible de charger les donnees utilisateur');
      }

      const result = exportService.exportToJSON(userData, options);
      setLastExport({ type: 'json', fileName: result.fileName, date: new Date() });
      return result;
    } catch (err) {
      console.error('Erreur export JSON:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setExporting(false);
      setExportType(null);
    }
  }, [exporting, loadUserData]);

  /**
   * Export CSV
   */
  const exportToCSV = useCallback(async (options = {}) => {
    if (exporting) return { success: false, error: 'Export en cours' };

    setExporting(true);
    setExportType('csv');
    setError(null);

    try {
      const userData = await loadUserData();
      if (!userData) {
        throw new Error('Impossible de charger les donnees utilisateur');
      }

      const result = exportService.exportToCSV(userData, options);
      setLastExport({ type: 'csv', fileName: result.fileName, date: new Date() });
      return result;
    } catch (err) {
      console.error('Erreur export CSV:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setExporting(false);
      setExportType(null);
    }
  }, [exporting, loadUserData]);

  return {
    // Etats
    exporting,
    exportType,
    error,
    lastExport,

    // Actions
    exportToPDF,
    exportToExcel,
    exportToJSON,
    exportToCSV
  };
};

/**
 * Helper pour obtenir le rang depuis le niveau
 */
function getRankFromLevel(level) {
  if (level >= 50) return 'Legende';
  if (level >= 40) return 'Grand Maitre';
  if (level >= 30) return 'Maitre';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Veteran';
  if (level >= 10) return 'Aventurier';
  if (level >= 5) return 'Apprenti';
  return 'Debutant';
}

export default useExport;
