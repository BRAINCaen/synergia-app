// ==========================================
// 📁 react-app/src/core/roleRecoveryDiagnostic.js
// DIAGNOSTIC ET RÉCUPÉRATION DES RÔLES PERDUS
// ==========================================

import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * 🔍 SERVICE DE DIAGNOSTIC DES RÔLES PERDUS
 */
class RoleRecoveryDiagnostic {
  constructor() {
    this.foundRoles = [];
    this.missingRoles = [];
    this.diagnosticResult = null;
  }

  /**
   * 🔍 DIAGNOSTIC COMPLET DES RÔLES
   */
  async runFullDiagnostic(userId = null) {
    try {
      console.log('🔍 DIAGNOSTIC COMPLET DES RÔLES DANS FIREBASE');
      console.log('================================================');

      const diagnosticResult = {
        timestamp: new Date().toISOString(),
        tasksAnalyzed: 0,
        rolesFound: [],
        roleFields: [],
        tasksByRole: {},
        anomalies: [],
        recommendations: []
      };

      // 1. ANALYSER TOUTES LES TÂCHES
      console.log('📋 Analyse des tâches...');
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      diagnosticResult.tasksAnalyzed = tasksSnapshot.size;

      console.log(`📊 ${tasksSnapshot.size} tâches trouvées`);

      tasksSnapshot.forEach(taskDoc => {
        const taskData = taskDoc.data();
        const taskId = taskDoc.id;

        // Analyser tous les champs possibles pour les rôles
        const possibleRoleFields = ['role', 'roleId', 'synergiaRole', 'taskRole', 'assignedRole'];
        
        possibleRoleFields.forEach(field => {
          if (taskData[field]) {
            if (!diagnosticResult.roleFields.includes(field)) {
              diagnosticResult.roleFields.push(field);
            }

            const roleValue = taskData[field];
            if (!diagnosticResult.rolesFound.includes(roleValue)) {
              diagnosticResult.rolesFound.push(roleValue);
            }

            if (!diagnosticResult.tasksByRole[roleValue]) {
              diagnosticResult.tasksByRole[roleValue] = [];
            }

            diagnosticResult.tasksByRole[roleValue].push({
              taskId,
              title: taskData.title,
              field: field,
              createdAt: taskData.createdAt,
              createdBy: taskData.createdBy
            });
          }
        });

        // Détecter les anomalies
        if (taskData.role && taskData.roleId && taskData.role !== taskData.roleId) {
          diagnosticResult.anomalies.push({
            type: 'role_mismatch',
            taskId,
            title: taskData.title,
            role: taskData.role,
            roleId: taskData.roleId,
            message: 'Les champs role et roleId ne correspondent pas'
          });
        }

        // Filtrer par utilisateur si spécifié
        if (userId && taskData.createdBy === userId) {
          console.log(`🎯 Tâche de l'utilisateur ${userId}:`, {
            title: taskData.title,
            role: taskData.role,
            roleId: taskData.roleId,
            createdAt: taskData.createdAt
          });
        }
      });

      // 2. GÉNÉRER DES RECOMMANDATIONS
      if (diagnosticResult.rolesFound.length === 0) {
        diagnosticResult.recommendations.push({
          type: 'no_roles_found',
          message: 'Aucun rôle trouvé dans les tâches. Les rôles ont peut-être été perdus.',
          action: 'Exécuter la fonction de récupération'
        });
      }

      if (diagnosticResult.roleFields.length > 1) {
        diagnosticResult.recommendations.push({
          type: 'multiple_role_fields',
          message: `Plusieurs champs de rôle détectés: ${diagnosticResult.roleFields.join(', ')}`,
          action: 'Standardiser sur un seul champ (roleId recommandé)'
        });
      }

      if (diagnosticResult.anomalies.length > 0) {
        diagnosticResult.recommendations.push({
          type: 'data_inconsistency',
          message: `${diagnosticResult.anomalies.length} incohérences détectées`,
          action: 'Nettoyer les données incohérentes'
        });
      }

      // 3. AFFICHER LES RÉSULTATS
      console.log('\n📊 RÉSULTATS DU DIAGNOSTIC:');
      console.log('============================');
      console.log(`📋 Tâches analysées: ${diagnosticResult.tasksAnalyzed}`);
      console.log(`🎭 Rôles trouvés: ${diagnosticResult.rolesFound.length}`);
      console.log(`📝 Champs de rôle: ${diagnosticResult.roleFields.join(', ')}`);
      console.log(`⚠️  Anomalies: ${diagnosticResult.anomalies.length}`);

      if (diagnosticResult.rolesFound.length > 0) {
        console.log('\n🎭 RÔLES DÉTECTÉS:');
        diagnosticResult.rolesFound.forEach(role => {
          const taskCount = diagnosticResult.tasksByRole[role].length;
          console.log(`  • ${role}: ${taskCount} tâche(s)`);
        });
      }

      if (diagnosticResult.anomalies.length > 0) {
        console.log('\n⚠️  ANOMALIES DÉTECTÉES:');
        diagnosticResult.anomalies.forEach(anomaly => {
          console.log(`  • ${anomaly.type}: ${anomaly.message}`);
        });
      }

      console.log('\n💡 RECOMMANDATIONS:');
      diagnosticResult.recommendations.forEach(rec => {
        console.log(`  • ${rec.message}`);
        console.log(`    ➤ ${rec.action}`);
      });

      this.diagnosticResult = diagnosticResult;
      return diagnosticResult;

    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      throw error;
    }
  }

  /**
   * 🔧 RÉCUPÉRATION AUTOMATIQUE DES RÔLES
   */
  async recoverRoles() {
    try {
      console.log('🔧 RÉCUPÉRATION AUTOMATIQUE DES RÔLES');
      console.log('=====================================');

      if (!this.diagnosticResult) {
        console.log('⚠️ Exécution du diagnostic d\'abord...');
        await this.runFullDiagnostic();
      }

      const recoveryResult = {
        tasksUpdated: 0,
        errorsEncountered: 0,
        rolesRecovered: [],
        errors: []
      };

      // Récupérer toutes les tâches pour la mise à jour
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));

      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();
        const taskId = taskDoc.id;

        try {
          let needsUpdate = false;
          const updates = {};

          // Standardiser les champs de rôle
          if (taskData.role && !taskData.roleId) {
            updates.roleId = taskData.role;
            needsUpdate = true;
            console.log(`🔧 Récupération roleId pour tâche ${taskData.title}: ${taskData.role}`);
          }

          if (taskData.roleId && !taskData.role) {
            updates.role = taskData.roleId;
            needsUpdate = true;
            console.log(`🔧 Récupération role pour tâche ${taskData.title}: ${taskData.roleId}`);
          }

          // Nettoyer les incohérences
          if (taskData.role && taskData.roleId && taskData.role !== taskData.roleId) {
            updates.role = taskData.roleId; // Privilégier roleId
            needsUpdate = true;
            console.log(`🔧 Correction incohérence pour tâche ${taskData.title}: ${taskData.roleId}`);
          }

          // Appliquer les mises à jour
          if (needsUpdate) {
            await updateDoc(doc(db, 'tasks', taskId), updates);
            recoveryResult.tasksUpdated++;
            
            // Tracker les rôles récupérés
            const recoveredRole = updates.roleId || updates.role;
            if (recoveredRole && !recoveryResult.rolesRecovered.includes(recoveredRole)) {
              recoveryResult.rolesRecovered.push(recoveredRole);
            }
          }

        } catch (error) {
          console.error(`❌ Erreur mise à jour tâche ${taskId}:`, error);
          recoveryResult.errorsEncountered++;
          recoveryResult.errors.push({
            taskId,
            title: taskData.title,
            error: error.message
          });
        }
      }

      console.log('\n✅ RÉCUPÉRATION TERMINÉE:');
      console.log(`📝 Tâches mises à jour: ${recoveryResult.tasksUpdated}`);
      console.log(`🎭 Rôles récupérés: ${recoveryResult.rolesRecovered.join(', ')}`);
      console.log(`❌ Erreurs: ${recoveryResult.errorsEncountered}`);

      return recoveryResult;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      throw error;
    }
  }

  /**
   * 📊 RAPPORT DÉTAILLÉ PAR UTILISATEUR
   */
  async getUserRoleReport(userId) {
    try {
      console.log(`📊 RAPPORT RÔLES POUR UTILISATEUR: ${userId}`);
      console.log('===========================================');

      const userReport = {
        userId,
        tasksCreated: 0,
        tasksWithRoles: 0,
        rolesUsed: [],
        tasksByRole: {},
        timeline: []
      };

      // Analyser les tâches de l'utilisateur
      const userTasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const userTasksSnapshot = await getDocs(userTasksQuery);
      userReport.tasksCreated = userTasksSnapshot.size;

      userTasksSnapshot.forEach(taskDoc => {
        const taskData = taskDoc.data();
        const role = taskData.roleId || taskData.role;

        if (role) {
          userReport.tasksWithRoles++;
          
          if (!userReport.rolesUsed.includes(role)) {
            userReport.rolesUsed.push(role);
          }

          if (!userReport.tasksByRole[role]) {
            userReport.tasksByRole[role] = [];
          }

          const taskInfo = {
            id: taskDoc.id,
            title: taskData.title,
            createdAt: taskData.createdAt,
            status: taskData.status
          };

          userReport.tasksByRole[role].push(taskInfo);
          userReport.timeline.push({
            date: taskData.createdAt,
            action: 'created_task_with_role',
            role: role,
            taskTitle: taskData.title
          });
        }
      });

      // Trier la timeline
      userReport.timeline.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA;
      });

      console.log(`📋 Tâches créées: ${userReport.tasksCreated}`);
      console.log(`🎭 Tâches avec rôles: ${userReport.tasksWithRoles}`);
      console.log(`🔖 Rôles utilisés: ${userReport.rolesUsed.join(', ')}`);

      if (userReport.rolesUsed.length > 0) {
        console.log('\n📊 DÉTAIL PAR RÔLE:');
        userReport.rolesUsed.forEach(role => {
          const tasks = userReport.tasksByRole[role];
          console.log(`  🎭 ${role}: ${tasks.length} tâche(s)`);
          tasks.forEach(task => {
            console.log(`    • ${task.title}`);
          });
        });
      }

      return userReport;

    } catch (error) {
      console.error('❌ Erreur rapport utilisateur:', error);
      throw error;
    }
  }

  /**
   * 🔍 RECHERCHE SPÉCIFIQUE DE RÔLE
   */
  async searchSpecificRole(roleName) {
    try {
      console.log(`🔍 RECHERCHE DU RÔLE: "${roleName}"`);
      console.log('================================');

      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const foundTasks = [];

      tasksSnapshot.forEach(taskDoc => {
        const taskData = taskDoc.data();
        const taskRole = taskData.roleId || taskData.role;

        if (taskRole === roleName) {
          foundTasks.push({
            id: taskDoc.id,
            title: taskData.title,
            createdBy: taskData.createdBy,
            createdAt: taskData.createdAt,
            status: taskData.status,
            field: taskData.roleId ? 'roleId' : 'role'
          });
        }
      });

      console.log(`📊 ${foundTasks.length} tâche(s) trouvée(s) avec le rôle "${roleName}"`);

      if (foundTasks.length > 0) {
        console.log('\n📋 TÂCHES TROUVÉES:');
        foundTasks.forEach(task => {
          console.log(`  • ${task.title} (${task.status}) - créée par ${task.createdBy}`);
        });
      }

      return foundTasks;

    } catch (error) {
      console.error('❌ Erreur recherche rôle:', error);
      throw error;
    }
  }
}

// Instance unique
const roleRecoveryDiagnostic = new RoleRecoveryDiagnostic();

// 🌐 EXPOSITION GLOBALE POUR UTILISATION CONSOLE
if (typeof window !== 'undefined') {
  window.roleRecoveryDiagnostic = roleRecoveryDiagnostic;
  
  // Fonctions raccourcis
  window.diagnoseRoles = () => roleRecoveryDiagnostic.runFullDiagnostic();
  window.recoverRoles = () => roleRecoveryDiagnostic.recoverRoles();
  window.myRoleReport = (userId) => roleRecoveryDiagnostic.getUserRoleReport(userId);
  window.findRole = (roleName) => roleRecoveryDiagnostic.searchSpecificRole(roleName);
  
  console.log('🔍 Diagnostic des rôles chargé !');
  console.log('📋 Utilisation:');
  console.log('  • diagnoseRoles() - Diagnostic complet');
  console.log('  • recoverRoles() - Récupération automatique');
  console.log('  • myRoleReport(userId) - Rapport par utilisateur');
  console.log('  • findRole("maintenance") - Rechercher un rôle spécifique');
}

export default roleRecoveryDiagnostic;
