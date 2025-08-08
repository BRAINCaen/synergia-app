// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx  
// CORRECTION BOUTON VOLONTAIRE + RESTRICTION MODIFICATION
// ==========================================

import React, { useState } from 'react';
import { Clock, User, Edit, Trash2, UserPlus, Heart, CheckCircle, AlertTriangle } from 'lucide-react';
import SubmitTaskButton from '../../components/tasks/SubmitTaskButton';
import { taskService } from '../../core/services/taskService';
import { useAuthStore } from '../../shared/stores/authStore';

/**
 * 🎯 FORMATAGE DATE SÉCURISÉ
 */
const formatDate = (date) => {
  try {
    if (!date) return 'Date inconnue';
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR');
    }
    
    return new Date(date).toLocaleDateString('fr-FR');
  } catch (error) {
    console.warn('Erreur formatage date:', error);
    return 'Date invalide';
  }
};

/**
 * 🎯 BADGE DE PRIORITÉ
 */
const PriorityBadge = ({ priority }) => {
  const getConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' };
      case 'high':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Haute' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moyenne' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Basse' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Normale' };
    }
  };

  const config = getConfig(priority);
  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`}>
      {config.label}
    </span>
  );
};

/**
 * 🎯 BADGE DE STATUT
 */
const StatusBadge = ({ status }) => {
  const getConfig = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée', icon: CheckCircle };
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours', icon: Clock };
      case 'validation_pending':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En validation', icon: AlertTriangle };
      case 'todo':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'À faire', icon: Clock };
      case 'pending':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En attente', icon: Clock };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inconnu', icon: AlertTriangle };
    }
  };

  const config = getConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * 🎯 COMPOSANT TASKCARD AVEC CORRECTION VOLONTAIRE
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
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

  // État de la soumission
  const handleSubmissionSuccess = () => {
    console.log('✅ Soumission réussie pour tâche:', task.id);
    if (onSubmit) {
      onSubmit(task.id);
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
        status: task.status === 'pending' ? 'todo' : task.status,
        volunteerDate: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Volontariat enregistré avec succès');
      
      // ✅ NOTIFIER LE PARENT POUR RECHARGEMENT
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du volontariat:', error);
      alert('Erreur lors de l\'inscription: ' + error.message);
    } finally {
      setIsVolunteering(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      
      {/* En-tête avec priorité et statut */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        
        {/* Menu actions pour les tâches que je peux éditer */}
        {(isTaskOwner || isMyTask) && onEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(task)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Titre et description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Métadonnées */}
      <div className="space-y-2 mb-4">
        {/* XP et difficulté */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {task.xpReward && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                {task.xpReward} XP
              </span>
            )}
            
            {task.difficulty && (
              <span className="capitalize">
                Difficulté: {task.difficulty}
              </span>
            )}
          </div>
          
          {task.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {task.estimatedHours}h estimées
            </span>
          )}
        </div>

        {/* Date de création et échéance */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Créée le {formatDate(task.createdAt)}
          </span>
          
          {task.dueDate && (
            <span className={`${
              new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-500'
            }`}>
              Échéance: {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Assignés */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>
              Assignée à {task.assignedTo.length} personne{task.assignedTo.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          {/* Bouton Voir détails */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(task)}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Voir détails
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Bouton Volontaire - CORRIGÉ */}
          {canVolunteer && (
            <button
              onClick={handleVolunteer}
              disabled={isVolunteering}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
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

          {/* Bouton de soumission pour mes tâches */}
          {isMyTask && (
            <SubmitTaskButton 
              task={task}
              onSuccess={handleSubmissionSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
