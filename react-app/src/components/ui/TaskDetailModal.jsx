// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE COMPLÈTE - COMMENTAIRES FIREBASE SYNCHRONISÉS
// ==========================================

import React, { useState, useEffect } from 'react';
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
  serverTimestamp, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🔥 IMPORT SERVICE COMMENTAIRES UNIFIÉ
import { firebaseCommentsService } from '../../core/services/firebaseCommentsService.js';

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
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE
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
  
  // États généraux
  const [activeTab, setActiveTab] = useState('details');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  // 🔥 ÉTATS COMMENTAIRES CORRIGÉS
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // États dérivés
  const isAssignedToMe = task?.assignedUsers?.includes(currentUserId || user?.uid);
  
  if (!isOpen || !task) return null;

  // 🔥 EFFET POUR CHARGER LES COMMENTAIRES (CORRIGÉ)
  useEffect(() => {
    let unsubscribe = null;

    const setupComments = async () => {
      if (!task?.id) {
        setLoadingComments(false);
        return;
      }

      try {
        console.log('💬 [MODAL] Setup commentaires pour tâche:', task.id);
        setLoadingComments(true);
        setCommentsError(null);

        // 📖 CHARGER LES COMMENTAIRES EXISTANTS
        const existingComments = await firebaseCommentsService.getComments('task', task.id);
        setComments(existingComments);
        console.log('📖 [MODAL] Commentaires chargés:', existingComments.length);

        // 📡 SETUP LISTENER TEMPS RÉEL
        unsubscribe = firebaseCommentsService.subscribeToComments(
          'task',
          task.id,
          (updatedComments) => {
            console.log('📡 [MODAL] Mise à jour temps réel:', updatedComments.length);
            setComments(updatedComments);
            setLoadingComments(false);
          }
        );

      } catch (error) {
        console.error('❌ [MODAL] Erreur setup commentaires:', error);
        setCommentsError('Impossible de charger les commentaires');
        setLoadingComments(false);
      }
    };

    setupComments();

    // 🧹 NETTOYAGE
    return () => {
      if (unsubscribe) {
        console.log('🛑 [MODAL] Nettoyage listener commentaires');
        unsubscribe();
      }
    };
  }, [task?.id]);

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

  // 🔥 FONCTION ENVOI COMMENTAIRE (CORRIGÉE)
  const handleSubmitComment = async (e) => {
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
        // Champs de compatibilité
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Utilisateur',
        authorEmail: user.email || ''
      };

      console.log('📝 [MODAL] Données commentaire:', commentData);

      // 🔥 ENVOI VIA LE SERVICE UNIFIÉ
      const result = await firebaseCommentsService.addComment(commentData);

      if (result.success) {
        console.log('✅ [MODAL] Commentaire envoyé:', result.id);
        setNewComment('');
        
        // Notification succès
        if (window.showNotification) {
          window.showNotification('Commentaire ajouté !', 'success');
        }
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
  };

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
  };

  // 🎨 COMPOSANT SECTION COMMENTAIRES (CORRIGÉ)
  const CommentsSection = () => (
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
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'À l\'instant'}
                  </div>
                </div>
              </div>

              {/* Contenu du commentaire */}
              <div className="text-gray-300 text-sm leading-relaxed">
                {comment.content}
              </div>

              {/* Indicateur d'édition */}
              {comment.isEdited && (
                <div className="text-gray-500 text-xs mt-2 italic">
                  Modifié
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={submittingComment}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingComment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
      )}

      {/* Message si pas connecté */}
      {!user && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connectez-vous pour ajouter un commentaire</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'in_progress' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              <h2 className="text-xl font-bold text-white pr-8">
                {task.title}
              </h2>
              {task.priority && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  task.priority === 'high' ? 'bg-red-800/50 text-red-300' :
                  task.priority === 'medium' ? 'bg-yellow-800/50 text-yellow-300' :
                  'bg-green-800/50 text-green-300'
                }`}>
                  {task.priority === 'high' ? 'Haute' :
                   task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 mr-2 inline" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2 inline" />
              Commentaires ({comments.length})
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="max-h-96 overflow-y-auto">
            
            {/* 📋 Onglet Détails */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <FileText className="w-5 h-5 mr-2 text-blue-400" />
                      Description
                    </h3>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                    </div>
                  </div>
                )}

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Dates et temps */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Dates importantes
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      {task.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Échéance :</span>
                          <span className="text-white">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créée le :</span>
                        <span className="text-white">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Terminée le :</span>
                          <span className="text-green-400">{formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignation */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Assignation ({assignedUsers.length})
                    </h4>
                    
                    <div className="space-y-2">
                      {loadingUsers ? (
                        <div className="text-gray-500 text-sm">Chargement...</div>
                      ) : assignedUsers.length > 0 ? (
                        assignedUsers.map(assignedUser => (
                          <div key={assignedUser.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {assignedUser.displayName?.charAt(0) || 'U'}
                            </div>
                            <span className="text-white">{assignedUser.displayName || assignedUser.email}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">Aucune assignation</div>
                      )}
                    </div>

                    {/* Bouton volontariat */}
                    {user && (
                      <button
                        onClick={handleVolunteer}
                        disabled={volunteerLoading}
                        className={`w-full mt-3 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          isAssignedToMe
                            ? 'border-red-600 text-red-400 hover:bg-red-900/20'
                            : 'border-green-600 text-green-400 hover:bg-green-900/20'
                        } disabled:opacity-50`}
                      >
                        {volunteerLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Traitement...
                          </div>
                        ) : isAssignedToMe ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-2 inline" />
                            Se désassigner
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2 inline" />
                            Se porter volontaire
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Catégories et tags */}
                {(task.category || task.tags?.length > 0) && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center mb-3">
                      <Tag className="w-4 h-4 mr-2" />
                      Classification
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {task.category && (
                        <span className="px-2 py-1 bg-purple-800/50 text-purple-300 text-xs rounded border border-purple-600">
                          {task.category}
                        </span>
                      )}
                      {task.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pièces jointes */}
                {task.attachments?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <Paperclip className="w-5 h-5 mr-2 text-blue-400" />
                      Pièces jointes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {task.attachments.map((attachment, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{attachment.name}</div>
                            <div className="text-sm text-gray-400">{attachment.size}</div>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-white">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {task.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                      <FileText className="w-5 h-5 mr-2 text-blue-400" />
                      Notes
                    </h3>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-gray-300 whitespace-pre-wrap">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 💬 Onglet Commentaires */}
            {activeTab === 'comments' && <CommentsSection />}
          </div>

          {/* Footer d'actions */}
          {showActions && (
            <div className="bg-gray-900 border-t border-gray-700 p-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                )}
                
                {isAssignedToMe && task.status !== 'completed' && onSubmit && (
                  <button
                    onClick={() => onSubmit(task.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme terminé
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(task.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
