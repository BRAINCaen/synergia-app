// src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, Target, Flag, 
  CheckCircle, Circle, Edit, Trash2, Eye, Tag, FolderOpen,
  AlertTriangle, TrendingUp, BarChart3, Users
} from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

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
        const week = new Date(today);
        week.setDate(today.getDate() + 7);

        switch (dateFilter) {
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return dueDate <= week && dueDate >= today;
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
      let aVal, bVal;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority] || 0;
          bVal = priorityOrder[b.priority] || 0;
          break;
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate) : new Date('2099-12-31');
          bVal = b.dueDate ? new Date(b.dueDate.seconds ? b.dueDate.seconds * 1000 : b.dueDate) : new Date('2099-12-31');
          break;
        case 'created':
          aVal = new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
          bVal = new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
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
      const today = new Date();
      const diffTime = dateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: `En retard de ${Math.abs(diffDays)} jour(s)`, color: 'text-red-400' };
      if (diffDays === 0) return { text: 'Aujourd\'hui', color: 'text-yellow-400' };
      if (diffDays === 1) return { text: 'Demain', color: 'text-blue-400' };
      if (diffDays <= 7) return { text: `Dans ${diffDays} jour(s)`, color: 'text-green-400' };
      return { text: dateObj.toLocaleDateString('fr-FR'), color: 'text-gray-400' };
    } catch (error) {
      return { text: 'Date invalide', color: 'text-red-400' };
    }
  };

  const getProjectName = (projectId) => {
    if (!projectId) return 'Aucun projet';
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Projet supprimé';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setDateFilter('all');
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tâches</h1>
          <p className="text-gray-400">Gérez vos tâches et suivez votre progression</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bouton vue */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Vue cartes"
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Vue liste"
            >
              <Target size={18} />
            </button>
          </div>
          
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Target className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">À faire</p>
              <p className="text-2xl font-bold text-white">{stats.todo}</p>
            </div>
            <Circle className="text-gray-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En cours</p>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Terminées</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En retard</p>
              <p className="text-2xl font-bold text-white">{stats.overdue}</p>
            </div>
            <AlertTriangle className="text-red-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <div className="space-y-4">
          {/* Première ligne : Recherche et actions */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher dans les tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Réinitialiser
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Trier par échéance</option>
                <option value="priority">Trier par priorité</option>
                <option value="created">Trier par création</option>
                <option value="title">Trier par titre</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                title={`Ordre ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Deuxième ligne : Filtres */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les projets</option>
              <option value="none">Sans projet</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="overdue">En retard</option>
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="week">Cette semaine</option>
              <option value="no-date">Sans date</option>
            </select>

            <div className="flex items-center justify-center bg-gray-700 rounded-lg px-3 py-2 text-gray-300">
              <span className="text-sm">{filteredTasks.length} résultat(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
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
              getProjectName={getProjectName}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

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
          getProjectName={getProjectName}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Composant carte de tâche
const TaskCard = ({ 
  task, 
  viewMode, 
  onEdit, 
  onDelete, 
  onComplete, 
  onView,
  getProjectName,
  getPriorityColor,
  getStatusColor,
  formatDate 
}) => {
  const dateInfo = formatDate(task.dueDate);

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => onComplete(task.id)}
              className={getStatusColor(task.status)}
            >
              {task.status === 'completed' ? (
                <CheckCircle size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
            
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-4 text-sm mt-1">
                <span className={`px-2 py-1 rounded-full border text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                <span className="text-gray-400">
                  <FolderOpen size={14} className="inline mr-1" />
                  {getProjectName(task.projectId)}
                </span>
                
                {dateInfo && (
                  <span className={dateInfo.color}>
                    <Calendar size={14} className="inline mr-1" />
                    {dateInfo.text}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(task)}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title="Voir détails"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue cartes
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onComplete(task.id)}
            className={`mt-1 ${getStatusColor(task.status)}`}
          >
            {task.status === 'completed' ? (
              <CheckCircle size={20} />
            ) : (
              <Circle size={20} />
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(task)}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
            title="Voir détails"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Priorité et projet */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(task.priority)}`}>
            <Flag size={14} className="inline mr-1" />
            {task.priority === 'urgent' ? 'Urgente' :
             task.priority === 'high' ? 'Haute' :
             task.priority === 'medium' ? 'Moyenne' : 'Basse'}
          </span>
          
          <span className="text-gray-400 text-sm">
            <FolderOpen size={14} className="inline mr-1" />
            {getProjectName(task.projectId)}
          </span>
        </div>

        {/* Date d'échéance */}
        {dateInfo && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className={`text-sm ${dateInfo.color}`}>
              {dateInfo.text}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded flex items-center gap-1"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant modal formulaire tâche (simplifié)
const TaskFormModal = ({ task, projects, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    dueDate: '',
    tags: []
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        projectId: task.projectId || '',
        dueDate: task.dueDate ? formatDateForInput(task.dueDate) : '',
        tags: task.tags || []
      });
    }
  }, [task]);

  const formatDateForInput = (date) => {
    try {
      const dateObj = new Date(date.seconds ? date.seconds * 1000 : date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      projectId: formData.projectId || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      tags: formData.tags
    };

    await onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Titre de la tâche..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Description de la tâche..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Projet
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {task ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Composant modal détails tâche
const TaskDetailModal = ({ 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onComplete,
  getProjectName,
  getPriorityColor,
  getStatusColor,
  formatDate 
}) => {
  const dateInfo = formatDate(task.dueDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'urgent' ? 'Urgente' :
                   task.priority === 'high' ? 'Haute' :
                   task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
                <span className={`text-sm ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Terminée' :
                   task.status === 'in_progress' ? 'En cours' : 'À faire'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projet:</span>
                    <span className="text-white">{getProjectName(task.projectId)}</span>
                  </div>
                  {dateInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Échéance:</span>
                      <span className={dateInfo.color}>{dateInfo.text}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créée le:</span>
                    <span className="text-white">
                      {new Date(task.createdAt.seconds ? task.createdAt.seconds * 1000 : task.createdAt).toLocaleDateString('fr-FR')}
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

export default TasksPage;
