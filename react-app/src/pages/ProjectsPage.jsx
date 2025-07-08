// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// CORRECTION React Error #31 - VERSION SAFE
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
import { taskProjectIntegration } from '../core/services/taskProjectIntegration.js';

// ✅ IMPORT DU NOUVEAU DASHBOARD AVANCÉ
import AdvancedProjectDashboard from '../components/projects/AdvancedProjectDashboard.jsx';

/**
 * ✅ FONCTION SAFE POUR CALCULER LA PROGRESSION
 * Évite React Error #31 en retournant toujours un nombre
 */
const safeCalculateProgress = (project) => {
  try {
    // Si progress est déjà un nombre
    if (typeof project.progress === 'number') {
      return Math.max(0, Math.min(100, Math.round(project.progress)));
    }
    
    // Si progressPercentage est défini
    if (typeof project.progressPercentage === 'number') {
      return Math.max(0, Math.min(100, Math.round(project.progressPercentage)));
    }
    
    // Si completion est défini
    if (typeof project.completion === 'number') {
      return Math.max(0, Math.min(100, Math.round(project.completion)));
    }
    
    // Si c'est un objet avec des propriétés (éviter React Error #31)
    if (typeof project.progress === 'object' && project.progress) {
      if (typeof project.progress.percentage === 'number') {
        return Math.max(0, Math.min(100, Math.round(project.progress.percentage)));
      }
      if (typeof project.progress.completed === 'number' && typeof project.progress.total === 'number') {
        return project.progress.total > 0 ? Math.round((project.progress.completed / project.progress.total) * 100) : 0;
      }
    }
    
    // Fallback sur les compteurs de tâches
    const totalTasks = project.totalTasks || 0;
    const completedTasks = project.completedTasks || project.completedTaskCount || 0;
    
    if (totalTasks > 0) {
      return Math.max(0, Math.min(100, Math.round((completedTasks / totalTasks) * 100)));
    }
    
    // Fallback sécurisé
    return 0;
    
  } catch (error) {
    console.warn('⚠️ Erreur calcul progression:', error, project);
    return 0;
  }
};

/**
 * ✅ FONCTION SAFE POUR OBTENIR LE STATUT
 */
const safeGetProjectStatus = (project) => {
  try {
    const progress = safeCalculateProgress(project);
    const now = new Date();
    
    let endDate = null;
    try {
      if (project.endDate) {
        if (project.endDate.toDate) {
          endDate = project.endDate.toDate();
        } else if (typeof project.endDate === 'string' || project.endDate instanceof Date) {
          endDate = new Date(project.endDate);
        }
      }
    } catch (dateError) {
      console.warn('⚠️ Erreur parsing date:', dateError);
      endDate = null;
    }
    
    if (progress === 100) {
      return { label: 'Terminé', color: 'bg-green-500' };
    } else if (endDate && now > endDate) {
      return { label: 'En retard', color: 'bg-red-500' };
    } else if (progress > 75) {
      return { label: 'Presque fini', color: 'bg-blue-500' };
    } else if (progress > 25) {
      return { label: 'En cours', color: 'bg-yellow-500' };
    } else {
      return { label: 'Démarré', color: 'bg-gray-500' };
    }
  } catch (error) {
    console.warn('⚠️ Erreur calcul statut:', error);
    return { label: 'Inconnu', color: 'bg-gray-400' };
  }
};

/**
 * ✅ FONCTION SAFE POUR LES DATES
 */
const safeFormatDate = (date) => {
  try {
    if (!date) return 'Non définie';
    
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (typeof date === 'string' || date instanceof Date) {
      dateObj = new Date(date);
    } else {
      return 'Non définie';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    return dateObj.toLocaleDateString('fr-FR');
  } catch (error) {
    console.warn('⚠️ Erreur format date:', error);
    return 'Erreur date';
  }
};

/**
 * ✅ PAGE PROJETS AVEC TOUTES LES CORRECTIONS
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
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // États UI - Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // États du formulaire
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

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      setupRealTimeListeners();
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
      
      // ✅ VALIDATION DES DONNÉES AVANT setState
      const safeProjects = (userProjects || []).map(project => ({
        ...project,
        // S'assurer que tous les champs numériques sont des nombres
        progress: typeof project.progress === 'number' ? project.progress : 0,
        totalTasks: parseInt(project.totalTasks) || 0,
        completedTasks: parseInt(project.completedTasks) || parseInt(project.completedTaskCount) || 0
      }));
      
      setProjects(safeProjects);
      setAllTasks(userTasks || []);
      
      console.log('✅ Données chargées:', {
        projets: safeProjects.length,
        tâches: (userTasks || []).length
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeListeners = async () => {
    if (!user?.uid) return;
    
    try {
      // Écouter les changements de projets en temps réel
      const unsubscribe = await projectService.subscribeToUserProjects(user.uid, (updatedProjects) => {
        console.log('🔄 Mise à jour temps réel des projets:', updatedProjects.length);
        
        // ✅ VALIDATION DES DONNÉES EN TEMPS RÉEL
        const safeUpdatedProjects = (updatedProjects || []).map(project => ({
          ...project,
          progress: typeof project.progress === 'number' ? project.progress : 0,
          totalTasks: parseInt(project.totalTasks) || 0,
          completedTasks: parseInt(project.completedTasks) || parseInt(project.completedTaskCount) || 0
        }));
        
        setProjects(safeUpdatedProjects);
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
  // 🔄 FONCTION DE SYNCHRONISATION MANUELLE
  // ===============================================
  const handleSyncProjects = async () => {
    if (!user?.uid) return;
    
    setSubmitting(true);
    try {
      console.log('🔄 Synchronisation manuelle des projets...');
      
      // Synchroniser tous les projets de l'utilisateur
      const result = await taskProjectIntegration.syncAllUserProjects(user.uid);
      
      if (result.success) {
        console.log(`✅ Synchronisation terminée: ${result.successCount}/${result.totalProjects} projets`);
        
        // Recharger les données
        await loadAllData();
        
        alert(`✅ Synchronisation terminée !\n${result.successCount} projet(s) synchronisé(s) sur ${result.totalProjects}`);
      } else {
        throw new Error(result.error || 'Erreur de synchronisation');
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation manuelle:', error);
      alert(`❌ Erreur de synchronisation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================================
  // 🎯 FONCTIONS DASHBOARD AVANCÉ
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
      
      if (selectedProject && selectedProject.id) {
        console.log('🔄 Modification projet existant:', selectedProject.id);
        
        const result = await projectService.updateProject(selectedProject.id, projectData, user.uid);
        
        if (result.success) {
          console.log('✅ Projet modifié avec succès');
          alert('✅ Projet modifié avec succès !');
        } else {
          throw new Error(result.error || 'Erreur lors de la modification');
        }
      } else {
        console.log('🆕 Création nouveau projet:', formData.title);
        
        const result = await projectService.createProject(projectData, user.uid);
        
        if (result.success) {
          console.log('✅ Projet créé avec succès:', result.project?.id);
          alert('✅ Projet créé avec succès !');
        } else {
          throw new Error(result.error || 'Erreur lors de la création');
        }
      }
      
      setShowCreateForm(false);
      setSelectedProject(null);
      resetForm();
      await loadAllData();
      
    } catch (error) {
      console.error('❌ Erreur traitement projet:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = (project) => {
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

  // Obtenir les tâches d'un projet
  const getProjectTasks = (projectId) => {
    return allTasks.filter(task => task.projectId === projectId);
  };

  // Filtrer les projets selon les critères
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
              <button
                onClick={closeAdvancedDashboard}
                className="fixed top-4 right-4 z-60 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors shadow-lg"
                title="Fermer le dashboard"
              >
                <X size={20} />
              </button>
              
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

      {/* Header avec bouton de synchronisation */}
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncProjects}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            title="Synchroniser les statistiques des projets"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>Sync</span>
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>
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
                {projects.filter(p => {
                  const progress = safeCalculateProgress(p);
                  return progress > 0 && progress < 100;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => safeCalculateProgress(p) === 100).length}
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
              <p className="text-2xl font-bold text-gray-900">
                {projects.reduce((sum, p) => sum + (parseInt(p.totalTasks) || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des projets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="paused">En pause</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Mes Projets ({filteredProjects.length})
          </h3>
        </div>
        
        {filteredProjects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 
                'Aucun projet ne correspond à vos critères de recherche.' :
                'Vous n\'avez pas encore créé de projet.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer mon premier projet
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6" : 
            "divide-y divide-gray-200"
          }>
            {filteredProjects.map((project) => {
              const progress = safeCalculateProgress(project);
              const status = safeGetProjectStatus(project);
              const projectTasks = getProjectTasks(project.id);
              
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-500">Tâches</p>
                      <p className="font-medium text-gray-900">
                        {parseInt(project.completedTasks) || parseInt(project.completedTaskCount) || 0}/{parseInt(project.totalTasks) || projectTasks.length}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Échéance</p>
                      <p className="font-medium text-gray-900 text-xs">
                        {safeFormatDate(project.endDate)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Créé le</p>
                      <p className="font-medium text-gray-900 text-xs">
                        {safeFormatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création/édition (simplifié pour éviter d'autres erreurs) */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedProject ? 'Modifier le projet' : 'Nouveau projet'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedProject(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du projet *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Refonte du site web"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez les objectifs..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedProject(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
