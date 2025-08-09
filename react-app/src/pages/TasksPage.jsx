// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION IMPORT TASKSUBMISSIONMODAL 
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
  ChevronDown
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import taskService from '../core/services/taskService.js';

// Composants
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
// ✅ CORRECTION: Import correct du modal de soumission
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';

// 🎭 RÔLES SYNERGIA POUR FILTRAGE (définis localement)
const SYNERGIA_ROLES = {
  stock: { id: 'stock', name: 'Gestion des Stocks', icon: '📦', color: 'bg-orange-500' },
  maintenance: { id: 'maintenance', name: 'Maintenance & Technique', icon: '🔧', color: 'bg-blue-500' },
  organization: { id: 'organization', name: 'Organisation & Planning', icon: '📋', color: 'bg-green-500' },
  reputation: { id: 'reputation', name: 'Réputation & Avis', icon: '⭐', color: 'bg-yellow-500' },
  content: { id: 'content', name: 'Contenu & Documentation', icon: '📝', color: 'bg-purple-500' },
  mentoring: { id: 'mentoring', name: 'Encadrement & Formation', icon: '🎓', color: 'bg-indigo-500' },
  partnerships: { id: 'partnerships', name: 'Partenariats & Référencement', icon: '🤝', color: 'bg-pink-500' },
  communication: { id: 'communication', name: 'Communication & Relations', icon: '📢', color: 'bg-teal-500' }
};

/**
 * 📋 PAGE PRINCIPALE DE GESTION DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États des filtres
  const [activeTab, setActiveTab] = useState('mine');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  // États des modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);

  /**
   * 🔄 CHARGER LES TÂCHES
   */
  const loadTasks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📥 Chargement des tâches...');
      
      let tasksData = [];
      
      if (activeTab === 'mine') {
        tasksData = await taskService.getUserTasks(user.uid);
      } else if (activeTab === 'available') {
        tasksData = await taskService.getAvailableTasks();
      } else {
        tasksData = await taskService.getAllTasks();
      }
      
      console.log(`✅ ${tasksData.length} tâches chargées`);
      setTasks(tasksData);
      setError(null);
      
    } catch (err) {
      console.error('❌ Erreur chargement tâches:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  // Charger les tâches au montage et quand les filtres changent
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * 🎯 FILTRER LES TÂCHES
   */
  const filteredTasks = tasks.filter(task => {
    // Filtre de recherche
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtre de rôle
    if (selectedRole !== 'all' && task.role !== selectedRole) {
      return false;
    }
    
    // Filtre de statut
    if (selectedStatus !== 'all' && task.status !== selectedStatus) {
      return false;
    }
    
    // Filtre de priorité
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }
    
    return true;
  });

  /**
   * 📝 GESTION CRÉATION DE TÂCHE
   */
  const handleCreateTask = async (taskData) => {
    try {
      console.log('📝 Création nouvelle tâche:', taskData);
      await taskService.createTask({
        ...taskData,
        createdBy: user.uid,
        status: 'pending',
        createdAt: new Date()
      });
      
      setShowCreateForm(false);
      await loadTasks();
      
    } catch (err) {
      console.error('❌ Erreur création tâche:', err);
      alert('Erreur lors de la création: ' + err.message);
    }
  };

  /**
   * ✏️ GESTION ÉDITION DE TÂCHE
   */
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowCreateForm(true);
  };

  /**
   * 🗑️ GESTION SUPPRESSION DE TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  /**
   * 📤 GESTION SOUMISSION POUR VALIDATION
   */
  const handleSubmitTask = (task) => {
    console.log('📤 Ouverture modal soumission pour:', task.title);
    setTaskToSubmit(task);
    setShowSubmissionModal(true);
  };

  /**
   * ✅ SUCCÈS DE SOUMISSION
   */
  const handleSubmissionSuccess = async (result) => {
    try {
      console.log('✅ Soumission réussie:', result);
      
      // Fermer le modal
      setShowSubmissionModal(false);
      setTaskToSubmit(null);
      
      // Recharger les tâches
      await loadTasks();
      
      // Notification utilisateur
      alert(`✅ Tâche "${result.taskTitle || 'sans nom'}" soumise pour validation !`);
      
    } catch (error) {
      console.error('❌ Erreur après soumission:', error);
    }
  };

  /**
   * 👁️ AFFICHER DÉTAILS TÂCHE
   */
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  /**
   * 🔄 ACTUALISER
   */
  const handleRefresh = () => {
    loadTasks();
  };

  // ⏳ ÉTAT DE CHARGEMENT
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* En-tête */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Tâches</h1>
              <p className="text-gray-400 text-sm">Gérez vos tâches assignées et participez aux projets collaboratifs</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-200">❌ {error}</p>
          </div>
        )}

        {/* Onglets principaux */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg w-fit">
            {[
              { id: 'mine', label: 'Mes tâches', count: tasks.filter(t => t.assignedTo?.includes(user?.uid)).length },
              { id: 'available', label: 'Disponibles', count: tasks.filter(t => !t.assignedTo?.length).length },
              { id: 'all', label: 'Toutes', count: tasks.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.id === 'mine' && <CheckCircle className="w-4 h-4" />}
                {tab.id === 'available' && <Heart className="w-4 h-4" />}
                {tab.id === 'all' && <Users className="w-4 h-4" />}
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            {Object.values(SYNERGIA_ROLES).map(role => (
              <option key={role.id} value={role.id} className="text-gray-900">
                {role.icon} {role.name}
              </option>
            ))}
          </select>

          {/* Filtre par statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending" className="text-gray-900">En attente</option>
            <option value="in_progress" className="text-gray-900">En cours</option>
            <option value="validation_pending" className="text-gray-900">En validation</option>
            <option value="completed" className="text-gray-900">Terminées</option>
          </select>

          {/* Filtre par priorité */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low" className="text-gray-900">Basse</option>
            <option value="medium" className="text-gray-900">Moyenne</option>
            <option value="high" className="text-gray-900">Haute</option>
            <option value="urgent" className="text-gray-900">Urgente</option>
          </select>
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400">
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : activeTab === 'mine' 
                    ? 'Vous n\'avez pas encore de tâches assignées'
                    : 'Aucune tâche disponible pour le moment'
                }
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={user}
                onView={() => handleViewTask(task)}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                onSubmit={() => handleSubmitTask(task)}
                roles={SYNERGIA_ROLES}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      
      {/* Modal de création/édition */}
      {showCreateForm && (
        <TaskForm
          isOpen={showCreateForm}
          task={selectedTask}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedTask(null);
          }}
          onSubmit={handleCreateTask}
          roles={SYNERGIA_ROLES}
        />
      )}

      {/* Modal de détails */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetail}
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowTaskDetail(false);
            handleEditTask(selectedTask);
          }}
          onDelete={() => {
            setShowTaskDetail(false);
            handleDeleteTask(selectedTask.id);
          }}
          onSubmit={() => {
            setShowTaskDetail(false);
            handleSubmitTask(selectedTask);
          }}
        />
      )}

      {/* ✅ CORRECTION: Modal de soumission correctement intégré */}
      {showSubmissionModal && taskToSubmit && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={taskToSubmit}
          onClose={() => {
            setShowSubmissionModal(false);
            setTaskToSubmit(null);
          }}
          onSubmit={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default TasksPage;
