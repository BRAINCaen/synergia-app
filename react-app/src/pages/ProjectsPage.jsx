// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PAGE PROJETS COMPLÈTE AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FileText
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
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

// 📊 CONSTANTES PROJETS
const PROJECT_STATUS = {
  planning: { label: 'Planification', color: 'yellow', icon: '📋', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' },
  active: { label: 'En cours', color: 'blue', icon: '🚀', bgColor: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
  completed: { label: 'Terminé', color: 'green', icon: '✅', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200' },
  on_hold: { label: 'En pause', color: 'gray', icon: '⏸️', bgColor: 'bg-gray-50', textColor: 'text-gray-800', borderColor: 'border-gray-200' },
  cancelled: { label: 'Annulé', color: 'red', icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-red-200' }
};

const PROJECT_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgent', color: 'red', icon: '🔴' }
};

const VIEW_MODES = {
  grid: { label: 'Grille', icon: Grid },
  list: { label: 'Liste', icon: List }
};

const ProjectsPage = () => {
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

  // 📊 CHARGEMENT DES PROJETS
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [PROJECTS] Chargement des projets...');
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

      console.log('📁 [PROJECTS] Projets chargés:', projectsData.length);
      setProjects(projectsData);
      setLoading(false);
    });

    // Query pour les tâches (pour calculer les stats)
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      console.log('📋 [PROJECTS] Tâches chargées:', tasksData.length);
      setTasks(tasksData);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, [user?.uid, sortBy, sortOrder]);

  // 🎯 FILTRES ET TRI
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term)
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

  // 📊 CALCULER LES STATS D'UN PROJET
  const getProjectStats = useCallback((project) => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const progress = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
    
    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      progress,
      overdueTasks: projectTasks.filter(task => 
        task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
      ).length
    };
  }, [tasks]);

  // 📊 STATS GLOBALES
  const globalStats = useMemo(() => {
    const total = filteredAndSortedProjects.length;
    const active = filteredAndSortedProjects.filter(p => p.status === 'active').length;
    const completed = filteredAndSortedProjects.filter(p => p.status === 'completed').length;
    const planning = filteredAndSortedProjects.filter(p => p.status === 'planning').length;
    const overdue = filteredAndSortedProjects.filter(p => 
      p.dueDate && p.dueDate < new Date() && p.status !== 'completed'
    ).length;

    return { total, active, completed, planning, overdue };
  }, [filteredAndSortedProjects]);

  // 🆕 CRÉER UN NOUVEAU PROJET
  const handleCreateProject = useCallback(async (projectData) => {
    try {
      const newProject = {
        ...projectData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'planning',
        priority: projectData.priority || 'medium',
        teamMembers: [user.uid]
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      console.log('✅ [PROJECTS] Projet créé:', docRef.id);
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur création projet:', error);
      setError('Impossible de créer le projet');
    }
  }, [user]);

  // ✏️ METTRE À JOUR UN PROJET
  const handleUpdateProject = useCallback(async (projectId, updates) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [PROJECTS] Projet mis à jour:', projectId);
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur mise à jour projet:', error);
      setError('Impossible de mettre à jour le projet');
    }
  }, []);

  // 🗑️ SUPPRIMER UN PROJET
  const handleDeleteProject = useCallback(async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      console.log('✅ [PROJECTS] Projet supprimé:', projectId);
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur suppression projet:', error);
      setError('Impossible de supprimer le projet');
    }
  }, []);

  // 🎨 CARTE PROJET
  const ProjectCard = ({ project }) => {
    const stats = getProjectStats(project);
    const statusConfig = PROJECT_STATUS[project.status] || PROJECT_STATUS.planning;
    const priorityConfig = PROJECT_PRIORITY[project.priority] || PROJECT_PRIORITY.medium;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600">{project.category || 'Sans catégorie'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{priorityConfig.icon}</span>
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {project.description || 'Aucune description disponible'}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
            <span className="text-xs text-gray-500">
              {priorityConfig.icon} {priorityConfig.label}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-gray-900">{stats.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.progress === 100 ? 'bg-green-500' :
                  stats.progress >= 75 ? 'bg-blue-500' :
                  stats.progress >= 50 ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">{stats.totalTasks}</p>
              <p className="text-xs text-gray-600">Tâches</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">{stats.completedTasks}</p>
              <p className="text-xs text-gray-600">Terminées</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-600">
                {project.teamMembers?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Membres</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {project.updatedAt ? `Mis à jour ${project.updatedAt.toLocaleDateString('fr-FR')}` : 'Pas de mise à jour'}
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => setSelectedProject(project)}
              >
                Voir détails
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // 🎨 RENDU VUE GRILLE
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 Gestion des Projets</h1>
              <p className="text-gray-600">Organisez et suivez vos projets collaboratifs</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau projet
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-semibold text-gray-900">{globalStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-xl font-semibold text-gray-900">{globalStats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-xl font-semibold text-gray-900">{globalStats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En planif.</p>
                  <p className="text-xl font-semibold text-gray-900">{globalStats.planning}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En retard</p>
                  <p className="text-xl font-semibold text-gray-900">{globalStats.overdue}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des projets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(PROJECT_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Toutes priorités</option>
                  {Object.entries(PROJECT_PRIORITY).map(([key, priority]) => (
                    <option key={key} value={key}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  {Object.entries(VIEW_MODES).map(([mode, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-2 text-sm font-medium ${
                          viewMode === mode
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        title={config.label}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {filteredAndSortedProjects.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {projects.length === 0 ? 'Aucun projet trouvé' : 'Aucun résultat'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {projects.length === 0 
                      ? 'Commencez par créer votre premier projet.'
                      : 'Essayez de modifier vos filtres ou votre recherche.'
                    }
                  </p>
                  {projects.length === 0 && (
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Créer mon premier projet
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderGridView()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
