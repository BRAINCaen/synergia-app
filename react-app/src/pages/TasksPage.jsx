// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC CORRECTION IMPORTS COMPLÈTE
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

// ✅ IMPORTS DIRECTS POUR ÉVITER CONFLITS
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
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
   * 🔄 CHARGER TOUTES LES TÂCHES AVEC LOGIQUE CORRIGÉE
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des tâches...');

      if (!user?.uid) {
        console.warn('⚠️ Utilisateur non connecté');
        return;
      }

      // Récupérer toutes les tâches
      const allTasks = await taskService.getAllTasks();
      console.log(`📊 Total tâches récupérées: ${allTasks.length}`);

      // 🔧 LOGIQUE MÉTIER CORRECTE
      const myTasksArray = [];
      const availableTasksArray = [];
      const otherTasksArray = [];

      allTasks.forEach(task => {
        // Vérifier si je suis assigné à cette tâche
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        
        // Vérifier si je suis le créateur
        const isMyCreation = task.createdBy === user.uid;
        
        // Vérifier si la tâche est ouverte aux volontaires
        const isOpenToVolunteers = task.isOpenToVolunteers === true;

        if (isAssignedToMe || isMyCreation) {
          // Mes tâches = tâches assignées à moi OU créées par moi
          myTasksArray.push(task);
        } else if (isOpenToVolunteers && task.status === 'todo') {
          // Tâches disponibles = ouvertes aux volontaires et pas encore prises
          availableTasksArray.push(task);
        } else {
          // Autres tâches = toutes les autres (pour supervision/visibilité)
          otherTasksArray.push(task);
        }
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
      
      console.log('✅ Tâches chargées:', {
        mes: myTasksArray.length,
        disponibles: availableTasksArray.length,
        autres: otherTasksArray.length
      });

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

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
        console.log('🔄 Page redevenue visible');
        loadTasks();
      }
    };

    const handleFocus = () => {
      if (user?.uid) {
        console.log('🔄 Fenêtre focus');
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
   * 🔍 FILTRER LES TÂCHES SELON LES CRITÈRES
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
   * 🔄 FORCER LE RECHARGEMENT
   */
  const forceReload = useCallback(async () => {
    console.log('🔄 Rechargement forcé des tâches...');
    await loadTasks();
  }, [loadTasks]);

  /**
   * 📝 GESTIONNAIRES D'ÉVÉNEMENTS
   */
  const handleCreateTask = async (taskData) => {
    try {
      setSubmitting(true);
      await taskService.createTask(taskData, user.uid);
      console.log('✅ Tâche créée avec succès');
      await loadTasks(); // Recharger les tâches
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
      
      // 🛡️ PRÉSERVER LES DONNÉES CRITIQUES
      const preservedData = {
        // Préserver l'assignation existante
        assignedTo: selectedTask.assignedTo || [],
        
        // Préserver le créateur
        createdBy: selectedTask.createdBy,
        
        // Préserver les dates importantes
        createdAt: selectedTask.createdAt,
        completedAt: selectedTask.completedAt,
        
        // Préserver l'historique de validation
        validationRequestId: selectedTask.validationRequestId,
        validatedAt: selectedTask.validatedAt,
        validatedBy: selectedTask.validatedBy,
        
        // Ajouter la date de modification
        updatedAt: new Date()
      };

      // Combiner les nouvelles données avec les données préservées
      const finalData = {
        ...taskData,  // Nouvelles données du formulaire
        ...preservedData  // Données préservées (priorité)
      };

      console.log('🔧 Données finales pour mise à jour:', {
        preservedAssignedTo: preservedData.assignedTo,
        preservedCreatedBy: preservedData.createdBy,
        newTitle: taskData.title,
        newStatus: taskData.status
      });

      await taskService.updateTask(selectedTask.id, finalData);
      console.log('✅ Tâche mise à jour avec préservation des assignations');
      
      await loadTasks(); // Recharger les tâches
      setShowCreateModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      setError('Erreur lors de la mise à jour de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      console.log('✅ Tâche supprimée avec succès');
      await loadTasks(); // Recharger les tâches
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  const handleViewDetails = (task, defaultTab = 'details') => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleSubmitTask = async (taskId) => {
    try {
      // Logique de soumission de tâche
      console.log('📤 Soumission tâche:', taskId);
      await loadTasks(); // Recharger après soumission
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError('Erreur lors de la soumission de la tâche');
    }
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
            Gérez vos tâches et collaborez aux projets collaboratifs
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

      {/* Onglets */}
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
            Mes tâches ({myTasks.length})
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
            Disponibles ({availableTasks.length})
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
            Autres ({otherTasks.length})
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
              {activeTab === 'my' && 'Vous pouvez créer une nouvelle tâche ou vous porter volontaire pour une tâche disponible.'}
              {activeTab === 'available' && 'Toutes les tâches disponibles ont été prises ou il n\'y en a pas encore.'}
              {activeTab === 'other' && 'Aucune autre tâche à afficher pour le moment.'}
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

      {/* Modal de détails */}
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
    </div>
  );
};

export default TasksPage;
