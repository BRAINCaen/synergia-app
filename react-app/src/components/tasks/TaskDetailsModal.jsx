// ==========================================
// 📁 react-app/src/components/tasks/TaskDetailsModal.jsx
// COMPOSANT MODAL DÉTAILS TÂCHE - FICHIER MANQUANT
// ==========================================

import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Target,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  Trophy
} from 'lucide-react';

/**
 * 📅 FORMATAGE DATE SÉCURISÉ
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Date inconnue';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Erreur formatage date:', error);
    return 'Date invalide';
  }
};

/**
 * 🎯 MODAL DÉTAILS TÂCHE
 */
const TaskDetailsModal = ({ 
  isOpen, 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit 
}) => {
  if (!isOpen || !task) return null;

  // Vérifier les permissions
  const canEdit = task.createdBy === task.currentUserId || 
                  (task.assignedTo && task.assignedTo.includes(task.currentUserId));

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'En attente' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      'validation_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En validation' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'urgent': { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
      'haute': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Haute' },
      'moyenne': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyenne' },
      'basse': { bg: 'bg-green-100', text: 'text-green-800', label: 'Basse' }
    };

    const config = priorityConfig[priority] || priorityConfig['moyenne'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 pr-4">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
              {task.xpReward && (
                <span className="flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                  <Trophy className="w-3 h-3 mr-1" />
                  {task.xpReward} XP
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Description
              </h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {task.description}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Assignation */}
            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  {task.assignedTo.length} assigné{task.assignedTo.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Échéance */}
            {task.dueDate && (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Échéance: {formatDate(task.dueDate)}
                </span>
              </div>
            )}

            {/* Temps estimé */}
            {task.estimatedHours && (
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  {task.estimatedHours}h estimée{task.estimatedHours > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Difficulté */}
            {task.difficulty && (
              <div className="flex items-center text-sm">
                <Target className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Difficulté: {task.difficulty}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </h3>
              <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                {task.notes}
              </p>
            </div>
          )}

          {/* Dates importantes */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Créée le: {formatDate(task.createdAt)}</div>
            {task.updatedAt && (
              <div>Modifiée le: {formatDate(task.updatedAt)}</div>
            )}
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            ID: {task.id}
          </div>
          
          <div className="flex gap-3">
            
            {/* Soumettre pour validation */}
            {onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
              <button
                onClick={() => {
                  onSubmit(task);
                  onClose();
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Soumettre
              </button>
            )}

            {/* Modifier */}
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            )}

            {/* Supprimer */}
            {canEdit && onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            )}

            {/* Fermer */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
