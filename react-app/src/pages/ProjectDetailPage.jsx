// ==========================================
// 📁 react-app/src/pages/ProjectDetailPage.jsx
// PAGE DÉTAILS DE PROJET AVEC LAYOUT STANDARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Clock,
  Settings,
  Edit,
  Trash2,
  Plus,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Heart,
  Star,
  MessageSquare,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { projectService } from '../core/services/projectService.js';
import { taskService } from '../core/services/taskService.js';

/**
 * 📁 PAGE DÉTAILS DE PROJET
 */
const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les données au montage
  useEffect(() => {
    if (projectId && user?.uid) {
      loadProjectData();
    }
  }, [projectId, user?.uid]);

  /**
   * 📁 CHARGER LES DONNÉES DU PROJET
   */
  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [PROJECT-DETAIL] Chargement projet:', projectId);
      
      // 1. Charger le projet
      const projectData = await projectService.getProject(projectId);
      
      if (!projectData) {
        console.error('❌ [PROJECT-DETAIL] Projet non trouvé:', projectId);
        setError('Projet introuvable');
        return;
      }
      
      console.log('✅ [PROJECT-DETAIL] Projet chargé:', projectData.title);
      setProject(projectData);
      
      // 2. Charger les tâches du projet
      try {
        const tasks = await taskService.getTasksByProject?.(projectId) || [];
        console.log('✅ [PROJECT-DETAIL] Tâches chargées:', tasks.length);
        setProjectTasks(tasks);
      } catch (taskError) {
        console.warn('⚠️ [PROJECT-DETAIL] Impossible de charger les tâches:', taskError);
        setProjectTasks([]);
      }
      
    } catch (error) {
      console.error('❌ [PROJECT-DETAIL] Erreur chargement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CALCULS STATISTIQUES
   */
  const getProjectStats = () => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      progressPercentage
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-5 h-5 text-green-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'planning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'recruiting': return <Heart className="w-5 h-5 text-purple-500" />;
      default: return <XCircle className="w-5 h-5 text-gray-500" />;
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
   * 🎨 ACTIONS DU PROJET
   */
  const handleEditProject = () => {
    console.log('✏️ [ACTION] Éditer projet:', project.title);
    // Naviguer vers une page d'édition ou ouvrir un modal
    // navigate(`/projects/${projectId}/edit`);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      console.log('🗑️ [ACTION] Supprimer projet:', project.title);
      await projectService.deleteProject(projectId);
      navigate('/projects');
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
    }
  };

  const handleJoinProject = async () => {
    try {
      console.log('❤️ [ACTION] Rejoindre projet:', project.title);
      await projectService.addTeamMember(projectId, user.uid);
      await loadProjectData(); // Recharger pour voir les changements
    } catch (error) {
      console.error('❌ Erreur rejoindre projet:', error);
    }
  };

  /**
   * 🎨 ONGLETS DE NAVIGATION
   */
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'tasks', label: `Tâches (${projectTasks.length})`, icon: Target },
    { id: 'team', label: `Équipe (${project?.teamMembers?.length || 0})`, icon: Users },
    { id: 'details', label: 'Détails', icon: FileText }
  ];

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {error || 'Projet introuvable'}
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  const stats = getProjectStats();
  const isTeamMember = project.teamMembers?.includes(user.uid);
  const isOwner = project.createdBy === user.uid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du projet */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Fil d'Ariane */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate('/projects')}
              className="hover:text-gray-700 transition-colors"
            >
              Projets
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{project.title}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(project.status)}
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <span className={`px-3 py-1 text-sm rounded-full border ${getPriorityColor(project.priority)}`}>
                  {project.priority || 'Normal'}
                </span>
              </div>
              
              <p className="text-gray-600 text-lg mb-4">
                {project.description || 'Aucune description disponible'}
              </p>

              {/* Métriques rapides */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project.teamMembers?.length || 0} membres</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{stats.totalTasks} tâches</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{stats.progressPercentage}% complété</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Créé le {project.createdAt ? 
                      new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {!isTeamMember && project.status === 'recruiting' && (
                <button
                  onClick={handleJoinProject}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Rejoindre l'équipe
                </button>
              )}
              
              {(isOwner || isTeamMember) && (
                <>
                  <button
                    onClick={handleEditProject}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  
                  {isOwner && (
                    <button
                      onClick={handleDeleteProject}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progression */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Progression du projet</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progression globale</span>
                      <span>{stats.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-blue-600 h-3 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                      <div className="text-sm text-gray-600">Tâches totales</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                      <div className="text-sm text-gray-600">Terminées</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.inProgressTasks}</div>
                      <div className="text-sm text-gray-600">En cours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations rapides */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informations</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut :</span>
                      <span className="font-medium text-gray-900">{project.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priorité :</span>
                      <span className="font-medium text-gray-900">{project.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catégorie :</span>
                      <span className="font-medium text-gray-900">{project.category || 'Général'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Équipe :</span>
                      <span className="font-medium text-gray-900">{project.teamMembers?.length || 0} membres</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Tâches */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📋 Tâches du projet</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nouvelle tâche
                </button>
              </div>

              {projectTasks.length > 0 ? (
                <div className="space-y-4">
                  {projectTasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h4>
                  <p className="text-gray-600">Ce projet n'a pas encore de tâches.</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">👥 Équipe du projet</h3>
              
              {project.teamMembers && project.teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {project.teamMembers.map(memberId => (
                    <div key={memberId} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {memberId === project.createdBy ? '👑 Créateur' : 'Membre'}
                        </div>
                        <div className="text-sm text-gray-600">ID: {memberId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun membre</h4>
                  <p className="text-gray-600">Ce projet n'a pas encore d'équipe.</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Détails */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📄 Détails complets</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-600">
                    {project.description || 'Aucune description disponible'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Métadonnées</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé le :</span>
                      <span className="text-gray-900">
                        {project.createdAt ? 
                          new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                          'N/A'
                        }
                      </span>
                    </div>
                    {project.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mis à jour le :</span>
                        <span className="text-gray-900">
                          {new Date(project.updatedAt.seconds * 1000).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID du projet :</span>
                      <span className="text-gray-900 font-mono text-xs">{project.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé par :</span>
                      <span className="text-gray-900 font-mono text-xs">{project.createdBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
