// ==========================================
// 📁 react-app/src/shared/stores/projectStore.js
// ProjectStore STABLE - Version sans conflit
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // 📁 ÉTAT INITIAL
      projects: [],
      loading: false,
      error: null,
      currentProject: null,

      // 📝 ACTIONS CRUD
      addProject: (project) => {
        const newProject = {
          id: Date.now().toString(),
          ...project,
          createdAt: new Date().toISOString(),
          status: 'active',
          progress: 0,
          tasksCount: 0,
          completedTasks: 0
        };
        
        set(state => ({
          projects: [...state.projects, newProject]
        }));
        
        console.log('✅ Projet créé:', newProject.name);
      },

      updateProject: (projectId, updates) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId ? { ...project, ...updates } : project
          )
        }));
      },

      deleteProject: (projectId) => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== projectId)
        }));
      },

      setCurrentProject: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        set({ currentProject: project });
      },

      // 📊 CALCUL PROGRESSION AUTOMATIQUE
      updateProjectProgress: (projectId) => {
        // Cette méthode sera appelée quand une tâche du projet change
        try {
          // Récupérer les tâches du projet depuis TaskStore
          const taskStore = window?.useTaskStore?.getState?.();
          if (taskStore) {
            const projectTasks = taskStore.tasks.filter(task => task.projectId === projectId);
            const completedTasks = projectTasks.filter(task => task.status === 'completed');
            const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
            
            get().updateProject(projectId, {
              tasksCount: projectTasks.length,
              completedTasks: completedTasks.length,
              progress: Math.round(progress)
            });
          }
        } catch (error) {
          console.log('ℹ️ Impossible de calculer progression:', error.message);
        }
      },

      // 📈 STATISTIQUES
      getProjectStats: () => {
        const projects = get().projects;
        return {
          total: projects.length,
          active: projects.filter(p => p.status === 'active').length,
          completed: projects.filter(p => p.status === 'completed').length,
          paused: projects.filter(p => p.status === 'paused').length
        };
      },

      getActiveProjects: () => {
        return get().projects.filter(p => p.status === 'active');
      },

      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId);
      }
    }),
    {
      name: 'project-store-v3',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
);

console.log('✅ ProjectStore initialisé et stable');
