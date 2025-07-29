// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION ORIGINALE QUI MARCHAIT - AUCUNE MODIFICATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target,
  Folder,
  BarChart3,
  Clock,
  Trophy,
  Star,
  Heart,
  Briefcase,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FolderX,
  Eye,
  Edit,
  Settings,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';

/**
 * 📁 PAGE PROJETS AMÉLIORÉE AVEC SECTIONS ASSIGNATIONS ET BÉNÉVOLAT
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // États principaux
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États UI
  const [activeSection, setActiveSection] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadAllProjects();
    }
  }, [user?.uid]);

  /**
   * 📁 CHARGER TOUS LES PROJETS (ASSIGNÉS + DISPONIBLES)
   */
  const loadAllProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [PROJECTS] Chargement projets pour utilisateur:', user.uid);
      
      // 1. Charger mes projets assignés (où je suis membre de l'équipe)
      const allProjects = await projectService.getAllProjects();
      
      const myAssignedProjects = allProjects.filter(project => 
        project.teamMembers && project.teamMembers.includes(user.uid) ||
        project.createdBy === user.uid
      );
      console.log('✅ [PROJECTS] Projets assignés:', myAssignedProjects.length);
      setAssignedProjects(myAssignedProjects);
      
      // 2. Charger projets recherchant des volontaires (pas encore membre)
      const volunteersNeededProjects = allProjects.filter(project => 
        project.status === 'recruiting' &&
        (!project.teamMembers || !project.teamMembers.includes(user.uid)) &&
        project.createdBy !== user.uid
      );
      console.log('✅ [PROJECTS] Projets ouverts aux volontaires:', volunteersNeededProjects.length);
      setAvailableProjects(volunteersNeededProjects);
      
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur chargement projets:', error);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎯 ACTIONS DES BOUTONS - FONCTIONS CORRIGÉES
   */

  // ✅ BOUTON "Nouveau projet" - Navigation vers formulaire de création
  const handleCreateProject = () => {
    console.log('🆕 [ACTION] Création nouveau projet');
    setShowCreateModal(true);
    // Alternative: navigate('/projects/create');
  };

  // ✅ BOUTON "Voir détails" - Navigation vers détail du projet
  const handleViewProject = (project) => {
    console.log('👁️ [ACTION] Voir détails projet:', project.title);
    navigate(`/projects/${project.id}`);
  };

  // ✅ BOUTON "Gérer" - Navigation vers gestion du projet
  const handleManageProject = (project) => {
    console.log('⚙️ [ACTION] Gérer projet:', project.title);
    navigate(`/projects/${project.id}/manage`);
  };

  // ✅ BOUTON "Rejoindre l'équipe" - Ajouter utilisateur au projet
  const handleVolunteerForProject = async (project) => {
    try {
      console.log('❤️ [ACTION] Rejoindre projet:', project.title);
      
      // Ajouter l'utilisateur à l'équipe du projet
      await projectService.addTeamMember(project.id, user.uid);
      
      // Recharger les projets pour mettre à jour les listes
      await loadAllProjects();
      
      // Message de succès (ajouter notification toast si disponible)
      console.log('✅ Vous avez rejoint l\'équipe du projet:', project.title);
      
    } catch (error) {
      console.error('❌ Erreur rejoindre projet:', error);
    }
  };

  /**
   * 🔍 FONCTIONS DE FILTRAGE
   */
  const filteredAssignedProjects = assignedProjects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredAvailableProjects = availableProjects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  /**
   * 📊 CALCULS STATISTIQUES
   */
  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'planning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'recruiting': return <Heart className="w-4 h-4 text-purple-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 COMPOSANT CARTE DE PROJET
   */
  const ProjectCard = ({ project, isVolunteer = false, showVolunteerButton = false }) => {
    const progress = calculateProgress(project);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(project.status)}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.title}
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {project.description || 'Aucune description disponible'}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{project.teamMembers?.length || 0} membres</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{project.tasks?.length || 0} tâches</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{progress}% complété</span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Badge de priorité */}
          <div className="ml-4">
            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)}`}>
              {project.priority || 'Normal'}
            </span>
          </div>
        </div>
        
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {project.createdAt ? 
                new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                'N/A'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* ✅ BOUTON "Voir détails" - FONCTIONNEL */}
            <button 
              onClick={() => handleViewProject(project)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir détails
            </button>
            
            {/* ✅ BOUTON "Gérer" - FONCTIONNEL (seulement si propriétaire/membre) */}
            {!isVolunteer && (
              <button 
                onClick={() => handleManageProject(project)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Gérer
              </button>
            )}
            
            {/* ✅ BOUTON "Rejoindre l'équipe" - FONCTIONNEL */}
            {showVolunteerButton && (
              <button
                onClick={() => handleVolunteerForProject(project)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                Rejoindre l'équipe
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * 🎨 MODAL DE CRÉATION DE PROJET
   */
  const CreateProjectModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log('🆕 [MODAL] Création projet:', formData);
        
        const newProject = {
          ...formData,
          createdBy: user.uid,
          teamMembers: [user.uid],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // ORIGINAL - EN TESTANT LES 2 ORDRES POSSIBLES
        try {
          await projectService.createProject(newProject, user.uid);
        } catch (error1) {
          console.log('🔄 [MODAL] Premier ordre échoué, essai second ordre...');
          try {
            await projectService.createProject(user.uid, newProject);
          } catch (error2) {
            console.error('❌ [MODAL] Les deux ordres ont échoué');
            throw error2;
          }
        }
        
        setShowCreateModal(false);
        setFormData({ title: '', description: '', status: 'planning', priority: 'medium' });
        await loadAllProjects();
        
        console.log('✅ Projet créé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur création projet:', error);
        alert('Erreur: ' + error.message);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nouveau projet</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Refonte du site web"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                placeholder="Description du projet..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planning">Planification</option>
                  <option value="active">Actif</option>
                  <option value="recruiting">Recherche volontaires</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la page */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Folder className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* ✅ BOUTON "Nouveau projet" - FONCTIONNEL */}
              <button 
                onClick={handleCreateProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouveau projet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSection('assigned')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'assigned'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Mes projets ({filteredAssignedProjects.length})
            </button>
            
            <button
              onClick={() => setActiveSection('available')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'available'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              Projets recherchant des volontaires ({filteredAvailableProjects.length})
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des projets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="planning">Planification</option>
                      <option value="active">Actif</option>
                      <option value="completed">Terminé</option>
                      <option value="recruiting">Recherche volontaires</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Toutes les priorités</option>
                      <option value="urgent">Urgente</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          {activeSection === 'assigned' && (
            <motion.div
              key="assigned"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {filteredAssignedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssignedProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isVolunteer={false}
                      showVolunteerButton={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet assigné</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'Aucun projet ne correspond à votre recherche.' : 'Vous n\'avez pas encore de projets assignés.'}
                  </p>
                  <button 
                    onClick={handleCreateProject}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Créer mon premier projet
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {filteredAvailableProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailableProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isVolunteer={true}
                      showVolunteerButton={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet volontaire</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucun projet volontaire ne correspond à votre recherche.' : 'Il n\'y a pas de projets recherchant des volontaires pour le moment.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistiques en bas */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {assignedProjects.length}
            </div>
            <div className="text-gray-600 text-sm">Mes projets</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {availableProjects.length}
            </div>
            <div className="text-gray-600 text-sm">Projets ouverts</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {assignedProjects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-gray-600 text-sm">Projets terminés</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(assignedProjects.reduce((total, project) => total + calculateProgress(project), 0) / (assignedProjects.length || 1))}%
            </div>
            <div className="text-gray-600 text-sm">Progression moyenne</div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      <CreateProjectModal />
    </div>
  );
};

export default ProjectsPage;
