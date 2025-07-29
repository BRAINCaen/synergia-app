// ==========================================
// 📁 react-app/src/shared/hooks/useProjectService.js
// VERSION ORIGINALE RESTAURÉE - AUCUNE MODIFICATION
// ==========================================

import { useState, useEffect } from 'react';
import { projectService } from '../../core/services/projectService.js';
import { useAuthStore } from '../stores/authStore.js';

/**
 * 🚀 HOOK PROJETS FIREBASE COMPLET
 * Remplace le mock service par du Firebase pur
 */
export const useProjectService = () => {
  const { user } = useAuthStore();
  
  // États
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les projets utilisateur
  useEffect(() => {
    if (!user?.uid) {
      setProjects([]);
      setLoading(false);
      return;
    }

    loadUserProjects();
  }, [user?.uid]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement projets Firebase pour:', user.uid);
      
      const userProjects = await projectService.getUserProjects(user.uid);
      
      console.log('✅ Projets chargés:', userProjects.length);
      setProjects(userProjects || []);
      
    } catch (err) {
      console.error('❌ Erreur chargement projets:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    if (!user?.uid) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🚀 Création projet:', projectData.title);
      
      const newProject = await projectService.createProject(projectData, user.uid);
      
      // Ajouter le nouveau projet à la liste
      setProjects(prev => [newProject, ...prev]);
      
      console.log('✅ Projet créé avec succès');
      return { success: true, project: newProject };
      
    } catch (err) {
      console.error('❌ Erreur création projet:', err);
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      console.log('🔄 Mise à jour projet:', projectId);
      
      const updatedProject = await projectService.updateProject(projectId, updates);
      
      // Mettre à jour la liste locale
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...updatedProject } : p
      ));
      
      console.log('✅ Projet mis à jour');
      return { success: true, project: updatedProject };
      
    } catch (err) {
      console.error('❌ Erreur mise à jour projet:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      console.log('🗑️ Suppression projet:', projectId);
      
      await projectService.deleteProject(projectId);
      
      // Retirer de la liste locale
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      console.log('✅ Projet supprimé');
      return { success: true };
      
    } catch (err) {
      console.error('❌ Erreur suppression projet:', err);
      return { success: false, error: err.message };
    }
  };

  const refreshProjects = () => {
    if (user?.uid) {
      loadUserProjects();
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects
  };
};

// Export de classe pour compatibilité
export class ProjectService {
  constructor() {
    console.log('✅ ProjectService Firebase initialisé');
  }

  async getUserProjects(userId) {
    return projectService.getUserProjects(userId);
  }

  async createProject(projectData, userId) {
    return projectService.createProject(projectData, userId);
  }

  subscribeToUserProjects(userId, callback) {
    return projectService.subscribeToUserProjects(userId, callback);
  }
}

// Export par défaut : service Firebase pur
export default useProjectService;
