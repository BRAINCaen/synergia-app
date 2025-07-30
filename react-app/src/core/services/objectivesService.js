// ==========================================
// 📁 react-app/src/core/services/objectivesService.js
// SERVICE FIREBASE POUR LES OBJECTIFS ESCAPE GAME & QUIZ GAME
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
   * 🎮 DÉFINITION DES OBJECTIFS QUOTIDIENS ET HEBDOMADAIRES
   */
  getAvailableObjectives(userStats = {}) {
    // Stats quotidiennes
    const improvementProposed = userStats.improvementProposedToday || false;
    const surpriseTeamHandled = userStats.surpriseTeamHandledToday || false;
    const fiveStarReview = userStats.fiveStarReviewToday || false;
    const helpedColleague = userStats.helpedColleagueToday || false;
    const securityCheckDone = userStats.securityCheckToday || false;
    const conflictResolved = userStats.conflictResolvedToday || false;
    const technicalFixDone = userStats.technicalFixToday || false;
    const socialContentProposed = userStats.socialContentToday || false;

    // Stats hebdomadaires
    const positiveReviewsWeek = userStats.positiveReviewsThisWeek || 0;
    const openingsClosingsWeek = userStats.openingsClosingsThisWeek || 0;
    const weekendWorked = userStats.weekendWorkedThisWeek || false;
    const allRoomsAnimated = userStats.allRoomsAnimatedThisWeek || false;
    const replacementDone = userStats.replacementDoneThisWeek || false;
    const decorationChanged = userStats.decorationChangedThisWeek || false;
    const immersionIdeaProposed = userStats.immersionIdeaThisWeek || false;
    const wellbeingMomentOrganized = userStats.wellbeingMomentThisWeek || false;
    const unexpectedSituationHandled = userStats.unexpectedSituationThisWeek || false;

    return [
      // =======================================
      // 🌟 OBJECTIFS QUOTIDIENS - "PETITES RÉUSSITES"
      // =======================================
      {
        id: 'daily_improvement_tip',
        title: 'Propose une amélioration ou astuce',
        description: 'Partage une astuce d\'organisation sur le groupe équipe',
        target: 1,
        current: improvementProposed ? 1 : 0,
        progress: improvementProposed ? 100 : 0,
        xpReward: 50,
        badgeReward: 'Innovateur du Jour',
        status: improvementProposed ? 'completed' : 'active',
        icon: '💡',
        type: 'daily',
        category: 'innovation',
        resetDaily: true
      },
      {
        id: 'daily_surprise_team',
        title: 'Prends en charge une équipe surprise',
        description: 'Gère une équipe non prévue au planning',
        target: 1,
        current: surpriseTeamHandled ? 1 : 0,
        progress: surpriseTeamHandled ? 100 : 0,
        xpReward: 75,
        badgeReward: 'Héros Imprévu',
        status: surpriseTeamHandled ? 'completed' : 'active',
        icon: '🦸',
        type: 'daily',
        category: 'flexibility',
        resetDaily: true
      },
      {
        id: 'daily_five_star_review',
        title: 'Obtiens un retour 5 étoiles',
        description: 'Reçois un avis client "5 étoiles" dans la journée',
        target: 1,
        current: fiveStarReview ? 1 : 0,
        progress: fiveStarReview ? 100 : 0,
        xpReward: 80,
        badgeReward: 'Excellence Client',
        status: fiveStarReview ? 'completed' : 'active',
        icon: '⭐',
        type: 'daily',
        category: 'customer_service',
        resetDaily: true
      },
      {
        id: 'daily_help_colleague',
        title: 'Aide spontanément un·e collègue',
        description: 'Assiste sur une tâche qui n\'est pas la tienne',
        target: 1,
        current: helpedColleague ? 1 : 0,
        progress: helpedColleague ? 100 : 0,
        xpReward: 60,
        badgeReward: 'Esprit d\'Équipe',
        status: helpedColleague ? 'completed' : 'active',
        icon: '🤝',
        type: 'daily',
        category: 'teamwork',
        resetDaily: true
      },
      {
        id: 'daily_security_check',
        title: 'Tour sécurité complet',
        description: 'Vérifie portes, extincteurs, plans d\'évacuation, alarmes',
        target: 1,
        current: securityCheckDone ? 1 : 0,
        progress: securityCheckDone ? 100 : 0,
        xpReward: 70,
        badgeReward: 'Gardien Sécurité',
        status: securityCheckDone ? 'completed' : 'active',
        icon: '🛡️',
        type: 'daily',
        category: 'security',
        resetDaily: true
      },
      {
        id: 'daily_conflict_resolution',
        title: 'Gère un mini-conflit',
        description: 'Résous une situation tendue de façon autonome et débriefe',
        target: 1,
        current: conflictResolved ? 1 : 0,
        progress: conflictResolved ? 100 : 0,
        xpReward: 90,
        badgeReward: 'Médiateur',
        status: conflictResolved ? 'completed' : 'active',
        icon: '🎯',
        type: 'daily',
        category: 'leadership',
        resetDaily: true
      },
      {
        id: 'daily_technical_fix',
        title: 'Dépanne un élément technique',
        description: 'Répare une panne, bug ou accessoire dans la journée',
        target: 1,
        current: technicalFixDone ? 1 : 0,
        progress: technicalFixDone ? 100 : 0,
        xpReward: 65,
        badgeReward: 'Technicien Express',
        status: technicalFixDone ? 'completed' : 'active',
        icon: '🔧',
        type: 'daily',
        category: 'maintenance',
        resetDaily: true
      },
      {
        id: 'daily_social_content',
        title: 'Propose du contenu réseaux sociaux',
        description: 'Publie ou propose une idée de contenu/story',
        target: 1,
        current: socialContentProposed ? 1 : 0,
        progress: socialContentProposed ? 100 : 0,
        xpReward: 55,
        badgeReward: 'Community Manager',
        status: socialContentProposed ? 'completed' : 'active',
        icon: '📱',
        type: 'daily',
        category: 'marketing',
        resetDaily: true
      },

      // =======================================
      // 🗓️ OBJECTIFS HEBDOMADAIRES - "DÉFIS SPÉCIAUX"
      // =======================================
      {
        id: 'weekly_positive_reviews',
        title: 'Obtenir 5 avis clients positifs',
        description: 'Reçois au moins 5 avis positifs sur Google, TripAdvisor ou Facebook',
        target: 5,
        current: positiveReviewsWeek,
        progress: Math.min(100, (positiveReviewsWeek / 5) * 100),
        xpReward: 150,
        badgeReward: 'Champion Satisfaction',
        status: positiveReviewsWeek >= 5 ? 'completed' : 'active',
        icon: '🌟',
        type: 'weekly',
        category: 'customer_service',
        resetWeekly: true
      },
      {
        id: 'weekly_openings_closings',
        title: '2 ouvertures et 2 fermetures',
        description: 'Effectue 2 ouvertures et 2 fermetures dans la semaine',
        target: 4,
        current: openingsClosingsWeek,
        progress: Math.min(100, (openingsClosingsWeek / 4) * 100),
        xpReward: 120,
        badgeReward: 'Maître des Clés',
        status: openingsClosingsWeek >= 4 ? 'completed' : 'active',
        icon: '🗝️',
        type: 'weekly',
        category: 'responsibility',
        resetWeekly: true
      },
      {
        id: 'weekly_weekend_work',
        title: 'Travaille un week-end entier',
        description: 'Assure le service sur un week-end complet',
        target: 1,
        current: weekendWorked ? 1 : 0,
        progress: weekendWorked ? 100 : 0,
        xpReward: 180,
        badgeReward: 'Guerrier Weekend',
        status: weekendWorked ? 'completed' : 'active',
        icon: '🎪',
        type: 'weekly',
        category: 'dedication',
        resetWeekly: true
      },
      {
        id: 'weekly_all_rooms',
        title: 'Anime chaque salle',
        description: 'Anime au moins une session dans chaque salle (escape ET quiz)',
        target: 1,
        current: allRoomsAnimated ? 1 : 0,
        progress: allRoomsAnimated ? 100 : 0,
        xpReward: 140,
        badgeReward: 'Maître Polyvalent',
        status: allRoomsAnimated ? 'completed' : 'active',
        icon: '🎭',
        type: 'weekly',
        category: 'versatility',
        resetWeekly: true
      },
      {
        id: 'weekly_replacement',
        title: 'Assure un remplacement',
        description: 'Dépanne sur un shift non prévu dans la semaine',
        target: 1,
        current: replacementDone ? 1 : 0,
        progress: replacementDone ? 100 : 0,
        xpReward: 100,
        badgeReward: 'Sauveur d\'Équipe',
        status: replacementDone ? 'completed' : 'active',
        icon: '🚑',
        type: 'weekly',
        category: 'flexibility',
        resetWeekly: true
      },
      {
        id: 'weekly_decoration_change',
        title: 'Améliore la déco d\'une salle',
        description: 'Propose ou réalise un changement dans la mise en scène',
        target: 1,
        current: decorationChanged ? 1 : 0,
        progress: decorationChanged ? 100 : 0,
        xpReward: 110,
        badgeReward: 'Décorateur Créatif',
        status: decorationChanged ? 'completed' : 'active',
        icon: '🎨',
        type: 'weekly',
        category: 'creativity',
        resetWeekly: true
      },
      {
        id: 'weekly_immersion_idea',
        title: 'Propose une astuce immersion',
        description: 'Améliore l\'accueil ou l\'immersion (musique, lumière, décor)',
        target: 1,
        current: immersionIdeaProposed ? 1 : 0,
        progress: immersionIdeaProposed ? 100 : 0,
        xpReward: 95,
        badgeReward: 'Architecte Immersion',
        status: immersionIdeaProposed ? 'completed' : 'active',
        icon: '🌟',
        type: 'weekly',
        category: 'innovation',
        resetWeekly: true
      },
      {
        id: 'weekly_wellbeing_moment',
        title: 'Organise un moment bien-être',
        description: 'Propose une pause collective ou moment convivial avec un collègue',
        target: 1,
        current: wellbeingMomentOrganized ? 1 : 0,
        progress: wellbeingMomentOrganized ? 100 : 0,
        xpReward: 85,
        badgeReward: 'Ambassadeur Bien-être',
        status: wellbeingMomentOrganized ? 'completed' : 'active',
        icon: '☕',
        type: 'weekly',
        category: 'teamwork',
        resetWeekly: true
      },
      {
        id: 'weekly_unexpected_situation',
        title: 'Gère une situation inattendue',
        description: 'Traite un imprévu sans aide du manager (avec validation après)',
        target: 1,
        current: unexpectedSituationHandled ? 1 : 0,
        progress: unexpectedSituationHandled ? 100 : 0,
        xpReward: 160,
        badgeReward: 'Manager Autonome',
        status: unexpectedSituationHandled ? 'completed' : 'active',
        icon: '🎯',
        type: 'weekly',
        category: 'leadership',
        resetWeekly: true
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
      console.log('🎯 Réclamation objectif quotidien/hebdomadaire:', objective.id, 'pour utilisateur:', userId);

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
        category: objective.category,
        claimedAt: serverTimestamp(),
        type: objective.type,
        resetDate: this.getResetDate(objective.type)
      };

      // Calcul bonus selon la catégorie
      const categoryBonus = this.calculateCategoryBonus(objective.category);
      const totalXpReward = objective.xpReward + categoryBonus;

      // Mise à jour atomique avec bonus de catégorie
      await updateDoc(userRef, {
        // Ajouter les XP avec bonus
        'gamification.totalXp': increment(totalXpReward),
        'gamification.weeklyXp': increment(totalXpReward),
        'gamification.monthlyXp': increment(totalXpReward),
        
        // Stats spécifiques objectifs quotidiens/hebdomadaires
        'objectiveStats.totalCompleted': increment(1),
        'objectiveStats.totalXpFromObjectives': increment(totalXpReward),
        [`objectiveStats.${objective.category}Count`]: increment(1),
        
        // Enregistrer l'objectif réclamé
        'objectives.claimed': arrayUnion(claimId),
        'objectives.history': arrayUnion(claimedEntry),
        
        // Métadonnées
        'gamification.lastXpGain': totalXpReward,
        'gamification.lastXpReason': `Objectif ${objective.type}: ${objective.title}`,
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
              unlockedAt: serverTimestamp(),
              source: `objective_${objective.type}`
            })
          });
          
          console.log(`🎉 Niveau augmenté via objectif ${objective.type} ! Nouveau niveau: ${newLevel}`);
        }
      }

      console.log(`✅ Objectif ${objective.type} réclamé: +${totalXpReward} XP (bonus: +${categoryBonus})`);
      
      return {
        success: true,
        xpGained: totalXpReward,
        baseXp: objective.xpReward,
        bonusXp: categoryBonus,
        claimId: claimId,
        levelUp: false // sera mis à jour après vérification
      };

    } catch (error) {
      console.error('❌ Erreur réclamation objectif:', error);
      throw new Error(`Impossible de réclamer l'objectif: ${error.message}`);
    }
  }

  /**
   * 🎨 CALCULER LE BONUS XP SELON LA CATÉGORIE
   */
  calculateCategoryBonus(category) {
    const bonusMap = {
      'innovation': 15,        // Bonus innovation
      'flexibility': 20,       // Bonus flexibilité  
      'customer_service': 25,  // Bonus service client
      'teamwork': 10,         // Bonus travail équipe
      'security': 12,         // Bonus sécurité
      'leadership': 30,       // Bonus leadership
      'maintenance': 8,       // Bonus maintenance
      'marketing': 18,        // Bonus marketing
      'responsibility': 22,   // Bonus responsabilité
      'dedication': 35,       // Bonus dévouement
      'versatility': 25,      // Bonus polyvalence
      'creativity': 20        // Bonus créativité
    };
    
    return bonusMap[category] || 5; // Bonus par défaut
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
        
      default:
        return null;
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
      
      // Marquer les objectifs déjà réclamés avec bonus de catégorie
      const objectivesWithStatus = availableObjectives.map(objective => {
        const today = new Date().toISOString().split('T')[0];
        const claimId = this.generateClaimId(objective.id, objective.type, today);
        const isClaimed = claimedObjectives.includes(claimId);
        const categoryBonus = this.calculateCategoryBonus(objective.category);
        
        return {
          ...objective,
          isClaimed,
          claimId,
          canClaim: objective.status === 'completed' && !isClaimed,
          categoryBonus,
          totalXpReward: objective.xpReward + categoryBonus
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
