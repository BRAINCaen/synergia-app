// ==========================================
// 📁 react-app/src/pages/PlanningAdvancedPage.jsx  
// PAGE PLANNING AVANCÉE - SYNCHRONISATION COMPLÈTE HR SETTINGS
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

// Auth
import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 FIREBASE
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

/**
 * 📅 PAGE PLANNING AVANCÉE TYPE SKELLO
 * ✅ SYNCHRONISATION COMPLÈTE AVEC HR_SETTINGS :
 * - Postes de travail
 * - Types d'absence (Congés, Maladie, Formation, RTT...)
 * - Règles et alertes de conformité
 * - Convention collective
 */
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
  
  // 🆕 PARAMÈTRES RH COMPLETS
  const [hrSettings, setHrSettings] = useState({
    positions: [],      // Postes de travail
    absences: [],       // Types d'absence
    rules: {},          // Règles (pauses, convention, etc.)
    alerts: [],         // Alertes de conformité
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

  // ==========================================
  // 🔄 CHARGEMENT INITIAL
  // ==========================================

  useEffect(() => {
    loadHRSettings();
  }, []);

  useEffect(() => {
    if (hrSettings.loaded) {
      loadPlanningData();
    }
  }, [currentWeek, hrSettings.loaded]);

  /**
   * 🆕 CHARGER TOUS LES PARAMÈTRES RH (Postes + Absences + Règles + Alertes)
   */
  const loadHRSettings = async () => {
    try {
      console.log('📋 Chargement COMPLET des paramètres RH depuis Firebase...');
      
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
        
        // 🎯 AFFICHAGE DÉTAILLÉ
        if (data.positions && data.positions.length > 0) {
          console.log('📌 Postes de travail:', data.positions.map(p => p.name));
        }
        
        if (data.absences && data.absences.length > 0) {
          console.log('🏖️ Types d\'absence:', data.absences.filter(a => a.active).map(a => a.name));
        }
        
        setHrSettings({
          positions: data.positions || [],
          absences: (data.absences || []).filter(a => a.active), // Seulement les absences actives
          rules: data.rules || {
            conventionCollective: 'IDCC 1790',
            workHoursBeforeBreak: 6,
            breakDuration: 20,
            chargesRate: 43
          },
          alerts: data.alerts || [],
          loaded: true
        });
        
        console.log('🎉 Synchronisation HR complète réussie !');
        
      } else {
        console.warn('⚠️ Aucun paramètre RH trouvé - Valeurs par défaut');
        
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
      console.error('❌ Erreur chargement paramètres RH:', error);
      
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

      console.log('📅 Chargement planning pour la semaine:', {
        debut: weekStart.toISOString().split('T')[0],
        fin: weekEnd.toISOString().split('T')[0]
      });

      const dates = planningEnrichedService.getWeekDates(weekStart.toISOString().split('T')[0]);
      setWeekDates(dates);

      const analysis = frenchCalendarService.analyzeWeekForPlanning(dates);
      setWeekAnalysis(analysis);

      const employeesList = await planningEnrichedService.getAllEmployees();
      setEmployees(employeesList);
      console.log(`👥 ${employeesList.length} employés chargés`);

      const shiftsList = await planningEnrichedService.getShifts({
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });
      setShifts(shiftsList);
      console.log(`📋 ${shiftsList.length} shifts trouvés pour cette semaine`);

      if (shiftsList.length === 0) {
        console.warn('⚠️ Aucun shift trouvé pour cette semaine !');
      }

      const weekStats = await planningEnrichedService.getStats(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      );
      setStats(weekStats);

      const hoursComparison = await planningEnrichedService.getAllEmployeesWeeklyHours(
        weekStart.toISOString().split('T')[0]
      );
      setWeeklyHoursComparison(hoursComparison);

      console.log('✅ Planning chargé avec succès');
    } catch (error) {
      console.error('❌ Erreur chargement planning:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🆕 DIAGNOSTIC SHIFTS
  // ==========================================

  const loadAllShifts = async () => {
    try {
      setDiagnosticLoading(true);
      
      console.log('🔍 Chargement de TOUS les shifts...');
      
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
      
      console.log(`✅ ${allShiftsData.length} shifts trouvés dans la base`);
      
      if (allShiftsData.length > 0) {
        console.log('📊 Répartition:', {
          premier: allShiftsData[0].date,
          dernier: allShiftsData[allShiftsData.length - 1].date,
          employés: [...new Set(allShiftsData.map(s => s.employeeId))].length
        });
      }
      
      setShowDiagnostic(true);
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      alert('Erreur lors du diagnostic');
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
  // 📅 NAVIGATION SEMAINE
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
  // 🆕 VÉRIFICATION DE CONFORMITÉ
  // ==========================================

  const checkShiftCompliance = (shiftData, employeeId, date) => {
    const alerts = [];
    
    // Ne vérifier la conformité QUE pour les shifts de travail, PAS pour les absences
    if (shiftData.isAbsence) {
      return alerts; // Les absences ne déclenchent pas d'alertes de conformité
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
      !s.isAbsence // Ne compter QUE les shifts de travail
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
                message: `💡 Pause obligatoire : ce shift nécessite une pause de ${alert.value || 20} minutes`,
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
  // 🆕 HELPERS POUR POSTES & ABSENCES
  // ==========================================

  /**
   * Obtenir tous les types disponibles (postes + absences)
   */
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

  /**
   * Couleur par défaut pour les absences
   */
  const getAbsenceColor = (absenceId) => {
    const colors = {
      paid_leave: '#F59E0B',      // Orange pour congés payés
      unpaid_leave: '#6B7280',    // Gris pour congés sans solde
      sickness: '#EF4444',        // Rouge pour maladie
      work_accident: '#DC2626',   // Rouge foncé pour accident
      maternity: '#EC4899',       // Rose pour maternité
      paternity: '#3B82F6',       // Bleu pour paternité
      training: '#8B5CF6',        // Violet pour formation
      rtt: '#10B981',             // Vert pour RTT
      compensatory: '#14B8A6'     // Turquoise pour repos compensateur
    };
    return colors[absenceId] || '#6B7280';
  };

  /**
   * Trouver un type de shift par nom
   */
  const findShiftType = (name) => {
    return getAllShiftTypes().find(t => t.name === name);
  };

  // ==========================================
  // ➕ CRÉATION DE SHIFT
  // ==========================================

  const openAddShiftModal = (employeeId, date) => {
    setSelectedCell({ employeeId, date });
    
    // Premier type disponible par défaut
    const allTypes = getAllShiftTypes();
    const defaultType = allTypes[0] || { name: 'Non défini', color: '#8B5CF6', isAbsence: false };
    
    console.log('🆕 Modal création - Types disponibles:', allTypes.length);
    console.log('📌 Postes:', hrSettings.positions.map(p => p.name));
    console.log('🏖️ Absences:', hrSettings.absences.map(a => a.name));
    
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

    const blockingAlerts = complianceAlerts.filter(a => a.blocking);
    if (blockingAlerts.length > 0) {
      const confirmCreate = confirm(
        `⚠️ ALERTES BLOQUANTES :\n\n${blockingAlerts.map(a => a.message).join('\n')}\n\nCréer quand même ?`
      );
      if (!confirmCreate) return;
    }

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

      console.log('📝 Création shift:', shiftData);

      await planningEnrichedService.createShift(shiftData);
      showNotification('✅ Shift créé avec succès', 'success');
      closeAddShiftModal();
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      showNotification('❌ Erreur lors de la création', 'error');
    }
  };

  // ==========================================
  // ✏️ ÉDITION DE SHIFT
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

    const blockingAlerts = complianceAlerts.filter(a => a.blocking);
    if (blockingAlerts.length > 0) {
      const confirmUpdate = confirm(
        `⚠️ ALERTES BLOQUANTES :\n\n${blockingAlerts.map(a => a.message).join('\n')}\n\nModifier quand même ?`
      );
      if (!confirmUpdate) return;
    }

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
      showNotification('❌ Erreur lors de la modification', 'error');
    }
  };
  
  /**
   * 🆕 Handler changement de poste/absence
   */
  const handleShiftTypeChange = (typeName) => {
    const shiftType = findShiftType(typeName);
    
    if (shiftType) {
      console.log('🎨 Changement type:', typeName, '→ Absence:', shiftType.isAbsence);
      
      setNewShift({
        ...newShift,
        position: typeName,
        color: shiftType.color,
        isAbsence: shiftType.isAbsence,
        // Pour les absences, mettre journée complète par défaut
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
  // 🎨 DRAG & DROP
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
      showNotification('✅ Shift collé', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur copie:', error);
      showNotification('❌ Erreur lors de la copie', 'error');
    }
  };

  // ==========================================
  // 🗑️ SUPPRIMER SHIFT
  // ==========================================

  const deleteShift = async (shiftId) => {
    if (!confirm('Supprimer ce shift ?')) return;
    
    try {
      await planningEnrichedService.deleteShift(shiftId);
      showNotification('✅ Shift supprimé', 'success');
      await loadPlanningData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('❌ Erreur lors de la suppression', 'error');
    }
  };

  // ==========================================
  // 📊 EXPORTS
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
      showNotification('❌ Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportMonthlyPDF = async () => {
    try {
      setExporting(true);
      showNotification('📄 Génération PDF mensuel...', 'info');

      const monthStart = new Date(currentWeek);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const monthShifts = await planningEnrichedService.getShifts({
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      });

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
      console.error('❌ Erreur export:', error);
      showNotification('❌ Erreur lors de l\'export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const duplicateWeek = async () => {
    if (!confirm('Dupliquer cette semaine sur la suivante ?')) return;
    
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
  // 🎨 UTILITAIRES
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
  // 🎨 RENDER LOADING
  // ==========================================

  if (loading || !hrSettings.loaded) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement planning + paramètres RH...</p>
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
                  Gestion avancée - Zone Normandie
                </p>
                {hrSettings.rules.conventionCollective && (
                  <p className="text-xs text-gray-500 mt-1">
                    📋 {hrSettings.rules.conventionCollective}
                  </p>
                )}
                {/* 🆕 STATUT SYNCHRONISATION */}
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
                  {hrSettings.alerts.length > 0 && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      ✅ {hrSettings.alerts.filter(a => a.active).length} alerte(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
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
                  Export Hebdo
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

          {/* MODAL DIAGNOSTIC - Contenu tronqué pour la limite de caractères... */}
          {/* Voir la version complète dans le fichier fourni précédemment */}

          {/* Le reste du code (statistiques, navigation, table, modals...) reste identique */}
          {/* Je vais te fournir la suite dans le prochain message si tu veux le fichier COMPLET */}

        </div>
      </div>
    </Layout>
  );
};

export default PlanningAdvancedPage;
