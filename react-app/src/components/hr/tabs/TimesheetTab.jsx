// ==========================================
// 📁 components/hr/tabs/TimesheetTab.jsx
// ONGLET POINTAGE - AVEC HISTORIQUE COMPLET
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, RefreshCw } from 'lucide-react';
import { db } from '../../../core/firebase.js';
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';
import timesheetExportService from '../../../core/services/timesheetExportService.js';

// Sous-composants
import { TimesheetFilters, TimesheetDayGroup, TimesheetExportModal } from './timesheet';

const TimesheetTab = ({ timesheets, employees, onRefresh, currentUserId }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [dateFilter, setDateFilter] = useState('month');

  // États pour l'export Excel
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportEmployeeId, setExportEmployeeId] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Charger les pointages depuis Firebase
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        setLoadingEntries(true);

        const now = new Date();
        let startDate = new Date();

        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateFilter === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate = new Date(2020, 0, 1);
        }

        const entriesQuery = query(
          collection(db, 'timeEntries'),
          where('date', '>=', startDate),
          orderBy('date', 'desc'),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
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

          const filteredEntries = selectedUserId === 'all'
            ? entries
            : entries.filter(e => e.userId === selectedUserId);

          setTimeEntries(filteredEntries);
          setLoadingEntries(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur chargement pointages:', error);
        setLoadingEntries(false);
      }
    };

    loadTimeEntries();
  }, [dateFilter, selectedUserId]);

  // Supprimer un pointage
  const deleteTimeEntry = async (entryId) => {
    if (!confirm('Supprimer ce pointage ?')) return;
    try {
      const entryRef = doc(db, 'timeEntries', entryId);
      await updateDoc(entryRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Formater l'heure
  const formatHour = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

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
  const calculateDayTotal = (entries) => {
    let totalSeconds = 0;
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sorted.length; i += 2) {
      const arrival = sorted[i];
      const departure = sorted[i + 1];

      if (arrival?.type === 'arrival') {
        if (departure?.type === 'departure') {
          totalSeconds += Math.floor((departure.timestamp - arrival.timestamp) / 1000);
        }
      }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  // Obtenir le nom de l'employé
  const getEmployeeName = (userId) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Utilisateur inconnu';
  };

  // Fonction d'export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const result = await timesheetExportService.exportMonthlyTimesheet(
        exportYear,
        exportMonth,
        {
          employeeId: exportEmployeeId === 'all' ? null : exportEmployeeId,
          companyName: 'Synergia'
        }
      );

      if (result.success) {
        setShowExportModal(false);
        alert(`✅ Export réussi : ${result.fileName}`);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('❌ Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      key="timesheet"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Pointage & Badgeuse</h2>
            <p className="text-gray-400 text-sm sm:text-base">Historique complet des pointages</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
            <a
              href="/pulse"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Accès Badgeuse</span>
              <span className="sm:hidden">Badgeuse</span>
            </a>
            <button
              onClick={onRefresh}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <TimesheetFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          employees={employees}
        />

        {/* Contenu */}
        {loadingEntries ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des pointages...</p>
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Aucun pointage trouvé</p>
            <p className="text-gray-500 text-sm">Accédez à la badgeuse pour pointer vos heures</p>
            <a
              href="/pulse"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" />
              Aller à la Badgeuse
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([dayKey, dayEntries]) => (
              <TimesheetDayGroup
                key={dayKey}
                dayKey={dayKey}
                dayEntries={dayEntries}
                selectedUserId={selectedUserId}
                getEmployeeName={getEmployeeName}
                deleteTimeEntry={deleteTimeEntry}
                calculateDayTotal={calculateDayTotal}
                formatHour={formatHour}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Modal Export Excel */}
      <TimesheetExportModal
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        exportMonth={exportMonth}
        setExportMonth={setExportMonth}
        exportYear={exportYear}
        setExportYear={setExportYear}
        exportEmployeeId={exportEmployeeId}
        setExportEmployeeId={setExportEmployeeId}
        employees={employees}
        handleExportExcel={handleExportExcel}
        exporting={exporting}
      />
    </motion.div>
  );
};

export default TimesheetTab;
