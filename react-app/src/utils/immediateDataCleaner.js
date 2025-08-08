// ==========================================
// 📁 react-app/src/utils/immediateDataCleaner.js
// SCRIPT DE NETTOYAGE IMMÉDIAT DES DONNÉES DÉMO
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
  updateDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🧹 NETTOYEUR IMMÉDIAT DE DONNÉES DÉMO
 * Fonction simple et directe pour supprimer toutes les données de démonstration
 */
class ImmediateDataCleaner {
  
  /**
   * 🗑️ SUPPRIMER TOUTES LES TÂCHES DÉMO IDENTIFIÉES
   */
  static async cleanDemoTasks() {
    try {
      console.log('🧹 Nettoyage des tâches démo...');
      
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const batch = writeBatch(db);
      let deletedCount = 0;

      tasksSnapshot.forEach(taskDoc => {
        const task = taskDoc.data();
        
        // Vérifier si c'est une tâche démo
        const isDemoTask = (
          // Tâches avec titres spécifiques
          task.title?.includes('Gagner votre premier badge') ||
          task.title?.includes('Compléter votre profil') ||
          task.title?.includes('Découvrir le tableau de bord') ||
          task.title?.includes('Bienvenue dans Synergia') ||
          task.title?.includes('Découvrir l\'interface') ||
          task.title?.includes('Explorer le système') ||
          task.title?.includes('première tâche') ||
          task.title?.includes('onboarding') ||
          
          // Tâches avec descriptions démo
          task.description?.includes('Complétez des tâches pour débloquer') ||
          task.description?.includes('Ajoutez vos informations personnelles') ||
          task.description?.includes('Explorez votre tableau de bord') ||
          task.description?.includes('débloquer des badges') ||
          task.description?.includes('système de progression') ||
          
          // Tâches avec tags démo
          task.tags?.includes('onboarding') ||
          task.tags?.includes('formation') ||
          task.tags?.includes('gamification') ||
          task.tags?.includes('welcome') ||
          
          // Tâches assignées à trop d'utilisateurs (signe de données factices)
          (task.assignedTo && task.assignedTo.length > 10) ||
          
          // Tâches créées par le système
          task.createdBy === 'system' ||
          !task.createdBy
        );

        if (isDemoTask) {
          console.log(`🗑️ Suppression tâche démo: "${task.title}"`);
          batch.delete(doc(db, 'tasks', taskDoc.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ ${deletedCount} tâches démo supprimées`);
      } else {
        console.log('✅ Aucune tâche démo trouvée');
      }

      return { success: true, deletedTasks: deletedCount };

    } catch (error) {
      console.error('❌ Erreur suppression tâches démo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 NETTOYER LES DONNÉES UTILISATEUR INAPPROPRIÉES
   */
  static async cleanUserData() {
    try {
      console.log('🧹 Nettoyage des données utilisateur...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let cleanedCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const updates = {};
        let needsUpdate = false;

        // Nettoyer les noms inappropriés
        if (userData.displayName === 'Allan le BOSS') {
          updates.displayName = this.generateCleanName(userData.email);
          needsUpdate = true;
          console.log(`🧹 Nom nettoyé: ${userData.email}`);
        }

        // Nettoyer les biographies inappropriées  
        if (userData.profile?.bio === 'Prout') {
          updates['profile.bio'] = 'Bienvenue sur Synergia !';
          needsUpdate = true;
          console.log(`🧹 Bio nettoyée: ${userData.email}`);
        }

        // Nettoyer les statistiques gonflées
        if (userData.gamification?.tasksCompleted > 100) {
          updates['gamification.tasksCompleted'] = 0;
          updates['gamification.totalXp'] = 0;
          updates['gamification.level'] = 1;
          needsUpdate = true;
          console.log(`🧹 Stats réinitialisées: ${userData.email}`);
        }

        // Appliquer les mises à jour
        if (needsUpdate) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            ...updates,
            updatedAt: serverTimestamp()
          });
          cleanedCount++;
        }
      }

      console.log(`✅ ${cleanedCount} utilisateurs nettoyés`);
      return { success: true, cleanedUsers: cleanedCount };

    } catch (error) {
      console.error('❌ Erreur nettoyage utilisateurs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ SUPPRIMER LES BADGES DÉMO
   */
  static async cleanDemoBadges() {
    try {
      console.log('🧹 Nettoyage des badges démo...');
      
      const badgesSnapshot = await getDocs(collection(db, 'user_badges'));
      const batch = writeBatch(db);
      let deletedCount = 0;

      badgesSnapshot.forEach(badgeDoc => {
        const badge = badgeDoc.data();
        
        // Supprimer les badges d'onboarding automatiques
        if (badge.badgeType === 'onboarding' || 
            badge.badgeId?.includes('first_') ||
            badge.source === 'system') {
          console.log(`🗑️ Suppression badge démo: ${badge.badgeId}`);
          batch.delete(doc(db, 'user_badges', badgeDoc.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ ${deletedCount} badges démo supprimés`);
      } else {
        console.log('✅ Aucun badge démo trouvé');
      }

      return { success: true, deletedBadges: deletedCount };

    } catch (error) {
      console.error('❌ Erreur suppression badges démo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎯 GÉNÉRER UN NOM PROPRE À PARTIR DE L'EMAIL
   */
  static generateCleanName(email) {
    if (!email) return 'Utilisateur';
    
    const namePart = email.split('@')[0];
    // Capitaliser la première lettre
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  /**
   * 🚀 NETTOYAGE COMPLET - FONCTION PRINCIPALE
   */
  static async executeFullClean() {
    try {
      console.log('🚀 Début du nettoyage complet des données démo...');
      
      const results = {
        tasks: await this.cleanDemoTasks(),
        users: await this.cleanUserData(),
        badges: await this.cleanDemoBadges(),
        timestamp: new Date().toISOString()
      };

      const totalCleaned = (results.tasks.deletedTasks || 0) + 
                          (results.users.cleanedUsers || 0) + 
                          (results.badges.deletedBadges || 0);

      console.log('🎉 Nettoyage terminé !');
      console.log(`📊 Résumé: ${totalCleaned} éléments traités`);
      console.log('✅ Tâches démo supprimées:', results.tasks.deletedTasks || 0);
      console.log('✅ Utilisateurs nettoyés:', results.users.cleanedUsers || 0);  
      console.log('✅ Badges démo supprimés:', results.badges.deletedBadges || 0);

      return {
        success: true,
        totalCleaned,
        details: results,
        message: `Nettoyage réussi ! ${totalCleaned} éléments traités.`
      };

    } catch (error) {
      console.error('❌ Erreur nettoyage complet:', error);
      return {
        success: false,
        error: error.message,
        message: 'Erreur lors du nettoyage des données.'
      };
    }
  }
}

// ==========================================
// 🚀 FONCTIONS D'EXPORT POUR UTILISATION DIRECTE
// ==========================================

/**
 * 🧹 NETTOYER TOUTES LES DONNÉES DÉMO - UTILISATION SIMPLE
 * Appelez cette fonction pour nettoyer immédiatement
 */
export const cleanAllDemoDataNow = async () => {
  return await ImmediateDataCleaner.executeFullClean();
};

/**
 * 🗑️ NETTOYER SEULEMENT LES TÂCHES DÉMO
 */
export const cleanDemoTasksOnly = async () => {
  return await ImmediateDataCleaner.cleanDemoTasks();
};

/**
 * 👤 NETTOYER SEULEMENT LES DONNÉES UTILISATEUR
 */
export const cleanUserDataOnly = async () => {
  return await ImmediateDataCleaner.cleanUserData();
};

/**
 * 🏆 NETTOYER SEULEMENT LES BADGES DÉMO
 */
export const cleanDemoBadgesOnly = async () => {
  return await ImmediateDataCleaner.cleanDemoBadges();
};

// Export par défaut
export default ImmediateDataCleaner;
