// ==========================================
// 📁 react-app/src/shared/hooks/useValidationSync.js
// HOOK REACT SYNCHRONISATION VALIDATION TEMPS RÉEL
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { validationSyncService } from '../../core/services/validationSyncService.js';

/**
 * 🔄 HOOK POUR SYNCHRONISATION VALIDATION TEMPS RÉEL
 * Garantit la cohérence entre les statistiques et le contenu des validations
 */
export const useValidationSync = (options = {}) => {
  const { 
    autoStart = true,
    enableRealTime = true,
    refreshInterval = null 
  } = options;

  // 📊 États principaux
  const [validations, setValidations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔄 Références pour éviter les re-renders
  const syncInitialized = useRef(false);
  const unsubscribeRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  /**
   * 🚀 INITIALISER LA SYNCHRONISATION
   */
  const initializeSync = useCallback(async () => {
    if (syncInitialized.current) {
      console.log('⚠️ [USE-VALIDATION-SYNC] Déjà initialisé');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [USE-VALIDATION-SYNC] Initialisation...');
      
      // 1. Initialiser le service
      await validationSyncService.initializeSync();
      
      // 2. Charger les données initiales
      await loadInitialData();
      
      // 3. S'abonner aux changements temps réel
      if (enableRealTime) {
        setupRealTimeSubscription();
      }
      
      // 4. Configurer le refresh périodique si demandé
      if (refreshInterval) {
        setupPeriodicRefresh();
      }
      
      syncInitialized.current = true;
      console.log('✅ [USE-VALIDATION-SYNC] Initialisé avec succès');
      
    } catch (error) {
      console.error('❌ [USE-VALIDATION-SYNC] Erreur initialisation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [enableRealTime, refreshInterval]);

  /**
   * 📥 CHARGER LES DONNÉES INITIALES
   */
  const loadInitialData = useCallback(async () => {
    try {
      console.log('📥 [USE-VALIDATION-SYNC] Chargement données initiales...');
      
      const [pendingValidations, statsData] = await Promise.all([
        validationSyncService.getAllPendingValidations(),
        validationSyncService.getRealTimeStats()
      ]);
      
      setValidations(pendingValidations);
      setStats(statsData);
      setLastUpdate(new Date());
      
      console.log(`✅ [USE-VALIDATION-SYNC] Données chargées: ${pendingValidations.length} validations, stats:`, statsData);
      
    } catch (error) {
      console.error('❌ [USE-VALIDATION-SYNC] Erreur chargement:', error);
      setError(error.message);
    }
  }, []);

  /**
   * 🔄 CONFIGURER L'ABONNEMENT TEMPS RÉEL
   */
  const setupRealTimeSubscription = useCallback(() => {
    try {
      console.log('🔄 [USE-VALIDATION-SYNC] Configuration abonnement temps réel...');
      
      const unsubscribe = validationSyncService.subscribeToChanges(async (event, data) => {
        console.log(`📡 [USE-VALIDATION-SYNC] Événement reçu: ${event}`);
        
        try {
          // Recharger les données complètes pour garantir la cohérence
          const [updatedValidations, updatedStats] = await Promise.all([
            validationSyncService.getAllPendingValidations(),
            validationSyncService.getRealTimeStats()
          ]);
          
          setValidations(updatedValidations);
          setStats(updatedStats);
          setLastUpdate(new Date());
          
          console.log(`🔄 [USE-VALIDATION-SYNC] Données mises à jour: ${updatedValidations.length} validations`);
          
        } catch (error) {
          console.error('❌ [USE-VALIDATION-SYNC] Erreur mise à jour temps réel:', error);
          setError(error.message);
        }
      });
      
      unsubscribeRef.current = unsubscribe;
      console.log('✅ [USE-VALIDATION-SYNC] Abonnement temps réel configuré');
      
    } catch (error) {
      console.error('❌ [USE-VALIDATION-SYNC] Erreur abonnement:', error);
    }
  }, []);

  /**
   * ⏱️ CONFIGURER LE REFRESH PÉRIODIQUE
   */
  const setupPeriodicRefresh = useCallback(() => {
    if (!refreshInterval) return;
    
    console.log(`⏱️ [USE-VALIDATION-SYNC] Refresh périodique configuré: ${refreshInterval}ms`);
    
    refreshIntervalRef.current = setInterval(async () => {
      try {
        console.log('⏱️ [USE-VALIDATION-SYNC] Refresh périodique...');
        await forceRefresh();
      } catch (error) {
        console.error('❌ [USE-VALIDATION-SYNC] Erreur refresh périodique:', error);
      }
    }, refreshInterval);
  }, [refreshInterval]);

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [USE-VALIDATION-SYNC] Refresh forcé...');
      
      const result = await validationSyncService.forceSync();
      
      setValidations(result.pending);
      setStats(result.stats);
      setLastUpdate(new Date());
      
      console.log('✅ [USE-VALIDATION-SYNC] Refresh forcé terminé');
      
      return result;
      
    } catch (error) {
      console.error('❌ [USE-VALIDATION-SYNC] Erreur refresh forcé:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 📋 OBTENIR LES VALIDATIONS PAR STATUT
   */
  const getValidationsByStatus = useCallback((status) => {
    switch (status) {
      case 'pending':
        return validations;
      case 'all':
        return validations;
      default:
        return validations.filter(v => v.status === status);
    }
  }, [validations]);

  /**
   * 📊 OBTENIR LES STATISTIQUES DÉTAILLÉES
   */
  const getDetailedStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Analyser les validations actuelles
    const pending = validations.length;
    const todaySubmissions = validations.filter(v => {
      const submittedAt = v.submittedAt?.toDate ? v.submittedAt.toDate() : new Date(v.submittedAt);
      return submittedAt >= today;
    }).length;
    
    // Analyser par source
    const fromTasks = validations.filter(v => v.source === 'tasks_collection').length;
    const fromValidations = validations.filter(v => v.source === 'validations_collection').length;
    
    return {
      ...stats,
      pending: pending, // Forcer la valeur réelle
      today: todaySubmissions,
      sources: {
        tasks: fromTasks,
        validations: fromValidations,
        total: pending
      },
      lastUpdate: lastUpdate
    };
  }, [validations, stats, lastUpdate]);

  // 🚀 Effet d'initialisation
  useEffect(() => {
    if (autoStart && !syncInitialized.current) {
      initializeSync();
    }
    
    return () => {
      // Nettoyage lors du démontage
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoStart, initializeSync]);

  // 🧹 Effet de nettoyage
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      syncInitialized.current = false;
    };
  }, []);

  return {
    // 📊 Données
    validations,
    stats: getDetailedStats(),
    loading,
    error,
    lastUpdate,
    
    // 🔄 Actions
    forceRefresh,
    initializeSync,
    getValidationsByStatus,
    
    // 📊 Utilitaires
    isInitialized: syncInitialized.current,
    hasError: !!error,
    isEmpty: validations.length === 0,
    count: validations.length
  };
};

export default useValidationSync;

console.log('🚀 useValidationSync prêt - Hook de synchronisation validation temps réel');
