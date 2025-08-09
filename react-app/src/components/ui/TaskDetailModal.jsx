// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// CORRECTION ERREURS BUILD - IMPORT ET JSX
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

// ✅ CORRECTION: Import Firebase depuis le bon chemin
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// ✅ CORRECTION: Import authStore depuis le bon chemin  
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE SANS DONNÉES DÉMO
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
  // ✅ CORRECTION: Utiliser le hook authStore si currentUser pas fourni
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

  // ✅ CHARGER LES COMMENTAIRES RÉELS (SANS DONNÉES DÉMO)
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

  // ✅ AJOUTER UN COMMENTAIRE RÉEL
  const addComment = async () => {
    if (!newComment.trim() || !effectiveUser) return;
    
    try {
      setSubmittingComment(true);
      
      // Pour l'instant, ajouter localement en attendant l'implémentation Firebase
      const comment = {
        id: Date.now().toString(),
        userId: effectiveUser.uid,
        userName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
        message: newComment.trim(),
        createdAt: new Date()
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // ✅ RÉSOUDRE LES NOMS DES UTILISATEURS RÉELS AVEC FIREBASE
  useEffect(() => {
    const resolveUserNames = async () => {
      if (!task) return;
      
      setLoadingUsers(true);
      
      try {
        // Résoudre le créateur
        if (task.createdBy) {
          try {
            const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
            if (creatorDoc.exists()) {
              const creatorData = creatorDoc.data();
              setCreatorName(creatorData.displayName || creatorData.email || 'Utilisateur');
            } else {
              setCreatorName('Utilisateur introuvable');
            }
          } catch (error) {
            console.error('❌ Erreur récupération créateur:', error);
            setCreatorName('Erreur chargement');
          }
        }
        
        // Résoudre les assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.displayName || userData.email || 'Utilisateur';
              } else {
                return 'Utilisateur introuvable';
              }
            } catch (error) {
              console.error('❌ Erreur récupération assigné:', userId, error);
              return 'Erreur chargement';
            }
          });
          
          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        } else {
          setAssigneeNames([]);
        }
        
      } catch (error) {
        console.error('❌ Erreur résolution noms utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      resolveUserNames();
      loadComments();
    }
  }, [isOpen, task]);

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    
    try {
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

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    try {
      const now = new Date();
      const targetDate = date instanceof Date ? date : new Date(date);
      const diffMs = now - targetDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 60) {
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      } else {
        return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      }
    } catch (error) {
      return '';
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* En-tête */}
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  task.status === 'completed' ? 'bg-green-100' :
                  task.status === 'in_progress' ? 'bg-blue-100' :
                  task.status === 'validation_pending' ? 'bg-orange-100' :
                  'bg-gray-100'
                }`}>
                  {task.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                   task.status === 'in_progress' ? <Clock className="w-5 h-5 text-blue-600" /> :
                   task.status === 'validation_pending' ? <AlertCircle className="w-5 h-5 text-orange-600" /> :
                   <Clock className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'validation_pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'completed' ? 'Terminée' :
                       task.status === 'in_progress' ? 'En cours' :
                       task.status === 'validation_pending' ? 'En validation' :
                       'À faire'}
                    </span>
                    {task.priority && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Onglets */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Détails
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages ({comments.length})
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu avec onglets */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'details' && (
            <>
              {/* Description */}
              {task.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Colonne gauche */}
                <div className="space-y-4">
                  
                  {/* Assignation */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Assignation</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Créée par :</span>
                        <span className="ml-2 text-sm font-medium">
                          {loadingUsers ? (
                            <span className="inline-flex items-center gap-1">
                              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              Chargement...
                            </span>
                          ) : creatorName}
                        </span>
                      </div>
                      
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Assignée à :</span>
                          {loadingUsers ? (
                            <span className="ml-2 text-sm inline-flex items-center gap-1">
                              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              Chargement...
                            </span>
                          ) : (
                            <div className="mt-1 space-y-1">
                              {assigneeNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(!task.assignedTo || task.assignedTo.length === 0) && (
                        <div className="text-sm text-gray-500 italic">Non assignée</div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">Dates</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Créée :</span>
                        <span className="ml-2">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && (
                        <div>
                          <span className="text-gray-600">Modifiée :</span>
                          <span className="ml-2">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div>
                          <span className="text-gray-600">Échéance :</span>
                          <span className="ml-2">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  
                  {/* Caractéristiques */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Caractéristiques</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {task.difficulty && (
                        <div>
                          <span className="text-gray-600">Difficulté :</span>
                          <span className="ml-2 capitalize">{task.difficulty}</span>
                        </div>
                      )}
                      {task.xpReward && (
                        <div>
                          <span className="text-gray-600">Récompense :</span>
                          <span className="ml-2 text-yellow-600 font-medium">+{task.xpReward} XP</span>
                        </div>
                      )}
                      {task.role && (
                        <div>
                          <span className="text-gray-600">Rôle :</span>
                          <span className="ml-2 capitalize">{task.role}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-gray-900">Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 whitespace-pre-wrap">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* Informations système */}
              <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <div>ID: {task.id}</div>
                {task.projectId && <div>Projet: {task.projectId}</div>}
                <div>Version: {task.version || '1.0'}</div>
              </div>
            </>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Section commentaires */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Messages et commentaires
                </h3>
                
                {/* Liste des commentaires */}
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Chargement des messages...
                      </div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                {comment.userName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucun commentaire pour le moment</p>
                      <p className="text-xs mt-1">Soyez le premier à commenter cette tâche</p>
                    </div>
                  )}
                </div>

                {/* Zone d'ajout de commentaire */}
                {effectiveUser && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Ajouter un commentaire..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="3"
                          disabled={submittingComment}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={addComment}
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
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
