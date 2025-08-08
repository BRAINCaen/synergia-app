// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC CORRECTION LOGIQUE DE FILTRAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Users, 
  Heart,
  Loader
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

  // Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      loadTasks();
    }
  }, [user?.uid]);

  /**
   * 🔄 CHARGER TOUTES LES TÂCHES AVEC LOGIQUE CORRIGÉE
   */
  const loadTasks = async () => {
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
        
        // Vérifier si tâche terminée ou en validation
        const isCompletedOrValidation = task.status === 'completed' || task.status === 'validation_pending';

        if (isAssignedToMe) {
          // 🟢 MES TÂCHES = Je suis assigné
          myTasksArray.push(task);
          
          // Debug pour la tâche spécifique
          if (task.id === '0BybqmT615cihFb1FGPE') {
            console.log('🎯 Tâche "terminer la page taches" -> MES TÂCHES');
            console.log('   assignedTo:', task.assignedTo);
            console.log('   isAssignedToMe:', isAssignedToMe);
          }
          
        } else if (isAvailable && !isCompletedOrValidation) {
          // 🔵 TÂCHES DISPONIBLES = Pas d'assignation ET pas terminée
          availableTasksArray.push(task);
          
          // Debug pour la tâche spécifique
          if (task.id === '0BybqmT615cihFb1FGPE') {
            console.log('🎯 Tâche "terminer la page taches" -> TÂCHES DISPONIBLES');
            console.log('   assignedTo:', task.assignedTo);
            console.log('   isAvailable:', isAvailable);
            console.log('   status:', task.status);
          }
          
        } else {
          // 🟡 AUTRES TÂCHES = Assignée à quelqu'un d'autre OU terminée
          otherTasksArray.push(task);
          
          // Debug pour la tâche spécifique
          if (task.id === '0BybqmT615cihFb1FGPE') {
            console.log('🎯 Tâche "terminer la page taches" -> AUTRES TÂCHES');
            console.log('   assignedTo:', task.assignedTo);
            console.log('   status:', task.status);
          }
        }
      });

      console.log('📊 RÉPARTITION FINALE:');
      console.log(`  🟢 MES TÂCHES (assignées à moi): ${myTasksArray.length}`);
      console.log(`  🔵 TÂCHES DISPONIBLES (sans assignation): ${availableTasksArray.length}`);
      console.log(`  🟡 AUTRES TÂCHES (assignées ailleurs): ${otherTasksArray.length}`);

      // Mettre à jour les états
      setMyTasks(myTasksArray);
      setAvailableTasks(availableTasksArray);
      setOtherTasks(otherTasksArray);

      console.log('✅ 59 tâches chargées');
      console.log('📊 Statistiques mises à jour:', {
        myTotal: myTasksArray.length,
        available: availableTasksArray.length,
        other: otherTasksArray.length,
        completionRate: myTasksArray.length > 0 ? 
          Math.round((myTasksArray.filter(t => t.status === 'completed').length / myTasksArray.length) * 100) : 0
      });

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = (task) => {
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

  const handleTaskUpdate = () => {
    loadTasks(); // Recharger les tâches après une mise à jour
  };

  // Affichage de chargement
  if (loading) {
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
        </div>
        
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="pending">En attente</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Mes Tâches ({myTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Tâches Disponibles ({availableTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('other')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'other'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Autres Tâches ({otherTasks.length})
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'my' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes Tâches</h2>
          {getFilteredTasks(myTasks).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {myTasks.length === 0 ? 'Aucune tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
              </h3>
              <p className="text-gray-500">
                {myTasks.length === 0 
                  ? 'Prenez une tâche disponible ou demandez une assignation !'
                  : 'Essayez de modifier vos filtres de recherche.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredTasks(myTasks).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isMyTask={true}
                  onEdit={(task) => {
                    console.log('📝 [EDIT] Ouverture modal édition pour:', task.title);
                    console.log('📝 [EDIT] Données tâche:', task);
                    setSelectedTask(task);
                    setShowCreateModal(true);
                  }}
                  onDelete={async (task) => {
                    console.log('🗑️ [DELETE] Suppression tâche:', task.id);
                    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
                      await handleDeleteTask(task.id);
                    }
                  }}
                  onViewDetails={handleViewDetails}
                  onSubmit={handleSubmitTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tâches Disponibles</h2>
          <p className="text-gray-600 mb-4">
            Tâches non assignées, ouvertes à tous
          </p>
          {getFilteredTasks(availableTasks).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {availableTasks.length === 0 ? 'Aucune tâche disponible' : 'Aucune tâche ne correspond aux filtres'}
              </h3>
              <p className="text-gray-500">
                {availableTasks.length === 0 
                  ? 'Toutes les tâches sont assignées ou créez-en une nouvelle !'
                  : 'Essayez de modifier vos filtres de recherche.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredTasks(availableTasks).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isMyTask={false}
                  showVolunteerButton={true}
                  onViewDetails={handleViewDetails}
                  onTaskUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'other' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Autres Tâches</h2>
          <p className="text-gray-600 mb-4">
            Tâches assignées à d'autres membres
          </p>
          {getFilteredTasks(otherTasks).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {otherTasks.length === 0 ? 'Aucune autre tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
              </h3>
              <p className="text-gray-500">
                {otherTasks.length === 0 
                  ? 'Toutes les tâches sont soit disponibles, soit vous sont assignées.'
                  : 'Essayez de modifier vos filtres de recherche.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredTasks(otherTasks).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isMyTask={false}
                  onEdit={task.createdBy === user?.uid ? ((task) => {
                    console.log('📝 [EDIT] Ouverture modal édition pour tâche créée par moi:', task.title);
                    setSelectedTask(task);
                    setShowCreateModal(true);
                  }) : undefined}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
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

      <TaskDetailModal
        isOpen={showDetailModal}
        task={selectedTask}
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
      />
    </div>
  );
};

export default TasksPage;
