// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// Interface de commentaires temps réel avec mentions et réactions - VERSION COMPLÈTE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import collaborationService from '../../core/services/collaborationService.js';
import { toast } from 'react-hot-toast';

/**
 * 💬 COMPOSANT SECTION COMMENTAIRES
 * 
 * Interface complète de collaboration :
 * - Commentaires temps réel
 * - Système de mentions @utilisateur
 * - Réactions et réponses
 * - Historique d'activité
 * - Notifications intelligentes
 */
const CommentSection = ({ entityType, entityId, className = '' }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  const textareaRef = useRef(null);
  const mentionListRef = useRef(null);

  // ========================
  // 🔄 GESTION DES DONNÉES
  // ========================

  useEffect(() => {
    if (!entityType || !entityId) return;

    loadComments();
    
    // Abonnement temps réel
    const unsubscribe = collaborationService.subscribeToComments(
      entityType, 
      entityId, 
      handleCommentsUpdate
    );

    return unsubscribe;
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await collaborationService.getComments(entityType, entityId);
      setComments(commentsData);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentsUpdate = (newComments) => {
    setComments(prev => {
      const updated = [...prev];
      
      newComments.forEach(newComment => {
        const existingIndex = updated.findIndex(c => c.id === newComment.id);
        
        if (existingIndex >= 0) {
          // Mise à jour
          updated[existingIndex] = newComment;
        } else {
          // Nouveau commentaire
          updated.push(newComment);
          
          // Notification si ce n'est pas notre commentaire
          if (newComment.userId !== user?.uid && newComment.changeType === 'added') {
            toast.success(`Nouveau commentaire de ${newComment.user?.name}`);
          }
        }
      });
      
      // Trier par date de création
      return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
  };

  // ========================
  // 💬 GESTION DES COMMENTAIRES
  // ========================

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !user) return;

    try {
      setSubmitting(true);

      const commentData = {
        entityType,
        entityId,
        userId: user.uid,
        content: newComment.trim(),
        mentions: selectedMentions,
        replyTo: replyTo?.id || null
      };

      await collaborationService.addComment(commentData);
      
      // Reset du formulaire
      setNewComment('');
      setSelectedMentions([]);
      setReplyTo(null);
      
      toast.success('Commentaire ajouté');

    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await collaborationService.deleteComment(commentId);
      toast.success('Commentaire supprimé');
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await collaborationService.updateComment(commentId, { content: newContent });
      toast.success('Commentaire modifié');
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  // ========================
  // 🏷️ GESTION DES MENTIONS
  // ========================

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Détecter les mentions (@utilisateur)
    const mentionPattern = /@(\w+)$/;
    const match = value.match(mentionPattern);

    if (match) {
      const searchTerm = match[1];
      setMentionSearch(searchTerm);
      setShowMentions(true);

      // Rechercher les utilisateurs
      try {
        const users = await collaborationService.searchUsersForMention(searchTerm);
        setAvailableUsers(users);
      } catch (error) {
        console.error('Erreur recherche utilisateurs:', error);
      }
    } else {
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  const handleSelectMention = (user) => {
    // Remplacer la mention en cours par le nom d'utilisateur
    const updatedComment = newComment.replace(/@\w+$/, `@${user.name} `);
    setNewComment(updatedComment);
    
    // Ajouter à la liste des mentions
    if (!selectedMentions.includes(user.id)) {
      setSelectedMentions(prev => [...prev, user.id]);
    }
    
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // ========================
  // 🎨 COMPOSANTS DE RENDU
  // ========================

  const renderComment = (comment) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-lg border border-gray-200 bg-white
        ${comment.replyTo ? 'ml-8 mt-2' : 'mb-4'}
      `}
    >
      {/* En-tête du commentaire */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          
          {/* Infos utilisateur */}
          <div>
            <div className="font-medium text-gray-900">
              {comment.user?.name || 'Utilisateur inconnu'}
              {comment.user?.level && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  Niv. {comment.user.level}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Maintenant'}
              {comment.isEdited && <span className="ml-2">(modifié)</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        {comment.userId === user?.uid && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditComment(comment.id, prompt('Nouveau contenu:', comment.content))}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              🗑️ Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Répondre à */}
      {comment.replyTo && (
        <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💬 En réponse à un commentaire
        </div>
      )}

      {/* Contenu */}
      <div className="text-gray-800 mb-3">
        {renderCommentContent(comment.content)}
      </div>

      {/* Mentions */}
      {comment.mentions && comment.mentions.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Mentions :</div>
          <div className="flex flex-wrap gap-1">
            {comment.mentions.map(userId => (
              <span key={userId} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                @utilisateur
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions du commentaire */}
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={() => setReplyTo(comment)}
          className="text-gray-500 hover:text-blue-600 flex items-center space-x-1"
        >
          <span>💬</span>
          <span>Répondre</span>
        </button>
        
        <button className="text-gray-500 hover:text-red-600 flex items-center space-x-1">
          <span>❤️</span>
          <span>Réagir</span>
        </button>
      </div>

      {/* Réponses */}
      {comments
        .filter(reply => reply.replyTo === comment.id)
        .map(reply => renderComment(reply))
      }
    </motion.div>
  );

  const renderCommentContent = (content) => {
    // Traiter les mentions dans le contenu
    const mentionPattern = /@(\w+)/g;
    const parts = content.split(mentionPattern);
    
    return (
      <span>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            // C'est une mention
            return (
              <span key={index} className="bg-blue-100 text-blue-600 px-1 rounded font-medium">
                @{part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const renderMentionDropdown = () => (
    <AnimatePresence>
      {showMentions && availableUsers.length > 0 && (
        <motion.div
          ref={mentionListRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto"
        >
          {availableUsers.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelectMention(user)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ========================
  // 🎨 INTERFACE PRINCIPALE
  // ========================

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  const topLevelComments = comments.filter(comment => !comment.replyTo);

  return (
    <div className={`${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          💬 Commentaires ({comments.length})
        </h3>
        <button
          onClick={loadComments}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Répondre à */}
      {replyTo && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              💬 Répondre à {replyTo.user?.name}
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-blue-600 mt-1 italic">
            "{replyTo.content.substring(0, 100)}..."
          </div>
        </div>
      )}

      {/* Formulaire de nouveau commentaire */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleInputChange}
            placeholder="Ajouter un commentaire... Utilisez @ pour mentionner quelqu'un"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={submitting}
          />
          
          {renderMentionDropdown()}
        </div>

        {/* Mentions sélectionnées */}
        {selectedMentions.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Mentions :</div>
            <div className="flex flex-wrap gap-1">
              {selectedMentions.map(userId => (
                <span key={userId} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  @utilisateur
                  <button
                    onClick={() => setSelectedMentions(prev => prev.filter(id => id !== userId))}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            💡 Utilisez @ pour mentionner un utilisateur
          </div>
          
          <div className="flex space-x-2">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
            )}
            
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Envoi...' : replyTo ? '↩️ Répondre' : '💬 Commenter'}
            </button>
          </div>
        </div>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        <AnimatePresence>
          {topLevelComments.map(comment => renderComment(comment))}
        </AnimatePresence>
        
        {topLevelComments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <p className="text-gray-500">
              Aucun commentaire pour le moment
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Soyez le premier à commenter !
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {comments.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Statistiques des commentaires</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{comments.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {new Set(comments.map(c => c.userId)).size}
              </div>
              <div className="text-xs text-gray-500">Participants</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {comments.filter(c => c.mentions?.length > 0).length}
              </div>
              <div className="text-xs text-gray-500">Avec mentions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
