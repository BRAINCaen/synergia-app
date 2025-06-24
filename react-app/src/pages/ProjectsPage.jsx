import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockProjects = [
        {
          id: '1',
          title: 'Synergia v4.0',
          description: 'Développement de la nouvelle version avec IA intégrée',
          status: 'active',
          progress: 65,
          priority: 'high',
          team: ['Alice', 'Bob', 'Claire'],
          tasksTotal: 24,
          tasksCompleted: 16,
          startDate: '2025-06-01',
          endDate: '2025-08-15',
          budget: 50000,
          xpReward: 200,
          color: 'blue'
        },
        {
          id: '2',
          title: 'Formation Équipe',
          description: 'Programme de formation sur les nouvelles technologies',
          status: 'active',
          progress: 30,
          priority: 'medium',
          team: ['David', 'Emma'],
          tasksTotal: 8,
          tasksCompleted: 2,
          startDate: '2025-06-15',
          endDate: '2025-07-30',
          budget: 15000,
          xpReward: 100,
          color: 'green'
        },
        {
          id: '3',
          title: 'Migration Base de Données',
          description: 'Migration vers PostgreSQL avec optimisations',
          status: 'completed',
          progress: 100,
          priority: 'high',
          team: ['Frank', 'Grace'],
          tasksTotal: 12,
          tasksCompleted: 12,
          startDate: '2025-05-01',
          endDate: '2025-06-01',
          budget: 25000,
          xpReward: 150,
          color: 'purple'
        },
        {
          id: '4',
          title: 'Refonte UI/UX',
          description: 'Nouvelle interface utilisateur moderne et accessible',
          status: 'planning',
          progress: 5,
          priority: 'medium',
          team: ['Henry', 'Iris'],
          tasksTotal: 20,
          tasksCompleted: 1,
          startDate: '2025-07-01',
          endDate: '2025-09-30',
          budget: 35000,
          xpReward: 180,
          color: 'orange'
        }
      ];
      
      setProjects(mockProjects);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paused: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[status] || badges.active;
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'En cours',
      completed: 'Terminé',
      planning: 'Planification',
      paused: 'En pause'
    };
    return texts[status] || status;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority] || '⚪';
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-l-blue-500 bg-blue-900/10',
      green: 'border-l-green-500 bg-green-900/10',
      purple: 'border-l-purple-500 bg-purple-900/10',
      orange: 'border-l-orange-500 bg-orange-900/10',
      red: 'border-l-red-500 bg-red-900/10'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement de vos projets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Projets Actifs</h3>
            <p className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Terminés</h3>
            <p className="text-3xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Tâches Total</h3>
            <p className="text-3xl font-bold">{projects.reduce((sum, p) => sum + p.tasksTotal, 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Budget Total</h3>
            <p className="text-3xl font-bold">{(projects.reduce((sum, p) => sum + p.budget, 0) / 1000).toFixed(0)}k€</p>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Mes Projets</h1>
            <div className="flex items-center space-x-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'active', label: 'Actifs' },
                { key: 'completed', label: 'Terminés' },
                { key: 'planning', label: 'Planning' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                ☰
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              ➕ Nouveau Projet
            </button>
          </div>
        </div>

        {/* Projets */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📁</span>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-400 mb-6">Créez votre premier projet pour commencer</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Créer un projet
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className={`bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 border-l-4 ${getColorClasses(project.color)}`}
              >
                <div className="p-6">
                  {/* Header du projet */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-lg">{getPriorityIcon(project.priority)}</span>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progression</span>
                      <span className="text-sm font-medium text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{project.tasksCompleted}/{project.tasksTotal}</p>
                      <p className="text-xs text-gray-400">Tâches</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{project.team.length}</p>
                      <p className="text-xs text-gray-400">Membres</p>
                    </div>
                  </div>

                  {/* Équipe */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Équipe</p>
                    <div className="flex items-center space-x-1">
                      {project.team.slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        >
                          {member[0]}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>💎 {project.xpReward} XP</span>
                      <span>💰 {(project.budget / 1000).toFixed(0)}k€</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                        Voir
                      </button>
                      <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal création projet */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Nouveau Projet</h2>
              <p className="text-gray-400 mb-6">
                Interface de création de projet en cours de développement. 
                Le système de collaboration et Firebase sont opérationnels !
              </p>
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-white font-medium mb-2">Fonctionnalités à venir :</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Création de projets collaboratifs</li>
                  <li>• Assignation d'équipes</li>
                  <li>• Gestion des budgets et échéances</li>
                  <li>• Templates de projets</li>
                  <li>• Intégration avec le système XP</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Demo: ajouter un projet
                    const newProject = {
                      id: Date.now().toString(),
                      title: 'Projet Demo',
                      description: 'Projet créé pour démonstration',
                      status: 'active',
                      progress: 10,
                      priority: 'medium',
                      team: [user?.displayName?.split(' ')[0] || 'User'],
                      tasksTotal: 5,
                      tasksCompleted: 0,
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      budget: 10000,
                      xpReward: 75,
                      color: 'blue'
                    };
                    setProjects(prev => [newProject, ...prev]);
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Créer (Demo)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
