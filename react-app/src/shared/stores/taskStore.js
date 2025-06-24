// ==========================================
// 📁 react-app/src/shared/stores/taskStore.js
// Store Zustand pour la gestion des tâches avec imports corrigés
// ==========================================

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// ✅ CORRECTION : Import default au lieu de named import
import taskService from '../../core/services/taskService.js';
import gamificationService from '../../core/services/gamificationService.js';

export const useTaskStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // État des tâches
        tasks: [],
        currentTask: null,
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
        
        // Filtres et recherche
        filters: {
          status: 'all',
          priority: 'all',
          projectId: 'all',
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
          totalXpEarned: 0,
          completionRate: 0
        },
        
        // Subscriptions temps réel
        unsubscribeTasks: null,
        
        // ✅ Actions - Chargement des tâches avec Firebase
        loadUserTasks: async (userId) => {
          set({ loading: true });
          try {
            const tasks = await taskService.getUserTasks(userId);
            set({ tasks, loading: false });
            
            // Mettre à jour les stats
            get().calculateStats();
            
            return tasks;
          } catch (error) {
            console.error('❌ Erreur chargement tâches:', error);
            set({ loading: false });
            throw error;
          }
        },

        // ✅ Créer une tâche avec Firebase
        createTask: async (taskData, userId) => {
          if (!userId) {
            throw new Error('UserId requis pour créer une tâche');
          }
          
          set({ creating: true });
          try {
            const newTask = await taskService.createTask(userId, taskData);
            
            // Ajouter à la liste locale
            set(state => ({
              tasks: [newTask, ...state.tasks],
              creating: false
            }));
            
            // Recalculer les stats
            get().calculateStats();
            
            return newTask;
          } catch (error) {
            console.error('❌ Erreur création tâche:', error);
            set({ creating: false });
            throw error;
          }
        },

        // ✅ Mettre à jour une tâche
        updateTask: async (taskId, updates, userId) => {
          set({ updating: true });
          try {
            await taskService.updateTask(taskId, updates);
            
            set(state => ({
              tasks: state.tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
              ),
              currentTask: state.currentTask?.id === taskId ? 
                { ...state.currentTask, ...updates } : state.currentTask,
              updating: false
            }));
            
            // Recalculer les stats
            get().calculateStats();
            
            return { success: true };
          } catch (error) {
            console.error('❌ Erreur mise à jour tâche:', error);
            set({ updating: false });
            throw error;
          }
        },

        // ✅ Compléter une tâche avec récompense XP
        completeTask: async (taskId, userId) => {
          try {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) {
              throw new Error('Tâche introuvable');
            }

            // Marquer comme complétée
            await get().updateTask(taskId, { 
              status: 'completed',
              completedAt: new Date().toISOString()
            }, userId);

            // Ajouter XP selon la difficulté
            if (userId) {
              await gamificationService.completeTask(userId, task.difficulty || 'normal');
            }

            return { success: true, task };
          } catch (error) {
            console.error('❌ Erreur completion tâche:', error);
            throw error;
          }
        },

        // ✅ Supprimer une tâche
        deleteTask: async (taskId) => {
          set({ deleting: true });
          try {
            await taskService.deleteTask(taskId);
            
            set(state => ({
              tasks: state.tasks.filter(task => task.id !== taskId),
              currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
              deleting: false
            }));
            
            // Recalculer les stats
            get().calculateStats();
            
            return { success: true };
          } catch (error) {
            console.error('❌ Erreur suppression tâche:', error);
            set({ deleting: false });
            throw error;
          }
        },

        // ✅ Écouter les changements en temps réel
        subscribeToTasks: (userId) => {
          // Nettoyer l'ancien abonnement
          const { unsubscribeTasks } = get();
          if (unsubscribeTasks) {
            unsubscribeTasks();
          }

          // Nouvel abonnement
          const unsubscribe = taskService.subscribeToUserTasks(userId, (tasks) => {
            set({ tasks });
            get().calculateStats();
          });

          set({ unsubscribeTasks: unsubscribe });
          return unsubscribe;
        },

        // ✅ Calculer les statistiques
        calculateStats: () => {
          const { tasks } = get();
          
          const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            todo: tasks.filter(t => t.status === 'todo').length,
            overdue: tasks.filter(t => {
              if (!t.dueDate) return false;
              return new Date(t.dueDate) < new Date() && t.status !== 'completed';
            }).length,
            totalXpEarned: tasks
              .filter(t => t.status === 'completed')
              .reduce((total, task) => {
                const xpRewards = { easy: 20, normal: 40, hard: 60, expert: 100 };
                return total + (xpRewards[task.difficulty] || 40);
              }, 0),
            completionRate: tasks.length > 0 ? 
              Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
          };

          set({ stats });
          return stats;
        },

        // ✅ Filtrer les tâches
        getFilteredTasks: () => {
          const { tasks, filters, searchTerm } = get();
          
          let filtered = [...tasks];

          // Filtre par statut
          if (filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
          }

          // Filtre par priorité
          if (filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
          }

          // Filtre par projet
          if (filters.projectId !== 'all') {
            filtered = filtered.filter(task => task.projectId === filters.projectId);
          }

          // Recherche textuelle
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(task => 
              task.title?.toLowerCase().includes(term) ||
              task.description?.toLowerCase().includes(term)
            );
          }

          // Tri
          filtered.sort((a, b) => {
            const field = filters.orderBy;
            const direction = filters.orderDirection === 'asc' ? 1 : -1;
            
            if (field === 'createdAt' || field === 'updatedAt') {
              return direction * (new Date(b[field]) - new Date(a[field]));
            }
            
            return direction * (a[field] || '').localeCompare(b[field] || '');
          });

          return filtered;
        },

        // ✅ Actions de filtrage
        setFilter: (filterType, value) => {
          set(state => ({
            filters: { ...state.filters, [filterType]: value }
          }));
        },

        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        clearFilters: () => {
          set({
            filters: {
              status: 'all',
              priority: 'all',
              projectId: 'all',
              orderBy: 'createdAt',
              orderDirection: 'desc'
            },
            searchTerm: ''
          });
        },

        // ✅ Sélectionner une tâche courante
        setCurrentTask: (task) => {
          set({ currentTask: task });
        },

        // ✅ Nettoyer les abonnements
        cleanup: () => {
          const { unsubscribeTasks } = get();
          if (unsubscribeTasks) {
            unsubscribeTasks();
          }
          set({ unsubscribeTasks: null });
        }
      }),
      {
        name: 'task-store',
        partialize: (state) => ({
          filters: state.filters,
          searchTerm: state.searchTerm
        })
      }
    )
  )
);
