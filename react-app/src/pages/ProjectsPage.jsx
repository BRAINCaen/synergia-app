// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION AMÉLIORÉE AVEC ASSIGNATIONS ET BÉNÉVOLAT
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
  Folder,
  BarChart3,
  Clock,
  Trophy,
  Star,
  Heart,
  HandHeart,
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
      
      // 2. Charger projets disponibles (sans équipe complète ou ouverts aux bénévoles)
      const availableProjects = allProjects.filter(project => 
        (!project.teamMembers || project.teamMembers.length === 0 || project.openToVolunteers === true) &&
        project.status !== 'completed' &&
        project.status !== 'cancelled' &&
        project.createdBy !== user.uid &&
        (!project.teamMembers || !project.teamMembers.includes(user.uid))
      );
      console.log('✅ [PROJECTS] Projets disponibles:', availableProjects.length);
      setAvailableProjects(availableProjects);
      
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur chargement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🙋‍♂️ SE PORTER VOLONTAIRE POUR UN PROJET
   */
  const handleVolunteerForProject = async (project) => {
    try {
      console.log('🙋‍♂️ [VOLUNTEER] Candidature pour projet:', project.title);
      
      const result = await projectService.joinProjectAsVolunteer(project.id, user.uid);
      
      if (result.success) {
        console.log('✅ [VOLUNTEER] Candidature réussie');
        // Recharger les données
        await loadAllProjects();
        
        // Notification succès
        alert(result.pending ?
          `Candidature envoyée pour le projet "${project.title}" ! En attente d'approbation.` :
          `Vous avez rejoint l'équipe du projet "${project.title}" !`
        );
      }
      
    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      alert('Erreur lors de la candidature. Réessayez.');
    }
  };

  /**
   * 🎨 COULEURS DE STATUT
   */
  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'planning': PlayCircle,
      'active': CheckCircle,
      'on_hold': AlertCircle,
      'completed': CheckCircle,
      'cancelled': XCircle
    };
    return icons[status] || AlertCircle;
  };

  const getStatusText = (status) => {
    const texts = {
      'planning': 'Planification',
      'active': 'Actif',
      'on_hold': 'En pause',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return texts[status] || 'Inconnu';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  /**
   * 🔍 FILTRER LES PROJETS
   */
  const filterProjects = (projects) => {
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const filteredAssignedProjects = filterProjects(assignedProjects);
  const filteredAvailableProjects = filterProjects(availableProjects);

  /**
   * 📊 CALCULER LE POURCENTAGE DE PROGRESSION
   */
  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  /**
   * 🎨 RENDU D'UNE CARTE DE PROJET
   */
  const ProjectCard = ({ project, isVolunteer = false, showVolunteerButton = false }) => {
    const StatusIcon = getStatusIcon(project.status);
    const progress = calculateProgress(project);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="p-6">
          {/* En-tête avec titre et badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {project.description}
              </p>
            </div>
            
            {isVolunteer && (
              <div className="ml-4">
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4 mr-1" />
                  Volontaire
                </span>
              </div>
            )}
          </div>

          {/* Badges de statut et priorité */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {getStatusText(project.status)}
            </span>
            
            {project.priority && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                <Target className="w-4 h-4 mr-1" />
                {project.priority === 'low' ? 'Basse' :
                 project.priority === 'medium' ? 'Moyenne' :
                 project.priority === 'high' ? 'Haute' : 'Urgente'}
              </span>
            )}

            {project.teamMembers && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Users className="w-4 h-4 mr-1" />
                {project.teamMembers.length} membre{project.teamMembers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Informations temporelles */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {project.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Échéance: {project.deadline.toDate ? 
                    project.deadline.toDate().toLocaleDateString('fr-FR') : 
                    new Date(project.deadline).toLocaleDateString('fr-FR')
                  }
                </span>
              </div>
            )}
            
            {project.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{project.estimatedDuration} estimée</span>
              </div>
            )}
          </div>

          {/* Récompenses et compétences */}
          {(project.xpReward || project.skillsToLearn) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {project.xpReward && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <Trophy className="w-3 h-3 mr-1" />
                  {project.xpReward} XP
                </span>
              )}
              
              {project.skillsToLearn && project.skillsToLearn.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                Voir détails
              </button>
              
              {!isVolunteer && (
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Gérer
                </button>
              )}
            </div>
            
            {showVolunteerButton && (
              <button
                onClick={() => handleVolunteerForProject(project)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <HandHeart className="w-4 h-4" />
                Rejoindre l'équipe
              </button>
            )}
          </div>
        </div>
      </motion.div>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
              <HandHeart className="w-4 h-4" />
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

          {/* Panneau de filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="planning">Planification</option>
                      <option value="active">Actif</option>
                      <option value="on_hold">En pause</option>
                      <option value="completed">Terminé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Toutes les priorités</option>
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
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
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Mes projets</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {filteredAssignedProjects.length}
                </span>
              </div>

              {filteredAssignedProjects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAssignedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun projet assigné</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'Aucun projet assigné ne correspond à votre recherche.' : 'Vous ne participez à aucun projet pour le moment.'}
                  </p>
                  <button
                    onClick={() => setActiveSection('available')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <HandHeart className="w-4 h-4" />
                    Découvrir les projets volontaires
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Projets recherchant des volontaires</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {filteredAvailableProjects.length}
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <HandHeart className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 mb-1">Rejoignez des projets passionnants !</h3>
                    <p className="text-green-700 text-sm">
                      Ces projets recherchent des membres motivés pour enrichir leur équipe. 
                      C'est l'occasion parfaite d'apprendre de nouvelles compétences et de contribuer à des initiatives importantes !
                    </p>
                  </div>
                </div>
              </div>

              {filteredAvailableProjects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun projet volontaire disponible</h3>
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
    </div>
  );
};

export default ProjectsPage;
