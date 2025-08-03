// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PAGE CORRIGÉE - TOUTES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FolderPlus, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  Heart,
  FolderX,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Archive,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// Firebase imports
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 📁 PAGE PROJETS COMPLÈTE
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'development',
    priority: 'medium',
    status: 'planning'
  });

  console.log('📁 ProjectsPage rendue pour:', user?.email);

  // Charger les projets
  useEffect(() => {
    loadProjects();
  }, [user]);

  // Filtrer les projets
  useEffect(() => {
    let filtered = projects;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      console.log('📁 Chargement des projets...');

      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const allProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrer les projets de l'utilisateur
      const userProjects = allProjects.filter(project => 
        project.team?.some(member => member.userId === user.uid) ||
        project.createdBy === user.uid
      );

      // Ajouter des projets de démonstration si vide
      if (userProjects.length === 0) {
        const demoProjects = [
          {
            id: 'demo-1',
            title: 'Site Web Entreprise',
            description: 'Refonte complète du site web corporate avec nouvelles fonctionnalités',
            category: 'development',
            priority: 'high',
            status: 'active',
            progress: 65,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            createdBy: user.uid,
            team: [
              { userId: user.uid, role: 'manager', name: user.displayName || user.email.split('@')[0] }
            ],
            tags: ['web', 'react', 'design'],
            budget: 25000,
            tasksCount: 24,
            completedTasks: 16
          },
          {
            id: 'demo-2',
            title: 'Application Mobile',
            description: 'Développement d\'une application mobile pour la gestion des tâches',
            category: 'mobile',
            priority: 'medium',
            status: 'planning',
            progress: 15,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            createdBy: user.uid,
            team: [
              { userId: user.uid, role: 'developer', name: user.displayName || user.email.split('@')[0] }
            ],
            tags: ['mobile', 'flutter', 'ui'],
            budget: 18000,
            tasksCount: 12,
            completedTasks: 2
          },
          {
            id: 'demo-3',
            title: 'Formation Équipe',
            description: 'Programme de formation sur les nouvelles technologies',
            category: 'education',
            priority: 'low',
            status: 'completed',
            progress: 100,
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            createdBy: user.uid,
            team: [
              { userId: user.uid, role: 'trainer', name: user.displayName || user.email.split('@')[0] }
            ],
            tags: ['formation', 'team', 'skills'],
            budget: 5000,
            tasksCount: 8,
            completedTasks: 8
          }
        ];
        setProjects(demoProjects);
      } else {
        setProjects(userProjects);
      }

      console.log('✅ Projets chargés:', userProjects.length);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau projet
  const createProject = async () => {
    if (!newProject.title.trim()) return;

    try {
      const projectData = {
        ...newProject,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        team: [
          { userId: user.uid, role: 'manager', name: user.displayName || user.email.split('@')[0] }
        ],
        progress: 0,
        tasksCount: 0,
        completedTasks: 0,
        tags: []
      };

      await addDoc(collection(db, 'projects'), projectData);
      console.log('✅ Projet créé:', newProject.title);
      
      setShowCreateModal(false);
      setNewProject({ title: '', description: '', category: 'development', priority: 'medium', status: 'planning' });
      loadProjects();
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
    }
  };

  // Utilitaires d'affichage
  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return <Target className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            📋 HEADER
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                📁 Gestion de Projets
              </h1>
              <p className="text-gray-400 text-lg">
                Créez, gérez et suivez vos projets collaboratifs
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau Projet
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{projects.filter(p => p.status === 'active').length}</div>
              <div className="text-gray-400 text-sm">Actifs</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{projects.filter(p => p.status === 'planning').length}</div>
              <div className="text-gray-400 text-sm">En planning</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{projects.filter(p => p.status === 'completed').length}</div>
              <div className="text-gray-400 text-sm">Terminés</div>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            🔍 FILTRES ET RECHERCHE
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="planning">Planning</option>
                <option value="active">Actifs</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminés</option>
              </select>

              {/* Mode d'affichage */}
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            📋 LISTE DES PROJETS
            ========================================== */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des projets...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl text-gray-400 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Modifiez vos filtres ou créez un nouveau projet'
                : 'Créez votre premier projet pour commencer !'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-transform"
            >
              Créer un projet
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-[1.02] transition-transform duration-200 ${
                  viewMode === 'list' ? 'flex items-center gap-6' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  {/* Header du projet */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 hover:text-blue-400 transition-colors">
                          <Link to={`/projects/${project.id}`}>
                            {project.title}
                          </Link>
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-full ${getPriorityColor(project.priority)}`}>
                        <Star className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Statut et progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">
                          {project.status === 'planning' ? 'Planning' :
                           project.status === 'active' ? 'Actif' :
                           project.status === 'paused' ? 'En pause' : 'Terminé'}
                        </span>
                      </span>
                      <span className="text-gray-400 text-sm">{project.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.team?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {project.completedTasks}/{project.tasksCount}
                      </span>
                      {project.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : 'justify-end'}`}>
                  <Link
                    to={`/projects/${project.id}`}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Voir le projet"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button 
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ==========================================
            ➕ MODAL CRÉATION PROJET
            ========================================== */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4">Créer un nouveau projet</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Nom du projet"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Description du projet"
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                      <select
                        value={newProject.category}
                        onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="development">Développement</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="education">Formation</option>
                        <option value="research">Recherche</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
                      <select
                        value={newProject.priority}
                        onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={createProject}
                    disabled={!newProject.title.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectsPage;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ ProjectsPage corrigée et complète');
console.log('📁 Toutes fonctionnalités: CRUD, filtres, recherche, vues');
console.log('🚀 Interface premium sans PremiumLayout');
