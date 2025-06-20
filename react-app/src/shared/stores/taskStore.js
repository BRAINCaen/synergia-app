// src/shared/stores/taskStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Store temporaire jusqu'à intégration complète des services
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
    
    // ✅ Actions - Chargement des tâches
    loadUserTasks: async (userId) => {
      set({ loading: true });
      try {
        // TODO: Remplacer par TaskService.getUserTasks(userId, filters) quand services créés
        const mockTasks = [
          {
            id: 'task_1',
            title: 'Créer les composants Task',
            description: 'Implémenter TaskCard, TaskForm et TaskList',
            status: 'in_progress',
            priority: 'high',
            dueDate: new Date('2025-06-22'),
            estimatedTime: 240,
            tags: ['development', 'react'],
            assignedTo: userId,
            createdBy: userId,
            createdAt: new Date('2025-06-20'),
            xpReward: 40
          },
          {
            id: 'task_2',
            title: 'Tester l\'interface',
            description: 'Vérifier que tout fonctionne correctement',
            status: 'todo',
            priority: 'medium',
            dueDate: new Date('2025-06-23'),
            estimatedTime: 120,
            tags: ['testing'],
            assignedTo: userId,
            createdBy: userId,
            createdAt: new Date('2025-06-20'),
            xpReward: 25
          }
        ];
        
        set({ tasks: mockTasks, loading: false });
        get().updateStats(userId);
        return mockTasks;
      } catch (error) {
        console.error('Erreur chargement tâches:', error);
        set({ loading: false });
        throw error;
      }
    },

    // ✅ Créer une tâche
    createTask: async (taskData, userId) => {
      set({ creating: true });
      try {
        // TODO: Remplacer par TaskService.createTask(taskData, userId) quand services créés
        const newTask = {
          id: `task_${Date.now()}`,
          ...taskData,
          status: 'todo',
          assignedTo: userId,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
          isXpClaimed: false,
          xpReward: 0,
          tags: taskData.tags || [],
          attachments: [],
          comments: []
        };
        
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

    // ✅ Mettre à jour une tâche
    updateTask: async (taskId, updates, userId) => {
      set({ updating: true });
      try {
        // TODO: Remplacer par TaskService.updateTask(taskId, updates, userId) quand services créés
        const updatedTask = { ...updates, updatedAt: new Date() };
        
        // Mettre à jour dans la liste locale
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          ),
          currentTask: state.currentTask?.id === taskId ? { ...state.currentTask, ...updatedTask } : state.currentTask,
          updating: false
        }));
        
        return updatedTask;
      } catch (error) {
        console.error('Erreur mise à jour tâche:', error);
        set({ updating: false });
        throw error;
      }
    },

    // 🎮 Compléter une tâche avec XP
    completeTask: async (taskId, userId, actualTime = null) => {
      try {
        // TODO: Remplacer par TaskService.completeTask(taskId, userId, actualTime) quand services créés
        const xpEarned = 40; // Calculé selon priorité + bonus
        
        // Mettre à jour la tâche localement
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', completedAt: new Date(), actualTime, isXpClaimed: true, xpReward: xpEarned }
              : task
          )
        }));
        
        // Déclencher animation XP dans gameStore si disponible
        if (window.useGameStore) {
          const gameStore = window.useGameStore.getState();
          if (gameStore.triggerXpGain) {
            gameStore.triggerXpGain(xpEarned, 'task_completed');
          }
        }
        
        // Recharger les stats
        get().updateStats(userId);
        
        return {
          taskId,
          xpEarned,
          completedAt: new Date()
        };
      } catch (error) {
        console.error('Erreur completion tâche:', error);
        throw error;
      }
    },

    // ✅ Supprimer une tâche
    deleteTask: async (taskId, userId) => {
      set({ deleting: true });
      try {
        // TODO: Remplacer par TaskService.deleteTask(taskId, userId) quand services créés
        
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

    // 📊 Mettre à jour les statistiques
    updateStats: async (userId) => {
      try {
        const { tasks } = get();
        const now = new Date();
        
        const overdue = tasks.filter(t => {
          if (t.status === 'completed' || !t.dueDate) return false;
          const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : t.dueDate;
          return dueDate < now;
        });
        
        const stats = {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          todo: tasks.filter(t => t.status === 'todo').length,
          overdue: overdue.length,
          totalXpEarned: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
        };
        
        set({ stats });
      } catch (error) {
        console.error('Erreur mise à jour stats:', error);
      }
    },

    // 🔔 Subscription temps réel (mock pour l'instant)
    subscribeToTasks: (userId) => {
      // TODO: Implémenter avec TaskService.subscribeToUserTasks quand services créés
      console.log('Subscription tâches activée pour:', userId);
      
      // Mock subscription
      const mockUnsubscribe = () => {
        console.log('Subscription tâches fermée');
      };
      
      set({ unsubscribeTasks: mockUnsubscribe });
      return mockUnsubscribe;
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
