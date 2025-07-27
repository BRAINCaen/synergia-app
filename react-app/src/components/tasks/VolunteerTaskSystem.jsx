// ==========================================
// 📁 react-app/src/components/tasks/VolunteerTaskSystem.jsx
// SYSTÈME COMPLET DE TÂCHES VOLONTAIRES + CORRECTION SOUMISSIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  UserMinus, 
  Send, 
  CheckCircle, 
  Clock, 
  Eye,
  Trophy,
  Users,
  Heart,
  Star,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import { taskService } from '../../core/services/taskService';
import TaskSubmissionModal from './TaskSubmissionModal';

/**
 * 🎯 COMPOSANT CARTE DE TÂCHE AVEC SYSTÈME VOLONTAIRES
 */
const VolunteerTaskCard = ({ task, onTaskUpdate }) => {
  const { user } = useAuthStore();
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier le statut de l'utilisateur par rapport à la tâche
  const isCreatedByMe = task.createdBy === user.uid;
  const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
  const canVolunteer = !isAssignedToMe && !isCreatedByMe && 
                      task.status !== 'completed' && 
                      task.status !== 'validation_pending';
  
  // 🙋 SE PORTER VOLONTAIRE
  const handleVolunteer = async () => {
    try {
      setIsLoading(true);
      console.log('🙋 Volontariat pour tâche:', task.title);
      
      // Ajouter l'utilisateur aux assignés
      const updatedAssignedTo = [...(task.assignedTo || []), user.uid];
      
      await taskService.updateTask(task.id, {
        assignedTo: updatedAssignedTo,
        status: task.status === 'pending' ? 'in_progress' : task.status,
        volunteerDate: new Date()
      });
      
      console.log('✅ Volontariat enregistré avec succès');
      
      // Notifier le parent pour recharger
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 SE RETIRER DE LA TÂCHE
  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Retrait de tâche:', task.title);
      
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir vous retirer de la tâche "${task.title}" ?`
      );
      
      if (!confirmed) return;
      
      // Retirer l'utilisateur des assignés
      const updatedAssignedTo = (task.assignedTo || []).filter(id => id !== user.uid);
      
      await taskService.updateTask(task.id, {
        assignedTo: updatedAssignedTo,
        status: updatedAssignedTo.length === 0 ? 'pending' : task.status,
        withdrawDate: new Date()
      });
      
      console.log('✅ Retrait enregistré avec succès');
      
      // Notifier le parent pour recharger
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
      alert('Erreur lors du retrait: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 📤 SOUMETTRE POUR VALIDATION - CORRIGÉ
  const handleSubmit = () => {
    console.log('📤 Ouverture modal soumission:', task.title);
    setShowSubmissionModal(true);
  };

  // ✅ SUCCÈS DE SOUMISSION - CORRIGÉ
  const handleSubmissionSuccess = async (result) => {
    try {
      console.log('✅ Soumission réussie:', result);
      
      // ✅ CORRECTION : Mettre à jour le statut de la tâche
      await taskService.updateTask(task.id, {
        status: 'validation_pending',
        submittedAt: new Date(),
        submittedBy: user.uid,
        validationRequestId: result.validationId
      });
      
      console.log('✅ Statut tâche mis à jour vers validation_pending');
      
      // Fermer le modal
      setShowSubmissionModal(false);
      
      // Recharger les données
      if (onTaskUpdate) {
        onTaskUpdate();
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-600 bg-gray-800/20';
    }
  };

  // Obtenir le texte et la couleur du statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'En attente', color: 'text-yellow-400', icon: Clock };
      case 'in_progress':
        return { text: 'En cours', color: 'text-blue-400', icon: Users };
      case 'validation_pending':
        return { text: 'En validation', color: 'text-orange-400', icon: Clock };
      case 'completed':
        return { text: 'Terminée', color: 'text-green-400', icon: CheckCircle };
      case 'rejected':
        return { text: 'Rejetée', color: 'text-red-400', icon: AlertTriangle };
      default:
        return { text: 'À faire', color: 'text-gray-400', icon: Eye };
    }
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;
  const assignedCount = task.assignedTo ? task.assignedTo.length : 0;

  return (
    <>
      <div className={`p-4 rounded-xl border-2 transition-all hover:bg-opacity-80 ${getPriorityColor(task.priority)}`}>
        
        {/* Header avec titre et statut */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {task.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`flex items-center ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusInfo.text}
              </span>
              
              <span className="text-gray-400 flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {task.xpReward || 25} XP
              </span>
              
              {assignedCount > 0 && (
                <span className="text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {assignedCount} volontaire{assignedCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Badge de priorité */}
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            task.priority === 'urgent' ? 'bg-red-600 text-white' :
            task.priority === 'high' ? 'bg-orange-600 text-white' :
            task.priority === 'medium' ? 'bg-yellow-600 text-white' :
            'bg-green-600 text-white'
          }`}>
            {task.priority || 'medium'}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Catégorie */}
        {task.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
              {task.category}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          
          {/* Informations sur l'assignation */}
          <div className="text-xs text-gray-400">
            {isCreatedByMe && (
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Ma tâche
              </span>
            )}
            {isAssignedToMe && !isCreatedByMe && (
              <span className="flex items-center text-green-400">
                <Heart className="w-3 h-3 mr-1" />
                Volontaire
              </span>
            )}
            {canVolunteer && (
              <span className="flex items-center text-blue-400">
                <UserPlus className="w-3 h-3 mr-1" />
                Disponible
              </span>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-2">
            
            {/* Se porter volontaire */}
            {canVolunteer && (
              <button
                onClick={handleVolunteer}
                disabled={isLoading}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Volontaire
                  </>
                )}
              </button>
            )}

            {/* Se retirer */}
            {isAssignedToMe && !isCreatedByMe && (
              <button
                onClick={handleWithdraw}
                disabled={isLoading}
                className="flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Se retirer
                  </>
                )}
              </button>
            )}

            {/* Soumettre pour validation */}
            {isAssignedToMe && task.status !== 'completed' && task.status !== 'validation_pending' && (
              <button
                onClick={handleSubmit}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Send className="w-4 h-4 mr-1" />
                Soumettre
              </button>
            )}

            {/* Statut en validation */}
            {task.status === 'validation_pending' && isAssignedToMe && (
              <div className="flex items-center px-3 py-1.5 bg-orange-600/20 text-orange-300 rounded-lg text-sm">
                <Clock className="w-4 h-4 mr-1" />
                En validation
              </div>
            )}

            {/* Tâche terminée */}
            {task.status === 'completed' && isAssignedToMe && (
              <div className="flex items-center px-3 py-1.5 bg-green-600/20 text-green-300 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Terminée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de soumission - CORRIGÉ */}
      {showSubmissionModal && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={task}
          onClose={() => setShowSubmissionModal(false)}
          onSubmit={handleSubmissionSuccess}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </>
  );
};

export default VolunteerTaskCard;
