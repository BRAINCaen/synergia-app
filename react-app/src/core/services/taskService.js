// ==========================================
// 📁 react-app/src/core/services/taskService.js - SYSTÈME TÂCHES PUBLIQUES
// TOUTES LES TÂCHES VISIBLES PAR TOUS LES UTILISATEURS
// ==========================================

/**
 * 🌍 RÉCUPÉRER TOUTES LES TÂCHES PUBLIQUES (VISIBLE PAR TOUS)
 */
async getAllPublicTasks() {
  try {
    console.log('🌍 [GET_ALL_PUBLIC] Récupération de TOUTES les tâches publiques...');

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    const allTasks = [];
    
    tasksSnapshot.forEach(doc => {
      const taskData = doc.data();
      if (taskData && typeof taskData === 'object') {
        allTasks.push({
          id: doc.id,
          ...taskData,
          // ✅ Valeurs par défaut sécurisées
          title: taskData.title || 'Tâche sans titre',
          description: taskData.description || '',
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
          tags: Array.isArray(taskData.tags) ? taskData.tags : [],
          xpReward: typeof taskData.xpReward === 'number' ? taskData.xpReward : 25,
          estimatedHours: typeof taskData.estimatedHours === 'number' ? taskData.estimatedHours : 1,
          category: taskData.category || 'general',
          createdBy: taskData.createdBy || 'unknown'
        });
      }
    });

    console.log(`✅ [GET_ALL_PUBLIC] ${allTasks.length} tâches publiques récupérées`);
    return allTasks;

  } catch (error) {
    console.error('❌ [GET_ALL_PUBLIC] Erreur récupération tâches publiques:', error);
    throw error;
  }
}

/**
 * 📋 RÉCUPÉRER LES TÂCHES AVEC CLASSIFICATION UTILISATEUR
 * Retourne toutes les tâches avec info sur la relation à l'utilisateur
 */
async getTasksWithUserContext(userId) {
  try {
    console.log('📋 [GET_WITH_CONTEXT] Récupération tâches avec contexte utilisateur:', userId);

    // Récupérer toutes les tâches
    const allTasks = await this.getAllPublicTasks();
    
    // Ajouter le contexte utilisateur à chaque tâche
    const tasksWithContext = allTasks.map(task => {
      const isCreatedByMe = task.createdBy === userId;
      const isAssignedToMe = task.assignedTo.includes(userId);
      const canVolunteer = !isAssignedToMe && task.status !== 'completed';
      
      return {
        ...task,
        // ✅ Contexte utilisateur
        userContext: {
          isCreatedByMe,
          isAssignedToMe,
          isMyTask: isCreatedByMe || isAssignedToMe,
          canVolunteer,
          canEdit: isCreatedByMe || isAssignedToMe,
          canComplete: isAssignedToMe
        }
      };
    });

    console.log(`✅ [GET_WITH_CONTEXT] ${tasksWithContext.length} tâches avec contexte`);
    return tasksWithContext;

  } catch (error) {
    console.error('❌ [GET_WITH_CONTEXT] Erreur récupération tâches avec contexte:', error);
    throw error;
  }
}

/**
 * 🙋 SE PORTER VOLONTAIRE POUR UNE TÂCHE
 */
async volunteerForTask(taskId, userId) {
  try {
    console.log('🙋 [VOLUNTEER] Volontariat pour tâche:', { taskId, userId });

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Tâche introuvable');
    }

    const taskData = taskDoc.data();
    const currentAssigned = taskData.assignedTo || [];

    // Vérifier si l'utilisateur est déjà assigné
    if (currentAssigned.includes(userId)) {
      throw new Error('Vous êtes déjà assigné à cette tâche');
    }

    // Ajouter l'utilisateur aux assignés
    await updateDoc(taskRef, {
      assignedTo: arrayUnion(userId),
      status: taskData.status === 'pending' ? 'assigned' : taskData.status,
      updatedAt: serverTimestamp(),
      // Historique des volontaires
      volunteerHistory: arrayUnion({
        userId: userId,
        volunteeredAt: serverTimestamp(),
        action: 'volunteer'
      })
    });

    console.log('✅ [VOLUNTEER] Volontariat enregistré avec succès');
    return { success: true, message: 'Vous êtes maintenant assigné à cette tâche' };

  } catch (error) {
    console.error('❌ [VOLUNTEER] Erreur volontariat:', error);
    throw error;
  }
}

/**
 * 🚪 SE RETIRER D'UNE TÂCHE
 */
async withdrawFromTask(taskId, userId) {
  try {
    console.log('🚪 [WITHDRAW] Retrait de la tâche:', { taskId, userId });

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Tâche introuvable');
    }

    const taskData = taskDoc.data();
    const currentAssigned = taskData.assignedTo || [];

    // Vérifier si l'utilisateur est assigné
    if (!currentAssigned.includes(userId)) {
      throw new Error('Vous n\'êtes pas assigné à cette tâche');
    }

    // Retirer l'utilisateur des assignés
    const updates = {
      assignedTo: arrayRemove(userId),
      updatedAt: serverTimestamp(),
      // Historique des retraits
      volunteerHistory: arrayUnion({
        userId: userId,
        withdrawnAt: serverTimestamp(),
        action: 'withdraw'
      })
    };

    // Si c'était le seul assigné, remettre en pending
    if (currentAssigned.length === 1) {
      updates.status = 'pending';
    }

    await updateDoc(taskRef, updates);

    console.log('✅ [WITHDRAW] Retrait enregistré avec succès');
    return { success: true, message: 'Vous vous êtes retiré de cette tâche' };

  } catch (error) {
    console.error('❌ [WITHDRAW] Erreur retrait:', error);
    throw error;
  }
}

/**
 * 🎯 FILTRER LES TÂCHES PAR STATUT UTILISATEUR
 */
filterTasksByUserStatus(tasks, userId, status) {
  return tasks.filter(task => {
    const userContext = task.userContext || {};
    
    switch (status) {
      case 'my_tasks':
        return userContext.isMyTask;
      case 'available':
        return userContext.canVolunteer;
      case 'created_by_me':
        return userContext.isCreatedByMe;
      case 'assigned_to_me':
        return userContext.isAssignedToMe;
      case 'completed':
        return task.status === 'completed';
      case 'in_progress':
        return task.status === 'in_progress';
      case 'pending':
        return task.status === 'pending';
      default:
        return true; // Toutes les tâches
    }
  });
}

/**
 * 📊 STATISTIQUES GLOBALES DES TÂCHES
 */
async getGlobalTaskStats() {
  try {
    console.log('📊 [GLOBAL_STATS] Calcul statistiques globales...');

    const allTasks = await this.getAllPublicTasks();
    
    const stats = {
      total: allTasks.length,
      byStatus: {
        pending: allTasks.filter(t => t.status === 'pending').length,
        assigned: allTasks.filter(t => t.status === 'assigned').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        completed: allTasks.filter(t => t.status === 'completed').length
      },
      byPriority: {
        low: allTasks.filter(t => t.priority === 'low').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        high: allTasks.filter(t => t.priority === 'high').length,
        urgent: allTasks.filter(t => t.priority === 'urgent').length
      },
      byCategory: {},
      totalXP: allTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
      averageXP: allTasks.length > 0 ? Math.round(allTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / allTasks.length) : 0
    };

    // Statistiques par catégorie
    allTasks.forEach(task => {
      const category = task.category || 'non_classé';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    console.log('✅ [GLOBAL_STATS] Statistiques calculées:', stats);
    return stats;

  } catch (error) {
    console.error('❌ [GLOBAL_STATS] Erreur calcul statistiques:', error);
    throw error;
  }
}
