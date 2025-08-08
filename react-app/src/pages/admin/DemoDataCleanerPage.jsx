// ==========================================
// 📁 react-app/src/core/services/demoDataCleaner.js
// SERVICE DE SUPPRESSION DES DONNÉES DE DÉMONSTRATION
// ==========================================

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  serverTimestamp,
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🧹 SERVICE DE NETTOYAGE DES DONNÉES DÉMO
 * Supprime toutes les données de démonstration pour ne garder que les vraies données utilisateur
 */
class DemoDataCleaner {
  constructor() {
    // Patterns pour identifier les données de démonstration
    this.demoPatterns = {
      // Titres de tâches démo
      taskTitles: [
        'Gagner votre premier badge',
        'Compléter votre profil',
        'Découvrir le tableau de bord',
        'Bienvenue dans Synergia !',
        'Découvrir l\'interface de gestion des tâches',
        'Compléter votre première tâche',
        'Explorer le système de gamification',
        'Première tâche',
        'Tâche d\'exemple',
        'Test task',
        'Demo task'
      ],
      
      // Descriptions démo
      descriptions: [
        'Complétez des tâches pour débloquer des badges',
        'Ajoutez vos informations personnelles',
        'Explorez votre tableau de bord personnalisé',
        'Explorez votre nouveau tableau de bord',
        'Explorez toutes les fonctionnalités de la page des tâches',
        'Changez le statut d\'une tâche et découvrez le système',
        'Découvrez comment gagner de l\'XP',
        'Ceci est une tâche d\'exemple',
        'Description de démonstration'
      ],
      
      // Tags démo
      tags: [
        'onboarding',
        'formation',
        'gamification',
        'welcome',
        'demo',
        'test',
        'exemple'
      ],
      
      // Noms d'utilisateurs démo
      userNames: [
        'Allan le BOSS',
        'Utilisateur Test',
        'Test User',
        'Demo User',
        'Example User'
      ],
      
      // Emails démo
      emails: [
        'test@example.com',
        'demo@synergia.com',
        'admin@synergia.com',
        'user@exemple.com',
        'alice@example.com',
        'bob@example.com'
      ]
    };
    
    console.log('🧹 DemoDataCleaner initialisé');
  }

  /**
   * 🔍 ANALYSER ET IDENTIFIER TOUTES LES DONNÉES DÉMO
   */
  async scanAllDemoData() {
    try {
      console.log('🔍 Scan complet des données de démonstration...');
      
      const demoData = {
        tasks: [],
        projects: [],
        users: [],
        badges: [],
        stats: {}
      };

      // Analyser les tâches
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      tasksSnapshot.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        if (this.isTaskDemo(task)) {
          demoData.tasks.push(task);
        }
      });

      // Analyser les projets
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      projectsSnapshot.forEach(doc => {
        const project = { id: doc.id, ...doc.data() };
        if (this.isProjectDemo(project)) {
          demoData.projects.push(project);
        }
      });

      // Analyser les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.forEach(doc => {
        const user = { id: doc.id, ...doc.data() };
        if (this.isUserDemo(user)) {
          demoData.users.push(user);
        }
      });

      // Analyser les badges
      const badgesSnapshot = await getDocs(collection(db, 'user_badges'));
      badgesSnapshot.forEach(doc => {
        const badge = { id: doc.id, ...doc.data() };
        if (this.isBadgeDemo(badge)) {
          demoData.badges.push(badge);
        }
      });

      demoData.stats = {
        totalDemoTasks: demoData.tasks.length,
        totalDemoProjects: demoData.projects.length,
        totalDemoUsers: demoData.users.length,
        totalDemoBadges: demoData.badges.length,
        totalDemoItems: demoData.tasks.length + demoData.projects.length + demoData.users.length + demoData.badges.length
      };

      console.log('📊 Données démo trouvées:', demoData.stats);
      return demoData;

    } catch (error) {
      console.error('❌ Erreur scan données démo:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER TOUTES LES DONNÉES DÉMO
   */
  async cleanAllDemoData() {
    try {
      console.log('🗑️ Début du nettoyage des données démo...');
      
      // Scanner d'abord pour identifier
      const demoData = await this.scanAllDemoData();
      
      if (demoData.stats.totalDemoItems === 0) {
        console.log('✅ Aucune donnée démo trouvée');
        return {
          success: true,
          cleaned: 0,
          message: 'Aucune donnée de démonstration trouvée'
        };
      }

      // Créer un batch pour les suppressions
      const batch = writeBatch(db);
      let deletionCount = 0;

      // Supprimer les tâches démo
      for (const task of demoData.tasks) {
        batch.delete(doc(db, 'tasks', task.id));
        deletionCount++;
        console.log(`🗑️ Suppression tâche démo: ${task.title}`);
      }

      // Supprimer les projets démo
      for (const project of demoData.projects) {
        batch.delete(doc(db, 'projects', project.id));
        deletionCount++;
        console.log(`🗑️ Suppression projet démo: ${project.name}`);
      }

      // Supprimer les badges démo
      for (const badge of demoData.badges) {
        batch.delete(doc(db, 'user_badges', badge.id));
        deletionCount++;
        console.log(`🗑️ Suppression badge démo: ${badge.badgeId}`);
      }

      // Exécuter les suppressions
      await batch.commit();

      // Nettoyer les données utilisateur (supprimer les références aux données démo)
      await this.cleanUserReferences();

      console.log(`✅ Nettoyage terminé: ${deletionCount} éléments supprimés`);
      
      return {
        success: true,
        cleaned: deletionCount,
        details: demoData.stats,
        message: `${deletionCount} données de démonstration supprimées avec succès`
      };

    } catch (error) {
      console.error('❌ Erreur nettoyage données démo:', error);
      throw error;
    }
  }

  /**
   * 🧹 NETTOYER LES RÉFÉRENCES UTILISATEUR
   * Supprimer les références aux données démo dans les profils utilisateur
   */
  async cleanUserReferences() {
    try {
      console.log('🧹 Nettoyage des références utilisateur...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const updates = {};
        let needsUpdate = false;

        // Nettoyer les noms démo
        if (userData.displayName && this.demoPatterns.userNames.includes(userData.displayName)) {
          updates.displayName = this.generateCleanDisplayName(userData.email);
          needsUpdate = true;
        }

        // Nettoyer les biographies inappropriées
        if (userData.profile?.bio === 'Prout') {
          updates['profile.bio'] = 'Bienvenue sur Synergia !';
          needsUpdate = true;
        }

        // Réinitialiser les statistiques gonflées artificiellement
        if (userData.gamification?.tasksCompleted > 100) {
          updates['gamification.tasksCompleted'] = 0;
          updates['gamification.totalXp'] = 0;
          updates['gamification.level'] = 1;
          needsUpdate = true;
        }

        // Appliquer les mises à jour si nécessaire
        if (needsUpdate) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            ...updates,
            updatedAt: serverTimestamp()
          });
          console.log(`🧹 Utilisateur nettoyé: ${userDoc.id}`);
        }
      }

    } catch (error) {
      console.error('❌ Erreur nettoyage références:', error);
    }
  }

  /**
   * 🔍 VÉRIFIER SI UNE TÂCHE EST UNE DÉMO
   */
  isTaskDemo(task) {
    // Vérifier le titre
    if (this.demoPatterns.taskTitles.some(pattern => 
      task.title?.toLowerCase().includes(pattern.toLowerCase())
    )) {
      return true;
    }

    // Vérifier la description
    if (this.demoPatterns.descriptions.some(pattern => 
      task.description?.toLowerCase().includes(pattern.toLowerCase())
    )) {
      return true;
    }

    // Vérifier les tags
    if (task.tags?.some(tag => this.demoPatterns.tags.includes(tag.toLowerCase()))) {
      return true;
    }

    // Vérifier si assignée à trop d'utilisateurs (signe de données factices)
    if (task.assignedTo && task.assignedTo.length > 10) {
      return true;
    }

    // Vérifier si créée par le système (pas par un utilisateur)
    if (task.createdBy === 'system' || !task.createdBy) {
      return true;
    }

    return false;
  }

  /**
   * 🔍 VÉRIFIER SI UN PROJET EST UNE DÉMO
   */
  isProjectDemo(project) {
    const demoProjectNames = [
      'Projet de démonstration',
      'Test Project',
      'Demo Project',
      'Example Project',
      'Onboarding Project'
    ];

    return demoProjectNames.some(name => 
      project.name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * 🔍 VÉRIFIER SI UN UTILISATEUR EST UNE DÉMO
   */
  isUserDemo(user) {
    // Vérifier le nom
    if (this.demoPatterns.userNames.includes(user.displayName)) {
      return true;
    }

    // Vérifier l'email
    if (this.demoPatterns.emails.includes(user.email)) {
      return true;
    }

    return false;
  }

  /**
   * 🔍 VÉRIFIER SI UN BADGE EST UNE DÉMO
   */
  isBadgeDemo(badge) {
    // Les badges d'onboarding sont souvent des démos
    if (badge.badgeType === 'onboarding') {
      return true;
    }

    // Badges avec des noms démo
    if (badge.badgeId?.includes('demo_') || badge.badgeId?.includes('test_')) {
      return true;
    }

    return false;
  }

  /**
   * 🎯 GÉNÉRER UN NOM D'AFFICHAGE PROPRE
   */
  generateCleanDisplayName(email) {
    if (!email) return 'Utilisateur';
    
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  /**
   * 📊 GÉNÉRER UN RAPPORT DE NETTOYAGE
   */
  async generateCleaningReport() {
    try {
      const beforeScan = await this.scanAllDemoData();
      
      return {
        timestamp: new Date().toISOString(),
        beforeCleaning: beforeScan.stats,
        demoDataFound: {
          tasks: beforeScan.tasks.map(t => ({ id: t.id, title: t.title })),
          projects: beforeScan.projects.map(p => ({ id: p.id, name: p.name })),
          users: beforeScan.users.map(u => ({ id: u.id, email: u.email })),
          badges: beforeScan.badges.map(b => ({ id: b.id, badgeId: b.badgeId }))
        },
        recommendations: [
          '✅ Supprimer toutes les données de démonstration identifiées',
          '✅ Nettoyer les références utilisateur aux données démo',
          '✅ Réinitialiser les statistiques gonflées artificiellement',
          '✅ Vérifier que seules les vraies données utilisateur restent'
        ]
      };

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }
}

// ==========================================
// 🚀 FONCTIONS D'EXPORT POUR UTILISATION
// ==========================================

/**
 * 🧹 NETTOYER TOUTES LES DONNÉES DÉMO - FONCTION PRINCIPALE
 */
export const cleanAllDemoData = async () => {
  const cleaner = new DemoDataCleaner();
  return await cleaner.cleanAllDemoData();
};

/**
 * 🔍 SCANNER LES DONNÉES DÉMO SANS LES SUPPRIMER
 */
export const scanDemoData = async () => {
  const cleaner = new DemoDataCleaner();
  return await cleaner.scanAllDemoData();
};

/**
 * 📊 GÉNÉRER UN RAPPORT COMPLET
 */
export const generateDemoReport = async () => {
  const cleaner = new DemoDataCleaner();
  return await cleaner.generateCleaningReport();
};

// Export de la classe principale
export default DemoDataCleaner;
