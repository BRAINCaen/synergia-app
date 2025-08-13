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

  // Chargement initial - SIMPLIFIÉ
  useEffect(() => {
    if (!authLoading && user?.uid) {
      console.log('🚀 [TASKS] Démarrage chargement pour utilisateur:', user.uid);
      loadTasks();
    } else if (!authLoading && !user) {
      console.log('⚠️ [TASKS] Pas d\'utilisateur connecté');
      setLoading(false);
      setTasks([]);
    }
  }, [user?.uid, authLoading]);

  /**
   * 📚 CHARGER LES TÂCHES - VERSION SIMPLIFIÉE ET ROBUSTE
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
      
      console.log('📚 [TASKS] Chargement direct depuis Firestore...');
      
      // ✅ CHARGEMENT DIRECT DEPUIS FIRESTORE - PLUS SIMPLE ET FIABLE
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../core/firebase.js');
      
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const fetchedTasks = [];
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        fetchedTasks.push({
          id: doc.id,
          ...taskData
        });
      });
      
      console.log('✅ [TASKS] TOUTES LES TÂCHES chargées directement:', fetchedTasks.length);
      
      // ✅ GARDER TOUTES LES TÂCHES
      setTasks(fetchedTasks);
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement direct:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIQUE DE TRI DES TÂCHES - AVEC VÉRIFICATIONS ROBUSTES
  
  // 📝 MES TÂCHES : Tâches qui me sont assignées UNIQUEMENT
  const myTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || !user?.uid) return [];
    
    return tasks.filter(task => {
      if (!task) return false;
      
      // Vérifier si la tâche m'est assignée
      const isAssignedToMe = task.assignedTo && (
        (Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid)) ||
        (typeof task.assignedTo === 'string' && task.assignedTo === user.uid)
      );
      
      return isAssignedToMe;
    });
  }, [tasks, user?.uid]);

  // 💡 DISPONIBLES : Tâches SANS assignation
  const availableTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || !user?.uid) return [];
    
    return tasks.filter(task => {
      if (!task) return false;
      
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
  }, [tasks, user?.uid]);

  // 👥 AUTRES : Tâches assignées à d'AUTRES utilisateurs
  const otherTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || !user?.uid) return [];
    
    return tasks.filter(task => {
      if (!task) return false;
      
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
  }, [tasks, user?.uid]);

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

  // Interface de chargement - AMÉLIORÉE
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">
                {authLoading ? 'Vérification de l\'authentification...' : 'Chargement des tâches...'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Utilisateur: {user?.email || 'Non connecté'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // État sans utilisateur
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Utilisateur non connecté</h2>
              <p className="text-gray-400">Veuillez vous connecter pour accéder aux tâches</p>
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
