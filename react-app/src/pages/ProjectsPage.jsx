// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// Page complète de gestion des projets
// ==========================================

import React, { useState } from 'react';
import { useProjectStore, useTaskStore, useAuthStore } from '../shared/stores';

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const { projects, addProject, updateProject, deleteProject, getProjectStats } = useProjectStore();
  const { tasks } = useTaskStore();
  
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
    status: 'active'
  });

  const stats = getProjectStats();

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const projectToAdd = {
      ...newProject,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
      progress: 0
    };

    addProject(projectToAdd);
    
    // Reset form
    setNewProject({
      name: '',
      description: '',
      deadline: '',
      status: 'active'
    });
    setShowForm(false);
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteProject(projectId);
    }
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const calculateProgress = (projectId) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Projets</h1>
        <p className="text-gray-600">Organisez vos tâches en projets et suivez leur progression</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏸️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En pause</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Nouveau projet
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouveau projet</h3>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du projet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Description du projet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date limite
                </label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Créer le projet
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des projets */}
      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📁</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-500 mb-6">Créez votre premier projet pour organiser vos tâches</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Créer mon premier projet
            </button>
          </div>
        ) : (
          projects.map((project) => {
            const projectTasks = getProjectTasks(project.id);
            const progress = calculateProgress(project.id);
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status === 'active' ? 'Actif' : project.status === 'paused' ? 'En pause' : 'Terminé'}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 mb-3">{project.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
                        {project.deadline && (
                          <span>Échéance: {new Date(project.deadline).toLocaleDateString()}</span>
                        )}
                        <span>{projectTasks.length} tâches</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {project.status === 'active' && (
                        <button
                          onClick={() => updateProject(project.id, { status: 'paused' })}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          ⏸️ Pause
                        </button>
                      )}
                      
                      {project.status === 'paused' && (
                        <button
                          onClick={() => updateProject(project.id, { status: 'active' })}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          ▶️ Reprendre
                        </button>
                      )}
                      
                      {project.status !== 'completed' && progress === 100 && (
                        <button
                          onClick={() => updateProject(project.id, { status: 'completed' })}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          ✅ Terminer
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tâches du projet */}
                  {projectTasks.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Tâches du projet ({projectTasks.length})
                      </h4>
                      <div className="space-y-2">
                        {projectTasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className={`w-2 h-2 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`}></span>
                              <span className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {task.title}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              task.priority === 'high' ? 'bg-red-100 text-red-600' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                          </div>
                        ))}
                        {projectTasks.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            et {projectTasks.length - 3} autres tâches...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
