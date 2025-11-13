// ==========================================
// 📁 react-app/src/pages/PlanningPage.jsx
// PLANNING TYPE SKELLO - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  Edit,
  Users,
  Clock,
  AlertTriangle,
  X,
  Search,
  RefreshCw
} from 'lucide-react';

// Imports
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase
import { 
  collection, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 📅 FONCTION HELPER - OBTENIR LES DATES DE LA SEMAINE
 */
const getWeekDates = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay() + 1; // Lundi
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(curr);
    day.setDate(first + i);
    week.push({
      date: day,
      dateStr: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: day.getDate()
    });
  }
  
  return week;
};

/**
 * 📅 PAGE DE PLANNING TYPE SKELLO
 */
const PlanningPage = () => {
  const { user } = useAuthStore();

  // États
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedShift, setCopiedShift] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalHours: 0,
    employeesScheduled: 0,
    shiftsCount: 0,
    coverage: 0
  });

  /**
   * 📅 INITIALISER LA SEMAINE COURANTE
   */
  useEffect(() => {
    setCurrentWeek(getWeekDates(new Date()));
  }, []);

  /**
   * 📊 CHARGER LES DONNÉES
   */
  useEffect(() => {
    if (currentWeek.length > 0) {
      loadData();
    }
  }, [currentWeek]);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadEmployees();
      await loadShifts();
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('displayName', 'asc'));
      const snapshot = await getDocs(q);
      
      const usersList = [];
      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        usersList.push({
          id: docSnap.id,
          name: userData.displayName || userData.email,
          email: userData.email,
          photoURL: userData.photoURL,
          role: userData.synergiaRoles?.[0] || 'employee',
          status: 'active'
        });
      });

      setEmployees(usersList);
      console.log(`✅ ${usersList.length} employés chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement employés:', error);
    }
  };

  const loadShifts = async () => {
    if (currentWeek.length === 0) return;

    try {
      const shiftsRef = collection(db, 'shifts');
      const startDate = currentWeek[0].dateStr;
      const endDate = currentWeek[6].dateStr;
      
      const q = query(
        shiftsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const shiftsList = [];
      snapshot.forEach((docSnap) => {
        shiftsList.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setShifts(shiftsList);
      console.log(`✅ ${shiftsList.length} shifts chargés`);
      calculateStats(shiftsList);
    } catch (error) {
      console.error('❌ Erreur chargement shifts:', error);
    }
  };

  const calculateStats = (shiftsList) => {
    const totalHours = shiftsList.reduce((acc, shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);

    const uniqueEmployees = new Set(shiftsList.map(s => s.employeeId)).size;
    const coverage = employees.length > 0 ? (shiftsList.length / (employees.length * 7)) * 100 : 0;

    setStats({
      totalHours: Math.round(totalHours),
      employeesScheduled: uniqueEmployees,
      shiftsCount: shiftsList.length,
      coverage: Math.round(coverage)
    });
  };

  const handleAddShift = async (shiftData) => {
    try {
      await addDoc(collection(db, 'shifts'), {
        ...shiftData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      await loadShifts();
      setShowAddModal(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleEditShift = async (shiftId, updateData) => {
    try {
      await updateDoc(doc(db, 'shifts', shiftId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      await loadShifts();
      setSelectedShift(null);
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Supprimer ce shift ?')) return;
    try {
      await deleteDoc(doc(db, 'shifts', shiftId));
      await loadShifts();
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };

  const handleCopyShift = (shift) => {
    setCopiedShift(shift);
    alert('✅ Shift copié !');
  };

  const handlePasteShift = async (employeeId, date) => {
    if (!copiedShift) return;
    try {
      await addDoc(collection(db, 'shifts'), {
        employeeId,
        date,
        startTime: copiedShift.startTime,
        endTime: copiedShift.endTime,
        position: copiedShift.position,
        color: copiedShift.color,
        notes: copiedShift.notes,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      await loadShifts();
      setCopiedShift(null);
      alert('✅ Shift collé !');
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };

  const getShiftsForCell = (employeeId, dateStr) => {
    return shifts.filter(s => s.employeeId === employeeId && s.date === dateStr);
  };

  const getPositionColor = (position) => {
    const colors = {
      'Game Master': 'bg-blue-500',
      'Accueil': 'bg-green-500',
      'Maintenance': 'bg-orange-500',
      'Manager': 'bg-purple-500',
      'Formateur': 'bg-yellow-500'
    };
    return colors[position] || 'bg-gray-500';
  };

  const goToPreviousWeek = () => {
    if (currentWeek.length === 0) return;
    const prevWeek = new Date(currentWeek[0].date);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(getWeekDates(prevWeek));
  };

  const goToNextWeek = () => {
    if (currentWeek.length === 0) return;
    const nextWeek = new Date(currentWeek[0].date);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(getWeekDates(nextWeek));
  };

  const goToToday = () => {
    setCurrentWeek(getWeekDates(new Date()));
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || currentWeek.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Chargement du planning...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-[1600px] mx-auto">
          
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  📅 Planning Équipe
                </h1>
                <p className="text-gray-400 text-lg">
                  Gestion visuelle des horaires
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Heures totales</h3>
              </div>
              <div className="text-3xl font-bold">{stats.totalHours}h</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Employés</h3>
              </div>
              <div className="text-3xl font-bold">{stats.employeesScheduled}/{employees.length}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Shifts</h3>
              </div>
              <div className="text-3xl font-bold">{stats.shiftsCount}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-sm font-medium opacity-90">Couverture</h3>
              </div>
              <div className="text-3xl font-bold">{stats.coverage}%</div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={goToPreviousWeek} className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={goToToday} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Aujourd'hui
                </button>
                <button onClick={goToNextWeek} className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="text-white font-semibold ml-4">
                  Semaine du {currentWeek[0].date.toLocaleDateString('fr-FR')} au {currentWeek[6].date.toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* GRILLE */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-900/50 p-4 text-left text-white font-semibold w-48">
                      Employé
                    </th>
                    {currentWeek.map((day, index) => (
                      <th key={index} className="p-4 text-center text-white font-semibold min-w-[150px]">
                        <div className="text-sm opacity-70">{day.dayName}</div>
                        <div className="text-lg">{day.dayNumber}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-gray-800/80 backdrop-blur-sm p-4 border-r border-gray-700/50">
                        <div className="flex items-center gap-3">
                          {employee.photoURL ? (
                            <img src={employee.photoURL} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{employee.name}</div>
                            <div className="text-xs text-gray-400">{employee.role}</div>
                          </div>
                        </div>
                      </td>

                      {currentWeek.map((day) => {
                        const cellShifts = getShiftsForCell(employee.id, day.dateStr);
                        
                        return (
                          <td
                            key={day.dateStr}
                            className="p-2 border-r border-gray-700/50 cursor-pointer hover:bg-gray-700/20 transition-colors min-h-[100px] align-top"
                            onClick={() => copiedShift && handlePasteShift(employee.id, day.dateStr)}
                          >
                            <div className="space-y-2">
                              {cellShifts.map((shift) => (
                                <motion.div
                                  key={shift.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`${getPositionColor(shift.position)} text-white p-2 rounded-lg text-xs group relative`}
                                >
                                  <div className="font-semibold">{shift.position}</div>
                                  <div className="opacity-90">{shift.startTime} - {shift.endTime}</div>
                                  
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyShift(shift);
                                      }}
                                      className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedShift(shift);
                                      }}
                                      className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteShift(shift.id);
                                      }}
                                      className="p-1 bg-black/30 hover:bg-black/50 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                              
                              {cellShifts.length === 0 && (
                                <div className="text-center text-gray-500 text-xs py-4">+</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {copiedShift && (
            <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <Copy className="w-5 h-5" />
              <span>Shift copié - Cliquez pour coller</span>
              <button onClick={() => setCopiedShift(null)} className="ml-2 p-1 hover:bg-white/20 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {showAddModal && (
        <ShiftModal
          employees={employees}
          currentWeek={currentWeek}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddShift}
        />
      )}

      {selectedShift && (
        <ShiftModal
          employees={employees}
          currentWeek={currentWeek}
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
          onSave={(data) => handleEditShift(selectedShift.id, data)}
        />
      )}
    </Layout>
  );
};

const ShiftModal = ({ employees, currentWeek, shift = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: shift?.employeeId || '',
    date: shift?.date || (currentWeek[0]?.dateStr || ''),
    startTime: shift?.startTime || '09:00',
    endTime: shift?.endTime || '17:00',
    position: shift?.position || 'Game Master',
    color: shift?.color || '#3B82F6',
    notes: shift?.notes || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {shift ? '✏️ Modifier' : '➕ Ajouter'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Employé *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Date *</label>
            <select
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentWeek.map((day) => (
                <option key={day.dateStr} value={day.dateStr}>
                  {day.dayName} {day.dayNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Poste *</label>
            <select
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Game Master">Game Master</option>
              <option value="Accueil">Accueil</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Manager">Manager</option>
              <option value="Formateur">Formateur</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Notes..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'En cours...' : shift ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanningPage;
