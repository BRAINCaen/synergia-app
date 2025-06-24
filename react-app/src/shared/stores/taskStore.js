// ==========================================
// 📁 react-app/src/shared/stores/taskStore.js
// CORRECTION : Import gamificationService comme named export
// ==========================================

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// ✅ CORRECTION : Import correct selon votre structure existante
import taskService from '../../core/services/taskService.js';
import { gamificationService } from '../../core/services/gamificationService.js';  // Named import au lieu de default

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

        // ✅ Compléter une tâche avec récompense XP (VERSION SÉCURISÉE)
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

            // Ajouter XP selon la difficulté (avec try/catch pour éviter que ça casse)
            if (userId && gamificationService) {
              try {
                await gamificationService.completeTask(userId, task.difficulty || 'normal');
              } catch (gamificationError) {
                console.warn('⚠️ Erreur gamification (non bloquant):', gamificationError);
              }
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

        // ✅ Calculer les statistiques
        calculateStats: () => {
          const tasks = get().tasks;
          const now = new Date();
          
          const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            todo: tasks.filter(t => t.status === 'todo').length,
            overdue: tasks.filter(t => {
              if (!t.dueDate || t.status === 'completed') return false;
              const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
              return dueDate < now;
            }).length,
            totalXpEarned: 0, // À calculer si nécessaire
            completionRate: tasks.length > 0 
              ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
              : 0
          };

          set({ stats });
          return stats;
        },

        // ✅ Appliquer les filtres
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

          // Filtre par recherche
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(task => 
              task.title?.toLowerCase().includes(term) ||
              task.description?.toLowerCase().includes(term)
            );
          }

          // Tri
          filtered.sort((a, b) => {
            const direction = filters.orderDirection === 'asc' ? 1 : -1;
            
            switch (filters.orderBy) {
              case 'title':
                return direction * (a.title || '').localeCompare(b.title || '');
              case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return direction * ((priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));
              case 'dueDate':
                const aDate = a.dueDate ? (a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate)) : new Date(0);
                const bDate = b.dueDate ? (b.dueDate.toDate ? b.dueDate.toDate() : new Date(b.dueDate)) : new Date(0);
                return direction * (aDate.getTime() - bDate.getTime());
              case 'createdAt':
              default:
                const aCreated = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                const bCreated = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                return direction * (bCreated.getTime() - aCreated.getTime()); // Plus récent en premier par défaut
            }
          });

          return filtered;
        },

        // ✅ Mettre à jour les filtres
        updateFilters: (newFilters) => {
          set(state => ({
            filters: { ...state.filters, ...newFilters }
          }));
        },

        // ✅ Mettre à jour la recherche
        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        // ✅ Sélectionner une tâche
        setCurrentTask: (task) => {
          set({ currentTask: task });
        },

        // ✅ Nettoyer le store
        reset: () => {
          const { unsubscribeTasks } = get();
          if (unsubscribeTasks) {
            unsubscribeTasks();
          }
          
          set({
            tasks: [],
            currentTask: null,
            loading: false,
            creating: false,
            updating: false,
            deleting: false,
            unsubscribeTasks: null,
            searchTerm: '',
            stats: {
              total: 0,
              completed: 0,
              inProgress: 0,
              todo: 0,
              overdue: 0,
              totalXpEarned: 0,
              completionRate: 0
            }
          });
        }
      }),
      {
        name: 'task-store',
        partialize: (state) => ({
          tasks: state.tasks,
          filters: state.filters,
          currentTask: state.currentTask
        })
      }
    )
  )
);

export default useTaskStore;
