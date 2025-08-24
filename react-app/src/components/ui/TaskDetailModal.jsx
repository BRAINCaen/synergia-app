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
  Info,
  UserPlus,
  UserMinus
} from 'lucide-react';

// Imports Firebase
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🚨 IMPORT COLLABORATION SERVICE POUR COMMENTAIRES
import { collaborationService } from '../../core/services/collaborationService.js';

// Import authStore
import { useAuthStore } from '../../shared/stores/authStore.js';

// Import services
import { taskAssignmentService } from '../../core/services/taskAssignmentService.js';

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
  const { user: authUser } = useAuthStore();
  const effectiveUser = currentUser || authUser;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  
  // 🚨 NOUVEAU - État pour debug Firebase
  const [firebaseStatus, setFirebaseStatus] = useState('unknown');
  const [debugInfo, setDebugInfo] = useState('');

  // ✅ VÉRIFICATIONS D'ASSIGNATION
  const isAssignedToMe = effectiveUser && task && Array.isArray(task.assignedTo) 
    ? task.assignedTo.includes(effectiveUser.uid)
    : false;

  const canEdit = effectiveUser && task && (
    task.createdBy === effectiveUser.uid || 
    isAssignedToMe ||
    (effectiveUser.role === 'admin' || effectiveUser.isAdmin)
  );

  const isCreator = effectiveUser && task && task.createdBy === effectiveUser.uid;

  // Si pas de tâche ou modal fermée, ne pas afficher
  if (!isOpen || !task) {
    return null;
  }

  // 🔍 CHARGEMENT DES DONNÉES UTILISATEURS
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen || !task) return;
      
      try {
        setLoadingUsers(true);

        // Charger le nom du créateur
        if (task.createdBy) {
          try {
            const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
            if (creatorDoc.exists()) {
              const creatorData = creatorDoc.data();
              setCreatorName(`${creatorData.firstName || ''} ${creatorData.lastName || ''}`.trim() || creatorData.email || 'Utilisateur');
            } else {
              setCreatorName('Utilisateur supprimé');
            }
          } catch (error) {
            console.warn('Erreur chargement créateur:', error);
            setCreatorName('Erreur chargement');
          }
        }

        // Charger les noms des assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Utilisateur';
              }
              return 'Utilisateur inconnu';
            } catch (error) {
              console.warn('Erreur chargement assigné:', error);
              return 'Utilisateur inconnu';
            }
          });
          
          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        }

      } catch (error) {
        console.error('Erreur chargement données utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadData();
  }, [isOpen, task]);

  // 🚨 NOUVEAU - Vérification et diagnostic Firebase
  useEffect(() => {
    const checkFirebaseStatus = () => {
      let status = 'unknown';
      let debug = '';
      
      try {
        // Vérifier les variables globales
        const hasWindowDb = !!window.db;
        const hasWindowFirebase = !!window.firebase;
        const hasCollabService = !!window.collaborationService;
        const hasDb = !!db;
        const hasCollabImport = !!collaborationService;
        
        debug += `window.db: ${hasWindowDb}, `;
        debug += `window.firebase: ${hasWindowFirebase}, `;
        debug += `window.collaborationService: ${hasCollabService}, `;
        debug += `db import: ${hasDb}, `;
        debug += `collaborationService import: ${hasCollabImport}`;
        
        if (hasDb && hasCollabImport) {
          status = 'ready';
        } else if (hasDb) {
          status = 'partial';
        } else {
          status = 'missing';
        }
        
      } catch (error) {
        status = 'error';
        debug = `Error: ${error.message}`;
      }
      
      setFirebaseStatus(status);
      setDebugInfo(debug);
      console.log('🔍 [TASK_MODAL] Firebase status:', status, '-', debug);
    };

    checkFirebaseStatus();
  }, []);

  // 📡 GESTION TEMPS RÉEL DES COMMENTAIRES - AVEC FALLBACK
  useEffect(() => {
    if (!task?.id) {
      setComments([]);
      return;
    }

    console.log('📡 [TASK_UI_MODAL] Configuration listener temps réel pour tâche:', task.id);
    setLoadingComments(true);

    let unsubscribe = null;
    let fallbackTimeout = null;

    const setupCommentsListener = async () => {
      try {
        // 🚨 TENTATIVE AVEC COLLABORATION SERVICE
        if (collaborationService && collaborationService.subscribeToComments) {
          console.log('🔧 [TASK_UI_MODAL] Utilisation du collaborationService...');
          
          unsubscribe = collaborationService.subscribeToComments(
            'task',
            task.id,
            (updatedComments) => {
              console.log('📡 [TASK_UI_MODAL] Commentaires mis à jour en temps réel:', updatedComments?.length || 0);
              setComments(updatedComments || []);
              setLoadingComments(false);
            }
          );
          
          console.log('✅ [TASK_UI_MODAL] Listener configuré avec collaborationService');
        } else {
          console.warn('⚠️ [TASK_UI_MODAL] collaborationService non disponible, utilisation directe Firebase');
          throw new Error('collaborationService indisponible');
        }
        
      } catch (error) {
        console.warn('⚠️ [TASK_UI_MODAL] Erreur collaboration service:', error);
        
        // 🔄 FALLBACK - Requête directe Firebase
        try {
          if (db) {
            console.log('🔄 [TASK_UI_MODAL] Fallback: requête directe Firebase...');
            
            const commentsRef = collection(db, 'comments');
            const q = query(
              commentsRef,
              where('entityType', '==', 'task'),
              where('entityId', '==', task.id)
            );
            
            // Listener temps réel direct
            unsubscribe = onSnapshot(q, (snapshot) => {
              const directComments = [];
              snapshot.forEach((doc) => {
                const commentData = doc.data();
                directComments.push({
                  id: doc.id,
                  ...commentData,
                  createdAt: commentData.createdAt?.toDate ? commentData.createdAt.toDate() : new Date(commentData.createdAt)
                });
              });
              
              // Trier par date de création
              directComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              
              console.log('📡 [TASK_UI_MODAL] Commentaires via Firebase direct:', directComments.length);
              setComments(directComments);
              setLoadingComments(false);
            }, (error) => {
              console.error('❌ [TASK_UI_MODAL] Erreur listener Firebase direct:', error);
              setLoadingComments(false);
            });
            
            console.log('✅ [TASK_UI_MODAL] Listener Firebase direct configuré');
            
          } else {
            console.error('❌ [TASK_UI_MODAL] Firebase db non disponible');
            setLoadingComments(false);
          }
          
        } catch (fallbackError) {
          console.error('❌ [TASK_UI_MODAL] Erreur fallback Firebase:', fallbackError);
          setComments([]);
          setLoadingComments(false);
        }
      }
    };

    setupCommentsListener();

    // Nettoyage du listener
    return () => {
      if (unsubscribe) {
        console.log('🛑 [TASK_UI_MODAL] Nettoyage listener pour tâche:', task.id);
        try {
          unsubscribe();
        } catch (error) {
          console.warn('⚠️ [TASK_UI_MODAL] Erreur nettoyage listener:', error);
        }
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [task?.id, firebaseStatus]);

  // 📤 ENVOYER UN COMMENTAIRE - AVEC FALLBACK
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || submittingComment || !effectiveUser?.uid) {
      return;
    }

    console.log('📤 [TASK_UI_MODAL] Envoi commentaire pour tâche:', task.id);
    
    setSubmittingComment(true);
    
    try {
      // 🚨 TENTATIVE AVEC COLLABORATION SERVICE
      if (collaborationService && collaborationService.addComment) {
        console.log('🔧 [TASK_UI_MODAL] Envoi via collaborationService...');
        
        await collaborationService.addComment('task', task.id, {
          content: newComment.trim(),
          authorId: effectiveUser.uid,
          authorName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`.trim() || effectiveUser.email || 'Utilisateur',
          timestamp: new Date()
        });
        
        console.log('✅ [TASK_UI_MODAL] Commentaire envoyé via collaborationService');
        
      } else {
        console.warn('⚠️ [TASK_UI_MODAL] collaborationService non disponible, envoi direct Firebase');
        
        // 🔄 FALLBACK - Sauvegarde directe Firebase
        if (db) {
          const commentData = {
            entityType: 'task',
            entityId: task.id,
            content: newComment.trim(),
            userId: effectiveUser.uid,
            userName: `${effectiveUser.firstName || 'Prénom'} ${effectiveUser.lastName || 'Nom'}`.trim() || effectiveUser.email || 'Utilisateur',
            userEmail: effectiveUser.email || '',
            createdAt: serverTimestamp(),
            isEdited: false
          };
          
          await addDoc(collection(db, 'comments'), commentData);
          console.log('✅ [TASK_UI_MODAL] Commentaire envoyé via Firebase direct');
        } else {
          throw new Error('Firebase db non disponible');
        }
      }
      
      setNewComment('');
      
    } catch (error) {
      console.error('❌ [TASK_UI_MODAL] Erreur envoi commentaire:', error);
      alert('Erreur lors de l\'envoi du commentaire: ' + error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 🎯 SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
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
  };

  // 📋 COMPOSANT SECTION COMMENTAIRES
  const CommentsSection = () => (
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

      {/* 🚨 NOUVEAU - Info de debug Firebase */}
      {firebaseStatus !== 'ready' && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
          <div className="flex items-center text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Status Firebase: {firebaseStatus}
          </div>
          <div className="text-yellow-300 text-xs mt-1">{debugInfo}</div>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun commentaire pour le moment</p>
            <p className="text-gray-600 text-xs mt-1">Soyez le premier à commenter cette tâche !</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              {/* En-tête du commentaire */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              task.status === 'completed' ? 'bg-green-500' : 
              task.status === 'in_progress' ? 'bg-yellow-500' : 
              'bg-gray-500'
            }`}></div>
            <h2 className="text-xl font-bold text-white truncate max-w-md" title={task.title}>
              {task.title}
            </h2>
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
              task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Modifier la tâche"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            
            {(isCreator || (effectiveUser?.role === 'admin' || effectiveUser?.isAdmin)) && onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Supprimer la tâche"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-700 bg-gray-800">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Commentaires
              {comments.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {comments.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 📋 Onglet Détails */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Créateur */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Créé par
                  </h3>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    {loadingUsers ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-400">Chargement...</span>
                      </div>
                    ) : (
                      <p className="text-white font-medium">{creatorName}</p>
                    )}
                  </div>
                </div>

                {/* Assigné à */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Assigné à
                  </h3>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    {loadingUsers ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                        <span className="text-gray-400">Chargement...</span>
                      </div>
                    ) : assigneeNames.length > 0 ? (
                      <div className="space-y-1">
                        {assigneeNames.map((name, index) => (
                          <p key={index} className="text-white font-medium">{name}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 italic">Non assignée</p>
                        {effectiveUser && !isAssignedToMe && (
                          <button
                            onClick={handleVolunteer}
                            disabled={volunteerLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {volunteerLoading ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <UserPlus className="w-3 h-3" />
                            )}
                            Se porter volontaire
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    Échéances
                  </h3>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Créée le :</span>
                      <span className="text-white">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Échéance :</span>
                        <span className={`font-medium ${
                          new Date(task.dueDate.seconds * 1000) < new Date() 
                            ? 'text-red-400' 
                            : 'text-white'
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                    {task.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Terminée le :</span>
                        <span className="text-green-400">{formatDate(task.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statut et priorité */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Flag className="w-5 h-5 mr-2 text-blue-400" />
                    Statut & Priorité
                  </h3>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statut :</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status === 'completed' ? 'Terminée' : 
                         task.status === 'in_progress' ? 'En cours' : 'À faire'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priorité :</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority === 'high' ? 'Haute' : 
                         task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catégorie */}
              {task.category && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Tag className="w-5 h-5 mr-2 text-blue-400" />
                    Catégorie
                  </h3>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                      {task.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <Paperclip className="w-5 h-5 mr-2 text-blue-400" />
                    Pièces jointes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{attachment.name}</div>
                          <div className="text-sm text-gray-400">{attachment.size}</div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Notes
                  </h3>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💬 Onglet Commentaires */}
          {activeTab === 'comments' && <CommentsSection />}
        </div>

        {/* Footer d'actions */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            
            {isAssignedToMe && task.status !== 'completed' && onSubmit && (
              <button
                onClick={() => onSubmit(task.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Marquer comme terminé
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
