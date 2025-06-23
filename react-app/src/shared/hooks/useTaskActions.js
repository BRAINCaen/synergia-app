// ==========================================
// 📁 react-app/src/shared/hooks/useTaskActions.js
// Hook pour actions tâches avec toasts
// ==========================================

import { useToast } from '../components/ToastNotification.jsx';

export const useTaskActions = () => {
  const { toast } = useToast();

  /**
   * ✅ COMPLETION D'UNE TÂCHE AVEC XP
   */
  const handleTaskCompletion = (taskData, xpResult) => {
    // Toast principal de completion
    toast.success(`Tâche "${taskData.title}" terminée!`, {
      title: '✅ Tâche complétée',
      message: 'Excellent travail! Continuez comme ça!'
    });

    // Toast XP si gain
    if (xpResult && xpResult.xpGain > 0) {
      setTimeout(() => {
        toast.xp(`+${xpResult.xpGain} XP gagné!`, {
          title: '🎯 Points d\'expérience',
          xpGain: xpResult.xpGain,
          levelUp: xpResult.leveledUp,
          message: xpResult.leveledUp 
            ? `🎉 Niveau ${xpResult.newLevel} atteint! Félicitations!`
            : `Excellent travail! Niveau actuel: ${xpResult.newLevel || 'N/A'}`
        });
      }, 500); // Délai pour éviter la superposition
    }
  };

  /**
   * 📝 CRÉATION D'UNE NOUVELLE TÂCHE
   */
  const handleTaskCreation = (taskData) => {
    toast.success('Nouvelle tâche créée!', {
      title: '📝 Tâche ajoutée',
      message: `"${taskData.title}" a été ajoutée à votre liste.`
    });
  };

  /**
   * ✏️ MODIFICATION D'UNE TÂCHE
   */
  const handleTaskUpdate = (taskData) => {
    toast.info('Tâche modifiée', {
      title: '✏️ Modification sauvegardée',
      message: `"${taskData.title}" a été mise à jour.`
    });
  };

  /**
   * 🗑️ SUPPRESSION D'UNE TÂCHE
   */
  const handleTaskDeletion = (taskTitle) => {
    toast.warning('Tâche supprimée', {
      title: '🗑️ Suppression confirmée',
      message: `"${taskTitle}" a été supprimée définitivement.`
    });
  };

  /**
   * 📅 TÂCHE ASSIGNÉE
   */
  const handleTaskAssignment = (taskTitle, assigneeName) => {
    toast.info('Tâche assignée', {
      title: '👤 Assignation',
      message: `"${taskTitle}" assignée à ${assigneeName}.`
    });
  };

  /**
   * ⏰ DEADLINE MODIFIÉE
   */
  const handleDeadlineUpdate = (taskTitle, newDeadline) => {
    const deadlineStr = new Date(newDeadline).toLocaleDateString('fr-FR');
    
    toast.info('Deadline mise à jour', {
      title: '📅 Échéance modifiée',
      message: `"${taskTitle}" due le ${deadlineStr}.`
    });
  };

  /**
   * 🏷️ PRIORITÉ MODIFIÉE
   */
  const handlePriorityUpdate = (taskTitle, newPriority) => {
    const priorityLabels = {
      low: '📝 Basse',
      medium: '📌 Moyenne', 
      high: '⚡ Haute',
      urgent: '🔥 Urgente'
    };

    toast.info('Priorité mise à jour', {
      title: '🏷️ Priorité modifiée',
      message: `"${taskTitle}" → ${priorityLabels[newPriority] || newPriority}.`
    });
  };

  /**
   * 📂 TÂCHE DÉPLACÉE VERS UN PROJET
   */
  const handleTaskMoveToProject = (taskTitle, projectName) => {
    toast.success('Tâche déplacée', {
      title: '📂 Changement de projet',
      message: `"${taskTitle}" déplacée vers "${projectName}".`
    });
  };

  /**
   * 🔄 CHANGEMENT DE STATUT
   */
  const handleStatusChange = (taskTitle, newStatus) => {
    const statusLabels = {
      todo: '📋 À faire',
      in_progress: '🔄 En cours',
      completed: '✅ Terminée',
      blocked: '🚫 Bloquée',
      cancelled: '❌ Annulée'
    };

    const statusColors = {
      todo: 'info',
      in_progress: 'info',
      completed: 'success',
      blocked: 'warning',
      cancelled: 'error'
    };

    const toastMethod = toast[statusColors[newStatus]] || toast.info;
    
    toastMethod('Statut mis à jour', {
      title: '🔄 Changement de statut',
      message: `"${taskTitle}" → ${statusLabels[newStatus] || newStatus}.`
    });
  };

  /**
   * ⚠️ TÂCHE EN RETARD
   */
  const handleOverdueTask = (taskTitle, daysOverdue) => {
    toast.warning('Tâche en retard!', {
      title: '⚠️ Deadline dépassée',
      message: `"${taskTitle}" est en retard de ${daysOverdue} jour(s).`
    });
  };

  /**
   * 🎯 STREAK DE TÂCHES TERMINÉES
   */
  const handleTaskStreak = (streakCount) => {
    if (streakCount >= 5) {
      toast.success(`${streakCount} tâches d'affilée!`, {
        title: '🔥 Streak fantastique!',
        message: 'Vous êtes en feu! Continuez ainsi!'
      });
    } else if (streakCount >= 3) {
      toast.success(`${streakCount} tâches d'affilée!`, {
        title: '🎯 Belle série!',
        message: 'Excellent rythme de travail!'
      });
    }
  };

  /**
   * 📊 ACHIEVEMENT DE PRODUCTIVITÉ
   */
  const handleProductivityAchievement = (achievementType, count) => {
    const achievements = {
      daily_goals: {
        title: '🎯 Objectif quotidien atteint!',
        message: `${count} tâches terminées aujourd'hui!`
      },
      weekly_goals: {
        title: '📅 Objectif hebdomadaire atteint!',
        message: `${count} tâches terminées cette semaine!`
      },
      task_milestone: {
        title: '🏆 Milestone atteint!',
        message: `${count} tâches terminées au total!`
      }
    };

    const achievement = achievements[achievementType];
    if (achievement) {
      toast.success(achievement.message, {
        title: achievement.title,
        message: 'Félicitations pour votre productivité!'
      });
    }
  };

  /**
   * 🔔 RAPPEL DE TÂCHE
   */
  const handleTaskReminder = (taskTitle, timeUntilDue) => {
    toast.info('Rappel de tâche', {
      title: '🔔 Échéance proche',
      message: `"${taskTitle}" due dans ${timeUntilDue}.`
    });
  };

  /**
   * 📈 ANALYSE DE COMPLEXITÉ
   */
  const handleComplexityAnalysis = (taskTitle, complexity, suggestedXP) => {
    const complexityLabels = {
      easy: '🟢 Facile',
      medium: '🟡 Moyenne',
      hard: '🟠 Difficile',
      expert: '🔴 Expert'
    };

    toast.info('Complexité analysée', {
      title: '📈 Évaluation automatique',
      message: `"${taskTitle}" → ${complexityLabels[complexity]} (${suggestedXP} XP)`
    });
  };

  /**
   * ❌ ERREURS DE VALIDATION
   */
  const handleValidationError = (field, message) => {
    toast.error(`Erreur de validation: ${field}`, {
      title: '❌ Données invalides',
      message: message
    });
  };

  /**
   * 💾 SAUVEGARDE AUTOMATIQUE
   */
  const handleAutoSave = () => {
    toast.info('Sauvegarde automatique', {
      title: '💾 Données sauvegardées',
      message: 'Vos modifications ont été automatiquement enregistrées.'
    });
  };

  /**
   * 🔄 SYNCHRONISATION TEMPS RÉEL
   */
  const handleRealtimeSync = (changedCount) => {
    if (changedCount > 0) {
      toast.info(`${changedCount} modification(s) synchronisée(s)`, {
        title: '🔄 Mise à jour temps réel',
        message: 'Vos données sont à jour.'
      });
    }
  };

  // Retourner toutes les actions disponibles
  return {
    // Actions principales
    handleTaskCompletion,
    handleTaskCreation,
    handleTaskUpdate,
    handleTaskDeletion,
    
    // Actions d'assignation et organisation
    handleTaskAssignment,
    handleTaskMoveToProject,
    handleStatusChange,
    
    // Actions de planning
    handleDeadlineUpdate,
    handlePriorityUpdate,
    handleTaskReminder,
    
    // Actions de gamification
    handleTaskStreak,
    handleProductivityAchievement,
    handleComplexityAnalysis,
    
    // Actions d'état et monitoring
    handleOverdueTask,
    handleValidationError,
    handleAutoSave,
    handleRealtimeSync
  };
};
