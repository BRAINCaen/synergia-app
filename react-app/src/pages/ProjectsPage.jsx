// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION ULTRA-BASIQUE SANS ERREUR - REMPLACE L'EXISTANT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Grid3X3,
  List
} from 'lucide-react';

// Imports Firebase directs - SANS CONFLITS
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Layout et auth - IMPORTS DIRECTS
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🔧 COMPOSANT PROJECTCARD INTERNE - Éviter imports externes
 */
const ProjectCard = ({ project, isVolunteer = false, showVolunteerButton = false }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      'planning': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800', 
      'completed': 'bg-gray-100 text-gray-800',
      'paused': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'low': 'border-green-300 text-green-600',
      'medium': 'border-yellow-300 text-yellow-600',
      'high': 'border-red-300 text-red-600'
    };
    return priorityColors[priority] || 'border-gray-300 text-gray-600';
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const progress = calculateProgress(project);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {project.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {project.description || 'Aucune description disponible'}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(project.priority)}`}>
              {project.priority || 'Normal'}
            </span>
          </div>
        </div>

        {/* Progression */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {project.tasks?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Tâches</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {project.teamMembers?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Membres</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {project.xpReward || 0}
            </div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {project.createdAt ? 
                new Date(project.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 
                'Date inconnue'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {showVolunteerButton && (
              <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                <Heart className="w-3 h-3 inline mr-1" />
                Rejoindre
              </button>
            )}
            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 🚀 PAGE PROJETS PRINCIPALE
 */
const ProjectsPage = () => {
  // États locaux
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('assigned');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium'
  });

  // Auth
  const { user } = useAuthStore();

  /**
   * 📊 CHARGEMENT DES PROJETS DEPUIS FIREBASE
   */
  const loadAllProjects = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('🔄 Chargement des projets pour:', user.uid);

      // Projets assignés (où l'utilisateur est membre ou créateur)
      const assignedQuery = query(
        collection(db, 'projects'),
        where('teamMembers', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );

      const assignedSnapshot = await getDocs(assignedQuery);
      const assigned = [];
      assignedSnapshot.forEach(doc => {
        assigned.push({ id: doc.id, ...doc.data() });
      });

      // Projets créés par l'utilisateur
      const createdQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const createdSnapshot = await getDocs(createdQuery);
      createdSnapshot.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };
        // Éviter les doublons
        if (!assigned.find(p => p.id === project.id)) {
          assigned.push(project);
        }
      });

      // Projets disponibles (publics, non rejoints)
      const availableQuery = query(
        collection(db, 'projects'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );

      const availableSnapshot = await getDocs(availableQuery);
      const available = [];
      availableSnapshot.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };
        // Exclure les projets déjà assignés
        if (!assigned.find(p => p.id === project.id)) {
          available.push(project);
        }
      });

      setAssignedProjects(assigned);
      setAvailableProjects(available);

      console.log('✅ Projets chargés:', {
        assigned: assigned.length,
        available: available.length
      });

    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      // Fallback avec données vides
      setAssignedProjects([]);
      setAvailableProjects([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 FILTRAGE DES PROJETS
   */
  const filteredAssignedProjects = assignedProjects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableProjects = availableProjects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 📊 STATISTIQUES RAPIDES
   */
  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  /**
   * 🚀 CRÉATION DE PROJET
   */
  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  /**
   * 📝 MODAL DE CRÉATION - COMPOSANT INTERNE
   */
  const CreateProjectModal = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title.trim()) {
        alert('Le titre est requis');
        return;
      }

      try {
        console.log('🔄 Création projet:', formData);

        const newProject = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status,
          priority: formData.priority,
          createdBy: user.uid,
          teamMembers: [user.uid],
          tasks: [],
          isPublic: false,
          xpReward: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'projects'), newProject);
        
        setShowCreateModal(false);
        setFormData({ 
          title: '', 
          description: '', 
          status: 'planning', 
          priority: 'medium' 
        });
        
        // Recharger les projets
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Description du projet..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planning">Planification</option>
                  <option value="active">Actif</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Chargement initial
  useEffect(() => {
    if (user?.uid) {
      loadAllProjects();
    }
  }, [user?.uid]);

  if (loading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des projets...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Projets</h1>
              <p className="text-gray-600">
                Gérez vos projets et découvrez de nouvelles opportunités
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection('assigned')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Mes projets ({filteredAssignedProjects.length})
              </button>
              <button
                onClick={() => setActiveSection('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Volontariat ({filteredAvailableProjects.length})
              </button>
            </nav>
          </div>
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
    </PremiumLayout>
  );
};

export default ProjectsPage;
