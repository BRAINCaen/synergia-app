import { useToast } from '../shared/components/ui/Toast.jsx';
import { TaskServiceWithToast } from '../core/services/taskServiceWithToast.js';
import { useUpdateUser } from './useRealTimeUser.js';

export const useTasksWithToast = () => {
  const toast = useToast();
  const { addXP } = useUpdateUser();
  const taskService = new TaskServiceWithToast(toast);

  const createTask = async (taskData, userId) => {
    const result = await taskService.createTask(taskData, userId);
    
    // Ajouter XP dans le profil utilisateur
    try {
      await addXP(5, 'Création de tâche');
    } catch (error) {
      console.error('Erreur ajout XP:', error);
    }
    
    return result;
  };

  const completeTask = async (taskId, taskData) => {
    const result = await taskService.completeTask(taskId, taskData);
    
    if (result.success) {
      // Ajouter XP dans le profil utilisateur
      try {
        await addXP(result.xpGained, `Tâche: ${taskData.title}`);
      } catch (error) {
        console.error('Erreur ajout XP:', error);
      }
    }
    
    return result;
  };

  const deleteTask = (taskId, taskTitle) => {
    return taskService.deleteTask(taskId, taskTitle);
  };

  return {
    createTask,
    completeTask,
    deleteTask,
    toast // Accès direct aux toasts
  };
};
