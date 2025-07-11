// ==========================================
// 📁 react-app/src/modules/projects/ProjectDetailView.jsx
// Vue détaillée d'un projet avec gestion des tâches
// ==========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useTaskStore } from '../../shared/stores/taskStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { TaskForm } from '../tasks/TaskForm.jsx';
import { TaskCard } from '../tasks/TaskCard.jsx';

const ProjectDetailView = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjectStore();
  const { 
    tasks, 
    createTask, 
    updateTask, 
    deleteTask,
    loadUserTasks 
  } = useTaskStore();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  // Charger le projet et ses tâches
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Trouver le projet
        const foundProject = projects.find(p => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
        } else {
          navigate('/projects');
          return;
        }

        // Charger toutes les tâches de l'utilisateur
        if (user?.uid) {
          await loadUserTasks(user.uid);
        }
      } catch (error) {
        console.error('Erreur chargement projet:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, projects, user?.uid, loadUserTasks, navigate]);

  // Filtrer les tâches du projet
  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.projectId === projectId);
    setProjectTasks(filteredTasks);
  }, [tasks, projectId]);

  // Calculer les statistiques du projet
  const getProjectStats = () => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = projectTasks.filter(t => t.status === 'todo').length;
    const overdueTasks = projectTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  // Fermer le formulaire
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  // Marquer le projet comme terminé
  const handleCompleteProject = async () => {
    if (!project) return;
    
    try {
      await updateProject(project.id, {
        status: project.status === 'completed' ? 'active' : 'completed'
      });
    } catch (error) {
      console.error('Erreur mise à jour statut projet:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Chargement du projet...
          </div>
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
        {/* Header du projet */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Banner avec couleur du projet */}
          <div 
            className="h-32 relative"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{project.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-600 text-white' :
                      project.status === 'active' ? 'bg-blue-600 text-white' :
                      project.status === 'paused' ? 'bg-yellow-600 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {project.status === 'completed' ? '✅ Terminé' :
                       project.status === 'active' ? '🟢 Actif' :
                       project.status === 'paused' ? '⏸️ En pause' :
                       '📦 Archivé'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority === 'urgent' ? 'bg-red-600 text-white' :
                      project.priority === 'high' ? 'bg-orange-600 text-white' :
                      project.priority === 'medium' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {project.priority === 'urgent' ? '🔥 Urgent' :
                       project.priority === 'high' ? '⚡ Haute' :
                       project.priority === 'medium' ? '📌 Moyenne' :
                       '📝 Basse'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu du header */}
          <div className="p-6">
            {/* Description */}
            {project.description && (
              <p className="text-gray-300 mb-4">{project.description}</p>
            )}

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progression</span>
                <span className="text-sm font-medium text-white">{stats.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>➕</span>
                Nouvelle tâche
              </button>
              
              <button
                onClick={handleCompleteProject}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  project.status === 'completed'
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {project.status === 'completed' ? (
                  <>
                    <span>🔄</span>
                    Réactiver
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Marquer terminé
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span>←</span>
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-sm text-gray-400">Terminées</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgressTasks}</div>
            <div className="text-sm text-gray-400">En cours</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats.todoTasks}</div>
            <div className="text-sm text-gray-400">À faire</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.overdueTasks}</div>
            <div className="text-sm text-gray-400">En retard</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'tasks', label: '📋 Tâches', count: stats.totalTasks },
                { id: 'info', label: '📊 Informations', count: null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-700 text-gray-300 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {projectTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Aucune tâche dans ce projet
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Commencez par créer votre première tâche !
                    </p>
                    <button
                      onClick={handleCreateTask}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>➕</span>
                      Créer une tâche
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Grouper les tâches par statut */}
                    {['todo', 'in_progress', 'completed'].map(status => {
                      const statusTasks = projectTasks.filter(task => task.status === status);
                      if (statusTasks.length === 0) return null;

                      const statusLabels = {
                        todo: '📝 À faire',
                        in_progress: '🔄 En cours',
                        completed: '✅ Terminé'
                      };

                      return (
                        <div key={status}>
                          <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                            {statusLabels[status]}
                            <span className="text-sm text-gray-400">({statusTasks.length})</span>
                          </h4>
                          <div className="space-y-2">
                            {statusTasks.map(task => (
                              <TaskCard 
                                key={task.id} 
                                task={task} 
                                onEdit={handleEditTask}
                                showProject={false}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">📋 Détails</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créé le :</span>
                        <span className="text-white">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière mise à jour :</span>
                        <span className="text-white">
                          {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                      {project.deadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Échéance :</span>
                          <span className="text-white">
                            {new Date(project.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {project.budget && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Budget :</span>
                          <span className="text-white">{project.budget}€</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">🏷️ Tags</h4>
                    {project.tags && project.tags.length > 0 ? (
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
                    ) : (
                      <p className="text-gray-400">Aucun tag défini</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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
