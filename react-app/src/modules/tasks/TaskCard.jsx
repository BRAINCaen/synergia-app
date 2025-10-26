// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CORRECTION DU BOUTON SUPPRIMER
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Send
} from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🎯 CONFIGURATION DES PRIORITÉS
 */
const PRIORITY_CONFIG = {
  low: {
    label: 'Priorité basse',
    color: 'bg-green-600',
    textColor: 'text-green-300'
  },
  medium: {
    label: 'Priorité medium',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-300'
  },
  high: {
    label: 'Priorité high',
    color: 'bg-red-600',
    textColor: 'text-red-300'
  }
};

/**
 * 🎯 CONFIGURATION DES STATUTS
 */
const STATUS_CONFIG = {
  todo: { label: 'À faire', color: 'bg-gray-600', textColor: 'text-gray-300' },
  in_progress: { label: 'En cours', color: 'bg-blue-600', textColor: 'text-blue-300' },
  validation_pending: { label: 'En validation', color: 'bg-yellow-600', textColor: 'text-yellow-300' },
  completed: { label: 'Terminée', color: 'bg-green-600', textColor: 'text-green-300' }
};

/**
 * 🎯 COMPOSANT SUBMIT BUTTON
 */
const SubmitButton = ({ task, onSubmit, disabled }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(task);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={disabled || submitting}
      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Soumission...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Soumettre
        </>
      )}
    </button>
  );
};

/**
 * 🎯 BADGE DE RÉCOMPENSE XP
 */
const XPBadge = ({ xp }) => {
  if (!xp) return null;
  
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-600/50 rounded-full text-yellow-300 text-xs font-medium">
      <span className="text-yellow-400">⭐</span>
      +{xp} XP
    </div>
  );
};

/**
 * 🎯 INDICATEUR DE RÔLES
 */
const RoleIndicator = ({ requiredRole }) => {
  if (!requiredRole) return null;
  
  const roleLabels = {
    family_member: '👨‍👩‍👧‍👦 Famille',
    coloc: '🏠 Coloc',
    teammate: '⚽ Équipe',
    admin: '👑 Admin'
  };
  
  return (
    <div className="px-2 py-1 bg-purple-900/30 border border-purple-600/50 rounded-full text-purple-300 text-xs font-medium">
      {roleLabels[requiredRole] || requiredRole}
    </div>
  );
};

/**
 * 🎯 COMPOSANT SUBMITBUTTON SÉPARÉ POUR LE BOUTON SOUMETTRE
 */
const SubmitButtonComponent = ({ task, onSubmit, disabled }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(task);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={disabled || submitting}
      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
    >
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
        console.log('🔍 [TASKCARD] Chargement assignés:', task.assignedTo);
        
        const assigneePromises = task.assignedTo.map(userId => fetchUserInfo(userId));
        const assigneeData = await Promise.all(assigneePromises);
        
        const names = assigneeData.map(user => user.displayName);
        
        console.log('✅ [TASKCARD] Assignés chargés:', names);
        setAssigneeInfo({ names, loading: false });
      } catch (error) {
        console.error('❌ [TASKCARD] Erreur chargement assignés:', error);
        setAssigneeInfo({ names: ['Erreur de chargement'], loading: false });
      }
    };

    loadAssigneeInfo();
  }, [task?.assignedTo]);

  // ✅ GESTIONNAIRE DE VOLONTARIAT
  const handleVolunteer = async () => {
    if (!user || !task) return;
    
    setVolunteering(true);
    try {
      console.log('🙋 [TASKCARD] Se porter volontaire pour:', task.title);
      
      const taskRef = doc(db, 'tasks', task.id);
      const taskData = task;
      
      // Récupérer les assignés actuels
      const currentAssigned = Array.isArray(taskData.assignedTo) 
        ? taskData.assignedTo 
        : [];
      
      // Vérifier si déjà assigné
      if (currentAssigned.includes(user.uid)) {
        console.log('⚠️ [TASKCARD] Déjà assigné');
        if (window.showNotification) {
          window.showNotification('Vous êtes déjà assigné à cette tâche', 'info');
        }
        return;
      }
      
      // Ajouter l'utilisateur aux assignés
      const updatedAssigned = [...currentAssigned, user.uid];
      
      await updateDoc(taskRef, {
        assignedTo: updatedAssigned,
        status: 'in_progress',
        updatedAt: new Date()
      });

      console.log('✅ [TASKCARD] Volontariat enregistré');
      
      // Notification
      if (window.showNotification) {
        window.showNotification('Vous êtes maintenant assigné à cette tâche', 'success');
      }

      // Callbacks
      if (onVolunteer) {
        onVolunteer(task);
      }

      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error) {
      console.error('❌ [TASKCARD] Erreur volontariat:', error);
      
      if (window.showNotification) {
        window.showNotification('Erreur lors de l\'assignation', 'error');
      }
    } finally {
      setVolunteering(false);
    }
  };

  // ✅ GESTIONNAIRE DE DÉSASSIGNATION
  const handleUnvolunteer = async () => {
    if (!user || !task) return;
    
    setVolunteering(true);
    try {
      console.log('👋 [TASKCARD] Se désassigner de:', task.title);
      
      const taskRef = doc(db, 'tasks', task.id);
      const taskData = task;
      
      // Récupérer les assignés actuels
      const currentAssigned = Array.isArray(taskData.assignedTo) 
        ? taskData.assignedTo 
        : [];
      
      // Retirer l'utilisateur des assignés
      const updatedAssigned = currentAssigned.filter(id => id !== user.uid);
      
      // Déterminer le nouveau statut
      const newStatus = updatedAssigned.length === 0 ? 'todo' : taskData.status;
      
      await updateDoc(taskRef, {
        assignedTo: updatedAssigned,
        status: newStatus,
        updatedAt: new Date()
      });

      console.log('✅ [TASKCARD] Désassignation effectuée');
      
      // Notification
      if (window.showNotification) {
        window.showNotification('Vous n\'êtes plus assigné à cette tâche', 'info');
      }

      // Callbacks
      if (onUnvolunteer) {
        onUnvolunteer(task);
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
    : false;
  const canVolunteer = !isTaskOwner && !isAssignedToMe && task.status === 'todo';
  const canSubmit = isAssignedToMe && task.status === 'in_progress';

  // 🎨 Configuration de la priorité
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;

  // 📅 Formater la date
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300">
      {/* En-tête avec badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 ${statusConfig.color} ${statusConfig.textColor} rounded-full text-xs font-medium`}>
              {statusConfig.label}
            </span>
            <span className={`px-2 py-1 ${priorityConfig.color} ${priorityConfig.textColor} rounded-full text-xs font-medium`}>
              {priorityConfig.label}
            </span>
            <RoleIndicator requiredRole={task.requiredRole} />
            <XPBadge xp={task.xpReward} />
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
      )}

      {/* Métadonnées */}
      <div className="space-y-2 mb-4 text-sm">
        {/* Créateur */}
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>Créé par: {creatorInfo.loading ? 'Chargement...' : creatorInfo.name}</span>
        </div>

        {/* Assignés */}
        {assigneeInfo.names.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <UserPlus className="w-4 h-4" />
            <span>
              Assignés: {assigneeInfo.loading ? 'Chargement...' : assigneeInfo.names.join(', ')}
            </span>
          </div>
        )}

        {/* Date limite */}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Échéance: {formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Temps estimé */}
        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Durée estimée: {task.estimatedTime}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Voir détails */}
        <button
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Voir détails
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Soumettre */}
        {canSubmit && onSubmit && (
          <SubmitButton task={task} onSubmit={onSubmit} disabled={false} />
        )}

        {/* Se porter volontaire */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={volunteering}
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
              onClick={() => onDelete && onDelete(task)}
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
