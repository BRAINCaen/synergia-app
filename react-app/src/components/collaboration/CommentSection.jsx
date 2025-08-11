// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// SECTION COMMENTAIRES AVEC SYNCHRONISATION TEMPS RÉEL FIREBASE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Edit, 
  Clock, 
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { collaborationService } from '../../core/services/collaborationService.js';

/**
 * 💬 COMPOSANT COMMENTAIRE INDIVIDUEL
 */
const CommentItem = ({ comment, currentUser, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwnComment = currentUser && comment.userId === currentUser.uid;
  const isDeleted = comment.isDeleted;

  // Formatage de la date
  const formatDate = (date) => {
    try {
      const commentDate = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffMs = now - commentDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) return 'À l\'instant';
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      
      return commentDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Sauvegarder l'édition
  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      await onEdit(comment.id, { content: editContent.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur édition:', error);
      alert('Erreur lors de la modification');
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  // Supprimer le commentaire
  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex gap-3 p-3 ${isDeleted ? 'opacity-50' : ''}`}>
      
      {/* Avatar utilisateur */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      
      {/* Contenu commentaire */}
      <div className="flex-1 min-w-0">
        
        {/* En-tête */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white text-sm">
            {comment.userName || 'Utilisateur'}
          </span>
          <span className="text-gray-400 text-xs">
            {formatDate(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-gray-500 text-xs italic">(modifié)</span>
          )}
        </div>
        
        {/* Contenu */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm ${
            isDeleted ? 'text-gray-500 italic' : 'text-gray-200'
          }`}>
            {isDeleted ? 'Ce commentaire a été supprimé' : comment.content}
          </p>
        )}

        {/* Actions */}
        {!isDeleted && isOwnComment && !isEditing && (
          <div className="flex items-center gap-3 text-xs mt-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <Edit className="w-3 h-3" />
              Modifier
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 💬 COMPOSANT PRINCIPAL - SECTION COMMENTAIRES TEMPS RÉEL
 */
const CommentSection = ({ 
  entityType, 
  entityId, 
  className = '', 
  showNotificationBadge = false,
  maxHeight = '400px'
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuthStore();
  const textareaRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // 🔄 CONFIGURATION TEMPS RÉEL
  useEffect(() => {
    if (!entityType || !entityId) {
      setLoading(false);
      return;
    }

    console.log('🔄 [COMMENT_SECTION] Configuration temps réel:', { entityType, entityId });
    
    // Nettoyer l'ancien listener s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setLoading(true);
    setError(null);

    // 📡 ABONNEMENT TEMPS RÉEL
    const unsubscribe = collaborationService.subscribeToComments(
      entityType,
      entityId,
      (updatedComments) => {
        console.log('📡 [COMMENT_SECTION] Mise à jour reçue:', updatedComments.length, 'commentaires');
        setComments(updatedComments);
        setIsConnected(true);
        setLoading(false);
        setError(null);
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⏰ [COMMENT_SECTION] Timeout chargement, fallback vers méthode statique');
        loadCommentsStatic();
      }
    }, 5000);

    // Nettoyage
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      clearTimeout(timeoutId);
    };
  }, [entityType, entityId]);

  // 📚 CHARGEMENT STATIQUE DE FALLBACK
  const loadCommentsStatic = async () => {
    try {
      console.log('📚 [COMMENT_SECTION] Chargement statique fallback');
      const fetchedComments = await collaborationService.getComments(entityType, entityId);
      setComments(fetchedComments || []);
      setIsConnected(false);
    } catch (error) {
      console.error('❌ [COMMENT_SECTION] Erreur fallback:', error);
      setError('Impossible de charger les commentaires');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // 📤 ENVOI DE COMMENTAIRE AVEC PERSISTENCE GARANTIE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment?.trim() || submitting || !user?.uid) {
      return;
    }

    console.log('📤 [COMMENT_SECTION] Envoi commentaire:', newComment.trim());
    
    setSubmitting(true);
    setError(null);
    
    try {
      // 📝 DONNÉES COMPLÈTES POUR FIREBASE
      const commentData = {
        entityType: entityType,
        entityId: entityId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Utilisateur',
        userEmail: user.email || '',
        content: newComment.trim()
      };
      
      console.log('📝 [COMMENT_SECTION] Données commentaire:', commentData);
      
      // 🚀 AJOUT AVEC SERVICE TEMPS RÉEL
      const savedComment = await collaborationService.addComment(commentData);
      
      if (savedComment) {
        console.log('✅ [COMMENT_SECTION] Commentaire sauvegardé:', savedComment.id);
        
        // Réinitialiser le champ
        setNewComment('');
        
        // 📡 PAS BESOIN DE METTRE À JOUR MANUELLEMENT
        // Le listener temps réel va automatiquement mettre à jour la liste
        
        // Focus pour faciliter l'ajout de commentaires suivants
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
        
        // Notification de succès
        if (window.showNotification) {
          window.showNotification('Commentaire ajouté !', 'success');
        }
      }
      
    } catch (error) {
      console.error('❌ [COMMENT_SECTION] Erreur envoi commentaire:', error);
      setError(`Impossible d'envoyer le commentaire: ${error.message}`);
      
      // Notification d'erreur
      if (window.showNotification) {
        window.showNotification('Erreur lors de l\'envoi', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ MODIFICATION DE COMMENTAIRE
  const handleEditComment = async (commentId, updateData) => {
    try {
      console.log('✏️ [COMMENT_SECTION] Modification commentaire:', commentId);
      await collaborationService.updateComment(commentId, updateData, user.uid);
      console.log('✅ [COMMENT_SECTION] Commentaire modifié');
      
      // Le listener temps réel va automatiquement mettre à jour
    } catch (error) {
      console.error('❌ [COMMENT_SECTION] Erreur modification:', error);
      throw error;
    }
  };

  // 🗑️ SUPPRESSION DE COMMENTAIRE
  const handleDeleteComment = async (commentId) => {
    try {
      console.log('🗑️ [COMMENT_SECTION] Suppression commentaire:', commentId);
      await collaborationService.deleteComment(commentId, user.uid);
      console.log('✅ [COMMENT_SECTION] Commentaire supprimé');
      
      // Le listener temps réel va automatiquement mettre à jour
    } catch (error) {
      console.error('❌ [COMMENT_SECTION] Erreur suppression:', error);
      throw error;
    }
  };

  // 🔄 FORCER RECHARGEMENT
  const handleRefresh = () => {
    setLoading(true);
    loadCommentsStatic();
  };

  // État de chargement
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400 text-sm">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-600 ${className}`}>
      
      {/* En-tête avec statut de connexion */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Commentaires 
            {comments.length > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                showNotificationBadge && comments.length > 0 
                  ? 'bg-blue-500 text-white animate-pulse'
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {comments.length}
              </span>
            )}
          </h3>
          
          {/* Indicateur de statut */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                Temps réel
              </div>
            ) : (
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-xs"
                title="Actualiser"
              >
                <AlertCircle className="w-3 h-3" />
                Actualiser
              </button>
            )}
          </div>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {comments.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Aucun commentaire pour le moment</p>
            <p className="text-gray-500 text-xs mt-1">Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {user && (
        <div className="p-4 border-t border-gray-600">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">
                {isConnected ? '🟢 Synchronisé en temps réel' : '🔄 Mode statique'}
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
      )}

      {/* Message si non connecté */}
      {!user && (
        <div className="p-4 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">
            Connectez-vous pour ajouter un commentaire
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
