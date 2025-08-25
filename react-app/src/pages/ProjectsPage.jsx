// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PAGE PROJETS AVEC IMPORTS CORRIGÉS POUR LE BUILD
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen,
  Plus,
  Search,
  Filter,
  Users,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  Award,
  ChevronRight
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM - CORRIGÉ POUR BUILD
import PremiumLayout, { PremiumCard, PremiumStatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

// 📊 FIREBASE (conservé)
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES PROJETS (conservées)
const PROJECT_STATUS = {
  active: { label: 'Actif', color: 'green', icon: PlayCircle },
  completed: { label: 'Terminé', color: 'blue', icon: CheckCircle },
  pending: { label: 'En attente', color: 'yellow', icon: AlertCircle },
  'on-hold': { label: 'En pause', color: 'orange', icon: PauseCircle },
  planning: { label: 'Planification', color: 'purple', icon: Calendar }
};

const PROJECT_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '⬇️' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '➡️' },
  high: { label: 'Élevée', color: 'orange', icon: '⬆️' },
  urgent: { label: 'Urgente', color: 'red', icon: '🚨' }
};

const PROJECT_TABS = {
  all: { label: 'Tous', icon: FolderOpen, count: 'all' },
  active: { label: 'Actifs', icon: PlayCircle, count: 'active' },
  completed: { label: 'Terminés', icon: CheckCircle, count: 'completed' },
  planning: { label: 'Planification', icon: Calendar, count: 'planning' }
};

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE PERSONNALISÉE
 */
const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher des projets..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
};

/**
 * 📊 COMPOSANT CARTE PROJET
 */
const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const status = PROJECT_STATUS[project.status] || PROJECT_STATUS.pending;
  const priority = PROJECT_PRIORITY[project.priority] || PROJECT_PRIORITY.medium;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onView(project)}
            className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-400/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(project)}
            className="text-yellow-400 hover:text-yellow-300 p-1.5 rounded-lg hover:bg-yellow-400/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badges statut et priorité */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${priority.color}-100 text-${priority.color}-800`}>
          <span>{priority.icon}</span>
          <span>{priority.label}</span>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{project.tasksCompleted || 0}</p>
          <p className="text-xs text-gray-400">Tâches terminées</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">{project.tasksTotal || 0}</p>
          <p className="text-xs text-gray-400">Total tâches</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">{project.progress || 0}%</p>
          <p className="text-xs text-gray-400">Progression</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r from-${status.color}-400 to-${status.color}-500 transition-all duration-500`}
          style={{ width: `${project.progress || 0}%` }}
        ></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {project.createdAt?.toLocaleDateString?.() || 'Non défini'}
          </span>
        </div>
        
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex items-center space-x-1">
            <Users className="w-3.5 h-3.5" />
            <span>{project.teamMembers.length} membres</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 📊 PAGE PRINCIPALE PROJETS
 */
const ProjectsPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎯 FILTRES ET RECHERCHE
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 🎯 MODALS
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState(null);

  // 📊 CHARGEMENT DES PROJETS EN TEMPS RÉEL
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));

        console.log('📊 [PROJECTS] Projets chargés:', projectsData.length);
        setProjects(projectsData);
        setIsLoading(false);
        setError(null);
      }, (error) => {
        console.error('❌ [PROJECTS] Erreur chargement:', error);
        setError(error.message);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur setup listener:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [user?.uid]);

  // 📊 PROJETS FILTRÉS ET TRIÉS
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Filtre par onglet
    if (activeTab !== 'all') {
      filtered = filtered.filter(project => project.status === activeTab);
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(project => project.priority === selectedPriority);
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = aVal?.getTime?.() || 0;
        bVal = bVal?.getTime?.() || 0;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, activeTab, searchTerm, selectedStatus, selectedPriority, sortBy, sortOrder]);

  // 📊 STATISTIQUES
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const planning = projects.filter(p => p.status === 'planning').length;
    const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total) : 0;

    return {
      total,
      active,
      completed,
      planning,
      avgProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [projects]);

  // ⚡ ACTIONS
  const handleCreateProject = async (projectData) => {
    try {
      console.log('📝 [PROJECTS] Création projet:', projectData);
      
      const newProject = {
        ...projectData,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: 0,
        tasksCompleted: 0,
        tasksTotal: 0
      };

      await addDoc(collection(db, 'projects'), newProject);
      console.log('✅ [PROJECTS] Projet créé');
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur création:', error);
    }
  };

  const handleEdit = (project) => {
    console.log('✏️ [PROJECTS] Édition projet:', project.id);
    setSelectedProjectForEdit(project);
    setShowNewProjectModal(true);
  };

  const handleDelete = async (projectId) => {
    try {
      console.log('🗑️ [PROJECTS] Suppression projet:', projectId);
      await deleteDoc(doc(db, 'projects', projectId));
      console.log('✅ [PROJECTS] Projet supprimé');
    } catch (error) {
      console.error('❌ [PROJECTS] Erreur suppression:', error);
    }
  };

  const handleView = (project) => {
    console.log('👁️ [PROJECTS] Affichage détails projet:', project.id);
    setSelectedProjectForDetails(project);
  };

  // 📊 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { title: 'Total', value: stats.total, icon: FolderOpen, color: 'blue' },
    { title: 'Actifs', value: stats.active, icon: PlayCircle, color: 'green' },
    { title: 'Terminés', value: stats.completed, icon: CheckCircle, color: 'purple' },
    { title: 'Progression', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'yellow' }
  ];

  // ⚡ ACTIONS DU HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton
        variant="secondary"
        onClick={() => window.location.reload()}
      >
        <Search className="w-4 h-4" />
        Actualiser
      </PremiumButton>
      
      <PremiumButton
        onClick={() => {
          setSelectedProjectForEdit(null);
          setShowNewProjectModal(true);
        }}
        icon={Plus}
        variant="primary"
      >
        Nouveau projet
      </PremiumButton>
    </div>
  );

  if (isLoading) {
    return (
      <PremiumLayout
        title="📁 Projets"
        subtitle="Gestion et suivi de vos projets"
        icon={FolderOpen}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des projets...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="📁 Projets"
        subtitle="Gestion et suivi de vos projets"
        icon={FolderOpen}
      >
        <PremiumCard className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <PremiumButton variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="📁 Projets"
      subtitle="Gestion et suivi de vos projets"
      icon={FolderOpen}
      headerActions={headerActions}
      headerStats={headerStats}
    >
      {/* Contrôles de filtrage */}
      <div className="mb-8">
        <PremiumCard className="p-4">
          {/* Onglets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(PROJECT_TABS).map(([key, tab]) => {
              const Icon = tab.icon;
              const isActive = activeTab === key;
              const count = key === 'all' ? stats.total : stats[key] || 0;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Filtres */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(PROJECT_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les priorités</option>
              {Object.entries(PROJECT_PRIORITY).map(([key, priority]) => (
                <option key={key} value={key}>{priority.label}</option>
              ))}
            </select>
          </div>
        </PremiumCard>
      </div>

      {/* Grille des projets */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        /* Message si aucun projet */
        <PremiumCard className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : `Aucun projet dans la catégorie "${PROJECT_TABS[activeTab].label}".`}
          </p>
          <PremiumButton
            onClick={() => {
              setSelectedProjectForEdit(null);
              setShowNewProjectModal(true);
            }}
            icon={Plus}
            variant="primary"
          >
            Créer un projet
          </PremiumButton>
        </PremiumCard>
      )}

      {/* Message d'encouragement pour les nouveaux utilisateurs */}
      {projects.length === 0 && !isLoading && (
        <div className="mt-8">
          <PremiumCard className="text-center py-12">
            <Award className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Bienvenue dans vos projets !</h3>
            <p className="text-gray-400 mb-6">
              Organisez votre travail en créant votre premier projet.
            </p>
            <div className="flex justify-center space-x-4">
              <PremiumButton
                onClick={() => setShowNewProjectModal(true)}
                icon={Plus}
                variant="primary"
              >
                Mon premier projet
              </PremiumButton>
              <PremiumButton
                onClick={() => window.location.href = '/onboarding'}
                variant="secondary"
              >
                Guide de démarrage
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* TODO: Modals pour création/édition/détails des projets */}
      {/* Ces modals seront ajoutés dans une future mise à jour */}
    </PremiumLayout>
  );
};

export default ProjectsPage;
