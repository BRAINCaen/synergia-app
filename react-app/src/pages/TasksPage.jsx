// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE QUÊTES - CORRECTION FILTRE "AUTRES"
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
  todo: { label: 'À faire', color: 'gray', icon: '📋' },
  in_progress: { label: 'En cours', color: 'blue', icon: '🚀' },
  validation_pending: { label: 'En validation', color: 'yellow', icon: '⏳' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'emerald', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' }
};

const QUEST_PRIORITY = {
  low: { label: 'Basse', color: 'green', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [viewMode, setViewMode] = useState('cards');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // 🔥 CHARGEMENT DES QUÊTES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔍 [QUÊTES] Chargement des quêtes...');
    
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ [QUÊTES] ${loadedTasks.length} quêtes chargées`);
      setTasks(loadedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ [QUÊTES] Erreur chargement:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🔍 FILTRAGE ET TRI
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
      // ✅ CORRECTION : Afficher TOUTES les quêtes assignées à d'autres utilisateurs
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const hasAssignments = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
        
        // Afficher les quêtes qui ont des assignations ET qui ne me sont pas assignées
        return !isAssignedToMe && hasAssignments;
      });
    } else if (activeTab === 'history') {
      filtered = filtered.filter(task => ['completed', 'validated', 'cancelled'].includes(task.status));
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.synergia_role === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
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
    console.log('🔍 [TASKS PAGE] handleViewDetails appelé avec:', task);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer"
        onClick={() => handleViewDetails(task)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{task.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
          </div>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium bg-${priorityInfo.color}-900/30 text-${priorityInfo.color}-400 border border-${priorityInfo.color}-700/50`}>
            {priorityInfo.icon} {priorityInfo.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {task.xpReward && (
              <span className="flex items-center text-yellow-400">
                <Zap className="w-4 h-4 mr-1" />
                {task.xpReward} XP
              </span>
            )}
            {isAssignedToMe && (
              <span className="text-blue-400">
                <User className="w-4 h-4" />
              </span>
            )}
          </div>
          {task.estimatedHours && (
            <span className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {task.estimatedHours}h
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  // 📊 CALCUL DES STATISTIQUES
  const stats = useMemo(() => {
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
      const hasAssignments = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
      
      return !isAssignedToMe && hasAssignments;
    });

    return {
      total: tasks.length,
      myTasks: myTasks.length,
      available: available.length,
      others: others.length,
      completed: tasks.filter(t => ['completed', 'validated'].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      totalXP: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
    };
  }, [tasks, user?.uid]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ⚔️ Gestion des Quêtes
                </h1>
                <p className="text-gray-400 mt-1">Gérez vos missions et progressez dans Synergia</p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sélecteurs de vue */}
                <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
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
                    <Play className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                {/* Bouton nouvelle quête */}
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouvelle Quête</span>
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Mes quêtes</div>
                <div className="text-2xl font-bold text-blue-400">{stats.myTasks}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Disponibles</div>
                <div className="text-2xl font-bold text-green-400">{stats.available}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Autres</div>
                <div className="text-2xl font-bold text-purple-400">{stats.others}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">En cours</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Terminées</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">XP Total</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.totalXP}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === 'my_tasks'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mes quêtes</span>
                <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                  {stats.myTasks}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('available')}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === 'available'
                    ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Disponibles</span>
                <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full text-xs">
                  {stats.available}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('others')}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === 'others'
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Autres</span>
                <span className="bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                  {stats.others}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === 'history'
                    ? 'text-gray-300 border-b-2 border-gray-300 bg-gray-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>Historique</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une quête..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center space-x-2">
              {/* Statut */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(QUEST_STATUS).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>

              {/* Priorité */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                {Object.entries(QUEST_PRIORITY).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>

              {/* Rôle */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {SYNERGIA_ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.icon} {role.label}</option>
                ))}
              </select>

              {/* Tri */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-all"
                title={sortOrder === 'desc' ? 'Tri décroissant' : 'Tri croissant'}
              >
                {sortOrder === 'desc' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucune quête trouvée</h3>
              <p className="text-gray-400">
                {activeTab === 'my_tasks' && "Vous n'avez pas encore de quêtes assignées"}
                {activeTab === 'available' && "Aucune quête disponible pour le moment"}
                {activeTab === 'others' && "Aucune quête assignée aux autres membres"}
                {activeTab === 'history' && "Aucune quête dans l'historique"}
              </p>
            </div>
          ) : (
            <>
              {/* Vue Cartes */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Vue Liste */}
              {viewMode === 'list' && (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        viewMode="list"
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Vue Kanban */}
              {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(QUEST_STATUS).map(([statusKey, statusInfo]) => {
                    const tasksInColumn = filteredTasks.filter(t => t.status === statusKey);
                    return (
                      <div key={statusKey} className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white flex items-center">
                            <span className="mr-2">{statusInfo.icon}</span>
                            {statusInfo.label}
                          </h3>
                          <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                            {tasksInColumn.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {tasksInColumn.map(task => renderKanbanTask(task))}
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

      {/* Modals */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
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
          onClose={() => setSelectedTaskForEdit(null)}
        />
      )}
    </Layout>
  );
};

export default TasksPage;
