// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// SYSTÈME DE GESTION DE PROJETS COMPLET - VERSION FIREBASE FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Archive,
  Award,
  Briefcase,
  Tag,
  MapPin,
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';

/**
 * 📋 PAGE DE GESTION DE PROJETS COMPLÈTE - VERSION FIREBASE
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États UI
  const [view, setView] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // États modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // État formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: '',
    startDate: '',
    endDate: '',
    estimatedHours: '',
    budget: '',
    tags: [],
    objectives: [''],
    deliverables: ['']
  });

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      setupRealtimeListeners();
    }
  }, [user?.uid]);

  const loadAllData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des projets pour:', user.uid);
      
      // Charger les projets de l'utilisateur
      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects || []);
      
      console.log('✅ Projets chargés:', userProjects?.length || 0);
      
    } catch (error) {
      console.error('❌ Erreur chargement données projets:', error);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!user?.uid) return;
    
    try {
      // Écouter les changements de projets en temps réel
      const unsubscribe = projectService.subscribeToUserProjects(user.uid, (updatedProjects) => {
        console.log('🔄 Mise à jour temps réel des projets:', updatedProjects.length);
        setProjects(updatedProjects || []);
      });
      
      // Nettoyer lors du démontage
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('❌ Erreur setup listeners:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Le titre du projet est requis');
      return;
    }

    if (!user?.uid) {
      alert('Erreur d\'authentification');
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('🆕 Création nouveau projet:', formData.title);
      
      // Préparer les données du projet
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        tags: formData.tags.filter(tag => tag.trim()),
        objectives: formData.objectives.filter(obj => obj.trim()),
        deliverables: formData.deliverables.filter(del => del.trim())
      };
      
      // Créer le projet
      const result = await projectService.createProject(projectData, user.uid);
      
      if (result.success) {
        console.log('✅ Projet créé avec succès:', result.project?.id);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 'normal',
          category: '',
          startDate: '',
          endDate: '',
          estimatedHours: '',
          budget: '',
          tags: [],
          objectives: [''],
          deliverables: ['']
        });
        
        setShowCreateForm(false);
        
        // Les projets se mettront à jour automatiquement via le listener temps réel
        alert('✅ Projet créé avec succès !');
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      alert('❌ Erreur lors de la création du projet: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      console.log('🔄 Mise à jour statut projet:', projectId, newStatus);
      
      const result = await projectService.updateProject(projectId, { status: newStatus }, user.uid);
      
      if (result.success) {
        alert('✅ Statut du projet mis à jour');
      } else {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      alert('❌ Erreur lors de la mise à jour: ' + error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    try {
      console.log('🗑️ Suppression projet:', projectId);
      
      const result = await projectService.deleteProject(projectId, user.uid);
      
      if (result.success) {
        alert('✅ Projet supprimé avec succès');
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      alert('❌ Erreur lors de la suppression: ' + error.message);
    }
  };

  // Fonctions utilitaires
  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const calculateProgress = (project) => {
    if (project.progress !== undefined) {
      return project.progress;
    }
    
    const projectTasks = getProjectTasks(project.id);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-gray-500',
      active: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      validation_pending: 'bg-orange-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-gray-400'
    };
    return colors[status] || colors.active;
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Planification',
      active: 'En cours',
      on_hold: 'En pause',
      validation_pending: 'En validation',
      completed: 'Terminé',
      rejected: 'Rejeté',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.normal;
  };

  const addFormField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const updateFormField = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const removeFormField = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Filtrage et tri des projets
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'progress') {
        aValue = calculateProgress(a);
        bValue = calculateProgress(b);
      }
      
      if (sortBy === 'createdAt') {
        aValue = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        bValue = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'validation_pending').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des projets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Gestion de Projets
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez, suivez et collaborez sur vos projets
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Projet
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Projets</p>
              <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{projectStats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">{projectStats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Validation</p>
              <p className="text-2xl font-bold text-gray-900">{projectStats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles de filtrage et tri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="planning">Planification</option>
              <option value="active">En cours</option>
              <option value="on_hold">En pause</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Date création</option>
              <option value="title">Nom</option>
              <option value="priority">Priorité</option>
              <option value="progress">Progression</option>
              <option value="endDate">Date limite</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Sélecteur de vue */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Grille
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm border-l border-gray-300 ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Aucun projet trouvé' 
              : 'Aucun projet créé'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Créez votre premier projet pour commencer à organiser vos tâches'}
          </p>
          {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer mon premier projet
            </button>
          )}
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProjects.map((project) => {
            const progress = calculateProgress(project);
            const projectTasks = getProjectTasks(project.id);
            
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={view === 'grid' 
                  ? "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  : "bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-6 hover:shadow-md transition-shadow"
                }
              >
                {/* Vue grille */}
                {view === 'grid' ? (
                  <>
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {project.title}
                          </h3>
                          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority === 'low' && '🔹 Basse'}
                            {project.priority === 'normal' && '🔸 Normale'}
                            {project.priority === 'high' && '🔶 Haute'}
                            {project.priority === 'urgent' && '🔴 Urgente'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{getStatusLabel(project.status)}</span>
                        </div>
                      </div>
                      
                      {/* Menu actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowProjectDetail(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setFormData({
                              title: project.title || '',
                              description: project.description || '',
                              priority: project.priority || 'normal',
                              category: project.category || '',
                              startDate: project.startDate || '',
                              endDate: project.endDate || '',
                              estimatedHours: project.estimatedHours || '',
                              budget: project.budget || '',
                              tags: project.tags || [],
                              objectives: project.objectives || [''],
                              deliverables: project.deliverables || ['']
                            });
                            setShowCreateForm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'Aucune description'}
                    </p>

                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Tâches:</span>
                        <span className="font-medium">
                          {project.completedTaskCount || 0}/{project.taskCount || 0}
                        </span>
                      </div>
                      
                      {project.endDate && (
                        <div className="flex items-center justify-between">
                          <span>Échéance:</span>
                          <span className="font-medium">
                            {new Date(project.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span>Créé le:</span>
                        <span className="font-medium">
                          {project.createdAt?.toDate ? 
                            project.createdAt.toDate().toLocaleDateString('fr-FR') :
                            new Date(project.createdAt).toLocaleDateString('fr-FR')
                          }
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{project.tags.length - 3} tags
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions rapides */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      {project.status === 'active' && (
                        <button
                          onClick={() => handleUpdateProjectStatus(project.id, 'on_hold')}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </button>
                      )}
                      
                      {project.status === 'on_hold' && (
                        <button
                          onClick={() => handleUpdateProjectStatus(project.id, 'active')}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Reprendre
                        </button>
                      )}
                      
                      {(project.status === 'active' || project.status === 'on_hold') && (
                        <button
                          onClick={() => handleUpdateProjectStatus(project.id, 'validation_pending')}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Terminer
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // Vue liste
                  <>
                    {/* Indicateur statut */}
                    <div className={`w-1 h-12 rounded-full ${getStatusColor(project.status)}`}></div>
                    
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority === 'urgent' && '🔴 URGENT'}
                          {project.priority === 'high' && '🔶 HAUTE'}
                          {project.priority === 'normal' && '🔸 NORMALE'}
                          {project.priority === 'low' && '🔹 BASSE'}
                        </span>
                        <span className="text-sm text-gray-500">{getStatusLabel(project.status)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {project.description || 'Aucune description'}
                      </p>
                    </div>
                    
                    {/* Progression */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Progression</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectDetail(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setFormData({...project});
                          setShowCreateForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL CRÉATION/ÉDITION PROJET */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleCreateProject} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Colonne gauche */}
                  <div className="space-y-4">
                    
                    {/* Titre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du projet *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom du projet"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description détaillée du projet"
                      />
                    </div>

                    {/* Priorité et Catégorie */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priorité
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">🔹 Basse</option>
                          <option value="normal">🔸 Normale</option>
                          <option value="high">🔶 Haute</option>
                          <option value="urgent">🔴 Urgente</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ex: Développement, Marketing..."
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite */}
                  <div className="space-y-4">
                    
                    {/* Estimation et Budget */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heures estimées
                        </label>
                        <input
                          type="number"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData(prev => ({...prev, estimatedHours: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget (€)
                        </label>
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({...prev, budget: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Objectifs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Objectifs
                      </label>
                      <div className="space-y-2">
                        {formData.objectives.map((objective, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={objective}
                              onChange={(e) => updateFormField('objectives', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Objectif du projet"
                            />
                            {formData.objectives.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFormField('objectives', index)}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addFormField('objectives')}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                          + Ajouter un objectif
                        </button>
                      </div>
                    </div>

                    {/* Livrables */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Livrables attendus
                      </label>
                      <div className="space-y-2">
                        {formData.deliverables.map((deliverable, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={deliverable}
                              onChange={(e) => updateFormField('deliverables', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Livrable du projet"
                            />
                            {formData.deliverables.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFormField('deliverables', index)}
                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addFormField('deliverables')}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                          + Ajouter un livrable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={submitting}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {selectedProject ? 'Mettre à jour' : 'Créer le projet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
