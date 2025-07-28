// ==========================================
// 📁 react-app/src/shared/hooks/useProjectService.js
// HOOK CORRIGÉ - ORDRE DES PARAMÈTRES UNIFIÉ
// ==========================================

import { useState, useEffect } from 'react';
import { projectService } from '../../core/services/projectService.js';
import { useAuthStore } from '../stores/authStore.js';

/**
 * 🚀 HOOK PROJETS FIREBASE COMPLET - PARAMÈTRES CORRIGÉS
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

  /**
   * ➕ CRÉER UN PROJET - CORRIGÉ POUR ORDRE UNIFIÉ
   * Signature: createProject(projectData) - userId pris automatiquement du store
   */
  const createProject = async (projectData) => {
    if (!user?.uid) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      console.log('🚀 [HOOK] Création projet:', projectData.title);
      console.log('👤 [HOOK] Utilisateur:', user.uid);
      
      // ✅ ORDRE CORRIGÉ : projectService.createProject(projectData, userId)
      const newProject = await projectService.createProject(projectData, user.uid);
      
      // Ajouter le nouveau projet à la liste
      setProjects(prev => [newProject, ...prev]);
      
      console.log('✅ [HOOK] Projet créé avec succès');
      return { success: true, project: newProject };
      
    } catch (err) {
      console.error('❌ [HOOK] Erreur création projet:', err);
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      console.log('🔄 [HOOK] Mise à jour projet:', projectId);
      
      const updatedProject = await projectService.updateProject(projectId, updates);
      
      // Mettre à jour la liste locale
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, ...updatedProject } : p
      ));
      
      console.log('✅ [HOOK] Projet mis à jour');
      return { success: true, project: updatedProject };
      
    } catch (err) {
      console.error('❌ [HOOK] Erreur mise à jour projet:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      console.log('🗑️ [HOOK] Suppression projet:', projectId);
      
      await projectService.deleteProject(projectId);
      
      // Retirer de la liste locale
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      console.log('✅ [HOOK] Projet supprimé');
      return { success: true };
      
    } catch (err) {
      console.error('❌ [HOOK] Erreur suppression projet:', err);
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

/**
 * 🔧 CLASSE DE COMPATIBILITÉ - ORDRE DES PARAMÈTRES UNIFIÉ
 */
export class ProjectService {
  constructor() {
    console.log('✅ ProjectService Firebase initialisé - Paramètres unifiés');
  }

  async getUserProjects(userId) {
    return projectService.getUserProjects(userId);
  }

  /**
   * ✅ MÉTHODE CORRIGÉE - ORDRE UNIFIÉ
   * createProject(projectData, userId) - compatible avec le service principal
   */
  async createProject(projectData, userId) {
    return projectService.createProject(projectData, userId);
  }

  subscribeToUserProjects(userId, callback) {
    return projectService.subscribeToUserProjects?.(userId, callback);
  }
}

// Export par défaut : hook
export default useProjectService;

// ✅ LOG DE CONFIRMATION
console.log('✅ useProjectService Hook - Paramètres unifiés');
console.log('🔧 createProject(projectData, userId) - Ordre standardisé');
console.log('🚀 Compatible avec ProjectsPage et tous les composants');
