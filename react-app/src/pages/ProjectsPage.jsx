// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Users, Target, Trash2, Edit, Eye, Clock, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProjectsPage = () => {
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Calculer les statistiques des projets
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const overdueTasks = projectTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    );
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      progress: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
    };
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

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-500 text-white',
      planning: 'bg-gray-500 text-white',
      'on-hold': 'bg-yellow-500 text-black',
      completed: 'bg-green-500 text-white',
      cancelled: 'bg-red-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      if (date.seconds) {
        // Timestamp Firebase
        return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
      }
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projets</h1>
          <p className="text-gray-400">Gérez vos projets et suivez leur progression</p>
        </div>
        <button
          onClick={() => setShowProjectForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nouveau Projet
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Projets</p>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
            </div>
            <Target className="text-blue-400" size={32} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En Cours</p>
              <p className="text-2xl font-bold text-white">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Clock className="text-green-400" size={32} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Terminés</p>
              <p className="text-2xl font-bold text-white">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <Target className="text-purple-400" size={32} />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En Retard</p>
              <p className="text-2xl font-bold text-white">
                {projects.filter(p => {
                  const stats = getProjectStats(p.id);
                  return stats.overdue > 0;
                }).length}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="planning">Planification</option>
            <option value="active">En cours</option>
            <option value="on-hold">En pause</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
          
          {/* Filtre priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
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
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Aucun projet trouvé' 
              : 'Aucun projet créé'
            }
          </p>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Commencez par créer votre premier projet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <div
                key={project.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                {/* En-tête du projet */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                        {project.status === 'planning' ? 'Planification' :
                         project.status === 'active' ? 'En cours' :
                         project.status === 'on-hold' ? 'En pause' :
                         project.status === 'completed' ? 'Terminé' :
                         project.status === 'cancelled' ? 'Annulé' : project.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority === 'low' ? 'Basse' :
                         project.priority === 'medium' ? 'Moyenne' :
                         project.priority === 'high' ? 'Haute' :
                         project.priority === 'urgent' ? 'Urgente' : project.priority}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description || 'Aucune description'}
                </p>

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
                <div className="space-y-2">
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
                  <div className="flex flex-wrap gap-1 mt-4">
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
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ProjectForm - Version simplifiée intégrée */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Formulaire simplifié */}
              <ProjectFormContent
                project={editingProject}
                onSave={editingProject ? handleUpdateProject : handleCreateProject}
                onClose={handleCloseForm}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal détails projet */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête modal */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status === 'planning' ? 'Planification' :
                       selectedProject.status === 'active' ? 'En cours' :
                       selectedProject.status === 'on-hold' ? 'En pause' :
                       selectedProject.status === 'completed' ? 'Terminé' :
                       selectedProject.status === 'cancelled' ? 'Annulé' : selectedProject.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedProject.priority)}`}>
                      Priorité {selectedProject.priority === 'low' ? 'Basse' :
                                selectedProject.priority === 'medium' ? 'Moyenne' :
                                selectedProject.priority === 'high' ? 'Haute' :
                                selectedProject.priority === 'urgent' ? 'Urgente' : selectedProject.priority}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Contenu modal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 mb-6">
                    {selectedProject.description || 'Aucune description disponible'}
                  </p>

                  <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Catégorie:</span>
                      <span className="text-white">{selectedProject.category || 'Non définie'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date de début:</span>
                      <span className="text-white">{formatDate(selectedProject.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date de fin:</span>
                      <span className="text-white">{formatDate(selectedProject.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Progression</h3>
                  {(() => {
                    const stats = getProjectStats(selectedProject.id);
                    return (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Avancement global</span>
                            <span className="text-white font-medium">{stats.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${stats.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-gray-400 text-sm">Total tâches</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                            <p className="text-gray-400 text-sm">Terminées</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                            <p className="text-gray-400 text-sm">En retard</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tags */}
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, index) => (
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
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleEditProject(selectedProject);
                    setSelectedProject(null);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant formulaire simple intégré
const ProjectFormContent = ({ project, onSave, onClose, submitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    category: '',
    startDate: '',
    dueDate: '',
    expectedDuration: ''
  });

  const [errors, setErrors] = useState({});

  // Initialiser avec les données du projet
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        category: project.category || '',
        startDate: project.startDate ? formatDateForInput(project.startDate) : '',
        dueDate: project.dueDate ? formatDateForInput(project.dueDate) : '',
        expectedDuration: project.expectedDuration || ''
      });
    }
  }, [project]);

  const formatDateForInput = (date) => {
    try {
      if (date?.seconds) {
        // Timestamp Firebase
        return new Date(date.seconds * 1000).toISOString().split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        category: formData.category,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        expectedDuration: formData.expectedDuration ? parseInt(formData.expectedDuration) : null,
        tags: []
      };

      await onSave(projectData);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Titre du projet *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Entrez le titre du projet..."
        />
        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Décrivez les objectifs et la portée du projet..."
        />
        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Statut et Priorité */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">En cours</option>
            <option value="planning">Planification</option>
            <option value="on-hold">En pause</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priorité
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de début
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de fin
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Catégorie et Durée */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Catégorie
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="development">Développement</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="research">Recherche</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Durée estimée (heures)
          </label>
          <input
            type="number"
            name="expectedDuration"
            value={formData.expectedDuration}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="ex: 30"
          />
        </div>
      </div>

      {/* Erreur générale */}
      {errors.submit && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Sauvegarde...' : project ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default ProjectsPage;
