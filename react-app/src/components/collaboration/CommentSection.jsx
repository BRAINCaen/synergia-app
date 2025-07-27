// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// SECTION COMMENTAIRES - TOUS LES BUGS CORRIGÉS
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Edit, Trash2, Reply, MoreVertical, Heart } from 'lucide-react';
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

    } catch (error) {
      console.error('❌ Erreur suppression commentaire:', error);
      setError('Impossible de supprimer le commentaire');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!commentId || !newContent?.trim()) return;

    try {
      await collaborationService.updateComment(commentId, { content: newContent.trim() }, user.uid);
      
      // Mise à jour optimiste
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent.trim(), isEdited: true, updatedAt: new Date() }
          : comment
      ));

      setEditingComment(null);

    } catch (error) {
      console.error('❌ Erreur modification commentaire:', error);
      setError('Impossible de modifier le commentaire');
    }
  };

  // ========================
  // 🎨 FORMATAGE DES DATES
  // ========================

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      
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

  // ========================
  // 🎨 RENDU DES COMMENTAIRES
  // ========================

  const renderComment = (comment) => {
    const isEditing = editingComment === comment.id;
    const isOwnComment = user && comment.userId === user.uid;
    const isDeleted = comment.content === '[Commentaire supprimé]';

    return (
      <div key={comment.id} className="flex gap-3 py-3 border-b border-white/10 last:border-b-0">
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
            <span className="font-medium text-white text-sm truncate">
              {comment.user?.name || comment.userId || 'Utilisateur'}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-500">(modifié)</span>
            )}
          </div>

          {/* Contenu du commentaire */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                defaultValue={comment.content}
                className="w-full p-2 bg-white/5 border border-white/20 rounded text-white text-sm resize-none"
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
              />
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                    handleEditComment(comment.id, textarea.value);
                  }}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm ${isDeleted ? 'text-gray-500 italic' : 'text-gray-200'}`}>
                {comment.content}
              </p>

              {/* Actions */}
              {!isDeleted && (
                <div className="flex items-center gap-3 text-xs">
                  <button 
                    onClick={() => setReplyTo(comment)}
                    className="text-gray-400 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Répondre
                  </button>
                  
                  {isOwnComment && (
                    <>
                      <button 
                        onClick={() => setEditingComment(comment.id)}
                        className="text-gray-400 hover:text-yellow-400 flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
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
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      
      {/* En-tête */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Commentaires ({comments.length})
          </h3>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-300 text-xs underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Réponse à */}
      {replyTo && (
        <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <p className="text-blue-400 text-sm">
              Réponse à <strong>{replyTo.user?.name || replyTo.userId}</strong>
            </p>
            <button 
              onClick={() => setReplyTo(null)}
              className="text-blue-300 hover:text-blue-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="p-4 max-h-96 overflow-y-auto">
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
        <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-700 space-y-3">
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
        <div className="p-4 border-t border-gray-700 text-center">
          <p className="text-gray-400">Connectez-vous pour commenter</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
