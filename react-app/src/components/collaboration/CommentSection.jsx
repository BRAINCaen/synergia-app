// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// SECTION COMMENTAIRES - FIX BUG ENVOI
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Edit, Trash2, Reply, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { collaborationService } from '../../core/services/collaborationService.js';

const CommentSection = ({ entityType, entityId, className = '' }) => {
  // États locaux
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);
  
  const { user } = useAuthStore();
  const textareaRef = useRef(null);

  // ========================
  // 🎧 CHARGEMENT INITIAL
  // ========================

  useEffect(() => {
    if (!entityType || !entityId) {
      console.warn('⚠️ entityType ou entityId manquant pour CommentSection');
      return;
    }

    loadComments();
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
      console.error('❌ Erreur chargement commentaires:', error);
      setError('Impossible de charger les commentaires');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 💬 GESTION DES COMMENTAIRES - CORRIGÉE
  // ========================

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDATIONS STRICTES
    if (!newComment || typeof newComment !== 'string') {
      console.warn('⚠️ Commentaire vide ou invalide');
      return;
    }
    
    const commentText = newComment.trim();
    if (!commentText) {
      console.warn('⚠️ Commentaire vide après trim');
      return;
    }
    
    if (submitting) {
      console.warn('⚠️ Soumission déjà en cours');
      return;
    }
    
    if (!user || !user.uid) {
      console.error('❌ Utilisateur non connecté');
      setError('Vous devez être connecté pour commenter');
      return;
    }

    if (!entityType || !entityId) {
      console.error('❌ entityType ou entityId manquant');
      setError('Erreur: contexte manquant');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      console.log('📤 Envoi commentaire:', {
        entityType,
        entityId,
        userId: user.uid,
        content: commentText,
        length: commentText.length
      });

      // ✅ STRUCTURE CORRIGÉE pour collaborationService
      const commentData = {
        entityType: String(entityType),
        entityId: String(entityId),
        userId: String(user.uid),
        content: commentText,
        replyTo: replyTo?.id || null,
        mentions: [] // Vide pour simplifier
      };

      // Validation finale avant envoi
      if (!commentData.entityType || !commentData.entityId || !commentData.userId || !commentData.content) {
        throw new Error('Données de commentaire incomplètes');
      }

      const addedComment = await collaborationService.addComment(commentData);
      
      if (!addedComment || !addedComment.id) {
        throw new Error('Commentaire non créé correctement');
      }

      console.log('✅ Commentaire ajouté:', addedComment.id);
      
      // ✅ AJOUT OPTIMISTE À LA LISTE
      const optimisticComment = {
        id: addedComment.id,
        ...commentData,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || '',
          uid: user.uid
        }
      };

      setComments(prev => [...prev, optimisticComment]);
      
      // Reset du formulaire
      setNewComment('');
      setReplyTo(null);
      
      // Auto-focus pour continuer la conversation
      if (textareaRef.current) {
        textareaRef.current.focus();
      }

    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
      
      // Messages d'erreur spécifiques
      let errorMessage = 'Erreur lors de l\'ajout du commentaire';
      if (error.message.includes('permission')) {
        errorMessage = 'Permissions insuffisantes';
      } else if (error.message.includes('network')) {
        errorMessage = 'Problème de connexion';
      } else if (error.message.includes('Firebase')) {
        errorMessage = 'Erreur de base de données';
      }
      
      setError(errorMessage);
      
      // Recharger les commentaires en cas d'erreur pour resync
      setTimeout(loadComments, 2000);
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      console.log('🗑️ Suppression commentaire:', commentId);
      
      await collaborationService.deleteComment(commentId, user.uid);
      
      // Mise à jour optimiste
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: '[Commentaire supprimé]', deletedAt: new Date() }
          : comment
      ));
      
      console.log('✅ Commentaire supprimé');
      
    } catch (error) {
      console.error('❌ Erreur suppression commentaire:', error);
      
      if (error.message.includes('Permission refusée')) {
        setError('Vous ne pouvez supprimer que vos propres commentaires');
      } else {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!commentId || !newContent || !newContent.trim()) return;

    try {
      console.log('✏️ Modification commentaire:', commentId);
      
      await collaborationService.updateComment(
        commentId, 
        { content: newContent.trim() }, 
        user.uid
      );
      
      // Mise à jour optimiste
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent.trim(), isEdited: true, updatedAt: new Date() }
          : comment
      ));
      
      setEditingComment(null);
      console.log('✅ Commentaire modifié');
      
    } catch (error) {
      console.error('❌ Erreur modification commentaire:', error);
      
      if (error.message.includes('Permission refusée')) {
        setError('Vous ne pouvez modifier que vos propres commentaires');
      } else {
        setError('Erreur lors de la modification');
      }
    }
  };

  // ========================
  // 🎨 FONCTIONS UTILITAIRES
  // ========================

  const getUserInitials = (comment) => {
    if (comment.user?.name) {
      return comment.user.name.charAt(0).toUpperCase();
    }
    if (comment.userId === user?.uid) {
      return user.displayName?.charAt(0)?.toUpperCase() || 
             user.email?.charAt(0)?.toUpperCase() || 
             '?';
    }
    return '?';
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      
      const now = new Date();
      const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'À l\'instant';
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
      if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('⚠️ Erreur formatage date:', error);
      return '';
    }
  };

  const isOwner = (comment) => {
    return comment.userId === user?.uid || comment.authorId === user?.uid;
  };

  // ========================
  // 🎨 RENDU DES COMMENTAIRES
  // ========================

  const renderComment = (comment) => {
    if (!comment || !comment.id) return null;
    
    const isDeleted = comment.content === '[Commentaire supprimé]' || comment.deletedAt;
    const isEditing = editingComment === comment.id;
    const canModify = isOwner(comment) && !isDeleted;

    return (
      <div key={comment.id} className="flex gap-3 group">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials(comment)}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white">
                {comment.user?.name || 
                 (comment.userId === user?.uid ? (user.displayName || user.email) : 'Utilisateur')}
              </span>
              <span className="text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-500">(modifié)</span>
              )}
            </div>

            {/* Actions */}
            {canModify && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={() => setEditingComment(comment.id)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-300 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Contenu du commentaire */}
          <div className="mt-1">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  defaultValue={comment.content}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEditComment(comment.id, e.target.value);
                    }
                    if (e.key === 'Escape') {
                      setEditingComment(null);
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                      handleEditComment(comment.id, textarea.value);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditingComment(null)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm whitespace-pre-wrap ${isDeleted ? 'text-gray-500 italic' : 'text-gray-200'}`}>
                {comment.content}
              </p>
            )}
          </div>

          {/* Réponse */}
          {!isDeleted && (
            <button
              onClick={() => setReplyTo(comment)}
              className="mt-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Reply className="w-3 h-3" />
              Répondre
            </button>
          )}
        </div>
      </div>
    );
  };

  // ========================
  // 🎨 RENDU PRINCIPAL
  // ========================

  if (loading) {
    return (
      <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Commentaires ({comments.filter(c => c.content !== '[Commentaire supprimé]').length})
        </h3>
        <button
          onClick={loadComments}
          className="text-sm text-blue-400 hover:text-white transition-colors"
          title="Actualiser"
        >
          🔄
        </button>
      </div>

      {/* Gestion des erreurs */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-200 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Réponse à un commentaire */}
      {replyTo && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-blue-300 text-sm">
              <Reply className="w-3 h-3 inline mr-1" />
              Réponse à {replyTo.user?.name || 'un commentaire'}
            </p>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-200 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-blue-200 text-xs mt-1 truncate">
            {replyTo.content}
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun commentaire pour le moment</p>
            <p className="text-gray-500 text-sm">Soyez le premier à commenter !</p>
          </div>
        ) : (
          comments.map(renderComment)
        )}
      </div>

      {/* Formulaire d'ajout - CORRIGÉ */}
      {user ? (
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
                onChange={(e) => {
                  // ✅ VALIDATION EN TEMPS RÉEL
                  const value = e.target.value;
                  if (typeof value === 'string') {
                    setNewComment(value);
                  }
                }}
                placeholder={replyTo ? `Répondre à ${replyTo.user?.name || 'ce commentaire'}...` : "Ajouter un commentaire..."}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment?.trim() || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">Connectez-vous pour commenter</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
