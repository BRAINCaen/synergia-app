// ==========================================
// 📁 react-app/src/components/ui/CommentBadge.jsx
// BADGE DE NOTIFICATION DE COMMENTAIRES
// ==========================================

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCommentCount } from '../../shared/hooks/useCommentCount.js';

/**
 * 💬 COMPOSANT BADGE DE COMMENTAIRES
 * 
 * @param {string} entityType - Type d'entité (task, project, etc.)
 * @param {string} entityId - ID de l'entité
 * @param {string} variant - Style du badge ('minimal', 'full', 'dot')
 * @param {string} className - Classes CSS additionnelles
 * @param {function} onClick - Callback au clic
 */
const CommentBadge = ({ 
  entityType, 
  entityId, 
  variant = 'minimal',
  className = '',
  onClick = null,
  showOnZero = false
}) => {
  const { commentCount, loading, error } = useCommentCount(entityType, entityId);

  // 🛡️ VALIDATION OBLIGATOIRE
  if (!entityType || !entityId) {
    console.warn('🛡️ [CommentBadge] Paramètres manquants');
    return null;
  }

  // 🔄 États de chargement et erreur
  if (loading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
      </div>
    );
  }

  if (error) {
    console.warn('⚠️ [CommentBadge] Erreur:', error);
    return null; // Masquer en cas d'erreur
  }

  // 🚫 Masquer si pas de commentaires (sauf si forcé)
  if (commentCount === 0 && !showOnZero) {
    return null;
  }

  // 🎨 STYLES SELON VARIANT
  const getVariantStyles = () => {
    switch (variant) {
      case 'dot':
        // Simple point si des commentaires existent
        return commentCount > 0 ? {
          container: `w-2 h-2 bg-blue-500 rounded-full ${className}`,
          content: null
        } : null;
        
      case 'full':
        // Badge complet avec icône et texte
        return {
          container: `inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium ${className}`,
          content: (
            <>
              <MessageCircle className="w-3 h-3" />
              <span>{commentCount}</span>
              <span className="hidden sm:inline">commentaire{commentCount > 1 ? 's' : ''}</span>
            </>
          )
        };
        
      case 'minimal':
      default:
        // Badge minimal avec nombre seulement
        return {
          container: `inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs font-medium ${className}`,
          content: (
            <>
              <MessageCircle className="w-3 h-3" />
              <span>{commentCount}</span>
            </>
          )
        };
    }
  };

  const styles = getVariantStyles();
  
  // Si pas de style (ex: dot sans commentaires), ne rien afficher
  if (!styles) {
    return null;
  }

  // 🎯 RENDU AVEC GESTION DU CLIC
  const BadgeElement = onClick ? 'button' : 'div';
  const clickProps = onClick ? {
    onClick: (e) => {
      e.stopPropagation(); // Empêcher la propagation vers la card parent
      onClick();
    },
    className: styles.container + ' cursor-pointer hover:bg-blue-500/30 transition-colors',
    title: `${commentCount} commentaire${commentCount > 1 ? 's' : ''} - Cliquer pour voir`
  } : {
    className: styles.container,
    title: `${commentCount} commentaire${commentCount > 1 ? 's' : ''}`
  };

  return (
    <BadgeElement {...clickProps}>
      {styles.content}
    </BadgeElement>
  );
};

/**
 * 🔔 VARIANTES PRÉDÉFINIES
 */
export const CommentDot = (props) => (
  <CommentBadge {...props} variant="dot" />
);

export const CommentBadgeFull = (props) => (
  <CommentBadge {...props} variant="full" />
);

export const CommentBadgeMinimal = (props) => (
  <CommentBadge {...props} variant="minimal" />
);

/**
 * 📍 BADGE AVEC POSITION ABSOLUE POUR SUPERPOSITION
 */
export const CommentBadgeOverlay = ({ 
  entityType, 
  entityId, 
  position = 'top-right',
  className = '',
  ...props 
}) => {
  const positionStyles = {
    'top-right': 'absolute -top-1 -right-1',
    'top-left': 'absolute -top-1 -left-1',
    'bottom-right': 'absolute -bottom-1 -right-1',
    'bottom-left': 'absolute -bottom-1 -left-1'
  };

  return (
    <CommentBadge
      entityType={entityType}
      entityId={entityId}
      variant="dot"
      className={`${positionStyles[position]} ${className}`}
      {...props}
    />
  );
};

/**
 * 🎯 BADGE CLIQUABLE AVEC NAVIGATION AUTOMATIQUE
 */
export const CommentBadgeLink = ({ 
  entityType, 
  entityId, 
  onNavigate = null,
  ...props 
}) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // Navigation par défaut selon le type d'entité
      switch (entityType) {
        case 'task':
          window.location.href = `/tasks?id=${entityId}&tab=comments`;
          break;
        case 'project':
          window.location.href = `/projects?id=${entityId}&tab=comments`;
          break;
        default:
          console.warn('Type d\'entité non géré pour navigation:', entityType);
      }
    }
  };

  return (
    <CommentBadge
      entityType={entityType}
      entityId={entityId}
      onClick={handleClick}
      {...props}
    />
  );
};

console.log('💬 CommentBadge components loaded');

export default CommentBadge;
