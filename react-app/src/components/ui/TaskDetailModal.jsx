// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAIL TÂCHE AVEC RÉSOLUTION DES NOMS UTILISATEURS
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
  Star
} from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import CommentSection from '../collaboration/CommentSection.jsx';

/**
 * 👤 HOOK POUR RÉSOUDRE UN UTILISATEUR
 */
const useUserResolver = () => {
  const [usersCache, setUsersCache] = useState(new Map());
  
  const resolveUser = async (userId) => {
    if (!userId) return null;
    
    // Vérifier le cache d'abord
    if (usersCache.has(userId)) {
      return usersCache.get(userId);
    }
    
    try {
      // Récupérer depuis Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          uid: userId,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          email: userData.email || 'Non défini',
          photoURL: userData.photoURL || null,
          initials: (userData.displayName || userData.email?.split('@')[0] || 'U')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        };
        
        // Mettre en cache
        setUsersCache(prev => new Map(prev).set(userId, user));
        return user;
      } else {
        // Utilisateur non trouvé - créer un fallback
        const fallbackUser = {
          uid: userId,
          displayName: `User_${userId.substring(0, 8)}`,
          email: 'Non défini',
          photoURL: null,
          initials: userId.substring(0, 2).toUpperCase()
        };
        
        setUsersCache(prev => new Map(prev).set(userId, fallbackUser));
        return fallbackUser;
      }
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', userId, error);
      
      // Fallback d'erreur
      const errorUser = {
        uid: userId,
        displayName: `Utilisateur ${userId.substring(0, 6)}`,
        email: 'Erreur chargement',
        photoURL: null,
        initials: 'ER'
      };
      
      return errorUser;
    }
  };
  
  return { resolveUser, usersCache };
};

/**
 * 🎨 AVATAR UTILISATEUR AVEC NOM
 */
const UserAvatar = ({ userId, user, size = 'md', showName = false }) => {
  const [resolvedUser, setResolvedUser] = useState(user);
  const [loading, setLoading] = useState(!user && !!userId);
  const { resolveUser } = useUserResolver();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // Résoudre l'utilisateur si pas fourni
  useEffect(() => {
    if (!user && userId) {
      setLoading(true);
      resolveUser(userId).then(resolved => {
        setResolvedUser(resolved);
        setLoading(false);
      });
    }
  }, [userId, user, resolveUser]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full animate-pulse`} />
        {showName && <span className="text-gray-400">Chargement...</span>}
      </div>
    );
  }

  if (!resolvedUser) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center`}>
          <span className="text-gray-500">?</span>
        </div>
        {showName && <span className="text-gray-400">Utilisateur inconnu</span>}
      </div>
    );
  }

  const displayName = resolvedUser.displayName || resolvedUser.email || 'User';
  const initials = resolvedUser.initials || displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-medium shadow-sm`}
        title={`${displayName} (${resolvedUser.email})`}
      >
        {initials}
      </div>
      {showName && (
        <div className="text-white">
          <div className="font-medium">{displayName}</div>
          {resolvedUser.email && resolvedUser.email !== 'Non défini' && (
            <div className="text-xs text-gray-400">{resolvedUser.email}</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 👥 LISTE D'UTILISATEURS AVEC NOMS RÉELS
 */
const UsersList = ({ userIds = [] }) => {
  const [resolvedUsers, setResolvedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resolveUser } = useUserResolver();

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setResolvedUsers([]);
      setLoading(false);
      return;
    }

    const resolveAllUsers = async () => {
      setLoading(true);
      
      const userPromises = (Array.isArray(userIds) ? userIds : [userIds])
        .filter(Boolean) // Supprimer les valeurs nulles/vides
        .map(userId => resolveUser(userId));

      try {
        const users = await Promise.all(userPromises);
        setResolvedUsers(users.filter(Boolean)); // Supprimer les null
      } catch (error) {
        console.error('❌ Erreur résolution utilisateurs:', error);
        setResolvedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    resolveAllUsers();
  }, [userIds, resolveUser]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: Math.min(3, (userIds || []).length) }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!userIds || userIds.length === 0 || resolvedUsers.length === 0) {
    return (
      <div className="text-gray-400 italic">
        Aucun utilisateur assigné
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resolvedUsers.map((user, index) => (
        <UserAvatar key={user.uid || index} user={user} size="md" showName={true} />
      ))}
    </div>
  );
};

/**
 * 📋 MODAL DÉTAIL DE TÂCHE PRINCIPALE
 */
const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onSubmit,
  user
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [creatorUser, setCreatorUser] = useState(null);
  const { resolveUser } = useUserResolver();

  // Résoudre le créateur de la tâche
  useEffect(() => {
    if (task?.createdBy) {
      resolveUser(task.createdBy).then(setCreatorUser);
    }
  }, [task?.createdBy, resolveUser]);

  if (!isOpen || !task) return null;

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Date invalide';
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'validation_pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'assigned': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'open': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'validation_pending': return 'En attente de validation';
      case 'assigned': return 'Assignée';
      case 'open': return 'Ouverte';
      case 'pending': return 'En attente';
      default: return status || 'Non défini';
    }
  };

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Fonction pour obtenir le texte de la priorité
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority || 'Non définie';
    }
  };

  const canEditTask = (task, user) => {
    if (!user || !task) return false;
    return task.createdBy === user.uid || (task.assignedTo && task.assignedTo.includes(user.uid));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
              {task.priority && (
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                  🔥 {getPriorityText(task.priority)}
                </span>
              )}
              {task.xpReward && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {task.xpReward} XP
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors mr-8 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              💬 Commentaires
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Description
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {/* Métadonnées en grille */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Informations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Créateur avec VRAI NOM */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Créé par
                    </div>
                    <UserAvatar userId={task.createdBy} user={creatorUser} size="md" showName={true} />
                  </div>

                  {/* Date de création */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Créée le
                    </div>
                    <div className="text-white font-medium">
                      {formatDate(task.createdAt)}
                    </div>
                  </div>

                  {/* Durée estimée */}
                  {task.estimatedHours && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Durée estimée
                      </div>
                      <div className="text-white font-medium">
                        {task.estimatedHours}h
                      </div>
                    </div>
                  )}

                  {/* Date d'échéance */}
                  {task.dueDate && (
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Échéance
                      </div>
                      <div className="text-orange-300 font-medium">
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Assignés avec VRAIS NOMS */}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Assignée à ({task.assignedTo.length})
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <UsersList userIds={task.assignedTo} />
                  </div>
                </div>
              )}

              {/* Notes supplémentaires */}
              {task.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              <CommentSection 
                entityType="task" 
                entityId={task.id} 
                className="bg-transparent border-0 p-0"
              />
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Dernière modification: {formatDate(task.updatedAt)}
          </div>
          
          <div className="flex gap-3">
            {onSubmit && task.status !== 'completed' && (
              <button
                onClick={() => onSubmit(task)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Soumettre
              </button>
            )}
            
            {canEditTask(task, user) && (
              <>
                <button
                  onClick={() => onEdit && onEdit(task)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => onDelete && onDelete(task.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TaskDetailModal;
