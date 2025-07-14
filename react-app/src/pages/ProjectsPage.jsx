// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PAGE CORRIGÉE - SANS require()
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
  Zap
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';

// 🔧 CORRECTION TEMPORAIRE: Store simple pour éviter l'erreur persist
const useSimpleProjectStore = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const createProject = useCallback((projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: 0
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);
  
  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    ));
  }, []);
  
  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);
  
  const loadUserProjects = useCallback(async (userId) => {
    setLoading(true);
    // Simulation simple pour éviter les erreurs
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          title: 'Premier projet',
          description: 'Cliquez sur "Nouveau projet" pour commencer',
          status: 'active',
          priority: 'medium',
          progress: 25,
          createdAt: new Date().toISOString(),
          userId
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    loadUserProjects
  };
};

// ✅ COMPOSANT FALLBACK SIMPLE (AUCUN require)
const ProjectForm = ({ isOpen, onClose, project, onSave }) => {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave && onSave({ title: title.trim(), description: description.trim() });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">
          {project ? 'Modifier le projet' : 'Nouveau projet'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du projet
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du projet..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du projet..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {project ? 'Modifier' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 📁 PROJECTS PAGE AVEC TOUTES LES FONCTIONNALITÉS
 */
const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, loading, createProject, updateProject, deleteProject, loadUserProjects } = useSimpleProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // États pour les statistiques
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    completionRate: 0
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
      
      setProjectStats({
        total,
        active,
        completed,
        onHold,
        completionRate
      });
    }
  }, [projects]);

  // Filtrer les projets
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  // Handlers
  const handleCreateProject = async (projectData) => {
    if (!user?.uid) return;
    
    try {
      await createProject({
        ...projectData,
        userId: user.uid,
        status: 'active',
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Projet créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await updateProject(projectId, updates);
      console.log('✅ Projet mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(projectId);
        console.log('✅ Projet supprimé avec succès');
      } catch (error) {
        console.error('❌ Erreur suppression projet:', error);
      }
    }
  };

  // Statistiques pour le header
  const headerStats = [
    { label: "Total", value: projectStats.total, icon: Folder, color: "text-blue-400" },
    { label: "Actifs", value: projectStats.active, icon: Play, color: "text-green-400" },
    { label: "Terminés", value: projectStats.completed, icon: CheckCircle, color: "text-purple-400" },
    { label: "Taux", value: `${projectStats.completionRate}%`, icon: TrendingUp, color: "text-yellow-400" }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton variant="secondary" icon={Filter}>
        Filtres
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Plus}
        onClick={() => setShowProjectForm(true)}
      >
        Nouveau projet
      </PremiumButton>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Chargement des projets...</h2>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Projets"
      subtitle="Organisez et suivez tous vos projets"
      icon={Folder}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PremiumSearchBar
            placeholder="Rechercher des projets..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={Search}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="completed">Terminés</option>
            <option value="on_hold">En pause</option>
          </select>
        </div>
        
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* 📁 LISTE DES PROJETS */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumCard className="hover:shadow-xl cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`
                      px-2 py-1 text-xs rounded-full font-medium
                      ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'}
                    `}>
                      {project.status === 'completed' ? 'Terminé' :
                       project.status === 'active' ? 'Actif' : 'En pause'}
                    </span>
                    
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {project.createdAt ? 
                          new Date(project.createdAt).toLocaleDateString() : 
                          'Récent'
                        }
                      </span>
                    </div>
                    
                    <div className={`
                      flex items-center space-x-1
                      ${project.priority === 'high' ? 'text-red-400' :
                        project.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'}
                    `}>
                      <Target className="w-4 h-4" />
                      <span>
                        {project.priority === 'high' ? 'Haute' :
                         project.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-blue-400 hover:text-blue-300 p-1 rounded"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowProjectForm(true);
                      }}
                      className="text-green-400 hover:text-green-300 p-1 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <PremiumCard className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucun projet trouvé' : 'Aucun projet'}
          </h3>
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
              onClick={() => setShowProjectForm(true)}
            >
              Créer un projet
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📝 MODAL DE CRÉATION/ÉDITION */}
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
    </PremiumLayout>
  );
};

export default ProjectsPage;
