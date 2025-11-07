// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx
// CARTE DE QUÊTE - AVEC BOUTON SOUMISSION RPG ⚔️
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
  Eye,
  MessageCircle,
  Scroll,
  Trophy
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
 * 🎯 COMPOSANT PRINCIPAL TASKCARD - AVEC BOUTON SOUMISSION
 */
const TaskCard = ({ 
  task, 
  currentUser,
  commentCount = 0,
  onViewDetails,
  onEdit, 
  onDelete, 
  onVolunteer, 
  onUnvolunteer,
  onSubmit,
  onTaskUpdate,
  onStatusChange
}) => {
  const { user } = useAuthStore();
  const [volunteering, setVolunteering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  
  // ✅ CORRECTION PRINCIPALE : Définir quand le bouton de soumission doit apparaître
  const canSubmit = isAssignedToMe && 
                    task.status === 'in_progress' && 
                    task.status !== 'validation_pending' &&
                    task.status !== 'completed' &&
                    task.status !== 'validated';

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
          setCreatorInfo({ name: 'Utilisateur', loading: false });
        }
      }
    };

    loadCreatorInfo();
  }, [task.createdBy]);

  // Charger info assignés
  useEffect(() => {
    const loadAssignees = async () => {
      if (assignedTo.length > 0) {
        try {
          const names = await Promise.all(
            assignedTo.map(async (userId) => {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.displayName || userData.email || 'Utilisateur';
              }
              return 'Utilisateur';
            })
          );
          setAssigneeInfo({ names, loading: false });
        } catch (error) {
          console.error('Erreur chargement assignés:', error);
          setAssigneeInfo({ names: ['Utilisateur'], loading: false });
        }
      } else {
        setAssigneeInfo({ names: [], loading: false });
      }
    };

    loadAssignees();
  }, [assignedTo]);

  // Handler volontariat
  const handleVolunteer = async () => {
    if (!onVolunteer) return;
    setVolunteering(true);
    try {
      await onVolunteer(task);
    } finally {
      setVolunteering(false);
    }
  };

  // Handler désassignation
  const handleUnvolunteer = async () => {
    if (!onUnvolunteer) return;
    setVolunteering(true);
    try {
      await onUnvolunteer(task);
    } finally {
      setVolunteering(false);
    }
  };

  // ✅ NOUVEAU : Handler soumission
  const handleSubmit = async (e) => {
    e.stopPropagation();
    
    console.log('⚔️ [SUBMIT] Clic sur Valider la Quête:', {
      taskId: task.id,
      title: task.title,
      status: task.status
    });

    if (!onViewDetails) {
      console.error('❌ [SUBMIT] onViewDetails non défini!');
      alert('Erreur : impossible d\'ouvrir le modal de soumission');
      return;
    }

    setSubmitting(true);
    try {
      // Ouvrir le modal de détails qui contient le formulaire de soumission
      console.log('✅ [SUBMIT] Ouverture du modal de détails avec task:', task);
      onViewDetails(task);
    } finally {
      setSubmitting(false);
    }
  };

  // Formater les dates
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR');
  };

  // Obtenir config priorité
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all relative">
      
      {/* 💬 BADGE COMMENTAIRES */}
      {commentCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg z-10 animate-pulse">
          {commentCount}
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Statut */}
        <span className={`${statusConfig.color} ${statusConfig.textColor} px-3 py-1 rounded-full text-xs font-medium`}>
          {statusConfig.label}
        </span>

        {/* Priorité */}
        <span className={`${priorityConfig.color} ${priorityConfig.textColor} px-3 py-1 rounded-full text-xs font-medium`}>
          {priorityConfig.label}
        </span>

        {/* XP */}
        {task.xpReward && (
          <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium border border-yellow-700/50">
            ⚡ {task.xpReward} XP
          </span>
        )}
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        {/* Créateur */}
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>Créé par: {creatorInfo.loading ? 'Chargement...' : creatorInfo.name}</span>
        </div>

        {/* Assignés */}
        {assignedTo.length > 0 && (
          <div className="flex items-center gap-2 text-blue-400">
            <Users className="w-4 h-4" />
            <span>
              Assigné à: {assigneeInfo.loading ? 'Chargement...' : assigneeInfo.names.join(', ')}
            </span>
          </div>
        )}

        {/* 💬 INDICATEUR COMMENTAIRES DANS LES MÉTADONNÉES */}
        {commentCount > 0 && (
          <div className="flex items-center gap-2 text-blue-400">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">
              {commentCount} commentaire{commentCount > 1 ? 's' : ''}
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

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* ⚡ BOUTON VOIR DÉTAILS */}
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
          {commentCount > 0 && (
            <span className="ml-1 bg-blue-800 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {commentCount}
            </span>
          )}
        </button>

        {/* ⚔️ BOUTON VALIDER LA QUÊTE - VOCABULAIRE RPG */}
        {canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Soumettre votre quête terminée pour validation par un Maître du Jeu"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validation...
              </>
            ) : (
              <>
                <Scroll className="w-4 h-4" />
                <Trophy className="w-4 h-4" />
                Valider la Quête
              </>
            )}
          </button>
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
          {canSubmit && (
            <span className="ml-auto text-xs bg-green-600/30 px-2 py-1 rounded">
              🎯 Prêt à valider
            </span>
          )}
        </div>
      )}

      {/* Debug info */}
      <div className="mt-3 pt-2 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {task.id?.slice(-8)}</span>
          <span>Status: {task.status}</span>
          {commentCount > 0 && (
            <span className="text-blue-400">💬 {commentCount}</span>
          )}
          {canSubmit && (
            <span className="text-green-400">⚔️ Peut valider</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
