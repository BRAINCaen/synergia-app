// ==========================================
// 📁 components/hr/tabs/TimesheetTab.jsx
// ONGLET POINTAGE - AVEC HISTORIQUE COMPLET
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calendar, RefreshCw, Download, X, UserCheck, UserX, FileText
} from 'lucide-react';
import { db } from '../../../firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';
import { timesheetExportService } from '../../../services/timesheetExportService';

// Mois en français
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TimesheetTab = ({ timesheets, employees, onRefresh, currentUserId }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [dateFilter, setDateFilter] = useState('month'); // 'today', 'week', 'month', 'all'

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

        // Calculer les dates de filtre
        const now = new Date();
        let startDate = new Date();

        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateFilter === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate = new Date(2020, 0, 1); // Tout l'historique
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

          // Filtrer par utilisateur si nécessaire
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

  // Générer les années disponibles (5 ans en arrière)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i <= 5; i++) {
    availableYears.push(currentYear - i);
  }

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
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Filtre par période */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="all">Tout l'historique</option>
          </select>

          {/* Filtre par employé */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          >
            <option value="all">Tous les employés</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

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
            {Object.entries(groupedEntries).map(([dayKey, dayEntries]) => {
              const dayDate = new Date(dayKey);
              const dayTotal = calculateDayTotal(dayEntries);

              return (
                <div key={dayKey} className="bg-gray-800/30 rounded-xl p-4">
                  {/* En-tête du jour */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-gray-400 text-sm">{dayEntries.length} pointage(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">{dayTotal}</p>
                      <p className="text-xs text-gray-400">Total journée</p>
                    </div>
                  </div>

                  {/* Liste des pointages du jour */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${entry.type === 'arrival' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {entry.type === 'arrival' ? (
                              <UserCheck className="w-4 h-4 text-green-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {entry.type === 'arrival' ? 'Arrivée' : 'Départ'}
                            </div>
                            {selectedUserId === 'all' && (
                              <div className="text-xs text-gray-400">
                                {getEmployeeName(entry.userId)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{formatHour(entry.timestamp)}</span>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Modal Export Excel */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Export des Pointages
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Info box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Export Excel complet</p>
                    <p className="text-gray-400">
                      Génère un fichier Excel modifiable avec les arrivées, départs, heures travaillées, congés et statistiques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mois */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Mois</label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {MONTHS_FR.map((month, index) => (
                      <option key={index} value={index} className="bg-slate-900">
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Année</label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year} className="bg-slate-900">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employé */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Employé</label>
                  <select
                    value={exportEmployeeId}
                    onChange={(e) => setExportEmployeeId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="all" className="bg-slate-900">Tous les employés</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-slate-900">
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Télécharger
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimesheetTab;
