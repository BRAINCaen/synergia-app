// ==========================================
// 📁 react-app/src/modules/tasks/TaskCard.jsx  
// AJOUT RESTRICTION MODIFICATION PAR PROPRIÉTAIRE UNIQUEMENT
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
 * 🎯 COMPOSANT TASKCARD AVEC RESTRICTION MODIFICATION PAR PROPRIÉTAIRE
 */
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  isMyTask = false,
  showVolunteerButton = false
}) => {
  const { user } = useAuthStore();
  const [isVolunteering, setIsVolunteering] = useState(false);

  // ✅ NOUVEAU: Vérifier si l'utilisateur actuel est le créateur de la tâche
  const isTaskOwner = user && task && task.createdBy === user.uid;

  // État de la soumission
  const handleSubmissionSuccess = () => {
    console.log('✅ Soumission réussie pour tâche:', task.id);
    if (onSubmit) {
      onSubmit(task.id);
    }
  };

  // Fonction pour se porter volontaire
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
        status: task.status === 'pending' ? 'todo' : task.status,
        updatedAt: new Date()
      });

      console.log('✅ Volontariat enregistré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors du volontariat:', error);
      alert('Erreur lors de l\'inscription en tant que volontaire');
    } finally {
      setIsVolunteering(false);
    }
  };

  // Vérifier si l'utilisateur peut se porter volontaire
  const canVolunteer = showVolunteerButton && 
    user && 
    task && 
    (!task.assignedTo || !Array.isArray(task.assignedTo) || !task.assignedTo.includes(user.uid)) &&
    task.status !== 'completed' &&
    task.status !== 'cancelled';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200">
      
      {/* En-tête avec priorité et statut */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex space-x-2">
          {/* Badge de priorité */}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
            ${task.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
            ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${task.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
          `}>
            {task.priority || 'medium'}
          </span>
          
          {/* Badge de statut */}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${task.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
            ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
            ${task.status === 'todo' ? 'bg-gray-100 text-gray-800' : ''}
            ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
          `}>
            {task.status || 'todo'}
          </span>
        </div>
        
        {/* Badge "Ma tâche" */}
        {isMyTask && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Ma tâche
          </span>
        )}
      </div>

      {/* Titre et description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {task.title || 'Titre non défini'}
        </h3>
        
        {task.description && (
          <p className="text-gray-300 text-sm line-clamp-3 mb-3">
            {task.description}
          </p>
        )}
        
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Informations supplémentaires */}
      <div className="space-y-2 text-sm text-gray-400 mb-4">
        {/* Récompense XP */}
        {task.xpReward && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span>{task.xpReward} XP</span>
          </div>
        )}
        
        {/* Assignés */}
        {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
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

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        
        {/* Boutons d'action à gauche */}
        <div className="flex space-x-2">
          
          {/* ✅ NOUVEAU: Bouton Edit avec restriction par propriétaire */}
          {onEdit && isTaskOwner && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier la tâche (réservé au créateur)"
            >
              <Edit size={16} />
            </button>
          )}
          
          {/* ✅ NOUVEAU: Message d'info si pas propriétaire (optionnel pour debug) */}
          {onEdit && !isTaskOwner && user && (
            <div className="p-2 text-gray-500" title="Seul le créateur peut modifier cette tâche">
              <Edit size={16} className="opacity-30" />
            </div>
          )}
          
          {/* Bouton Delete - aussi restreint au propriétaire */}
          {onDelete && isTaskOwner && (
            <button
              onClick={() => onDelete(task)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Supprimer la tâche (réservé au créateur)"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Bouton Se porter volontaire */}
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
