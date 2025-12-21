// ==========================================
// 📁 react-app/src/pages/PlanningPage.jsx
// PLANNING AVANCÉ TYPE SKELLO - CHARGEMENT EMPLOYÉS DEPUIS USERS
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
  Upload,
  Edit,
  Trash2,
  Clock,
  Users,
  Filter,
  Search,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Firebase
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Auth
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 📅 PAGE PLANNING AVANCÉE TYPE SKELLO
 */
const PlanningPage = () => {
  const { user } = useAuthStore();

  // États principaux
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation semaine
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Drag & Drop
  const [draggedShift, setDraggedShift] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  
  // Copier-coller
  const [copiedShift, setCopiedShift] = useState(null);
  
  // Modals
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Filtres
  const [filterPosition, setFilterPosition] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // ==========================================
  // 📅 UTILITAIRES DATES
  // ==========================================
  
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  const getWeekEnd = (date) => {
    const start = getWeekStart(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };
  
  const getWeekDays = () => {
    const start = getWeekStart(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };
  
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };
  
  // ==========================================
  // 🔄 CHARGEMENT DONNÉES
  // ==========================================
  
  useEffect(() => {
    loadPlanningData();
    
    // Écoute temps réel des schedules
    const startDate = formatDateKey(getWeekStart(currentWeek));
    const endDate = formatDateKey(getWeekEnd(currentWeek));
    
    const q = query(
      collection(db, 'hr_schedules'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scheduleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedules(scheduleData);
    });
    
    return () => unsubscribe();
  }, [currentWeek]);
  
  const loadPlanningData = async () => {
    try {
      setLoading(true);
      
      // ✅ CORRECTION: Charger les employés depuis la collection 'users'
      console.log('👥 Chargement des employés depuis users...');
      const employeesSnapshot = await getDocs(
        query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      );
      
      const employeeData = employeesSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Sans nom',
          email: userData.email || '',
          position: userData.synergiaRole || userData.profile?.role || 'Game Master',
          status: 'active', // Tous les users sont considérés actifs
          photoURL: userData.photoURL || '',
          phone: userData.profile?.phone || userData.phone || ''
        };
      });
      
      console.log(`✅ ${employeeData.length} employés chargés depuis users`);
      setEmployees(employeeData);
      
      // Charger les schedules de la semaine
      const startDate = formatDateKey(getWeekStart(currentWeek));
      const endDate = formatDateKey(getWeekEnd(currentWeek));
      
      const schedulesSnapshot = await getDocs(
        query(
          collection(db, 'hr_schedules'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        )
      );
      
      const scheduleData = schedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedules(scheduleData);
      
    } catch (error) {
      console.error('❌ Erreur chargement planning:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // ==========================================
  // 🔄 NAVIGATION SEMAINE
  // ==========================================
  
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };
  
  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };
  
  const goToToday = () => {
    setCurrentWeek(new Date());
  };
  
  // ==========================================
  // 🖱️ DRAG & DROP
  // ==========================================
  
  const handleDragStart = (e, shift) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedShift(shift);
    e.currentTarget.style.opacity = '0.4';
  };
  
  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedShift(null);
    setDragOverCell(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (employeeId, date) => {
    setDragOverCell({ employeeId, date: formatDateKey(date) });
  };
  
  const handleDragLeave = () => {
    setDragOverCell(null);
  };
  
  const handleDrop = async (e, employeeId, date) => {
    e.preventDefault();
    setDragOverCell(null);
    
    if (!draggedShift) return;
    
    const dateKey = formatDateKey(date);
    
    if (draggedShift.employeeId === employeeId && draggedShift.date === dateKey) {
      return;
    }
    
    try {
      const newShiftData = {
        employeeId,
        date: dateKey,
        startTime: draggedShift.startTime,
        endTime: draggedShift.endTime,
        position: draggedShift.position,
        notes: draggedShift.notes || '',
        color: draggedShift.color || '#8B5CF6',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'hr_schedules'), newShiftData);
      await deleteDoc(doc(db, 'hr_schedules', draggedShift.id));
      
      console.log('✅ Shift déplacé');
      
    } catch (error) {
      console.error('❌ Erreur drag & drop:', error);
      alert('Erreur lors du déplacement du shift');
    }
  };
  
  // ==========================================
  // 📋 COPIER-COLLER
  // ==========================================
  
  const copyShift = (shift) => {
    setCopiedShift(shift);
    console.log('📋 Shift copié:', shift);
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50';
    notification.textContent = '📋 Shift copié !';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };
  
  const pasteShift = async (employeeId, date) => {
    if (!copiedShift) {
      alert('Aucun shift copié');
      return;
    }
    
    const dateKey = formatDateKey(date);
    
    try {
      const newShiftData = {
        employeeId,
        date: dateKey,
        startTime: copiedShift.startTime,
        endTime: copiedShift.endTime,
        position: copiedShift.position,
        notes: copiedShift.notes || '',
        color: copiedShift.color || '#8B5CF6',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'hr_schedules'), newShiftData);
      
      console.log('✅ Shift collé');
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      notification.textContent = '✅ Shift collé !';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
      
    } catch (error) {
      console.error('❌ Erreur coller shift:', error);
      alert('Erreur lors du collage du shift');
    }
  };
  
  // ==========================================
  // 🔄 DUPLICATION DE SEMAINE
  // ==========================================
  
  const duplicateWeek = async () => {
    if (!window.confirm('Dupliquer cette semaine sur la semaine suivante ?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      for (const shift of schedules) {
        const shiftDate = new Date(shift.date);
        const newDate = new Date(shiftDate);
        newDate.setDate(newDate.getDate() + 7);
        
        const newShiftData = {
          employeeId: shift.employeeId,
          date: formatDateKey(newDate),
          startTime: shift.startTime,
          endTime: shift.endTime,
          position: shift.position,
          notes: shift.notes || '',
          color: shift.color || '#8B5CF6',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'hr_schedules'), newShiftData);
      }
      
      console.log('✅ Semaine dupliquée');
      nextWeek();
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg z-50';
      notification.textContent = `✅ ${schedules.length} shifts dupliqués !`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
    } catch (error) {
      console.error('❌ Erreur duplication:', error);
      alert('Erreur lors de la duplication de la semaine');
    } finally {
      setLoading(false);
    }
  };
  
  // ==========================================
  // 🗑️ SUPPRESSION SHIFT
  // ==========================================
  
  const deleteShift = async (shiftId) => {
    if (!window.confirm('Supprimer ce shift ?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'hr_schedules', shiftId));
      console.log('✅ Shift supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression du shift');
    }
  };
  
  // ==========================================
  // 📊 UTILITAIRES GRILLE
  // ==========================================
  
  const getShiftForCell = (employeeId, date) => {
    const dateKey = formatDateKey(date);
    return schedules.find(
      s => s.employeeId === employeeId && s.date === dateKey
    );
  };
  
  const isCellHighlighted = (employeeId, date) => {
    if (!dragOverCell) return false;
    const dateKey = formatDateKey(date);
    return dragOverCell.employeeId === employeeId && dragOverCell.date === dateKey;
  };
  
  // Filtrer les employés
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPosition === 'all' || emp.position === filterPosition;
    return matchesSearch && matchesFilter;
  });
  
  // Statistiques
  const totalShiftsThisWeek = schedules.length;
  const uniqueEmployees = new Set(schedules.map(s => s.employeeId)).size;
  const totalHours = schedules.reduce((sum, shift) => {
    const start = shift.startTime.split(':');
    const end = shift.endTime.split(':');
    const hours = (parseInt(end[0]) - parseInt(start[0])) + 
                  (parseInt(end[1]) - parseInt(start[1])) / 60;
    return sum + hours;
  }, 0);
  
  // ==========================================
  // 🎨 RENDER
  // ==========================================
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement du planning...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
        
        {/* HEADER */}
        <div className="max-w-[1600px] mx-auto mb-4 sm:mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Planning Skello
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Glisser-déposer • Copier-coller • Duplication
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={duplicateWeek}
                disabled={loading || schedules.length === 0}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-purple-300 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Dupliquer semaine</span>
                <span className="sm:hidden">Dupliquer</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCell(null);
                  setShowAddShiftModal(true);
                }}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter shift</span>
                <span className="sm:hidden">Ajouter</span>
              </motion.button>
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Shifts</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">{totalShiftsThisWeek}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-purple-500/20 rounded-xl">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Employés actifs</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">{uniqueEmployees}</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Total heures</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-green-500/20 rounded-xl">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Shift copié</p>
                  <p className="text-white text-base sm:text-lg font-semibold">
                    {copiedShift ? 'Oui' : 'Non'}
                  </p>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl ${copiedShift ? 'bg-yellow-500/20' : 'bg-gray-500/20'}`}>
                  <Clipboard className={`w-5 h-5 sm:w-6 sm:h-6 ${copiedShift ? 'text-yellow-400' : 'text-gray-400'}`} />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Navigation semaine et filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Navigation semaine */}
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousWeek}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="text-center min-w-[160px] sm:min-w-[200px]">
                  <p className="text-white font-semibold text-sm sm:text-lg">
                    {formatDateDisplay(getWeekStart(currentWeek))} - {formatDateDisplay(getWeekEnd(currentWeek))}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Semaine {Math.ceil((currentWeek - new Date(currentWeek.getFullYear(), 0, 1)) / 604800000)}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextWeek}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToToday}
                  className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 text-blue-300 rounded-xl text-xs sm:text-sm transition-all"
                >
                  Aujourd'hui
                </motion.button>
              </div>

              {/* Filtres */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex-1 lg:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full lg:w-auto pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm transition-all"
                  />
                </div>

                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
                >
                  <option value="all">Tous les postes</option>
                  <option value="Game Master">Game Master</option>
                  <option value="Accueil">Accueil</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* GRILLE PLANNING */}
        <div className="max-w-[1600px] mx-auto mt-4 sm:mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* En-têtes jours */}
            <div className="grid grid-cols-8 bg-white/5 border-b border-white/10">
              <div className="p-2 sm:p-4 border-r border-white/10">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Employé</p>
              </div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="p-2 sm:p-4 text-center border-r border-white/10 last:border-r-0">
                  <p className="text-white font-semibold text-xs sm:text-sm">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {day.getDate()}/{day.getMonth() + 1}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Lignes employés */}
            {filteredEmployees.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="p-4 bg-white/5 rounded-full w-fit mx-auto mb-4">
                  <Users className="w-10 h-10 sm:w-16 sm:h-16 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm sm:text-lg">Aucun employé trouvé</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="grid grid-cols-8 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Colonne employé */}
                  <div className="p-2 sm:p-4 border-r border-white/10 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {employee.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <p className="text-white font-medium truncate text-sm">
                        {employee.displayName || 'Sans nom'}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {employee.position}
                      </p>
                    </div>
                  </div>
                  
                  {/* Cellules jours */}
                  {getWeekDays().map((day, dayIndex) => {
                    const shift = getShiftForCell(employee.id, day);
                    const isHighlighted = isCellHighlighted(employee.id, day);

                    return (
                      <div
                        key={dayIndex}
                        className={`p-1 sm:p-2 border-r border-white/10 last:border-r-0 min-h-[60px] sm:min-h-[100px] transition-all ${
                          isHighlighted ? 'bg-purple-500/20 border-purple-500' : ''
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(employee.id, day)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, employee.id, day)}
                        onDoubleClick={() => pasteShift(employee.id, day)}
                      >
                        {shift ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, shift)}
                            onDragEnd={handleDragEnd}
                            className="bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2 cursor-move hover:border-purple-400/50 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-0.5 sm:mb-1">
                              <div className="flex items-center gap-1 text-purple-300 text-[10px] sm:text-xs">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="font-medium">
                                  {shift.startTime}-{shift.endTime}
                                </span>
                              </div>

                              <div className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyShift(shift);
                                  }}
                                  className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg"
                                  title="Copier"
                                >
                                  <Copy className="w-3 h-3 text-blue-300" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedShift(shift);
                                    setShowEditShiftModal(true);
                                  }}
                                  className="p-1 bg-green-500/20 hover:bg-green-500/40 rounded-lg"
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3 text-green-300" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteShift(shift.id);
                                  }}
                                  className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded-lg"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-300" />
                                </button>
                              </div>
                            </div>

                            <p className="text-white text-[10px] sm:text-sm font-medium truncate">
                              {shift.position}
                            </p>

                            {shift.notes && (
                              <p className="text-gray-300 text-[10px] truncate mt-0.5 sm:mt-1 hidden sm:block">
                                {shift.notes}
                              </p>
                            )}
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCell({ employeeId: employee.id, date: day });
                              setShowAddShiftModal(true);
                            }}
                            className="w-full h-full min-h-[50px] sm:min-h-[80px] flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-white/5 rounded-lg sm:rounded-xl transition-all"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </motion.div>
        </div>
        
        {/* Légende */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-[1600px] mx-auto mt-4 sm:mt-6"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 font-medium">Aide :</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-lg flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="font-medium text-white">Glisser-déposer</span> : Faites glisser un shift vers une autre cellule
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Clipboard className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="font-medium text-white">Copier-coller</span> : Copiez un shift, puis double-cliquez sur une cellule
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-green-500/20 rounded-lg flex-shrink-0">
                  <Copy className="w-3.5 h-3.5 text-green-400" />
                </div>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="font-medium text-white">Dupliquer</span> : Répliquez tout le planning sur la semaine suivante
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* MODALS */}
        {showAddShiftModal && (
          <AddShiftModal
            employees={employees}
            selectedCell={selectedCell}
            onClose={() => {
              setShowAddShiftModal(false);
              setSelectedCell(null);
            }}
            onSave={loadPlanningData}
          />
        )}
        
        {showEditShiftModal && (
          <EditShiftModal
            shift={selectedShift}
            employees={employees}
            onClose={() => {
              setShowEditShiftModal(false);
              setSelectedShift(null);
            }}
            onSave={loadPlanningData}
          />
        )}
      </div>
    </Layout>
  );
};

// ==========================================
// 📝 MODAL AJOUT SHIFT - SÉLECTION EMPLOYÉ CORRIGÉE
// ==========================================
const AddShiftModal = ({ employees, selectedCell, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: selectedCell?.employeeId || (employees.length > 0 ? employees[0].id : ''),
    date: selectedCell?.date ? selectedCell.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    position: 'Game Master',
    notes: '',
    color: '#8B5CF6'
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      alert('Veuillez sélectionner un employé');
      return;
    }
    
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'hr_schedules'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ Erreur ajout shift:', error);
      alert('Erreur lors de l\'ajout du shift');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Ajouter un shift</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Employé *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            >
              <option value="">-- Sélectionner un employé --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.displayName || employee.email} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Poste *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            >
              <option value="Game Master">Game Master</option>
              <option value="Accueil">Accueil</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 resize-none text-sm transition-all"
              rows="2"
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-3 sm:pt-4 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all text-sm"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 text-sm"
            >
              {loading ? 'En cours...' : 'Ajouter'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// ✏️ MODAL ÉDITION SHIFT
// ==========================================
const EditShiftModal = ({ shift, employees, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: shift?.employeeId || '',
    date: shift?.date || '',
    startTime: shift?.startTime || '09:00',
    endTime: shift?.endTime || '17:00',
    position: shift?.position || 'Game Master',
    notes: shift?.notes || '',
    color: shift?.color || '#8B5CF6'
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'hr_schedules', shift.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ Erreur mise à jour shift:', error);
      alert('Erreur lors de la mise à jour du shift');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Modifier le shift</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Employé *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.displayName || employee.email} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Poste *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            >
              <option value="Game Master">Game Master</option>
              <option value="Accueil">Accueil</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1.5 sm:mb-2 text-xs sm:text-sm">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 resize-none text-sm transition-all"
              rows="2"
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-3 sm:pt-4 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all text-sm"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 text-sm"
            >
              {loading ? 'En cours...' : 'Modifier'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanningPage;
