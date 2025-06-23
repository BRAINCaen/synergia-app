// ==========================================
// 📁 react-app/src/modules/projects/ProjectDashboard.jsx
// Version CORRIGÉE avec bon import MainLayout
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx'; // ✅ CORRIGÉ: bon chemin
// import ProjectForm from './ProjectForm.jsx'; // TODO: Décommenter quand créé
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
// import { useProjectActions } from '../../shared/hooks/useProjectActions.js'; // TODO: Décommenter quand créé
// import { useToast } from '../../shared/components/ToastNotification.jsx'; // TODO: Décommenter quand créé

const ProjectDashboard = () => {
  const navigate = useNavigate();
  // const { toast } = useToast(); // TODO: Décommenter quand ToastNotification créé
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
  
  // const { handleCreateProject, handleUpdateProject, handleDeleteProject } = useProjectActions(); // TODO

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

  // Projets filtrés (utilise la méthode du store si disponible, sinon filtre basique)
  const filteredProjects = getFilteredProjects ? getFilteredProjects() : projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
              value={searchTerm || ''}
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
                
                {/* Actions temporaires */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => alert('Fonctionnalité à venir!')}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    👀 Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal temporaire */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-gray-600 mb-4 font-semibold">
                  Interface en cours de développement
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Le ProjectForm complet sera bientôt disponible !
                </p>
                <button
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ProjectDashboard;
