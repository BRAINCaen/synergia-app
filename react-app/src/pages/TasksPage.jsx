// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION SAFE - Fix React Error #31
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
import TaskForm from '../components/tasks/TaskForm.jsx';

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
    tasksWithProject: 0,
    tasksWithoutProject: 0,
    integrationRate: 0
  });

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user?.uid]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔄 Chargement données tâches et projets...');
      
      // Charger tâches et projets en parallèle
      const [userTasks, userProjects] = await Promise.all([
        taskService.getUserTasks(user.uid),
        projectService.getUserProjects(user.uid)
      ]);
      
      setTasks(userTasks || []);
      setProjects(userProjects || []);
      
      // Charger les statistiques
      await loadIntegrationStats();
      
      console.log('✅ Données chargées:', {
        tâches: userTasks?.length || 0,
        projets: userProjects?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationStats = async () => {
    if (!user?.uid) return;
    
    try {
      const stats = await taskProjectIntegration.getIntegrationStats(user.uid);
      setIntegrationStats(stats || {
        totalTasks: 0,
        tasksWithProject: 0,
        tasksWithoutProject: 0,
        integrationRate: 0
      });
    } catch (error) {
      console.error('❌ Erreur statistiques intégration:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!user?.uid) {
      alert('Vous devez être connecté pour créer une tâche');
      return;
    }
    
    setUpdating(true);
    try {
      console.log('📝 Création tâche avec projet:', taskData);
      
      const newTask = await taskService.createTask(taskData, user.uid);
      
      // Si la tâche est assignée à un projet, mettre à jour la progression
      if (taskData.projectId) {
        await taskProjectIntegration.updateProjectProgressSafe(taskData.projectId);
      }
      
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      
      await loadIntegrationStats();
      
      console.log('✅ Tâche créée avec succès');
      alert('✅ Tâche créée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignToProject = async (projectId) => {
    if (!selectedTask || !projectId) return;
    
    setUpdating(true);
    try {
      console.log(`🔗 [SAFE] Assignation tâche ${selectedTask.id} au projet ${projectId}`);
      
      const result = await taskProjectIntegration.assignTaskToProject(selectedTask.id, projectId, user.uid);
      
      if (result.success) {
        // Mettre à jour la liste locale
        setTasks(prev => prev.map(task => 
          task.id === selectedTask.id 
            ? { ...task, projectId: projectId }
            : task
        ));
        
        setShowProjectAssignModal(false);
        setSelectedTask(null);
        
        await loadIntegrationStats();
        
        alert('✅ Tâche assignée au projet !');
      } else {
        throw new Error(result.error || 'Erreur assignation');
      }
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur assignation:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromProject = async (task) => {
    if (!confirm(`Retirer "${task.title}" de son projet ?`)) return;
    
    setUpdating(true);
    try {
      console.log(`🗑️ [SAFE] Retrait tâche ${task.id} du projet`);
      
      const result = await taskProjectIntegration.removeTaskFromProject(task.id, user.uid);
      
      if (result.success) {
        // Mettre à jour la liste locale
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, projectId: null }
            : t
        ));
        
        await loadIntegrationStats();
        
        alert('✅ Tâche retirée du projet !');
      } else {
        throw new Error(result.error || 'Erreur retrait');
      }
      
    } catch (error) {
      console.error('❌ [SAFE] Erreur retrait:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!confirm(`Supprimer définitivement "${task.title}" ?`)) return;
    
    setUpdating(true);
    try {
      await taskService.deleteTask(taskId, user.uid);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await loadIntegrationStats();
      alert('✅ Tâche supprimée !');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                          task.status === statusFilter ||
                          (statusFilter === 'with_project' && task.projectId) ||
                          (statusFilter === 'without_project' && !task.projectId);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📝 Mes Tâches</h1>
              <p className="text-gray-600">
                {filteredTasks.length} tâche(s) • {integrationStats.integrationRate}% assignées à des projets
              </p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
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
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les tâches</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="with_project">Avec projet</option>
              <option value="without_project">Sans projet</option>
            </select>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg shadow">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune tâche ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre première tâche.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer ma première tâche
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}

                      {/* Métadonnées */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? 'Terminée' :
                             task.status === 'in_progress' ? 'En cours' : 'À faire'}
                          </span>
                        </div>

                        {task.projectId && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>
                              {projects.find(p => p.id === task.projectId)?.title || 'Projet inconnu'}
                            </span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{task.estimatedTime}h</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {task.projectId ? (
                        <button
                          onClick={() => handleRemoveFromProject(task)}
                          disabled={updating}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Unlink className="w-4 h-4" />
                          Retirer du projet
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowProjectAssignModal(true);
                          }}
                          disabled={updating || projects.length === 0}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <Link className="w-4 h-4" />
                          Assigner
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={updating}
                        className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'assignation de projet */}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assigner à un projet
                  </h3>
                  <button
                    onClick={() => {
                      setShowProjectAssignModal(false);
                      setSelectedTask(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Tâche : <strong>{selectedTask.title}</strong>
                </p>
                
                <div className="space-y-2">
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
