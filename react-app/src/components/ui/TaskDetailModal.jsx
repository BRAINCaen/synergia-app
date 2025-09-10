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
import { formatDate } from '../../shared/utils/helpers';
import dateUtils from '../../shared/utils/dateUtils';

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
  // 📊 ÉTATS LOCAUX - STABLES POUR ÉVITER RE-RENDERS
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // 👤 UTILISATEUR EFFECTIF (pour compatibilité)
  const effectiveUser = currentUser || (typeof window !== 'undefined' && window.currentUser);
  
  // 💬 ÉTATS COMMENTAIRES - ISOLÉS POUR ÉVITER RE-RENDERS
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // 🎯 ÉTATS VOLONTARIAT
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  
  // 📌 REF POUR LE TEXTAREA - CRUCIAL POUR MAINTENIR LE FOCUS
  const textareaRef = useRef(null);
  
  // 📝 ÉTAT DU COMMENTAIRE ISOLÉ - PAS DE DÉPENDANCES
  const [commentText, setCommentText] = useState('');
  
  // 🔄 CHARGER LES COMMENTAIRES - MÉMORISÉ AVEC DEPS MINIMALES
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

  // 📤 GESTIONNAIRE CHANGEMENT TEXTAREA - ISOLÉ
  const handleCommentChange = useCallback((e) => {
    console.log('📝 [TEXTAREA] Changement:', e.target.value);
    setCommentText(e.target.value);
  }, []);

  // 📤 ENVOYER UN COMMENTAIRE - OPTIMISÉ SANS DÉPENDANCES INUTILES
  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    
    const trimmedComment = commentText.trim();
    if (!trimmedComment || submittingComment || !effectiveUser?.uid) {
      console.log('❌ [TASK_MODAL] Conditions non remplies pour envoi commentaire');
      return;
    }

    console.log('📤 [TASK_MODAL] Envoi commentaire pour tâche:', task.id);
    
    setSubmittingComment(true);
    
    try {
      await collaborationService.addComment('task', task.id, {
        content: trimmedComment,
        authorId: effectiveUser.uid,
        authorName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`.trim() || effectiveUser.email || 'Utilisateur',
        timestamp: new Date()
      });
      
      // Vider le champ immédiatement
      setCommentText('');
      
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
  }, [commentText, submittingComment, effectiveUser, task?.id, loadComments]);

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

  // 🚫 FERMETURE ET NETTOYAGE
  const handleClose = useCallback(() => {
    setActiveTab('details');
    setCommentText('');
    setComments([]);
    setError(null);
    onClose();
  }, [onClose]);

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
      timeFromNow: task.dueDate ? `Échéance dans ${Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} jours` : null
    };
  }, [task]);

  // 📋 COMPOSANT SECTION COMMENTAIRES - SUPPRIMÉ CAR REMPLACÉ PAR UnifiedCommentComponent

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
