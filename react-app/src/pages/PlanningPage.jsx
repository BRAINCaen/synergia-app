// ==========================================
// 📁 react-app/src/pages/PlanningPage.jsx
// PLANNING AVANCÉ TYPE SKELLO - SÉLECTION EMPLOYÉ CORRIGÉE
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
      
      // Charger les employés
      const employeesSnapshot = await getDocs(collection(db, 'hr_employees'));
      const employeeData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
    return matchesSearch && matchesFilter && emp.status === 'active';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement du planning...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* HEADER */}
        <div className="max-w-[1600px] mx-auto mb-6">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  📅 Planning Type Skello
                </h1>
                <p className="text-gray-400 mt-1">
                  Glisser-déposer • Copier-coller • Duplication
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={duplicateWeek}
                disabled={loading || schedules.length === 0}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                Dupliquer semaine
              </button>
              
              <button
                onClick={() => {
                  setSelectedCell(null); // Réinitialiser pour permettre la sélection libre
                  setShowAddShiftModal(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter shift
              </button>
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Shifts</p>
                  <p className="text-white text-2xl font-bold">{totalShiftsThisWeek}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Employés actifs</p>
                  <p className="text-white text-2xl font-bold">{uniqueEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total heures</p>
                  <p className="text-white text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                </div>
                <Clock className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Shift copié</p>
                  <p className="text-white text-lg font-semibold">
                    {copiedShift ? '📋 Oui' : '❌ Non'}
                  </p>
                </div>
                <Clipboard className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
          
          {/* Navigation semaine et filtres */}
          <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            
            <div className="flex items-center gap-3">
              <button
                onClick={previousWeek}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <p className="text-white font-semibold text-lg">
                  {formatDateDisplay(getWeekStart(currentWeek))} - {formatDateDisplay(getWeekEnd(currentWeek))}
                </p>
                <p className="text-gray-400 text-sm">
                  Semaine {Math.ceil((currentWeek - new Date(currentWeek.getFullYear(), 0, 1)) / 604800000)}
                </p>
              </div>
              
              <button
                onClick={nextWeek}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">Tous les postes</option>
                <option value="Game Master">Game Master</option>
                <option value="Accueil">Accueil</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* GRILLE PLANNING */}
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
            
            {/* En-têtes jours */}
            <div className="grid grid-cols-8 bg-gray-800/80 border-b border-gray-700">
              <div className="p-4 border-r border-gray-700">
                <p className="text-gray-400 text-sm font-medium">Employé</p>
              </div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="p-4 text-center border-r border-gray-700 last:border-r-0">
                  <p className="text-white font-semibold">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {day.getDate()}/{day.getMonth() + 1}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Lignes employés */}
            {filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucun employé trouvé</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div 
                  key={employee.id}
                  className="grid grid-cols-8 border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                >
                  {/* Colonne employé */}
                  <div className="p-4 border-r border-gray-700 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {employee.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {employee.displayName || 'Sans nom'}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
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
                        className={`p-2 border-r border-gray-700 last:border-r-0 min-h-[100px] transition-colors ${
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
                            draggable
                            onDragStart={(e) => handleDragStart(e, shift)}
                            onDragEnd={handleDragEnd}
                            className="bg-purple-500/30 border border-purple-500/50 rounded-lg p-2 cursor-move hover:bg-purple-500/40 transition-colors group"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-1 text-purple-300 text-xs">
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyShift(shift);
                                  }}
                                  className="p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded"
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
                                  className="p-1 bg-green-500/20 hover:bg-green-500/40 rounded"
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3 text-green-300" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteShift(shift.id);
                                  }}
                                  className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-300" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-white text-sm font-medium truncate">
                              {shift.position}
                            </p>
                            
                            {shift.notes && (
                              <p className="text-gray-300 text-xs truncate mt-1">
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
                            className="w-full h-full min-h-[80px] flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-gray-700/30 rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Légende */}
        <div className="max-w-[1600px] mx-auto mt-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2 font-medium">💡 Aide :</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">🖱️</span>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium">Glisser-déposer</span> : Cliquez et faites glisser un shift vers une autre cellule
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">📋</span>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium">Copier-coller</span> : Cliquez sur le bouton copier, puis double-cliquez sur une cellule vide
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">🔄</span>
                <p className="text-gray-300 text-sm">
                  <span className="font-medium">Dupliquer</span> : Utilisez le bouton "Dupliquer semaine" pour répliquer tout le planning
                </p>
              </div>
            </div>
          </div>
        </div>
        
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
// 📝 MODAL AJOUT SHIFT - SÉLECTION EMPLOYÉ FONCTIONNELLE
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Ajouter un shift</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ SÉLECTION EMPLOYÉ FONCTIONNELLE */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Employé *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Sélectionner un employé --</option>
              {employees
                .filter(e => e.status === 'active')
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.displayName || employee.email} - {employee.position}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Poste *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Game Master">Game Master</option>
              <option value="Accueil">Accueil</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              rows="3"
              placeholder="Notes optionnelles..."
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'En cours...' : 'Ajouter'}
            </button>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Modifier le shift</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Employé *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.displayName || employee.email} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Poste *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Game Master">Game Master</option>
              <option value="Accueil">Accueil</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              rows="3"
              placeholder="Notes optionnelles..."
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'En cours...' : 'Modifier'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanningPage;
