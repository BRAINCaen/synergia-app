// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PAGE PROJETS AVEC DESIGN PREMIUM HARMONISÉ
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

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

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
  low: { label: 'Faible', color: 'gray', icon: '🔽' },
  medium: { label: 'Normale', color: 'blue', icon: '➡️' },
  high: { label: 'Élevée', color: 'orange', icon: '🔼' },
  urgent: { label: 'Urgente', color: 'red', icon: '🚨' }
};

/**
 * 📁 PAGE PROJETS PREMIUM COMPLÈTE
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE RÉELLES (conservées)
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ ÉTATS PRINCIPAUX (conservés)
  const [realProjects, setRealProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ ÉTATS UI COMPLETS (conservés)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ ÉTATS MODALS (conservés)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    deadline: '',
    tags: []
  });

  // ✅ CHARGEMENT DES PROJETS (conservé avec listener temps réel)
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('📊 [PROJECTS] Configuration listener projets...');
    
    // Listener temps réel pour les projets
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const projectsData = [];
        snapshot.forEach((doc) => {
          projectsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`📊 [PROJECTS] ${projectsData.length} projets chargés`);
        setRealProjects(projectsData);
        setLoading(false);
        setError('');
      },
      (error) => {
        console.error('❌ [PROJECTS] Erreur listener:', error);
        setError('Erreur de chargement des projets');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ FILTRAGE ET TRI DES PROJETS (conservé)
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = realProjects.filter(project => {
      // Filtre recherche
      if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre statut
      if (filterStatus !== 'all' && project.status !== filterStatus) {
        return false;
      }
      
      // Filtre priorité
      if (filterPriority !== 'all' && project.priority !== filterPriority) {
        return false;
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'deadline') {
        aVal = aVal ? new Date(aVal.seconds ? aVal.seconds * 1000 : aVal) : new Date(0);
        bVal = bVal ? new Date(bVal.seconds ? bVal.seconds * 1000 : bVal) : new Date(0);
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    return filtered;
  }, [realProjects, searchTerm, filterStatus, filterPriority, sortBy, sortOrder]);

  // ✅ STATISTIQUES CALCULÉES (conservées)
  const realProjectStats = useMemo(() => {
    const total = realProjects.length;
    const active = realProjects.filter(p => p.status === 'active').length;
    const completed = realProjects.filter(p => p.status === 'completed').length;
    const pending = realProjects.filter(p => p.status === 'pending').length;
    
    return {
      total,
      active,
      completed,
      pending,
      overallProgress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [realProjects]);

  // ✅ FONCTIONS CRUD (conservées)
  const handleCreateProject = async (projectData) => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        teamMembers: [user.uid],
        tasks: [],
        progress: 0
      });
      console.log('✅ Projet créé avec succès');
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        status: 'active',
        priority: 'medium',
        deadline: '',
        tags: []
      });
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      setError('Impossible de créer le projet');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      console.log('✅ Projet supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      setError('Impossible de supprimer le projet');
    }
  };

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Total Projets", 
      value: realProjectStats.total, 
      icon: FolderOpen, 
      color: "text-blue-400" 
    },
    { 
      label: "Actifs", 
      value: realProjectStats.active, 
      icon: PlayCircle, 
      color: "text-green-400" 
    },
    { 
      label: "Terminés", 
      value: realProjectStats.completed, 
      icon: CheckCircle, 
      color: "text-purple-400" 
    },
    { 
      label: "Progression", 
      value: `${realProjectStats.overallProgress}%`, 
      icon: TrendingUp, 
      color: "text-yellow-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      {/* 🔍 BARRE DE RECHERCHE PREMIUM */}
      <PremiumSearchBar
        placeholder="Rechercher un projet..."
        value={searchTerm}
        onChange={setSearchTerm}
        icon={Search}
        className="w-64"
      />

      {/* 🎛️ BOUTON FILTRES */}
      <PremiumButton
        variant={showFilters ? "primary" : "secondary"}
        icon={Filter}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtres
      </PremiumButton>

      {/* ➕ NOUVEAU PROJET */}
      <PremiumButton
        variant="primary"
        icon={Plus}
        onClick={() => setShowCreateModal(true)}
      >
        Nouveau Projet
      </PremiumButton>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (loading) {
    return (
      <PremiumLayout
        title="Gestion des Projets"
        subtitle="Chargement de vos projets..."
        icon={FolderOpen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation des projets...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // 🚨 GESTION ERREUR
  if (error) {
    return (
      <PremiumLayout
        title="Gestion des Projets"
        subtitle="Erreur de chargement"
        icon={FolderOpen}
      >
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Erreur de synchronisation</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
          <PremiumButton variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Projets"
      subtitle="Gérez vos projets en temps réel"
      icon={FolderOpen}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎛️ PANNEAU DE FILTRES PREMIUM */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                >
                  Réinitialiser
                </PremiumButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtre Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    {Object.entries(PROJECT_STATUS).map(([key, status]) => (
                      <option key={key} value={key}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes priorités</option>
                    {Object.entries(PROJECT_PRIORITY).map(([key, priority]) => (
                      <option key={key} value={key}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trier par</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="createdAt">Date de création</option>
                      <option value="title">Titre</option>
                      <option value="deadline">Échéance</option>
                      <option value="priority">Priorité</option>
                    </select>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎉 MESSAGE DE FÉLICITATIONS */}
      {realProjectStats.completed > 0 && realProjectStats.overallProgress >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <PremiumCard className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
            <div className="flex items-center justify-center text-center py-4">
              <Award className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-lg font-semibold text-white">Excellent travail !</p>
                <p className="text-gray-300">Vous avez un taux de réussite de {realProjectStats.overallProgress}%</p>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* 📋 GRILLE DES PROJETS PREMIUM */}
      <div className="space-y-6">
        {filteredAndSortedProjects.length === 0 ? (
          <PremiumCard className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Aucun projet ne correspond aux critères'
                : 'Aucun projet créé'
              }
            </h3>
            <p className="text-gray-400 mb-4">
              {realProjects.length === 0 
                ? 'Créez votre premier projet pour commencer.'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </p>
            {realProjects.length === 0 && (
              <PremiumButton
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Créer mon premier projet
              </PremiumButton>
            )}
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProjects.map((project, index) => {
              const status = PROJECT_STATUS[project.status];
              const priority = PROJECT_PRIORITY[project.priority];
              const StatusIcon = status?.icon || FolderOpen;
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <PremiumCard className="h-full">
                    {/* Header de la carte */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        
                        {/* Badges Status et Priorité */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {status && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                              ${status.color === 'green' ? 'bg-green-600 text-green-100' :
                                status.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                status.color === 'yellow' ? 'bg-yellow-600 text-yellow-100' :
                                status.color === 'orange' ? 'bg-orange-600 text-orange-100' :
                                'bg-purple-600 text-purple-100'}
                            `}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          )}
                          
                          {priority && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${priority.color === 'gray' ? 'bg-gray-600 text-gray-200' :
                                priority.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                priority.color === 'orange' ? 'bg-orange-600 text-orange-100' :
                                'bg-red-600 text-red-100'}
                            `}>
                              {priority.icon} {priority.label}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              // TODO: Navigation vers détails
                              console.log('Voir projet:', project.id);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowCreateModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                            title="Éditer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                    )}

                    {/* Métriques du projet */}
                    <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-700/50">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Équipe</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span className="text-sm font-medium text-white">
                            {project.teamMembers?.length || 1}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Tâches</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Target className="w-3 h-3 text-green-400" />
                          <span className="text-sm font-medium text-white">
                            {project.tasks?.length || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Progrès</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <BarChart3 className="w-3 h-3 text-purple-400" />
                          <span className="text-sm font-medium text-white">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date d'échéance */}
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Échéance: {new Date(project.deadline.seconds ? project.deadline.seconds * 1000 : project.deadline)
                            .toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Actions de la carte */}
                    <div className="flex gap-2 mt-auto">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => {
                          // TODO: Navigation vers détails
                          console.log('Voir projet:', project.id);
                        }}
                        className="flex-1"
                      >
                        Détails
                      </PremiumButton>
                      
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        icon={ChevronRight}
                        onClick={() => {
                          // TODO: Navigation vers gestion
                          console.log('Gérer projet:', project.id);
                        }}
                        className="flex-1"
                      >
                        Gérer
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 STATISTIQUES SUPPLÉMENTAIRES */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Projets ce mois"
          value={realProjects.filter(p => {
            const createdDate = new Date(p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
          }).length}
          icon={Calendar}
          color="blue"
          trend="Nouveau"
        />
        
        <StatCard
          title="Taux de Réussite"
          value={`${realProjectStats.overallProgress}%`}
          icon={TrendingUp}
          color="green"
          trend="Performance"
        />
        
        <StatCard
          title="Projets Urgents"
          value={realProjects.filter(p => p.priority === 'urgent' && p.status !== 'completed').length}
          icon={AlertCircle}
          color="red"
          trend="Action requise"
        />
        
        <StatCard
          title="XP Potentiel"
          value={realProjects.filter(p => p.status === 'active').length * 50}
          icon={Zap}
          color="yellow"
          trend="Objectifs actifs"
        />
      </div>

      {/* TODO: Modals à créer avec design premium */}
      {/* CreateProjectModal, ProjectDetailModal */}
    </PremiumLayout>
  );
};

export default ProjectsPage;
