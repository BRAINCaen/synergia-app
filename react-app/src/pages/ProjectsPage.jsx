// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// Page des projets avec système de collaboration intégré
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Users, Target, Trash2, Edit, Eye, 
  Clock, AlertTriangle, MessageSquare, BarChart3, CheckCircle 
} from 'lucide-react';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Import des composants de collaboration
import CollaborationPanel, { 
  CollaborationModal 
} from '../components/collaboration/CollaborationPanel.jsx';

const ProjectsPage = () => {
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 🤝 États pour la collaboration
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [collaborationProject, setCollaborationProject] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // Stores
  const { 
    projects, 
    loading, 
    createProject, 
    updateProject, 
    deleteProject, 
    loadUserProjects 
  } = useProjectStore();
  
  const { tasks, loadUserTasks } = useTaskStore();
  const { user } = useAuthStore();

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserProjects(user.uid);
      loadUserTasks(user.uid);
    }
  }, [user?.uid, loadUserProjects, loadUserTasks]);

  // 🤝 Gestionnaires de collaboration
  const handleOpenCollaboration = (project) => {
    setCollaborationProject(project);
    setShowCollaborationModal(true);
  };

  const handleCloseCollaboration = () => {
    setCollaborationProject(null);
    setShowCollaborationModal(false);
  };

  // Calculer les statistiques des projets
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const overdueTasks = projectTasks.filter(task => 
      task.dueDate && new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate) < new Date() && task.status !== 'completed'
    );
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      progress: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
    };
  };

  // Statistiques générales
  const getOverallStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;

    return { total, active, completed, onHold };
  };

  // Filtrer les projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Gestionnaires d'événements
  const handleCreateProject = async (projectData) => {
    try {
      setSubmitting(true);
      await createProject(projectData, user.uid);
      setShowProjectForm(false);
    } catch (error) {
      console.error('Erreur création projet:', error);
      alert('Erreur lors de la création du projet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      setSubmitting(true);
      await updateProject(editingProject.id, projectData, user.uid);
      setEditingProject(null);
      setShowProjectForm(false);
    } catch (error) {
      console.error('Erreur modification projet:', error);
      alert('Erreur lors de la modification du projet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(projectId, user.uid);
      } catch (error) {
        console.error('Erreur suppression projet:', error);
        alert('Erreur lors de la suppression du projet');
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // Fonctions utilitaires
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      const dateObj = new Date(date.seconds ? date.seconds * 1000 : date);
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-400 bg-red-900/20 border-red-500',
      high: 'text-orange-400 bg-orange-900/20 border-orange-500',
      medium: 'text-yellow-400 bg-yellow-900/20 border-yellow-500',
      low: 'text-green-400 bg-green-900/20 border-green-500'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-400 bg-green-900/20',
      completed: 'text-blue-400 bg-blue-900/20',
      on_hold: 'text-yellow-400 bg-yellow-900/20',
      cancelled: 'text-red-400 bg-red-900/20'
    };
    return colors[status] || colors.active;
  };

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Target className="text-blue-400" size={32} />
              Mes Projets
            </h1>
            <p className="text-gray-400">
              Gérez vos projets et collaborez avec votre équipe
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Bouton collaboration générale */}
            <button
              onClick={() => setCollaborationOpen(!collaborationOpen)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                ${collaborationOpen 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <MessageSquare size={20} />
              Collaboration
            </button>

            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouveau Projet
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projets</p>
                <p className="text-2xl font-bold text-white">{overallStats.total}</p>
              </div>
              <Target className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En Cours</p>
                <p className="text-2xl font-bold text-white">{overallStats.active}</p>
              </div>
              <Clock className="text-green-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminés</p>
                <p className="text-2xl font-bold text-white">{overallStats.completed}</p>
              </div>
              <CheckCircle className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En Pause</p>
                <p className="text-2xl font-bold text-white">{overallStats.onHold}</p>
              </div>
              <AlertTriangle className="text-yellow-400" size={32} />
            </div>
          </div>
        </div>

        {/* 🤝 Panneau de collaboration (si ouvert) */}
        {collaborationOpen && (
          <div className="mb-8">
            <CollaborationPanel
              entityType="user"
              entityId={user?.uid}
              entityTitle="Tous mes projets"
              defaultTab="activity"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="on_hold">En pause</option>
              <option value="cancelled">Annulé</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>

        {/* Liste des projets */}
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
                  onCollaborate={handleOpenCollaboration} // 🤝 Nouvelle prop
                  formatDate={formatDate}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              );
            })}
          </div>
        )}

        {/* 🤝 Modal de collaboration pour projet spécifique */}
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={handleCloseCollaboration}
          entityType="project"
          entityId={collaborationProject?.id}
          entityTitle={collaborationProject?.title}
        />

        {/* Modal ProjectForm */}
        {showProjectForm && (
          <ProjectFormModal
            project={editingProject}
            onSave={editingProject ? handleUpdateProject : handleCreateProject}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
            submitting={submitting}
          />
        )}

        {/* Modal détails projet */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            stats={getProjectStats(selectedProject.id)}
            onClose={() => setSelectedProject(null)}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onCollaborate={handleOpenCollaboration} // 🤝 Nouvelle prop
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
// 📁 COMPOSANT CARTE DE PROJET (avec collaboration)
// ==========================================

const ProjectCard = ({ 
  project, 
  stats, 
  onEdit, 
  onDelete, 
  onView, 
  onCollaborate, // 🤝 Nouvelle prop
  formatDate, 
  getPriorityColor, 
  getStatusColor 
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
              {project.status === 'active' ? 'Actif' : 
               project.status === 'completed' ? 'Terminé' :
               project.status === 'on_hold' ? 'En pause' : 'Annulé'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 🤝 Bouton collaboration */}
          <button
            onClick={() => onCollaborate(project)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Ouvrir la collaboration"
          >
            <MessageSquare size={16} />
          </button>

          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Statistiques tâches */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progression</span>
          <span className="text-white font-medium">{stats.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>{stats.completed}/{stats.total} tâches</span>
          {stats.overdue > 0 && (
            <span className="text-red-400">{stats.overdue} en retard</span>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} />
          <span>Début: {formatDate(project.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} />
          <span>Fin: {formatDate(project.dueDate)}</span>
        </div>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Créé le {formatDate(project.createdAt)}
        </span>
        
        <button
          onClick={() => onView(project)}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <Eye size={14} />
          Voir détails
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 📋 MODAL DÉTAILS PROJET (avec collaboration)
// ==========================================

const ProjectDetailModal = ({ 
  project, 
  stats, 
  onClose, 
  onEdit, 
  onDelete, 
  onCollaborate, // 🤝 Nouvelle prop
  formatDate, 
  getPriorityColor, 
  getStatusColor 
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-gray-800 rounded-xl shadow-2xl p-8 max-w-3xl w-full mx-auto text-left overflow-hidden transform transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {project.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded border ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
                  {project.status === 'active' ? 'Actif' : 
                   project.status === 'completed' ? 'Terminé' :
                   project.status === 'on_hold' ? 'En pause' : 'Annulé'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {project.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Progression */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📊 Progression</h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Tâches complétées</span>
                <span className="text-white font-bold">{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3 mb-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-white font-bold">{stats.total}</div>
                  <div className="text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">{stats.completed}</div>
                  <div className="text-gray-400">Terminées</div>
                </div>
                <div>
                  <div className="text-red-400 font-bold">{stats.overdue}</div>
                  <div className="text-gray-400">En retard</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📅 Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Date de début</div>
                    <div className="text-white">{formatDate(project.startDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Date de fin</div>
                    <div className="text-white">{formatDate(project.dueDate)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-400 text-sm">Créé le</div>
                    <div className="text-white">{formatDate(project.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🤝 Section collaboration dans la modal */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">🤝 Collaboration</h3>
              <button
                onClick={() => onCollaborate(project)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Ouvrir collaboration
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Collaborez sur ce projet : commentaires, mentions, historique des activités
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onEdit(project);
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => {
                onDelete(project.id);
                onClose();
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📝 MODAL FORMULAIRE PROJET (placeholder pour l'exemple)
// ==========================================

const ProjectFormModal = ({ project, onSave, onClose, submitting }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    priority: project?.priority || 'medium',
    status: project?.status || 'active',
    startDate: project?.startDate || '',
    dueDate: project?.dueDate || '',
    tags: project?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    
    onSave(projectData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {project ? 'Modifier le projet' : 'Nouveau projet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre du projet *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du projet"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Description du projet"
              />
            </div>

            {/* Priorité et Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="on_hold">En pause</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tag1, Tag2, Tag3..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Séparez les tags par des virgules
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    {project ? 'Modifier' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
