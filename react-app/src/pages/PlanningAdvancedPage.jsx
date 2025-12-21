// ==========================================
// 📁 react-app/src/pages/PlanningAdvancedPage.jsx  
// PAGE PLANNING AVANCÉE COMPLÈTE - SANS POPUPS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Edit,
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
  AlertTriangle,
  Eye,
  Database
} from 'lucide-react';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Services
import planningEnrichedService from '../core/services/planningEnrichedService.js';
import planningExportService from '../core/services/planningExportService.js';
import frenchCalendarService from '../core/services/frenchCalendarService.js';
import { pointageAnomalyService, ANOMALY_CONFIG, ANOMALY_TYPES } from '../core/services/pointageAnomalyService.js';

// Auth
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

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

const PlanningAdvancedPage = () => {
  const { user } = useAuthStore();

  // États principaux
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Diagnostic
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [allShifts, setAllShifts] = useState([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  
  // PARAMÈTRES RH COMPLETS
  const [hrSettings, setHrSettings] = useState({
    positions: [],
    absences: [],
    rules: {},
    alerts: [],
    loaded: false
  });
  
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
  const [editingShift, setEditingShift] = useState(null);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Formulaire nouveau shift
  const [newShift, setNewShift] = useState({
    startTime: '09:00',
    endTime: '17:00',
    position: '',
    color: '#8B5CF6',
    notes: '',
    isAbsence: false
  });
  
  // Alertes de conformité
  const [complianceAlerts, setComplianceAlerts] = useState([]);
  
  // Compteurs heures contrat
  const [weeklyHoursComparison, setWeeklyHoursComparison] = useState([]);
  
  // Statistiques
  const [stats, setStats] = useState({
    totalHours: 0,
    shiftsCount: 0,
    employeesScheduled: 0,
    coverage: 0
  });
  
  // Export
  const [exporting, setExporting] = useState(false);

  // 🔍 ANOMALIES POINTAGE
  const [shiftAnomalies, setShiftAnomalies] = useState({});
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================

  useEffect(() => {
    loadHRSettings();
  }, []);

  useEffect(() => {
    if (hrSettings.loaded) {
      loadPlanningData();
    }
  }, [currentWeek, hrSettings.loaded]);

  const loadHRSettings = async () => {
    try {
      console.log('📋 Chargement COMPLET des paramètres RH...');
      
      const settingsRef = doc(db, 'hr_settings', 'main');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        
        console.log('✅ Paramètres RH trouvés:', {
          positionsCount: data.positions?.length || 0,
          absencesCount: data.absences?.length || 0,
          rulesPresent: !!data.rules,
          alertsCount: data.alerts?.length || 0
        });
        
        if (data.positions && data.positions.length > 0) {
          console.log('📌 Postes:', data.positions.map(p => p.name));
        }
        
        if (data.absences && data.absences.length > 0) {
          console.log('🏖️ Absences:', data.absences.filter(a => a.active).map(a => a.name));
        }
        
        setHrSettings({
          positions: data.positions || [],
          absences: (data.absences || []).filter(a => a.active),
          rules: data.rules || {
            conventionCollective: 'IDCC 1790',
            workHoursBeforeBreak: 6,
            breakDuration: 20,
            chargesRate: 43
          },
          alerts: data.alerts || [],
          loaded: true
        });
        
        console.log('🎉 Synchronisation HR complète !');
        
      } else {
        console.warn('⚠️ Aucun paramètre RH - Valeurs par défaut');
        
        setHrSettings({
          positions: [
            { id: 'game_master', name: 'Game master', color: '#8B5CF6', breakTime: 20 }
          ],
          absences: [],
          rules: {
            conventionCollective: 'IDCC 1790',
            workHoursBeforeBreak: 6,
            breakDuration: 20,
            chargesRate: 43
          },
          alerts: [],
          loaded: true
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement HR:', error);
      
      setHrSettings({
        positions: [{ id: 'game_master', name: 'Game master', color: '#8B5CF6', breakTime: 20 }],
        absences: [],
        rules: {},
        alerts: [],
        loaded: true
      });
    }
  };

  const loadPlanningData = async () => {
    try {
      setLoading(true);

      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const dates = planningEnrichedService.getWeekDates(weekStart.toISOString().split('T')[0]);
      setWeekDates(dates);

      const analysis = frenchCalendarService.analyzeWeekForPlanning(dates);
      setWeekAnalysis(analysis);

      const employeesList = await planningEnrichedService.getAllEmployees();
      setEmployees(employeesList);

      const shiftsList = await planningEnrichedService.getShifts({
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });
      setShifts(shiftsList);

      const weekStats = await planningEnrichedService.getStats(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
      setStats(weekStats);

      const hoursComparison = await planningEnrichedService.getAllEmployeesWeeklyHours(
        weekStart.toISOString().split('T')[0]
      );
      setWeeklyHoursComparison(hoursComparison);

      console.log('✅ Planning chargé');

      // 🔍 Charger les anomalies de pointage
      await loadPointageAnomalies(shiftsList, weekStart, weekEnd);

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHARGEMENT ANOMALIES POINTAGE
  // ==========================================

  const loadPointageAnomalies = async (shiftsList, weekStart, weekEnd) => {
    try {
      setLoadingAnomalies(true);
      console.log('🔍 Analyse anomalies pointage...');

      const anomalies = await pointageAnomalyService.analyzeWeeklyAnomalies(
        shiftsList,
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );

      setShiftAnomalies(anomalies);
      console.log('✅ Anomalies analysées:', Object.keys(anomalies).length, 'shifts analysés');

    } catch (error) {
      console.error('❌ Erreur analyse anomalies:', error);
      setShiftAnomalies({});
    } finally {
      setLoadingAnomalies(false);
    }
  };

  // Fonction pour récupérer les anomalies d'un shift
  const getShiftAnomalies = (shiftId) => {
    return shiftAnomalies[shiftId] || null;
  };

  // ==========================================
  // DIAGNOSTIC SHIFTS
  // ==========================================

  const loadAllShifts = async () => {
    try {
      setDiagnosticLoading(true);
      
      const shiftsQuery = query(collection(db, 'shifts'), orderBy('date', 'asc'));
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const allShiftsData = [];
      shiftsSnapshot.forEach((doc) => {
        allShiftsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAllShifts(allShiftsData);
      setShowDiagnostic(true);
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const goToShiftWeek = (shiftDate) => {
    const date = new Date(shiftDate);
    setCurrentWeek(date);
    setShowDiagnostic(false);
    showNotification(`📅 Navigation vers ${date.toLocaleDateString('fr-FR')}`, 'info');
  };

  // ==========================================
  // NAVIGATION SEMAINE
  // ==========================================

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
  // VÉRIFICATION CONFORMITÉ
  // ==========================================

  const checkShiftCompliance = (shiftData, employeeId, date) => {
    const alerts = [];
    
    if (shiftData.isAbsence) {
      return alerts;
    }
    
    if (!hrSettings.alerts || hrSettings.alerts.length === 0) {
      return alerts;
    }

    const weekStart = getWeekStart(new Date(date));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const employeeShifts = shifts.filter(s => 
      s.employeeId === employeeId &&
      new Date(s.date) >= weekStart &&
      new Date(s.date) <= weekEnd &&
      !s.isAbsence
    );

    hrSettings.alerts.forEach(alert => {
      if (!alert.active) return;

      switch (alert.id) {
        case 'daily_hours':
          const dailyShifts = shifts.filter(s => s.employeeId === employeeId && s.date === date && !s.isAbsence);
          const dailyHours = dailyShifts.reduce((sum, s) => sum + (s.duration || 0), 0);
          const newDuration = calculateDuration(shiftData.startTime, shiftData.endTime);
          
          if (dailyHours + newDuration > (alert.value || 10)) {
            alerts.push({
              type: 'error',
              message: `⚠️ Dépassement durée journalière : ${(dailyHours + newDuration).toFixed(1)}h / ${alert.value}h max`,
              blocking: alert.blocking
            });
          }
          break;

        case 'break':
          const duration = calculateDuration(shiftData.startTime, shiftData.endTime);
          const requiredBreak = hrSettings.rules.workHoursBeforeBreak || 6;
          
          if (duration >= requiredBreak) {
            const position = hrSettings.positions.find(p => p.name === shiftData.position);
            if (!position || position.breakTime < (alert.value || 20)) {
              alerts.push({
                type: 'warning',
                message: `💡 Pause obligatoire : ${alert.value || 20} minutes`,
                blocking: false
              });
            }
          }
          break;

        case 'weekly_hours':
          const weeklyHours = employeeShifts.reduce((sum, s) => sum + (s.duration || 0), 0);
          const newShiftDuration = calculateDuration(shiftData.startTime, shiftData.endTime);
          
          if (weeklyHours + newShiftDuration > (alert.value || 48)) {
            alerts.push({
              type: 'error',
              message: `⚠️ Dépassement heures hebdomadaires : ${(weeklyHours + newShiftDuration).toFixed(1)}h / ${alert.value}h max`,
              blocking: alert.blocking
            });
          }
          break;
      }
    });

    return alerts;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM - startH * 60 - startM) / 60;
  };

  // ==========================================
  // HELPERS POSTES & ABSENCES
  // ==========================================

  const getAllShiftTypes = () => {
    return [
      ...hrSettings.positions.map(p => ({ ...p, isAbsence: false })),
      ...hrSettings.absences.map(a => ({ 
        id: a.id, 
        name: a.name, 
        color: getAbsenceColor(a.id),
        breakTime: 0,
        isAbsence: true 
      }))
    ];
  };

  const getAbsenceColor = (absenceId) => {
    const colors = {
      paid_leave: '#F59E0B',
      unpaid_leave: '#6B7280',
      sickness: '#EF4444',
      work_accident: '#DC2626',
      maternity: '#EC4899',
      paternity: '#3B82F6',
      training: '#8B5CF6',
      rtt: '#10B981',
      compensatory: '#14B8A6'
    };
    return colors[absenceId] || '#6B7280';
  };

  const findShiftType = (name) => {
    return getAllShiftTypes().find(t => t.name === name);
  };

  // ==========================================
  // CRÉATION SHIFT
  // ==========================================

  const openAddShiftModal = (employeeId, date) => {
    setSelectedCell({ employeeId, date });
    
    const allTypes = getAllShiftTypes();
    const defaultType = allTypes[0] || { name: 'Non défini', color: '#8B5CF6', isAbsence: false };
    
    setNewShift({
      startTime: defaultType.isAbsence ? '00:00' : '09:00',
      endTime: defaultType.isAbsence ? '23:59' : '17:00',
      position: defaultType.name,
      color: defaultType.color,
      notes: '',
      isAbsence: defaultType.isAbsence
    });
    
    const alerts = checkShiftCompliance(
      { 
        startTime: '09:00', 
        endTime: '17:00', 
        position: defaultType.name,
        isAbsence: defaultType.isAbsence
      },
      employeeId,
      date
    );
    setComplianceAlerts(alerts);
    
    setShowAddShiftModal(true);
  };

  const closeAddShiftModal = () => {
    setShowAddShiftModal(false);
    setSelectedCell(null);
    setComplianceAlerts([]);
  };

  const handleCreateShift = async () => {
    if (!selectedCell) return;

    try {
      const shiftData = {
        employeeId: selectedCell.employeeId,
        date: selectedCell.date,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        position: newShift.position,
        color: newShift.color,
        notes: newShift.notes,
        isAbsence: newShift.isAbsence,
        createdBy: user.uid
      };

      await planningEnrichedService.createShift(shiftData);
      showNotification('✅ Shift créé', 'success');
      closeAddShiftModal();
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      showNotification('❌ Erreur création', 'error');
    }
  };

  // ==========================================
  // ÉDITION SHIFT
  // ==========================================

  const openEditShiftModal = (shift) => {
    setEditingShift(shift);
    setNewShift({
      startTime: shift.startTime,
      endTime: shift.endTime,
      position: shift.position,
      color: shift.color || '#8B5CF6',
      notes: shift.notes || '',
      isAbsence: shift.isAbsence || false
    });
    
    const alerts = checkShiftCompliance(
      { 
        startTime: shift.startTime, 
        endTime: shift.endTime, 
        position: shift.position,
        isAbsence: shift.isAbsence
      },
      shift.employeeId,
      shift.date
    );
    setComplianceAlerts(alerts);
    
    setShowEditShiftModal(true);
  };

  const closeEditShiftModal = () => {
    setShowEditShiftModal(false);
    setEditingShift(null);
    setComplianceAlerts([]);
  };

  const handleUpdateShift = async () => {
    if (!editingShift) return;

    try {
      const updateData = {
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        position: newShift.position,
        color: newShift.color,
        notes: newShift.notes,
        isAbsence: newShift.isAbsence
      };

      await planningEnrichedService.updateShift(editingShift.id, updateData);
      showNotification('✅ Shift modifié', 'success');
      closeEditShiftModal();
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      showNotification('❌ Erreur modification', 'error');
    }
  };
  
  const handleShiftTypeChange = (typeName) => {
    const shiftType = findShiftType(typeName);
    
    if (shiftType) {
      setNewShift({
        ...newShift,
        position: typeName,
        color: shiftType.color,
        isAbsence: shiftType.isAbsence,
        startTime: shiftType.isAbsence ? '00:00' : newShift.startTime,
        endTime: shiftType.isAbsence ? '23:59' : newShift.endTime
      });
      
      if (selectedCell) {
        const alerts = checkShiftCompliance(
          { ...newShift, position: typeName, isAbsence: shiftType.isAbsence },
          selectedCell.employeeId,
          selectedCell.date
        );
        setComplianceAlerts(alerts);
      }
    }
  };
  
  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDragStart = (e, shift) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedShift(shift);
    setIsDragging(true);
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
    if (draggedShift.employeeId === employeeId && draggedShift.date === date) {
      setDraggedShift(null);
      return;
    }
    
    try {
      await planningEnrichedService.copyShift(draggedShift.id, employeeId, date);
      showNotification('✅ Shift copié', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur copie:', error);
      showNotification('❌ Erreur copie', 'error');
    }
    
    setDraggedShift(null);
  };

  // ==========================================
  // COPIER-COLLER
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
      showNotification('✅ Shift collé', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur copie:', error);
      showNotification('❌ Erreur copie', 'error');
    }
  };

  // ==========================================
  // SUPPRIMER SHIFT
  // ==========================================

  const deleteShift = async (shiftId) => {
    try {
      await planningEnrichedService.deleteShift(shiftId);
      showNotification('✅ Shift supprimé', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('❌ Erreur suppression', 'error');
    }
  };

  // ==========================================
  // EXPORTS
  // ==========================================

  const exportWeeklyPDF = async () => {
    try {
      setExporting(true);
      showNotification('📄 Génération PDF...', 'info');

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
      showNotification('✅ PDF généré !', 'success');
    } catch (error) {
      console.error('❌ Erreur export:', error);
      showNotification('❌ Erreur export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const duplicateWeek = async () => {
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
      nextWeek();
    } catch (error) {
      console.error('❌ Erreur duplication:', error);
      showNotification('❌ Erreur duplication', 'error');
    }
  };

  // ==========================================
  // NOTIFICATIONS
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
  // UTILITAIRES
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

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Employé';
  };

  // ==========================================
  // RENDER LOADING
  // ==========================================

  if (loading || !hrSettings.loaded) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement planning + RH...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // RENDER PRINCIPAL
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
                <p className="text-gray-400">Gestion avancée - Zone Normandie</p>
                {hrSettings.rules.conventionCollective && (
                  <p className="text-xs text-gray-500 mt-1">📋 {hrSettings.rules.conventionCollective}</p>
                )}
                <div className="flex gap-2 mt-2">
                  {hrSettings.positions.length > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      ✅ {hrSettings.positions.length} poste(s)
                    </span>
                  )}
                  {hrSettings.absences.length > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      ✅ {hrSettings.absences.length} absence(s)
                    </span>
                  )}
                  {hrSettings.alerts.filter(a => a.active).length > 0 && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      ✅ {hrSettings.alerts.filter(a => a.active).length} alerte(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Toggle Anomalies Pointage */}
                <button
                  onClick={() => setShowAnomalies(!showAnomalies)}
                  className={`${
                    showAnomalies
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  } text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2`}
                >
                  {loadingAnomalies ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">
                    {showAnomalies ? 'Anomalies ON' : 'Anomalies OFF'}
                  </span>
                </button>

                <button
                  onClick={loadAllShifts}
                  disabled={diagnosticLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {diagnosticLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Diagnostic
                    </>
                  )}
                </button>

                <button
                  onClick={() => loadPlanningData()}
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
                  Export PDF
                </button>

                <button
                  onClick={duplicateWeek}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
              </div>
            </div>
          </div>

          {/* MODAL DIAGNOSTIC */}
          <AnimatePresence>
            {showDiagnostic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowDiagnostic(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">🔍 Diagnostic Shifts</h2>
                      <p className="text-gray-400">{allShifts.length} shift(s) dans la base</p>
                    </div>
                    <button
                      onClick={() => setShowDiagnostic(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {allShifts.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <p className="text-white text-lg mb-2">Aucun shift dans la base</p>
                      <p className="text-gray-400">Créez votre premier shift !</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allShifts.map((shift) => {
                        const employee = employees.find(e => e.id === shift.employeeId);
                        return (
                          <div 
                            key={shift.id}
                            className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all cursor-pointer"
                            onClick={() => goToShiftWeek(shift.date)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: shift.color || '#8B5CF6' }}
                                />
                                <div>
                                  <p className="text-white font-semibold">
                                    {employee?.name || 'Employé'} - {shift.position}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    📅 {new Date(shift.date).toLocaleDateString('fr-FR', { 
                                      weekday: 'long', 
                                      day: 'numeric', 
                                      month: 'long', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">
                                  🕐 {shift.startTime} - {shift.endTime}
                                </p>
                                {shift.duration && (
                                  <p className="text-gray-400 text-sm">{shift.duration}h</p>
                                )}
                              </div>
                            </div>
                            {shift.notes && (
                              <p className="text-gray-400 text-sm mt-2 ml-7">📝 {shift.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      💡 Cliquez sur un shift pour naviguer vers sa semaine
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ALERTE AUCUN SHIFT */}
          {shifts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-orange-500/20 rounded-2xl p-6 border-2 border-orange-500/50"
            >
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">⚠️ Aucun shift cette semaine</h3>
                  <p className="text-orange-200">
                    Utilisez "Diagnostic" pour voir tous vos shifts existants.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

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
                    ⚠️ {getDemandLevelText(weekAnalysis.summary.demandLevel).toUpperCase()}
                  </h3>
                  <div className="text-white/90 text-sm space-y-1">
                    {weekAnalysis.summary.totalHolidays > 0 && (
                      <p>🎊 {weekAnalysis.summary.totalHolidays} jour(s) férié(s)</p>
                    )}
                    {weekAnalysis.summary.totalSchoolHolidays > 0 && (
                      <p>🏫 Vacances scolaires Zone Normandie</p>
                    )}
                    {weekAnalysis.summary.totalBridges > 0 && (
                      <p>🌉 {weekAnalysis.summary.totalBridges} pont(s)</p>
                    )}
                    <p className="font-semibold mt-2">👥 Prévoir personnel supplémentaire !</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATISTIQUES */}
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
                  <p className="text-gray-400 text-sm mb-1">Shifts</p>
                  <p className="text-2xl font-bold text-white">{stats.shiftsCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Employés</p>
                  <p className="text-2xl font-bold text-white">{stats.employeesScheduled}/{employees.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Couverture</p>
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
            </div>
          </GlassCard>

          {/* MODAL CRÉATION SHIFT */}
          <AnimatePresence>
            {showAddShiftModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeAddShiftModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">➕ Nouveau Shift</h2>
                    <button
                      onClick={closeAddShiftModal}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {selectedCell && (
                    <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/50">
                      <p className="text-purple-300 text-sm">
                        <strong>{getEmployeeName(selectedCell.employeeId)}</strong> - {new Date(selectedCell.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  )}

                  {complianceAlerts.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {complianceAlerts.map((alert, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            alert.type === 'error' ? 'bg-red-500/10 border-red-500/50' : 'bg-yellow-500/10 border-yellow-500/50'
                          }`}
                        >
                          <p className={`text-sm ${
                            alert.type === 'error' ? 'text-red-300' : 'text-yellow-300'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Heure début</label>
                        <input
                          type="time"
                          value={newShift.startTime}
                          onChange={(e) => {
                            setNewShift({ ...newShift, startTime: e.target.value });
                            if (selectedCell) {
                              const alerts = checkShiftCompliance(
                                { ...newShift, startTime: e.target.value },
                                selectedCell.employeeId,
                                selectedCell.date
                              );
                              setComplianceAlerts(alerts);
                            }
                          }}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Heure fin</label>
                        <input
                          type="time"
                          value={newShift.endTime}
                          onChange={(e) => {
                            setNewShift({ ...newShift, endTime: e.target.value });
                            if (selectedCell) {
                              const alerts = checkShiftCompliance(
                                { ...newShift, endTime: e.target.value },
                                selectedCell.employeeId,
                                selectedCell.date
                              );
                              setComplianceAlerts(alerts);
                            }
                          }}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Poste / Absence</label>
                      {getAllShiftTypes().length > 0 ? (
                        <select
                          value={newShift.position}
                          onChange={(e) => handleShiftTypeChange(e.target.value)}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                        >
                          {getAllShiftTypes().map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.isAbsence ? '🏖️ ' : '📌 '}{type.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-red-400 text-sm">⚠️ Aucun poste configuré dans HR Settings</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Couleur</label>
                      <div 
                        className="w-full h-10 rounded-lg border-2 border-gray-600"
                        style={{ backgroundColor: newShift.color }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Notes (optionnel)</label>
                      <textarea
                        value={newShift.notes}
                        onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                        placeholder="Ajouter une note..."
                        rows={3}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={closeAddShiftModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateShift}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Créer le shift
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODAL ÉDITION SHIFT */}
          <AnimatePresence>
            {showEditShiftModal && editingShift && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeEditShiftModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">✏️ Modifier Shift</h2>
                    <button
                      onClick={closeEditShiftModal}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                    <p className="text-blue-300 text-sm">
                      <strong>{getEmployeeName(editingShift.employeeId)}</strong> - {new Date(editingShift.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>

                  {complianceAlerts.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {complianceAlerts.map((alert, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            alert.type === 'error' ? 'bg-red-500/10 border-red-500/50' : 'bg-yellow-500/10 border-yellow-500/50'
                          }`}
                        >
                          <p className={`text-sm ${
                            alert.type === 'error' ? 'text-red-300' : 'text-yellow-300'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Heure début</label>
                        <input
                          type="time"
                          value={newShift.startTime}
                          onChange={(e) => {
                            setNewShift({ ...newShift, startTime: e.target.value });
                            const alerts = checkShiftCompliance(
                              { ...newShift, startTime: e.target.value },
                              editingShift.employeeId,
                              editingShift.date
                            );
                            setComplianceAlerts(alerts);
                          }}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Heure fin</label>
                        <input
                          type="time"
                          value={newShift.endTime}
                          onChange={(e) => {
                            setNewShift({ ...newShift, endTime: e.target.value });
                            const alerts = checkShiftCompliance(
                              { ...newShift, endTime: e.target.value },
                              editingShift.employeeId,
                              editingShift.date
                            );
                            setComplianceAlerts(alerts);
                          }}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Poste / Absence</label>
                      {getAllShiftTypes().length > 0 ? (
                        <select
                          value={newShift.position}
                          onChange={(e) => handleShiftTypeChange(e.target.value)}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                          {getAllShiftTypes().map((type) => (
                            <option key={type.id} value={type.name}>
                              {type.isAbsence ? '🏖️ ' : '📌 '}{type.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-red-400 text-sm">⚠️ Aucun poste configuré dans HR Settings</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Couleur</label>
                      <div 
                        className="w-full h-10 rounded-lg border-2 border-gray-600"
                        style={{ backgroundColor: newShift.color }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Notes (optionnel)</label>
                      <textarea
                        value={newShift.notes}
                        onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                        placeholder="Ajouter une note..."
                        rows={3}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={closeEditShiftModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdateShift}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Modifier le shift
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PLANNING TABLE */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-semibold sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10 min-w-[200px]">
                      Employé
                    </th>
                    {weekDates.map((date) => {
                      const dateAnalysis = getDateAnalysis(date);
                      const hasAlerts = dateAnalysis && dateAnalysis.alerts.length > 0;
                      
                      return (
                        <th key={date} className="text-center p-4 text-gray-400 font-semibold min-w-[150px]">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">{getDayName(date)}</div>
                            <div className="text-lg text-white mt-1">{getDayNumber(date)}</div>
                            
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
                        <td className="p-4 sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10">
                          <div className="flex items-center gap-3">
                            {employee.photoURL ? (
                              <img 
                                src={employee.photoURL} 
                                alt={employee.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {employee.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-white font-semibold">{employee.name}</p>
                              <p className="text-gray-400 text-sm">{employee.position}</p>
                            </div>
                          </div>
                        </td>

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
                                          openEditShiftModal(shift);
                                        }}
                                        className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded"
                                        title="Éditer"
                                      >
                                        <Edit className="w-3 h-3 text-white" />
                                      </button>
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

                                  {/* 🔍 ANOMALIES DE POINTAGE */}
                                  {showAnomalies && getShiftAnomalies(shift.id) && (
                                    <div className="mt-2 space-y-1">
                                      {getShiftAnomalies(shift.id).anomalies?.map((anomaly, idx) => (
                                        <div
                                          key={idx}
                                          className={`
                                            px-2 py-1 rounded text-[10px] font-bold
                                            flex items-center gap-1
                                            ${anomaly.bgColor} ${anomaly.textColor} ${anomaly.borderColor}
                                            border animate-pulse
                                          `}
                                          title={`${anomaly.label}: ${anomaly.message}`}
                                        >
                                          <span>{anomaly.icon}</span>
                                          <span>{anomaly.message}</span>
                                        </div>
                                      ))}

                                      {/* Résumé du temps travaillé */}
                                      {getShiftAnomalies(shift.id).summary && (
                                        <div className={`
                                          px-2 py-1 rounded text-[10px]
                                          ${getShiftAnomalies(shift.id).summary.diffMinutes > 0
                                            ? 'bg-blue-500/30 text-blue-200 border border-blue-500/40'
                                            : getShiftAnomalies(shift.id).summary.diffMinutes < 0
                                              ? 'bg-red-500/30 text-red-200 border border-red-500/40'
                                              : 'bg-green-500/30 text-green-200 border border-green-500/40'
                                          }
                                        `}>
                                          <span className="font-semibold">
                                            {getShiftAnomalies(shift.id).summary.diffFormatted}
                                          </span>
                                          <span className="opacity-75 ml-1">
                                            ({Math.floor(getShiftAnomalies(shift.id).summary.workedMinutes / 60)}h{String(getShiftAnomalies(shift.id).summary.workedMinutes % 60).padStart(2, '0')} travaillé)
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </motion.div>
                              ) : (
                                <div 
                                  onClick={() => openAddShiftModal(employee.id, date)}
                                  className="min-h-[80px] flex items-center justify-center text-gray-600 hover:bg-gray-700/20 hover:text-purple-400 rounded-lg transition-colors cursor-pointer group"
                                >
                                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </div>
                              )}
                            </td>
                          );
                        })}

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
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">💡 Astuces :</p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• Cliquer sur <Plus className="w-3 h-3 inline" /> pour créer un shift</li>
                    <li>• Glisser-déposer les shifts pour les COPIER</li>
                    <li>• Double-clic sur cellule vide pour coller</li>
                    <li>• Diagnostic pour voir TOUS les shifts</li>
                  </ul>
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

            {/* LÉGENDE ANOMALIES */}
            {showAnomalies && (
              <GlassCard>
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Légende Anomalies Pointage :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">⏰</span>
                    <span className="text-gray-400">Retard arrivée</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">🚪</span>
                    <span className="text-gray-400">Départ anticipé</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">⚡</span>
                    <span className="text-gray-400">Heures sup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">❌</span>
                    <span className="text-gray-400">Absent (pas de pointage)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">⚠️</span>
                    <span className="text-gray-400">Pointage manquant</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded">✨</span>
                    <span className="text-gray-400">Arrivée en avance</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  📊 Les pointages sont synchronisés depuis la page Pulse & Pointage
                </p>
              </GlassCard>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PlanningAdvancedPage;
