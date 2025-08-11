// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx  
// CORRECTION CHIRURGICALE : NewTaskModal au lieu de TaskForm
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  Heart, 
  Users, 
  Loader, 
  Clock,
  Filter,
  ChevronDown,
  Send,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Info,
  X
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import taskService from '../core/services/taskService.js';

// 🚨 IMPORT DE LA CORRECTION URGENTE
import { createTaskSafely } from '../core/services/taskCreationFix.js';

// 🔧 CORRECTION CHIRURGICALE - LIGNE 30
// ✅ NOUVEAU : Import NewTaskModal au lieu de TaskForm
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';

import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskCard from '../modules/tasks/TaskCard.jsx';

/**
 * 🎯 PAGE PRINCIPALE DES TÂCHES AVEC CORRECTION URGENTE
 */
const TasksPage = () => {
  const { user, loading: authLoading } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // États des filtres
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Charger les tâches au montage et sur changement d'onglet
  useEffect(() => {
    if (!authLoading && user) {
      loadTasks();
    }
  }, [authLoading, user, activeTab]);

  // Fonction de chargement des tâches
  const loadTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allTasks = await taskService.getAllTasks();
      setTasks(allTasks || []);
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calculer les différentes catégories de tâches
  const myTasks = tasks.filter(task => 
    task.assignedTo && (
      task.assignedTo.includes(user?.uid) ||
      task.assignedTo.includes(user?.email) ||
      task.createdBy === user?.uid ||
      task.createdBy === user?.email
    )
  );

  const availableTasks = tasks.filter(task => 
    (!task.assignedTo || task.assignedTo.length === 0) &&
    task.status !== 'completed' &&
    task.createdBy !== user?.uid &&
    task.createdBy !== user?.email
  );

  const otherTasks = tasks.filter(task => 
    task.assignedTo && 
    task.assignedTo.length > 0 &&
    !task.assignedTo.includes(user?.uid) &&
    !task.assignedTo.includes(user?.email) &&
    task.createdBy !== user?.uid &&
    task.createdBy !== user?.email
  );

  // Fonction de filtrage des tâches
  const getFilteredTasks = (taskList) => {
    return taskList.filter(task => {
      // Filtre par terme de recherche
      if (searchTerm && !task.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre par statut
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      
      // Filtre par priorité
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // Filtre par rôle Synergia
      if (roleFilter !== 'all') {
        const taskRole = task.synergiaRole || task.role || task.category;
        if (!taskRole || taskRole !== roleFilter) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Obtenir les tâches actuelles selon l'onglet
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

  /**
   * 🚨 GESTIONNAIRE CRÉATION TÂCHE - CORRECTION URGENTE
   */
  const handleCreateTask = async (taskData) => {
    console.log('🚨 [TASKS_PAGE] DÉBUT CRÉATION TÂCHE URGENTE');
    console.log('🚨 [TASKS_PAGE] TaskData reçu:', taskData);
    console.log('🚨 [TASKS_PAGE] User actuel:', user);
    
    setSubmitting(true);
    setError('');
    
    try {
      // 🛡️ VALIDATION PRÉALABLE
      if (!user || !user.uid) {
        throw new Error('Utilisateur non connecté');
      }
      
      if (!taskData || !taskData.title) {
        throw new Error('Données de tâche invalides');
      }
      
      console.log('🚨 [TASKS_PAGE] Validation OK, appel createTaskSafely...');
      
      // 🚀 UTILISER LA FONCTION DE CORRECTION URGENTE
      const result = await createTaskSafely(taskData, user);
      
      console.log('🚨 [TASKS_PAGE] Résultat création:', result);
      
      if (result.success) {
        console.log('✅ [TASKS_PAGE] Tâche créée avec succès:', result.id);
        
        // Fermer le modal
        setShowCreateModal(false);
        setSelectedTask(null);
        
        // Recharger les tâches
        await loadTasks();
        
        // Notification de succès
        if (window.showNotification) {
          window.showNotification('✅ Tâche créée avec succès !', 'success');
        } else {
          alert('✅ Tâche créée avec succès !');
        }
        
      } else {
        // Erreur retournée par le service
        const errorMsg = result.message || result.error || 'Erreur lors de la création';
        console.error('❌ [TASKS_PAGE] Erreur service:', errorMsg);
        setError(errorMsg);
        
        if (window.showNotification) {
          window.showNotification('❌ ' + errorMsg, 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ [TASKS_PAGE] Exception création:', error);
      const errorMessage = `Erreur lors de la création: ${error.message}`;
      setError(errorMessage);
      
      if (window.showNotification) {
        window.showNotification('❌ ' + errorMessage, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire d'édition de tâche
  const handleEditTask = async (taskData) => {
    if (!selectedTask) return;
    
    setSubmitting(true);
    try {
      await taskService.updateTask(selectedTask.id, {
        ...taskData,
        updatedAt: new Date()
      });
      setShowCreateModal(false);
      setSelectedTask(null);
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur édition:', error);
      setError('Erreur lors de la modification: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaire de suppression
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setError('Erreur lors de la suppression: ' + error.message);
    }
  };

  // Gestionnaire bouton détails
  const handleViewDetails = (task, tab = 'details') => {
    console.log('👁️ Ouverture détails pour:', task.title, 'onglet:', tab);
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // Gestionnaire bouton soumettre
  const handleSubmitTask = (task) => {
    console.log('📤 Ouverture modal soumission pour:', task.title);
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  // Succès de soumission
  const handleSubmissionSuccess = async (result) => {
    try {
      console.log('✅ Soumission réussie:', result);
      setShowSubmissionModal(false);
      setSelectedTask(null);
      await loadTasks();
      alert(`✅ Tâche soumise pour validation !`);
    } catch (error) {
      console.error('❌ Erreur après soumission:', error);
    }
  };

  // Gestionnaire de volontariat
  const handleVolunteer = async (taskId) => {
    try {
      const updatedAssignedTo = [...(selectedTask?.assignedTo || []), user.uid];
      
      await taskService.updateTask(taskId, {
        assignedTo: updatedAssignedTo,
        status: 'in_progress',
        updatedAt: new Date()
      });

      await loadTasks();
      setShowDetailModal(false);
      setSelectedTask(null);
      alert('🎯 Vous avez rejoint cette tâche !');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      setError('Erreur lors du volontariat: ' + error.message);
    }
  };

  // État de chargement
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Tâches</h1>
            <p className="text-gray-400 mt-1">
              Gérez vos tâches assignées et participez aux projets collaboratifs
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => loadTasks()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            
            <button
              onClick={() => {
                setSelectedTask(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          </div>
        </div>
        
        {/* Message d'erreur global */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        
        {/* Onglets */}
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Mes tâches ({myTasks.length})
          </button>
          
          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'available'
                ? 'bg-green-600 text-white'
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
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Autres ({otherTasks.length})
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="not_started">Non commencé</option>
              <option value="in_progress">En cours</option>
              <option value="pending_review">En attente de validation</option>
              <option value="completed">Terminé</option>
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
              🌟 Tous les rôles
            </button>
            
            <button
              onClick={() => setRoleFilter('tech')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'tech'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💻 Développement Tech
            </button>
            
            <button
              onClick={() => setRoleFilter('organisation')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'organisation'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🗓️ Organisation Interne
            </button>
            
            <button
              onClick={() => setRoleFilter('formation')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'formation'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📚 Formation & Tutorat
            </button>
            
            <button
              onClick={() => setRoleFilter('partenariats')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'partenariats'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🤝 Partenariats
            </button>
            
            <button
              onClick={() => setRoleFilter('communication')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'communication'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📱 Communication
            </button>
            
            <button
              onClick={() => setRoleFilter('b2b')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                roleFilter === 'b2b'
                  ? 'bg-slate-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💼 Relations B2B
            </button>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Chargement des tâches...</p>
            </div>
          ) : getCurrentTasks().length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400">
                {activeTab === 'my' && 'Vous n\'avez pas encore de tâches assignées.'}
                {activeTab === 'available' && 'Aucune tâche disponible pour le moment.'}
                {activeTab === 'other' && 'Aucune autre tâche visible.'}
              </p>
            </div>
          ) : (
            getCurrentTasks().map(task => (
              <TaskCard
                key={task.id}
                task={task}
                user={user}
                onViewDetails={handleViewDetails}
                onSubmit={handleSubmitTask}
                onEdit={(task) => {
                  setSelectedTask(task);
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteTask}
                showActions={activeTab === 'my'}
              />
            ))
          )}
        </div>
      </div>

      {/* 🔧 CORRECTION CHIRURGICALE - LIGNES 870-885 */}
      {/* ✅ NOUVEAU : NewTaskModal avec props correctes */}
      {showCreateModal && (
        <NewTaskModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? handleEditTask : handleCreateTask}
          initialData={selectedTask || null}
          mode={selectedTask ? 'edit' : 'create'}
          submitting={submitting}
        />
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          user={user}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onVolunteer={handleVolunteer}
          onSubmit={handleSubmitTask}
          onEdit={(task) => {
            setShowDetailModal(false);
            setSelectedTask(task);
            setShowCreateModal(true);
          }}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Modal de soumission */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          task={selectedTask}
          user={user}
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default TasksPage;
