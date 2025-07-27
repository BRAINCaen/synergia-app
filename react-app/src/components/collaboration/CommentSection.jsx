// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// SECTION COMMENTAIRES - VERSION FINALE ULTRA-SIMPLE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Edit, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { collaborationService } from '../../core/services/collaborationService.js';

const CommentSection = ({ entityType, entityId, className = '' }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuthStore();
  const textareaRef = useRef(null);

  // Chargement initial
  useEffect(() => {
    if (entityType && entityId) {
      loadComments();
    }
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement commentaires:', { entityType, entityId });
      const fetchedComments = await collaborationService.getComments(entityType, entityId);
      
      console.log('✅ Commentaires chargés:', fetchedComments.length);
      setComments(fetchedComments || []);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setError('Impossible de charger les commentaires');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Envoi de commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment?.trim() || submitting || !user?.uid) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      console.log('📤 Envoi commentaire...');
      
      const commentData = {
        entityType: entityType,
        entityId: entityId,
        userId: user.uid,
        content: newComment.trim()
      };

      const addedComment = await collaborationService.addComment(commentData);
      
      console.log('✅ Commentaire ajouté:', addedComment.id);
      
      // Ajout optimiste
      const optimisticComment = {
        id: addedComment.id,
        entityType: entityType,
        entityId: entityId,
        userId: user.uid,
        content: newComment.trim(),
        createdAt: new Date(),
        user: {
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur'
        }
      };

      setComments(prev => [...prev, optimisticComment]);
      setNewComment('');
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }

    } catch (error) {
      console.error('❌ Erreur envoi commentaire:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Suppression de commentaire
  const handleDeleteComment = async (commentId) => {
    if (!commentId || !confirm('Supprimer ce commentaire ?')) return;

    try {
      await collaborationService.deleteComment(commentId, user.uid);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: '[Commentaire supprimé]' }
          : comment
      ));

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setError('Impossible de supprimer');
    }
  };

  // Formatage des dates
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      const now = new Date();
      const diffMs = now - dateObj;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'À l\'instant';
      if (diffMinutes < 60) return `${diffMinutes}min`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}j`;
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      return '';
    }
  };

  // Rendu d'un commentaire
  const renderComment = (comment) => {
    const isOwnComment = user && comment.userId === user.uid;
    const isDeleted = comment.content === '[Commentaire supprimé]';

    return (
      <div key={comment.id} className="flex gap-3 py-3 border-b border-gray-600 last:border-b-0">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {comment.user?.name?.charAt(0)?.toUpperCase() || 
             comment.userId?.charAt(0)?.toUpperCase() || 
             'U'}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm">
              {comment.user?.name || comment.userId || 'Utilisateur'}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Contenu */}
          <p className={`text-sm ${isDeleted ? 'text-gray-500 italic' : 'text-gray-200'}`}>
            {comment.content}
          </p>

          {/* Actions */}
          {!isDeleted && isOwnComment && (
            <div className="flex items-center gap-3 text-xs mt-2">
              <button 
                onClick={() => handleDeleteComment(comment.id)}
                className="text-gray-400 hover:text-red-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu principal
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-600 ${className}`}>
      
      {/* En-tête */}
      <div className="p-4 border-b border-gray-600">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Erreurs */}
      {error && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-300 hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Aucun commentaire</p>
          </div>
        ) : (
          comments.map(renderComment)
        )}
      </div>

      {/* Formulaire */}
      {user ? (
        <div className="p-4 border-t border-gray-600">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName?.charAt(0)?.toUpperCase() || 
                   user.email?.charAt(0)?.toUpperCase() || 
                   'U'}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  disabled={submitting}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment?.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">Connectez-vous pour commenter</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
