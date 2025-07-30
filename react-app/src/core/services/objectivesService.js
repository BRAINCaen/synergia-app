// ==========================================
// 📁 react-app/src/core/services/objectivesService.js
// SERVICE FIREBASE POUR LA GESTION DES OBJECTIFS
// ==========================================

import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase.config.js';
import { gamificationService } from './gamificationService.js';

class ObjectivesService {
  constructor() {
    this.objectives = {};
    this.listeners = new Map();
  }

  /**
   * 🎯 DÉFINITION DES OBJECTIFS DISPONIBLES
   */
  getAvailableObjectives(userStats = {}) {
    const tasksToday = userStats.tasksCompletedToday || 0;
    const weeklyXP = userStats.weeklyXp || 0;
    const currentStreak = userStats.currentStreak || 0;
    const totalTasks = userStats.tasksCompleted || 0;
    const monthlyXP = userStats.monthlyXp || 0;

    return [
      {
        id: 'daily_tasks_3',
        title: 'Complétez 3 tâches aujourd\'hui',
        description: 'Terminez au moins 3 tâches avant la fin de la journée',
        target: 3,
        current: tasksToday,
        progress: Math.min(100, (tasksToday / 3) * 100),
        xpReward: 60,
        badgeReward: 'Productif du Jour',
        status: tasksToday >= 3 ? 'completed' : 'active',
        icon: '✅',
        type: 'daily',
        resetDaily: true
      },
      {
        id: 'weekly_xp_100',
        title: 'Gagnez 100 XP cette semaine',
        description: 'Accumulez au moins 100 points d\'expérience cette semaine',
        target: 100,
        current: weeklyXP,
        progress: Math.min(100, (weeklyXP / 100) * 100),
        xpReward: 200,
        badgeReward: 'Champion Hebdomadaire',
        status: weeklyXP >= 100 ? 'completed' : 'active',
        icon: '⭐',
        type: 'weekly',
        resetWeekly: true
      },
      {
        id: 'streak_7_days',
        title: 'Maintenez une série de 7 jours',
        description: 'Complétez au moins une tâche chaque jour pendant 7 jours',
        target: 7,
        current: currentStreak,
        progress: Math.min(100, (currentStreak / 7) * 100),
        xpReward: 300,
        badgeReward: 'Consistance Parfaite',
        status: currentStreak >= 7 ? 'completed' : 'active',
        icon: '🔥',
        type: 'streak',
        resetNever: true
      },
      {
        id: 'task_master_10',
        title: 'Complétez 10 tâches au total',
        description: 'Atteignez 10 tâches complétées dans votre carrière',
        target: 10,
        current: totalTasks,
        progress: Math.min(100, (totalTasks / 10) * 100),
        xpReward: 150,
        badgeReward: 'Maître des Tâches',
        status: totalTasks >= 10 ? 'completed' : 'active',
        icon: '🏆',
        type: 'milestone',
        resetNever: true
      },
      {
        id: 'monthly_xp_500',
        title: 'Gagnez 500 XP ce mois',
        description: 'Accumulez 500 points d\'expérience dans le mois',
        target: 500,
        current: monthlyXP,
        progress: Math.min(100, (monthlyXP / 500) * 100),
        xpReward: 500,
        badgeReward: 'Légende Mensuelle',
        status: monthlyXP >= 500 ? 'completed' : 'active',
        icon: '👑',
        type: 'monthly',
        resetMonthly: true
      },
      {
        id: 'early_bird',
        title: 'Complétez une tâche avant 8h',
        description: 'Terminez une tâche tôt dans la matinée (avant 8h)',
        target: 1,
        current: userStats.earlyBirdToday ? 1 : 0,
        progress: userStats.earlyBirdToday ? 100 : 0,
        xpReward: 75,
        badgeReward: 'Lève-tôt',
        status: userStats.earlyBirdToday ? 'completed' : 'active',
        icon: '🌅',
        type: 'special',
        resetDaily: true
      }
    ];
  }

  /**
   * 📥 CHARGER LES OBJECTIFS RÉCLAMÉS PAR L'UTILISATEUR
   */
  async getClaimedObjectives(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.objectives?.claimed || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erreur chargement objectifs réclamés:', error);
      return [];
    }
  }

  /**
   * 🎁 RÉCLAMER UN OBJECTIF ET METTRE À JOUR LES XP
   */
  async claimObjective(userId, objective) {
    try {
      console.log('🎯 Réclamation objectif:', objective.id, 'pour utilisateur:', userId);

      // Vérifier que l'objectif est bien complété
      if (objective.status !== 'completed') {
        throw new Error('Objectif non complété');
      }

      // Créer l'ID unique de réclamation basé sur la date pour les objectifs périodiques
      const today = new Date().toISOString().split('T')[0];
      const claimId = this.generateClaimId(objective.id, objective.type, today);

      // Vérifier si déjà réclamé
      const claimedObjectives = await this.getClaimedObjectives(userId);
      if (claimedObjectives.includes(claimId)) {
        throw new Error('Objectif déjà réclamé');
      }

      const userRef = doc(db, 'users', userId);

      // Créer l'entrée d'objectif réclamé
      const claimedEntry = {
        id: claimId,
        objectiveId: objective.id,
        title: objective.title,
        xpReward: objective.xpReward,
        badgeReward: objective.badgeReward,
        claimedAt: serverTimestamp(),
        type: objective.type,
        resetDate: this.getResetDate(objective.type)
      };

      // Mise à jour atomique avec les XP et l'objectif réclamé
      await updateDoc(userRef, {
        // Ajouter les XP
        'gamification.totalXp': increment(objective.xpReward),
        'gamification.weeklyXp': increment(objective.xpReward),
        'gamification.monthlyXp': increment(objective.xpReward),
        
        // Enregistrer l'objectif réclamé
        'objectives.claimed': arrayUnion(claimId),
        'objectives.history': arrayUnion(claimedEntry),
        
        // Métadonnées
        'gamification.lastXpGain': objective.xpReward,
        'gamification.lastXpReason': `Objectif: ${objective.title}`,
        lastActivity: serverTimestamp()
      });

      // Calculer le nouveau niveau
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        const userData = updatedUserSnap.data();
        const newTotalXp = userData.gamification?.totalXp || 0;
        const newLevel = gamificationService.calculateLevel(newTotalXp);
        
        // Mettre à jour le niveau si nécessaire
        if (newLevel !== (userData.gamification?.level || 1)) {
          await updateDoc(userRef, {
            'gamification.level': newLevel,
            'gamification.levelUpHistory': arrayUnion({
              level: newLevel,
              totalXp: newTotalXp,
              unlockedAt: serverTimestamp()
            })
          });
          
          console.log(`🎉 Niveau augmenté ! Nouveau niveau: ${newLevel}`);
        }
      }

      console.log(`✅ Objectif réclamé avec succès: +${objective.xpReward} XP`);
      
      return {
        success: true,
        xpGained: objective.xpReward,
        claimId: claimId,
        levelUp: false // sera mis à jour après vérification
      };

    } catch (error) {
      console.error('❌ Erreur réclamation objectif:', error);
      throw new Error(`Impossible de réclamer l'objectif: ${error.message}`);
    }
  }

  /**
   * 🔄 GÉNÉRER UN ID DE RÉCLAMATION UNIQUE
   */
  generateClaimId(objectiveId, type, date) {
    switch (type) {
      case 'daily':
        return `${objectiveId}_${date}`;
      case 'weekly':
        const weekNumber = this.getWeekNumber(new Date(date));
        return `${objectiveId}_week_${weekNumber}`;
      case 'monthly':
        const month = date.substring(0, 7); // YYYY-MM
        return `${objectiveId}_month_${month}`;
      case 'milestone':
      case 'special':
      case 'streak':
      default:
        return `${objectiveId}_${Date.now()}`;
    }
  }

  /**
   * 📅 OBTENIR LA DATE DE RESET POUR UN TYPE D'OBJECTIF
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
        
      case 'monthly':
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toISOString();
        
      default:
        return null; // Pas de reset pour les milestones
    }
  }

  /**
   * 📊 OBTENIR LE NUMÉRO DE SEMAINE
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * 🎯 OBTENIR LES OBJECTIFS DISPONIBLES POUR UN UTILISATEUR
   */
  async getObjectivesForUser(userId, userStats = {}) {
    try {
      const availableObjectives = this.getAvailableObjectives(userStats);
      const claimedObjectives = await this.getClaimedObjectives(userId);
      
      // Marquer les objectifs déjà réclamés
      const objectivesWithStatus = availableObjectives.map(objective => {
        const today = new Date().toISOString().split('T')[0];
        const claimId = this.generateClaimId(objective.id, objective.type, today);
        const isClaimed = claimedObjectives.includes(claimId);
        
        return {
          ...objective,
          isClaimed,
          claimId,
          canClaim: objective.status === 'completed' && !isClaimed
        };
      });

      return objectivesWithStatus;
    } catch (error) {
      console.error('❌ Erreur chargement objectifs utilisateur:', error);
      return [];
    }
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
export const objectivesService = new ObjectivesService();
export default objectivesService;
