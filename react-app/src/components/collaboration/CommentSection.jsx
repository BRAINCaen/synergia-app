// ==========================================
// 📁 react-app/src/components/collaboration/CommentSection.jsx
// SECTION COMMENTAIRES AVEC NOMS COMPLETS ET NOTIFICATIONS
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Edit, Trash2, X, Bell } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { collaborationService } from '../../core/services/collaborationService.js';

/**
 * 👤 HOOK POUR RÉSOUDRE LES NOMS COMPLETS UTILISATEURS
 */
const useUserResolver = () => {
  const [usersCache, setUsersCache] = useState(new Map());
  
  const resolveUser = async (userId) => {
    if (!userId) {
      return {
        uid: 'unknown',
        displayName: 'Utilisateur inconnu',
        fullName: 'Utilisateur inconnu',
        email: 'Non défini',
        initials: '??',
        photoURL: null
      };
    }
    
    // Vérifier le cache d'abord
    if (usersCache.has(userId)) {
      return usersCache.get(userId);
    }
    
    try {
      // Récupérer depuis Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 🎯 CONSTRUIRE LE NOM COMPLET DEPUIS LE PROFIL
        let fullName = '';
        let displayName = '';
        
        // Priorité 1: firstName + lastName du profil
        if (userData.profile?.firstName && userData.profile?.lastName) {
          fullName = `${userData.profile.firstName} ${userData.profile.lastName}`;
          displayName = fullName;
        }
        // Priorité 2: displayName personnalisé
        else if (userData.displayName && userData.displayName !== 'Allan le BOSS') {
          displayName = userData.displayName;
          fullName = displayName;
        }
        // Priorité 3: firstName seul
        else if (userData.profile?.firstName) {
          fullName = userData.profile.firstName;
          displayName = fullName;
        }
        // Priorité 4: email sans domaine
        else if (userData.email) {
          const emailName = userData.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          fullName = displayName;
        }
        // Fallback
        else {
          displayName = 'Utilisateur';
          fullName = 'Utilisateur';
        }
        
        // Nettoyer les URLs Google si présentes
        if (displayName.includes('googleusercontent.com')) {
          const emailName = userData.email?.split('@')[0] || 'Utilisateur';
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          fullName = displayName;
        }
        
        const user = {
          uid: userId,
          displayName: displayName,
          fullName: fullName,
          email: userData.email || 'Non défini',
          photoURL: userData.photoURL || null,
          department: userData.profile?.department || userData.department || null,
          role: userData.role || userData.profile?.role || 'Membre',
          initials: fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        };
        
        // Mettre en cache
        setUsersCache(prev => new Map(prev).set(userId, user));
        return user;
        
      } else {
        // Utilisateur non trouvé - créer un fallback
        const fallbackUser = {
          uid: userId,
          displayName: `Utilisateur ${userId.substring(0, 8)}`,
          fullName: `Utilisateur ${userId.substring(0, 8)}`,
          email: 'Utilisateur supprimé',
          photoURL: null,
          initials: userId.substring(0, 2).toUpperCase(),
          isDeleted: true
        };
        
        setUsersCache(prev => new Map(prev).set(userId, fallbackUser));
        return fallbackUser;
      }
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', userId, error);
      
      // Fallback d'erreur
      const errorUser = {
        uid: userId,
        displayName: `Erreur ${userId.substring(0, 6)}`,
        fullName: `Erreur ${userId.substring(0, 6)}`,
        email: 'Erreur de chargement',
        photoURL: null,
        initials: 'ER',
        hasError: true
      };
      
      setUsersCache(prev => new Map(prev).set(userId, errorUser));
      return errorUser;
    }
  };
  
  return { resolveUser, usersCache };
};

/**
 * 🎨 AVATAR UTILISATEUR AMÉLIORÉ
 */
const UserAvatar = ({ user, size = 'md', showTooltip = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500'
    ];
    
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold`}>
        ??
      </div>
    );
  }

  const avatarElement = (
    <div className={`${sizeClasses[size]} ${getAvatarColor(user.fullName)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 relative`}>
      {user.photoURL ? (
        <img 
          src={user.photoURL} 
          alt={user.fullName}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        user.initials
      )}
      
      {/* Indicateurs de statut */}
      {user.isDeleted && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
      )}
      {user.hasError && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        {avatarElement}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {user.fullName}
          {user.department && (
            <div className="text-gray-300">
              {user.department}
            </div>
          )}
        </div>
      </div>
    );
  }

  return avatarElement;
};

/**
 * 💬 COMPOSANT COMMENTAIRE INDIVIDUEL AMÉLIORÉ
 */
const CommentItem = ({ comment, currentUser, onDelete }) => {
  const { resolveUser } = useUserResolver();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Résoudre l'utilisateur du commentaire
  useEffect(() => {
    const loadUser = async () => {
      try {
        const resolvedUser = await resolveUser(comment.userId);
        setUser(resolvedUser);
      } catch (error) {
        console.error('❌ Erreur résolution utilisateur commentaire:', error);
        setUser({
          uid: comment.userId,
          displayName: `Utilisateur ${comment.userId?.substring(0, 8)}`,
          fullName: `Utilisateur ${comment.userId?.substring(0, 8)}`,
          email: 'Erreur',
          initials: 'ER',
          hasError: true
        });
      } finally {
        setLoading(false);
      }
    };

    if (comment.userId) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [comment.userId, resolveUser]);

  // Formater la date avec plus de précision
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMinutes < 1) {
        return 'À l\'instant';
      } else if (diffMinutes < 60) {
        return `Il y a ${diffMinutes}min`;
      } else if (diffHours < 24) {
        return `Il y a ${diffHours}h`;
      } else if (diffDays < 7) {
        return `Il y a ${diffDays}j`;
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Date invalide';
    }
  };

  const isOwnComment = currentUser?.uid === comment.userId;
  const isDeleted = comment.isDeleted || false;

  if (loading) {
    return (
      <div className="flex gap-3 p-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
          <div className="w-full h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 p-3 rounded-lg transition-colors ${
      isDeleted ? 'bg-red-500/5 border border-red-500/20' : 'hover:bg-gray-700/30'
    }`}>
      <UserAvatar user={user} size="md" showTooltip={true} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-medium text-sm ${
            user?.isDeleted ? 'text-red-300' :
            user?.hasError ? 'text-yellow-300' :
            'text-gray-200'
          }`}>
            {user?.fullName || 'Utilisateur inconnu'}
          </span>
          
          {/* Badge rôle/département */}
          {user?.department && !user?.isDeleted && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              {user.department}
            </span>
          )}
          
          <span className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
          
          {isOwnComment && (
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
              Vous
            </span>
          )}
          
          {user?.isDeleted && (
            <span className="text-xs text-red-400">
              (supprimé)
            </span>
          )}
          
          {user?.hasError && (
            <span className="text-xs text-yellow-400">
              ⚠️
            </span>
          )}
        </div>

        <p className={`text-sm leading-relaxed ${
          isDeleted ? 'text-gray-500 italic' : 'text-gray-200'
        }`}>
          {isDeleted ? 'Ce commentaire a été supprimé' : comment.content}
        </p>

        {/* Actions */}
        {!isDeleted && isOwnComment && onDelete && (
          <div className="flex items-center gap-3 text-xs mt-2">
            <button 
              onClick={() => onDelete(comment.id)}
              className="text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
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

/**
 * 🔔 HOOK POUR COMPTEUR DE COMMENTAIRES (pour notifications)
 */
const useCommentCount = (entityType, entityId) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const loadCount = async () => {
      try {
        if (entityType && entityId) {
          const comments = await collaborationService.getComments(entityType, entityId);
          setCount(comments?.length || 0);
        }
      } catch (error) {
        console.warn('Erreur comptage commentaires:', error);
        setCount(0);
      }
    };
    
    loadCount();
  }, [entityType, entityId]);
  
  return count;
};

/**
 * 💬 COMPOSANT PRINCIPAL - SECTION COMMENTAIRES AMÉLIORÉE
 */
const CommentSection = ({ entityType, entityId, className = '', showNotificationBadge = false }) => {
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
        content: newComment.trim(),
        createdAt: new Date(),
        isDeleted: false
      };
      
      const newCommentDoc = await collaborationService.addComment(commentData);
      
      if (newCommentDoc) {
        // Ajouter le commentaire à la liste locale
        setComments(prev => [...prev, {
          id: newCommentDoc.id || Date.now().toString(),
          ...commentData
        }]);
        
        setNewComment('');
        console.log('✅ Commentaire ajouté');
        
        // Focus sur le textarea pour faciliter l'ajout de commentaires suivants
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      setError('Impossible d\'envoyer le commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  // Suppression de commentaire
  const handleDeleteComment = async (commentId) => {
    if (!commentId || !window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
      return;
    }

    try {
      await collaborationService.deleteComment(commentId);
      
      // Marquer comme supprimé dans la liste locale
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, isDeleted: true, content: 'Ce commentaire a été supprimé' }
          : comment
      ));
      
      console.log('✅ Commentaire supprimé');
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setError('Impossible de supprimer le commentaire');
    }
  };

  // Rendu principal
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
      
      {/* En-tête avec notification badge */}
      <div className="p-4 border-b border-gray-600">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Commentaires 
          {comments.length > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              showNotificationBadge && comments.length > 0 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {comments.length}
            </span>
          )}
          {showNotificationBadge && comments.length > 0 && (
            <Bell className="w-3 h-3 text-red-400" />
          )}
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
      <div className="max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucun commentaire</p>
            <p className="text-gray-500 text-xs mt-1">Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formulaire */}
      {user ? (
        <div className="p-4 border-t border-gray-600">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <UserAvatar 
                  user={{
                    fullName: user.displayName || user.email?.split('@')[0] || 'Vous',
                    initials: (user.displayName || user.email?.split('@')[0] || 'U')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2),
                    photoURL: user.photoURL
                  }} 
                  size="md" 
                />
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  disabled={submitting}
                  maxLength={1000}
                />
                {newComment.length > 900 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {1000 - newComment.length} caractères restants
                  </div>
                )}
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
        </div>
      ) : (
        <div className="p-4 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">Connectez-vous pour commenter</p>
        </div>
      )}
    </div>
  );
};

// Export du hook pour utilisation externe
export { useCommentCount };
export default CommentSection;
