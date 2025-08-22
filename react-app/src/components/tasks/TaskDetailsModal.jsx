// ==========================================
// 📁 react-app/src/components/tasks/TaskDetailsModal.jsx
// MODAL DÉTAILS TÂCHE - CORRECTION COMPLÈTE FINALE
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
  initialTab = 'details' // Ajout pour supporter l'ouverture directe sur commentaires
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

  const isCreator = effectiveUser && task && task.createdBy === effectiveUser.uid;

  // 🔐 PERMISSIONS
  const canEdit = isCreator || isAssignedToMe;
  const canDelete = isCreator;
  const canSubmit = isAssignedToMe && task.status !== 'completed' && task.status !== 'validation_pending';

  // 👥 CHARGEMENT DES NOMS D'UTILISATEURS
  useEffect(() => {
    const loadUserNames = async () => {
      if (!task) return;
      
      setLoadingUsers(true);
      try {
        // Créateur
        if (task.createdBy) {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const userData = creatorDoc.data();
            setCreatorName(`${userData.firstName} ${userData.lastName}`);
          }
        }

        // Assignés
        if (task.assignedTo && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: userId,
                name: `${userData.firstName} ${userData.lastName}`,
                role: userData.role || 'Membre'
              };
            }
            return { id: userId, name: 'Utilisateur inconnu', role: 'Inconnu' };
          });

          const assignees = await Promise.all(assigneePromises);
          setAssigneeNames(assignees);
        }
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      loadUserNames();
    }
  }, [isOpen, task]);

  // 💬 CHARGEMENT DES COMMENTAIRES
  useEffect(() => {
    const loadComments = async () => {
      if (!task?.id || activeTab !== 'comments') return;
      
      setLoadingComments(true);
      try {
        console.log('🔄 Chargement commentaires pour tâche:', task.id);
        const taskComments = await collaborationService.getComments('task', task.id);
        console.log('✅ Commentaires chargés:', taskComments?.length || 0);
        setComments(taskComments || []);
      } catch (error) {
        console.error('❌ Erreur chargement commentaires:', error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    if (isOpen && task?.id) {
      loadComments();
    }
  }, [isOpen, task?.id, activeTab]);

  // 📝 ENVOI D'UN NOUVEAU COMMENTAIRE
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !effectiveUser || !task?.id) return;
    
    setSubmittingComment(true);
    try {
      console.log('📝 Envoi commentaire:', { taskId: task.id, content: newComment.trim() });
      
      await collaborationService.addComment('task', task.id, {
        content: newComment.trim(),
        authorId: effectiveUser.uid,
        authorName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`,
        timestamp: new Date()
      });
      
      console.log('✅ Commentaire envoyé avec succès');
      
      // Recharger les commentaires
      const updatedComments = await collaborationService.getComments('task', task.id);
      setComments(updatedComments || []);
      setNewComment('');
      
      // Notification optionnelle
      if (onTaskUpdate) {
        onTaskUpdate(task.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur envoi commentaire:', error);
      alert('Erreur lors de l\'envoi du commentaire. Veuillez réessayer.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 🚫 GESTION FERMETURE
  const handleClose = () => {
    setActiveTab('details');
    setComments([]);
    setNewComment('');
    onClose();
  };

  // 🎯 SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!effectiveUser || !task?.id || volunteerLoading) return;

    setVolunteerLoading(true);
    try {
      await taskAssignmentService.addVolunteer(task.id, effectiveUser.uid);
      
      // Recharger la tâche pour avoir les données à jour
      if (onTaskUpdate) {
        onTaskUpdate(task.id);
      }
      
      console.log('✅ Volontariat ajouté avec succès');
    } catch (error) {
      console.error('❌ Erreur ajout volontaire:', error);
      alert('Erreur lors de l\'ajout du volontaire');
    } finally {
      setVolunteerLoading(false);
    }
  };

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
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'urgent' ? '🔴 Urgente' :
                     task.priority === 'high' ? '🟠 Haute' :
                     task.priority === 'medium' ? '🟡 Moyenne' :
                     '🟢 Basse'}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-gray-900 border-b border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 mr-6 ${
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
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Messages ({comments.length})
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* 📋 Onglet Détails */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Description
                </h3>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {task.description || 'Aucune description fournie.'}
                  </p>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignation */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Assignation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Créé par</p>
                        <p className="text-white">{loadingUsers ? 'Chargement...' : creatorName}</p>
                      </div>
                    </div>
                    
                    {assigneeNames.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Assigné à</p>
                          <div className="space-y-1">
                            {assigneeNames.map((assignee) => (
                              <div key={assignee.id} className="flex items-center gap-2">
                                <span className="text-white">{assignee.name}</span>
                                <span className="text-xs text-gray-500">({assignee.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bouton se porter volontaire */}
                    {!isAssignedToMe && effectiveUser && (
                      <button
                        onClick={handleVolunteer}
                        disabled={volunteerLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {volunteerLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Ajout...
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

                {/* Dates et délais */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    Dates
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Créée le</p>
                        <p className="text-white">{formatDate(task.createdAt)}</p>
                      </div>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Échéance</p>
                          <p className="text-white">{formatDate(task.dueDate)}</p>
                        </div>
                      </div>
                    )}

                    {task.estimatedTime && (
                      <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-400">Temps estimé</p>
                          <p className="text-white">{task.estimatedTime}h</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gamification */}
                {(task.xpReward || task.difficulty) && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Récompenses
                    </h3>
                    <div className="space-y-3">
                      {task.xpReward && (
                        <div className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Points d'expérience</p>
                            <p className="text-yellow-400 font-medium">+{task.xpReward} XP</p>
                          </div>
                        </div>
                      )}
                      
                      {task.difficulty && (
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Difficulté</p>
                            <p className="text-white">
                              {task.difficulty === 'easy' ? '🟢 Facile' :
                               task.difficulty === 'medium' ? '🟡 Moyenne' :
                               task.difficulty === 'hard' ? '🟠 Difficile' :
                               '🔴 Expert'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Localisation */}
                {task.location && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-400" />
                      Localisation
                    </h3>
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                      <p className="text-gray-300">{task.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Métadonnées supplémentaires */}
              <div className="space-y-4">
                {/* Récurrence */}
                {task.isRecurring && (
                  <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Repeat className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-medium text-white">Tâche récurrente</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {task.recurrence?.frequency && (
                        <div>
                          <p className="text-gray-400">Fréquence</p>
                          <p className="text-purple-300 font-medium">{task.recurrence.frequency}</p>
                        </div>
                      )}
                      {task.recurrence?.interval && (
                        <div>
                          <p className="text-gray-400">Intervalle</p>
                          <p className="text-purple-300 font-medium">Tous les {task.recurrence.interval} jour(s)</p>
                        </div>
                      )}
                      {task.recurrence?.endDate && (
                        <div>
                          <p className="text-gray-400">Fin de récurrence</p>
                          <p className="text-purple-300 font-medium">{formatDate(task.recurrence.endDate)}</p>
                        </div>
                      )}
                      {task.isRecurring && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Repeat className="w-4 h-4" />
                          <span className="font-medium">Tâche récurrente</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-800/30 text-purple-300 border border-purple-600 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gray-400" />
                    Pièces jointes
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 flex-1">{attachment.name}</span>
                        <button className="p-1 hover:bg-gray-700 rounded text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💬 Onglet Commentaires/Messages */}
          {activeTab === 'comments' && (
            <div className="p-6">
              
              {/* En-tête section commentaires */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Messages de collaboration
                </h3>
                <span className="text-sm text-gray-400">
                  {comments.length} message{comments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Liste des commentaires */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {loadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-400">Chargement des messages...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun message pour cette tâche.</p>
                    <p className="text-sm">Soyez le premier à laisser un commentaire!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <div key={comment.id || index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                              {comment.authorName || 'Utilisateur anonyme'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {comment.timestamp ? formatDate(comment.timestamp) : 'Date inconnue'}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire nouveau commentaire */}
              <div className="border-t border-gray-700 pt-4">
                {effectiveUser ? (
                  <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Ajouter un message</h4>
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                      <div>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Votre message..."
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                          rows={3}
                          disabled={submittingComment}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submittingComment}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Connectez-vous pour ajouter un commentaire
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Dernière modification : {formatDate(task.updatedAt || task.createdAt)}
            </div>
            
            <div className="flex gap-3">
              {/* ✅ BOUTON SOUMETTRE - UNIQUEMENT SI ASSIGNÉ À MOI */}
              {isAssignedToMe && onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
                <button
                  onClick={() => {
                    onSubmit(task);
                    handleClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Soumettre
                </button>
              )}

              {/* Modifier */}
              {canEdit && onEdit && (
                <button
                  onClick={() => {
                    onEdit(task);
                    handleClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
              
              {/* Supprimer */}
              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                      onDelete(task);
                      handleClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
              
              {/* Fermer */}
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
