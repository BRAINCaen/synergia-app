// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC SYSTÈME PUBLIC - TOUTES VISIBLES
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
    color: '#64748B',
    description: 'Relations entreprises et devis',
    baseXP: 50
  },
  {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: '#7C3AED',
    description: 'Gestion du système de gamification',
    baseXP: 40
  }
];

/**
 * 🛡️ FONCTION DE SÉCURITÉ POUR TÂCHES
 */
const createSafeTask = (task) => {
  if (!task || typeof task !== 'object') {
    console.warn('❌ Tâche invalide:', task);
    return {
      id: `safe-${Date.now()}`,
      title: 'Tâche corrompue',
      description: 'Données endommagées',
      status: 'error',
      priority: 'medium',
      xpReward: 0,
      estimatedHours: 0,
      category: 'Système',
      createdAt: new Date(),
      assignedTo: [],
      userContext: { isMyTask: false, canVolunteer: false }
    };
  }

  return {
    id: task.id || `fallback-${Date.now()}`,
    title: task.title || 'Sans titre',
    description: task.description || '',
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    xpReward: task.xpReward || 0,
    estimatedHours: task.estimatedHours || 0,
    category: task.category || 'Général',
    createdAt: task.createdAt || new Date(),
    assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
    dueDate: task.dueDate || null,
    tags: Array.isArray(task.tags) ? task.tags : [],
    submissions: Array.isArray(task.submissions) ? task.submissions : [],
    createdBy: task.createdBy || 'unknown',
    userContext: task.userContext || { isMyTask: false, canVolunteer: true }
  };
};

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES PUBLIQUES
 */
const TasksPage = () => {
  // 🔐 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS PRINCIPAUX
  const [allTasks, setAllTasks] = useState([]);
  const [categories, setCategories] = useState(SYNERGIA_ROLES);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🔍 FILTRES ET RECHERCHE
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterScope, setFilterScope] = useState('all'); // ✅ NOUVEAU : all, my_tasks, available
  
  // ✅ ÉTATS POUR LES MODALS
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  /**
   * 🚀 CHARGEMENT INITIAL
   */
  useEffect(() => {
    if (user) {
      loadAllTasks();
    }
  }, [user]);

  /**
   * 🌍 CHARGER TOUTES LES TÂCHES PUBLIQUES
   */
  const loadAllTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🌍 Chargement de TOUTES les tâches publiques...');
      
      // ✅ CORRECTION TEMPORAIRE : Utiliser getAllTasks existant
      const allTasksData = await taskService.getAllTasks();
      console.log(`📊 ${allTasksData.length} tâches publiques trouvées`);
      
      // Ajouter le contexte utilisateur à chaque tâche
      const tasksWithContext = allTasksData.map(task => {
        const isCreatedByMe = task.createdBy === user.uid;
        const isAssignedToMe = task.assignedTo?.includes(user.uid) || false;
        const canVolunteer = !isAssignedToMe && task.status !== 'completed';
        
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Toutes les Tâches
              </h1>
              <p className="text-gray-400 text-lg mt-2 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {allTasks.length} tâches publiques • {myTasks.length} mes tâches • {availableTasks.length} disponibles
              </p>
            </div>
            
            <button
              onClick={handleCreateTask}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nouvelle tâche
            </button>
          </div>

          {/* Filtres étendus */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              
              {/* Recherche */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* ✅ NOUVEAU : Filtre portée */}
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🌍 Toutes</option>
                <option value="my_tasks">👤 Mes tâches</option>
                <option value="available">🎯 Disponibles</option>
                <option value="created_by_me">✨ Créées par moi</option>
                <option value="assigned_to_me">📋 Assignées à moi</option>
              </select>

              {/* Filtre statut */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assignées</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
              </select>

              {/* Filtre priorité */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>

              {/* Filtre rôle */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {categories.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.icon ? `${role.icon} ` : ''}{role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tâches filtrées */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            {filterScope === 'my_tasks' ? `Mes tâches (${allFilteredTasks.length})` :
             filterScope === 'available' ? `Tâches disponibles (${allFilteredTasks.length})` :
             `Toutes les tâches (${allFilteredTasks.length})`}
          </h2>
          
          <div className="grid gap-4">
            {allFilteredTasks.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' 
                    ? 'Aucune tâche ne correspond aux filtres'
                    : 'Aucune tâche disponible'
                  }
                </p>
              </div>
            ) : (
              allFilteredTasks.map(task => (
                <div key={task.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        
                        {/* Badges de statut */}
                        {task.userContext?.isCreatedByMe && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            ✨ Créée par moi
                          </span>
                        )}
                        {task.userContext?.isAssignedToMe && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                            📋 Assignée à moi
                          </span>
                        )}
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {task.priority === 'urgent' ? '🔴 Urgente' :
                           task.priority === 'high' ? '🟠 Haute' :
                           task.priority === 'medium' ? '🟡 Moyenne' : '🟢 Basse'}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          task.status === 'assigned' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {task.status === 'completed' ? '✅ Terminée' :
                           task.status === 'in_progress' ? '🔄 En cours' :
                           task.status === 'assigned' ? '👤 Assignée' : '⏳ En attente'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.category && (
                          <span className="flex items-center gap-1">
                            {categories.find(role => role.id === task.category)?.icon || '📂'} {categories.find(role => role.id === task.category)?.name || task.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {task.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.estimatedHours}h
                        </span>
                        {task.assignedTo.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {task.assignedTo.length} assigné{task.assignedTo.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(task)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {/* Édition (si créée par moi ou assignée à moi) */}
                      {task.userContext?.canEdit && (
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      
                      {/* Soumission (si assignée à moi et pas terminée) */}
                      {task.userContext?.canComplete && task.status !== 'completed' && (
                        <button
                          onClick={() => handleSubmitTask(task)}
                          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          title="Soumettre le travail"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      )}
                      
                      {/* Volontariat (si je peux me porter volontaire) */}
                      {task.userContext?.canVolunteer && (
                        <button
                          onClick={() => handleVolunteerForTask(task)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm"
                          title="Se porter volontaire"
                        >
                          <UserPlus className="w-4 h-4 mr-1 inline" />
                          Volontaire
                        </button>
                      )}
                      
                      {/* Retrait (si assignée à moi) */}
                      {task.userContext?.isAssignedToMe && task.status !== 'completed' && (
                        <button
                          onClick={() => handleWithdrawFromTask(task)}
                          className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-sm"
                          title="Se retirer de la tâche"
                        >
                          <UserMinus className="w-4 h-4 mr-1 inline" />
                          Retrait
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
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

      {/* Modal détails de tâche */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetail}
          task={selectedTask}
          onClose={handleCloseTaskDetail}
          onEdit={() => {
            handleCloseTaskDetail();
            handleEditTask(selectedTask);
          }}
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

export default TasksPage;
