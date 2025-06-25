// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// Section commentaires CORRIGÉE - Gestion d'erreurs améliorée
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
  
  // Mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMentions, setSelectedMentions] = useState([]);
  
  const { user } = useAuthStore();
  const textareaRef = useRef(null);

  // ========================
  // 🎧 CHARGEMENT INITIAL ET TEMPS RÉEL
  // ========================

  useEffect(() => {
    if (!entityType || !entityId) return;

    setLoading(true);

    // Écouter les commentaires en temps réel
    const unsubscribe = collaborationService.subscribeToComments(
      entityType, 
      entityId, 
      (updatedComments) => {
        setComments(updatedComments);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [entityType, entityId]);

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
      
      // Success feedback
      showToast('Commentaire ajouté avec succès', 'success');

    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      showToast('Erreur lors de l\'ajout du commentaire', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      // ✅ CORRECTION: Passer l'userId pour vérification de permission
      await collaborationService.deleteComment(commentId, user.uid);
      showToast('Commentaire supprimé', 'success');
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      
      // ✅ Gestion d'erreur spécifique pour permissions
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
      // ✅ CORRECTION: Passer l'userId pour vérification de permission
      await collaborationService.updateComment(
        commentId, 
        { content: newContent.trim() }, 
        user.uid
      );
      
      setEditingComment(null);
      showToast('Commentaire modifié', 'success');
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
      
      // ✅ Gestion d'erreur spécifique pour permissions
      if (error.message.includes('Permission refusée')) {
        showToast('Vous ne pouvez modifier que vos propres commentaires', 'warning');
      } else {
        showToast('Erreur lors de la modification', 'error');
      }
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

  // ✅ Système de toast simple
  const showToast = (message, type = 'info') => {
    // Création d'un toast simple
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    
    // Suppression automatique
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // ========================
  // 🎨 COMPOSANTS DE RENDU
  // ========================

  const renderComment = (comment) => (
    <div
      key={comment.id}
      className={`
        p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-lg
        ${comment.replyTo ? 'ml-8 mt-2' : 'mb-4'}
        ${comment.isDeleted ? 'opacity-50' : ''}
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
        {isOwnComment(comment) && !comment.isDeleted && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingComment(comment.id)}
              className="text-xs text-[#a5b4fc] hover:text-white transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
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
        <div className="text-[#a5b4fc] whitespace-pre-wrap">
          {comment.content}
        </div>
      )}

      {/* Bouton répondre */}
      {!comment.isDeleted && (
        <button
          onClick={() => setReplyTo(comment)}
          className="mt-2 text-xs text-[#a5b4fc] hover:text-white transition-colors"
        >
          Répondre
        </button>
      )}
    </div>
  );

  // Formulaire d'édition
  const EditCommentForm = ({ comment, onSave, onCancel }) => {
    const [editContent, setEditContent] = useState(comment.content);

    return (
      <div className="space-y-2">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#a5b4fc] resize-none"
          rows={3}
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSave(editContent)}
            className="px-3 py-1 bg-[#6366f1] text-white text-sm rounded-lg hover:bg-[#5856eb] transition-colors"
          >
            Sauvegarder
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
          <span className="ml-3 text-[#a5b4fc]">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[#a5b4fc]">
            Aucun commentaire pour le moment
          </div>
        ) : (
          comments.map(renderComment)
        )}
      </div>

      {/* Formulaire d'ajout */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          {replyTo && (
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-[#a5b4fc]">
                Réponse à {replyTo.user?.name || 'Utilisateur'}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Annuler
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleInputChange}
              placeholder="Écrivez un commentaire... (utilisez @ pour mentionner)"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#a5b4fc] resize-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
              rows={3}
            />
            
            {/* Liste des mentions */}
            {showMentions && availableUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg">
                {availableUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectMention(user)}
                    className="w-full px-3 py-2 text-left hover:bg-white/20 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-[#a5b4fc]">
              Vous commentez en tant que {user.displayName || user.email}
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium rounded-lg hover:from-[#5856eb] hover:to-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? 'Envoi...' : 'Commenter'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
