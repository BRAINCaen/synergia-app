// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// ✅ VERSION COMPLÈTE ET RÉPARÉE - SYSTÈME DE VALIDATION ADMIN
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Target, 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  Edit,
  Filter
} from 'lucide-react';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';

// ✅ COMPOSANT MODAL RAPIDE DE CRÉATION
const QuickTaskForm = ({ onSubmit, onCancel, projects = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    difficulty: 'medium',
    priority: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit({
      ...formData,
      difficulty: formData.difficulty || 'medium'
    });
    
    setFormData({ title: '', description: '', projectId: '', difficulty: 'medium', priority: 'normal' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nouvelle Tâche</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de la tâche..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Détails de la tâche..."
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">Facile (10 XP)</option>
                <option value="medium">Moyen (25 XP)</option>
                <option value="hard">Difficile (50 XP)</option>
                <option value="expert">Expert (100 XP)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet (optionnel)</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Aucun projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ COMPOSANT PRINCIPAL TASKSPAGE - FIXÉ ET COMPLET
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
  
  const { projects, loadUserProjects } = useProjectStore();

  // États locaux
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
      loadUserProjects(user.uid);
    }
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  // Filtrer les tâches
  const filteredTasks = tasks ? tasks.filter(task => {
    if (!task) return false;
    
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = !searchTerm || 
      (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  }) : [];

  // ✅ FONCTION SOUMISSION POUR VALIDATION
  const handleSubmitTask = async (task) => {
    try {
      console.log('🎯 Soumission tâche pour validation:', task.title);
      
      await updateTask(task.id, {
        status: 'validation_pending',
        submittedAt: new Date().toISOString(),
        submittedForValidation: true
      });
      
      // Toast notification
      alert('✅ Tâche soumise pour validation admin ! Vous recevrez vos XP une fois validée.');
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission');
    }
  };

  // Gestionnaire création
  const handleCreateTask = async (taskData) => {
    try {
      await createTask({
        ...taskData,
        status: 'todo'
      }, user.uid);
      setShowForm(false);
      console.log('✅ Tâche créée:', taskData.title);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  // Gestionnaire suppression
  const handleDeleteTask = async (task) => {
    if (confirm(`Supprimer "${task.title}" ?`)) {
      try {
        await deleteTask(task.id);
        console.log('🗑️ Tâche supprimée:', task.title);
      } catch (error) {
        console.error('❌ Erreur suppression:', error);
      }
    }
  };

  // Utilitaires styles
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'validation_pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return '✅ Validée';
      case 'validation_pending': return '⏳ En validation';
      case 'rejected': return '❌ Rejetée';
      case 'in_progress': return '🔄 En cours';
      default: return '📋 À faire';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'validation_pending': return Clock;
      case 'rejected': return AlertTriangle;
      case 'in_progress': return Target;
      default: return CheckSquare;
    }
  };

  const getDifficultyXP = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 25;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'hard': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  // Statistiques
  const stats = {
    total: tasks ? tasks.length : 0,
    todo: tasks ? tasks.filter(t => t.status === 'todo').length : 0,
    inProgress: tasks ? tasks.filter(t => t.status === 'in_progress').length : 0,
    validationPending: tasks ? tasks.filter(t => t.status === 'validation_pending').length : 0,
    completed: tasks ? tasks.filter(t => t.status === 'completed').length : 0,
    rejected: tasks ? tasks.filter(t => t.status === 'rejected').length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches avec le nouveau système de validation admin
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Tâche
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.todo}</p>
          <p className="text-sm text-blue-600">À faire</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
          <p className="text-sm text-indigo-600">En cours</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.validationPending}</p>
          <p className="text-sm text-orange-600">En validation</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-green-600">Validées</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-red-600">Rejetées</p>
        </div>
      </div>

      {/* Message informatif */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm">💡</span>
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Nouveau système de validation</h3>
            <p className="text-blue-800 text-sm mt-1">
              Les tâches sont maintenant validées par un administrateur avant d'attribuer les XP. 
              Utilisez le bouton "Soumettre" pour envoyer vos tâches terminées en validation.
            </p>
          </div>
        </div>
      </div>

      {/* Alerte tâches rejetées */}
      {stats.rejected > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">
                {stats.rejected} tâche(s) rejetée(s)
              </h3>
              <p className="text-red-800 text-sm mt-1">
                Consultez les commentaires admin et resoumettez vos tâches corrigées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Validées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="bg-white rounded-lg border">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Aucune tâche trouvée' : 'Aucune tâche'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Créez votre première tâche pour commencer'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Créer une tâche
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* En-tête tâche */}
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      {task.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      
                      {/* Métadonnées */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                        
                        {task.difficulty && (
                          <span className={`font-medium ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty} ({getDifficultyXP(task.difficulty)} XP)
                          </span>
                        )}
                        
                        {task.projectId && projects && (
                          <span className="text-purple-600">
                            📁 {projects.find(p => p.id === task.projectId)?.name || 'Projet'}
                          </span>
                        )}
                        
                        {task.status === 'validation_pending' && (
                          <span className="text-orange-600 font-medium">
                            ⏳ En attente de validation admin
                          </span>
                        )}
                        
                        {task.status === 'rejected' && task.adminComment && (
                          <span className="text-red-600 font-medium">
                            💬 Commentaire admin disponible
                          </span>
                        )}
                      </div>
                      
                      {/* Commentaire admin pour tâches rejetées */}
                      {task.status === 'rejected' && task.adminComment && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">Commentaire admin :</p>
                          <p className="text-sm text-red-700">{task.adminComment}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      
                      {/* Bouton de soumission conditionnel */}
                      {(task.status === 'todo' || task.status === 'in_progress') && (
                        <button
                          onClick={() => handleSubmitTask(task)}
                          disabled={updating}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Soumettre
                        </button>
                      )}
                      
                      {/* Bouton de resoumission pour tâches rejetées */}
                      {task.status === 'rejected' && (
                        <button
                          onClick={() => handleSubmitTask(task)}
                          disabled={updating}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Resoummettre
                        </button>
                      )}
                      
                      {/* États non interactifs */}
                      {task.status === 'validation_pending' && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg">
                          <Clock className="w-4 h-4" />
                          En validation
                        </div>
                      )}
                      
                      {task.status === 'completed' && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Validée
                        </div>
                      )}
                      
                      {/* Actions supplémentaires */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showForm && (
        <QuickTaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          projects={projects}
        />
      )}
    </div>
  );
};

export default TasksPage;
