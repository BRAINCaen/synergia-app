// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE COMPLET - IMPORTS CORRIGÉS
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
 * 📅 FORMATAGE DATE FRANÇAIS - FONCTION LOCALE
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
  currentUser,
  onEdit, 
  onDelete,
  onSubmit,
  onTaskUpdate,
  initialTab = 'details'
}) => {
  const { user: authUser } = useAuthStore();
  const effectiveUser = currentUser || authUser;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  // ✅ VÉRIFICATIONS D'ASSIGNATION
  const isAssignedToMe = effectiveUser && task && Array.isArray(task.assignedTo) 
    ? task.assignedTo.includes(effectiveUser.uid)
    : false;

  // 🔄 CHARGER LES INFOS UTILISATEURS
  const loadUserInfo = useCallback(async () => {
    if (!task || !isOpen) return;
    
    try {
      setLoadingUsers(true);
      
      // Charger créateur
      if (task.createdBy) {
        const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
        if (creatorDoc.exists()) {
          const creatorData = creatorDoc.data();
          setCreatorName(`${creatorData.firstName || ''} ${creatorData.lastName || ''}`.trim() || creatorData.email || 'Utilisateur');
        }
      }
      
      // Charger assignés
      if (task.assignedTo && task.assignedTo.length > 0) {
        const assigneePromises = task.assignedTo.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Utilisateur';
          }
          return 'Utilisateur inconnu';
        });
        const names = await Promise.all(assigneePromises);
        setAssigneeNames(names);
      }
      
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [task, isOpen]);

  // 🔄 CHARGER LES COMMENTAIRES
  const loadComments = useCallback(async () => {
    if (!task?.id || !isOpen || activeTab !== 'comments') return;
    
    try {
      setLoadingComments(true);
      console.log('💬 [MODAL] Chargement commentaires pour:', task.id);
      
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
    } finally {
      setLoadingComments(false);
    }
  }, [task?.id, isOpen, activeTab]);

  // 🔥 CHARGEMENT INITIAL COMMENTAIRES
  useEffect(() => {
    if (isOpen && task?.id && activeTab === 'comments') {
      loadComments();
    }
  }, [loadComments]);

  // 🔥 CHARGEMENT INITIAL UTILISATEURS
  useEffect(() => {
    if (isOpen && task) {
      loadUserInfo();
    }
  }, [loadUserInfo]);

  // 🔥 FONCTION AJOUT COMMENTAIRE CORRIGÉE
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !task?.id || !effectiveUser?.uid || submittingComment) {
      return;
    }

    try {
      console.log('💬 [MODAL] Ajout commentaire...');
      setSubmittingComment(true);
      
      const commentData = {
        entityType: 'task',
        entityId: task.id,
        content: newComment.trim(),
        authorId: effectiveUser.uid,
        authorName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
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
    } finally {
      setSubmittingComment(false);
    }
  }, [newComment, task?.id, effectiveUser, submittingComment, loadComments]);

  // 🎯 SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!effectiveUser?.uid || volunteerLoading) return;
    
    setVolunteerLoading(true);
    try {
      // Ajouter l'utilisateur aux volontaires
      const taskRef = doc(db, 'tasks', task.id);
      const currentVolunteers = task.volunteers || [];
      
      if (!currentVolunteers.includes(effectiveUser.uid)) {
        await updateDoc(taskRef, {
          volunteers: [...currentVolunteers, effectiveUser.uid],
          updatedAt: serverTimestamp()
        });
        
        if (onTaskUpdate) {
          onTaskUpdate();
        }
        
        console.log('✅ Volontariat enregistré');
      }
    } catch (error) {
      console.error('Erreur volontariat:', error);
    } finally {
      setVolunteerLoading(false);
    }
  };

  // 📋 COMPOSANT SECTION COMMENTAIRES
  const CommentsSection = () => (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
          Commentaires
          {!loadingComments && (
            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {comments.length}
            </span>
          )}
        </h3>
        
        {loadingComments && (
          <div className="flex items-center text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2"></div>
            Synchronisation...
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun commentaire pour l'instant</p>
            <p className="text-sm">Soyez le premier à commenter cette tâche</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              {/* En-tête du commentaire */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
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
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {effectiveUser && (
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire à cette tâche..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={submittingComment}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                {comments.length > 0 ? '🟢 Synchronisé en temps réel' : '💬 Premier commentaire'}
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {submittingComment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Message si non connecté */}
      {!effectiveUser && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
    </div>
  );

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
        
        {/* 🎨 Header avec onglets */}
        <div className="bg-gray-800 p-6 rounded-t-xl border-b border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-500' : 
                  task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                } text-white`}>
                  {task.status === 'completed' ? 'Terminée' : 
                   task.status === 'in_progress' ? 'En cours' : 'En attente'}
                </span>
                {task.priority && (
                  <span className={`font-medium ${
                    task.priority === 'high' ? 'text-red-400' : 
                    task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    Priorité {task.priority === 'high' ? 'haute' : task.priority === 'medium' ? 'moyenne' : 'faible'}
                  </span>
                )}
                {task.rewards && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {task.rewards} pts
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-gray-600">
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
                            <div className="ml-2">
                              {assigneeNames.map((name, index) => (
                                <div key={index} className="text-white font-medium">
                                  {name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
                        <span className="text-yellow-400">Aucune assignation</span>
                      </div>
                    )}
                    
                    {isAssignedToMe && (
                      <div className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-green-400 font-medium">Vous êtes assigné</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 📊 Informations complémentaires */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Statut */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                  <Flag className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-400 mb-1">Statut</div>
                  <div className="text-sm text-white font-medium">
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
            </div>
          )}

          {/* 💬 Onglet Commentaires */}
          {activeTab === 'comments' && <CommentsSection />}
        </div>

        {/* Footer d'actions */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            
            {/* Actions conditionnelles */}
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(task)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
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
            
            {task.status === 'open' && effectiveUser && !isAssignedToMe && (
              <button
                onClick={handleVolunteer}
                disabled={volunteerLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {volunteerLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Se porter volontaire
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
