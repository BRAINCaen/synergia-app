// ==========================================
// 📁 react-app/src/core/services/dataSyncService.js
// Service de synchronisation et réparation des données Firebase
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION DES DONNÉES
 * Corrige les incohérences entre les pages et Firebase
 */
class DataSyncService {
  constructor() {
    this.repairLog = [];
  }

  /**
   * 🔧 STRUCTURE STANDARDISÉE DES DONNÉES UTILISATEUR
   */
  getStandardUserStructure(authUser, existingData = {}) {
    return {
      // ✅ Données d'authentification (toujours présentes)
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Utilisateur',
      photoURL: authUser.photoURL || null,
      emailVerified: authUser.emailVerified || false,
      
      // ✅ Métadonnées temporelles
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      
      // ✅ Profil utilisateur standardisé
      profile: {
        displayName: existingData.profile?.displayName || authUser.displayName || authUser.email?.split('@')[0] || 'Utilisateur',
        bio: existingData.profile?.bio || '',
        department: existingData.profile?.department || 'Non défini',
        role: existingData.profile?.role || 'employee',
        phone: existingData.profile?.phone || '',
        preferences: {
          notifications: existingData.profile?.preferences?.notifications !== false,
          publicProfile: existingData.profile?.preferences?.publicProfile || false,
          emailUpdates: existingData.profile?.preferences?.emailUpdates !== false,
          theme: existingData.profile?.preferences?.theme || 'light'
        }
      },
      
      // ✅ Gamification standardisée (STRUCTURE UNIFIÉE)
      gamification: {
        // XP et niveaux
        totalXp: existingData.gamification?.totalXp || 0,
        weeklyXp: existingData.gamification?.weeklyXp || 0,
        monthlyXp: existingData.gamification?.monthlyXp || 0,
        level: existingData.gamification?.level || 1,
        
        // Statistiques de tâches
        tasksCompleted: existingData.gamification?.tasksCompleted || 0,
        tasksCreated: existingData.gamification?.tasksCreated || 0,
        projectsCreated: existingData.gamification?.projectsCreated || 0,
        projectsCompleted: existingData.gamification?.projectsCompleted || 0,
        
        // Badges et récompenses
        badges: existingData.gamification?.badges || [],
        badgesUnlocked: existingData.gamification?.badgesUnlocked || 0,
        achievements: existingData.gamification?.achievements || [],
        
        // Engagement et streaks
        loginStreak: existingData.gamification?.loginStreak || 1,
        currentStreak: existingData.gamification?.currentStreak || 0,
        maxStreak: existingData.gamification?.maxStreak || 0,
        lastLoginDate: existingData.gamification?.lastLoginDate || new Date().toISOString().split('T')[0],
        
        // Historique
        xpHistory: existingData.gamification?.xpHistory || [],
        levelHistory: existingData.gamification?.levelHistory || []
      }
    };
  }

  /**
   * 🔍 DIAGNOSTIC DES INCOHÉRENCES
   */
  async diagnoseDataInconsistencies(userId) {
    try {
      console.log('🔍 Diagnostic des incohérences pour:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return {
          status: 'missing_user',
          issues: ['Utilisateur inexistant dans Firebase'],
          severity: 'critical'
        };
      }
      
      const userData = userSnap.data();
      const issues = [];
      let severity = 'none';
      
      // ❌ Vérifier la structure de gamification
      if (!userData.gamification) {
        issues.push('Structure gamification manquante');
        severity = 'critical';
      } else {
        // Vérifier les champs essentiels
        const requiredGamificationFields = [
          'totalXp', 'level', 'tasksCompleted', 'badges'
        ];
        
        requiredGamificationFields.forEach(field => {
          if (userData.gamification[field] === undefined) {
            issues.push(`Champ gamification.${field} manquant`);
            severity = severity === 'none' ? 'warning' : severity;
          }
        });
        
        // Vérifier la cohérence XP/Level
        const expectedLevel = Math.floor((userData.gamification.totalXp || 0) / 100) + 1;
        if (userData.gamification.level !== expectedLevel) {
          issues.push(`Incohérence level (${userData.gamification.level}) vs XP (${userData.gamification.totalXp})`);
          severity = 'moderate';
        }
      }
      
      // ❌ Vérifier la structure de profil
      if (!userData.profile) {
        issues.push('Structure profile manquante');
        severity = severity === 'critical' ? 'critical' : 'moderate';
      }
      
      // ❌ Vérifier les métadonnées
      if (!userData.updatedAt) {
        issues.push('Métadonnée updatedAt manquante');
        severity = severity === 'none' ? 'warning' : severity;
      }
      
      return {
        status: issues.length > 0 ? 'inconsistent' : 'healthy',
        issues,
        severity,
        userData
      };
      
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      return {
        status: 'error',
        issues: [`Erreur diagnostic: ${error.message}`],
        severity: 'critical'
      };
    }
  }

  /**
   * 🛠️ RÉPARATION AUTOMATIQUE DES DONNÉES
   */
  async repairUserData(userId, authUser) {
    try {
      console.log('🛠️ Réparation des données pour:', userId);
      
      const diagnostic = await this.diagnoseDataInconsistencies(userId);
      
      if (diagnostic.status === 'healthy') {
        console.log('✅ Aucune réparation nécessaire');
        return { success: true, message: 'Données déjà cohérentes' };
      }
      
      // Obtenir les données existantes
      const existingData = diagnostic.userData || {};
      
      // Créer la structure standardisée
      const standardData = this.getStandardUserStructure(authUser, existingData);
      
      // Sauvegarder les données réparées
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, standardData, { merge: true });
      
      // Log des réparations
      const repairSummary = {
        userId,
        timestamp: new Date().toISOString(),
        issuesFixed: diagnostic.issues,
        severity: diagnostic.severity
      };
      
      this.repairLog.push(repairSummary);
      
      console.log('✅ Données réparées avec succès:', repairSummary);
      
      return {
        success: true,
        message: `${diagnostic.issues.length} problème(s) corrigé(s)`,
        details: repairSummary
      };
      
    } catch (error) {
      console.error('❌ Erreur réparation:', error);
      return {
        success: false,
        message: `Erreur lors de la réparation: ${error.message}`
      };
    }
  }

  /**
   * 🔄 SYNCHRONISATION GLOBALE DE TOUS LES UTILISATEURS
   */
  async syncAllUsers() {
    try {
      console.log('🔄 Synchronisation globale démarrée...');
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const batch = writeBatch(db);
      let repairCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        // Simuler un authUser pour la réparation
        const mockAuthUser = {
          uid: userId,
          email: userData.email || 'user@example.com',
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          photoURL: userData.photoURL || null,
          emailVerified: userData.emailVerified || false
        };
        
        const diagnostic = await this.diagnoseDataInconsistencies(userId);
        
        if (diagnostic.status !== 'healthy') {
          const standardData = this.getStandardUserStructure(mockAuthUser, userData);
          batch.set(doc(db, 'users', userId), standardData, { merge: true });
          repairCount++;
          
          console.log(`🔧 Réparation programmée pour ${userId}: ${diagnostic.issues.length} problème(s)`);
        }
      }
      
      // Exécuter toutes les réparations en lot
      if (repairCount > 0) {
        await batch.commit();
        console.log(`✅ Synchronisation terminée: ${repairCount} utilisateurs réparés`);
      } else {
        console.log('✅ Aucune réparation nécessaire - Tous les utilisateurs sont synchronisés');
      }
      
      return {
        success: true,
        totalUsers: usersSnapshot.size,
        repairedUsers: repairCount,
        message: `Synchronisation terminée: ${repairCount}/${usersSnapshot.size} utilisateurs réparés`
      };
      
    } catch (error) {
      console.error('❌ Erreur synchronisation globale:', error);
      return {
        success: false,
        message: `Erreur synchronisation: ${error.message}`
      };
    }
  }

  /**
   * 📊 VALIDATION DES DONNÉES EN TEMPS RÉEL
   */
  async validateUserSession(userId, authUser) {
    try {
      console.log('📊 Validation session utilisateur:', userId);
      
      // Diagnostic rapide
      const diagnostic = await this.diagnoseDataInconsistencies(userId);
      
      // Si des problèmes sont détectés, réparation automatique
      if (diagnostic.status !== 'healthy') {
        console.log('⚠️ Incohérences détectées, réparation automatique...');
        const repairResult = await this.repairUserData(userId, authUser);
        
        if (repairResult.success) {
          console.log('✅ Session validée et données réparées');
          return { 
            valid: true, 
            repaired: true, 
            message: 'Données réparées automatiquement' 
          };
        } else {
          console.error('❌ Échec de la réparation automatique');
          return { 
            valid: false, 
            repaired: false, 
            message: 'Échec de la réparation des données' 
          };
        }
      }
      
      console.log('✅ Session validée - Données cohérentes');
      return { 
        valid: true, 
        repaired: false, 
        message: 'Données déjà cohérentes' 
      };
      
    } catch (error) {
      console.error('❌ Erreur validation session:', error);
      return { 
        valid: false, 
        repaired: false, 
        message: `Erreur validation: ${error.message}` 
      };
    }
  }

  /**
   * 📈 RECALCUL DES STATISTIQUES GAMIFICATION
   */
  async recalculateGamificationStats(userId) {
    try {
      console.log('📈 Recalcul statistiques gamification pour:', userId);
      
      // Récupérer toutes les tâches de l'utilisateur
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      let tasksCreated = 0;
      let tasksCompleted = 0;
      let totalXpFromTasks = 0;
      
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        tasksCreated++;
        
        if (taskData.status === 'completed') {
          tasksCompleted++;
          totalXpFromTasks += taskData.xpReward || 0;
        }
      });
      
      // Récupérer les projets de l'utilisateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', userId)
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      let projectsCreated = projectsSnapshot.size;
      let projectsCompleted = 0;
      
      projectsSnapshot.forEach(doc => {
        const projectData = doc.data();
        if (projectData.status === 'completed') {
          projectsCompleted++;
        }
      });
      
      // Calculer le niveau basé sur l'XP
      const calculatedLevel = Math.floor(totalXpFromTasks / 100) + 1;
      
      // Mettre à jour les statistiques
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.tasksCreated': tasksCreated,
        'gamification.tasksCompleted': tasksCompleted,
        'gamification.projectsCreated': projectsCreated,
        'gamification.projectsCompleted': projectsCompleted,
        'gamification.totalXp': totalXpFromTasks,
        'gamification.level': calculatedLevel,
        'gamification.badgesUnlocked': 0, // Sera recalculé par le badge engine
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Statistiques recalculées:', {
        tasksCreated,
        tasksCompleted,
        projectsCreated,
        projectsCompleted,
        totalXp: totalXpFromTasks,
        level: calculatedLevel
      });
      
      return {
        success: true,
        stats: {
          tasksCreated,
          tasksCompleted,
          projectsCreated,
          projectsCompleted,
          totalXp: totalXpFromTasks,
          level: calculatedLevel
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur recalcul statistiques:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 📋 RAPPORT DE SANTÉ DES DONNÉES
   */
  async generateHealthReport() {
    try {
      console.log('📋 Génération rapport de santé des données...');
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const report = {
        totalUsers: usersSnapshot.size,
        healthyUsers: 0,
        usersWithIssues: 0,
        criticalIssues: 0,
        moderateIssues: 0,
        warnings: 0,
        detailedIssues: []
      };
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const diagnostic = await this.diagnoseDataInconsistencies(userId);
        
        if (diagnostic.status === 'healthy') {
          report.healthyUsers++;
        } else {
          report.usersWithIssues++;
          
          if (diagnostic.severity === 'critical') {
            report.criticalIssues++;
          } else if (diagnostic.severity === 'moderate') {
            report.moderateIssues++;
          } else {
            report.warnings++;
          }
          
          report.detailedIssues.push({
            userId,
            severity: diagnostic.severity,
            issues: diagnostic.issues
          });
        }
      }
      
      console.log('📊 Rapport de santé généré:', report);
      return report;
      
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      return {
        error: error.message,
        totalUsers: 0,
        healthyUsers: 0,
        usersWithIssues: 0
      };
    }
  }
}

// Instance singleton
const dataSyncService = new DataSyncService();

export default dataSyncService;

// Fonctions utilitaires exportées
export const { 
  diagnoseDataInconsistencies,
  repairUserData,
  syncAllUsers,
  validateUserSession,
  recalculateGamificationStats,
  generateHealthReport
} = dataSyncService;
