// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CORRECTION COMPLÈTE AVEC BOUTON DE VALIDATION INTÉGRÉ
// ==========================================

import React, { useState } from 'react';
import { Calendar, Clock, Flag, User, CheckCircle, XCircle, Edit, Trash2, Award, X } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects
import { useTaskStore } from '../../shared/stores/taskStore.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import SubmitTaskButton from '../../components/tasks/SubmitTaskButton.jsx';

export const TaskCard = ({ task, onEdit, onDelete, showProject = false }) => {
  const { updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fonction pour marquer comme terminé/non terminé (garde l'ancienne logique en backup)
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

  // Gérer le succès de soumission
  const handleSubmissionSuccess = (result) => {
    console.log('✅ Soumission réussie:', result);
    // Recharger les données si nécessaire
    // Ou mettre à jour l'état local
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
      case 'validation_pending': return 'text-orange-400';
      case 'rejected': return 'text-red-400';
      case 'in_progress': return 'text-blue-400';
      case 'todo': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Validée';
      case 'validation_pending': return 'En validation';
      case 'rejected': return 'Rejetée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'À faire';
      default: return 'Inconnu';
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
    <div className={`bg-gray-800 border-l-4 ${getPriorityColor(task.priority)} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      {/* En-tête avec titre et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
            {task.title}
          </h3>
          
          {/* Badge de statut */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            
            {/* Indicateur de priorité */}
            {task.priority && task.priority !== 'medium' && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.priority === 'high' 
                  ? 'bg-red-900 text-red-300' 
                  : 'bg-green-900 text-green-300'
              }`}>
                {task.priority === 'high' ? 'Priorité élevée' : 'Priorité faible'}
              </span>
            )}

            {/* Indicateur de difficulté et XP */}
            {task.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                task.difficulty === 'hard' ? 'bg-red-900 text-red-300' :
                task.difficulty === 'expert' ? 'bg-purple-900 text-purple-300' :
                'bg-blue-900 text-blue-300'
              }`}>
                {task.difficulty === 'easy' ? 'Facile (10 XP)' :
                 task.difficulty === 'hard' ? 'Difficile (50 XP)' :
                 task.difficulty === 'expert' ? 'Expert (100 XP)' :
                 'Normal (25 XP)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Métadonnées de la tâche */}
      <div className="space-y-2 mb-4">
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

        {/* Commentaire admin si tâche rejetée */}
        {task.status === 'rejected' && task.adminComment && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              <strong>Commentaire admin:</strong> {task.adminComment}
            </p>
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
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        
        {/* Boutons d'action à gauche */}
        <div className="flex space-x-2">
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

        {/* Bouton de soumission pour validation à droite */}
        <div className="flex-shrink-0">
          <SubmitTaskButton 
            task={task}
            onSubmissionSuccess={handleSubmissionSuccess}
            size="default"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
