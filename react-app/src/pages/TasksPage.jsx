// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION LOGIQUE DE RÉPARTITION DES TÂCHES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Users, 
  Heart,
  Loader,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';

// Imports des composants existants seulement
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskForm from '../modules/tasks/TaskForm.jsx';
// TaskDetailModal sera géré avec un fallback si manquant

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES AVEC LOGIQUE CORRIGÉE
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux - répartition selon vos critères
  const [myTasks, setMyTasks] = useState([]); // Tâches QUI ME SONT ASSIGNÉES (pas créées par moi)
  const [availableTasks, setAvailableTasks] = useState([]); // Non assignées et ouvertes
  const [otherTasks, setOtherTasks] = useState([]); // Assignées à d'autres
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // États UI
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // États modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 🔄 CHARGER ET RÉPARTIR LES TÂCHES SELON VOS CRITÈRES EXACTS
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement et répartition des tâches...');

      if (!user?.uid) {
        console.warn('⚠️ Utilisateur non connecté');
        return;
      }

      // Récupérer toutes les tâches
      const allTasks = await taskService.getAllTasks();
      console.log(`📊 Total tâches récupérées: ${allTasks.length}`);

      // 🎯 LOGIQUE DE RÉPARTITION SELON VOS CRITÈRES EXACTS
      const myTasksArray = [];        // Tâches qui me sont assignées (pas créées par moi)
      const availableTasksArray = []; // Non assignées et ouvertes
      const otherTasksArray = [];     // Assignées à d'autres

      allTasks.forEach(task => {
        // Vérifier si je suis assigné à cette tâche
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        
        // Vérifier si la tâche a des assignés
        const hasAssignees = Array.isArray(task.assignedTo) && task.assignedTo.length > 0;
        
        // Vérifier si je suis le créateur (pour exclure de "mes tâches")
        const isMyCreation = task.createdBy === user.uid;

        if (isAssignedToMe && !isMyCreation) {
          // ✅ MES TÂCHES = Tâches qui me sont assignées (PAS celles que j'ai créées)
          myTasksArray.push(task);
          
        } else if (!hasAssignees && (task.status === 'todo' || task.status === 'open')) {
          // ✅ TÂCHES DISPONIBLES = Non assignées et ouvertes à la participation
          availableTasksArray.push(task);
          
        } else if (hasAssignees && !isAssignedToMe) {
          // ✅ AUTRES TÂCHES = Assignées à d'autres utilisateurs
          otherTasksArray.push(task);
        }
        
        // Les tâches que j'ai créées mais qui ne me sont pas assignées vont dans "disponibles" ou "autres"
        // selon qu'elles sont assignées ou non
      });

      // Trier par date de création (plus récentes d'abord)
      const sortByDate = (a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      };

      setMyTasks(myTasksArray.sort(sortByDate));
      setAvailableTasks(availableTasksArray.sort(sortByDate));
      setOtherTasks(otherTasksArray.sort(sortByDate));
      
      setLastUpdateTime(Date.now());
      
      console.log('✅ Répartition des tâches terminée:', {
        'Mes tâches (assignées à moi)': myTasksArray.length,
        'Disponibles (non assignées)': availableTasksArray.length,
        'Autres (assignées à autres)': otherTasksArray.length,
        'Détail mes tâches': myTasksArray.map(t => `${t.title} (créé par: ${t.createdBy}, assigné: ${t.assignedTo})`),
        'Détail disponibles': availableTasksArray.map(t => `${t.title} (status: ${t.status}, assignés: ${t.assignedTo?.length || 0})`),
        'Détail autres': otherTasksArray.map(t => `${t.title} (assigné à: ${t.assignedTo})`),
      });

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * 🔄 FONCTION DE RECHARGEMENT FORCÉ
   */
  const forceReload = useCallback(async () => {
    console.log('🔄 Rechargement forcé des tâches...');
    await loadTasks();
  }, [loadTasks]);

  /**
   * 🔄 CHARGEMENT INITIAL ET ÉVÉNEMENTS
   */
  useEffect(() => {
    if (user?.uid) {
      loadTasks();
    }
  }, [user?.uid, loadTasks]);

  // Recharger quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid) {
        console.log('🔄 Page redevenue visible - rechargement');
        loadTasks();
      }
    };

    const handleFocus = () => {
      if (user?.uid) {
        console.log('🔄 Fenêtre focus - rechargement');
        loadTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.uid, loadTasks]);

  /**
   * 🔍 FILTRER LES TÂCHES SELON LES CRITÈRES DE RECHERCHE
   */
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      // Filtre par recherche
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Filtre par priorité
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  /**
   * 📋 FONCTIONS DE GESTION DES TÂCHES
   */
  const handleCreateTask = async (taskData) => {
    try {
      setSubmitting(true);
      await taskService.createTask(taskData);
      await forceReload(); // Recharger après création
      setShowCreateModal(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      setSubmitting(true);
      await taskService.updateTask(selectedTask.id, taskData);
      await forceReload(); // Recharger après modification
      setShowCreateModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      setError('Erreur lors de la modification de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await forceReload(); // Recharger après suppression
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  const handleSubmitTask = async (taskId) => {
    try {
      await taskService.submitTask(taskId);
      await forceReload(); // Recharger après soumission
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError('Erreur lors de la soumission de la tâche');
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleTaskUpdate = useCallback(async () => {
    console.log('🔄 Mise à jour détectée - rechargement des tâches');
    await forceReload();
  }, [forceReload]);

  // Obtenir les tâches filtrées selon l'onglet actif
  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'my':
        return getFilteredTasks(myTasks);
      case 'available':
        return getFilteredTasks(availableTasks);
      case 'other':
        return getFilteredTasks(otherTasks);
      default:
        return [];
    }
  };

  const currentTasks = getCurrentTasks();

  // Affichage de chargement
  if (loading && myTasks.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement des tâches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches assignées et participez aux projets collaboratifs
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Dernière mise à jour : {new Date(lastUpdateTime).toLocaleTimeString('fr-FR')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={forceReload}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Recharger les tâches"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Onglets avec description claire */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <div className="text-left">
              <div>Mes tâches ({myTasks.length})</div>
              <div className="text-xs text-gray-400">Assignées à moi</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <div className="text-left">
              <div>Disponibles ({availableTasks.length})</div>
              <div className="text-xs text-gray-400">Non assignées</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('other')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'other'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <div className="text-left">
              <div>Autres ({otherTasks.length})</div>
              <div className="text-xs text-gray-400">Assignées à d'autres</div>
            </div>
          </div>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="validation_pending">En validation</option>
          <option value="completed">Terminée</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes priorités</option>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Élevée</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {activeTab === 'my' && 'Aucune tâche assignée'}
              {activeTab === 'available' && 'Aucune tâche disponible'}
              {activeTab === 'other' && 'Aucune autre tâche'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'my' && 'Aucune tâche ne vous est actuellement assignée. Consultez les tâches disponibles pour vous porter volontaire.'}
              {activeTab === 'available' && 'Toutes les tâches disponibles ont été prises ou il n\'y en a pas encore.'}
              {activeTab === 'other' && 'Aucune tâche assignée à d\'autres utilisateurs pour le moment.'}
            </p>
          </div>
        ) : (
          currentTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={user}
              onEdit={() => {
                setSelectedTask(task);
                setShowCreateModal(true);
              }}
              onDelete={() => handleDeleteTask(task.id)}
              onViewDetails={() => handleViewDetails(task)}
              onSubmit={() => handleSubmitTask(task.id)}
              onTaskUpdate={handleTaskUpdate}
            />
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      <TaskForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleEditTask : handleCreateTask}
        initialData={selectedTask}
        submitting={submitting}
      />

      {/* Modal de détails - avec fallback si composant manquant */}
      {typeof TaskDetailModal !== 'undefined' ? (
        <TaskDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          currentUser={user}
          onEdit={() => {
            setShowDetailModal(false);
            setShowCreateModal(true);
          }}
          onSubmit={() => handleSubmitTask(selectedTask?.id)}
          onTaskUpdate={handleTaskUpdate}
        />
      ) : (
        // Fallback simple si TaskDetailModal n'existe pas
        showDetailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
              <h3 className="text-lg font-bold mb-4">Détails de la tâche</h3>
              <p className="text-gray-600 mb-4">{selectedTask?.title}</p>
              <p className="text-gray-500 text-sm mb-4">{selectedTask?.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default TasksPage;
