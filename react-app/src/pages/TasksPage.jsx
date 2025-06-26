// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// Page RÉPARÉE avec fonctionnalité d'édition
// ==========================================

import React, { useState, useEffect } from 'react';
import { useTaskStore, useGameStore, useAuthStore } from '../shared/stores';
import { Edit, Trash2, Plus, Filter, Target, Clock, AlertCircle } from 'lucide-react';

const TasksPage = () => {
  const { user } = useAuthStore();
  const { addTask, tasks, updateTask, deleteTask, getTaskStats } = useTaskStore();
  const { addXP } = useGameStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  const stats = getTaskStats();

  // Initialiser le formulaire avec les données de la tâche à éditer
  useEffect(() => {
    if (editingTask) {
      setNewTask({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate || '',
        status: editingTask.status || 'pending'
      });
      setShowForm(true);
    }
  }, [editingTask]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    if (editingTask) {
      // Mode édition
      updateTask(editingTask.id, {
        ...newTask,
        updatedAt: new Date().toISOString()
      });
      addXP(5, 'Tâche modifiée');
      setEditingTask(null);
    } else {
      // Mode création
      const taskToAdd = {
        ...newTask,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      };
      addTask(taskToAdd);
      addXP(10, 'Création de tâche');
    }
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    });
    setShowForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowForm(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'pending'
    });
  };

  const handleCompleteTask = (taskId) => {
    updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    addXP(20, 'Tâche complétée');
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${taskTitle}" ?`)) {
      deleteTask(taskId);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Clock className="w-4 h-4 text-green-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Tâches</h1>
          <p className="text-gray-600">Gérez vos tâches et suivez votre progression</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.inProgress || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions et filtres */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Nouvelle tâche
            </button>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les tâches</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formulaire de création/édition */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h3>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Titre de la tâche"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Description de la tâche"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminée</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingTask ? 'Sauvegarder' : 'Créer la tâche'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Aucune tâche' : `Aucune tâche ${filter === 'completed' ? 'terminée' : filter === 'in_progress' ? 'en cours' : 'en attente'}`}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' ? 'Commencez par créer votre première tâche' : 'Aucune tâche dans cette catégorie'}
              </p>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Créer une tâche
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityIcon(task.priority)}
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'completed' ? 'Terminée' : task.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                        {task.dueDate && (
                          <span className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500 font-medium' : ''}>
                            {new Date(task.dueDate) < new Date() && task.status !== 'completed' ? '⚠️ ' : ''}
                            Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="text-green-600">
                            ✅ Terminée le {new Date(task.completedAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {task.updatedAt && (
                          <span>Modifiée le {new Date(task.updatedAt).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {/* Bouton Modifier */}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier la tâche"
                      >
                        <Edit size={16} />
                      </button>

                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                          title="Marquer comme terminée"
                        >
                          ✅ Terminer
                        </button>
                      )}
                      
                      {task.status !== 'completed' && task.status !== 'in_progress' && (
                        <button
                          onClick={() => updateTask(task.id, { status: 'in_progress' })}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                          title="Commencer la tâche"
                        >
                          🔄 Commencer
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la tâche"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
