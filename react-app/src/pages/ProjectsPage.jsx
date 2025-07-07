// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// SYSTÈME DE GESTION DE PROJETS COMPLET - VERSION ENRICHIE
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
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';
import { userService } from '../core/services/userService.js';
import { taskService } from '../core/services/taskService.js';
import { Toast } from '../shared/components/ui/Toast.jsx';

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
      const [projectsData, usersData, tasksData] = await Promise.all([
        projectService.getUserProjects(user.uid),
        userService.getAllUsers(),
        taskService.getUserTasks(user.uid)
      ]);
      
      setProjects(projectsData || []);
      setAllUsers(usersData || []);
      setTasks(tasksData || []);
      
      console.log('✅ Données projets chargées:', {
        projects: projectsData?.length || 0,
        users: usersData?.length || 0,
        tasks: tasksData?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données projets:', error);
      Toast.show('Erreur lors du chargement des projets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      Toast.show('Le titre du projet est requis', 'error');
      return;
    }

    try {
      console.log('🆕 Création nouveau projet:', formData.title);
      
      const projectData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
        objectives: formData.objectives.filter(obj => obj.trim()),
        deliverables: formData.deliverables.filter(del => del.trim())
      };
      
      await projectService.createProject(projectData, user.uid);
      
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
      
      Toast.show('Projet créé avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      Toast.show('Erreur lors de la création du projet', 'error');
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await projectService.updateProject(projectId, { status: newStatus }, user.uid);
      await loadAllData();
      Toast.show('Statut du projet mis à jour', 'success');
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      Toast.show('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    try {
      await projectService.deleteProject(projectId, user.uid);
      await loadAllData();
      Toast.show('Projet supprimé avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      Toast.show('Erreur lors de la suppression', 'error');
    }
  };

  const handleAddMember = async (projectId, memberId) => {
    try {
      await projectService.addMember(projectId, user.uid, memberId);
      await loadAllData();
      Toast.show('Membre ajouté au projet', 'success');
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      Toast.show('Erreur lors de l\'ajout du membre', 'error');
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
      </div>sm text-gray-600">Total Projets</p>
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
              <p className="text-
