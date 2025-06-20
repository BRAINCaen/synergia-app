// src/shared/stores/taskStore.js - Version Firebase réelle
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { TaskService, ProjectService } from '../../core/services/taskService.js';

// Store avec vrais services Firebase
export const useTaskStore = create(
  subscribeWithSelector((set, get) => ({
    // État des tâches
    tasks: [],
    currentTask: null,
    
    // États de chargement
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    
    // Filtres et recherche
    filters: {
      status: 'all', // 'all', 'todo', 'in_progress', 'completed'
      priority: 'all', // 'all', 'low', 'medium', 'high', 'urgent'
      projectId: 'all', // 'all' ou projectId spécifique
      orderBy: 'createdAt',
      orderDirection: 'desc'
    },
    searchTerm: '',
    
    // Statistiques
    stats: {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0,
      totalXpEarned: 0
    },
    
    // Subscriptions temps réel
    unsubscribeTasks: null,
    
    // ✅ Actions - Chargement des tâches avec Firebase
    loadUserTasks: async (userId) => {
      set({ loading: true });
      try {
        const filters = get().getActiveFilters();
        const tasks = await TaskService.getUserTasks(userId, filters);
        set({ tasks, loading: false });
        
        // Mettre à jour les stats
        get().updateStats(userId);
        
        return tasks;
      } catch (error) {
        console.error('Erreur chargement tâches:', error);
        set({ loading: false });
        throw error;
      }
    },

    // ✅ Créer une tâche avec Firebase
    createTask: async (taskData, userId) => {
      set({ creating: true });
      try {
        const newTask = await TaskService.createTask(taskData, userId);
        
        // Ajouter à la liste locale
        set(state => ({
          tasks: [newTask, ...state.tasks],
          creating: false
        }));
        
        // Recharger les stats
        get().updateStats(userId);
        
        return newTask;
      } catch (error) {
        console.error('Erreur création tâche:', error);
        set({ creating: false });
        throw error;
      }
    },

    // ✅ Mettre à jour une tâche avec Firebase
    updateTask: async (taskId, updates, userId) => {
      set({ updating: true });
      try {
        const updatedTask = await TaskService.updateTask(taskId, updates, userId);
        
        // Mettre à jour dans la liste locale
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? updatedTask : task
          ),
          currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask,
          updating: false
        }));
        
        return updatedTask;
      } catch (error) {
        console.error('Erreur mise à jour tâche:', error);
        set({ updating: false });
        throw error;
      }
    },

    // 🎮 Compléter une tâche avec XP Firebase
    completeTask: async (taskId, userId, actualTime = null) => {
      try {
        const result = await TaskService.completeTask(taskId, userId, actualTime);
        
        // Mettre à jour la tâche localement
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', completedAt: result.completedAt, actualTime, isXpClaimed: true, xpReward: result.xpEarned }
              : task
          )
        }));
        
        // Déclencher animation XP dans gameStore si disponible
        if (window.useGameStore) {
          const gameStore = window.useGameStore.getState();
          if (gameStore.triggerXpGain) {
            gameStore.triggerXpGain(result.xpEarned, 'task_completed');
          }
        }
        
        // Recharger les stats
        get().updateStats(userId);
        
        return result;
      } catch (error) {
        console.error('Erreur completion tâche:', error);
        throw error;
      }
    },

    // ✅ Supprimer une tâche avec Firebase
    deleteTask: async (taskId, userId) => {
      set({ deleting: true });
      try {
        await TaskService.deleteTask(taskId, userId);
        
        // Retirer de la liste locale
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId),
          currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
          deleting: false
        }));
        
        return taskId;
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
        set({ deleting: false });
        throw error;
      }
    },

    // 🔍 Recherche et filtrage
    setFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    setSearchTerm: (searchTerm) => {
      set({ searchTerm });
    },

    // Obtenir les filtres actifs pour l'API
    getActiveFilters: () => {
      const { filters } = get();
      const apiFilters = {};
      
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.priority !== 'all') apiFilters.priority = filters.priority;
      if (filters.projectId !== 'all') apiFilters.projectId = filters.projectId;
      
      apiFilters.orderBy = filters.orderBy;
      apiFilters.orderDirection = filters.orderDirection;
      
      return apiFilters;
    },

    // Obtenir les tâches filtrées (côté client)
    getFilteredTasks: () => {
      const { tasks, searchTerm, filters } = get();
      
      let filtered = [...tasks];
      
      // Filtrer par statut
      if (filters.status !== 'all') {
        filtered = filtered.filter(task => task.status === filters.status);
      }
      
      // Filtrer par priorité
      if (filters.priority !== 'all') {
        filtered = filtered.filter(task => task.priority === filters.priority);
      }
      
      // Filtrer par projet
      if (filters.projectId !== 'all') {
        if (filters.projectId === '') {
          filtered = filtered.filter(task => !task.projectId);
        } else {
          filtered = filtered.filter(task => task.projectId === filters.projectId);
        }
      }
      
      // Recherche textuelle
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return filtered;
    },

    // Tâches par statut
    getTodoTasks: () => get().tasks.filter(t => t.status === 'todo'),
    getInProgressTasks: () => get().tasks.filter(t => t.status === 'in_progress'),
    getCompletedTasks: () => get().tasks.filter(t => t.status === 'completed'),
    getOverdueTasks: () => {
      const now = new Date();
      return get().tasks.filter(t => {
        if (t.status === 'completed' || !t.dueDate) return false;
        const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : t.dueDate;
        return dueDate < now;
      });
    },

    // 📊 Mettre à jour les statistiques avec Firebase
    updateStats: async (userId) => {
      try {
        const stats = await TaskService.getTaskStats(userId, 'week');
        set({ stats });
      } catch (error) {
        console.error('Erreur mise à jour stats:', error);
      }
    },

    // 🔔 Subscription temps réel Firebase
    subscribeToTasks: (userId) => {
      // Nettoyer l'ancienne subscription
      const currentUnsub = get().unsubscribeTasks;
      if (currentUnsub) currentUnsub();
      
      const filters = get().getActiveFilters();
      const unsubscribe = TaskService.subscribeToUserTasks(
        userId,
        (tasks) => {
          set({ tasks });
          get().updateStats(userId);
        },
        filters
      );
      
      set({ unsubscribeTasks: unsubscribe });
      return unsubscribe;
    },

    // Nettoyer les subscriptions
    cleanup: () => {
      const { unsubscribeTasks } = get();
      if (unsubscribeTasks) {
        unsubscribeTasks();
        set({ unsubscribeTasks: null });
      }
    },

    // Réinitialiser le store
    reset: () => {
      get().cleanup();
      set({
        tasks: [],
        currentTask: null,
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
        searchTerm: '',
        stats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          overdue: 0,
          totalXpEarned: 0
        }
      });
    }
  }))
);
