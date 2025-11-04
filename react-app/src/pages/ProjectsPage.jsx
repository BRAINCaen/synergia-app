// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VRAIE PAGE PROJETS SYNERGIA AVEC FIREBASE ET DESIGN AUTHENTIQUE
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Users,
  Target,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowRight,
  MoreVertical,
  FolderOpen,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES SYNERGIA PROJETS
const PROJECT_STATUS = {
  planning: { 
    label: 'Planification', 
    color: 'yellow', 
    icon: '📋', 
    bgColor: 'bg-yellow-900/20', 
    textColor: 'text-yellow-400', 
    borderColor: 'border-yellow-500/30',
    hoverColor: 'hover:bg-yellow-900/30'
  },
  active: { 
    label: 'En cours', 
    color: 'blue', 
    icon: '🚀', 
    bgColor: 'bg-blue-900/20', 
    textColor: 'text-blue-400', 
    borderColor: 'border-blue-500/30',
    hoverColor: 'hover:bg-blue-900/30'
  },
  completed: { 
    label: 'Terminé', 
    color: 'green', 
    icon: '✅', 
    bgColor: 'bg-green-900/20', 
    textColor: 'text-green-400', 
    borderColor: 'border-green-500/30',
    hoverColor: 'hover:bg-green-900/30'
  },
  on_hold: { 
    label: 'En pause', 
    color: 'orange', 
    icon: '⏸️', 
    bgColor: 'bg-orange-900/20', 
    textColor: 'text-orange-400', 
    borderColor: 'border-orange-500/30',
    hoverColor: 'hover:bg-orange-900/30'
  },
  cancelled: { 
    label: 'Annulé', 
    color: 'red', 
    icon: '❌', 
    bgColor: 'bg-red-900/20', 
    textColor: 'text-red-400', 
    borderColor: 'border-red-500/30',
    hoverColor: 'hover:bg-red-900/30'
  }
};

const PROJECT_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '🟢', textColor: 'text-green-400' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡', textColor: 'text-yellow-400' },
  high: { label: 'Haute', color: 'orange', icon: '🟠', textColor: 'text-orange-400' },
  urgent: { label: 'Urgent', color: 'red', icon: '🔴', textColor: 'text-red-400' }
};

const VIEW_MODES = {
  grid: { label: 'Grille', icon: Grid },
  list: { label: 'Liste', icon: List }
};

const ProjectsPage = () => {
  // 🧭 NAVIGATION
  const navigate = useNavigate();
  
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS PROJETS
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // 📊 CHARGEMENT DES PROJETS DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [PROJECTS] Chargement des projets depuis Firebase...');
    setLoading(true);

    // Query pour les projets
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy(sortBy, sortOrder)
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));

      console.log('📁 [PROJECTS] Projets chargés depuis Firebase:', projectsData.length);
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ [PROJECTS] Erreur chargement projets:', error);
      setError('Erreur de chargement des projets');
      setLoading(false);
    });

    // Chargement des tâches pour calcul des statistiques
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      }));

      console.log('📋 [TASKS] Tâches chargées pour stats:', tasksData.length);
      setTasks(tasksData);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [user?.uid, sortBy, sortOrder]);

  // 📊 CALCUL DES STATISTIQUES
  const stats = useMemo(() => {
    if (!projects.length) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        planning: 0
      };
    }

    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on_hold').length,
      planning: projects.filter(p => p.status === 'planning').length
    };
  }, [projects]);

  // 🔍 FILTRAGE ET TRI DES PROJETS
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    return filtered;
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  // ➕ CRÉER NOUVEAU PROJET
  const handleCreateProject = async (projectData) => {
    try {
      console.log('➕ [CREATE] Création nouveau projet:', projectData.title);

      const newProject = {
        title: projectData.title,
        description: projectData.description || '',
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        tags: projectData.tags || [],
        color: projectData.color || 'blue',
        icon: projectData.icon || '📁',
        createdBy: user.uid,
        members: [user.uid],
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        dueDate: projectData.dueDate || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), newProject);
      
      console.log('✅ [CREATE] Projet créé avec succès');
      setShowProjectForm(false);
      setEditingProject(null);
      
    } catch (error) {
      console.error('❌ [CREATE] Erreur création projet:', error);
      alert('Erreur lors de la création du projet');
    }
  };

  // ✏️ MODIFIER PROJET
  const handleEditProject = async (projectData) => {
    try {
      console.log('✏️ [EDIT] Modification projet:', editingProject.id);

      await updateDoc(doc(db, 'projects', editingProject.id), {
        ...projectData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [EDIT] Projet modifié avec succès');
      setShowProjectForm(false);
      setEditingProject(null);
      
    } catch (error) {
      console.error('❌ [EDIT] Erreur modification projet:', error);
      alert('Erreur lors de la modification du projet');
    }
  };

  // 🗑️ SUPPRIMER PROJET
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      console.log('🗑️ [DELETE] Suppression projet:', projectId);
      
      await deleteDoc(doc(db, 'projects', projectId));
      
      console.log('✅ [DELETE] Projet supprimé avec succès');
      
    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression projet:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  // 🔄 CHANGER STATUT PROJET
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      console.log('🔄 [STATUS] Changement statut projet:', projectId, '→', newStatus);
      
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [STATUS] Statut mis à jour avec succès');
      
    } catch (error) {
      console.error('❌ [STATUS] Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement des projets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 📊 HEADER AVEC STATISTIQUES */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre principal */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Gestion des Projets
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Organisez et suivez vos projets collaboratifs
                  </p>
                </div>
              </div>

              {/* Actions du header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau Projet
                </button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-gray-400 text-sm font-medium">Total</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.active}</div>
                <div className="text-gray-400 text-sm font-medium">Actifs</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(stats.active / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
                <div className="text-gray-400 text-sm font-medium">Terminés</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.planning}</div>
                <div className="text-gray-400 text-sm font-medium">Planning</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.planning / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-orange-400 mb-1">{stats.onHold}</div>
                <div className="text-gray-400 text-sm font-medium">En pause</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${(stats.onHold / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des projets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="planning">Planification</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                  <option value="on_hold">En pause</option>
                  <option value="cancelled">Annulés</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="updatedAt-desc">Plus récents</option>
                  <option value="updatedAt-asc">Plus anciens</option>
                  <option value="title-asc">Nom A-Z</option>
                  <option value="title-desc">Nom Z-A</option>
                  <option value="createdAt-desc">Date création ↓</option>
                  <option value="createdAt-asc">Date création ↑</option>
                </select>
              </div>
            </div>

            {/* Résultats de recherche */}
            {searchTerm && (
              <div className="mt-4 text-sm text-gray-400">
                {filteredProjects.length} projet(s) trouvé(s) pour "{searchTerm}"
              </div>
            )}
          </div>

          {/* 📁 GRILLE DES PROJETS */}
          {filteredProjects.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-8xl mb-6">📁</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet créé'}
              </h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Aucun projet ne correspond à votre recherche. Essayez avec d\'autres mots-clés.'
                  : 'Commencez par créer votre premier projet pour organiser vos tâches et collaborer avec votre équipe.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Créer mon premier projet
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                : "space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  navigate={navigate}
                  onEdit={(proj) => {
                    setEditingProject(proj);
                    setShowProjectForm(true);
                  }}
                  onDelete={handleDeleteProject}
                  onStatusChange={handleStatusChange}
                  tasks={tasks.filter(task => task.projectId === project.id)}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* 📝 MODAL FORMULAIRE PROJET */}
        <AnimatePresence>
          {showProjectForm && (
            <ProjectFormModal
              project={editingProject}
              onClose={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
              onSubmit={editingProject ? handleEditProject : handleCreateProject}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// 📄 COMPOSANT CARTE PROJET
const ProjectCard = ({ project, viewMode, navigate, onEdit, onDelete, onStatusChange, tasks, index }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const statusConfig = PROJECT_STATUS[project.status] || PROJECT_STATUS.active;
  const priorityConfig = PROJECT_PRIORITY[project.priority] || PROJECT_PRIORITY.medium;
  
  // Calcul des statistiques du projet
  const projectStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    todoTasks: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  const cardContent = (
    <>
      {/* Header de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${statusConfig.bgColor}`}>
            {project.icon || '📁'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white line-clamp-1">
              {project.title || 'Projet sans nom'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
              <span className={`text-xs ${priorityConfig.textColor}`}>
                {priorityConfig.icon} {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showDropdown && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              
              {project.status !== 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(project.id, 'active');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-green-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Activer
                </button>
              )}
              
              {project.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(project.id, 'on_hold');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-yellow-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <PauseCircle className="h-4 w-4" />
                  Mettre en pause
                </button>
              )}
              
              {project.status !== 'completed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(project.id, 'completed');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-blue-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marquer terminé
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Statistiques du projet */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progression</span>
          <span className="text-white font-medium">{projectStats.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${projectStats.progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{projectStats.totalTasks}</div>
            <div className="text-xs text-gray-400">Tâches</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{projectStats.completedTasks}</div>
            <div className="text-xs text-gray-400">Terminées</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">{projectStats.inProgressTasks}</div>
            <div className="text-xs text-gray-400">En cours</div>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            {project.createdAt 
              ? `Créé le ${project.createdAt.toLocaleDateString('fr-FR')}`
              : 'Date inconnue'
            }
          </span>
        </div>
        {project.members && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{project.members.length} membre(s)</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action button - NAVIGATION AJOUTÉE ICI */}
      <button 
        onClick={() => navigate(`/projects/${project.id}`)}
        className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Voir les détails
      </button>
    </>
  );

  return (
    <motion.div
      className={`
        bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 
        hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 
        hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer
        ${viewMode === 'list' ? 'flex items-center gap-6' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.005 }}
      onClick={() => setShowDropdown(false)}
    >
      {cardContent}
    </motion.div>
  );
};

// 📝 COMPOSANT MODAL FORMULAIRE
const ProjectFormModal = ({ project, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    tags: project?.tags ? project.tags.join(', ') : '',
    color: project?.color || 'blue',
    icon: project?.icon || '📁',
    dueDate: project?.dueDate ? project.dueDate.toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };
      
      await onSubmit(projectData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.title 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="Nom de votre projet"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              placeholder="Description de votre projet"
              rows="4"
            />
          </div>

          {/* Statut et Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              >
                <option value="planning">📋 Planification</option>
                <option value="active">🚀 En cours</option>
                <option value="on_hold">⏸️ En pause</option>
                <option value="completed">✅ Terminé</option>
                <option value="cancelled">❌ Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              >
                <option value="low">🟢 Faible</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Icône et Date d'échéance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icône
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="📁"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags <span className="text-gray-500">(séparés par des virgules)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              placeholder="développement, urgent, client"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              {project ? 'Modifier' : 'Créer'} le projet
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsPage;
