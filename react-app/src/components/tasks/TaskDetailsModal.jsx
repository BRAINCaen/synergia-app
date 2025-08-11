// ==========================================
// 📁 react-app/src/components/tasks/TaskDetailsModal.jsx
// MODAL DÉTAILS TÂCHE COMPLET AVEC TOUTES LES INFORMATIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Users,
  Target,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  Trophy,
  MessageCircle,
  Eye,
  Bell,
  Award,
  Flag,
  Info,
  MapPin,
  Paperclip,
  Repeat,
  Hash
} from 'lucide-react';

// Services
import { collaborationService } from '../../core/services/collaborationService.js';

/**
 * 📅 FORMATAGE DATE SÉCURISÉ
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Non définie';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Erreur formatage date:', error);
    return 'Date invalide';
  }
};

/**
 * 📅 FORMATAGE DURÉE ESTIMÉE
 */
const formatDuration = (hours) => {
  if (!hours || hours === 0) return 'Non estimée';
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return '1 heure';
  } else if (hours < 8) {
    return `${hours} heures`;
  } else {
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    if (remainingHours === 0) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return `${days} jour${days > 1 ? 's' : ''} ${remainingHours}h`;
    }
  }
};

/**
 * 💬 BADGE COMMENTAIRES AVEC NOTIFICATION
 */
const CommentNotificationBadge = ({ taskId, onCommentsClick }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      try {
        const comments = await collaborationService.getComments('task', taskId);
        const count = Array.isArray(comments) ? comments.length : 0;
        setCommentCount(count);
        
        // Simuler la détection de nouveaux commentaires
        // Dans une vraie app, on comparerait avec le lastRead de l'utilisateur
        setHasUnread(count > 0);
        
      } catch (error) {
        console.warn('Erreur chargement commentaires:', error);
        setCommentCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [taskId]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
        <span className="text-gray-500">Chargement...</span>
      </div>
    );
  }

  return (
    <button
      onClick={onCommentsClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative ${
        commentCount > 0
          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <MessageCircle className="w-4 h-4" />
      <span>
        {commentCount === 0 ? 'Aucun commentaire' : 
         commentCount === 1 ? '1 commentaire' : 
         `${commentCount} commentaires`}
      </span>
      
      {/* Badge de notification pour nouveaux commentaires */}
      {hasUnread && commentCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white">
          <div className="w-full h-full bg-red-500 rounded-full animate-ping" />
        </div>
      )}
    </button>
  );
};

/**
 * 🎯 MODAL DÉTAILS TÂCHE COMPLET
 */
const TaskDetailsModal = ({ 
  isOpen, 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit,
  onCommentsClick 
}) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !task) return null;

  // Configuration des statuts
  const getStatusConfig = (status) => {
    const statusConfigs = {
      'todo': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        label: 'À faire',
        icon: Clock 
      },
      'in_progress': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        label: 'En cours',
        icon: CheckCircle 
      },
      'validation_pending': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        label: 'En validation',
        icon: Eye 
      },
      'completed': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        label: 'Terminée',
        icon: Trophy 
      },
      'cancelled': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        label: 'Annulée',
        icon: X 
      }
    };
    return statusConfigs[status] || statusConfigs.todo;
  };

  // Configuration des priorités
  const getPriorityConfig = (priority) => {
    const priorityConfigs = {
      'low': { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Basse',
        icon: '🟢' 
      },
      'medium': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        label: 'Moyenne',
        icon: '🟡' 
      },
      'high': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        label: 'Haute',
        icon: '🟠' 
      },
      'urgent': { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Urgente',
        icon: '🔴' 
      }
    };
    return priorityConfigs[priority] || priorityConfigs.medium;
  };

  // Configuration des difficultés
  const getDifficultyConfig = (difficulty) => {
    const difficultyConfigs = {
      'easy': { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        label: 'Facile',
        stars: 1 
      },
      'normal': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        label: 'Normal',
        stars: 2 
      },
      'hard': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        label: 'Difficile',
        stars: 3 
      },
      'expert': { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        label: 'Expert',
        stars: 4 
      }
    };
    return difficultyConfigs[difficulty] || difficultyConfigs.normal;
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const difficultyConfig = getDifficultyConfig(task.difficulty);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header avec titre et actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                  {priorityConfig.icon} {priorityConfig.label}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Détails
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Commentaires
          </button>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[60vh]">
          
          {/* Onglet Détails */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* Badge de notification commentaires */}
              <div className="flex justify-center">
                <CommentNotificationBadge 
                  taskId={task.id}
                  onCommentsClick={() => setActiveTab('comments')}
                />
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Description
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Colonne gauche */}
                <div className="space-y-4">
                  
                  {/* Assignation */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-600" />
                      Assignation
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Créé par:</span>
                        <span className="ml-2 font-medium">{task.creatorName || 'Utilisateur inconnu'}</span>
                      </div>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Assigné à:</span>
                          <span className="ml-2 font-medium">
                            {task.assignedTo.length} personne{task.assignedTo.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {task.openToVolunteers && (
                        <div className="flex items-center text-sm">
                          <Heart className="w-4 h-4 text-red-400 mr-2" />
                          <span className="text-green-600 font-medium">Ouvert aux volontaires</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temporalité */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      Dates
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Créée:</span>
                        <span className="ml-2">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && (
                        <div>
                          <span className="text-gray-600">Modifiée:</span>
                          <span className="ml-2">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center">
                          <span className="text-gray-600">Échéance:</span>
                          <span className={`ml-2 font-medium ${
                            new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Récurrence */}
                  {task.isRecurring && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Repeat className="w-4 h-4 mr-2 text-gray-600" />
                        Récurrence
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-700 text-sm">
                          <Repeat className="w-4 h-4 inline mr-1" />
                          Tâche récurrente
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  
                  {/* Caractéristiques */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-gray-600" />
                      Caractéristiques
                    </h4>
                    <div className="space-y-3">
                      
                      {/* Difficulté */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Difficulté:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.bg} ${difficultyConfig.text}`}>
                          {Array.from({ length: difficultyConfig.stars }, (_, i) => (
                            <Star key={i} className="w-3 h-3 inline fill-current" />
                          ))}
                          {difficultyConfig.label}
                        </span>
                      </div>

                      {/* Catégorie */}
                      {task.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Catégorie:</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {task.category}
                          </span>
                        </div>
                      )}

                      {/* Durée estimée */}
                      {task.estimatedHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Durée estimée:</span>
                          <span className="flex items-center font-medium">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDuration(task.estimatedHours)}
                          </span>
                        </div>
                      )}

                      {/* Récompense XP */}
                      {task.xpReward && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Récompense:</span>
                          <span className="flex items-center font-medium text-yellow-600">
                            <Trophy className="w-4 h-4 mr-1" />
                            +{task.xpReward} XP
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Projet */}
                  {task.projectId && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                        Projet
                      </h4>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <p className="text-indigo-700 text-sm font-medium">
                          ID: {task.projectId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-gray-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 text-gray-600" />
                    Pièces jointes ({task.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border">
                        <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{attachment.name || `Pièce jointe ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Notes
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}

              {/* Métadonnées techniques */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-600">Informations techniques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">ID:</span>
                    <span className="ml-2 font-mono">{task.id}</span>
                  </div>
                  {task.version && (
                    <div>
                      <span className="font-medium">Version:</span>
                      <span className="ml-2">{task.version}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Commentaires */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Système de commentaires
                </h3>
                <p className="text-gray-500">
                  Les commentaires collaboratifs seront disponibles prochainement.
                </p>
                <div className="mt-4">
                  <CommentNotificationBadge 
                    taskId={task.id}
                    onCommentsClick={() => console.log('Ouverture commentaires')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {formatDate(task.updatedAt || task.createdAt)}
          </div>
          
          <div className="flex gap-3">
            
            {/* Soumettre pour validation */}
            {onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
              <button
                onClick={() => {
                  onSubmit(task);
                  onClose();
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Soumettre
              </button>
            )}

            {/* Modifier */}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            )}

            {/* Supprimer */}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            )}

            {/* Fermer */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
