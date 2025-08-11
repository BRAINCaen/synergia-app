// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - FIX FINAL COULEURS + COMMENTAIRES
// FICHIER COMPLET AVEC CORRECTION BADGE NOTIFICATION
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
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  // 🔄 CHARGEMENT DES INFORMATIONS UTILISATEURS
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!task || !task.createdBy) {
        setLoadingUsers(false);
        return;
      }

      try {
        setLoadingUsers(true);

        // Charger le créateur
        const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
        if (creatorDoc.exists()) {
          const creatorData = creatorDoc.data();
          setCreatorName(creatorData.displayName || creatorData.name || creatorData.email || 'Utilisateur anonyme');
        } else {
          setCreatorName('Utilisateur anonyme');
        }

        // Charger les assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.displayName || userData.name || userData.email || 'Utilisateur anonyme';
              }
              return 'Utilisateur anonyme';
            } catch (error) {
              console.warn('Erreur chargement utilisateur:', userId, error);
              return 'Utilisateur anonyme';
            }
          });

          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        } else {
          setAssigneeNames([]);
        }

      } catch (error) {
        console.error('Erreur chargement informations utilisateurs:', error);
        setCreatorName('Erreur de chargement');
        setAssigneeNames([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      loadUserInfo();
    }
  }, [isOpen, task]);

  // 💬 CHARGEMENT TEMPS RÉEL DES COMMENTAIRES AVEC FIREBASE DIRECT
  useEffect(() => {
    if (!isOpen || !task?.id) {
      setComments([]);
      setLoadingComments(false);
      return;
    }

    console.log('💬 [TASK_DETAIL_MODAL] Chargement commentaires pour tâche:', task.id);
    setLoadingComments(true);
    setError('');

    // ✅ ÉCOUTE TEMPS RÉEL FIREBASE DIRECT
    const commentsQuery = query(
      collection(db, 'comments'),
      where('entityType', '==', 'task'),
      where('entityId', '==', task.id)
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier par date
        commentsList.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return aTime - bTime;
        });

        console.log('💬 [TASK_DETAIL_MODAL] Commentaires reçus:', commentsList.length);
        setComments(commentsList);
        setLoadingComments(false);
      },
      (error) => {
        console.error('❌ [TASK_DETAIL_MODAL] Erreur écoute commentaires:', error);
        setError('Impossible de charger les commentaires');
        setComments([]);
        setLoadingComments(false);
      }
    );

    return () => {
      console.log('💬 [TASK_DETAIL_MODAL] Nettoyage listener commentaires');
      unsubscribe();
    };
  }, [isOpen, task?.id]);

  // 📤 ENVOI DE COMMENTAIRE
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment?.trim() || submittingComment || !effectiveUser?.uid) {
      return;
    }

    console.log('📤 [TASK_DETAIL_MODAL] Envoi commentaire:', newComment.trim());
    
    setSubmittingComment(true);
    setError('');
    
    try {
      // 📝 AJOUT COMMENTAIRE AVEC FIREBASE DIRECT
      const commentData = {
        entityType: 'task',
        entityId: task.id,
        userId: effectiveUser.uid,
        userName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
        userEmail: effectiveUser.email || '',
        content: newComment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('📝 [TASK_DETAIL_MODAL] Données commentaire:', commentData);
      
      // 🚀 AJOUT DIRECT À FIREBASE
      await addDoc(collection(db, 'comments'), commentData);
      
      console.log('✅ [TASK_DETAIL_MODAL] Commentaire ajouté avec succès');
      
      // Réinitialiser le champ
      setNewComment('');
      
      // Le listener temps réel va automatiquement mettre à jour la liste
      
    } catch (error) {
      console.error('❌ [TASK_DETAIL_MODAL] Erreur envoi commentaire:', error);
      setError(`Impossible d'envoyer le commentaire: ${error.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 🚫 Ne pas afficher si pas ouvert ou pas de tâche
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] border border-gray-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                {task.title}
              </h2>
              
              {/* Badges de statut et priorité */}
              <div className="flex gap-2 flex-wrap">
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
                  task.priority === 'high' ? 'bg-red-800/50 text-red-300 border-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
                  'bg-green-800/50 text-green-300 border-green-600'
                }`}>
                  {task.priority === 'high' ? 'Haute' :
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
            Messages ({loadingComments ? '...' : comments.length})
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
                              assigneeNames.map((name, index) => (
                                <span key={index} className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-xs">Non assignée</span>
                            )}
                          </div>
                        </div>
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
                      <span className="font-medium text-blue-400">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Modifiée :</span>
                        <span className="font-medium text-blue-400">{formatDate(task.updatedAt)}</span>
                      </div>
                    )}
                    {task.deadline && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Échéance :</span>
                        <span className={`font-medium ${
                          new Date(task.deadline) < new Date() ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {formatDate(task.deadline)}
                        </span>
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

                {/* Récompenses */}
                {(task.xpReward || task.coinsReward) && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <h4 className="font-medium text-white">Récompenses</h4>
                    </div>
                    <div className="space-y-2">
                      {task.xpReward && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 font-medium">+{task.xpReward} XP</span>
                        </div>
                      )}
                      {task.coinsReward && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-900">$</span>
                          </div>
                          <span className="text-yellow-300 font-medium">+{task.coinsReward} coins</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Difficulté */}
                {task.difficulty && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <h4 className="font-medium text-white">Difficulté</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                        task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        task.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {task.difficulty === 'easy' ? 'Facile' :
                         task.difficulty === 'medium' ? 'Moyenne' :
                         task.difficulty === 'hard' ? 'Difficile' :
                         'Expert'}
                      </span>
                    </div>
                  </div>
                )}
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
            </div>
          )}

          {/* 💬 Onglet Commentaires avec FIREBASE */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <div className="space-y-4">
                
                {/* Message d'erreur */}
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
                
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
                            {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{comment.userName || 'Utilisateur'}</p>
                            <p className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulaire d'ajout de commentaire */}
                {effectiveUser && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                      <form onSubmit={handleSubmitComment}>
                        <div className="mb-3">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 p-3 resize-none focus:outline-none focus:border-blue-500 text-sm"
                            rows="3"
                            disabled={submittingComment}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            Commentaire en tant que {effectiveUser.displayName || effectiveUser.email}
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
                      </form>
                    </div>
                  </div>
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
