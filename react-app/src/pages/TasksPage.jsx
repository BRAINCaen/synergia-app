// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE FIREBASE PUR - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import TaskList from '../modules/tasks/TaskList.jsx';
import { 
  Plus, 
  Filter, 
  Search, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Target,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';

/**
 * ✅ TASKS PAGE FIREBASE PUR
 * Toutes les tâches proviennent exclusivement de Firebase
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ DONNÉES FIREBASE RÉELLES UNIQUEMENT
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ TÂCHES RÉELLES DEPUIS FIREBASE
  const [realTasks, setRealTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // ✅ STATISTIQUES RÉELLES CALCULÉES
  const [realTaskStats, setRealTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
    totalXpEarned: 0,
    avgXpPerTask: 0
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    complexity: 'medium',
    xpReward: 20,
    tags: []
  });

  useEffect(() => {
    if (user?.uid) {
      loadRealTasks();
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [realTasks, searchTerm, filterStatus, filterPriority]);

  /**
   * 📊 CHARGER TOUTES LES VRAIES TÂCHES FIREBASE
   */
  const loadRealTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement tâches Firebase pour:', user.uid);
      
      // Récupérer TOUTES les tâches de l'utilisateur (créées + assignées)
      const [createdTasks, assignedTasks] = await Promise.all([
        getDocs(query(
          collection(db, 'tasks'),
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc')
        )),
        getDocs(query(
          collection(db, 'tasks'),
          where('assignedTo', '==', user.uid),
          orderBy('createdAt', 'desc')
        ))
      ]);

      // Combiner et dédupliquer les tâches
      const allUserTasks = new Map();
      
      createdTasks.forEach(doc => {
        allUserTasks.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      assignedTasks.forEach(doc => {
        allUserTasks.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const tasksArray = Array.from(allUserTasks.values());
      
      // 📊 CALCULER LES VRAIES STATISTIQUES
      const total = tasksArray.length;
      const completed = tasksArray.filter(task => task.status === 'completed').length;
      const inProgress = tasksArray.filter(task => task.status === 'in-progress').length;
      const pending = tasksArray.filter(task => task.status === 'todo').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const totalXpEarned = tasksArray
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const avgXpPerTask = completed > 0 ? Math.round(totalXpEarned / completed) : 0;

      setRealTasks(tasksArray);
      setRealTaskStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate,
        totalXpEarned,
        avgXpPerTask
      });

      console.log('✅ Tâches Firebase chargées:', {
        total: tasksArray.length,
        stats: realTaskStats
      });

    } catch (error) {
      console.error('❌ Erreur chargement tâches Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 APPLIQUER LES FILTRES
   */
  const applyFilters = () => {
    let filtered = [...realTasks];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filtre par priorité
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  };

  /**
   * ✅ CRÉER NOUVELLE TÂCHE FIREBASE
   */
  const handleCreateTask = async () => {
    if (!user?.uid || !newTask.title.trim()) return;

    try {
      console.log('➕ Création tâche Firebase:', newTask.title);
      
      const taskData = {
        ...newTask,
        createdBy: user.uid,
        userId: user.uid,
        assignedTo: user.uid,
        status: 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'tasks'), taskData);
      
      // Recharger les tâches
      await loadRealTasks();
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        complexity: 'medium',
        xpReward: 20,
        tags: []
      });
      setShowCreateModal(false);
      
      console.log('✅ Tâche créée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  /**
   * 🔄 METTRE À JOUR STATUT TÂCHE
   */
  const handleUpdateTask = async (taskId, updates) => {
    try {
      console.log('🔄 Mise à jour tâche:', taskId, updates);
      
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Recharger les tâches
      await loadRealTasks();
      
      console.log('✅ Tâche mise à jour');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  /**
   * 🗑️ SUPPRIMER TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    try {
      console.log('🗑️ Suppression tâche:', taskId);
      
      await deleteDoc(doc(db, 'tasks', taskId));
      
      // Recharger les tâches
      await loadRealTasks();
      
      console.log('✅ Tâche supprimée');
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Tâches</h1>
              <p className="text-lg text-gray-600 mt-1">
                Gérez vos tâches en temps réel
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Tâche
            </button>
          </div>
        </div>

        {/* STATISTIQUES RÉELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{realTaskStats.total}</p>
              </div>
              <CheckSquare className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* Terminées */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-3xl font-bold text-green-600">{realTaskStats.completed}</p>
                <p className="text-sm text-gray-500">{realTaskStats.completionRate}% réussite</p>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* En cours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-3xl font-bold text-orange-600">{realTaskStats.inProgress}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </div>

          {/* XP Gagné */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">XP Total</p>
                <p className="text-3xl font-bold text-purple-600">{realTaskStats.totalXpEarned}</p>
                <p className="text-sm text-gray-500">~{realTaskStats.avgXpPerTask} XP/tâche</p>
              </div>
              <Award className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* SECTION GAMIFICATION */}
        {gamification && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Progression</h3>
                <p className="text-2xl font-bold">Niveau {gamification.level || 1}</p>
                <p className="text-sm opacity-90">{gamification.totalXp || 0} XP • {gamification.badges?.length || 0} badges</p>
              </div>
              <div className="text-right">
                <BarChart3 className="h-8 w-8 mb-2" />
                <p className="text-sm">Continuez comme ça !</p>
              </div>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtre Statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>

            {/* Filtre Priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        {/* LISTE DES TÂCHES RÉELLES */}
        <div className="bg-white rounded-lg shadow">
          <TaskList 
            tasks={filteredTasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            loading={loading}
          />
        </div>

        {/* MODAL CRÉATION TÂCHE */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Tâche</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom de la tâche"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de la tâche"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      XP Récompense
                    </label>
                    <input
                      type="number"
                      value={newTask.xpReward}
                      onChange={(e) => setNewTask({ ...newTask, xpReward: parseInt(e.target.value) || 20 })}
                      min="5"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
