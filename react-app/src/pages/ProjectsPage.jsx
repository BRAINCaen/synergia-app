// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PAGE COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS ORIGINALES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Target,
  Clock,
  Star,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Settings,
  Share2,
  Download,
  Award,
  Zap,
  UserPlus,
  FileText,
  Flag,
  Upload,
  Archive,
  Copy,
  BarChart3,
  Activity,
  GitBranch,
  Layers,
  PieChart,
  Grid,
  List,
  Kanban,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';

// Hook sécurisé pour les projets Firebase
const useProjectService = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Charger les projets utilisateur depuis Firebase
  const loadUserProjects = useCallback(async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement projets Firebase pour:', userId);
      
      // Utiliser directement le service sans import circulaire
      if (projectService && projectService.getUserProjects) {
        const userProjects = await projectService.getUserProjects(userId);
        console.log('✅ Projets chargés:', userProjects?.length || 0);
        setProjects(userProjects || []);
      } else {
        // Fallback avec données de démonstration
        console.log('⚠️ Service non disponible, utilisation de données de démo');
        setProjects([]);
      }
      
    } catch (err) {
      console.error('❌ Erreur chargement projets:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Créer un nouveau projet
  const createProject = useCallback(async (projectData) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      console.log('🚀 Création projet:', projectData.title);
      
      if (projectService && projectService.createProject) {
        const newProject = await projectService.createProject(projectData, user.uid);
        setProjects(prev => [newProject, ...prev]);
        console.log('✅ Projet créé avec succès');
        return newProject;
      } else {
        throw new Error('Service de création non disponible');
      }
      
    } catch (err) {
      console.error('❌ Erreur création projet:', err);
      throw err;
    }
  }, [user?.uid]);
  
  // Mettre à jour un projet
  const updateProject = useCallback(async (projectId, updates) => {
    try {
      console.log('🔄 Mise à jour projet:', projectId);
      
      if (projectService && projectService.updateProject) {
        const updatedProject = await projectService.updateProject(projectId, updates);
        
        // Mettre à jour la liste locale
        setProjects(prev => prev.map(project => {
          if (project.id === projectId) {
            return { ...project, ...updatedProject };
          }
          return project;
        }));
        
        console.log('✅ Projet mis à jour');
        return updatedProject;
      } else {
        throw new Error('Service de mise à jour non disponible');
      }
      
    } catch (err) {
      console.error('❌ Erreur mise à jour projet:', err);
      throw err;
    }
  }, []);
  
  // Supprimer un projet
  const deleteProject = useCallback(async (projectId) => {
    try {
      console.log('🗑️ Suppression projet:', projectId);
      
      if (projectService && projectService.deleteProject) {
        await projectService.deleteProject(projectId);
        
        // Retirer de la liste locale
        setProjects(prev => prev.filter(project => project.id !== projectId));
        
        console.log('✅ Projet supprimé');
      } else {
        throw new Error('Service de suppression non disponible');
      }
      
    } catch (err) {
      console.error('❌ Erreur suppression projet:', err);
      throw err;
    }
  }, []);
  
  return {
    projects,
    loading,
    error,
    loadUserProjects,
    createProject,
    updateProject,
    deleteProject
  };
};

// Composant modal pour créer/éditer un projet
const ProjectForm = ({ isOpen, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    priority: project?.priority || 'normal',
    category: project?.category || 'web-app',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    tags: project?.tags?.join(', ') || '',
    budget: project?.budget || 0,
    client: project?.client || '',
    repository: project?.repository || ''
  });
  
  const [saving, setSaving] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setSaving(true);
    try {
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        budget: parseFloat(formData.budget) || 0,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      await onSave(projectData);
      onClose();
    } catch (error) {
      console.error('❌ Erreur sauvegarde projet:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Folder className="mr-3 text-blue-400" />
          {project ? 'Modifier le projet' : 'Nouveau projet'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
                Informations générales
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Ex: Application mobile..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="web-app">Application Web</option>
                  <option value="mobile-app">Application Mobile</option>
                  <option value="api">API / Backend</option>
                  <option value="documentation">Documentation</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="design">Design / UI</option>
                  <option value="marketing">Marketing</option>
                  <option value="research">Recherche</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client / Équipe
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                  placeholder="Ex: Équipe Marketing..."
                />
              </div>
            </div>
            
            {/* Détails techniques */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">
                Détails techniques
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget (€)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                  min="0"
                  step="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de fin prévue
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository Git
                </label>
                <input
                  type="url"
                  value={formData.repository}
                  onChange={(e) => setFormData({...formData, repository: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>
          
          {/* Description complète */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description détaillée
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400 resize-none"
              placeholder="Décrivez les objectifs, fonctionnalités et contraintes du projet..."
            />
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
              placeholder="urgent, client-facing, innovation..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : (project ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant carte de projet
const ProjectCard = ({ project, onEdit, onDelete, onView, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'normal': return 'text-blue-400 bg-blue-500/10';
      case 'low': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(project)}
    >
      {/* Header avec statut et menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(project);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>Voir détails</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Modifier</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
                    onDelete(project.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {project.description || 'Aucune description'}
      </p>
      
      {/* Informations du projet */}
      <div className="space-y-3 mb-4">
        {/* Priorité et catégorie */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
            {project.priority === 'urgent' ? 'Urgente' : 
             project.priority === 'high' ? 'Haute' :
             project.priority === 'normal' ? 'Normale' : 'Basse'}
          </span>
          <span className="text-xs text-gray-500">{project.category}</span>
        </div>
        
        {/* Progression */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progression</span>
            <span className="text-xs text-gray-400">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
        
        {/* Tâches */}
        {project.taskCount !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Tâches</span>
            <span className="text-gray-300">
              {project.completedTaskCount || 0} / {project.taskCount || 0}
            </span>
          </div>
        )}
        
        {/* Dates */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Échéance</span>
          <span className="text-gray-300">{formatDate(project.endDate)}</span>
        </div>
      </div>
      
      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Footer avec équipe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users size={16} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {project.members?.length || 1} membre{(project.members?.length || 1) > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock size={14} />
          <span>Mis à jour {formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 📁 PROJECTS PAGE COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, loading, error, createProject, updateProject, deleteProject, loadUserProjects } = useProjectService();
  
  // États UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  
  // États des modals
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Charger les projets au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserProjects(user.uid);
    }
  }, [user?.uid]);
  
  // Afficher l'erreur s'il y en a une
  useEffect(() => {
    if (error) {
      console.error('❌ Erreur ProjectsPage:', error);
    }
  }, [error]);
  
  // Filtrer et trier les projets
  const filteredProjects = projects.filter(project => {
    // Filtre par terme de recherche
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par statut
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    // Filtre par priorité
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    // Filtre par catégorie
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    // Tri par critère sélectionné
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'priority':
        const priorities = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      default:
        return 0;
    }
  });
  
  // Calculer les statistiques
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    avgProgress: projects.length > 0 ? 
      Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
  };
  
  // Gestionnaires d'événements
  const handleCreateProject = async (projectData) => {
    try {
      const result = await createProject(projectData);
      if (result && !result.success) {
        console.error('❌ Erreur création:', result.error);
        return;
      }
      setShowProjectForm(false);
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
    }
  };
  
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };
  
  const handleUpdateProject = async (projectData) => {
    if (!editingProject) return;
    
    try {
      const result = await updateProject(editingProject.id, projectData);
      if (result && !result.success) {
        console.error('❌ Erreur mise à jour:', result.error);
        return;
      }
      setEditingProject(null);
      setShowProjectForm(false);
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
    }
  };
  
  const handleDeleteProject = async (projectId) => {
    try {
      const result = await deleteProject(projectId);
      if (result && !result.success) {
        console.error('❌ Erreur suppression:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
    }
  };
  
  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };
  
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <PremiumLayout>
      <div className="space-y-6">
        {/* Header avec titre et actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Folder className="mr-3 text-blue-400" />
              Mes Projets
            </h1>
            <p className="text-gray-400 mt-1">
              Gérez vos projets et suivez leur progression
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {/* Boutons de vue */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            
            <PremiumButton
              onClick={() => setShowProjectForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Nouveau Projet
            </PremiumButton>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<Folder className="text-blue-400" />}
            color="blue"
          />
          <StatCard
            title="Actifs"
            value={stats.active}
            icon={<Play className="text-green-400" />}
            color="green"
          />
          <StatCard
            title="Terminés"
            value={stats.completed}
            icon={<CheckCircle className="text-blue-400" />}
            color="blue"
          />
          <StatCard
            title="En pause"
            value={stats.onHold}
            icon={<Pause className="text-yellow-400" />}
            color="yellow"
          />
          <StatCard
            title="Progression Moy."
            value={`${stats.avgProgress}%`}
            icon={<TrendingUp className="text-purple-400" />}
            color="purple"
          />
        </div>
        
        {/* Barre de recherche et filtres */}
        <PremiumCard>
          <div className="space-y-4">
            {/* Recherche */}
            <PremiumSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par nom, description ou tags..."
              className="w-full"
            />
            
            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="on_hold">En pause</option>
                  <option value="completed">Terminés</option>
                  <option value="cancelled">Annulés</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="all">Toutes</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Haute</option>
                  <option value="normal">Normale</option>
                  <option value="low">Basse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="all">Toutes</option>
                  <option value="web-app">Application Web</option>
                  <option value="mobile-app">Application Mobile</option>
                  <option value="api">API / Backend</option>
                  <option value="documentation">Documentation</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="design">Design / UI</option>
                  <option value="marketing">Marketing</option>
                  <option value="research">Recherche</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                >
                  <option value="updated">Dernière mise à jour</option>
                  <option value="created">Date de création</option>
                  <option value="title">Nom (A-Z)</option>
                  <option value="priority">Priorité</option>
                  <option value="progress">Progression</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterCategory('all');
                    setSortBy('updated');
                  }}
                  className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </PremiumCard>
        
        {/* Liste des projets */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-400">Chargement des projets...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <PremiumCard>
              <div className="text-center py-12">
                <Folder size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {projects.length === 0 ? 'Aucun projet' : 'Aucun projet trouvé'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {projects.length === 0 
                    ? 'Commencez par créer votre premier projet'
                    : 'Essayez de modifier vos critères de recherche'
                  }
                </p>
                {projects.length === 0 && (
                  <PremiumButton
                    onClick={() => setShowProjectForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={20} className="mr-2" />
                    Créer mon premier projet
                  </PremiumButton>
                )}
              </div>
            </PremiumCard>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onView={handleViewProject}
                  onClick={handleProjectClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de création/édition de projet */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
      />
    </PremiumLayout>
  );
};

export default ProjectsPage;
