// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// ✅ VERSION FIXÉE - CRÉATION DE TÂCHES FONCTIONNELLE
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
  Edit,
  Trash2,
  Filter
} from 'lucide-react';

// ✅ IMPORTS CORRECTS
import { useAuthStore } from '../shared/stores/authStore.js';
import TaskService from '../core/services/taskService.js';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';

// ✅ INSTANCE DU SERVICE
const taskService = new TaskService();

// ✅ COMPOSANT MODAL RAPIDE DE CRÉATION
const QuickTaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'normal',
    priority: 'normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
    setFormData({ title: '', description: '', difficulty: 'normal', priority: 'normal' });
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
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Finaliser la présentation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Facile (10 XP)</option>
                <option value="normal">Normal (25 XP)</option>
                <option value="hard">Difficile (50 XP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ COMPOSANT CARTE DE TÂCHE
const TaskCard = ({ task, onSubmit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-indigo-100 text-indigo-800', 
      'validation_pending': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'todo': 'À faire',
      'in_progress': 'En cours',
      'validation_pending': 'En validation',
      'completed': 'Validée',
      'rejected': 'Rejetée'
    };
    return labels[status] || status;
  };

  const getDifficultyXP = (difficulty) => {
    const xp = {
      'easy': 10,
      'normal': 25,
      'hard': 50
    };
    return xp[difficulty] || 25;
  };

  const canSubmit = task.status === 'todo' || task.status === 'in_progress';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {getDifficultyXP(task.difficulty)} XP
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        {task.priority !== 'normal' && (
          <span className={`px-1 py-0.5 rounded text-xs ${
            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.priority}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canSubmit && (
            <button
              onClick={() => onSubmit(task)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-3 h-3" />
              Soumettre
            </button>
          )}
          
          {task.status === 'validation_pending' && (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <Clock className="w-3 h-3" />
              En attente de validation
            </div>
          )}
          
          {task.status === 'completed' && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-3 h-3" />
              Validée
            </div>
          )}
          
          {task.status === 'rejected' && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertTriangle className="w-3 h-3" />
              Rejetée
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPOSANT PRINCIPAL
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ✅ CHARGER LES TÂCHES
  const loadTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔄 Chargement des tâches pour:', user.uid);
      const userTasks = await taskService.getUserTasks(user.uid);
      setTasks(userTasks || []);
      console.log('✅ Tâches chargées:', userTasks?.length || 0);
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadTasks();
  }, [user?.uid]);

  // ✅ CRÉER UNE TÂCHE - VERSION CORRIGÉE
  const handleCreateTask = async (taskData) => {
    if (!user?.uid) {
      alert('Vous devez être connecté pour créer une tâche');
      return;
    }
    
    setCreating(true);
    try {
      console.log('📝 Création tâche:', taskData);
      
      // ✅ Appel correct du service
      const newTask = await taskService.createTask(taskData, user.uid);
      
      // Ajouter à la liste locale
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
      
      console.log('✅ Tâche créée avec succès:', newTask.id);
      alert('✅ Tâche créée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert(`❌ Erreur lors de la création: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  // ✅ OUVRIR LE MODAL DE SOUMISSION
  const handleSubmitTaskClick = (task) => {
    console.log('🎯 Ouverture modal soumission pour:', task.title);
    setTaskToSubmit(task);
    setShowSubmissionModal(true);
  };

  // ✅ SOUMETTRE POUR VALIDATION
  const handleSubmitTask = async (task, submissionData) => {
    setUpdating(true);
    try {
      console.log('🎯 Soumission tâche pour validation:', task.title);
      console.log('📎 Données soumission:', submissionData);
      
      const result = await taskService.submitTaskForValidation(task.id, submissionData);
      
      // Mettre à jour la liste locale
      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: 'validation_pending', submittedAt: new Date().toISOString() }
          : t
      ));
      
      // Fermer le modal
      setShowSubmissionModal(false);
      setTaskToSubmit(null);
      
      alert('✅ Tâche soumise pour validation admin ! Vous recevrez vos XP une fois validée.');
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      alert(`❌ Erreur lors de la soumission: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ SUPPRIMER UNE TÂCHE
  const handleDeleteTask = async (task) => {
    if (!confirm(`Supprimer la tâche "${task.title}" ?`)) return;
    
    try {
      await taskService.deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      console.log('✅ Tâche supprimée');
      alert('✅ Tâche supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert(`❌ Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'validation_pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    rejected: tasks.filter(t => t.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des tâches...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Mes Tâches
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches et suivez votre progression
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Création...' : 'Nouvelle Tâche'}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
          <div className="text-sm text-gray-600">À faire</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En validation</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Validées</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejetées</div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Validées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Information sur le nouveau système */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">📋 Nouveau système de validation</h3>
            <p className="text-blue-700 text-sm mt-1">
              Les tâches sont maintenant validées par un admin avant de vous donner des XP. 
              Utilisez le bouton "Soumettre" pour envoyer vos tâches terminées en validation.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onSubmit={handleSubmitTaskClick}
              onDelete={handleDeleteTask}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' ? 
                'Modifiez vos filtres pour voir plus de tâches' 
                : 'Créez votre première tâche pour commencer'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showForm && (
        <QuickTaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Modal de soumission */}
      {showSubmissionModal && taskToSubmit && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={taskToSubmit}
          onSubmit={handleSubmitTask}
          onClose={() => {
            setShowSubmissionModal(false);
            setTaskToSubmit(null);
          }}
          submitting={updating}
        />
      )}
    </div>
  );
};

export default TasksPage;
