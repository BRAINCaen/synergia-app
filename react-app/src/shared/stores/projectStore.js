// src/shared/stores/projectStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Import direct du service projet
import { projectService } from '../../core/services/projectService.js';

export const useProjectStore = create(
  devtools(
    (set, get) => ({
      // État
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,
      filters: {
        status: 'all'
      },
      unsubscribe: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setSelectedProject: (project) => set({ selectedProject: project }),

      // Charger les projets utilisateur
      loadUserProjects: async (userId) => {
        set({ loading: true, error: null });

        try {
          if (projectService) {
            const projects = await projectService.getUserProjects(userId);
            set({ projects, loading: false });
          } else {
            // Mode démo
            const mockProjects = get().getMockProjects(userId);
            set({ projects: mockProjects, loading: false });
          }
        } catch (error) {
          console.error('❌ Erreur chargement projets:', error);
          set({ error: error.message, loading: false });
          
          // Fallback avec données de démo
          const mockProjects = get().getMockProjects(userId);
          set({ projects: mockProjects });
        }
      },

      // Créer un projet
      createProject: async (projectData, userId) => {
        set({ loading: true, error: null });

        try {
          let newProject;
          
          if (projectService) {
            newProject = await projectService.createProject(projectData, userId);
          } else {
            // Mode démo
            newProject = {
              id: `demo-${Date.now()}`,
              ...projectData,
              ownerId: userId,
              members: [userId],
              progress: 0,
              taskCount: 0,
              completedTaskCount: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
          
          set(state => ({
            projects: [newProject, ...state.projects],
            loading: false
          }));
          
          return { success: true, project: newProject };
        } catch (error) {
          console.error('❌ Erreur création projet:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Mettre à jour un projet
      updateProject: async (projectId, updates, userId) => {
        set({ loading: true, error: null });

        try {
          let updatedProject;
          
          if (projectService) {
            updatedProject = await projectService.updateProject(projectId, updates, userId);
          } else {
            // Mode démo
            const projects = get().projects;
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex === -1) throw new Error('Projet non trouvé');
            
            updatedProject = {
              ...projects[projectIndex],
              ...updates,
              updatedAt: new Date()
            };
          }
          
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId ? updatedProject : p
            ),
            selectedProject: state.selectedProject?.id === projectId 
              ? updatedProject 
              : state.selectedProject,
            loading: false
          }));
          
          return { success: true, project: updatedProject };
        } catch (error) {
          console.error('❌ Erreur mise à jour projet:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Supprimer un projet
      deleteProject: async (projectId, userId) => {
        set({ loading: true, error: null });

        try {
          if (projectService) {
            await projectService.deleteProject(projectId, userId);
          }
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== projectId),
            selectedProject: state.selectedProject?.id === projectId 
              ? null 
              : state.selectedProject,
            loading: false
          }));
          
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur suppression projet:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Écouter les changements en temps réel
      subscribeToProjects: (userId) => {
        const { unsubscribe: currentUnsubscribe } = get();
        
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        if (projectService && projectService.subscribeToUserProjects) {
          const unsubscribe = projectService.subscribeToUserProjects(
            userId,
            (projects) => {
              set({ projects });
            }
          );
          
          set({ unsubscribe });
          return unsubscribe;
        } else {
          // Mode démo - pas de sync temps réel
          console.warn('⚠️ Mode démo - Pas de synchronisation temps réel');
          return () => {};
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

      // Obtenir les projets filtrés
      getFilteredProjects: () => {
        const { projects, filters } = get();
        
        return projects.filter(project => {
          if (filters.status !== 'all' && project.status !== filters.status) {
            return false;
          }
          return true;
        });
      },

      // Mettre à jour les filtres
      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      // Statistiques des projets
      getProjectStats: () => {
        const projects = get().projects;
        
        return {
          total: projects.length,
          active: projects.filter(project => project.status === 'active').length,
          completed: projects.filter(project => project.status === 'completed').length,
          paused: projects.filter(project => project.status === 'paused').length,
          avgProgress: projects.length > 0 
            ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
            : 0
        };
      },

      // Données de démonstration
      getMockProjects: (userId) => [
        {
          id: 'demo-1',
          name: '🚀 Projet Synergia v3',
          description: 'Développement de l\'application de productivité avec gamification complète',
          status: 'active',
          progress: 75,
          taskCount: 12,
          completedTaskCount: 9,
          ownerId: userId,
          members: [userId],
          tags: ['développement', 'productivité', 'firebase'],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Dans 14 jours
        },
        {
          id: 'demo-2',
          name: '📊 Dashboard Analytics',
          description: 'Création d\'un tableau de bord avec métriques avancées et visualisations',
          status: 'active',
          progress: 45,
          taskCount: 8,
          completedTaskCount: 4,
          ownerId: userId,
          members: [userId],
          tags: ['analytics', 'dashboard', 'charts'],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
        },
        {
          id: 'demo-3',
          name: '✅ Migration Firebase',
          description: 'Migration complète vers Firebase pour la persistence et synchronisation temps réel',
          status: 'completed',
          progress: 100,
          taskCount: 15,
          completedTaskCount: 15,
          ownerId: userId,
          members: [userId],
          tags: ['firebase', 'migration', 'database'],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Il y a 14 jours
          updatedAt: new Date(),
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Il y a 1 jour
        },
        {
          id: 'demo-4',
          name: '🎮 Système Gamification',
          description: 'Implémentation complète du système XP, badges et leaderboard',
          status: 'active',
          progress: 90,
          taskCount: 10,
          completedTaskCount: 9,
          ownerId: userId,
          members: [userId],
          tags: ['gamification', 'xp', 'badges'],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
          updatedAt: new Date(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Dans 3 jours
        }
      ],

      // Rechercher des projets
      searchProjects: (searchTerm) => {
        const projects = get().projects;
        
        if (!searchTerm.trim()) {
          return projects;
        }
        
        const term = searchTerm.toLowerCase();
        return projects.filter(project => 
          project.name?.toLowerCase().includes(term) ||
          project.description?.toLowerCase().includes(term) ||
          project.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      }
    }),
    {
      name: 'project-store'
    }
  )
);

export default useProjectStore;
