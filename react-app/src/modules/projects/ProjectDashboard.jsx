// src/modules/projects/ProjectDashboard.jsx - Sans lucide-react
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../shared/stores/projectStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

export const ProjectDashboard = () => {
  const { 
    projects, 
    loading, 
    statusFilter, 
    setStatusFilter 
  } = useProjectStore();
  
  const { user } = useAuthStore();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Charger les projets au montage
  useEffect(() => {
    if (user?.uid) {
      useProjectStore.getState().loadUserProjects(user.uid);
    }
  }, [user?.uid, statusFilter]);

  // Filtrer les projets
  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  // Statistiques des projets
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length
  };

  // Ouvrir le formulaire d'édition
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Chargement des projets...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mes Projets</h2>
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>➕</span>
            Nouveau projet
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{projectStats.total}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
            <div className="text-sm text-green-700">Actifs</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{projectStats.completed}</div>
            <div className="text-sm text-purple-700">Terminés</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{projectStats.archived}</div>
            <div className="text-sm text-gray-700">Archivés</div>
          </div>
        </div>

        {/* Filtres et vue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🔍</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les projets</option>
              <option value="active">🟢 Actifs</option>
              <option value="completed">✅ Terminés</option>
              <option value="archived">📦 Archivés</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              📃
            </button>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-gray-400 text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun projet trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier projet !
          </p>
          <button
            onClick={() => setShowProjectForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>➕</span>
            Créer un projet
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{project.icon || '📁'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">
                    {project.status === 'active' ? '🟢 Actif' : 
                     project.status === 'completed' ? '✅ Terminé' : 
                     project.status === 'archived' ? '📦 Archivé' : project.status}
                  </p>
                </div>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              )}
              
              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{project.progress?.percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress?.percentage || 0}%` }}
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
                    <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{project.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              <button
                onClick={() => handleEditProject(project)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Gérer le projet
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal temporaire pour le formulaire */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-gray-600 mb-4">
                Le formulaire ProjectForm sera créé dans la prochaine session !
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Pour l'instant, vous pouvez voir l'interface des projets avec les données mock.
              </p>
              <button
                onClick={handleCloseForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
