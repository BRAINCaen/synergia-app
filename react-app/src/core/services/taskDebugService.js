// ==========================================
// 📁 react-app/src/core/services/taskDebugService.js
// SERVICE DE DIAGNOSTIC DES TÂCHES MANQUANTES
// ==========================================

import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔍 SERVICE DE DIAGNOSTIC COMPLET
 */
class TaskDebugService {
  constructor() {
    console.log('🔍 TaskDebugService initialisé');
  }

  /**
   * 📊 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES
   */
  async fullDiagnosis() {
    console.log('🔍 === DIAGNOSTIC COMPLET DES TÂCHES ===');
    
    try {
      // 1. Vérifier la connexion Firebase
      console.log('1️⃣ Vérification connexion Firebase...');
      if (!db) {
        console.error('❌ Firebase non initialisé !');
        return false;
      }
      console.log('✅ Firebase connecté');

      // 2. Vérifier la collection tasks
      console.log('2️⃣ Vérification collection tasks...');
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      console.log(`📊 Nombre de tâches dans Firebase: ${snapshot.size}`);
      
      if (snapshot.size === 0) {
        console.warn('⚠️ Aucune tâche trouvée dans Firebase !');
        console.log('🔧 Création de tâches de test...');
        await this.createTestTasks();
        return this.fullDiagnosis(); // Re-diagnostic après création
      }

      // 3. Analyser chaque tâche
      console.log('3️⃣ Analyse des tâches existantes...');
      const tasks = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data
        });
        console.log(`📄 Tâche ${doc.id}:`, {
          title: data.title,
          status: data.status,
          createdBy: data.createdBy,
          assignedTo: data.assignedTo
        });
      });

      // 4. Vérifier la structure des données
      console.log('4️⃣ Vérification structure des données...');
      const structureIssues = [];
      
      tasks.forEach(task => {
        if (!task.title) structureIssues.push(`Tâche ${task.id}: pas de titre`);
        if (!task.status) structureIssues.push(`Tâche ${task.id}: pas de statut`);
        if (!task.createdBy) structureIssues.push(`Tâche ${task.id}: pas de créateur`);
      });

      if (structureIssues.length > 0) {
        console.warn('⚠️ Problèmes de structure détectés:');
        structureIssues.forEach(issue => console.warn(`  - ${issue}`));
      } else {
        console.log('✅ Structure des données correcte');
      }

      // 5. Test du service de tâches
      console.log('5️⃣ Test du service de tâches...');
      try {
        const { taskService } = await import('./taskService.js');
        const allTasks = await taskService.getAllTasks();
        console.log(`✅ Service taskService fonctionne: ${allTasks.length} tâches`);
      } catch (serviceError) {
        console.error('❌ Erreur service taskService:', serviceError);
      }

      return true;

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      return false;
    }
  }

  /**
   * 🎯 CRÉER DES TÂCHES DE TEST
   */
  async createTestTasks() {
    try {
      console.log('🎯 Création de tâches de test...');
      
      const testTasks = [
        {
          title: '🔧 Tâche de Maintenance Test',
          description: 'Ceci est une tâche de test pour vérifier le système',
          status: 'todo',
          priority: 'medium',
          category: 'maintenance',
          xpReward: 25,
          assignedTo: [],
          createdBy: 'system-test',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tags: ['test', 'maintenance'],
          openToVolunteers: true
        },
        {
          title: '⭐ Gestion Réputation Test',
          description: 'Tâche de test pour la gestion de réputation',
          status: 'pending',
          priority: 'high',
          category: 'reputation',
          xpReward: 35,
          assignedTo: [],
          createdBy: 'system-test',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tags: ['test', 'reputation'],
          openToVolunteers: true
        },
        {
          title: '📦 Gestion Stock Test',
          description: 'Tâche de test pour la gestion des stocks',
          status: 'todo',
          priority: 'low',
          category: 'stock',
          xpReward: 20,
          assignedTo: [],
          createdBy: 'system-test',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tags: ['test', 'stock'],
          openToVolunteers: true
        }
      ];

      for (const taskData of testTasks) {
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        console.log(`✅ Tâche test créée: ${docRef.id} - ${taskData.title}`);
      }

      console.log('🎉 Tâches de test créées avec succès !');
      return true;

    } catch (error) {
      console.error('❌ Erreur création tâches de test:', error);
      return false;
    }
  }

  /**
   * 🧹 NETTOYER LES TÂCHES DE TEST
   */
  async cleanTestTasks() {
    try {
      console.log('🧹 Nettoyage des tâches de test...');
      
      const snapshot = await getDocs(collection(db, 'tasks'));
      const batch = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.createdBy === 'system-test' || 
            (data.tags && data.tags.includes('test'))) {
          batch.push(doc.ref);
        }
      });

      for (const ref of batch) {
        await ref.delete();
      }

      console.log(`🧹 ${batch.length} tâches de test supprimées`);
      return true;

    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return false;
    }
  }

  /**
   * 🚀 DIAGNOSTIC RAPIDE
   */
  async quickCheck() {
    try {
      const snapshot = await getDocs(collection(db, 'tasks'));
      console.log(`🚀 Diagnostic rapide: ${snapshot.size} tâches trouvées`);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur diagnostic rapide:', error);
      return 0;
    }
  }
}

// Instance unique
const taskDebugService = new TaskDebugService();

// Exposer dans la console pour debug
if (typeof window !== 'undefined') {
  window.taskDebugService = taskDebugService;
  window.debugTasks = {
    fullDiagnosis: () => taskDebugService.fullDiagnosis(),
    createTestTasks: () => taskDebugService.createTestTasks(),
    cleanTestTasks: () => taskDebugService.cleanTestTasks(),
    quickCheck: () => taskDebugService.quickCheck()
  };
  
  console.log('🔍 Debug disponible dans la console:');
  console.log('  - window.debugTasks.fullDiagnosis()');
  console.log('  - window.debugTasks.createTestTasks()');
  console.log('  - window.debugTasks.quickCheck()');
}

export { taskDebugService };
export default TaskDebugService;
