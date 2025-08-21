// ==========================================
// 📁 react-app/src/components/tasks/SubmitTaskButton.jsx
// BOUTON DE SOUMISSION CORRIGÉ - LOGIQUE FIXÉE
// ==========================================

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Send, 
  Clock, 
  Trophy,
  AlertTriangle,
  Eye,
  Loader,
  Play
} from 'lucide-react';
import { taskService } from '../../core/services/taskService.js';

/**
 * 🎯 BOUTON INTELLIGENT DE SOUMISSION DE TÂCHE - VERSION CORRIGÉE
 */
const SubmitTaskButton = ({ 
  task, 
  onSubmissionSuccess,
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug : afficher le statut de la tâche
  console.log('🔍 SubmitTaskButton - Statut tâche:', {
    taskId: task.id,
    status: task.status,
    title: task.title
  });

  // ✅ CORRECTION PRINCIPALE : Logique fixée pour afficher le bon bouton
  const getButtonConfig = () => {
    const status = task.status || 'todo';
    
    console.log('🔍 getButtonConfig - Statut analysé:', status);
    
    // Si la tâche n'est pas encore commencée
    if (status === 'todo' || status === 'pending' || !status) {
      return {
        text: 'Commencer',
        icon: Play,
        className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        disabled: false,
        tooltip: 'Commencer cette tâche',
        action: 'start'
      };
    }
    
    // ✅ CORRECTION : Si la tâche est en cours, afficher SOUMETTRE
    if (status === 'in_progress') {
      return {
        text: 'Soumettre',
        icon: Send,
        className: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
        disabled: false,
        tooltip: 'Soumettre cette tâche terminée pour validation',
        action: 'submit'
      };
    }
    
    if (status === 'validation_pending') {
      return {
        text: 'En validation',
        icon: Clock,
        className: 'bg-orange-500 text-white border-orange-500 cursor-not-allowed',
        disabled: true,
        tooltip: 'Tâche en cours de validation par un administrateur',
        action: 'none'
      };
    }
    
    if (status === 'completed') {
      return {
        text: 'Validée',
        icon: CheckCircle,
        className: 'bg-green-600 text-white border-green-600 cursor-not-allowed',
        disabled: true,
        tooltip: 'Tâche terminée et validée',
        action: 'none'
      };
    }
    
    if (status === 'rejected') {
      return {
        text: 'Recommencer',
        icon: AlertTriangle,
        className: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
        disabled: false,
        tooltip: 'Tâche rejetée - Cliquer pour recommencer',
        action: 'restart'
      };
    }
    
    // Statut inconnu - par défaut commencer
    return {
      text: 'Commencer',
      icon: Play,
      className: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      disabled: false,
      tooltip: 'Commencer cette tâche',
      action: 'start'
    };
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;
  
  console.log('🔍 ButtonConfig généré:', buttonConfig);
  
  // Calculer l'XP attendu
  const expectedXP = task.xpReward || 25;

  // ✅ GESTIONNAIRE DE CLIC CORRIGÉ SELON L'ACTION
  const handleClick = async () => {
    if (buttonConfig.disabled || isSubmitting) {
      console.log('🔒 Bouton désactivé ou en cours de traitement');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🎯 Action demandée:', {
        action: buttonConfig.action,
        taskId: task.id,
        title: task.title,
        currentStatus: task.status
      });

      if (buttonConfig.action === 'start') {
        // ✅ COMMENCER LA TÂCHE
        console.log('▶️ Démarrage de la tâche...');
        
        const result = await taskService.updateTask(task.id, {
          status: 'in_progress',
          startedAt: new Date(),
          startedBy: task.assignedTo?.[0] || task.createdBy
        });

        if (result.success) {
          console.log('✅ Tâche démarrée avec succès');
          alert(`✅ Tâche "${task.title}" démarrée ! Vous pouvez maintenant la soumettre une fois terminée.`);
        }
        
      } else if (buttonConfig.action === 'submit') {
        // ✅ SOUMETTRE LA TÂCHE POUR VALIDATION
        console.log('📤 Soumission de la tâche...');
        
        const result = await taskService.submitTaskForValidation(
          task.id, 
          task.assignedTo?.[0] || task.createdBy, 
          {
            notes: 'Tâche soumise via l\'interface utilisateur',
            submissionDate: new Date()
          }
        );

        if (result.success) {
          console.log('✅ Tâche soumise avec succès');
          alert(`✅ Tâche "${task.title}" soumise pour validation ! Un administrateur va la vérifier.`);
        }
        
      } else if (buttonConfig.action === 'restart') {
        // ✅ RECOMMENCER LA TÂCHE
        console.log('🔄 Redémarrage de la tâche...');
        
        const result = await taskService.updateTask(task.id, {
          status: 'in_progress',
          restartedAt: new Date(),
          restartedBy: task.assignedTo?.[0] || task.createdBy
        });

        if (result.success) {
          console.log('✅ Tâche redémarrée avec succès');
          alert(`✅ Tâche "${task.title}" redémarrée ! Vous pouvez maintenant la soumettre à nouveau.`);
        }
      }

      // Notifier le parent du succès
      if (onSubmissionSuccess) {
        onSubmissionSuccess({
          taskId: task.id,
          action: buttonConfig.action,
          newStatus: buttonConfig.action === 'start' || buttonConfig.action === 'restart' ? 'in_progress' : 'validation_pending'
        });
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'action:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 Fonction pour obtenir la taille d'icône
  const getIconSize = () => {
    if (size === 'small') return 'w-3 h-3';
    if (size === 'large') return 'w-6 h-6';
    return 'w-4 h-4'; // default
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
          {isSubmitting ? 'En cours...' : buttonConfig.text}
        </span>
        {!buttonConfig.disabled && !isSubmitting && (
          <span className="text-xs opacity-75">
            +{expectedXP} XP
          </span>
        )}
      </button>
      
      {/* Tooltip de debug amélioré */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {buttonConfig.tooltip}
        <div className="text-xs text-gray-400 mt-1">
          Statut: {task.status || 'undefined'} → Action: {buttonConfig.action}
        </div>
      </div>
    </div>
  );
};

export default SubmitTaskButton;
