// ==========================================
// 📁 react-app/src/modules/tasks/TaskList.jsx  
// Liste des tâches SANS MainLayout (évite la duplication)
// ==========================================

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../shared/stores/taskStore';
import { useAuthStore } from '../../shared/stores/authStore';
import { useProjectStore } from '../../shared/stores/projectStore';

const TaskList = () => {
  const { 
    tasks, 
    loading, 
    creating,
    filters, 
    searchTerm, 
    stats,
    loadUserTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFilter,
    setSearchTerm,
    getFilteredTasks
  } = useTaskStore();
  
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'normal',
    difficulty: 'normal',
    dueDate: '',
    projectId: ''
  });

  // ✅ Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
    }
  }, [user?.uid, loadUserTasks]);

  // ✅ Obtenir les tâches filtrées
  const filteredTasks = getFilteredTasks();

  // ✅ Créer une nouvelle tâche
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      alert('Le titre est requis');
      return;
    }

    try {
      await createTask(newTask, user.uid);
      setNewTask({
        title: '',
        description: '',
        priority: 'normal',
        difficulty: 'normal',
        dueDate: '',
        projectId: ''
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création de la tâche');
    }
  };

  // ✅ Marquer une tâche comme terminée
  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId, user.uid);
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
    }
  };

  // ✅ Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
      }
    }
  };

  // ✅ Obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'normal': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'low': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  // ✅ Obtenir l'icône de difficulté
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'normal': return '🟡';
      case 'hard': return '🟠';
      case 'expert': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-white">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Chargement des tâches...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">📝 Mes Tâches</h2>
            <p className="text-gray-400">Gestion des tâches avec gamification</p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={creating}
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
              </>
            ) : (
              <>
                <span>+</span>
                Nouvelle tâche
              </>
            )}
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-gray-400">Terminées</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-xs text-gray-400">En cours</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-400">{stats.todo}</div>
            <div className="text-xs text-gray-400">À faire</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{stats.completionRate}%</div>
            <div className="text-xs text-gray-400">Réussite</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Recherche */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Haute</option>
              <option value="normal">Normale</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-400 mb-4">
              {tasks.length === 0 
                ? "Commencez par créer votre première tâche !" 
                : "Aucune tâche ne correspond à vos filtres."}
            </p>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Créer une tâche
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    
                    {/* Badges */}
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-lg" title={`Difficulté: ${task.difficulty}`}>
                        {getDifficultyIcon(task.difficulty)}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.dueDate && (
                      <span>📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                    )}
                    {task.projectId && (
                      <span>📁 Projet</span>
                    )}
                    <span>⏰ {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      title="Marquer comme terminé"
                    >
                      ✓
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Barre de progression (optionnelle) */}
              {task.status === 'in_progress' && (
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de création de tâche */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Nom de la tâche"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Description de la tâche"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Difficulté
                  </label>
                  <select
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Facile (20 XP)</option>
                    <option value="normal">Normal (40 XP)</option>
                    <option value="hard">Difficile (60 XP)</option>
                    <option value="expert">Expert (100 XP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'normal',
                      difficulty: 'normal',
                      dueDate: '',
                      projectId: ''
                    });
                  }}
                  className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
