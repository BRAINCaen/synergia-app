// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// Page complète de gestion des tâches
// ==========================================

import React, { useState, useEffect } from 'react';
import { useTaskStore, useGameStore, useAuthStore } from '../shared/stores';

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

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const taskToAdd = {
      ...newTask,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    addTask(taskToAdd);
    
    // Ajouter XP pour création de tâche
    addXP(10, 'Création de tâche');
    
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

  const handleCompleteTask = (taskId) => {
    updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    // Ajouter XP pour completion
    addXP(20, 'Tâche complétée');
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Tâches</h1>
        <p className="text-gray-600">Gérez vos tâches et suivez votre progression</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions et filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'in_progress' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En cours ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'completed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Terminées ({stats.completed})
          </button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Nouvelle tâche
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle tâche</h3>
            
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
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Créer la tâche
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
      <div className="bg-white rounded-lg shadow">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Aucune tâche' : `Aucune tâche ${filter === 'completed' ? 'terminée' : filter === 'pending' ? 'en attente' : 'en cours'}`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'Commencez par créer votre première tâche' : 'Changez de filtre pour voir d\'autres tâches'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Créer ma première tâche
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Terminée' : task.status === 'in_progress' ? 'En cours' : 'En attente'}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Créée le {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.dueDate && (
                        <span>Échéance: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      {task.completedAt && (
                        <span>Terminée le {new Date(task.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        ✅ Terminer
                      </button>
                    )}
                    
                    {task.status !== 'completed' && task.status !== 'in_progress' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'in_progress' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        🔄 Commencer
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
