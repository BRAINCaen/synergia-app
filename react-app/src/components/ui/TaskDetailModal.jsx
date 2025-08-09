// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// CORRECTION DES PERMISSIONS POUR LES BOUTONS D'ACTIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Send, 
  MessageCircle,
  Clock,
  User,
  AlertTriangle,
  Star,
  Calendar,
  Target,
  Users
} from 'lucide-react';
import { useAuthStore } from '../../core/stores/authStore.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onEdit, 
  onDelete, 
  onSubmit,
  onComment 
}) => {
  // ✅ AJOUT DU STORE UTILISATEUR POUR VÉRIFICATIONS
  const { user } = useAuthStore();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [assigneeNames, setAssigneeNames] = useState([]);

  if (!isOpen || !task) return null;

  // 🛡️ LOGIQUE DE PERMISSIONS AJOUTÉE
  const isTaskCreator = user?.uid === task.createdBy;
  const isAssignedToTask = task.assignedTo?.includes(user?.uid);
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('tasks_admin');
  
  // 🔒 PERMISSIONS SPÉCIFIQUES PAR ACTION
  const canModifyTask = isTaskCreator || isAdmin;
  const canDeleteTask = isTaskCreator || isAdmin;
  const canSubmitTask = isAssignedToTask || isTaskCreator;

  console.log('🔍 Vérification permissions TaskDetailModal:', {
    userId: user?.uid,
    taskCreator: task.createdBy,
    taskAssignees: task.assignedTo,
    isTaskCreator,
    isAssignedToTask,
    isAdmin,
    canModifyTask,
    canDeleteTask,
    canSubmitTask
  });

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100', 
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  // Fonction pour obtenir la couleur de statut  
  const getStatusColor = (status) => {
    const colors = {
      todo: 'text-gray-600 bg-gray-100',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      validation_pending: 'text-orange-600 bg-orange-100',
      rejected: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  // Gestionnaire d'ajout de commentaire
  const handleAddComment = async () => {
    if (!newComment.trim() || submittingComment) return;
    
    setSubmittingComment(true);
    
    try {
      const commentData = {
        taskId: task.id,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Utilisateur',
        createdAt: serverTimestamp(),
        type: 'comment'
      };
      
      await addDoc(collection(db, 'taskComments'), commentData);
      
      setComments(prev => [...prev, {
        ...commentData,
        id: Date.now(),
        createdAt: new Date()
      }]);
      
      setNewComment('');
      
      if (onComment) {
        onComment(commentData);
      }
    } catch (error) {
      console.error('❌ Erreur ajout commentaire:', error);
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
          
          const resolvedNames = await Promise.all(assigneePromises);
          setAssigneeNames(resolvedNames);
        } else {
          setAssigneeNames(['Non assignée']);
        }
        
      } catch (error) {
        console.error('❌ Erreur générale résolution utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    resolveUserNames();
  }, [task]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'normale'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status || 'en attente'}
                </span>
                {task.xpReward && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    +{task.xpReward} XP
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description || 'Aucune description fournie.'}
                  </p>
                </div>
              </div>

              {/* Commentaires */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Commentaires ({comments.length})
                </h3>
                
                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun commentaire pour le moment.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Ajouter un commentaire */}
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* Colonne informations */}
            <div className="space-y-6">
              
              {/* Informations générales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Créé par</span>
                      <p className="font-medium">
                        {loadingUsers ? 'Chargement...' : creatorName || 'Inconnu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Assigné à</span>
                      <p className="font-medium">
                        {loadingUsers ? 'Chargement...' : assigneeNames.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-500">Créé le</span>
                      <p className="font-medium">{formatDate(task.createdAt)}</p>
                    </div>
                  </div>

                  {task.deadline && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-500">Échéance</span>
                        <p className="font-medium">{formatDate(task.deadline)}</p>
                      </div>
                    </div>
                  )}

                  {task.category && (
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-500">Catégorie</span>
                        <p className="font-medium">{task.category}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Récompenses */}
              {task.xpReward && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Récompense
                  </h3>
                  <p className="text-yellow-700 font-medium">+{task.xpReward} XP</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions - PERMISSIONS CORRIGÉES */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Dernière modification : {formatDate(task.updatedAt || task.createdAt)}
            </div>
            
            <div className="flex gap-3">
              
              {/* ✅ BOUTON SOUMETTRE - SEULEMENT POUR LES ASSIGNÉS/CRÉATEURS */}
              {canSubmitTask && onSubmit && task.status !== 'completed' && task.status !== 'validation_pending' && (
                <button
                  onClick={() => {
                    console.log('📤 Soumission tâche depuis modal:', task.id);
                    onSubmit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Soumettre cette tâche pour validation"
                >
                  <CheckCircle className="w-4 h-4" />
                  Soumettre
                </button>
              )}

              {/* ✅ BOUTON MODIFIER - SEULEMENT POUR LE CRÉATEUR/ADMIN */}
              {canModifyTask && onEdit && (
                <button
                  onClick={() => {
                    console.log('✏️ Modification tâche depuis modal:', task.id);
                    onEdit(task);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Modifier cette tâche"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
              
              {/* ✅ BOUTON SUPPRIMER - SEULEMENT POUR LE CRÉATEUR/ADMIN */}
              {canDeleteTask && onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                      console.log('🗑️ Suppression tâche depuis modal:', task.id);
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Supprimer définitivement cette tâche"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}

              {/* 🔒 MESSAGE D'INFORMATION SI AUCUNE PERMISSION */}
              {!canSubmitTask && !canModifyTask && !canDeleteTask && (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Vous n'avez pas les permissions pour modifier cette tâche
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
