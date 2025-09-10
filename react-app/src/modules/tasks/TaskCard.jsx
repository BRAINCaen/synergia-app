// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// COMPOSANT TÂCHE AVEC BADGE COMMENTAIRES INTÉGRÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  User,
  Users,
  Trophy,
  Heart,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MessageCircle,
  Bell,
  Send
} from 'lucide-react';

// 🔥 IMPORTS SERVICES ET STORES
import { useAuthStore } from '../../shared/stores/authStore.js';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 💬 BADGE COMMENTAIRES AVEC TEMPS RÉEL INTÉGRÉ
 */
const CommentBadge = ({ taskId, onClick }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasRecent, setHasRecent] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    console.log('🔔 [COMMENT_BADGE] Initialisation pour tâche:', taskId);

    // Créer l'écoute temps réel Firebase
    const commentsQuery = query(
      collection(db, 'comments'),
      where('entityType', '==', 'task'),
      where('entityId', '==', taskId)
    );

    const unsubscribe = onSnapshot(commentsQuery, 
      (snapshot) => {
        const count = snapshot.size;
        console.log('🔔 [COMMENT_BADGE] Mise à jour:', count, 'commentaires pour', taskId);
        
        setCommentCount(count);
        
        // Vérifier s'il y a des commentaires récents (dernières 24h)
        if (count > 0) {
          const docs = snapshot.docs;
          const hasRecentComment = docs.some(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt.seconds) {
              const commentDate = new Date(data.createdAt.seconds * 1000);
              const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return commentDate > dayAgo;
            }
            return false;
          });
          setHasRecent(hasRecentComment);
        } else {
          setHasRecent(false);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('❌ [COMMENT_BADGE] Erreur écoute:', error);
        setCommentCount(0);
        setLoading(false);
      }
    );

    // Nettoyage
    return () => {
      console.log('🧹 [COMMENT_BADGE] Nettoyage pour tâche:', taskId);
      unsubscribe();
    };
  }, [taskId]);

  // Ne rien afficher pendant le chargement ou si aucun commentaire
  if (loading) {
    return (
      <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  if (commentCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        hasRecent 
          ? 'bg-blue-600 text-white shadow-md animate-pulse' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title={`${commentCount} commentaire${commentCount > 1 ? 's' : ''}${hasRecent ? ' (nouveau)' : ''}`}
    >
      <MessageCircle className="w-3 h-3" />
      <span>{commentCount}</span>
      {hasRecent && <div className="w-1 h-1 bg-yellow-300 rounded-full"></div>}
    </button>
  );
};

/**
 * 🔘 COMPOSANT BOUTON SOUMISSION
 */
const SubmitTaskButton = ({ task, onSubmit, onTaskUpdate }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(task.id);
      }
      
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
      {submitting ? 'Envoi...' : 'Soumettre'}
    </button>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL TASKCARD
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView, 
  onSubmit, 
  onTaskUpdate,
  currentUser,
  showActions = true,
  compact = false 
}) => {
  const { user } = useAuthStore();
  const [creatorName, setCreatorName] = useState('');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const effectiveUser = currentUser || user;
  const isAssignedToMe = effectiveUser && task?.assignedTo?.includes(effectiveUser.uid);
  const canSubmit = isAssignedToMe && task?.status !== 'completed' && onSubmit;

  // Charger les informations des utilisateurs
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!task) return;
      
      setLoadingUsers(true);
      try {
        // Charger le créateur
        if (task.createdBy) {
          const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();
            setCreatorName(`${creatorData.firstName || ''} ${creatorData.lastName || ''}`.trim() || creatorData.email || 'Utilisateur');
          }
        }

        // Charger les assignés
        if (task.assignedTo && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Utilisateur';
            }
            return 'Utilisateur';
          });
          const names = await Promise.all(assigneePromises);
          setAssigneeNames(names);
        }
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUserInfo();
  }, [task]);

  // Gestion des favoris
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!effectiveUser?.uid || favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      const userDoc = doc(db, 'users', effectiveUser.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const currentFavorites = userData.favoriteTasks || [];
        
        let newFavorites;
        if (isFavorite) {
          newFavorites = currentFavorites.filter(id => id !== task.id);
        } else {
          newFavorites = [...currentFavorites, task.id];
        }
        
        await updateDoc(userDoc, {
          favoriteTasks: newFavorites
        });
        
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Formatage des dates
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Calcul de l'urgence
  const getUrgencyLevel = () => {
    if (!task.dueDate) return 'normal';
    
    try {
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'overdue';
      if (diffDays <= 1) return 'urgent';
      if (diffDays <= 3) return 'warning';
      return 'normal';
    } catch {
      return 'normal';
    }
  };

  const urgencyLevel = getUrgencyLevel();
  const urgencyStyles = {
    overdue: 'border-red-500 bg-red-50',
    urgent: 'border-orange-500 bg-orange-50',
    warning: 'border-yellow-500 bg-yellow-50',
    normal: 'border-gray-200 bg-white'
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };

  if (!task) return null;

  return (
    <div 
      className={`
        group relative bg-white rounded-xl border-2 transition-all duration-200 
        hover:shadow-lg hover:-translate-y-1 cursor-pointer
        ${urgencyStyles[urgencyLevel]}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={() => onView?.(task)}
    >
      {/* Badge d'urgence */}
      {urgencyLevel === 'overdue' && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          En retard
        </div>
      )}
      {urgencyLevel === 'urgent' && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          Urgent
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {task.title}
          </h3>
          
          {/* Badges statut et priorité */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || statusColors.todo}`}>
              {task.status === 'todo' ? 'À faire' :
               task.status === 'in_progress' ? 'En cours' :
               task.status === 'review' ? 'Révision' :
               task.status === 'completed' ? 'Terminé' : task.status}
            </span>
            
            {task.priority && (
              <span className={`text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                {task.priority === 'high' ? 'Haute' :
                 task.priority === 'medium' ? 'Moyenne' :
                 task.priority === 'low' ? 'Faible' : task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1">
          {/* Badge commentaires */}
          <CommentBadge 
            taskId={task.id} 
            onClick={(e) => {
              e.stopPropagation();
              onView?.(task, 'comments');
            }}
          />
          
          {/* Favori */}
          {effectiveUser && (
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`p-1 rounded transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Méta-informations */}
      <div className="space-y-2 text-xs text-gray-500">
        {/* Date d'échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Échéance: {formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Créateur */}
        {creatorName && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>Créé par: {loadingUsers ? '...' : creatorName}</span>
          </div>
        )}

        {/* Assignés */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>
              Assigné à: {loadingUsers ? '...' : assigneeNames.join(', ')}
            </span>
          </div>
        )}

        {/* Points XP */}
        {task.xpReward && task.xpReward > 0 && (
          <div className="flex items-center gap-1 text-yellow-600">
            <Trophy className="w-3 h-3" />
            <span>+{task.xpReward} XP</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          
          {/* Soumission rapide */}
          {canSubmit && (
            <SubmitTaskButton 
              task={task}
              onSubmit={onSubmit}
              onTaskUpdate={onTaskUpdate}
            />
          )}
          
          {/* Actions secondaires */}
          <div className="flex items-center gap-1 ml-auto">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(task);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
