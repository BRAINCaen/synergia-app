import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

export const createSampleData = async (userId) => {
  try {
    console.log('🔄 Création données d\'exemple pour:', userId);

    // Créer quelques tâches d'exemple
    const sampleTasks = [
      {
        title: 'Finaliser le rapport mensuel',
        description: 'Compiler les données et rédiger le rapport de performance',
        status: 'in-progress',
        priority: 'high',
        complexity: 'medium',
        xpReward: 50,
        assignedTo: userId,
        createdBy: userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        tags: ['reporting', 'urgent'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: 'Révision du code frontend',
        description: 'Revoir et optimiser les composants React',
        status: 'todo',
        priority: 'medium',
        complexity: 'high',
        xpReward: 80,
        assignedTo: userId,
        createdBy: userId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        tags: ['development', 'frontend'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Ajouter les tâches
    for (const task of sampleTasks) {
      await addDoc(collection(db, 'tasks'), task);
    }

    // Créer un projet d'exemple
    const sampleProject = {
      name: 'Amélioration Interface Utilisateur',
      description: 'Refonte complète de l\'interface pour améliorer l\'expérience utilisateur',
      status: 'active',
      icon: '🎨',
      color: 'blue',
      members: [userId],
      createdBy: userId,
      progress: {
        completed: 3,
        total: 10,
        percentage: 30
      },
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'projects'), sampleProject);

    console.log('✅ Données d\'exemple créées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur création données d\'exemple:', error);
    return false;
  }
};
