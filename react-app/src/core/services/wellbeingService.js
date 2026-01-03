// ==========================================
// 📁 react-app/src/core/services/wellbeingService.js
// SERVICE BIEN-ÊTRE - Gestion du moral et des défis
// ==========================================

import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// ==========================================
// CONSTANTES
// ==========================================

/**
 * Questions hebdomadaires sur le bien-être
 * Rotation automatique chaque semaine
 */
export const WEEKLY_QUESTIONS = [
  {
    id: 'recognition',
    question: 'Te sens-tu reconnu(e) pour ton travail ?',
    category: 'reconnaissance',
    icon: '🏆'
  },
  {
    id: 'balance',
    question: 'As-tu un bon équilibre vie pro/perso ?',
    category: 'equilibre',
    icon: '⚖️'
  },
  {
    id: 'support',
    question: 'Te sens-tu soutenu(e) par ton équipe ?',
    category: 'equipe',
    icon: '🤝'
  },
  {
    id: 'meaning',
    question: 'Ton travail a-t-il du sens pour toi ?',
    category: 'sens',
    icon: '🎯'
  },
  {
    id: 'resources',
    question: 'As-tu les ressources pour bien travailler ?',
    category: 'ressources',
    icon: '🛠️'
  },
  {
    id: 'growth',
    question: 'Sens-tu que tu progresses dans ton poste ?',
    category: 'developpement',
    icon: '📈'
  },
  {
    id: 'communication',
    question: 'La communication dans l\'équipe est-elle bonne ?',
    category: 'communication',
    icon: '💬'
  },
  {
    id: 'stress',
    question: 'Ton niveau de stress est-il gérable ?',
    category: 'stress',
    icon: '🧘'
  }
];

/**
 * Mini-défis bien-être (concrets, pas virtuels)
 */
export const WELLBEING_CHALLENGES = [
  {
    id: 'break_walk',
    title: 'Pause active',
    description: 'Fais une pause de 5 min pour marcher ou t\'étirer',
    category: 'physique',
    icon: '🚶',
    xpReward: 10
  },
  {
    id: 'hydration',
    title: 'Hydratation',
    description: 'Bois un grand verre d\'eau maintenant',
    category: 'sante',
    icon: '💧',
    xpReward: 5
  },
  {
    id: 'desk_cleanup',
    title: 'Bureau zen',
    description: 'Prends 5 min pour ranger ton espace de travail',
    category: 'organisation',
    icon: '🧹',
    xpReward: 10
  },
  {
    id: 'deep_breath',
    title: 'Respiration',
    description: 'Fais 3 grandes respirations profondes',
    category: 'relaxation',
    icon: '🌬️',
    xpReward: 5
  },
  {
    id: 'screen_break',
    title: 'Pause écran',
    description: 'Regarde au loin pendant 20 secondes pour reposer tes yeux',
    category: 'sante',
    icon: '👀',
    xpReward: 5
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    description: 'Note une chose positive de ta journée',
    category: 'mental',
    icon: '🙏',
    xpReward: 10
  },
  {
    id: 'posture_check',
    title: 'Posture',
    description: 'Vérifie ta posture et redresse-toi',
    category: 'physique',
    icon: '🧍',
    xpReward: 5
  },
  {
    id: 'real_break',
    title: 'Vraie pause',
    description: 'Déconnecte-toi 10 min de tous les écrans',
    category: 'digital',
    icon: '📵',
    xpReward: 15
  },
  {
    id: 'task_priority',
    title: 'Priorités',
    description: 'Identifie ta tâche la plus importante de demain',
    category: 'organisation',
    icon: '📋',
    xpReward: 10
  },
  {
    id: 'stretch',
    title: 'Étirements',
    description: 'Fais 2 minutes d\'étirements',
    category: 'physique',
    icon: '🤸',
    xpReward: 10
  }
];

// ==========================================
// SERVICE
// ==========================================

class WellbeingService {
  constructor() {
    this.collectionsName = {
      exitMoods: 'exitMoods',
      weeklyPulse: 'weeklyPulse',
      challengeCompletions: 'wellbeingChallenges'
    };
  }

  // ==========================================
  // MOOD AU DÉPOINTAGE
  // ==========================================

  /**
   * Enregistrer le mood à la fin de journée
   */
  async recordExitMood(userId, moodData) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const entry = {
        userId,
        mood: moodData.mood, // 1-5
        moodLabel: moodData.moodLabel,
        comment: moodData.comment || null,
        date: today,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionsName.exitMoods), entry);
      console.log('✅ [Wellbeing] Mood de sortie enregistré:', docRef.id);

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur enregistrement mood:', error);
      return { success: false, error };
    }
  }

  /**
   * Vérifier si l'utilisateur a déjà enregistré son mood aujourd'hui
   */
  async hasRecordedExitMoodToday(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const q = query(
        collection(db, this.collectionsName.exitMoods),
        where('userId', '==', userId),
        where('date', '==', today),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur vérification mood:', error);
      return false;
    }
  }

  /**
   * Récupérer l'historique des moods d'un utilisateur
   */
  async getUserMoodHistory(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const q = query(
        collection(db, this.collectionsName.exitMoods),
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur récupération historique:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques de mood pour le dashboard manager (anonymisé)
   */
  async getTeamMoodStats(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const q = query(
        collection(db, this.collectionsName.exitMoods),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const moods = snapshot.docs.map(doc => doc.data());

      // Calcul des statistiques (anonymisées)
      const stats = {
        totalResponses: moods.length,
        averageMood: 0,
        moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        dailyAverages: {},
        trend: 'stable'
      };

      if (moods.length === 0) return stats;

      // Distribution et moyenne
      let sum = 0;
      moods.forEach(m => {
        sum += m.mood;
        stats.moodDistribution[m.mood] = (stats.moodDistribution[m.mood] || 0) + 1;

        if (!stats.dailyAverages[m.date]) {
          stats.dailyAverages[m.date] = { sum: 0, count: 0 };
        }
        stats.dailyAverages[m.date].sum += m.mood;
        stats.dailyAverages[m.date].count++;
      });

      stats.averageMood = Math.round((sum / moods.length) * 10) / 10;

      // Calculer les moyennes quotidiennes
      Object.keys(stats.dailyAverages).forEach(date => {
        const day = stats.dailyAverages[date];
        stats.dailyAverages[date] = Math.round((day.sum / day.count) * 10) / 10;
      });

      // Calculer la tendance
      const dates = Object.keys(stats.dailyAverages).sort();
      if (dates.length >= 2) {
        const recentAvg = stats.dailyAverages[dates[0]];
        const olderAvg = stats.dailyAverages[dates[dates.length - 1]];
        if (recentAvg > olderAvg + 0.3) stats.trend = 'up';
        else if (recentAvg < olderAvg - 0.3) stats.trend = 'down';
      }

      return stats;
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur stats équipe:', error);
      return null;
    }
  }

  /**
   * Récupérer les moods au dépointage d'aujourd'hui (anonymisés)
   * Retourne une liste des valeurs de mood sans info utilisateur
   */
  async getTodayExitMoods() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const q = query(
        collection(db, this.collectionsName.exitMoods),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      // Retourne uniquement les valeurs de mood (anonymisé)
      return snapshot.docs.map(doc => ({
        mood: doc.data().mood,
        moodLabel: doc.data().moodLabel
      }));
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur récupération moods du jour:', error);
      return [];
    }
  }

  // ==========================================
  // QUESTIONS HEBDOMADAIRES
  // ==========================================

  /**
   * Obtenir la question de la semaine
   */
  getCurrentWeeklyQuestion() {
    const weekNumber = this.getWeekNumber(new Date());
    const index = weekNumber % WEEKLY_QUESTIONS.length;
    return WEEKLY_QUESTIONS[index];
  }

  /**
   * Enregistrer la réponse à la question hebdomadaire
   */
  async submitWeeklyPulse(userId, questionId, answer) {
    try {
      const weekNumber = this.getWeekNumber(new Date());
      const year = new Date().getFullYear();

      const entry = {
        userId,
        questionId,
        answer, // 1-5
        weekNumber,
        year,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, this.collectionsName.weeklyPulse), entry);
      console.log('✅ [Wellbeing] Pulse hebdo enregistré');
      return { success: true };
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur pulse hebdo:', error);
      return { success: false, error };
    }
  }

  /**
   * Vérifier si l'utilisateur a répondu cette semaine
   */
  async hasAnsweredThisWeek(userId) {
    try {
      const weekNumber = this.getWeekNumber(new Date());
      const year = new Date().getFullYear();

      const q = query(
        collection(db, this.collectionsName.weeklyPulse),
        where('userId', '==', userId),
        where('weekNumber', '==', weekNumber),
        where('year', '==', year),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  // ==========================================
  // MINI-DÉFIS BIEN-ÊTRE
  // ==========================================

  /**
   * Obtenir un défi aléatoire du jour
   */
  getDailyChallenge(userId) {
    // Utiliser la date + userId pour avoir le même défi toute la journée pour cet utilisateur
    const today = new Date().toISOString().split('T')[0];
    const seed = this.hashCode(today + userId);
    const index = Math.abs(seed) % WELLBEING_CHALLENGES.length;
    return WELLBEING_CHALLENGES[index];
  }

  /**
   * Marquer un défi comme complété
   */
  async completeChallenge(userId, challengeId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Vérifier si déjà complété aujourd'hui
      const q = query(
        collection(db, this.collectionsName.challengeCompletions),
        where('userId', '==', userId),
        where('challengeId', '==', challengeId),
        where('date', '==', today),
        limit(1)
      );

      const existing = await getDocs(q);
      if (!existing.empty) {
        return { success: false, reason: 'already_completed' };
      }

      const challenge = WELLBEING_CHALLENGES.find(c => c.id === challengeId);
      if (!challenge) {
        return { success: false, reason: 'challenge_not_found' };
      }

      await addDoc(collection(db, this.collectionsName.challengeCompletions), {
        userId,
        challengeId,
        challengeTitle: challenge.title,
        xpAwarded: challenge.xpReward,
        date: today,
        timestamp: serverTimestamp()
      });

      console.log('✅ [Wellbeing] Défi complété:', challengeId);
      return { success: true, xpReward: challenge.xpReward };
    } catch (error) {
      console.error('❌ [Wellbeing] Erreur complétion défi:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtenir les défis complétés aujourd'hui
   */
  async getTodayChallenges(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const q = query(
        collection(db, this.collectionsName.challengeCompletions),
        where('userId', '==', userId),
        where('date', '==', today)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().challengeId);
    } catch (error) {
      return [];
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Obtenir le numéro de semaine
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Hash simple pour le seed des défis
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

// Export singleton
const wellbeingService = new WellbeingService();
export default wellbeingService;
export { wellbeingService };
