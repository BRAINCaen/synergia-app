// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC SYSTÈME D'HISTORIQUE INTÉGRÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Users,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  Calendar,
  Target,
  Zap,
  Trophy,
  Archive
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { createTaskSafely } from '../core/services/taskCreationFix.js';
import { taskValidationServiceEnhanced } from '../core/services/taskValidationServiceEnhanced.js';
import { useTaskHistory } from '../shared/hooks/useTaskHistory.js';

// Composants
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';
import TaskDetailModal from '../components/tasks/TaskDetailsModal.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';

const TasksPage = () => {
  const { user, loading: authLoading } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // États de filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [statusFilter, setStatusFilter] = useState('active'); // ✅ CHANGÉ DE 'all' à 'active'
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ✅ INTÉGRATION SYSTÈME HISTORIQUE
  const { history, stats: historyStats, loading: historyLoading } = useTaskHistory({
    limit: 10 // Charger les 10 dernières tâches de l'historique
  });

  // Chargement initial
  useEffect(() => {
    if (user && !authLoading) {
      loadTasks();
    }
  }, [user, authLoading]);

  /**
   * 📚 CHARGER LES TÂCHES AVEC FILTRAGE DES ARCHIVÉES
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📚 [TASKS] Chargement des tâches actives...');
      const fetchedTasks = await taskService.getAllTasks();
      
      // ✅ FILTRER LES TÂCHES ARCHIVÉES ET TERMINÉES
      const activeTasks = (fetchedTasks || []).filter(task => {
        // Exclure les tâches archivées
        if (task.status === 'archived') return false;
        
        // Exclure les tâches terminées (completed) sauf si on veut les voir
        if (task.status === 'completed' && statusFilter !== 'completed') return false;
        
        // Exclure les tâches marquées comme supprimées
        if (task.isDeleted || task.archived || task.archivedAt) return false;
        
        return true;
      });
      
      console.log('✅ [TASKS] Tâches actives chargées:', activeTasks.length);
      console.log('📊 [TASKS] Tâches filtrées (archivées exclues):', fetchedTasks.length - activeTasks.length);
      
      setTasks(activeTasks);
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 RÉPARTITION DES TÂCHES ACTIVES UNIQUEMENT
   */
  const myTasks = tasks.filter(task => 
    Array.isArray(task.assignedTo) && 
    task.assignedTo.includes(user?.uid) &&
    task.status !== 'archived' &&
    task.status !== 'completed' // ✅ Exclure les terminées de "Mes tâches"
  );
  
  const availableTasks = tasks.filter(task => 
    (!Array.isArray(task.assignedTo) || task.assignedTo.length === 0) &&
    task.status !== 'archived' &&
    task.status !== 'completed' &&
    (task.openToVolunteers !== false) // Ouvert aux volontaires
  );
  
  const otherTasks = tasks.filter(task => 
    Array.isArray(task.assignedTo) && 
    task.assignedTo.length > 0 && 
    !task.assignedTo.includes(user?.uid) &&
    task.status !== 'archived' &&
    task.status !== 'completed'
  );

  /**
   * 🔍 APPLIQUER LES FILTRES DE RECHERCHE
   */
  const getFilteredTasks = (taskList) => {
    return taskList.filter(task => {
      // Filtre par texte de recherche
      if (searchTerm && 
          !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre par statut
      if (statusFilter === 'active') {
        // Statuts actifs uniquement
        return ['todo', 'in_progress', 'assigned', 'pending_review'].includes(task.status);
      } else if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      
      // Filtre par priorité
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // Filtre par rôle Synergia
      if (roleFilter !== 'all') {
        const taskRole = task.roleId || task.synergiaRole || task.role || task.category;
        if (!taskRole || taskRole !== roleFilter) {
          return false;
        }
      }
      
      return true;
    });
  };

  /**
   * 📋 OBTENIR LES TÂCHES ACTUELLES SELON L'ONGLET
   */
  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'my':
        return getFilteredTasks(myTasks);
      case 'available':
        return getFilteredTasks(availableTasks);
      case 'other':
        return getFilteredTasks(otherTasks);
      case 'history': // ✅ NOUVEL ONGLET HISTORIQUE
        return history || [];
      default:
        return [];
    }
  };

  /**
   * ✅ GESTIONNAIRE CRÉATION TÂCHE AVEC RECHARGEMENT
   */
  const handleCreateTask = async (taskData) => {
    console.log('🚀 [TASKS] Création tâche:', taskData.title);
    
    setSubmitting(true);
    setError('');
    
    try {
      if (!user || !user.uid) {
        throw new Error('Utilisateur non connecté');
      }
      
      if (!taskData || !taskData.title) {
        throw new Error('Données de tâche invalides');
      }
      
      const result = await createTaskSafely(taskData, user);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche créée:', result.id);
        
        // Fermer le modal
        setShowCreateModal(false);
        setSelectedTask(null);
        
        // ✅ RECHARGER LES TÂCHES POUR MISE À JOUR IMMÉDIATE
        await loadTasks();
        
        if (window.showNotification) {
          window.showNotification('✅ Tâche créée avec succès !', 'success');
        }
      } else {
        throw new Error(result.message || 'Erreur lors de la création');
      }
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur création:', error);
      setError(error.message);
      
      if (window.showNotification) {
        window.showNotification('❌ ' + error.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📝 GESTIONNAIRE MODIFICATION TÂCHE
   */
  const handleEditTask = async (taskData) => {
    console.log('📝 [TASKS] Modification tâche:', taskData.title);
    
    setSubmitting(true);
    
    try {
      // Utiliser le service de mise à jour des tâches
      const result = await taskService.updateTask(selectedTask.id, taskData);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche modifiée:', selectedTask.id);
        
        setShowCreateModal(false);
        setSelectedTask(null);
        
        // Recharger les tâches
        await loadTasks();
        
        if (window.showNotification) {
          window.showNotification('✅ Tâche modifiée avec succès !', 'success');
        }
      } else {
        throw new Error(result.message || 'Erreur lors de la modification');
      }
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur modification:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🗑️ GESTIONNAIRE SUPPRESSION TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      console.log('🗑️ [TASKS] Suppression tâche:', taskId);
      
      const result = await taskService.deleteTask(taskId);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche supprimée:', taskId);
        
        // Recharger les tâches
        await loadTasks();
        
        if (window.showNotification) {
          window.showNotification('✅ Tâche supprimée avec succès !', 'success');
        }
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression:', error);
      setError(error.message);
    }
  };

  /**
   * 📤 GESTIONNAIRE SOUMISSION TÂCHE POUR VALIDATION
   */
  const handleSubmitTask = async (task) => {
    try {
      console.log('📤 [TASKS] Soumission pour validation:', task.title);
      
      // Ouvrir le modal de soumission
      setSelectedTask(task);
      setShowSubmissionModal(true);
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur soumission:', error);
      setError(error.message);
    }
  };

  /**
   * ✅ GESTIONNAIRE SUCCÈS SOUMISSION
   */
  const handleSubmissionSuccess = async () => {
    console.log('✅ [TASKS] Soumission réussie');
    
    // Fermer le modal
    setShowSubmissionModal(false);
    setSelectedTask(null);
    
    // ✅ RECHARGER LES TÂCHES POUR RETIRER LA TÂCHE SOUMISE
    await loadTasks();
    
    if (window.showNotification) {
      window.showNotification('✅ Tâche soumise pour validation !', 'success');
    }
  };

  /**
   * 🎨 FORMATER LA DIFFICULTÉ
   */
  const formatDifficulty = (difficulty) => {
    const difficultyMap = {
      easy: { label: 'Facile', color: 'text-green-600 bg-green-100', icon: '😊' },
      medium: { label: 'Moyen', color: 'text-yellow-600 bg-yellow-100', icon: '😐' },
      hard: { label: 'Difficile', color: 'text-orange-600 bg-orange-100', icon: '😤' },
      expert: { label: 'Expert', color: 'text-red-600 bg-red-100', icon: '🔥' }
    };
    
    return difficultyMap[difficulty] || difficultyMap.medium;
  };

  /**
   * 🎨 FORMATER LA PRIORITÉ
   */
  const formatPriority = (priority) => {
    const priorityMap = {
      low: { label: 'Faible', color: 'text-gray-600' },
      medium: { label: 'Moyenne', color: 'text-blue-600' },
      high: { label: 'Haute', color: 'text-orange-600' },
      urgent: { label: 'Urgente', color: 'text-red-600' }
    };
    
    return priorityMap[priority] || priorityMap.medium;
  };

  /**
   * 🎨 FORMATER LE STATUT
   */
  const formatStatus = (status) => {
    const statusMap = {
      todo: { label: 'À faire', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: <Zap className="w-3 h-3" /> },
      pending_review: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      archived: { label: 'Archivée', color: 'bg-gray-100 text-gray-500', icon: <Archive className="w-3 h-3" /> }
    };
    
    return statusMap[status] || statusMap.todo;
  };

  // Interface de chargement
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Chargement des tâches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTasks = getCurrentTasks();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestion des Tâches
            </h1>
            <p className="text-gray-400">
              Gérez vos tâches assignées et participez aux projets collaboratifs
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle tâche
          </button>
        </div>

        {/* Statistiques rapides */}
        {historyStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tâches terminées</p>
                  <p className="text-xl font-bold text-white">{historyStats.totalTasksCompleted || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">XP total gagné</p>
                  <p className="text-xl font-bold text-white">{historyStats.totalXpEarned || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cette semaine</p>
                  <p className="text-xl font-bold text-white">{historyStats.tasksThisWeek || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Repeat className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Récurrentes</p>
                  <p className="text-xl font-bold text-white">{historyStats.totalRecurringCompleted || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-100">{error}</p>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Mes tâches ({myTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'available'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            Disponibles ({availableTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('other')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'other'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Autres ({otherTasks.length})
          </button>

          {/* ✅ NOUVEL ONGLET HISTORIQUE */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Archive className="w-4 h-4" />
            Historique ({history?.length || 0})
          </button>
        </div>

        {/* Filtres et recherche */}
        {activeTab !== 'history' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des tâches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Tâches actives</option>
                <option value="all">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="pending_review">En attente</option>
                <option value="completed">Terminées</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            
            {/* Filtres par rôle Synergia */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ⭐ Tous les rôles
              </button>
              
              <button
                onClick={() => setRoleFilter('maintenance')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'maintenance'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🔧 Maintenance
              </button>
              
              <button
                onClick={() => setRoleFilter('reputation')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'reputation'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ⭐ Réputation
              </button>
              
              <button
                onClick={() => setRoleFilter('organization')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'organization'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📋 Organisation
              </button>
              
              <button
                onClick={() => setRoleFilter('communication')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === 'communication'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📱 Communication
              </button>
            </div>
          </div>
        )}

        {/* Liste des tâches */}
        <div className="space-y-4">
          {currentTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                {activeTab === 'history' ? (
                  <Archive className="w-8 h-8 text-gray-400" />
                ) : (
                  <Target className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {activeTab === 'history' ? 'Aucun historique' : 'Aucune tâche trouvée'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'history' 
                  ? 'Vos tâches terminées apparaîtront ici'
                  : searchTerm 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Créez votre première tâche pour commencer'
                }
              </p>
            </div>
          ) : (
            currentTasks.map((task) => {
              const difficultyInfo = formatDifficulty(task.difficulty);
              const priorityInfo = formatPriority(task.priority);
              const statusInfo = formatStatus(task.status);
              const isHistoryItem = activeTab === 'history';
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {task.title}
                        </h3>
                        
                        {!isHistoryItem && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${difficultyInfo.color}`}>
                          {difficultyInfo.icon} {difficultyInfo.label}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs font-medium ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                        
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                          +{task.xpReward || 0} XP
                        </span>

                        {isHistoryItem && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            ✅ Terminée le {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {task.createdBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Créé par {task.creatorName || 'Utilisateur'}
                          </span>
                        )}
                        
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Échéance: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        
                        {task.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {task.estimatedHours}h estimées
                          </span>
                        )}

                        {isHistoryItem && task.timeSpent && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {Math.round(task.timeSpent / 60)}min passées
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isHistoryItem && task.status !== 'completed' && (
                        <>
                          {/* Soumettre pour validation */}
                          {(task.assignedTo?.includes(user?.uid) || task.createdBy === user?.uid) && (
                            <button
                              onClick={() => handleSubmitTask(task)}
                              className="p-2 text-green-400 hover:text-white hover:bg-green-700 rounded-lg transition-colors"
                              title="Soumettre pour validation"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Modifier */}
                          {task.createdBy === user?.uid && (
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowCreateModal(true);
                              }}
                              className="p-2 text-blue-400 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Supprimer */}
                          {task.createdBy === user?.uid && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-red-400 hover:text-white hover:bg-red-700 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modals */}
        <NewTaskModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          onSuccess={selectedTask ? handleEditTask : handleCreateTask}
          initialData={selectedTask}
          mode={selectedTask ? 'edit' : 'create'}
          submitting={submitting}
        />

        {showDetailModal && selectedTask && (
          <TaskDetailModal
            isOpen={showDetailModal}
            task={selectedTask}
            currentUser={user}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTask(null);
            }}
            onEdit={() => {
              setShowDetailModal(false);
              setShowCreateModal(true);
            }}
            onDelete={() => {
              setShowDetailModal(false);
              handleDeleteTask(selectedTask.id);
            }}
            onSubmit={() => {
              setShowDetailModal(false);
              handleSubmitTask(selectedTask);
            }}
          />
        )}

        {showSubmissionModal && selectedTask && (
          <TaskSubmissionModal
            isOpen={showSubmissionModal}
            task={selectedTask}
            onClose={() => {
              setShowSubmissionModal(false);
              setSelectedTask(null);
            }}
            onSubmit={handleSubmissionSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
