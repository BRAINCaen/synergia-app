// ==========================================
// 📁 react-app/src/core/services/firebaseDataSyncService.js
// SERVICE DE SYNCHRONISATION FIREBASE COMPLET
// Remplace TOUTES les données mock par de vraies données Firebase
// ==========================================

import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { calculateLevel } from './levelService.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION FIREBASE COMPLET
 * Assure la cohérence de TOUTES les données à travers l'application
 */
class FirebaseDataSyncService {
  constructor() {
    this.listeners = new Map();
    this.userCache = new Map();
    this.isInitialized = false;
    
    console.log('🔄 FirebaseDataSyncService initialisé');
  }

  /**
   * 🚀 INITIALISATION GLOBALE
   * Créer la structure de données complète pour l'utilisateur
   */
  async initializeUserData(userId, userInfo = {}) {
    try {
      console.log('🚀 Initialisation données complètes pour:', userId);
      
      // 1. Vérifier si l'utilisateur existe déjà
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ Utilisateur existant - Validation des données');
        const existingData = userSnap.data();
        
        // Valider et corriger les données existantes
        const correctedData = await this.validateAndCorrectUserData(existingData, userId, userInfo);
        
        // Mettre à jour si nécessaire
        if (JSON.stringify(correctedData) !== JSON.stringify(existingData)) {
          await updateDoc(userRef, correctedData);
          console.log('✅ Données utilisateur corrigées');
        }
        
        return correctedData;
      }
      
      // 2. Créer un nouvel utilisateur avec structure complète
      const completeUserData = this.createCompleteUserStructure(userId, userInfo);
      await setDoc(userRef, completeUserData);
      
      // 3. Créer les sous-collections nécessaires
      await this.createUserSubCollections(userId);
      
      console.log('✅ Données utilisateur complètes créées');
      return completeUserData;
      
    } catch (error) {
      console.error('❌ Erreur initialisation utilisateur:', error);
      throw error;
    }
  }

  /**
   * 📋 STRUCTURE COMPLÈTE UTILISATEUR
   * Structure unifiée pour tous les utilisateurs
   */
  createCompleteUserStructure(userId, userInfo = {}) {
    const now = new Date().toISOString();
    
    return {
      // Métadonnées
      uid: userId,
      email: userInfo.email || `user_${userId}@synergia.local`,
      displayName: userInfo.displayName || userInfo.name || 'Utilisateur',
      photoURL: userInfo.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      
      // Profil
      profile: {
        displayName: userInfo.displayName || userInfo.name || 'Utilisateur',
        bio: userInfo.bio || 'Membre de l\'équipe Synergia',
        department: userInfo.department || 'general',
        role: userInfo.role || 'member',
        timezone: 'Europe/Paris',
        language: 'fr',
        preferences: {
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            inApp: true
          },
          privacy: {
            profileVisible: true,
            activityVisible: true
          }
        }
      },
      
      // Gamification RÉELLE (pas de mock)
      gamification: {
        // XP et niveaux
        totalXp: 0,
        weeklyXp: 0,
        monthlyXp: 0,
        level: 1,
        currentLevelXp: 0,
        nextLevelXpRequired: 100,
        
        // Statistiques d'activité
        tasksCompleted: 0,
        tasksCreated: 0,
        projectsCreated: 0,
        projectsCompleted: 0,
        commentsPosted: 0,
        collaborations: 0,
        
        // Badges et achievements
        badges: [],
        achievements: [],
        badgesUnlocked: 0,
        totalBadgeXp: 0,
        
        // Streaks et engagement
        loginStreak: 1,
        currentStreak: 1,
        maxStreak: 1,
        lastLoginDate: now.split('T')[0],
        lastActivityDate: now,
        
        // Historique
        xpHistory: [],
        levelUpHistory: [],
        
        // Métriques calculées
        completionRate: 0,
        averageTaskXp: 0,
        productivity: 'starting',
        weeklyProgress: 0,
        monthlyProgress: 0
      },
      
      // Statistiques d'équipe
      teamStats: {
        teamsJoined: 0,
        leadershipRoles: 0,
        mentorships: 0,
        collaborationScore: 0,
        helpfulness: 0,
        communicationRating: 0
      },
      
      // Préférences système
      systemSettings: {
        dashboardLayout: 'default',
        sidebarCollapsed: false,
        notificationSound: true,
        autoSave: true,
        darkMode: true
      },
      
      // Métadonnées de synchronisation
      syncMetadata: {
        lastSyncAt: serverTimestamp(),
        syncVersion: '1.0',
        dataVersion: '3.5',
        needsSync: false
      }
    };
  }

  /**
   * 🔧 VALIDATION ET CORRECTION DES DONNÉES
   * S'assure que les données existantes sont cohérentes
   */
  async validateAndCorrectUserData(existingData, userId, userInfo = {}) {
    const correctedData = { ...existingData };
    let hasChanges = false;
    
    // 1. Vérifier la structure gamification
    if (!correctedData.gamification || typeof correctedData.gamification !== 'object') {
      correctedData.gamification = this.createCompleteUserStructure(userId, userInfo).gamification;
      hasChanges = true;
      console.log('🔧 Structure gamification corrigée');
    }
    
    // 2. Vérifier les champs obligatoires de gamification
    const requiredGamificationFields = [
      'totalXp', 'level', 'tasksCompleted', 'badges', 'loginStreak'
    ];
    
    for (const field of requiredGamificationFields) {
      if (correctedData.gamification[field] === undefined || correctedData.gamification[field] === null) {
        switch (field) {
          case 'totalXp':
          case 'level':
          case 'tasksCompleted':
          case 'loginStreak':
            correctedData.gamification[field] = field === 'level' || field === 'loginStreak' ? 1 : 0;
            break;
          case 'badges':
            correctedData.gamification[field] = [];
            break;
        }
        hasChanges = true;
        console.log(`🔧 Champ gamification ${field} corrigé`);
      }
    }
    
    // 3. Vérifier la cohérence des niveaux (nouveau système calibré)
    const expectedLevel = calculateLevel(correctedData.gamification.totalXp);
    if (correctedData.gamification.level !== expectedLevel) {
      correctedData.gamification.level = expectedLevel;
      hasChanges = true;
      console.log('🔧 Niveau utilisateur recalculé:', expectedLevel);
    }
    
    // 4. Vérifier la structure profil
    if (!correctedData.profile) {
      correctedData.profile = this.createCompleteUserStructure(userId, userInfo).profile;
      hasChanges = true;
      console.log('🔧 Structure profil créée');
    }
    
    // 5. Mettre à jour les timestamps
    correctedData.updatedAt = serverTimestamp();
    correctedData.syncMetadata = {
      ...correctedData.syncMetadata,
      lastSyncAt: serverTimestamp(),
      syncVersion: '1.0',
      needsSync: false
    };
    
    if (hasChanges) {
      console.log('✅ Données utilisateur validées et corrigées');
    }
    
    return correctedData;
  }

  /**
   * 📂 CRÉER LES SOUS-COLLECTIONS UTILISATEUR
   * Tâches, projets, notifications, etc.
   */
  async createUserSubCollections(userId) {
    try {
      // 1. Créer une tâche d'accueil
      const welcomeTaskRef = doc(collection(db, 'tasks'));
      await setDoc(welcomeTaskRef, {
        title: '🎉 Bienvenue dans Synergia !',
        description: 'Explorez votre nouveau tableau de bord et découvrez toutes les fonctionnalités.',
        status: 'todo',
        priority: 'normal',
        complexity: 'easy',
        xpReward: 25,
        userId: userId,
        createdBy: userId,
        assignedTo: userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        tags: ['onboarding', 'welcome'],
        isWelcomeTask: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // 2. Créer un projet d'exemple
      const welcomeProjectRef = doc(collection(db, 'projects'));
      await setDoc(welcomeProjectRef, {
        title: '🚀 Mon Premier Projet',
        description: 'Projet d\'exemple pour vous familiariser avec Synergia',
        status: 'active',
        priority: 'normal',
        userId: userId,
        createdBy: userId,
        members: [userId],
        progress: 25,
        totalTasks: 4,
        completedTasks: 1,
        tags: ['exemple', 'apprentissage'],
        color: 'blue',
        icon: '🎯',
        isWelcomeProject: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // 3. Créer des tâches liées au projet
      const projectTasks = [
        {
          title: '📋 Découvrir le tableau de bord',
          description: 'Explorez votre tableau de bord personnel',
          status: 'completed',
          xpReward: 20
        },
        {
          title: '✅ Compléter votre profil',
          description: 'Ajoutez vos informations personnelles',
          status: 'todo',
          xpReward: 30
        },
        {
          title: '🏆 Gagner votre premier badge',
          description: 'Complétez des tâches pour débloquer des badges',
          status: 'todo',
          xpReward: 50
        }
      ];
      
      for (const taskData of projectTasks) {
        const taskRef = doc(collection(db, 'tasks'));
        await setDoc(taskRef, {
          ...taskData,
          userId: userId,
          createdBy: userId,
          assignedTo: userId,
          projectId: welcomeProjectRef.id,
          priority: 'normal',
          complexity: 'easy',
          tags: ['onboarding'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('✅ Sous-collections utilisateur créées');
      
    } catch (error) {
      console.error('❌ Erreur création sous-collections:', error);
    }
  }

  /**
   * 📊 SYNCHRONISER LES DONNÉES TEMPS RÉEL
   * Écoute les changements et met à jour le cache
   */
  async subscribeToUserData(userId, callback) {
    // Désabonner l'ancien listener s'il existe
    if (this.listeners.has(userId)) {
      this.listeners.get(userId)();
    }
    
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        // Mettre à jour le cache
        this.userCache.set(userId, userData);
        
        // Notifier les composants
        if (callback) {
          callback(userData);
        }
        
        console.log('📡 Données utilisateur synchronisées:', {
          level: userData.gamification?.level,
          totalXp: userData.gamification?.totalXp,
          tasksCompleted: userData.gamification?.tasksCompleted
        });
      }
    }, (error) => {
      console.error('❌ Erreur synchronisation temps réel:', error);
    });
    
    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * 🎯 METTRE À JOUR LES STATISTIQUES UTILISATEUR
   * Met à jour les statistiques après chaque action
   */
  async updateUserStats(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Préparer les mises à jour
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        'syncMetadata.lastSyncAt': serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      console.log('📊 Statistiques utilisateur mises à jour:', Object.keys(updates));
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statistiques:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 AJOUTER XP ET VÉRIFIER LEVEL UP
   */
  async addXpToUser(userId, xpAmount, source = 'action') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      const currentXp = userData.gamification?.totalXp || 0;
      const currentLevel = userData.gamification?.level || 1;
      const newTotalXp = currentXp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      
      // Préparer les mises à jour
      const updates = {
        'gamification.totalXp': newTotalXp,
        'gamification.weeklyXp': (userData.gamification?.weeklyXp || 0) + xpAmount,
        'gamification.monthlyXp': (userData.gamification?.monthlyXp || 0) + xpAmount,
        'gamification.level': newLevel,
        'gamification.lastActivityDate': new Date().toISOString(),
        updatedAt: serverTimestamp()
      };
      
      // Ajouter à l'historique XP
      const xpEntry = {
        amount: xpAmount,
        source: source,
        timestamp: new Date().toISOString(),
        totalAfter: newTotalXp
      };
      
      updates['gamification.xpHistory'] = [
        ...(userData.gamification?.xpHistory || []).slice(-19), // Garder les 19 derniers
        xpEntry
      ];
      
      // Si level up, ajouter à l'historique
      const leveledUp = newLevel > currentLevel;
      if (leveledUp) {
        updates['gamification.levelUpHistory'] = [
          ...(userData.gamification?.levelUpHistory || []).slice(-9), // Garder les 9 derniers
          {
            oldLevel: currentLevel,
            newLevel: newLevel,
            timestamp: new Date().toISOString(),
            xpAtLevelUp: newTotalXp
          }
        ];
      }
      
      await updateDoc(userRef, updates);
      
      console.log(`🎯 +${xpAmount} XP ajoutés (${source}) - Level: ${newLevel}`);
      
      return {
        success: true,
        leveledUp,
        newLevel,
        newTotalXp,
        xpGained: xpAmount
      };
      
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏅 DÉBLOQUER UN BADGE
   */
  async unlockBadge(userId, badgeId, badgeData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      
      // Vérifier si le badge n'est pas déjà débloqué
      if (currentBadges.some(badge => badge.id === badgeId)) {
        console.log('🏅 Badge déjà débloqué:', badgeId);
        return { success: false, reason: 'already_unlocked' };
      }
      
      // Créer le nouveau badge
      const newBadge = {
        id: badgeId,
        name: badgeData.name,
        description: badgeData.description,
        type: badgeData.type || 'achievement',
        rarity: badgeData.rarity || 'common',
        xpReward: badgeData.xpReward || 0,
        unlockedAt: new Date().toISOString()
      };
      
      // Mettre à jour les badges
      const updatedBadges = [...currentBadges, newBadge];
      
      const updates = {
        'gamification.badges': updatedBadges,
        'gamification.badgesUnlocked': updatedBadges.length,
        'gamification.totalBadgeXp': (userData.gamification?.totalBadgeXp || 0) + (badgeData.xpReward || 0),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updates);
      
      // Ajouter l'XP du badge si applicable
      if (badgeData.xpReward > 0) {
        await this.addXpToUser(userId, badgeData.xpReward, `badge_${badgeId}`);
      }
      
      console.log('🏅 Badge débloqué:', badgeData.name);
      
      return {
        success: true,
        badge: newBadge,
        xpGained: badgeData.xpReward || 0
      };
      
    } catch (error) {
      console.error('❌ Erreur déblocage badge:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 RÉCUPÉRER LES STATISTIQUES COMPLÈTES
   */
  async getUserCompleteStats(userId) {
    try {
      // 1. Données utilisateur
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userSnap.data();
      
      // 2. Compter les tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const tasksSnap = await getDocs(tasksQuery);
      const userTasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
      const todoTasks = userTasks.filter(task => task.status === 'todo').length;
      
      // 3. Compter les projets
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      const projectsSnap = await getDocs(projectsQuery);
      const userProjects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const activeProjects = userProjects.filter(project => project.status === 'active').length;
      const completedProjects = userProjects.filter(project => project.status === 'completed').length;
      
      // 4. Calculer les métriques
      const completionRate = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0;
      const averageTaskXp = userTasks.length > 0 ? Math.round(userTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / userTasks.length) : 0;
      
      return {
        // Données de base
        user: userData,
        
        // Statistiques tâches
        tasks: {
          total: userTasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
          completionRate
        },
        
        // Statistiques projets
        projects: {
          total: userProjects.length,
          active: activeProjects,
          completed: completedProjects
        },
        
        // Gamification
        gamification: {
          ...userData.gamification,
          averageTaskXp,
          productivity: this.calculateProductivity(userData.gamification, completionRate)
        },
        
        // Métriques calculées
        metrics: {
          weeklyProgress: this.calculateWeeklyProgress(userData.gamification),
          monthlyProgress: this.calculateMonthlyProgress(userData.gamification),
          streakHealth: this.calculateStreakHealth(userData.gamification)
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return null;
    }
  }

  /**
   * 📊 CALCULER LA PRODUCTIVITÉ
   */
  calculateProductivity(gamificationData, completionRate) {
    const level = gamificationData?.level || 1;
    const streak = gamificationData?.loginStreak || 1;
    
    if (completionRate >= 80 && level >= 5 && streak >= 7) return 'excellent';
    if (completionRate >= 60 && level >= 3 && streak >= 3) return 'high';
    if (completionRate >= 40 && level >= 2) return 'moderate';
    if (completionRate >= 20) return 'low';
    return 'starting';
  }

  /**
   * 📅 CALCULER LE PROGRÈS HEBDOMADAIRE
   */
  calculateWeeklyProgress(gamificationData) {
    const weeklyXp = gamificationData?.weeklyXp || 0;
    const targetWeeklyXp = 200; // Objectif hebdomadaire
    return Math.min(100, Math.round((weeklyXp / targetWeeklyXp) * 100));
  }

  /**
   * 📅 CALCULER LE PROGRÈS MENSUEL
   */
  calculateMonthlyProgress(gamificationData) {
    const monthlyXp = gamificationData?.monthlyXp || 0;
    const targetMonthlyXp = 800; // Objectif mensuel
    return Math.min(100, Math.round((monthlyXp / targetMonthlyXp) * 100));
  }

  /**
   * 🔥 CALCULER LA SANTÉ DU STREAK
   */
  calculateStreakHealth(gamificationData) {
    const currentStreak = gamificationData?.currentStreak || 1;
    const maxStreak = gamificationData?.maxStreak || 1;
    
    if (currentStreak >= 30) return 'legendary';
    if (currentStreak >= 14) return 'excellent';
    if (currentStreak >= 7) return 'good';
    if (currentStreak >= 3) return 'moderate';
    return 'starting';
  }

  /**
   * 🧹 NETTOYAGE
   */
  cleanup() {
    // Désabonner tous les listeners
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    this.listeners.clear();
    this.userCache.clear();
    
    console.log('🧹 FirebaseDataSyncService nettoyé');
  }

  /**
   * 🎯 OBTENIR LES DONNÉES DEPUIS LE CACHE
   */
  getCachedUserData(userId) {
    return this.userCache.get(userId) || null;
  }
}

// Export du service
export const firebaseDataSyncService = new FirebaseDataSyncService();
export default firebaseDataSyncService;
