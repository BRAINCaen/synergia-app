// ==========================================
// 📁 AJOUTS À FAIRE dans react-app/src/core/services/taskService.js
// AJOUTER CETTE MÉTHODE à ta classe TaskService existante
// ==========================================

/**
 * 📋 RÉCUPÉRER TOUTES LES TÂCHES
 * À AJOUTER dans ta classe TaskService existante
 */
async getAllTasks() {
  try {
    console.log('📋 [GET_ALL] Récupération de toutes les tâches');

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = [];
    
    tasksSnapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('✅ [GET_ALL] Tâches récupérées:', tasks.length);
    return tasks;

  } catch (error) {
    console.error('❌ [GET_ALL] Erreur récupération tâches:', error);
    throw error;
  }
}
