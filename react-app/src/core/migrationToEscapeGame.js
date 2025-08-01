// ==========================================
// 📁 react-app/src/core/migrationToEscapeGame.js
// MIGRATION COMPLÈTE VERS LE SYSTÈME ESCAPE GAME
// ==========================================

import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import escapeGameIntegration from './escapeGameIntegration.js';
import { ESCAPE_GAME_ROLES } from './services/escapeGameRolesService.js';

/**
 * 🔄 SYSTÈME DE MIGRATION VERS ESCAPE GAME
 */
class EscapeGameMigration {
  constructor() {
    this.migrationVersion = '3.5.0';
    this.migrationDate = new Date();
    this.migratedUsers = new Set();
    
    console.log('🔄 EscapeGameMigration initialisé');
  }

  /**
   * 🚀 MIGRATION COMPLÈTE DE TOUS LES UTILISATEURS
   */
  async migrateAllUsers() {
    try {
      console.log('🚀 Début migration complète vers Escape Game...');
      
      const migrationResults = {
        totalUsers: 0,
        migratedUsers: 0,
        errors: [],
        skippedUsers: 0,
        migrationDetails: {}
      };

      // Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      migrationResults.totalUsers = usersSnapshot.size;
      
      console.log(`📊 ${migrationResults.totalUsers} utilisateurs à migrer`);

      // Migrer chaque utilisateur
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        try {
          console.log(`🔄 Migration utilisateur: ${userId}`);
          
          // Vérifier si déjà migré
          if (userData.profile?.escapeGameMigrated) {
            console.log(`⏭️ Utilisateur ${userId} déjà migré, passage au suivant`);
            migrationResults.skippedUsers++;
            continue;
          }

          // Effectuer la migration
          const userMigrationResult = await this.migrateUser(userId, userData);
          
          if (userMigrationResult.success) {
            migrationResults.migratedUsers++;
            migrationResults.migrationDetails[userId] = userMigrationResult;
            this.migratedUsers.add(userId);
            
            console.log(`✅ Migration réussie: ${userId}`);
          } else {
            migrationResults.errors.push({
              userId,
              error: userMigrationResult.error,
              details: userMigrationResult.details
            });
            
            console.log(`❌ Échec migration: ${userId} - ${userMigrationResult.error}`);
          }
          
          // Pause entre migrations pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Erreur migration ${userId}:`, error);
          migrationResults.errors.push({
            userId,
            error: error.message,
            details: 'Exception during migration'
          });
        }
      }

      // Sauvegarder le rapport de migration
      await this.saveMigrationReport(migrationResults);
      
      console.log('🎉 Migration complète terminée !');
      console.log(`✅ ${migrationResults.migratedUsers}/${migrationResults.totalUsers} utilisateurs migrés`);
      console.log(`⏭️ ${migrationResults.skippedUsers} utilisateurs déjà migrés`);
      console.log(`❌ ${migrationResults.errors.length} erreurs`);
      
      return migrationResults;
      
    } catch (error) {
      console.error('❌ Erreur migration globale:', error);
      throw error;
    }
  }

  /**
   * 👤 MIGRER UN UTILISATEUR SPÉCIFIQUE
   */
  async migrateUser(userId, userData = null) {
    try {
      console.log(`🔄 Migration individuelle: ${userId}`);
      
      const migrationResult = {
        success: false,
        userId,
        oldRoles: {},
        newRoles: {},
        migratedBadges: [],
        preservedData: {},
        error: null,
        details: {}
      };

      // Récupérer les données si non fournies
      if (!userData) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('Utilisateur non trouvé');
        }
        
        userData = userDoc.data();
      }

      // Sauvegarder les anciennes données
      migrationResult.oldRoles = userData.roles || {};
      migrationResult.preservedData = {
        profile: userData.profile || {},
        gamification: userData.gamification || {},
        stats: userData.stats || {}
      };

      // Mapper les anciens rôles vers les nouveaux
      const newRoles = this.mapOldRolesToEscapeGame(migrationResult.oldRoles);
      migrationResult.newRoles = newRoles;

      // Migrer les badges
      const migratedBadges = this.migrateBadges(userData.badges || []);
      migrationResult.migratedBadges = migratedBadges;

      // Calculer les statistiques migrées
      const migratedStats = this.calculateMigratedStats(userData);

      // Préparer les nouvelles données
      const newUserData = {
        ...userData,
        roles: newRoles,
        badges: migratedBadges,
        stats: {
          ...migrationResult.preservedData.stats,
          ...migratedStats
        },
        profile: {
          ...migrationResult.preservedData.profile,
          escapeGameMigrated: true,
          migrationVersion: this.migrationVersion,
          migrationDate: this.migrationDate,
          originalRoles: migrationResult.oldRoles
        }
      };

      // Sauvegarder en base
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, newUserData);

      // Déclencher l'intégration post-migration
      await this.postMigrationIntegration(userId, newRoles);

      migrationResult.success = true;
      migrationResult.details = {
        rolesConverted: Object.keys(newRoles).length,
        badgesMigrated: migratedBadges.length,
        totalXpPreserved: migratedStats.totalXp || 0
      };

      console.log(`✅ Migration ${userId} réussie:`, migrationResult.details);
      return migrationResult;
      
    } catch (error) {
      console.error(`❌ Erreur migration ${userId}:`, error);
      return {
        success: false,
        userId,
        error: error.message,
        details: 'Migration failed'
      };
    }
  }

  /**
   * 🗺️ MAPPER LES ANCIENS RÔLES VERS LES NOUVEAUX
   */
  mapOldRolesToEscapeGame(oldRoles) {
    console.log('🗺️ Mapping rôles vers Escape Game:', Object.keys(oldRoles));
    
    const roleMapping = {
      // Mapping direct (rôles qui existent déjà)
      'maintenance': 'maintenance',
      'reputation': 'reputation', 
      'stock': 'stock',
      'organization': 'organization',
      'content': 'content',
      'mentoring': 'mentoring',
      'partnerships': 'partnerships',
      'communication': 'communication',
      'b2b': 'b2b',
      
      // Mapping des anciens rôles vers les nouveaux
      'game_master': 'maintenance', // Game Master -> Maintenance (proche)
      'admin': 'organization',      // Admin -> Organisation
      'manager': 'organization',    // Manager -> Organisation
      'social_media': 'communication', // Social Media -> Communication
      'customer_service': 'reputation', // Service Client -> Réputation
      'logistics': 'stock',         // Logistique -> Stock
      'hr': 'organization',         // RH -> Organisation
      'marketing': 'communication', // Marketing -> Communication
      'sales': 'b2b',              // Ventes -> B2B
      'trainer': 'mentoring',      // Formateur -> Mentorat
      'designer': 'content'        // Designer -> Contenu
    };

    const newRoles = {};

    for (const [oldRoleId, oldRoleData] of Object.entries(oldRoles)) {
      const newRoleId = roleMapping[oldRoleId] || 'maintenance'; // Défaut vers maintenance
      const escapeRole = ESCAPE_GAME_ROLES[newRoleId.toUpperCase()];
      
      if (escapeRole) {
        // Calculer le niveau de maîtrise basé sur l'XP
        const xp = oldRoleData.xp || 0;
        const masteryLevel = this.calculateMasteryLevel(xp);
        
        newRoles[newRoleId] = {
          id: escapeRole.id,
          name: escapeRole.name,
          assignedAt: oldRoleData.assignedAt || new Date(),
          assignedBy: oldRoleData.assignedBy || 'migration',
          xp: xp,
          level: masteryLevel.id,
          tasksCompleted: oldRoleData.tasksCompleted || 0,
          badges: oldRoleData.badges || [],
          permissions: escapeRole.permissions,
          
          // Données de migration
          migrated: true,
          originalRole: oldRoleId,
          migrationDate: this.migrationDate
        };
        
        console.log(`🔀 ${oldRoleId} -> ${newRoleId} (${xp} XP, niveau ${masteryLevel.name})`);
      }
    }

    return newRoles;
  }

  /**
   * 🏷️ CALCULER LE NIVEAU DE MAÎTRISE
   */
  calculateMasteryLevel(xp) {
    if (xp < 250) return { id: 'debutant', name: 'Débutant' };
    if (xp < 750) return { id: 'novice', name: 'Novice' };
    if (xp < 1500) return { id: 'intermediaire', name: 'Intermédiaire' };
    if (xp < 3000) return { id: 'avance', name: 'Avancé' };
    return { id: 'expert', name: 'Expert' };
  }

  /**
   * 🏆 MIGRER LES BADGES
   */
  migrateBadges(oldBadges) {
    console.log('🏆 Migration badges:', oldBadges.length);
    
    const migratedBadges = [];

    for (const oldBadge of oldBadges) {
      // Conserver les badges existants avec mapping si nécessaire
      const newBadge = {
        ...oldBadge,
        migrated: true,
        originalId: oldBadge.id,
        migrationDate: this.migrationDate
      };

      // Mapper certains IDs de badges si nécessaire
      const badgeMapping = {
        'first_task': 'gen_001',
        'task_master': 'gen_006',
        'early_bird': 'gen_003',
        'team_player': 'gen_009'
      };

      if (badgeMapping[oldBadge.id]) {
        newBadge.id = badgeMapping[oldBadge.id];
      }

      migratedBadges.push(newBadge);
    }

    return migratedBadges;
  }

  /**
   * 📊 CALCULER LES STATISTIQUES MIGRÉES
   */
  calculateMigratedStats(userData) {
    const oldStats = userData.stats || {};
    const oldGamification = userData.gamification || {};
    
    return {
      // Préserver les anciennes stats
      ...oldStats,
      
      // Calculer les nouvelles métriques
      totalXp: oldGamification.totalXp || 0,
      totalTasks: oldGamification.tasksCompleted || 0,
      loginStreak: oldGamification.loginStreak || 0,
      level: oldGamification.level || 1,
      
      // Stats de migration
      migrationStats: {
        migratedAt: this.migrationDate,
        version: this.migrationVersion,
        preservedXp: oldGamification.totalXp || 0,
        preservedTasks: oldGamification.tasksCompleted || 0
      }
    };
  }

  /**
   * 🔗 INTÉGRATION POST-MIGRATION
   */
  async postMigrationIntegration(userId, newRoles) {
    try {
      console.log(`🔗 Intégration post-migration: ${userId}`);
      
      // Attendre un peu pour que les données soient bien sauvegardées
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Déclencher les événements pour chaque nouveau rôle
      for (const [roleId, roleData] of Object.entries(newRoles)) {
        // Simuler l'événement d'assignation
        window.dispatchEvent(new CustomEvent('roleAssigned', {
          detail: {
            userId,
            roleId,
            role: ESCAPE_GAME_ROLES[roleId.toUpperCase()],
            migration: true
          }
        }));
        
        // Attendre entre chaque événement
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Vérifier les badges après migration
      setTimeout(async () => {
        try {
          await escapeGameIntegration.checkAllUserBadges(userId, {
            trigger: 'post_migration',
            type: 'migration_completed'
          });
        } catch (error) {
          console.warn('⚠️ Erreur vérification badges post-migration:', error);
        }
      }, 1000);
      
      console.log(`✅ Intégration post-migration ${userId} terminée`);
      
    } catch (error) {
      console.warn(`⚠️ Erreur intégration post-migration ${userId}:`, error);
    }
  }

  /**
   * 📋 SAUVEGARDER LE RAPPORT DE MIGRATION
   */
  async saveMigrationReport(migrationResults) {
    try {
      const reportRef = doc(db, 'migrations', `escape_game_${this.migrationDate.getTime()}`);
      
      const report = {
        version: this.migrationVersion,
        date: this.migrationDate,
        results: migrationResults,
        summary: {
          successRate: Math.round((migrationResults.migratedUsers / migrationResults.totalUsers) * 100),
          totalErrors: migrationResults.errors.length,
          migratedUsers: Array.from(this.migratedUsers)
        }
      };
      
      await setDoc(reportRef, report);
      console.log('📋 Rapport de migration sauvegardé');
      
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde rapport:', error);
    }
  }

  /**
   * 🧪 TESTER LA MIGRATION SUR UN UTILISATEUR
   */
  async testMigration(userId) {
    console.log(`🧪 Test migration: ${userId}`);
    
    try {
      // Récupérer les données avant migration
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const beforeData = userDoc.data();
      console.log('📊 Données avant migration:', {
        roles: Object.keys(beforeData.roles || {}),
        badges: (beforeData.badges || []).length,
        xp: beforeData.gamification?.totalXp || 0
      });
      
      // Effectuer la migration
      const migrationResult = await this.migrateUser(userId, beforeData);
      
      if (migrationResult.success) {
        console.log('✅ Test migration réussi:', migrationResult.details);
      } else {
        console.log('❌ Test migration échoué:', migrationResult.error);
      }
      
      return migrationResult;
      
    } catch (error) {
      console.error('❌ Erreur test migration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 ROLLBACK D'UNE MIGRATION
   */
  async rollbackMigration(userId) {
    try {
      console.log(`🔄 Rollback migration: ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      
      if (!userData.profile?.escapeGameMigrated) {
        throw new Error('Utilisateur non migré, rollback impossible');
      }
      
      // Restaurer les données originales
      const originalRoles = userData.profile.originalRoles || {};
      
      const restoredData = {
        ...userData,
        roles: originalRoles,
        profile: {
          ...userData.profile,
          escapeGameMigrated: false,
          rolledBack: true,
          rollbackDate: new Date()
        }
      };
      
      await updateDoc(userRef, restoredData);
      console.log(`✅ Rollback ${userId} réussi`);
      
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Erreur rollback ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE MIGRATION
   */
  getMigrationStats() {
    return {
      version: this.migrationVersion,
      date: this.migrationDate,
      migratedUsers: this.migratedUsers.size,
      availableRoles: Object.keys(ESCAPE_GAME_ROLES).length,
      migrationMapping: {
        'game_master': 'maintenance',
        'admin': 'organization',
        'manager': 'organization',
        'social_media': 'communication',
        'customer_service': 'reputation',
        'logistics': 'stock',
        'hr': 'organization',
        'marketing': 'communication',
        'sales': 'b2b',
        'trainer': 'mentoring',
        'designer': 'content'
      }
    };
  }
}

// Instance singleton
const escapeGameMigration = new EscapeGameMigration();

// Exposition globale pour debug et tests
if (typeof window !== 'undefined') {
  window.escapeGameMigration = escapeGameMigration;
  
  // Fonctions de test rapide
  window.migrateAllUsers = () => escapeGameMigration.migrateAllUsers();
  window.testUserMigration = (userId) => escapeGameMigration.testMigration(userId);
  window.rollbackUserMigration = (userId) => escapeGameMigration.rollbackMigration(userId);
  window.getMigrationStats = () => escapeGameMigration.getMigrationStats();
  
  console.log('🔄 Système de migration Escape Game chargé !');
  console.log('🧪 Tests disponibles:');
  console.log('  • migrateAllUsers() - Migration complète');
  console.log('  • testUserMigration(userId) - Test sur un utilisateur');
  console.log('  • rollbackUserMigration(userId) - Annuler migration');
  console.log('  • getMigrationStats() - Statistiques migration');
}

// Exports
export default escapeGameMigration;
export { escapeGameMigration };

// Fonctions utilitaires exportées
export const migrateAllUsersToEscapeGame = () => escapeGameMigration.migrateAllUsers();
export const migrateUserToEscapeGame = (userId, userData) => escapeGameMigration.migrateUser(userId, userData);
export const testEscapeGameMigration = (userId) => escapeGameMigration.testMigration(userId);
export const rollbackEscapeGameMigration = (userId) => escapeGameMigration.rollbackMigration(userId);

console.log('🔄 Migration Escape Game prête !');
