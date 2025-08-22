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
  Info
} from 'lucide-react';

// Imports Firebase
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🚨 IMPORT COLLABORATION SERVICE POUR COMMENTAIRES
import { collaborationService } from '../../core/services/collaborationService.js';

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

  const isCreatedByMe = effectiveUser && task && task.createdBy === effectiveUser.uid;

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
      if (!task?.id) return;
      
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
  }, [isOpen, task?.id]);

  // 📝 ENVOI D'UN NOUVEAU COMMENTAIRE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !effectiveUser || !task?.id) return;
    
    setIsSubmittingComment(true);
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
      setIsSubmittingComment(false);
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
              onClick={onClose}
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
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-2"></div>
                      ) : (
                        <span className="text-white ml-2 font-medium">{creatorName}</span>
                      )}
                    </div>

                    {/* Assignés */}
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div className="flex items-start text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <span className="text-gray-400">Assigné à:</span>
                          <div className="mt-1">
                            {loadingUsers ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : assigneeNames.length > 0 ? (
                              assigneeNames.map((assignee) => (
                                <div key={assignee.id} className="flex items-center justify-between text-white">
                                  <span className="font-medium">{assignee.name}</span>
                                  <span className="text-xs text-gray-400">({assignee.role})</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400">Aucun assigné</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates et délais */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Dates</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-400">Créée:</span>
                      <span className="text-white ml-2">{formatDate(task.createdAt)}</span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-400">Échéance:</span>
                        <span className="text-white ml-2">{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Tag className="w-5 h-5 mr-2 text-blue-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💬 Onglet Commentaires */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {loadingComments ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-2">Chargement des commentaires...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun commentaire pour le moment</p>
                    <p className="text-sm">Soyez le premier à commenter !</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                              {comment.userName || comment.authorName || 'Utilisateur anonyme'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.createdAt || comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire d'ajout de commentaire */}
              {effectiveUser && (
                <form onSubmit={handleSubmitComment} className="border-t border-gray-700 pt-4">
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
                        {comments.length > 0 ? `${comments.length} commentaire${comments.length > 1 ? 's' : ''}` : 'Premier commentaire'}
                      </span>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Soumettre
                </button>
              )}

              {/* Modifier */}
              {onEdit && isCreatedByMe && (
                <button
                  onClick={() => {
                    onEdit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
              
              {/* Supprimer */}
              {onDelete && isCreatedByMe && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                      onDelete(task.id);
                      onClose();
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
                onClick={onClose}
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
