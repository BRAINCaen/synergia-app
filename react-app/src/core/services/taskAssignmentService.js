// ==========================================
// 📁 AJOUTS À FAIRE dans react-app/src/core/services/taskAssignmentService.js
// AJOUTER CES MÉTHODES à ta classe TaskAssignmentService existante
// ==========================================

/**
 * 🙋‍♂️ SE PORTER VOLONTAIRE POUR UNE TÂCHE
 * À AJOUTER dans ta classe TaskAssignmentService existante
 */
async volunteerForTask(taskId, userId) {
  try {
    console.log('🙋‍♂️ [VOLUNTEER] Candidature volontaire:', { taskId, userId });

    // Vérifier si la tâche existe et est disponible
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      throw new Error('Tâche introuvable');
    }

    const taskData = taskDoc.data();
    
    // Vérifier si déjà assigné
    if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
      throw new Error('Vous êtes déjà assigné à cette tâche');
    }

    // Récupérer les données utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Assigner directement la tâche (pas d'approbation pour simplifier)
    const batch = writeBatch(db);

    const currentAssigned = taskData.assignedTo || [];
    batch.update(taskRef, {
      assignedTo: [...currentAssigned, userId],
      status: 'assigned',
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Créer l'enregistrement d'assignation
    const assignmentRef = doc(collection(db, 'taskAssignments'));
    batch.set(assignmentRef, {
      taskId,
      taskTitle: taskData.title || 'Tâche sans titre',
      memberId: userId,
      memberName: userData.displayName || userData.name || 'Utilisateur anonyme',
      memberEmail: userData.email || '',
      contribution: 100, // 100% si seul volontaire
      assignedAt: serverTimestamp(),
      assignedBy: 'volunteer_system',
      status: 'assigned',
      isVolunteer: true
    });

    await batch.commit();

    return {
      success: true,
      pending: false,
      message: 'Vous avez été assigné à cette tâche avec succès'
    };

  } catch (error) {
    console.error('❌ [VOLUNTEER] Erreur candidature tâche:', error);
    throw error;
  }
}

/**
 * 📋 RÉCUPÉRER LES TÂCHES ASSIGNÉES À UN UTILISATEUR
 * À AJOUTER dans ta classe TaskAssignmentService existante
 */
async getUserAssignedTasks(userId) {
  try {
    console.log('📋 [ASSIGNMENTS] Récupération tâches assignées:', userId);

    // Méthode 1: Via les assignations
    const assignmentsQuery = query(
      collection(db, 'taskAssignments'),
      where('memberId', '==', userId),
      where('status', '==', 'assigned')
    );
    
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const taskIds = [];
    const assignmentsByTask = {};
    
    assignmentsSnapshot.forEach(doc => {
      const assignment = doc.data();
      taskIds.push(assignment.taskId);
      assignmentsByTask[assignment.taskId] = assignment;
    });

    // Récupérer les détails des tâches
    const tasks = [];
    
    if (taskIds.length > 0) {
      // Firebase limite in() à 10 éléments, diviser si nécessaire
      const chunks = this.chunkArray(taskIds, 10);
      
      for (const chunk of chunks) {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('__name__', 'in', chunk)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        tasksSnapshot.forEach(doc => {
          const taskData = { id: doc.id, ...doc.data() };
          const assignment = assignmentsByTask[doc.id];
          
          tasks.push({
            ...taskData,
            assignmentDetails: assignment,
            myContribution: assignment.contribution,
            isVolunteer: assignment.isVolunteer || false
          });
        });
      }
    }

    // Méthode 2: Tâches directement assignées (backup)
    const directTasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', userId)
    );
    
    const directTasksSnapshot = await getDocs(directTasksQuery);
    directTasksSnapshot.forEach(doc => {
      const taskData = { id: doc.id, ...doc.data() };
      // Éviter les doublons
      if (!tasks.find(t => t.id === doc.id)) {
        tasks.push({
          ...taskData,
          myContribution: 100, // Par défaut si pas d'assignation détaillée
          isVolunteer: false
        });
      }
    });

    console.log('✅ [ASSIGNMENTS] Tâches assignées trouvées:', tasks.length);
    return tasks;

  } catch (error) {
    console.error('❌ [ASSIGNMENTS] Erreur récupération tâches assignées:', error);
    throw error;
  }
}

/**
 * 🔧 UTILITAIRE: Diviser un tableau en chunks
 * À AJOUTER dans ta classe TaskAssignmentService existante
 */
chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
