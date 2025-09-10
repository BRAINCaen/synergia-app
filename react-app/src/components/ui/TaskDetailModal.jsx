import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  Trophy, 
  MessageCircle, 
  Send, 
  Clock, 
  Target,
  Tag,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit,
  Trash2,
  UserPlus,
  Eye
} from 'lucide-react';

// Services
import { taskService } from '../../core/services/taskService';
import { taskAssignmentService } from '../../core/services/taskAssignmentService';
import { collaborationService } from '../../core/services/collaborationService';
import { userService } from '../../core/services/userService';

// Utils
import { formatDate, formatDistanceToNow } from '../../shared/utils/dateUtils';

/**
 * 📋 MODAL DÉTAILS DE TÂCHE - VERSION CORRIGÉE COMMENTAIRES
 */
export const TaskDetailsModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit,
  currentUser,
  onTaskUpdate
}) => {
  // 📊 ÉTATS LOCAUX
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // 👤 UTILISATEUR EFFECTIF (pour compatibilité)
  const effectiveUser = currentUser || (typeof window !== 'undefined' && window.currentUser);
  
  // 💬 ÉTATS COMMENTAIRES
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // 🎯 ÉTATS VOLONTARIAT
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  
  // 📌 REF POUR LE TEXTAREA
  const textareaRef = useRef(null);
  
  // 🔄 CHARGER LES COMMENTAIRES - MÉMORISÉ POUR ÉVITER RE-RENDERS
  const loadComments = useCallback(async () => {
    if (!task?.id || !isOpen || activeTab !== 'comments') return;
    
    try {
      setLoadingComments(true);
      console.log('💬 [TASK_MODAL] Chargement commentaires pour:', task.id);
      
      const commentsData = await collaborationService.getComments('task', task.id);
      console.log('✅ [TASK_MODAL] Commentaires chargés:', commentsData.length);
      
      setComments(commentsData || []);
      
    } catch (error) {
      console.error('❌ [TASK_MODAL] Erreur chargement commentaires:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [task?.id, isOpen, activeTab]);

  // 🔄 EFFET CHARGEMENT COMMENTAIRES
  useEffect(() => {
    if (isOpen && task?.id && activeTab === 'comments') {
      loadComments();
    }
  }, [loadComments]);

  // 📤 ENVOYER UN COMMENTAIRE - OPTIMISÉ POUR ÉVITER RE-RENDERS
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    
    const commentValue = newComment.trim();
    if (!commentValue || submittingComment || !effectiveUser?.uid) {
      return;
    }

    console.log('📤 [TASK_MODAL] Envoi commentaire pour tâche:', task.id);
    
    setSubmittingComment(true);
    
    try {
      await collaborationService.addComment('task', task.id, {
        content: commentValue,
        authorId: effectiveUser.uid,
        authorName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`.trim() || effectiveUser.email || 'Utilisateur',
        timestamp: new Date()
      });
      
      // Vider le champ immédiatement
      setNewComment('');
      
      // Recharger les commentaires après un court délai
      setTimeout(() => {
        loadComments();
      }, 300);
      
      console.log('✅ [TASK_MODAL] Commentaire envoyé avec succès');
      
    } catch (error) {
      console.error('❌ [TASK_MODAL] Erreur envoi commentaire:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  }, [newComment, submittingComment, effectiveUser, task?.id, loadComments]);

  // 🎯 SE PORTER VOLONTAIRE
  const handleVolunteer = useCallback(async () => {
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
  }, [effectiveUser?.uid, volunteerLoading, task?.id, onTaskUpdate]);

  // 📋 COMPOSANT SECTION COMMENTAIRES - MÉMORISÉ
  const CommentsSection = useMemo(() => {
    return (
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
                ref={textareaRef}
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
  }, [comments, loadingComments, newComment, submittingComment, effectiveUser, handleSubmitComment]);

  // 🎨 DONNÉES FORMATÉES MÉMORISÉES
  const formattedData = useMemo(() => {
    if (!task) return {};
    
    return {
      priorityColor: task.priority === 'haute' ? 'text-red-400' : 
                    task.priority === 'moyenne' ? 'text-yellow-400' : 'text-green-400',
      statusBadge: task.status === 'completed' ? 'bg-green-500' :
                   task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500',
      statusText: task.status === 'completed' ? 'Terminée' :
                  task.status === 'in_progress' ? 'En cours' : 'En attente',
      formattedDate: task.dueDate ? formatDate(task.dueDate) : 'Aucune',
      timeFromNow: task.dueDate ? formatDistanceToNow(task.dueDate) : null
    };
  }, [task]);

  // 🚫 FERMETURE ET NETTOYAGE
  const handleClose = useCallback(() => {
    setActiveTab('details');
    setNewComment('');
    setComments([]);
    setError(null);
    onClose();
  }, [onClose]);

  // 📱 RENDU CONDITIONNEL
  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* En-tête */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white mb-2">{task.title}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${formattedData.statusBadge} text-white`}>
                      {formattedData.statusText}
                    </span>
                    <span className={`${formattedData.priorityColor} font-medium`}>
                      Priorité {task.priority}
                    </span>
                    {task.points > 0 && (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {task.points} pts
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Onglets */}
              <div className="flex gap-1 mt-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'details' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Détails
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'comments' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2 inline" />
                  Commentaires ({comments.length})
                </button>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'details' && (
                <div className="p-6 space-y-6">
                  
                  {/* Description */}
                  {task.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-400" />
                        Description
                      </h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Informations détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Date d'échéance */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                        Échéance
                      </h4>
                      <div className="text-gray-300">
                        <p>{formattedData.formattedDate}</p>
                        {formattedData.timeFromNow && (
                          <p className="text-sm text-gray-500">{formattedData.timeFromNow}</p>
                        )}
                      </div>
                    </div>

                    {/* Catégorie */}
                    {task.category && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-blue-400" />
                          Catégorie
                        </h4>
                        <p className="text-gray-300">{task.category}</p>
                      </div>
                    )}

                    {/* Lieu */}
                    {task.location && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                          Lieu
                        </h4>
                        <p className="text-gray-300">{task.location}</p>
                      </div>
                    )}

                    {/* Rôle Synergia */}
                    {task.synergiaRole && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-400" />
                          Rôle Synergia
                        </h4>
                        <p className="text-gray-300">{task.synergiaRole}</p>
                      </div>
                    )}

                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(task)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    )}
                    
                    {onSubmit && effectiveUser && task.status !== 'completed' && (
                      <button
                        onClick={() => onSubmit(task)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Soumettre
                      </button>
                    )}
                    
                    {task.status === 'open' && effectiveUser && (
                      <button
                        onClick={handleVolunteer}
                        disabled={volunteerLoading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {volunteerLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Se porter volontaire
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={() => onDelete(task)}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && CommentsSection}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsModal;
