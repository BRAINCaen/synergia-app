// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// COMPOSANT TÂCHE CORRIGÉ - CHARGEMENT UTILISATEURS ET FONCTIONNALITÉS
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
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 📬 COMPOSANT BADGE DE NOTIFICATION COMMENTAIRES
 */
const CommentNotificationBadge = ({ taskId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = useState(0);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30 ${className}`}
      title="Voir les commentaires"
    >
      <MessageCircle className="w-3 h-3" />
      <span>{commentCount}</span>
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
      {submitting ? 'Soumission...' : 'Soumettre'}
    </button>
  );
};

/**
 * 🎯 COMPOSANT TASKCARD CORRIGÉ
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
  
  // 🔥 ÉTATS POUR GÉRER LES DONNÉES UTILISATEUR
  const [creatorInfo, setCreatorInfo] = useState({ name: 'Chargement...', loading: true });
  const [assigneeInfo, setAssigneeInfo] = useState({ names: [], loading: true });
  const [volunteering, setVolunteering] = useState(false);

  // ✅ FONCTION CORRIGÉE POUR RÉCUPÉRER UN UTILISATEUR
  const fetchUserInfo = async (userId) => {
    try {
      if (!userId) {
        return { displayName: 'Utilisateur inconnu', email: '' };
      }

      console.log('🔍 [TASKCARD] Récupération utilisateur:', userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ [TASKCARD] Utilisateur trouvé:', userData.displayName || userData.email);
        return {
          displayName: userData.displayName || userData.email || 'Utilisateur',
          email: userData.email || ''
        };
      } else {
        console.warn('⚠️ [TASKCARD] Utilisateur non trouvé:', userId);
        return { displayName: 'Utilisateur inconnu', email: '' };
      }
    } catch (error) {
      console.error('❌ [TASKCARD] Erreur récupération utilisateur:', userId, error);
      return { displayName: 'Erreur de chargement', email: '' };
    }
  };

  // ✅ CHARGER LES INFOS DU CRÉATEUR
  useEffect(() => {
    const loadCreatorInfo = async () => {
      if (!task?.createdBy) {
        setCreatorInfo({ name: 'Créateur inconnu', loading: false });
        return;
      }

      try {
        const userInfo = await fetchUserInfo(task.createdBy);
        setCreatorInfo({ 
          name: userInfo.displayName, 
          loading: false 
        });
      } catch (error) {
        console.error('❌ [TASKCARD] Erreur chargement créateur:', error);
        setCreatorInfo({ name: 'Erreur de chargement', loading: false });
      }
    };

    loadCreatorInfo();
  }, [task?.createdBy]);

  // ✅ CHARGER LES INFOS DES ASSIGNÉS
  useEffect(() => {
    const loadAssigneeInfo = async () => {
      if (!task?.assignedTo || !Array.isArray(task.assignedTo) || task.assignedTo.length === 0) {
        setAssigneeInfo({ names: [], loading: false });
        return;
      }

      try {
        const assigneePromises = task.assignedTo.map(userId => fetchUserInfo(userId));
        const assigneeData = await Promise.all(assigneePromises);
        const names = assigneeData.map(user => user.displayName);
        
        setAssigneeInfo({ 
          names: names, 
          loading: false 
        });
      } catch (error) {
        console.error('❌ [TASKCARD] Erreur chargement assignés:', error);
        setAssigneeInfo({ names: ['Erreur de chargement'], loading: false });
      }
    };

    loadAssigneeInfo();
  }, [task?.assignedTo]);

  // 🎯 FONCTION VOLONTARIAT CORRIGÉE
  const handleVolunteer = async () => {
    if (!user?.uid || !task?.id || volunteering) return;

    setVolunteering(true);
    
    try {
      console.log('🤝 [TASKCARD] Se porter volontaire pour:', task.id);
      
      const taskRef = doc(db, 'tasks', task.id);
      
      // Ajouter l'utilisateur aux assignés
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(user.uid),
        updatedAt: new Date()
      });

      console.log('✅ [TASKCARD] Volontariat enregistré');
      
      // Notification succès
      if (window.showNotification) {
        window.showNotification('Vous vous êtes porté volontaire !', 'success');
      }

      // Callback
      if (onVolunteer) {
        onVolunteer(task.id);
      }

      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ [TASKCARD] Erreur volontariat:', error);
      
      if (window.showNotification) {
        window.showNotification('Erreur lors du volontariat', 'error');
      }
    } finally {
      setVolunteering(false);
    }
  };

  // 🔄 FONCTION SE DÉSASSIGNER
  const handleUnvolunteer = async () => {
    if (!user?.uid || !task?.id || volunteering) return;

    setVolunteering(true);
    
    try {
      console.log('↩️ [TASKCARD] Se désassigner de:', task.id);
      
      const taskRef = doc(db, 'tasks', task.id);
      
      // Retirer l'utilisateur des assignés
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(user.uid),
        updatedAt: new Date()
      });

      console.log('✅ [TASKCARD] Désassignation effectuée');
      
      // Notification
      if (window.showNotification) {
        window.showNotification('Vous n\'êtes plus assigné à cette tâche', 'info');
      }

      // Callback
      if (onUnvolunteer) {
        onUnvolunteer(task.id);
      }

      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ [TASKCARD] Erreur désassignation:', error);
      
      if (window.showNotification) {
        window.showNotification('Erreur lors de la désassignation', 'error');
      }
    } finally {
      setVolunteering(false);
    }
  };

  // ✅ VÉRIFICATIONS DE STATUT
  const isTaskOwner = user && task && task.createdBy === user.uid;
  const isAssignedToMe = Array.isArray(task?.assignedTo) 
    ? task.assignedTo.includes(user?.uid)
    : task?.assignedTo === user?.uid;
  
  const canVolunteer = !isAssignedToMe && 
                      !isTaskOwner && 
                      task?.status !== 'completed' && 
                      task?.status !== 'validation_pending' &&
                      task?.openToVolunteers !== false;

  // 🎨 COULEURS SELON LE STATUT
  const getStatusColor = () => {
    switch (task?.status) {
      case 'completed':
        return 'border-green-500 bg-green-900/20';
      case 'in_progress':
        return 'border-blue-500 bg-blue-900/20';
      case 'validation_pending':
        return 'border-yellow-500 bg-yellow-900/20';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (task?.status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'validation_pending':
        return '⏳';
      default:
        return '📋';
    }
  };

  if (!task) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <p className="text-gray-400">Tâche non disponible</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${getStatusColor()}`}>
      
      {/* Header avec titre et statut */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getStatusIcon()}</span>
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {task.title || 'Tâche sans titre'}
            </h3>
          </div>
          
          {task.description && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
        </div>

        <CommentNotificationBadge 
          taskId={task.id} 
          onClick={() => onViewDetails && onViewDetails(task)}
        />
      </div>

      {/* Informations de la tâche */}
      <div className="space-y-2 text-sm text-gray-300 mb-4">
        
        {/* Créé par - VERSION CORRIGÉE */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>
            Créé par: {creatorInfo.loading ? (
              <span className="text-gray-500 animate-pulse">Chargement...</span>
            ) : (
              <span className="text-white font-medium">{creatorInfo.name}</span>
            )}
          </span>
        </div>

        {/* Assignés - VERSION CORRIGÉE */}
        {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>
              Assigné à: {assigneeInfo.loading ? (
                <span className="text-gray-500 animate-pulse">Chargement...</span>
              ) : assigneeInfo.names.length > 0 ? (
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {assigneeInfo.names.map((name, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Non assigné</span>
              )}
            </span>
          </div>
        )}

        {/* Échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Échéance: <span className="text-white">
                {new Date(task.dueDate).toLocaleDateString('fr-FR')}
              </span>
            </span>
          </div>
        )}

        {/* Récompense XP */}
        {task.xpReward && (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">+{task.xpReward} XP</span>
          </div>
        )}

        {/* Ouvert aux volontaires */}
        {task.openToVolunteers && (
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-green-400 font-medium">Ouvert aux volontaires</span>
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

        {/* 🔥 BOUTON VOLONTARIAT CORRIGÉ */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={volunteering || !user}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {volunteering ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Traitement...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Se porter volontaire
              </>
            )}
          </button>
        )}

        {/* Se désassigner */}
        {isAssignedToMe && !isTaskOwner && (
          <button
            onClick={handleUnvolunteer}
            disabled={volunteering}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {volunteering ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Traitement...
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4" />
                Se désassigner
              </>
            )}
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

      {/* 🔥 INDICATEUR D'ASSIGNATION */}
      {isAssignedToMe && (
        <div className="mt-3 px-3 py-2 bg-green-900/30 border border-green-600/50 rounded-lg text-green-300 text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span className="font-medium">✅ Vous êtes assigné à cette tâche</span>
        </div>
      )}

      {/* Indicateur de statut en validation */}
      {task.status === 'validation_pending' && isAssignedToMe && (
        <div className="mt-3 px-3 py-2 bg-yellow-900/30 border border-yellow-600/50 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-medium">⏳ En attente de validation</span>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-3 pt-2 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {task.id?.slice(-8)}</span>
          <span>Status: {task.status}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
