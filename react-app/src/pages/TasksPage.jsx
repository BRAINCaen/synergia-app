// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE QUÊTES COMPLÈTE AVEC VUES CARTES, LISTE ET KANBAN
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

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

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

// 📊 CONSTANTES QUÊTES
const QUEST_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' },
  validation_pending: { label: 'En attente validation', color: 'orange', icon: '⏰' }
};

const QUEST_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

// 🆕 ONGLETS DE TRI DES QUÊTES
const QUEST_TABS = {
  my_tasks: { label: 'Mes quêtes', icon: User, color: 'blue' },
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
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

// 🔧 COMPOSANT DE RECHERCHE
const SearchInput = ({ value, onChange, placeholder = "Rechercher..." }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    />
  </div>
);

/**
 * 🏠 PAGE PRINCIPALE DES QUÊTES AVEC LAYOUT STANDARD
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
      const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
      const isOpenToVolunteers = t.openToVolunteers === true;
      
      return !isAssignedToMe && !(isOpenToVolunteers || hasNoAssignment);
    });

    return {
      total: tasks.length,
      myTasks: myTasks.length,
      available: available.length,
      others: others.length,
      completed: tasks.filter(t => ['completed', 'validated'].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length
    };
  }, [tasks, user?.uid]);

  // 📡 CHARGEMENT DES QUÊTES EN TEMPS RÉEL
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    console.log('🔄 [QUÊTES] Démarrage listener Firebase pour:', user.uid);
    setIsLoading(true);

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📦 [QUÊTES] Snapshot reçu:', snapshot.size, 'quêtes');
        
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? convertFirebaseTimestamp(data.createdAt) : new Date(),
            dueDate: data.dueDate ? convertFirebaseTimestamp(data.dueDate) : null
          };
        });

        console.log('✅ [QUÊTES] Quêtes chargées:', tasksData.length);
        setTasks(tasksData);
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ [QUÊTES] Erreur listener:', error);
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🔌 [QUÊTES] Déconnexion listener');
      unsubscribe();
    };
  }, [user?.uid]);

  // 🔍 FILTRAGE DES QUÊTES
  useEffect(() => {
    let filtered = [...tasks];

    // Filtre par onglet actif
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
        const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
        const isOpenToVolunteers = task.openToVolunteers === true;
        
        return !isAssignedToMe && !(isOpenToVolunteers || hasNoAssignment);
      });
    } else if (activeTab === 'history') {
      filtered = filtered.filter(task => ['completed', 'validated', 'cancelled'].includes(task.status));
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Filtre par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.roleId === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'dueDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder, user?.uid]);

  // 🎯 HANDLERS
  const handleViewDetails = (task) => {
    setSelectedTaskForDetails(task);
  };

  const handleEdit = (task) => {
    setSelectedTaskForEdit(task);
  };

  const handleDelete = async (task) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette quête ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      console.log('✅ Quête supprimée:', task.id);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression de la quête');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Statut mis à jour:', newStatus);
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  // 🔧 Rendu d'une quête pour la vue Kanban
  const renderKanbanTask = (task) => {
    const statusInfo = QUEST_STATUS[task.status] || QUEST_STATUS.todo;
    const priorityInfo = QUEST_PRIORITY[task.priority] || QUEST_PRIORITY.medium;
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
              {priorityInfo.icon} {priorityInfo.label}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Menu d'actions
            }}
            className="p-1 hover:bg-gray-700/50 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Titre et description */}
        <h4 className="text-white font-semibold mb-2 line-clamp-2">{task.title}</h4>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {task.xpReward && (
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                {task.xpReward} XP
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {isAssignedToMe && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                <User className="w-3 h-3 inline mr-1" />
                Moi
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* HEADER DE LA PAGE */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestion des Quêtes</h1>
                  <p className="text-gray-400 mt-1">Organisez et suivez vos quêtes avec efficacité</p>
                </div>
              </div>
              
              {/* Actions du header */}
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
                    <Play className="w-4 h-4" />
                  </button>
                </div>

                {/* Bouton nouvelle quête */}
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Nouvelle Quête</span>
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total</div>
                <div className="text-2xl font-bold text-white">{taskStats.total}</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Mes quêtes</div>
                <div className="text-2xl font-bold text-blue-400">{taskStats.myTasks}</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Disponibles</div>
                <div className="text-2xl font-bold text-green-400">{taskStats.available}</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">En cours</div>
                <div className="text-2xl font-bold text-yellow-400">{taskStats.inProgress}</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Terminées</div>
                <div className="text-2xl font-bold text-purple-400">{taskStats.completed}</div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Autres</div>
                <div className="text-2xl font-bold text-gray-400">{taskStats.others}</div>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(QUEST_TABS).map(([key, tab]) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${activeTab === key 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Rechercher une quête..."
                />
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap gap-2">
                {/* Filtre statut */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(QUEST_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>

                {/* Filtre priorité */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Toutes les priorités</option>
                  {Object.entries(QUEST_PRIORITY).map(([key, priority]) => (
                    <option key={key} value={key}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>

                {/* Bouton tri */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucune quête trouvée</h3>
              <p className="text-gray-400 mb-6">Commencez par créer votre première quête</p>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Créer une quête</span>
              </button>
            </div>
          ) : (
            <>
              {/* VUE CARTES */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onView={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}

              {/* VUE LISTE */}
              {viewMode === 'list' && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-800/80">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Titre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Priorité</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">XP</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {filteredTasks.map((task) => {
                        const statusInfo = QUEST_STATUS[task.status] || QUEST_STATUS.todo;
                        const priorityInfo = QUEST_PRIORITY[task.priority] || QUEST_PRIORITY.medium;
                        
                        return (
                          <tr
                            key={task.id}
                            className="border-t border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                            onClick={() => handleViewDetails(task)}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-gray-400 line-clamp-1">{task.description}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                                {statusInfo.icon} {statusInfo.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
                                {priorityInfo.icon} {priorityInfo.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="flex items-center text-yellow-400">
                                <Star className="w-4 h-4 mr-1" />
                                {task.xpReward || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(task);
                                  }}
                                  className="p-1 hover:bg-gray-600/50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(task);
                                  }}
                                  className="p-1 hover:bg-red-600/50 rounded text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VUE KANBAN */}
              {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(KANBAN_COLUMNS).map(([columnKey, column]) => {
                    const columnTasks = filteredTasks.filter(task => 
                      column.statuses.includes(task.status)
                    );

                    return (
                      <div key={columnKey} className="bg-gray-800/30 rounded-lg p-4">
                        <div className={`${column.color} ${column.textColor} rounded-lg px-4 py-2 mb-4 flex items-center justify-between`}>
                          <h3 className="font-bold">{column.title}</h3>
                          <span className="bg-white/20 rounded-full px-2 py-1 text-xs">
                            {columnTasks.length}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <AnimatePresence>
                            {columnTasks.map(task => renderKanbanTask(task))}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onTaskCreated={() => {
            setShowNewTaskModal(false);
            // Les quêtes se rechargeront automatiquement via le listener
          }}
        />
      )}

      {selectedTaskForDetails && (
        <TaskDetailModal
          task={selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
        />
      )}

      {selectedTaskForEdit && (
        <NewTaskModal
          task={selectedTaskForEdit}
          mode="edit"
          onClose={() => setSelectedTaskForEdit(null)}
          onTaskCreated={() => {
            setSelectedTaskForEdit(null);
          }}
        />
      )}
    </Layout>
  );
};

export default TasksPage;
