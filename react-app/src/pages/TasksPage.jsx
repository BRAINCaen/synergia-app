// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE QUÊTES - CORRECTION onViewDetails
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
  validated: { label: 'Validée', color: 'purple', icon: '🏆' }
};

const QUEST_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

const KANBAN_COLUMNS = {
  todo: {
    title: 'À faire',
    statuses: ['todo'],
    color: 'bg-gray-600',
    textColor: 'text-white'
  },
  in_progress: {
    title: 'En cours',
    statuses: ['in_progress'],
    color: 'bg-blue-600',
    textColor: 'text-white'
  },
  review: {
    title: 'En révision',
    statuses: ['review', 'validation_pending'],
    color: 'bg-yellow-600',
    textColor: 'text-white'
  },
  done: {
    title: 'Terminée',
    statuses: ['completed', 'validated'],
    color: 'bg-green-600',
    textColor: 'text-white'
  }
};

const TasksPage = () => {
  const { user } = useAuthStore();
  
  // 🎯 ÉTATS
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // cards, list, kanban
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

    // Onglets
    if (activeTab === 'my') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : 
                          task.assignedTo ? [task.assignedTo] : [];
        return task.createdBy === user?.uid || assignedTo.includes(user?.uid);
      });
    } else if (activeTab === 'available') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : 
                          task.assignedTo ? [task.assignedTo] : [];
        return assignedTo.length === 0 && task.status !== 'completed' && task.status !== 'validated';
      });
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
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{task.xpReward || 0}</span>
          </div>
        </div>

        {/* Titre */}
        <h4 className="font-semibold text-white mb-2 line-clamp-2">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700/50 pt-2">
          <div className="flex items-center space-x-2">
            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{Array.isArray(task.assignedTo) ? task.assignedTo.length : 1}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
          {isAssignedToMe && (
            <span className="text-green-400 font-medium">✓ Assigné</span>
          )}
        </div>
      </motion.div>
    );
  };

  // 📊 STATISTIQUES
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      myTasks: tasks.filter(t => {
        const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : 
                          t.assignedTo ? [t.assignedTo] : [];
        return t.createdBy === user?.uid || assignedTo.includes(user?.uid);
      }).length,
      available: tasks.filter(t => {
        const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : 
                          t.assignedTo ? [t.assignedTo] : [];
        return assignedTo.length === 0 && t.status !== 'completed' && t.status !== 'validated';
      }).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed' || t.status === 'validated').length,
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
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Mes quêtes</div>
                <div className="text-2xl font-bold text-blue-400">{stats.myTasks}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Disponibles</div>
                <div className="text-2xl font-bold text-green-400">{stats.available}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">En cours</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Terminées</div>
                <div className="text-2xl font-bold text-purple-400">{stats.completed}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">XP Total</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.totalXP}</div>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'my'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Mes quêtes
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Disponibles
              </button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une quête..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                {/* Filtre Statut */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="review">En révision</option>
                  <option value="completed">Terminée</option>
                  <option value="validated">Validée</option>
                </select>

                {/* Filtre Priorité */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>

                {/* Filtre Rôle */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  {Object.values(SYNERGIA_ROLES).map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                {/* Tri */}
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
                      onViewDetails={handleViewDetails}
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
