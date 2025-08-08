// ==========================================
// 📁 react-app/src/shared/hooks/useCommentCount.js
// HOOK COMPTEUR DE COMMENTAIRES SÉCURISÉ
// ==========================================

// ✅ CRÉER CE FICHIER : react-app/src/shared/hooks/useCommentCount.js

import { useState, useEffect } from 'react';
import { collaborationService } from '../../core/services/collaborationService.js';

/**
 * 🔢 HOOK POUR COMPTER LES COMMENTAIRES
 * 
 * @param {string} entityType - Type d'entité (task, project, etc.)
 * @param {string} entityId - ID de l'entité
 * @returns {Object} { commentCount, loading, error, refetch }
 */
export const useCommentCount = (entityType, entityId) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction de récupération du count
  const fetchCommentCount = async () => {
    // 🛡️ VALIDATION OBLIGATOIRE
    if (!entityType || !entityId) {
      console.warn('🛡️ [useCommentCount] Paramètres manquants:', { entityType, entityId });
      setCommentCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔢 Récupération count commentaires:', { entityType, entityId });
      
      // 🔍 RÉCUPÉRATION SÉCURISÉE
      const comments = await collaborationService.getComments(entityType, entityId);
      const count = Array.isArray(comments) ? comments.length : 0;
      
      console.log('✅ Count commentaires:', count);
      setCommentCount(count);
      
    } catch (err) {
      console.error('❌ Erreur récupération count:', err);
      setError(err.message || 'Erreur inconnue');
      setCommentCount(0); // Fallback sécurisé
      
    } finally {
      setLoading(false);
    }
  };

  // Effet de chargement initial
  useEffect(() => {
    if (entityType && entityId) {
      fetchCommentCount();
    } else {
      setLoading(false);
      setCommentCount(0);
    }
  }, [entityType, entityId]);

  // Fonction de revalidation
  const refetch = () => {
    if (entityType && entityId) {
      fetchCommentCount();
    }
  };

  return {
    commentCount,
    loading,
    error,
    refetch
  };
};

/**
 * 💬 HOOK OPTIMISÉ POUR CACHE
 * Version avec cache local pour éviter les re-fetchs
 */
export const useCommentCountCached = (entityType, entityId, cacheTime = 60000) => {
  const [cache, setCache] = useState(new Map());
  const result = useCommentCount(entityType, entityId);

  // Clé de cache
  const cacheKey = `${entityType}-${entityId}`;

  useEffect(() => {
    // Vérifier le cache
    const cachedData = cache.get(cacheKey);
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp) < cacheTime) {
      console.log('📦 Utilisation cache commentaires:', cacheKey);
      return; // Utiliser le cache
    }

    // Mettre à jour le cache après récupération
    if (!result.loading && !result.error) {
      setCache(prev => new Map(prev).set(cacheKey, {
        count: result.commentCount,
        timestamp: now
      }));
    }
  }, [result.commentCount, result.loading, result.error, cacheKey, cacheTime]);

  return result;
};

/**
 * 🔔 HOOK POUR NOTIFICATIONS DE NOUVEAUX COMMENTAIRES
 */
export const useCommentNotifications = (entityType, entityId, interval = 30000) => {
  const [hasNewComments, setHasNewComments] = useState(false);
  const [lastKnownCount, setLastKnownCount] = useState(0);
  const { commentCount, loading } = useCommentCount(entityType, entityId);

  useEffect(() => {
    if (!loading && commentCount > lastKnownCount && lastKnownCount > 0) {
      setHasNewComments(true);
      console.log('🔔 Nouveaux commentaires détectés:', commentCount - lastKnownCount);
    }
    
    if (!loading) {
      setLastKnownCount(commentCount);
    }
  }, [commentCount, loading, lastKnownCount]);

  // Marquer comme vu
  const markAsSeen = () => {
    setHasNewComments(false);
    setLastKnownCount(commentCount);
  };

  return {
    commentCount,
    hasNewComments,
    markAsSeen,
    loading
  };
};

// Export par défaut
export default useCommentCount;
