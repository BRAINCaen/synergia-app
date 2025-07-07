// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// CODE COMPLET - Remplacer entièrement le fichier existant
// AVEC INTÉGRATION DASHBOARD AVANCÉ
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
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  BarChart3,
  Settings,
  X,
  AlertCircle,
  TrendingUp,
  Award,
  Flag
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';
import { taskService } from '../core/services/taskService.js';

// ✅ IMPORT DU NOUVEAU DASHBOARD AVANCÉ
import AdvancedProjectDashboard from '../components/projects/AdvancedProjectDashboard.jsx';

/**
 * ✅ PAGE PROJETS AVEC DASHBOARD AVANCÉ INTÉGRÉ
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // États UI - Modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false); // ✅ NOUVEAU
  const [selectedProject, setSelectedProject] = useState(null);
  
  // États UI - Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [view, setView] = useState('grid');
  
  // États formulaire
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
    objectives: [],
    deliverables: []
  });

  // Charger toutes les données au démarrage
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
      console.log('🔄 Chargement données projets et tâches...');
      
      const [userProjects, userTasks] = await Promise.all([
        projectService.getUserProjects(user.uid),
        taskService.getUserTasks(user.uid)
      ]);
      
      setProjects(userProjects || []);
      setAllTasks(userTasks || []);
      
      console.log('✅ Données chargées:', {
        projets: userProjects?.length || 0,
        tâches: userTasks?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
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

  // ===============================================
  // 🎯 NOUVELLE FONCTION - OUVRIR DASHBOARD AVANCÉ
  // ===============================================
  const openAdvancedDashboard = (project) => {
    console.log('📊 Ouverture Dashboard Avancé pour:', project.title);
    setSelectedProject(project);
    setShowAdvancedDashboard(true);
  };

  const closeAdvancedDashboard = () => {
    console.log('❌ Fermeture Dashboard Avancé');
    setShowAdvancedDashboard(false);
    setSelectedProject(null);
    // Recharger les données pour synchroniser
    loadAllData();
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
      
      // ✅ CORRECTION: Vérifier si c'est une modification ou création
      if (selectedProject && selectedProject.id) {
        console.log('🔄 Modification projet existant:', selectedProject.id);
        
        // Modifier le projet existant
        const result = await projectService.updateProject(selectedProject.id, projectData, user.uid);
        
        if (result.success) {
          console.log('✅ Projet modifié avec succès');
          alert('✅ Projet modifié avec succès !');
        } else {
          throw new Error(result.error || 'Erreur lors de la modification');
        }
      } else {
        console.log('🆕 Création nouveau projet:', formData.title);
        
        // Créer un nouveau projet
        const result = await projectService.createProject(projectData, user.uid);
        
        if (result.success) {
          console.log('✅ Projet créé avec succès:', result.project?.id);
          alert('✅ Projet créé avec succès !');
        } else {
          throw new Error(result.error || 'Erreur lors de la création');
        }
      }
      
      // Fermer le formulaire et recharger
      setShowCreateForm(false);
      setSelectedProject(null);
      resetForm();
      await loadAllData();
      
    } catch (error) {
      console.error('❌ Erreur gestion projet:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = (project) => {
    console.log('✏️ Édition projet:', project.title);
    
    setSelectedProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      priority: project.priority || 'normal',
      category: project.category || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      estimatedHours: project.estimatedHours || '',
      budget: project.budget || '',
      tags: project.tags || [],
      objectives: project.objectives || [],
      deliverables: project.deliverables || []
    });
    setShowCreateForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      console.log('🗑️ Suppression projet:', projectId);
      
      const result = await projectService.deleteProject(projectId, user.uid);
      
      if (result.success) {
        console.log('✅ Projet supprimé avec succès');
        alert('✅ Projet supprimé avec succès');
        await loadAllData();
      } else {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
      
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  const resetForm = () => {
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
      objectives: [],
      deliverables: []
    });
  };

  // Calcul de la progression d'un projet
  const calculateProgress = (project) => {
    if (!project.taskCount || project.taskCount === 0) return 0;
    return Math.round((project.completedTaskCount || 0) / project.taskCount * 100);
  };

  // Obtenir les tâches d'un projet
  const getProjectTasks = (projectId) => {
    return allTasks.filter(task => task.projectId === projectId);
  };

  // Obtenir le statut visuel du projet
  const getProjectStatus = (project) => {
    const progress = calculateProgress(project);
    const now = new Date();
    const endDate = project.endDate ? new Date(project.endDate) : null;
    
    if (progress === 100) {
      return { label: 'Terminé', color: 'bg-green-500', textColor: 'text-green-700' };
    }
    
    if (endDate && now > endDate) {
      return { label: 'En retard', color: 'bg-red-500', textColor: 'text-red-700' };
    }
    
    if (progress > 0) {
      return { label: 'En cours', color: 'bg-blue-500', textColor: 'text-blue-700' };
    }
    
    return { label: 'Planifié', color: 'bg-gray-500', textColor: 'text-gray-700' };
  };

  // Filtrage et tri des projets
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
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
      
      {/* =============================================== */}
      {/* 🚀 MODAL DASHBOARD AVANCÉ */}
      {/* =============================================== */}
      <AnimatePresence>
        {showAdvancedDashboard && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4">
              {/* Bouton fermer */}
              <button
                onClick={closeAdvancedDashboard}
                className="fixed top-4 right-4 z-60 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors shadow-lg"
                title="Fermer le dashboard"
              >
                <X size={20} />
              </button>
              
              {/* Dashboard avancé */}
              <div className="max-w-7xl mx-auto">
                <AdvancedProjectDashboard 
                  projectId={selectedProject.id}
                  onClose={closeAdvancedDashboard}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projets</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches Totales</p>
              <p className="text-2xl font-bold text-gray-900">{allTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="on_hold">En pause</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Faible</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
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
            const status = getProjectStatus(project);
            
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={view === 'grid' 
                  ? "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  : "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                }
              >
                {/* En-tête du projet */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color} text-white`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {/* ✅ NOUVEAU BOUTON - DASHBOARD AVANCÉ */}
                    <button
                      onClick={() => openAdvancedDashboard(project)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Dashboard Avancé"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDetail(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                        new Date(project.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de création/édition de projet */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProject ? 'Modifier le projet' : 'Nouveau projet'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedProject(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du projet *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Développement application mobile"
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
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Décrivez les objectifs et le contexte du projet..."
                    />
                  </div>

                  {/* Priorité et Catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priorité
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Faible</option>
                        <option value="normal">Normale</option>
                        <option value="high">Haute</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Développement, Marketing, Design..."
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin prévue
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Estimation et Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heures estimées
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 120"
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
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 5000"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setSelectedProject(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {selectedProject ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          {selectedProject ? 'Modifier le projet' : 'Créer le projet'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
