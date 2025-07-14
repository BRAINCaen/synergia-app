// ==========================================
// 📁 react-app/src/modules/projects/ProjectDetailView.jsx
// Vue détaillée d'un projet avec VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import { projectService } from '../../core/services/projectService.js';
import { taskService } from '../../core/services/taskService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { TaskForm } from '../tasks/TaskForm.jsx';
import { TaskCard } from '../tasks/TaskCard.jsx';

const ProjectDetailView = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [error, setError] = useState(null);

  // ✅ CHARGER DIRECTEMENT DEPUIS FIREBASE
  useEffect(() => {
    if (projectId && user?.uid) {
      loadProjectData();
    }
  }, [projectId, user?.uid]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [PROJECT-DETAIL] Chargement projet depuis Firebase:', projectId);
      
      // 1. Charger le projet depuis Firebase directement
      const projectData = await projectService.getProject(projectId);
      
      if (!projectData) {
        console.error('❌ [PROJECT-DETAIL] Projet non trouvé:', projectId);
        setError('Projet introuvable');
        navigate('/projects');
        return;
      }
      
      console.log('✅ [PROJECT-DETAIL] Projet chargé:', projectData.title);
      setProject(projectData);
      
      // 2. Charger les tâches du projet depuis Firebase
      console.log('🔄 [PROJECT-DETAIL] Chargement tâches du projet...');
      const tasks = await taskService.getTasksByProject(projectId);
      
      console.log('✅ [PROJECT-DETAIL] Tâches chargées:', tasks.length);
      setProjectTasks(tasks || []);
      
    } catch (error) {
      console.error('❌ [PROJECT-DETAIL] Erreur chargement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques du projet avec les vraies données
  const getProjectStats = () => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = projectTasks.filter(t => t.status === 'todo').length;
    const overdueTasks = projectTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const progressPercentage = totalTasks > 0 ? 
      Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      progressPercentage
    };
  };

  // Créer une nouvelle tâche directement dans le projet
  const handleCreateTask = () => {
    setEditingTask({
      projectId: projectId,
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    });
    setShowTaskForm(true);
  };

  // Éditer une tâche existante
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Fermer le formulaire et recharger les tâches
  const handleCloseTaskForm = async () => {
    setShowTaskForm(false);
    setEditingTask(null);
    
    // Recharger les tâches du projet pour voir les changements
    try {
      console.log('🔄 [PROJECT-DETAIL] Rechargement tâches après modification...');
      const updatedTasks = await taskService.getTasksByProject(projectId);
      setProjectTasks(updatedTasks || []);
    } catch (error) {
      console.error('❌ [PROJECT-DETAIL] Erreur rechargement tâches:', error);
    }
  };

  // Marquer le projet comme terminé
  const handleCompleteProject = async () => {
    if (!project) return;
    
    try {
      console.log('🔄 [PROJECT-DETAIL] Changement statut projet...');
      
      const newStatus = project.status === 'completed' ? 'active' : 'completed';
      const result = await projectService.updateProject(project.id, {
        status: newStatus
      });
      
      if (result.success) {
        setProject(prev => ({ ...prev, status: newStatus }));
        console.log('✅ [PROJECT-DETAIL] Statut projet mis à jour');
      }
      
    } catch (error) {
      console.error('❌ [PROJECT-DETAIL] Erreur mise à jour statut:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Chargement du projet depuis Firebase...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-white mb-4">Erreur</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux projets
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-white mb-4">Projet introuvable</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour aux projets
          </button>
        </div>
      </MainLayout>
    );
  }

  const stats = getProjectStats();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header du projet avec vraies données */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Banner avec couleur du projet */}
          <div 
            className="h-32 relative"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{project.icon || '📂'}</span>
                <div>
                  <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-600 text-white' :
                      project.status === 'active' ? 'bg-blue-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {project.status === 'completed' ? '✅ Terminé' :
                       project.status === 'active' ? '🚀 Actif' : '⏸️ En pause'}
                    </span>
                    
                    <span className="text-white text-sm">
                      🎯 {stats.progressPercentage}% terminé
                    </span>
                    
                    <span className="text-white text-sm">
                      📋 {stats.totalTasks} tâche(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions du projet */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'tasks' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📋 Tâches ({stats.totalTasks})
                </button>
                
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'stats' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📊 Statistiques
                </button>
                
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'info' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ℹ️ Informations
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ➕ Nouvelle tâche
                </button>
                
                <button
                  onClick={handleCompleteProject}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    project.status === 'completed'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {project.status === 'completed' ? '🔄 Réactiver' : '✅ Terminer'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  📋 Tâches du projet ({projectTasks.length})
                </h3>
                
                {/* Debug info pour vérifier les données */}
                <div className="text-xs text-gray-500">
                  ID: {projectId} • Firebase: {projectTasks.length} tâche(s)
                </div>
              </div>

              {projectTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Aucune tâche pour ce projet
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Commencez par créer votre première tâche
                  </p>
                  <button
                    onClick={handleCreateTask}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ➕ Créer une tâche
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {projectTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onStatusChange={() => handleCloseTaskForm()} // Recharger après changement
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">📊 Statistiques du projet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white">📋</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total tâches</p>
                      <p className="text-white text-xl font-bold">{stats.totalTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white">✅</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Terminées</p>
                      <p className="text-white text-xl font-bold">{stats.completedTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <span className="text-white">🔄</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">En cours</p>
                      <p className="text-white text-xl font-bold">{stats.inProgressTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white">⚠️</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">En retard</p>
                      <p className="text-white text-xl font-bold">{stats.overdueTasks}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-medium text-white mb-4">🎯 Progression globale</h4>
                <div className="w-full bg-gray-600 rounded-full h-3 mb-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>
                <p className="text-center text-white font-medium">
                  {stats.progressPercentage}% complété ({stats.completedTasks}/{stats.totalTasks} tâches)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">ℹ️ Informations du projet</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">📝 Description</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300">
                      {project.description || 'Aucune description disponible'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-white mb-3">📊 Détails</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créé le :</span>
                        <span className="text-white">
                          {project.createdAt ? 
                            new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière mise à jour :</span>
                        <span className="text-white">
                          {project.updatedAt ? 
                            new Date(project.updatedAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Statut :</span>
                        <span className="text-white">{project.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Priorité :</span>
                        <span className="text-white">{project.priority}</span>
                      </div>
                      {project.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Catégorie :</span>
                          <span className="text-white">{project.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-white mb-3">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de tâche */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseTaskForm}
          onSave={handleCloseTaskForm}
        />
      )}
    </MainLayout>
  );
};

export default ProjectDetailView;
