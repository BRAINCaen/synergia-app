// ==========================================
// 📁 react-app/src/shared/hooks/useTaskActions.js
// Hook pour actions quêtes avec toasts - VERSION QUÊTES
// ==========================================

import { useToast } from '../components/ToastNotification.jsx';

export const useTaskActions = () => {
  const { toast } = useToast();

  /**
   * ✅ COMPLETION D'UNE QUÊTE AVEC XP
   */
  const handleTaskCompletion = (taskData, xpResult) => {
    // Toast principal de completion
    toast.success(`Quête "${taskData.title}" terminée!`, {
      title: '✅ Quête accomplie',
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
   * 📝 CRÉATION D'UNE NOUVELLE QUÊTE
   */
  const handleTaskCreation = (taskData) => {
    toast.success('Nouvelle quête créée!', {
      title: '📝 Quête ajoutée',
      message: `"${taskData.title}" a été ajoutée à votre liste.`
    });
  };

  /**
   * ✏️ MODIFICATION D'UNE QUÊTE
   */
  const handleTaskUpdate = (taskData) => {
    toast.info('Quête modifiée', {
      title: '✏️ Modification sauvegardée',
      message: `"${taskData.title}" a été mise à jour.`
    });
  };

  /**
   * 🗑️ SUPPRESSION D'UNE QUÊTE
   */
  const handleTaskDeletion = (taskTitle) => {
    toast.warning('Quête supprimée', {
      title: '🗑️ Suppression confirmée',
      message: `"${taskTitle}" a été supprimée définitivement.`
    });
  };

  /**
   * 📅 QUÊTE ASSIGNÉE
   */
  const handleTaskAssignment = (taskTitle, assigneeName) => {
    toast.info('Quête assignée', {
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
   * 📂 QUÊTE DÉPLACÉE VERS UN PROJET
   */
  const handleTaskMoveToProject = (taskTitle, projectName) => {
    toast.success('Quête déplacée', {
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
      completed: '✅ Accomplie',
      blocked: '🚫 Bloquée',
      cancelled: '❌ Annulée',
      validated: '🏆 Validée'
    };

    const statusColors = {
      todo: 'info',
      in_progress: 'info',
      completed: 'success',
      validated: 'success',
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
   * ⚠️ QUÊTE EN RETARD
   */
  const handleOverdueTask = (taskTitle, daysOverdue) => {
    toast.warning('Quête en retard!', {
      title: '⚠️ Deadline dépassée',
      message: `"${taskTitle}" est en retard de ${daysOverdue} jour(s).`
    });
  };

  /**
   * 🎯 STREAK DE QUÊTES TERMINÉES
   */
  const handleTaskStreak = (streakCount) => {
    if (streakCount >= 5) {
      toast.success(`${streakCount} quêtes d'affilée!`, {
        title: '🔥 Streak fantastique!',
        message: 'Vous êtes en feu! Continuez ainsi!'
      });
    } else if (streakCount >= 3) {
      toast.success(`${streakCount} quêtes d'affilée!`, {
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
        message: `${count} quêtes terminées aujourd'hui!`
      },
      weekly_goals: {
        title: '📅 Objectif hebdomadaire atteint!',
        message: `${count} quêtes terminées cette semaine!`
      },
      task_milestone: {
        title: '🏆 Milestone atteint!',
        message: `${count} quêtes terminées au total!`
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
   * 🔔 RAPPEL DE QUÊTE
   */
  const handleTaskReminder = (taskTitle, timeUntilDue) => {
    toast.info('Rappel de quête', {
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

  /**
   * 🎮 QUÊTE ACCEPTÉE PAR VOLONTAIRE
   */
  const handleVolunteerAccept = (taskTitle, userName) => {
    toast.success('Volontaire accepté!', {
      title: '🎮 Nouvelle assignation',
      message: `${userName} s'est porté volontaire pour "${taskTitle}".`
    });
  };

  /**
   * 🚫 VOLONTAIRE REJETÉ
   */
  const handleVolunteerReject = (taskTitle, userName) => {
    toast.warning('Volontaire rejeté', {
      title: '🚫 Candidature refusée',
      message: `La candidature de ${userName} pour "${taskTitle}" a été refusée.`
    });
  };

  /**
   * 🎯 QUÊTE VALIDÉE PAR ADMIN
   */
  const handleTaskValidation = (taskTitle, xpEarned) => {
    toast.success('Quête validée!', {
      title: '🏆 Validation réussie',
      message: `"${taskTitle}" a été validée! +${xpEarned} XP`
    });
  };

  /**
   * ❌ QUÊTE REJETÉE PAR ADMIN
   */
  const handleTaskRejection = (taskTitle, reason) => {
    toast.error('Quête rejetée', {
      title: '❌ Validation refusée',
      message: reason ? `"${taskTitle}" - Raison: ${reason}` : `"${taskTitle}" n'a pas été validée.`
    });
  };

  /**
   * 🔄 QUÊTE RÉCURRENTE CRÉÉE
   */
  const handleRecurringTaskCreated = (taskTitle, recurrenceType) => {
    const recurrenceLabels = {
      daily: 'quotidienne',
      weekly: 'hebdomadaire',
      monthly: 'mensuelle'
    };

    toast.info('Quête récurrente créée', {
      title: '🔄 Récurrence activée',
      message: `"${taskTitle}" sera créée automatiquement (${recurrenceLabels[recurrenceType]}).`
    });
  };

  /**
   * 📎 FICHIER ATTACHÉ
   */
  const handleFileAttached = (fileName, taskTitle) => {
    toast.success('Fichier attaché', {
      title: '📎 Pièce jointe ajoutée',
      message: `"${fileName}" ajouté à "${taskTitle}".`
    });
  };

  /**
   * 💬 COMMENTAIRE AJOUTÉ
   */
  const handleCommentAdded = (taskTitle) => {
    toast.success('Commentaire ajouté', {
      title: '💬 Nouveau commentaire',
      message: `Commentaire ajouté à "${taskTitle}".`
    });
  };

  /**
   * 🏷️ TAG AJOUTÉ
   */
  const handleTagAdded = (tagName, taskTitle) => {
    toast.info('Tag ajouté', {
      title: '🏷️ Étiquette',
      message: `Tag "${tagName}" ajouté à "${taskTitle}".`
    });
  };

  /**
   * 👥 ÉQUIPE ASSIGNÉE
   */
  const handleTeamAssigned = (taskTitle, teamName) => {
    toast.success('Équipe assignée', {
      title: '👥 Assignation d\'équipe',
      message: `"${taskTitle}" assignée à l'équipe "${teamName}".`
    });
  };

  /**
   * 🎁 RÉCOMPENSE GAGNÉE
   */
  const handleRewardEarned = (rewardName, taskTitle) => {
    toast.success('Récompense débloquée!', {
      title: '🎁 Nouvelle récompense',
      message: `"${rewardName}" gagné en complétant "${taskTitle}"!`
    });
  };

  /**
   * 🏆 BADGE DÉBLOQUÉ
   */
  const handleBadgeUnlocked = (badgeName) => {
    toast.success('Badge débloqué!', {
      title: '🏆 Nouvel accomplissement',
      message: `Vous avez débloqué le badge "${badgeName}"!`
    });
  };

  /**
   * ⬆️ NIVEAU ATTEINT
   */
  const handleLevelUp = (newLevel) => {
    toast.success(`Niveau ${newLevel} atteint!`, {
      title: '⬆️ Progression',
      message: 'Félicitations pour votre progression!'
    });
  };

  /**
   * 🔔 NOTIFICATION SYSTÈME
   */
  const handleSystemNotification = (title, message) => {
    toast.info(message, {
      title: `🔔 ${title}`,
      message: message
    });
  };

  /**
   * ⚡ ACTION RAPIDE RÉUSSIE
   */
  const handleQuickAction = (actionType) => {
    const actions = {
      duplicate: 'Quête dupliquée',
      archive: 'Quête archivée',
      restore: 'Quête restaurée',
      export: 'Quête exportée'
    };

    toast.success(actions[actionType] || 'Action réussie', {
      title: '⚡ Action rapide',
      message: 'L\'opération a été effectuée avec succès.'
    });
  };

  /**
   * 🔒 QUÊTE VERROUILLÉE
   */
  const handleTaskLocked = (taskTitle, reason) => {
    toast.warning('Quête verrouillée', {
      title: '🔒 Accès restreint',
      message: reason || `"${taskTitle}" est actuellement verrouillée.`
    });
  };

  /**
   * 🔓 QUÊTE DÉVERROUILLÉE
   */
  const handleTaskUnlocked = (taskTitle) => {
    toast.success('Quête déverrouillée!', {
      title: '🔓 Accès autorisé',
      message: `"${taskTitle}" est maintenant disponible.`
    });
  };

  /**
   * 📊 STATISTIQUES MISES À JOUR
   */
  const handleStatsUpdated = () => {
    toast.info('Statistiques actualisées', {
      title: '📊 Mise à jour',
      message: 'Vos statistiques ont été mises à jour.'
    });
  };

  /**
   * 🎯 OBJECTIF ATTEINT
   */
  const handleGoalAchieved = (goalName) => {
    toast.success('Objectif atteint!', {
      title: '🎯 Accomplissement',
      message: `Vous avez atteint l'objectif "${goalName}"!`
    });
  };

  /**
   * 🌟 QUÊTE FAVORITE
   */
  const handleTaskFavorited = (taskTitle) => {
    toast.info('Quête ajoutée aux favoris', {
      title: '🌟 Favori',
      message: `"${taskTitle}" ajoutée à vos favoris.`
    });
  };

  /**
   * 🔍 RECHERCHE SANS RÉSULTAT
   */
  const handleNoSearchResults = () => {
    toast.info('Aucun résultat', {
      title: '🔍 Recherche',
      message: 'Aucune quête ne correspond à votre recherche.'
    });
  };

  /**
   * 📤 EXPORT RÉUSSI
   */
  const handleExportSuccess = (format) => {
    toast.success('Export réussi!', {
      title: '📤 Téléchargement',
      message: `Vos quêtes ont été exportées au format ${format.toUpperCase()}.`
    });
  };

  /**
   * 📥 IMPORT RÉUSSI
   */
  const handleImportSuccess = (count) => {
    toast.success(`${count} quête(s) importée(s)`, {
      title: '📥 Import réussi',
      message: 'Les quêtes ont été ajoutées à votre liste.'
    });
  };

  // Retourner toutes les fonctions
  return {
    handleTaskCompletion,
    handleTaskCreation,
    handleTaskUpdate,
    handleTaskDeletion,
    handleTaskAssignment,
    handleDeadlineUpdate,
    handlePriorityUpdate,
    handleTaskMoveToProject,
    handleStatusChange,
    handleOverdueTask,
    handleTaskStreak,
    handleProductivityAchievement,
    handleTaskReminder,
    handleComplexityAnalysis,
    handleValidationError,
    handleAutoSave,
    handleRealtimeSync,
    handleVolunteerAccept,
    handleVolunteerReject,
    handleTaskValidation,
    handleTaskRejection,
    handleRecurringTaskCreated,
    handleFileAttached,
    handleCommentAdded,
    handleTagAdded,
    handleTeamAssigned,
    handleRewardEarned,
    handleBadgeUnlocked,
    handleLevelUp,
    handleSystemNotification,
    handleQuickAction,
    handleTaskLocked,
    handleTaskUnlocked,
    handleStatsUpdated,
    handleGoalAchieved,
    handleTaskFavorited,
    handleNoSearchResults,
    handleExportSuccess,
    handleImportSuccess
  };
};

export default useTaskActions;
