// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// Page des tâches avec système de collaboration intégré
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, Target, Flag, 
  CheckCircle, Circle, Edit, Trash2, Eye, Tag, FolderOpen,
  AlertTriangle, TrendingUp, BarChart3, Users, MessageSquare
} from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Import des composants de collaboration
import CollaborationPanel, { 
  CollaborationFloatingButton, 
  CollaborationModal 
} from '../components/collaboration/CollaborationPanel.jsx';

const TasksPage = () => {
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, list, kanban
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, created, title
  const [sortOrder, setSortOrder] = useState('asc');

  // 🤝 États pour la collaboration
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [collaborationTask, setCollaborationTask] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // Stores
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask, 
    loadUserTasks,
    completeTask 
  } = useTaskStore();
  
  const { projects, loadUserProjects } = useProjectStore();
  const { user } = useAuthStore();

  // Charger les données
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
      loadUserProjects(user.uid);
    }
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  // 🤝 Gestionnaires de collaboration
  const handleOpenCollaboration = (task) => {
    setCollaborationTask(task);
    setShowCollaborationModal(true);
  };

  const handleCloseCollaboration = () => {
    setCollaborationTask(null);
    setShowCollaborationModal(false);
  };

  // Filtrer et trier les tâches
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      // Filtre recherche
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtre statut
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Filtre priorité
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      // Filtre projet
      const matchesProject = projectFilter === 'all' || 
        (projectFilter === 'none' && !task.projectId) ||
        task.projectId === projectFilter;

      // Filtre date
      const matchesDate = dateFilter === 'all' || (() => {
        if (!task.dueDate) return dateFilter === 'no-date';
        const dueDate = new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        switch (dateFilter) {
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString();
          case 'this-week':
            return dueDate <= nextWeek && dueDate >= today;
          case 'no-date':
            return false;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDate;
    });

    // Trier
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate.seconds ? b.dueDate.seconds * 1000 : b.dueDate) : new Date('9999-12-31');
          break;
        case 'created':
          aValue = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Calculer les statistiques
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate.seconds ? t.dueDate.seconds * 1000 : t.dueDate);
      return dueDate < new Date();
    }).length;

    return { total, completed, inProgress, todo, overdue };
  };

  const stats = getTaskStats();

  // Gestionnaires d'événements
  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData, user.uid);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
      alert('Erreur lors de la création de la tâche');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(editingTask.id, taskData, user.uid);
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Erreur modification tâche:', error);
      alert('Erreur lors de la modification de la tâche');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId, user.uid);
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId, user.uid);
    } catch (error) {
      console.error('Erreur completion tâche:', error);
      alert('Erreur lors de la completion de la tâche');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Fonctions utilitaires
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-500 border-red-500 bg-red-500/10',
      high: 'text-orange-500 border-orange-500 bg-orange-500/10',
      medium: 'text-yellow-500 border-yellow-500 bg-yellow-500/10',
      low: 'text-green-500 border-green-500 bg-green-500/10'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-400',
      in_progress: 'text-blue-400', 
      todo: 'text-gray-400'
    };
    return colors[status] || colors.todo;
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      const dateObj = new Date(date.seconds ? date.seconds * 1000 : date);
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      return null;
    }
  };

  const getProjectName = (projectId) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Projet supprimé';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="text-blue-600" size={32} />
                Mes Tâches
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos tâches et collaborez avec votre équipe
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bouton collaboration générale */}
              <button
                onClick={() => setCollaborationOpen(!collaborationOpen)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${collaborationOpen 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <MessageSquare size={20} />
                Collaboration
              </button>

              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvelle tâche
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Terminées</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm text-gray-600">En cours</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Circle size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600">À faire</span>
              </div>
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-sm text-gray-600">En retard</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </div>
          </div>
        </div>

        {/* 🤝 Panneau de collaboration (si ouvert) */}
        {collaborationOpen && (
          <div className="mb-8">
            <CollaborationPanel
              entityType="user"
              entityId={user?.uid}
              entityTitle="Toutes mes tâches"
              defaultTab="activity"
              className="mb-6"
            />
          </div>
        )}

        {/* Filtres et contrôles */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            {/* Filtre projet */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les projets</option>
              <option value="none">Sans projet</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>

            {/* Filtre date */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les dates</option>
              <option value="overdue">En retard</option>
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="this-week">Cette semaine</option>
              <option value="no-date">Sans date</option>
            </select>
          </div>

          {/* Options d'affichage */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Mode d'affichage :</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
                >
                  📊 Cartes
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  📋 Liste
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="dueDate">Date d'échéance</option>
                <option value="priority">Priorité</option>
                <option value="created">Date de création</option>
                <option value="title">Titre</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">
              {tasks.length === 0 ? 'Aucune tâche créée' : 'Aucune tâche trouvée'}
            </p>
            <p className="text-gray-500 mb-6">
              {tasks.length === 0 
                ? 'Commencez par créer votre première tâche'
                : 'Essayez de modifier vos filtres'
              }
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Créer ma première tâche
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                viewMode={viewMode}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
                onView={setSelectedTask}
                onCollaborate={handleOpenCollaboration} // 🤝 Nouvelle prop
                getProjectName={getProjectName}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* 🤝 Modal de collaboration pour tâche spécifique */}
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={handleCloseCollaboration}
          entityType="task"
          entityId={collaborationTask?.id}
          entityTitle={collaborationTask?.title}
        />

        {/* Modal TaskForm */}
        {showTaskForm && (
          <TaskFormModal
            task={editingTask}
            projects={projects}
            onSave={editingTask ? handleUpdateTask : handleCreateTask}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Modal détails tâche */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
            onCollaborate={handleOpenCollaboration} // 🤝 Nouvelle prop
            getProjectName={getProjectName}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 📝 COMPOSANT CARTE DE TÂCHE (avec collaboration)
// ==========================================

const TaskCard = ({ 
  task, 
  viewMode, 
  onEdit, 
  onDelete, 
  onComplete, 
  onView, 
  onCollaborate, // 🤝 Nouvelle prop
  getProjectName, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate) < new Date() && task.status !== 'completed';

  if (viewMode === 'list') {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => onComplete(task.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${getStatusColor(task.status)}`}
            >
              {task.status === 'completed' ? <CheckCircle size={16} /> : <Circle size={16} />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {isOverdue && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                    En retard
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                {getProjectName(task.projectId) && (
                  <span className="flex items-center gap-1">
                    <FolderOpen size={14} />
                    {getProjectName(task.projectId)}
                  </span>
                )}
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 🤝 Bouton collaboration */}
            <button
              onClick={() => onCollaborate(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ouvrir la collaboration"
            >
              <MessageSquare size={16} />
            </button>

            <button
              onClick={() => onView(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye size={16} />
            </button>
            
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
            
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onComplete(task.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${getStatusColor(task.status)}`}
          >
            {task.status === 'completed' ? <CheckCircle size={16} /> : <Circle size={16} />}
          </button>
          
          <div>
            <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                  En retard
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 🤝 Bouton collaboration */}
          <button
            onClick={() => onCollaborate(task)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ouvrir la collaboration"
          >
            <MessageSquare size={16} />
          </button>

          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 mb-4">
        {getProjectName(task.projectId) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FolderOpen size={14} />
            <span>{getProjectName(task.projectId)}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>{task.estimatedTime}h estimé</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Créé le {formatDate(task.createdAt)}
        </span>
        
        <button
          onClick={() => onView(task)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Eye size={14} />
          Voir détails
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 📋 MODAL DÉTAILS TÂCHE (avec collaboration)
// ==========================================

const TaskDetailModal = ({ 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onComplete, 
  onCollaborate, // 🤝 Nouvelle prop
  getProjectName, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}) => {
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-auto text-left overflow-hidden transform transition-all">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onComplete(task.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(task.status)}`}
              >
                {task.status === 'completed' ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>
              
              <div>
                <h2 className={`text-2xl font-bold text-white ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {isOverdue && (
                    <span className="px-3 py-1 text-sm bg-red-600 text-white rounded-full">
                      En retard
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {task.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
              <div className="space-y-3">
                {getProjectName(task.projectId) && (
                  <div className="flex items-center gap-3">
                    <FolderOpen size={16} className="text-gray-400" />
                    <span className="text-gray-300">{getProjectName(task.projectId)}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300">{formatDate(task.dueDate)}</span>
                  </div>
                )}

                {task.estimatedTime && (
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-300">{task.estimatedTime}h estimé</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Target size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    Créé le {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full flex items-center gap-1"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🤝 Section collaboration dans la modal */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">🤝 Collaboration</h3>
              <button
                onClick={() => onCollaborate(task)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Ouvrir collaboration
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Collaborez sur cette tâche : commentaires, mentions, historique des activités
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => onComplete(task.id)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                task.status === 'completed' 
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {task.status === 'completed' ? 'Rouvrir' : 'Marquer terminée'}
            </button>
            <button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📝 MODAL FORMULAIRE TÂCHE (placeholder pour l'exemple)
// ==========================================

const TaskFormModal = ({ task, projects, onSave, onClose }) => {
  // Ce composant devrait être implémenté selon vos besoins
  // Pour l'instant, un placeholder
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <p className="text-gray-600 mb-4">
            Formulaire de tâche à implémenter selon vos besoins.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
