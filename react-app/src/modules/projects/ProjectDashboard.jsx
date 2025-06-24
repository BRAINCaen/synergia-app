// src/modules/projects/ProjectDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, Calendar, User, Target, Award, AlertCircle } from 'lucide-react';

// Import des stores Firebase
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useProjectStore } from '../../shared/stores/projectStore.js';

// Import des services Firebase  
import { projectService } from '../../core/services/projectService.js';
import { gamificationService } from '../../core/services/gamificationService.js';

// Components UI
import Button from '../../shared/components/ui/Button.jsx';
import { Card } from '../../shared/components/ui/Card.jsx';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // État local pour gérer les projets
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Charger les projets au montage
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  const loadProjects = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Essayer d'utiliser le service Firebase
      if (projectService && typeof projectService.getUserProjects === 'function') {
        const userProjects = await projectService.getUserProjects(user.uid);
        setProjects(userProjects || []);
      } else {
        // Fallback avec données de démonstration
        console.warn('⚠️ ProjectService non disponible - Mode démonstration');
        setProjects(getMockProjects());
      }
    } catch (err) {
      console.error('❌ Erreur chargement projets:', err);
      setError('Erreur lors du chargement des projets');
      // Fallback avec données de démonstration en cas d'erreur
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  // Données de démonstration en cas de problème avec Firebase
  const getMockProjects = () => [
    {
      id: 'demo-1',
      name: '🚀 Projet Synergia v3',
      description: 'Développement de l\'application de productivité avec gamification',
      status: 'active',
      progress: 75,
      taskCount: 12,
      completedTaskCount: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user?.uid,
      members: [user?.uid],
      tags: ['développement', 'productivité']
    },
    {
      id: 'demo-2', 
      name: '📊 Analytics Dashboard',
      description: 'Création d\'un tableau de bord analytique avancé',
      status: 'active',
      progress: 45,
      taskCount: 8,
      completedTaskCount: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user?.uid,
      members: [user?.uid],
      tags: ['analytics', 'dashboard']
    },
    {
      id: 'demo-3',
      name: '✅ Migration Firebase',
      description: 'Migration complète vers Firebase pour la persistence des données',
      status: 'completed',
      progress: 100,
      taskCount: 15,
      completedTaskCount: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: user?.uid,
      members: [user?.uid],
      tags: ['firebase', 'migration']
    }
  ];

  // Filtrer les projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistiques des projets
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length
  };

  // Créer un nouveau projet
  const handleCreateProject = async () => {
    if (!user?.uid) return;

    const newProjectData = {
      name: `Nouveau Projet ${stats.total + 1}`,
      description: 'Description du nouveau projet',
      status: 'active',
      tags: []
    };

    try {
      if (projectService && typeof projectService.createProject === 'function') {
        const result = await projectService.createProject(newProjectData, user.uid);
        if (result) {
          await loadProjects(); // Recharger les projets
          
          // Ajouter XP pour création de projet
          if (gamificationService && typeof gamificationService.addXP === 'function') {
            await gamificationService.addXP(user.uid, 25, 'Nouveau projet créé');
          }
        }
      } else {
        console.warn('⚠️ Création projet - Mode démonstration');
        // En mode démo, juste ajouter localement
        const demoProject = {
          ...newProjectData,
          id: `demo-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: user.uid,
          members: [user.uid],
          progress: 0,
          taskCount: 0,
          completedTaskCount: 0
        };
        setProjects(prev => [demoProject, ...prev]);
      }
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      setError('Erreur lors de la création du projet');
    }
  };

  // Couleurs pour les statuts
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/20 text-green-400 border-green-500';
      case 'completed': return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'in_progress': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
      case 'paused': return 'bg-gray-900/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500';
    }
  };

  // Couleur de la barre de progression
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📁 Mes Projets
            </h1>
            <p className="text-gray-400">
              Gérez vos projets et suivez votre progression
            </p>
          </div>
          
          <Button
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Projet
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actifs</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Complétés</p>
                <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En cours</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
              </div>
              <User className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="completed">Complété</option>
            <option value="in_progress">En cours</option>
            <option value="paused">En pause</option>
          </select>
          
          <div className="flex bg-gray-800 rounded-lg border border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'} rounded-l-lg`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'} rounded-r-lg`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Liste des projets */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12 text-center bg-gray-800 border-gray-700">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun projet ne correspond à vos critères de recherche'
                : 'Commencez par créer votre premier projet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={handleCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un projet
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-6 bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                {/* Progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Statistiques */}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{project.taskCount || 0} tâches</span>
                  <span>{project.completedTaskCount || 0} complétées</span>
                </div>
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
