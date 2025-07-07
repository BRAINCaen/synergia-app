// ==========================================
// 📁 react-app/src/core/services/taskRecoveryService.js
// SERVICE DE DIAGNOSTIC ET RÉCUPÉRATION DES TÂCHES PERDUES
// ==========================================

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔍 SERVICE DE DIAGNOSTIC DES TÂCHES PERDUES
 * Diagnostique et récupère les tâches qui ont "disparu"
 */
class TaskRecoveryService {
  constructor() {
    this.COLLECTION_NAME = 'tasks';
  }

  /**
   * 🔍 DIAGNOSTIC COMPLET DES TÂCHES
   */
  async diagnoseTaskIssues(currentUser) {
    try {
      console.log('🔍 DIAGNOSTIC - Analyse des tâches pour:', currentUser.email);
      
      const diagnosis = {
        currentUser: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        },
        findings: [],
        totalTasksFound: 0,
        tasksByCategory: {}
      };

      // 1. Récupérer TOUTES les tâches de la collection
      console.log('📋 Récupération de toutes les tâches...');
      const allTasksSnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      const allTasks = [];
      
      allTasksSnapshot.forEach((doc) => {
        allTasks.push({ id: doc.id, ...doc.data() });
      });

      diagnosis.totalTasksFound = allTasks.length;
      console.log(`📊 Total des tâches dans Firebase: ${allTasks.length}`);

      // 2. Analyser les tâches par catégories
      const categories = {
        matchingUserId: [],      // userId === currentUser.uid
        matchingCreatedBy: [],   // createdBy === currentUser.uid  
        matchingEmail: [],       // email présent dans la tâche
        matchingAssignedTo: [],  // assignedTo === currentUser.uid
        orphanTasks: [],         // tâches sans propriétaire clair
        allUserTasks: []         // toutes les tâches potentiellement liées à l'utilisateur
      };

      allTasks.forEach(task => {
        // Analyser chaque tâche
        if (task.userId === currentUser.uid) {
          categories.matchingUserId.push(task);
        }
        
        if (task.createdBy === currentUser.uid) {
          categories.matchingCreatedBy.push(task);
        }
        
        if (task.assignedTo === currentUser.uid) {
          categories.matchingAssignedTo.push(task);
        }
        
        if (task.userEmail === currentUser.email || 
            task.email === currentUser.email ||
            task.createdByEmail === currentUser.email) {
          categories.matchingEmail.push(task);
        }

        // Tâche potentiellement liée à l'utilisateur
        if (task.userId === currentUser.uid || 
            task.createdBy === currentUser.uid || 
            task.assignedTo === currentUser.uid ||
            task.userEmail === currentUser.email ||
            task.email === currentUser.email) {
          categories.allUserTasks.push(task);
        }

        // Tâches orphelines (sans propriétaire clair)
        if (!task.userId && !task.createdBy && !task.assignedTo) {
          categories.orphanTasks.push(task);
        }
      });

      diagnosis.tasksByCategory = categories;

      // 3. Générer les recommandations
      diagnosis.findings = this.generateFindings(categories, currentUser);

      console.log('📊 DIAGNOSTIC TERMINÉ:', diagnosis);
      return diagnosis;

    } catch (error) {
      console.error('❌ Erreur diagnostic tâches:', error);
      return { error: error.message };
    }
  }

  /**
   * 📝 GÉNÉRER LES RECOMMANDATIONS
   */
  generateFindings(categories, currentUser) {
    const findings = [];

    if (categories.matchingUserId.length > 0) {
      findings.push({
        type: 'success',
        title: `✅ ${categories.matchingUserId.length} tâche(s) trouvée(s) avec userId correct`,
        description: 'Ces tâches devraient s\'afficher normalement',
        count: categories.matchingUserId.length,
        action: 'none'
      });
    }

    if (categories.matchingCreatedBy.length > 0) {
      findings.push({
        type: 'warning',
        title: `⚠️ ${categories.matchingCreatedBy.length} tâche(s) avec createdBy mais pas userId`,
        description: 'Ces tâches ont été créées par vous mais le userId est incorrect',
        count: categories.matchingCreatedBy.length,
        action: 'fix_userId'
      });
    }

    if (categories.matchingEmail.length > 0) {
      findings.push({
        type: 'info',
        title: `📧 ${categories.matchingEmail.length} tâche(s) avec votre email`,
        description: 'Ces tâches contiennent votre email dans leurs métadonnées',
        count: categories.matchingEmail.length,
        action: 'review'
      });
    }

    if (categories.orphanTasks.length > 0) {
      findings.push({
        type: 'error',
        title: `🔍 ${categories.orphanTasks.length} tâche(s) orpheline(s)`,
        description: 'Ces tâches n\'ont pas de propriétaire défini',
        count: categories.orphanTasks.length,
        action: 'investigate'
      });
    }

    if (categories.allUserTasks.length === 0) {
      findings.push({
        type: 'error',
        title: '❌ Aucune tâche trouvée pour cet utilisateur',
        description: `Aucune tâche liée à ${currentUser.email} n'a été trouvée`,
        count: 0,
        action: 'check_user_data'
      });
    }

    return findings;
  }

  /**
   * 🔧 RÉPARER LES TÂCHES AVEC createdBy MAIS PAS userId
   */
  async fixTasksWithCreatedBy(currentUser) {
    try {
      console.log('🔧 RÉPARATION - Correction des userId manquants...');

      const tasksQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('createdBy', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(tasksQuery);
      const batch = writeBatch(db);
      let fixedCount = 0;

      querySnapshot.forEach((docSnapshot) => {
        const taskData = docSnapshot.data();
        
        // Si userId manquant ou incorrect, le corriger
        if (!taskData.userId || taskData.userId !== currentUser.uid) {
          const taskRef = doc(db, this.COLLECTION_NAME, docSnapshot.id);
          batch.update(taskRef, {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            repairedAt: new Date(),
            repairedBy: 'TaskRecoveryService'
          });
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ ${fixedCount} tâche(s) réparée(s) avec succès`);
        return { success: true, fixedCount, message: `${fixedCount} tâche(s) réparée(s)` };
      } else {
        console.log('ℹ️ Aucune tâche à réparer');
        return { success: true, fixedCount: 0, message: 'Aucune tâche à réparer' };
      }

    } catch (error) {
      console.error('❌ Erreur réparation tâches:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 RECHERCHE ALTERNATIVE DES TÂCHES
   * Utilise plusieurs stratégies pour retrouver les tâches
   */
  async findTasksAlternative(currentUser) {
    try {
      console.log('🔍 RECHERCHE ALTERNATIVE - Stratégies multiples...');

      const strategies = [
        // Stratégie 1: userId exact
        { name: 'userId', field: 'userId', value: currentUser.uid },
        // Stratégie 2: createdBy
        { name: 'createdBy', field: 'createdBy', value: currentUser.uid },
        // Stratégie 3: assignedTo
        { name: 'assignedTo', field: 'assignedTo', value: currentUser.uid },
        // Stratégie 4: par email
        { name: 'userEmail', field: 'userEmail', value: currentUser.email }
      ];

      const results = {};

      for (const strategy of strategies) {
        try {
          const q = query(
            collection(db, this.COLLECTION_NAME),
            where(strategy.field, '==', strategy.value),
            orderBy('updatedAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const tasks = [];

          querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });

          results[strategy.name] = tasks;
          console.log(`📋 Stratégie ${strategy.name}: ${tasks.length} tâche(s)`);

        } catch (queryError) {
          console.warn(`⚠️ Stratégie ${strategy.name} échouée:`, queryError.message);
          results[strategy.name] = [];
        }
      }

      // Combiner tous les résultats uniques
      const allFoundTasks = new Map();
      Object.values(results).forEach(tasks => {
        tasks.forEach(task => {
          allFoundTasks.set(task.id, task);
        });
      });

      const uniqueTasks = Array.from(allFoundTasks.values());
      console.log(`🎯 TOTAL UNIQUE: ${uniqueTasks.length} tâche(s) trouvée(s)`);

      return {
        success: true,
        strategies: results,
        uniqueTasks,
        totalFound: uniqueTasks.length
      };

    } catch (error) {
      console.error('❌ Erreur recherche alternative:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 RAPPORT COMPLET DE RÉCUPÉRATION
   */
  async generateRecoveryReport(currentUser) {
    try {
      console.log('📊 GÉNÉRATION RAPPORT DE RÉCUPÉRATION...');

      const diagnosis = await this.diagnoseTaskIssues(currentUser);
      const alternativeSearch = await this.findTasksAlternative(currentUser);

      const report = {
        timestamp: new Date().toISOString(),
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        },
        diagnosis,
        alternativeSearch,
        recommendations: []
      };

      // Générer les recommandations finales
      if (alternativeSearch.totalFound > 0) {
        report.recommendations.push({
          priority: 'high',
          action: 'fix_tasks',
          title: `Réparer les ${alternativeSearch.totalFound} tâche(s) trouvée(s)`,
          description: 'Corriger les userId pour que les tâches s\'affichent correctement'
        });
      }

      if (diagnosis.tasksByCategory?.orphanTasks?.length > 0) {
        report.recommendations.push({
          priority: 'medium',
          action: 'investigate_orphans',
          title: 'Enquêter sur les tâches orphelines',
          description: 'Déterminer à qui appartiennent ces tâches'
        });
      }

      console.log('📋 RAPPORT GÉNÉRÉ:', report);
      return report;

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      return { error: error.message };
    }
  }
}

// ✅ Export de l'instance singleton
const taskRecoveryService = new TaskRecoveryService();

export { taskRecoveryService };
export default taskRecoveryService;
