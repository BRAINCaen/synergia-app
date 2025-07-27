// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION FINALE - SYSTÈME VOLONTAIRES + CORRECTIONS SOUMISSIONS
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
  UserMinus,
  RefreshCw,
  Bug,
  Heart
} from 'lucide-react';

// ✅ IMPORTS STANDARDS
import { useAuthStore } from '../shared/stores/authStore';
import { useTaskStore } from '../shared/stores/taskStore';
import TaskForm from '../modules/tasks/TaskForm';
import { TaskDetailModal } from '../shared/components/ui/ModalWrapper';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal';
import { taskService } from '../core/services/taskService';

// ✅ IMPORT DU NOUVEAU COMPOSANT VOLONTAIRE
import VolunteerTaskCard from '../components/tasks/VolunteerTaskSystem';

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
 * 🏷️ FILTRES DE PORTÉE ÉTENDUS
 */
const SCOPE_FILTERS = [
  { value: 'all', label: 'Toutes les tâches', icon: Globe, description: 'Toutes les tâches disponibles' },
  { value: 'my_tasks', label: 'Mes tâches', icon: Users, description: 'Tâches que j\'ai créées ou auxquelles je participe' },
  { value: 'available', label: 'Disponibles', icon: Star, description: 'Tâches ouvertes aux volontaires' },
  { value: 'assigned_to_me', label: 'Assignées à moi', icon: Target, description: 'Tâches où je suis volontaire' },
  { value: 'created_by_me', label: 'Créées par moi', icon: Edit, description: 'Tâches que j\'ai créées' },
  { value: 'in_validation', label: 'En validation', icon: Clock, description: 'Tâches en attente de validation' }
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
  const [filterScope, setFilterScope] = useState('available'); // ✅ Par défaut sur "disponibles"
  
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
   * 📥 CHARGER TOUTES LES TÂCHES - VERSION FINALE
   */
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 [FINAL] Chargement tâches volontaires...');
      
      let tasks = [];
      
      try {
        // Récupérer TOUTES les tâches
        tasks = await taskService.getAllTasks();
        console.log(`📊 [FINAL] ${tasks.length} tâches récupérées`);
      } catch (error1) {
        console.warn('⚠️ [FINAL] Méthode standard échouée, fallback...');
        
        // Fallback : récupération directe
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../core/firebase.js');
        
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        tasks = [];
        tasksSnapshot.forEach(doc => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log(`📊 [FINAL] ${tasks.length} tâches récupérées via fallback`);
      }
      
      if (tasks.length === 0) {
        console.log('🎯 [FINAL] Aucune tâche - création de tâches de démo...');
        await createDemoTasks();
        tasks = await taskService.getAllTasks();
      }
      
      // Ajouter contexte utilisateur pour chaque tâche
      const tasksWithContext = tasks.map(task => {
        const isCreatedByMe = task.createdBy === user.uid;
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        const canVolunteer = !isAssignedToMe && !isCreatedByMe && 
                            task.status !== 'completed' && 
                            task.status !== 'validation_pending';
        
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
      
      console.log(`✅ [FINAL] ${safeTasks.length} tâches chargées avec contexte`);
      
    } catch (error) {
      console.error('❌ [FINAL] Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 CRÉER DES TÂCHES DE DÉMONSTRATION
   */
  const createDemoTasks = async () => {
    try {
      console.log('🎯 [DEMO] Création tâches de démonstration...');
      
      const demoTasks = [
        {
          title: '🔧 Maintenance Matériel Escape Game',
          description: 'Vérifier et maintenir tout le matériel électronique des salles',
          category: 'maintenance',
          priority: 'high',
          xpReward: 40,
          status: 'pending',
          assignedTo: [],
          tags: ['maintenance', 'électronique', 'urgent']
        },
        {
          title: '⭐ Gérer les Avis Google',
          description: 'Répondre aux avis clients sur Google et TripAdvisor',
          category: 'reputation',
          priority: 'medium',
          xpReward: 30,
          status: 'pending',
          assignedTo: [],
          tags: ['avis', 'communication', 'clients']
        },
        {
          title: '📦 Inventaire Stock Produits Dérivés',
          description: 'Faire l\'inventaire complet des produits dérivés en magasin',
          category: 'stock',
          priority: 'low',
          xpReward: 25,
          status: 'pending',
          assignedTo: [],
          tags: ['inventaire', 'produits', 'magasin']
        },
        {
          title: '🎨 Créer Affichage Nouvelle Salle',
          description: 'Concevoir les affiches et supports visuels pour la nouvelle salle',
          category: 'content',
          priority: 'medium',
          xpReward: 35,
          status: 'pending',
          assignedTo: [],
          tags: ['design', 'affichage', 'nouvelle-salle']
        },
        {
          title: '📢 Campagne Réseaux Sociaux',
          description: 'Planifier et lancer une campagne sur les réseaux sociaux',
          category: 'communication',
          priority: 'high',
          xpReward: 45,
          status: 'pending',
          assignedTo: [],
          tags: ['réseaux-sociaux', 'marketing', 'campagne']
        }
      ];

      for (const taskData of demoTasks) {
        await taskService.createTask(taskData, 'system-demo');
      }

      console.log('✅ [DEMO] Tâches de démonstration créées');

    } catch (error) {
      console.error('❌ [DEMO] Erreur création tâches démo:', error);
    }
  };

  /**
   * 🗑️ GESTION SUPPRESSION DE TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    try {
      const taskToDelete = allTasks.find(t => t.id === taskId);
      if (!taskToDelete) {
        throw new Error('Tâche introuvable');
      }
      
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer la tâche "${taskToDelete.title}" ?\n\nCette action est irréversible.`
      );
      
      if (!confirmed) return;
      
      await taskService.deleteTask(taskId);
      await loadAllTasks();
      
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
   * ➕ GESTION CRÉATION DE TÂCHE
   */
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  /**
   * ✏️ GESTION ÉDITION DE TÂCHE
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  /**
   * 👁️ GESTION DÉTAILS DE TÂCHE
   */
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  /**
   * 📤 GESTION SOUMISSION DE TÂCHE
   */
  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  /**
   * ✅ GESTION SUCCÈS FORMULAIRE TÂCHE
   */
  const handleTaskFormSuccess = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        await taskService.createTask(taskData, user.uid);
      }
      
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
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      
      let matchesScope = true;
      switch (filterScope) {
        case 'my_tasks':
          matchesScope = task.userContext?.isMyTask;
          break;
        case 'available':
          matchesScope = task.userContext?.canVolunteer;
          break;
        case 'assigned_to_me':
          matchesScope = task.userContext?.isAssignedToMe;
          break;
        case 'created_by_me':
          matchesScope = task.userContext?.isCreatedByMe;
          break;
        case 'in_validation':
          matchesScope = task.status === 'validation_pending';
          break;
        default:
          matchesScope = true;
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesScope;
    });
  };

  const filteredTasks = filterTasks(allTasks);
  const availableTasks = allTasks.filter(task => task.userContext?.canVolunteer);
  const myTasks = allTasks.filter(task => task.userContext?.isMyTask);
  const inValidationTasks = allTasks.filter(task => task.status === 'validation_pending');

  // 🔄 AFFICHAGE LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Chargement du système de volontaires...</p>
        </div>
      </div>
    );
  }

  // ❌ AFFICHAGE ERREUR
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          
          <button
            onClick={() => loadAllTasks()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header avec titre engageant */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🚀 Système de Volontaires Synergia
            </h1>
            <p className="text-gray-400">
              Participez aux tâches collaboratives et gagnez de l'XP ! 
              <span className="text-yellow-400 ml-2">
                {availableTasks.length} tâches disponibles
              </span>
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button
              onClick={handleCreateTask}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer une Tâche
            </button>
          </div>
        </div>

        {/* Filtres enrichis */}
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

            {/* Filtre portée avec descriptions */}
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
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminées</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
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

        {/* Statistiques dynamiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-300">Total</p>
                <p className="text-lg font-semibold text-white">{allTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-300">Disponibles</p>
                <p className="text-lg font-semibold text-white">{availableTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-300">Mes tâches</p>
                <p className="text-lg font-semibold text-white">{myTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-300">En validation</p>
                <p className="text-lg font-semibold text-white">{inValidationTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des tâches avec nouveau composant */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {filterScope === 'my_tasks' ? '💼 Mes Tâches' :
               filterScope === 'available' ? '🌟 Tâches Disponibles' :
               filterScope === 'in_validation' ? '⏳ En Validation' :
               '🌍 Toutes les Tâches'}
              <span className="ml-2 text-sm text-gray-400">
                ({filteredTasks.length})
              </span>
            </h2>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {filterScope === 'available' ? '🌟' : filterScope === 'my_tasks' ? '💼' : '🔍'}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {filterScope === 'available' ? 'Aucune tâche disponible pour le moment' :
                   filterScope === 'my_tasks' ? 'Vous ne participez à aucune tâche' :
                   'Aucune tâche trouvée'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {filterScope === 'available' ? 'Revenez plus tard ou créez une nouvelle tâche !' :
                   filterScope === 'my_tasks' ? 'Rejoignez des tâches disponibles pour commencer !' :
                   'Essayez de modifier vos critères de recherche'}
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setFilterScope('available')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Voir les tâches disponibles
                  </button>
                  <button
                    onClick={handleCreateTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer une tâche
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <VolunteerTaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={loadAllTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS - Identiques au code précédent */}
      
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

export default TasksPage;
