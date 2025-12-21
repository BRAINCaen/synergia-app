// ==========================================
// 📁 react-app/src/core/services/pointageAnomalyService.js
// SERVICE DE DÉTECTION D'ANOMALIES POINTAGE VS PLANNING
// Compare les pointages réels avec les shifts planifiés
// ==========================================

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 🎯 TYPES D'ANOMALIES
export const ANOMALY_TYPES = {
  LATE_ARRIVAL: 'late_arrival',           // Arrivée en retard
  EARLY_DEPARTURE: 'early_departure',     // Départ anticipé
  OVERTIME: 'overtime',                   // Heures supplémentaires
  NO_SHOW: 'no_show',                     // Absence sans pointage
  MISSING_DEPARTURE: 'missing_departure', // Pointage départ manquant
  MISSING_ARRIVAL: 'missing_arrival',     // Pointage arrivée manquant
  UNPLANNED_WORK: 'unplanned_work',       // Travail non planifié
  EARLY_ARRIVAL: 'early_arrival',         // Arrivée en avance
  LATE_DEPARTURE: 'late_departure'        // Départ tardif (heures sup)
};

// 🎨 CONFIGURATION DES ANOMALIES
export const ANOMALY_CONFIG = {
  [ANOMALY_TYPES.LATE_ARRIVAL]: {
    label: 'Retard',
    color: 'orange',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    icon: '⏰',
    threshold: 5 // minutes de tolérance
  },
  [ANOMALY_TYPES.EARLY_DEPARTURE]: {
    label: 'Départ anticipé',
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    icon: '🚪',
    threshold: 5
  },
  [ANOMALY_TYPES.OVERTIME]: {
    label: 'Heures sup',
    color: 'blue',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    icon: '⚡',
    threshold: 15
  },
  [ANOMALY_TYPES.NO_SHOW]: {
    label: 'Absent',
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    icon: '❌',
    threshold: 0
  },
  [ANOMALY_TYPES.MISSING_DEPARTURE]: {
    label: 'Départ manquant',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    icon: '⚠️',
    threshold: 0
  },
  [ANOMALY_TYPES.MISSING_ARRIVAL]: {
    label: 'Arrivée manquante',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    icon: '⚠️',
    threshold: 0
  },
  [ANOMALY_TYPES.UNPLANNED_WORK]: {
    label: 'Non planifié',
    color: 'purple',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: '📝',
    threshold: 0
  },
  [ANOMALY_TYPES.EARLY_ARRIVAL]: {
    label: 'Avance',
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    icon: '✨',
    threshold: 10
  }
};

/**
 * 🔍 SERVICE DE DÉTECTION D'ANOMALIES POINTAGE VS PLANNING
 */
class PointageAnomalyService {

  /**
   * 📅 Récupérer les pointages d'un employé pour une période
   */
  async getPointagesForPeriod(userId, startDate, endDate) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const pointagesQuery = query(
        collection(db, 'timeEntries'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'asc'),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(pointagesQuery);
      const pointages = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'deleted') {
          pointages.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            timestamp: data.timestamp?.toDate()
          });
        }
      });

      return pointages;
    } catch (error) {
      console.error('❌ [ANOMALY] Erreur récupération pointages:', error);
      return [];
    }
  }

  /**
   * 📊 Récupérer tous les pointages de tous les employés pour une période
   */
  async getAllPointagesForPeriod(startDate, endDate) {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const pointagesQuery = query(
        collection(db, 'timeEntries'),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(pointagesQuery);
      const pointages = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'deleted') {
          pointages.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate(),
            timestamp: data.timestamp?.toDate()
          });
        }
      });

      // Grouper par userId
      const byUser = {};
      pointages.forEach(p => {
        if (!byUser[p.userId]) {
          byUser[p.userId] = [];
        }
        byUser[p.userId].push(p);
      });

      return byUser;
    } catch (error) {
      console.error('❌ [ANOMALY] Erreur récupération tous pointages:', error);
      return {};
    }
  }

  /**
   * 🔄 Convertir une heure string "HH:MM" en minutes depuis minuit
   */
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 🔄 Convertir des minutes en format lisible
   */
  formatMinutesDiff(minutes) {
    const absMinutes = Math.abs(minutes);
    const sign = minutes >= 0 ? '+' : '-';

    if (absMinutes < 60) {
      return `${sign}${absMinutes}min`;
    }

    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    if (mins === 0) {
      return `${sign}${hours}h`;
    }

    return `${sign}${hours}h${mins.toString().padStart(2, '0')}`;
  }

  /**
   * 📆 Grouper les pointages par jour
   */
  groupPointagesByDay(pointages) {
    const byDay = {};

    pointages.forEach(p => {
      const dayKey = p.date.toISOString().split('T')[0];
      if (!byDay[dayKey]) {
        byDay[dayKey] = [];
      }
      byDay[dayKey].push(p);
    });

    // Trier chaque jour par timestamp
    Object.keys(byDay).forEach(day => {
      byDay[day].sort((a, b) => a.timestamp - b.timestamp);
    });

    return byDay;
  }

  /**
   * 🧮 Calculer les segments de travail d'une journée
   */
  calculateWorkSegments(dayPointages) {
    const segments = [];

    for (let i = 0; i < dayPointages.length; i++) {
      const current = dayPointages[i];

      if (current.type === 'arrival') {
        const next = dayPointages[i + 1];

        segments.push({
          arrival: current,
          departure: next?.type === 'departure' ? next : null,
          arrivalTime: current.timestamp,
          departureTime: next?.type === 'departure' ? next.timestamp : null,
          isComplete: next?.type === 'departure'
        });

        if (next?.type === 'departure') {
          i++; // Skip the departure we just processed
        }
      }
    }

    return segments;
  }

  /**
   * 🎯 Analyser les anomalies pour un shift donné
   */
  analyzeShiftAnomalies(shift, dayPointages) {
    const anomalies = [];

    // Si c'est une absence planifiée, pas d'analyse de pointage
    if (shift.isAbsence) {
      return anomalies;
    }

    const plannedStart = this.timeToMinutes(shift.startTime);
    const plannedEnd = this.timeToMinutes(shift.endTime);
    const plannedDuration = plannedEnd - plannedStart;

    // Calculer les segments de travail réels
    const segments = this.calculateWorkSegments(dayPointages || []);

    // Pas de pointage du tout
    if (segments.length === 0) {
      // Vérifier si la date est passée
      const shiftDate = new Date(shift.date);
      const now = new Date();

      if (shiftDate < now) {
        anomalies.push({
          type: ANOMALY_TYPES.NO_SHOW,
          message: 'Aucun pointage',
          diffMinutes: -plannedDuration,
          severity: 'high',
          ...ANOMALY_CONFIG[ANOMALY_TYPES.NO_SHOW]
        });
      }

      return anomalies;
    }

    // Analyser le premier segment (arrivée)
    const firstSegment = segments[0];
    const actualArrival = firstSegment.arrivalTime;
    const actualArrivalMinutes = actualArrival.getHours() * 60 + actualArrival.getMinutes();

    const arrivalDiff = actualArrivalMinutes - plannedStart;
    const arrivalThreshold = ANOMALY_CONFIG[ANOMALY_TYPES.LATE_ARRIVAL].threshold;

    if (arrivalDiff > arrivalThreshold) {
      // Retard
      anomalies.push({
        type: ANOMALY_TYPES.LATE_ARRIVAL,
        message: `Retard ${this.formatMinutesDiff(arrivalDiff)}`,
        diffMinutes: arrivalDiff,
        actualTime: actualArrival.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        plannedTime: shift.startTime,
        severity: arrivalDiff > 30 ? 'high' : arrivalDiff > 15 ? 'medium' : 'low',
        ...ANOMALY_CONFIG[ANOMALY_TYPES.LATE_ARRIVAL]
      });
    } else if (arrivalDiff < -ANOMALY_CONFIG[ANOMALY_TYPES.EARLY_ARRIVAL].threshold) {
      // Arrivée en avance
      anomalies.push({
        type: ANOMALY_TYPES.EARLY_ARRIVAL,
        message: `Avance ${this.formatMinutesDiff(arrivalDiff)}`,
        diffMinutes: arrivalDiff,
        actualTime: actualArrival.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        plannedTime: shift.startTime,
        severity: 'info',
        ...ANOMALY_CONFIG[ANOMALY_TYPES.EARLY_ARRIVAL]
      });
    }

    // Analyser le dernier segment (départ)
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment.isComplete) {
      // Départ manquant
      anomalies.push({
        type: ANOMALY_TYPES.MISSING_DEPARTURE,
        message: 'Départ non pointé',
        severity: 'medium',
        ...ANOMALY_CONFIG[ANOMALY_TYPES.MISSING_DEPARTURE]
      });
    } else {
      const actualDeparture = lastSegment.departureTime;
      const actualDepartureMinutes = actualDeparture.getHours() * 60 + actualDeparture.getMinutes();

      const departureDiff = actualDepartureMinutes - plannedEnd;
      const departureThreshold = ANOMALY_CONFIG[ANOMALY_TYPES.EARLY_DEPARTURE].threshold;

      if (departureDiff < -departureThreshold) {
        // Départ anticipé
        anomalies.push({
          type: ANOMALY_TYPES.EARLY_DEPARTURE,
          message: `Départ ${this.formatMinutesDiff(departureDiff)}`,
          diffMinutes: departureDiff,
          actualTime: actualDeparture.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          plannedTime: shift.endTime,
          severity: Math.abs(departureDiff) > 30 ? 'high' : Math.abs(departureDiff) > 15 ? 'medium' : 'low',
          ...ANOMALY_CONFIG[ANOMALY_TYPES.EARLY_DEPARTURE]
        });
      } else if (departureDiff > ANOMALY_CONFIG[ANOMALY_TYPES.OVERTIME].threshold) {
        // Heures supplémentaires
        anomalies.push({
          type: ANOMALY_TYPES.OVERTIME,
          message: `HS ${this.formatMinutesDiff(departureDiff)}`,
          diffMinutes: departureDiff,
          actualTime: actualDeparture.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          plannedTime: shift.endTime,
          severity: departureDiff > 60 ? 'high' : 'medium',
          ...ANOMALY_CONFIG[ANOMALY_TYPES.OVERTIME]
        });
      }
    }

    // Calculer le temps total travaillé
    let totalWorkedMinutes = 0;
    segments.forEach(seg => {
      if (seg.departureTime) {
        const start = seg.arrivalTime.getHours() * 60 + seg.arrivalTime.getMinutes();
        const end = seg.departureTime.getHours() * 60 + seg.departureTime.getMinutes();
        totalWorkedMinutes += (end - start);
      }
    });

    // Ajouter un résumé du temps
    const timeDiff = totalWorkedMinutes - plannedDuration;

    return {
      anomalies,
      summary: {
        plannedMinutes: plannedDuration,
        workedMinutes: totalWorkedMinutes,
        diffMinutes: timeDiff,
        diffFormatted: this.formatMinutesDiff(timeDiff),
        segments: segments.length,
        isComplete: segments.every(s => s.isComplete),
        actualStart: firstSegment?.arrivalTime,
        actualEnd: lastSegment?.departureTime
      }
    };
  }

  /**
   * 📊 Analyser tous les shifts d'une semaine avec leurs anomalies
   */
  async analyzeWeeklyAnomalies(shifts, startDate, endDate) {
    try {
      // Récupérer tous les pointages de la période
      const allPointages = await this.getAllPointagesForPeriod(startDate, endDate);

      // Analyser chaque shift
      const results = {};

      for (const shift of shifts) {
        if (shift.isAbsence) continue;

        const shiftDate = shift.date;
        const employeeId = shift.employeeId;

        // Récupérer les pointages de l'employé pour ce jour
        const employeePointages = allPointages[employeeId] || [];
        const dayPointages = employeePointages.filter(p => {
          const pDay = p.date.toISOString().split('T')[0];
          return pDay === shiftDate;
        });

        const analysis = this.analyzeShiftAnomalies(shift, dayPointages);

        results[shift.id] = {
          shiftId: shift.id,
          employeeId,
          date: shiftDate,
          ...analysis
        };
      }

      return results;
    } catch (error) {
      console.error('❌ [ANOMALY] Erreur analyse semaine:', error);
      return {};
    }
  }

  /**
   * 🔍 Détecter les pointages sans shift planifié (travail non planifié)
   */
  async detectUnplannedWork(allPointages, shifts, startDate, endDate) {
    const unplannedWork = [];

    // Créer un index des shifts par employé et date
    const shiftIndex = {};
    shifts.forEach(s => {
      const key = `${s.employeeId}_${s.date}`;
      if (!shiftIndex[key]) {
        shiftIndex[key] = [];
      }
      shiftIndex[key].push(s);
    });

    // Vérifier chaque employé
    Object.entries(allPointages).forEach(([userId, pointages]) => {
      const byDay = this.groupPointagesByDay(pointages);

      Object.entries(byDay).forEach(([day, dayPointages]) => {
        const key = `${userId}_${day}`;

        if (!shiftIndex[key] || shiftIndex[key].length === 0) {
          // Travail non planifié
          const segments = this.calculateWorkSegments(dayPointages);

          if (segments.length > 0) {
            let totalMinutes = 0;
            segments.forEach(seg => {
              if (seg.departureTime) {
                const start = seg.arrivalTime.getHours() * 60 + seg.arrivalTime.getMinutes();
                const end = seg.departureTime.getHours() * 60 + seg.departureTime.getMinutes();
                totalMinutes += (end - start);
              }
            });

            unplannedWork.push({
              userId,
              date: day,
              segments,
              totalMinutes,
              type: ANOMALY_TYPES.UNPLANNED_WORK,
              ...ANOMALY_CONFIG[ANOMALY_TYPES.UNPLANNED_WORK]
            });
          }
        }
      });
    });

    return unplannedWork;
  }

  /**
   * 📈 Générer un rapport d'anomalies pour un employé
   */
  async generateEmployeeReport(userId, startDate, endDate) {
    try {
      const pointages = await this.getPointagesForPeriod(userId, startDate, endDate);
      const byDay = this.groupPointagesByDay(pointages);

      const report = {
        userId,
        period: { startDate, endDate },
        days: {},
        totals: {
          plannedMinutes: 0,
          workedMinutes: 0,
          overtimeMinutes: 0,
          lateMinutes: 0,
          earlyDepartureMinutes: 0,
          daysWithAnomalies: 0
        }
      };

      Object.entries(byDay).forEach(([day, dayPointages]) => {
        const segments = this.calculateWorkSegments(dayPointages);

        let dayWorked = 0;
        segments.forEach(seg => {
          if (seg.departureTime) {
            const start = seg.arrivalTime.getHours() * 60 + seg.arrivalTime.getMinutes();
            const end = seg.departureTime.getHours() * 60 + seg.departureTime.getMinutes();
            dayWorked += (end - start);
          }
        });

        report.days[day] = {
          segments,
          workedMinutes: dayWorked,
          firstArrival: segments[0]?.arrivalTime,
          lastDeparture: segments[segments.length - 1]?.departureTime
        };

        report.totals.workedMinutes += dayWorked;
      });

      return report;
    } catch (error) {
      console.error('❌ [ANOMALY] Erreur rapport employé:', error);
      return null;
    }
  }
}

// Export de l'instance unique
export const pointageAnomalyService = new PointageAnomalyService();
export default pointageAnomalyService;

console.log('🔍 PointageAnomalyService prêt - Détection anomalies pointage vs planning');
