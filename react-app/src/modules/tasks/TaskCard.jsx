// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// COMPOSANT TÂCHE AVEC SYSTÈME VOLONTARIAT INTÉGRÉ
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
import { taskVolunteerService } from '../../core/services/taskVolunteerService.js';
import { userService } from '../../core/services/userService.js';

/**
 * 📬 COMPOSANT BADGE DE NOTIFICATION COMMENTAIRES
 */
const CommentNotificationBadge = ({ taskId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [hasNewComments, setHasNewComments] = useState(false);

  // Simuler le comptage des commentaires (à connecter avec votre service)
  useEffect(() => {
    // TODO: Connecter avec le service de commentaires
    setCommentCount(0);
    setHasNewComments(false);
  }, [taskId]);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
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
 * 📤 COMPOSANT BOUTON DE SOUMISSION
 */
const SubmitTaskButton = ({ task, onSubmit, onTaskUpdate }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!onSubmit) return;
    
    setSubmitting(true);
    try {
      await onSubmit(task);
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
      {submitting ? 'Soumission...' : 'Soumettre'}
    </button>
  );
};

/**
 * 🎯 COMPOSANT TASKCARD AVEC NOMS UTILISATEURS RÉSOLUS ET SYSTÈME VOLONTARIAT INTÉGRÉ
 */
const TaskCard = ({ 
  task, 
  currentUser,
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  onVolunteer,
  onUnvolunteer,
  onTaskUpdate,
  isMyTask = false
}) => {
  const { user } = useAuthStore();
  
  // 🔥 ÉTATS VOLONTARIAT AVEC SERVICE INTÉGRÉ
  const [volunteering, setVolunteering] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // ✅ ÉTATS POUR LES NOMS D'UTILISATEURS
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUserNames, setLoadingUserNames] = useState(true);

  // ✅ Vérifications de statut CORRIGÉES
  const isTaskOwner = user && task && task.createdBy === user.uid;
  const isAssignedToMe = Array.isArray(task.assignedTo) 
    ? task.assignedTo.includes(user?.uid)
    : task.assignedTo === user?.uid;
  
  const canVolunteer = !isAssignedToMe && 
                      !isTaskOwner && 
                      task.status !== 'completed' && 
                      task.status !== 'validation_pending' &&
                      task.openToVolunteers !== false;

  // 🔥 VÉRIFICATION STATUT VOLONTARIAT AU CHARGEMENT
  useEffect(() => {
    const checkVolunteerStatus = async () => {
      if (!task?.id || !user?.uid) {
        setCheckingStatus(false);
        return;
      }
      
      try {
        const status = await taskVolunteerService.checkAssignmentStatus(task.id, user.uid);
        setIsAssigned(status.assigned);
      } catch (error) {
        console.error('Erreur vérification statut volontariat:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkVolunteerStatus();
  }, [task?.id, user?.uid]);

  // ✅ CHARGER LES NOMS D'UTILISATEURS
  useEffect(() => {
    const loadUserNames = async () => {
      if (!task) return;
      
      setLoadingUserNames(true);
      
      try {
        // Nom du créateur
        if (task.createdBy) {
          const creatorData = await userService.getUserById(task.createdBy);
          setCreatorName(creatorData?.displayName || creatorData?.email || 'Utilisateur inconnu');
        }

        // Noms des assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(userId => userService.getUserById(userId));
          const assigneeData = await Promise.all(assigneePromises);
          const names = assigneeData.map(userData => 
            userData?.displayName || userData?.email || 'Utilisateur inconnu'
          );
          setAssigneeNames(names);
        } else if (task.assignedTo && typeof task.assignedTo === 'string') {
          const assigneeData = await userService.getUserById(task.assignedTo);
          setAssigneeNames([assigneeData?.displayName || assigneeData?.email || 'Utilisateur inconnu']);
        }

      } catch (error) {
        console.error('❌ Erreur chargement noms utilisateurs:', error);
        setCreatorName('Erreur de chargement');
        setAssigneeNames(['Erreur de chargement']);
      } finally {
        setLoadingUserNames(false);
      }
    };

    loadUserNames();
  }, [task]);

  // 🔥 FONCTION SE PORTER VOLONTAIRE CORRIGÉE AVEC SERVICE
  const handleVolunteer = async () => {
    if (!user?.uid || !task?.id || volunteering) return;

    setVolunteering(true);
    try {
      if (isAssigned) {
        // Se désassigner
        await taskVolunteerService.unassignFromTask(task.id, user.uid);
        setIsAssigned(false);
        console.log('✅ Désassignation réussie');
      } else {
        // Se porter volontaire
        await taskVolunteerService.volunteerForTask(task.id, user.uid);
        setIsAssigned(true);
        console.log('✅ Volontariat enregistré');
      }
      
      // Notifier le parent pour rafraîchir la liste
      if (onTaskUpdate) {
        onTaskUpdate(task.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      // L'erreur est déjà affichée par le service
    } finally {
      setVolunteering(false);
    }
  };

  // Fonction pour ne plus être volontaire (fallback)
  const handleUnvolunteer = async () => {
    if (!onUnvolunteer) {
      // Utiliser la fonction intégrée
      return handleVolunteer();
    }
    
    try {
      await onUnvolunteer(task);
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
              ? task.description.substring(0, 100) + '...'
              : task.description}
          </p>
        </div>
      )}

      {/* Informations de la tâche */}
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        
        {/* Créateur avec nom résolu */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>
            Créé par: {loadingUserNames ? (
              <span className="text-gray-500">Chargement...</span>
            ) : (
              <span className="text-white font-medium">{creatorName}</span>
            )}
          </span>
        </div>

        {/* Assignés avec noms résolus */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              Assigné à: {loadingUserNames ? (
                <span className="text-gray-500">Chargement...</span>
              ) : assigneeNames.length > 0 ? (
                assigneeNames.map((name, index) => (
                  <span key={index} className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs mr-1 mb-1 font-medium">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Utilisateurs anonymes</span>
              )}
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

        {/* 🔥 BOUTON VOLONTARIAT CORRIGÉ AVEC SERVICE INTÉGRÉ */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={volunteering || checkingStatus || !user}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded border transition-colors disabled:opacity-50 ${
              isAssigned
                ? 'border-red-600 text-red-400 hover:bg-red-900/20'
                : 'border-green-600 text-green-400 hover:bg-green-900/20'
            }`}
          >
            {volunteering ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Traitement...
              </>
            ) : isAssigned ? (
              <>
                <UserMinus className="w-4 h-4" />
                Se désassigner
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Se porter volontaire
              </>
            )}
          </button>
        )}

        {/* Ne plus être volontaire (fallback pour compatibilité) */}
        {isAssignedToMe && !isTaskOwner && onUnvolunteer && !canVolunteer && (
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

      {/* 🔥 INDICATEUR D'ASSIGNATION AVEC SERVICE */}
      {isAssigned && (
        <div className="mt-3 px-2 py-1 bg-green-900/30 border border-green-600/50 rounded text-green-300 text-xs">
          ✅ Vous êtes assigné à cette tâche
        </div>
      )}

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
