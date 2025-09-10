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

// Firebase
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../core/firebase';

// Services
import { taskService } from '../../core/services/taskService';
import { taskAssignmentService } from '../../core/services/taskAssignmentService';
import { userService } from '../../core/services/userService';

// Stores
import { useAuthStore } from '../../shared/stores/authStore';

// Utils
import { formatDate } from '../../shared/utils/helpers';
import dateUtils from '../../shared/utils/dateUtils';

/**
 * ✨ COMPOSANT TEXTAREA ISOLÉ - SANS RE-RENDER
 * La clé est d'isoler complètement le textarea dans son propre composant
 */
const IsolatedTextarea = ({ onSubmit, disabled }) => {
  // État complètement isolé
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  
  // Gestionnaire de changement stable
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    console.log('📝 [TEXTAREA] Changement détecté:', newValue.length, 'caractères');
    setValue(newValue);
  }, []);
  
  // Gestionnaire de soumission stable
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue && onSubmit) {
      console.log('📤 [TEXTAREA] Envoi commentaire:', trimmedValue);
      onSubmit(trimmedValue);
      setValue(''); // Vider après envoi
    }
  }, [value, onSubmit]);
  
  // Gestionnaire touche Entrée
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  }, [handleSubmit]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre commentaire ici... (Ctrl+Entrée pour envoyer)"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
          rows={3}
          disabled={disabled}
          style={{ minHeight: '80px' }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {value.length}/1000
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs">
          💡 Ctrl+Entrée pour envoyer rapidement
        </span>
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          {disabled ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
};

/**
 * 💬 COMPOSANT COMMENTAIRE INTÉGRÉ - SOLUTION DÉFINITIVE
 */
const IntegratedCommentComponent = ({ entityType = 'task', entityId }) => {
  const { user } = useAuthStore();
  
  // États locaux isolés
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref pour gérer l'abonnement temps réel
  const unsubscribeRef = useRef(null);
  
  // Formatage date simple
  const formatCommentDate = useCallback((timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      let date;
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return 'Date invalide';
    }
  }, []);
  
  // Charger les commentaires avec écoute temps réel
  useEffect(() => {
    if (!entityId) {
      setComments([]);
      setLoading(false);
      return;
    }
    
    console.log('💬 [COMMENTS] Initialisation pour:', entityType, entityId);
    setLoading(true);
    setError(null);
    
    try {
      // Requête Firestore avec écoute temps réel
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entityType', '==', entityType),
        where('entityId', '==', entityId),
        orderBy('createdAt', 'desc')
      );
      
      // Abonnement temps réel
      unsubscribeRef.current = onSnapshot(commentsQuery, 
        (snapshot) => {
          const commentsData = [];
          snapshot.forEach((doc) => {
            commentsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log('💬 [COMMENTS] Données reçues:', commentsData.length, 'commentaires');
          setComments(commentsData);
          setLoading(false);
        },
        (error) => {
          console.error('❌ [COMMENTS] Erreur écoute:', error);
          setError('Erreur lors du chargement des commentaires');
          setLoading(false);
        }
      );
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur initialisation:', error);
      setError('Erreur lors de l\'initialisation');
      setLoading(false);
    }
    
    // Nettoyage à la désactivation
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 [COMMENTS] Nettoyage abonnement');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [entityType, entityId]);
  
  // Ajouter un commentaire
  const handleAddComment = useCallback(async (content) => {
    if (!user?.uid || !entityId || submitting) {
      console.warn('❌ [COMMENTS] Conditions non remplies pour ajout');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('📤 [COMMENTS] Ajout commentaire...');
      
      const commentData = {
        entityType,
        entityId,
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Utilisateur',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'comments'), commentData);
      console.log('✅ [COMMENTS] Commentaire ajouté avec succès');
      
    } catch (error) {
      console.error('❌ [COMMENTS] Erreur ajout:', error);
      setError('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  }, [user, entityType, entityId, submitting]);
  
  // Affichage du loading
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Chargement des commentaires...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-4">
      {/* Formulaire d'ajout - EN PREMIER pour la visibilité */}
      {user ? (
        <IsolatedTextarea 
          onSubmit={handleAddComment}
          disabled={submitting}
        />
      ) : (
        <div className="text-center py-4 text-gray-400 text-sm border border-gray-600 rounded-lg">
          Connectez-vous pour ajouter un commentaire
        </div>
      )}
      
      {/* Erreur */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun commentaire pour l'instant</p>
            <p className="text-sm">Soyez le premier à commenter !</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
              {/* En-tête du commentaire */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {comment.authorName || 'Utilisateur'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatCommentDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Contenu du commentaire */}
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Indicateur de frappe en cours */}
      {submitting && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-blue-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Envoi du commentaire...
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  // 💬 ÉTATS COMMENTAIRES - SIMPLIFIÉS CAR GÉRÉS PAR LE COMPOSANT UNIFIÉ
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  
  // 📌 REF POUR ÉVITER LES RE-RENDERS
  const mountedRef = useRef(true);
  
  // 🔄 NETTOYAGE À LA FERMETURE
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
                  Commentaires (temps réel)
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

              {activeTab === 'comments' && (
                <IntegratedCommentComponent 
                  entityType="task" 
                  entityId={task.id}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsModal;
