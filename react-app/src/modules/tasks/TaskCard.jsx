// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CORRECTION DU BOUTON "VOIR DÉTAILS" - VERSION QUÊTES
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
  Send,
  Eye
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
  completed: { label: 'Accomplie', color: 'bg-green-600', textColor: 'text-green-300' },
  validated: { label: 'Validée', color: 'bg-purple-600', textColor: 'text-purple-300' }
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
          Envoi...
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
 * 🎯 COMPOSANT PRINCIPAL TASKCARD - VERSION CORRIGÉE
 */
const TaskCard = ({ 
  task, 
  currentUser,
  onViewDetails,  // ⚡ FONCTION CRITIQUE
  onEdit, 
  onDelete, 
  onVolunteer, 
  onUnvolunteer,
  onSubmit,
  onTaskUpdate
}) => {
  const { user } = useAuthStore();
  const [volunteering, setVolunteering] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState({ name: 'Chargement...', loading: true });
  const [assigneeInfo, setAssigneeInfo] = useState({ names: [], loading: true });

  // Déterminer si l'utilisateur est assigné
  const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
  const isAssignedToMe = assignedTo.includes(user?.uid);
  const isTaskOwner = task.createdBy === user?.uid;
  const isMyTask = isAssignedToMe || isTaskOwner;
  
  const canVolunteer = !isAssignedToMe && 
                       (task.openToVolunteers || assignedTo.length === 0) && 
                       task.status === 'todo';
  
  const canSubmit = isAssignedToMe && 
                    task.status === 'in_progress' && 
                    task.status !== 'validation_pending';

  // Charger info créateur
  useEffect(() => {
    const loadCreatorInfo = async () => {
      if (task.createdBy) {
        try {
          const userDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCreatorInfo({
              name: userData.displayName || userData.email || 'Utilisateur',
              loading: false
            });
          }
        } catch (error) {
          console.error('Erreur chargement créateur:', error);
          setCreatorInfo({ name: task.createdByName || 'Inconnu', loading: false });
        }
      }
    };
    loadCreatorInfo();
  }, [task.createdBy]);

  // Charger info assignés
  useEffect(() => {
    const loadAssigneeInfo = async () => {
      if (assignedTo.length > 0) {
        try {
          const names = await Promise.all(
            assignedTo.map(async (userId) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return userData.displayName || userData.email || 'Utilisateur';
                }
                return 'Inconnu';
              } catch {
                return 'Inconnu';
              }
            })
          );
          setAssigneeInfo({ names, loading: false });
        } catch (error) {
          console.error('Erreur chargement assignés:', error);
          setAssigneeInfo({ names: ['Inconnu'], loading: false });
        }
      } else {
        setAssigneeInfo({ names: [], loading: false });
      }
    };
    loadAssigneeInfo();
  }, [task.assignedTo]);

  // Handlers
  const handleVolunteer = async () => {
    if (!user || volunteering) return;
    setVolunteering(true);
    try {
      if (onVolunteer) {
        await onVolunteer(task);
      }
    } finally {
      setVolunteering(false);
    }
  };

  const handleUnvolunteer = async () => {
    if (!user || volunteering) return;
    setVolunteering(true);
    try {
      if (onUnvolunteer) {
        await onUnvolunteer(task);
      }
    } finally {
      setVolunteering(false);
    }
  };

  // 🎨 Obtenir config statut/priorité
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  // 📅 Formater date
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-all">
      
      {/* Header avec badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${priorityConfig.color} ${priorityConfig.textColor} px-2 py-1 rounded text-xs font-medium`}>
            {priorityConfig.label}
          </span>
          <span className={`${statusConfig.color} ${statusConfig.textColor} px-2 py-1 rounded text-xs font-medium`}>
            {statusConfig.label}
          </span>
        </div>
        
        {task.xpReward && (
          <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            ⭐ {task.xpReward} XP
          </span>
        )}
      </div>

      {/* Titre et description */}
      <h3 className="text-white font-semibold text-lg mb-2">{task.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>

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
        {task.estimatedHours && (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Durée: {task.estimatedHours}h</span>
          </div>
        )}
      </div>

      {/* Actions - CORRECTION CRITIQUE ICI */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* ⚡ BOUTON VOIR DÉTAILS - CORRIGÉ */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔍 [TASKCARD] Clic Voir détails, task:', task.id);
            if (onViewDetails) {
              console.log('✅ [TASKCARD] Appel onViewDetails');
              onViewDetails(task);
            } else {
              console.error('❌ [TASKCARD] onViewDetails non défini!');
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Voir détails
        </button>

        {/* Soumettre */}
        {canSubmit && onSubmit && (
          <SubmitButton task={task} onSubmit={onSubmit} disabled={false} />
        )}

        {/* Se porter volontaire */}
        {canVolunteer && onVolunteer && (
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
                Volontaire
              </>
            )}
          </button>
        )}

        {/* Se désassigner */}
        {isAssignedToMe && !isTaskOwner && onUnvolunteer && (
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

        {/* Modifier */}
        {(isTaskOwner || isMyTask) && onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        )}

        {/* Supprimer */}
        {(isTaskOwner || isMyTask) && onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        )}
      </div>

      {/* Indicateur assignation */}
      {isAssignedToMe && (
        <div className="mt-3 px-3 py-2 bg-green-900/30 border border-green-600/50 rounded-lg text-green-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">✅ Vous êtes assigné à cette quête</span>
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
