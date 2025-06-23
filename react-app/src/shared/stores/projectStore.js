// ==========================================
// 📁 react-app/src/shared/stores/projectStore.js
// Store Projets CORRIGÉ - Sans dépendance projectService
// ==========================================

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
// import { projectService } from '../../core/services/projectService.js' // TODO: Créer projectService quand prêt

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
        
        // Filtres et recherche
        filters: {
          status: 'all',
          priority: 'all',
          orderBy: 'createdAt',
          orderDirection: 'desc'
        },
        searchTerm: '',
        
        // Statistiques
        stats: {
          total: 0,
          active: 0,
          completed: 0,
          archived: 0,
          totalTasks: 0,
          completionRate: 0
        },
        
        // Subscriptions temps réel
        unsubscribeProjects: null,
        
        // ✅ Actions temporaires (sans backend pour le moment)
        loadUserProjects: async (userId) => {
          set({ loading: true });
          try {
            // TODO: Remplacer par projectService.getUserProjects(userId) quand prêt
            console.log('🔄 Chargement projets pour:', userId);
            
            // Données mock temporaires
            const mockProjects = [
              {
                id: 'project1',
                title: 'Projet Demo',
                description: 'Projet de démonstration',
                status: 'active',
                priority: 'high',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: userId,
                members: [userId],
                taskCount: 0,
                completedTasks: 0
              }
            ];
            
            set({ 
              projects: mockProjects, 
              loading: false 
            });
            
            // Mettre à jour les stats
            get().updateStats();
            
            return mockProjects;
          } catch (error) {
            console.error('Erreur chargement projets:', error);
            set({ loading: false });
            throw error;
          }
        },

        // ✅ Créer un projet (mock)
        createProject: async (projectData, userId) => {
          if (!userId) {
            throw new Error('UserId requis pour créer un projet');
          }
          
          set({ creating: true });
          try {
            // TODO: Remplacer par projectService.createProject(projectData, userId)
            console.log('🚀 Création projet:', projectData);
            
            const newProject = {
              id: 'project_' + Date.now(),
              title: projectData.title || 'Nouveau Projet',
              description: projectData.description || '',
              status: projectData.status || 'active',
              priority: projectData.priority || 'normal',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: userId,
              members: [userId],
              taskCount: 0,
              completedTasks: 0,
              ...projectData
            };
            
            // Ajouter à la liste locale
            set(state => ({
              projects: [newProject, ...state.projects],
              creating: false
            }));
            
            // Recharger les stats
            get().updateStats();
            
            console.log('✅ Projet créé (mock):', newProject.id);
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
            // TODO: Remplacer par projectService.updateProject(projectId, updates, userId)
            console.log('✏️ Mise à jour projet:', projectId, updates);
            
            const updatedProject = {
              ...updates,
              updatedAt: new Date(),
              lastUpdatedBy: userId
            };
            
            set(state => ({
              projects: state.projects.map(project => 
                project.id === projectId 
                  ? { ...project, ...updatedProject }
                  : project
              ),
              currentProject: state.currentProject?.id === projectId 
                ? { ...state.currentProject, ...updatedProject }
                : state.currentProject,
              updating: false
            }));
            
            console.log('✅ Projet mis à jour (mock):', projectId);
            return { id: projectId, ...updatedProject };
          } catch (error) {
            console.error('Erreur mise à jour projet:', error);
            set({ updating: false });
            throw error;
          }
        },

        // ✅ Supprimer un projet
        deleteProject: async (projectId, userId) => {
          set({ deleting: true });
          try {
            // TODO: Remplacer par projectService.deleteProject(projectId, userId)
            console.log('🗑️ Suppression projet:', projectId);
            
            set(state => ({
              projects: state.projects.filter(project => project.id !== projectId),
              currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
              deleting: false
            }));
            
            console.log('✅ Projet supprimé (mock):', projectId);
            return { success: true };
          } catch (error) {
            console.error('Erreur suppression projet:', error);
            set({ deleting: false });
            throw error;
          }
        },

        // 📊 Mettre à jour les statistiques
        updateStats: () => {
          const projects = get().projects;
          
          const stats = {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            completed: projects.filter(p => p.status === 'completed').length,
            archived: projects.filter(p => p.status === 'archived').length,
            totalTasks: projects.reduce((sum, p) => sum + (p.taskCount || 0), 0),
            completionRate: projects.length > 0 
              ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
              : 0
          };
          
          set({ stats });
          console.log('📊 Stats projets mises à jour:', stats);
        },

        // 🎯 Sélectionner un projet courant
        setCurrentProject: (project) => {
          set({ currentProject: project });
        },

        // 🔍 Filtres et recherche
        setFilters: (newFilters) => {
          set(state => ({
            filters: { ...state.filters, ...newFilters }
          }));
        },

        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        // 📋 Getters calculés
        getFilteredProjects: () => {
          const { projects, filters, searchTerm } = get();
          
          let filtered = [...projects];
          
          // Filtrer par statut
          if (filters.status !== 'all') {
            filtered = filtered.filter(project => project.status === filters.status);
          }
          
          // Filtrer par priorité
          if (filters.priority !== 'all') {
            filtered = filtered.filter(project => project.priority === filters.priority);
          }
          
          // Recherche textuelle
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(project => 
              project.title.toLowerCase().includes(term) ||
              project.description.toLowerCase().includes(term)
            );
          }
          
          // Tri
          filtered.sort((a, b) => {
            const field = filters.orderBy;
            const direction = filters.orderDirection === 'asc' ? 1 : -1;
            
            if (field === 'createdAt' || field === 'updatedAt') {
              return (new Date(a[field]) - new Date(b[field])) * direction;
            }
            
            return (a[field] || '').localeCompare(b[field] || '') * direction;
          });
          
          return filtered;
        },

        // 🧹 Reset du store
        reset: () => {
          set({
            projects: [],
            currentProject: null,
            loading: false,
            creating: false,
            updating: false,
            deleting: false,
            searchTerm: '',
            stats: {
              total: 0,
              active: 0,
              completed: 0,
              archived: 0,
              totalTasks: 0,
              completionRate: 0
            }
          });
        }
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject,
          filters: state.filters
        })
      }
    )
  )
);

export default useProjectStore;
