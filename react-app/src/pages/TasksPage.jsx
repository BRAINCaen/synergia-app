// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION ULTRA-SIMPLE - Sans erreurs JavaScript
// ==========================================

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Target, Clock, CheckCircle, Calendar, Flag, Send } from 'lucide-react';
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

  // États locaux
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

  // Filtrer les tâches selon les critères
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // ✅ FONCTION SIMPLE: Soumettre pour validation
  const handleSubmitTask = async (task) => {
    try {
      console.log('🔄 Soumission tâche pour validation:', task.title);
      
      // Simplement changer le statut - pas d'XP automatique
      await updateTask(task.id, {
        status: 'validation_pending',
        submittedAt: new Date().toISOString(),
        submissionComment: 'Tâche soumise pour validation admin',
        xpReward: getXPForDifficulty(task.difficulty || 'normal')
      });
      
      // Notification simple
      alert(`✅ Tâche "${task.title}" soumise pour validation admin !`);
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission');
    }
  };

  // Gestionnaires d'événements
  const handleCreateTask = async (taskData) => {
    try {
      const enhancedTask = {
        ...taskData,
        difficulty: taskData.difficulty || 'normal',
        xpReward: getXPForDifficulty(taskData.difficulty || 'normal'),
        requiresValidation: true,
        status: 'todo'
      };
      
      await createTask(enhancedTask, user.uid);
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Erreur création tâche:', error);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erreur modification tâche:', error);
    }
  };

  const handleDeleteTask = async (task) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
      }
    }
  };

  // ✅ FONCTION SIMPLE: Calculer XP
  const getXPForDifficulty = (difficulty) => {
    const xpMap = {
      'easy': 25,
      'normal': 50,
      'hard': 100,
      'expert': 200
    };
    return xpMap[difficulty] || 50;
  };

  // Fonctions utilitaires
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'validation_pending': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Validée';
      case 'validation_pending': return 'En validation';
      case 'rejected': return 'Rejetée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'À faire';
      default: return status;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Flag className="w-4 h-4 text-red-500" />;
      case 'medium': return <Flag className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Flag className="w-4 h-4 text-green-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  // ✅ BOUTON SIMPLE sans erreurs
  const SimpleSubmitButton = ({ task }) => {
    if (task.status === 'validation_pending') {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
          <Clock className="w-3 h-3 inline mr-1" />
          En validation
        </span>
      );
    }
    
    if (task.status === 'completed') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Validée
        </span>
      );
    }
    
    if (task.status === 'rejected') {
      return (
        <button
          onClick={() => handleSubmitTask(task)}
          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
        >
          Resoummettre
        </button>
      );
    }
    
    // Pour todo et in_progress
    return (
      <button
        onClick={() => handleSubmitTask(task)}
        className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
      >
        <Send className="w-3 h-3" />
        <span>Soumettre</span>
        {task.xpReward && <span className="bg-white/20 rounded px-1">+{task.xpReward}</span>}
      </button>
    );
  };

  // Stats
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    validationPending: tasks.filter(t => t.status === 'validation_pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    rejected: tasks.filter(t => t.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement des tâches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
            <p className="text-gray-600">Gérez et organisez votre travail quotidien</p>
            <p className="text-sm text-purple-600 mt-1">
              💡 Nouveau : XP attribués après validation admin
            </p>
          </div>
          
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900">{taskStats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-600">{taskStats.todo}</div>
            <div className="text-xs text-gray-600">À faire</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{taskStats.inProgress}</div>
            <div className="text-xs text-blue-600">En cours</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-600">{taskStats.validationPending}</div>
            <div className="text-xs text-orange-600">En validation</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-xs text-green-600">Validées</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{taskStats.rejected}</div>
            <div className="text-xs text-red-600">Rejetées</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les tâches</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Validées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Aucune tâche' : `Aucune tâche ${getStatusLabel(filter).toLowerCase()}`}
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
                        {getStatusLabel(task.status)}
                      </span>
                      
                      {(task.xpReward || task.difficulty) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          +{task.xpReward || getXPForDifficulty(task.difficulty || 'normal')} XP
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                      
                      {task.status === 'validation_pending' && (
                        <span className="text-orange-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          En attente de validation admin
                        </span>
                      )}
                      
                      {task.status === 'rejected' && (
                        <span className="text-red-600">
                          ❌ Rejetée - Resoumettez avec corrections
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Bouton de modification */}
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {/* Bouton de soumission */}
                    <SimpleSubmitButton task={task} />

                    {/* Bouton de suppression */}
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire simple modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  difficulty: formData.get('difficulty'),
                  dueDate: formData.get('dueDate') || null,
                  estimatedTime: formData.get('estimatedTime') || null
                };
                
                if (editingTask) {
                  handleEditTask(taskData);
                } else {
                  handleCreateTask(taskData);
                }
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editingTask?.title || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingTask?.description || ''}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select
                      name="priority"
                      defaultValue={editingTask?.priority || 'normal'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="normal">Normale</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                    <select
                      name="difficulty"
                      defaultValue={editingTask?.difficulty || 'normal'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Facile (+25 XP)</option>
                      <option value="normal">Normal (+50 XP)</option>
                      <option value="hard">Difficile (+100 XP)</option>
                      <option value="expert">Expert (+200 XP)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps estimé (h)</label>
                    <input
                      name="estimatedTime"
                      type="number"
                      step="0.5"
                      defaultValue={editingTask?.estimatedTime || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Aperçu XP */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800">
                    🏆 Cette tâche rapportera des XP après validation admin
                  </p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTask(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {creating || updating ? 'Sauvegarde...' : editingTask ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
