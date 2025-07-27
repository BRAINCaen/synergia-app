// ==========================================
// 📁 react-app/src/components/tasks/TaskProjectLinking.jsx
// SYSTÈME DE LIAISON TÂCHES-PROJETS OPTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Folder,
  FolderPlus,
  Link,
  Unlink,
  Search,
  Users,
  Calendar,
  Target,
  Plus,
  X,
  Check
} from 'lucide-react';

import { projectService } from '../../core/services/projectService';
import { useAuthStore } from '../../shared/stores/authStore';

/**
 * 🔗 SÉLECTEUR DE PROJET POUR TÂCHE
 */
const ProjectSelector = ({ 
  selectedProjectId, 
  onProjectSelect, 
  onProjectClear,
  className = '',
  showCreateOption = true 
}) => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les projets disponibles
  useEffect(() => {
    loadUserProjects();
  }, [user?.uid]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;

      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects || []);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Projet sélectionné
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center">
          {selectedProject ? (
            <>
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
              <span className="truncate">{selectedProject.title}</span>
            </>
          ) : (
            <>
              <FolderPlus className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-400">Lier à un projet (optionnel)</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {selectedProject && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProjectClear();
              }}
              className="p-1 hover:bg-gray-500 rounded text-gray-400 hover:text-white"
              title="Retirer le projet"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div className="text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {/* Dropdown de sélection */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste des projets */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-400">
                Chargement des projets...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-3 text-center text-gray-400">
                {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet disponible'}
              </div>
            ) : (
              filteredProjects.map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onProjectSelect(project);
                    setShowDropdown(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Folder className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {project.title}
                      </p>
                      {project.description && (
                        <p className="text-gray-400 text-xs truncate">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    {project.status && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        project.status === 'active' ? 'bg-green-600/20 text-green-300' :
                        project.status === 'planning' ? 'bg-yellow-600/20 text-yellow-300' :
                        project.status === 'completed' ? 'bg-blue-600/20 text-blue-300' :
                        'bg-gray-600/20 text-gray-300'
                      }`}>
                        {project.status}
                      </span>
                    )}
                    
                    {selectedProjectId === project.id && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Option créer nouveau projet */}
          {showCreateOption && (
            <div className="border-t border-gray-600">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center text-green-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm">Créer un nouveau projet</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal création projet rapide */}
      {showCreateModal && (
        <QuickProjectCreateModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={(newProject) => {
            setProjects(prev => [newProject, ...prev]);
            onProjectSelect(newProject);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

/**
 * 🚀 MODAL DE CRÉATION RAPIDE DE PROJET
 */
const QuickProjectCreateModal = ({ onClose, onProjectCreated }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Le titre du projet est requis');
      return;
    }

    try {
      setLoading(true);
      
      const newProject = await projectService.createProject(formData, user.uid);
      
      console.log('✅ Projet créé rapidement:', newProject.title);
      onProjectCreated(newProject);
      
    } catch (error) {
      console.error('❌ Erreur création projet rapide:', error);
      alert('Erreur lors de la création du projet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-600">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Créer un projet</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Titre du projet *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Refonte du site web"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                placeholder="Description courte du projet..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planification</option>
                  <option value="active">Actif</option>
                  <option value="on_hold">En pause</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * 📊 AFFICHAGE DU PROJET LIÉ
 */
const LinkedProjectDisplay = ({ 
  project, 
  onUnlink, 
  showUnlinkButton = true,
  compact = false 
}) => {
  if (!project) return null;

  return (
    <div className={`flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg ${
      compact ? 'text-sm' : ''
    }`}>
      <div className="flex items-center min-w-0 flex-1">
        <Folder className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-blue-300 font-medium truncate">
              {project.title}
            </p>
            {project.status && (
              <span className={`px-2 py-1 text-xs rounded ${
                project.status === 'active' ? 'bg-green-600/20 text-green-300' :
                project.status === 'planning' ? 'bg-yellow-600/20 text-yellow-300' :
                project.status === 'completed' ? 'bg-blue-600/20 text-blue-300' :
                'bg-gray-600/20 text-gray-300'
              }`}>
                {project.status}
              </span>
            )}
          </div>
          {project.description && !compact && (
            <p className="text-blue-400/70 text-sm truncate mt-1">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {showUnlinkButton && onUnlink && (
        <button
          onClick={onUnlink}
          className="ml-2 p-1 hover:bg-blue-800/50 rounded text-blue-400 hover:text-blue-300 transition-colors"
          title="Délier du projet"
        >
          <Unlink className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * 📋 LISTE DES TÂCHES D'UN PROJET
 */
const ProjectTasksList = ({ projectId, onTaskClick }) => {
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProjectTasks();
    }
  }, [projectId]);

  const loadProjectTasks = async () => {
    try {
      setLoading(true);
      
      // Importer le service de tâches
      const { taskService } = await import('../../core/services/taskService');
      const tasks = await taskService.getTasksByProject(projectId);
      
      setProjectTasks(tasks || []);
    } catch (error) {
      console.error('❌ Erreur chargement tâches projet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Chargement des tâches du projet...
      </div>
    );
  }

  if (projectTasks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Aucune tâche liée à ce projet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-white mb-3">
        Tâches du projet ({projectTasks.length})
      </h4>
      
      {projectTasks.map(task => (
        <div
          key={task.id}
          onClick={() => onTaskClick && onTaskClick(task)}
          className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {task.title}
              </p>
              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                <span className={`px-2 py-1 rounded ${
                  task.status === 'completed' ? 'bg-green-600/20 text-green-300' :
                  task.status === 'in_progress' ? 'bg-blue-600/20 text-blue-300' :
                  task.status === 'validation_pending' ? 'bg-orange-600/20 text-orange-300' :
                  'bg-gray-600/20 text-gray-300'
                }`}>
                  {task.status === 'completed' ? 'Terminée' :
                   task.status === 'in_progress' ? 'En cours' :
                   task.status === 'validation_pending' ? 'En validation' :
                   'À faire'}
                </span>
                
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {task.assignedTo?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Exports
export default ProjectSelector;
export {
  ProjectSelector,
  QuickProjectCreateModal,
  LinkedProjectDisplay,
  ProjectTasksList
};
