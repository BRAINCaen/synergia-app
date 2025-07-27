// ==========================================
// 📁 react-app/src/shared/components/ui/TaskDetailModal.jsx
// MODAL DÉTAIL TÂCHE - SANS bouton "Marquer terminée" + commentaires réparés
// ==========================================

import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Target, 
  FileText,
  Trophy,
  Upload,
  Users
} from 'lucide-react';
import CommentSection from '../../components/collaboration/CommentSection.jsx';

/**
 * 📋 MODAL DÉTAIL DE TÂCHE - CORRIGÉE
 */
const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit  // Pour soumettre pour validation
}) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !task) return null;

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Date invalide';
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'validation_pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'todo': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'validation_pending': return 'En validation';
      case 'todo': return 'À faire';
      case 'pending': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-600">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4 border-b border-gray-600">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-xl font-bold text-white truncate mb-2">
                {task.title}
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'Normale'}
                </span>
                {task.xpReward && (
                  <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {task.xpReward} XP
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-600 bg-gray-750">
          <div className="px-6">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Détails
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                💬 Commentaires
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Description
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Métadonnées en grille */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Informations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Créateur */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <User className="w-4 h-4 mr-2" />
                      Créé par
                    </div>
                    <div className="text-white font-medium">
                      {task.createdBy || 'Inconnu'}
                    </div>
                  </div>

                  {/* Date de création */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Créée le
                    </div>
                    <div className="text-white font-medium">
                      {formatDate(task.createdAt)}
                    </div>
                  </div>

                  {/* Durée estimée */}
                  {task.estimatedHours && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Durée estimée
                      </div>
                      <div className="text-white font-medium">
                        {task.estimatedHours}h
                      </div>
                    </div>
                  )}

                  {/* Date d'échéance */}
                  {task.dueDate && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Flag className="w-4 h-4 mr-2" />
                        Échéance
                      </div>
                      <div className="text-white font-medium">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignés */}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Assignée à
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {task.assignedTo.map((userId, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm"
                        >
                          {userId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes supplémentaires */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              <CommentSection 
                entityType="task" 
                entityId={task.id} 
                className="bg-transparent border-0 p-0"
              />
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="border-t border-gray-600 bg-gray-750 px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Actions à gauche */}
            <div className="flex space-x-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </button>
              )}
            </div>

            {/* Action principale à droite */}
            <div className="flex space-x-3">
              {/* ✅ SEULEMENT le bouton de soumission pour validation */}
              {onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
                <button
                  onClick={() => onSubmit(task)}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Soumettre pour validation
                </button>
              )}

              <button
                onClick={onClose}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
