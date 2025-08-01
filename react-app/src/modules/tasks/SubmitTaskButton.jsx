// ==========================================
// 📁 react-app/src/modules/tasks/SubmitTaskButton.jsx
// CORRECTION DE L'EXPRESSION TERNAIRE INCOMPLÈTE
// ==========================================

import React from 'react';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

const SubmitTaskButton = ({ 
  task, 
  onSubmissionSuccess, 
  className = '', 
  size = 'medium' 
}) => {
  
  // Fonction pour déterminer la configuration du bouton
  const getButtonConfig = () => {
    const status = task.status;
    
    if (status === 'todo' || status === 'in_progress') {
      return {
        text: 'Soumettre',
        icon: Send,
        className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        disabled: false,
        tooltip: 'Soumettre cette tâche pour validation admin'
      };
    }
    
    if (status === 'submitted') {
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
    
    // Fallback par défaut
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
  
  // Calculer l'XP attendu
  const expectedXP = task.xpReward || 25;

  // Gestionnaire de clic
  const handleClick = () => {
    if (buttonConfig.disabled) {
      console.log('🔒 [SUBMIT-BTN] Bouton désactivé pour statut:', task.status);
      return;
    }
    
    console.log('🎯 [SUBMIT-BTN] Soumission simple pour tâche:', task.id);
    
    // Simuler une soumission réussie
    if (onSubmissionSuccess) {
      onSubmissionSuccess();
    }
    
    // Notification simple
    alert(`Tâche "${task.title}" soumise pour validation !`);
  };

  // 🔧 CORRECTION : Expression ternaire complète pour les tailles d'icônes
  const getIconSize = () => {
    if (size === 'small') return 'w-3 h-3';
    if (size === 'large') return 'w-6 h-6';
    return 'w-4 h-4'; // medium par défaut
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={buttonConfig.disabled}
        className={`
          ${buttonConfig.className}
          ${className}
          px-4 py-2 rounded-lg font-medium text-sm
          border transition-all duration-200
          flex items-center space-x-2
          ${size === 'small' ? 'px-3 py-1.5 text-xs' : ''}
          ${size === 'large' ? 'px-6 py-3 text-base' : ''}
          ${buttonConfig.disabled 
            ? 'opacity-75 cursor-not-allowed' 
            : 'hover:shadow-md hover:scale-105 transform'
          }
        `}
        title={buttonConfig.tooltip}
      >
        <IconComponent className={getIconSize()} />
        <span>{buttonConfig.text}</span>
        {!buttonConfig.disabled && (
          <span className="text-xs opacity-75">
            +{expectedXP} XP
          </span>
        )}
      </button>
    </div>
  );
};

export default SubmitTaskButton;
