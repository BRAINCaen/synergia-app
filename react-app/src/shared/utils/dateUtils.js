const dateUtils = {
  /**
   * Formate une date pour un input de type date
   * @param {Date|Timestamp} date - Date à formater
   * @returns {string} Date au format YYYY-MM-DD
   */
  formatForInput: (date) => {
    if (!date) return '';
    
    try {
      // Gérer les timestamps Firestore
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return '';
    }
  },

  /**
   * Formate une date pour l'affichage
   * @param {Date|Timestamp} date - Date à formater
   * @param {string} locale - Locale (défaut: 'fr-FR')
   * @returns {string} Date formatée
   */
  formatDisplay: (date, locale = 'fr-FR') => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return '';
    }
  },

  /**
   * Vérifie si une date est passée
   * @param {Date|Timestamp} date - Date à vérifier
   * @returns {boolean} True si la date est passée
   */
  isPast: (date) => {
    if (!date) return false;
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj < new Date();
    } catch (error) {
      return false;
    }
  },

  /**
   * Calcule la différence en jours entre deux dates
   * @param {Date|Timestamp} date1 - Première date
   * @param {Date|Timestamp} date2 - Deuxième date (défaut: maintenant)
   * @returns {number} Différence en jours
   */
  daysDifference: (date1, date2 = new Date()) => {
    if (!date1) return 0;
    
    try {
      const dateObj1 = date1.toDate ? date1.toDate() : new Date(date1);
      const dateObj2 = date2.toDate ? date2.toDate() : new Date(date2);
      
      const diffTime = Math.abs(dateObj2 - dateObj1);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }
};

export default dateUtils;
