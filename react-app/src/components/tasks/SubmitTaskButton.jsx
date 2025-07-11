// ==========================================
// 📁 react-app/src/components/tasks/SubmitTaskButton.jsx
// BOUTON DE SOUMISSION REMPLAÇANT "MARQUER COMME TERMINÉ"
// ==========================================

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Send, 
  Clock, 
  Trophy,
  AlertTriangle,
  Eye
} from 'lucide-react';
import TaskSubmissionModal from './TaskSubmissionModal.jsx';
import { TASK_STATUS } from '../../core/services/taskService.js';

/**
 * 🎯 BOUTON INTELLIGENT DE SOUMISSION DE TÂCHE
 */
const SubmitTaskButton = ({ 
  task, 
  onSubmissionSuccess,
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Déterminer l'apparence selon le statut
  const getButtonConfig = () => {
    switch (task.status) {
      case TASK_STATUS.TODO:
      case TASK_STATUS.IN_PROGRESS:
        return {
          text: 'Soumettre',
          icon: Send,
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          disabled: false,
          tooltip: 'Soumettre cette tâche pour validation admin'
        };
        
      case TASK_STATUS.VALIDATION_PENDING:
        return {
          text: 'En validation',
          icon: Clock,
          className: 'bg-orange-100 text-orange-700 cursor-not-allowed',
          disabled: true,
          tooltip: 'Tâche en attente de validation par un administrateur'
        };
        
      case TASK_STATUS.COMPLETED:
        return {
          text: 'Validée',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 cursor-not-allowed',
          disabled: true,
          tooltip: 'Tâche validée et XP attribués'
        };
        
      case TASK_STATUS.REJECTED:
        return {
          text: 'Rejetée',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-700 hover:bg-red-200',
          disabled: false,
          tooltip: 'Tâche rejetée - Cliquer pour voir les commentaires admin'
        };
        
      default:
        return {
          text: 'Soumettre',
          icon: Send,
          className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
          disabled: true,
          tooltip: 'Statut inconnu'
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  // Gérer le clic selon le statut
  const handleClick = () => {
    if (buttonConfig.disabled) return;
    
    if (task.status === TASK_STATUS.REJECTED) {
      // Pour les tâches rejetées, afficher les détails
      setShowSubmissionModal(true);
    } else {
      // Pour les autres, ouvrir le modal de soumission
      setShowSubmissionModal(true);
    }
  };

  // Obtenir la taille selon la prop
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-xs';
      case 'large':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  // Calculer l'XP attendu
  const expectedXP = task.xpReward || 50;

  return (
    <>
      <div className="relative group">
        <button
          onClick={handleClick}
          disabled={buttonConfig.disabled && task.status !== TASK_STATUS.REJECTED}
          className={`
            ${buttonConfig.className}
            ${getSizeClasses()}
            ${className}
            inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200
            disabled:opacity-75 disabled:cursor-not-allowed
            ${!buttonConfig.disabled ? 'hover:shadow-md hover:scale-105' : ''}
          `}
          title={buttonConfig.tooltip}
        >
          <IconComponent className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span>{buttonConfig.text}</span>
          
          {/* Afficher l'XP pour les tâches pas encore validées */}
          {(task.status === TASK_STATUS.TODO || 
            task.status === TASK_STATUS.IN_PROGRESS || 
            task.status === TASK_STATUS.VALIDATION_PENDING) && (
            <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-0.5">
              <Trophy className="w-3 h-3" />
              <span className="text-xs font-bold">+{expectedXP}</span>
            </div>
          )}
        </button>

        {/* Tooltip enrichi */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {buttonConfig.tooltip}
          
          {task.status === TASK_STATUS.VALIDATION_PENDING && (
            <div className="mt-1 text-orange-300">
              +{expectedXP} XP en attente
            </div>
          )}
          
          {task.status === TASK_STATUS.REJECTED && task.adminComment && (
            <div className="mt-1 text-red-300 max-w-xs">
              "{task.adminComment}"
            </div>
          )}
          
          {/* Flèche du tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Modal de soumission */}
      <TaskSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        task={task}
        onSubmissionSuccess={(result) => {
          setShowSubmissionModal(false);
          if (onSubmissionSuccess) {
            onSubmissionSuccess(result);
          }
        }}
      />
    </>
  );
};

export default SubmitTaskButton;
