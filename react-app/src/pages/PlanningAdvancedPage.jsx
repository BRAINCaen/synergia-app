// ==========================================
// 📁 react-app/src/pages/PlanningAdvancedPage.jsx
// PAGE PLANNING AVANCÉE TYPE SKELLO AVEC CALENDRIER FRANÇAIS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Clipboard,
  RefreshCw,
  Download,
  Clock,
  Users,
  Filter,
  Search,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Printer,
  Upload,
  AlertTriangle
} from 'lucide-react';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Services
import planningEnrichedService from '../core/services/planningEnrichedService.js';
import planningExportService from '../core/services/planningExportService.js';
import frenchCalendarService from '../core/services/frenchCalendarService.js';

// Auth
import { useAuthStore } from '../shared/stores/authStore.js';

// Composants UI
const GlassCard = ({ children, className = '' }) => (
  <motion.div
    className={`
      relative bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50
      shadow-2xl shadow-purple-500/10 p-6 ${className}
    `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

/**
 * 📅 PAGE PLANNING AVANCÉE TYPE SKELLO
 */
const PlanningAdvancedPage = () => {
  const { user } = useAuthStore();

  // États principaux
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Navigation semaine
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  
  // Analyse calendrier
  const [weekAnalysis, setWeekAnalysis] = useState(null);
  
  // Drag & Drop
  const [draggedShift, setDraggedShift] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Copier-coller
  const [copiedShift, setCopiedShift] = useState(null);
  
  // Modals
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Compteurs heures contrat
  const [weeklyHoursComparison, setWeeklyHoursComparison] = useState([]);
  
  // Statistiques
  const [stats, setStats] = useState({
    totalHours: 0,
    shiftsCount: 0,
    employeesScheduled: 0,
    coverage: 0
  });
  
  // Filtres
  const [filterPosition, setFilterPosition] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Export
  const [exporting, setExporting] = useState(false);

  // ==========================================
  // 🔄 CHARGEMENT INITIAL
  // ==========================================

  useEffect(() => {
    loadPlanningData();
  }, [currentWeek]);

  const loadPlanningData = async () => {
    try {
      setLoading(true);

      // Calculer les dates de la semaine
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Générer les dates de la semaine
      const dates = planningEnrichedService.getWeekDates(weekStart.toISOString().split('T')[0]);
      setWeekDates(dates);

      // Analyser le calendrier pour la semaine
      const analysis = frenchCalendarService.analyzeWeekForPlanning(dates);
      setWeekAnalysis(analysis);
      console.log('📅 Analyse calendrier:', analysis);

      // Charger les employés
      const employeesList = await planningEnrichedService.getAllEmployees();
      setEmployees(employeesList);

      // Charger les shifts de la semaine
      const shiftsList = await planningEnrichedService.getShifts({
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });
      setShifts(shiftsList);

      // Calculer les statistiques
      const weekStats = await planningEnrichedService.getStats(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
      setStats(weekStats);

      // Calculer les compteurs heures contrat pour tous les employés
      const hoursComparison = await planningEnrichedService.getAllEmployeesWeeklyHours(
        weekStart.toISOString().split('T')[0]
      );
      setWeeklyHoursComparison(hoursComparison);

      console.log('✅ Planning chargé');
    } catch (error) {
      console.error('❌ Erreur chargement planning:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlanningData();
    setRefreshing(false);
  };

  // ==========================================
  // 📅 NAVIGATION SEMAINE
  // ==========================================

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    return new Date(d.setDate(diff));
  };

  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const formatWeekRange = () => {
    const start = getWeekStart(currentWeek);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  };

  // ==========================================
  // 🎨 DRAG & DROP - COPIE AUTOMATIQUE
  // ==========================================

  const handleDragStart = (e, shift) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedShift(shift);
    setIsDragging(true);
    console.log('🎯 Drag start (copie):', shift);
  };

  const handleDragEnd = () => {
    setDraggedShift(null);
    setDragOverCell(null);
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (employeeId, date) => {
    setDragOverCell({ employeeId, date });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e, employeeId, date) => {
    e.preventDefault();
    setDragOverCell(null);
    setIsDragging(false);
    
    if (!draggedShift) return;
    
    // Ne rien faire si on drop sur la même cellule
    if (draggedShift.employeeId === employeeId && draggedShift.date === date) {
      setDraggedShift(null);
      return;
    }
    
    try {
      // COPIER le shift au lieu de le déplacer
      await planningEnrichedService.copyShift(draggedShift.id, employeeId, date);
      
      // Notification succès
      showNotification('✅ Shift copié avec succès', 'success');
      
      // Rafraîchir les données
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur copie shift:', error);
      showNotification('❌ Erreur lors de la copie', 'error');
    }
    
    setDraggedShift(null);
  };

  // ==========================================
  // 📋 COPIER-COLLER
  // ==========================================

  const copyShift = (shift) => {
    setCopiedShift(shift);
    showNotification('📋 Shift copié', 'info');
  };

  const pasteShift = async (employeeId, date) => {
    if (!copiedShift) {
      showNotification('⚠️ Aucun shift copié', 'warning');
      return;
    }
    
    try {
      await planningEnrichedService.copyShift(copiedShift.id, employeeId, date);
      showNotification('✅ Shift collé avec succès', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur copie shift:', error);
      showNotification('❌ Erreur lors de la copie', 'error');
    }
  };

  // ==========================================
  // 🗑️ SUPPRIMER UN SHIFT
  // ==========================================

  const deleteShift = async (shiftId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce shift ?')) return;
    
    try {
      await planningEnrichedService.deleteShift(shiftId);
      showNotification('✅ Shift supprimé', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur suppression shift:', error);
      showNotification('❌ Erreur lors de la suppression', 'error');
    }
  };

  // ==========================================
  // 📊 EXPORTS
  // ==========================================

  const exportWeeklyPDF = async () => {
    try {
      setExporting(true);
      showNotification('📄 Génération du PDF...', 'info');

      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const exportData = {
        employees,
        shifts,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        stats
      };

      await planningExportService.generateWeeklyPDF(exportData);
      showNotification('✅ PDF hebdomadaire généré !', 'success');
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      showNotification('❌ Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportMonthlyPDF = async () => {
    try {
      setExporting(true);
      showNotification('📄 Génération du PDF mensuel...', 'info');

      const monthStart = new Date(currentWeek);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      // Charger les shifts du mois
      const monthShifts = await planningEnrichedService.getShifts({
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      });

      // Calculer les stats mensuelles
      const monthStats = await planningEnrichedService.getStats(
        monthStart.toISOString().split('T')[0],
        monthEnd.toISOString().split('T')[0]
      );

      const exportData = {
        employees,
        shifts: monthShifts,
        monthStart: monthStart.toISOString().split('T')[0],
        monthEnd: monthEnd.toISOString().split('T')[0],
        stats: {
          ...monthStats,
          avgDailyHours: (monthStats.totalHours / monthEnd.getDate()).toFixed(1),
          activeEmployees: monthStats.employeesScheduled
        }
      };

      await planningExportService.generateMonthlyPDF(exportData);
      showNotification('✅ PDF mensuel généré !', 'success');
    } catch (error) {
      console.error('❌ Erreur export PDF mensuel:', error);
      showNotification('❌ Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const duplicateWeek = async () => {
    if (!confirm('Dupliquer cette semaine sur la semaine suivante ?')) return;
    
    try {
      const weekStart = getWeekStart(currentWeek);
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      await planningEnrichedService.duplicateWeek(
        weekStart.toISOString().split('T')[0],
        nextWeekStart.toISOString().split('T')[0],
        user.uid
      );

      showNotification('✅ Semaine dupliquée !', 'success');
      
      // Aller à la semaine suivante
      nextWeek();
    } catch (error) {
      console.error('❌ Erreur duplication:', error);
      showNotification('❌ Erreur lors de la duplication', 'error');
    }
  };

  // ==========================================
  // 🔔 NOTIFICATIONS
  // ==========================================

  const showNotification = (message, type = 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-orange-500',
      info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // ==========================================
  // 🎨 UTILITAIRES VISUELS
  // ==========================================

  const getShiftForCell = (employeeId, date) => {
    return shifts.find(s => s.employeeId === employeeId && s.date === date);
  };

  const getDayName = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  const getDayNumber = (date) => {
    const d = new Date(date);
    return d.getDate();
  };

  const getHoursComparisonForEmployee = (employeeId) => {
    return weeklyHoursComparison.find(c => c.employeeId === employeeId) || {
      plannedHours: 0,
      contractHours: 35,
      difference: -35,
      percentage: 0
    };
  };

  const getDateAnalysis = (date) => {
    if (!weekAnalysis) return null;
    return weekAnalysis.dates.find(d => d.date === date);
  };

  const getDemandLevelColor = (level) => {
    const colors = {
      normal: 'bg-gray-600',
      medium: 'bg-blue-600',
      high: 'bg-orange-600',
      very_high: 'bg-red-600'
    };
    return colors[level] || colors.normal;
  };

  const getDemandLevelText = (level) => {
    const texts = {
      normal: 'Demande normale',
      medium: 'Demande moyenne',
      high: 'Forte demande',
      very_high: 'Très forte demande'
    };
    return texts[level] || texts.normal;
  };

  // ==========================================
  // 🎨 RENDER LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement du planning...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 🎨 RENDER PRINCIPAL
  // ==========================================

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-[1800px] mx-auto">

          {/* HEADER */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  📅 Planning Équipe
                </h1>
                <p className="text-gray-400">
                  Gestion avancée des shifts et horaires - Zone Normandie
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>

                <button
                  onClick={exportWeeklyPDF}
                  disabled={exporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export Hebdo PDF
                </button>

                <button
                  onClick={exportMonthlyPDF}
                  disabled={exporting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export Mensuel PDF
                </button>

                <button
                  onClick={duplicateWeek}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer Semaine
                </button>
              </div>
            </div>
          </div>

          {/* ALERTE DEMANDE FORTE */}
          {weekAnalysis && weekAnalysis.summary.hasHighDemand && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 ${getDemandLevelColor(weekAnalysis.summary.demandLevel)} rounded-2xl p-6 border-2 border-white/20`}
            >
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-white flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">
                    ⚠️ ATTENTION - {getDemandLevelText(weekAnalysis.summary.demandLevel).toUpperCase()}
                  </h3>
                  <div className="text-white/90 text-sm space-y-1">
                    {weekAnalysis.summary.totalHolidays > 0 && (
                      <p>🎊 {weekAnalysis.summary.totalHolidays} jour(s) férié(s) cette semaine</p>
                    )}
                    {weekAnalysis.summary.totalSchoolHolidays > 0 && (
                      <p>🏫 Vacances scolaires Zone Normandie</p>
                    )}
                    {weekAnalysis.summary.totalBridges > 0 && (
                      <p>🌉 {weekAnalysis.summary.totalBridges} pont(s) possible(s)</p>
                    )}
                    <p className="font-semibold mt-2">
                      👥 Pensez à prévoir du personnel supplémentaire !
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATISTIQUES SEMAINE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Heures</p>
                  <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Shifts Planifiés</p>
                  <p className="text-2xl font-bold text-white">{stats.shiftsCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Employés Planifiés</p>
                  <p className="text-2xl font-bold text-white">{stats.employeesScheduled}/{stats.totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Taux Couverture</p>
                  <p className="text-2xl font-bold text-white">{stats.coverage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-400" />
              </div>
            </GlassCard>
          </div>

          {/* NAVIGATION SEMAINE */}
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={previousWeek}
                  className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">Semaine en cours</p>
                  <p className="text-white font-semibold text-lg">{formatWeekRange()}</p>
                </div>

                <button
                  onClick={nextWeek}
                  className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              <button
                onClick={goToToday}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Comparer Planning/Badges
                </button>
              </div>
            </div>
          </GlassCard>

          {/* PLANNING TABLE */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-semibold sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10 min-w-[200px]">
                      Employé
                    </th>
                    {weekDates.map((date, index) => {
                      const dateAnalysis = getDateAnalysis(date);
                      const hasAlerts = dateAnalysis && dateAnalysis.alerts.length > 0;
                      
                      return (
                        <th key={date} className="text-center p-4 text-gray-400 font-semibold min-w-[150px] relative">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">{getDayName(date)}</div>
                            <div className="text-lg text-white mt-1">{getDayNumber(date)}</div>
                            
                            {/* BADGES JOURS SPÉCIAUX */}
                            {hasAlerts && (
                              <div className="mt-2 space-y-1">
                                {dateAnalysis.alerts.map((alert, idx) => (
                                  <div
                                    key={idx}
                                    className={`
                                      px-2 py-1 rounded text-xs font-semibold
                                      ${alert.color === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : ''}
                                      ${alert.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' : ''}
                                      ${alert.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : ''}
                                      ${alert.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' : ''}
                                    `}
                                    title={alert.message}
                                  >
                                    {alert.emoji}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="text-center p-4 text-gray-400 font-semibold min-w-[120px]">
                      Total/Contrat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => {
                    const hoursComparison = getHoursComparisonForEmployee(employee.id);
                    
                    return (
                      <tr key={employee.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        {/* COLONNE EMPLOYÉ */}
                        <td className="p-4 sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {employee.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{employee.name}</p>
                              <p className="text-gray-400 text-sm">{employee.position}</p>
                            </div>
                          </div>
                        </td>

                        {/* CELLULES SHIFTS */}
                        {weekDates.map(date => {
                          const shift = getShiftForCell(employee.id, date);
                          const isOver = dragOverCell?.employeeId === employee.id && dragOverCell?.date === date;
                          const dateAnalysis = getDateAnalysis(date);
                          const hasHighDemand = dateAnalysis && dateAnalysis.isSpecial;
                          
                          return (
                            <td 
                              key={date}
                              className={`p-2 transition-all ${
                                isOver ? 'bg-purple-500/20 border-2 border-purple-500' : ''
                              } ${
                                hasHighDemand ? 'bg-orange-500/5' : ''
                              }`}
                              onDragOver={handleDragOver}
                              onDragEnter={() => handleDragEnter(employee.id, date)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, employee.id, date)}
                              onDoubleClick={() => pasteShift(employee.id, date)}
                            >
                              {shift ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, shift)}
                                  onDragEnd={handleDragEnd}
                                  style={{ backgroundColor: shift.color || '#8B5CF6' }}
                                  className="rounded-lg p-3 cursor-move hover:opacity-80 transition-all group relative min-h-[80px]"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-1 text-white text-xs font-medium">
                                      <Clock className="w-3 h-3" />
                                      <span>{shift.startTime} - {shift.endTime}</span>
                                    </div>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyShift(shift);
                                        }}
                                        className="p-1 bg-white/20 hover:bg-white/40 rounded"
                                        title="Copier"
                                      >
                                        <Copy className="w-3 h-3 text-white" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteShift(shift.id);
                                        }}
                                        className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded"
                                        title="Supprimer"
                                      >
                                        <X className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="text-white text-xs opacity-90">
                                    {shift.position}
                                  </div>
                                  
                                  {shift.duration && (
                                    <div className="text-white text-xs font-semibold mt-1">
                                      {shift.duration}h
                                    </div>
                                  )}
                                </motion.div>
                              ) : (
                                <div className="min-h-[80px] flex items-center justify-center text-gray-600 hover:bg-gray-700/20 rounded-lg transition-colors cursor-pointer">
                                  <Plus className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* COLONNE COMPTEUR HEURES */}
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <div className="text-white font-semibold">
                              {hoursComparison.plannedHours}h / {hoursComparison.contractHours}h
                            </div>
                            <div className={`text-sm font-semibold flex items-center justify-center gap-1 ${
                              hoursComparison.difference > 0 ? 'text-green-400' : 
                              hoursComparison.difference < 0 ? 'text-orange-400' : 'text-gray-400'
                            }`}>
                              {hoursComparison.difference > 0 && <TrendingUp className="w-3 h-3" />}
                              {hoursComparison.difference < 0 && <TrendingDown className="w-3 h-3" />}
                              {hoursComparison.difference === 0 && <Minus className="w-3 h-3" />}
                              <span>
                                {hoursComparison.difference > 0 ? '+' : ''}
                                {hoursComparison.difference}h
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {hoursComparison.percentage}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* LÉGENDE */}
          <div className="mt-6">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">💡 Astuces :</p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• Glisser-déposer les shifts pour les COPIER vers une autre case</li>
                    <li>• Cliquer sur <Copy className="w-3 h-3 inline" /> pour copier un shift</li>
                    <li>• Double-cliquer sur une cellule vide pour coller</li>
                    <li>• Le compteur montre les heures planifiées vs contrat (35h par défaut)</li>
                  </ul>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-2">📅 Légende calendrier :</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
                      <span className="text-gray-400">Jour férié</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded"></div>
                      <span className="text-gray-400">Pont possible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                      <span className="text-gray-400">Vacances scolaires</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div>
                      <span className="text-gray-400">Week-end</span>
                    </div>
                  </div>
                </div>

                {copiedShift && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-4 py-2">
                    <p className="text-blue-300 text-sm flex items-center gap-2">
                      <Clipboard className="w-4 h-4" />
                      Shift copié : {copiedShift.startTime} - {copiedShift.endTime}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PlanningAdvancedPage;
