// ==========================================
// 📋 TASKS PAGE - SYNERGIA v3.5 - FIX D'URGENCE
// ==========================================
// Fichier: react-app/src/pages/TasksPage.jsx
// Version de secours avec gestion des erreurs Firebase
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, List, Grid, Eye, Edit, Trash2, Target, Calendar, User, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Modal simple pour la collaboration
const CollaborationModal = ({ isOpen, onClose, entityType, entityId, entityTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-lg shadow-xl p-6 max-w-md w-full"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
            🤝 Collaboration - {entityTitle}
          </h3>
          <p className="mb-4" style={{ color: '#e5e7eb' }}>
            Fonctionnalité de collaboration en cours de développement.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('cards');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour la collaboration
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationTask, setCollaborationTask] = useState(null);

  // Stores
  const { tasks: rawTasks, loadUserTasks } = useTaskStore();
  const { projects: rawProjects, loadUserProjects } = useProjectStore();
  const { user } = useAuthStore();

  // 🛡️ PROTECTION : Nettoyer les données Firebase
  const tasks = useMemo(() => {
    if (!Array.isArray(rawTasks)) return [];
    
    return rawTasks.map(task => ({
      id: task.id || `temp-${Date.now()}`,
      title: task.title || 'Tâche sans titre',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      projectId: task.projectId || null,
      dueDate: task.dueDate || null,
      createdAt: task.createdAt || new Date().toISOString(),
      userId: task.userId || user?.uid
    }));
  }, [rawTasks, user?.uid]);

  const projects = useMemo(() => {
    if (!Array.isArray(rawProjects)) return [];
    
    return rawProjects.map(project => ({
      id: project.id || `temp-${Date.now()}`,
      title: project.title || 'Projet sans titre',
      status: project.status || 'active'
    }));
  }, [rawProjects]);

  // Chargement initial sécurisé
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        try {
          await loadUserTasks(user.uid);
        } catch (error) {
          console.warn('Erreur chargement tâches:', error);
        }
        
        try {
          await loadUserProjects(user.uid);
        } catch (error) {
          console.warn('Erreur chargement projets:', error);
        }
      } catch (error) {
        console.error('Erreur générale:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  // 🛡️ FILTRAGE SÉCURISÉ
  const filteredTasks = useMemo(() => {
    try {
      let filtered = tasks.filter(task => {
        const safeTitle = (task.title || '').toLowerCase();
        const safeDescription = (task.description || '').toLowerCase();
        const safeSearch = (searchTerm || '').toLowerCase();
        
        const matchesSearch = safeTitle.includes(safeSearch) || safeDescription.includes(safeSearch);
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        const matchesProject = filterProject === 'all' || task.projectId === filterProject;

        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
      });

      // Tri sécurisé
      filtered.sort((a, b) => {
        try {
          let aValue = a[sortBy] || '';
          let bValue = b[sortBy] || '';

          if (sortBy === 'dueDate') {
            aValue = new Date(aValue || '2099-12-31');
            bValue = new Date(bValue || '2099-12-31');
          }

          if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        } catch (error) {
          console.warn('Erreur tri:', error);
          return 0;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Erreur filtrage:', error);
      return tasks;
    }
  }, [tasks, searchTerm, filterStatus, filterPriority, filterProject, sortBy, sortOrder]);

  // Handlers
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      console.log('Suppression tâche:', taskId);
      // TODO: Implémenter la suppression
    }
  };

  const handleCompleteTask = async (taskId) => {
    console.log('Toggle status tâche:', taskId);
    // TODO: Implémenter le toggle de statut
  };

  const handleOpenCollaboration = (task) => {
    setCollaborationTask(task);
    setShowCollaborationModal(true);
  };

  const handleCloseCollaboration = () => {
    setShowCollaborationModal(false);
    setCollaborationTask(null);
  };

  // Fonctions utilitaires sécurisées
  const getProjectName = (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      return project ? project.title : 'Aucun projet';
    } catch (error) {
      return 'Projet inconnu';
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-green-200 bg-green-50 text-green-700',
      medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      high: 'border-red-200 bg-red-50 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.todo;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Aucune échéance';
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  // 📊 Statistiques sécurisées
  const safeStats = useMemo(() => {
    try {
      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        overdue: tasks.filter(t => {
          try {
            return t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date();
          } catch {
            return false;
          }
        }).length
      };
    } catch (error) {
      return { total: 0, completed: 0, inProgress: 0, overdue: 0 };
    }
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
              <p className="text-gray-600 mt-2">
                Organisez et suivez vos tâches efficacement
              </p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouvelle tâche
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{safeStats.total}</p>
                </div>
                <Target className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{safeStats.completed}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">{safeStats.inProgress}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En retard</p>
                  <p className="text-2xl font-bold text-red-600">{safeStats.overdue}</p>
                </div>
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value || '')}
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminées</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>

                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les projets</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>

              {/* Options d'affichage */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={20} />
                </button>
              </div>
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
                onCollaborate={handleOpenCollaboration}
                getProjectName={getProjectName}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Modal de collaboration */}
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={handleCloseCollaboration}
          entityType="task"
          entityId={collaborationTask?.id}
          entityTitle={collaborationTask?.title}
        />

        {/* Modal TaskForm - placeholder */}
        {showTaskForm && (
          <TaskFormModal
            task={editingTask}
            projects={projects}
            onSave={() => console.log('Sauvegarde tâche')}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        )}

        {/* Modal TaskDetail */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleStatus={handleCompleteTask}
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
// 🎴 COMPOSANT CARTE TÂCHE
// ==========================================

const TaskCard = ({ 
  task, 
  viewMode, 
  onEdit, 
  onDelete, 
  onComplete, 
  onView, 
  onCollaborate,
  getProjectName, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => onComplete(task.id)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>{getProjectName(task.projectId)}</span>
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Terminée' : 
                   task.status === 'in_progress' ? 'En cours' : 'À faire'}
                </span>
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCollaborate(task)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              title="Collaboration"
            >
              <User size={14} />
            </button>
            
            <button
              onClick={() => onView(task)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => onComplete(task.id)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getProjectName(task.projectId)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
              {task.status === 'completed' ? 'Terminée' : 
               task.status === 'in_progress' ? 'En cours' : 'À faire'}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCollaborate(task)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              title="Collaboration"
            >
              <User size={14} />
            </button>
            
            <button
              onClick={() => onView(task)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modales placeholder simplifiées
const TaskDetailModal = ({ task, onClose, onEdit, onDelete, onToggleStatus, getProjectName, getPriorityColor, getStatusColor, formatDate }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-auto"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                {task.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Terminée' : 
                   task.status === 'in_progress' ? 'En cours' : 'À faire'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {task.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>
                  Description
                </h3>
                <p style={{ color: '#e5e7eb' }}>{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1" style={{ color: '#d1d5db' }}>Projet</h4>
                <p style={{ color: '#e5e7eb' }}>{getProjectName(task.projectId)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1" style={{ color: '#d1d5db' }}>Échéance</h4>
                <p style={{ color: '#e5e7eb' }}>{formatDate(task.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: '#374151' }}>
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`px-6 py-2 rounded-lg ${
                task.status === 'completed' 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {task.status === 'completed' ? 'Rouvrir' : 'Marquer terminée'}
            </button>
            <button
              onClick={() => onEdit(task)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskFormModal = ({ task, projects, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        <div 
          className="relative rounded-lg shadow-xl p-6 max-w-md w-full"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <p className="mb-4" style={{ color: '#e5e7eb' }}>
            Formulaire de tâche à implémenter.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white">
              Annuler
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
