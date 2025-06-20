// src/shared/stores/projectStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Store temporaire jusqu'à intégration complète des services
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
    
    // ✅ Charger les projets utilisateur
    loadUserProjects: async (userId) => {
      set({ loading: true });
      try {
        // TODO: Remplacer par ProjectService.getUserProjects(userId, filters) quand services créés
        const mockProjects = [
          {
            id: 'project_1',
            name: 'Synergia Phase 3',
            description: 'Développement du système de tâches et planning',
            color: '#3B82F6',
            icon: '🚀',
            status: 'active',
            ownerId: userId,
            members: [userId],
            isPublic: false,
            progress: {
              total: 10,
              completed: 3,
              percentage: 30
            },
            tags: ['development', 'gamification'],
            createdAt: new Date('2025-06-20'),
            updatedAt: new Date()
          },
          {
            id: 'project_2',
            name: 'Documentation',
            description: 'Créer la documentation utilisateur',
            color: '#10B981',
            icon: '📚',
            status: 'active',
            ownerId: userId,
            members: [userId],
            isPublic: false,
            progress: {
              total: 5,
              completed: 1,
              percentage: 20
            },
            tags: ['documentation'],
            createdAt: new Date('2025-06-19'),
            updatedAt: new Date()
          }
        ];
        
        // Filtrer selon statusFilter si nécessaire
        const { statusFilter } = get();
        const filtered = statusFilter === 'all' 
          ? mockProjects 
          : mockProjects.filter(p => p.status === statusFilter);
        
        set({ projects: filtered, loading: false });
        return filtered;
      } catch (error) {
        console.error('Erreur chargement projets:', error);
        set({ loading: false });
        throw error;
      }
    },

    // ✅ Créer un projet
    createProject: async (projectData, userId) => {
      set({ creating: true });
      try {
        // TODO: Remplacer par ProjectService.createProject(projectData, userId) quand services créés
        const newProject = {
          id: `project_${Date.now()}`,
          ...projectData,
          ownerId: userId,
          status: 'active',
          members: [userId],
          isPublic: projectData.isPublic || false,
          progress: {
            total: 0,
            completed: 0,
            percentage: 0
          },
          tags: projectData.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null
        };
        
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

    // ✅ Mettre à jour un projet
    updateProject: async (projectId, updates, userId) => {
      set({ updating: true });
      try {
        // TODO: Remplacer par ProjectService.updateProject(projectId, updates, userId) quand services créés
        const updatedProject = { ...updates, updatedAt: new Date() };
        
        set(state => ({
          projects: state.projects.map(project => 
            project.id === projectId ? { ...project, ...updatedProject } : project
          ),
          currentProject: state.currentProject?.id === projectId ? { ...state.currentProject, ...updatedProject } : state.currentProject,
          updating: false
        }));
        
        return updatedProject;
      } catch (error) {
        console.error('Erreur mise à jour projet:', error);
        set({ updating: false });
        throw error;
      }
    },

    // 📊 Mettre à jour la progression d'un projet
    updateProjectProgress: async (projectId) => {
      try {
        // TODO: Remplacer par ProjectService.updateProjectProgress(projectId) quand services créés
        // Pour l'instant, simulation avec des données mockées
        const progress = {
          total: 10,
          completed: Math.floor(Math.random() * 10),
          percentage: 0
        };
        progress.percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
        
        set(state => ({
          projects: state.projects.map(project => 
            project.id === projectId 
              ? { ...project, progress, updatedAt: new Date() }
              : project
          ),
          currentProject: state.currentProject?.id === projectId 
            ? { ...state.currentProject, progress, updatedAt: new Date() }
            : state.currentProject
        }));
        
        return progress;
      } catch (error) {
        console.error('Erreur mise à jour progression:', error);
        throw error;
      }
    },

    // ✅ Supprimer un projet
    deleteProject: async (projectId, userId) => {
      set({ deleting: true });
      try {
        // TODO: Remplacer par ProjectService.deleteProject(projectId, userId) quand services créés
        
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

    // 🔔 Subscription temps réel (mock pour l'instant)
    subscribeToProjects: (userId) => {
      // TODO: Implémenter avec ProjectService.subscribeToUserProjects quand services créés
      console.log('Subscription projets activée pour:', userId);
      
      // Mock subscription
      const mockUnsubscribe = () => {
        console.log('Subscription projets fermée');
      };
      
      set({ unsubscribeProjects: mockUnsubscribe });
      return mockUnsubscribe;
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
