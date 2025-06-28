// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION D'URGENCE - Minimaliste sans erreurs
// ==========================================

import React, { useState, useEffect } from 'react';
import { Plus, Search, Target } from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const TasksPage = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    loading, 
    creating,
    updating,
    loadUserTasks,
    createTask,
    updateTask,
    deleteTask 
  } = useTaskStore();

  // États locaux simplifiés
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
    }
  }, [user?.uid, loadUserTasks]);

  // Filtrer les tâches - version simplifiée
  const filteredTasks = tasks ? tasks.filter(task => {
    if (!task) return false;
    
    const matchesFilter = filter === 'all' || (task.status === filter);
    const matchesSearch = !searchTerm || 
      (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }) : [];

  // ✅ FONCTION ULTRA SIMPLE: Marquer comme soumis
  const handleSubmitTask = async (task) => {
    try {
      console.log('Soumission tâche:', task.title);
      
      await updateTask(task.id, {
        status: 'validation_pending',
        submittedAt: new Date().toISOString()
      });
      
      alert('✅ Tâche soumise pour validation !');
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la soumission');
    }
  };

  // Gestionnaires simplifiés
  const handleCreateTask = async (taskData) => {
    try {
      await createTask({
        ...taskData,
        status: 'todo'
      }, user.uid);
      setShowForm(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
    }
  };

  const handleDeleteTask = async (task) => {
    if (confirm(`Supprimer "${task.title}" ?`)) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  // Fonctions utilitaires simplifiées
  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'validation_pending') return 'bg-orange-100 text-orange-800';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    if (status === 'completed') return 'Validée';
    if (status === 'validation_pending') return 'En validation';
    if (status === 'in_progress') return 'En cours';
    return 'À faire';
  };

  // Stats simplifiées
  const stats = {
    total: tasks ? tasks.length : 0,
    pending: tasks ? tasks.filter(t => t.status === 'validation_pending').length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header minimal */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
            <p className="text-gray-600">Nouveau système de validation</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        </div>

        {/* Stats ultra simples */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total tâches</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-600">{stats.pending}</div>
            <div className="text-xs text-orange-600">En validation</div>
          </div>
        </div>
      </div>

      {/* Recherche simple */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">Toutes</option>
            <option value="todo">À faire</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Validées</option>
          </select>
        </div>
      </div>

      {/* Liste des tâches simplifiée */}
      <div className="bg-white rounded-lg shadow-sm border">
        {!filteredTasks || filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
            <p className="text-gray-500 mb-4">Créez votre première tâche</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Créer une tâche
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                      {task.status === 'validation_pending' && (
                        <span className="ml-4 text-orange-600">⏳ En attente de validation</span>
                      )}
                    </div>
                  </div>

                  {/* Actions simplifiées */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Bouton de soumission conditionnel */}
                    {task.status === 'todo' || task.status === 'in_progress' ? (
                      <button
                        onClick={() => handleSubmitTask(task)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Soumettre
                      </button>
                    ) : task.status === 'validation_pending' ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm">
                        En validation
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                        Validée
                      </span>
                    )}

                    {/* Bouton suppression */}
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire ultra simple */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nouvelle tâche</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateTask({
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority') || 'normal'
              });
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  name="title"
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  name="priority"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
