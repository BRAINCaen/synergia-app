// ==========================================
// 📁 react-app/src/modules/projects/ProjectDashboard.jsx
// Dashboard projets CORRIGÉ avec ProjectForm intégré
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import ProjectForm from './ProjectForm.jsx'; // ✅ Import du ProjectForm corrigé
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

const ProjectDashboard = () => {
  const navigate = useNavigate();
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

  // États locaux
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Charger les projets au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserProjects(user.uid);
      const unsubscribe = subscribeToProjects(user.uid);
      return unsubscribe;
    }
  }, [user?.uid, loadUserProjects, subscribeToProjects]);

  // Projets filtrés
  const filteredProjects = getFilteredProjects ? 
    getFilteredProjects() : 
    projects.filter(project => {
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

  // ==========================================
  // 🎯 HANDLERS PROJETS
  // ==========================================

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

  const handleProjectSuccess = (project) => {
    console.log('✅ Projet traité avec succès:', project);
    handleCloseForm();
    // Optionnel: recharger les projets si nécessaire
    if (user?.uid) {
      loadUserProjects(user.uid);
    }
  };

  // ==========================================
  // 🎨 HELPER FUNCTIONS
  // ==========================================

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

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  // Loading state
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
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
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
                ? 'Créez votre premier projet pour commencer !'
                : 'Aucun projet ne correspond à vos critères de recherche.'}
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
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.icon || '📊'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.description?.substring(0, 100)}
                        {project.description?.length > 100 && '...'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditProject(project)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    ✏️ Modifier
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Statut */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Statut:</span>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Progression */}
                  {project.progress && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progression:</span>
                        <span className="font-medium">{project.progress.percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(project.progress.percentage || 0)}`}
                          style={{ width: `${project.progress.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Date d'échéance */}
                  {project.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Échéance:</span>
                      <span className={`font-medium ${
                        new Date(project.deadline) < new Date() && project.status !== 'completed'
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {formatDate(project.deadline)}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ ProjectForm Modal */}
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
