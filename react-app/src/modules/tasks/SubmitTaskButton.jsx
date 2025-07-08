// ==========================================
// 📁 react-app/src/components/tasks/SubmitTaskButton.jsx
// BOUTON DE SOUMISSION COMPLET AVEC MODAL INTÉGRÉ
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

// Constantes de statut (backup si import échoue)
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  VALIDATION_PENDING: 'validation_pending',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

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
    const status = task.status || 'todo';
    
    switch (status) {
      case TASK_STATUS.TODO:
      case TASK_STATUS.IN_PROGRESS:
      case 'todo':
      case 'in_progress':
        return {
          text: 'Soumettre',
          icon: Send,
          className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          disabled: false,
          tooltip: 'Soumettre cette tâche pour validation admin'
        };
        
      case TASK_STATUS.VALIDATION_PENDING:
      case 'validation_pending':
        return {
          text: 'En validation',
          icon: Clock,
          className: 'bg-orange-100 text-orange-700 border-orange-300 cursor-not-allowed',
          disabled: true,
          tooltip: 'Tâche en attente de validation par un administrateur'
        };
        
      case TASK_STATUS.COMPLETED:
      case 'completed':
        return {
          text: 'Validée',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed',
          disabled: true,
          tooltip: 'Tâche validée et XP attribués'
        };
        
      case TASK_STATUS.REJECTED:
      case 'rejected':
        return {
          text: 'Rejetée',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
          disabled: false,
          tooltip: 'Tâche rejetée - Cliquer pour resoumettre'
        };
        
      default:
        return {
          text: 'Soumettre',
          icon: Send,
          className: 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed',
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
    
    console.log('🎯 Ouverture modal soumission pour:', task.title);
    setShowSubmissionModal(true);
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
  const getExpectedXP = () => {
    if (task.xpReward) return task.xpReward;
    
    switch (task.difficulty) {
      case 'easy': return 10;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25; // normal
    }
  };

  const expectedXP = getExpectedXP();

  // Gérer le succès de soumission
  const handleSubmissionSuccess = (result) => {
    console.log('✅ Soumission réussie:', result);
    setShowSubmissionModal(false);
    
    if (onSubmissionSuccess) {
      onSubmissionSuccess(result);
    }
  };

  return (
    <>
      <div className="relative group">
        <button
          onClick={handleClick}
          disabled={buttonConfig.disabled && task.status !== 'rejected'}
          className={`
            ${buttonConfig.className}
            ${getSizeClasses()}
            ${className}
            inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200 border
            disabled:opacity-75 disabled:cursor-not-allowed
            ${!buttonConfig.disabled ? 'hover:shadow-md hover:scale-105 transform' : ''}
          `}
          title={buttonConfig.tooltip}
        >
          <IconComponent className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span>{buttonConfig.text}</span>
          
          {/* Afficher l'XP pour les tâches pas encore validées */}
          {(task.status === 'todo' || 
            task.status === 'in_progress' || 
            task.status === 'validation_pending' ||
            task.status === 'rejected') && (
            <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-0.5">
              <Trophy className="w-3 h-3" />
              <span className="text-xs font-bold">+{expectedXP}</span>
            </div>
          )}
        </button>

        {/* Tooltip enrichi */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20 shadow-lg">
          {buttonConfig.tooltip}
          
          {task.status === 'validation_pending' && (
            <div className="mt-1 text-orange-300">
              +{expectedXP} XP en attente
            </div>
          )}
          
          {task.status === 'rejected' && task.adminComment && (
            <div className="mt-1 text-red-300 max-w-xs whitespace-normal">
              "Commentaire: {task.adminComment}"
            </div>
          )}
          
          {/* Flèche du tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Modal de soumission */}
      {showSubmissionModal && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          task={task}
          onSubmit={handleSubmissionSuccess}
          submitting={false}
        />
      )}
    </>
  );
};

export default SubmitTaskButton;
