// ==========================================
// 📁 react-app/src/components/tasks/TaskDetailsModal.jsx
// MODAL DÉTAILS TÂCHE AVEC SYNCHRONISATION FIREBASE TEMPS RÉEL
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
  Hash,
  Send
} from 'lucide-react';

// 🚨 IMPORT DU SERVICE DE COLLABORATION TEMPS RÉEL
import { collaborationService } from '../../core/services/collaborationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

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
 * 💬 SECTION COMMENTAIRES AVEC SYNCHRONISATION TEMPS RÉEL
 */
const TaskCommentsSection = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 SYNCHRONISATION TEMPS RÉEL DES COMMENTAIRES
  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    console.log('🔄 [TASK_COMMENTS] Configuration synchronisation temps réel pour tâche:', taskId);
    
    // 📡 ABONNEMENT TEMPS RÉEL AUX COMMENTAIRES
    const unsubscribe = collaborationService.subscribeToComments(
      'task',
      taskId,
      (updatedComments) => {
        console.log('📡 [TASK_COMMENTS] Commentaires mis à jour:', updatedComments.length);
        setComments(updatedComments);
        setLoading(false);
        setError(null);
      }
    );

    // Cleanup lors du démontage
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [taskId]);

  // 📤 ENVOYER UN COMMENTAIRE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || submitting || !currentUser?.uid) {
      return;
    }

    console.log('📤 [TASK_COMMENTS] Envoi commentaire pour tâche:', taskId);
    
    setSubmitting(true);
    setError(null);
    
    try {
      // 📝 DONNÉES COMPLÈTES POUR FIREBASE
      const commentData = {
        entityType: 'task',
        entityId: taskId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Utilisateur',
        userEmail: currentUser.email || '',
        content: newComment.trim()
      };
      
      console.log('📝 [TASK_COMMENTS] Données commentaire:', commentData);
      
      // 🚀 AJOUT AVEC SYNCHRONISATION FIREBASE
      const savedComment = await collaborationService.addComment(commentData);
      
      if (savedComment) {
        console.log('✅ [TASK_COMMENTS] Commentaire sauvegardé:', savedComment.id);
        
        // Réinitialiser le champ (la liste se met à jour automatiquement via le listener)
        setNewComment('');
        
        // Notification de succès
        if (window.showNotification) {
          window.showNotification('💬 Commentaire ajouté !', 'success');
        }
      }
      
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur envoi commentaire:', error);
      setError(`Impossible d'envoyer le commentaire: ${error.message}`);
      
      if (window.showNotification) {
        window.showNotification('❌ Erreur lors de l\'envoi', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 🗑️ SUPPRIMER UN COMMENTAIRE
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
      return;
    }

    try {
      console.log('🗑️ [TASK_COMMENTS] Suppression commentaire:', commentId);
      await collaborationService.deleteComment(commentId, currentUser.uid);
      console.log('✅ [TASK_COMMENTS] Commentaire supprimé');
      
      // La liste se met à jour automatiquement via le listener
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur suppression:', error);
      setError('Impossible de supprimer le commentaire');
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-400 text-sm">Chargement des commentaires...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
            <p className="text-gray-600 text-xs mt-1">Soyez le premier à commenter cette tâche !</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              {/* En-tête du commentaire */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="font-medium text-white">
                      {comment.userName || 'Utilisateur'}
                    </span>
                    <div className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                      {comment.isEdited && <span className="italic ml-1">(modifié)</span>}
                    </div>
                  </div>
                </div>
                
                {/* Actions pour ses propres commentaires */}
                {currentUser && comment.userId === currentUser.uid && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-400 text-xs"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Contenu du commentaire */}
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire à cette tâche..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                {comments.length > 0 ? '🟢 Synchronisé en temps réel' : '💬 Premier commentaire'}
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Message si non connecté */}
      {!currentUser && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
    </div>
  );
};

/**
 * 💬 BADGE COMMENTAIRES AVEC NOTIFICATION TEMPS RÉEL
 */
const CommentNotificationBadge = ({ taskId, onCommentsClick }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    // 📡 ÉCOUTER LES COMMENTAIRES EN TEMPS RÉEL
    const unsubscribe = collaborationService.subscribeToComments(
      'task',
      taskId,
      (comments) => {
        const count = Array.isArray(comments) ? comments.length : 0;
        setCommentCount(count);
        
        // Simuler la détection de nouveaux commentaires
        if (count > 0) {
          const lastComment = comments[comments.length - 1];
          const isRecent = lastComment && 
            new Date() - (lastComment.createdAt?.toDate ? lastComment.createdAt.toDate() : new Date(lastComment.createdAt)) < 30 * 60 * 1000; // 30 min
          setHasUnread(isRecent);
        }
        
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [taskId]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg">
        <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse" />
        <span className="text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <button
      onClick={onCommentsClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 relative ${
        commentCount > 0
          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600/40'
          : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/70'
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
 * 🎯 MODAL DÉTAILS TÂCHE COMPLET AVEC SYNCHRONISATION TEMPS RÉEL
 */
const TaskDetailsModal = ({ 
  isOpen, 
  task, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit 
}) => {
  const { user: currentUser } = useAuthStore();
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
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700"">
        
        {/* Header avec titre et actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
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
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Détails
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
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
            <div className="p-6 space-y-6 bg-gray-900">
              
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
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Description
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Colonne gauche */}
                <div className="space-y-4">
                  
                  {/* Assignation */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center text-white">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      Assignation
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Créé par:</span>
                        <span className="ml-2 font-medium text-white">{task.creatorName || 'Utilisateur inconnu'}</span>
                      </div>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-400">Assigné à:</span>
                          <span className="ml-2 font-medium text-white">
                            {task.assignedTo.length} personne{task.assignedTo.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {task.openToVolunteers && (
                        <div className="flex items-center text-sm">
                          <Heart className="w-4 h-4 text-red-400 mr-2" />
                          <span className="text-green-400 font-medium">Ouvert aux volontaires</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temporalité */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center text-white">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      Dates
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Créée:</span>
                        <span className="ml-2 text-gray-300">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && (
                        <div>
                          <span className="text-gray-400">Modifiée:</span>
                          <span className="ml-2 text-gray-300">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center">
                          <span className="text-gray-400">Échéance:</span>
                          <span className={`ml-2 font-medium ${
                            new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-blue-400'
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
                      <h4 className="font-semibold mb-2 flex items-center text-white">
                        <Repeat className="w-4 h-4 mr-2 text-blue-400" />
                        Récurrence
                      </h4>
                      <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/50">
                        <p className="text-blue-300 text-sm">
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
                    <h4 className="font-semibold mb-2 flex items-center text-white">
                      <Target className="w-4 h-4 mr-2 text-blue-400" />
                      Caractéristiques
                    </h4>
                    <div className="space-y-3">
                      
                      {/* Difficulté */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Difficulté:</span>
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
                          <span className="text-gray-400">Catégorie:</span>
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs font-medium border border-purple-500/50">
                            {task.category}
                          </span>
                        </div>
                      )}

                      {/* Durée estimée */}
                      {task.estimatedHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Durée estimée:</span>
                          <span className="flex items-center font-medium text-white">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDuration(task.estimatedHours)}
                          </span>
                        </div>
                      )}

                      {/* Récompense XP */}
                      {task.xpReward && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Récompense:</span>
                          <span className="flex items-center font-medium text-yellow-400">
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
                      <h4 className="font-semibold mb-2 flex items-center text-white">
                        <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                        Projet
                      </h4>
                      <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/50">
                        <p className="text-indigo-300 text-sm font-medium">
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
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Hash className="w-5 h-5 mr-2 text-blue-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium border border-gray-600"
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
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Paperclip className="w-5 h-5 mr-2 text-blue-400" />
                    Pièces jointes ({task.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-300">{attachment.name || `Pièce jointe ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Notes
                  </h3>
                  <div className="bg-yellow-900/30 p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-yellow-200 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}

              {/* Métadonnées techniques */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-400">Informations techniques</h4>
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

          {/* 🚨 ONGLET COMMENTAIRES AVEC SYNCHRONISATION TEMPS RÉEL */}
          {activeTab === 'comments' && (
            <div className="p-6 bg-gray-900">
              <TaskCommentsSection 
                taskId={task.id}
                currentUser={currentUser}
              />
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400">
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
              className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;mettre pour validation */}
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
