// src/modules/tasks/TaskCard.jsx - Version sombre assortie au design
import React, { useState } from 'react';
import { useTaskStore } from '../../shared/stores/taskStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

export const TaskCard = ({ task, onEdit }) => {
  const { completeTask, updateTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Couleurs par priorité - VERSION SOMBRE
  const priorityColors = {
    urgent: 'bg-red-900 border-red-700 text-red-300',
    high: 'bg-orange-900 border-orange-700 text-orange-300',
    medium: 'bg-blue-900 border-blue-700 text-blue-300',
    low: 'bg-gray-700 border-gray-600 text-gray-300'
  };

  // Icônes par priorité
  const priorityIcons = {
    urgent: '🔥',
    high: '⚡',
    medium: '📌',
    low: '📝'
  };

  // Statut de la tâche
  const getStatusInfo = () => {
    switch (task.status) {
      case 'completed':
        return { color: 'text-green-400', icon: '✅', label: 'Terminé' };
      case 'in_progress':
        return { color: 'text-blue-400', icon: '▶️', label: 'En cours' };
      default:
        return { color: 'text-gray-400', icon: '⏰', label: 'À faire' };
    }
  };

  // Vérifier si la tâche est en retard
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate;
    return dueDate < new Date();
  };

  // Formatter la date
  const formatDate = (date) => {
    if (!date) return null;
    const dateObj = date.toDate ? date.toDate() : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  // Compléter la tâche
  const handleComplete = async () => {
    if (task.status === 'completed') return;
    
    setIsCompleting(true);
    try {
      await completeTask(task.id, user.uid, task.estimatedTime);
    } catch (error) {
      console.error('Erreur completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Changer le statut
  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus }, user.uid);
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  // Supprimer la tâche
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(task.id, user.uid);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`bg-gray-800 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 ${
      isOverdue() ? 'border-red-700 bg-red-900 bg-opacity-20' : 'border-gray-700'
    }`}>
      {/* Header avec statut et actions */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusInfo.icon}</span>
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-400">⋮</span>
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
              <button
                onClick={() => { onEdit?.(task); setShowActions(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-600 w-full text-left text-gray-300 hover:text-white transition-colors"
              >
                <span>✏️</span>
                Modifier
              </button>
              {task.status !== 'in_progress' && (
                <button
                  onClick={() => { handleStatusChange('in_progress'); setShowActions(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-600 w-full text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span>▶️</span>
                  Commencer
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => { handleStatusChange('todo'); setShowActions(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-600 w-full text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span>⏸️</span>
                  Pause
                </button>
              )}
              <button
                onClick={() => { handleDelete(); setShowActions(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-600 w-full text-left text-red-400 hover:text-red-300 transition-colors"
              >
                <span>🗑️</span>
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-4">
        {/* Titre et description */}
        <h3 className={`font-semibold mb-1 ${
          task.status === 'completed' 
            ? 'line-through text-gray-500' 
            : 'text-white'
        }`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-400' : ''}`}>
              <span>📅</span>
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue() && <span className="text-red-400 font-medium">• En retard</span>}
            </div>
          )}
          
          {task.estimatedTime && (
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{Math.round(task.estimatedTime / 60)}h {task.estimatedTime % 60}min</span>
            </div>
          )}
        </div>

        {/* Tags et priorité */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priorité */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
              priorityColors[task.priority]
            }`}>
              <span>{priorityIcons[task.priority]}</span>
              {task.priority}
            </span>
            
            {/* Tags */}
            {task.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md border border-gray-600">
                #{tag}
              </span>
            ))}
            {task.tags?.length > 2 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
            )}
          </div>

          {/* Bouton completion */}
          {task.status !== 'completed' && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isCompleting ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>✅</span>
              )}
              {isCompleting ? 'Terminé...' : 'Terminer'}
            </button>
          )}
          
          {task.status === 'completed' && task.xpReward > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900 border border-yellow-700 text-yellow-300 text-xs rounded-md font-medium">
              ⭐ +{task.xpReward} XP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default TaskCard;
