// ==========================================
// react-app/src/core/services/aiAssistantService.js
// SERVICE D'ASSISTANT IA - SUGGESTIONS INTELLIGENTES
// Version gratuite basée sur des algorithmes
// ==========================================

import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================

const PERSONALITY = {
  name: 'Nova',
  emoji: '🤖',
  greetings: [
    "Salut ! Je suis Nova, ton assistant Synergia !",
    "Hey ! Prêt pour une nouvelle aventure ?",
    "Bonjour aventurier ! Comment puis-je t'aider ?",
    "Coucou ! Nova à ton service !",
    "Hello ! Qu'est-ce qu'on accomplit aujourd'hui ?"
  ],
  encouragements: [
    "Tu fais du super boulot ! Continue comme ça ! 💪",
    "Impressionnant ! Tu progresses vraiment bien ! 🌟",
    "Bravo ! Chaque petit pas compte ! 🎯",
    "Tu es sur la bonne voie ! Ne lâche rien ! 🚀",
    "Excellent travail ! Tu inspires les autres ! ✨"
  ]
};

// ==========================================
// TEMPLATES DE QUÊTES SUGGÉRÉES
// ==========================================

const QUEST_TEMPLATES = {
  productivity: [
    { title: "Terminer 3 tâches avant midi", xp: 30, difficulty: 'easy', icon: '⚡' },
    { title: "Atteindre 100% de productivité aujourd'hui", xp: 50, difficulty: 'medium', icon: '🎯' },
    { title: "Organiser ton espace de travail", xp: 20, difficulty: 'easy', icon: '🧹' },
    { title: "Répondre à tous les messages en attente", xp: 25, difficulty: 'easy', icon: '💬' },
    { title: "Créer une to-do list pour la semaine", xp: 35, difficulty: 'medium', icon: '📝' }
  ],
  collaboration: [
    { title: "Aider un collègue sur une tâche", xp: 40, difficulty: 'medium', icon: '🤝' },
    { title: "Organiser une réunion d'équipe", xp: 45, difficulty: 'medium', icon: '👥' },
    { title: "Partager une bonne pratique avec l'équipe", xp: 35, difficulty: 'easy', icon: '💡' },
    { title: "Donner 3 boosts à des collègues", xp: 30, difficulty: 'easy', icon: '⚡' },
    { title: "Proposer une amélioration pour l'équipe", xp: 50, difficulty: 'medium', icon: '🚀' }
  ],
  learning: [
    { title: "Apprendre une nouvelle compétence", xp: 60, difficulty: 'hard', icon: '📚' },
    { title: "Regarder un tutoriel de 15 min", xp: 25, difficulty: 'easy', icon: '🎬' },
    { title: "Lire un article professionnel", xp: 20, difficulty: 'easy', icon: '📖' },
    { title: "Partager tes connaissances avec un junior", xp: 45, difficulty: 'medium', icon: '🎓' },
    { title: "Documenter une procédure", xp: 40, difficulty: 'medium', icon: '📋' }
  ],
  challenges: [
    { title: "Doubler ton XP habituel aujourd'hui", xp: 100, difficulty: 'hard', icon: '🔥' },
    { title: "Compléter 5 quêtes d'affilée", xp: 75, difficulty: 'hard', icon: '⚔️' },
    { title: "Obtenir un nouveau badge", xp: 80, difficulty: 'hard', icon: '🏅' },
    { title: "Atteindre le top 3 du classement", xp: 120, difficulty: 'legendary', icon: '👑' },
    { title: "Battre ton record personnel", xp: 90, difficulty: 'hard', icon: '🏆' }
  ]
};

// ==========================================
// TEMPLATES DE CONSEILS
// ==========================================

const TIPS_DATABASE = {
  productivity: [
    "💡 Astuce : Commence par la tâche la plus difficile le matin quand ton énergie est au max !",
    "💡 Le saviez-vous ? Travailler par blocs de 25 min avec 5 min de pause (Pomodoro) booste la productivité de 25% !",
    "💡 Conseil : Désactive les notifications pendant tes sessions de concentration intense.",
    "💡 Pro tip : Prépare ta journée la veille au soir pour un démarrage plus efficace !",
    "💡 Hack : Utilise la règle des 2 minutes - si ça prend moins de 2 min, fais-le maintenant !"
  ],
  gamification: [
    "🎮 Astuce XP : Les quêtes collaboratives donnent +50% de XP bonus !",
    "🎮 Secret : Compléter des quêtes en série débloque des bonus cachés !",
    "🎮 Pro tip : Les badges rares donnent plus de XP que plusieurs badges communs.",
    "🎮 Conseil : Visite le skill tree pour maximiser tes points de compétences !",
    "🎮 Le savais-tu ? Les boosts envoyés aux collègues te rapportent aussi de l'XP !"
  ],
  team: [
    "👥 Conseil : Un boost envoyé à un collègue lui fait vraiment plaisir ET te rapporte de l'XP !",
    "👥 Astuce : Participe aux challenges d'équipe - les récompenses sont plus importantes !",
    "👥 Le savais-tu ? Mentorer un junior débloque des badges exclusifs !",
    "👥 Pro tip : Consulte le classement pour voir qui pourrait avoir besoin d'encouragements !",
    "👥 Secret : Les équipes qui collaborent le plus ont +40% de XP en moyenne !"
  ],
  badges: [
    "🏅 Astuce : Certains badges sont cachés - explore toutes les fonctionnalités !",
    "🏅 Le savais-tu ? Il existe des badges saisonniers disponibles uniquement certains mois !",
    "🏅 Pro tip : Les badges 'First' sont les plus rares - sois le premier à accomplir quelque chose !",
    "🏅 Conseil : Consulte ta collection de badges pour voir lesquels sont presque débloqués !",
    "🏅 Secret : Combiner certaines actions débloque des badges combo !"
  ],
  general: [
    "✨ Rappel : N'oublie pas de pointer ton arrivée pour valider ta présence !",
    "✨ Conseil : Consulte tes statistiques pour voir ta progression sur le mois.",
    "✨ Astuce : Personnalise ton avatar pour te démarquer dans le classement !",
    "✨ Pro tip : Les notifications push t'alertent des événements importants en temps réel.",
    "✨ Le savais-tu ? Tu peux exporter tes données depuis la page profil !"
  ]
};

// ==========================================
// TUTORIEL INTERACTIF
// ==========================================

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Synergia !',
    message: "Je suis Nova, ton assistant personnel. Je vais te guider dans cette aventure professionnelle gamifiée ! 🎮",
    target: null,
    action: 'Commencer'
  },
  {
    id: 'dashboard',
    title: 'Ton Dashboard',
    message: "Ici tu vois ton niveau, tes XP et ta progression. C'est le centre de commande de ton aventure !",
    target: '/dashboard',
    highlight: '.level-card',
    action: 'Suivant'
  },
  {
    id: 'quests',
    title: 'Les Quêtes',
    message: "Les quêtes sont des tâches à accomplir. Chaque quête terminée te rapporte de l'XP ! ⚔️",
    target: '/tasks',
    action: 'Suivant'
  },
  {
    id: 'badges',
    title: 'Les Badges',
    message: "Accomplis des actions spéciales pour débloquer des badges. Certains sont très rares ! 🏅",
    target: '/badges',
    action: 'Suivant'
  },
  {
    id: 'team',
    title: 'Ton Équipe',
    message: "Collabore avec ton équipe ! Tu peux envoyer des boosts et participer aux challenges collectifs. 👥",
    target: '/team',
    action: 'Suivant'
  },
  {
    id: 'profile',
    title: 'Ton Profil',
    message: "Personnalise ton avatar, gère tes notifications et suis tes statistiques détaillées. 📊",
    target: '/profile',
    action: 'Suivant'
  },
  {
    id: 'complete',
    title: 'Tu es prêt !',
    message: "C'est parti pour l'aventure ! N'hésite pas à me demander des conseils à tout moment. Bonne chance ! 🚀",
    target: null,
    action: 'Terminer',
    xpReward: 50
  }
];

// ==========================================
// SERVICE PRINCIPAL
// ==========================================

class AIAssistantService {
  constructor() {
    this.personality = PERSONALITY;
    console.log('🤖 AIAssistantService initialisé');
  }

  // ==========================================
  // ANALYSE UTILISATEUR
  // ==========================================

  /**
   * Analyser le profil et l'activité de l'utilisateur
   */
  async analyzeUserProfile(userId) {
    try {
      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      const gamification = userData.gamification || {};

      // Récupérer les quêtes récentes
      const questsQuery = query(
        collection(db, 'quests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const questsSnapshot = await getDocs(questsQuery);
      const recentQuests = questsSnapshot.docs.map(d => d.data());

      // Analyse
      const analysis = {
        level: gamification.level || 1,
        totalXp: gamification.totalXp || 0,
        badgeCount: (gamification.badges || []).length,
        questsCompleted: recentQuests.filter(q => q.status === 'completed').length,
        questsPending: recentQuests.filter(q => q.status === 'pending').length,
        averageXpPerDay: this.calculateAverageXp(userData),
        strengths: this.identifyStrengths(gamification),
        weaknesses: this.identifyWeaknesses(gamification),
        streak: gamification.loginStreak || 0,
        lastActive: userData.lastActivity?.toDate() || new Date()
      };

      return analysis;
    } catch (error) {
      console.error('❌ [AI] Erreur analyse profil:', error);
      return null;
    }
  }

  /**
   * Calculer la moyenne d'XP par jour
   */
  calculateAverageXp(userData) {
    const createdAt = userData.createdAt?.toDate() || new Date();
    const daysActive = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const totalXp = userData.gamification?.totalXp || 0;
    return Math.round(totalXp / daysActive);
  }

  /**
   * Identifier les points forts
   */
  identifyStrengths(gamification) {
    const strengths = [];
    const stats = gamification.stats || {};

    if (stats.tasksCompleted > 10) strengths.push('productivity');
    if (stats.boostsSent > 5) strengths.push('collaboration');
    if ((gamification.badges || []).length > 5) strengths.push('achievement');
    if (gamification.loginStreak > 7) strengths.push('consistency');

    return strengths;
  }

  /**
   * Identifier les points faibles
   */
  identifyWeaknesses(gamification) {
    const weaknesses = [];
    const stats = gamification.stats || {};

    if (!stats.boostsSent || stats.boostsSent < 3) weaknesses.push('collaboration');
    if (!gamification.loginStreak || gamification.loginStreak < 3) weaknesses.push('consistency');
    if ((gamification.badges || []).length < 3) weaknesses.push('exploration');

    return weaknesses;
  }

  // ==========================================
  // GÉNÉRATION DE SUGGESTIONS
  // ==========================================

  /**
   * Générer des suggestions de quêtes personnalisées
   */
  async generateQuestSuggestions(userId, count = 3) {
    try {
      const analysis = await this.analyzeUserProfile(userId);
      const suggestions = [];
      const categories = Object.keys(QUEST_TEMPLATES);

      // Prioriser les catégories basées sur les faiblesses
      let priorityCategories = [];
      if (analysis?.weaknesses.includes('collaboration')) priorityCategories.push('collaboration');
      if (analysis?.weaknesses.includes('consistency')) priorityCategories.push('productivity');
      if (analysis?.weaknesses.includes('exploration')) priorityCategories.push('challenges');

      // Ajouter des catégories aléatoires
      const remainingCategories = categories.filter(c => !priorityCategories.includes(c));
      priorityCategories = [...priorityCategories, ...this.shuffleArray(remainingCategories)];

      // Sélectionner des quêtes
      for (let i = 0; i < count && i < priorityCategories.length; i++) {
        const category = priorityCategories[i];
        const templates = QUEST_TEMPLATES[category];
        const template = templates[Math.floor(Math.random() * templates.length)];

        suggestions.push({
          ...template,
          category,
          reason: this.getQuestReason(category, analysis),
          id: `ai_quest_${Date.now()}_${i}`
        });
      }

      return suggestions;
    } catch (error) {
      console.error('❌ [AI] Erreur génération quêtes:', error);
      return this.getDefaultQuestSuggestions(count);
    }
  }

  /**
   * Obtenir la raison de suggestion
   */
  getQuestReason(category, analysis) {
    const reasons = {
      productivity: "Pour booster ta productivité !",
      collaboration: "Pour renforcer les liens d'équipe !",
      learning: "Pour développer tes compétences !",
      challenges: "Pour repousser tes limites !"
    };

    if (analysis?.weaknesses.includes('collaboration') && category === 'collaboration') {
      return "Je remarque que tu pourrais collaborer plus - essaie ça !";
    }

    return reasons[category] || "Je pense que ça te conviendrait parfaitement !";
  }

  /**
   * Suggestions par défaut
   */
  getDefaultQuestSuggestions(count = 3) {
    const allQuests = Object.values(QUEST_TEMPLATES).flat();
    return this.shuffleArray(allQuests).slice(0, count);
  }

  // ==========================================
  // CONSEILS PERSONNALISÉS
  // ==========================================

  /**
   * Obtenir un conseil personnalisé
   */
  async getPersonalizedTip(userId, context = 'general') {
    try {
      const analysis = await this.analyzeUserProfile(userId);
      let category = context;

      // Adapter la catégorie selon l'analyse
      if (analysis) {
        if (analysis.weaknesses.includes('collaboration')) category = 'team';
        else if (analysis.questsPending > 5) category = 'productivity';
        else if (analysis.badgeCount < 5) category = 'badges';
      }

      const tips = TIPS_DATABASE[category] || TIPS_DATABASE.general;
      const tip = tips[Math.floor(Math.random() * tips.length)];

      return {
        tip,
        category,
        assistant: this.personality.name,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [AI] Erreur conseil:', error);
      return {
        tip: TIPS_DATABASE.general[0],
        category: 'general',
        assistant: this.personality.name,
        timestamp: new Date()
      };
    }
  }

  /**
   * Obtenir un message d'encouragement
   */
  getEncouragement() {
    const index = Math.floor(Math.random() * this.personality.encouragements.length);
    return {
      message: this.personality.encouragements[index],
      assistant: this.personality.name,
      emoji: this.personality.emoji
    };
  }

  /**
   * Obtenir un message de salutation
   */
  getGreeting(userName = '') {
    const index = Math.floor(Math.random() * this.personality.greetings.length);
    let greeting = this.personality.greetings[index];

    if (userName) {
      greeting = greeting.replace('!', `, ${userName} !`);
    }

    return {
      message: greeting,
      assistant: this.personality.name,
      emoji: this.personality.emoji
    };
  }

  // ==========================================
  // TUTORIEL
  // ==========================================

  /**
   * Obtenir les étapes du tutoriel
   */
  getTutorialSteps() {
    return TUTORIAL_STEPS;
  }

  /**
   * Obtenir une étape spécifique
   */
  getTutorialStep(stepId) {
    return TUTORIAL_STEPS.find(s => s.id === stepId);
  }

  // ==========================================
  // CHALLENGES INTELLIGENTS
  // ==========================================

  /**
   * Générer un challenge personnalisé
   */
  async generatePersonalChallenge(userId) {
    const analysis = await this.analyzeUserProfile(userId);

    const challenges = [
      {
        title: `Atteindre ${(analysis?.totalXp || 0) + 100} XP`,
        description: "Gagne 100 XP de plus !",
        reward: 50,
        duration: '24h',
        type: 'xp'
      },
      {
        title: "Compléter 3 quêtes aujourd'hui",
        description: "Termine 3 quêtes avant la fin de la journée",
        reward: 40,
        duration: '24h',
        type: 'quests'
      },
      {
        title: "Envoyer 5 boosts",
        description: "Encourage 5 collègues avec des boosts",
        reward: 35,
        duration: '48h',
        type: 'social'
      },
      {
        title: `Maintenir une série de ${(analysis?.streak || 0) + 3} jours`,
        description: "Continue ta série de connexion !",
        reward: 60,
        duration: '3 jours',
        type: 'streak'
      }
    ];

    // Choisir un challenge adapté
    let selectedChallenge = challenges[0];

    if (analysis?.weaknesses.includes('collaboration')) {
      selectedChallenge = challenges[2]; // Challenge social
    } else if (analysis?.weaknesses.includes('consistency')) {
      selectedChallenge = challenges[3]; // Challenge streak
    }

    return {
      ...selectedChallenge,
      id: `ai_challenge_${Date.now()}`,
      generatedAt: new Date(),
      generatedBy: this.personality.name
    };
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Formater un message de l'assistant
   */
  formatMessage(text) {
    return {
      text,
      assistant: this.personality.name,
      emoji: this.personality.emoji,
      timestamp: new Date()
    };
  }
}

// Export singleton
export const aiAssistantService = new AIAssistantService();
export default aiAssistantService;

console.log('🤖 AIAssistantService prêt');
