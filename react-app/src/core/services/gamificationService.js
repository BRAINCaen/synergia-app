// src/core/services/gamificationService.js
// Service de gamification complet avec méthodes corrigées
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

class GamificationService {
  constructor() {
    this.listeners = new Map();
    this.initialized = false;
  }

  // ✅ CORRIGÉ: initializeUserStats (méthode manquante)
  async initializeUserStats(userId, userEmail = null) {
    return await this.initializeUserData(userId);
  }

  // ✅ Initialiser les données utilisateur
  async initializeUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log('✅ Données utilisateur existantes trouvées');
        return userSnap.data().gamification || this.getDefaultUserData();
      } else {
        console.log('🆕 Nouveau utilisateur, création des données gamification');
        const defaultData = this.getDefaultUserData();
        
        await setDoc(userRef, {
          gamification: defaultData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        return defaultData;
      }
    } catch (error) {
      console.error('❌ Erreur initialisation données utilisateur:', error);
      return this.getDefaultUserData();
    }
  }

  // ✅ CORRIGÉ: subscribeToUserStats (méthode manquante)
  subscribeToUserStats(userId, callback) {
    return this.subscribeToUserData(userId, callback);
  }

  // ✅ S'abonner aux données utilisateur en temps réel
  subscribeToUserData(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const gamificationData = data.gamification || this.getDefaultUserData();
          callback(gamificationData);
        } else {
          callback(this.getDefaultUserData());
        }
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur souscription données utilisateur:', error);
      return () => {}; // Fonction vide pour éviter les erreurs
    }
  }

  // ✅ CORRIGÉ: updateLoginStreak (méthode manquante)
  async updateLoginStreak(userId) {
    return await this.dailyLogin(userId);
  }

  // ✅ Données par défaut
  getDefaultUserData() {
    return {
      totalXp: 0,
      level: 1,
      tasksCreated: 0,
      tasksCompleted: 0,
      projectsCreated: 0,
      projectsJoined: 0,
      badges: [],
      loginStreak: 0,
      completionRate: 0,
      weeklyXp: 0,
      monthlyXp: 0,
      lastLoginDate: null,
      levelInfo: { 
        name: 'Novice', 
        color: '#9CA3AF',
        description: 'Vous commencez votre aventure !'
      },
      levelProgress: { 
        current: 0,
        needed: 100,
        percentage: 0
      }
    };
  }

  // ✅ Obtenir les données utilisateur
  async getUserData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().gamification || this.getDefaultUserData();
      } else {
        return await this.initializeUserData(userId);
      }
    } catch (error) {
      console.error('❌ Erreur récupération données utilisateur:', error);
      return this.getDefaultUserData();
    }
  }

  // ✅ Mettre à jour les données utilisateur
  async setUserData(userId, data) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        gamification: data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour données:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Ajouter des points XP
  async addXP(userId, amount, reason = 'Activité') {
    try {
      const userData = await this.getUserData(userId);
      const newTotalXp = userData.totalXp + amount;
      const oldLevel = userData.level;
      const newLevel = this.calculateLevel(newTotalXp);
      
      const levelUp = newLevel > oldLevel;
      const newBadges = [];

      // Calculer les progrès du niveau
      const levelProgress = this.calculateLevelProgress(newTotalXp, newLevel);

      const updatedData = {
        ...userData,
        totalXp: newTotalXp,
        level: newLevel,
        weeklyXp: (userData.weeklyXp || 0) + amount,
        monthlyXp: (userData.monthlyXp || 0) + amount,
        levelProgress,
        levelInfo: this.getLevelInfo(newLevel)
      };

      await this.setUserData(userId, updatedData);

      console.log(`✅ +${amount} XP ajouté (${reason}). Total: ${newTotalXp} XP, Niveau: ${newLevel}`);

      return {
        success: true,
        addedXP: amount,
        totalXP: newTotalXp,
        level: newLevel,
        levelUp,
        newBadges,
        reason
      };
    } catch (error) {
      console.error('❌ Erreur ajout XP:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Calculer le niveau basé sur l'XP
  calculateLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 1000) return 4;
    if (xp < 1750) return 5;
    if (xp < 2750) return 6;
    if (xp < 4000) return 7;
    if (xp < 5500) return 8;
    if (xp < 7500) return 9;
    if (xp < 10000) return 10;
    
    // Au-delà du niveau 10
    return Math.floor(10 + (xp - 10000) / 2000);
  }

  // ✅ Calculer les progrès du niveau
  calculateLevelProgress(xp, level) {
    const xpForCurrentLevel = this.getXpForLevel(level);
    const xpForNextLevel = this.getXpForLevel(level + 1);
    
    const currentLevelXp = xp - xpForCurrentLevel;
    const neededForNext = xpForNextLevel - xpForCurrentLevel;
    
    return {
      current: currentLevelXp,
      needed: neededForNext,
      remaining: Math.max(0, xpForNextLevel - xp),
      percentage: Math.round((currentLevelXp / neededForNext) * 100)
    };
  }

  // ✅ Obtenir l'XP requis pour un niveau
  getXpForLevel(level) {
    const xpThresholds = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];
    
    if (level <= 10) {
      return xpThresholds[level - 1] || 0;
    } else {
      return 10000 + (level - 10) * 2000;
    }
  }

  // ✅ Obtenir les informations du niveau
  getLevelInfo(level) {
    const levels = [
      { name: 'Novice', color: '#9CA3AF', description: 'Vous commencez votre aventure !' },
      { name: 'Apprenti', color: '#10B981', description: 'Vous prenez vos marques' },
      { name: 'Compétent', color: '#3B82F6', description: 'Vous maîtrisez les bases' },
      { name: 'Expérimenté', color: '#8B5CF6', description: 'Votre expertise se développe' },
      { name: 'Expert', color: '#F59E0B', description: 'Vous êtes un vrai professionnel' },
      { name: 'Maître', color: '#EF4444', description: 'Votre maîtrise impressionne' },
      { name: 'Grand Maître', color: '#EC4899', description: 'Vous excellez dans votre domaine' },
      { name: 'Légendaire', color: '#6366F1', description: 'Votre réputation vous précède' },
      { name: 'Mythique', color: '#8B5CF6', description: 'Vous êtes une légende vivante' },
      { name: 'Divin', color: '#F59E0B', description: 'Vous transcendez les limites' }
    ];

    if (level <= 10) {
      return levels[level - 1] || levels[0];
    } else {
      return { 
        name: `Niveau ${level}`, 
        color: '#F59E0B', 
        description: 'Vous avez atteint des sommets inexplorés !' 
      };
    }
  }

  // ✅ Compléter une tâche
  async completeTask(userId, difficulty = 'normal') {
    try {
      const userData = await this.getUserData(userId);
      const xpReward = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 35 : 20;
      
      const updatedData = {
        ...userData,
        tasksCompleted: userData.tasksCompleted + 1,
        completionRate: ((userData.tasksCompleted + 1) / Math.max(userData.tasksCreated, 1)) * 100
      };

      await this.setUserData(userId, updatedData);
      return await this.addXP(userId, xpReward, `Tâche ${difficulty} complétée`);
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Créer une tâche
  async createTask(userId) {
    try {
      const userData = await this.getUserData(userId);
      const updatedData = {
        ...userData,
        tasksCreated: userData.tasksCreated + 1
      };

      await this.setUserData(userId, updatedData);
      return await this.addXP(userId, 5, 'Tâche créée');
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Connexion quotidienne
  async dailyLogin(userId) {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    try {
      const userData = await this.getUserData(userId);
      
      // Vérifier si déjà connecté aujourd'hui
      if (userData && userData.lastLoginDate === today) {
        console.log('ℹ️ Connexion quotidienne déjà enregistrée aujourd\'hui');
        return { success: true, addedXP: 0, alreadyProcessed: true };
      }

      // Calculer le nouveau streak
      const newStreak = this.calculateStreak(userData.lastLoginDate, today, userData.loginStreak || 0);
      
      // Mettre à jour les données
      const updatedData = {
        ...userData,
        lastLoginDate: today,
        loginStreak: newStreak
      };

      await this.setUserData(userId, updatedData);

      // XP bonus pour le streak
      const xpBonus = newStreak >= 7 ? 15 : newStreak >= 3 ? 10 : 5;
      return await this.addXP(userId, xpBonus, `Connexion quotidienne (série: ${newStreak})`);
    } catch (error) {
      console.error('❌ Erreur connexion quotidienne:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Calculer le streak de connexion
  calculateStreak(lastLoginDate, today, currentStreak) {
    if (!lastLoginDate) return 1;
    
    const lastDate = new Date(lastLoginDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return currentStreak + 1; // Streak continue
    } else if (diffDays === 0) {
      return currentStreak; // Même jour
    } else {
      return 1; // Streak cassé, recommencer
    }
  }

  // ✅ Obtenir le classement
  async getLeaderboard(limitCount = 10) {
    try {
      // Pour le moment, retourner des données mock
      // TODO: Implémenter avec de vraies données Firebase
      const mockLeaderboard = [
        { userId: 'user1', name: 'Alice Martin', totalXp: 1250, level: 4, position: 1 },
        { userId: 'user2', name: 'Bob Dupont', totalXp: 980, level: 3, position: 2 },
        { userId: 'user3', name: 'Claire Dubois', totalXp: 750, level: 3, position: 3 },
        { userId: 'user4', name: 'David Chen', totalXp: 620, level: 2, position: 4 },
        { userId: 'user5', name: 'Emma Wilson', totalXp: 450, level: 2, position: 5 }
      ];

      return mockLeaderboard.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Erreur récupération leaderboard:', error);
      return [];
    }
  }

  // ✅ Vérifier et débloquer des badges
  async checkAndUnlockBadges(userId) {
    try {
      const userData = await this.getUserData(userId);
      const newBadges = [];

      // Définir les conditions des badges
      const badgeConditions = [
        { id: 'first_task', condition: userData.tasksCreated >= 1, name: 'Première tâche', icon: '🎯' },
        { id: 'productive', condition: userData.tasksCompleted >= 10, name: 'Productif', icon: '✅' },
        { id: 'streak_week', condition: userData.loginStreak >= 7, name: 'Série hebdomadaire', icon: '🔥' },
        { id: 'level_5', condition: userData.level >= 5, name: 'Niveau expert', icon: '⭐' },
        { id: 'xp_1000', condition: userData.totalXp >= 1000, name: 'Millionnaire XP', icon: '💎' }
      ];

      // Vérifier chaque badge
      badgeConditions.forEach(badge => {
        const alreadyUnlocked = userData.badges.some(b => b.id === badge.id);
        if (badge.condition && !alreadyUnlocked) {
          newBadges.push(badge);
        }
      });

      // Ajouter les nouveaux badges
      if (newBadges.length > 0) {
        const updatedBadges = [...userData.badges, ...newBadges];
        const updatedData = { ...userData, badges: updatedBadges };
        await this.setUserData(userId, updatedData);
        
        console.log('🏆 Nouveaux badges débloqués:', newBadges.map(b => b.name).join(', '));
      }

      return newBadges;
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      return [];
    }
  }

  // ✅ Obtenir tous les badges disponibles
  getAllBadges() {
    return [
      { id: 'first_task', name: 'Première tâche', description: 'Créer votre première tâche', icon: '🎯' },
      { id: 'productive', name: 'Productif', description: 'Compléter 10 tâches', icon: '✅' },
      { id: 'streak_week', name: 'Série hebdomadaire', description: 'Se connecter 7 jours consécutifs', icon: '🔥' },
      { id: 'level_5', name: 'Niveau expert', description: 'Atteindre le niveau 5', icon: '⭐' },
      { id: 'xp_1000', name: 'Millionnaire XP', description: 'Atteindre 1000 XP', icon: '💎' },
      { id: 'team_player', name: 'Joueur d\'équipe', description: 'Rejoindre 3 projets', icon: '👥' },
      { id: 'creator', name: 'Créateur', description: 'Créer 5 projets', icon: '🏗️' },
      { id: 'consistent', name: 'Constant', description: 'Série de 30 jours', icon: '🎯' }
    ];
  }

  // ✅ Données mock pour développement
  getMockUserData() {
    return {
      totalXp: 250,
      level: 2,
      tasksCreated: 5,
      tasksCompleted: 3,
      projectsCreated: 1,
      projectsJoined: 2,
      badges: [
        { id: 'first_task', name: 'Première tâche', icon: '🎯' }
      ],
      loginStreak: 3,
      completionRate: 60,
      weeklyXp: 120,
      monthlyXp: 250,
      levelInfo: { name: 'Apprenti', color: '#10B981' },
      levelProgress: { current: 150, needed: 250, percentage: 60 }
    };
  }

  // ✅ Nettoyer tous les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// ✅ Instance singleton
const gamificationService = new GamificationService();

// ✅ Export multiple pour compatibilité
export { gamificationService };
export default gamificationService;
