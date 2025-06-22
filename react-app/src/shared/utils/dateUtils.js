// src/shared/utils/dateUtils.js - Gestion des dates Firebase/JavaScript
export const dateUtils = {
  /**
   * Convertit un timestamp Firebase en Date JavaScript
   */
  fromFirebaseTimestamp: (timestamp) => {
    if (!timestamp) return null;
    
    // Si c'est déjà une Date
    if (timestamp instanceof Date) {
      return isValidDate(timestamp) ? timestamp : null;
    }
    
    // Si c'est un Firebase Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      try {
        return timestamp.toDate();
      } catch (error) {
        console.warn('Erreur conversion Firebase Timestamp:', error);
        return null;
      }
    }
    
    // Si c'est un timestamp avec seconds/nanoseconds
    if (timestamp && typeof timestamp.seconds === 'number') {
      try {
        return new Date(timestamp.seconds * 1000);
      } catch (error) {
        console.warn('Erreur conversion timestamp seconds:', error);
        return null;
      }
    }
    
    // Si c'est un string ou number
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      try {
        const date = new Date(timestamp);
        return isValidDate(date) ? date : null;
      } catch (error) {
        console.warn('Erreur conversion string/number vers Date:', error);
        return null;
      }
    }
    
    console.warn('Format de timestamp non reconnu:', timestamp);
    return null;
  },

  /**
   * Convertit une Date en timestamp pour Firebase
   */
  toFirebaseTimestamp: (date) => {
    if (!date) return null;
    
    if (date instanceof Date) {
      return isValidDate(date) ? date : null;
    }
    
    if (typeof date === 'string' || typeof date === 'number') {
      const converted = new Date(date);
      return isValidDate(converted) ? converted : null;
    }
    
    return null;
  },

  /**
   * Formate une date pour affichage
   */
  formatDate: (date, options = {}) => {
    const normalizedDate = dateUtils.fromFirebaseTimestamp(date);
    if (!normalizedDate) return 'Date invalide';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(normalizedDate);
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return 'Date invalide';
    }
  },

  /**
   * Formate une date avec heure
   */
  formatDateTime: (date) => {
    return dateUtils.formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Formate pour input datetime-local
   */
  formatForInput: (date) => {
    const normalizedDate = dateUtils.fromFirebaseTimestamp(date);
    if (!normalizedDate) return '';
    
    try {
      return normalizedDate.toISOString().slice(0, 16);
    } catch (error) {
      console.warn('Erreur formatage pour input:', error);
      return '';
    }
  },

  /**
   * Vérifie si une date est en retard
   */
  isOverdue: (dueDate, compareDate = new Date()) => {
    const due = dateUtils.fromFirebaseTimestamp(dueDate);
    const compare = dateUtils.fromFirebaseTimestamp(compareDate);
    
    if (!due || !compare) return false;
    
    return due < compare;
  },

  /**
   * Calcule la différence en jours
   */
  daysDifference: (date1, date2) => {
    const d1 = dateUtils.fromFirebaseTimestamp(date1);
    const d2 = dateUtils.fromFirebaseTimestamp(date2);
    
    if (!d1 || !d2) return 0;
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Obtient le début de la journée
   */
  startOfDay: (date = new Date()) => {
    const normalized = dateUtils.fromFirebaseTimestamp(date);
    if (!normalized) return new Date();
    
    const result = new Date(normalized);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  /**
   * Obtient la fin de la journée
   */
  endOfDay: (date = new Date()) => {
    const normalized = dateUtils.fromFirebaseTimestamp(date);
    if (!normalized) return new Date();
    
    const result = new Date(normalized);
    result.setHours(23, 59, 59, 999);
    return result;
  }
};

/**
 * Vérifie si une date est valide
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

// Export par défaut
export default dateUtils;
