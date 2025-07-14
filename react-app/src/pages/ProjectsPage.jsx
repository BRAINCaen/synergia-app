// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PAGE PROJETS AVEC BOUTONS FONCTIONNELS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Share2,
  Star,
  Play,
  CheckCircle,
  Target,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  MoreVertical,
  X,
  Settings,
  Trash2
} from 'lucide-react';

// Layouts et composants UI
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Services et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';
import { taskService } from '../core/services/taskService.js';

// Composants de projet
import { ProjectForm } from '../modules/projects/ProjectForm.jsx';

/**
 * 📂 PAGE DES PROJETS AVEC BOUTONS FONCTIONNELS
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  // États des données
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // États des modales
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectActions, setShowProjectActions] = useState(null);

  // ✅ CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (user?.uid) {
      loadProjectsData();
    }
  }, [user?.uid]);

  const loadProjectsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [PROJECTS-PAGE] Chargement projets utilisateur:', user.uid);
      
      const userProjects = await projectService.getUserProjects(user.uid);
      console.log('✅ [PROJECTS-PAGE] Projets chargés:', userProjects.length);
      
      // Enrichir avec les statistiques de tâches
      const enrichedProjects = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const tasks = await taskService.getTasksByProject(project.id);
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              ...project,
              totalTasks,
              completedTasks,
              progress
            };
          } catch (error) {
            console.warn('⚠️ Erreur chargement tâches pour projet:', project.id);
            return { ...project, totalTasks: 0, completedTasks: 0, progress: 0 };
          }
        })
      );
      
      setProjects(enrichedProjects);
      
    } catch (err) {
      console.error('❌ [PROJECTS-PAGE] Erreur chargement:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ BOUTON NOUVEAU PROJET - FONCTIONNEL
  const handleNewProject = () => {
    console.log('🔄 [PROJECTS-PAGE] Ouverture formulaire nouveau projet');
    setEditingProject(null);
    setShowProjectForm(true);
  };

  // ✅ BOUTON FILTRES - FONCTIONNEL
  const handleToggleFilters = () => {
    console.log('🔄 [PROJECTS-PAGE] Toggle filtres:', !showFilters);
    setShowFilters(!showFilters);
  };

  // ✅ BOUTON EXPORTER - FONCTIONNEL
  const handleExportProjects = () => {
    console.log('🔄 [PROJECTS-PAGE] Export des projets...');
    
    try {
      const csvContent = [
        'Nom,Description,Statut,Priorité,Progression,Tâches,Créé le',
        ...projects.map(project => [
          `"${project.title || ''}"`,
          `"${project.description || ''}"`,
          project.status || '',
          project.priority || '',
          `${project.progress || 0}%`,
          `${project.completedTasks || 0}/${project.totalTasks || 0}`,
          project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : ''
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projets-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ [PROJECTS-PAGE] Export réussi');
    } catch (error) {
      console.error('❌ [PROJECTS-PAGE] Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  // ✅ GESTIONNAIRE FERMETURE FORMULAIRE
  const handleCloseProjectForm = async () => {
    console.log('🔄 [PROJECTS-PAGE] Fermeture formulaire et rechargement');
    setShowProjectForm(false);
    setEditingProject(null);
    // Recharger les projets après création/modification
    await loadProjectsData();
  };

  // ✅ GESTIONNAIRE ÉDITION PROJET
  const handleEditProject = (project) => {
    console.log('🔄 [PROJECTS-PAGE] Édition projet:', project.title);
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // ✅ GESTIONNAIRE VISUALISATION PROJET
  const handleViewProject = (projectId) => {
    console.log('🔄 [PROJECTS-PAGE] Redirection vers projet:', projectId);
    window.location.href = `/projects/${projectId}`;
  };

  // ✅ GESTIONNAIRE ACTIONS PROJET (trois petits points)
  const handleProjectActions = (projectId) => {
    console.log('🔄 [PROJECTS-PAGE] Toggle actions projet:', projectId);
    setShowProjectActions(showProjectActions === projectId ? null : projectId);
  };

  // ✅ GESTIONNAIRE CHANGEMENT STATUT
  const handleProjectStatusChange = async (projectId, newStatus) => {
    try {
      console.log('🔄 [PROJECTS-PAGE] Changement statut:', projectId, '→', newStatus);
      
      const result = await projectService.updateProject(projectId, { status: newStatus });
      
      if (result.success) {
        // Mettre à jour l'état local
        setProjects(prev => prev.map(project => 
          project.id === projectId ? { ...project, status: newStatus } : project
        ));
        
        console.log('✅ [PROJECTS-PAGE] Statut mis à jour');
      }
      
      setShowProjectActions(null);
      
    } catch (error) {
      console.error('❌ [PROJECTS-PAGE] Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  // ✅ GESTIONNAIRE SUPPRESSION PROJET
  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectTitle}" ?`)) {
      return;
    }
    
    try {
      console.log('🔄 [PROJECTS-PAGE] Suppression projet:', projectId);
      
      const result = await projectService.deleteProject(projectId);
      
      if (result.success) {
        // Retirer de l'état local
        setProjects(prev => prev.filter(project => project.id !== projectId));
        console.log('✅ [PROJECTS-PAGE] Projet supprimé');
      }
      
      setShowProjectActions(null);
      
    } catch (error) {
      console.error('❌ [PROJECTS-PAGE] Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // ✅ GESTIONNAIRE SAUVEGARDE PROJET
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        // Modification
        console.log('🔄 [PROJECTS-PAGE] Modification projet:', editingProject.id);
        await projectService.updateProject(editingProject.id, projectData);
      } else {
        // Création
        console.log('🔄 [PROJECTS-PAGE] Création nouveau projet');
        await projectService.createProject(projectData, user.uid);
      }
      
      console.log('✅ [PROJECTS-PAGE] Projet sauvegardé');
      await handleCloseProjectForm();
      
    } catch (error) {
      console.error('❌ [PROJECTS-PAGE] Erreur sauvegarde:', error);
      throw error;
    }
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calcul des statistiques
  const calculateStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;
    
    return [
      {
        title: 'Total',
        value: total,
        icon: Folder,
        color: 'from-blue-500 to-blue-600',
        change: null
      },
      {
        title: 'Actifs', 
        value: active,
        icon: Play,
        color: 'from-green-500 to-green-600',
        change: total > 0 ? `${Math.round((active / total) * 100)}%` : '0%'
      },
      {
        title: 'Terminés',
        value: completed, 
        icon: CheckCircle,
        color: 'from-purple-500 to-purple-600',
        change: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'
      },
      {
        title: 'En pause',
        value: onHold,
        icon: Clock,
        color: 'from-orange-500 to-orange-600', 
        change: null
      }
    ];
  };

  // Actions d'en-tête avec boutons fonctionnels
  const headerActions = (
    <>
      <PremiumButton 
        variant="secondary" 
        size="md"
        icon={Download}
        onClick={handleExportProjects}
      >
        Exporter
      </PremiumButton>
      
      <PremiumButton 
        variant="secondary" 
        size="md"
        icon={Filter}
        onClick={handleToggleFilters}
      >
        Filtres
      </PremiumButton>
      
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
        onClick={handleNewProject}
      >
        Nouveau projet
      </PremiumButton>
    </>
  );

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Projets"
        subtitle="Chargement de vos projets..."
        icon={Folder}
        showStats={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="Projets"
        subtitle="Erreur de chargement"
        icon={Folder}
        showStats={false}
      >
        <PremiumCard className="text-center py-12">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <PremiumButton onClick={loadProjectsData} variant="primary">
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mes Projets"
      subtitle="Gérez efficacement vos projets d'équipe"
      icon={Folder}
      headerActions={headerActions}
      showStats={true}
      stats={calculateStats()}
    >
      {/* ✅ PANEL FILTRES FONCTIONNEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <PremiumCard>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recherche */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filtre statut */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="completed">Terminés</option>
                    <option value="on_hold">En pause</option>
                    <option value="cancelled">Annulés</option>
                  </select>
                </div>

                {/* Bouton de réinitialisation */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-lg hover:border-gray-500"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ GRILLE DES PROJETS AVEC BOUTONS FONCTIONNELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PremiumCard className="h-full">
              <div className="flex flex-col h-full">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    
                    {/* Badge statut */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(project.status)}
                          {project.status === 'active' ? 'Actif' :
                           project.status === 'completed' ? 'Terminé' :
                           project.status === 'on_hold' ? 'En pause' :
                           project.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                        </span>
                      </span>
                      
                      {project.priority && project.priority !== 'normal' && (
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                          project.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          project.priority === 'urgent' ? 'bg-red-600/20 text-red-300 border-red-600/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}>
                          {project.priority === 'high' ? '🔥 Haute' : 
                           project.priority === 'urgent' ? '🚨 Urgente' : '🟢 Basse'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ MENU ACTIONS FONCTIONNEL (trois petits points) */}
                  <div className="relative">
                    <button
                      onClick={() => handleProjectActions(project.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Menu déroulant des actions */}
                    {showProjectActions === project.id && (
                      <div className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleViewProject(project.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Voir le détail
                          </button>
                          
                          <button
                            onClick={() => handleEditProject(project)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          
                          {project.status !== 'completed' && (
                            <button
                              onClick={() => handleProjectStatusChange(project.id, 'completed')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Marquer terminé
                            </button>
                          )}
                          
                          {project.status === 'active' && (
                            <button
                              onClick={() => handleProjectStatusChange(project.id, 'on_hold')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4" />
                              Mettre en pause
                            </button>
                          )}
                          
                          <div className="border-t border-gray-700 my-1"></div>
                          
                          <button
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                    {project.description}
                  </p>
                )}

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progression</span>
                    <span className="text-sm font-medium text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>Tâches: {project.completedTasks}/{project.totalTasks}</span>
                    </div>
                    
                    {project.priority && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3" />
                        <span className="text-xs">{project.priority}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Créé le {project.createdAt ? 
                        new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* ✅ BOUTONS D'ACTIONS RAPIDES */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProject(project.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
                      title="Voir le détail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-yellow-400">
                    <Star className="w-3 h-3" />
                    <span>{project.rating || '4.5'}</span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}

        {/* ✅ CARTE NOUVEAU PROJET FONCTIONNELLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: filteredProjects.length * 0.1 }}
        >
          <PremiumCard className="h-full border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
            <div 
              className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
              onClick={handleNewProject}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nouveau projet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Créez un nouveau projet pour votre équipe
              </p>
              <PremiumButton 
                variant="primary" 
                size="sm"
                onClick={handleNewProject}
              >
                Commencer
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* État vide avec bouton fonctionnel */}
      {filteredProjects.length === 0 && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier projet.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
              onClick={handleNewProject}
            >
              Créer un projet
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* ✅ MODAL FORMULAIRE PROJET FONCTIONNEL */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={editingProject}
              onClose={handleCloseProjectForm}
              onSave={handleSaveProject}
            />
          </div>
        </div>
      )}

      {/* Fermer le menu d'actions si on clique ailleurs */}
      {showProjectActions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProjectActions(null)}
        />
      )}
    </PremiumLayout>
  );
};

export default ProjectsPage;
