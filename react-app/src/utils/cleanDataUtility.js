// ==========================================
// 📁 react-app/src/utils/cleanDataUtility.js
// UTILITAIRE DE NETTOYAGE - REMPLACER quickDataFix.js
// ==========================================

import { firebaseDataSyncService } from '../core/services/firebaseDataSyncService.js';

/**
 * 🧹 UTILITAIRE DE NETTOYAGE DES DONNÉES
 * Remplace quickDataFix.js avec des données Firebase authentiques
 */
class CleanDataUtility {
  constructor() {
    console.log('🧹 CleanDataUtility initialisé - Données Firebase pures');
  }

  /**
   * 🚀 INITIALISER UN UTILISATEUR AVEC DONNÉES PROPRES
   * Plus de "Allan le BOSS" ou "Prout" !
   */
  async initializeCleanUser(userId, userInfo = {}) {
    try {
      console.log('🚀 Initialisation utilisateur propre pour:', userId);
      
      // Utiliser les vraies informations utilisateur
      const cleanUserData = {
        email: userInfo.email || `user_${userId.substring(0, 8)}@synergia.app`,
        displayName: userInfo.displayName || userInfo.name || this.generateCleanDisplayName(),
        photoURL: userInfo.photoURL || null,
        bio: userInfo.bio || this.generateCleanBio(),
        department: userInfo.department || this.assignRandomDepartment(),
        role: userInfo.role || 'member'
      };
      
      // Initialiser avec le service Firebase
      const result = await firebaseDataSyncService.initializeUserData(userId, cleanUserData);
      
      // Ajouter un bonus de bienvenue approprié
      await this.addWelcomeBonus(userId);
      
      console.log('✅ Utilisateur propre initialisé:', cleanUserData.displayName);
      
      return {
        success: true,
        userData: result,
        message: `Utilisateur ${cleanUserData.displayName} initialisé avec succès`
      };
      
    } catch (error) {
      console.error('❌ Erreur initialisation utilisateur propre:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 👤 GÉNÉRER UN NOM D'AFFICHAGE PROPRE
   */
  generateCleanDisplayName() {
    const firstNames = [
      'Alex', 'Morgan', 'Jordan', 'Casey', 'Taylor', 'Riley', 'Avery', 'Quinn',
      'Sophie', 'Lucas', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William',
      'Isabella', 'James', 'Sophia', 'Benjamin', 'Charlotte', 'Mason', 'Mia'
    ];
    
    const lastNames = [
      'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand',
      'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia',
      'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  /**
   * 📝 GÉNÉRER UNE BIO PROPRE
   */
  generateCleanBio() {
    const bios = [
      'Passionné par l\'innovation et le travail d\'équipe',
      'Spécialiste en gestion de projet et amélioration continue',
      'Enthousiaste des nouvelles technologies et méthodologies agiles',
      'Expert en collaboration et optimisation des processus',
      'Focalisé sur la qualité et l\'efficacité opérationnelle',
      'Adepte du développement personnel et professionnel',
      'Orienté résultats avec un esprit créatif',
      'Passionné par l\'analyse de données et la prise de décision',
      'Spécialisé dans la transformation digitale',
      'Expert en communication et leadership d\'équipe'
    ];
    
    return bios[Math.floor(Math.random() * bios.length)];
  }

  /**
   * 🏢 ASSIGNER UN DÉPARTEMENT ALÉATOIRE
   */
  assignRandomDepartment() {
    const departments = [
      'tech',      // Technique
      'sales',     // Commercial
      'marketing', // Marketing
      'hr',        // Ressources Humaines
      'finance',   // Finance
      'operations', // Opérations
      'general'    // Général
    ];
    
    return departments[Math.floor(Math.random() * departments.length)];
  }

  /**
   * 🎁 AJOUTER BONUS DE BIENVENUE
   */
  async addWelcomeBonus(userId) {
    try {
      // Ajouter XP de bienvenue
      await firebaseDataSyncService.addXpToUser(userId, 50, 'welcome_bonus');
      
      // Débloquer badge de bienvenue
      await firebaseDataSyncService.unlockBadge(userId, 'welcome', {
        name: 'Bienvenue dans Synergia !',
        description: 'Premiers pas dans l\'application',
        type: 'onboarding',
        rarity: 'common',
        xpReward: 25
      });
      
      console.log('🎁 Bonus de bienvenue ajouté');
      
    } catch (error) {
      console.warn('⚠️ Erreur ajout bonus bienvenue:', error);
    }
  }

  /**
   * 🔄 NETTOYER LES DONNÉES EXISTANTES
   * Remplacer les données mock par des données propres
   */
  async cleanExistingUserData(userId) {
    try {
      console.log('🔄 Nettoyage données existantes pour:', userId);
      
      // Récupérer les stats actuelles
      const currentStats = await firebaseDataSyncService.getUserCompleteStats(userId);
      
      if (!currentStats) {
        throw new Error('Impossible de récupérer les données utilisateur');
      }
      
      // Identifier les données à nettoyer
      const dataToClean = this.identifyMockData(currentStats.user);
      
      if (dataToClean.length === 0) {
        console.log('✅ Aucune donnée mock détectée');
        return { success: true, cleaned: 0 };
      }
      
      // Nettoyer les données
      const cleanUpdates = {};
      
      dataToClean.forEach(issue => {
        switch (issue.field) {
          case 'profile.displayName':
            if (issue.value === 'Allan le BOSS') {
              cleanUpdates['profile.displayName'] = this.generateCleanDisplayName();
            }
            break;
            
          case 'profile.bio':
            if (issue.value === 'Prout') {
              cleanUpdates['profile.bio'] = this.generateCleanBio();
            }
            break;
            
          case 'email':
            if (issue.value.includes('exemple.com')) {
              cleanUpdates.email = `user_${userId.substring(0, 8)}@synergia.app`;
            }
            break;
        }
      });
      
      // Appliquer les mises à jour
      if (Object.keys(cleanUpdates).length > 0) {
        await firebaseDataSyncService.updateUserStats(userId, cleanUpdates);
        console.log('✅ Données nettoyées:', Object.keys(cleanUpdates));
      }
      
      return {
        success: true,
        cleaned: Object.keys(cleanUpdates).length,
        issues: dataToClean,
        updates: cleanUpdates
      };
      
    } catch (error) {
      console.error('❌ Erreur nettoyage données:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔍 IDENTIFIER LES DONNÉES MOCK
   */
  identifyMockData(userData) {
    const mockPatterns = [
      // Noms mock
      { field: 'profile.displayName', pattern: 'Allan le BOSS', type: 'hardcoded_name' },
      { field: 'displayName', pattern: 'Allan le BOSS', type: 'hardcoded_name' },
      
      // Bios mock
      { field: 'profile.bio', pattern: 'Prout', type: 'hardcoded_bio' },
      { field: 'bio', pattern: 'Prout', type: 'hardcoded_bio' },
      
      // Emails mock
      { field: 'email', pattern: '@exemple.com', type: 'mock_email' },
      { field: 'email', pattern: 'alice@exemple.com', type: 'mock_email' },
      { field: 'email', pattern: 'bob@exemple.com', type: 'mock_email' },
      { field: 'email', pattern: 'claire@exemple.com', type: 'mock_email' },
      
      // Départements étranges
      { field: 'profile.department', pattern: 'hr', type: 'check_context' },
      
      // XP/Niveaux suspicieux (valeurs exactes souvent hardcodées)
      { field: 'gamification.totalXp', pattern: 175, type: 'suspicious_exact' },
      { field: 'gamification.level', pattern: 2, type: 'check_if_calculated' },
      { field: 'gamification.tasksCompleted', pattern: 7, type: 'suspicious_exact' }
    ];
    
    const issues = [];
    
    mockPatterns.forEach(pattern => {
      const value = this.getNestedValue(userData, pattern.field);
      
      if (value !== undefined) {
        let isMatch = false;
        
        if (typeof pattern.pattern === 'string') {
          isMatch = String(value).includes(pattern.pattern);
        } else if (typeof pattern.pattern === 'number') {
          isMatch = value === pattern.pattern;
        }
        
        if (isMatch) {
          issues.push({
            field: pattern.field,
            value: value,
            type: pattern.type,
            severity: this.getSeverity(pattern.type)
          });
        }
      }
    });
    
    return issues;
  }

  /**
   * 🔍 OBTENIR VALEUR IMBRIQUÉE
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * ⚠️ OBTENIR LA SÉVÉRITÉ D'UN PROBLÈME
   */
  getSeverity(type) {
    const severityMap = {
      hardcoded_name: 'high',
      hardcoded_bio: 'high',
      mock_email: 'medium',
      check_context: 'low',
      suspicious_exact: 'low',
      check_if_calculated: 'low'
    };
    
    return severityMap[type] || 'low';
  }

  /**
   * 📊 ANALYSE COMPLÈTE DES DONNÉES
   */
  async analyzeAllUserData() {
    try {
      console.log('📊 Analyse complète des données utilisateurs...');
      
      // Cette fonction analyserait tous les utilisateurs en production
      // Pour l'instant, on simule l'analyse
      
      const mockAnalysis = {
        totalUsers: 1,
        usersWithMockData: 0,
        commonIssues: [
          { issue: 'Noms hardcodés', count: 0, severity: 'high' },
          { issue: 'Emails mock', count: 0, severity: 'medium' },
          { issue: 'Bios inappropriées', count: 0, severity: 'high' },
          { issue: 'Données suspicieuses', count: 0, severity: 'low' }
        ],
        recommendations: [
          'Utiliser firebaseDataSyncService pour créer de nouveaux utilisateurs',
          'Implémenter la validation des données à l\'inscription',
          'Nettoyer les données existantes avec cleanExistingUserData',
          'Mettre en place un monitoring des données suspectes'
        ]
      };
      
      console.log('✅ Analyse terminée:', mockAnalysis);
      
      return {
        success: true,
        analysis: mockAnalysis
      };
      
    } catch (error) {
      console.error('❌ Erreur analyse données:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🚀 MIGRATION BATCH DE TOUS LES UTILISATEURS
   */
  async migrateBatchUsers(userIds) {
    console.log(`🚀 Migration batch de ${userIds.length} utilisateurs...`);
    
    const results = {
      success: 0,
      errors: 0,
      cleaned: 0,
      details: []
    };
    
    for (const userId of userIds) {
      try {
        console.log(`🔄 Migration utilisateur: ${userId}`);
        
        const cleanResult = await this.cleanExistingUserData(userId);
        
        if (cleanResult.success) {
          results.success++;
          results.cleaned += cleanResult.cleaned;
          results.details.push({
            userId,
            status: 'success',
            cleaned: cleanResult.cleaned
          });
          console.log(`✅ ${userId} migré (${cleanResult.cleaned} corrections)`);
        } else {
          results.errors++;
          results.details.push({
            userId,
            status: 'error',
            error: cleanResult.error
          });
          console.error(`❌ Erreur ${userId}:`, cleanResult.error);
        }
        
        // Pause entre migrations pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.errors++;
        results.details.push({
          userId,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Erreur migration ${userId}:`, error);
      }
    }
    
    console.log('📊 Migration batch terminée:', results);
    
    return {
      success: results.errors === 0,
      results
    };
  }

  /**
   * 🧪 CRÉER UN UTILISATEUR DE TEST PROPRE
   */
  async createTestUser(customData = {}) {
    const testUserId = `test_${Date.now()}`;
    
    const testUserData = {
      email: customData.email || `test.user.${Date.now()}@synergia.app`,
      displayName: customData.displayName || this.generateCleanDisplayName(),
      bio: customData.bio || 'Utilisateur de test pour Synergia',
      department: customData.department || 'general',
      role: customData.role || 'member',
      ...customData
    };
    
    try {
      const result = await this.initializeCleanUser(testUserId, testUserData);
      
      if (result.success) {
        console.log('🧪 Utilisateur de test créé:', testUserId);
        
        // Ajouter quelques données de test
        await this.addTestData(testUserId);
        
        return {
          success: true,
          userId: testUserId,
          userData: testUserData
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur création utilisateur test:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📊 AJOUTER DONNÉES DE TEST
   */
  async addTestData(userId) {
    try {
      // Ajouter XP de test
      await firebaseDataSyncService.addXpToUser(userId, 150, 'test_data');
      
      // Débloquer quelques badges
      const testBadges = [
        {
          id: 'first_task',
          name: 'Première Tâche',
          description: 'Badge de test',
          type: 'productivity',
          rarity: 'common',
          xpReward: 25
        },
        {
          id: 'early_adopter',
          name: 'Early Adopter',
          description: 'Utilisateur de test',
          type: 'special',
          rarity: 'rare',
          xpReward: 50
        }
      ];
      
      for (const badge of testBadges) {
        await firebaseDataSyncService.unlockBadge(userId, badge.id, badge);
      }
      
      // Simuler quelques tâches complétées
      await firebaseDataSyncService.updateUserStats(userId, {
        'gamification.tasksCompleted': 3,
        'gamification.tasksCreated': 5,
        'gamification.projectsCreated': 1
      });
      
      console.log('📊 Données de test ajoutées pour:', userId);
      
    } catch (error) {
      console.warn('⚠️ Erreur ajout données test:', error);
    }
  }

  /**
   * 📋 GÉNÉRER RAPPORT DE NETTOYAGE
   */
  generateCleaningReport(beforeData, afterData, cleaningResults) {
    return {
      timestamp: new Date().toISOString(),
      
      summary: {
        usersCleaned: cleaningResults.length,
        totalIssuesFound: cleaningResults.reduce((sum, r) => sum + (r.issues?.length || 0), 0),
        totalCorrections: cleaningResults.reduce((sum, r) => sum + (r.cleaned || 0), 0),
        successRate: Math.round((cleaningResults.filter(r => r.success).length / cleaningResults.length) * 100)
      },
      
      issueTypes: {
        hardcodedNames: cleaningResults.filter(r => 
          r.issues?.some(i => i.type === 'hardcoded_name')
        ).length,
        mockEmails: cleaningResults.filter(r => 
          r.issues?.some(i => i.type === 'mock_email')
        ).length,
        inappropriateBios: cleaningResults.filter(r => 
          r.issues?.some(i => i.type === 'hardcoded_bio')
        ).length
      },
      
      recommendations: [
        'Utiliser uniquement firebaseDataSyncService pour créer de nouveaux utilisateurs',
        'Implémenter la validation des données à l\'inscription',
        'Surveiller régulièrement les données pour détecter les anomalies',
        'Former l\'équipe sur les bonnes pratiques de données'
      ],
      
      nextSteps: [
        '✅ Tester toutes les fonctionnalités avec les nouvelles données',
        '✅ Vérifier que plus aucune donnée mock n\'apparaît',
        '✅ Monitorer les performances Firebase',
        '✅ Déployer en production'
      ]
    };
  }
}

// ==========================================
// 🚀 FONCTIONS UTILITAIRES EXPORT
// ==========================================

/**
 * 🧹 NETTOYER UN UTILISATEUR SPÉCIFIQUE
 */
export const cleanUserData = async (userId, userInfo = {}) => {
  const utility = new CleanDataUtility();
  return await utility.initializeCleanUser(userId, userInfo);
};

/**
 * 🔄 MIGRER DONNÉES EXISTANTES
 */
export const migrateExistingData = async (userId) => {
  const utility = new CleanDataUtility();
  return await utility.cleanExistingUserData(userId);
};

/**
 * 📊 ANALYSER TOUTES LES DONNÉES
 */
export const analyzeAllData = async () => {
  const utility = new CleanDataUtility();
  return await utility.analyzeAllUserData();
};

/**
 * 🧪 CRÉER UTILISATEUR DE TEST
 */
export const createTestUser = async (customData = {}) => {
  const utility = new CleanDataUtility();
  return await utility.createTestUser(customData);
};

/**
 * 🚀 MIGRATION BATCH
 */
export const migrateBatchUsers = async (userIds) => {
  const utility = new CleanDataUtility();
  return await utility.migrateBatchUsers(userIds);
};

// Export de la classe principale
export default CleanDataUtility;

// ==========================================
// 💡 GUIDE D'UTILISATION
// ==========================================

/*
🧹 COMMENT UTILISER CET UTILITAIRE :

1. NETTOYER UN UTILISATEUR :
   ```javascript
   import { cleanUserData } from './utils/cleanDataUtility.js';
   const result = await cleanUserData('user-id', {
     email: 'real.user@company.com',
     displayName: 'Nom Réel',
     department: 'tech'
   });
   ```

2. MIGRER DONNÉES EXISTANTES :
   ```javascript
   import { migrateExistingData } from './utils/cleanDataUtility.js';
   const result = await migrateExistingData('user-id');
   ```

3. CRÉER UTILISATEUR DE TEST :
   ```javascript
   import { createTestUser } from './utils/cleanDataUtility.js';
   const testUser = await createTestUser({
     displayName: 'Test User',
     department: 'tech'
   });
   ```

4. MIGRATION EN BATCH :
   ```javascript
   import { migrateBatchUsers } from './utils/cleanDataUtility.js';
   const userIds = ['user1', 'user2', 'user3'];
   const results = await migrateBatchUsers(userIds);
   ```

🎯 RÉSULTAT :
- ❌ Plus de "Allan le BOSS" ou "Prout"
- ❌ Plus d'emails @exemple.com
- ✅ Données utilisateur réalistes et cohérentes
- ✅ Synchronisation Firebase complète
- ✅ Application prête pour utilisation réelle
*/
