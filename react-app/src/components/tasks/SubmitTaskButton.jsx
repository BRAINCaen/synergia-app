// ==========================================
// 📁 react-app/src/components/tasks/SubmitTaskButton.jsx
// BOUTON DE SOUMISSION CORRIGÉ - VERSION FONCTIONNELLE
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

/**
 * 🎯 BOUTON INTELLIGENT DE SOUMISSION DE TÂCHE - VERSION CORRIGÉE
 */
const SubmitTaskButton = ({ 
  task, 
  onSubmissionSuccess,
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Debug : afficher le statut de la tâche
  console.log('🔍 SubmitTaskButton - Statut tâche:', {
    taskId: task.id,
    status: task.status,
    title: task.title
  });

  // Déterminer l'apparence selon le statut - VERSION CORRIGÉE
  const getButtonConfig = () => {
    const status = task.status || 'todo';
    
    console.log('🔍 getButtonConfig - Statut analysé:', status);
    
    // Vérifier tous les statuts possibles
    if (status === 'todo' || status === 'pending' || status === 'in_progress' || !status) {
      return {
        text: 'Soumettre',
        icon: Send,
        className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        disabled: false,
        tooltip: 'Soumettre cette tâche pour validation admin'
      };
    }
    
    if (status === 'validation_pending') {
      return {
        text: 'En validation',
        icon: Clock,
        className: 'bg-orange-100 text-orange-700 border-orange-300 cursor-not-allowed',
        disabled: true,
        tooltip: 'Tâche en attente de validation par un administrateur'
      };
    }
    
    if (status === 'completed') {
      return {
        text: 'Validée',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed',
        disabled: true,
        tooltip: 'Tâche validée et XP attribués'
      };
    }
    
    if (status === 'rejected') {
      return {
        text: 'Rejetée',
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
        disabled: false,
        tooltip: 'Tâche rejetée - Cliquer pour resoumettre'
      };
    }
    
    // Fallback par défaut - toujours permettre la soumission
    return {
      text: 'Soumettre',
      icon: Send,
      className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      disabled: false,
      tooltip: 'Soumettre cette tâche pour validation admin'
    };
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  console.log('🔍 ButtonConfig généré:', buttonConfig);

  // Gérer le clic selon le statut
  const handleClick = () => {
    console.log('🎯 Clic sur SubmitTaskButton:', {
      disabled: buttonConfig.disabled,
      status: task.status
    });
    
    if (buttonConfig.disabled) {
      console.log('⚠️ Bouton désactivé, pas d\'action');
      return;
    }
    
    console.log('✅ Ouverture modal soumission pour:', task.title);
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
    console.log('✅ Soumission réussie dans SubmitTaskButton:', result);
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
          disabled={buttonConfig.disabled}
          className={`
            ${buttonConfig.className}
            ${getSizeClasses()}
            ${className}
            inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200 border
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!buttonConfig.disabled ? 'hover:shadow-md hover:scale-105 transform' : ''}
          `}
          title={buttonConfig.tooltip}
        >
          <IconComponent className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span>{buttonConfig.text}</span>
          
          {/* Afficher l'XP pour les tâches soumissibles */}
          {!buttonConfig.disabled && (
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
