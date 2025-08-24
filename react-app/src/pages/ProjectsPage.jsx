// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PAGE PROJETS AVEC DESIGN PREMIUM - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Settings,
  Users,
  Calendar,
  Target,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useProjectService } from '../shared/hooks/useProjectService.js';
import ProjectForm from '../components/forms/ProjectForm.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

/**
 * 📁 PAGE PROJETS PREMIUM
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjectService();

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques des projets
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length
  };

  /**
   * 🎨 GESTIONNAIRES D'ÉVÉNEMENTS
   */
  const handleCreateProject = async (projectData) => {
    try {
      await createProject(projectData);
      setShowCreateModal(false);
      console.log('✅ Projet créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      await updateProject(selectedProject.id, projectData);
      setShowEditModal(false);
      setSelectedProject(null);
      console.log('✅ Projet modifié avec succès');
    } catch (error) {
      console.error('❌ Erreur modification projet:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      await deleteProject(projectId);
      console.log('✅ Projet supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  /**
   * 🎨 COMPOSANT CARTE DE STATISTIQUES
   */
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  /**
   * 🎨 COMPOSANT CARTE PROJET
   */
  const ProjectCard = ({ project }) => {
    const getStatusIcon = (status) => {
      const icons = {
        active: <PlayCircle className="w-4 h-4 text-green-400" />,
        completed: <CheckCircle className="w-4 h-4 text-blue-400" />,
        planning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
        paused: <XCircle className="w-4 h-4 text-gray-400" />
      };
      return icons[status] || icons.planning;
    };

    const getStatusColor = (status) => {
      const colors = {
        active: 'bg-green-500/20 text-green-300 border-green-500/30',
        completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        planning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        paused: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
      return colors[status] || colors.planning;
    };

    const progress = project.tasks ? 
      Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Header avec statut */}
        <div className="p-6 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(project.status)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                title="Voir"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEditModal(project)}
                className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Éditer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {project.description || 'Aucune description disponible'}
          </p>

          {/* Barre de progression */}
          {project.tasks && project.tasks.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Progression</span>
                <span className="text-xs text-gray-300">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer avec métadonnées */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{project.teamMembers?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{project.tasks?.length || 0}</span>
              </div>
              {project.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
            {project.priority && (
              <div className={`flex items-center space-x-1 ${
                project.priority === 'high' ? 'text-red-400' : 
                project.priority === 'medium' ? 'text-yellow-400' : 
                'text-green-400'
              }`}>
                <Star className="w-4 h-4" />
                <span>{project.priority}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* En-tête avec statistiques */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Projets
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Gérez vos projets et suivez leur progression
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              Nouveau projet
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total"
              value={projectStats.total}
              icon={Target}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={5}
            />
            <StatCard
              title="Actifs"
              value={projectStats.active}
              icon={PlayCircle}
              color="bg-gradient-to-br from-green-500 to-green-600"
              trend={12}
            />
            <StatCard
              title="Terminés"
              value={projectStats.completed}
              icon={CheckCircle}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              trend={8}
            />
            <StatCard
              title="En planning"
              value={projectStats.planning}
              icon={AlertCircle}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              trend={-2}
            />
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtre par statut */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-gray-700/50 border border-gray-600/50 rounded-lg text-white px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                  <option value="planning">En planning</option>
                  <option value="paused">En pause</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Mode de vue */}
            <div className="flex items-center bg-gray-700/30 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des projets */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Chargement des projets...
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || selectedStatus !== 'all' ? 'Aucun projet trouvé' : 'Aucun projet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedStatus !== 'all' ? 
                  'Essayez de modifier vos critères de recherche' : 
                  'Créez votre premier projet pour commencer'
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Créer mon premier projet
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            }`}>
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <ProjectForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateProject}
          />
        )}
        
        {showEditModal && selectedProject && (
          <ProjectForm
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProject(null);
            }}
            onSave={handleEditProject}
            project={selectedProject}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default ProjectsPage;
