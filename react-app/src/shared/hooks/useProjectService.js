import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useProjectStore } from '../stores/projectStore.js';

export const useProjectService = () => {
  const { user } = useAuthStore();
  const { 
    projects,
    loading,
    creating,
    loadUserProjects,
    createProject,
    getActiveProjects,
    getCompletedProjects,
    setStatusFilter,
    subscribeToProjects,
    cleanup
  } = useProjectStore();

  // 🔄 Synchroniser les projets
  const syncProjects = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await loadUserProjects(user.uid);
    } catch (error) {
      console.error('Erreur sync projets:', error);
    }
  }, [user?.uid, loadUserProjects]);

  // ⭐ Actions avec gestion automatique userId
  const actions = {
    createProject: useCallback(async (projectData) => {
      if (!user?.uid) throw new Error('Utilisateur non connecté');
      return await createProject(projectData, user.uid);
    }, [user?.uid, createProject]),
    
    syncProjects
  };

  // 📊 Selectors optimisés
  const selectors = {
    getActiveProjects,
    getCompletedProjects,
    getProjectsByStatus: useCallback((status) => 
      projects.filter(p => p.status === status), [projects]
    )
  };

  // 🔄 Écoute temps réel et synchronisation initiale
  useEffect(() => {
    if (!user?.uid) return;

    // Synchronisation initiale
    syncProjects();

    // Écoute temps réel
    const unsubscribe = subscribeToProjects(user.uid);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, subscribeToProjects, syncProjects]);

  // 🧹 Nettoyage lors du logout
  useEffect(() => {
    if (!user) {
      cleanup();
    }
  }, [user, cleanup]);

  return {
    // Données
    projects,
    
    // États
    loading,
    creating,
    
    // Actions
    ...actions,
    
    // Sélecteurs
    ...selectors,
    
    // Filtres
    setStatusFilter,
    
    // État de connexion
    isConnected: !!user?.uid
  };
};
