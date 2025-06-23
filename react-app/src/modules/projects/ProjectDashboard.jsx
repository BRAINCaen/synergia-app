// ==========================================
// 📁 react-app/src/modules/projects/ProjectDashboard.jsx
// Dashboard projets CORRIGÉ avec tous les imports
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, Calendar, User, Target, Award } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects
import MainLayout from '../../layouts/MainLayout.jsx';
import ProjectForm from './ProjectForm.jsx';
import { useProjectStore } from '../../shared/stores/projectStore';
import { useAuthStore } from '../../shared/stores/authStore';

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
  const filteredProjects = getFilteredProjects ? getFilteredProjects() : projects;

  // Statistiques rapides
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => {
      if (!p.dueDate || p.status === 'completed') return false;
      const dueDate = p.dueDate.toDate ? p.dueDate.toDate() : new Date(p.dueDate);
      return dueDate < new Date();
    }).length
  };

  const handleCreateProject = () => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/20 text-green-400 border-green-500';
      case 'completed': return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'on_hold': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
      case 'cancelled': return 'bg-red-900/20 text-red-400 border-red-500';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🏗️ Mes Projets
              </h1>
              <p className="text-gray-400">
                Gérez et suivez l'avancement de vos projets
              </p>
            </div>
            
            <button
              onClick={handleCreateProject}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Nouveau Projet</span>
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Target className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Actifs</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <Calendar className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Terminés</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
                </div>
                <Award className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En retard</p>
                  <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                </div>
                <User className="text-red-400" size={24} />
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtre par statut */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="completed">Terminés</option>
                <option value="on_hold">En pause</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <Target className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">
              {projects.length === 0 ? 'Aucun projet créé' : 'Aucun projet trouvé'}
            </h3>
            <p className="text-gray-400 mb-4">
              {projects.length === 0 
                ? 'Commencez par créer votre premier projet.' 
                : 'Essayez de modifier vos filtres de recherche.'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Créer mon premier projet</span>
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                
                {/* En-tête projet */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                    {project.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Filter size={16} />
                  </button>
                </div>

                {/* Statut et progression */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? 'Actif' :
                       project.status === 'completed' ? 'Terminé' :
                       project.status === 'on_hold' ? 'En pause' :
                       project.status === 'cancelled' ? 'Annulé' :
                       project.status}
                    </span>
                    
                    {project.priority && (
                      <span className={`text-xs font-medium ${
                        project.priority === 'high' ? 'text-red-400' :
                        project.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        Priorité {project.priority}
                      </span>
                    )}
                  </div>

                  {/* Progression */}
                  {project.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">Progression</span>
                        <span className="text-white text-sm font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    {project.startDate && (
                      <span>Début: {formatDate(project.startDate)}</span>
                    )}
                    {project.dueDate && (
                      <span className={
                        new Date(project.dueDate.toDate ? project.dueDate.toDate() : project.dueDate) < new Date() && project.status !== 'completed'
                          ? 'text-red-400 font-medium'
                          : ''
                      }>
                        Échéance: {formatDate(project.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Statistiques tâches */}
                  {project.taskStats && (
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
                      <span className="text-gray-400">Tâches:</span>
                      <div className="flex space-x-4">
                        <span className="text-green-400">{project.taskStats.completed || 0} ✓</span>
                        <span className="text-yellow-400">{project.taskStats.inProgress || 0} 🔄</span>
                        <span className="text-gray-400">{project.taskStats.todo || 0} 📋</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal ProjectForm */}
        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onClose={handleCloseForm}
            onSave={() => {
              handleCloseForm();
              // Recharger si nécessaire
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDashboard;
