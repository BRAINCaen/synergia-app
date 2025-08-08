// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC CORRECTION LOGIQUE COMPLÈTE
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
        
        // Vérifier si la tâche est disponible (pas d'assignation)
        const isAvailable = !task.assignedTo || 
                           task.assignedTo.length === 0 || 
                           (Array.isArray(task.assignedTo) && task.assignedTo.length === 0);
        
        // ✅ CORRECTION PRINCIPALE : Vérifier si tâche terminée ou en validation
        const isCompleted = task.status === 'completed';
        const isInValidation = task.status === 'validation_pending';
        const isFinished = isCompleted || isInValidation;

        // 📋 LOGIQUE DE RÉPARTITION CORRIGÉE
        if (isAssignedToMe && !isFinished) {
          // 🟢 MES TÂCHES = Je suis assigné ET pas terminée/validée
          myTasksArray.push(task);
          console.log(`➡️ "${task.title}" ajoutée à MES TÂCHES (status: ${task.status})`);
          
        } else if (isAvailable && !isFinished) {
          // 🟡 TÂCHES DISPONIBLES = Pas assignées ET pas terminées
          availableTasksArray.push(task);
          console.log(`➡️ "${task.title}" ajoutée aux DISPONIBLES (status: ${task.status})`);
          
        } else {
          // 🔵 AUTRES TÂCHES = Tout le reste (assignées à d'autres, terminées, validées, etc.)
          otherTasksArray.push(task);
          console.log(`➡️ "${task.title}" ajoutée aux AUTRES (status: ${task.status}, assignedToMe: ${isAssignedToMe}, finished: ${isFinished})`);
        }
      });

      console.log('📊 RÉPARTITION FINALE:');
      console.log(`  🟢 MES TÂCHES (assignées à moi, non terminées): ${myTasksArray.length}`);
      console.log(`  🔵 TÂCHES DISPONIBLES (sans assignation, non terminées): ${availableTasksArray.length}`);
      console.log(`  🟡 AUTRES TÂCHES (assignées ailleurs ou terminées): ${otherTasksArray.length}`);

      // Mettre à jour les états
      setMyTasks(myTasksArray);
      setAvailableTasks(availableTasksArray);
      setOtherTasks(otherTasksArray);
      
      // ✅ METTRE À JOUR LE TIMESTAMP DE DERNIÈRE SYNCHRONISATION
      setLastUpdateTime(Date.now());

      console.log('✅ Tâches chargées avec succès');

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      loadTasks();
    }
  }, [user?.uid, loadTasks]);

  // Rechargement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.uid && !loading) {
        console.log('🔄 Rechargement automatique des tâches...');
        loadTasks();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [user?.uid, loading, loadTasks]);

  // Écouter les changements de visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid) {
        console.log('🔄 Page redevenue visible - rechargement des tâches');
        loadTasks();
      }
    };

    const handleFocus = () => {
      if (user?.uid) {
        console.log('🔄 Page refocusée - rechargement des tâches');
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
            onClick={() => {
              setSelectedTask(null);
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Collaborer
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 text-sm underline mt-2"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminée</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'my', label: 'Mes Tâches', count: myTasks.length, icon: CheckCircle },
          { id: 'available', label: 'Tâches Disponibles', count: availableTasks.length, icon: Heart },
          { id: 'other', label: 'Autres Tâches', count: otherTasks.length, icon: Users }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {tab.label}
              <span className={`text-sm px-2 py-1 rounded-full ${
                activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-6xl mb-4">
              {activeTab === 'my' ? '📋' : activeTab === 'available' ? '💡' : '📁'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'my' ? 'Aucune tâche assignée' :
               activeTab === 'available' ? 'Aucune tâche disponible' :
               'Aucune autre tâche'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'my' ? 'Vous pouvez vous porter volontaire pour des tâches disponibles' :
               activeTab === 'available' ? 'Toutes les tâches sont assignées ou terminées' :
               'Toutes les tâches sont dans vos onglets actifs'}
            </p>
            {activeTab === 'my' && (
              <button
                onClick={() => setActiveTab('available')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Voir les tâches disponibles
              </button>
            )}
          </div>
        ) : (
          currentTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onViewDetails={handleViewDetails}
              onSubmit={handleSubmitTask}
              onTaskUpdate={handleTaskUpdate}
              isMyTask={activeTab === 'my'}
              showVolunteerButton={activeTab === 'available'}
            />
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <TaskForm
          task={selectedTask}
          onSubmit={selectedTask ? handleEditTask : handleCreateTask}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          loading={submitting}
        />
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowDetailModal(false);
            setShowCreateModal(true);
          }}
          onDelete={handleDeleteTask}
          onSubmit={handleSubmitTask}
          user={user}
        />
      )}
    </div>
  );
};

export default TasksPage;
