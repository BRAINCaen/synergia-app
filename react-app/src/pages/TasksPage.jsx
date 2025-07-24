// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC FONCTION SUPPRESSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Trophy,
  Target,
  UserPlus,
  Send,
  Loader,
  Users,
  Globe,
  Star,
  UserMinus
} from 'lucide-react';

// ✅ IMPORTS CORRIGÉS POUR LES MODALS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore';
import { useTaskStore } from '../shared/stores/taskStore';
import TaskForm from '../modules/tasks/TaskForm';
import { TaskDetailModal } from '../shared/components/ui/ModalWrapper';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal';
import { taskService } from '../core/services/taskService';

/**
 * 🎭 RÔLES SYNERGIA OFFICIELS
 */
const SYNERGIA_ROLES = [
  {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: '#EA580C',
    description: 'Maintenance technique et réparations',
    baseXP: 30
  },
  {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: '#EAB308',
    description: 'Gestion de l\'image et des retours clients',
    baseXP: 35
  },
  {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: '#3B82F6',
    description: 'Gestion des inventaires',
    baseXP: 25
  },
  {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: '#8B5CF6',
    description: 'Coordination et organisation',
    baseXP: 35
  },
  {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: '#EC4899',
    description: 'Création visuelle et communication',
    baseXP: 30
  },
  {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: '#10B981',
    description: 'Formation des équipes',
    baseXP: 40
  },
  {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: '#6366F1',
    description: 'Développement partenariats',
    baseXP: 45
  },
  {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: '#06B6D4',
    description: 'Communication digitale',
    baseXP: 30
  },
  {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: '#0F172A',
    description: 'Relations professionnelles',
    baseXP: 40
  }
];

/**
 * 🏷️ FILTRES DE PORTÉE
 */
const SCOPE_FILTERS = [
  { value: 'all', label: 'Toutes les tâches', icon: Globe },
  { value: 'my_tasks', label: 'Mes tâches', icon: Users },
  { value: 'available', label: 'Disponibles', icon: Star },
  { value: 'assigned_to_me', label: 'Assignées à moi', icon: Target },
  { value: 'created_by_me', label: 'Créées par moi', icon: Edit }
];

/**
 * 🎯 UTILITAIRE POUR CRÉER DES TÂCHES SÉCURISÉES
 */
const createSafeTask = (task) => {
  try {
    return {
      id: task.id || 'unknown',
      title: task.title || 'Tâche sans titre',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      category: task.category || 'general',
      xpReward: task.xpReward || 25,
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
      createdBy: task.createdBy || null,
      createdAt: task.createdAt || null,
      updatedAt: task.updatedAt || null,
      userContext: task.userContext || {}
    };
  } catch (error) {
    console.error('❌ Erreur création tâche sécurisée:', error);
    return {
      id: 'error',
      title: 'Erreur de chargement',
      description: 'Impossible de charger cette tâche',
      status: 'error',
      priority: 'low',
      category: 'general',
      xpReward: 0,
      assignedTo: [],
      createdBy: null,
      createdAt: null,
      updatedAt: null,
      userContext: {}
    };
  }
};

/**
 * 📱 COMPOSANT PRINCIPAL PAGE TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // 📊 ÉTATS LOCAUX
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎨 ÉTATS UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterScope, setFilterScope] = useState('all');
  
  // 🔄 ÉTATS MODALS
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // 🎯 DONNÉES SUPPLÉMENTAIRES
  const [categories, setCategories] = useState(SYNERGIA_ROLES);
  const [teamMembers, setTeamMembers] = useState([]);

  /**
   * 🔄 CHARGEMENT INITIAL
   */
  useEffect(() => {
    if (user?.uid) {
      loadAllTasks();
    }
  }, [user?.uid]);

  /**
   * 📥 CHARGER TOUTES LES TÂCHES PUBLIQUES
   */
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Chargement de toutes les tâches publiques...');
      
      // Récupérer toutes les tâches disponibles
      const tasks = await taskService.getAvailableTasks(user.uid);
      
      console.log('📊 Tâches récupérées:', tasks.length);
      
      // Ajouter contexte utilisateur pour chaque tâche
      const tasksWithContext = tasks.map(task => {
        const isCreatedByMe = task.createdBy === user.uid;
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        const canVolunteer = !isAssignedToMe && !isCreatedByMe && task.status !== 'completed';
        
        return {
          ...task,
          userContext: {
            isCreatedByMe,
            isAssignedToMe,
            isMyTask: isCreatedByMe || isAssignedToMe,
            canVolunteer,
            canEdit: isCreatedByMe || isAssignedToMe,
            canComplete: isAssignedToMe
          }
        };
      });
      
      // Convertir en tâches sécurisées
      const safeTasks = tasksWithContext.map(createSafeTask);
      setAllTasks(safeTasks);
      
      console.log(`✅ Tâches chargées avec contexte utilisateur`);
      
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🙋 SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  const handleVolunteerForTask = async (task) => {
    try {
      console.log('🙋 Volontariat pour:', task.title);
      
      // ✅ CORRECTION TEMPORAIRE : Utiliser assignTask existant
      await taskService.assignTask(task.id, user.uid, user.uid);
      
      // Recharger les tâches
      await loadAllTasks();
      
      console.log('✅ Volontariat enregistré');
      
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    }
  };

  /**
   * 🚪 SE RETIRER D'UNE TÂCHE
   */
  const handleWithdrawFromTask = async (task) => {
    try {
      console.log('🚪 Retrait de:', task.title);
      
      // ✅ CORRECTION TEMPORAIRE : Utiliser unassignTask existant
      await taskService.unassignTask(task.id, user.uid);
      
      // Recharger les tâches
      await loadAllTasks();
      
      console.log('✅ Retrait enregistré');
      
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
      alert('Erreur lors du retrait: ' + error.message);
    }
  };

  /**
   * ➕ GESTION CRÉATION DE TÂCHE
   */
  const handleCreateTask = () => {
    console.log('➕ Ouverture formulaire création tâche');
    setEditingTask(null);
    setShowTaskForm(true);
  };

  /**
   * ✏️ GESTION ÉDITION DE TÂCHE
   */
  const handleEditTask = (task) => {
    console.log('✏️ Ouverture formulaire édition:', task.title);
    setEditingTask(task);
    setShowTaskForm(true);
  };

  /**
   * 👁️ GESTION DÉTAILS DE TÂCHE
   */
  const handleViewDetails = (task) => {
    console.log('👁️ Ouverture détails tâche:', task.title);
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  /**
   * 📤 GESTION SOUMISSION DE TÂCHE
   */
  const handleSubmitTask = (task) => {
    console.log('📤 Ouverture modal soumission:', task.title);
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  /**
   * 🗑️ GESTION SUPPRESSION DE TÂCHE - CORRIGÉE
   */
  const handleDeleteTask = async (taskId) => {
    try {
      console.log('🗑️ Suppression tâche:', taskId);
      
      // Confirmer la suppression
      const taskToDelete = allTasks.find(t => t.id === taskId);
      if (!taskToDelete) {
        throw new Error('Tâche introuvable');
      }
      
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer la tâche "${taskToDelete.title}" ?\n\nCette action est irréversible.`
      );
      
      if (!confirmed) {
        console.log('🚫 Suppression annulée par l\'utilisateur');
        return;
      }
      
      // Supprimer la tâche
      await taskService.deleteTask(taskId);
      
      // Recharger toutes les tâches
      await loadAllTasks();
      
      // Fermer la modal de détails si elle est ouverte
      if (showTaskDetail) {
        handleCloseTaskDetail();
      }
      
      console.log('✅ Tâche supprimée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  /**
   * ✅ GESTION SUCCÈS FORMULAIRE TÂCHE
   */
  const handleTaskFormSuccess = async (taskData) => {
    try {
      console.log('✅ Soumission réussie TaskForm:', taskData);
      
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
        console.log('✅ Tâche mise à jour');
      } else {
        const createdTask = await taskService.createTask(taskData, user.uid);
        console.log('✅ Nouvelle tâche créée:', createdTask);
      }
      
      // ✅ RECHARGER TOUTES LES TÂCHES
      await loadAllTasks();
      handleCloseTaskForm();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      throw error;
    }
  };

  /**
   * ❌ FERMETURE MODALS
   */
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCloseTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTask(null);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedTask(null);
  };

  /**
   * 🔍 FILTRAGE DES TÂCHES
   */
  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      // Filtre recherche
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre statut
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      
      // Filtre priorité
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      // Filtre catégorie/rôle
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      
      // ✅ NOUVEAU : Filtre portée (mes tâches vs toutes vs disponibles)
      const matchesScope = filterScope === 'all' || 
                          (filterScope === 'my_tasks' && task.userContext?.isMyTask) ||
                          (filterScope === 'available' && task.userContext?.canVolunteer) ||
                          (filterScope === 'assigned_to_me' && task.userContext?.isAssignedToMe) ||
                          (filterScope === 'created_by_me' && task.userContext?.isCreatedByMe);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesScope;
    });
  };

  const filteredTasks = filterTasks(allTasks);

  // Séparer pour l'affichage
  const myTasks = filteredTasks.filter(task => task.userContext?.isMyTask);
  const availableTasks = filteredTasks.filter(task => task.userContext?.canVolunteer);
  const allFilteredTasks = filteredTasks;

  // 🔄 AFFICHAGE LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Chargement de toutes les tâches...</p>
        </div>
      </div>
    );
  }

  // ❌ AFFICHAGE ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => loadAllTasks()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎯 Gestion des Tâches
            </h1>
            <p className="text-gray-400">
              Gérez et participez aux tâches collaboratives
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={handleCreateTask}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Tâche
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre portée */}
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SCOPE_FILTERS.map(scope => (
                <option key={scope.value} value={scope.value}>
                  {scope.label}
                </option>
              ))}
            </select>

            {/* Filtre statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="pending">En attente</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>

            {/* Filtre catégorie */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes catégories</option>
              {SYNERGIA_ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-lg font-semibold text-white">{allTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-400">Mes tâches</p>
                <p className="text-lg font-semibold text-white">{myTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-400">Disponibles</p>
                <p className="text-lg font-semibold text-white">{availableTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-400">Terminées</p>
                <p className="text-lg font-semibold text-white">
                  {allTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {filterScope === 'my_tasks' ? 'Mes Tâches' :
               filterScope === 'available' ? 'Tâches Disponibles' :
               'Toutes les Tâches'}
              <span className="ml-2 text-sm text-gray-400">
                ({filteredTasks.length})
              </span>
            </h2>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Commencez par créer votre première tâche'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && filterCategory === 'all' && (
                  <button
                    onClick={handleCreateTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer une tâche
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={() => handleViewDetails(task)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onVolunteer={() => handleVolunteerForTask(task)}
                    onWithdraw={() => handleWithdrawFromTask(task)}
                    onSubmit={() => handleSubmitTask(task)}
                    currentUserId={user.uid}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      
      {/* Modal création/édition de tâche */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          initialData={editingTask}
          onClose={handleCloseTaskForm}
          onSubmit={handleTaskFormSuccess}
          categories={categories}
          teamMembers={teamMembers}
        />
      )}

      {/* Modal détails de tâche - AVEC onDelete AJOUTÉ */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetail}
          task={selectedTask}
          onClose={handleCloseTaskDetail}
          onEdit={() => {
            handleCloseTaskDetail();
            handleEditTask(selectedTask);
          }}
          onDelete={handleDeleteTask}
          onSubmit={() => {
            handleCloseTaskDetail();
            handleSubmitTask(selectedTask);
          }}
        />
      )}

      {/* Modal assignation */}
      {showAssignModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignModal}
          task={selectedTask}
          onClose={handleCloseAssignModal}
          onSuccess={() => {
            handleCloseAssignModal();
            loadAllTasks();
          }}
        />
      )}

      {/* Modal soumission */}
      {showSubmitModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmitModal}
          task={selectedTask}
          onClose={handleCloseSubmitModal}
          onSuccess={() => {
            handleCloseSubmitModal();
            loadAllTasks();
          }}
        />
      )}
    </div>
  );
};

/**
 * 🎴 COMPOSANT CARTE DE TÂCHE
 */
const TaskCard = ({ 
  task, 
  onView, 
  onEdit, 
  onDelete, 
  onVolunteer, 
  onWithdraw, 
  onSubmit,
  currentUserId 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'todo': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'À faire';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getRoleInfo = (categoryId) => {
    return SYNERGIA_ROLES.find(role => role.id === categoryId) || {
      name: 'Catégorie inconnue',
      icon: '📝',
      color: '#6B7280'
    };
  };

  const roleInfo = getRoleInfo(task.category);

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 hover:bg-gray-700/70 transition-colors">
      <div className="flex items-start justify-between">
        
        {/* Contenu principal */}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div 
              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-3`}
              title={`Priorité: ${task.priority}`}
            />
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
            <span className="ml-2 text-sm text-gray-400">
              {roleInfo.icon}
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`font-medium ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            
            <span className="text-gray-400">
              <Trophy className="w-4 h-4 inline mr-1" />
              {task.xpReward} XP
            </span>

            <span className="text-gray-400" style={{ color: roleInfo.color }}>
              {roleInfo.name}
            </span>

            {task.userContext?.isMyTask && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                Ma tâche
              </span>
            )}

            {task.userContext?.canVolunteer && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                Disponible
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          
          {/* Voir détails */}
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Éditer (si créateur ou assigné) */}
          {task.userContext?.canEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-600 rounded-lg transition-colors"
              title="Modifier la tâche"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Supprimer (si créateur) */}
          {task.userContext?.isCreatedByMe && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
              title="Supprimer la tâche"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {/* Se porter volontaire */}
          {task.userContext?.canVolunteer && (
            <button
              onClick={onVolunteer}
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-600 rounded-lg transition-colors"
              title="Se porter volontaire"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

          {/* Se retirer */}
          {task.userContext?.isAssignedToMe && !task.userContext?.isCreatedByMe && (
            <button
              onClick={onWithdraw}
              className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-600 rounded-lg transition-colors"
              title="Se retirer de la tâche"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          )}

          {/* Soumettre pour validation */}
          {task.userContext?.isAssignedToMe && task.status !== 'completed' && (
            <button
              onClick={onSubmit}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-600 rounded-lg transition-colors"
              title="Soumettre pour validation"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
