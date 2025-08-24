// ==========================================
// 📁 react-app/src/core/services/collaborationService.js
// SERVICE COLLABORATION AVEC SYNCHRONISATION FIREBASE TEMPS RÉEL
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🤝 SERVICE DE COLLABORATION AVEC SYNCHRONISATION TEMPS RÉEL
 */
class CollaborationService {
  constructor() {
    console.log('🤝 CollaborationService - Version temps réel avec persistance Firebase');
    this.listeners = new Map(); // Pour gérer les listeners temps réel
  }

  /**
   * 💬 AJOUTER UN COMMENTAIRE - SIGNATURE CORRIGÉE
   */
  async addComment(entityType, entityId, commentData) {
    try {
      console.log('💬 [COLLAB] Ajout commentaire avec persistance:', { entityType, entityId, commentData });

      // 🛡️ VALIDATION STRICTE
      if (!entityType || !entityId || !commentData?.content || !commentData?.authorId) {
        throw new Error('Données obligatoires manquantes pour le commentaire');
      }

      // 📝 STRUCTURE COMPLÈTE POUR FIREBASE
      const comment = {
        // Champs obligatoires
        entityType: String(entityType),
        entityId: String(entityId),
        userId: String(commentData.authorId), // Utiliser authorId au lieu de userId
        content: String(commentData.content).trim(),
        
        // Métadonnées automatiques
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Champs optionnels avec valeurs par défaut
        userName: commentData.authorName || 'Utilisateur',
        userEmail: commentData.authorEmail || '',
        isEdited: false,
        
        // Timestamp client pour tri local
        clientTimestamp: commentData.timestamp || new Date()
      };

      console.log('📝 [COLLAB] Données commentaire prêtes:', comment);

      // 💾 SAUVEGARDE FIREBASE
      const docRef = await addDoc(collection(db, 'comments'), comment);
      
      console.log('✅ [COLLAB] Commentaire sauvé avec ID:', docRef.id);
      
      return {
        success: true,
        commentId: docRef.id,
        comment: {
          id: docRef.id,
          ...comment,
          createdAt: new Date() // Pour l'affichage immédiat
        }
      };
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur ajout commentaire:', error);
      throw new Error(`Erreur ajout commentaire: ${error.message}`);
    }
  }

  /**
   * 📡 S'ABONNER AUX COMMENTAIRES EN TEMPS RÉEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      const listenerKey = `${entityType}_${entityId}`;
      
      // Annuler l'ancien listener s'il existe
      if (this.listeners.has(listenerKey)) {
        console.log('🔄 [COLLAB] Remplacement listener existant:', listenerKey);
        this.listeners.get(listenerKey)();
        this.listeners.delete(listenerKey);
      }
      
      console.log('📡 [COLLAB] Création listener temps réel:', listenerKey);
      
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const comments = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            comments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.clientTimestamp || data.createdAt)
            });
          });
          
          console.log('📡 [COLLAB] Commentaires mis à jour:', comments.length);
          callback(comments);
        },
        (error) => {
          console.error('❌ [COLLAB] Erreur listener:', error);
          callback([]);
        }
      );
      
      // Sauvegarder le listener
      this.listeners.set(listenerKey, unsubscribe);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur création listener:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 📄 RÉCUPÉRER LES COMMENTAIRES (SNAPSHOT)
   */
  async getComments(entityType, entityId) {
    try {
      console.log('📄 [COLLAB] Récupération commentaires:', entityType, entityId);
      
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const comments = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.clientTimestamp || data.createdAt)
        });
      });
      
      console.log('✅ [COLLAB] Commentaires récupérés:', comments.length);
      return comments;
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur récupération commentaires:', error);
      return [];
    }
  }

  /**
   * ✏️ MODIFIER UN COMMENTAIRE
   */
  async updateComment(commentId, newContent) {
    try {
      console.log('✏️ [COLLAB] Modification commentaire:', commentId);
      
      if (!newContent?.trim()) {
        throw new Error('Contenu du commentaire requis');
      }
      
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent.trim(),
        isEdited: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [COLLAB] Commentaire modifié avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur modification commentaire:', error);
      throw new Error(`Erreur modification commentaire: ${error.message}`);
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE
   */
  async deleteComment(commentId) {
    try {
      console.log('🗑️ [COLLAB] Suppression commentaire:', commentId);
      
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: '[Commentaire supprimé]',
        isDeleted: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [COLLAB] Commentaire supprimé avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur suppression commentaire:', error);
      throw new Error(`Erreur suppression commentaire: ${error.message}`);
    }
  }

  /**
   * 🛑 NETTOYER TOUS LES LISTENERS
   */
  cleanup() {
    console.log('🛑 [COLLAB] Nettoyage de tous les listeners:', this.listeners.size);
    
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
        console.log('✅ [COLLAB] Listener nettoyé:', key);
      } catch (error) {
        console.warn('⚠️ [COLLAB] Erreur nettoyage listener:', key, error);
      }
    });
    
    this.listeners.clear();
  }

  /**
   * 📊 STATISTIQUES DES COMMENTAIRES
   */
  async getCommentsStats(entityType, entityId) {
    try {
      const comments = await this.getComments(entityType, entityId);
      
      return {
        total: comments.length,
        recent: comments.filter(c => {
          const commentDate = new Date(c.createdAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return commentDate > dayAgo;
        }).length,
        authors: [...new Set(comments.map(c => c.userId))].length
      };
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur stats commentaires:', error);
      return { total: 0, recent: 0, authors: 0 };
    }
  }
}

// 🚀 EXPORT SINGLETON
export const collaborationService = new CollaborationService();
export default collaborationService;
