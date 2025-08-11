// ==========================================
// 📁 react-app/src/shared/components/ui/ModalWrapper.jsx
// WRAPPER MODAL + TaskDetailModal CORRIGÉE AVEC COMMENTAIRES FONCTIONNELS
// ==========================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Calendar, Target, Trophy, Clock, Tag, Send, MessageCircle, User, AlertCircle } from 'lucide-react';

// 🚨 IMPORT COLLABORATION SERVICE POUR COMMENTAIRES
import { collaborationService } from '../../../core/services/collaborationService.js';
import { useAuthStore } from '../../stores/authStore.js';

/**
 * 🎯 WRAPPER MODAL RÉUTILISABLE
 */
const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className={`relative w-full ${sizeClasses[size]} bg-gray-900 rounded-lg shadow-xl border border-gray-700`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className="flex items-center justify-between px-6 py-4 border-b border-gray-700"
            >
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="modal-content-wrapper text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * 🎯 FORMATAGE DATE FRANÇAIS
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Date inconnue';
    
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
 * 💬 SECTION COMMENTAIRES AVEC SAUVEGARDE FIREBASE
 */
const TaskCommentsSection = ({ task }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 CHARGER LES COMMENTAIRES EXISTANTS
  useEffect(() => {
    if (!task?.id) {
      setLoading(false);
      return;
    }

    loadComments();
    
    // 📡 LISTENER TEMPS RÉEL
    const unsubscribe = collaborationService.subscribeToComments(
      'task',
      task.id,
      (updatedComments) => {
        console.log('📡 [TASK_COMMENTS] Mise à jour temps réel:', updatedComments.length);
        setComments(updatedComments);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [task?.id]);

  const loadComments = async () => {
    try {
      console.log('📖 [TASK_COMMENTS] Chargement pour tâche:', task.id);
      const existingComments = await collaborationService.getComments('task', task.id);
      setComments(existingComments);
      console.log('📖 [TASK_COMMENTS] Chargés:', existingComments.length);
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur chargement:', error);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  // 📤 ENVOYER UN COMMENTAIRE AVEC SAUVEGARDE FIREBASE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || submitting || !user?.uid) {
      return;
    }

    console.log('📤 [TASK_COMMENTS] Envoi commentaire pour tâche:', task.id);
    
    setSubmitting(true);
    setError(null);
    
    try {
      // 📝 UTILISER LE SERVICE COLLABORATION EXISTANT
      const commentData = {
        entityType: 'task',
        entityId: task.id,
        userId: user.uid,
        userName: user.displayName || user.email || 'Utilisateur',
        userEmail: user.email || '',
        content: newComment.trim()
      };
      
      console.log('📝 [TASK_COMMENTS] Données commentaire:', commentData);
      
      // 🚀 SAUVEGARDE AVEC COLLABORATION SERVICE
      const savedComment = await collaborationService.addComment(commentData);
      
      if (savedComment) {
        console.log('✅ [TASK_COMMENTS] Commentaire sauvegardé:', savedComment.id);
        
        // Réinitialiser le champ
        setNewComment('');
        
        // ✅ RÉCHARGER LES COMMENTAIRES POUR VOIR LE NOUVEAU
        await loadComments();
        
        console.log('✅ [TASK_COMMENTS] Liste rechargée');
      }
      
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur envoi commentaire:', error);
      setError(`Impossible d'envoyer le commentaire: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {comment.userName || 'Utilisateur'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Contenu du commentaire */}
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {user && (
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
      {!user && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
    </div>
  );
};

/**
 * Modal pour les détails de tâche - ✅ COULEURS SOMBRES + COMMENTAIRES FONCTIONNELS
 */
export const TaskDetailModal = ({ task, isOpen, onClose, onEdit, onDelete, onSubmit }) => {
  if (!task) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="font-medium mb-2 text-white">
              Description
            </h4>
            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-300">{task.description}</p>
            </div>
          </div>
        )}

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Assignation */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-white">Assignation</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Créé par :</span>
                <span className="ml-2 text-gray-200">{task.creatorName || 'Utilisateur'}</span>
              </div>
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div>
                  <span className="text-gray-400">Assigné à :</span>
                  <span className="ml-2 text-gray-200">{task.assignedTo.length} personne(s)</span>
                </div>
              )}
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-white">Caractéristiques</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Difficulté :</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                  task.difficulty === 'easy' ? 'bg-green-800/50 text-green-300 border-green-600' :
                  task.difficulty === 'normal' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
                  task.difficulty === 'hard' ? 'bg-orange-800/50 text-orange-300 border-orange-600' :
                  'bg-gray-800/50 text-gray-300 border-gray-600'
                }`}>
                  {task.difficulty === 'easy' ? 'Facile' :
                   task.difficulty === 'normal' ? 'Normal' :
                   task.difficulty === 'hard' ? 'Difficile' :
                   task.difficulty || 'Non définie'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Récompense :</span>
                <span className="flex items-center text-yellow-400 font-medium">
                  <Trophy className="w-4 h-4 mr-1" />
                  +{task.xpReward || 0} XP
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Priorité :</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                  task.priority === 'haute' ? 'bg-red-800/50 text-red-300 border-red-600' :
                  task.priority === 'moyenne' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
                  'bg-green-800/50 text-green-300 border-green-600'
                }`}>
                  {task.priority || 'Moyenne'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Catégorie :</span>
                <span className="text-purple-300">{task.category || 'Général'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Durée estimée :</span>
                <span className="flex items-center text-gray-200">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {task.estimatedHours ? `${task.estimatedHours}h` : '1h'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h4 className="font-medium text-white">Dates</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Créée :</span>
              <div className="text-gray-200">{formatDate(task.createdAt)}</div>
            </div>
            {task.updatedAt && (
              <div>
                <span className="text-gray-400">Modifiée :</span>
                <div className="text-gray-200">{formatDate(task.updatedAt)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center text-white">
              <Tag className="w-4 h-4 mr-2 text-blue-400" />
              Tags
            </h4>
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

        {/* 🚨 SECTION COMMENTAIRES AVEC FIREBASE */}
        <div>
          <h4 className="font-medium mb-3 text-white">
            Commentaires
          </h4>
          <TaskCommentsSection task={task} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          {/* Soumettre pour validation */}
          {onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
            <button
              onClick={() => onSubmit(task)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Soumettre pour validation
            </button>
          )}
          
          <button
            onClick={() => onEdit(task)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

/**
 * Modal pour les détails de projet
 */
export const ProjectDetailModal = ({ project, isOpen, onClose, onEdit, onDelete }) => {
  if (!project) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Description */}
        {project.description && (
          <div>
            <h4 className="font-medium mb-2 text-white">
              Description
            </h4>
            <p className="text-gray-300">{project.description}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-400">Priorité :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded border ${
                project.priority === 'high' ? 'bg-red-800/50 text-red-300 border-red-600' :
                project.priority === 'medium' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
                'bg-green-800/50 text-green-300 border-green-600'
              }`}
            >
              {project.priority}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={() => onEdit(project)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

/**
 * Modal pour l'édition de profil utilisateur
 */
export const UserProfileModal = ({ user, isOpen, onClose, onSave }) => {
  if (!user) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le profil"
      size="md"
    >
      <div className="p-6 space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Nom complet
          </label>
          <input
            type="text"
            defaultValue={user.displayName || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="Votre nom complet"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Email
          </label>
          <input
            type="email"
            defaultValue={user.email || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="votre@email.com"
          />
        </div>

        {/* Département */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Département
          </label>
          <input
            type="text"
            defaultValue={user.department || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="Votre département"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ModalWrapper;
