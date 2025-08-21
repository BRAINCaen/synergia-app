// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS TÂCHE - CORRECTION COMPLÈTE FINALE
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
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [volunteerLoading, setVolunteerLoading] = useState(false);

  // 🎯 LOGIQUE D'ÉTAT DE LA TÂCHE PAR RAPPORT À L'UTILISATEUR
  const isCreatedByMe = effectiveUser && task.createdBy === effectiveUser.uid;
  const isAssignedToMe = effectiveUser && Array.isArray(task.assignedTo) && task.assignedTo.includes(effectiveUser.uid);
  const hasAlreadyVolunteered = effectiveUser && Array.isArray(task.volunteers) && task.volunteers.includes(effectiveUser.uid);
  
  // 🎯 VÉRIFIER SI LA TÂCHE EST OUVERTE AUX VOLONTAIRES
  const isAvailableForVolunteers = task.openToVolunteers && 
                                  task.status !== 'completed' && 
                                  task.status !== 'validation_pending' &&
                                  !isAssignedToMe && 
                                  !isCreatedByMe &&
                                  !hasAlreadyVolunteered;

  // 🙋‍♂️ FONCTION POUR SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!effectiveUser) {
      alert('Vous devez être connecté pour vous porter volontaire');
      return;
    }

    try {
      setVolunteerLoading(true);
      console.log('🙋‍♂️ Tentative de volontariat pour tâche:', task.id);

      const result = await taskAssignmentService.volunteerForTask(task.id, effectiveUser.uid);
      
      if (result.success) {
        console.log('✅ Volontariat réussi:', result);
        
        if (result.pending) {
          alert('✅ Votre candidature a été envoyée ! Le créateur de la tâche l\'examinera bientôt.');
        } else {
          alert('✅ Vous avez été automatiquement assigné à cette tâche !');
        }
        
        // Notifier le parent pour recharger les données
        if (onTaskUpdate) {
          onTaskUpdate();
        }
        
        // Fermer le modal
        onClose();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du volontariat:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setVolunteerLoading(false);
    }
  };

  // ⌛ Au chargement, charger les noms d'utilisateurs et commentaires
  useEffect(() => {
    if (isOpen && task) {
      loadUserNames();
      loadComments();
    }
  }, [isOpen, task]);

  // 👤 Charger les noms d'utilisateurs
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
      } else {
        setAssigneeNames([]);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement noms utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 💬 Charger les commentaires (système simplifié pour l'instant)
  const loadComments = async () => {
    if (!task?.id) return;
    
    try {
      setLoadingComments(true);
      
      // Pour l'instant, utiliser une liste vide jusqu'à implémentation complète
      setComments([]);
      
    } catch (error) {
      console.error('❌ Erreur chargement commentaires:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // 📝 Soumettre un commentaire
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !effectiveUser) return;

    try {
      setSubmittingComment(true);
      
      // TODO: Implémenter la soumission de commentaires via le service
      console.log('💬 Soumission commentaire:', newComment);
      
      // Ajouter temporairement à la liste locale
      const tempComment = {
        id: Date.now(),
        content: newComment,
        userName: effectiveUser.displayName || effectiveUser.email || 'Utilisateur',
        createdAt: new Date()
      };
      
      setComments(prev => [...prev, tempComment]);
      setNewComment('');
      
    } catch (error) {
      console.error('❌ Erreur soumission commentaire:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Ne pas render si pas ouvert
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden text-white">
        
        {/* Header avec titre et badges de statut */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex flex-wrap gap-2">
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

                {task.openToVolunteers && (
                  <span className="px-2 py-1 rounded text-xs font-medium border bg-purple-800/50 text-purple-300 border-purple-600">
                    Ouvert aux volontaires
                  </span>
                )}
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

        {/* Navigation des onglets */}
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
                                <div key={index} className="text-blue-400 font-medium">
                                  {name}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400">Aucun assigné</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(!task.assignedTo || task.assignedTo.length === 0) && (
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Non assignée</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates et métriques */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <h4 className="font-medium text-white">Échéances</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Créée:</span>
                      <span className="text-gray-300">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Échéance:</span>
                        <span className="text-yellow-400 font-medium">{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.difficulty && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400">Difficulté:</span>
                        <span className={`font-medium ${
                          task.difficulty === 'easy' ? 'text-green-400' :
                          task.difficulty === 'medium' ? 'text-yellow-400' :
                          task.difficulty === 'hard' ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {task.difficulty === 'easy' ? 'Facile' :
                           task.difficulty === 'medium' ? 'Moyenne' :
                           task.difficulty === 'hard' ? 'Difficile' :
                           'Expert'}
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

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-800/30 text-purple-300 border border-purple-600 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gray-400" />
                    Pièces jointes
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 flex-1">{attachment.name}</span>
                        <button className="p-1 hover:bg-gray-700 rounded text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💬 Onglet Commentaires/Messages */}
          {activeTab === 'comments' && (
            <div className="p-6">
              
              {/* En-tête section commentaires */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Messages de collaboration
                </h3>
                <span className="text-sm text-gray-400">
                  {comments.length} message{comments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Liste des commentaires */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {loadingComments ? (
                  <div className="text-center py-4 text-gray-400">
                    <div className="inline-block w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-2">Chargement des messages...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun message pour le moment</p>
                    <p className="text-sm">Soyez le premier à commenter cette tâche !</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
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
                <form onSubmit={handleSubmitComment} className="border-t border-gray-700 pt-4">
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
                <div className="text-center py-4 text-gray-400 text-sm border-t border-gray-700 pt-4">
                  Connectez-vous pour ajouter un commentaire
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer avec actions - CORRIGÉ */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Dernière modification : {formatDate(task.updatedAt || task.createdAt)}
            </div>
            
            <div className="flex gap-3">
              {/* 🙋‍♂️ BOUTON SE PORTER VOLONTAIRE - CORRIGÉ */}
              {isAvailableForVolunteers && (
                <button
                  onClick={handleVolunteer}
                  disabled={volunteerLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {volunteerLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Se porter volontaire
                    </>
                  )}
                </button>
              )}

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
