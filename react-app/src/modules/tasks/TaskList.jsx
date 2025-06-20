// src/modules/tasks/TaskList.jsx - Sans lucide-react
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../shared/stores/taskStore.js';
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { TaskCard } from './TaskCard.jsx';
import { TaskForm } from './TaskForm.jsx';

export const TaskList = () => {
  const { 
    tasks, 
    loading, 
    filters, 
    searchTerm, 
    setFilters, 
    setSearchTerm, 
    getFilteredTasks,
    stats
  } = useTaskStore();
  
  const { projects } = useProjectStore();
  const { user } = useAuthStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      useTaskStore.getState().loadUserTasks(user.uid);
    }
  }, [user?.uid]);

  // Obtenir les tâches filtrées
  const filteredTasks = getFilteredTasks();

  // Gestionnaires de filtres
  const handleStatusFilter = (status) => {
    setFilters({ status });
  };

  const handlePriorityFilter = (priority) => {
    setFilters({ priority });
  };

  const handleProjectFilter = (projectId) => {
    setFilters({ projectId });
  };

  const handleSort = (field) => {
    const newDirection = filters.orderBy === field && filters.orderDirection === 'desc' ? 'asc' : 'desc';
    setFilters({ orderBy: field, orderDirection: newDirection });
  };

  // Ouvrir le formulaire d'édition
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Chargement des tâches...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mes Tâches</h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>➕</span>
            Nouvelle tâche
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-700">Terminées</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-orange-700">En cours</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-red-700">En retard</div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
              showFilters ? 'bg-gray-50 border-gray-400' : 'border-gray-300'
            }`}
          >
            <span>📊</span>
            Filtres
          </button>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
              </select>
            </div>

            {/* Filtre par priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
              <select
                value={filters.priority}
                onChange={(e) => handlePriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes</option>
                <option value="urgent">🔥 Urgent</option>
                <option value="high">⚡ Haute</option>
                <option value="medium">📌 Moyenne</option>
                <option value="low">📝 Basse</option>
              </select>
            </div>

            {/* Filtre par projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Projet</label>
              <select
                value={filters.projectId}
                onChange={(e) => handleProjectFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les projets</option>
                <option value="">Sans projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options de tri */}
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { field: 'createdAt', label: 'Date création' },
                { field: 'dueDate', label: 'Échéance' },
                { field: 'priority', label: 'Priorité' },
                { field: 'title', label: 'Titre' }
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                    filters.orderBy === field 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {filters.orderBy === field && (
                    <span>{filters.orderDirection === 'desc' ? '↓' : '↑'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucune tâche trouvée' : 'Aucune tâche'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Essayez de modifier votre recherche ou vos filtres'
                : 'Commencez par créer votre première tâche !'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>➕</span>
                Créer une tâche
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={handleEditTask}
            />
          ))
        )}
      </div>

      {/* Formulaire de tâche */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
          onSave={handleCloseForm}
        />
      )}
    </div>
  );
};
