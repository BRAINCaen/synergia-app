// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CORRECTION : Tous les imports avec chemins corrects
// ==========================================

import React, { useState } from 'react';
import { Calendar, Clock, Flag, User, CheckCircle, XCircle, Edit, Trash2, Award } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects
import { useTaskStore } from '../../shared/stores/taskStore';
import { useAuthStore } from '../../shared/stores/authStore';

export const TaskCard = ({ task, onEdit, onDelete, showProject = false }) => {
  const { updateTask } = useTaskStore();
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
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={task.status === 'completed' ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
        >
          {isUpdating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Informations tâche */}
      <div className="space-y-3 mb-4">
        
        {/* Projet si affiché */}
        {showProject && task.projectTitle && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Projet: {task.projectTitle}</span>
          </div>
        )}
        
        {/* Date d'échéance */}
        {task.dueDate && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(task.dueDate)}</span>
            {isOverdue && <span className="text-red-400 font-medium">(En retard)</span>}
          </div>
        )}
        
        {/* Assigné à */}
        {task.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>Assigné à: {task.assignedToName || 'Utilisateur'}</span>
          </div>
        )}
        
        {/* XP Reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Award className="w-4 h-4" />
            <span>+{task.xpReward || 10} XP</span>
          </div>
          
          {/* Statut */}
          <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
            {task.status === 'completed' ? '✅ Terminé' : 
             task.status === 'in_progress' ? '🔄 En cours' : '📋 À faire'}
          </span>
        </div>
        
        {/* Priorité */}
        <div className="flex items-center gap-2">
          <Flag className={`w-4 h-4 ${
            task.priority === 'high' ? 'text-red-400' :
            task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`} />
          <span className="text-sm text-gray-400 capitalize">{task.priority || 'normal'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Bouton éditer */}
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Éditer
        </button>
        
        {/* Bouton supprimer */}
        <button
          onClick={() => onDelete(task.id)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Indicateur si tâche terminée récemment */}
      {task.status === 'completed' && task.completedAt && (
        <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Terminé le {formatDate(task.completedAt)}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
