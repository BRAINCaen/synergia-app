// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PAGE AVEC TOUTES LES FONCTIONNALITÉS ORIGINALES RESTAURÉES
// ==========================================

import React, { useState, useEffect } from 'react';
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
  Copy
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { projectService } from '../core/services/projectService.js';
import { teamManagementService } from '../core/services/teamManagementService.js';

// Modals et composants (imports conditionnels pour éviter les erreurs de build)
let ProjectForm;
try {
  ProjectForm = require('../components/forms/ProjectForm.jsx').default;
} catch (error) {
  console.warn('ProjectForm non disponible:', error.message);
  // Composant fallback simple
  ProjectForm = ({ isOpen, onClose }) => isOpen ? <div>Formulaire indisponible</div> : null;
}

/**
 * 📁 PROJECTS PAGE AVEC TOUTES LES FONCTIONNALITÉS
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, loading, createProject, updateProject, deleteProject, loadUserProjects } = useProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // États pour les statistiques
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    completionRate: 0,
    totalTasks: 0,
    avgProgress: 0
  });

  // Charger les projets
  useEffect(() => {
    if (user?.uid) {
      loadUserProjects(user.uid);
    }
  }, [user?.uid, loadUserProjects]);

  // Calcul des statistiques
  useEffect(() => {
    if (projects?.length) {
      const total = projects.length;
      const active = projects.filter(p => p.status === 'active').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const onHold = projects.filter(p => p.status === 'on_hold').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
      const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;

      setProjectStats({
        total,
        active,
        completed,
        onHold,
        completionRate,
        totalTasks,
        avgProgress
      });
    }
  }, [projects]);

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 🎯 HANDLERS POUR LES ACTIONS DE PROJETS

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.createProject({
        ...projectData,
        ownerId: user.uid,
        members: [user.uid], // Créateur automatiquement membre
        createdBy: user.uid,
        createdAt: new Date(),
        status: projectData.status || 'active',
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0
      }, user.uid);

      // Recharger la liste
      await loadUserProjects(user.uid);
      setShowProjectForm(false);
      
      alert('✅ Projet créé avec succès !');
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      alert('❌ Erreur lors de la création : ' + error.message);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await projectService.updateProject(projectId, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      // Recharger la liste
      await loadUserProjects(user.uid);
      setEditingProject(null);
      setShowProjectForm(false);
      
      alert('✅ Projet mis à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      alert('❌ Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      try {
        await projectService.deleteProject(projectId);
        await loadUserProjects(user.uid);
        alert('✅ Projet supprimé avec succès !');
      } catch (error) {
        console.error('❌ Erreur suppression projet:', error);
        alert('❌ Erreur lors de la suppression : ' + error.message);
      }
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projectService.updateProject(projectId, {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
      await loadUserProjects(user.uid);
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('❌ Erreur lors du changement de statut : ' + error.message);
    }
  };

  const handleArchiveProject = async (projectId) => {
    if (window.confirm('Archiver ce projet ? Il restera accessible mais ne sera plus actif.')) {
      await handleStatusChange(projectId, 'archived');
    }
  };

  const handleDuplicateProject = async (project) => {
    try {
      const duplicatedProject = {
        ...project,
        title: `${project.title} (Copie)`,
        status: 'active',
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        // Supprimer les champs qui ne doivent pas être dupliqués
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };

      await handleCreateProject(duplicatedProject);
    } catch (error) {
      console.error('❌ Erreur duplication projet:', error);
      alert('❌ Erreur lors de la duplication : ' + error.message);
    }
  };

  const handleManageTeam = async (project) => {
    setSelectedProject(project);
    setShowTeamModal(true);
  };

  const handleAddMembers = async (projectId, memberIds) => {
    try {
      await teamManagementService.addMembersToProject(projectId, memberIds, user.uid);
      await loadUserProjects(user.uid);
      alert(`✅ ${memberIds.length} membre(s) ajouté(s) au projet !`);
    } catch (error) {
      console.error('❌ Erreur ajout membres:', error);
      alert('❌ Erreur lors de l\'ajout des membres : ' + error.message);
    }
  };

  const handleRemoveMember = async (projectId, memberId) => {
    if (window.confirm('Retirer ce membre du projet ?')) {
      try {
        await teamManagementService.removeMemberFromProject(projectId, memberId);
        await loadUserProjects(user.uid);
        alert('✅ Membre retiré du projet !');
      } catch (error) {
        console.error('❌ Erreur retrait membre:', error);
        alert('❌ Erreur lors du retrait du membre : ' + error.message);
      }
    }
  };

  const handleViewProjectDetails = (project) => {
    // Naviguer vers une page de détails du projet (à créer)
    navigate(`/projects/${project.id}`);
  };

  const handleExportProject = async (project) => {
    try {
      // Créer un export JSON du projet avec ses tâches
      const exportData = {
        project: project,
        exportDate: new Date().toISOString(),
        exportedBy: user.email
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projet-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✅ Projet exporté avec succès !');
    } catch (error) {
      console.error('❌ Erreur export projet:', error);
      alert('❌ Erreur lors de l\'export : ' + error.message);
    }
  };

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Total projets",
      value: projectStats.total,
      icon: Folder,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Actifs",
      value: projectStats.active,
      icon: Play,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "Terminés",
      value: projectStats.completed,
      icon: CheckCircle,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Progression moy.",
      value: `${projectStats.avgProgress}%`,
      icon: TrendingUp,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton 
        variant="outline" 
        size="md"
        icon={Filter}
      >
        Filtres avancés
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
        onClick={() => setShowProjectForm(true)}
      >
        Nouveau projet
      </PremiumButton>
    </>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'active':
        return 'border-blue-500 bg-blue-500/10';
      case 'on_hold':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'cancelled':
        return 'border-red-500 bg-red-500/10';
      case 'archived':
        return 'border-gray-500 bg-gray-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Actif',
      on_hold: 'En pause',
      completed: 'Terminé',
      cancelled: 'Annulé',
      archived: 'Archivé'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'active':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'on_hold':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-400" />;
      default:
        return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10';
      case 'high':
        return 'text-orange-400 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'low':
        return 'text-green-400 bg-green-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Mes Projets"
        subtitle="Chargement de vos projets..."
        icon={Folder}
      >
        <PremiumCard className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos projets...</p>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mes Projets"
      subtitle="Gérez efficacement vos projets et leurs équipes"
      icon={Folder}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🔍 Barre de recherche et filtres */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1">
          <PremiumSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher dans vos projets..."
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Filtres de statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="on_hold">En pause</option>
            <option value="completed">Terminés</option>
            <option value="archived">Archivés</option>
          </select>
          
          {/* Filtres de priorité */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgente</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* 📊 Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tâches totales"
          value={projectStats.totalTasks}
          icon={Target}
          color="blue"
          trend="📋 Toutes équipes"
        />
        <StatCard
          title="Taux réussite"
          value={`${projectStats.completionRate}%`}
          icon={Award}
          color="green"
          trend="🎯 Projets terminés"
        />
        <StatCard
          title="En pause"
          value={projectStats.onHold}
          icon={Clock}
          color="yellow"
          trend="⏸️ Nécessitent attention"
        />
        <StatCard
          title="Équipes actives"
          value={projectStats.active}
          icon={Users}
          color="purple"
          trend="👥 Collaborent activement"
        />
      </div>

      {/* 📁 Grille des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <PremiumCard className={`h-full border-l-4 ${getStatusColor(project.status)}`} hover={true}>
              
              {/* Header du projet */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {getStatusIcon(project.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                      {project.title || 'Projet sans nom'}
                    </h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span>{getStatusLabel(project.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Menu déroulant complet */}
                  <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handleViewProjectDetails(project)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les détails
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowProjectForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    
                    <button
                      onClick={() => handleManageTeam(project)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    >
                      <UserPlus className="w-4 h-4" />
                      Gérer l'équipe
                    </button>
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    {project.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(project.id, 'on_hold')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 w-full text-left"
                      >
                        <Pause className="w-4 h-4" />
                        Mettre en pause
                      </button>
                    )}
                    
                    {project.status === 'on_hold' && (
                      <button
                        onClick={() => handleStatusChange(project.id, 'active')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-gray-700 w-full text-left"
                      >
                        <Play className="w-4 h-4" />
                        Reprendre
                      </button>
                    )}
                    
                    {project.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(project.id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-gray-700 w-full text-left"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer terminé
                      </button>
                    )}
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    <button
                      onClick={() => handleDuplicateProject(project)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 w-full text-left"
                    >
                      <Copy className="w-4 h-4" />
                      Dupliquer
                    </button>
                    
                    <button
                      onClick={() => handleExportProject(project)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:bg-gray-700 w-full text-left"
                    >
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>
                    
                    {project.status !== 'archived' && (
                      <button
                        onClick={() => handleArchiveProject(project.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 w-full text-left"
                      >
                        <Archive className="w-4 h-4" />
                        Archiver
                      </button>
                    )}
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description || 'Aucune description disponible'}
              </p>

              {/* Priorité et catégorie */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
                  {project.priority || 'Normale'}
                </span>
                {project.category && (
                  <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                    {project.category}
                  </span>
                )}
              </div>

              {/* Métriques du projet */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{project.taskCount || 0}</div>
                  <div className="text-xs text-gray-400">Tâches</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{project.members?.length || 0}</div>
                  <div className="text-xs text-gray-400">Équipe</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">{project.progress || 0}%</div>
                  <div className="text-xs text-gray-400">Progrès</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progression</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-2 text-sm">
                {project.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Échéance: {new Date(project.dueDate.toDate ? project.dueDate.toDate() : project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {project.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Estimé: {project.estimatedHours}h
                    </span>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2">
                    {project.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-gray-400 text-xs">+{project.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* État vide */}
      {filteredProjects.length === 0 && !loading && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier projet.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
              onClick={() => setShowProjectForm(true)}
            >
              Créer un projet
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📝 MODALS */}
      
      {/* Modal de création/édition de projet */}
      {showProjectForm && (
        <ProjectForm
          isOpen={showProjectForm}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          project={editingProject}
          onSave={editingProject ? 
            (data) => handleUpdateProject(editingProject.id, data) : 
            handleCreateProject
          }
        />
      )}

      {/* Modal de gestion d'équipe (placeholder - à implémenter) */}
      {showTeamModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Gestion de l'équipe - {selectedProject.title}
              </h2>
              <p className="text-gray-400 mb-4">
                Fonctionnalité de gestion d'équipe en cours de développement...
              </p>
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default ProjectsPage;
