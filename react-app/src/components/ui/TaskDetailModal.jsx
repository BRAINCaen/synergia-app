// Gérer le volontariat
  const handleVolunteer = async () => {
    if (!user?.uid) return;
    
    setVolunteerLoading(true);
    try {
      if (isAssignedToMe) {
        await onUnassignFromMe?.(task.id);
        if (window.showNotification) {
          window.showNotification('Vous n\'êtes plus assigné à cette tâche', 'info');
        }
      } else {
        await onAssignToMe?.(task.id);
        if (window.showNotification) {
          window.showNotification('Vous vous êtes porté volontaire !', 'success');
        }
      }
    } catch (error) {
      console.error('Erreur volontariat:', error);
      if (window.showNotification) {
        window.showNotification('Erreur lors du volontariat', 'error');
      }
    } finally {
      setVolunteerLoading(false);
    }
  };// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - TEXTAREA COMMENTAIRES CORRIGÉ
// ==========================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Users,
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Target, 
  FileText,
  Trophy,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  ExternalLink,
  MessageCircle,
  Shield,
  Repeat,
  MapPin,
  Paperclip,
  Send,
  Info,
  UserPlus,
  UserMinus,
  Eye,
  Heart,
  Zap
} from 'lucide-react';

// 🔥 IMPORTS FIREBASE CORRIGÉS
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// Import authStore
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 📅 FORMATAGE DATE FRANÇAIS
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Date inconnue';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Erreur formatage date:', error);
    return 'Date invalide';
  }
};

/**
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE - TEXTAREA CORRIGÉ
 */
const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task,
  onEdit,
  onDelete,
  onSubmit,
  onAssignToMe,
  onUnassignFromMe,
  currentUserId,
  showActions = true
}) => {
  // 🔗 HOOKS ET ÉTATS
  const { user } = useAuthStore();
  const textareaRef = useRef(null);
  
  // États généraux - STABLES
  const [activeTab, setActiveTab] = useState('details');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  // 🔥 ÉTATS COMMENTAIRES STABLES - PAS DE RE-RENDER
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // États dérivés
  const isAssignedToMe = task?.assignedUsers?.includes(currentUserId || user?.uid);
  
  if (!isOpen || !task) return null;

  // 🔥 FONCTION CHARGEMENT COMMENTAIRES OPTIMISÉE
  const loadComments = useCallback(async () => {
    if (!task?.id) {
      setLoadingComments(false);
      return;
    }

    try {
      console.log('💬 [MODAL] Chargement commentaires pour:', task.id);
      setLoadingComments(true);
      setCommentsError(null);

      // Query Firebase directe et simple
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entityType', '==', 'task'),
        where('entityId', '==', task.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(commentsQuery);
      const commentsData = [];
      
      snapshot.forEach(doc => {
        commentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setComments(commentsData);
      console.log('✅ [MODAL] Commentaires chargés:', commentsData.length);

    } catch (error) {
      console.error('❌ [MODAL] Erreur chargement commentaires:', error);
      setCommentsError('Erreur lors du chargement des commentaires');
    } finally {
      setLoadingComments(false);
    }
  }, [task?.id]);

  // Charger les commentaires au montage
  useEffect(() => {
    if (isOpen && task?.id) {
      loadComments();
    }
  }, [isOpen, task?.id, loadComments]);

  // 🔥 FONCTION CHANGEMENT TEXTAREA - STABLE
  const handleCommentChange = useCallback((e) => {
    setNewComment(e.target.value);
  }, []);

  // 🔥 FONCTION ENVOI COMMENTAIRE CORRIGÉE
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();

    if (!newComment.trim() || submittingComment || !user?.uid) {
      return;
    }

    console.log('📤 [MODAL] Envoi commentaire...');
    setSubmittingComment(true);
    setCommentsError(null);

    try {
      // 📝 DONNÉES DU COMMENTAIRE NORMALISÉES
      const commentData = {
        entityType: 'task',
        entityId: task.id,
        userId: user.uid,
        content: newComment.trim(),
        userName: user.displayName || user.email || 'Utilisateur',
        userEmail: user.email || '',
        createdAt: serverTimestamp()
      };

      console.log('📝 [MODAL] Données commentaire:', commentData);

      // 🔥 ENVOI DIRECT À FIREBASE
      const docRef = await addDoc(collection(db, 'comments'), commentData);

      console.log('✅ [MODAL] Commentaire envoyé:', docRef.id);
      
      // Reset du formulaire
      setNewComment('');
      
      // Recharger les commentaires
      await loadComments();
      
      // Notification succès
      if (window.showNotification) {
        window.showNotification('Commentaire ajouté !', 'success');
      }

    } catch (error) {
      console.error('❌ [MODAL] Erreur envoi commentaire:', error);
      setCommentsError(`Impossible d'envoyer le commentaire: ${error.message}`);
      
      // Notification erreur
      if (window.showNotification) {
        window.showNotification('Erreur envoi commentaire', 'error');
      }
    } finally {
      setSubmittingComment(false);
    }
  }, [newComment, submittingComment, user, task?.id, loadComments]);

  // Charger les utilisateurs assignés
  useEffect(() => {
    const loadAssignedUsers = async () => {
      if (!task?.assignedUsers?.length) {
        setAssignedUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const users = [];
        for (const userId of task.assignedUsers) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            users.push({ id: userId, ...userDoc.data() });
          }
        }
        setAssignedUsers(users);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      loadAssignedUsers();
    }
  }, [task, isOpen]);

  // 🗑️ FONCTION SUPPRESSION CORRIGÉE
  const handleDelete = useCallback(async () => {
    if (!task?.id || !user?.uid) {
      if (window.showNotification) {
        window.showNotification('Impossible de supprimer : données manquantes', 'error');
      }
      return;
    }

    // Vérifications de permissions
    const isTaskOwner = task.createdBy === user.uid;
    const isAssigned = Array.isArray(task.assignedTo) ? 
      task.assignedTo.includes(user.uid) : 
      task.assignedTo === user.uid;

    if (!isTaskOwner && !isAssigned) {
      if (window.showNotification) {
        window.showNotification('Vous n\'avez pas les permissions pour supprimer cette tâche', 'error');
      }
      return;
    }

    // Confirmation
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement la tâche "${task.title}" ?\n\nCette action est irréversible.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🗑️ [MODAL] Suppression tâche:', task.id);

      // Suppression directe Firebase
      const taskRef = doc(db, 'tasks', task.id);
      await deleteDoc(taskRef);

      console.log('✅ [MODAL] Tâche supprimée avec succès');
      
      // Notification succès
      if (window.showNotification) {
        window.showNotification('Tâche supprimée avec succès', 'success');
      }

      // Fermer la modal
      onClose();

      // Callback parent si fourni
      if (onDelete) {
        onDelete(task.id);
      }

    } catch (error) {
      console.error('❌ [MODAL] Erreur suppression tâche:', error);
      
      let errorMessage = 'Erreur lors de la suppression de la tâche';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Vous n\'avez pas les permissions pour supprimer cette tâche';
      } else if (error.code === 'not-found') {
        errorMessage = 'La tâche n\'existe plus';
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      if (window.showNotification) {
        window.showNotification(errorMessage, 'error');
      }
    }
  }, [task, user, onClose, onDelete]);

  // 🎨 COMPOSANT SECTION COMMENTAIRES OPTIMISÉ
  const CommentsSection = React.memo(() => (
    <div className="p-6 space-y-4">
      {/* Header avec compteur */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
          Commentaires
          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            {comments.length}
          </span>
        </h3>
        
        {loadingComments && (
          <div className="flex items-center text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2"></div>
            Synchronisation...
          </div>
        )}
      </div>

      {/* Erreur */}
      {commentsError && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {commentsError}
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
            <p className="text-gray-600 text-xs mt-1">Soyez le premier à commenter cette tâche !</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              {/* En-tête du commentaire */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">
                    {comment.userName || 'Utilisateur'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {comment.createdAt ? formatDate(comment.createdAt) : 'À l\'instant'}
                  </div>
                </div>
              </div>

              {/* Contenu du commentaire */}
              <div className="text-gray-300 text-sm leading-relaxed">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 FORMULAIRE COMMENTAIRE CORRIGÉ - PAS DE RE-RENDER */}
      {user && (
        <div className="mt-4">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                {/* 🔥 TEXTAREA AVEC REF - PLUS DE PERTE DE FOCUS */}
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Ajouter un commentaire..."
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border-0"
                  rows={3}
                  disabled={submittingComment}
                  style={{
                    minHeight: '60px',
                    maxHeight: '120px'
                  }}
                />
                
                {/* Bouton d'envoi */}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {submittingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Commenter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Message si non connecté */}
      {!user && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* Header de la modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
              <p className="text-gray-400 text-sm">Détails de la tâche</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Détails
          </button>
          
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Commentaires ({comments.length})
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-[60vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6">
              {/* Description */}
              {task.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Informations de la tâche */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Créé par */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Créé par</div>
                    <div className="text-white font-medium">
                      {task.createdBy ? 'Utilisateur' : 'Système'}
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className="flex items-center gap-3">
                  <Flag className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Statut</div>
                    <div className="text-white font-medium capitalize">
                      {task.status || 'En attente'}
                    </div>
                  </div>
                </div>

                {/* Date de création */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Créé le</div>
                    <div className="text-white font-medium">
                      {task.createdAt ? formatDate(task.createdAt) : 'Date inconnue'}
                    </div>
                  </div>
                </div>

                {/* Récompense XP */}
                {task.xpReward && (
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-sm text-gray-400">Récompense</div>
                      <div className="text-yellow-400 font-medium">
                        +{task.xpReward} XP
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Utilisateurs assignés */}
              {assignedUsers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Assigné à</h3>
                  <div className="space-y-2">
                    {assignedUsers.map(assignedUser => (
                      <div key={assignedUser.id} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {assignedUser.displayName ? assignedUser.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {assignedUser.displayName || assignedUser.email || 'Utilisateur'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {assignedUser.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && <CommentsSection />}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-3">
              {/* Bouton volontariat */}
              {!isAssignedToMe && (
                <button
                  onClick={handleVolunteer}
                  disabled={volunteerLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {volunteerLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Se porter volontaire
                    </>
                  )}
                </button>
              )}

              {/* Bouton désassignation */}
              {isAssignedToMe && (
                <button
                  onClick={handleVolunteer}
                  disabled={volunteerLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {volunteerLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Se désassigner
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Actions propriétaire */}
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}

              {/* BOUTON SUPPRESSION CORRIGÉ */}
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
