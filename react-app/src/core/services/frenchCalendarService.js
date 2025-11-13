// ==========================================
// 📁 react-app/src/core/services/frenchCalendarService.js
// SERVICE CALENDRIER FRANÇAIS - ZONE NORMANDIE
// ==========================================

/**
 * 📅 SERVICE DE GESTION DU CALENDRIER FRANÇAIS
 * Jours fériés, vacances scolaires zone Normandie (Zone B), ponts
 */
class FrenchCalendarService {
  constructor() {
    this.zone = 'Normandie (Zone B)';
  }

  // ==========================================
  // 🎯 JOURS FÉRIÉS FRANÇAIS
  // ==========================================

  /**
   * 📅 CALCULER LE DIMANCHE DE PÂQUES (algorithme de Meeus)
   */
  calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  /**
   * 🎊 OBTENIR TOUS LES JOURS FÉRIÉS D'UNE ANNÉE
   */
  getPublicHolidays(year) {
    const easter = this.calculateEaster(year);
    
    // Jours fériés fixes
    const fixedHolidays = [
      { date: `${year}-01-01`, name: 'Jour de l\'An', emoji: '🎆', type: 'fixed' },
      { date: `${year}-05-01`, name: 'Fête du Travail', emoji: '⚒️', type: 'fixed' },
      { date: `${year}-05-08`, name: 'Victoire 1945', emoji: '🇫🇷', type: 'fixed' },
      { date: `${year}-07-14`, name: 'Fête Nationale', emoji: '🎆', type: 'fixed' },
      { date: `${year}-08-15`, name: 'Assomption', emoji: '⛪', type: 'fixed' },
      { date: `${year}-11-01`, name: 'Toussaint', emoji: '🕯️', type: 'fixed' },
      { date: `${year}-11-11`, name: 'Armistice 1918', emoji: '🇫🇷', type: 'fixed' },
      { date: `${year}-12-25`, name: 'Noël', emoji: '🎄', type: 'fixed' }
    ];

    // Jours fériés mobiles (basés sur Pâques)
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);

    const ascension = new Date(easter);
    ascension.setDate(ascension.getDate() + 39);

    const whitMonday = new Date(easter);
    whitMonday.setDate(whitMonday.getDate() + 50);

    const mobileHolidays = [
      { 
        date: this.formatDate(easterMonday), 
        name: 'Lundi de Pâques', 
        emoji: '🐰', 
        type: 'mobile' 
      },
      { 
        date: this.formatDate(ascension), 
        name: 'Ascension', 
        emoji: '☁️', 
        type: 'mobile' 
      },
      { 
        date: this.formatDate(whitMonday), 
        name: 'Lundi de Pentecôte', 
        emoji: '🕊️', 
        type: 'mobile' 
      }
    ];

    return [...fixedHolidays, ...mobileHolidays];
  }

  /**
   * 🎊 VÉRIFIER SI UNE DATE EST UN JOUR FÉRIÉ
   */
  isPublicHoliday(dateString) {
    const year = new Date(dateString).getFullYear();
    const holidays = this.getPublicHolidays(year);
    return holidays.find(h => h.date === dateString);
  }

  // ==========================================
  // 🏫 VACANCES SCOLAIRES ZONE B (NORMANDIE)
  // ==========================================

  /**
   * 📚 OBTENIR LES VACANCES SCOLAIRES
   */
  getSchoolHolidays(year) {
    // Vacances scolaires 2025 Zone B (Normandie)
    const holidays2025 = [
      {
        name: 'Vacances de Noël',
        start: '2024-12-21',
        end: '2025-01-06',
        emoji: '🎄'
      },
      {
        name: 'Vacances d\'Hiver',
        start: '2025-02-15',
        end: '2025-03-03',
        emoji: '⛷️'
      },
      {
        name: 'Vacances de Printemps',
        start: '2025-04-12',
        end: '2025-04-28',
        emoji: '🌸'
      },
      {
        name: 'Vacances d\'Été',
        start: '2025-07-05',
        end: '2025-09-01',
        emoji: '🏖️'
      },
      {
        name: 'Vacances de Toussaint',
        start: '2025-10-18',
        end: '2025-11-03',
        emoji: '🍂'
      },
      {
        name: 'Vacances de Noël',
        start: '2025-12-20',
        end: '2026-01-05',
        emoji: '🎄'
      }
    ];

    // Vacances scolaires 2026 Zone B (Normandie) - dates indicatives
    const holidays2026 = [
      {
        name: 'Vacances d\'Hiver',
        start: '2026-02-14',
        end: '2026-03-02',
        emoji: '⛷️'
      },
      {
        name: 'Vacances de Printemps',
        start: '2026-04-11',
        end: '2026-04-27',
        emoji: '🌸'
      },
      {
        name: 'Vacances d\'Été',
        start: '2026-07-04',
        end: '2026-09-01',
        emoji: '🏖️'
      },
      {
        name: 'Vacances de Toussaint',
        start: '2026-10-17',
        end: '2026-11-02',
        emoji: '🍂'
      },
      {
        name: 'Vacances de Noël',
        start: '2026-12-19',
        end: '2027-01-04',
        emoji: '🎄'
      }
    ];

    if (year === 2025) return holidays2025;
    if (year === 2026) return holidays2026;
    
    // Pour les autres années, retourner un tableau vide avec un avertissement
    return [];
  }

  /**
   * 📚 VÉRIFIER SI UNE DATE EST EN VACANCES SCOLAIRES
   */
  isSchoolHoliday(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const holidays = this.getSchoolHolidays(year);

    for (const holiday of holidays) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      
      if (date >= start && date <= end) {
        return holiday;
      }
    }

    return null;
  }

  // ==========================================
  // 🌉 DÉTECTION DES PONTS
  // ==========================================

  /**
   * 🌉 DÉTECTER SI UN JOUR FÉRIÉ FAIT UN PONT
   */
  detectBridge(dateString) {
    const holiday = this.isPublicHoliday(dateString);
    if (!holiday) return null;

    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    // Jeudi férié → pont possible vendredi
    if (dayOfWeek === 4) {
      return {
        type: 'bridge',
        description: 'Pont possible le vendredi',
        emoji: '🌉',
        impactDays: 1
      };
    }

    // Mardi férié → pont possible lundi
    if (dayOfWeek === 2) {
      return {
        type: 'bridge',
        description: 'Pont possible le lundi',
        emoji: '🌉',
        impactDays: 1
      };
    }

    return null;
  }

  // ==========================================
  // 🎯 ANALYSE COMPLÈTE D'UNE DATE
  // ==========================================

  /**
   * 📊 ANALYSER UNE DATE (jours fériés, vacances, ponts)
   */
  analyzeDateForPlanning(dateString) {
    const analysis = {
      date: dateString,
      isSpecial: false,
      alerts: []
    };

    // Vérifier jour férié
    const holiday = this.isPublicHoliday(dateString);
    if (holiday) {
      analysis.isSpecial = true;
      analysis.alerts.push({
        type: 'holiday',
        severity: 'high',
        message: `${holiday.emoji} ${holiday.name}`,
        emoji: holiday.emoji,
        color: 'red'
      });

      // Vérifier pont
      const bridge = this.detectBridge(dateString);
      if (bridge) {
        analysis.alerts.push({
          type: 'bridge',
          severity: 'medium',
          message: `${bridge.emoji} ${bridge.description}`,
          emoji: bridge.emoji,
          color: 'orange'
        });
      }
    }

    // Vérifier vacances scolaires
    const schoolHoliday = this.isSchoolHoliday(dateString);
    if (schoolHoliday) {
      analysis.isSpecial = true;
      analysis.alerts.push({
        type: 'school_holiday',
        severity: 'medium',
        message: `${schoolHoliday.emoji} ${schoolHoliday.name}`,
        emoji: schoolHoliday.emoji,
        color: 'blue'
      });
    }

    // Vérifier week-end
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      analysis.isSpecial = true;
      analysis.alerts.push({
        type: 'weekend',
        severity: 'low',
        message: dayOfWeek === 0 ? '🌞 Dimanche' : '🌞 Samedi',
        emoji: '🌞',
        color: 'yellow'
      });
    }

    return analysis;
  }

  /**
   * 📊 ANALYSER UNE SEMAINE COMPLÈTE
   */
  analyzeWeekForPlanning(weekDates) {
    const weekAnalysis = {
      dates: weekDates.map(date => this.analyzeDateForPlanning(date)),
      summary: {
        totalHolidays: 0,
        totalSchoolHolidays: 0,
        totalBridges: 0,
        totalWeekendDays: 0,
        hasHighDemand: false,
        demandLevel: 'normal' // normal, medium, high, very_high
      }
    };

    // Calculer le résumé
    weekAnalysis.dates.forEach(dateAnalysis => {
      dateAnalysis.alerts.forEach(alert => {
        if (alert.type === 'holiday') weekAnalysis.summary.totalHolidays++;
        if (alert.type === 'school_holiday') weekAnalysis.summary.totalSchoolHolidays++;
        if (alert.type === 'bridge') weekAnalysis.summary.totalBridges++;
        if (alert.type === 'weekend') weekAnalysis.summary.totalWeekendDays++;
      });
    });

    // Déterminer le niveau de demande
    if (weekAnalysis.summary.totalHolidays >= 2 || weekAnalysis.summary.totalSchoolHolidays > 0) {
      weekAnalysis.summary.demandLevel = 'very_high';
      weekAnalysis.summary.hasHighDemand = true;
    } else if (weekAnalysis.summary.totalHolidays === 1 || weekAnalysis.summary.totalBridges > 0) {
      weekAnalysis.summary.demandLevel = 'high';
      weekAnalysis.summary.hasHighDemand = true;
    } else if (weekAnalysis.summary.totalWeekendDays >= 2) {
      weekAnalysis.summary.demandLevel = 'medium';
    }

    return weekAnalysis;
  }

  // ==========================================
  // 🛠️ UTILITAIRES
  // ==========================================

  /**
   * 📅 FORMATER UNE DATE EN YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 📅 OBTENIR LES DATES D'UNE SEMAINE
   */
  getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(this.formatDate(date));
    }
    
    return dates;
  }
}

// Export du service
const frenchCalendarService = new FrenchCalendarService();
export default frenchCalendarService;
