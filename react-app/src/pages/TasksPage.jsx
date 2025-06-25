// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// Page Tâches avec design premium sombre - Style Leaderboard
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Star,
  Trash2,
  Edit3,
  MoreVertical,
  RefreshCw,
  Target,
  Zap,
  Trophy,
  Users,
  AlertCircle,
  ChevronDown,
  SortAsc,
  Grid3X3,
  List
} from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const TasksPage = () => {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { addXP, checkAchievements } = useGameStore();
  
  // États locaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [sortBy, setSortBy] = useState('created');
  const [refreshing, setRefreshing] = useState(false);

  // Nouvelle tâche form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: ''
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Filtrer et trier les tâches
  const getFilteredTasks = () => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Statistiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };

  // Handlers
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await addTask({
        ...newTask,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Gamification
      addXP(10, '🎯 Nouvelle tâche créée');
      checkAchievements('task_created');

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
    }
  };

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    try {
      await updateTask(task.id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });

      if (newStatus === 'completed') {
        addXP(25, '✅ Tâche terminée');
        checkAchievements('task_completed');
      }
    } catch (error) {
      console.error('Erreur toggle tâche:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'todo': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          Chargement des tâches...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête Premium */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="w-10 h-10 text-blue-400" />
                Mes Tâches
              </h1>
              <p className="text-gray-400 text-lg">
                Gestion intelligente • Productivité maximale • {stats.total} tâches
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Panel principal */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Circle className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Terminées</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">En cours</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">À faire</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.todo}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">En retard</p>
                    <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* Contrôles */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                {/* Filtres */}
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="all">Toutes priorités</option>
                    <option value="high">Haute</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="created">Date création</option>
                    <option value="priority">Priorité</option>
                    <option value="dueDate">Échéance</option>
                    <option value="status">Statut</option>
                  </select>

                  {/* Toggle vue */}
                  <div className="flex bg-gray-700 rounded-xl border border-gray-600 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {tasks.length === 0 ? 'Aucune tâche créée' : 'Aucune tâche trouvée'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {tasks.length === 0 
                      ? 'Commencez par créer votre première tâche !'
                      : 'Essayez de modifier vos filtres de recherche.'
                    }
                  </p>
                  {tasks.length === 0 && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Créer ma première tâche
                    </button>
                  )}
                </div>
              ) : (
                <div className={`p-6 ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }`}>
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all group ${
                        task.status === 'completed' ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="mt-1"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-green-400 transition-colors" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium truncate ${
                              task.status === 'completed'
                                ? 'text-gray-400 line-through'
                                : 'text-white'
                            }`}>
                              {task.title}
                            </h3>
                            
                            {task.description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Meta informations */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' && '🔥 Haute'}
                            {task.priority === 'medium' && '⚡ Moyenne'}
                            {task.priority === 'low' && '📋 Basse'}
                          </span>
                          
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                            {task.status === 'todo' && '📝 À faire'}
                            {task.status === 'in_progress' && '🔄 En cours'}
                            {task.status === 'completed' && '✅ Terminé'}
                          </span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Statistiques et raccourcis */}
          <div className="space-y-6">
            
            {/* Performance du jour */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taux de complétion</span>
                  <span className="text-green-400 font-bold">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
                    <div className="text-xs text-gray-400">En cours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.todo}</div>
                    <div className="text-xs text-gray-400">À faire</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tâches prioritaires */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-400" />
                Priorité haute
              </h3>
              
              <div className="space-y-3">
                {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3).map(task => (
                  <div key={task.id} className="bg-gray-700/50 rounded-lg p-3 border border-red-500/20">
                    <div className="font-medium text-white text-sm truncate">
                      {task.title}
                    </div>
                    <div className="text-red-400 text-xs mt-1">
                      🔥 Priorité haute
                    </div>
                  </div>
                ))}
                
                {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-gray-500 text-sm">
                      Aucune tâche prioritaire
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-3 text-left hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Nouvelle tâche</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFilterStatus('todo')}
                  className="w-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-3 text-left hover:from-yellow-600/30 hover:to-orange-600/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Voir à faire</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setFilterStatus('completed')}
                  className="w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-3 text-left hover:from-green-600/30 hover:to-emerald-600/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Voir terminées</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Création Tâche */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Nouvelle Tâche
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titre de la tâche..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description optionnelle..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Échéance
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-white font-medium transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer la tâche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
