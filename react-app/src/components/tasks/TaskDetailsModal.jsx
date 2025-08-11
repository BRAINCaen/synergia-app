// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - THÈME SOMBRE CORRIGÉ
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// Import authStore
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 📅 FORMATAGE DATE SÉCURISÉ
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Date inconnue';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
  onTaskUpdate 
}) => {
  const { user: authUser } = useAuthStore();
  const effectiveUser = currentUser || authUser;

  const [activeTab, setActiveTab] = useState('details');
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Charger les commentaires
  const loadComments = async () => {
    if (!task?.id) return;
    
    try {
      setLoadingComments(true);
      
      // Pour l'instant, liste vide jusqu'à implémentation complète du système de commentaires
      setComments([]);
      
    } catch (error) {
      console.error('❌ Erreur chargement commentaires:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Charger les noms d'utilisateurs
  const loadUserNames = async () => {
    if (!task) return;
    
    try {
      setLoadingUsers(true);
      
      // Créateur
      if (task.createdBy) {
        try {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();
            setCreatorName(creatorData.displayName || creatorData.email || 'Utilisateur inconnu');
          } else {
            setCreatorName('Utilisateur inconnu');
          }
        } catch (error) {
          console.warn('Erreur chargement créateur:', error);
          setCreatorName('Erreur de chargement');
        }
      }

      // Assignés
      if (task.assignedTo && task.assignedTo.length > 0) {
        try {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return userData.displayName || userData.email || 'Utilisateur inconnu';
            }
            return 'Utilisateur inconnu';
          });
          
          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        } catch (error) {
          console.warn('Erreur chargement assignés:', error);
          setAssigneeNames(['Erreur de chargement']);
        }
      }
      
    } catch (error) {
      console.error('Erreur générale chargement utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && task) {
      loadUserNames();
      loadComments();
    }
  }, [isOpen, task?.id]);

  // Ajouter un commentaire
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || submittingComment || !effectiveUser) {
      return;
    }

    try {
      setSubmittingComment(true);
      
      // Simuler l'ajout (à implémenter avec Firebase)
      const comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        authorId: effectiveUser.uid,
        authorName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
        createdAt: new Date(),
        taskId: task.id
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'in_progress' ? 'bg-blue-500' :
                task.status === 'validation_pending' ? 'bg-orange-500' :
                'bg-gray-500'
              }`}></div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
            </div>
            
            {/* Status et priorité */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${
                task.status === 'completed' ? 'bg-green-800/50 text-green-300 border-green-600' :
                task.status === 'in_progress' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
                task.status === 'validation_pending' ? 'bg-orange-800/50 text-orange-300 border-orange-600' :
                'bg-gray-800/50 text-gray-300 border-gray-600'
              }`}>
                {task.status === 'completed' ? 'Terminée' :
                 task.status === 'in_progress' ? 'En cours' :
                 task.status === 'validation_pending' ? 'En validation' :
                 'En attente'}
              </span>
              
              <span className={`px-2 py-1 rounded text-xs font-medium border ${
                task.priority === 'urgent' ? 'bg-red-800/50 text-red-300 border-red-600' :
                task.priority === 'high' ? 'bg-orange-800/50 text-orange-300 border-orange-600' :
                task.priority === 'medium' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
                'bg-green-800/50 text-green-300 border-green-600'
              }`}>
                {task.priority === 'urgent' ? 'Urgente' :
                 task.priority === 'high' ? 'Haute' :
                 task.priority === 'medium' ? 'Moyenne' :
                 'Basse'}
              </span>
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
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
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
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Messages ({comments.length})
          </button>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[60vh] bg-gray-900">
          
          {/* Onglet Détails */}
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
                
                {/* Colonne gauche */}
                <div className="space-y-4">
                  
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
                          <span className="ml-2 text-sm inline-flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-gray-400">Chargement...</span>
                          </span>
                        ) : (
                          <span className="ml-2 font-medium text-gray-200">{creatorName}</span>
                        )}
                      </div>
                      
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div>
                          <div className="flex items-center text-sm mb-2">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-400">Assigné à:</span>
                          </div>
                          {loadingUsers ? (
                            <span className="ml-2 text-sm inline-flex items-center gap-1">
                              <div className="w-3 h-3 border border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                              <span className="text-gray-400">Chargement...</span>
                            </span>
                          ) : (
                            <div className="mt-2 space-y-1">
                              {assigneeNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded border border-gray-600">
                                  <User className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-medium text-gray-200">{name}</span>
                                </div>
                              ))}
                              <div className="text-xs text-gray-400 mt-1">
                                {assigneeNames.length} personne{assigneeNames.length > 1 ? 's' : ''} assignée{assigneeNames.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(!task.assignedTo || task.assignedTo.length === 0) && (
                        <div className="text-sm text-gray-400 italic bg-gray-800 px-3 py-2 rounded border border-gray-600">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Aucune assignation
                        </div>
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créée :</span>
                        <span className="font-medium text-gray-200">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Modifiée :</span>
                          <span className="font-medium text-gray-200">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Échéance :</span>
                          <span className="font-medium text-orange-400">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Terminée :</span>
                          <span className="font-medium text-green-400">{formatDate(task.completedAt)}</span>
                        </div>
                      )}
                      {task.submittedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Soumise :</span>
                          <span className="font-medium text-blue-400">{formatDate(task.submittedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  
                  {/* Caractéristiques */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Caractéristiques</h4>
                    </div>
                    <div className="space-y-3">
                      {task.difficulty && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Difficulté :</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            task.difficulty === 'easy' ? 'bg-green-800/50 text-green-300 border-green-600' :
                            task.difficulty === 'normal' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
                            task.difficulty === 'hard' ? 'bg-orange-800/50 text-orange-300 border-orange-600' :
                            task.difficulty === 'expert' ? 'bg-red-800/50 text-red-300 border-red-600' :
                            'bg-gray-800/50 text-gray-300 border-gray-600'
                          }`}>
                            {task.difficulty === 'easy' ? 'Facile' :
                             task.difficulty === 'normal' ? 'Normal' :
                             task.difficulty === 'hard' ? 'Difficile' :
                             task.difficulty === 'expert' ? 'Expert' :
                             task.difficulty}
                          </span>
                        </div>
                      )}

                      {task.xpReward && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Récompense :</span>
                          <span className="flex items-center font-medium text-yellow-400">
                            <Trophy className="w-4 h-4 mr-1" />
                            +{task.xpReward} XP
                          </span>
                        </div>
                      )}

                      {task.priority && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Priorité :</span>
                          <span className="font-medium text-gray-200">{task.priority}</span>
                        </div>
                      )}

                      {task.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Catégorie :</span>
                          <span className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded text-xs font-medium border border-purple-600">
                            {task.category}
                          </span>
                        </div>
                      )}

                      {task.estimatedHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Durée estimée :</span>
                          <span className="flex items-center font-medium text-gray-200">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {task.estimatedHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  {(task.projectId || task.openToVolunteers || task.isRecurring) && (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-400" />
                        <h4 className="font-medium text-white">Informations</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {task.projectId && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Projet:</span>
                            <span className="text-blue-400 font-medium">{task.projectId}</span>
                          </div>
                        )}
                        {task.openToVolunteers && (
                          <div className="flex items-center gap-2 text-green-400">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Ouvert aux volontaires</span>
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
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium border border-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Paperclip className="w-5 h-5 mr-2 text-blue-400" />
                    Pièces jointes ({task.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <Paperclip className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-300">{attachment.name || `Pièce jointe ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Commentaires */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <div className="space-y-4">
                
                {/* Liste des commentaires */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-400 text-sm">Chargement des commentaires...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
                      <p className="text-gray-600 text-xs mt-1">Soyez le premier à commenter cette tâche !</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-white">{comment.authorName}</span>
                            <div className="text-xs text-gray-400">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulaire d'ajout de commentaire */}
                {effectiveUser && (
                  <form onSubmit={handleAddComment} className="mt-4">
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
                          Connecté en tant que {effectiveUser.displayName || effectiveUser.email}
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
              {/* Soumettre pour validation */}
              {onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
                <button
                  onClick={() => {
                    onSubmit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Soumettre
                </button>
              )}

              {/* Modifier */}
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
              
              {/* Supprimer */}
              {onDelete && (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
