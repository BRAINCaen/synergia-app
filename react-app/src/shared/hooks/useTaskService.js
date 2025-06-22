// ==========================================
// 📁 react-app/src/shared/hooks/useTaskService.js
// Hook d'intégration TaskService + Store - IMPORTS CORRIGÉS
// ==========================================

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useTaskStore } from '../stores/taskStore.js';

export const useTaskService = () => {
  const { user } = useAuthStore();
  const { 
    tasks,
    loading,
    creating,
    updating,
    deleting,
    loadUserTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    subscribeToTasks,
    getFilteredTasks,
    setFilters,
    setSearchTerm,
    stats,
    cleanup
  } = useTaskStore();

  // 🔄 Synchroniser les tâches au montage
  const syncTasks = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await loadUserTasks(user.uid);
    } catch (error) {
      console.error('Erreur sync tâches:', error);
    }
  }, [user?.uid, loadUserTasks]);

  // ⭐ Actions avec gestion automatique userId
  const actions = {
    createTask: useCallback(async (taskData) => {
      if (!user?.uid) throw new Error('Utilisateur non connecté');
      return await createTask(taskData, user.uid);
    }, [user?.uid, createTask]),
    
    updateTask: useCallback(async (taskId, updates) => {
      if (!user?.uid) throw new Error('Utilisateur non connecté');
      return await updateTask(taskId, updates, user.uid);
    }, [user?.uid, updateTask]),
    
    completeTask: useCallback(async (taskId, actualTime = null) => {
      if (!user?.uid) throw new Error('Utilisateur non connecté');
      return await completeTask(taskId, user.uid, actualTime);
    }, [user?.uid, completeTask]),
    
    deleteTask: useCallback(async (taskId) => {
      if (!user?.uid) throw new Error('Utilisateur non connecté');
      return await deleteTask(taskId, user.uid);
    }, [user?.uid, deleteTask]),
    
    syncTasks
  };

  // 📊 Selectors optimisés
  const selectors = {
    getTodoTasks: useCallback(() => tasks.filter(t => t.status === 'todo'), [tasks]),
    getInProgressTasks: useCallback(() => tasks.filter(t => t.status === 'in_progress'), [tasks]),
    getCompletedTasks: useCallback(() => tasks.filter(t => t.status === 'completed'), [tasks]),
    getOverdueTasks: useCallback(() => {
      const now = new Date();
      return tasks.filter(t => {
        if (t.status === 'completed' || !t.dueDate) return false;
        const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
        return dueDate < now;
      });
    }, [tasks]),
    getFilteredTasks
  };

  // 🔄 Écoute temps réel et synchronisation initiale
  useEffect(() => {
    if (!user?.uid) return;

    // Synchronisation initiale
    syncTasks();

    // Écoute temps réel
    const unsubscribe = subscribeToTasks(user.uid);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, subscribeToTasks, syncTasks]);

  // 🧹 Nettoyage lors du logout
  useEffect(() => {
    if (!user) {
      cleanup();
    }
  }, [user, cleanup]);

  return {
    // Données
    tasks,
    stats,
    
    // États
    loading,
    creating,
    updating,
    deleting,
    
    // Actions
    ...actions,
    
    // Sélecteurs
    ...selectors,
    
    // Filtres
    setFilters,
    setSearchTerm,
    
    // État de connexion
    isConnected: !!user?.uid
  };
};
