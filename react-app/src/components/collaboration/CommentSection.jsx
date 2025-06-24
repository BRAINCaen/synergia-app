// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// Interface de commentaires temps réel avec mentions et réactions
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
      await collaborationService.deleteComment(commentId, user.uid);
      toast.success('Commentaire supprimé');
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ========================
  // 🏷️ GESTION DES MENTIONS
  // ========================

  const handleTextareaChange = async (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Détecter les mentions (@)
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const searchTerm = mentionMatch[1];
      setMentionSearch(searchTerm);
      setShowMentions(true);

      if (searchTerm.length >= 1) {
        try {
          const users = await collaborationService.searchUsersForMention(searchTerm, entityId);
          setAvailableUsers(users);
        } catch (error) {
          console.error('Erreur recherche utilisateurs:', error);
        }
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (selectedUser) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    
    // Remplacer @search par @username
    const updatedText = textBeforeCursor.replace(/@\w*$/, `@${selectedUser.name} `) + textAfterCursor;
    
    setNewComment(updatedText);
    setSelectedMentions(prev => [...prev, selectedUser.id]);
    setShowMentions(false);
    
    // Focus retour sur textarea
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // ========================
  // 🎨 RENDU DES COMMENTAIRES
  // ========================

  const renderComment = (comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex space-x-3 ${isReply ? 'ml-12 mt-2' : 'mt-4'}
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg p-3">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 text-sm">
                {comment.user?.name || 'Utilisateur'}
              </span>
              {comment.user?.level && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                  Niv. {comment.user.level}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Maintenant'}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(modifié)</span>
              )}
            </div>

            {/* Actions */}
            {comment.userId === user?.uid && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Contenu du commentaire */}
          <div className="text-gray-800 text-sm">
            {renderCommentContent(comment.content)}
          </div>

          {/* Actions du commentaire */}
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => setReplyTo(comment)}
              className="text-xs text-gray-500 hover:text-blue-600"
            >
              💬 Répondre
            </button>
            <button className="text-xs text-gray-500 hover:text-red-600">
              ❤️ Réagir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCommentContent = (content) => {
    // Traiter les mentions dans le contenu
    return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
  };

  // ========================
  // 🎨 INTERFACE UTILISATEUR
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

  return (
    <div className={`${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          💬 Commentaires ({comments.length})
        </h3>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💭</div>
              <p>Aucun commentaire pour le moment</p>
              <p className="text-sm">Soyez le premier à commenter !</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Indication de réponse */}
      {replyTo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              💬 Réponse à <strong>{replyTo.user?.name}</strong>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de nouveau commentaire */}
      {user && (
        <form onSubmit={handleSubmitComment} className="relative">
          <div className="flex space-x-3">
            {/* Avatar utilisateur */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={handleTextareaChange}
                placeholder="Ajouter un commentaire... (utilisez @ pour mentionner quelqu'un)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={submitting}
              />

              {/* Liste des mentions */}
              {showMentions && availableUsers.length > 0 && (
                <div
                  ref={mentionListRef}
                  className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto w-full"
                >
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleMentionSelect(user)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Bouton d'envoi */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2 text-xs text-gray-500">
                  <span>💡 Astuce : Utilisez @ pour mentionner</span>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${newComment.trim() && !submitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi...
                    </span>
                  ) : (
                    '📤 Envoyer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Message pour utilisateurs non connectés */}
      {!user && (
        <div className="text-center py-4 text-gray-500">
          <p>Connectez-vous pour participer à la discussion</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
