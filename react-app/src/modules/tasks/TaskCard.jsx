// src/modules/tasks/TaskCard.jsx
import React, { useState } from 'react';
import { useTaskStore } from '../../shared/stores/taskStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { CheckCircle, Clock, Calendar, Flag, MoreVertical, Edit, Trash2, Play, Pause } from 'lucide-react';

export const TaskCard = ({ task, onEdit }) => {
  const { completeTask, updateTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Couleurs par priorité
  const priorityColors = {
    urgent: 'bg-red-100 border-red-300 text-red-800',
    high: 'bg-orange-100 border-orange-300 text-orange-800',
    medium: 'bg-blue-100 border-blue-300 text-blue-800',
    low: 'bg-gray-100 border-gray-300 text-gray-800'
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
        return { color: 'text-green-600', icon: CheckCircle, label: 'Terminé' };
      case 'in_progress':
        return { color: 'text-blue-600', icon: Play, label: 'En cours' };
      default:
        return { color: 'text-gray-600', icon: Clock, label: 'À faire' };
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
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
      isOverdue() ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      {/* Header avec statut et actions */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <StatusIcon 
            size={18} 
            className={`${statusInfo.color} ${task.status === 'completed' ? 'fill-current' : ''}`} 
          />
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                onClick={() => { onEdit?.(task); setShowActions(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
              >
                <Edit size={14} />
                Modifier
              </button>
              {task.status !== 'in_progress' && (
                <button
                  onClick={() => { handleStatusChange('in_progress'); setShowActions(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                >
                  <Play size={14} />
                  Commencer
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => { handleStatusChange('todo'); setShowActions(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                >
                  <Pause size={14} />
                  Pause
                </button>
              )}
              <button
                onClick={() => { handleDelete(); setShowActions(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-4">
        {/* Titre et description */}
        <h3 className={`font-semibold text-gray-900 mb-1 ${
          task.status === 'completed' ? 'line-through text-gray-500' : ''
        }`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-600' : ''}`}>
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue() && <span className="text-red-600 font-medium">• En retard</span>}
            </div>
          )}
          
          {task.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
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
              <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                #{tag}
              </span>
            ))}
            {task.tags?.length > 2 && (
              <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
            )}
          </div>

          {/* Bouton completion */}
          {task.status !== 'completed' && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isCompleting ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              {isCompleting ? 'Terminé...' : 'Terminer'}
            </button>
          )}
          
          {task.status === 'completed' && task.xpReward > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium">
              ⭐ +{task.xpReward} XP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
