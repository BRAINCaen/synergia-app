// ==========================================
// 📁 hooks/useTimesheet.js
// HOOK - GESTION DES POINTAGES
// ==========================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../core/firebase.js';
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import timesheetExportService from '../core/services/timesheetExportService.js';

const useTimesheet = ({ employees, dateFilter = 'month', selectedUserId = 'all' }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calcul de la date de début selon le filtre
  const getStartDate = useCallback((filter) => {
    const startDate = new Date();

    switch (filter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
      default:
        return new Date(2020, 0, 1);
    }

    return startDate;
  }, []);

  // Charger les pointages avec listener temps réel
  useEffect(() => {
    setLoading(true);
    const startDate = getStartDate(dateFilter);

    const entriesQuery = query(
      collection(db, 'timeEntries'),
      where('date', '>=', startDate),
      orderBy('date', 'desc'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        const entries = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'deleted') {
            entries.push({
              id: doc.id,
              ...data,
              date: data.date?.toDate(),
              timestamp: data.timestamp?.toDate(),
              createdAt: data.createdAt?.toDate()
            });
          }
        });

        // Filtrer par utilisateur si nécessaire
        const filteredEntries = selectedUserId === 'all'
          ? entries
          : entries.filter(e => e.userId === selectedUserId);

        setTimeEntries(filteredEntries);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur chargement pointages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dateFilter, selectedUserId, getStartDate]);

  // Supprimer un pointage (soft delete)
  const deleteEntry = useCallback(async (entryId) => {
    try {
      const entryRef = doc(db, 'timeEntries', entryId);
      await updateDoc(entryRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Grouper les entrées par jour
  const groupedEntries = useMemo(() => {
    const groups = {};
    timeEntries.forEach(entry => {
      const dayKey = entry.date?.toDateString() || 'Unknown';
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(entry);
    });
    return groups;
  }, [timeEntries]);

  // Calculer le temps total par jour
  const calculateDayTotal = useCallback((entries) => {
    let totalSeconds = 0;
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sorted.length; i += 2) {
      const arrival = sorted[i];
      const departure = sorted[i + 1];

      if (arrival?.type === 'arrival' && departure?.type === 'departure') {
        totalSeconds += Math.floor((departure.timestamp - arrival.timestamp) / 1000);
      }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }, []);

  // Formater l'heure
  const formatHour = useCallback((date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Obtenir le nom de l'employé
  const getEmployeeName = useCallback((userId) => {
    const emp = employees?.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Utilisateur inconnu';
  }, [employees]);

  // Export Excel
  const exportToExcel = useCallback(async (year, month, employeeId, companyName = 'Synergia') => {
    try {
      const result = await timesheetExportService.exportMonthlyTimesheet(
        year,
        month,
        {
          employeeId: employeeId === 'all' ? null : employeeId,
          companyName
        }
      );
      return { success: result.success, fileName: result.fileName };
    } catch (error) {
      console.error('Erreur export:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const arrivals = timeEntries.filter(e => e.type === 'arrival').length;
    const departures = timeEntries.filter(e => e.type === 'departure').length;
    const daysWorked = Object.keys(groupedEntries).length;

    return {
      totalEntries: timeEntries.length,
      arrivals,
      departures,
      daysWorked
    };
  }, [timeEntries, groupedEntries]);

  return {
    // État
    timeEntries,
    loading,
    groupedEntries,
    stats,

    // Utilitaires
    calculateDayTotal,
    formatHour,
    getEmployeeName,

    // Actions
    deleteEntry,
    exportToExcel
  };
};

export default useTimesheet;
