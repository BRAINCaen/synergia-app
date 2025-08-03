// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PAGE FIREBASE PUR - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Filter,
  Search,
  Edit,
  Trash2
} from 'lucide-react';

/**
 * 📁 PROJECTS PAGE FIREBASE PUR
 * Tous les projets proviennent exclusivement de Firebase
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ DONNÉES FIREBASE RÉELLES UNIQUEMENT
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ PROJETS RÉELS DEPUIS FIREBASE
  const [realProjects, setRealProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // ✅ STATISTIQUES RÉELLES CALCULÉES
  const [realProjectStats, setRealProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    deadline: '',
    tags: []
  });

  useEffect(() => {
    if (user?.uid) {
      loadRealProjects();
    }
  }, [user?.uid]);

  useEffect(() => {
    applyFilters();
  }, [realProjects, searchTerm, filterStatus]);

  /**
   * 📊 CHARGER TOUS LES VRAIS PROJETS FIREBASE
   */
  const loadRealProjects = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement projets Firebase pour:', user.uid);
      
      // Récupérer TOUS les projets de l'utilisateur
      const [createdProjects, memberProjects] = await Promise.all([
        getDocs(query(
          collection(db, 'projects'),
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc')
        )),
        getDocs(query(
          collection(db, 'projects'),
          where('members', 'array-contains', user.uid),
          orderBy('createdAt', 'desc')
        ))
      ]);

      // Combiner et dédupliquer les projets
      const allUserProjects = new Map();
      
      createdProjects.forEach(doc => {
        allUserProjects.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      memberProjects.forEach(doc => {
        allUserProjects.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const projectsArray = Array.from(allUserProjects.values());
      
      // 📊 CALCULER PROGRESSION RÉELLE POUR CHAQUE PROJET
      const projectsWithProgress = await Promise.all(
        projectsArray.map(async (project) => {
          try {
            // Récupérer les tâches du projet
            const projectTasksSnapshot = await getDocs(query(
              collection(db, 'tasks'),
              where('projectId', '==', project.id)
            ));
            
            const projectTasks = [];
            projectTasksSnapshot.forEach(doc => {
              projectTasks.push({ id: doc.id, ...doc.data() });
            });
            
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              ...project,
              tasksTotal: totalTasks,
              tasksCompleted: completedTasks,
              progress
            };
          } catch (error) {
            console.warn(`Erreur calcul progression projet ${project.id}:`, error);
            return {
              ...project,
              tasksTotal: 0,
              tasksCompleted: 0,
              progress: 0
            };
          }
        })
      );
      
      // 📊 CALCULER LES VRAIES STATISTIQUES GLOBALES
      const total = projectsWithProgress.length;
      const active = projectsWithProgress.filter(p => p.status === 'active').length;
      const completed = projectsWithProgress.filter(p => p.status === 'completed').length;
      const pending = projectsWithProgress.filter(p => p.status === 'pending').length;
      const totalTasks = projectsWithProgress.reduce((sum, p) => sum + p.tasksTotal, 0);
      const completedTasks = projectsWithProgress.reduce((sum, p) => sum + p.tasksCompleted, 0);
      const overallProgress = total > 0 ? Math.round(
        projectsWithProgress.reduce((sum, p) => sum + p.progress, 0) / total
      ) : 0;

      setRealProjects(projectsWithProgress);
      setRealProjectStats({
        total,
        active,
        completed,
        pending,
        totalTasks,
        completedTasks,
        overallProgress
      });

      console.log('✅ Projets Firebase chargés:', {
        total: projectsWithProgress.length,
        stats: realProjectStats
      });

    } catch (error) {
      console.error('❌ Erreur chargement projets Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 APPLIQUER LES FILTRES
   */
  const applyFilters = () => {
    let filtered = [...realProjects];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(filtered);
  };

  /**
   * ✅ CRÉER NOUVEAU PROJET FIREBASE
   */
  const handleCreateProject = async () => {
    if (!user?.uid || !newProject.title.trim()) return;

    try {
      console.log('➕ Création projet Firebase:', newProject.title);
      
      const projectData = {
        ...newProject,
        createdBy: user.uid,
        members: [user.uid],
        tasksTotal: 0,
        tasksCompleted: 0,
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      // Recharger les projets
      await loadRealProjects();
      
      // Reset form
      setNewProject({
        title: '',
        description: '',
        status: 'active',
        priority: 'medium',
        deadline: '',
        tags: []
      });
      setShowCreateModal(false);
      
      console.log('✅ Projet créé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
    }
  };

  /**
   * 🔄 METTRE À JOUR PROJET
   */
  const handleUpdateProject = async (projectId, updates) => {
    try {
      console.log('🔄 Mise à jour projet:', projectId, updates);
      
      await updateDoc(doc(db, 'projects', projectId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Recharger les projets
      await loadRealProjects();
      
      console.log('✅ Projet mis à jour');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
    }
  };

  /**
   * 🗑️ SUPPRIMER PROJET
   */
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    try {
      console.log('🗑️ Suppression projet:', projectId);
      
      await deleteDoc(doc(db, 'projects', projectId));
      
      // Recharger les projets
      await loadRealProjects();
      
      console.log('✅ Projet supprimé');
      
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
    }
  };

  /**
   * 🎨 OBTENIR COULEUR STATUT
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 🎨 OBTENIR COULEUR PRIORITÉ
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de vos projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
              <p className="text-lg text-gray-600 mt-1">
                Gérez vos projets en temps réel
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Projet
            </button>
          </div>
        </div>

        {/* STATISTIQUES RÉELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projets */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{realProjectStats.total}</p>
              </div>
              <FolderOpen className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* Projets Actifs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-3xl font-bold text-green-600">{realProjectStats.active}</p>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Tâches Totales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tâches</p>
                <p className="text-3xl font-bold text-purple-600">{realProjectStats.totalTasks}</p>
                <p className="text-sm text-gray-500">{realProjectStats.completedTasks} terminées</p>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          {/* Progression Globale */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progression</p>
                <p className="text-3xl font-bold text-orange-600">{realProjectStats.overallProgress}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* SECTION GAMIFICATION */}
        {gamification && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Votre Progression</h3>
                <p className="text-2xl font-bold">Niveau {gamification.level || 1}</p>
                <p className="text-sm opacity-90">{gamification.totalXp || 0} XP • {gamification.badges?.length || 0} badges</p>
              </div>
              <div className="text-right">
                <FolderOpen className="h-8 w-8 mb-2" />
                <p className="text-sm">Excellent travail !</p>
              </div>
            </div>
          </div>
        )}

        {/* FILTRES */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtre Statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="pending">En attente</option>
              <option value="on-hold">En pause</option>
            </select>
          </div>
        </div>

        {/* GRILLE DES PROJETS RÉELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  {/* En-tête projet */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: Edit modal */}}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    {project.priority && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    )}
                  </div>

                  {/* Progression */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Statistiques tâches */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {project.tasksCompleted}/{project.tasksTotal} tâches
                    </span>
                    {project.deadline && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Aucun projet trouvé' : 'Aucun projet pour le moment'}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm || filterStatus !== 'all' ? 'Essayez de modifier vos filtres' : 'Créez votre premier projet pour commencer'}
              </p>
            </div>
