// src/services/userService.js - AUTO-CRÉATION UTILISATEURS
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { COLLECTIONS, USER_ROLES, USER_STATUS } from '../core/constants.js';

class UserService {
  
  /**
   * 🤖 AUTO-CRÉATION : Vérifie et crée automatiquement le profil utilisateur
   * @param {Object} user - Utilisateur Firebase Auth
   * @returns {Promise<Object>} - { profile, wasCreated }
   */
  async ensureUserExists(user) {
    if (!user || !user.uid) {
      throw new Error('Utilisateur invalide fourni');
    }

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Document existe, mettre à jour lastLoginAt
        await this.updateLastLogin(user.uid);
        return { profile: userSnap.data(), wasCreated: false };
      }
      
      // Document n'existe pas, le créer automatiquement
      console.log(`🤖 AUTO-CRÉATION profil pour: ${user.email}`);
      const newProfile = await this.createCompleteProfile(user);
      
      return { profile: newProfile, wasCreated: true };
      
    } catch (error) {
      console.error('❌ Erreur ensureUserExists:', error);
      throw error;
    }
  }

  /**
   * 📝 CRÉATION COMPLÈTE : Crée un profil utilisateur complet automatiquement
   * @param {Object} user - Utilisateur Firebase Auth
   * @returns {Promise<Object>} - Profil utilisateur créé
   */
  async createCompleteProfile(user) {
    const now = new Date();
    
    // 🎯 PROFIL UTILISATEUR COMPLET ET AUTOMATIQUE
    const completeProfile = {
      // Identité de base
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || this.generateDisplayName(user.email),
      photoURL: user.photoURL || '',
      
      // Système
      role: USER_ROLES.EMPLOYEE, // Par défaut : employé
      status: USER_STATUS.ACTIVE,
      version: '3.0',
      migrationComplete: true,
      
      // Timestamps automatiques
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
      
      // 🎛️ PRÉFÉRENCES PAR DÉFAUT
      preferences: {
        theme: 'dark', // Thème sombre par défaut
        language: 'fr', // Français par défaut
        notifications: {
          email: true,
          push: true,
          inApp: true,
          sound: true
        },
        privacy: {
          showEmail: false,
          showActivity: true,
          publicProfile: false
        },
        display: {
          compactMode: false,
          animationsEnabled: true,
          showTutorials: true
        }
      },
      
      // 👤 PROFIL UTILISATEUR
      profile: {
        bio: '',
        department: '',
        position: '',
        skills: [],
        interests: [],
        phone: '',
        location: '',
        website: '',
        social: {
          linkedin: '',
          twitter: '',
          github: ''
        },
        avatar: {
          style: 'initials', // ou 'photo', 'generated'
          color: this.generateAvatarColor(),
          initials: this.generateInitials(user.displayName || user.email)
        }
      },
      
      // 🎮 GAMIFICATION COMPLÈTE
      gamification: {
        // XP et Niveaux
        xp: 50, // XP de démarrage pour première connexion
        level: 1,
        totalXp: 50,
        xpToNextLevel: 50, // XP nécessaire pour niveau 2
        
        // Progression
        streakDays: 1, // Premier jour de connexion
        longestStreak: 1,
        joinedAt: now,
        lastActivityAt: now,
        lastXpGainAt: now,
        
        // Collections
        badges: [
          {
            id: 'welcome',
            name: 'Bienvenue !',
            description: 'Premier pas dans Synergia',
            category: 'debut',
            rarity: 'common',
            unlockedAt: now,
            xpReward: 50
          }
        ],
        achievements: [
          {
            id: 'first_login',
            name: 'Première Connexion',
            description: 'Connecté pour la première fois',
            progress: 1,
            target: 1,
            completed: true,
            completedAt: now,
            category: 'social'
          },
          {
            id: 'profile_completion',
            name: 'Profil Complet', 
            description: 'Compléter son profil à 100%',
            progress: 30, // 30% déjà fait (infos de base)
            target: 100,
            completed: false,
            category: 'profile'
          }
        ],
        
        // Système de récompenses
        rewards: {
          dailyLoginBonus: 0, // Compteur bonus connexion
          weeklyTasksCompleted: 0,
          monthlyGoals: []
        }
      },
      
      // 📊 STATISTIQUES DÉTAILLÉES
      stats: {
        // Activité générale
        tasksCompleted: 0,
        projectsCreated: 0,
        projectsJoined: 0,
        helpProvided: 0,
        loginCount: 1,
        
        // Temps et engagement
        totalTimeSpent: 0, // en minutes
        averageSessionTime: 0,
        lastSessionDuration: 0,
        
        // Social
        messagesExchanged: 0,
        collaborationsInitiated: 0,
        feedbackGiven: 0,
        
        // Performance
        taskCompletionRate: 0,
        averageTaskTime: 0,
        projectsOnTime: 0,
        
        // Gamification
        badgesEarned: 1, // Badge de bienvenue
        achievementsUnlocked: 1,
        leaderboardPosition: 0
      },
      
      // 🔧 MÉTADONNÉES SYSTÈME
      metadata: {
        source: 'auto_creation', // Comment le profil a été créé
        platform: this.detectPlatform(),
        userAgent: navigator.userAgent.substring(0, 100),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        registrationIP: 'hidden', // Pour la sécurité
        firstLoginDevice: this.getDeviceInfo()
      },
      
      // 🚀 ONBOARDING
      onboarding: {
        completed: false,
        currentStep: 'welcome',
        stepsCompleted: ['account_created'],
        lastStepAt: now,
        tutorialsSeen: [],
        firstTimeActions: {
          dashboardVisited: false,
          firstTaskCreated: false,
          profileEdited: false,
          firstCollaboration: false
        }
      }
    };

    // 💾 SAUVEGARDE EN BASE
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await setDoc(userRef, completeProfile);
    
    console.log('✅ Profil utilisateur créé automatiquement:', {
      email: user.email,
      uid: user.uid,
      xp: completeProfile.gamification.xp,
      badges: completeProfile.gamification.badges.length
    });
    
    return completeProfile;
  }

  /**
   * 🔄 MISE À JOUR DERNIÈRE CONNEXION
   */
  async updateLastLogin(uid) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
        'stats.loginCount': increment(1)
      });
    } catch (error) {
      console.warn('⚠️ Erreur mise à jour dernière connexion:', error);
    }
  }

  /**
   * 🎨 UTILITAIRES DE GÉNÉRATION
   */
  generateDisplayName(email) {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  generateInitials(name) {
    if (!name) return 'SY';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  generateAvatarColor() {
    const colors = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }
  
  getDeviceInfo() {
    return {
      screen: `${screen.width}x${screen.height}`,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language
    };
  }

  /**
   * 🎯 MISE À JOUR SÉCURISÉE
   */
  async safeUpdate(uid, updates) {
    try {
      await this.ensureUserExists({ uid });
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 👥 ÉCOUTE TEMPS RÉEL
   */
  listenToUser(uid, callback) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
}

export default new UserService();
