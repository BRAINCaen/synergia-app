// ==========================================
// 📁 react-app/src/shared/stores/projectStore.js
// Store Zustand complet pour la gestion des projets
// ==========================================

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { projectService } from '../../core/services/taskService.js';

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
        statusFilter: 'all',
        searchTerm: '',
        sortBy: 'updatedAt',
        sortDirection: 'desc',
        
        // Statistiques
        stats: {
          total: 0,
          active: 0,
          completed: 0,
          overdue: 0,
          totalXpEarned: 0
        },
        
        // Subscriptions temps réel
        unsubscribeProjects: null,

        // ==========================================
        // 📊 ACTIONS DE BASE
        // ==========================================

        /**
         * 📂 CHARGER LES PROJETS UTILISATEUR
         */
        loadUserProjects: async (userId) => {
          set({ loading: true });
          try {
            const filters = get().statusFilter !== 'all' 
              ? { status: get().statusFilter } 
              : {};
            
            const projects = await projectService.getUserProjects(userId, filters);
            set({ projects, loading: false });
            
            // Mettre à jour les statistiques
            get().updateStats();
            
            return projects;
          } catch (error) {
            console.error('Erreur chargement projets:', error);
            set({ loading: false });
            throw error;
          }
        },

        /**
         * ➕ CRÉER UN NOUVEAU PROJET
         */
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
            
            // Mettre à jour les stats
            get().updateStats();
            
            return newProject;
          } catch (error) {
            console.error('Erreur création projet:', error);
            set({ creating: false });
            throw error;
          }
        },

        /**
         * ✏️ METTRE À JOUR UN PROJET
         */
        updateProject: async (projectId, updates) => {
          set({ updating: true });
          try {
            const updatedProject = await projectService.updateProject(projectId, updates);
            
            set(state => ({
              projects: state.projects.map(p => 
                p.id === projectId ? updatedProject : p
              ),
              currentProject: state.currentProject?.id === projectId 
                ? updatedProject 
                : state.currentProject,
              updating: false
            }));
            
            // Mettre à jour les stats
            get().updateStats();
            
            return updatedProject;
          } catch (error) {
            console.error('Erreur mise à jour projet:', error);
            set({ updating: false });
            throw error;
          }
        },

        /**
         * 🗑️ SUPPRIMER UN PROJET
         */
        deleteProject: async (projectId, userId) => {
          set({ deleting: true });
          try {
            await projectService.deleteProject(projectId, userId);
            
            set(state => ({
              projects: state.projects.filter(p => p.id !== projectId),
              currentProject: state.currentProject?.id === projectId 
                ? null 
                : state.currentProject,
              deleting: false
            }));
            
            // Mettre à jour les stats
            get().updateStats();
            
            return { success: true };
          } catch (error) {
            console.error('Erreur suppression projet:', error);
            set({ deleting: false });
            throw error;
          }
        },

        // ==========================================
        // 📊 GESTION DE LA PROGRESSION
        // ==========================================

        /**
         * 📈 METTRE À JOUR LA PROGRESSION D'UN PROJET
         */
        updateProjectProgress: async (projectId) => {
          try {
            const progressData = await projectService.updateProjectProgress(projectId);
            
            set(state => ({
              projects: state.projects.map(p => 
                p.id === projectId 
                  ? { ...p, progress: progressData, updatedAt: new Date() }
                  : p
              )
            }));
            
            return progressData;
          } catch (error) {
            console.error('Erreur mise à jour progression:', error);
            throw error;
          }
        },

        /**
         * 📊 CHARGER LES STATISTIQUES D'UN PROJET
         */
        loadProjectStats: async (projectId) => {
          try {
            const stats = await projectService.getProjectStats(projectId);
            
            // Optionnel: stocker les stats dans le projet
            set(state => ({
              projects: state.projects.map(p => 
                p.id === projectId 
                  ? { ...p, detailedStats: stats }
                  : p
              )
            }));
            
            return stats;
          } catch (error) {
            console.error('Erreur chargement stats projet:', error);
            throw error;
          }
        },

        // ==========================================
        // 👥 GESTION DES MEMBRES
        // ==========================================

        /**
         * 👥 AJOUTER UN MEMBRE AU PROJET
         */
        addProjectMember: async (projectId, userId, memberUserId) => {
          try {
            await projectService.addProjectMember(projectId, userId, memberUserId);
            
            // Recharger le projet pour avoir les membres à jour
            const project = get().projects.find(p => p.id === projectId);
            if (project) {
              set(state => ({
                projects: state.projects.map(p => 
                  p.id === projectId 
                    ? { ...p, members: [...(p.members || []), memberUserId], updatedAt: new Date() }
                    : p
                )
              }));
            }
            
            return { success: true };
          } catch (error) {
            console.error('Erreur ajout membre:', error);
            throw error;
          }
        },

        /**
         * 👥 RETIRER UN MEMBRE DU PROJET
         */
        removeProjectMember: async (projectId, userId, memberUserId) => {
          try {
            await projectService.removeProjectMember(projectId, userId, memberUserId);
            
            set(state => ({
              projects: state.projects.map(p => 
                p.id === projectId 
                  ? { 
                      ...p, 
                      members: (p.members || []).filter(id => id !== memberUserId),
                      updatedAt: new Date() 
                    }
                  : p
              )
            }));
            
            return { success: true };
          } catch (error) {
            console.error('Erreur retrait membre:', error);
            throw error;
          }
        },

        // ==========================================
        // 🔍 RECHERCHE ET FILTRES
        // ==========================================

        /**
         * 🔍 RECHERCHER DES PROJETS
         */
        searchProjects: async (userId, searchTerm, filters = {}) => {
          set({ loading: true });
          try {
            const projects = await projectService.searchProjects(userId, searchTerm, filters);
            set({ projects, loading: false });
            return projects;
          } catch (error) {
            console.error('Erreur recherche projets:', error);
            set({ loading: false });
            throw error;
          }
        },

        /**
         * 🎛️ DÉFINIR LE FILTRE DE STATUT
         */
        setStatusFilter: (status) => {
          set({ statusFilter: status });
        },

        /**
         * 🔍 DÉFINIR LE TERME DE RECHERCHE
         */
        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        /**
         * 📊 DÉFINIR LE TRI
         */
        setSorting: (sortBy, sortDirection = 'desc') => {
          set({ sortBy, sortDirection });
          
          // Appliquer le tri immédiatement
          set(state => ({
            projects: [...state.projects].sort((a, b) => {
              const aVal = a[sortBy];
              const bVal = b[sortBy];
              
              if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
              } else {
                return aVal < bVal ? 1 : -1;
              }
            })
          }));
        },

        // ==========================================
        // 📊 GETTERS ET UTILITAIRES
        // ==========================================

        /**
         * 📊 METTRE À JOUR LES STATISTIQUES GLOBALES
         */
        updateStats: () => {
          const projects = get().projects;
          const now = new Date();
          
          const stats = {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            completed: projects.filter(p => p.status === 'completed').length,
            overdue: projects.filter(p => {
              if (!p.deadline || p.status === 'completed') return false;
              const deadline = new Date(p.deadline);
              return deadline < now;
            }).length,
            totalXpEarned: projects.reduce((total, p) => {
              return total + (p.detailedStats?.totalXpEarned || 0);
            }, 0)
          };
          
          set({ stats });
        },

        /**
         * 🎯 OBTENIR PROJETS PAR STATUT
         */
        getProjectsByStatus: (status) => {
          return get().projects.filter(p => p.status === status);
        },

        /**
         * 🟢 OBTENIR PROJETS ACTIFS
         */
        getActiveProjects: () => get().getProjectsByStatus('active'),

        /**
         * ✅ OBTENIR PROJETS TERMINÉS
         */
        getCompletedProjects: () => get().getProjectsByStatus('completed'),

        /**
         * 📅 OBTENIR PROJETS EN RETARD
         */
        getOverdueProjects: () => {
          const now = new Date();
          return get().projects.filter(p => {
            if (!p.deadline || p.status === 'completed') return false;
            const deadline = new Date(p.deadline);
            return deadline < now;
          });
        },

        /**
         * 📊 OBTENIR PROJETS FILTRÉS ET TRIÉS
         */
        getFilteredProjects: () => {
          let projects = [...get().projects];
          const { statusFilter, searchTerm, sortBy, sortDirection } = get();
          
          // Filtrer par statut
          if (statusFilter !== 'all') {
            projects = projects.filter(p => p.status === statusFilter);
          }
          
          // Filtrer par recherche
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            projects = projects.filter(p => 
              p.name.toLowerCase().includes(term) ||
              p.description?.toLowerCase().includes(term) ||
              p.tags?.some(tag => tag.toLowerCase().includes(term))
            );
          }
          
          // Trier
          projects.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // Gestion spéciale pour les dates
            if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
              aVal = new Date(aVal);
              bVal = new Date(bVal);
            }
            
            if (sortDirection === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
          
          return projects;
        },

        /**
         * 🎯 DÉFINIR LE PROJET ACTUEL
         */
        setCurrentProject: (project) => {
          set({ currentProject: project });
        },

        // ==========================================
        // 🔔 SUBSCRIPTIONS TEMPS RÉEL
        // ==========================================

        /**
         * 🔔 S'ABONNER AUX PROJETS EN TEMPS RÉEL
         */
        subscribeToProjects: (userId) => {
          const currentUnsub = get().unsubscribeProjects;
          if (currentUnsub) currentUnsub();
          
          const unsubscribe = projectService.subscribeToUserProjects(
            userId,
            (projects) => {
              set({ projects });
              get().updateStats();
            }
          );
          
          set({ unsubscribeProjects: unsubscribe });
          return unsubscribe;
        },

        // ==========================================
        // 🧹 NETTOYAGE
        // ==========================================

        /**
         * 🧹 NETTOYER LES SUBSCRIPTIONS
         */
        cleanup: () => {
          const { unsubscribeProjects } = get();
          if (unsubscribeProjects) {
            unsubscribeProjects();
            set({ unsubscribeProjects: null });
          }
        },

        /**
         * 🔄 RÉINITIALISER LE STORE
         */
        reset: () => {
          get().cleanup();
          set({
            projects: [],
            currentProject: null,
            loading: false,
            creating: false,
            updating: false,
            deleting: false,
            statusFilter: 'all',
            searchTerm: '',
            sortBy: 'updatedAt',
            sortDirection: 'desc',
            stats: {
              total: 0,
              active: 0,
              completed: 0,
              overdue: 0,
              totalXpEarned: 0
            }
          });
        }

      }),
      {
        name: 'synergia-projects',
        partialize: (state) => ({
          projects: state.projects,
          statusFilter: state.statusFilter,
          searchTerm: state.searchTerm,
          sortBy: state.sortBy,
          sortDirection: state.sortDirection
        }),
        version: 2 // Incrémenter pour forcer la migration
      }
    )
  )
);

export default useProjectStore;
