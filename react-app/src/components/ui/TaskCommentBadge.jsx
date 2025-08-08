// ==========================================
// 📁 react-app/src/components/ui/TaskCommentBadge.jsx
// BADGE DE NOTIFICATION COMMENTAIRES POUR LES TÂCHES
// ==========================================

import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { collaborationService } from '../../core/services/collaborationService.js';

/**
 * 🔔 BADGE DE COMMENTAIRES POUR TÂCHE
 * Affiche le nombre de commentaires avec notification visuelle
 */
const TaskCommentBadge = ({ 
  taskId, 
  size = 'sm', 
  className = '',
  onClick = null,
  showIcon = true,
  animated = true 
}) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNewComments, setHasNewComments] = useState(false);

  // Styles selon la taille
  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3', 
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Charger le nombre de commentaires
  useEffect(() => {
    const loadCommentCount = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer les commentaires
        const comments = await collaborationService.getComments('task', taskId);
        const count = comments?.length || 0;
        
        setCommentCount(count);
        
        // Détecter s'il y a de nouveaux commentaires (simulation)
        // Dans une vraie app, on comparerait avec le dernier vu par l'utilisateur
        if (count > 0) {
          const lastComment = comments[comments.length - 1];
          const isRecent = lastComment && 
            new Date() - (lastComment.createdAt?.toDate ? lastComment.createdAt.toDate() : new Date(lastComment.createdAt)) 
            < 24 * 60 * 60 * 1000; // 24h
          
          setHasNewComments(isRecent);
        }
        
      } catch (error) {
        console.warn('Erreur chargement commentaires:', error);
        setCommentCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadCommentCount();
  }, [taskId]);

  // Gestionnaire de clic
  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  // Ne rien afficher si pas de commentaires et pas de loading
  if (!loading && commentCount === 0) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1 bg-gray-200 text-gray-400 rounded-full ${sizeStyles[size]} ${className}`}>
        {showIcon && <MessageCircle className={`${iconSizes[size]} animate-pulse`} />}
        <span className="animate-pulse">-</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-1 rounded-full transition-all duration-200
        ${hasNewComments 
          ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
          : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
        }
        ${animated && hasNewComments ? 'animate-pulse' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        ${sizeStyles[size]} ${className}
      `}
      title={`${commentCount} commentaire${commentCount > 1 ? 's' : ''}${hasNewComments ? ' (nouveau)' : ''}`}
    >
      {/* Icône */}
      {showIcon && (
        <div className="relative">
          <MessageCircle className={iconSizes[size]} />
          {hasNewComments && (
            <Bell className={`absolute -top-0.5 -right-0.5 ${iconSizes.xs} text-yellow-300`} />
          )}
        </div>
      )}
      
      {/* Nombre */}
      <span className="font-medium">
        {commentCount}
      </span>
      
      {/* Indicateur nouveau */}
      {hasNewComments && (
        <div className={`${size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5'} bg-yellow-300 rounded-full`}></div>
      )}
    </button>
  );
};

/**
 * 💬 BADGE SIMPLE POUR ONGLET
 * Version simplifiée pour les onglets de modal
 */
const TabCommentBadge = ({ 
  taskId, 
  className = '' 
}) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      try {
        const comments = await collaborationService.getComments('task', taskId);
        setCommentCount(comments?.length || 0);
      } catch (error) {
        console.warn('Erreur comptage commentaires:', error);
        setCommentCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadCount();
  }, [taskId]);

  if (loading || commentCount === 0) {
    return null;
  }

  return (
    <span className={`ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium ${className}`}>
      {commentCount}
    </span>
  );
};

/**
 * 📋 HOOK POUR OBTENIR LE NOMBRE DE COMMENTAIRES
 * Utilitaire réutilisable pour d'autres composants
 */
const useTaskCommentCount = (taskId) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const loadCount = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      try {
        const comments = await collaborationService.getComments('task', taskId);
        const commentCount = comments?.length || 0;
        
        setCount(commentCount);
        
        // Vérifier s'il y a de nouveaux commentaires
        if (commentCount > 0) {
          const lastComment = comments[comments.length - 1];
          const isRecent = lastComment && 
            new Date() - (lastComment.createdAt?.toDate ? lastComment.createdAt.toDate() : new Date(lastComment.createdAt))
            < 24 * 60 * 60 * 1000;
          
          setHasNew(isRecent);
        }
      } catch (error) {
        console.warn('Erreur hook commentaires:', error);
        setCount(0);
        setHasNew(false);
      } finally {
        setLoading(false);
      }
    };

    loadCount();
  }, [taskId]);

  return { count, loading, hasNew };
};

// Exports
export default TaskCommentBadge;
export { TabCommentBadge, useTaskCommentCount };
