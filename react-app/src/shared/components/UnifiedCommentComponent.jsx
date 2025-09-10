// ==========================================
// 📁 react-app/src/shared/components/UnifiedCommentComponent.jsx
// COMPOSANT COMMENTAIRE UNIFIÉ - SOLUTION DÉFINITIVE
// ==========================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../core/firebase';
import { useAuthStore } from '../stores/authStore';

/**
 * ✨ COMPOSANT TEXTAREA ISOLÉ - SANS RE-RENDER
 * La clé est d'isoler complètement le textarea dans son propre composant
 */
const IsolatedTextarea = ({ onSubmit, disabled }) => {
  // État complètement isolé
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  
  // Gestionnaire de changement stable
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    console.log('📝 [TEXTAREA] Changement détecté:', newValue.length, 'caractères');
    setValue(newValue);
  }, []);
  
  // Gestionnaire de soumission stable
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue && onSubmit) {
      console.log('📤 [TEXTAREA] Envoi commentaire:', trimmedValue);
      onSubmit(trimmedValue);
      setValue(''); // Vider après envoi
    }
  }, [value, onSubmit]);
  
  // Gestionnaire touche Entrée
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  }, [handleSubmit]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre commentaire ici... (Ctrl+Entrée pour envoyer)"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
          rows={3}
          disabled={disabled}
          style={{ minHeight: '80px' }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {value.length}/1000
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs">
          💡 Ctrl+Entrée pour envoyer rapidement
        </span>
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          {disabled ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
};

/**
 * 💬 COMPOSANT COMMENTAIRE UNIFIÉ - SOLUTION DÉFINITIVE
 * Utilise un état local complètement isolé pour éviter les re-renders
 */
const UnifiedCommentComponent = ({ 
  entityType = 'task', 
  entityId, 
  showHeader = true 
}) => {
  const { user } = useAuthStore();
  
  // États locaux isolés
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref pour gérer l'abonnement temps réel
  const unsubscribeRef = useRef(null);
  
  // Formatage date simple
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      let date;
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return 'Date invalide';
    }
  }, []);
  
  // Charger les commentaires avec écoute temps réel
  useEffect(() => {
    if (!entityId) {
      setComments([]);
      setLoading(false);
      return;
    }
    
    console.log('💬 [COMMENTS] Initialisation pour:', entityType, entityId);
    setLoading(true);
    setError(null);
    
    try {
      // Requête Firestore avec écoute temps réel
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'desc')
      );
      
      // Abonnement temps réel
      unsubscribeRef.current = onSnapshot(commentsQuery, 
        (snapshot) => {
          const commentsData = [];
          snapshot.forEach((doc) => {
            commentsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log('💬 [COMMENTS] Données reçues:', commentsData.length, 'commentaires');
          setComments(commentsData);
          setLoading(false);
        },
        (error) => {
          console.error('❌ [COMMENTS] Erreur écoute:', error);
          setError('Erreur lors du chargement des commentaires');
          setLoading(false);
        }
      );
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur initialisation:', error);
      setError('Erreur lors de l\'initialisation');
      setLoading(false);
    }
    
    // Nettoyage à la désactivation
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 [COMMENTS] Nettoyage abonnement');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [entityType, entityId]);
  
  // Ajouter un commentaire
  const handleAddComment = useCallback(async (content) => {
    if (!user?.uid || !entityId || submitting) {
      console.warn('❌ [COMMENTS] Conditions non remplies pour ajout');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('📤 [COMMENTS] Ajout commentaire...');
      
      const commentData = {
        entityType,
        entityId,
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Utilisateur',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'comments'), commentData);
      console.log('✅ [COMMENTS] Commentaire ajouté avec succès');
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur ajout:', error);
      setError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  }, [user, entityType, entityId, submitting]);
  
  // Affichage du loading
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Chargement des commentaires...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-4">
      {/* Header optionnel */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
            Commentaires
            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {comments.length}
            </span>
          </h3>
        </div>
      )}
      
      {/* Formulaire d'ajout - EN PREMIER pour la visibilité */}
      {user ? (
        <IsolatedTextarea 
          onSubmit={handleAddComment}
          disabled={submitting}
        />
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm border border-gray-600 rounded-lg">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
      
      {/* Erreur */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun commentaire pour l'instant</p>
            <p className="text-sm">Soyez le premier à commenter !</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
              {/* En-tête du commentaire */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {comment.authorName || 'Utilisateur'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Contenu du commentaire */}
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Indicateur de frappe en cours */}
      {submitting && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-blue-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Envoi du commentaire...
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCommentComponent;
