// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - CODE COMPLET AVEC CORRECTIONS
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

  // Ajouter un commentaire
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

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'En attente' },
      'todo': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'À faire' },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      'validation_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En validation' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejetée' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6" />
                <h2 className="text-2xl font-bold">{task.title}</h2>
                {getStatusBadge(task.status)}
              </div>
              
              {task.description && (
                <p className="text-blue-100 text-lg leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Messages ({comments.length})
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Colonne gauche */}
                <div className="space-y-4">
                  
                  {/* ✅ ASSIGNATION CORRIGÉE AVEC NOMS UTILISATEURS */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Assignation</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Créée par :</span>
                        <span className="ml-2 font-medium">
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
                            <div className="mt-2 space-y-1">
                              {assigneeNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded border">
                                  <User className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium">{name}</span>
                                </div>
                              ))}
                              <div className="text-xs text-gray-500 mt-1">
                                {assigneeNames.length} personne{assigneeNames.length > 1 ? 's' : ''} assignée{assigneeNames.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(!task.assignedTo || task.assignedTo.length === 0) && (
                        <div className="text-sm text-gray-500 italic bg-gray-100 px-3 py-2 rounded">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Aucune assignation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ DATES CORRIGÉES AVEC FORMATAGE FRANÇAIS */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">Dates</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créée :</span>
                        <span className="font-medium">{formatDate(task.createdAt)}</span>
                      </div>
                      {task.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modifiée :</span>
                          <span className="font-medium">{formatDate(task.updatedAt)}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Échéance :</span>
                          <span className="font-medium text-orange-600">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Terminée :</span>
                          <span className="font-medium text-green-600">{formatDate(task.completedAt)}</span>
                        </div>
                      )}
                      {task.submittedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soumise :</span>
                          <span className="font-medium text-blue-600">{formatDate(task.submittedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  
                  {/* ✅ CARACTÉRISTIQUES CORRIGÉES AVEC DIFFICULTÉ ET XP */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Caractéristiques</h4>
                    </div>
                    <div className="space-y-3">
                      {task.difficulty && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Difficulté :</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            task.difficulty === 'normal' ? 'bg-blue-100 text-blue-700' :
                            task.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                            task.difficulty === 'expert' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
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
                          <span className="text-gray-600 text-sm">Récompense :</span>
                          <span className="flex items-center gap-1 text-yellow-600 font-medium">
                            <Trophy className="w-4 h-4" />
                            +{task.xpReward} XP
                          </span>
                        </div>
                      )}
                      
                      {task.priority && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Priorité :</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'low' ? 'bg-green-100 text-green-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority === 'low' ? 'Basse' :
                             task.priority === 'medium' ? 'Moyenne' :
                             task.priority === 'high' ? 'Haute' :
                             task.priority === 'urgent' ? 'Urgente' :
                             task.priority}
                          </span>
                        </div>
                      )}
                      
                      {task.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Catégorie :</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {task.category === 'general' ? 'Général' :
                             task.category === 'maintenance' ? 'Maintenance' :
                             task.category === 'reputation' ? 'Réputation' :
                             task.category === 'stock' ? 'Gestion Stock' :
                             task.category === 'communication' ? 'Communication' :
                             task.category === 'formation' ? 'Formation' :
                             task.category}
                          </span>
                        </div>
                      )}
                      
                      {task.estimatedHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Durée estimée :</span>
                          <span className="flex items-center gap-1 text-gray-700">
                            <Clock className="w-4 h-4" />
                            {task.estimatedHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ TAGS AMÉLIORÉS */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-gray-900">Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="p-6">
              <div className="space-y-4">
                
                {/* Liste des commentaires */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loadingComments ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Chargement des messages...
                      </div>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun message pour le moment</p>
                      <p className="text-gray-400 text-sm">Soyez le premier à commenter cette tâche</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{comment.userName}</span>
                              <span className="text-gray-500 text-sm">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-700">{comment.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Zone d'ajout de commentaire */}
                {effectiveUser && (
                  <div className="border-t pt-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={addComment}
                              disabled={!newComment.trim() || submittingComment}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
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
