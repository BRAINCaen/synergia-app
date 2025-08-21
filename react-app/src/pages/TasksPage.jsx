// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE AVEC VUES CARTES, LISTE ET KANBAN
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  User,
  Users,
  Heart,
  Archive,
  FileText,
  Play,
  Image as ImageIcon,
  MessageCircle,
  Calendar,
  Target,
  Zap,
  Clock,
  AlertCircle,
  ChevronDown,
  Star,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowRight,
  MoreVertical
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 IMPORT DES VRAIS COMPOSANTS QUI MARCHAIENT
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎮 SERVICES ET CONSTANTES
import { SYNERGIA_ROLES } from '../core/data/roles.js';
import { taskService } from '../core/services/taskService.js';

// 📊 CONSTANTES TÂCHES
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' },
  validation_pending: { label: 'En attente validation', color: 'orange', icon: '⏰' }
};

const TASK_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

// 🆕 ONGLETS DE TRI DES TÂCHES
const TASK_TABS = {
  my_tasks: { label: 'Mes tâches', icon: User, color: 'blue' },
  available: { label: 'Disponibles', icon: Users, color: 'green' },
  others: { label: 'Autres', icon: Eye, color: 'purple' },
  history: { label: 'Historique', icon: Archive, color: 'gray' }
};

// 🔧 KANBAN COLUMNS CONFIGURATION
const KANBAN_COLUMNS = {
  todo: { 
    title: 'À faire', 
    color: 'bg-gray-600', 
    textColor: 'text-gray-100',
    statuses: ['todo', 'pending'] 
  },
  in_progress: { 
    title: 'En cours', 
    color: 'bg-blue-600', 
    textColor: 'text-blue-100',
    statuses: ['in_progress'] 
  },
  review: { 
    title: 'En révision', 
    color: 'bg-yellow-600', 
    textColor: 'text-yellow-100',
    statuses: ['review', 'validation_pending'] 
  },
  completed: { 
    title: 'Terminé', 
    color: 'bg-green-600', 
    textColor: 'text-green-100',
    statuses: ['completed', 'validated'] 
  }
};

// 🔧 FONCTION HELPER POUR CONVERTIR LES TIMESTAMPS
const convertFirebaseTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp.toDate === 'function') {
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
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // États pour les modals et actions
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // 📊 Statistiques calculées
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
      
      return !isAssignedToMe && hasAssignment && !t.openToVolunteers;
    });

    // ✅ CORRECTION : Calcul correct de l'historique
    const history = tasks.filter(t => 
      t.status === 'completed' || t.status === 'validated' || t.status === 'cancelled'
    );

    return {
      total: tasks.length,
      myTasks: myTasks.length,
      available: available.length,
      others: others.length,
      history: history.length, // ✅ Ajout du calcul de l'historique
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed' || t.status === 'validated').length,
      pending: tasks.filter(t => t.status === 'todo' || t.status === 'pending').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length
    };
  }, [tasks, user?.uid]);

  // 🔄 Chargement des tâches depuis Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTasks(tasksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🔍 Filtrage et tri des tâches
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrage par onglet actif
    if (activeTab === 'my_tasks') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        return assignedTo.includes(user?.uid);
      });
    } else if (activeTab === 'available') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
        const isOpenToVolunteers = task.openToVolunteers === true;
        
        return !isAssignedToMe && (isOpenToVolunteers || hasNoAssignment) && task.status === 'todo';
      });
    } else if (activeTab === 'others') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const hasAssignment = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
        
        return !isAssignedToMe && hasAssignment && !task.openToVolunteers;
      });
    } else if (activeTab === 'history') {
      filtered = filtered.filter(task => 
        task.status === 'completed' || task.status === 'validated' || task.status === 'cancelled'
      );
    }

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.roleId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filtrage par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Filtrage par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.role === selectedRole || task.roleId === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === 'createdAt') {
        valueA = convertFirebaseTimestamp(valueA);
        valueB = convertFirebaseTimestamp(valueB);
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder, user?.uid]);

  // 🔧 Gestionnaires d'événements
  const handleCreateTask = useCallback((newTask) => {
    console.log('Nouvelle tâche créée:', newTask);
    setShowNewTaskModal(false);
    setSelectedTaskForEdit(null);
  }, []);

  const handleViewDetails = useCallback((task) => {
    setSelectedTaskForDetails(task);
  }, []);

  const handleEdit = useCallback((task) => {
    setSelectedTaskForEdit(task);
    setShowNewTaskModal(true);
  }, []);

  const handleDelete = useCallback(async (task) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
      try {
        await deleteDoc(doc(db, 'tasks', task.id));
        console.log('Tâche supprimée:', task.title);
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
        alert('Erreur lors de la suppression');
      }
    }
  }, []);

  const handleVolunteer = useCallback(async (task) => {
    try {
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: [...currentAssigned, user.uid],
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      console.log('Volontariat enregistré pour:', task.title);
    } catch (error) {
      console.error('Erreur volontariat:', error);
    }
  }, [user]);

  const handleUnvolunteer = useCallback(async (task) => {
    try {
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const newAssigned = currentAssigned.filter(id => id !== user.uid);
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: newAssigned,
        status: newAssigned.length === 0 ? 'todo' : task.status,
        updatedAt: serverTimestamp()
      });
      console.log('Retrait volontariat pour:', task.title);
    } catch (error) {
      console.error('Erreur retrait volontariat:', error);
    }
  }, [user]);

  const handleSubmit = useCallback((task) => {
    console.log('Soumission tâche:', task.title);
  }, []);

  const handleTaskUpdate = useCallback(() => {
    console.log('Mise à jour des tâches');
  }, []);

  // 🎨 Rendu des onglets
  const renderTabs = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
        {Object.entries(TASK_TABS).map(([key, tab]) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === key;
          const count = key === 'my_tasks' ? taskStats.myTasks : 
                       key === 'available' ? taskStats.available :
                       key === 'others' ? taskStats.others :
                       key === 'history' ? taskStats.history : 0;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isActive 
                  ? `bg-${tab.color}-600 text-white shadow-lg` 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${isActive ? 'bg-white/20' : 'bg-gray-700'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // 🔧 Rendu des filtres
  const renderFilters = () => (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-4">
        {/* Filtre statut */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(TASK_STATUS).map(([key, status]) => (
            <option key={key} value={key}>{status.label}</option>
          ))}
        </select>

        {/* Filtre priorité */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes priorités</option>
          {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
            <option key={key} value={key}>{priority.label}</option>
          ))}
        </select>

        {/* Filtre rôle */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
            <option key={key} value={key}>{role.name}</option>
          ))}
        </select>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Date création</option>
          <option value="title">Titre</option>
          <option value="priority">Priorité</option>
          <option value="status">Statut</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  // 🔧 Rendu d'une tâche pour la vue Kanban
  const renderKanbanTask = (task) => {
    const statusInfo = TASK_STATUS[task.status] || TASK_STATUS.todo;
    const priorityInfo = TASK_PRIORITY[task.priority] || TASK_PRIORITY.medium;
    const isAssignedToMe = Array.isArray(task.assignedTo) 
      ? task.assignedTo.includes(user?.uid)
      : task.assignedTo === user?.uid;

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 mb-3 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        onClick={() => handleViewDetails(task)}
      >
        {/* Header de la carte */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${priorityInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
              ${priorityInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${priorityInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
              ${priorityInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {priorityInfo.icon}
            </span>
            {task.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                🎭 {task.role}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Menu d'actions
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Titre et description */}
        <h3 className="font-medium text-white mb-2 line-clamp-2" title={task.title}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2" title={task.description}>
            {task.description}
          </p>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3" />
            <span>{convertFirebaseTimestamp(task.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3" />
            <span>{task.xpReward || 25} XP</span>
          </div>
        </div>

        {/* Assignation */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isAssignedToMe ? (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                <User className="w-3 h-3 mr-1" />
                Assigné à moi
              </span>
            ) : task.assignedTo && task.assignedTo.length > 0 ? (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                <Users className="w-3 h-3 mr-1" />
                {Array.isArray(task.assignedTo) ? task.assignedTo.length : 1} personne(s)
              </span>
            ) : (
              <span className="text-gray-500 text-xs">Non assignée</span>
            )}
          </div>
          
          {/* Icônes d'état */}
          <div className="flex items-center space-x-1">
            {task.hasImage && <ImageIcon className="w-3 h-3 text-blue-400" />}
            {task.hasComment && <MessageCircle className="w-3 h-3 text-green-400" />}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PremiumLayout
      title="Gestion des Tâches"
      subtitle="Organisez et suivez vos tâches avec efficacité"
      icon={CheckSquare}
      showStats={false}
      headerActions={
        <div className="flex items-center space-x-3">
          {/* Modes d'affichage */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Vue cartes"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Vue liste"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Vue Kanban"
            >
              <Target className="w-4 h-4" />
            </button>
          </div>

          <PremiumButton
            onClick={() => {
              setSelectedTaskForEdit(null);
              setShowNewTaskModal(true);
            }}
            icon={Plus}
            variant="primary"
          >
            Nouvelle tâche
          </PremiumButton>
        </div>
      }
    >
      {/* Barre de recherche */}
      <div className="mb-6">
        <PremiumSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher des tâches..."
        />
      </div>

      {/* Onglets de tri */}
      {renderTabs()}

      {/* Filtres */}
      {renderFilters()}

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white">Chargement des tâches...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Vue cartes */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TaskCard
                      task={task}
                      currentUser={user}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onVolunteer={handleVolunteer}
                      onUnvolunteer={handleUnvolunteer}
                      onSubmit={handleSubmit}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ✅ VUE LISTE COMPLÈTE */}
          {viewMode === 'list' && (
            <PremiumCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Titre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Priorité</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Rôle</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Assigné à</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">XP</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Créée le</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <AnimatePresence>
                      {filteredTasks.map((task, index) => {
                        const statusInfo = TASK_STATUS[task.status] || TASK_STATUS.todo;
                        const priorityInfo = TASK_PRIORITY[task.priority] || TASK_PRIORITY.medium;
                        const isAssignedToMe = Array.isArray(task.assignedTo) 
                          ? task.assignedTo.includes(user?.uid)
                          : task.assignedTo === user?.uid;

                        return (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                          >
                            {/* Titre */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {task.hasImage && (
                                    <ImageIcon className="w-4 h-4 text-blue-400" />
                                  )}
                                  {task.hasComment && (
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium text-white truncate max-w-xs" title={task.title}>
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="text-sm text-gray-400 truncate max-w-xs" title={task.description}>
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Statut */}
                            <td className="py-3 px-4">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${statusInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                                ${statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                                ${statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                                ${statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                                ${statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                                ${statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                              `}>
                                <span className="mr-1">{statusInfo.icon}</span>
                                {statusInfo.label}
                              </span>
                            </td>

                            {/* Priorité */}
                            <td className="py-3 px-4">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${priorityInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                                ${priorityInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${priorityInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                                ${priorityInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                <span className="mr-1">{priorityInfo.icon}</span>
                                {priorityInfo.label}
                              </span>
                            </td>

                            {/* Rôle */}
                            <td className="py-3 px-4">
                              {task.role || task.roleId ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                  🎭 {task.role || task.roleId}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">-</span>
                              )}
                            </td>

                            {/* Assigné à */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {isAssignedToMe ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                    <User className="w-3 h-3 mr-1" />
                                    Moi
                                  </span>
                                ) : task.assignedTo && task.assignedTo.length > 0 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    <Users className="w-3 h-3 mr-1" />
                                    {Array.isArray(task.assignedTo) ? task.assignedTo.length : 1}
                                  </span>
                                ) : task.openToVolunteers ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    <Heart className="w-3 h-3 mr-1" />
                                    Ouvert
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">Non assignée</span>
                                )}
                              </div>
                            </td>

                            {/* XP */}
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                {task.xpReward || 25} XP
                              </span>
                            </td>

                            {/* Date de création */}
                            <td className="py-3 px-4">
                              <div className="flex items-center text-sm text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                {convertFirebaseTimestamp(task.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewDetails(task)}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                
                                {(isAssignedToMe || user?.isAdmin) && (
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {user?.isAdmin && (
                                  <button
                                    onClick={() => handleDelete(task)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Footer du tableau avec résumé */}
              <div className="px-4 py-3 bg-gray-700/30 border-t border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    Affichage de {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''}
                    {filteredTasks.length !== tasks.length && ` sur ${tasks.length} au total`}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span>
                      Total XP: {filteredTasks.reduce((sum, task) => sum + (task.xpReward || 25), 0)}
                    </span>
                    <span>
                      Mes tâches: {filteredTasks.filter(t => {
                        const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
                        return assignedTo.includes(user?.uid);
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          )}

          {/* ✅ VUE KANBAN COMPLÈTE */}
          {viewMode === 'kanban' && (
            <div className="overflow-x-auto">
              <div className="flex space-x-6 min-w-max">
                {Object.entries(KANBAN_COLUMNS).map(([columnKey, column]) => {
                  const columnTasks = filteredTasks.filter(task => 
                    column.statuses.includes(task.status || 'todo')
                  );

                  return (
                    <div key={columnKey} className="flex-shrink-0 w-80">
                      <PremiumCard className="h-full">
                        {/* Header de la colonne */}
                        <div className={`${column.color} ${column.textColor} p-4 rounded-t-lg -m-4 mb-4`}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{column.title}</h3>
                            <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                              {columnTasks.length}
                            </span>
                          </div>
                        </div>

                        {/* Liste des tâches */}
                        <div className="space-y-3 min-h-96 max-h-[600px] overflow-y-auto">
                          <AnimatePresence>
                            {columnTasks.map(task => renderKanbanTask(task))}
                          </AnimatePresence>
                          
                          {/* Message si aucune tâche */}
                          {columnTasks.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Aucune tâche dans cette colonne</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer avec action rapide */}
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <button
                            onClick={() => setShowNewTaskModal(true)}
                            className="w-full flex items-center justify-center space-x-2 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Ajouter une tâche</span>
                          </button>
                        </div>
                      </PremiumCard>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message si aucune tâche */}
          {filteredTasks.length === 0 && !isLoading && (
            <PremiumCard className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedRole !== 'all'
                  ? 'Aucune tâche ne correspond à vos critères de recherche.'
                  : `Aucune tâche dans la catégorie "${TASK_TABS[activeTab].label}".`}
              </p>
              <PremiumButton
                onClick={() => {
                  setSelectedTaskForEdit(null);
                  setShowNewTaskModal(true);
                }}
                icon={Plus}
                variant="primary"
              >
                Créer une tâche
              </PremiumButton>
            </PremiumCard>
          )}
        </div>
      )}

      {/* Modal nouvelle tâche */}
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

      {/* Modal détails tâche */}
      {selectedTaskForDetails && (
        <TaskDetailModal
          isOpen={!!selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          task={selectedTaskForDetails}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
