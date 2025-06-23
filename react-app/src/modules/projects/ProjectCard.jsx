// ==========================================
// 📁 react-app/src/modules/projects/ProjectCard.jsx
// Carte projet améliorée avec aperçu des tâches
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../shared/stores/taskStore.js';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete,
  onCreateTask 
}) => {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const [projectTasks, setProjectTasks] = useState([]);
  const [showActions, setShowActions] = useState(false);

  // Filtrer les tâches du projet
  useEffect(() => {
    const filteredTasks = tasks.filter(task => task.projectId === project.id);
    setProjectTasks(filteredTasks);
  }, [tasks, project.id]);

  // Calculer les statistiques
  const getProjectStats = () => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = projectTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      progressPercentage
    };
  };

  // Obtenir les tâches récentes (3 dernières)
  const getRecentTasks = () => {
    return projectTasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  // Gérer le clic sur la carte
  const handleCardClick = (e) => {
    // Ne pas naviguer si on clique sur les boutons d'action
    if (e.target.closest('.action-button')) return;
    navigate(`/projects/${project.id}`);
  };

  // Créer une nouvelle tâche pour ce projet
  const handleCreateTaskForProject = (e) => {
    e.stopPropagation();
    if (onCreateTask) {
      onCreateTask(project.id);
    }
  };

  const stats = getProjectStats();
  const recentTasks = getRecentTasks();

  // Déterminer la couleur du statut
  const getStatusColor = () => {
    switch (project.status) {
      case 'completed': return 'bg-green-600';
      case 'active': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      case 'planning': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  // Déterminer la couleur de priorité
  const getPriorityColor = () => {
    switch (project.priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header avec couleur du projet */}
      <div 
        className="h-3"
        style={{ backgroundColor: project.color || '#3b82f6' }}
      />

      <div className="p-6">
        {/* En-tête du projet */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
                  {project.status === 'completed' ? '✅ Terminé' :
                   project.status === 'active' ? '🟢 Actif' :
                   project.status === 'paused' ? '⏸️ Pause' :
                   project.status === 'planning' ? '🔵 Planning' :
                   '📦 Archivé'}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor()}`}>
                  {project.priority === 'urgent' ? '🔥' :
                   project.priority === 'high' ? '⚡' :
                   project.priority === 'medium' ? '📌' : '📝'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleCreateTaskForProject}
              className="action-button p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Ajouter une tâche"
            >
              ➕
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project);
              }}
              className="action-button p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier le projet"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project);
              }}
              className="action-button p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Supprimer le projet"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Progression</span>
            <span className="text-xs font-medium text-white">{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Statistiques des tâches */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{stats.totalTasks}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-xs text-gray-400">Terminées</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{stats.overdueTasks}</div>
            <div className="text-xs text-gray-400">En retard</div>
          </div>
        </div>

        {/* Aperçu des tâches récentes */}
        {recentTasks.length > 0 ? (
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-2">Tâches récentes :</h5>
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-400' :
                    task.priority === 'high' ? 'bg-orange-400' :
                    task.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    task.status === 'todo' ? 'bg-gray-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {task.status === 'in_progress' ? '🔄' :
                     task.status === 'todo' ? '📝' : '✅'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm text-gray-400 mb-2">Aucune tâche</p>
            <button
              onClick={handleCreateTaskForProject}
              className="action-button text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Créer la première tâche
            </button>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Échéance si définie */}
        {project.deadline && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">📅 Échéance :</span>
            <span className={`text-xs font-medium ${
              new Date(project.deadline) < new Date() && project.status !== 'completed'
                ? 'text-red-400'
                : 'text-gray-300'
            }`}>
              {new Date(project.deadline).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
