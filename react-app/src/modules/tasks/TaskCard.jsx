// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// TASKCARD AVEC NOTIFICATION COMMENTAIRES VISIBLE - FIX BADGE 0 COMMENTAIRES
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Users,
  Calendar, 
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserMinus,
  Trophy,
  Star,
  MessageCircle,
  Bell,
  Heart
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { taskService } from '../../core/services/taskService.js';
import { collaborationService } from '../../core/services/collaborationService.js';
import SubmitTaskButton from './SubmitTaskButton.jsx';

/**
 * 💬 BADGE COMMENTAIRES AVEC NOTIFICATION VISUELLE TEMPS RÉEL - FIX AFFICHAGE 0
 */
const CommentNotificationBadge = ({ taskId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [hasNewComments, setHasNewComments] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    console.log('🔄 [TASK_CARD_COMMENT_BADGE] Configuration synchronisation pour tâche:', taskId);

    // 📡 SYNCHRONISATION TEMPS RÉEL DES COMMENTAIRES
    const unsubscribe = collaborationService.subscribeToComments(
      'task',
      taskId,
      (comments) => {
        const count = Array.isArray(comments) ? comments.length : 0;
        setCommentCount(count);
        
        // Détecter nouveaux commentaires (simulation - dans une vraie app, comparer avec lastReadAt)
        if (count > 0) {
          const lastComment = comments[comments.length - 1];
          const isRecent = lastComment && 
            new Date() - (lastComment.createdAt?.toDate ? lastComment.createdAt.toDate() : new Date(lastComment.createdAt)) < 30 * 60 * 1000; // 30 min
          setHasNewComments(isRecent);
        }
        
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [taskId]);

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse" />
      </div>
    );
  }

  // ✅ TOUJOURS AFFICHER LE BADGE - MÊME AVEC 0 COMMENTAIRES
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 relative transition-all duration-200 text-xs font-medium rounded ${
        commentCount === 0
          ? 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
          : hasNewComments
            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50 hover:bg-blue-500/40 animate-pulse'
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
      } ${className}`}
      title={
        commentCount === 0 
          ? "Aucun commentaire - Cliquer pour ajouter"
          : `${commentCount} commentaire${commentCount > 1 ? 's' : ''} - ${hasNewComments ? 'Nouveaux messages !' : 'Cliquer pour voir'}`
      }
    >
      <MessageCircle className="w-3 h-3" />
      <span>{commentCount}</span>
      
      {/* 🚨 INDICATEUR VISUEL POUR NOUVEAUX COMMENTAIRES */}
      {hasNewComments && commentCount > 0 && (
        <>
          {/* Point rouge animé */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-gray-800">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping" />
          </div>
          
          {/* Icône de notification */}
          <Bell className="w-2 h-2 text-yellow-400 animate-bounce ml-1" />
        </>
      )}
    </button>
  );
};

/**
 * 🏷️ COMPOSANT BADGE DE PRIORITÉ
 */
const PriorityBadge = ({ priority }) => {
  const priorityConfigs = {
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Basse', icon: Clock },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moyenne', icon: AlertCircle },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Haute', icon: AlertCircle },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente', icon: AlertCircle }
  };

  const config = priorityConfigs[priority] || priorityConfigs.medium;
  const IconComponent = config.icon;

  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * 🎯 COMPOSANT TASKCARD AVEC NOTIFICATION COMMENTAIRES
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  onUnvolunteer,
  onTaskUpdate,
  isMyTask = false,
  showVolunteerButton = false
}) => {
  const { user } = useAuthStore();
  const [isVolunteering, setIsVolunteering] = useState(false);

  // ✅ Vérifications de statut
  const isTaskOwner = user && task && task.createdBy === user.uid;
  const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
  const canVolunteer = showVolunteerButton && 
    user && 
    task && 
    !isAssignedToMe &&
    task.status !== 'completed' &&
    task.status !== 'validation_pending';

  // Fonction de volontariat
  const handleVolunteer = async () => {
    if (isVolunteering) return;
    
    setIsVolunteering(true);
    try {
      const updatedAssignedTo = [...(task.assignedTo || []), user.uid];
      
      await taskService.updateTask(task.id, {
        assignedTo: updatedAssignedTo,
        status: task.status === 'todo' ? 'in_progress' : task.status,
        updatedAt: new Date()
      });

      console.log('✅ Volontariat enregistré avec succès');
      
      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    } finally {
      setIsVolunteering(false);
    }
  };

  // Fonction pour ne plus être volontaire
  const handleUnvolunteer = async () => {
    if (!onUnvolunteer) return;
    
    try {
      await onUnvolunteer(task.id);
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('❌ Erreur désengagement:', error);
    }
  };

  // 💬 GESTIONNAIRE CLIC COMMENTAIRES
  const handleCommentsClick = () => {
    console.log('💬 Ouverture commentaires pour tâche:', task.id);
    if (onViewDetails) {
      onViewDetails(task, 'comments'); // Ouvrir directement sur l'onglet commentaires
    }
  };

  // ✅ VALIDATION OBLIGATOIRE
  if (!task) {
    console.warn('⚠️ TaskCard: task manquant');
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 shadow-lg relative">
      
      {/* 💬 BADGE COMMENTAIRES - POSITION ABSOLUE TOP-RIGHT TRÈS VISIBLE */}
      <div className="absolute top-3 right-3 z-20">
        <CommentNotificationBadge
          taskId={task.id}
          onClick={handleCommentsClick}
        />
      </div>

      {/* En-tête avec titre et statut */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight pr-20">
            {task.title}
          </h3>
        </div>

        {/* Badge de statut */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-700' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            task.status === 'validation_pending' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.status === 'completed' ? 'Terminée' :
             task.status === 'in_progress' ? 'En cours' :
             task.status === 'validation_pending' ? 'En validation' :
             'En attente'}
          </span>
          
          {/* Badge de priorité */}
          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
      </div>

      {/* Description courte */}
      {task.description && (
        <div className="mb-3">
          <p className="text-gray-300 text-sm line-clamp-2">
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...`
              : task.description
            }
          </p>
        </div>
      )}

      {/* Métadonnées */}
      <div className="space-y-2 text-sm text-gray-400 mb-4">
        
        {/* Créateur */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Créé par: {task.createdBy || 'Anonyme'}</span>
        </div>

        {/* Assignés */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              Assigné à {task.assignedTo.length} personne{task.assignedTo.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}

        {/* Récompense XP */}
        {task.xpReward && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">+{task.xpReward} XP</span>
          </div>
        )}

        {/* Ouvert aux volontaires */}
        {task.openToVolunteers && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-green-400">Ouvert aux volontaires</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Voir détails */}
        <button
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>

        {/* Bouton de soumission */}
        {isAssignedToMe && task.status !== 'completed' && task.status !== 'validation_pending' && (
          <SubmitTaskButton
            task={task}
            onSubmit={onSubmit}
            onTaskUpdate={onTaskUpdate}
          />
        )}

        {/* Devenir volontaire */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={isVolunteering}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {isVolunteering ? 'En cours...' : 'Volontaire'}
          </button>
        )}

        {/* Ne plus être volontaire */}
        {isAssignedToMe && !isTaskOwner && onUnvolunteer && (
          <button
            onClick={handleUnvolunteer}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Se désengager
          </button>
        )}

        {/* Actions propriétaire */}
        {(isTaskOwner || isMyTask) && (
          <>
            <button
              onClick={() => onEdit && onEdit(task)}
              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </>
        )}
      </div>

      {/* Indicateur de nouveaux commentaires au bas de la carte */}
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {task.id.slice(-8)}</span>
          <div className="flex items-center gap-2">
            <span>💬 Cliquez sur le badge pour voir les commentaires</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
