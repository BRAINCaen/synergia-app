import { addDoc, collection, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export class TaskServiceWithToast {
  constructor(toastService) {
    this.toast = toastService;
  }

  // Créer une tâche avec notification
  async createTask(taskData, userId) {
    try {
      this.toast.info('Création en cours...', 'Sauvegarde de votre tâche');
      
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdBy: userId,
        assignedTo: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      this.toast.success('Tâche créée !', `"${taskData.title}" a été ajoutée à votre liste`);
      
      // Petit bonus XP pour la création
      this.toast.xp(5, 'Tâche créée');
      
      return docRef;
      
    } catch (error) {
      console.error('Erreur création tâche:', error);
      this.toast.error('Erreur de création', 'Impossible de créer la tâche');
      throw error;
    }
  }

  // Compléter une tâche avec XP et notification
  async completeTask(taskId, taskData) {
    try {
      const xpReward = this.calculateXP(taskData);
      
      // Mettre à jour la tâche
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Notifications de succès
      this.toast.success('Tâche terminée !', `"${taskData.title}" complétée avec succès`);
      this.toast.xp(xpReward, `Tâche: ${taskData.title}`);
      
      return { success: true, xpGained: xpReward };
      
    } catch (error) {
      console.error('Erreur completion tâche:', error);
      this.toast.error('Erreur', 'Impossible de marquer la tâche comme terminée');
      throw error;
    }
  }

  // Supprimer une tâche avec confirmation
  async deleteTask(taskId, taskTitle) {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      this.toast.warning('Tâche supprimée', `"${taskTitle}" a été supprimée`);
      return { success: true };
      
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      this.toast.error('Erreur de suppression', 'Impossible de supprimer la tâche');
      throw error;
    }
  }

  // Calculer XP selon la complexité/priorité
  calculateXP(taskData) {
    const baseXP = {
      'low': 20,
      'medium': 50,
      'high': 80,
      'critical': 120
    };
    
    const complexity = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2
    };
    
    const priorityXP = baseXP[taskData.priority] || 30;
    const multiplier = complexity[taskData.complexity] || 1;
    
    return Math.round(priorityXP * multiplier);
  }
}
