// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// Section commentaires SIMPLIFIÉE - Compatible sans index
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
  // 🎧 CHARGEMENT INITIAL SIMPLIFIÉ
  // ========================

  useEffect(() => {
    if (!entityType || !entityId) return;

    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Chargement simple sans écoute temps réel pour éviter l'erreur d'index
      const fetchedComments = await collaborationService.getComments(entityType, entityId);
      setComments(fetchedComments);
      
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      setError('Impossible de charger les commentaires');
      setComments([]); // Fallback sur tableau vide
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 💬 GESTION DES COMMENTAIRES
  // ========================

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !user) return;

    try {
      setSubmitting(true);
      setError(null);

      const commentData = {
        entityType,
        entityId,
        userId: user.uid,
        content: newComment.trim(),
        mentions: [], // Simplifié sans mentions pour éviter complexité
        replyTo: replyTo?.id || null
      };

      const addedComment = await collaborationService.addComment(commentData);
      
      // Ajouter le commentaire à la liste locale
      setComments(prev => [...prev, {
        ...addedComment,
        user: {
          name: user.displayName || user.email,
          email: user.email
        }
      }]);
      
      // Reset du formulaire
      setNewComment('');
      setReplyTo(null);
      
      showToast('Commentaire ajouté avec succès', 'success');

    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      setError('Erreur lors de l\'ajout du commentaire');
      showToast('Erreur lors de l\'ajout du commentaire', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await collaborationService.deleteComment(commentId, user.uid);
      
      // Mettre à jour la liste locale
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: '[Commentaire supprimé]', deletedAt: new Date() }
          : comment
      ));
      
      showToast('Commentaire supprimé', 'success');
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      
      if (error.message.includes('Permission refusée')) {
        showToast('Vous ne pouvez supprimer que vos propres commentaires', 'warning');
      } else {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!newContent.trim()) return;

    try {
      await collaborationService.updateComment(
        commentId, 
        { content: newContent.trim() }, 
        user.uid
      );
      
      // Mettre à jour la liste locale
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent.trim(), isEdited: true, updatedAt: new Date() }
          : comment
      ));
      
      setEditingComment(null);
      showToast('Commentaire modifié', 'success');
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
      
      if (error.message.includes('Permission refusée')) {
        showToast('Vous ne pouvez modifier que vos propres commentaires', 'warning');
      } else {
        showToast('Erreur lors de la modification', 'error');
      }
    }
  };

  // ========================
  // 🎨 FONCTIONS UTILITAIRES
  // ========================

  const getUserInitials = (comment) => {
    if (comment.user?.name) return comment.user.name.charAt(0).toUpperCase();
    if (comment.userId === user?.uid) return user.displayName?.charAt(0) || user.email?.charAt(0) || '?';
    return '?';
  };

  const isOwnComment = (comment) => {
    return comment.userId === user?.uid || comment.authorId === user?.uid;
  };

  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    
    try {
      const commentDate = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffMs = now - commentDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      
      return commentDate.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Système de toast simple
  const showToast = (message, type = 'info') => {
    const toastId = 'synergia-toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-gradient-to-r from-[#10b981] to-[#059669]' :
      type === 'error' ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]' :
      type === 'warning' ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]' :
      'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
    }`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    
    // Suppression automatique
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        const existingToast = document.getElementById(toastId);
        if (existingToast) existingToast.remove();
      }, 300);
    }, 3000);
  };

  // ========================
  // 🎨 COMPOSANTS DE RENDU
  // ========================

  const renderComment = (comment) => {
    // Ne pas afficher les commentaires supprimés
    if (comment.content === '[Commentaire supprimé]' || comment.deletedAt) {
      return null;
    }

    return (
      <div
        key={comment.id}
        className={`
          p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-lg
          ${comment.replyTo ? 'ml-8 mt-2' : 'mb-4'}
          hover:bg-white/10 transition-all duration-200
        `}
      >
        {/* En-tête du commentaire */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {getUserInitials(comment)}
            </div>
            
            {/* Infos utilisateur */}
            <div>
              <div className="font-medium text-white">
                {comment.user?.name || (comment.userId === user?.uid ? 'Vous' : 'Utilisateur')}
                {comment.isEdited && (
                  <span className="ml-2 text-xs text-[#a5b4fc] opacity-60">(modifié)</span>
                )}
              </div>
              <div className="text-xs text-[#a5b4fc] opacity-80">
                {formatDate(comment.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Actions (si c'est notre commentaire) */}
          {isOwnComment(comment) && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingComment(comment.id)}
                className="text-xs text-[#a5b4fc] hover:text-white transition-colors px-2 py-1 rounded"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Contenu du commentaire */}
        {editingComment === comment.id ? (
          <EditCommentForm
            comment={comment}
            onSave={(newContent) => handleEditComment(comment.id, newContent)}
            onCancel={() => setEditingComment(null)}
          />
        ) : (
          <div className="text-[#a5b4fc] whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </div>
        )}

        {/* Bouton répondre */}
        <button
          onClick={() => setReplyTo(comment)}
          className="mt-3 text-xs text-[#a5b4fc] hover:text-white transition-colors opacity-75 hover:opacity-100"
        >
          Répondre
        </button>
      </div>
    );
  };

  // Formulaire d'édition
  const EditCommentForm = ({ comment, onSave, onCancel }) => {
    const [editContent, setEditContent] = useState(comment.content);

    return (
      <div className="space-y-3">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#a5b4fc] resize-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
          rows={3}
          placeholder="Modifier votre commentaire..."
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSave(editContent)}
            disabled={!editContent.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm rounded-lg hover:from-[#5856eb] hover:to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Sauvegarder
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6366f1] border-t-transparent"></div>
          <span className="ml-3 text-[#a5b4fc]">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">💬</span>
          Commentaires ({comments.filter(c => c.content !== '[Commentaire supprimé]').length})
        </h3>
        <button
          onClick={loadComments}
          className="text-sm text-[#a5b4fc] hover:text-white transition-colors"
          title="Actualiser les commentaires"
        >
          🔄
        </button>
      </div>

      {/* Gestion des erreurs */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={loadComments}
            className="mt-2 text-xs text-red-200 hover:text-white transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4 mb-6 group">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[#a5b4fc] opacity-75">
            <span className="text-2xl mb-2 block">💭</span>
            Aucun commentaire pour le moment
          </div>
        ) : (
          comments.map(renderComment).filter(Boolean) // Filtrer les null
        )}
      </div>

      {/* Formulaire d'ajout */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          {replyTo && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-[#a5b4fc] flex items-center">
                <span className="mr-2">↳</span>
                Réponse à <strong className="ml-1">{replyTo.user?.name || 'Utilisateur'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrivez un commentaire..."
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-[#a5b4fc] resize-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-200"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[#a5b4fc] opacity-75">
              Vous commentez en tant que <strong>{user.displayName || user.email}</strong>
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium rounded-xl hover:from-[#5856eb] hover:to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Envoi...</span>
                </span>
              ) : (
                'Commenter'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
