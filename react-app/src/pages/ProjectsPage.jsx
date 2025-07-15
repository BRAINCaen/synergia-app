// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION MISE À JOUR - SUPPRESSION BUDGET/REPOSITORY + NOUVELLES CATÉGORIES SYNERGIA
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  Clock,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  Flag,
  FileText,
  Tag,
  Settings
} from 'lucide-react';

// Imports
import { useAuthStore } from '../shared/stores/authStore.js';

// 🎯 NOUVELLES CATÉGORIES SYNERGIA MÉTIER
const SYNERGIA_CATEGORIES = [
  { 
    value: 'escape_game', 
    label: 'Escape Game & Expériences Immersives',
    icon: '🎮',
    description: 'Création et maintenance des salles d\'escape game'
  },
  { 
    value: 'maintenance_tech', 
    label: 'Maintenance Technique & Matériel',
    icon: '🔧',
    description: 'Maintenance des équipements et infrastructure'
  },
  { 
    value: 'experience_client', 
    label: 'Expérience Client & Accueil',
    icon: '⭐',
    description: 'Gestion de l\'accueil et satisfaction client'
  },
  { 
    value: 'communication_marketing', 
    label: 'Communication & Marketing Digital',
    icon: '📱',
    description: 'Promotion et communication sur les réseaux'
  },
  { 
    value: 'gestion_operations', 
    label: 'Gestion des Opérations',
    icon: '📋',
    description: 'Organisation interne et coordination'
  },
  { 
    value: 'partenariats_b2b', 
    label: 'Partenariats & Relations B2B',
    icon: '🤝',
    description: 'Développement commercial et partenariats'
  },
  { 
    value: 'formation_equipe', 
    label: 'Formation & Développement Équipe',
    icon: '🎓',
    description: 'Formation interne et montée en compétences'
  },
  { 
    value: 'innovation_produit', 
    label: 'Innovation & Nouveaux Produits',
    icon: '💡',
    description: 'Développement de nouvelles expériences'
  }
];

// 🎭 RÔLES SYNERGIA POUR ATTRIBUTION ÉQUIPE
const SYNERGIA_TEAM_ROLES = [
  {
    id: 'game_master',
    name: 'Game Master',
    icon: '🎮',
    color: 'bg-purple-500',
    description: 'Animation des sessions et expérience client'
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Technique',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Entretien et réparations techniques'
  },
  {
    id: 'reputation',
    name: 'Gestion Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Avis clients et image de marque'
  },
  {
    id: 'stock',
    name: 'Gestion Stocks',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Inventaire et approvisionnement'
  },
  {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et planification'
  },
  {
    id: 'content',
    name: 'Création Contenu',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Contenu visuel et communication'
  },
  {
    id: 'mentoring',
    name: 'Formation & Mentorat',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement équipe'
  },
  {
    id: 'partnerships',
    name: 'Partenariats',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement partenariats'
  },
  {
    id: 'communication',
    name: 'Communication Digitale',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Réseaux sociaux et communication'
  },
  {
    id: 'b2b',
    name: 'Relations B2B',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Relations entreprises et devis'
  }
];

// Hook personnalisé pour la gestion des projets
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simuler le service de projets - remplace par tes vrais services
  const projectService = {
    createProject: async (projectData) => {
      // Logique de création Firebase
      console.log('Création projet:', projectData);
      return { id: Date.now().toString(), ...projectData };
    },
    updateProject: async (projectId, updates) => {
      // Logique de mise à jour Firebase
      console.log('Mise à jour projet:', projectId, updates);
      return { id: projectId, ...updates };
    },
    deleteProject: async (projectId) => {
      // Logique de suppression Firebase
      console.log('Suppression projet:', projectId);
    }
  };

  const loadUserProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Remplace par ta logique de chargement Firebase
      setProjects([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error('❌ Erreur création projet:', err);
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (projectId, updatedProject) => {
    try {
      const result = await projectService.updateProject(projectId, updatedProject);
      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          return { ...project, ...updatedProject };
        }
        return project;
      }));
      return result;
    } catch (err) {
      console.error('❌ Erreur mise à jour projet:', err);
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error('❌ Erreur suppression projet:', err);
      throw err;
    }
  }, []);

  return {
    projects,
    loading,
    error,
    loadUserProjects,
    createProject,
    updateProject,
    deleteProject
  };
};

// ✅ COMPOSANT FORMULAIRE PROJET MIS À JOUR
const ProjectForm = ({ isOpen, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    priority: project?.priority || 'medium',
    category: project?.category || 'escape_game',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    tags: project?.tags?.join(', ') || '',
    teamRoles: project?.teamRoles || [], // ✅ NOUVEAU: Rôles assignés au lieu de client/équipe
    estimatedHours: project?.estimatedHours || ''
  });

  const [saving, setSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(project?.teamRoles || []);

  if (!isOpen) return null;

  // Gestion de l'ajout/suppression de rôles
  const toggleRole = (roleId) => {
    setSelectedRoles(prev => {
      const isSelected = prev.includes(roleId);
      if (isSelected) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const projectData = {
        ...formData,
        teamRoles: selectedRoles, // ✅ NOUVEAU: Sauvegarder les rôles sélectionnés
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        createdAt: project ? project.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(projectData);
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {project ? 'Modifier le projet' : 'Nouveau projet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Titre du projet */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Titre du projet *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                placeholder="Ex: Nouvelle salle d'escape game futuriste"
                required
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description détaillée
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                rows="4"
                placeholder="Décrivez les objectifs, fonctionnalités et contraintes du projet..."
              />
            </div>

            {/* ✅ NOUVELLE CATÉGORIE SYNERGIA */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Domaine d'application Synergia
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
              >
                {SYNERGIA_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {SYNERGIA_CATEGORIES.find(c => c.value === formData.category)?.description}
              </p>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* Heures estimées */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heures estimées
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                min="1"
                placeholder="Ex: 40"
              />
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
              />
            </div>

            {/* Date de fin prévue */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date de fin prévue
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
              />
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-400"
                placeholder="urgent, client-facing, innovation, maintenance..."
              />
            </div>

            {/* ✅ NOUVEAU: ATTRIBUTION RÔLES ÉQUIPE SYNERGIA */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Rôles Synergia impliqués dans ce projet
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {SYNERGIA_TEAM_ROLES.map(role => (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                      ${selectedRoles.includes(role.id) 
                        ? 'border-blue-400 bg-blue-900/30' 
                        : 'border-gray-600 bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${role.color} flex items-center justify-center text-white text-sm`}>
                        {role.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {role.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Sélectionnez les rôles qui participeront à ce projet. 
                Cela permettra d'assigner automatiquement les bonnes compétences.
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{project ? 'Mettre à jour' : 'Créer le projet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant principal de la page projets
const ProjectsPage = () => {
  const { user } = useAuthStore();
  const {
    projects,
    loading,
    error,
    loadUserProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjects();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user, loadUserProjects]);

  const handleSaveProject = async (projectData) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, projectData);
      } else {
        await createProject(projectData);
      }
      setShowProjectForm(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Erreur sauvegarde projet:', error);
    }
  };

  const openEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const openNewProject = () => {
    setSelectedProject(null);
    setShowProjectForm(true);
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projets Synergia</h1>
            <p className="text-gray-400">Gérez vos projets d'escape game et expériences</p>
          </div>
          <button
            onClick={openNewProject}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Nouveau projet</span>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-400"
            />
          </div>
        </div>

        {/* Liste des projets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white truncate">
                  {project.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditProject(project)}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Catégorie */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                  {SYNERGIA_CATEGORIES.find(c => c.value === project.category)?.icon} {' '}
                  {SYNERGIA_CATEGORIES.find(c => c.value === project.category)?.label}
                </span>
              </div>

              {/* Rôles assignés */}
              {project.teamRoles && project.teamRoles.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {project.teamRoles.slice(0, 3).map(roleId => {
                      const role = SYNERGIA_TEAM_ROLES.find(r => r.id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          className="inline-flex items-center px-1 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {role.icon} {role.name}
                        </span>
                      ) : null;
                    })}
                    {project.teamRoles.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{project.teamRoles.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              {project.startDate && (
                <div className="text-xs text-gray-400">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(project.startDate).toLocaleDateString('fr-FR')}
                  {project.endDate && (
                    <> → {new Date(project.endDate).toLocaleDateString('fr-FR')}</>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* État vide */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet pour le moment'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Créez votre premier projet pour commencer'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={openNewProject}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Créer un projet</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal formulaire projet */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default ProjectsPage;
