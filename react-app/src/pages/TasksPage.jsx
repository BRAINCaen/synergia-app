// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC TOUTES FONCTIONNALITÉS - CORRECTIONS PRÉCISES SEULEMENT
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
  Archive,
  Repeat
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
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ✅ INTÉGRATION SYSTÈME HISTORIQUE - PRÉSERVÉ
  const { 
    history, 
    stats: historyStats, 
    loading: historyLoading,
    getWeeklyTrends,
    getTopTasks
  } = useTaskHistory({
    limit: 10
  });

  // Chargement initial
  useEffect(() => {
    if (user && !authLoading) {
      loadTasks();
    }
  }, [user, authLoading]);

  /**
   * 📚 CHARGER LES TÂCHES - CORRIGÉ POUR ERREUR DE CHARGEMENT
   */
  const loadTasks = async () => {
    if (!user?.uid) {
      console.log('⏳ [TASKS] Utilisateur non connecté, attente...');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('📚 [TASKS] Chargement des tâches...');
      
      // ✅ CORRECTION ERREUR CHARGEMENT - Gestion robuste des différents formats
      const result = await taskService.getAllTasks();
      
      let fetchedTasks = [];
      
      if (Array.isArray(result)) {
        // Cas où le service retourne directement un tableau
        fetchedTasks = result;
      } else if (result && Array.isArray(result.tasks)) {
        // Cas où le service retourne un objet avec propriété tasks
        fetchedTasks = result.tasks;
      } else if (result && result.success && Array.isArray(result.data)) {
        // Cas où le service retourne un objet de succès
        fetchedTasks = result.data;
      } else {
        console.warn('⚠️ [TASKS] Format de réponse inattendu:', result);
        setError('Format de données inattendu du service');
        setTasks([]);
        return;
      }
      
      console.log('✅ [TASKS] TOUTES LES TÂCHES chargées:', fetchedTasks.length);
      
      // ✅ GARDER TOUTES LES TÂCHES - PAS DE FILTRAGE ICI
      setTasks(fetchedTasks);
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIQUE DE TRI DES TÂCHES - CORRIGÉE SELON VOS SPÉCIFICATIONS EXACTES
  
  // 📝 MES TÂCHES : Tâches qui me sont assignées UNIQUEMENT
  const myTasks = tasks.filter(task => {
    if (!task || !user?.uid) return false;
    
    // Vérifier si la tâche m'est assignée
    const isAssignedToMe = task.assignedTo && (
      (Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid)) ||
      (typeof task.assignedTo === 'string' && task.assignedTo === user.uid)
    );
    
    return isAssignedToMe;
  });

  // 💡 DISPONIBLES : Tâches SANS assignation
  const availableTasks = tasks.filter(task => {
    if (!task || !user?.uid) return false;
    
    // Tâche sans assignation = pas d'assignedTo OU assignedTo vide
    const hasNoAssignment = !task.assignedTo || 
      (Array.isArray(task.assignedTo) && task.assignedTo.length === 0) ||
      (typeof task.assignedTo === 'string' && task.assignedTo.trim() === '');
    
    // Exclure les tâches terminées/archivées
    const isActive = task.status !== 'completed' && 
                     task.status !== 'archived' && 
                     !task.isDeleted;
    
    return hasNoAssignment && isActive;
  });

  // 👥 AUTRES : Tâches assignées à d'AUTRES utilisateurs
  const otherTasks = tasks.filter(task => {
    if (!task || !user?.uid) return false;
    
    // Tâche assignée à quelqu'un d'autre (pas à moi)
    const isAssignedToOthers = task.assignedTo && (
      (Array.isArray(task.assignedTo) && 
       task.assignedTo.length > 0 && 
       !task.assignedTo.includes(user.uid)) ||
      (typeof task.assignedTo === 'string' && 
       task.assignedTo.trim() !== '' && 
       task.assignedTo !== user.uid)
    );
    
    return isAssignedToOthers;
  });

  /**
   * 🎯 SYSTÈME DE FILTRAGE AVANCÉ - PRÉSERVÉ
   */
  const getFilteredTasks = (taskList) => {
    return taskList.filter(task => {
      if (!task) return false;
      
      // Filtre par terme de recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }
      
      // Filtre par statut
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          const activeStatuses = ['todo', 'in_progress', 'pending', 'open'];
          if (!activeStatuses.includes(task.status || 'todo')) return false;
        } else if (task.status !== statusFilter) {
          return false;
        }
      }
      
      // Filtre par priorité
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // ✅ FILTRE PAR RÔLE SYNERGIA - CORRIGÉ
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
   * 📋 OBTENIR LES TÂCHES ACTUELLES SELON L'ONGLET - LOGIQUE CORRIGÉE
   */
  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'my':
        return getFilteredTasks(myTasks);
      case 'available':
        return getFilteredTasks(availableTasks);
      case 'other':
        return getFilteredTasks(otherTasks);
      case 'history':
        // 📚 HISTORIQUE : Tâches terminées ET validées par admin
        const completedTasks = tasks.filter(task => 
          task.status === 'completed' || 
          task.status === 'validated' || 
          task.isValidated === true
        );
        return getFilteredTasks(completedTasks.concat(history || []));
      default:
        return [];
    }
  };

  /**
   * ✅ GESTIONNAIRE CRÉATION TÂCHE - PRÉSERVÉ
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
        
        setShowCreateModal(false);
        setSelectedTask(null);
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
   * 📝 GESTIONNAIRE MODIFICATION TÂCHE - PRÉSERVÉ
   */
  const handleEditTask = async (taskData) => {
    console.log('📝 [TASKS] Modification tâche:', taskData.title);
    
    setSubmitting(true);
    
    try {
      const result = await taskService.updateTask(selectedTask.id, taskData);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche modifiée:', selectedTask.id);
        
        setShowCreateModal(false);
        setSelectedTask(null);
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
   * 🗑️ GESTIONNAIRE SUPPRESSION TÂCHE - PRÉSERVÉ
   */
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      console.log('🗑️ [TASKS] Suppression tâche:', taskId);
      
      const result = await taskService.deleteTask(taskId);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche supprimée:', taskId);
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
   * 📤 GESTIONNAIRE SOUMISSION TÂCHE - PRÉSERVÉ
   */
  const handleSubmitTask = async (task) => {
    try {
      console.log('📤 [TASKS] Soumission pour validation:', task.title);
      setSelectedTask(task);
      setShowSubmissionModal(true);
    } catch (error) {
      console.error('❌ [TASKS] Erreur soumission:', error);
      setError(error.message);
    }
  };

  /**
   * 🙋‍♂️ GESTIONNAIRE VOLONTARIAT - REMIS
   */
  const handleVolunteer = async (taskId) => {
    try {
      setSubmitting(true);
      console.log('🙋‍♂️ [TASKS] Volontariat pour tâche:', taskId);
      
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Tâche non trouvée');
      
      // Ajouter l'utilisateur aux assignés
      const updatedAssignedTo = [...(task.assignedTo || []), user.uid];
      
      const result = await taskService.updateTask(taskId, {
        assignedTo: updatedAssignedTo,
        status: task.status === 'pending' ? 'in_progress' : task.status,
        volunteerDate: new Date(),
        updatedAt: new Date()
      });
      
      if (result.success) {
        console.log('✅ [TASKS] Volontariat enregistré');
        await loadTasks();
        
        if (window.showNotification) {
          window.showNotification('✅ Vous vous êtes porté volontaire pour cette tâche !', 'success');
        }
      } else {
        throw new Error(result.message || 'Erreur lors du volontariat');
      }
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur volontariat:', error);
      setError(error.message);
      
      if (window.showNotification) {
        window.showNotification('❌ ' + error.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🚪 GESTIONNAIRE RETRAIT VOLONTARIAT - REMIS
   */
  const handleUnvolunteer = async (taskId) => {
    try {
      setSubmitting(true);
      console.log('🚪 [TASKS] Retrait volontariat:', taskId);
      
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous retirer de cette tâche ?');
      if (!confirmed) return;
      
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Tâche non trouvée');
      
      // Retirer l'utilisateur des assignés
      const updatedAssignedTo = (task.assignedTo || []).filter(id => id !== user.uid);
      
      const result = await taskService.updateTask(taskId, {
        assignedTo: updatedAssignedTo,
        status: updatedAssignedTo.length === 0 ? 'pending' : task.status,
        updatedAt: new Date()
      });
      
      if (result.success) {
        console.log('✅ [TASKS] Retrait volontariat réussi');
        await loadTasks();
        
        if (window.showNotification) {
          window.showNotification('✅ Vous vous êtes retiré de cette tâche', 'success');
        }
      } else {
        throw new Error(result.message || 'Erreur lors du retrait');
      }
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur retrait volontariat:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🎨 FONCTION BADGE STATUT - PRÉSERVÉE
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      todo: { label: 'À faire', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: <Target className="w-3 h-3" /> },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
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

        {/* ✅ STATISTIQUES HISTORIQUE - PRÉSERVÉES (si onglet historique) */}
        {activeTab === 'history' && historyStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">XP Total</p>
                  <p className="text-xl font-bold text-white">{historyStats.totalXP || 0}</p>
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

        {/* ✅ BOUTONS DE FILTRAGE RAPIDE PAR RÔLES SYNERGIA - AJOUTÉS */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Filtrer par rôle Synergia</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 Tous les rôles
            </button>
            
            <button
              onClick={() => setRoleFilter('gamemaster')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'gamemaster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎮 Game Master
            </button>
            
            <button
              onClick={() => setRoleFilter('maintenance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'maintenance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🛠️ Entretien & Maintenance
            </button>
            
            <button
              onClick={() => setRoleFilter('reputation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFit handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      console.log('🗑️ [TASKS] Suppression tâche:', taskId);
      
      const result = await taskService.deleteTask(taskId);
      
      if (result.success) {
        console.log('✅ [TASKS] Tâche supprimée:', taskId);
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
   * 📤 GESTIONNAIRE SOUMISSION TÂCHE - PRÉSERVÉ
   */
  const handleSubmitTask = async (task) => {
    try {
      console.log('📤 [TASKS] Soumission pour validation:', task.title);
      setSelectedTask(task);
      setShowSubmissionModal(true);
    } catch (error) {
      console.error('❌ [TASKS] Erreur soumission:', error);
      setError(error.message);
    }
  };

  /**
   * ✅ GESTIONNAIRE SUCCÈS SOUMISSION - PRÉSERVÉ
   */
  const handleSubmissionSuccess = async () => {
    console.log('✅ [TASKS] Soumission réussie');
    
    setShowSubmissionModal(false);
    setSelectedTask(null);
    await loadTasks();
    
    if (window.showNotification) {
      window.showNotification('✅ Tâche soumise pour validation !', 'success');
    }
  };

  /**
   * 🎨 FONCTION BADGE STATUT - PRÉSERVÉE
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      todo: { label: 'À faire', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: <Target className="w-3 h-3" /> },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
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

        {/* ✅ STATISTIQUES HISTORIQUE - PRÉSERVÉES (si onglet historique) */}
        {activeTab === 'history' && historyStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">XP Total</p>
                  <p className="text-xl font-bold text-white">{historyStats.totalXP || 0}</p>
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

        {/* ✅ BOUTONS DE FILTRAGE RAPIDE PAR RÔLES SYNERGIA - AJOUTÉS */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Filtrer par rôle Synergia</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 Tous les rôles
            </button>
            
            <button
              onClick={() => setRoleFilter('gamemaster')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'gamemaster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎮 Game Master
            </button>
            
            <button
              onClick={() => setRoleFilter('maintenance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'maintenance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🛠️ Entretien & Maintenance
            </button>
            
            <button
              onClick={() => setRoleFilter('reputation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'reputation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🌟 Gestion des Avis
            </button>
            
            <button
              onClick={() => setRoleFilter('stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'stock'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📦 Gestion des Stocks
            </button>
            
            <button
              onClick={() => setRoleFilter('organization')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'organization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🗓️ Organisation Interne
            </button>
            
            <button
              onClick={() => setRoleFilter('content')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'content'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎬 Création de Contenu
            </button>
            
            <button
              onClick={() => setRoleFilter('mentoring')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'mentoring'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎓 Formation & Mentorat
            </button>
            
            <button
              onClick={() => setRoleFilter('partnerships')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'partnerships'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🤝 Partenariats
            </button>
            
            <button
              onClick={() => setRoleFilter('communication')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'communication'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📱 Communication
            </button>
            
            <button
              onClick={() => setRoleFilter('b2b')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'b2b'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💼 Relations B2B
            </button>
          </div>
        </div>

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

        {/* Filtres et recherche - PRÉSERVÉS */}
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
          </div>
        )}

        {/* Liste des tâches - PRÉSERVÉE COMPLÈTEMENT */}
        <div className="space-y-4">
          <AnimatePresence>
            {currentTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'my' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
                  {activeTab === 'available' && 'Aucune tâche disponible actuellement.'}
                  {activeTab === 'other' && 'Aucune tâche d\'autres équipes trouvée.'}
                  {activeTab === 'history' && 'Aucune tâche complétée dans votre historique.'}
                </p>
              </motion.div>
            ) : (
              currentTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {task.title || 'Tâche sans titre'}
                        </h3>
                        
                        {/* Badge statut */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status).color}`}>
                          {getStatusBadge(task.status).icon}
                          {getStatusBadge(task.status).label}
                        </span>
                        
                        {/* Badge priorité */}
                        {task.priority && task.priority !== 'normal' && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : '🔵'} 
                            {task.priority}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-300 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {task.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.createdAt.seconds ? task.createdAt.seconds * 1000 : task.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        
                        {task.xpReward && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {task.xpReward} XP
                          </span>
                        )}
                        
                        {task.projectId && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Projet
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions - PRÉSERVÉES */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {(task.createdBy === user?.uid || task.assignedTo?.includes?.(user?.uid)) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowCreateModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals - PRÉSERVÉS COMPLÈTEMENT */}
      {showCreateModal && (
        <NewTaskModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? handleEditTask : handleCreateTask}
          task={selectedTask}
          isLoading={submitting}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={showDetailModal}
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
            setSelectedTask(null);
            handleDeleteTask(selectedTask.id);
          }}
          onSubmit={handleSubmitTask}
          currentUser={user}
        />
      )}

      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          task={selectedTask}
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={async (submissionData) => {
            try {
              await taskValidationServiceEnhanced.submitTaskForValidation({
                ...submissionData,
                taskId: selectedTask.id,
                userId: user.uid,
                taskTitle: selectedTask.title
              });
              handleSubmissionSuccess();
            } catch (error) {
              console.error('Erreur soumission:', error);
              setError(error.message);
            }
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
