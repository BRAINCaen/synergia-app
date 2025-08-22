// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - CORRECTION COMPTEUR MESSAGES
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
  UserMinus
} from 'lucide-react';

// Imports Firebase
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🚨 IMPORT COLLABORATION SERVICE POUR COMMENTAIRES
import { collaborationService } from '../../core/services/collaborationService.js';

// Import authStore
import { useAuthStore } from '../../shared/stores/authStore.js';

// Import services
import { taskAssignmentService } from '../../core/services/taskAssignmentService.js';

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
  currentUser,
  onEdit, 
  onDelete,
  onSubmit,
  onTaskUpdate,
  initialTab = 'details'
}) => {
  // 🔐 Utilisateur et permissions
  const { user } = useAuthStore();
  const effectiveUser = currentUser || user;

  // 🎮 États de l'interface
  const [activeTab, setActiveTab] = useState(initialTab);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 👥 États pour les noms d'utilisateurs
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // ✅ VÉRIFICATIONS D'ASSIGNATION
  const isAssignedToMe = effectiveUser && task && Array.isArray(task.assignedTo) 
    ? task.assignedTo.includes(effectiveUser.uid)
    : false;

  const canEdit = effectiveUser && task && (
    task.createdBy === effectiveUser.uid ||
    isAssignedToMe ||
    effectiveUser.isAdmin ||
    effectiveUser.role === 'admin'
  );

  const canDelete = effectiveUser && task && (
    task.createdBy === effectiveUser.uid ||
    effectiveUser.isAdmin ||
    effectiveUser.role === 'admin'
  );

  // 🚀 CHARGEMENT INITIAL DES DONNÉES
  useEffect(() => {
    if (!isOpen || !task) return;

    const loadData = async () => {
      try {
        setLoadingUsers(true);
        
        // Charger le créateur
        if (task.createdBy) {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const creator = creatorDoc.data();
            setCreatorName(`${creator.firstName || ''} ${creator.lastName || ''}`.trim() || creator.email || 'Utilisateur');
          }
        }

        // Charger les assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Utilisateur';
              }
              return 'Utilisateur inconnu';
            } catch (error) {
              console.warn('Erreur chargement assigné:', userId, error);
              return 'Utilisateur inconnu';
            }
          });
          
          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        }

      } catch (error) {
        console.error('Erreur chargement données utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadData();
  }, [isOpen, task]);

  // 📡 GESTION TEMPS RÉEL DES COMMENTAIRES
  useEffect(() => {
    if (!task?.id) {
      setComments([]);
      return;
    }

    console.log('📡 [TASK_UI_MODAL] Configuration listener temps réel pour tâche:', task.id);
    setLoadingComments(true);

    // 🚨 LISTENER TEMPS RÉEL POUR MISE À JOUR AUTOMATIQUE DU COMPTEUR
    const unsubscribe = collaborationService.subscribeToComments(
      'task',
      task.id,
      (updatedComments) => {
        console.log('📡 [TASK_UI_MODAL] Commentaires mis à jour en temps réel:', updatedComments.length);
        setComments(updatedComments || []);
        setLoadingComments(false);
      }
    );

    // Nettoyage du listener
    return () => {
      if (unsubscribe) {
        console.log('🛑 [TASK_UI_MODAL] Nettoyage listener pour tâche:', task.id);
        unsubscribe();
      }
    };
  }, [task?.id]);

  // 📤 ENVOYER UN COMMENTAIRE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmittingComment || !effectiveUser?.uid) {
      return;
    }

    console.log('📤 [TASK_UI_MODAL] Envoi commentaire pour tâche:', task.id);
    
    setIsSubmittingComment(true);
    
    try {
      await collaborationService.addComment('task', task.id, {
        content: newComment.trim(),
        authorId: effectiveUser.uid,
        authorName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`.trim() || effectiveUser.email || 'Utilisateur',
        timestamp: new Date()
      });
      
      setNewComment('');
      console.log('✅ [TASK_UI_MODAL] Commentaire envoyé avec succès');
      
    } catch (error) {
      console.error('❌ [TASK_UI_MODAL] Erreur envoi commentaire:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 🎯 SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!effectiveUser?.uid || volunteerLoading) return;
    
    setVolunteerLoading(true);
    try {
      await taskAssignmentService.addVolunteer(task.id, effectiveUser.uid);
      
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
      if (window.showNotification) {
        window.showNotification('Vous vous êtes porté volontaire pour cette tâche !', 'success');
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
                  {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {comment.userName || 'Utilisateur'}
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
              disabled={isSubmittingComment}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                {comments.length > 0 ? '🟢 Synchronisé en temps réel' : '💬 Premier commentaire'}
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isSubmittingComment ? (
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

  // 🚫 NE PAS AFFICHER SI PAS OUVERT OU PAS DE TÂCHE
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* En-tête */}
        <div className="bg-gray-900 border-b border-gray-700 p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-800 text-green-300' :
                  task.status === 'in_progress' ? 'bg-blue-800 text-blue-300' :
                  task.status === 'validation_pending' ? 'bg-yellow-800 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {task.status === 'completed' ? '✅ Terminée' :
                   task.status === 'in_progress' ? '🔄 En cours' :
                   task.status === 'validation_pending' ? '⏳ En validation' :
                   '📋 À faire'}
                </span>
                
                {task.priority && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority === 'urgent' ? '🔥 Urgent' :
                     task.priority === 'high' ? '⚡ Élevée' :
                     task.priority === 'medium' ? '⚠️ Moyenne' :
                     '📋 Normale'}
                  </span>
                )}
                
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit && onEdit(task)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete && onDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-gray-900 border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Messages ({comments.length})
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[60vh] bg-gray-900">
          
          {/* 🔄 Onglet Détails */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Description
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Grille d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Assignation */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Assignation</h4>
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
                    
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div className="flex items-start text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <span className="text-gray-400">Assigné à:</span>
                          {loadingUsers ? (
                            <span className="ml-2 text-gray-300">Chargement...</span>
                          ) : (
                            <div className="ml-2">
                              {assigneeNames.map((name, index) => (
                                <div key={index} className="text-white font-medium">{name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(!task.assignedTo || task.assignedTo.length === 0) && !isAssignedToMe && effectiveUser && (
                      <button
                        onClick={handleVolunteer}
                        disabled={volunteerLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        {volunteerLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Chargement...
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
                </div>

                {/* Dates */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Dates</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400">Créée:</span>
                      <span className="ml-2 text-white">{formatDate(task.createdAt)}</span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Échéance:</span>
                        <span className="ml-2 text-white">{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    
                    {task.updatedAt && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Modifiée:</span>
                        <span className="ml-2 text-white">{formatDate(task.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priorité et estimation */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Détails</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {task.priority && (
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Priorité:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority === 'urgent' ? 'Urgent' :
                           task.priority === 'high' ? 'Élevée' :
                           task.priority === 'medium' ? 'Moyenne' :
                           'Normale'}
                        </span>
                      </div>
                    )}
                    
                    {task.estimatedDuration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Durée estimée:</span>
                        <span className="ml-2 text-white">{task.estimatedDuration}</span>
                      </div>
                    )}
                    
                    {task.difficulty && (
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Difficulté:</span>
                        <span className="ml-2 text-white capitalize">{task.difficulty}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pièces jointes */}
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
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            
            {isAssignedToMe && task.status !== 'completed' && onSubmit && (
              <button
                onClick={() => onSubmit(task.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Marquer comme terminé
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
