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
        } catch (error
