// src/modules/tasks/TaskList.jsx - Version corrigée avec MainLayout
import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useTaskStore } from '../../shared/stores/taskStore';
import { useProjectStore } from '../../shared/stores/projectStore';
import { useAuthStore } from '../../shared/stores/authStore';
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Chargement des tâches...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header avec stats - STYLE SOMBRE */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Mes Tâches</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>➕</span>
              Nouvelle tâche
            </button>
          </div>

          {/* Stats rapides - STYLE SOMBRE */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-blue-300">Total</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-green-300">Terminées</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-orange-400">{stats.inProgress}</div>
              <div className="text-sm text-orange-300">En cours</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
              <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
              <div className="text-sm text-red-300">En retard</div>
            </div>
          </div>

          {/* Barre de recherche et filtres - STYLE SOMBRE */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-gray-700 border-gray-500 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>📊</span>
              Filtres
            </button>
          </div>
        </div>

        {/* Panneau de filtres - STYLE SOMBRE */}
        {showFilters && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminées</option>
                </select>
              </div>

              {/* Filtre par priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Projet</label>
                <select
                  value={filters.projectId}
                  onChange={(e) => handleProjectFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            <div className="mt-4 pt-4 border-t border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-2">Trier par</label>
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
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                      filters.orderBy === field 
                        ? 'bg-blue-600 text-white border border-blue-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
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
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm ? 'Aucune tâche trouvée' : 'Aucune tâche'}
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche ou vos filtres'
                  : 'Commencez par créer votre première tâche !'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    </MainLayout>
  );
};

export default TaskList;
