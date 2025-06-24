// src/shared/stores/projectStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { projectService } from '../../core/services/projectService.js';
import { gamificationService } from '../../core/services/gamificationService.js';

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

      // Initialiser l'écoute en temps réel
      initializeProjectSync: (userId) => {
        const { unsubscribe: currentUnsubscribe } = get();
        
        // Nettoyer l'ancien abonnement s'il existe
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        set({ loading: true, error: null });

        try {
          // Écouter les changements de projets en temps réel
          const unsubscribe = projectService.subscribeToUserProjects(
            userId,
            (projects) => {
              set({ 
                projects, 
                loading: false, 
                error: null 
              });
              console.log(`📥 ${projects.length} projets synchronisés`);
            },
            get().filters
          );

          set({ unsubscribe });
          return unsubscribe;
        } catch (error) {
          console.error('❌ Erreur initialisation sync projets:', error);
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

      // Créer un projet
      createProject: async (projectData, userId) => {
        set({ loading: true, error: null });

        try {
          const newProject = await projectService.createProject(projectData, userId);
          
          // Mettre à jour les statistiques de gamification
          const xpResult = await gamificationService.addXP(userId, 25, 'Projet créé');
          
          set({ loading: false });
          
          console.log('✅ Projet créé avec succès');
          return { 
            success: true, 
            project: newProject,
            xpGained: xpResult.xpGained,
            newBadges: xpResult.newBadges
          };
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
          const updatedProject = await projectService.updateProject(projectId, updates, userId);
          
          // Mettre à jour le projet sélectionné s'il s'agit du même
          const { selectedProject } = get();
          if (selectedProject && selectedProject.id === projectId) {
            set({ selectedProject: updatedProject });
          }
          
          set({ loading: false });
          
          console.log('✅ Projet mis à jour avec succès');
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
          await projectService.deleteProject(projectId, userId);
          
          // Nettoyer le projet sélectionné s'il s'agit du même
          const { selectedProject } = get();
          if (selectedProject && selectedProject.id === projectId) {
            set({ selectedProject: null });
          }
          
          set({ loading: false });
          
          console.log('✅ Projet supprimé avec succès');
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur suppression projet:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Récupérer un projet par ID
      getProjectById: async (projectId, userId) => {
        set({ loading: true, error: null });

        try {
          const project = await projectService.getProjectById(projectId, userId);
          set({ selectedProject: project, loading: false });
          return { success: true, project };
        } catch (error) {
          console.error('❌ Erreur récupération projet:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Ajouter un membre au projet
      addMember: async (projectId, memberUserId, currentUserId) => {
        set({ loading: true, error: null });

        try {
          await projectService.addMember(projectId, memberUserId, currentUserId);
          
          // Recharger le projet pour obtenir les dernières données
          await get().getProjectById(projectId, currentUserId);
          
          set({ loading: false });
          
          console.log('✅ Membre ajouté avec succès');
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur ajout membre:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Retirer un membre du projet
      removeMember: async (projectId, memberUserId, currentUserId) => {
        set({ loading: true, error: null });

        try {
          await projectService.removeMember(projectId, memberUserId, currentUserId);
          
          // Recharger le projet pour obtenir les dernières données
          await get().getProjectById(projectId, currentUserId);
          
          set({ loading: false });
          
          console.log('✅ Membre retiré avec succès');
          return { success: true };
        } catch (error) {
          console.error('❌ Erreur retrait membre:', error);
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Rechercher des projets publics
      searchPublicProjects: async (searchTerm, limit = 10) => {
        set({ loading: true, error: null });

        try {
          const projects = await projectService.searchPublicProjects(searchTerm, limit);
          set({ loading: false });
          
          return { success: true, projects };
        } catch (error) {
          console.error('❌ Erreur recherche projets publics:', error);
          set({ loading: false, error: error.message });
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
          get().initializeProjectSync(userId);
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

      // Statistiques des projets
      getProjectStats: () => {
        const projects = get().projects;
        
        return {
          total: projects.length,
          active: projects.filter(project => project.status === 'active').length,
          completed: projects.filter(project => project.status === 'completed').length,
          paused: projects.filter(project => project.status === 'paused').length,
          archived: projects.filter(project => project.status === 'archived').length,
          avgProgress: projects.length > 0 
            ? Math.round(projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length)
            : 0
        };
      },

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
      },

      // Obtenir les projets récents
      getRecentProjects: (limit = 5) => {
        const projects = get().projects;
        
        return projects
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);
      },

      // Obtenir les projets par statut
      getProjectsByStatus: () => {
        const projects = get().projects;
        
        return {
          active: projects.filter(project => project.status === 'active'),
          completed: projects.filter(project => project.status === 'completed'),
          paused: projects.filter(project => project.status === 'paused'),
          archived: projects.filter(project => project.status === 'archived')
        };
      },

      // Obtenir les projets avec le plus de tâches
      getTopProjectsByTasks: (limit = 5) => {
        const projects = get().projects;
        
        return projects
          .sort((a, b) => (b.taskCount || 0) - (a.taskCount || 0))
          .slice(0, limit);
      },

      // Obtenir les projets avec le meilleur taux de progression
      getTopProjectsByProgress: (limit = 5) => {
        const projects = get().projects;
        
        return projects
          .filter(project => project.taskCount > 0) // Seulement les projets avec des tâches
          .sort((a, b) => (b.progress || 0) - (a.progress || 0))
          .slice(0, limit);
      },

      // Calculer le pourcentage global de complétion des projets
      getOverallCompletionRate: () => {
        const projects = get().projects;
        const activeProjects = projects.filter(project => project.status === 'active');
        
        if (activeProjects.length === 0) return 0;
        
        const totalProgress = activeProjects.reduce((sum, project) => sum + (project.progress || 0), 0);
        return Math.round(totalProgress / activeProjects.length);
      },

      // Obtenir le nombre total de tâches dans tous les projets
      getTotalTasksAcrossProjects: () => {
        const projects = get().projects;
        return projects.reduce((sum, project) => sum + (project.taskCount || 0), 0);
      },

      // Obtenir le nombre total de tâches complétées dans tous les projets
      getTotalCompletedTasksAcrossProjects: () => {
        const projects = get().projects;
        return projects.reduce((sum, project) => sum + (project.completedTaskCount || 0), 0);
      },

      // Obtenir l'XP total gagné dans tous les projets
      getTotalXpAcrossProjects: () => {
        const projects = get().projects;
        return projects.reduce((sum, project) => sum + (project.totalXpEarned || 0), 0);
      },

      // Marquer un projet comme complété
      completeProject: async (projectId, userId) => {
        try {
          const result = await get().updateProject(projectId, { 
            status: 'completed',
            completedAt: new Date()
          }, userId);
          
          if (result.success) {
            // Bonus XP pour complétion de projet
            const xpResult = await gamificationService.addXP(
              userId, 
              100, 
              `Projet complété: ${result.project.name}`
            );
            
            return {
              ...result,
              xpGained: xpResult.xpGained,
              levelUp: xpResult.levelUp,
              newBadges: xpResult.newBadges
            };
          }
          
          return result;
        } catch (error) {
          console.error('❌ Erreur complétion projet:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'project-store'
    }
  )
);

export default useProjectStore;
