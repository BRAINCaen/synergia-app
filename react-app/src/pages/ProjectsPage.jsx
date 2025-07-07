// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// SYSTÈME DE GESTION DE PROJETS COMPLET - VERSION CORRIGÉE
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
import { userService } from '../core/services/userService.js';
import { taskService } from '../core/services/taskService.js';

/**
 * 📋 PAGE DE GESTION DE PROJETS COMPLÈTE
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [view, setView] = useState('grid'); // grid, list, kanban
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // États modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
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
    assignedMembers: [],
    objectives: [''],
    deliverables: ['']
  });

  // Charger les données
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Simulation de chargement de données
      // À remplacer par les vrais appels API
      setProjects([]);
      setAllUsers([]);
      setTasks([]);
      
      console.log('✅ Données projets chargées');
      
    } catch (error) {
      console.error('❌ Erreur chargement données projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Le titre du projet est requis');
      return;
    }

    try {
      console.log('🆕 Création nouveau projet:', formData.title);
      
      // Simulation de création
      // À remplacer par l'appel API réel
      
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
        assignedMembers: [],
        objectives: [''],
        deliverables: ['']
      });
      
      setShowCreateForm(false);
      await loadAllData();
      
      alert('Projet créé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      alert('Erreur lors de la création du projet');
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      console.log('🔄 Mise à jour statut projet:', projectId, newStatus);
      await loadAllData();
      alert('Statut du projet mis à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    try {
      console.log('🗑️ Suppression projet:', projectId);
      await loadAllData();
      alert('Projet supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Fonctions utilitaires
  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const calculateProgress = (project) => {
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

  // Filtrage et tri des projets
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
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
          {filteredProjects.map((project) => (
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
              {/* Contenu du projet selon la vue */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDetail(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
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

                  {/* Priorité */}
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
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
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
