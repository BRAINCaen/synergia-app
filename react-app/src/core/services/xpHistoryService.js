// ==========================================
// 📁 react-app/src/core/services/xpHistoryService.js
// SERVICE HISTORIQUE XP - SYNERGIA v4.0 - MODULE 7
// ==========================================

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📊 TYPES D'ÉVÉNEMENTS XP
 */
const XP_EVENT_TYPES = {
  QUEST_COMPLETED: 'quest_completed',
  BOOST_RECEIVED: 'boost_received',
  BOOST_SENT: 'boost_sent',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  DAILY_LOGIN: 'daily_login',
  STREAK_BONUS: 'streak_bonus',
  TEAM_REWARD: 'team_reward',
  ADMIN_BONUS: 'admin_bonus',
  PURCHASE: 'purchase',
  OTHER: 'other'
};

/**
 * 📊 SERVICE HISTORIQUE XP
 */
class XPHistoryService {
  constructor() {
    this.COLLECTION_NAME = 'xp_history';
    console.log('📊 XPHistoryService initialisé');
  }

  /**
   * ➕ ENREGISTRER UN ÉVÉNEMENT XP
   */
  async logXPEvent(data) {
    try {
      const event = {
        userId: data.userId,
        type: data.type || XP_EVENT_TYPES.OTHER,
        amount: data.amount || 0,
        balance: data.balance || 0,
        source: data.source || 'unknown',
        description: data.description || '',
        metadata: data.metadata || {},
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), event);
      console.log('📊 [XP_HISTORY] Événement enregistré:', docRef.id, event.type, event.amount);

      return { success: true, eventId: docRef.id };
    } catch (error) {
      console.error('❌ [XP_HISTORY] Erreur enregistrement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📋 RÉCUPÉRER L'HISTORIQUE XP D'UN UTILISATEUR
   */
  async getUserXPHistory(userId, options = {}) {
    try {
      const { limitCount = 100, startDate, endDate, eventType } = options;

      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      let events = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      // Filtrer par date si nécessaire
      if (startDate) {
        events = events.filter(e => e.createdAt >= startDate);
      }
      if (endDate) {
        events = events.filter(e => e.createdAt <= endDate);
      }
      if (eventType) {
        events = events.filter(e => e.type === eventType);
      }

      console.log(`📊 [XP_HISTORY] ${events.length} événements récupérés pour ${userId}`);
      return events;
    } catch (error) {
      console.error('❌ [XP_HISTORY] Erreur récupération:', error);
      return [];
    }
  }

  /**
   * 📈 CALCULER LES STATISTIQUES XP
   */
  async calculateXPStats(userId) {
    try {
      const events = await this.getUserXPHistory(userId, { limitCount: 500 });

      if (events.length === 0) {
        return this.getEmptyStats();
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Grouper par jour
      const eventsByDay = {};
      events.forEach(event => {
        const dayKey = event.createdAt.toISOString().split('T')[0];
        if (!eventsByDay[dayKey]) {
          eventsByDay[dayKey] = { xpGained: 0, xpSpent: 0, events: [] };
        }
        if (event.amount > 0) {
          eventsByDay[dayKey].xpGained += event.amount;
        } else {
          eventsByDay[dayKey].xpSpent += Math.abs(event.amount);
        }
        eventsByDay[dayKey].events.push(event);
      });

      // Calculer XP par période
      const todayEvents = events.filter(e => e.createdAt >= today);
      const weekEvents = events.filter(e => e.createdAt >= weekAgo);
      const monthEvents = events.filter(e => e.createdAt >= monthAgo);

      const sumXP = (evts) => evts.reduce((sum, e) => sum + Math.max(0, e.amount), 0);

      // Calculer la meilleure journée
      let bestDay = { date: null, xp: 0 };
      Object.entries(eventsByDay).forEach(([date, data]) => {
        if (data.xpGained > bestDay.xp) {
          bestDay = { date, xp: data.xpGained };
        }
      });

      // Calculer la série actuelle (jours consécutifs avec XP)
      const sortedDays = Object.keys(eventsByDay).sort().reverse();
      let currentStreak = 0;
      let checkDate = new Date(today);

      for (let i = 0; i < 365; i++) {
        const dayKey = checkDate.toISOString().split('T')[0];
        if (eventsByDay[dayKey] && eventsByDay[dayKey].xpGained > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          // Pas d'XP aujourd'hui, vérifier hier
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Répartition par type de source
      const sourceBreakdown = {};
      events.forEach(event => {
        if (event.amount > 0) {
          const source = event.type || 'other';
          sourceBreakdown[source] = (sourceBreakdown[source] || 0) + event.amount;
        }
      });

      // Historique des 7 derniers jours
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayData = eventsByDay[dayKey] || { xpGained: 0, xpSpent: 0, events: [] };

        last7Days.push({
          date: dayKey,
          dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          xpGained: dayData.xpGained,
          xpSpent: dayData.xpSpent,
          eventsCount: dayData.events.length
        });
      }

      // Historique des 30 derniers jours
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayData = eventsByDay[dayKey] || { xpGained: 0, xpSpent: 0 };

        last30Days.push({
          date: dayKey,
          xpGained: dayData.xpGained,
          xpSpent: dayData.xpSpent
        });
      }

      // Moyenne journalière
      const activeDays = Object.keys(eventsByDay).filter(day => eventsByDay[day].xpGained > 0).length;
      const totalXPGained = events.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
      const dailyAverage = activeDays > 0 ? Math.round(totalXPGained / activeDays) : 0;

      const stats = {
        // Totaux par période
        todayXP: sumXP(todayEvents),
        weekXP: sumXP(weekEvents),
        monthXP: sumXP(monthEvents),
        totalXP: totalXPGained,

        // Records
        bestDay,
        currentStreak,
        longestStreak: currentStreak, // Simplifié pour l'instant
        dailyAverage,

        // Répartition
        sourceBreakdown,

        // Historiques
        last7Days,
        last30Days,

        // Méta
        totalEvents: events.length,
        activeDays,
        lastEventDate: events[0]?.createdAt || null
      };

      console.log('📊 [XP_HISTORY] Stats calculées:', {
        todayXP: stats.todayXP,
        weekXP: stats.weekXP,
        currentStreak: stats.currentStreak
      });

      return stats;
    } catch (error) {
      console.error('❌ [XP_HISTORY] Erreur calcul stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * 🎧 ÉCOUTER LES ÉVÉNEMENTS EN TEMPS RÉEL
   */
  subscribeToXPHistory(userId, callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          events.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date()
          });
        });
        callback(events);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ [XP_HISTORY] Erreur subscription:', error);
      return () => {};
    }
  }

  /**
   * 📊 STATS VIDES PAR DÉFAUT
   */
  getEmptyStats() {
    return {
      todayXP: 0,
      weekXP: 0,
      monthXP: 0,
      totalXP: 0,
      bestDay: { date: null, xp: 0 },
      currentStreak: 0,
      longestStreak: 0,
      dailyAverage: 0,
      sourceBreakdown: {},
      last7Days: [],
      last30Days: [],
      totalEvents: 0,
      activeDays: 0,
      lastEventDate: null
    };
  }
}

// Instance unique
const xpHistoryService = new XPHistoryService();

export { xpHistoryService, XP_EVENT_TYPES };
export default xpHistoryService;
