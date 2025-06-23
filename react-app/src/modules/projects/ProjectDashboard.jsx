// ==========================================
// 📁 react-app/src/modules/projects/ProjectDashboard.jsx
// Dashboard projets complet avec ProjectForm et toasts
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../shared/components/MainLayout.jsx';
import ProjectForm from './ProjectForm.jsx';
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useProjectActions } from '../../shared/hooks/useProjectActions.js';
import { useToast } from '../../shared/components/ToastNotification.jsx';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { 
    projects, 
    loading, 
    statusFilter, 
    searchTerm,
    setStatusFilter,
    setSearchTerm,
    loadUserProjects,
    subscribeToProjects,
    getFilteredProjects 
  } = useProjectStore();
  
  const { 
    handleCreateProject, 
    handleUpdateProject, 
    handleDeleteProject,
    handleProjectCompletion,
    handleProjectPause,
    handleProjectResume,
    handleArchiveProject,
    handleRestoreProject
  } = useProjectActions();

  // États locaux
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Charger les projets au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserProjects(user.uid);
      const unsubscribe = subscribeToProjects(user.uid);
      return unsubscribe;
    }
  }, [user?.uid]);

  // Projets filtrés
  const filteredProjects = getFilteredProjects();

  // Statistiques
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length,
    overdue: projects.filter(p => {
      if (!p.deadline || p.status === 'completed') return false;
      return new Date(p.deadline) < new Date();
    }).length
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleProjectSuccess = async (result) => {
    console.log('✅ Projet sauvegardé avec succès:', result);
    // Le toast sera affiché par useProjectActions
  };

  const handleCompleteProject = async (project) => {
    if (window.confirm(`Marquer "${project.name}" comme terminé ?`)) {
      await handleProjectCompletion(project.id, project.name);
    }
  };

  const handlePauseProject = async (project) => {
    if (window.confirm(`Mettre "${project.name}" en pause ?`)) {
      await handleProjectPause(project.id, project.name);
    }
  };

  const handleResumeProject = async (project) => {
    await handleProjectResume(project.id, project.name);
  };

  const handleDeleteProjectClick = async (project) => {
    if (window.confirm(`Supprimer définitivement "${project.name}" ?\n\nCette action est irréversible.`)) {
      await handleDeleteProject(project.id, project.name);
    }
  };

  const handleArchiveProjectClick = async (project) => {
    if (window.confirm(`Archiver "${project.name}" ?`)) {
      await handleArchiveProject(project.id, project.name);
    }
  };

  const handleRestoreProjectClick = async (project) => {
    await handleRestoreProject(project.id, project.name);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: '🟢 Actif', color: 'bg-green-100 text-green-800 border-green-200' },
      planning: { label: '🔵 Planification', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      paused: { label: '⏸️ En pause', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: '✅ Terminé', color: 'bg-green-100 text-green-800 border-green-200' },
      archived: { label: '📦 Archivé', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: '📝 Basse', color: 'text-gray-400' },
      medium: { label: '📌 Moyenne', color: 'text-blue-400' },
      high: { label: '⚡ Haute', color: 'text-orange-400' },
      urgent: { label: '🔥 Urgent', color: 'text-red-400' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getProjectActions = (project) => {
    const actions = [];

    // Action modifier (toujours disponible)
    actions.push(
      <button
        key="edit"
        onClick={() => handleEditProject(project)}
        className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
      >
        ✏️ Modifier
      </button>
    );

    // Actions selon le statut
    switch (project.status) {
      case 'active':
      case 'planning':
        actions.push(
          <button
            key="complete"
            onClick={() => handleCompleteProject(project)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            ✅ Terminer
          </button>
        );
        actions.push(
          <button
            key="pause"
            onClick={() => handlePauseProject(project)}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            ⏸️ Pause
          </button>
        );
        break;
        
      case 'paused':
        actions.push(
          <button
            key="resume"
            onClick={() => handleResumeProject(project)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ▶️ Reprendre
          </button>
        );
        actions.push(
          <button
            key="complete"
            onClick={() => handleCompleteProject(project)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            ✅ Terminer
          </button>
        );
        break;
        
      case 'completed':
        actions.push(
          <button
            key="archive"
            onClick={() => handleArchiveProjectClick(project)}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            📦 Archiver
          </button>
        );
        break;
        
      case 'archived':
        actions.push(
          <button
            key="restore"
            onClick={() => handleRestoreProjectClick(project)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            📂 Restaurer
          </button>
        );
        break;
    }

    // Action supprimer (toujours en dernier)
    actions.push(
      <button
        key="delete"
        onClick={() => handleDeleteProjectClick(project)}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        🗑️ Supprimer
      </button>
    );

    return actions;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              📁 Projets
              <span className="text-lg font-normal text-gray-500">
                ({filteredProjects.length})
              </span>
            </h1>
            <p className="text-gray-600">
              Gérez vos projets et suivez leur progression
            </p>
          </div>
          
          <button
            onClick={handleNewProject}
            className="mt-4 lg:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="text-xl">➕</span>
            Nouveau projet
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <span className="text-3xl">🟢</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terminés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En pause</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
              </div>
              <span className="text-3xl">⏸️</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En retard</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtre de statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">🟢 Actifs</option>
            <option value="planning">🔵 Planification</option>
            <option value="paused">⏸️ En pause</option>
            <option value="completed">✅ Terminés</option>
            <option value="archived">📦 Archivés</option>
          </select>
          
          {/* Toggle vue */}
          <div className="flex bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              🔲 Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              📋 Liste
            </button>
          </div>
        </div>

        {/* Liste des projets */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? 'Aucun projet' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'Créez votre premier projet pour commencer à organiser votre travail'
                : 'Essayez de modifier vos filtres de recherche'
              }
            </p>
            {projects.length === 0 && (
              <button
                onClick={handleNewProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Créer un projet
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span 
                      className="text-3xl flex-shrink-0"
                      style={{ color: project.color }}
                    >
                      {project.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {project.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(project.status)}
                        {project.priority && getPriorityBadge(project.priority)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{project.progress?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${project.progress?.percentage || 0}%`,
                        background: `linear-gradient(90deg, ${project.color}, ${project.color}dd)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{project.progress?.completed || 0} terminées</span>
                    <span>{project.progress?.total || 0} total</span>
                  </div>
                </div>
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Deadline */}
                {project.deadline && (
                  <div className="text-xs text-gray-500 mb-4">
                    📅 {new Date(project.deadline).toLocaleDateString('fr-FR')}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {getProjectActions(project)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal ProjectForm */}
        <ProjectForm
          isOpen={showProjectForm}
          onClose={handleCloseForm}
          editingProject={editingProject}
          onSuccess={handleProjectSuccess}
        />

      </div>
    </MainLayout>
  );
};

export default ProjectDashboard;
