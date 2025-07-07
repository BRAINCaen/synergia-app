// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE ET FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  Link,
  Unlink,
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { projectService } from '../core/services/projectService.js';
import { taskProjectIntegration } from '../core/services/taskProjectIntegration.js';
import TaskForm from '../modules/tasks/TaskForm.jsx';

/**
 * ✅ PAGE TÂCHES AVEC GESTION DE PROJETS
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
  const [projectFilter, setProjectFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectAssignModal, setShowProjectAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // États intégration
  const [integrationStats, setIntegrationStats] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Charger toutes les données
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      loadIntegrationStats();
    }
  }, [user?.uid]);

  const loadAllData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔄 Chargement données tâches et projets...');
      
      const [userTasks, userProjects] = await Promise.all([
        taskService.getUserTasks(user.uid),
        projectService.getUserProjects(user.uid)
      ]);
      
      setTasks(userTasks || []);
      setProjects(userProjects || []);
      
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
      setIntegrationStats(stats);
    } catch (error) {
      console.error('❌ Erreur statistiques intégration:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!user?.uid) {
      alert('Vous devez être connecté pour créer une tâche');
      return;
    }
    
    try {
      console.log('📝 Création tâche avec projet:', taskData);
      
      const newTask = await taskService.createTask(taskData, user.uid);
      
      // Si la tâche est assignée à un projet, mettre à jour la progression
      if (taskData.projectId) {
        await taskProjectIntegration.updateProjectProgress(taskData.projectId);
      }
      
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      
      await loadIntegrationStats();
      
      console.log('✅ Tâche créée avec succès');
      alert('✅ Tâche créée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const handleAssignToProject = async (projectId) => {
    if (!selectedTask || !projectId) return;
    
    setUpdating(true);
    try {
      console.log(`🔗 Assignation tâche ${selectedTask.id} au projet ${projectId}`);
      
      await taskProjectIntegration.assignTaskToProject(selectedTask.id, projectId, user.uid);
      
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
      
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromProject = async (task) => {
    if (!confirm(`Retirer "${task.title}" de son projet ?`)) return;
    
    setUpdating(true);
    try {
      console.log(`🗑️ Retrait tâche ${task.id} du projet`);
      
      await taskProjectIntegration.removeTaskFromProject(task.id, user.uid);
      
      // Mettre à jour la liste locale
      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, projectId: null }
          : t
      ));
      
      await loadIntegrationStats();
      
      alert('✅ Tâche retirée du projet !');
      
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    setUpdating(true);
    try {
      const result = await taskService.deleteTask(taskId, user.uid);
      
      if (result.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        await loadIntegrationStats();
        alert('✅ Tâche supprimée avec succès !');
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'validation_pending': 'En validation',
      'completed': 'Terminé',
      'rejected': 'Rejeté',
      'todo': 'À faire',
      'done': 'Terminé',
      'active': 'Actif'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'in_progress': 'text-blue-600 bg-blue-100',
      'validation_pending': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100',
      'todo': 'text-gray-600 bg-gray-100',
      'done': 'text-green-600 bg-green-100',
      'active': 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'normal': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || 
                          (projectFilter === 'unassigned' && !task.projectId) ||
                          task.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Tâches</h1>
          <p className="text-gray-600">Organisez vos tâches et assignez-les à vos projets</p>
        </div>

        {/* Statistiques d'intégration */}
        {integrationStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{integrationStats.totalTasks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">À faire</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.filter(t => t.status === 'pending' || t.status === 'todo').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Terminé</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.filter(t => t.status === 'completed' || t.status === 'done').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Assignées</p>
                  <p className="text-2xl font-semibold text-gray-900">{integrationStats.assignedTasks}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barre d'outils */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtres */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous projets</option>
                <option value="unassigned">Non assignées</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton nouvelle tâche */}
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Tâche
            </button>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500 mb-4">
                {tasks.length === 0 
                  ? "Créez votre première tâche pour commencer"
                  : "Aucune tâche ne correspond à vos filtres"
                }
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer une tâche
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        {task.priority && (
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                              {getStatusLabel(project.status)} • {project.progress || 0}%
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
