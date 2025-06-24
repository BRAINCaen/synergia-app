// src/shared/stores/taskStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskService } from '../../core/services/taskService.js';
import { gamificationService } from '../../core/services/gamificationService.js';

export const useTaskStore = create(
  devtools(
    (set, get) => ({
      // État
      tasks: [],
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        projectId: null
      },
      selectedTask: null,
      unsubscribe: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialiser l'écoute en temps réel
      initializeTaskSync: (userId) => {
        const { unsubscribe: currentUnsubscribe } = get();
        
        // Nettoyer l'ancien abonnement s'il existe
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        set({ loading: true, error: null });

        try {
          // Écouter les changements de tâches en temps réel
          const unsubscribe = taskService.subscribeToUserTasks(
            userId,
            (tasks) => {
              set({ 
                tasks, 
                loading: false, 
                error: null 
              });
              console.log(`📥 ${tasks.length} tâches synchronisées`);
            },
            get().filters
          );

          set({ unsubscribe });
          return unsubscribe;
        } catch (error) {
          console.error('❌ Erreur initialisation sync tâches:', error);
          set({ loading: false, error: error.message });
        }
      },

      // Nettoyer l'abonnement
      cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      // Créer une tâche
      createTask: async (taskData, userId) => {
        set({ loading: true, error: null });

        try {
          const newTask = await taskService.createTask(taskData, userId);
          
          // Mettre à jour les statistiques de gamification
          await gamificationService.updateTaskStats(userId, 'created');
          
          // XP pour création de tâche
          const xpResult = await gamificationService.addXP(userId, 5, 'Tâche créée');
          
          set({ loading: false });
          
          console.log('✅ Tâche créée avec succès');
          return { 
            success: true, 
            task: newTask,
            xpGained: xpResult.xpGained,
            newBadges: xpResult.newBadges
          };
        } catch (error) {
          console.error('❌ Erreur création tâche:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Mettre à jour une tâche
      updateTask: async (taskId, updates, userId) => {
        set({ loading: true, error: null });

        try {
          const updatedTask = await taskService.updateTask(taskId, updates, userId);
          
          // Si la tâche est marquée comme complétée
          if (updates.status === 'completed') {
            await gamificationService.updateTaskStats(userId, 'completed');
            
            // XP pour complétion de tâche
            const xpReward = updatedTask.xpReward || taskService.calculateXPReward(
              updatedTask.priority, 
              updatedTask.complexity
            );
            
            const xpResult = await gamificationService.addXP(
              userId, 
              xpReward, 
              `Tâche complétée: ${updatedTask.title}`
            );
            
            set({ loading: false });
            
            return { 
              success: true, 
              task: updatedTask,
              xpGained: xpResult.xpGained,
              levelUp: xpResult.levelUp,
              newBadges: xpResult.newBadges
            };
          }
          
          set({ loading: false });
          return { success: true, task: updatedTask };
        } catch (error) {
          console.error('❌ Erreur mise à jour tâche:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Supprimer une tâche
      deleteTask: async (taskId, userId) => {
        set({ loading: true, error: null });

        try {
          await taskService.deleteTask(taskId, userId);
          set({ loading: false });
          
          console.log('✅ Tâche supprimée avec succès');
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur suppression tâche:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Récupérer une tâche par ID
      getTaskById: async (taskId, userId) => {
        set({ loading: true, error: null });

        try {
          const task = await taskService.getTaskById(taskId, userId);
          set({ selectedTask: task, loading: false });
          return { success: true, task };
        } catch (error) {
          console.error('❌ Erreur récupération tâche:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Compléter une tâche avec récompenses
      completeTask: async (taskId, userId) => {
        try {
          const result = await taskService.completeTask(taskId, userId);
          
          if (result.xpGained > 0) {
            const xpResult = await gamificationService.addXP(
              userId, 
              result.xpGained, 
              result.message
            );
            
            return {
              ...result,
              levelUp: xpResult.levelUp,
              newBadges: xpResult.newBadges,
              totalXp: xpResult.totalXp
            };
          }
          
          return result;
        } catch (error) {
          console.error('❌ Erreur complétion tâche:', error);
          return { success: false, error: error.message };
        }
      },

      // Mettre à jour les filtres
      setFilters: (newFilters, userId) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        
        set({ filters: updatedFilters });
        
        // Réinitialiser l'abonnement avec les nouveaux filtres
        if (userId) {
          get().initializeTaskSync(userId);
        }
      },

      // Obtenir les tâches filtrées
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        
        return tasks.filter(task => {
          if (filters.status !== 'all' && task.status !== filters.status) {
            return false;
          }
          
          if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false;
          }
          
          if (filters.projectId && task.projectId !== filters.projectId) {
            return false;
          }
          
          return true;
        });
      },

      // Statistiques des tâches
      getTaskStats: () => {
        const tasks = get().tasks;
        
        return {
          total: tasks.length,
          completed: tasks.filter(task => task.status === 'completed').length,
          inProgress: tasks.filter(task => task.status === 'in_progress').length,
          todo: tasks.filter(task => task.status === 'todo').length,
          highPriority: tasks.filter(task => task.priority === 'high').length,
          overdue: tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            return new Date(task.dueDate) < new Date();
          }).length
        };
      },

      // Rechercher des tâches
      searchTasks: (searchTerm) => {
        const tasks = get().tasks;
        
        if (!searchTerm.trim()) {
          return tasks;
        }
        
        const term = searchTerm.toLowerCase();
        return tasks.filter(task => 
          task.title?.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term) ||
          task.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      },

      // Obtenir les tâches par priorité
      getTasksByPriority: () => {
        const tasks = get().tasks;
        
        return {
          high: tasks.filter(task => task.priority === 'high'),
          medium: tasks.filter(task => task.priority === 'medium'),
          low: tasks.filter(task => task.priority === 'low')
        };
      },

      // Obtenir les tâches récentes
      getRecentTasks: (limit = 5) => {
        const tasks = get().tasks;
        
        return tasks
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);
      },

      // Obtenir les tâches dues aujourd'hui
      getTodayTasks: () => {
        const tasks = get().tasks;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });
      },

      // Calculer le taux de complétion
      getCompletionRate: () => {
        const { total, completed } = get().getTaskStats();
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      }
    }),
    {
      name: 'task-store'
    }
  )
);

export default useTaskStore;
