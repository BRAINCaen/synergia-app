// ==========================================
// 📋 TASKS PAGE - SYNERGIA v3.5 - VERSION SIMPLIFIÉE
// ==========================================
// Fichier: react-app/src/pages/TasksPage.jsx
// Version sans dépendances problématiques
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, List, Grid, Eye, Edit, Trash2, Target, Calendar, User, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

// Import de la modal simple (sans dépendances externes)
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
  const [loading, setLoading] = useState(true);

  // États pour la collaboration
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationTask, setCollaborationTask] = useState(null);

  // Stores
  const { 
    tasks, 
    loadUserTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    completeTask 
  } = useTaskStore();
  
  const { projects, loadUserProjects } = useProjectStore();
  const { user } = useAuthStore();
  const { addXP } = useGameStore();

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        await Promise.all([
          loadUserTasks(user.uid),
          loadUserProjects(user.uid)
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  // Filtrage et tri des tâches
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesProject = filterProject === 'all' || task.projectId === filterProject;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'dueDate') {
        aValue = new Date(aValue || '2099-12-31');
        bValue = new Date(bValue || '2099-12-31');
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterProject, sortBy, sortOrder]);

  // Handlers
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await deleteTask(taskId);
    }
  };

  const handleCompleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== 'completed') {
      await completeTask(taskId, user.uid);
      addXP(10, 'Tâche terminée');
    } else if (task) {
      await updateTask(taskId, { 
        status: task.status === 'completed' ? 'todo' : 'completed' 
      }, user.uid);
    }
  };

  // Handlers pour la collaboration
  const handleOpenCollaboration = (task) => {
    setCollaborationTask(task);
    setShowCollaborationModal(true);
  };

  const handleCloseCollaboration = () => {
    setShowCollaborationModal(false);
    setCollaborationTask(null);
  };

  // Fonctions utilitaires
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Aucun projet';
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
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Aucune échéance';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <Target className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
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
                  <p className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
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
                  <p className="text-2xl font-bold text-red-600">
                    {tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length}
                  </p>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="pending">En attente</option>
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

              {/* Tri */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dueDate">Échéance</option>
                  <option value="priority">Priorité</option>
                  <option value="title">Titre</option>
                  <option value="createdAt">Date de création</option>
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
            onSave={editingTask ? updateTask : createTask}
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
                   task.status === 'in_progress' ? 'En cours' : 'En attente'}
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
              Collaborer
            </button>
            
            <button
              onClick={() => onView(task)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye size={14} />
              Voir
            </button>
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
            >
              <Edit size={14} />
              Modifier
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={14} />
              Supprimer
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
               task.status === 'in_progress' ? 'En cours' : 'En attente'}
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

// Modales placeholder (mêmes que les versions corrigées précédentes)
const TaskDetailModal = ({ 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  getProjectName, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-xl shadow-2xl p-8 max-w-3xl w-full mx-auto text-left overflow-hidden transform transition-all"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                {task.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Terminée' : 
                   task.status === 'in_progress' ? 'En cours' : 'En attente'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {task.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                  Description
                </h3>
                <p style={{ color: '#e5e7eb' }}>{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2" style={{ color: '#d1d5db' }}>Projet</h4>
                <p style={{ color: '#e5e7eb' }}>{getProjectName(task.projectId)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2" style={{ color: '#d1d5db' }}>Échéance</h4>
                <p style={{ color: '#e5e7eb' }}>{formatDate(task.dueDate)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3" style={{ color: '#ffffff' }}>
                Commentaires
              </h4>
              <div 
                className="border rounded-lg p-4 min-h-24"
                style={{ 
                  backgroundColor: '#111827', 
                  borderColor: '#374151',
                  color: '#9ca3af'
                }}
              >
                <p className="text-center italic">Aucun commentaire pour le moment</p>
              </div>
              
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: '#374151',
                    borderColor: '#4b5563',
                    color: '#ffffff'
                  }}
                />
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff'
                  }}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: '#374151' }}>
            <button
              onClick={() => onToggleStatus(task.id)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                task.status === 'completed' 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
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
            Formulaire de tâche à implémenter selon vos besoins.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
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
