// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE PRINCIPALE DES TÂCHES AVEC IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Filter as FunnelIcon, 
  Search as MagnifyingGlassIcon,
  Grid3X3 as Squares2X2Icon,
  List as ListBulletIcon,
  Calendar as CalendarDaysIcon,
  Clock as ClockIcon,
  Users as UserGroupIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as ExclamationCircleIcon
} from 'lucide-react';

// ==========================================
// 🔧 IMPORTS STORES ET SERVICES
// ==========================================
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import weeklyRecurrenceService from '../core/services/weeklyRecurrenceService.js';

// ==========================================
// 🎭 IMPORTS COMPOSANTS UI - CHEMINS CORRIGÉS
// ==========================================
import Layout from '../components/layout/Layout.jsx';

// ==========================================
// 🔧 IMPORTS COMPOSANTS TÂCHES - UTILISER COMPOSANTS EXISTANTS
// ==========================================
import TaskCard from '../modules/tasks/TaskCard.jsx';
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';

// ==========================================
// 🎯 COMPOSANTS UI INTÉGRÉS (pour éviter les imports manquants)
// ==========================================

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    secondary: 'bg-gray-100 text-gray-600'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', disabled = false, className = '', ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
  };
  
  return (
    <button 
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const TaskFilters = ({ 
  selectedStatus, 
  selectedPriority, 
  selectedRole,
  onStatusChange, 
  onPriorityChange, 
  onRoleChange 
}) => (
  <div className="flex gap-3">
    <select
      value={selectedStatus}
      onChange={(e) => onStatusChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="all">Tous les statuts</option>
      <option value="todo">À faire</option>
      <option value="in_progress">En cours</option>
      <option value="completed">Terminé</option>
    </select>
    
    <select
      value={selectedPriority}
      onChange={(e) => onPriorityChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="all">Toutes priorités</option>
      <option value="low">Basse</option>
      <option value="medium">Moyenne</option>
      <option value="high">Haute</option>
      <option value="urgent">Urgente</option>
    </select>
  </div>
);

const TaskList = ({ tasks, onComplete, onEdit, onDelete, onView, currentUser }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-md">
    <ul className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <li key={task.id} className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={task.priority === 'high' ? 'warning' : 'default'}>
                {task.priority}
              </Badge>
              <button
                onClick={() => onView(task)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Voir
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// ==========================================
// 🎯 UTILITAIRES
// ==========================================

/**
 * Convertir un timestamp Firestore en Date
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) {
    try {
      return timestamp.toDate();
    } catch (error) {
      console.warn('Erreur conversion timestamp:', error);
      return new Date();
    }
  }
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * 🏠 PAGE PRINCIPALE DES TÂCHES AVEC VRAIS COMPOSANTS
 */
const TasksPage = () => {
  const { user } = useAuthStore();

  // États pour les données et UI
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeTab, setActiveTab] = useState('my_tasks'); // 🆕 État pour l'onglet actif
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // 🆕 États pour les modals et actions
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // 📊 Statistiques calculées - CORRIGÉES
  const taskStats = useMemo(() => {
    const myTasks = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      return assignedTo.includes(user?.uid);
    });
    
    const available = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const isAssignedToMe = assignedTo.includes(user?.uid);
      const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
      const isOpenToVolunteers = t.openToVolunteers === true;
      
      return !isAssignedToMe && (isOpenToVolunteers || hasNoAssignment) && t.status === 'todo';
    });
    
    const others = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const isAssignedToMe = assignedTo.includes(user?.uid);
      const hasAssignment = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
      const isAssignedToOthers = hasAssignment && !isAssignedToMe;
      const isOpenToVolunteers = t.openToVolunteers === true;
      
      return !isAssignedToMe && hasAssignment && isAssignedToOthers && !isOpenToVolunteers;
    });
    
    const history = tasks.filter(t => ['completed', 'validated', 'cancelled'].includes(t.status));

    return {
      myTasks: myTasks.length,
      available: available.length,
      others: others.length,
      history: history.length,
      total: tasks.length
    };
  }, [tasks, user?.uid]);

  // 🔍 Filtrage et tri des tâches avec onglets - CORRIGÉ
  useEffect(() => {
    let filtered = [...tasks];

    // 🆕 Filtrage par onglet actif - LOGIQUE CORRIGÉE
    switch (activeTab) {
      case 'my_tasks':
        // Mes tâches : tâches assignées à moi
        filtered = filtered.filter(t => {
          const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
          return assignedTo.includes(user?.uid);
        });
        break;
        
      case 'available':
        // Disponibles : PAS assignées à moi ET (ouvertes aux volontaires OU sans assignation) ET statut "todo"
        filtered = filtered.filter(t => {
          const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
          const isAssignedToMe = assignedTo.includes(user?.uid);
          const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
          const isOpenToVolunteers = t.openToVolunteers === true;
          
          return !isAssignedToMe && (isOpenToVolunteers || hasNoAssignment) && t.status === 'todo';
        });
        break;
        
      case 'others':
        // Autres : PAS assignées à moi ET assignées à d'autres ET PAS ouvertes aux volontaires
        filtered = filtered.filter(t => {
          const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
          const isAssignedToMe = assignedTo.includes(user?.uid);
          const hasAssignment = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
          const isAssignedToOthers = hasAssignment && !isAssignedToMe;
          const isOpenToVolunteers = t.openToVolunteers === true;
          
          return !isAssignedToMe && hasAssignment && isAssignedToOthers && !isOpenToVolunteers;
        });
        break;
        
      case 'history':
        // Historique : tâches terminées/validées/annulées
        filtered = filtered.filter(t => ['completed', 'validated', 'cancelled'].includes(t.status));
        break;
        
      default:
        // Toutes les tâches
        break;
    }

    // 🔍 Filtrage par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.notes?.toLowerCase().includes(term)
      );
    }

    // 🔍 Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // 🔍 Filtrage par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // 🔍 Filtrage par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.roleId === selectedRole);
    }

    // 📊 Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Gestion spéciale pour les dates
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = aVal ? convertTimestamp(aVal) : new Date(0);
        bVal = bVal ? convertTimestamp(bVal) : new Date(0);
      }

      // Comparaison
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTasks(filtered);
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder, user?.uid]);

  // 🔄 Chargement initial et écoute temps réel
  const { 
    loadUserTasks, 
    subscribeToTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    completeTask 
  } = useTaskStore();

  // 🚀 INITIALISATION AVEC SERVICE DE RÉCURRENCE
  useEffect(() => {
    if (!user?.uid) return;

    const initializeTasks = async () => {
      try {
        setIsLoading(true);
        
        // 🔄 INITIALISER LE SERVICE DE RÉCURRENCE POUR GÉNÉRER LES TÂCHES MANQUANTES
        console.log('🔄 [TASKS-PAGE] Initialisation service de récurrence...');
        await weeklyRecurrenceService.initialize();
        
        // Charger les tâches après l'initialisation de la récurrence
        await loadUserTasks(user.uid);
        
        console.log('✅ [TASKS-PAGE] Initialisation terminée avec succès');
      } catch (error) {
        console.error('❌ [TASKS-PAGE] Erreur initialisation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTasks();

    // Écoute temps réel
    const unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, loadUserTasks, subscribeToTasks]);

  // 🎯 GESTIONNAIRES D'ÉVÉNEMENTS

  // 📝 Créer ou modifier une tâche
  const handleCreateTask = async (taskData) => {
    try {
      if (selectedTaskForEdit) {
        // Mode édition
        await updateTask(selectedTaskForEdit.id, taskData, user.uid);
      } else {
        // Mode création
        await createTask(taskData, user.uid);
      }
      
      // Fermer le modal et réinitialiser
      setShowNewTaskModal(false);
      setSelectedTaskForEdit(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // ✅ Terminer une tâche
  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId, user.uid);
    } catch (error) {
      console.error('Erreur lors de la completion:', error);
    }
  };

  // 🗑️ Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId, user.uid);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // ✏️ Éditer une tâche
  const handleEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setShowNewTaskModal(true);
  };

  // 👁️ Voir les détails d'une tâche
  const handleViewTask = (task) => {
    setSelectedTaskForDetails(task);
  };

  // 🔄 Actualiser les données
  const handleRefresh = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // Re-initialiser le service de récurrence
      await weeklyRecurrenceService.initialize();
      
      // Recharger les tâches
      await loadUserTasks(user.uid);
    } catch (error) {
      console.error('Erreur actualisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 RENDER
  return (
    <Layout>
      <div className="space-y-6">
        {/* 📊 En-tête avec statistiques */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
            <p className="text-gray-600">
              {taskStats.total} tâche{taskStats.total > 1 ? 's' : ''} au total
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button
              onClick={() => setShowNewTaskModal(true)}
              disabled={isLoading}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* 📈 Onglets avec statistiques */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my_tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'my_tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Mes tâches
                <Badge variant="default" className="ml-2">{taskStats.myTasks}</Badge>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'available'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Disponibles
                <Badge variant="success" className="ml-2">{taskStats.available}</Badge>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('others')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'others'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                Autres
                <Badge variant="warning" className="ml-2">{taskStats.others}</Badge>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Historique
                <Badge variant="secondary" className="ml-2">{taskStats.history}</Badge>
              </span>
            </button>
          </nav>
        </div>

        {/* 🔍 Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des tâches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Filtres */}
          <TaskFilters
            selectedStatus={selectedStatus}
            selectedPriority={selectedPriority}
            selectedRole={selectedRole}
            onStatusChange={setSelectedStatus}
            onPriorityChange={setSelectedPriority}
            onRoleChange={setSelectedRole}
          />

          {/* Vue */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'cards'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                viewMode === 'list'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 📋 Liste des tâches */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <CheckCircleIcon />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucune tâche trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'my_tasks' && "Vous n'avez aucune tâche assignée."}
              {activeTab === 'available' && "Aucune tâche disponible en ce moment."}
              {activeTab === 'others' && "Aucune tâche assignée à d'autres."}
              {activeTab === 'history' && "Aucune tâche dans l'historique."}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowNewTaskModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer une tâche
              </Button>
            </div>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'cards' ? (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleCompleteTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onView={() => handleViewTask(task)}
                    currentUser={user}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TaskList
                  tasks={filteredTasks}
                  onComplete={handleCompleteTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onView={handleViewTask}
                  currentUser={user}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* 📱 Modals */}
        
        {/* Modal nouvelle tâche - CORRECTION DUPLICATION */}
        {showNewTaskModal && (
          <NewTaskModal
            isOpen={showNewTaskModal}
            onClose={() => {
              setShowNewTaskModal(false);
              setSelectedTaskForEdit(null);
            }}
            onSuccess={handleCreateTask}
            currentUser={user}
            initialData={selectedTaskForEdit}
            mode={selectedTaskForEdit ? 'edit' : 'create'}
          />
        )}

        {/* Modal détails de tâche */}
        {selectedTaskForDetails && (
          <TaskDetailModal
            task={selectedTaskForDetails}
            isOpen={!!selectedTaskForDetails}
            onClose={() => setSelectedTaskForDetails(null)}
            onEdit={() => {
              handleEditTask(selectedTaskForDetails);
              setSelectedTaskForDetails(null);
            }}
            onComplete={() => handleCompleteTask(selectedTaskForDetails.id)}
            onDelete={() => handleDeleteTask(selectedTaskForDetails.id)}
            currentUser={user}
          />
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;
