// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC ASSIGNATION AUX PROJETS
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

  const handleBulkAssign = async (projectId) => {
    if (selectedTasks.length === 0) return;
    
    setUpdating(true);
    try {
      console.log(`🔄 Assignation en masse: ${selectedTasks.length} tâches`);
      
      await taskProjectIntegration.bulkAssignTasksToProject(selectedTasks, projectId, user.uid);
      
      // Mettre à jour la liste locale
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task.id)
          ? { ...task, projectId: projectId }
          : task
      ));
      
      setSelectedTasks([]);
      await loadIntegrationStats();
      
      alert(`✅ ${selectedTasks.length} tâches assignées au projet !`);
      
    } catch (error) {
      console.error('❌ Erreur assignation masse:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Supprimer la tâche "${task.title}" ?`)) return;
    
    try {
      await taskService.deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      
      // Mettre à jour la progression du projet si nécessaire
      if (task.projectId) {
        await taskProjectIntegration.updateProjectProgress(task.projectId);
      }
      
      await loadIntegrationStats();
      alert('✅ Tâche supprimée');
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Projet inconnu';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      validation_pending: 'bg-orange-500'
    };
    return colors[status] || colors.todo;
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: 'À faire',
      in_progress: 'En cours',
      completed: 'Terminé',
      validation_pending: 'En validation'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.normal;
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || 
                          (projectFilter === 'unassigned' && !task.projectId) ||
                          (projectFilter === 'assigned' && task.projectId) ||
                          task.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    assigned: tasks.filter(t => t.projectId).length,
    unassigned: tasks.filter(t => !t.projectId).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des tâches...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            Gestion des Tâches
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez vos tâches et assignez-les à vos projets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedTasks.length} sélectionnée(s)
              </span>
              <select
                onChange={(e) => e.target.value && handleBulkAssign(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                disabled={updating}
              >
                <option value="">Assigner au projet...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">À faire</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.todo}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600">En cours</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-600">Terminé</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-600">Assignées</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.assigned}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Unlink className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-600">Libres</p>
              <p className="text-lg font-bold text-gray-900">{taskStats.unassigned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles de filtrage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="validation_pending">En validation</option>
            </select>
            
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous projets</option>
              <option value="assigned">Assignées</option>
              <option value="unassigned">Non assignées</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all' 
              ? 'Aucune tâche trouvée' 
              : 'Aucune tâche créée'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' || projectFilter !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Créez votre première tâche pour commencer'}
          </p>
          {(!searchTerm && statusFilter === 'all' && projectFilter === 'all') && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer ma première tâche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                
                {/* Checkbox sélection */}
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTasks(prev => [...prev, task.id]);
                    } else {
                      setSelectedTasks(prev => prev.filter(id => id !== task.id));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                
                {/* Indicateur statut */}
                <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                
                {/* Contenu principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    
                    {/* Indicateur priorité */}
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' && '🔴 URGENT'}
                      {task.priority === 'high' && '🔶 HAUTE'}
                      {task.priority === 'normal' && '🔸 NORMALE'}
                      {task.priority === 'low' && '🔹 BASSE'}
                    </span>
                    
                    {/* Statut */}
                    <span className="text-xs text-gray-500">
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {/* Projet assigné */}
                    {task.projectId ? (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Briefcase className="w-3 h-3" />
                        <span>{getProjectName(task.projectId)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Unlink className="w-3 h-3" />
                        <span>Non assignée</span>
                      </div>
                    )}
                    
                    {/* Date d'échéance */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    
                    {/* Temps estimé */}
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedTime}h</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  
                  {/* Assigner/Désassigner projet */}
                  {task.projectId ? (
                    <button
                      onClick={() => handleRemoveFromProject(task)}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Retirer du projet"
                      disabled={updating}
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowProjectAssignModal(true);
                      }}
                      className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Assigner à un projet"
                      disabled={updating}
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Supprimer */}
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL ASSIGNATION PROJET */}
      <AnimatePresence>
        {showProjectAssignModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProjectAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigner à un projet
                </h3>
                <button
                  onClick={() => setShowProjectAssignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tâche :</p>
                  <p className="font-medium text-gray-900">{selectedTask.title}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Sélectionnez un projet :
                  </p>
                  
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

      {/* MODAL CRÉATION TÂCHE */}
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
