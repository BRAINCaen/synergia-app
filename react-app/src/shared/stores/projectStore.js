import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { projectService } from '../../core/services/projectService.js'
export const useProjectStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // État des projets
        projects: [],
        currentProject: null,
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
        statusFilter: 'all',
        unsubscribeProjects: null,
        
        // ✅ Charger les projets utilisateur
        loadUserProjects: async (userId) => {
          set({ loading: true });
          try {
            const filters = get().statusFilter !== 'all' ? { status: get().statusFilter } : {};
            const projects = await projectService.getUserProjects(userId, filters);
            set({ projects, loading: false });
            return projects;
          } catch (error) {
            console.error('Erreur chargement projets:', error);
            set({ loading: false });
            throw error;
          }
        },

        // ✅ Créer un projet
        createProject: async (projectData, userId) => {
          if (!userId) {
            throw new Error('UserId requis pour créer un projet');
          }
          
          set({ creating: true });
          try {
            const newProject = await projectService.createProject(projectData, userId);
            
            set(state => ({
              projects: [newProject, ...state.projects],
              creating: false
            }));
            
            return newProject;
          } catch (error) {
            console.error('Erreur création projet:', error);
            set({ creating: false });
            throw error;
          }
        },

        // Projets par statut
        getActiveProjects: () => get().projects.filter(p => p.status === 'active'),
        getCompletedProjects: () => get().projects.filter(p => p.status === 'completed'),

        // Définir le filtre de statut
        setStatusFilter: (status) => {
          set({ statusFilter: status });
        },

        // 🔔 Subscription temps réel
        subscribeToProjects: (userId) => {
          const currentUnsub = get().unsubscribeProjects;
          if (currentUnsub) currentUnsub();
          
          const unsubscribe = projectService.subscribeToUserProjects(
            userId,
            (projects) => {
              set({ projects });
            }
          );
          
          set({ unsubscribeProjects: unsubscribe });
          return unsubscribe;
        },

        // Nettoyer
        cleanup: () => {
          const { unsubscribeProjects } = get();
          if (unsubscribeProjects) {
            unsubscribeProjects();
            set({ unsubscribeProjects: null });
          }
        },

        // Réinitialiser
        reset: () => {
          get().cleanup();
          set({
            projects: [],
            currentProject: null,
            loading: false,
            creating: false,
            updating: false,
            deleting: false,
            statusFilter: 'all'
          });
        }
      }),
      {
        name: 'synergia-projects',
        partialize: (state) => ({
          projects: state.projects,
          statusFilter: state.statusFilter
        }),
        version: 1
      }
    )
  )
);
