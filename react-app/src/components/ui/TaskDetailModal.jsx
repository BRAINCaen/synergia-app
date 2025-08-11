// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - FIX FINAL COULEURS + COMMENTAIRES
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
  const [error, setError] = useState('');

  // 🔄 CHARGER LES COMMENTAIRES AVEC FIREBASE - VERSION SIMPLIFIÉE
  const loadComments = async () => {
    if (!task?.id) return;
    
    try {
      setLoadingComments(true);
      
      console.log('📖 [TASK_COMMENTS] Chargement pour tâche:', task.id);
      
      // 📖 CHARGEMENT DIRECT SANS SERVICE DÉFAILLANT
      const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
      const { db } = await import('../../core/firebase.js');
      
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entityType', '==', 'task'),
        where('entityId', '==', task.id),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(commentsQuery);
      const commentsData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        commentsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        });
      });
      
      setComments(commentsData);
      console.log('📖 [TASK_COMMENTS] Chargés:', commentsData.length);
      
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur chargement:', error);
      setError('Impossible de charger les commentaires');
      setComments([]); // Valeur par défaut en cas d'erreur
    } finally {
      setLoadingComments(false);
    }
  };

  // 📤 AJOUTER UN COMMENTAIRE AVEC FIREBASE - VERSION CORRIGÉE
  const addComment = async () => {
    if (!newComment.trim() || !effectiveUser || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      setError('');
      
      console.log('📤 [TASK_COMMENTS] Envoi commentaire pour tâche:', task.id);
      
      // 📝 MÉTHODE SIMPLE SANS TRANSACTION
      const commentToAdd = {
        entityType: 'task',
        entityId: task.id,
        userId: effectiveUser.uid,
        userName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
        userEmail: effectiveUser.email || '',
        content: newComment.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('📝 [TASK_COMMENTS] Données commentaire:', commentToAdd);
      
      // 🚀 AJOUT DIRECT SANS UTILISER LE SERVICE DÉFAILLANT
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('../../core/firebase.js');
      
      const docRef = await addDoc(collection(db, 'comments'), commentToAdd);
      
      console.log('✅ [TASK_COMMENTS] Commentaire sauvegardé:', docRef.id);
      
      // Ajouter localement pour feedback immédiat
      const newCommentLocal = {
        id: docRef.id,
        ...commentToAdd
      };
      
      setComments(prev => [...prev, newCommentLocal]);
      
      // Réinitialiser le champ
      setNewComment('');
      
      // 🔔 ÉMETTRE ÉVÉNEMENT GLOBAL POUR METTRE À JOUR LES BADGES
      window.dispatchEvent(new CustomEvent('commentAdded', {
        detail: { taskId: task.id, commentCount: comments.length + 1 }
      }));
      
      console.log('✅ [TASK_COMMENTS] Commentaire ajouté avec succès + événement émis');
      
    } catch (error) {
      console.error('❌ [TASK_COMMENTS] Erreur ajout commentaire:', error);
      setError(`Impossible d'envoyer le commentaire: ${error.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Résoudre les noms des utilisateurs
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

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Priorité :</span>
                      <span className="font-medium text-gray-200">{task.priority}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Catégorie :</span>
                      <span className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded text-xs font-medium border border-purple-600">
                        {task.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Durée estimée :</span>
                      <span className="flex items-center font-medium text-gray-200">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {task.estimatedHours}h
                      </span>
                    </div>
                  </div>
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
                            <span className="font-medium text-white">{comment.userName || 'Utilisateur'}</span>
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
                  <div className="mt-4">
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
                          onClick={addComment}
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
