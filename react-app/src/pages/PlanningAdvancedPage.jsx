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
  Database,
  Palmtree,
  CalendarDays,
  CheckCircle,
  XCircle,
  Send,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings2
} from 'lucide-react';

// Layout
import Layout from '../components/layout/Layout.jsx';
import UserAvatar from '../components/common/UserAvatar.jsx';

// Services
import planningEnrichedService from '../core/services/planningEnrichedService.js';
import planningExportService from '../core/services/planningExportService.js';
import frenchCalendarService from '../core/services/frenchCalendarService.js';
import { pointageAnomalyService, ANOMALY_CONFIG, ANOMALY_TYPES } from '../core/services/pointageAnomalyService.js';
import leaveRequestService, { LEAVE_TYPES, REQUEST_STATUS } from '../core/services/leaveRequestService.js';

// Auth
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Icône pour notes
import { StickyNote, Lightbulb, History, Save } from 'lucide-react';

// Composants Planning extraits
import {
  AddShiftModal,
  EditShiftModal,
  LeaveRequestModal,
  LeaveAdminPanel,
  NotesModal
} from '../components/planning/modals';
import {
  PlanningHeader,
  LeaveBalanceWidget,
  WeekStats,
  WeekNavigator,
  AlertBanners
} from '../components/planning/sections';

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

  // Sélecteur de semaine rapide
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  // 🔍 ANOMALIES POINTAGE
  const [shiftAnomalies, setShiftAnomalies] = useState({});
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  // ⏱️ HEURES POINTÉES PAR EMPLOYÉ
  const [weeklyClockkedHours, setWeeklyClockkedHours] = useState({});

  // 📍 POINTAGES PAR JOUR/EMPLOYÉ (pour affichage sans shift)
  const [dailyPointages, setDailyPointages] = useState({});

  // 🏖️ GESTION DES CONGÉS
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [showLeaveAdminPanel, setShowLeaveAdminPanel] = useState(false);

  // ✏️ ÉDITION DES POINTAGES (ADMIN)
  const [showPointageEditModal, setShowPointageEditModal] = useState(false);
  const [editingPointageData, setEditingPointageData] = useState(null);
  const [pointageEditLoading, setPointageEditLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [leaveRequestForm, setLeaveRequestForm] = useState({
    leaveType: 'paid_leave',
    startDate: '',
    endDate: '',
    reason: '',
    halfDayPeriod: 'morning'
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [selectedCellForLeave, setSelectedCellForLeave] = useState(null); // { date, employeeId }
  const [allPendingLeaves, setAllPendingLeaves] = useState([]); // Toutes les demandes en attente (tous users)

  // 📝 NOTES DE PLANNING (rappels annuels)
  const [planningNotes, setPlanningNotes] = useState('');
  const [lastYearNotes, setLastYearNotes] = useState(null); // { notes, year, weekNumber }
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // 🔄 ORDRE DES EMPLOYÉS (persistant)
  const [employeeOrder, setEmployeeOrder] = useState([]);
  const [showEmployeeOrderModal, setShowEmployeeOrderModal] = useState(false);

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

  // 🏖️ Charger les données de congés
  useEffect(() => {
    if (!user?.uid) return;

    // Écouter le solde de congés en temps réel
    const unsubBalance = leaveRequestService.subscribeToLeaveBalance(user.uid, (balance) => {
      setLeaveBalance(balance);
    });

    // Écouter mes demandes
    const unsubMyRequests = leaveRequestService.subscribeToRequests((requests) => {
      setMyLeaveRequests(requests);
    }, { userId: user.uid });

    // Écouter TOUTES les demandes en attente (pour affichage sur planning)
    const unsubPending = leaveRequestService.subscribeToRequests((requests) => {
      console.log('📋 Demandes en attente chargées:', requests.length, requests.map(r => ({
        userId: r.userId,
        startDate: r.startDate,
        endDate: r.endDate,
        type: r.leaveType
      })));
      setPendingLeaveRequests(requests.filter(r => r.userId !== user.uid)); // Autres users pour admin
      setAllPendingLeaves(requests); // Toutes pour affichage
    }, { status: 'pending' });

    return () => {
      unsubBalance();
      unsubMyRequests();
      unsubPending();
    };
  }, [user?.uid]);

  // Charger les congés approuvés pour la semaine en cours
  useEffect(() => {
    const loadApprovedLeaves = async () => {
      if (weekDates.length === 0) return;

      const startDate = weekDates[0];
      const endDate = weekDates[weekDates.length - 1];

      const leaves = await leaveRequestService.getApprovedLeavesForPeriod(startDate, endDate);
      setApprovedLeaves(leaves);
    };

    loadApprovedLeaves();
  }, [weekDates]);

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

  // ==========================================
  // 🔄 GESTION ORDRE DES EMPLOYÉS
  // ==========================================

  const EMPLOYEE_ORDER_KEY = 'synergia_employee_order';

  // Charger l'ordre sauvegardé depuis localStorage
  const loadEmployeeOrder = useCallback(() => {
    try {
      const saved = localStorage.getItem(EMPLOYEE_ORDER_KEY);
      if (saved) {
        const order = JSON.parse(saved);
        console.log('🔄 Ordre des employés chargé:', order.length, 'employés');
        return order;
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement ordre employés:', error);
    }
    return [];
  }, []);

  // Sauvegarder l'ordre dans localStorage
  const saveEmployeeOrder = useCallback((order) => {
    try {
      localStorage.setItem(EMPLOYEE_ORDER_KEY, JSON.stringify(order));
      setEmployeeOrder(order);
      console.log('💾 Ordre des employés sauvegardé:', order.length, 'employés');
    } catch (error) {
      console.error('❌ Erreur sauvegarde ordre employés:', error);
    }
  }, []);

  // Trier les employés selon l'ordre sauvegardé
  const sortEmployeesByOrder = useCallback((employeesList, order) => {
    if (!order || order.length === 0) {
      return employeesList;
    }

    // Créer une map des positions
    const orderMap = new Map(order.map((id, index) => [id, index]));

    // Trier: les employés avec un ordre défini en premier, les autres à la fin
    return [...employeesList].sort((a, b) => {
      const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
      const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
      return indexA - indexB;
    });
  }, []);

  // Déplacer un employé vers le haut
  const moveEmployeeUp = useCallback((employeeId) => {
    const currentOrder = employeeOrder.length > 0 ? [...employeeOrder] : employees.map(e => e.id);
    const index = currentOrder.indexOf(employeeId);
    if (index > 0) {
      [currentOrder[index - 1], currentOrder[index]] = [currentOrder[index], currentOrder[index - 1]];
      saveEmployeeOrder(currentOrder);
      // Réorganiser l'affichage immédiatement
      setEmployees(prev => sortEmployeesByOrder(prev, currentOrder));
    }
  }, [employeeOrder, employees, saveEmployeeOrder, sortEmployeesByOrder]);

  // Déplacer un employé vers le bas
  const moveEmployeeDown = useCallback((employeeId) => {
    const currentOrder = employeeOrder.length > 0 ? [...employeeOrder] : employees.map(e => e.id);
    const index = currentOrder.indexOf(employeeId);
    if (index < currentOrder.length - 1) {
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
      saveEmployeeOrder(currentOrder);
      // Réorganiser l'affichage immédiatement
      setEmployees(prev => sortEmployeesByOrder(prev, currentOrder));
    }
  }, [employeeOrder, employees, saveEmployeeOrder, sortEmployeesByOrder]);

  // Charger l'ordre au démarrage
  useEffect(() => {
    const savedOrder = loadEmployeeOrder();
    if (savedOrder.length > 0) {
      setEmployeeOrder(savedOrder);
    }
  }, [loadEmployeeOrder]);

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
      // 🔄 Trier selon l'ordre sauvegardé
      const savedOrder = loadEmployeeOrder();
      const sortedEmployees = sortEmployeesByOrder(employeesList, savedOrder);
      setEmployees(sortedEmployees);
      // Mettre à jour l'ordre si nouveaux employés
      if (savedOrder.length === 0 || employeesList.length !== savedOrder.length) {
        const newOrder = sortedEmployees.map(e => e.id);
        setEmployeeOrder(newOrder);
      }

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

      // ⏱️ Charger les heures pointées de la semaine
      await loadWeeklyClockkedHours(weekStart, weekEnd);

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
  // ⏱️ CHARGEMENT HEURES POINTÉES
  // ==========================================

  const loadWeeklyClockkedHours = async (weekStart, weekEnd) => {
    try {
      console.log('⏱️ Chargement heures pointées semaine...');

      const pointagesQuery = query(
        collection(db, 'timeEntries'),
        where('date', '>=', Timestamp.fromDate(weekStart)),
        where('date', '<=', Timestamp.fromDate(weekEnd)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(pointagesQuery);
      const pointages = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'deleted') {
          pointages.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            timestamp: data.timestamp?.toDate()
          });
        }
      });

      // Calculer les heures par employé
      const hoursByEmployee = {};

      // Grouper par utilisateur et par jour
      const byUserDay = {};
      pointages.forEach(p => {
        const userId = p.userId;
        const dayKey = p.date?.toDateString();
        if (!userId || !dayKey) return;

        if (!byUserDay[userId]) byUserDay[userId] = {};
        if (!byUserDay[userId][dayKey]) byUserDay[userId][dayKey] = [];
        byUserDay[userId][dayKey].push(p);
      });

      // Calculer les heures pour chaque utilisateur
      Object.keys(byUserDay).forEach(userId => {
        let totalMinutes = 0;

        Object.keys(byUserDay[userId]).forEach(dayKey => {
          const dayPointages = byUserDay[userId][dayKey].sort((a, b) =>
            a.timestamp - b.timestamp
          );

          // Trouver les paires arrivée/départ
          for (let i = 0; i < dayPointages.length - 1; i++) {
            const current = dayPointages[i];
            const next = dayPointages[i + 1];

            if (current.type === 'arrival' && next.type === 'departure') {
              const diff = (next.timestamp - current.timestamp) / 1000 / 60; // en minutes
              if (diff > 0 && diff < 24 * 60) { // max 24h
                totalMinutes += diff;
              }
              i++; // Sauter le départ car il a été traité
            }
          }
        });

        const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Arrondir à 0.1h
        hoursByEmployee[userId] = totalHours;
      });

      console.log('✅ Heures pointées calculées:', hoursByEmployee);
      setWeeklyClockkedHours(hoursByEmployee);

      // 📍 Sauvegarder les pointages par jour/employé pour affichage
      setDailyPointages(byUserDay);
      console.log('📍 Pointages par jour sauvegardés:', Object.keys(byUserDay).length, 'employés');

    } catch (error) {
      console.error('❌ Erreur calcul heures pointées:', error);
      setWeeklyClockkedHours({});
      setDailyPointages({});
    }
  };

  // Fonction pour récupérer les heures pointées d'un employé
  const getClockkedHoursForEmployee = (employeeId) => {
    return weeklyClockkedHours[employeeId] || 0;
  };

  // 📍 Fonction pour récupérer les pointages d'une cellule (employé + jour)
  const getPointagesForCell = (employeeId, date) => {
    const dayKey = new Date(date).toDateString();
    const userPointages = dailyPointages[employeeId];
    if (!userPointages) return null;

    const dayPointages = userPointages[dayKey];
    if (!dayPointages || dayPointages.length === 0) return null;

    // Trier par timestamp et calculer les heures travaillées
    const sorted = [...dayPointages].sort((a, b) => a.timestamp - b.timestamp);

    // Calculer les heures travaillées pour ce jour
    let workedMinutes = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.type === 'arrival' && next.type === 'departure') {
        const diff = (next.timestamp - current.timestamp) / 1000 / 60;
        if (diff > 0 && diff < 24 * 60) {
          workedMinutes += diff;
        }
        i++;
      }
    }

    // Trouver la première arrivée et le dernier départ
    const arrivals = sorted.filter(p => p.type === 'arrival');
    const departures = sorted.filter(p => p.type === 'departure');

    const firstArrival = arrivals[0];
    const lastDeparture = departures[departures.length - 1];

    return {
      pointages: sorted,
      workedMinutes,
      workedHours: Math.round(workedMinutes / 60 * 10) / 10,
      firstArrival: firstArrival?.timestamp,
      lastDeparture: lastDeparture?.timestamp,
      hasOpenSession: arrivals.length > departures.length
    };
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

  // Aller à une semaine spécifique (à partir d'une date)
  const goToWeek = (dateString) => {
    if (dateString) {
      const selectedDate = new Date(dateString);
      setCurrentWeek(selectedDate);
      setShowWeekPicker(false);
    }
  };

  // ==========================================
  // 🚀 MISES À JOUR OPTIMISTES (PERFORMANCE)
  // ==========================================

  // Calculer la durée d'un shift localement
  const calculateShiftDuration = (startTime, endTime) => {
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return parseFloat(hours.toFixed(2));
    } catch {
      return 0;
    }
  };

  // Mettre à jour les stats localement après un changement
  const updateLocalStats = (newShifts) => {
    const totalHours = newShifts.reduce((sum, s) => sum + (s.duration || 0), 0);
    const uniqueEmployees = new Set(newShifts.map(s => s.employeeId));

    setStats(prev => ({
      ...prev,
      totalHours: Math.round(totalHours * 10) / 10,
      shiftsCount: newShifts.length,
      employeesScheduled: uniqueEmployees.size
    }));
  };

  // Ajouter un shift localement (optimiste)
  const addShiftLocally = (shiftData, shiftId) => {
    const newShift = {
      id: shiftId,
      ...shiftData,
      duration: calculateShiftDuration(shiftData.startTime, shiftData.endTime),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newShifts = [...shifts, newShift];
    setShifts(newShifts);
    updateLocalStats(newShifts);
    return newShift;
  };

  // Modifier un shift localement (optimiste)
  const updateShiftLocally = (shiftId, updateData) => {
    const newShifts = shifts.map(s => {
      if (s.id === shiftId) {
        const duration = (updateData.startTime && updateData.endTime)
          ? calculateShiftDuration(updateData.startTime, updateData.endTime)
          : s.duration;
        return { ...s, ...updateData, duration, updatedAt: new Date() };
      }
      return s;
    });

    setShifts(newShifts);
    updateLocalStats(newShifts);
  };

  // Supprimer un shift localement (optimiste)
  const removeShiftLocally = (shiftId) => {
    const newShifts = shifts.filter(s => s.id !== shiftId);
    setShifts(newShifts);
    updateLocalStats(newShifts);
  };

  const formatWeekRange = () => {
    const start = getWeekStart(currentWeek);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  };

  // ==========================================
  // 📝 NOTES DE PLANNING (RAPPELS ANNUELS)
  // ==========================================

  // Calculer le numéro de semaine ISO
  const getISOWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { weekNumber, year: d.getFullYear() };
  };

  // Vérifier si l'utilisateur peut éditer les notes (gestionnaire planning)
  const canEditPlanningNotes = () => {
    if (!user) return false;
    if (user.isAdmin) return true;
    const planningPerms = user.modulePermissions?.planning;
    if (Array.isArray(planningPerms)) {
      return planningPerms.includes('planning_edit') || planningPerms.includes('planning_admin');
    }
    return planningPerms?.planning_edit || planningPerms?.planning_admin || false;
  };

  // Charger les notes de la semaine courante + année précédente
  const loadPlanningNotes = async () => {
    try {
      const weekStart = getWeekStart(currentWeek);
      const { weekNumber, year } = getISOWeekNumber(weekStart);

      // Charger les notes de cette année
      const currentNoteRef = doc(db, 'planning_notes', `${year}-W${weekNumber}`);
      const currentNoteSnap = await getDoc(currentNoteRef);

      if (currentNoteSnap.exists()) {
        setPlanningNotes(currentNoteSnap.data().notes || '');
      } else {
        setPlanningNotes('');
      }

      // Charger les notes de l'année précédente (même semaine)
      const lastYearNoteRef = doc(db, 'planning_notes', `${year - 1}-W${weekNumber}`);
      const lastYearNoteSnap = await getDoc(lastYearNoteRef);

      if (lastYearNoteSnap.exists() && lastYearNoteSnap.data().notes) {
        setLastYearNotes({
          notes: lastYearNoteSnap.data().notes,
          year: year - 1,
          weekNumber
        });
      } else {
        setLastYearNotes(null);
      }

      console.log(`📝 Notes semaine ${weekNumber}/${year} chargées`);
    } catch (error) {
      console.error('❌ Erreur chargement notes planning:', error);
    }
  };

  // Sauvegarder une note de planning
  const savePlanningNote = async () => {
    try {
      setSavingNote(true);
      const weekStart = getWeekStart(currentWeek);
      const { weekNumber, year } = getISOWeekNumber(weekStart);

      const noteRef = doc(db, 'planning_notes', `${year}-W${weekNumber}`);
      await setDoc(noteRef, {
        notes: editingNoteText,
        weekNumber,
        year,
        updatedAt: new Date(),
        updatedBy: user?.uid,
        updatedByName: user?.displayName || user?.email
      });

      setPlanningNotes(editingNoteText);
      setShowNotesModal(false);
      showNotification('📝 Note sauvegardée avec succès !', 'success');
      console.log(`✅ Note semaine ${weekNumber}/${year} sauvegardée`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde note:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // Ouvrir le modal d'édition des notes
  const openNotesModal = () => {
    setEditingNoteText(planningNotes);
    setShowNotesModal(true);
  };

  // Charger les notes quand la semaine change
  useEffect(() => {
    loadPlanningNotes();
  }, [currentWeek]);

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

      // 🚀 Créer en BDD et mise à jour optimiste locale
      const result = await planningEnrichedService.createShift(shiftData);
      addShiftLocally(shiftData, result.id);

      showNotification('✅ Shift créé', 'success');
      closeAddShiftModal();
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

      // 🚀 Modifier en BDD et mise à jour optimiste locale
      await planningEnrichedService.updateShift(editingShift.id, updateData);
      updateShiftLocally(editingShift.id, updateData);

      showNotification('✅ Shift modifié', 'success');
      closeEditShiftModal();
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
      // 🚀 Copier en BDD et mise à jour optimiste locale
      const result = await planningEnrichedService.copyShift(draggedShift.id, employeeId, date);

      // Créer le nouveau shift localement avec les données du shift copié
      const copiedShiftData = {
        employeeId,
        date,
        startTime: draggedShift.startTime,
        endTime: draggedShift.endTime,
        position: draggedShift.position,
        color: draggedShift.color,
        notes: draggedShift.notes,
        isAbsence: draggedShift.isAbsence,
        createdBy: user.uid
      };
      addShiftLocally(copiedShiftData, result.id);

      showNotification('✅ Shift copié', 'success');
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
      // 🚀 Coller en BDD et mise à jour optimiste locale
      const result = await planningEnrichedService.copyShift(copiedShift.id, employeeId, date);

      const pastedShiftData = {
        employeeId,
        date,
        startTime: copiedShift.startTime,
        endTime: copiedShift.endTime,
        position: copiedShift.position,
        color: copiedShift.color,
        notes: copiedShift.notes,
        isAbsence: copiedShift.isAbsence,
        createdBy: user.uid
      };
      addShiftLocally(pastedShiftData, result.id);

      showNotification('✅ Shift collé', 'success');
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
      // 🚀 Supprimer en BDD et mise à jour optimiste locale
      await planningEnrichedService.deleteShift(shiftId);
      removeShiftLocally(shiftId);

      showNotification('✅ Shift supprimé', 'success');
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
      showNotification('📄 Génération PDF officiel...', 'info');

      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Données complètes pour export officiel
      const exportData = {
        employees,
        shifts,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        stats,
        // Pointages par employé/jour pour affichage des heures réelles
        pointages: dailyPointages,
        // Anomalies par shift ID pour afficher les retards/absences
        anomalies: shiftAnomalies,
        // Utiliser les noms officiels (NOM Prénom) pour le document
        useOfficialNames: true
      };

      await planningExportService.generateWeeklyPDF(exportData);
      showNotification('✅ PDF officiel généré !', 'success');
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
  // 🏖️ GESTION DES CONGÉS
  // ==========================================

  const handleSubmitLeaveRequest = async () => {
    const leaveTypeConfig = LEAVE_TYPES[leaveRequestForm.leaveType];
    const isHalfDayType = leaveTypeConfig?.isHalfDay || leaveTypeConfig?.isEvening;

    // Pour les demi-journées, endDate = startDate
    const endDate = isHalfDayType ? leaveRequestForm.startDate : leaveRequestForm.endDate;

    if (!leaveRequestForm.startDate || (!isHalfDayType && !leaveRequestForm.endDate)) {
      showNotification('⚠️ Veuillez sélectionner les dates', 'warning');
      return;
    }

    setSubmittingLeave(true);
    try {
      const result = await leaveRequestService.createLeaveRequest({
        userId: user.uid,
        userName: user.displayName || user.email,
        userAvatar: user.customization?.avatar || '👤',
        leaveType: leaveRequestForm.leaveType,
        startDate: leaveRequestForm.startDate,
        endDate: endDate,
        reason: leaveRequestForm.reason,
        halfDayPeriod: leaveRequestForm.halfDayPeriod
      });

      if (result.success) {
        showNotification('✅ Demande envoyée !', 'success');
        setShowLeaveRequestModal(false);
        setLeaveRequestForm({
          leaveType: 'paid_leave',
          startDate: '',
          endDate: '',
          reason: '',
          halfDayPeriod: 'morning'
        });
      } else {
        showNotification(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur envoi demande:', error);
      showNotification('❌ Erreur lors de l\'envoi', 'error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleApproveLeave = async (requestId) => {
    try {
      const result = await leaveRequestService.approveRequest(
        requestId,
        user.uid,
        user.displayName || user.email
      );

      if (result.success) {
        showNotification('✅ Congés approuvés !', 'success');
      } else {
        showNotification(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      showNotification('❌ Erreur', 'error');
    }
  };

  const handleRejectLeave = async (requestId) => {
    const reason = prompt('Motif du refus (optionnel):');
    if (reason === null) return; // Annulé

    try {
      const result = await leaveRequestService.rejectRequest(
        requestId,
        user.uid,
        user.displayName || user.email,
        reason
      );

      if (result.success) {
        showNotification('❌ Demande refusée', 'info');
      } else {
        showNotification(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur refus:', error);
      showNotification('❌ Erreur', 'error');
    }
  };

  // Vérifier si un employé a un congé approuvé pour une date
  const getApprovedLeaveForCell = (employeeId, date) => {
    return approvedLeaves.find(leave => {
      // Normaliser les dates pour éviter les problèmes de timezone
      const leaveStartStr = leave.startDate?.split('T')[0] || leave.startDate;
      const leaveEndStr = leave.endDate?.split('T')[0] || leave.endDate;
      const cellDateStr = date?.split('T')[0] || date;

      // Comparer les chaînes de date directement (format YYYY-MM-DD)
      return leave.userId === employeeId &&
        cellDateStr >= leaveStartStr &&
        cellDateStr <= leaveEndStr;
    });
  };

  // Calculer le solde disponible
  const getAvailableBalance = (type) => {
    if (!leaveBalance) return 0;

    switch (type) {
      case 'paid_leave':
        return (leaveBalance.paidLeaveDays || 25) - (leaveBalance.usedPaidLeaveDays || 0);
      case 'bonus_day':
        return (leaveBalance.bonusOffDays || 0) - (leaveBalance.usedBonusDays || 0);
      case 'rtt':
        return (leaveBalance.rttDays || 0) - (leaveBalance.usedRttDays || 0);
      default:
        return null; // Pas de limite
    }
  };

  // Vérifier si un employé a une demande EN ATTENTE pour une date
  const getPendingLeaveForCell = (employeeId, date) => {
    // date est au format "YYYY-MM-DD"
    return allPendingLeaves.find(leave => {
      // Normaliser les dates pour éviter les problèmes de timezone
      const leaveStartStr = leave.startDate?.split('T')[0] || leave.startDate;
      const leaveEndStr = leave.endDate?.split('T')[0] || leave.endDate;
      const cellDateStr = date?.split('T')[0] || date;

      // Comparer les chaînes de date directement (format YYYY-MM-DD)
      return leave.userId === employeeId &&
        cellDateStr >= leaveStartStr &&
        cellDateStr <= leaveEndStr;
    });
  };

  // Ouvrir le modal de demande de congés depuis une cellule
  const openLeaveRequestFromCell = (date) => {
    setSelectedCellForLeave({ date });
    setLeaveRequestForm({
      leaveType: 'paid_leave',
      startDate: date,
      endDate: date,
      reason: '',
      halfDayPeriod: 'morning'
    });
    setShowLeaveRequestModal(true);
  };

  // ==========================================
  // ✏️ ÉDITION DES POINTAGES (ADMIN)
  // ==========================================

  // Ouvrir le modal d'édition des pointages
  const openPointageEditModal = async (employeeId, date, employeeName) => {
    setPointageEditLoading(true);
    try {
      // Récupérer les pointages du jour pour cet employé
      const dayPointages = await pointageAnomalyService.getPointagesForDay(employeeId, date);

      setEditingPointageData({
        employeeId,
        employeeName,
        date,
        pointages: dayPointages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      });
      setShowPointageEditModal(true);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
      alert('❌ Erreur lors du chargement des pointages');
    } finally {
      setPointageEditLoading(false);
    }
  };

  // Mettre à jour un pointage
  const handleUpdatePointage = async (pointageId, newTimestamp) => {
    setPointageEditLoading(true);
    try {
      const result = await pointageAnomalyService.updatePointage(
        pointageId,
        { timestamp: newTimestamp },
        user?.uid
      );

      if (result.success) {
        // Recharger les pointages
        const dayPointages = await pointageAnomalyService.getPointagesForDay(
          editingPointageData.employeeId,
          editingPointageData.date
        );
        setEditingPointageData(prev => ({
          ...prev,
          pointages: dayPointages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        }));

        // Recharger les données globales
        await loadWeeklyClockkedHours();
      } else {
        alert('❌ Erreur lors de la mise à jour: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur mise à jour pointage:', error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setPointageEditLoading(false);
    }
  };

  // Supprimer un pointage
  const handleDeletePointage = async (pointageId) => {
    if (!confirm('Voulez-vous vraiment supprimer ce pointage ?')) return;

    setPointageEditLoading(true);
    try {
      const result = await pointageAnomalyService.deletePointage(pointageId, user?.uid);

      if (result.success) {
        // Recharger les pointages
        const dayPointages = await pointageAnomalyService.getPointagesForDay(
          editingPointageData.employeeId,
          editingPointageData.date
        );
        setEditingPointageData(prev => ({
          ...prev,
          pointages: dayPointages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        }));

        // Recharger les données globales
        await loadWeeklyClockkedHours();
      } else {
        alert('❌ Erreur lors de la suppression: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur suppression pointage:', error);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setPointageEditLoading(false);
    }
  };

  // Ajouter un nouveau pointage
  const handleAddPointage = async (type, timestamp) => {
    setPointageEditLoading(true);
    try {
      const result = await pointageAnomalyService.createPointage(
        {
          userId: editingPointageData.employeeId,
          type: type, // 'arrival' ou 'departure'
          timestamp: timestamp,
          date: editingPointageData.date
        },
        user?.uid
      );

      if (result.success) {
        // Recharger les pointages
        const dayPointages = await pointageAnomalyService.getPointagesForDay(
          editingPointageData.employeeId,
          editingPointageData.date
        );
        setEditingPointageData(prev => ({
          ...prev,
          pointages: dayPointages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        }));

        // Recharger les données globales
        await loadWeeklyClockkedHours();
      } else {
        alert('❌ Erreur lors de la création: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur création pointage:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setPointageEditLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6">
        <div className="max-w-[1800px] mx-auto">

          {/* HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  📅 Planning Équipe
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Gestion avancée - Zone Normandie</p>
                {hrSettings.rules.conventionCollective && (
                  <p className="text-xs text-gray-500 mt-1">📋 {hrSettings.rules.conventionCollective}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Boutons d'action - responsive */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Toggle Anomalies Pointage */}
                <button
                  onClick={() => setShowAnomalies(!showAnomalies)}
                  className={`${
                    showAnomalies
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  } text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm`}
                >
                  {loadingAnomalies ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {showAnomalies ? 'Anomalies ON' : 'Anomalies OFF'}
                  </span>
                </button>

                <button
                  onClick={loadAllShifts}
                  disabled={diagnosticLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  {diagnosticLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Diagnostic</span>
                </button>

                <button
                  onClick={() => loadPlanningData()}
                  disabled={refreshing}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                <button
                  onClick={exportWeeklyPDF}
                  disabled={exporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                <button
                  onClick={duplicateWeek}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Dupliquer</span>
                </button>

                {/* 🏖️ Bouton Demander congés */}
                <button
                  onClick={() => setShowLeaveRequestModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Palmtree className="w-4 h-4" />
                  <span className="hidden sm:inline">Congés</span>
                </button>

                {/* 📋 Bouton Admin congés (si demandes en attente) */}
                {pendingLeaveRequests.length > 0 && (
                  <button
                    onClick={() => setShowLeaveAdminPanel(true)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm relative"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span className="hidden sm:inline">Demandes</span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingLeaveRequests.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 🏖️ WIDGET SOLDE CONGÉS */}
          {leaveBalance && (
            <div className="mb-4 sm:mb-6">
              <GlassCard className="!p-3 sm:!p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Palmtree className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-medium text-sm">Mon solde congés :</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
                      <span className="text-amber-300 text-sm">
                        🏖️ CP: <span className="font-bold">{getAvailableBalance('paid_leave')}</span> jours
                      </span>
                    </div>
                    {(leaveBalance.bonusOffDays || 0) > 0 && (
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
                        <span className="text-purple-300 text-sm">
                          🎁 Bonus: <span className="font-bold">{getAvailableBalance('bonus_day')}</span> jours
                        </span>
                      </div>
                    )}
                    {(leaveBalance.rttDays || 0) > 0 && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                        <span className="text-green-300 text-sm">
                          ⏰ RTT: <span className="font-bold">{getAvailableBalance('rtt')}</span> jours
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* 📝 SECTION NOTES DE PLANNING */}
          {(lastYearNotes || planningNotes || canEditPlanningNotes()) && (
            <div className="mb-4 sm:mb-6 space-y-3">
              {/* Rappel de l'année précédente */}
              {lastYearNotes && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/30 rounded-lg">
                      <History className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <h4 className="text-amber-300 font-bold text-sm">
                          Rappel de {lastYearNotes.year} (Semaine {lastYearNotes.weekNumber})
                        </h4>
                      </div>
                      <p className="text-amber-100 text-sm whitespace-pre-wrap">{lastYearNotes.notes}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notes de cette année */}
              <GlassCard className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <StickyNote className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-sm mb-1">
                        Notes de la semaine {getISOWeekNumber(getWeekStart(currentWeek)).weekNumber}
                      </h4>
                      {planningNotes ? (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{planningNotes}</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          {canEditPlanningNotes()
                            ? "Aucune note pour cette semaine. Cliquez pour en ajouter une."
                            : "Aucune note pour cette semaine."}
                        </p>
                      )}
                    </div>
                  </div>
                  {canEditPlanningNotes() && (
                    <button
                      onClick={openNotesModal}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                      title="Modifier les notes"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* MODAL ÉDITION NOTES */}
          <NotesModal
            show={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            weekNumber={getISOWeekNumber(getWeekStart(currentWeek)).weekNumber}
            year={getISOWeekNumber(getWeekStart(currentWeek)).year}
            editingNoteText={editingNoteText}
            setEditingNoteText={setEditingNoteText}
            lastYearNotes={lastYearNotes}
            savingNote={savingNote}
            onSave={savePlanningNote}
          />

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

          {/* 🏖️ MODAL DEMANDE DE CONGÉS */}
          <LeaveRequestModal
            show={showLeaveRequestModal}
            onClose={() => setShowLeaveRequestModal(false)}
            leaveBalance={leaveBalance}
            leaveRequestForm={leaveRequestForm}
            setLeaveRequestForm={setLeaveRequestForm}
            submitting={submittingLeave}
            onSubmit={handleSubmitLeaveRequest}
            myLeaveRequests={myLeaveRequests}
            LEAVE_TYPES={LEAVE_TYPES}
            REQUEST_STATUS={REQUEST_STATUS}
            getAvailableBalance={getAvailableBalance}
          />

          {/* 📋 MODAL ADMIN - VALIDATION DES DEMANDES */}
          <LeaveAdminPanel
            show={showLeaveAdminPanel}
            onClose={() => setShowLeaveAdminPanel(false)}
            pendingRequests={pendingLeaveRequests}
            onApprove={handleApproveLeave}
            onReject={handleRejectLeave}
            LEAVE_TYPES={LEAVE_TYPES}
          />

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <GlassCard className="!p-3 sm:!p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Heures</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalHours}h</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
            </GlassCard>

            <GlassCard className="!p-3 sm:!p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Shifts</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.shiftsCount}</p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
            </GlassCard>

            <GlassCard className="!p-3 sm:!p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Employés</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.employeesScheduled}/{employees.length}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard className="!p-3 sm:!p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Couverture</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.coverage}%</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
              </div>
            </GlassCard>
          </div>

          {/* NAVIGATION SEMAINE */}
          <GlassCard className="mb-4 sm:mb-6 !p-3 sm:!p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={previousWeek}
                  className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                {/* Zone cliquable pour sélection rapide de semaine */}
                <div className="relative">
                  <button
                    onClick={() => setShowWeekPicker(!showWeekPicker)}
                    className="text-center min-w-[180px] sm:min-w-[220px] p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    title="Cliquer pour choisir une semaine"
                  >
                    <p className="text-gray-400 text-xs sm:text-sm group-hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Semaine en cours
                    </p>
                    <p className="text-white font-semibold text-sm sm:text-lg group-hover:text-purple-300 transition-colors">
                      {formatWeekRange()}
                    </p>
                  </button>

                  {/* Picker de semaine */}
                  <AnimatePresence>
                    {showWeekPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl min-w-[260px]"
                      >
                        <p className="text-gray-400 text-sm mb-3 text-center">Aller à la semaine du :</p>
                        <input
                          type="date"
                          onChange={(e) => goToWeek(e.target.value)}
                          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-center cursor-pointer"
                          autoFocus
                        />
                        <button
                          onClick={() => setShowWeekPicker(false)}
                          className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2 transition-colors"
                        >
                          Fermer
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm w-full sm:w-auto"
              >
                Aujourd'hui
              </button>
            </div>
          </GlassCard>

          {/* Overlay pour fermer le picker */}
          {showWeekPicker && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowWeekPicker(false)}
            />
          )}

          {/* MODAL CRÉATION SHIFT */}
          <AddShiftModal
            show={showAddShiftModal}
            onClose={closeAddShiftModal}
            selectedCell={selectedCell}
            newShift={newShift}
            setNewShift={setNewShift}
            complianceAlerts={complianceAlerts}
            onCheckCompliance={(shift, employeeId, date) => {
              const alerts = checkShiftCompliance(shift, employeeId, date);
              setComplianceAlerts(alerts);
            }}
            shiftTypes={getAllShiftTypes()}
            onShiftTypeChange={handleShiftTypeChange}
            onCreateShift={handleCreateShift}
            getEmployeeName={getEmployeeName}
          />

          {/* MODAL ÉDITION SHIFT */}
          <EditShiftModal
            show={showEditShiftModal}
            onClose={closeEditShiftModal}
            editingShift={editingShift}
            newShift={newShift}
            setNewShift={setNewShift}
            complianceAlerts={complianceAlerts}
            onCheckCompliance={(shift, employeeId, date) => {
              const alerts = checkShiftCompliance(shift, employeeId, date);
              setComplianceAlerts(alerts);
            }}
            shiftTypes={getAllShiftTypes()}
            onShiftTypeChange={handleShiftTypeChange}
            onUpdateShift={handleUpdateShift}
            getEmployeeName={getEmployeeName}
          />

          {/* PLANNING TABLE */}
          <GlassCard className="!p-2 sm:!p-6">
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10 min-w-[120px] sm:min-w-[200px]">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">Employé</span>
                        <span className="sm:hidden text-xs">Employé</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => loadPlanningData()}
                            disabled={loading}
                            className="p-1 sm:p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                            title="Actualiser"
                          >
                            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => setShowEmployeeOrderModal(true)}
                            className="p-1 sm:p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-purple-400"
                            title="Réorganiser les employés"
                          >
                            <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </th>
                    {weekDates.map((date) => {
                      const dateAnalysis = getDateAnalysis(date);
                      const hasAlerts = dateAnalysis && dateAnalysis.alerts.length > 0;

                      return (
                        <th key={date} className="text-center p-1 sm:p-4 text-gray-400 font-semibold min-w-[80px] sm:min-w-[150px]">
                          <div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{getDayName(date)}</div>
                            <div className="text-sm sm:text-lg text-white mt-1">{getDayNumber(date)}</div>
                            
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
                    <th className="text-center p-1 sm:p-4 text-gray-400 font-semibold min-w-[80px] sm:min-w-[140px]">
                      <span className="hidden sm:inline">Pointé/Planifié/Contrat</span>
                      <span className="sm:hidden text-[10px]">Heures</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => {
                    const hoursComparison = getHoursComparisonForEmployee(employee.id);
                    const clockedHours = getClockkedHoursForEmployee(employee.id);

                    return (
                      <tr key={employee.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="p-2 sm:p-4 sticky left-0 bg-gray-800/95 backdrop-blur-xl z-10">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <UserAvatar
                              user={employee}
                              size="md"
                              showBorder={true}
                              className="flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-xs sm:text-base truncate">{employee.name}</p>
                              <p className="text-gray-400 text-[10px] sm:text-sm truncate hidden sm:block">{employee.position}</p>
                            </div>
                          </div>
                        </td>

                        {weekDates.map(date => {
                          const shift = getShiftForCell(employee.id, date);
                          const approvedLeave = getApprovedLeaveForCell(employee.id, date);
                          const pendingLeave = getPendingLeaveForCell(employee.id, date);
                          const cellPointages = getPointagesForCell(employee.id, date);
                          const isOver = dragOverCell?.employeeId === employee.id && dragOverCell?.date === date;
                          const dateAnalysis = getDateAnalysis(date);
                          const hasHighDemand = dateAnalysis && dateAnalysis.isSpecial;
                          const isCurrentUser = employee.id === user?.uid;

                          return (
                            <td
                              key={date}
                              className={`p-1 sm:p-2 transition-all ${
                                isOver ? 'bg-purple-500/20 border-2 border-purple-500' : ''
                              } ${
                                hasHighDemand ? 'bg-orange-500/5' : ''
                              } ${
                                pendingLeave ? 'bg-yellow-500/5' : ''
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
                                  onClick={() => !isDragging && openEditShiftModal(shift)}
                                  style={{
                                    backgroundColor: shift.color || '#8B5CF6',
                                    borderLeft: `4px solid rgba(0,0,0,0.3)`
                                  }}
                                  className="rounded-lg p-1.5 sm:p-3 cursor-pointer hover:opacity-90 transition-all group relative min-h-[60px] sm:min-h-[80px] shadow-lg"
                                >
                                  {/* Overlay sombre pour améliorer la lisibilité */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 rounded-lg pointer-events-none" />

                                  <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                                      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:block text-white drop-shadow-md" />
                                        <span className="font-bold text-white drop-shadow-md">{shift.startTime} - {shift.endTime}</span>
                                      </div>

                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditShiftModal(shift);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                          title="Éditer shift"
                                        >
                                          <Edit className="w-3 h-3 text-white" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openPointageEditModal(employee.id, date, employee.displayName || employee.name);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-cyan-500/50 rounded"
                                          title="Modifier pointages"
                                        >
                                          <Clock className="w-3 h-3 text-white" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyShift(shift);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                          title="Copier"
                                        >
                                          <Copy className="w-3 h-3 text-white" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteShift(shift.id);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                          title="Supprimer"
                                        >
                                          <X className="w-3 h-3 text-white" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="text-white text-[10px] sm:text-sm font-bold truncate drop-shadow-md">
                                      {shift.position}
                                    </div>

                                    {shift.duration && (
                                      <div className="text-white/90 text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 drop-shadow-md">
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
                                              flex items-center gap-1 shadow-sm
                                              ${anomaly.bgColor} ${anomaly.textColor} ${anomaly.borderColor}
                                              border
                                            `}
                                            title={`${anomaly.label}: ${anomaly.message}`}
                                          >
                                            <span>{anomaly.icon}</span>
                                            <span className="drop-shadow-sm">{anomaly.message}</span>
                                          </div>
                                        ))}

                                        {/* Résumé du temps travaillé */}
                                        {getShiftAnomalies(shift.id).summary && (
                                          <div className={`
                                            px-2 py-1 rounded text-[10px] shadow-sm
                                            ${getShiftAnomalies(shift.id).summary.diffMinutes > 0
                                              ? 'bg-blue-600/50 text-white border border-blue-400/50'
                                              : getShiftAnomalies(shift.id).summary.diffMinutes < 0
                                                ? 'bg-red-600/50 text-white border border-red-400/50'
                                                : 'bg-green-600/50 text-white border border-green-400/50'
                                            }
                                          `}>
                                            <span className="font-bold drop-shadow-sm">
                                              {getShiftAnomalies(shift.id).summary.diffFormatted}
                                            </span>
                                            <span className="opacity-90 ml-1 drop-shadow-sm">
                                              ({Math.floor(getShiftAnomalies(shift.id).summary.workedMinutes / 60)}h{String(getShiftAnomalies(shift.id).summary.workedMinutes % 60).padStart(2, '0')} travaillé)
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : approvedLeave ? (
                                /* 🏖️ Affichage congé approuvé */
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  style={{
                                    backgroundColor: LEAVE_TYPES[approvedLeave.leaveType]?.color || '#F59E0B',
                                    borderLeft: `4px solid rgba(0,0,0,0.3)`
                                  }}
                                  className="rounded-lg p-1.5 sm:p-3 min-h-[60px] sm:min-h-[80px] shadow-lg relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 rounded-lg pointer-events-none" />
                                  <div className="relative z-10">
                                    <div className="text-xl sm:text-2xl text-center mb-1">
                                      {LEAVE_TYPES[approvedLeave.leaveType]?.emoji || '🏖️'}
                                    </div>
                                    <div className="text-white text-[10px] sm:text-xs font-bold text-center drop-shadow-md">
                                      {LEAVE_TYPES[approvedLeave.leaveType]?.label || 'Congé'}
                                    </div>
                                    {approvedLeave.isHalfDay && (
                                      <div className="text-white/80 text-[9px] sm:text-[10px] text-center mt-0.5">
                                        {approvedLeave.halfDayPeriod === 'morning' ? 'Matin' : approvedLeave.halfDayPeriod === 'afternoon' ? 'Après-midi' : 'Soirée'}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : pendingLeave ? (
                                /* ⏳ Affichage demande EN ATTENTE - visible par tous */
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02 }}
                                  style={{
                                    borderColor: LEAVE_TYPES[pendingLeave.leaveType]?.color || '#F59E0B',
                                    backgroundColor: `${LEAVE_TYPES[pendingLeave.leaveType]?.color}15` || 'rgba(245, 158, 11, 0.08)'
                                  }}
                                  className="rounded-lg p-1.5 sm:p-3 min-h-[60px] sm:min-h-[80px] border-2 border-dashed relative cursor-default"
                                  title={`${pendingLeave.userName || 'Demande'} - ${LEAVE_TYPES[pendingLeave.leaveType]?.label || 'Congé'} en attente de validation`}
                                >
                                  {/* Badge En attente animé */}
                                  <div className="absolute top-1 right-1">
                                    <motion.span
                                      animate={{ opacity: [0.7, 1, 0.7] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="text-[8px] sm:text-[10px] bg-yellow-500/40 text-yellow-200 px-1.5 py-0.5 rounded-full font-medium border border-yellow-500/30"
                                    >
                                      ⏳ En attente
                                    </motion.span>
                                  </div>
                                  <div className="relative z-10 pt-4 sm:pt-3">
                                    <div className="text-lg sm:text-xl text-center mb-1">
                                      {LEAVE_TYPES[pendingLeave.leaveType]?.emoji || '🏖️'}
                                    </div>
                                    <div className="text-gray-200 text-[9px] sm:text-[10px] font-medium text-center truncate">
                                      {LEAVE_TYPES[pendingLeave.leaveType]?.label || 'Congé'}
                                    </div>
                                    {pendingLeave.isHalfDay && (
                                      <div className="text-gray-400 text-[8px] sm:text-[9px] text-center mt-0.5">
                                        {pendingLeave.halfDayPeriod === 'morning' ? 'Matin' : pendingLeave.halfDayPeriod === 'afternoon' ? 'Après-midi' : 'Soirée'}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : cellPointages ? (
                                /* 📍 POINTAGES SANS SHIFT - Afficher les pointages même sans shift prévu */
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  onClick={() => openPointageEditModal(employee.id, date, employee.displayName || employee.name)}
                                  className="rounded-lg p-1.5 sm:p-3 min-h-[60px] sm:min-h-[80px] shadow-lg relative bg-gradient-to-br from-cyan-600/80 to-blue-600/80 border-2 border-dashed border-cyan-400/50 cursor-pointer hover:from-cyan-500/80 hover:to-blue-500/80 transition-all group"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 rounded-lg pointer-events-none" />
                                  <div className="relative z-10">
                                    {/* En-tête avec horaires */}
                                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                                      <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white drop-shadow-md" />
                                        <span className="font-bold text-white drop-shadow-md">
                                          {cellPointages.firstArrival
                                            ? new Date(cellPointages.firstArrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                            : '--:--'
                                          }
                                          {' - '}
                                          {cellPointages.lastDeparture
                                            ? new Date(cellPointages.lastDeparture).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                            : cellPointages.hasOpenSession ? 'En cours' : '--:--'
                                          }
                                        </span>
                                      </div>

                                      {/* Boutons d'action */}
                                      <div className="flex gap-1">
                                        {/* Bouton éditer pointage */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openPointageEditModal(employee.id, date, employee.displayName || employee.name);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-cyan-500/50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                          title="Modifier les pointages"
                                        >
                                          <Edit className="w-3 h-3 text-white" />
                                        </button>
                                        {/* Bouton ajouter shift */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openAddShiftModal(employee.id, date);
                                          }}
                                          className="p-1 bg-black/30 hover:bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                          title="Créer un shift pour ce pointage"
                                        >
                                          <Plus className="w-3 h-3 text-white" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Label "Pointage hors planning" */}
                                    <div className="text-white text-[10px] sm:text-sm font-bold truncate drop-shadow-md">
                                      ⏱️ Pointage
                                    </div>

                                    {/* Heures travaillées */}
                                    <div className="text-white/90 text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 drop-shadow-md">
                                      {cellPointages.workedHours}h travaillé
                                    </div>

                                    {/* Badge "Hors planning" + Edit icon on hover */}
                                    <div className="absolute -top-1 -right-1">
                                      <span className="text-[8px] sm:text-[10px] bg-orange-500/80 text-white px-1.5 py-0.5 rounded-full font-medium border border-orange-400/50 group-hover:bg-cyan-500/80 group-hover:border-cyan-400/50 transition-colors">
                                        <span className="group-hover:hidden">⚠️ Hors planning</span>
                                        <span className="hidden group-hover:inline">✏️ Modifier</span>
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                /* Cellule vide - options selon l'utilisateur */
                                <div className="min-h-[60px] sm:min-h-[80px] flex flex-col items-center justify-center gap-1 rounded-lg transition-colors group">
                                  {/* Bouton ajouter shift (admin) */}
                                  <button
                                    onClick={() => openAddShiftModal(employee.id, date)}
                                    className="p-1.5 text-gray-600 hover:bg-gray-700/30 hover:text-purple-400 rounded-lg transition-colors"
                                    title="Ajouter un shift"
                                  >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  {/* Bouton demande congé (utilisateur courant) */}
                                  {isCurrentUser && (
                                    <button
                                      onClick={() => openLeaveRequestFromCell(date)}
                                      className="p-1.5 text-gray-600 hover:bg-amber-500/20 hover:text-amber-400 rounded-lg transition-colors"
                                      title="Demander un congé"
                                    >
                                      <Palmtree className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-1 sm:p-4 text-center">
                          <div className="space-y-0.5 sm:space-y-1">
                            {/* Heures Pointées / Planifiées / Contrat */}
                            <div className="text-white font-semibold text-[10px] sm:text-sm">
                              <span className="hidden sm:inline">
                                <span className={`${clockedHours > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>{clockedHours}h</span>
                                <span className="text-gray-500"> / </span>
                                <span className="text-white">{hoursComparison.plannedHours}h</span>
                                <span className="text-gray-500"> / </span>
                                <span className="text-gray-400">{hoursComparison.contractHours}h</span>
                              </span>
                              <span className="sm:hidden">
                                <span className={`${clockedHours > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>{clockedHours}h</span>
                              </span>
                            </div>
                            {/* Différence Planifié vs Contrat */}
                            <div className={`text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-0.5 sm:gap-1 ${
                              hoursComparison.difference > 0 ? 'text-green-400' :
                              hoursComparison.difference < 0 ? 'text-orange-400' : 'text-gray-400'
                            }`}>
                              {hoursComparison.difference > 0 && <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              {hoursComparison.difference < 0 && <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              {hoursComparison.difference === 0 && <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                              <span>
                                {hoursComparison.difference > 0 ? '+' : ''}
                                {hoursComparison.difference}h
                              </span>
                            </div>
                            {/* Pourcentage */}
                            <div className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">
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
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <GlassCard className="!p-3 sm:!p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">💡 Astuces :</p>
                  <ul className="text-gray-400 text-[10px] sm:text-xs space-y-1">
                    <li>• Cliquer sur <Plus className="w-3 h-3 inline" /> pour créer un shift</li>
                    <li className="hidden sm:block">• Glisser-déposer les shifts pour les COPIER</li>
                    <li className="hidden sm:block">• Double-clic sur cellule vide pour coller</li>
                    <li>• Diagnostic pour voir TOUS les shifts</li>
                  </ul>
                </div>

                {copiedShift && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 sm:px-4 py-2">
                    <p className="text-blue-300 text-xs sm:text-sm flex items-center gap-2">
                      <Clipboard className="w-4 h-4" />
                      Shift copié : {copiedShift.startTime} - {copiedShift.endTime}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* LÉGENDE ANOMALIES */}
            {showAnomalies && (
              <GlassCard className="!p-3 sm:!p-6">
                <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Légende Anomalies Pointage :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">⏰</span>
                    <span className="text-gray-400">Retard</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">🚪</span>
                    <span className="text-gray-400">Départ tôt</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">⚡</span>
                    <span className="text-gray-400">Heures sup</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded">❌</span>
                    <span className="text-gray-400">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">⚠️</span>
                    <span className="text-gray-400">Manquant</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded">✨</span>
                    <span className="text-gray-400">En avance</span>
                  </div>
                </div>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-2 sm:mt-3 hidden sm:block">
                  📊 Les pointages sont synchronisés depuis la page Pulse & Pointage
                </p>
              </GlassCard>
            )}
          </div>

          {/* ✏️ MODAL ÉDITION DES POINTAGES */}
          <AnimatePresence>
            {showPointageEditModal && editingPointageData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={() => setShowPointageEditModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-700/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-700/50 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Edit className="w-5 h-5 text-cyan-400" />
                        Modifier les pointages
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {editingPointageData.employeeName} - {new Date(editingPointageData.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPointageEditModal(false)}
                      className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {pointageEditLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Liste des pointages existants */}
                        {editingPointageData.pointages.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-gray-400 text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Pointages du jour ({editingPointageData.pointages.length})
                            </h4>

                            {editingPointageData.pointages.map((pointage, index) => (
                              <div
                                key={pointage.id}
                                className={`
                                  p-3 rounded-xl border transition-all
                                  ${pointage.type === 'arrival'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-red-500/10 border-red-500/30'}
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`
                                      w-10 h-10 rounded-lg flex items-center justify-center text-lg
                                      ${pointage.type === 'arrival' ? 'bg-green-500/20' : 'bg-red-500/20'}
                                    `}>
                                      {pointage.type === 'arrival' ? '🟢' : '🔴'}
                                    </div>
                                    <div>
                                      <p className={`font-medium ${pointage.type === 'arrival' ? 'text-green-400' : 'text-red-400'}`}>
                                        {pointage.type === 'arrival' ? 'Arrivée' : 'Départ'}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        Source: {pointage.source === 'admin_manual' ? 'Manuel (admin)' : 'Automatique'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Input heure modifiable */}
                                    <input
                                      type="time"
                                      defaultValue={new Date(pointage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(pointage.timestamp);
                                        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                        // Stocker la nouvelle valeur pour la sauvegarde
                                        pointage._newTimestamp = newDate;
                                      }}
                                    />

                                    {/* Bouton sauvegarder */}
                                    <button
                                      onClick={() => {
                                        if (pointage._newTimestamp) {
                                          handleUpdatePointage(pointage.id, pointage._newTimestamp);
                                        }
                                      }}
                                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                                      title="Sauvegarder"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>

                                    {/* Bouton supprimer */}
                                    <button
                                      onClick={() => handleDeletePointage(pointage.id)}
                                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                      title="Supprimer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aucun pointage pour ce jour</p>
                          </div>
                        )}

                        {/* Section ajouter un pointage */}
                        <div className="border-t border-gray-700/50 pt-4">
                          <h4 className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter un pointage
                          </h4>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Ajouter arrivée */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                              <p className="text-green-400 text-sm font-medium mb-2">🟢 Arrivée</p>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  id="newArrivalTime"
                                  defaultValue="09:00"
                                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                  onClick={() => {
                                    const timeInput = document.getElementById('newArrivalTime');
                                    const [hours, minutes] = timeInput.value.split(':');
                                    const timestamp = new Date(editingPointageData.date);
                                    timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                    handleAddPointage('arrival', timestamp);
                                  }}
                                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Ajouter départ */}
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                              <p className="text-red-400 text-sm font-medium mb-2">🔴 Départ</p>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  id="newDepartureTime"
                                  defaultValue="17:00"
                                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                  onClick={() => {
                                    const timeInput = document.getElementById('newDepartureTime');
                                    const [hours, minutes] = timeInput.value.split(':');
                                    const timestamp = new Date(editingPointageData.date);
                                    timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                    handleAddPointage('departure', timestamp);
                                  }}
                                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-700/50 p-4 flex justify-end gap-3">
                    <button
                      onClick={() => setShowPointageEditModal(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🔄 MODAL RÉORGANISER LES EMPLOYÉS */}
          <AnimatePresence>
            {showEmployeeOrderModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setShowEmployeeOrderModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <GripVertical className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Ordre des employés</h3>
                        <p className="text-xs text-gray-400">Réorganisez l'affichage du planning</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEmployeeOrderModal(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Liste des employés */}
                  <div className="p-4 overflow-y-auto max-h-[50vh]">
                    <div className="space-y-2">
                      {employees.map((employee, index) => (
                        <div
                          key={employee.id}
                          className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600/50"
                        >
                          {/* Boutons de déplacement */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveEmployeeUp(employee.id)}
                              disabled={index === 0}
                              className={`p-1 rounded transition-colors ${
                                index === 0
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/20'
                              }`}
                              title="Monter"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveEmployeeDown(employee.id)}
                              disabled={index === employees.length - 1}
                              className={`p-1 rounded transition-colors ${
                                index === employees.length - 1
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/20'
                              }`}
                              title="Descendre"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Avatar et nom */}
                          <div className="flex items-center gap-3 flex-1">
                            <UserAvatar user={employee} size="sm" showBorder />
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{employee.name}</p>
                              <p className="text-gray-400 text-xs truncate">{employee.position || 'Employé'}</p>
                            </div>
                          </div>

                          {/* Position */}
                          <div className="text-gray-500 text-sm font-mono">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                    <p className="text-xs text-gray-500 text-center mb-3">
                      L'ordre est sauvegardé automatiquement et conservé pour toutes les semaines
                    </p>
                    <button
                      onClick={() => setShowEmployeeOrderModal(false)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Terminé
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  );
};

export default PlanningAdvancedPage;
