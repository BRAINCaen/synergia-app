// ==========================================
// react-app/src/core/services/pulseService.js
// SERVICE PULSE - SYNERGIA v4.0
// Module Pulse: Check-in quotidien equipe
// ==========================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ==========================================
// CONSTANTES PULSE
// ==========================================

export const MOOD_LEVELS = {
  great: {
    id: 'great',
    value: 5,
    emoji: '🤩',
    label: 'Excellent',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400'
  },
  good: {
    id: 'good',
    value: 4,
    emoji: '😊',
    label: 'Bien',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  okay: {
    id: 'okay',
    value: 3,
    emoji: '😐',
    label: 'Correct',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400'
  },
  low: {
    id: 'low',
    value: 2,
    emoji: '😔',
    label: 'Bas',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400'
  },
  bad: {
    id: 'bad',
    value: 1,
    emoji: '😫',
    label: 'Difficile',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  }
};

export const ENERGY_LEVELS = {
  high: {
    id: 'high',
    value: 5,
    emoji: '⚡',
    label: 'Plein d\'energie',
    color: 'from-yellow-400 to-orange-500'
  },
  good: {
    id: 'good',
    value: 4,
    emoji: '🔋',
    label: 'Bonne energie',
    color: 'from-green-400 to-emerald-500'
  },
  moderate: {
    id: 'moderate',
    value: 3,
    emoji: '🔌',
    label: 'Energie moyenne',
    color: 'from-blue-400 to-cyan-500'
  },
  low: {
    id: 'low',
    value: 2,
    emoji: '🪫',
    label: 'Energie basse',
    color: 'from-orange-400 to-red-500'
  },
  exhausted: {
    id: 'exhausted',
    value: 1,
    emoji: '😴',
    label: 'Epuise',
    color: 'from-gray-400 to-gray-600'
  }
};

export const PULSE_CATEGORIES = {
  workload: { id: 'workload', label: 'Charge de travail', emoji: '📊' },
  teamwork: { id: 'teamwork', label: 'Collaboration', emoji: '🤝' },
  motivation: { id: 'motivation', label: 'Motivation', emoji: '🎯' },
  stress: { id: 'stress', label: 'Stress', emoji: '😰' },
  satisfaction: { id: 'satisfaction', label: 'Satisfaction', emoji: '⭐' }
};

// ==========================================
// SERVICE PULSE
// ==========================================

class PulseService {
  constructor() {
    this.collectionName = 'pulses';
  }

  /**
   * Obtenir la date du jour (sans heure)
   */
  getTodayDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Verifier si l'utilisateur a deja fait son pulse aujourd'hui
   */
  async hasPulseToday(userId) {
    try {
      const today = this.getTodayDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('createdAt', '<', Timestamp.fromDate(tomorrow)),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Erreur verification pulse:', error);
      return false;
    }
  }

  /**
   * Obtenir le pulse d'aujourd'hui
   */
  async getTodayPulse(userId) {
    try {
      const today = this.getTodayDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('createdAt', '<', Timestamp.fromDate(tomorrow)),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Erreur recuperation pulse:', error);
      return null;
    }
  }

  /**
   * Enregistrer un nouveau pulse
   */
  async submitPulse(userId, pulseData) {
    try {
      // Verifier si deja fait aujourd'hui
      const hasPulse = await this.hasPulseToday(userId);
      if (hasPulse) {
        return { success: false, error: 'Pulse deja enregistre aujourd\'hui' };
      }

      const pulse = {
        userId,
        mood: pulseData.mood,
        moodValue: MOOD_LEVELS[pulseData.mood]?.value || 3,
        energy: pulseData.energy,
        energyValue: ENERGY_LEVELS[pulseData.energy]?.value || 3,
        note: pulseData.note || '',
        isAnonymous: pulseData.isAnonymous || false,
        categories: pulseData.categories || {},
        createdAt: serverTimestamp(),
        date: this.getTodayDate().toISOString().split('T')[0]
      };

      const docRef = await addDoc(collection(db, this.collectionName), pulse);

      // Donner des XP pour le check-in quotidien
      await this.awardPulseXP(userId);

      return { success: true, pulseId: docRef.id };
    } catch (error) {
      console.error('Erreur enregistrement pulse:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Donner des XP pour le pulse quotidien
   */
  async awardPulseXP(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentXP = data.gamification?.totalXp || 0;

        await updateDoc(userRef, {
          'gamification.totalXp': currentXP + 10,
          'gamification.lastPulse': serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erreur attribution XP pulse:', error);
    }
  }

  /**
   * Obtenir l'historique des pulses d'un utilisateur
   */
  async getUserPulseHistory(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erreur historique pulse:', error);
      return [];
    }
  }

  /**
   * Obtenir le pulse de l'equipe (anonymise)
   */
  async getTeamPulse(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, this.collectionName),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const pulses = snapshot.docs.map(doc => doc.data());

      if (pulses.length === 0) {
        return {
          averageMood: 0,
          averageEnergy: 0,
          totalResponses: 0,
          moodDistribution: {},
          energyDistribution: {},
          trend: 'stable',
          dailyData: []
        };
      }

      // Calculer les moyennes
      const totalMood = pulses.reduce((sum, p) => sum + (p.moodValue || 3), 0);
      const totalEnergy = pulses.reduce((sum, p) => sum + (p.energyValue || 3), 0);

      // Distribution des humeurs
      const moodDist = {};
      const energyDist = {};
      pulses.forEach(p => {
        moodDist[p.mood] = (moodDist[p.mood] || 0) + 1;
        energyDist[p.energy] = (energyDist[p.energy] || 0) + 1;
      });

      // Donnees par jour
      const dailyData = {};
      pulses.forEach(p => {
        const date = p.date || new Date(p.createdAt?.toDate?.() || Date.now()).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { mood: [], energy: [], count: 0 };
        }
        dailyData[date].mood.push(p.moodValue || 3);
        dailyData[date].energy.push(p.energyValue || 3);
        dailyData[date].count++;
      });

      // Convertir en array avec moyennes
      const dailyArray = Object.entries(dailyData).map(([date, data]) => ({
        date,
        avgMood: data.mood.reduce((a, b) => a + b, 0) / data.mood.length,
        avgEnergy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
        count: data.count
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Calculer la tendance
      let trend = 'stable';
      if (dailyArray.length >= 2) {
        const recent = dailyArray.slice(-3);
        const older = dailyArray.slice(0, 3);
        const recentAvg = recent.reduce((s, d) => s + d.avgMood, 0) / recent.length;
        const olderAvg = older.reduce((s, d) => s + d.avgMood, 0) / older.length;

        if (recentAvg > olderAvg + 0.3) trend = 'up';
        else if (recentAvg < olderAvg - 0.3) trend = 'down';
      }

      return {
        averageMood: (totalMood / pulses.length).toFixed(1),
        averageEnergy: (totalEnergy / pulses.length).toFixed(1),
        totalResponses: pulses.length,
        moodDistribution: moodDist,
        energyDistribution: energyDist,
        trend,
        dailyData: dailyArray
      };
    } catch (error) {
      console.error('Erreur team pulse:', error);
      return null;
    }
  }

  /**
   * Obtenir les statistiques de pulse d'un utilisateur
   */
  async getUserPulseStats(userId) {
    try {
      const history = await this.getUserPulseHistory(userId, 30);

      if (history.length === 0) {
        return {
          streak: 0,
          totalPulses: 0,
          averageMood: 0,
          averageEnergy: 0,
          bestDay: null,
          trend: 'stable'
        };
      }

      // Calculer la serie
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const hasPulse = history.some(p => p.date === dateStr);
        if (hasPulse) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Moyennes
      const avgMood = history.reduce((s, p) => s + (p.moodValue || 3), 0) / history.length;
      const avgEnergy = history.reduce((s, p) => s + (p.energyValue || 3), 0) / history.length;

      // Meilleur jour
      const bestPulse = history.reduce((best, p) => {
        const score = (p.moodValue || 3) + (p.energyValue || 3);
        const bestScore = (best?.moodValue || 0) + (best?.energyValue || 0);
        return score > bestScore ? p : best;
      }, null);

      return {
        streak,
        totalPulses: history.length,
        averageMood: avgMood.toFixed(1),
        averageEnergy: avgEnergy.toFixed(1),
        bestDay: bestPulse,
        history
      };
    } catch (error) {
      console.error('Erreur stats pulse:', error);
      return null;
    }
  }

  /**
   * S'abonner aux pulses en temps reel
   */
  subscribeToTeamPulse(callback, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, this.collectionName),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const pulses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(pulses);
    });
  }
}

// Export singleton
export const pulseService = new PulseService();
export default pulseService;
