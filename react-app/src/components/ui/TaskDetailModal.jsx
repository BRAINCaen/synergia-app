// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAIL TÂCHE AVEC AFFICHAGE UTILISATEURS CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Users,
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Target, 
  FileText,
  Trophy,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import CommentSection from '../collaboration/CommentSection.jsx';
import UsersList from './UsersList.jsx';

/**
 * 🎨 MODAL DÉTAILS DE TÂCHE AVEC UTILISATEURS RÉSOLUS
 */
const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onEdit, 
  onDelete,
  onStatusChange 
}) => {
  const [activeTab, setActiveTab] = useState('details');

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  // 🎯 Couleur selon priorité
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400 bg-green-500/20',
      medium: 'text-yellow-400 bg-yellow-500/20', 
      high: 'text-orange-400 bg-orange-500/20',
      critical: 'text-red-400 bg-red-500/20'
    };
    return colors[priority] || colors.medium;
  };

  // 🎨 Couleur selon statut
  const getStatusColor = (status) => {
    const colors = {
      'todo': 'text-gray-400 bg-gray-500/20',
      'in_progress': 'text-blue-400 bg-blue-500/20',
      'under_review': 'text-purple-400 bg-purple-500/20',
      'completed': 'text-green-400 bg-green-500/20',
      'cancelled': 'text-red-400 bg-red-500/20'
    };
    return colors[status] || colors.todo;
  };

  // 📅 Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // 🏷️ Traduire statut
  const translateStatus = (status) => {
    const translations = {
      'todo': 'À faire',
      'in_progress': 'En cours',
      'under_review': 'En révision', 
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return translations[status] || status;
  };

  // 🎯 Traduire priorité
  const translatePriority = (priority) => {
    const translations = {
      'low': 'Basse',
      'medium': 'Moyenne',
      'high': 'Haute', 
      'critical': 'Critique'
    };
    return translations[priority] || priority;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-label="Fermer la modal"
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {task.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {translateStatus(task.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {translatePriority(task.priority)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800/50">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Commentaires
            </button>
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
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Échéances
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créée le :</span>
                        <span className="text-gray-200">{formatDate(task.createdAt)}</span>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Échéance :</span>
                          <span className="text-gray-200">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Modifiée le :</span>
                          <span className="text-gray-200">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Informations
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                      {task.estimatedHours && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Temps estimé :</span>
                          <span className="text-gray-200">{task.estimatedHours}h</span>
                        </div>
                      )}
                      
                      {task.xpReward && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Récompense XP :</span>
                          <span className="text-yellow-400 font-medium">+{task.xpReward} XP</span>
                        </div>
                      )}
                      
                      {task.projectName && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Projet :</span>
                          <span className="text-blue-400">{task.projectName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Tags
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* UTILISATEURS ASSIGNÉS - CORRIGÉ */}
                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Assignée à ({task.assignedTo.length})
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <UsersList 
                        userIds={task.assignedTo} 
                        layout="vertical"
                        showEmails={true}
                        className=""
                      />
                    </div>
                  </div>
                )}

                {/* Notes supplémentaires */}
                {task.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Notes
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {task.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions de statut */}
                {onStatusChange && task.status !== 'completed' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Actions
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {task.status === 'todo' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'in_progress')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Commencer
                          </button>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => onStatusChange(task.id, 'under_review')}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                            >
                              Soumettre pour révision
                            </button>
                            <button
                              onClick={() => onStatusChange(task.id, 'completed')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                            >
                              Marquer terminé
                            </button>
                          </>
                        )}
                        
                        {task.status === 'under_review' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'completed')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Valider et terminer
                          </button>
                        )}
                      </div>
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
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
