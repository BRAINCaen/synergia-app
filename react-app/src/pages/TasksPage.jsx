// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// MISE À JOUR : Intégration du système de validation
// ==========================================

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Target, Clock, CheckCircle, Calendar, Flag } from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import TaskForm from '../components/tasks/TaskForm.jsx';
// ✅ NOUVEAU: Import du bouton de soumission
import SubmitTaskButton from '../components/tasks/SubmitTaskButton.jsx';

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
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Gestionnaires d'événements
  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData, user.uid);
      setShowForm(false);
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

  // ✅ NOUVEAU: Gestionnaire de soumission réussie
  const handleSubmissionSuccess = (result) => {
    console.log('✅ Tâche soumise avec succès:', result);
    // Optionnel: Afficher une notification
    // toast.success(`Tâche soumise ! +${result.xpAmount} XP en attente de validation`);
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
      case 'validation_pending': return 'bg-orange-100 text-orange-800'; // ✅ NOUVEAU STATUT
      case 'rejected': return 'bg-red-100 text-red-800'; // ✅ NOUVEAU STATUT
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Validée';
      case 'validation_pending': return 'En validation'; // ✅ NOUVEAU
      case 'rejected': return 'Rejetée'; // ✅ NOUVEAU
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

  // Stats rapides
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    validationPending: tasks.filter(t => t.status === 'validation_pending').length, // ✅ NOUVEAU
    completed: tasks.filter(t => t.status === 'completed').length,
    rejected: tasks.filter(t => t.status === 'rejected').length // ✅ NOUVEAU
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

        {/* Stats rapides */}
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
          {/* ✅ NOUVEAU: Stats validation */}
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
              <option value="validation_pending">En validation</option> {/* ✅ NOUVEAU */}
              <option value="completed">Validées</option>
              <option value="rejected">Rejetées</option> {/* ✅ NOUVEAU */}
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
                      
                      {/* ✅ NOUVEAU: Affichage XP */}
                      {task.xpReward && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          +{task.xpReward} XP
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() && !['completed', 'validation_pending'].includes(task.status) ? 'text-red-500 font-medium' : ''}>
                          {new Date(task.dueDate) < new Date() && !['completed', 'validation_pending'].includes(task.status) ? '⚠️ ' : ''}
                          Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {task.estimatedTime && (
                        <span>Temps estimé: {task.estimatedTime}h</span>
                      )}

                      {/* ✅ NOUVEAU: Informations de validation */}
                      {task.status === 'validation_pending' && task.submittedAt && (
                        <span className="text-orange-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Soumise le {new Date(task.submittedAt.toDate()).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      
                      {task.status === 'completed' && task.validatedAt && (
                        <span className="text-green-600">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Validée le {new Date(task.validatedAt.toDate()).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      
                      {task.status === 'rejected' && task.adminComment && (
                        <span className="text-red-600">
                          💬 {task.adminComment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ NOUVEAU: Actions avec bouton de soumission */}
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

                    {/* ✅ REMPLACEMENT: Nouveau bouton de soumission */}
                    <SubmitTaskButton
                      task={task}
                      onSubmissionSuccess={handleSubmissionSuccess}
                      size="small"
                    />

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

      {/* Modal de formulaire */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          loading={creating || updating}
        />
      )}
    </div>
  );
};

export default TasksPage;
