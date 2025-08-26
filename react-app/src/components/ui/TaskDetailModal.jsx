// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE COMPLET - TOUTES INFORMATIONS RESTAURÉES
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
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE - RESTAURÉ
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
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  // 🔥 ÉTATS COMMENTAIRES STABLES - PAS DE RE-RENDER
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  // États dérivés
  const effectiveUserId = currentUserId || user?.uid;
  const isAssignedToMe = task?.assignedTo?.includes(effectiveUserId) || 
                         task?.assignedUsers?.includes(effectiveUserId);
  
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
        const commentData = { id: doc.id, ...doc.data() };
        commentsData.push(commentData);
      });

      console.log('💬 [MODAL] Commentaires chargés:', commentsData.length);
      setComments(commentsData);
      
    } catch (error) {
      console.error('💥 [MODAL] Erreur chargement commentaires:', error);
      setCommentsError('Erreur lors du chargement des commentaires');
    } finally {
      setLoadingComments(false);
    }
  }, [task?.id]);

  // 🔥 CHARGEMENT INITIAL COMMENTAIRES
  useEffect(() => {
    if (isOpen && task?.id && activeTab === 'comments') {
      loadComments();
    }
  }, [isOpen, task?.id, activeTab, loadComments]);

  // 🔥 FONCTION AJOUT COMMENTAIRE CORRIGÉE
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !task?.id || !user?.uid || submittingComment) {
      return;
    }

    try {
      console.log('💬 [MODAL] Ajout commentaire...');
      setSubmittingComment(true);
      
      const commentData = {
        entityType: 'task',
        entityId: task.id,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Utilisateur',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'comments'), commentData);
      
      console.log('✅ [MODAL] Commentaire ajouté avec succès');
      setNewComment(''); // Vider le textarea
      
      // Actualiser immédiatement les commentaires
      setTimeout(() => {
        loadComments();
      }, 500);
      
    } catch (error) {
      console.error('💥 [MODAL] Erreur ajout commentaire:', error);
      setCommentsError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  }, [newComment, task?.id, user?.uid, user?.displayName, user?.email, submittingComment, loadComments]);

  // Chargement des noms d'utilisateurs
  useEffect(() => {
    const loadUserNames = async () => {
      setLoadingUsers(true);
      
      try {
        // Nom du créateur
        if (task.createdBy) {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();
            setCreatorName(creatorData.displayName || creatorData.email || 'Utilisateur');
          } else {
            setCreatorName('Utilisateur introuvable');
          }
        }

        // Noms des assignés
        if (task.assignedTo && task.assignedTo.length > 0) {
          const assigneeNamesArray = [];
          for (const userId of task.assignedTo) {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                assigneeNamesArray.push({
                  id: userId,
                  name: userData.displayName || userData.email || 'Utilisateur',
                  email: userData.email
                });
              }
            } catch (error) {
              console.warn('Erreur chargement utilisateur:', userId, error);
            }
          }
          setAssigneeNames(assigneeNamesArray);
        }
        
      } catch (error) {
        console.error('Erreur chargement noms utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      loadUserNames();
    }
  }, [isOpen, task]);

  // Gérer le volontariat
  const handleVolunteer = async () => {
    if (!effectiveUserId) return;
    
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

  // 🎨 COMPOSANT SECTION COMMENTAIRES
  const CommentsSection = () => (
    <div className="p-6 space-y-4">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submittingComment}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || submittingComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submittingComment ? 'Envoi...' : 'Commenter'}
          </button>
        </div>
      </form>

      {/* Erreur */}
      {commentsError && (
        <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
          {commentsError}
        </div>
      )}

      {/* Liste des commentaires */}
      {loadingComments ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-400">Chargement des commentaires...</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center p-8 text-gray-400">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucun commentaire pour cette tâche
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm">
                      {comment.authorName || 'Utilisateur'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 🎨 RENDU PRINCIPAL
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700">
        
        {/* 🎯 Header avec titre et actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              {task.category === 'urgent' && <AlertCircle className="w-5 h-5 text-white" />}
              {task.category === 'important' && <Star className="w-5 h-5 text-white" />}
              {task.category === 'routine' && <Target className="w-5 h-5 text-white" />}
              {!task.category && <FileText className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' 
                    ? 'bg-red-900/50 text-red-300 border border-red-600' :
                  task.priority === 'medium' 
                    ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' :
                    'bg-green-900/50 text-green-300 border border-green-600'
                }`}>
                  {task.priority === 'high' ? 'Haute' : 
                   task.priority === 'medium' ? 'Moyenne' : 'Faible'} priorité
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' 
                    ? 'bg-green-900/50 text-green-300 border border-green-600' :
                  task.status === 'in_progress' 
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-600' :
                    'bg-gray-700 text-gray-300 border border-gray-600'
                }`}>
                  {task.status === 'completed' ? 'Terminée' :
                   task.status === 'in_progress' ? 'En cours' : 'En attente'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions header */}
          <div className="flex items-center gap-2">
            {showActions && onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {showActions && onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 📋 Onglets navigation */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
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
        </div>

        {/* 📄 Contenu principal */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* 📝 Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Description
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>
              )}

              {/* 👥 Informations d'assignation et créateur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Informations créateur */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Créateur</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400">Créé par:</span>
                      {loadingUsers ? (
                        <span className="ml-2 text-gray-300">Chargement...</span>
                      ) : (
                        <span className="ml-2 text-white font-medium">{creatorName}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400">Date:</span>
                      <span className="ml-2 text-white font-medium">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations assignation */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Assignation</h4>
                  </div>
                  <div className="space-y-2">
                    {task.assignedTo && task.assignedTo.length > 0 ? (
                      <div className="flex items-start text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <span className="text-gray-400">Assigné à:</span>
                          {loadingUsers ? (
                            <span className="ml-2 text-gray-300">Chargement...</span>
                          ) : (
                            <div className="mt-1 space-y-1">
                              {assigneeNames.map((assignee, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-white font-medium text-sm">
                                    {assignee.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Pas encore assigné
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 📊 Informations techniques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Statut */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                  <Flag className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-400 mb-1">Statut</div>
                  <div className="text-sm text-white font-medium capitalize">
                    {task.status === 'completed' ? 'Terminée' :
                     task.status === 'in_progress' ? 'En cours' : 'En attente'}
                  </div>
                </div>

                {/* Priorité */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                  <Target className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-400 mb-1">Priorité</div>
                  <div className="text-sm text-white font-medium">
                    {task.priority === 'high' ? 'Haute' : 
                     task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                  </div>
                </div>

                {/* Catégorie */}
                {task.category && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                    <Tag className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400 mb-1">Catégorie</div>
                    <div className="text-sm text-white font-medium capitalize">
                      {task.category}
                    </div>
                  </div>
                )}

                {/* Date limite */}
                {task.dueDate && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                    <Clock className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400 mb-1">Date limite</div>
                    <div className="text-sm text-white font-medium">
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                )}
              </div>

              {/* 🏆 Récompenses */}
              {task.rewards && task.rewards > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-medium text-white">Récompenses</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">+{task.rewards}</span>
                    <span className="text-yellow-200">points XP</span>
                  </div>
                </div>
              )}

              {/* 📎 Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
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

              {/* 📝 Notes */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Notes
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {task.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* 🌍 Localisation */}
              {task.location && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                    Localisation
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300">{task.location}</p>
                  </div>
                </div>
              )}

              {/* 🔄 Récurrence */}
              {task.recurrence && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Repeat className="w-5 h-5 mr-2 text-blue-400" />
                    Récurrence
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 capitalize">{task.recurrence}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💬 Onglet Commentaires */}
          {activeTab === 'comments' && <CommentsSection />}
        </div>

        {/* 🎬 Footer d'actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex justify-between items-center">
            
            {/* Actions à gauche */}
            <div className="flex items-center gap-3">
              {/* Bouton se porter volontaire - FONCTIONNEL */}
              {showActions && onAssignToMe && onUnassignFromMe && task.status !== 'completed' && (
                <button
                  onClick={handleVolunteer}
                  disabled={volunteerLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isAssignedToMe
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {volunteerLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      {isAssignedToMe ? 'Retrait...' : 'Assignation...'}
                    </>
                  ) : isAssignedToMe ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Se désister
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Se porter volontaire
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
              
              {/* Marquer terminé */}
              {showActions && isAssignedToMe && task.status !== 'completed' && onSubmit && (
                <button
                  onClick={() => onSubmit(task.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer terminé
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
