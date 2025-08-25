// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC IMPORTS CORRIGÉS POUR LE BUILD
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

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM - CORRIGÉ POUR BUILD
import PremiumLayout, { PremiumCard, PremiumStatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

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
  in_progress: { label: 'En cours', color: 'blue', icon: '🔄' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  blocked: { label: 'Bloquée', color: 'red', icon: '🚫' },
  archived: { label: 'Archivée', color: 'purple', icon: '📦' }
};

const TASK_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '⬇️' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '➡️' },
  high: { label: 'Élevée', color: 'orange', icon: '⬆️' },
  urgent: { label: 'Urgente', color: 'red', icon: '🚨' }
};

const TASK_TABS = {
  all: { label: 'Toutes', icon: FileText, count: 'all' },
  assigned: { label: 'Assignées', icon: User, count: 'assigned' },
  collaborative: { label: 'Collaboratives', icon: Users, count: 'collaborative' },
  personal: { label: 'Personnelles', icon: Heart, count: 'personal' },
  archived: { label: 'Archivées', icon: Archive, count: 'archived' }
};

const VIEW_MODES = {
  cards: { label: 'Cartes', icon: '📋' },
  list: { label: 'Liste', icon: '📝' },
  kanban: { label: 'Kanban', icon: '📊' }
};

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE PERSONNALISÉE
 */
const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher des tâches..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
};

/**
 * 📊 PAGE PRINCIPALE TÂCHES
 */
const TasksPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎯 FILTRES ET RECHERCHE
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('cards');
  
  // 🎯 MODALS
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);

  // 📊 CHARGEMENT DES TÂCHES EN TEMPS RÉEL
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));

        console.log('📊 [TASKS] Tâches chargées:', tasksData.length);
        setTasks(tasksData);
        setIsLoading(false);
        setError(null);
      }, (error) => {
        console.error('❌ [TASKS] Erreur chargement:', error);
        setError(error.message);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ [TASKS] Erreur setup listener:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [user?.uid]);

  // 📊 TÂCHES FILTRÉES ET TRIÉES
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtre par onglet
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'assigned':
          filtered = filtered.filter(task => task.assignedTo && task.assignedTo !== user?.uid);
          break;
        case 'collaborative':
          filtered = filtered.filter(task => task.teamMembers && task.teamMembers.length > 1);
          break;
        case 'personal':
          filtered = filtered.filter(task => !task.assignedTo && !task.teamMembers?.length);
          break;
        case 'archived':
          filtered = filtered.filter(task => task.status === 'archived');
          break;
      }
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
      filtered = filtered.filter(task => task.role === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = aVal?.getTime?.() || 0;
        bVal = bVal?.getTime?.() || 0;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder, user?.uid]);

  // 📊 STATISTIQUES
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const urgent = tasks.filter(t => t.priority === 'urgent').length;

    return {
      total,
      completed,
      inProgress,
      todo,
      urgent,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  // ⚡ ACTIONS
  const handleCreateTask = async (taskData) => {
    try {
      console.log('📝 [TASKS] Création tâche:', taskData);
      
      const newTask = {
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'tasks'), newTask);
      console.log('✅ [TASKS] Tâche créée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur création:', error);
    }
  };

  const handleEdit = (task) => {
    console.log('✏️ [TASKS] Édition tâche:', task.id);
    setSelectedTaskForEdit(task);
    setShowNewTaskModal(true);
  };

  const handleDelete = async (taskId) => {
    try {
      console.log('🗑️ [TASKS] Suppression tâche:', taskId);
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ [TASKS] Tâche supprimée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression:', error);
    }
  };

  const handleSubmit = async (taskId) => {
    try {
      console.log('📤 [TASKS] Soumission tâche:', taskId);
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ [TASKS] Tâche soumise');
    } catch (error) {
      console.error('❌ [TASKS] Erreur soumission:', error);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      console.log('🔄 [TASKS] Mise à jour tâche:', taskId, updates);
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [TASKS] Tâche mise à jour');
    } catch (error) {
      console.error('❌ [TASKS] Erreur mise à jour:', error);
    }
  };

  // 📊 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { title: 'Total', value: stats.total, icon: FileText, color: 'blue' },
    { title: 'Terminées', value: stats.completed, icon: CheckSquare, color: 'green' },
    { title: 'En cours', value: stats.inProgress, icon: Clock, color: 'yellow' },
    { title: 'Urgentes', value: stats.urgent, icon: AlertCircle, color: 'red' }
  ];

  // ⚡ ACTIONS DU HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton
        variant="secondary"
        onClick={() => window.location.reload()}
      >
        <Search className="w-4 h-4" />
        Actualiser
      </PremiumButton>
      
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
  );

  if (isLoading) {
    return (
      <PremiumLayout
        title="📝 Tâches"
        subtitle="Gestion et suivi de vos tâches"
        icon={CheckSquare}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des tâches...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="📝 Tâches"
        subtitle="Gestion et suivi de vos tâches"
        icon={CheckSquare}
      >
        <PremiumCard className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <PremiumButton variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="📝 Tâches"
      subtitle="Gestion et suivi de vos tâches"
      icon={CheckSquare}
      headerActions={headerActions}
      headerStats={headerStats}
    >
      {/* Contrôles de filtrage */}
      <div className="mb-8">
        <PremiumCard className="p-4">
          {/* Onglets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(TASK_TABS).map(([key, tab]) => {
              const Icon = tab.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                    {key === 'all' ? stats.total : filteredTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Filtres */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(TASK_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les priorités</option>
              {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                <option key={key} value={key}>{priority.label}</option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              {SYNERGIA_ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            {/* Mode d'affichage */}
            <div className="flex rounded-lg bg-gray-700/50 p-1">
              {Object.entries(VIEW_MODES).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Contenu des tâches */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              onView={() => setSelectedTaskForDetails(task)}
              onUpdate={handleTaskUpdate}
            />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <PremiumCard>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Titre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Priorité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Créée</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-700/50 hover:bg-gray-700/25">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{task.title}</p>
                        <p className="text-sm text-gray-400 truncate">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${TASK_STATUS[task.status]?.color || 'gray'}-100 text-${TASK_STATUS[task.status]?.color || 'gray'}-800`}>
                        {TASK_STATUS[task.status]?.icon} {TASK_STATUS[task.status]?.label || task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${TASK_PRIORITY[task.priority]?.color || 'gray'}-100 text-${TASK_PRIORITY[task.priority]?.color || 'gray'}-800`}>
                        {TASK_PRIORITY[task.priority]?.icon} {TASK_PRIORITY[task.priority]?.label || task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {task.createdAt?.toLocaleDateString?.() || 'Non définie'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedTaskForDetails(task)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(TASK_STATUS).map(([statusKey, status]) => {
            const statusTasks = filteredTasks.filter(task => task.status === statusKey);
            return (
              <div key={statusKey} className="flex flex-col">
                <PremiumCard className="p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{status.label}</h3>
                    <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-700/50 rounded-lg p-3 cursor-pointer hover:bg-gray-600/50 transition-colors"
                        onClick={() => setSelectedTaskForDetails(task)}
                      >
                        <h4 className="font-medium text-white text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${TASK_PRIORITY[task.priority]?.color || 'gray'}-100 text-${TASK_PRIORITY[task.priority]?.color || 'gray'}-800`}>
                            {TASK_PRIORITY[task.priority]?.label || task.priority}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(task);
                              }}
                              className="text-gray-400 hover:text-yellow-400"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task.id);
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {statusKey === 'todo' && (
                      <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="w-full flex items-center justify-center space-x-2 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Ajouter une tâche</span>
                      </button>
                    )}
                  </div>
                </PremiumCard>
              </div>
            );
          })}
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
