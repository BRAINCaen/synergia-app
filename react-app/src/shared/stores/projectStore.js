// src/shared/stores/projectStore.js - Version Firebase réelle
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ProjectService } from '../../core/services/taskService.js';

// Store avec vrais services Firebase
export const useProjectStore = create(
  subscribeWithSelector((set, get) => ({
    // État des projets
    projects: [],
    currentProject: null,
    
    // États de chargement
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    
    // Filtres
    statusFilter: 'all', // 'all', 'active', 'completed', 'archived'
    
    // Subscriptions
    unsubscribeProjects: null,
    
    // ✅ Charger les projets utilisateur avec Firebase
    loadUserProjects: async (userId) => {
      set({ loading: true });
      try {
        const filters = get().statusFilter !== 'all' ? { status: get().statusFilter } : {};
        const projects = await ProjectService.getUserProjects(userId, filters);
        set({ projects, loading: false });
        return projects;
      } catch (error) {
        console.error('Erreur chargement projets:', error);
        set({ loading: false });
        throw error;
      }
    },

    // ✅ Créer un projet avec Firebase
    createProject: async (projectData, userId) => {
      set({ creating: true });
      try {
        const newProject = await ProjectService.createProject(projectData, userId);
        
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

    // ✅ Mettre à jour un projet avec Firebase
    updateProject: async (projectId, updates, userId) => {
      set({ updating: true });
      try {
        const updatedProject = await ProjectService.updateProject(projectId, updates, userId);
        
        set(state => ({
          projects: state.projects.map(project => 
            project.id === projectId ? updatedProject : project
          ),
          currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
          updating: false
        }));
        
        return updatedProject;
      } catch (error) {
        console.error('Erreur mise à jour projet:', error);
        set({ updating: false });
        throw error;
      }
    },

    // 📊 Mettre à jour la progression d'un projet avec Firebase
    updateProjectProgress: async (projectId) => {
      try {
        const progress = await ProjectService.updateProjectProgress(projectId);
        
        set(state => ({
          projects: state.projects.map(project => 
            project.id === projectId 
              ? { ...project, progress }
              : project
          ),
          currentProject: state.currentProject?.id === projectId 
            ? { ...state.currentProject, progress }
            : state.currentProject
        }));
        
        return progress;
      } catch (error) {
        console.error('Erreur mise à jour progression:', error);
        throw error;
      }
    },

    // ✅ Supprimer un projet avec Firebase
    deleteProject: async (projectId, userId) => {
      set({ deleting: true });
      try {
        await ProjectService.deleteProject(projectId, userId);
        
        set(state => ({
          projects: state.projects.filter(project => project.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
          deleting: false
        }));
        
        return projectId;
      } catch (error) {
        console.error('Erreur suppression projet:', error);
        set({ deleting: false });
        throw error;
      }
    },

    // Récupérer un projet par ID
    getProject: (projectId) => {
      return get().projects.find(p => p.id === projectId);
    },

    // Projets par statut
    getActiveProjects: () => get().projects.filter(p => p.status === 'active'),
    getCompletedProjects: () => get().projects.filter(p => p.status === 'completed'),

    // Définir le filtre de statut
    setStatusFilter: (status) => {
      set({ statusFilter: status });
    },

    // Définir le projet actuel
    setCurrentProject: (project) => {
      set({ currentProject: project });
    },

    // 🔔 Subscription temps réel Firebase
    subscribeToProjects: (userId) => {
      const currentUnsub = get().unsubscribeProjects;
      if (currentUnsub) currentUnsub();
      
      const unsubscribe = ProjectService.subscribeToUserProjects(
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
  }))
);
