// ==========================================
// 📁 react-app/src/modules/tasks/CommentBadgeTemp.jsx  
// BADGE COMMENTAIRES TEMPS RÉEL - FIX NOTIFICATION DIRECT FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * 💬 BADGE COMMENTAIRES AVEC RECHARGEMENT TEMPS RÉEL DIRECT FIREBASE
 */
const CommentBadgeTemp = ({ 
  entityType, 
  entityId, 
  onClick = null,
  className = '' 
}) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(0);

  // 🔄 FONCTION DE CHARGEMENT DIRECT FIREBASE - MÊME MÉTHODE QUE LE MODAL
  const loadCommentCount = async () => {
    if (!entityType || !entityId) {
      setLoading(false);
      return;
    }

    try {
      console.log('📊 [COMMENT_BADGE] Chargement direct Firebase pour:', entityType, entityId);
      
      // 📖 CHARGEMENT DIRECT FIREBASE - MÊME CODE QUE TaskDetailModal
      const { getDocs, collection, query, where } = await import('firebase/firestore');
      const { db } = await import('../../core/firebase.js');
      
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId)
      );
      
      const snapshot = await getDocs(commentsQuery);
      const count = snapshot.size;
      
      console.log('📊 [COMMENT_BADGE] Commentaires trouvés:', count, 'pour tâche:', entityId);
      setCommentCount(count);
      
    } catch (error) {
      console.error('❌ [COMMENT_BADGE] Erreur chargement Firebase:', error);
      setCommentCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 CHARGEMENT INITIAL
  useEffect(() => {
    loadCommentCount();
  }, [entityType, entityId]);

  // 🔄 RECHARGEMENT PÉRIODIQUE POUR TEMPS RÉEL
  useEffect(() => {
    if (!entityType || !entityId) return;
    
    // Rechargement toutes les 3 secondes pour temps réel
    const interval = setInterval(() => {
      loadCommentCount();
      setLastUpdate(Date.now());
    }, 3000);
    
    return () => clearInterval(interval);
  }, [entityType, entityId]);

  // 🔄 ÉCOUTER LES ÉVÉNEMENTS GLOBAUX DE MISE À JOUR
  useEffect(() => {
    const handleCommentAdded = (event) => {
      const { taskId } = event.detail || {};
      if (taskId === entityId) {
        console.log('🔔 [COMMENT_BADGE] Nouveau commentaire détecté pour:', taskId, '- rechargement immédiat...');
        loadCommentCount();
      }
    };

    // Écouter les événements custom
    window.addEventListener('commentAdded', handleCommentAdded);
    window.addEventListener('commentDeleted', handleCommentAdded);
    
    return () => {
      window.removeEventListener('commentAdded', handleCommentAdded);
      window.removeEventListener('commentDeleted', handleCommentAdded);
    };
  }, [entityId]);

  // 🚫 Ne rien afficher si pas de commentaires
  if (loading) {
    return (
      <div className="w-4 h-4 bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  if (commentCount === 0) {
    console.log('📊 [COMMENT_BADGE] Aucun commentaire à afficher pour:', entityId);
    return null; // Masquer si aucun commentaire
  }

  console.log('📊 [COMMENT_BADGE] Affichage badge:', commentCount, 'commentaires pour:', entityId);

  // 🎨 BADGE VISIBLE AVEC ANIMATION
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-600/90 hover:bg-blue-600 text-white rounded-full text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title={`${commentCount} commentaire${commentCount > 1 ? 's' : ''} - Cliquer pour voir`}
    >
      <MessageCircle className="w-3 h-3" />
      <span>{commentCount}</span>
      
      {/* Indicateur de mise à jour récente */}
      {Date.now() - lastUpdate < 3000 && (
        <div className="w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
      )}
    </button>
  );
};

export default CommentBadgeTemp;
