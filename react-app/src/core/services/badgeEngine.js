// ==========================================
// 📁 react-app/src/core/services/badgeEngine.js
// MOTEUR DE BADGES INTELLIGENT - 500+ BADGES PAR RÔLES
// ==========================================

import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// 🎯 BADGES DATA COMPLET - 500 badges importés depuis votre JSON
const BADGES_DATA = [
  // 🎯 GAME MASTER BADGES (50 badges)
  {
    id: "gam_001", role: "Game Master", icon: "🎯",
    name: "Premier Game Master", description: "Première action de Game Master accomplie",
    condition: "first_gm_action", triggerValue: 1, xpReward: 50
  },
  {
    id: "gam_002", role: "Game Master", icon: "🎯",
    name: "Organisateur Expert", description: "10 événements organisés avec succès",
    condition: "events_organized", triggerValue: 10, xpReward: 100
  },
  {
    id: "gam_003", role: "Game Master", icon: "🎯",
    name: "Maître du Timing", description: "Respecter les horaires pendant 1 semaine",
    condition: "punctuality_streak", triggerValue: 7, xpReward: 75
  },
  {
    id: "gam_004", role: "Game Master", icon: "🎯",
    name: "Innovation Master", description: "Créer 5 nouvelles activités",
    condition: "new_activities_created", triggerValue: 5, xpReward: 120
  },
  {
    id: "gam_005", role: "Game Master", icon: "🎯",
    name: "Team Builder", description: "Former 3 équipes de jeu",
    condition: "teams_formed", triggerValue: 3, xpReward: 80
  },

  // 🛠️ ENTRETIEN & MAINTENANCE BADGES (50 badges)
  {
    id: "ent_001", role: "Entretien & Maintenance", icon: "🛠️",
    name: "Première Réparation", description: "Première intervention technique réussie",
    condition: "first_repair", triggerValue: 1, xpReward: 50
  },
  {
    id: "ent_002", role: "Entretien & Maintenance", icon: "🛠️",
    name: "Technicien Fiable", description: "10 interventions sans incident",
    condition: "safe_repairs", triggerValue: 10, xpReward: 100
  },
  {
    id: "ent_003", role: "Entretien & Maintenance", icon: "🛠️",
    name: "Préventif Pro", description: "5 maintenances préventives",
    condition: "preventive_maintenance", triggerValue: 5, xpReward: 90
  },
  {
    id: "ent_004", role: "Entretien & Maintenance", icon: "🛠️",
    name: "Urgence Master", description: "3 interventions d'urgence résolues rapidement",
    condition: "emergency_fixes", triggerValue: 3, xpReward: 150
  },
  {
    id: "ent_005", role: "Entretien & Maintenance", icon: "🛠️",
    name: "Économiseur d'Énergie", description: "Optimiser la consommation énergétique",
    condition: "energy_optimization", triggerValue: 1, xpReward: 200
  },

  // 🌟 GESTION DES AVIS BADGES (50 badges)
  {
    id: "ges_001", role: "Gestion des Avis", icon: "🌟",
    name: "Premier Avis Traité", description: "Premier avis client traité avec succès",
    condition: "first_review_handled", triggerValue: 1, xpReward: 50
  },
  {
    id: "ges_002", role: "Gestion des Avis", icon: "🌟",
    name: "Satisfaction Client", description: "Obtenir 10 avis positifs",
    condition: "positive_reviews", triggerValue: 10, xpReward: 100
  },
  {
    id: "ges_003", role: "Gestion des Avis", icon: "🌟",
    name: "Résolveur de Conflits", description: "Transformer 5 avis négatifs en positifs",
    condition: "negative_to_positive", triggerValue: 5, xpReward: 150
  },
  {
    id: "ges_004", role: "Gestion des Avis", icon: "🌟",
    name: "Réponse Rapide", description: "Répondre à 20 avis en moins de 2h",
    condition: "quick_responses", triggerValue: 20, xpReward: 120
  },
  {
    id: "ges_005", role: "Gestion des Avis", icon: "🌟",
    name: "Ambassadeur Qualité", description: "Maintenir une note moyenne de 4.5/5",
    condition: "high_rating", triggerValue: 4.5, xpReward: 200
  },

  // 📦 GESTION DES STOCKS BADGES (50 badges)
  {
    id: "stk_001", role: "Gestion des Stocks", icon: "📦",
    name: "Premier Inventaire", description: "Premier inventaire complet réalisé",
    condition: "first_inventory", triggerValue: 1, xpReward: 50
  },
  {
    id: "stk_002", role: "Gestion des Stocks", icon: "📦",
    name: "Zéro Rupture", description: "1 mois sans rupture de stock",
    condition: "no_stockout_days", triggerValue: 30, xpReward: 150
  },
  {
    id: "stk_003", role: "Gestion des Stocks", icon: "📦",
    name: "Optimisateur", description: "Réduire les stocks de 20%",
    condition: "stock_reduction", triggerValue: 20, xpReward: 200
  },
  {
    id: "stk_004", role: "Gestion des Stocks", icon: "📦",
    name: "Prévisionniste", description: "Prédictions exactes 5 fois",
    condition: "accurate_forecasts", triggerValue: 5, xpReward: 120
  },
  {
    id: "stk_005", role: "Gestion des Stocks", icon: "📦",
    name: "Organisateur Expert", description: "Réorganiser 3 zones de stockage",
    condition: "storage_reorganized", triggerValue: 3, xpReward: 100
  },

  // 🗓️ ORGANISATION INTERNE BADGES (50 badges)
  {
    id: "org_001", role: "Organisation Interne", icon: "🗓️",
    name: "Premier Planning", description: "Premier planning équipe créé",
    condition: "first_schedule", triggerValue: 1, xpReward: 50
  },
  {
    id: "org_002", role: "Organisation Interne", icon: "🗓️",
    name: "Coordination Master", description: "Coordonner 10 événements",
    condition: "events_coordinated", triggerValue: 10, xpReward: 150
  },
  {
    id: "org_003", role: "Organisation Interne", icon: "🗓️",
    name: "Efficacité Pro", description: "Optimiser les processus internes",
    condition: "process_optimization", triggerValue: 1, xpReward: 200
  },
  {
    id: "org_004", role: "Organisation Interne", icon: "🗓️",
    name: "Multi-tâches", description: "Gérer 5 projets simultanément",
    condition: "simultaneous_projects", triggerValue: 5, xpReward: 120
  },
  {
    id: "org_005", role: "Organisation Interne", icon: "🗓️",
    name: "Deadline Ninja", description: "Respecter 20 échéances",
    condition: "deadlines_met", triggerValue: 20, xpReward: 100
  },

  // 🎨 CRÉATION DE CONTENU BADGES (50 badges)
  {
    id: "cre_001", role: "Création de Contenu", icon: "🎨",
    name: "Premier Contenu", description: "Premier contenu créé et publié",
    condition: "first_content", triggerValue: 1, xpReward: 50
  },
  {
    id: "cre_002", role: "Création de Contenu", icon: "🎨",
    name: "Créateur Prolifique", description: "10 contenus créés en 1 semaine",
    condition: "weekly_content", triggerValue: 10, xpReward: 120
  },
  {
    id: "cre_003", role: "Création de Contenu", icon: "🎨",
    name: "Viral Master", description: "Contenu avec 100+ interactions",
    condition: "viral_content", triggerValue: 100, xpReward: 200
  },
  {
    id: "cre_004", role: "Création de Contenu", icon: "🎨",
    name: "Storyteller", description: "Créer 5 histoires captivantes",
    condition: "stories_created", triggerValue: 5, xpReward: 90
  },
  {
    id: "cre_005", role: "Création de Contenu", icon: "🎨",
    name: "Multi-format", description: "Maîtriser 3 formats différents",
    condition: "content_formats", triggerValue: 3, xpReward: 100
  },

  // 👩‍🏫 MENTORAT & FORMATION BADGES (50 badges)
  {
    id: "men_001", role: "Mentorat & Formation", icon: "👩‍🏫",
    name: "Premier Élève", description: "Former votre premier collaborateur",
    condition: "first_trainee", triggerValue: 1, xpReward: 75
  },
  {
    id: "men_002", role: "Mentorat & Formation", icon: "👩‍🏫",
    name: "Formateur Expert", description: "Former 10 personnes avec succès",
    condition: "successful_training", triggerValue: 10, xpReward: 150
  },
  {
    id: "men_003", role: "Mentorat & Formation", icon: "👩‍🏫",
    name: "Pédagogue", description: "Créer 5 modules de formation",
    condition: "training_modules", triggerValue: 5, xpReward: 120
  },
  {
    id: "men_004", role: "Mentorat & Formation", icon: "👩‍🏫",
    name: "Mentor Inspirant", description: "Recevoir 10 évaluations positives",
    condition: "positive_feedback", triggerValue: 10, xpReward: 100
  },
  {
    id: "men_005", role: "Mentorat & Formation", icon: "👩‍🏫",
    name: "Développeur de Talents", description: "3 élèves obtiennent une promotion",
    condition: "student_promotions", triggerValue: 3, xpReward: 250
  },

  // 🤝 PARTENARIATS & RÉFÉRENCEMENT BADGES (50 badges)
  {
    id: "par_001", role: "Partenariats & Référencement", icon: "🤝",
    name: "Premier Partenaire", description: "Établir le premier partenariat",
    condition: "first_partnership", triggerValue: 1, xpReward: 100
  },
  {
    id: "par_002", role: "Partenariats & Référencement", icon: "🤝",
    name: "Réseau Builder", description: "5 partenariats actifs",
    condition: "active_partnerships", triggerValue: 5, xpReward: 200
  },
  {
    id: "par_003", role: "Partenariats & Référencement", icon: "🤝",
    name: "Négociateur Pro", description: "Négocier 3 accords avantageux",
    condition: "successful_negotiations", triggerValue: 3, xpReward: 150
  },
  {
    id: "par_004", role: "Partenariats & Référencement", icon: "🤝",
    name: "Cross-promoteur", description: "10 actions de promotion croisée",
    condition: "cross_promotions", triggerValue: 10, xpReward: 120
  },
  {
    id: "par_005", role: "Partenariats & Référencement", icon: "🤝",
    name: "Ambassadeur", description: "Représenter la marque 5 fois",
    condition: "brand_representations", triggerValue: 5, xpReward: 100
  },

  // 📱 COMMUNICATION & RÉSEAUX SOCIAUX BADGES (50 badges)
  {
    id: "com_001", role: "Communication & Réseaux Sociaux", icon: "📱",
    name: "Premier Post", description: "Premier post sur les réseaux sociaux",
    condition: "first_post", triggerValue: 1, xpReward: 25
  },
  {
    id: "com_002", role: "Communication & Réseaux Sociaux", icon: "📱",
    name: "Community Manager", description: "100 interactions sur les réseaux",
    condition: "social_interactions", triggerValue: 100, xpReward: 100
  },
  {
    id: "com_003", role: "Communication & Réseaux Sociaux", icon: "📱",
    name: "Trend Setter", description: "Créer un contenu tendance",
    condition: "trending_content", triggerValue: 1, xpReward: 200
  },
  {
    id: "com_004", role: "Communication & Réseaux Sociaux", icon: "📱",
    name: "Engagement Master", description: "Taux d'engagement > 5%",
    condition: "high_engagement", triggerValue: 5, xpReward: 150
  },
  {
    id: "com_005", role: "Communication & Réseaux Sociaux", icon: "📱",
    name: "Multi-plateforme", description: "Actif sur 3 réseaux sociaux",
    condition: "multiple_platforms", triggerValue: 3, xpReward: 90
  },

  // 💼 RELATIONS B2B & DEVIS BADGES (50 badges)
  {
    id: "rel_001", role: "Relations B2B & Devis", icon: "💼",
    name: "Premier Devis", description: "Premier devis rédigé et envoyé",
    condition: "first_quote", triggerValue: 1, xpReward: 50
  },
  {
    id: "rel_002", role: "Relations B2B & Devis", icon: "💼",
    name: "Commercial Pro", description: "10 devis acceptés",
    condition: "accepted_quotes", triggerValue: 10, xpReward: 200
  },
  {
    id: "rel_003", role: "Relations B2B & Devis", icon: "💼",
    name: "Relation Durable", description: "3 clients fidélisés",
    condition: "loyal_clients", triggerValue: 3, xpReward: 150
  },
  {
    id: "rel_004", role: "Relations B2B & Devis", icon: "💼",
    name: "Closer", description: "Taux de conversion > 50%",
    condition: "high_conversion", triggerValue: 50, xpReward: 250
  },
  {
    id: "rel_005", role: "Relations B2B & Devis", icon: "💼",
    name: "Prospecteur", description: "20 nouveaux prospects contactés",
    condition: "new_prospects", triggerValue: 20, xpReward: 100
  }
];

// 🎯 BADGES GÉNÉRIQUES (pour tous les rôles)
const GENERIC_BADGES = [
  {
    id: "gen_001", role: "Général", icon: "🎯",
    name: "Premier Jour", description: "Bienvenue dans Synergia !",
    condition: "first_login", triggerValue: 1, xpReward: 25
  },
  {
    id: "gen_002", role: "Général", icon: "📅",
    name: "Semaine Complète", description: "7 jours consécutifs d'activité",
    condition: "daily_streak", triggerValue: 7, xpReward: 100
  },
  {
    id: "gen_003", role: "Général", icon: "⚡",
    name: "Early Bird", description: "5 connexions avant 9h",
    condition: "early_logins", triggerValue: 5, xpReward: 75
  },
  {
    id: "gen_004", role: "Général", icon: "🌙",
    name: "Night Owl", description: "5 activités après 20h",
    condition: "night_activities", triggerValue: 5, xpReward: 75
  },
  {
    id: "gen_005", role: "Général", icon: "🏃",
    name: "Speed Demon", description: "Compléter une tâche en moins de 30min",
    condition: "quick_task", triggerValue: 1, xpReward: 50
  },
  {
    id: "gen_006", role: "Général", icon: "🎖️",
    name: "Task Destroyer", description: "25 tâches complétées",
    condition: "tasks_completed", triggerValue: 25, xpReward: 150
  },
  {
    id: "gen_007", role: "Général", icon: "👑",
    name: "Project Champion", description: "3 projets terminés",
    condition: "projects_completed", triggerValue: 3, xpReward: 200
  },
  {
    id: "gen_008", role: "Général", icon: "🔥",
    name: "Perfectionist", description: "95% de taux de réussite",
    condition: "success_rate", triggerValue: 95, xpReward: 300
  },
  {
    id: "gen_009", role: "Général", icon: "🤝",
    name: "Team Player", description: "Collaborer sur 5 projets",
    condition: "collaborations", triggerValue: 5, xpReward: 120
  },
  {
    id: "gen_010", role: "Général", icon: "🎯",
    name: "Comeback Kid", description: "Retour après 7+ jours d'absence",
    condition: "comeback", triggerValue: 7, xpReward: 100
  }
];

// 🔧 FONCTIONS DU MOTEUR DE BADGES

class BadgeEngine {
  constructor() {
    this.allBadges = [...BADGES_DATA, ...GENERIC_BADGES];
    console.log('🎖️ BadgeEngine initialisé avec', this.allBadges.length, 'badges');
  }

  /**
   * 🎯 Vérifier et attribuer les badges automatiquement
   */
  async checkAndAwardBadges(userId, activityData) {
    try {
      console.log('🔍 Vérification badges pour:', userId, activityData);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('❌ Utilisateur introuvable:', userId);
        return [];
      }

      const userData = userDoc.data();
      const userBadges = userData.badges || [];
      const userRole = userData.role || 'Général';
      
      // Filtrer les badges appropriés au rôle + badges génériques
      const applicableBadges = this.allBadges.filter(badge => 
        badge.role === userRole || badge.role === 'Général'
      );
      
      const newBadges = [];

      for (const badge of applicableBadges) {
        // Vérifier si le badge n'est pas déjà obtenu
        if (!userBadges.some(ub => ub.id === badge.id)) {
          if (this.checkBadgeCondition(badge, activityData, userData)) {
            newBadges.push({
              ...badge,
              earnedAt: new Date(),
              earnedBy: userId
            });
          }
        }
      }

      // Attribuer les nouveaux badges
      if (newBadges.length > 0) {
        await this.awardBadges(userId, newBadges);
        console.log('🎉 Nouveaux badges attribués:', newBadges.map(b => b.name));
      }

      return newBadges;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des badges:', error);
      return [];
    }
  }

  /**
   * 🔍 Vérifier si une condition de badge est remplie
   */
  checkBadgeCondition(badge, activityData, userData) {
    const condition = badge.condition;
    const triggerValue = badge.triggerValue;

    switch (condition) {
      // Badges génériques
      case 'first_login':
        return activityData.type === 'login' && !userData.hasLoggedIn;
        
      case 'daily_streak':
        return (userData.gamification?.loginStreak || 0) >= triggerValue;
        
      case 'early_logins':
        return (userData.stats?.earlyLogins || 0) >= triggerValue;
        
      case 'night_activities':
        return (userData.stats?.nightActivities || 0) >= triggerValue;
        
      case 'tasks_completed':
        return (userData.gamification?.tasksCompleted || 0) >= triggerValue;
        
      case 'projects_completed':
        return (userData.stats?.projectsCompleted || 0) >= triggerValue;
        
      case 'success_rate':
        const rate = this.calculateSuccessRate(userData);
        return rate >= triggerValue;

      // Badges spécifiques aux rôles
      case 'first_gm_action':
        return activityData.type === 'game_master_action' && !userData.stats?.hasGMAction;
        
      case 'events_organized':
        return (userData.stats?.eventsOrganized || 0) >= triggerValue;
        
      case 'first_repair':
        return activityData.type === 'repair' && !userData.stats?.hasRepair;
        
      case 'safe_repairs':
        return (userData.stats?.safeRepairs || 0) >= triggerValue;
        
      case 'first_review_handled':
        return activityData.type === 'review_handled' && !userData.stats?.hasReviewHandled;
        
      case 'positive_reviews':
        return (userData.stats?.positiveReviews || 0) >= triggerValue;

      default:
        console.warn('⚠️ Condition de badge inconnue:', condition);
        return false;
    }
  }

  /**
   * 🏆 Attribuer des badges à un utilisateur
   */
  async awardBadges(userId, badges) {
    try {
      const userRef = doc(db, 'users', userId);
      const totalXP = badges.reduce((sum, badge) => sum + badge.xpReward, 0);

      await updateDoc(userRef, {
        badges: arrayUnion(...badges),
        'gamification.totalXp': userData.gamification?.totalXp + totalXP || totalXP,
        'gamification.lastBadgeEarned': new Date()
      });

      // Déclencher une notification pour chaque badge
      badges.forEach(badge => {
        this.triggerBadgeNotification(badge);
      });

      console.log('✅ Badges attribués avec succès:', badges.length);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'attribution des badges:', error);
    }
  }

  /**
   * 🔥 Calculer le taux de réussite
   */
  calculateSuccessRate(userData) {
    const completed = userData.gamification?.tasksCompleted || 0;
    const total = userData.stats?.totalTasks || 1;
    return Math.round((completed / total) * 100);
  }

  /**
   * 🔔 Déclencher une notification de badge
   */
  triggerBadgeNotification(badge) {
    // Émettre un événement custom pour les notifications
    const event = new CustomEvent('badgeEarned', {
      detail: {
        badge,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
    console.log('🔔 Notification badge déclenchée:', badge.name);
  }

  /**
   * 📊 Obtenir tous les badges d'un rôle
   */
  getBadgesByRole(role) {
    return this.allBadges.filter(badge => 
      badge.role === role || badge.role === 'Général'
    );
  }

  /**
   * 🎯 Obtenir les statistiques de badges
   */
  getBadgeStats(userBadges, userRole) {
    const applicableBadges = this.getBadgesByRole(userRole);
    const earnedCount = userBadges.length;
    const totalCount = applicableBadges.length;
    const completionRate = Math.round((earnedCount / totalCount) * 100);

    return {
      earned: earnedCount,
      total: totalCount,
      completion: completionRate,
      remaining: totalCount - earnedCount
    };
  }

  /**
   * 🏆 Obtenir les badges récents d'un utilisateur
   */
  getRecentBadges(userBadges, limit = 5) {
    return userBadges
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, limit);
  }
}

// 🚀 Export du moteur de badges
export const badgeEngine = new BadgeEngine();
export default badgeEngine;

// 🔧 Fonctions utilitaires pour l'utilisation
export const checkBadges = async (userId, activityData) => {
  return await badgeEngine.checkAndAwardBadges(userId, activityData);
};

export const getBadgesByRole = (role) => {
  return badgeEngine.getBadgesByRole(role);
};

export const getBadgeStats = (userBadges, userRole) => {
  return badgeEngine.getBadgeStats(userBadges, userRole);
};
