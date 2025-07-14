// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CARTE DE TÂCHE AVEC SYNTAXE CORRIGÉE
// ==========================================

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Flag,
  CheckCircle,
  AlertTriangle,
  Tag
} from 'lucide-react';
import SubmitTaskButton from './SubmitTaskButton.jsx';

/**
 * 🎯 CARTE D'AFFICHAGE D'UNE TÂCHE
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  showProject = false,
  compact = false 
}) => {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Gestionnaire de succès de soumission
  const handleSubmissionSuccess = () => {
    setSubmissionSuccess(true);
    if (onStatusChange) {
      onStatusChange(task);
    }
    
    // Reset après animation
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 2000);
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent':
        return 'border-red-600 bg-red-900/20';
      case 'high':
        return 'border-red-500 bg-red-800/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-800/20';
      case 'low':
        return 'border-green-500 bg-green-800/20';
      default:
        return 'border-gray-600 bg-gray-800/20';
    }
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'validation_pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      case 'todo':
      default:
        return 'text-gray-400';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      case 'validation_pending':
        return 'En validation';
      case 'rejected':
        return 'Rejetée';
      case 'todo':
      default:
        return 'À faire';
    }
  };

  // Formater une date
  const formatDate = (date) => {
    if (!date) return 'N/A';
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
