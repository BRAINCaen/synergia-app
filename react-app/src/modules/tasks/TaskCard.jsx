// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CORRECTION COMPLÈTE : Tous les imports avec chemins corrects
// ==========================================

import React, { useState } from 'react';
import { Calendar, Clock, Flag, User, CheckCircle, XCircle, Edit, Trash2, Award } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects
import { useTaskStore } from '../../shared/stores/taskStore';
import { useAuthStore } from '../../shared/stores/authStore';

export const TaskCard = ({ task, onEdit, onDelete, showProject = false }) => {
  const { updateTask } = useTaskStore(};

export default TaskCard;
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fonction pour marquer comme terminé/non terminé
  const handleToggleComplete = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await updateTask(task.id, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null
      });
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'todo': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = task.dueDate && 
    new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate) < new Date() && 
    task.status !== 'completed';

  return (
    <div className={`rounded-xl border p-6 transition-all duration-200 hover:border-gray-600 ${getPriorityColor(task.priority)}`}>
      
      {/* En-tête avec titre et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {/* Bouton statut */}
        <button
          onClick={handleToggleComplete}
          disabled={isUpdating}
          className={`p-2 rounded-lg transition-colors ${
            task.status === 'completed'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {task.status === 'completed' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        </button>
      </div>

      {/* Informations de la tâche */}
      <div className="space-y-3">
        
        {/* Statut et priorité */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'completed' ? '✅ Terminée' :
               task.status === 'in_progress' ? '🔄 En cours' :
               '📋 À faire'}
            </span>
            <span className="text-gray-600">•</span>
            <div className="flex items-center space-x-1">
              <Flag size={14} className={
                task.priority === 'high' ? 'text-red-400' :
                task.priority === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              } />
              <span className="text-sm text-gray-300 capitalize">{task.priority}</span>
            </div>
          </div>
          
          {/* XP si disponible */}
          {task.xpReward && (
            <div className="flex items-center space-x-1 text-blue-400">
              <Award size={14} />
              <span className="text-sm font-medium">{task.xpReward} XP</span>
            </div>
          )}
        </div>

        {/* Date d'échéance */}
        {task.dueDate && (
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-gray-400" />
            <span className={`text-sm ${
              isOverdue ? 'text-red-400 font-medium' : 'text-gray-300'
            }`}>
              {isOverdue ? '⚠️ ' : ''}Échéance: {formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {/* Temps estimé */}
        {task.estimatedTime && (
          <div className="flex items-center space-x-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-300">
              Temps estimé: {task.estimatedTime}h
            </span>
          </div>
        )}

        {/* Projet (si showProject est true) */}
        {showProject && task.projectTitle && (
          <div className="flex items-center space-x-2">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-300">
              Projet: {task.projectTitle}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Date de création/modification */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          {task.updatedAt ? (
            `Modifiée le ${formatDate(task.updatedAt)}`
          ) : task.createdAt ? (
            `Créée le ${formatDate(task.createdAt)}`
          ) : (
            'Date inconnue'
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Modifier la tâche"
          >
            <Edit size={16} />
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Supprimer la tâche"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
