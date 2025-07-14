// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION AVEC SYSTÈME DE VALIDATION INTÉGRÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Target,
  Briefcase,
  Link,
  Unlink,
  Trash2,
  X,
  Trophy,
  Eye,
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { projectService } from '../core/services/projectService.js';
import { taskProjectIntegration } from '../core/services/taskProjectIntegration.js';
import TaskForm from '../modules/tasks/TaskForm.jsx';
// 🆕 IMPORTS DU SYSTÈME DE VALIDATION ET ASSIGNATION
import SubmitTaskButton from '../components/tasks/SubmitTaskButton.jsx';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.jsx';

/**
 * ✅ FONCTION SAFE POUR AFFICHER LA PROGRESSION
 */
const getProgressDisplay = (progressData) => {
  if (!progressData) return 0;
  if (typeof progressData === 'number') return Math.round(progressData);
  if (typeof progressData === 'object' && progressData.percentage !== undefined) {
    return Math.round(progressData.percentage);
  }
  if (typeof progressData === 'object' && progressData.completed !== undefined && progressData.total !== undefined) {
    return progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0;
  }
  if (typeof progressData === 'string') {
    const parsed = parseFloat(progressData);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }
  return 0;
};

/**
 * ✅ FONCTION SAFE POUR OBTENIR LE LABEL DE STATUT
 */
const getStatusLabel = (status) => {
  const statusMap = {
    'todo': 'À faire',
    'in_progress': 'En cours',
    'validation_pending': 'En validation',
    'completed': 'Validée',
    'rejected': 'Rejetée',
    'active': 'Actif',
    'paused': 'En pause',
    'cancelled': 'Annulé'
  };
  return statusMap[status] || status || 'Non défini';
};

/**
 * 🎨 FONCTION POUR OBTENIR LA COULEUR DU STATUT
 */
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'validation_pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * 📝 PAGE DES TÂCHES AVEC VALIDATION INTÉGRÉE
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // États UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectAssignModal, setShowProjectAssignModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // États statistiques
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    projectLinked: 0
  });

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadTasks();
      loadProjects();
    }
  }, [user]);

  // Charger les tâches
  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('📋 Chargement tâches utilisateur:', user.uid);
      
      const userTasks = await taskService.getUserTasks(user.uid);
      console.log('✅ Tâches chargées:', userTasks.length);
      
      setTasks(userTasks);
      calculateStats(userTasks);
      
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les projets
  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      setProjects([]);
    }
  };

  // Calculer les statistiques
  const calculateStats = (taskList) => {
    const stats = {
      total: taskList.length,
      completed: taskList.filter(t => t.status === 'completed').length,
      inProgress: taskList.filter(t => t.status === 'in_progress').length,
      pending: taskList.filter(t => t.status === 'validation_pending').length,
      projectLinked: taskList.filter(t => t.projectId).length
    };
    setStats(stats);
  };

  // Gérer le succès de soumission de validation
  const handleValidationSubmissionSuccess = (result) => {
    console.log('✅ Validation soumise avec succès:', result);
    
    // Recharger les tâches pour afficher le nouveau statut
    loadTasks();
    
    // Message de succès (optionnel)
    // Vous pouvez ajouter un toast/notification ici
  };

  // Gérer le succès d'assignation
  const handleAssignmentSuccess = (result) => {
    console.log('✅ Assignation réussie:', result);
    
    // Recharger les tâches pour afficher les assignations
    loadTasks();
    
    // Fermer le modal
    setShowAssignmentModal(false);
    setSelectedTask(null);
  };

  // Associer une tâche à un projet
  const handleAssignToProject = async (projectId) => {
    if (!selectedTask) return;
    
    try {
      setUpdating(true);
      
      await taskProjectIntegration.assignTaskToProject(selectedTask.id, projectId);
      
      // Recharger les tâches
      await loadTasks();
      
      setShowProjectAssignModal(false);
      setSelectedTask(null);
      
    } catch (error) {
      console.error('❌ Erreur association tâche:', error);
      alert('Erreur lors de l\'association de la tâche au projet');
    } finally {
      setUpdating(false);
    }
  };

  // Désassocier une tâche d'un projet
  const handleUnassignFromProject = async (taskId) => {
    try {
      setUpdating(true);
      
      await taskProjectIntegration.unassignTaskFromProject(taskId);
      
      // Recharger les tâches
      await loadTasks();
      
    } catch (error) {
      console.error('❌ Erreur désassignation tâche:', error);
      alert('Erreur lors de la désassignation de la tâche');
    } finally {
      setUpdating(false);
    }
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Gestion des Tâches
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez et suivez vos tâches avec validation admin
          </p>
        </div>
        
        <button
          onClick={() => setShowTaskForm(true)}
          disabled={updating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Tâche
        </button>
      </div>

      {/* Statistiques avec validation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tâches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En validation</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Send className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Liées Projets</p>
              <p className="text-2xl font-bold text-purple-600">{stats.projectLinked}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
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
      </div>

      {/* Liste des tâches avec validation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Mes Tâches ({filteredTasks.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' ? 
                  'Aucune tâche ne correspond à vos critères de recherche.' :
                  'Vous n\'avez pas encore créé de tâche.'
                }
              </p>
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première tâche
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  
                  {/* Informations de la tâche */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {task.title}
                      </h4>
                      
                      {/* Badge de statut */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      
                      {/* Indicateurs d'assignation */}
                      {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 1 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <Users className="w-3 h-3 mr-1" />
                          {task.assignedTo.length} assignés
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(task.dueDate.toDate()).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      
                      {task.projectId && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          Projet lié
                        </span>
                      )}
                      
                      {task.difficulty && (
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {task.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 ml-4">
                    
                    {/* Bouton de validation - NOUVEAU */}
                    <SubmitTaskButton
                      task={task}
                      onSubmissionSuccess={handleValidationSubmissionSuccess}
                      size="default"
                    />
                    
                    {/* Bouton d'assignation multiple - NOUVEAU */}
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowAssignmentModal(true);
                      }}
                      disabled={updating}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Assigner à plusieurs personnes"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    
                    {/* Actions projet */}
                    {task.projectId ? (
                      <button
                        onClick={() => handleUnassignFromProject(task.id)}
                        disabled={updating}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Désassocier du projet"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowProjectAssignModal(true);
                        }}
                        disabled={updating}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Associer à un projet"
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                          taskService.deleteTask(task.id).then(() => loadTasks());
                        }
                      }}
                      disabled={updating}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Supprimer la tâche"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal de création de tâche */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouvelle Tâche</h2>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <TaskForm
                onSubmit={async (taskData) => {
                  try {
                    // 🔧 CORRECTION: Passer les deux paramètres comme attendu par le service
                    console.log('📝 Création tâche:', taskData);
                    const result = await taskService.createTask(taskData, user.uid);
                    
                    if (result.success) {
                      console.log('✅ Tâche créée avec succès');
                      setShowTaskForm(false);
                      loadTasks();
                    } else {
                      throw new Error(result.error || 'Erreur lors de la création');
                    }
                  } catch (error) {
                    console.error('❌ Erreur création tâche:', error);
                    alert('Erreur lors de la création de la tâche: ' + error.message);
                  }
                }}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal d'association à un projet */}
      {showProjectAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Associer à un projet</h2>
                <button
                  onClick={() => setShowProjectAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun projet disponible
                  </p>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleAssignToProject(project.id)}
                      disabled={updating}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-gray-900">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-gray-600 mt-1">{project.description}</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation multiple - NOUVEAU */}
      {showAssignmentModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onAssignmentSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default TasksPage;
