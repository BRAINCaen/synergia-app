// ==========================================
// 📁 react-app/src/core/services/recurrenceSchedulerService.js
// SERVICE DE PLANIFICATION AUTOMATIQUE DES TÂCHES RÉCURRENTES
// ==========================================

import weeklyRecurrenceService from './weeklyRecurrenceService.js';

/**
 * ⏰ SERVICE DE PLANIFICATION AUTOMATIQUE
 * Gère l'exécution périodique des vérifications de récurrence
 */
class RecurrenceSchedulerService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.lastCheck = null;
    this.checkFrequency = 30 * 60 * 1000; // 30 minutes par défaut
    
    console.log('⏰ RecurrenceSchedulerService initialisé');
  }

  /**
   * 🚀 DÉMARRER LE PLANIFICATEUR
   */
  start(frequency = this.checkFrequency) {
    if (this.isRunning) {
      console.log('⏰ Planificateur déjà en cours d\'exécution');
      return;
    }

    console.log(`⏰ Démarrage planificateur (vérification toutes les ${frequency / 1000 / 60} minutes)`);
    
    this.checkFrequency = frequency;
    this.isRunning = true;

    // Exécuter une première vérification immédiatement
    this.performScheduledCheck();

    // Programmer les vérifications périodiques
    this.intervalId = setInterval(() => {
      this.performScheduledCheck();
    }, this.checkFrequency);

    console.log('✅ Planificateur de récurrence démarré');
  }

  /**
   * 🛑 ARRÊTER LE PLANIFICATEUR
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('🛑 Planificateur de récurrence arrêté');
  }

  /**
   * 🔄 EFFECTUER UNE VÉRIFICATION PROGRAMMÉE
   */
  async performScheduledCheck() {
    try {
      const now = new Date();
      console.log(`🔄 Vérification récurrence programmée: ${now.toLocaleString()}`);

      // 1. Traiter les nouvelles instances de tâches récurrentes
      const processResult = await weeklyRecurrenceService.processScheduledTasks();
      
      if (processResult.success && processResult.createdInstances > 0) {
        console.log(`📝 ${processResult.createdInstances} nouvelles instances créées`);
      }

      // 2. Gérer les tâches en retard
      const overdueResult = await weeklyRecurrenceService.handleOverdueTasks();
      
      if (overdueResult.success && overdueResult.reportedTasks > 0) {
        console.log(`📅 ${overdueResult.reportedTasks} tâches reportées`);
      }

      // 3. Mettre à jour le timestamp de dernière vérification
      this.lastCheck = now;

      console.log(`✅ Vérification récurrence terminée: ${now.toLocaleString()}`);

    } catch (error) {
      console.error('❌ Erreur lors de la vérification récurrence:', error);
    }
  }

  /**
   * 🔄 FORCER UNE VÉRIFICATION MANUELLE
   */
  async forceCheck() {
    console.log('🔄 Vérification récurrence forcée...');
    await this.performScheduledCheck();
  }

  /**
   * 📊 OBTENIR LE STATUT DU PLANIFICATEUR
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      checkFrequency: this.checkFrequency,
      nextCheck: this.isRunning && this.lastCheck ? 
        new Date(this.lastCheck.getTime() + this.checkFrequency) : null
    };
  }

  /**
   * ⚙️ CONFIGURER LA FRÉQUENCE DE VÉRIFICATION
   */
  setCheckFrequency(minutes) {
    const newFrequency = minutes * 60 * 1000;
    
    if (newFrequency !== this.checkFrequency) {
      console.log(`⚙️ Nouvelle fréquence: ${minutes} minutes`);
      
      const wasRunning = this.isRunning;
      
      if (wasRunning) {
        this.stop();
      }
      
      this.checkFrequency = newFrequency;
      
      if (wasRunning) {
        this.start(this.checkFrequency);
      }
    }
  }

  /**
   * 🌅 VÉRIFICATION AU DÉMARRAGE DE JOURNÉE
   * À appeler spécifiquement le matin pour traiter les tâches du jour
   */
  async morningStartupCheck() {
    try {
      console.log('🌅 Vérification matinale de démarrage...');
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Vérifier si on a déjà fait une vérification aujourd'hui
      const lastCheckDate = this.lastCheck ? this.lastCheck.toISOString().split('T')[0] : null;
      
      if (lastCheckDate !== today) {
        console.log('📅 Première vérification de la journée');
        
        // Traitement spécial pour le début de journée
        await this.performScheduledCheck();
        
        console.log('✅ Vérification matinale terminée');
      } else {
        console.log('🔄 Vérification déjà effectuée aujourd\'hui');
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification matinale:', error);
    }
  }

  /**
   * 🧹 NETTOYAGE ET MAINTENANCE
   */
  async performMaintenance() {
    try {
      console.log('🧹 Démarrage maintenance du système de récurrence...');
      
      // Ici on pourrait ajouter des tâches de maintenance comme :
      // - Nettoyer les anciennes instances archivées
      // - Vérifier l'intégrité des templates
      // - Optimiser les performances
      
      console.log('✅ Maintenance terminée');
      
    } catch (error) {
      console.error('❌ Erreur maintenance:', error);
    }
  }

  /**
   * 📈 OBTENIR DES STATISTIQUES DÉTAILLÉES
   */
  async getDetailedStats() {
    try {
      const status = this.getStatus();
      
      // Ajouter des stats sur les tâches récurrentes actives
      // (pourrait être étendu avec des données de weeklyRecurrenceService)
      
      return {
        scheduler: status,
        uptime: this.lastCheck ? new Date().getTime() - this.lastCheck.getTime() : 0,
        checksPerformed: 'N/A', // Pourrait être un compteur
        lastMaintenanceDate: 'N/A' // Pourrait être trackée
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      return null;
    }
  }
}

// Export de l'instance unique
const recurrenceSchedulerService = new RecurrenceSchedulerService();
export default recurrenceSchedulerService;
