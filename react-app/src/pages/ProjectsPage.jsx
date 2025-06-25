// ==========================================
// 📁 PROJECTS PAGE - SYNERGIA v3.5 - FIX D'URGENCE
// ==========================================
// Fichier: react-app/src/pages/ProjectsPage.jsx
// Version de secours avec gestion des erreurs Firebase
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Target, Calendar, User, Folder, BarChart3 } from 'lucide-react';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Modal simple pour la collaboration
const CollaborationModal = ({ isOpen, onClose, entityType, entityId, entityTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-lg shadow-xl p-6 max-w-md w-full"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
            🤝 Collaboration - {entityTitle}
          </h3>
          <p className="mb-4" style={{ color: '#e5e7eb' }}>
            Fonctionnalité de collaboration en cours de développement.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour la collaboration
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationProject, setCollaborationProject] = useState(null);

  // Stores
  const { projects: rawProjects, loadUserProjects } = useProjectStore();
  const { tasks: rawTasks, loadUserTasks } = useTaskStore();
  const { user } = useAuthStore();

  // 🛡️ PROTECTION : Nettoyer les données Firebase
  const projects = useMemo(() => {
    if (!Array.isArray(rawProjects)) return [];
    
    return rawProjects.map(project => ({
      id: project.id || `temp-${Date.now()}`,
      title: project.title || 'Projet sans titre',
      description: project.description || '',
      status: project.status || 'active',
      priority: project.priority || 'medium',
      createdAt: project.createdAt || new Date().toISOString(),
      dueDate: project.dueDate || null,
      ownerId: project.ownerId || user?.uid
    }));
  }, [rawProjects, user?.uid]);

  const tasks = useMemo(() => {
    if (!Array.isArray(rawTasks)) return [];
    
    return rawTasks.map(task => ({
      id: task.id || `temp-${Date.now()}`,
      title: task.title || 'Tâche sans titre',
      status: task.status || 'todo',
      projectId: task.projectId || null
    }));
  }, [rawTasks]);

  // Chargement initial sécurisé
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Essayer de charger, mais continuer même en cas d'erreur
        try {
          await loadUserProjects(user.uid);
        } catch (error) {
          console.warn('Erreur chargement projets:', error);
        }
        
        try {
          await loadUserTasks(user.uid);
        } catch (error) {
          console.warn('Erreur chargement tâches:', error);
        }
      } catch (error) {
        console.error('Erreur générale:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid, loadUserProjects, loadUserTasks]);

  // 🛡️ FILTRAGE SÉCURISÉ avec vérifications
  const filteredProjects = useMemo(() => {
    try {
      let filtered = projects.filter(project => {
        // Vérifications de sécurité
        const safeTitle = (project.title || '').toLowerCase();
        const safeDescription = (project.description || '').toLowerCase();
        const safeSearch = (searchTerm || '').toLowerCase();
        
        const matchesSearch = safeTitle.includes(safeSearch) || safeDescription.includes(safeSearch);
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      });

      // Tri sécurisé
      filtered.sort((a, b) => {
        try {
          let aValue = a[sortBy] || '';
          let bValue = b[sortBy] || '';

          if (sortBy === 'createdAt' || sortBy === 'dueDate') {
            aValue = new Date(aValue || '1970-01-01');
            bValue = new Date(bValue || '1970-01-01');
          }

          if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        } catch (error) {
          console.warn('Erreur tri:', error);
          return 0;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Erreur filtrage:', error);
      return projects; // Retourner tous les projets en cas d'erreur
    }
  }, [projects, searchTerm, filterStatus, filterPriority, sortBy, sortOrder]);

  // Calculer les statistiques de manière sécurisée
  const getProjectStats = (projectId) => {
    try {
      const projectTasks = tasks.filter(task => task.projectId === projectId);
      const completedTasks = projectTasks.filter(task => task.status === 'completed');
      const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
      
      return {
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        progress: Math.round(progress)
      };
    } catch (error) {
      console.warn('Erreur calcul stats:', error);
      return { totalTasks: 0, completedTasks: 0, progress: 0 };
    }
  };

  // Handlers
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      console.log('Suppression projet:', projectId);
      // TODO: Implémenter la suppression
    }
  };

  const handleOpenCollaboration = (project) => {
    setCollaborationProject(project);
    setShowCollaborationModal(true);
  };

  const handleCloseCollaboration = () => {
    setShowCollaborationModal(false);
    setCollaborationProject(null);
  };

  // Fonctions utilitaires sécurisées
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-green-200 bg-green-50 text-green-700',
      medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      high: 'border-red-200 bg-red-50 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Aucune échéance';
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  // 📊 Statistiques sécurisées
  const safeStats = useMemo(() => {
    try {
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length
      };
    } catch (error) {
      return { total: 0, active: 0, completed: 0, onHold: 0 };
    }
  }, [projects]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
              <p className="text-gray-600 mt-2">
                Organisez et suivez vos projets efficacement
              </p>
            </div>
            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouveau projet
            </button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{safeStats.total}</p>
                </div>
                <Folder className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-blue-600">{safeStats.active}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{safeStats.completed}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En pause</p>
                  <p className="text-2xl font-bold text-yellow-600">{safeStats.onHold}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value || '')}
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="on_hold">En pause</option>
                  <option value="cancelled">Annulé</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">
              {projects.length === 0 ? 'Aucun projet créé' : 'Aucun projet trouvé'}
            </p>
            <p className="text-gray-500 mb-6">
              {projects.length === 0 
                ? 'Commencez par créer votre premier projet'
                : 'Essayez de modifier vos filtres'
              }
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowProjectForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Créer mon premier projet
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project.id);
              
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stats={stats}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onView={setSelectedProject}
                  onCollaborate={handleOpenCollaboration}
                  formatDate={formatDate}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              );
            })}
          </div>
        )}

        {/* Modal de collaboration */}
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={handleCloseCollaboration}
          entityType="project"
          entityId={collaborationProject?.id}
          entityTitle={collaborationProject?.title}
        />

        {/* Modal ProjectForm - placeholder */}
        {showProjectForm && (
          <ProjectFormModal
            project={editingProject}
            onSave={() => console.log('Sauvegarde projet')}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />
        )}

        {/* Modal ProjectDetail */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            stats={getProjectStats(selectedProject.id)}
            onClose={() => setSelectedProject(null)}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onCollaborate={handleOpenCollaboration}
            formatDate={formatDate}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🎴 COMPOSANT CARTE PROJET
// ==========================================

const ProjectCard = ({ 
  project, 
  stats, 
  onEdit, 
  onDelete, 
  onView, 
  onCollaborate,
  formatDate, 
  getPriorityColor, 
  getStatusColor 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                {project.status === 'active' ? 'Actif' : 
                 project.status === 'completed' ? 'Terminé' :
                 project.status === 'on_hold' ? 'En pause' : 'Annulé'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-blue-600">{stats.progress}%</span>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{stats.completedTasks}/{stats.totalTasks} tâches</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{formatDate(project.dueDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCollaborate(project)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              title="Collaboration"
            >
              <User size={14} />
            </button>
            
            <button
              onClick={() => onView(project)}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Eye size={14} />
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modales placeholder (versions simplifiées qui fonctionnent)
const ProjectDetailModal = ({ project, stats, onClose, onEdit, onDelete, onCollaborate, formatDate, getPriorityColor, getStatusColor }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-auto"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                {project.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
                  {project.status === 'active' ? 'Actif' : 
                   project.status === 'completed' ? 'Terminé' :
                   project.status === 'on_hold' ? 'En pause' : 'Annulé'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {project.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                  Description
                </h3>
                <p style={{ color: '#e5e7eb' }}>{project.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                Progression: {stats.progress}%
              </h3>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2" style={{ color: '#d1d5db' }}>
                {stats.completedTasks}/{stats.totalTasks} tâches terminées
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: '#374151' }}>
            <button
              onClick={() => onEdit(project)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectFormModal = ({ project, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        <div 
          className="relative rounded-lg shadow-xl p-6 max-w-md w-full"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h3>
          <p className="mb-4" style={{ color: '#e5e7eb' }}>
            Formulaire de projet à implémenter.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white">
              Annuler
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {project ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
