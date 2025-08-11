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
   * 💬 AJOUTER UN COMMENTAIRE AVEC PERSISTANCE GARANTIE
   */
  async addComment(commentData) {
    try {
      console.log('💬 [COLLAB] Ajout commentaire avec persistance:', commentData);

      // 🛡️ VALIDATION STRICTE
      if (!commentData?.entityType || !commentData?.entityId || !commentData?.userId || !commentData?.content) {
        throw new Error('Données obligatoires manquantes pour le commentaire');
      }

      // 📝 STRUCTURE COMPLÈTE POUR FIREBASE
      const comment = {
        // Champs obligatoires
        entityType: String(commentData.entityType),
        entityId: String(commentData.entityId),
        userId: String(commentData.userId),
        content: String(commentData.content).trim(),
        
        // Métadonnées automatiques
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Champs optionnels avec valeurs par défaut
        userName: commentData.userName || 'Utilisateur',
        userEmail: commentData.userEmail || '',
        isEdited: false,
        isDeleted: false,
        editHistory: [],
        
        // Données techniques
        version: 1,
        clientTimestamp: new Date().toISOString(),
        
        // Métadonnées pour notifications
        hasBeenRead: false,
        readBy: []
      };

      console.log('💬 [COLLAB] Structure finale commentaire:', comment);
      
      // 🔐 TRANSACTION SÉCURISÉE POUR ÉVITER LES CONFLITS
      const result = await runTransaction(db, async (transaction) => {
        // Ajouter le commentaire
        const docRef = doc(collection(db, 'comments'));
        transaction.set(docRef, comment);
        
        // Optionnel: Mettre à jour le compteur de commentaires de l'entité
        if (commentData.entityType === 'task') {
          const taskRef = doc(db, 'tasks', commentData.entityId);
          const taskSnap = await transaction.get(taskRef);
          
          if (taskSnap.exists()) {
            const currentData = taskSnap.data();
            const currentCommentCount = currentData.commentCount || 0;
            
            transaction.update(taskRef, {
              commentCount: currentCommentCount + 1,
              lastCommentAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
        
        return docRef.id;
      });

      console.log('✅ [COLLAB] Commentaire ajouté avec ID:', result);
      
      // 📡 RETOURNER LE COMMENTAIRE AVEC TIMESTAMP CLIENT POUR AFFICHAGE IMMÉDIAT
      const returnedComment = {
        id: result,
        ...comment,
        createdAt: new Date(), // Timestamp client pour affichage immédiat
        updatedAt: new Date()
      };
      
      console.log('📡 [COLLAB] Commentaire retourné:', returnedComment);
      return returnedComment;

    } catch (error) {
      console.error('❌ [COLLAB] Erreur ajout commentaire:', error);
      console.error('❌ [COLLAB] Stack:', error.stack);
      
      // Erreur spécifique selon le type
      if (error.code === 'permission-denied') {
        throw new Error('Permissions insuffisantes pour ajouter un commentaire');
      } else if (error.code === 'unavailable') {
        throw new Error('Service temporairement indisponible, réessayez');
      } else {
        throw new Error(`Erreur lors de l'ajout: ${error.message}`);
      }
    }
  }

  /**
   * 📖 RÉCUPÉRER COMMENTAIRES AVEC CACHE ET TEMPS RÉEL
   */
  async getComments(entityType, entityId, options = {}) {
    try {
      console.log('📖 [COLLAB] Récupération commentaires:', { entityType, entityId, options });

      // 🛡️ VALIDATION
      if (!entityType || !entityId) {
        console.warn('📖 [COLLAB] Paramètres manquants');
        return [];
      }

      // 🔍 REQUÊTE OPTIMISÉE AVEC TRI
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'asc')
      );

      console.log('📖 [COLLAB] Exécution requête Firestore...');
      const snapshot = await getDocs(q);
      const comments = [];

      // 📋 TRAITEMENT DES DOCUMENTS
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Conversion sécurisée des timestamps
        let createdAt = new Date();
        let updatedAt = new Date();
        
        try {
          if (data.createdAt) {
            createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          }
          if (data.updatedAt) {
            updatedAt = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          }
        } catch (timestampError) {
          console.warn('⚠️ [COLLAB] Erreur conversion timestamp:', timestampError);
        }
        
        const comment = {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt,
          // Assurer les champs par défaut
          userName: data.userName || 'Utilisateur',
          isEdited: Boolean(data.isEdited),
          isDeleted: Boolean(data.isDeleted)
        };
        
        comments.push(comment);
      });

      console.log(`✅ [COLLAB] ${comments.length} commentaires récupérés et triés`);
      return comments;

    } catch (error) {
      console.error('❌ [COLLAB] Erreur récupération commentaires:', error);
      
      // 🔄 STRATÉGIE DE FALLBACK
      try {
        console.log('🔄 [COLLAB] Tentative de récupération alternative...');
        
        // Récupération alternative sans tri
        const commentsRef = collection(db, 'comments');
        const basicQuery = query(
          commentsRef,
          where('entityType', '==', String(entityType)),
          where('entityId', '==', String(entityId))
        );
        
        const fallbackSnapshot = await getDocs(basicQuery);
        const fallbackComments = [];
        
        fallbackSnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.isDeleted) {
            fallbackComments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              userName: data.userName || 'Utilisateur'
            });
          }
        });
        
        // Tri côté client
        fallbackComments.sort((a, b) => a.createdAt - b.createdAt);
        
        console.log(`🔄 [COLLAB] Récupération alternative réussie: ${fallbackComments.length} commentaires`);
        return fallbackComments;
        
      } catch (fallbackError) {
        console.error('❌ [COLLAB] Fallback échoué:', fallbackError);
        return [];
      }
    }
  }

  /**
   * 🔄 ÉCOUTER LES COMMENTAIRES TEMPS RÉEL
   */
  subscribeToComments(entityType, entityId, callback) {
    try {
      console.log('🔄 [COLLAB] Abonnement temps réel:', { entityType, entityId });
      
      if (!entityType || !entityId || !callback) {
        throw new Error('Paramètres manquants pour l\'abonnement');
      }
      
      // Clé unique pour ce listener
      const listenerKey = `${entityType}-${entityId}`;
      
      // Supprimer l'ancien listener s'il existe
      if (this.listeners.has(listenerKey)) {
        this.listeners.get(listenerKey)();
        this.listeners.delete(listenerKey);
      }
      
      // 📡 CRÉER LE LISTENER TEMPS RÉEL
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('entityType', '==', String(entityType)),
        where('entityId', '==', String(entityId)),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📡 [COLLAB] Mise à jour temps réel reçue');
          
          const comments = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            comments.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              userName: data.userName || 'Utilisateur'
            });
          });
          
          console.log(`📡 [COLLAB] ${comments.length} commentaires en temps réel`);
          callback(comments);
        },
        (error) => {
          console.error('❌ [COLLAB] Erreur listener temps réel:', error);
          callback([]); // Callback avec tableau vide en cas d'erreur
        }
      );
      
      // Stocker le listener pour pouvoir le nettoyer
      this.listeners.set(listenerKey, unsubscribe);
      
      console.log('✅ [COLLAB] Listener temps réel configuré');
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur configuration listener:', error);
      return () => {}; // Fonction vide de nettoyage
    }
  }

  /**
   * 🛑 ARRÊTER L'ÉCOUTE TEMPS RÉEL
   */
  unsubscribeFromComments(entityType, entityId) {
    const listenerKey = `${entityType}-${entityId}`;
    
    if (this.listeners.has(listenerKey)) {
      console.log('🛑 [COLLAB] Arrêt listener:', listenerKey);
      this.listeners.get(listenerKey)();
      this.listeners.delete(listenerKey);
      return true;
    }
    
    return false;
  }

  /**
   * 🛑 NETTOYER TOUS LES LISTENERS
   */
  cleanupAllListeners() {
    console.log('🛑 [COLLAB] Nettoyage de tous les listeners:', this.listeners.size);
    
    this.listeners.forEach((unsubscribe, key) => {
      console.log('🛑 [COLLAB] Nettoyage listener:', key);
      unsubscribe();
    });
    
    this.listeners.clear();
    console.log('✅ [COLLAB] Tous les listeners nettoyés');
  }

  /**
   * ✏️ MODIFIER UN COMMENTAIRE
   */
  async updateComment(commentId, updateData, userId) {
    try {
      console.log('✏️ [COLLAB] Modification commentaire:', { commentId, userId });

      if (!commentId || !updateData || !userId) {
        throw new Error('Paramètres manquants pour la modification');
      }

      // 🔐 TRANSACTION POUR MODIFICATION SÉCURISÉE
      const result = await runTransaction(db, async (transaction) => {
        const commentRef = doc(db, 'comments', commentId);
        const commentSnap = await transaction.get(commentRef);

        if (!commentSnap.exists()) {
          throw new Error('Commentaire non trouvé');
        }

        const commentData = commentSnap.data();
        
        // Vérifier les permissions
        if (commentData.userId !== userId) {
          throw new Error('Vous ne pouvez modifier que vos propres commentaires');
        }

        // Préparer les nouvelles données
        const updateFields = {
          ...updateData,
          updatedAt: serverTimestamp(),
          isEdited: true,
          version: (commentData.version || 1) + 1
        };

        // Ajouter à l'historique d'édition
        if (updateData.content && updateData.content !== commentData.content) {
          const editHistory = commentData.editHistory || [];
          editHistory.push({
            previousContent: commentData.content,
            editedAt: new Date().toISOString(),
            version: commentData.version || 1
          });
          updateFields.editHistory = editHistory;
        }

        transaction.update(commentRef, updateFields);
        return commentId;
      });

      console.log('✅ [COLLAB] Commentaire modifié:', result);
      return result;

    } catch (error) {
      console.error('❌ [COLLAB] Erreur modification:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN COMMENTAIRE (soft delete)
   */
  async deleteComment(commentId, userId) {
    try {
      console.log('🗑️ [COLLAB] Suppression commentaire:', { commentId, userId });

      if (!commentId || !userId) {
        throw new Error('Paramètres manquants pour la suppression');
      }

      // 🔐 TRANSACTION POUR SUPPRESSION SÉCURISÉE
      const result = await runTransaction(db, async (transaction) => {
        const commentRef = doc(db, 'comments', commentId);
        const commentSnap = await transaction.get(commentRef);

        if (!commentSnap.exists()) {
          throw new Error('Commentaire non trouvé');
        }

        const commentData = commentSnap.data();
        
        // Vérifier les permissions
        if (commentData.userId !== userId) {
          throw new Error('Vous ne pouvez supprimer que vos propres commentaires');
        }

        // Soft delete
        transaction.update(commentRef, {
          isDeleted: true,
          deletedAt: serverTimestamp(),
          deletedBy: userId,
          content: '[Commentaire supprimé]'
        });

        // Optionnel: Décrémenter le compteur de l'entité
        if (commentData.entityType === 'task') {
          const taskRef = doc(db, 'tasks', commentData.entityId);
          const taskSnap = await transaction.get(taskRef);
          
          if (taskSnap.exists()) {
            const currentData = taskSnap.data();
            const currentCommentCount = Math.max(0, (currentData.commentCount || 1) - 1);
            
            transaction.update(taskRef, {
              commentCount: currentCommentCount,
              updatedAt: serverTimestamp()
            });
          }
        }

        return commentId;
      });

      console.log('✅ [COLLAB] Commentaire supprimé:', result);
      return result;

    } catch (error) {
      console.error('❌ [COLLAB] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE COMMENTAIRES
   */
  async getCommentStats(entityType, entityId) {
    try {
      const comments = await this.getComments(entityType, entityId);
      
      const stats = {
        total: comments.length,
        byUser: {},
        recent: 0,
        edited: 0
      };
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      comments.forEach(comment => {
        // Par utilisateur
        if (!stats.byUser[comment.userId]) {
          stats.byUser[comment.userId] = {
            count: 0,
            userName: comment.userName
          };
        }
        stats.byUser[comment.userId].count++;
        
        // Récents (24h)
        if (comment.createdAt > oneDayAgo) {
          stats.recent++;
        }
        
        // Édités
        if (comment.isEdited) {
          stats.edited++;
        }
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ [COLLAB] Erreur statistiques:', error);
      return { total: 0, byUser: {}, recent: 0, edited: 0 };
    }
  }
}

// Instance unique avec nettoyage automatique
const collaborationService = new CollaborationService();

// Nettoyage automatique lors de la fermeture de page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    collaborationService.cleanupAllListeners();
  });
  
  // Exposer pour debug
  if (process.env.NODE_ENV === 'development') {
    window.collaborationService = collaborationService;
  }
}

// Exports
export default CollaborationService;
export { collaborationService };
