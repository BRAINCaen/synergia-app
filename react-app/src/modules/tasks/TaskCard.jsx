// ==========================================
// react-app/src/modules/tasks/TaskCard.jsx
// CARTE DE QUETE - RESPONSIVE MOBILE
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  MessageCircle,
  Scroll,
  Trophy,
  Zap
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

// Configuration des priorites
const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'bg-green-600', textColor: 'text-green-300' },
  medium: { label: 'Medium', color: 'bg-yellow-600', textColor: 'text-yellow-300' },
  high: { label: 'Haute', color: 'bg-orange-600', textColor: 'text-orange-300' },
  urgent: { label: 'Urgente', color: 'bg-red-600', textColor: 'text-red-300' }
};

// Configuration des statuts
const STATUS_CONFIG = {
  todo: { label: 'A faire', color: 'bg-gray-600', textColor: 'text-gray-300', icon: '📋' },
  in_progress: { label: 'En cours', color: 'bg-blue-600', textColor: 'text-blue-300', icon: '🚀' },
  validation_pending: { label: 'Validation', color: 'bg-yellow-600', textColor: 'text-yellow-300', icon: '⏳' },
  completed: { label: 'Terminee', color: 'bg-green-600', textColor: 'text-green-300', icon: '✅' },
  validated: { label: 'Validee', color: 'bg-purple-600', textColor: 'text-purple-300', icon: '🏆' },
  cancelled: { label: 'Annulee', color: 'bg-red-600', textColor: 'text-red-300', icon: '❌' }
};

const TaskCard = ({
  task,
  commentCount = 0,
  viewMode = 'cards',
  isHistoryMode = false,
  onViewDetails,
  onEdit,
  onDelete,
  onVolunteer,
  onUnvolunteer,
  onAbandon,
  onStatusChange
}) => {
  const { user } = useAuthStore();
  const [volunteering, setVolunteering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState({ name: 'Chargement...', loading: true });
  const [assigneeInfo, setAssigneeInfo] = useState({ names: [], loading: true });

  // Determiner si l'utilisateur est assigne
  const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
  const isAssignedToMe = assignedTo.includes(user?.uid);
  const isTaskOwner = task.createdBy === user?.uid;
  const isMyTask = isAssignedToMe || isTaskOwner;

  const canVolunteer = !isAssignedToMe &&
                       (task.openToVolunteers || assignedTo.length === 0) &&
                       task.status === 'todo';

  const canSubmit = isAssignedToMe &&
                    task.status === 'in_progress' &&
                    task.status !== 'validation_pending' &&
                    task.status !== 'completed' &&
                    task.status !== 'validated';

  // Charger info createur
  useEffect(() => {
    const loadCreatorInfo = async () => {
      if (task.createdBy) {
        try {
          const userDoc = await getDoc(doc(db, 'users', task.createdBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCreatorInfo({
              name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
              loading: false
            });
          }
        } catch (error) {
          setCreatorInfo({ name: 'Utilisateur', loading: false });
        }
      }
    };
    loadCreatorInfo();
  }, [task.createdBy]);

  // Charger info assignes
  useEffect(() => {
    const loadAssignees = async () => {
      if (assignedTo.length > 0) {
        try {
          const names = await Promise.all(
            assignedTo.slice(0, 3).map(async (userId) => {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.displayName || userData.email?.split('@')[0] || 'Utilisateur';
              }
              return 'Utilisateur';
            })
          );
          const displayNames = assignedTo.length > 3
            ? [...names, `+${assignedTo.length - 3}`]
            : names;
          setAssigneeInfo({ names: displayNames, loading: false });
        } catch (error) {
          setAssigneeInfo({ names: ['Utilisateur'], loading: false });
        }
      } else {
        setAssigneeInfo({ names: [], loading: false });
      }
    };
    loadAssignees();
  }, [assignedTo.join(',')]);

  // Handlers
  const handleVolunteer = async (e) => {
    e.stopPropagation();
    if (!onVolunteer) return;
    setVolunteering(true);
    try {
      await onVolunteer(task);
    } finally {
      setVolunteering(false);
    }
  };

  const handleUnvolunteer = async (e) => {
    e.stopPropagation();
    if (!onUnvolunteer) return;
    setVolunteering(true);
    try {
      await onUnvolunteer(task);
    } finally {
      setVolunteering(false);
    }
  };

  // Handler pour abandon par le créateur
  const handleAbandon = async (e) => {
    e.stopPropagation();
    if (!onAbandon) return;
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir abandonner la quête "${task.title}" ?\n\nLa quête restera active et disponible pour d'autres volontaires.`
    );
    if (!confirmed) return;
    setVolunteering(true);
    try {
      await onAbandon(task);
    } finally {
      setVolunteering(false);
    }
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!onViewDetails) return;
    setSubmitting(true);
    try {
      onViewDetails(task);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) onViewDetails(task);
  };

  // Formater les dates
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;

  // Vue Liste compacte
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewDetails}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:border-purple-500/50 transition-all cursor-pointer active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          {/* Statut icon */}
          <span className="text-xl flex-shrink-0">{statusConfig.icon}</span>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm sm:text-base truncate">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`${priorityConfig.color} px-2 py-0.5 rounded text-[10px] sm:text-xs text-white`}>
                {priorityConfig.label}
              </span>
              {task.xpReward && (
                <span className="text-yellow-400 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {task.xpReward}
                </span>
              )}
              {commentCount > 0 && (
                <span className="text-blue-400 text-xs flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {commentCount}
                </span>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {canSubmit && (
              <button
                onClick={handleSubmit}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Valider"
              >
                <Trophy className="w-4 h-4" />
              </button>
            )}
            {canVolunteer && onVolunteer && (
              <button
                onClick={handleVolunteer}
                disabled={volunteering}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                title="Volontaire"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vue Cartes standard
  return (
    <div
      onClick={handleViewDetails}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer active:scale-[0.99]"
    >
      {/* Header avec statut */}
      <div className={`${statusConfig.color} px-4 py-2 flex items-center justify-between`}>
        <span className="text-white text-sm font-medium flex items-center gap-2">
          <span>{statusConfig.icon}</span>
          <span className="hidden xs:inline">{statusConfig.label}</span>
        </span>
        {task.xpReward && (
          <span className="bg-black/20 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {task.xpReward} XP
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Titre et description */}
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* Badges compacts */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`${priorityConfig.color} ${priorityConfig.textColor} px-2 py-0.5 rounded text-xs font-medium`}>
            {priorityConfig.label}
          </span>
          {task.dueDate && (
            <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {commentCount > 0 && (
            <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded text-xs flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {commentCount}
            </span>
          )}
        </div>

        {/* Info assignation compacte */}
        {assignedTo.length > 0 && (
          <div className="text-xs text-gray-400 mb-3 truncate">
            <span className="text-blue-400">
              {assigneeInfo.loading ? '...' : assigneeInfo.names.join(', ')}
            </span>
          </div>
        )}

        {/* Indicateur assignation personnelle */}
        {isAssignedToMe && (
          <div className="mb-3 px-2 py-1.5 bg-green-900/30 border border-green-600/50 rounded-lg text-green-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Vous etes assigne</span>
            {canSubmit && (
              <span className="ml-auto bg-green-600/30 px-1.5 py-0.5 rounded text-[10px]">
                Pret
              </span>
            )}
          </div>
        )}

        {/* Actions - Layout responsive */}
        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Bouton Voir details - toujours present */}
          <button
            onClick={handleViewDetails}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xs:inline">Details</span>
            {commentCount > 0 && (
              <span className="bg-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {commentCount}
              </span>
            )}
          </button>

          {/* Bouton contextuel */}
          {canSubmit ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span className="hidden xs:inline">Valider</span>
                </>
              )}
            </button>
          ) : canVolunteer && onVolunteer ? (
            <button
              onClick={handleVolunteer}
              disabled={volunteering}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {volunteering ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden xs:inline">Volontaire</span>
                </>
              )}
            </button>
          ) : isAssignedToMe && !isTaskOwner && onUnvolunteer ? (
            <button
              onClick={handleUnvolunteer}
              disabled={volunteering}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {volunteering ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span className="hidden xs:inline">Quitter</span>
                </>
              )}
            </button>
          ) : (isTaskOwner || isMyTask) && onEdit ? (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden xs:inline">Modifier</span>
            </button>
          ) : (
            <div /> // Placeholder pour garder la grille
          )}
        </div>

        {/* Actions secondaires si proprietaire */}
        {(isTaskOwner || isMyTask) && (onEdit || onDelete || onAbandon) && !isHistoryMode && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700/50" onClick={(e) => e.stopPropagation()}>
            {onEdit && (isTaskOwner || (!canSubmit && !(canVolunteer && onVolunteer))) && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-yellow-600/80 text-white rounded-lg text-xs hover:bg-yellow-600 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
            {/* Bouton Abandonner pour le créateur */}
            {isTaskOwner && onAbandon && task.status !== 'completed' && task.status !== 'validated' && (
              <button
                onClick={handleAbandon}
                disabled={volunteering}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-orange-900/30 text-orange-400 rounded-lg text-xs hover:bg-orange-900/50 transition-colors disabled:opacity-50"
                title="Abandonner la quête (elle restera disponible pour d'autres)"
              >
                {volunteering ? (
                  <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Abandonner</span>
                  </>
                )}
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-900/30 text-red-400 rounded-lg text-xs hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
