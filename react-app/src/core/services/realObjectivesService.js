// ==========================================
// 📁 react-app/src/core/services/realObjectivesService.js
// SERVICE FIREBASE POUR OBJECTIFS CONNECTÉS AUX VRAIES DONNÉES
// ==========================================

import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  getDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase.config.js';
import { gamificationService } from './gamificationService.js';

class RealObjectivesService {
  constructor() {
    this.listeners = new Map();
    this.userStatsCache = {};
  }

  /**
   * 🎯 CALCULER LA PROGRESSION RÉELLE BASÉE SUR LES DONNÉES FIREBASE
   */
  calculateRealProgress(objectiveId, userStats) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    switch (objectiveId) {
      // === OBJECTIFS QUOTIDIENS ===
      case 'daily_improvement':
        // Vérifier si l'utilisateur a proposé une amélioration aujourd'hui
        return userStats.improvementsToday || 0;
        
      case 'daily_surprise_team':
        // Vérifier si l'utilisateur a géré une équipe surprise aujourd'hui
        return userStats.surpriseTeamsToday || 0;
        
      case 'daily_five_star':
        // Vérifier les avis 5 étoiles reçus aujourd'hui
        return userStats.fiveStarReviewsToday || 0;
        
      case 'daily_help_colleague':
        // Vérifier l'aide apportée aux collègues aujourd'hui
        return userStats.colleagueHelpsToday || 0;
        
      case 'daily_security_check':
        // Vérifier si le tour sécurité a été fait aujourd'hui
        return userStats.securityCheckToday ? 1 : 0;
        
      case 'daily_conflict_resolution':
        // Vérifier la résolution de conflits aujourd'hui
        return userStats.conflictsResolvedToday || 0;
        
      case 'daily_technical_fix':
        // Vérifier les dépannages techniques aujourd'hui
        return userStats.technicalFixesToday || 0;
        
      case 'daily_social_content':
        // Vérifier le contenu social proposé aujourd'hui
        return userStats.socialContentToday || 0;

      // === OBJECTIFS HEBDOMADAIRES ===
      case 'weekly_positive_reviews':
        // Compter les avis positifs de la semaine
        return userStats.positiveReviewsThisWeek || 0;
        
      case 'weekly_openings_closings':
        // Compter ouvertures + fermetures cette semaine
        const openings = userStats.openingsThisWeek || 0;
        const closings = userStats.closingsThisWeek || 0;
        return openings + closings;
        
      case 'weekly_weekend_work':
        // Vérifier si l'utilisateur a travaillé le weekend
        return userStats.weekendWorkedThisWeek ? 1 : 0;
        
      case 'weekly_all_rooms':
        // Vérifier si toutes les salles ont été animées
        const roomsAnimated = userStats.roomsAnimatedThisWeek || [];
        const requiredRooms = ['prison', 'psychiatric', 'quiz'];
        const animatedCount = requiredRooms.filter(room => 
          roomsAnimated.includes(room)
        ).length;
        return Math.min(1, animatedCount / requiredRooms.length);

      default:
        return 0;
    }
  }

  /**
   * 🎮 DÉFINITION DES OBJECTIFS AVEC BASE DE DONNÉES RÉELLE
   */
  getObjectivesWithRealData(userStats = {}) {
    return [
      // === OBJECTIFS QUOTIDIENS ===
      {
        id: 'daily_improvement',
        title: 'Propose une amélioration ou astuce',
        description: 'Partage une astuce d\'organisation sur le groupe équipe',
        target: 1,
        current: this.calculateRealProgress('daily_improvement', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_improvement', userStats) * 100),
        xpReward: 50,
        badgeReward: 'Innovateur du Jour',
        icon: '💡',
        type: 'daily',
        category: 'innovation',
        resetDaily: true,
        trackingField: 'improvementsToday'
      },
      
      {
        id: 'daily_surprise_team',
        title: 'Prends en charge une équipe surprise',
        description: 'Gère une équipe non prévue au planning',
        target: 1,
        current: this.calculateRealProgress('daily_surprise_team', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_surprise_team', userStats) * 100),
        xpReward: 75,
        badgeReward: 'Héros Imprévu',
        icon: '🦸',
        type: 'daily',
        category: 'flexibility',
        resetDaily: true,
        trackingField: 'surpriseTeamsToday'
      },
      
      {
        id: 'daily_five_star',
        title: 'Obtiens un retour 5 étoiles',
        description: 'Reçois un avis client "5 étoiles" dans la journée',
        target: 1,
        current: this.calculateRealProgress('daily_five_star', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_five_star', userStats) * 100),
        xpReward: 80,
        badgeReward: 'Excellence Client',
        icon: '⭐',
        type: 'daily',
        category: 'customer_service',
        resetDaily: true,
        trackingField: 'fiveStarReviewsToday'
      },
      
      {
        id: 'daily_help_colleague',
        title: 'Aide spontanément un·e collègue',
        description: 'Assiste sur une tâche qui n\'est pas la tienne',
        target: 1,
        current: this.calculateRealProgress('daily_help_colleague', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_help_colleague', userStats) * 100),
        xpReward: 60,
        badgeReward: 'Esprit d\'Équipe',
        icon: '🤝',
        type: 'daily',
        category: 'teamwork',
        resetDaily: true,
        trackingField: 'colleagueHelpsToday'
      },
      
      {
        id: 'daily_security_check',
        title: 'Tour sécurité complet',
        description: 'Vérifie portes, extincteurs, plans d\'évacuation, alarmes',
        target: 1,
        current: this.calculateRealProgress('daily_security_check', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_security_check', userStats) * 100),
        xpReward: 70,
        badgeReward: 'Gardien Sécurité',
        icon: '🛡️',
        type: 'daily',
        category: 'security',
        resetDaily: true,
        trackingField: 'securityCheckToday'
      },
      
      {
        id: 'daily_conflict_resolution',
        title: 'Gère un mini-conflit',
        description: 'Résous une situation tendue de façon autonome et débriefe',
        target: 1,
        current: this.calculateRealProgress('daily_conflict_resolution', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_conflict_resolution', userStats) * 100),
        xpReward: 90,
        badgeReward: 'Médiateur',
        icon: '🎯',
        type: 'daily',
        category: 'leadership',
        resetDaily: true,
        trackingField: 'conflictsResolvedToday'
      },
      
      {
        id: 'daily_technical_fix',
        title: 'Dépanne un élément technique',
        description: 'Répare une panne, bug ou accessoire dans la journée',
        target: 1,
        current: this.calculateRealProgress('daily_technical_fix', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_technical_fix', userStats) * 100),
        xpReward: 65,
        badgeReward: 'Technicien Express',
        icon: '🔧',
        type: 'daily',
        category: 'maintenance',
        resetDaily: true,
        trackingField: 'technicalFixesToday'
      },
      
      {
        id: 'daily_social_content',
        title: 'Propose du contenu réseaux sociaux',
        description: 'Publie ou propose une idée de contenu/story',
        target: 1,
        current: this.calculateRealProgress('daily_social_content', userStats),
        progress: Math.min(100, this.calculateRealProgress('daily_social_content', userStats) * 100),
        xpReward: 55,
        badgeReward: 'Community Manager',
        icon: '📱',
        type: 'daily',
        category: 'marketing',
        resetDaily: true,
        trackingField: 'socialContentToday'
      },

      // === OBJECTIFS HEBDOMADAIRES ===
      {
        id: 'weekly_positive_reviews',
        title: 'Obtenir 5 avis clients positifs',
        description: 'Reçois au moins 5 avis positifs sur Google, TripAdvisor ou Facebook',
        target: 5,
        current: this.calculateRealProgress('weekly_positive_reviews', userStats),
        progress: Math.min(100, (this.calculateRealProgress('weekly_positive_reviews', userStats) / 5) * 100),
        xpReward: 150,
        badgeReward: 'Champion Satisfaction',
        icon: '🌟',
        type: 'weekly',
        category: 'customer_service',
        resetWeekly: true,
        trackingField: 'positiveReviewsThisWeek'
      },
      
      {
        id: 'weekly_openings_closings',
        title: '2 ouvertures et 2 fermetures',
        description: 'Effectue 2 ouvertures et 2 fermetures dans la semaine',
        target: 4,
        current: this.calculateRealProgress('weekly_openings_closings', userStats),
        progress: Math.min(100, (this.calculateRealProgress('weekly_openings_closings', userStats) / 4) * 100),
        xpReward: 120,
        badgeReward: 'Maître des Clés',
        icon: '🗝️',
        type: 'weekly',
        category: 'responsibility',
        resetWeekly: true,
        trackingField: 'openingsClosingsThisWeek'
      },
      
      {
        id: 'weekly_weekend_work',
        title: 'Travaille un week-end entier',
        description: 'Assure le service sur un week-end complet',
        target: 1,
        current: this.calculateRealProgress('weekly_weekend_work', userStats),
        progress: Math.min(100, this.calculateRealProgress('weekly_weekend_work', userStats) * 100),
        xpReward: 180,
        badgeReward: 'Guerrier Weekend',
        icon: '🎪',
        type: 'weekly',
        category: 'dedication',
        resetWeekly: true,
        trackingField: 'weekendWorkedThisWeek'
      },
      
      {
        id: 'weekly_all_rooms',
        title: 'Anime chaque salle',
        description: 'Anime au moins une session dans chaque salle (escape ET quiz)',
        target: 1,
        current: this.calculateRealProgress('weekly_all_rooms', userStats),
        progress: Math.min(100, this.calculateRealProgress('weekly_all_rooms', userStats) * 100),
        xpReward: 140,
        badgeReward: 'Maître Polyvalent',
        icon: '🎭',
        type: 'weekly',
        category: 'versatility',
        resetWeekly: true,
        trackingField: 'roomsAnimatedThisWeek'
      }
    ];
  }

  /**
   * 📊 SUIVRE LES STATS UTILISATEUR EN TEMPS RÉEL
   */
  subscribeToUserStats(userId, callback) {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const stats = {
          // Données de base
          ...userData.gamification,
          
          // Données quotidiennes (reset chaque jour)
          improvementsToday: userData.dailyStats?.improvementsToday || 0,
          surpriseTeamsToday: userData.dailyStats?.surpriseTeamsToday || 0,
          fiveStarReviewsToday: userData.dailyStats?.fiveStarReviewsToday || 0,
          colleagueHelpsToday: userData.dailyStats?.colleagueHelpsToday || 0,
          securityCheckToday: userData.dailyStats?.securityCheckToday || false,
          conflictsResolvedToday: userData.dailyStats?.conflictsResolvedToday || 0,
          technicalFixesToday: userData.dailyStats?.technicalFixesToday || 0,
          socialContentToday: userData.dailyStats?.socialContentToday || 0,
          
          // Données hebdomadaires (reset chaque semaine)
          positiveReviewsThisWeek: userData.weeklyStats?.positiveReviewsThisWeek || 0,
          openingsThisWeek: userData.weeklyStats?.openingsThisWeek || 0,
          closingsThisWeek: userData.weeklyStats?.closingsThisWeek || 0,
          weekendWorkedThisWeek: userData.weeklyStats?.weekendWorkedThisWeek || false,
          roomsAnimatedThisWeek: userData.weeklyStats?.roomsAnimatedThisWeek || []
        };
        
        this.userStatsCache[userId] = stats;
        callback(stats);
      }
    });
    
    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * 📈 INCRÉMENTER UNE STATISTIQUE UTILISATEUR
   */
  async incrementUserStat(userId, statField, increment = 1) {
    try {
      const userRef = doc(db, 'users', userId);
      const today = new Date().toISOString().split('T')[0];
      
      // Déterminer le type de stat (daily, weekly, ou gamification)
      let updatePath;
      if (statField.includes('Today')) {
        updatePath = `dailyStats.${statField}`;
      } else if (statField.includes('ThisWeek')) {
        updatePath = `weeklyStats.${statField}`;
      } else {
        updatePath = `gamification.${statField}`;
      }
      
      await updateDoc(userRef, {
        [updatePath]: increment(increment),
        [`${updatePath}_lastUpdate`]: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      console.log(`✅ Stat mise à jour: ${statField} +${increment} pour ${userId}`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour stat:', error);
      throw error;
    }
  }

  /**
   * 🎁 RÉCLAMER UN OBJECTIF RÉEL AVEC SAUVEGARDE FIREBASE
   */
  async claimRealObjective(userId, objective) {
    try {
      console.log('🎯 Réclamation objectif réel:', objective.id);

      // Vérifier que l'objectif est complété
      if (objective.progress < 100) {
        throw new Error('Objectif non complété');
      }

      // Créer l'ID de réclamation
      const today = new Date().toISOString().split('T')[0];
      const claimId = this.generateClaimId(objective.id, objective.type, today);

      // Vérifier si déjà réclamé
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const claimedObjectives = userData.claimedObjectives || [];
      
      if (claimedObjectives.includes(claimId)) {
        throw new Error('Objectif déjà réclamé');
      }

      // Calculer XP avec bonus
      const categoryBonus = this.calculateCategoryBonus(objective.category);
      const totalXpReward = objective.xpReward + categoryBonus;

      // Créer l'entrée de réclamation
      const claimedEntry = {
        id: claimId,
        objectiveId: objective.id,
        title: objective.title,
        xpReward: objective.xpReward,
        categoryBonus: categoryBonus,
        totalXpReward: totalXpReward,
        badgeReward: objective.badgeReward,
        category: objective.category,
        type: objective.type,
        claimedAt: serverTimestamp(),
        resetDate: this.getResetDate(objective.type)
      };

      // Mise à jour atomique Firebase
      await updateDoc(userRef, {
        // Ajouter les XP
        'gamification.totalXp': increment(totalXpReward),
        'gamification.weeklyXp': increment(totalXpReward),
        'gamification.monthlyXp': increment(totalXpReward),
        
        // Enregistrer la réclamation
        claimedObjectives: arrayUnion(claimId),
        objectiveHistory: arrayUnion(claimedEntry),
        
        // Stats des objectifs
        'gamification.objectivesCompleted': increment(1),
        'gamification.totalObjectiveXP': increment(totalXpReward),
        
        // Métadonnées
        'gamification.lastXpGain': totalXpReward,
        'gamification.lastXpReason': `Objectif: ${objective.title}`,
        lastActivity: serverTimestamp()
      });

      // Vérifier level up
      const newTotalXp = (userData.gamification?.totalXp || 0) + totalXpReward;
      const newLevel = gamificationService.calculateLevel(newTotalXp);
      const currentLevel = userData.gamification?.level || 1;
      
      if (newLevel > currentLevel) {
        await updateDoc(userRef, {
          'gamification.level': newLevel,
          'gamification.levelUpHistory': arrayUnion({
            level: newLevel,
            totalXp: newTotalXp,
            unlockedAt: serverTimestamp(),
            source: 'objective_completion'
          })
        });
        
        console.log(`🎉 Level up ! Nouveau niveau: ${newLevel}`);
      }

      console.log(`✅ Objectif réclamé: +${totalXpReward} XP`);
      
      return {
        success: true,
        xpGained: totalXpReward,
        baseXp: objective.xpReward,
        bonusXp: categoryBonus,
        claimId: claimId,
        levelUp: newLevel > currentLevel,
        newLevel: newLevel
      };

    } catch (error) {
      console.error('❌ Erreur réclamation objectif réel:', error);
      throw error;
    }
  }

  /**
   * 🎨 CALCULER LE BONUS XP PAR CATÉGORIE
   */
  calculateCategoryBonus(category) {
    const bonusMap = {
      'innovation': 15,
      'flexibility': 20,  
      'customer_service': 25,
      'teamwork': 10,
      'security': 12,
      'leadership': 30,
      'maintenance': 8,
      'marketing': 18,
      'responsibility': 22,
      'dedication': 35,
      'versatility': 25,
      'creativity': 20
    };
    
    return bonusMap[category] || 5;
  }

  /**
   * 🔄 GÉNÉRER ID DE RÉCLAMATION
   */
  generateClaimId(objectiveId, type, date) {
    switch (type) {
      case 'daily':
        return `${objectiveId}_${date}`;
      case 'weekly':
        const weekNumber = this.getWeekNumber(new Date(date));
        return `${objectiveId}_week_${weekNumber}`;
      default:
        return `${objectiveId}_${Date.now()}`;
    }
  }

  /**
   * 📅 OBTENIR DATE DE RESET
   */
  getResetDate(type) {
    const now = new Date();
    
    switch (type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();
        
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(0, 0, 0, 0);
        return nextWeek.toISOString();
        
      default:
        return null;
    }
  }

  /**
   * 📊 OBTENIR NUMÉRO DE SEMAINE
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// Export singleton
export const realObjectivesService = new RealObjectivesService();
export default realObjectivesService;
