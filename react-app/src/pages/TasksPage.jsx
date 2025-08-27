// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
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

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
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

// 📊 CONSTANTES TÂCHES
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '🔄' },
  completed: { label: 'Terminé', color: 'green', icon: '✅' },
  archived: { label: 'Archivé', color: 'red', icon: '🗂️' }
};

const TASK_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '📗' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '📙' },
  high: { label: 'Haute', color: 'orange', icon: '📕' },
  urgent: { label: 'Urgent', color: 'red', icon: '🚨' }
};

const VIEW_MODES = {
  grid: { label: 'Grille', icon: '⊞' },
  list: { label: 'Liste', icon: '☰' },
  kanban: { label: 'Kanban', icon: '📋' }
};

const TasksPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS TÂCHES
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 📊 CHARGEMENT DES TÂCHES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [TASKS] Chargement des tâches...');
    setLoading(true);

    // Query pour les tâches
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy(sortBy, sortOrder)
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));

      console.log('📊 [TASKS] Tâches chargées:', tasksData.length);
      setTasks(tasksData);
      setLoading(false);
    });

    // Query pour les projets
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      console.log('📁 [TASKS] Projets chargés:', projectsData.length);
      setProjects(projectsData);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeProjects();
    };
  }, [user?.uid, sortBy, sortOrder]);

  // 🎯 FILTRES ET TRI
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Filtre par projet
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId === projectFilter);
    }

    // Filtre par assigné
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'me') {
        filtered = filtered.filter(task => 
          task.assignedTo === user?.uid || 
          task.createdBy === user?.uid
        );
      } else if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedTo);
      }
    }

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter, assigneeFilter, user?.uid]);

  // 📊 STATS RAPIDES
  const stats = useMemo(() => {
    const total = filteredAndSortedTasks.length;
    const completed = filteredAndSortedTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredAndSortedTasks.filter(t => t.status === 'in_progress').length;
    const todo = filteredAndSortedTasks.filter(t => t.status === 'todo').length;
    const overdue = filteredAndSortedTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    ).length;

    return { total, completed, inProgress, todo, overdue };
  }, [filteredAndSortedTasks]);

  // 🆕 CRÉER UNE NOUVELLE TÂCHE
  const handleCreateTask = useCallback(async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'todo',
        priority: taskData.priority || 'medium'
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      console.log('✅ [TASKS] Tâche créée:', docRef.id);
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('❌ [TASKS] Erreur création tâche:', error);
      setError('Impossible de créer la tâche');
    }
  }, [user]);

  // ✏️ METTRE À JOUR UNE TÂCHE
  const handleUpdateTask = useCallback(async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [TASKS] Tâche mise à jour:', taskId);
    } catch (error) {
      console.error('❌ [TASKS] Erreur mise à jour tâche:', error);
      setError('Impossible de mettre à jour la tâche');
    }
  }, []);

  // 🗑️ SUPPRIMER UNE TÂCHE
  const handleDeleteTask = useCallback(async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ [TASKS] Tâche supprimée:', taskId);
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression tâche:', error);
      setError('Impossible de supprimer la tâche');
    }
  }, []);

  // 🔄 RÉINITIALISER FILTRES
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setAssigneeFilter('all');
  };

  // 🎨 RENDU VUE GRILLE
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAndSortedTasks.map(task => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          layout
        >
          <TaskCard
            task={task}
            onClick={() => setSelectedTask(task)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            project={projects.find(p => p.id === task.projectId)}
          />
        </motion.div>
      ))}
    </div>
  );

  // 📋 RENDU VUE LISTE
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
          <div className="col-span-4">Tâche</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2">Priorité</div>
          <div className="col-span-2">Projet</div>
          <div className="col-span-1">Échéance</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredAndSortedTasks.map(task => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedTask(task)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Titre et description */}
              <div className="col-span-4">
                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                )}
              </div>

              {/* Statut */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {TASK_STATUS[task.status]?.icon} {TASK_STATUS[task.status]?.label}
                </span>
              </div>

              {/* Priorité */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {TASK_PRIORITY[task.priority]?.icon} {TASK_PRIORITY[task.priority]?.label}
                </span>
              </div>

              {/* Projet */}
              <div className="col-span-2">
                {task.projectId ? (
                  <span className="text-sm text-gray-600">
                    {projects.find(p => p.id === task.projectId)?.title || 'Projet supprimé'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Aucun projet</span>
                )}
              </div>

              {/* Échéance */}
              <div className="col-span-1">
                {task.dueDate ? (
                  <span className={`text-sm ${
                    task.dueDate < new Date() && task.status !== 'completed'
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600'
                  }`}>
                    {task.dueDate.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 📋 RENDU VUE KANBAN
  const renderKanbanView = () => {
    const columns = Object.keys(TASK_STATUS).map(status => ({
      id: status,
      title: TASK_STATUS[status].label,
      icon: TASK_STATUS[status].icon,
      color: TASK_STATUS[status].color,
      tasks: filteredAndSortedTasks.filter(task => task.status === status)
    }));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <span>{column.icon}</span>
                {column.title}
              </h3>
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {column.tasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTask(task)}
                >
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {TASK_PRIORITY[task.priority]?.icon}
                    </span>
                    
                    {task.dueDate && (
                      <span className={`text-xs ${
                        task.dueDate < new Date() && task.status !== 'completed'
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }`}>
                        {task.dueDate.toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des tâches...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* HEADER DE LA PAGE */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Gestion des Tâches</h1>
              <p className="text-gray-600">Organisez et suivez vos tâches efficacement</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle tâche
              </button>
            </div>
          </div>

          {/* STATISTIQUES RAPIDES */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Terminées</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">À faire</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.todo}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En retard</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.overdue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BARRE D'OUTILS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des tâches..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtres rapides */}
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(TASK_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Toutes priorités</option>
                  {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                    <option key={key} value={key}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    showFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>

                {/* Toggle vue */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  {Object.entries(VIEW_MODES).map(([mode, config]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-2 text-sm font-medium ${
                        viewMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      title={config.label}
                    >
                      {config.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtres avancés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Projet</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                      >
                        <option value="all">Tous les projets</option>
                        <option value="none">Sans projet</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignation</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                      >
                        <option value="all">Toutes les tâches</option>
                        <option value="me">Mes tâches</option>
                        <option value="unassigned">Non assignées</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tri</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="updatedAt">Date modification</option>
                          <option value="createdAt">Date création</option>
                          <option value="dueDate">Échéance</option>
                          <option value="title">Titre</option>
                          <option value="priority">Priorité</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MESSAGE D'ERREUR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* CONTENU PRINCIPAL */}
          <AnimatePresence mode="wait">
            {filteredAndSortedTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tasks.length === 0 ? 'Aucune tâche trouvée' : 'Aucun résultat'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {tasks.length === 0 
                      ? 'Commencez par créer votre première tâche.'
                      : 'Essayez de modifier vos filtres ou votre recherche.'
                    }
                  </p>
                  {tasks.length === 0 && (
                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Créer ma première tâche
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {viewMode === 'grid' && renderGridView()}
                {viewMode === 'list' && renderListView()}
                {viewMode === 'kanban' && renderKanbanView()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODALES */}
        {showNewTaskModal && (
          <NewTaskModal
            isOpen={showNewTaskModal}
            onClose={() => setShowNewTaskModal(false)}
            onSubmit={handleCreateTask}
            projects={projects}
          />
        )}

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            project={projects.find(p => p.id === selectedTask.projectId)}
          />
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;
