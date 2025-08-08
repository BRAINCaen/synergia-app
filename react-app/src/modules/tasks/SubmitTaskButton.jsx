// ==========================================
// 📁 CORRECTION SubmitTaskButton.jsx - Version fonctionnelle
// CORRIGER LA LOGIQUE DE SOUMISSION ET CHANGEMENT DE STATUT
// ==========================================

// 🔧 MODIFICATIONS À APPORTER AU FICHIER :
// react-app/src/modules/tasks/SubmitTaskButton.jsx

import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader
} from 'lucide-react';
import { taskService } from '../../core/services/taskService.js';

const SubmitTaskButton = ({ 
  task, 
  onSubmissionSuccess, 
  className = '', 
  size = 'medium' 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🛡️ VALIDATION OBLIGATOIRE
  if (!task || !task.id) {
    console.warn('⚠️ SubmitTaskButton: tâche manquante');
    return null;
  }

  // Fonction pour déterminer la configuration du bouton
  const getButtonConfig = () => {
    const status = task.status;
    
    console.log('🔍 SubmitTaskButton - Analyse statut:', {
      taskId: task.id,
      status: status,
      title: task.title
    });
    
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
        text: 'Resoummettre',
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

  // 🎯 GESTIONNAIRE DE CLIC CORRIGÉ
  const handleClick = async () => {
    if (buttonConfig.disabled || isSubmitting) {
      console.log('🔒 Bouton désactivé ou en cours de soumission');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('📤 Début soumission tâche:', {
        taskId: task.id,
        title: task.title,
        currentStatus: task.status
      });

      // ✅ CORRECTION PRINCIPALE : Utiliser le service pour soumettre
      const result = await taskService.submitTaskForValidation(task.id, task.assignedTo?.[0] || task.createdBy, {
        notes: 'Tâche soumise via l\'interface utilisateur',
        submissionDate: new Date()
      });

      if (result.success) {
        console.log('✅ Soumission réussie - Statut changé vers validation_pending');
        
        // Notifier le parent du succès
        if (onSubmissionSuccess) {
          onSubmissionSuccess({
            taskId: task.id,
            newStatus: 'validation_pending',
            message: 'Tâche soumise pour validation'
          });
        }

        // Notification utilisateur
        alert(`✅ Tâche "${task.title}" soumise pour validation !`);

      } else {
        throw new Error('Échec de la soumission');
      }

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert(`❌ Erreur lors de la soumission: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 Fonction pour obtenir la taille d'icône
  const getIconSize = () => {
    if (size === 'small') return 'w-3 h-3';
    if (size === 'large') return 'w-6 h-6';
    return 'w-4 h-4'; // medium par défaut
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={buttonConfig.disabled || isSubmitting}
        className={`
          ${buttonConfig.className}
          ${className}
          px-4 py-2 rounded-lg font-medium text-sm
          border transition-all duration-200
          flex items-center space-x-2
          ${size === 'small' ? 'px-3 py-1.5 text-xs' : ''}
          ${size === 'large' ? 'px-6 py-3 text-base' : ''}
          ${(buttonConfig.disabled || isSubmitting)
            ? 'opacity-75 cursor-not-allowed' 
            : 'hover:shadow-md hover:scale-105 transform'
          }
        `}
        title={buttonConfig.tooltip}
      >
        {isSubmitting ? (
          <Loader className={`${getIconSize()} animate-spin`} />
        ) : (
          <IconComponent className={getIconSize()} />
        )}
        <span>
          {isSubmitting ? 'Soumission...' : buttonConfig.text}
        </span>
        {!buttonConfig.disabled && !isSubmitting && (
          <span className="text-xs opacity-75">
            +{expectedXP} XP
          </span>
        )}
      </button>
      
      {/* Tooltip de debug */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {buttonConfig.tooltip}
        <div className="text-xs text-gray-400 mt-1">
          Statut: {task.status || 'undefined'}
        </div>
      </div>
    </div>
  );
};

export default SubmitTaskButton;
