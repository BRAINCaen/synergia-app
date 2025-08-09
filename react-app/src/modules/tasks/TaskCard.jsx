// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CODE COMPLET AVEC BOUTON "NE PLUS ÊTRE VOLONTAIRE"
// ==========================================

import React, { useState } from 'react';
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
  Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { taskService } from '../../core/services/taskService.js';
import SubmitTaskButton from './SubmitTaskButton.jsx';

// ✅ COMPOSANT TEMPORAIRE EN ATTENDANT LE FICHIER CommentBadge.jsx
const CommentBadgeTemp = ({ entityType, entityId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        if (!entityType || !entityId) {
          setLoading(false);
          return;
        }
        const { collaborationService } = await import('../../core/services/collaborationService.js');
        const comments = await collaborationService.getComments(entityType, entityId);
        const count = Array.isArray(comments) ? comments.length : 0;
        setCommentCount(count);
      } catch (error) {
        console.warn('CommentBadgeTemp error:', error);
        setCommentCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [entityType, entityId]);

  if (loading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
      </div>
    );
  }

  if (commentCount === 0) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors ${className}`}
      title={`${commentCount} commentaire${commentCount > 1 ? 's' : ''} - Cliquer pour voir`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
      <span>{commentCount}</span>
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
 * 🎯 COMPOSANT TASKCARD AVEC BOUTON "NE PLUS ÊTRE VOLONTAIRE"
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

  // État de la soumission - VERSION CORRIGÉE
  const handleSubmissionSuccess = async () => {
    console.log('✅ Soumission réussie pour tâche:', task.id);
    
    try {
      // ✅ CORRECTION : Forcer la mise à jour du statut
      await taskService.updateTask(task.id, {
        status: 'validation_pending',
        submittedAt: new Date(),
        submittedBy: user.uid,
        submissionNotes: 'Tâche soumise pour validation',
        updatedAt: new Date()
      });
      
      console.log('✅ Statut mis à jour vers validation_pending');
      
      // Notifier le parent pour recharger les données
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
      // Callback original
      if (onSubmit) {
        onSubmit(task.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
  };

  // 🔧 FONCTION VOLONTAIRE CORRIGÉE
  const handleVolunteer = async () => {
    try {
      setIsVolunteering(true);
      console.log('🙋‍♂️ Volontariat pour tâche:', task.title);

      // ✅ CORRECTION: Vérification AVANT d'ajouter
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      
      // 🛡️ SÉCURITÉ: Vérification obligatoire
      if (currentAssigned.includes(user.uid)) {
        console.warn('⚠️ Utilisateur déjà assigné à cette tâche');
        return; // SORTIR IMMÉDIATEMENT
      }

      console.log('📋 Current assignedTo:', currentAssigned);
      console.log('👤 User ID:', user.uid);

      const updatedAssigned = [...currentAssigned, user.uid];
      console.log('📋 Updated assignedTo:', updatedAssigned);

      // ✅ METTRE À JOUR AVEC VÉRIFICATION
      await taskService.updateTask(task.id, {
        assignedTo: updatedAssigned,
        status: task.status === 'pending' ? 'in_progress' : task.status,
        updatedAt: new Date()
      });

      console.log('✅ Volontariat enregistré avec succès');
      
      // Notifier la mise à jour
      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    } finally {
      setIsVolunteering(false);
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
      
      {/* 💬 BADGE COMMENTAIRES - POSITION ABSOLUE TOP-RIGHT */}
      <div className="absolute top-2 right-2 z-10">
        <CommentBadgeTemp
          entityType="task"
          entityId={task.id}
          onClick={handleCommentsClick}
        />
      </div>

      {/* En-tête avec titre et statut */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight pr-16">
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
             'À faire'}
          </span>

          {/* Badge de priorité */}
          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Métadonnées */}
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        
        {/* Créateur */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Créé par: {task.creatorName || 'Utilisateur'}</span>
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

        {/* Date de création */}
        {task.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {task.createdAt.toDate ? 
                task.createdAt.toDate().toLocaleDateString('fr-FR') : 
                new Date(task.createdAt).toLocaleDateString('fr-FR')
              }
            </span>
          </div>
        )}

        {/* Difficulté */}
        {task.difficulty && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>Difficulté: {task.difficulty}</span>
          </div>
        )}

        {/* XP Reward */}
        {task.xpReward && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">+{task.xpReward} XP</span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-600">
        
        {/* Bouton voir détails */}
        <button
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>

        {/* Actions propriétaire */}
        {isTaskOwner && (
          <>
            <button
              onClick={() => onEdit && onEdit(task)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </>
        )}

        {/* Bouton volontaire */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={isVolunteering}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
              isVolunteering 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isVolunteering ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Inscription...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Volontaire
              </>
            )}
          </button>
        )}

        {/* ✅ NOUVEAU - Bouton se retirer (UNIQUEMENT pour mes tâches) */}
        {isMyTask && isAssignedToMe && (
          <button
            onClick={() => onUnvolunteer && onUnvolunteer()}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
            title="Ne plus être volontaire"
          >
            <UserMinus className="w-4 h-4" />
            Ne plus être volontaire
          </button>
        )}

        {/* Bouton de soumission pour mes tâches - VERSION CORRIGÉE */}
        {isMyTask && task.status !== 'completed' && task.status !== 'validation_pending' && (
          <SubmitTaskButton 
            task={task}
            onSuccess={handleSubmissionSuccess}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          />
        )}
      </div>
    </div>
  );
};

export default TaskCard;
