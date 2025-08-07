// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx  
// CORRECTION AJOUT BOUTON VOLONTAIRE - SANS MODIFIER L'EXISTANT
// ==========================================

import React, { useState } from 'react';
import { Clock, User, Edit, Trash2, UserPlus, Heart } from 'lucide-react';
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
 * 🎯 COMPOSANT TASKCARD AVEC BOUTON VOLONTAIRE AJOUTÉ
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  isMyTask = false,
  showVolunteerButton = false  // NOUVEAU: Prop pour afficher le bouton volontaire
}) => {
  const { user } = useAuthStore();
  const [isVolunteering, setIsVolunteering] = useState(false);

  // État de la soumission
  const handleSubmissionSuccess = () => {
    console.log('✅ Soumission réussie pour tâche:', task.id);
    if (onSubmit) {
      onSubmit(task.id);
    }
  };

  // NOUVEAU: Fonction pour se porter volontaire
  const handleVolunteer = async () => {
    try {
      setIsVolunteering(true);
      console.log('🙋‍♂️ Volontariat pour tâche:', task.title);

      // Ajouter l'utilisateur aux assignés directement
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      
      // Vérifier que l'utilisateur n'est pas déjà assigné
      if (currentAssigned.includes(user.uid)) {
        console.warn('Utilisateur déjà assigné à cette tâche');
        return;
      }

      const updatedAssigned = [...currentAssigned, user.uid];

      await taskService.updateTask(task.id, {
        assignedTo: updatedAssigned,
        status: task.status === 'pending' ? 'in_progress' : task.status,
        volunteerDate: new Date()
      });

      console.log('✅ Volontariat enregistré avec succès');
      
      // Optionnel: Callback pour recharger les données
      if (onViewDetails) {
        onViewDetails(task);
      }

    } catch (error) {
      console.error('❌ Erreur lors du volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    } finally {
      setIsVolunteering(false);
    }
  };

  // Vérifier si l'utilisateur peut se porter volontaire
  const canVolunteer = showVolunteerButton && 
                      user && 
                      !isMyTask &&
                      task.status !== 'completed' && 
                      task.status !== 'validation_pending' &&
                      (!task.assignedTo || !task.assignedTo.includes(user.uid));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      
      {/* En-tête avec titre et priorité */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate mb-2">
            {task.title}
          </h3>
          
          {/* Statut et XP */}
          <div className="flex items-center gap-3 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              task.status === 'completed' ? 'bg-green-600 text-green-100' :
              task.status === 'in_progress' ? 'bg-blue-600 text-blue-100' :
              task.status === 'validation_pending' ? 'bg-orange-600 text-orange-100' :
              'bg-gray-600 text-gray-100'
            }`}>
              {task.status === 'completed' ? 'Terminée' :
               task.status === 'in_progress' ? 'En cours' :
               task.status === 'validation_pending' ? 'En validation' :
               'En attente'}
            </span>
            
            {task.xpReward && (
              <span className="text-yellow-400 text-xs">
                +{task.xpReward} XP
              </span>
            )}
          </div>
        </div>
        
        {/* Priorité */}
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          task.priority === 'urgent' ? 'bg-red-600 text-red-100' :
          task.priority === 'haute' ? 'bg-orange-600 text-orange-100' :
          task.priority === 'moyenne' ? 'bg-yellow-600 text-yellow-100' :
          'bg-green-600 text-green-100'
        }`}>
          Priorité {task.priority || 'moyenne'}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Assignation et échéance */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{task.assignedTo.length} assigné{task.assignedTo.length > 1 ? 's' : ''}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Échéance: {formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
        
        {/* Date de création/modification */}
        <div className="text-xs text-gray-500">
          {task.updatedAt ? (
            `Modifiée le ${formatDate(task.updatedAt)}`
          ) : task.createdAt ? (
            `Créée le ${formatDate(task.createdAt)}`
          ) : (
            'Date inconnue'
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        
        {/* Boutons d'action à gauche */}
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier la tâche"
            >
              <Edit size={16} />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(task)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Supprimer la tâche"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* NOUVEAU: Bouton Se porter volontaire */}
          {canVolunteer && (
            <button
              onClick={handleVolunteer}
              disabled={isVolunteering}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              title="Se porter volontaire pour cette tâche"
            >
              {isVolunteering ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart size={14} className="mr-1" />
                  Volontaire
                </>
              )}
            </button>
          )}
        </div>

        {/* Bouton de soumission pour validation à droite */}
        <div className="flex-shrink-0">
          <SubmitTaskButton 
            task={task}
            onSubmissionSuccess={handleSubmissionSuccess}
            size="default"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
