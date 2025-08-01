// ==========================================
// 📁 react-app/src/shared/hooks/useProjectActions.js
// Hook pour actions projets avec toasts
// ==========================================

import { useToast } from '../components/ToastNotification.jsx';
import { useProjectStore } from '../stores/projectStore.js';
import { useAuthStore } from '../stores/authStore.js';

export const useProjectActions = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { 
    createProject, 
    updateProject, 
    deleteProject,
    subscribeToProjects 
  } = useProjectStore();

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData, user.uid);
      
      toast.success('Projet créé avec succès!', {
        title: '🎉 Nouveau projet',
        message: `"${newProject.name}" a été créé et ajouté à votre espace de travail.`
      });
      
      return newProject;
    } catch (error) {
      console.error('Erreur création projet:', error);
      toast.error('Impossible de créer le projet', {
        title: '❌ Erreur',
        message: error.message || 'Une erreur est survenue lors de la création.'
      });
      throw error;
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const updatedProject = await updateProject(projectId, updates);
      
      toast.success('Projet modifié avec succès!', {
        title: '✏️ Modification',
        message: `Les modifications ont été sauvegardées.`
      });
      
      return updatedProject;
    } catch (error) {
      console.error('Erreur modification projet:', error);
      toast.error('Impossible de modifier le projet', {
        title: '❌ Erreur',
        message: error.message || 'Une erreur est survenue lors de la modification.'
      });
      throw error;
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    try {
      await deleteProject(projectId, user.uid);
      
      toast.warning('Projet supprimé', {
        title: '🗑️ Suppression',
        message: `"${projectName}" a été supprimé définitivement.`
      });
    } catch (error) {
      console.error('Erreur suppression projet:', error);
      toast.error('Impossible de supprimer le projet', {
        title: '❌ Erreur',
        message: error.message || 'Une erreur est survenue lors de la suppression.'
      });
      throw error;
    }
  };

  const handleProjectCompletion = async (projectId, projectName) => {
    try {
      await updateProject(projectId, { 
        status: 'completed',
        completedAt: new Date()
      });
      
      toast.success('Projet terminé avec succès!', {
        title: '🎉 Félicitations!',
        message: `"${projectName}" a été marqué comme terminé.`
      });
      
      // Toast XP si applicable
      toast.xp('Bonus de completion de projet!', {
        title: '🎯 XP Bonus',
        xpGain: 50,
        message: 'Bravo pour avoir terminé ce projet!'
      });
      
    } catch (error) {
      console.error('Erreur completion projet:', error);
      toast.error('Impossible de marquer le projet comme terminé', {
        title: '❌ Erreur',
        message: error.message
      });
      throw error;
    }
  };

  return {
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleProjectCompletion
  };
};
