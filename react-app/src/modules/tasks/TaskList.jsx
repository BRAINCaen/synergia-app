// ==========================================
// 📁 react-app/src/modules/tasks/TaskList.jsx
// LISTE TÂCHES FIREBASE PUR - COMPOSANT UNIQUE
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  User,
  Calendar,
  Star,
  Target,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

/**
 * 📋 COMPOSANT LISTE DES TÂCHES
 * Affiche et gère les tâches Firebase
 */
const TaskList = ({ 
  tasks = [], 
  onUpdateTask, 
  onDeleteTask, 
  loading = false 
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  /**
   * 🎨 OBTENIR COULEUR STATUT
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎨 OBTENIR COULEUR PRIORITÉ
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * 🎯 OBTENIR ICÔNE STATUT
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckSquare;
      case 'in-progress': return Play;
      case 'todo': return Clock;
      default: return Clock;
    }
  };

  /**
   * 🔄 CHANGER STATUT TÂCHE
   */
  const handleStatusChange = async (taskId, newStatus) => {
    if (onUpdateTask) {
      await onUpdateTask(taskId, { status: newStatus });
    }
  };

  /**
   * ✏️ COMMENCER ÉDITION
   */
  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      xpReward: task.xpReward || 20
    });
  };

  /**
   * 💾 SAUVEGARDER ÉDITION
   */
  const saveEdit = async () => {
    if (onUpdateTask) {
      await onUpdateTask(editingTask, editForm);
      setEditingTask(null);
      setEditForm({});
    }
  };

  /**
   * ❌ ANNULER ÉDITION
   */
  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  /**
   * 🗑️ SUPPRIMER TÂCHE
   */
  const handleDelete = async (taskId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      if (onDeleteTask) {
        await onDeleteTask(taskId);
      }
    }
  };

  /**
   * 📅 FORMATER DATE
   */
  const formatDate = (date) => {
    if (!date) return '';
    
    // Si c'est un timestamp Firebase
    if (date.toDate) {
      return date.toDate().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Si c'est une date normale
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des tâches...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500 mb-2">Aucune tâche pour le moment</p>
        <p className="text-sm text-gray-400">Créez votre première tâche pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map((task) => {
        const StatusIcon = getStatusIcon(task.status);
        const isEditing = editingTask === task.id;

        return (
          <div 
            key={task.id} 
            className="p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            {isEditing ? (
              /* MODE ÉDITION */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      XP Récompense
                    </label>
                    <input
                      type="number"
                      value={editForm.xpReward}
                      onChange={(e) => setEditForm({ ...editForm, xpReward: parseInt(e.target.value) || 20 })}
                      min="5"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            ) : (
              /* MODE AFFICHAGE */
              <div className="flex items-start space-x-4">
                {/* Icône statut */}
                <div className="flex-shrink-0 mt-1">
                  <StatusIcon 
                    className={`h-5 w-5 ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'in-progress' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} 
                  />
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Titre */}
                      <h3 className={`text-lg font-semibold ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* Statut */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status === 'completed' ? 'Terminée' :
                           task.status === 'in-progress' ? 'En cours' :
                           'À faire'}
                        </span>

                        {/* Priorité */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'urgent' ? 'Urgente' :
                           task.priority === 'high' ? 'Haute' :
                           task.priority === 'medium' ? 'Moyenne' :
                           'Basse'}
                        </span>

                        {/* XP */}
                        {task.xpReward && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            <Star className="h-3 w-3 mr-1" />
                            {task.xpReward} XP
                          </span>
                        )}
                      </div>

                      {/* Métadonnées */}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        {task.createdAt && (
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Créée le {formatDate(task.createdAt)}
                          </span>
                        )}
                        {task.updatedAt && task.updatedAt !== task.createdAt && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Modifiée le {formatDate(task.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Changer statut */}
                      <div className="flex items-center space-x-1">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Marquer comme terminée"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </button>
                        )}
                        
                        {task.status === 'todo' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'in-progress')}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Commencer"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'todo')}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Mettre en pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        
                        {task.status === 'completed' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'todo')}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Rouvrir"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Éditer */}
                      <button
                        onClick={() => startEditing(task)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Éditer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
