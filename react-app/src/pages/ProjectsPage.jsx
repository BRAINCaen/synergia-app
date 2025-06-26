// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// Page Projets AUTONOME - Version finale sans dépendances
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Folder, 
  Users, 
  Calendar,
  BarChart3,
  Star,
  MoreVertical,
  RefreshCw,
  FolderPlus,
  Zap,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  TrendingUp,
  Briefcase,
  Rocket,
  Progress,
  ChevronRight
} from 'lucide-react';

// IMPORTS BASIQUES UNIQUEMENT
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects, addProject, updateProject } = useProjectStore();
  const { tasks } = useTaskStore();
  
  // États locaux simplifiés
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created');
  const [refreshing, setRefreshing] = useState(false);

  // Nouveau projet form
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Calcul des métriques par projet
  const getProjectMetrics = (project) => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const totalTasks = projectTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate),
      inProgressTasks: projectTasks.filter(task => task.status === 'in_progress').length,
      todoTasks: projectTasks.filter(task => task.status === 'todo').length
    };
  };

  // Filtrer et trier les projets
  const getFilteredProjects = () => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Tri simple
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          const progressA = getProjectMetrics(a).completionRate;
          const progressB = getProjectMetrics(b).completionRate;
          return progressB - progressA;
        case 'tasks':
          const tasksA = getProjectMetrics(a).totalTasks;
          const tasksB = getProjectMetrics(b).totalTasks;
          return tasksB - tasksA;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Statistiques globales
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    totalTasks: projects.reduce((acc, project) => acc + getProjectMetrics(project).totalTasks, 0),
    avgCompletion: projects.length > 0 ? 
      Math.round(projects.reduce((acc, project) => acc + getProjectMetrics(project).completionRate, 0) / projects.length) : 0
  };

  // Handlers
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      await addProject({
        ...newProject,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Reset form
      setNewProject({
        name: '',
        description: '',
        status: 'active',
        priority: 'medium',
        startDate: '',
        endDate: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur création projet:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'on_hold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          Chargement des projets...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête Premium */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Briefcase className="w-10 h-10 text-purple-400" />
                Mes Projets
              </h1>
              <p className="text-gray-400 text-lg">
                Gestion collaborative • Suivi avancé • {stats.total} projets actifs
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-5 h-5" />
                Nouveau Projet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total projets</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actifs</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <Rocket className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminés</p>
                <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progression moy.</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.avgCompletion}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="on_hold">En pause</option>
                <option value="cancelled">Annulé</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="created">Date création</option>
                <option value="name">Nom</option>
                <option value="progress">Progression</option>
                <option value="tasks">Nombre tâches</option>
              </select>

              {/* Toggle vue */}
              <div className="flex bg-gray-700 rounded-xl border border-gray-600 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des projets */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {projects.length === 0 ? 'Aucun projet créé' : 'Aucun projet trouvé'}
              </h3>
              <p className="text-gray-500 mb-6">
                {projects.length === 0 
                  ? 'Lancez votre premier projet et organisez votre travail !'
                  : 'Essayez de modifier vos filtres de recherche.'
                }
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Créer mon premier projet
                </button>
              )}
            </div>
          ) : (
            <div className={`p-6 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                : 'space-y-4'
            }`}>
              {filteredProjects.map((project) => {
                const metrics = getProjectMetrics(project);
                
                return (
                  <div
                    key={project.id}
                    className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-2 truncate">
                          {project.name}
                        </h3>
                        
                        {project.description && (
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                            {project.status === 'active' && '🟢 Actif'}
                            {project.status === 'completed' && '✅ Terminé'}
                            {project.status === 'on_hold' && '⏸️ En pause'}
                            {project.status === 'cancelled' && '❌ Annulé'}
                          </span>
                          
                          <span className={`px-3 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)}`}>
                            {project.priority === 'high' && '🔥 Haute'}
                            {project.priority === 'medium' && '⚡ Moyenne'}
                            {project.priority === 'low' && '📋 Basse'}
                          </span>
                        </div>
                      </div>
                      
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Métriques */}
                    <div className="space-y-4">
                      {/* Progression */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Progression</span>
                          <span className="text-sm font-medium text-white">
                            {metrics.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${metrics.completionRate}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Statistiques tâches */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{metrics.totalTasks}</div>
                          <div className="text-xs text-gray-400">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{metrics.completedTasks}</div>
                          <div className="text-xs text-gray-400">Terminées</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{metrics.inProgressTasks}</div>
                          <div className="text-xs text-gray-400">En cours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">{metrics.todoTasks}</div>
                          <div className="text-xs text-gray-400">À faire</div>
                        </div>
                      </div>

                      {/* Dates */}
                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-600">
                          {project.startDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                          {project.endDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Fin: {new Date(project.endDate).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Création Projet */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-6 h-6 text-purple-400" />
                Nouveau Projet
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Nom du projet..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Description du projet..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="active">🟢 Actif</option>
                    <option value="on_hold">⏸️ En pause</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-white font-medium transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer le projet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
