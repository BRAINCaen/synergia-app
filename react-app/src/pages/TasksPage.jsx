// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// ✅ VERSION FIXÉE - BOUTONS SOUMETTRE FONCTIONNELS
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
import taskService from '../core/services/taskService.js';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';

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
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
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
                <option value="expert">Expert (100 XP)</option>
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // États UI
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // États modaux - ✅ CORRECTION DES PROPS
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);

  // Statistiques calculées
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    validationPending: tasks.filter(t => t.status === 'validation_pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    rejected: tasks.filter(t => t.status === 'rejected').length
  };

  // Tâches filtrées
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ✅ CHARGER LES TÂCHES
  const loadTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔄 Chargement des tâches...');
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

  // ✅ CRÉER UNE TÂCHE
  const handleCreateTask = async (taskData) => {
    if (!user?.uid) return;
    
    setCreating(true);
    try {
      console.log('📝 Création tâche:', taskData.title);
      const newTask = await taskService.createTask(taskData, user.uid);
      
      // Ajouter à la liste locale
      setTasks(prev => [...prev, newTask]);
      setShowForm(false);
      
      console.log('✅ Tâche créée avec succès');
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setCreating(false);
    }
  };

  // ✅ OUVRIR LE MODAL DE SOUMISSION - CORRECTION
  const handleSubmitTaskClick = (task) => {
    console.log('🎯 Ouverture modal soumission pour:', task.title);
    setTaskToSubmit(task);
    setShowSubmissionModal(true);
  };

  // ✅ SOUMETTRE POUR VALIDATION - CORRECTION
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
      
      // Fermer le modal - ✅ CORRECTION
      setShowSubmissionModal(false);
      setTaskToSubmit(null);
      
      alert('✅ Tâche soumise pour validation admin ! Vous recevrez vos XP une fois validée.');
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      alert('❌ Erreur lors de la soumission');
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
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      'todo': 'text-blue-600',
      'in_progress': 'text-indigo-600', 
      'validation_pending': 'text-orange-600',
      'completed': 'text-green-600',
      'rejected': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  // Fonction pour obtenir le label du statut
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

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            return (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {task.difficulty && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {task.difficulty}
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    {/* Commentaire admin pour les tâches rejetées */}
                    {task.status === 'rejected' && task.adminComment && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-red-800">Commentaire admin : </span>
                            <span className="text-red-700">{task.adminComment}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* ✅ BOUTONS CORRIGÉS */}
                    
                    {/* Bouton soumettre pour tâches en cours ou à faire */}
                    {(task.status === 'todo' || task.status === 'in_progress') && (
                      <button
                        onClick={() => handleSubmitTaskClick(task)}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        {updating ? 'Soumission...' : 'Soumettre'}
                      </button>
                    )}
                    
                    {/* Bouton de resoumission pour tâches rejetées */}
                    {task.status === 'rejected' && (
                      <button
                        onClick={() => handleSubmitTaskClick(task)}
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
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune tâche trouvée</p>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all' 
                ? 'Modifiez vos filtres pour voir plus de tâches' 
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

      {/* ✅ MODAL DE SOUMISSION CORRIGÉ */}
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
