// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION SAFE - Fix import TaskForm CORRIGÉ
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
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { projectService } from '../core/services/projectService.js';
import { taskProjectIntegration } from '../core/services/taskProjectIntegration.js';
// ✅ CORRECTION : Import depuis le bon chemin
import TaskForm from '../modules/tasks/TaskForm.jsx';

/**
 * ✅ FONCTION SAFE POUR AFFICHER LA PROGRESSION
 * Évite React Error #31 en gérant tous les types de données
 */
const getProgressDisplay = (progressData) => {
  // Si c'est null ou undefined
  if (!progressData) return 0;
  
  // Si c'est déjà un nombre
  if (typeof progressData === 'number') return Math.round(progressData);
  
  // Si c'est un objet avec percentage
  if (typeof progressData === 'object' && progressData.percentage !== undefined) {
    return Math.round(progressData.percentage);
  }
  
  // Si c'est un objet avec completed/total
  if (typeof progressData === 'object' && progressData.completed !== undefined && progressData.total !== undefined) {
    return progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0;
  }
  
  // Si c'est un string parseable
  if (typeof progressData === 'string') {
    const parsed = parseFloat(progressData);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }
  
  // Fallback sécurisé
  return 0;
};

/**
 * ✅ FONCTION SAFE POUR OBTENIR LE LABEL DE STATUT
 */
const getStatusLabel = (status) => {
  const statusMap = {
    'active': 'Actif',
    'completed': 'Terminé',
    'paused': 'En pause',
    'cancelled': 'Annulé'
  };
  return statusMap[status] || status || 'Non défini';
};

/**
 * 📝 PAGE DES TÂCHES - VERSION SAFE
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
  const [selectedTask, setSelectedTask] = useState(null);
  
  // États statistiques
  const [integrationStats, setIntegrationStats] = useState({
    totalTasks: 0,
    linkedTasks: 0,
    completedTasks: 0,
    activeProjects: 0
  });

  // Charger les données initiales
  useEffect(() => {
    if (user?.uid) {
      loadTasksAndProjects();
    }
  }, [user?.uid]);

  const loadTasksAndProjects = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement tâches et projets...');
      
      // Charger les tâches et projets en parallèle
      const [userTasks, userProjects] = await Promise.all([
        taskService.getUserTasks(user.uid),
        projectService.getUserProjects(user.uid)
      ]);
      
      setTasks(userTasks || []);
      setProjects(userProjects || []);
      
      // Calculer les statistiques d'intégration
      const stats = taskProjectIntegration.calculateIntegrationStats(userTasks || [], userProjects || []);
      setIntegrationStats(stats);
      
      console.log('✅ Données chargées:', {
        tâches: userTasks?.length || 0,
        projets: userProjects?.length || 0,
        stats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle tâche
  const handleCreateTask = async (taskData) => {
    setUpdating(true);
    try {
      console.log('➕ Création nouvelle tâche:', taskData);
      
      const result = await taskService.createTask(taskData, user.uid);
      
      if (result.success) {
        console.log('✅ Tâche créée avec succès');
        setShowTaskForm(false);
        await loadTasksAndProjects(); // Recharger les données
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }
    
    setUpdating(true);
    try {
      console.log('🗑️ Suppression tâche:', taskId);
      
      const result = await taskService.deleteTask(taskId, user.uid);
      
      if (result.success) {
        console.log('✅ Tâche supprimée avec succès');
        await loadTasksAndProjects();
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      alert('Erreur lors de la suppression de la tâche');
    } finally {
      setUpdating(false);
    }
  };

  // Assigner une tâche à un projet
  const handleAssignToProject = async (projectId) => {
    if (!selectedTask) return;
    
    setUpdating(true);
    try {
      console.log('🔗 Attribution tâche au projet:', { 
        taskId: selectedTask.id, 
        projectId 
      });
      
      const result = await taskProjectIntegration.linkTaskToProject(
        selectedTask.id, 
        projectId, 
        user.uid
      );
      
      if (result.success) {
        console.log('✅ Tâche assignée avec succès');
        setShowProjectAssignModal(false);
        setSelectedTask(null);
        await loadTasksAndProjects();
      } else {
        throw new Error(result.error || 'Erreur lors de l\'assignation');
      }
      
    } catch (error) {
      console.error('❌ Erreur assignation tâche:', error);
      alert('Erreur lors de l\'assignation de la tâche');
    } finally {
      setUpdating(false);
    }
  };

  // Désassigner une tâche d'un projet
  const handleUnlinkFromProject = async (taskId) => {
    setUpdating(true);
    try {
      console.log('🔓 Désassignation tâche du projet:', taskId);
      
      const result = await taskProjectIntegration.unlinkTaskFromProject(taskId, user.uid);
      
      if (result.success) {
        console.log('✅ Tâche désassignée avec succès');
        await loadTasksAndProjects();
      } else {
        throw new Error(result.error || 'Erreur lors de la désassignation');
      }
      
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
            Organisez et suivez vos tâches avec intégration projets
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

      {/* Statistiques d'intégration */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tâches</p>
              <p className="text-2xl font-bold text-gray-900">{integrationStats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Liées aux Projets</p>
              <p className="text-2xl font-bold text-gray-900">{integrationStats.linkedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Link className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{integrationStats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{integrationStats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
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
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="blocked">Bloquées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
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
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer ma première tâche
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const linkedProject = projects.find(p => p.id === task.projectId);
              
              return (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                        
                        {/* Badge de statut */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? 'Terminée' : 
                           task.status === 'in_progress' ? 'En cours' :
                           task.status === 'blocked' ? 'Bloquée' : 'En attente'}
                        </span>
                        
                        {/* Badge de priorité */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? 'Haute' : 
                           task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{task.estimatedTime}h</span>
                          </div>
                        )}
                        
                        {linkedProject && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{linkedProject.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {linkedProject ? (
                        <button
                          onClick={() => handleUnlinkFromProject(task.id)}
                          disabled={updating}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Désassigner du projet"
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
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Assigner à un projet"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={updating}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal d'assignation à un projet */}
      <AnimatePresence>
        {showProjectAssignModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigner à un projet
                </h3>
                <button
                  onClick={() => setShowProjectAssignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez un projet pour la tâche : <strong>{selectedTask.title}</strong>
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projects.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Aucun projet disponible</p>
                      <a 
                        href="/projects" 
                        className="text-blue-600 hover:text-blue-700 text-sm underline"
                      >
                        Créer un projet d'abord
                      </a>
                    </div>
                  ) : (
                    projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => handleAssignToProject(project.id)}
                        disabled={updating}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{project.title}</p>
                            <p className="text-sm text-gray-500">
                              {getStatusLabel(project.status)} • {getProgressDisplay(project.progress)}%
                            </p>
                          </div>
                          <Briefcase className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal création tâche */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
        loading={updating}
      />
    </div>
  );
};

export default TasksPage;
