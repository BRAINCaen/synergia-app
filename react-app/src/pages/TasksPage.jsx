// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION CORRIGÉE POUR RÉSOUDRE TypeError: s is not a function
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
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// ✅ IMPORTS SÉCURISÉS AVEC GESTION D'ERREURS
let useAuthStore, taskService, TaskCard, TaskForm, TaskDetailModal;

try {
  ({ useAuthStore } = await import('../shared/stores/authStore.js'));
  ({ taskService } = await import('../core/services/taskService.js'));
  TaskCard = (await import('../modules/tasks/TaskCard.jsx')).default;
  TaskForm = (await import('../modules/tasks/TaskForm.jsx')).default;
  TaskDetailModal = (await import('../components/ui/TaskDetailModal.jsx')).default;
} catch (error) {
  console.warn('⚠️ Fallback pour imports TasksPage:', error);
  
  // Fallbacks sécurisés
  useAuthStore = () => ({ user: null });
  taskService = { 
    getAllTasks: () => Promise.resolve([]),
    createTask: () => Promise.resolve(),
    updateTask: () => Promise.resolve()
  };
  TaskCard = ({ task }) => (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-medium">{task?.title || 'Tâche'}</h3>
      <p className="text-gray-600 text-sm">{task?.description || 'Description'}</p>
    </div>
  );
  TaskForm = () => null;
  TaskDetailModal = () => null;
}

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES - VERSION ULTRA-SÉCURISÉE
 */
const TasksPage = () => {
  // ✅ HOOKS SÉCURISÉS
  const authStore = useAuthStore ? useAuthStore() : { user: null };
  const { user } = authStore;
  
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
   * 🔄 CHARGER TOUTES LES TÂCHES AVEC PROTECTION D'ERREURS
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des tâches...');

      if (!user?.uid) {
        console.warn('⚠️ Utilisateur non connecté');
        setLoading(false);
        return;
      }

      if (!taskService?.getAllTasks) {
        console.warn('⚠️ TaskService non disponible');
        setError('Service de tâches non disponible');
        setLoading(false);
        return;
      }

      // Récupérer toutes les tâches avec protection
      let allTasks = [];
      try {
        allTasks = await taskService.getAllTasks();
      } catch (taskError) {
        console.error('❌ Erreur récupération tâches:', taskError);
        setError('Impossible de charger les tâches');
        setLoading(false);
        return;
      }

      console.log(`📊 Total tâches récupérées: ${allTasks.length}`);

      // 🔧 LOGIQUE MÉTIER CORRECTE AVEC PROTECTION
      const myTasksArray = [];
      const availableTasksArray = [];
      const otherTasksArray = [];

      allTasks.forEach(task => {
        try {
          // Protection contre les tâches malformées
          if (!task || typeof task !== 'object') {
            console.warn('⚠️ Tâche malformée ignorée:', task);
            return;
          }

          // Vérifier si je suis assigné à cette tâche
          const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
          
          // Vérifier si la tâche est disponible (pas d'assignation)
          const isAvailable = !task.assignedTo || 
                             task.assignedTo.length === 0 || 
                             (Array.isArray(task.assignedTo) && task.assignedTo.length === 0);
          
          // ✅ CORRECTION : Vérifier si tâche terminée ou en validation
          const isCompleted = task.status === 'completed';
          const isInValidation = task.status === 'validation_pending';
          const isFinished = isCompleted || isInValidation;

          // 📋 LOGIQUE DE RÉPARTITION
          if (isAssignedToMe && !isFinished) {
            // 🟢 MES TÂCHES = Je suis assigné ET pas terminée/validée
            myTasksArray.push(task);
            
          } else if (isAvailable && !isFinished) {
            // 🟡 TÂCHES DISPONIBLES = Pas assignées ET pas terminées
            availableTasksArray.push(task);
            
          } else {
            // 🔵 AUTRES TÂCHES = Tout le reste
            otherTasksArray.push(task);
          }
        } catch (taskError) {
          console.warn('⚠️ Erreur traitement tâche:', taskError, task);
        }
      });

      console.log('📊 RÉPARTITION FINALE:');
      console.log(`  🟢 MES TÂCHES: ${myTasksArray.length}`);
      console.log(`  🔵 TÂCHES DISPONIBLES: ${availableTasksArray.length}`);
      console.log(`  🟡 AUTRES TÂCHES: ${otherTasksArray.length}`);

      // Mettre à jour les états de manière sécurisée
      setMyTasks(myTasksArray);
      setAvailableTasks(availableTasksArray);
      setOtherTasks(otherTasksArray);
      setLastUpdateTime(Date.now());

      console.log('✅ Tâches chargées avec succès');

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Charger les tâches au montage avec protection
  useEffect(() => {
    if (user?.uid) {
      loadTasks().catch(error => {
        console.error('❌ Erreur dans useEffect loadTasks:', error);
        setError('Erreur d\'initialisation');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.uid, loadTasks]);

  /**
   * 🔄 RECHARGEMENT FORCÉ
   */
  const forceReload = useCallback(async () => {
    console.log('🔄 Rechargement forcé des tâches...');
    await loadTasks();
  }, [loadTasks]);

  /**
   * 🔍 FILTRAGE DES TÂCHES
   */
  const getFilteredTasks = useCallback((tasks) => {
    if (!Array.isArray(tasks)) return [];
    
    return tasks.filter(task => {
      try {
        // Filtre par recherche
        const matchesSearch = !searchTerm || 
          (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtre par statut
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        // Filtre par priorité
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      } catch (filterError) {
        console.warn('⚠️ Erreur filtrage tâche:', filterError, task);
        return false;
      }
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  /**
   * 📊 STATISTIQUES POUR LES ONGLETS
   */
  const tabStats = {
    my: myTasks.length,
    available: availableTasks.length,
    other: otherTasks.length
  };

  /**
   * 🎨 RENDU DES ONGLETS
   */
  const renderTabs = () => {
    const tabs = [
      { id: 'my', label: 'Mes Tâches', icon: Heart, count: tabStats.my },
      { id: 'available', label: 'Disponibles', icon: Clock, count: tabStats.available },
      { id: 'other', label: 'Autres', icon: Users, count: tabStats.other }
    ];

    return (
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * 🎨 RENDU DES TÂCHES
   */
  const renderTasks = () => {
    let tasks = [];
    
    switch (activeTab) {
      case 'my':
        tasks = getFilteredTasks(myTasks);
        break;
      case 'available':
        tasks = getFilteredTasks(availableTasks);
        break;
      case 'other':
        tasks = getFilteredTasks(otherTasks);
        break;
      default:
        tasks = [];
    }

    if (tasks.length === 0) {
      const emptyMessages = {
        my: 'Aucune tâche assignée',
        available: 'Aucune tâche disponible',
        other: 'Aucune autre tâche'
      };

      return (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {emptyMessages[activeTab]}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'my' && 'Prenez une tâche disponible ou créez-en une nouvelle'}
            {activeTab === 'available' && 'Toutes les tâches sont assignées'}
            {activeTab === 'other' && 'Aucune autre tâche à afficher'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            currentUserId={user?.uid}
            onTaskUpdate={forceReload}
            onTaskClick={() => {
              setSelectedTask(task);
              setShowDetailModal(true);
            }}
          />
        ))}
      </div>
    );
  };

  // Affichage d'erreur
  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              loadTasks();
            }}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Affichage de chargement initial
  if (loading && myTasks.length === 0 && availableTasks.length === 0 && otherTasks.length === 0) {
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
            Gérez vos tâches et collaborez aux projets
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
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Terminé</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        {renderTabs()}
      </div>

      {/* Liste des tâches */}
      {renderTasks()}

      {/* Modales */}
      {TaskForm && (
        <TaskForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={forceReload}
        />
      )}

      {TaskDetailModal && selectedTask && (
        <TaskDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          currentUserId={user?.uid}
          onTaskUpdate={forceReload}
        />
      )}
    </div>
  );
};

export default TasksPage;
