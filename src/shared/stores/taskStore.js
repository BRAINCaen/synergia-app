// ==========================================
// 📁 react-app/src/shared/stores/taskStore.js
// TaskStore STABLE - Version sans conflit GameStore
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTaskStore = create(
  persist(
    (set, get) => ({
      // 📋 ÉTAT INITIAL
      tasks: [],
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        project: 'all'
      },

      // 📝 ACTIONS CRUD
      addTask: (task) => {
        const newTask = {
          id: Date.now().toString(),
          ...task,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }));
        
        console.log('✅ Tâche créée:', newTask.title);
      },

      updateTask: (taskId, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }));
        
        // 🎮 INTÉGRATION GAMESTORE OPTIONNELLE (sans casser si absent)
        if (updates.status === 'completed') {
          try {
            // Vérifier si GameStore disponible
            const gameStore = window?.useGameStore?.getState?.();
            if (gameStore?.addXP) {
              gameStore.addXP(20, 'Tâche complétée');
            }
          } catch (error) {
            console.log('ℹ️ GameStore non disponible, pas d\'XP ajouté');
          }
        }
      },

      deleteTask: (taskId) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }));
      },

      completeTask: (taskId) => {
        get().updateTask(taskId, { 
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      },

      // 🔍 FILTRES
      setFilter: (filterType, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [filterType]: value
          }
        }));
      },

      getFilteredTasks: () => {
        const state = get();
        return state.tasks.filter(task => {
          if (state.filters.status !== 'all' && task.status !== state.filters.status) return false;
          if (state.filters.priority !== 'all' && task.priority !== state.filters.priority) return false;
          if (state.filters.project !== 'all' && task.projectId !== state.filters.project) return false;
          return true;
        });
      },

      // 📊 STATISTIQUES
      getTaskStats: () => {
        const tasks = get().tasks;
        return {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length
        };
      }
    }),
    {
      name: 'task-store-v3',
      partialize: (state) => ({
        tasks: state.tasks,
        filters: state.filters
      })
    }
  )
);

console.log('✅ TaskStore initialisé et stable');
