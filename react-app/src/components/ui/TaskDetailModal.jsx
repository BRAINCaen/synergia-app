// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - CORRECTION BOUTON SOUMETTRE
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

  // 🔄 Charger les noms d'utilisateurs
  useEffect(() => {
    const loadUserNames = async () => {
      if (!task) return;

      try {
        setLoadingUsers(true);

        // Nom du créateur
        if (task.createdBy) {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();
            setCreatorName(creatorData.displayName || creatorData.name || creatorData.email || 'Utilisateur anonyme');
          } else {
            setCreatorName('Utilisateur introuvable');
          }
        }

        // Noms des assignés
        if (task.assignedTo && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return userData.displayName || userData.name || userData.email || 'Utilisateur anonyme';
            }
            return 'Utilisateur introuvable';
          });

          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        }

      } catch (error) {
        console.error('❌ Erreur chargement noms:', error);
        setCreatorName('Erreur de chargement');
        setAssigneeNames([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUserNames();
  }, [task]);

  // 💬 Charger les commentaires
  useEffect(() => {
    if (!task?.id || activeTab !== 'comments') return;

    setLoadingComments(true);
    
    const commentsQuery = query(
      collection(db, 'task_comments'),
      where('taskId', '==', task.id)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Trier par date de création
      commentsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      });
      
      setComments(commentsData);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [task?.id, activeTab]);

  // 💬 Soumettre un commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !effectiveUser || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      
      await addDoc(collection(db, 'task_comments'), {
        taskId: task.id,
        userId: effectiveUser.uid,
        userName: effectiveUser.displayName || effectiveUser.email,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      setNewComment('');
    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              
              {/* Badges de statut */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'validation_pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status === 'completed' ? '✅ Terminée' :
                   task.status === 'in_progress' ? '⚡ En cours' :
                   task.status === 'validation_pending' ? '⏰ En validation' :
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
                              <div className="space-y-1">
                                {assigneeNames.map((name, index) => (
                                  <div key={index} className="text-white font-medium">
                                    {name}
                                    {task.assignedTo[index] === effectiveUser?.uid && (
                                      <span className="text-blue-400 text-xs ml-2">(vous)</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">Aucun assigné</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(!task.assignedTo || task.assignedTo.length === 0) && (
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-500">Tâche non assignée</span>
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
                    <div>
                      <span className="text-gray-400">Créée:</span>
                      <span className="text-white ml-2">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.updatedAt && (
                      <div>
                        <span className="text-gray-400">Modifiée:</span>
                        <span className="text-white ml-2">{formatDate(task.updatedAt)}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div>
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
                            <span className="font-medium text-white">{comment.userName || 'Utilisateur anonyme'}</span>
                            <span className="text-gray-400 text-xs">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire d'ajout de commentaire */}
              <div className="border-t border-gray-700 pt-4">
                {effectiveUser && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {effectiveUser.displayName?.charAt(0)?.toUpperCase() || effectiveUser.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      
                      <form onSubmit={handleSubmitComment} className="flex-1">
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="3"
                          />
                          <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
              {/* ✅ BOUTON SOUMETTRE - UNIQUEMENT SI ASSIGNÉ À MOI */}
              {isAssignedToMe && onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
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
