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
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 📬 COMPOSANT BADGE DE NOTIFICATION COMMENTAIRES - AMÉLIORÉ AVEC FIREBASE
 */
const CommentNotificationBadge = ({ taskId, onClick, className = '' }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    // Écoute temps réel Firebase
    const commentsQuery = query(
      collection(db, 'comments'),
      where('entityType', '==', 'task'),
      where('entityId', '==', taskId)
    );

    const unsubscribe = onSnapshot(commentsQuery, 
      (snapshot) => {
        setCommentCount(snapshot.size);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur badge commentaires:', error);
        setCommentCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [taskId]);

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
      className={`relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 ${className}`}
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
        console.log('👥 [TASKCARD] Chargement assignés:', task.assignedTo);
        
        const assigneePromises = task.assignedTo.map(userId => fetchUserInfo(userId));
        const assigneeResults = await Promise.all(assigneePromises);
        const assigneeNames = assigneeResults.map(result => result.displayName);
        
        console.log('✅ [TASKCARD] Assignés chargés:', assigneeNames);
        setAssigneeInfo({ names: assigneeNames, loading: false });
      } catch (error) {
        console.error('❌ [TASKCARD] Erreur chargement assignés:', error);
        setAssigneeInfo({ names: [], loading: false });
      }
    };

    loadAssigneeInfo();
  }, [task?.assignedTo]);

  // 🎯 FONCTIONS DE GESTION
  const effectiveUser = currentUser || user;
  const isAssignedToMe = effectiveUser && task?.assignedTo?.includes(effectiveUser.uid);
  const isTaskOwner = effectiveUser && task?.createdBy === effectiveUser.uid;
  const canSubmit = isAssignedToMe && task?.status !== 'completed' && onSubmit;

  // ✅ SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    if (!effectiveUser?.uid || volunteering) return;
    
    setVolunteering(true);
    try {
      if (onVolunteer) {
        await onVolunteer(task.id);
      } else {
        // Fallback: ajouter directement à Firebase
        const taskRef = doc(db, 'tasks', task.id);
        const currentAssigned = task.assignedTo || [];
        
        if (!currentAssigned.includes(effectiveUser.uid)) {
          await updateDoc(taskRef, {
            assignedTo: [...currentAssigned, effectiveUser.uid]
          });
        }
      }
      
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
    } catch (error) {
      console.error('❌ [TASKCARD] Erreur volontariat:', error);
    } finally {
      setVolunteering(false);
    }
  };

  // ✅ SE DÉSASSIGNER
  const handleUnvolunteer = async () => {
    if (!effectiveUser?.uid || volunteering) return;
    
    setVolunteering(true);
    try {
      if (onUnvolunteer) {
        await onUnvolunteer(task.id);
      } else {
        // Fallback: retirer directement de Firebase
        const taskRef = doc(db, 'tasks', task.id);
        const currentAssigned = task.assignedTo || [];
        
        const newAssigned = currentAssigned.filter(uid => uid !== effectiveUser.uid);
        await updateDoc(taskRef, {
          assignedTo: newAssigned
        });
      }
      
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
    } catch (error) {
      console.error('❌ [TASKCARD] Erreur désassignation:', error);
    } finally {
      setVolunteering(false);
    }
  };

  // 🎨 FORMATAGE DE DATE
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // 🎨 COULEURS DE PRIORITÉ
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 🎨 COULEURS DE STATUT
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'validation_pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!task) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="text-gray-500">Aucune tâche à afficher</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      {/* En-tête avec titre et badge commentaires */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {task.title}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Statut */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'completed' ? 'Terminée' :
               task.status === 'in_progress' ? 'En cours' :
               task.status === 'validation_pending' ? 'En validation' : 'À faire'}
            </span>
            
            {/* Priorité */}
            {task.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                Priorité {task.priority}
              </span>
            )}
            
            {/* Badge commentaires - AMÉLIORATION ICI */}
            <CommentNotificationBadge 
              taskId={task.id} 
              onClick={() => onViewDetails && onViewDetails(task, 'comments')}
            />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails && onViewDetails(task)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Méta-informations */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        {/* Créateur */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Créé par: {creatorInfo.loading ? 'Chargement...' : creatorInfo.name}</span>
        </div>

        {/* Assignés */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              Assigné à: {assigneeInfo.loading ? 'Chargement...' : assigneeInfo.names.join(', ')}
            </span>
          </div>
        )}

        {/* Date d'échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Échéance: {formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* XP */}
        {task.xpReward && task.xpReward > 0 && (
          <div className="flex items-center gap-2 text-yellow-600">
            <Trophy className="w-4 h-4" />
            <span>+{task.xpReward} XP</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Soumission pour assignés */}
        {canSubmit && (
          <SubmitTaskButton 
            task={task}
            onSubmit={onSubmit}
            onTaskUpdate={onTaskUpdate}
          />
        )}

        {/* Se porter volontaire */}
        {effectiveUser && !isAssignedToMe && !isTaskOwner && task.status !== 'completed' && (
          <button
            onClick={handleVolunteer}
            disabled={volunteering}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
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
