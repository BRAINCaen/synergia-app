// ==========================================
// 📁 react-app/src/core/services/taskAssignmentService.js
// SERVICE D'ASSIGNATION MULTIPLE DE TÂCHES AVEC DISTRIBUTION XP
// ==========================================

import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { gamificationService } from './gamificationService.js';

/**
 * 👥 SERVICE D'ASSIGNATION MULTIPLE DE TÂCHES
 */
class TaskAssignmentService {
  
  /**
   * 👤 RÉCUPÉRER TOUS LES MEMBRES DISPONIBLES POUR ASSIGNATION
   */
  async getAvailableMembers() {
    try {
      console.log('👥 Récupération des membres disponibles...');
      
      // Récupérer TOUS les utilisateurs (sans filtre isActive qui peut ne pas exister)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const members = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Inclure l'utilisateur s'il a au moins un email
        if (userData.email) {
          const member = {
            id: doc.id,
            uid: doc.id,
            name: userData.profile?.displayName || 
                  userData.displayName || 
                  userData.email?.split('@')[0] || 
                  'Utilisateur',
            email: userData.email,
            avatar: userData.photoURL || userData.profile?.avatar,
            role: userData.profile?.role || 'member',
            level: userData.gamification?.level || 1,
            totalXp: userData.gamification?.totalXp || 0,
            isActive: userData.isActive !== false, // Par défaut true si pas défini
            lastActivity: userData.gamification?.lastActivityDate,
            tasksCompleted: userData.gamification?.tasksCompleted || 0
          };
          
          members.push(member);
        }
      });
      
      // Trier par niveau décroissant puis par XP
      members.sort((a, b) => {
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        return b.totalXp - a.totalXp;
      });
      
      console.log('✅ Membres récupérés:', members.length);
      console.log('📋 Premiers membres:', members.slice(0, 3).map(m => ({ name: m.name, email: m.email })));
      
      return members;
      
    } catch (error) {
      console.error('❌ Erreur récupération membres:', error);
      console.error('Détails erreur:', error.message);
      return [];
    }
  }

  /**
   * 🎯 ASSIGNER UNE TÂCHE À PLUSIEURS PERSONNES
   */
  async assignTaskToMembers(taskId, assignedUserIds, assignedBy) {
    try {
      console.log('🎯 Assignation tâche multiple:', { taskId, assignedUserIds, assignedBy });
      
      if (!taskId || !assignedUserIds || assignedUserIds.length === 0) {
        throw new Error('Paramètres d\'assignation invalides');
      }

      // Récupérer la tâche actuelle
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      
      // Préparer les données d'assignation
      const assignmentData = assignedUserIds.map(userId => ({
        userId: userId,
        assignedAt: new Date().toISOString(),
        assignedBy: assignedBy,
        status: 'assigned', // assigned, completed, declined
        contributionPercentage: 100 / assignedUserIds.length, // Distribution égale par défaut
        hasSubmitted: false,
        submissionDate: null
      }));

      // Mettre à jour la tâche
      await updateDoc(taskRef, {
        assignedTo: assignedUserIds, // Liste des IDs assignés
        assignments: assignmentData, // Détails des assignations
        isMultipleAssignment: assignedUserIds.length > 1,
        assignmentCount: assignedUserIds.length,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        lastAssignedBy: assignedBy,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Tâche assignée à', assignedUserIds.length, 'personnes');
      
      return {
        success: true,
        assignedCount: assignedUserIds.length,
        taskId: taskId
      };

    } catch (error) {
      console.error('❌ Erreur assignation multiple:', error);
      throw error;
    }
  }

  /**
   * ✅ MARQUER LA SOUMISSION D'UN ASSIGNÉ
   */
  async markUserSubmission(taskId, userId, submissionData) {
    try {
      console.log('📝 Soumission utilisateur:', { taskId, userId });
      
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const assignments = taskData.assignments || [];
      
      // Trouver l'assignation de cet utilisateur
      const userAssignmentIndex = assignments.findIndex(a => a.userId === userId);
      if (userAssignmentIndex === -1) {
        throw new Error('Utilisateur non assigné à cette tâche');
      }

      // Mettre à jour l'assignation
      const updatedAssignments = [...assignments];
      updatedAssignments[userAssignmentIndex] = {
        ...updatedAssignments[userAssignmentIndex],
        hasSubmitted: true,
        submissionDate: new Date().toISOString(),
        submissionData: submissionData,
        status: 'submitted'
      };

      // Vérifier si tous ont soumis
      const allSubmitted = updatedAssignments.every(a => a.hasSubmitted);
      
      await updateDoc(taskRef, {
        assignments: updatedAssignments,
        allSubmitted: allSubmitted,
        status: allSubmitted ? 'validation_pending' : 'in_progress',
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        allSubmitted: allSubmitted,
        remainingSubmissions: updatedAssignments.filter(a => !a.hasSubmitted).length
      };

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      throw error;
    }
  }

  /**
   * 🏆 DISTRIBUER LES XP APRÈS VALIDATION ADMIN
   */
  async distributeXPToAssignees(taskId, adminId, xpAmount, adminComment = '') {
    try {
      console.log('🏆 Distribution XP:', { taskId, xpAmount });
      
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const assignments = taskData.assignments || [];
      
      if (assignments.length === 0) {
        throw new Error('Aucune assignation trouvée');
      }

      // Utiliser un batch pour toutes les mises à jour
      const batch = writeBatch(db);
      
      // Distribution des XP selon les pourcentages
      const xpDistributions = [];
      
      for (const assignment of assignments) {
        const userXP = Math.round(xpAmount * (assignment.contributionPercentage / 100));
        
        // Mettre à jour les XP de l'utilisateur
        const userRef = doc(db, 'users', assignment.userId);
        
        // Récupérer les données actuelles de l'utilisateur
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        const currentXP = userData.gamification?.totalXp || 0;
        const currentLevel = userData.gamification?.level || 1;
        const tasksCompleted = userData.gamification?.tasksCompleted || 0;
        
        // Calculer le nouveau niveau
        const newXP = currentXP + userXP;
        const newLevel = this.calculateLevel(newXP);
        
        // Mettre à jour l'utilisateur via batch
        batch.update(userRef, {
          'gamification.totalXp': newXP,
          'gamification.level': newLevel,
          'gamification.tasksCompleted': tasksCompleted + 1,
          'gamification.lastActivityDate': serverTimestamp(),
          'gamification.lastXpGain': {
            amount: userXP,
            source: 'task_completion',
            taskId: taskId,
            taskTitle: taskData.title,
            date: new Date().toISOString()
          }
        });
        
        xpDistributions.push({
          userId: assignment.userId,
          userName: assignment.userName || 'Utilisateur',
          xpAwarded: userXP,
          contributionPercentage: assignment.contributionPercentage,
          newTotalXP: newXP,
          levelUp: newLevel > currentLevel
        });
      }
      
      // Mettre à jour la tâche
      batch.update(taskRef, {
        status: 'completed',
        validatedAt: serverTimestamp(),
        validatedBy: adminId,
        adminComment: adminComment,
        xpDistributed: true,
        xpDistributions: xpDistributions,
        totalXpAwarded: xpAmount,
        completedAt: serverTimestamp()
      });
      
      // Exécuter toutes les mises à jour
      await batch.commit();
      
      console.log('✅ XP distribués à', assignments.length, 'assignés');
      
      return {
        success: true,
        distributions: xpDistributions,
        totalAwarded: xpAmount
      };

    } catch (error) {
      console.error('❌ Erreur distribution XP:', error);
      throw error;
    }
  }

  /**
   * 📊 CALCULER LE NIVEAU BASÉ SUR L'XP
   */
  calculateLevel(totalXp) {
    // Progression: 100 XP pour niveau 1->2, puis +50 par niveau
    if (totalXp < 100) return 1;
    if (totalXp < 200) return 2;
    if (totalXp < 350) return 3;
    if (totalXp < 550) return 4;
    if (totalXp < 800) return 5;
    
    // À partir du niveau 6, +300 XP par niveau
    return Math.floor((totalXp - 800) / 300) + 6;
  }

  /**
   * 🔄 MODIFIER LES POURCENTAGES DE CONTRIBUTION
   */
  async updateContributionPercentages(taskId, contributions) {
    try {
      console.log('🔄 Mise à jour contributions:', { taskId, contributions });
      
      // Vérifier que la somme fait 100%
      const totalPercentage = Object.values(contributions).reduce((sum, pct) => sum + pct, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Les pourcentages doivent totaliser 100%');
      }

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Tâche introuvable');
      }

      const taskData = taskDoc.data();
      const assignments = taskData.assignments || [];
      
      // Mettre à jour les pourcentages
      const updatedAssignments = assignments.map(assignment => ({
        ...assignment,
        contributionPercentage: contributions[assignment.userId] || assignment.contributionPercentage
      }));
      
      await updateDoc(taskRef, {
        assignments: updatedAssignments,
        contributionsUpdated: true,
        contributionsUpdatedAt: serverTimestamp()
      });
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur mise à jour contributions:', error);
      throw error;
    }
  }

  /**
   * 👥 RÉCUPÉRER LES TÂCHES ASSIGNÉES À UN UTILISATEUR
   */
  async getUserAssignedTasks(userId) {
    try {
      console.log('📋 Récupération tâches assignées:', userId);
      
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', userId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const tasks = tasksSnapshot.docs.map(doc => {
        const taskData = doc.data();
        const userAssignment = taskData.assignments?.find(a => a.userId === userId);
        
        return {
          id: doc.id,
          ...taskData,
          userAssignment: userAssignment,
          isMultipleAssignment: taskData.assignedTo?.length > 1,
          assignmentCount: taskData.assignedTo?.length || 1
        };
      });
      
      console.log('✅ Tâches assignées récupérées:', tasks.length);
      return tasks;

    } catch (error) {
      console.error('❌ Erreur récupération tâches assignées:', error);
      return [];
    }
  }
}

// Export de l'instance
export const taskAssignmentService = new TaskAssignmentService();
export default TaskAssignmentService;
