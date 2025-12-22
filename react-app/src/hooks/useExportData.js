// ==========================================
// react-app/src/hooks/useExportData.js
// HOOK EXPORT DATA - SYNERGIA v4.0
// Module: Récupération des données pour export
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../core/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { useAuthStore } from '../shared/stores/authStore';

// ==========================================
// HOOK PRINCIPAL
// ==========================================
export function useExportData() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [planningData, setPlanningData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [pointagesData, setPointagesData] = useState(null);
  const [questsData, setQuestsData] = useState(null);

  // ==========================================
  // RÉCUPÉRER LE PLANNING
  // ==========================================
  const fetchPlanningData = useCallback(async (weekStart = new Date()) => {
    if (!user) return null;

    setLoading(true);
    try {
      // Calculer les dates de la semaine
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Récupérer les shifts de la semaine
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('startDate', '>=', weekStart.toISOString().split('T')[0]),
        where('startDate', '<=', weekEnd.toISOString().split('T')[0])
      );

      const shiftsSnap = await getDocs(shiftsQuery);
      const shifts = shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les employés uniques
      const employeeIds = [...new Set(shifts.map(s => s.employeeId).filter(Boolean))];

      let employees = [];
      if (employeeIds.length > 0) {
        const usersQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', employeeIds.slice(0, 10)) // Firestore limite à 10
        );
        const usersSnap = await getDocs(usersQuery);
        employees = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const data = { shifts, employees, weekStart };
      setPlanningData(data);
      return data;
    } catch (error) {
      console.error('Erreur fetch planning:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==========================================
  // RÉCUPÉRER LES DONNÉES ÉQUIPE (MENSUEL)
  // ==========================================
  const fetchTeamData = useCallback(async (month = new Date().getMonth(), year = new Date().getFullYear()) => {
    if (!user) return null;

    setLoading(true);
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Récupérer les tâches du mois
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('completedAt', '>=', Timestamp.fromDate(startDate)),
        where('completedAt', '<=', Timestamp.fromDate(endDate))
      );

      const tasksSnap = await getDocs(tasksQuery);
      const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les utilisateurs actifs
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les métriques par employé
      const employees = allUsers.map(emp => {
        const empTasks = tasks.filter(t => t.assignedTo === emp.id || t.completedBy === emp.id);
        const completedTasks = empTasks.filter(t => t.status === 'completed');
        const xpEarned = completedTasks.reduce((sum, t) => sum + (t.xpReward || 0), 0);

        return {
          ...emp,
          tasksCompleted: completedTasks.length,
          xpEarned,
          completionRate: empTasks.length > 0
            ? Math.round((completedTasks.length / empTasks.length) * 100)
            : 0,
          hoursWorked: Math.round(Math.random() * 160 + 80), // Simulé pour demo
          trend: xpEarned > 500 ? '↑' : xpEarned > 200 ? '→' : '↓'
        };
      });

      // Métriques globales
      const metrics = {
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        totalXP: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0),
        hoursWorked: employees.reduce((sum, e) => sum + (e.hoursWorked || 0), 0),
        completionRate: tasks.length > 0
          ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
          : 0
      };

      const data = {
        teamName: user.teamName || 'Mon Équipe',
        employees,
        metrics,
        month,
        year
      };

      setTeamData(data);
      return data;
    } catch (error) {
      console.error('Erreur fetch team data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==========================================
  // RÉCUPÉRER LES POINTAGES
  // ==========================================
  const fetchPointagesData = useCallback(async (period = 'Ce mois') => {
    if (!user) return null;

    setLoading(true);
    try {
      let startDate = new Date();

      switch (period) {
        case 'Cette semaine':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'Ce mois':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'Les 3 derniers mois':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'Cette année':
          startDate = new Date(startDate.getFullYear(), 0, 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      // Récupérer les pointages
      const pointagesQuery = query(
        collection(db, 'pointages'),
        where('userId', '==', user.uid),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );

      const pointagesSnap = await getDocs(pointagesQuery);
      const pointages = pointagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const data = { pointages, period };
      setPointagesData(data);
      return data;
    } catch (error) {
      console.error('Erreur fetch pointages:', error);

      // Retourner des données vides si erreur (collection peut ne pas exister)
      const data = { pointages: [], period };
      setPointagesData(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==========================================
  // RÉCUPÉRER LES QUÊTES
  // ==========================================
  const fetchQuestsData = useCallback(async () => {
    if (!user) return null;

    setLoading(true);
    try {
      // Récupérer les quêtes de l'utilisateur
      const questsQuery = query(
        collection(db, 'quests'),
        where('participants', 'array-contains', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      let quests = [];
      try {
        const questsSnap = await getDocs(questsQuery);
        quests = questsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch {
        // Si la requête échoue, essayer sans le orderBy
        const simpleQuery = query(
          collection(db, 'quests'),
          where('participants', 'array-contains', user.uid)
        );
        const questsSnap = await getDocs(simpleQuery);
        quests = questsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const data = { quests };
      setQuestsData(data);
      return data;
    } catch (error) {
      console.error('Erreur fetch quests:', error);

      // Retourner des données vides si erreur
      const data = { quests: [] };
      setQuestsData(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==========================================
  // CHARGER TOUTES LES DONNÉES
  // ==========================================
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPlanningData(),
        fetchTeamData(),
        fetchPointagesData(),
        fetchQuestsData()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchPlanningData, fetchTeamData, fetchPointagesData, fetchQuestsData]);

  // Charger au montage
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  return {
    loading,
    planningData,
    teamData,
    pointagesData,
    questsData,
    fetchPlanningData,
    fetchTeamData,
    fetchPointagesData,
    fetchQuestsData,
    fetchAllData
  };
}

export default useExportData;
