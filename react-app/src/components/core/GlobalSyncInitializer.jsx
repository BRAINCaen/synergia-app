// ==========================================
// 📁 react-app/src/components/core/GlobalSyncInitializer.jsx
// INITIALISATEUR GLOBAL - Synchronise automatiquement TOUS les utilisateurs
// ==========================================

import React, { useEffect, useState } from 'react';
import globalSyncService from '../../core/services/globalSyncService.js';

/**
 * 🌐 INITIALISATEUR GLOBAL DE SYNCHRONISATION
 * Se lance automatiquement au démarrage pour synchroniser TOUS les utilisateurs
 * Firebase devient la source unique de vérité pour toute l'application
 */
const GlobalSyncInitializer = ({ children }) => {
  const [initStatus, setInitStatus] = useState('initializing');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('Initialisation...');

  useEffect(() => {
    initializeGlobalSync();
  }, []);

  const initializeGlobalSync = async () => {
    try {
      console.log('🚀 Démarrage synchronisation globale automatique...');
      
      setInitStatus('initializing');
      setSyncMessage('Initialisation du système de synchronisation...');
      setSyncProgress(10);
      
      // 1. Initialiser le service global
      await globalSyncService.initializeGlobalSync();
      setSyncProgress(50);
      setSyncMessage('Synchronisation des utilisateurs existants...');
      
      // 2. Synchroniser tous les utilisateurs existants
      const syncResult = await globalSyncService.syncAllExistingUsers();
      setSyncProgress(80);
      
      if (syncResult.success) {
        setSyncMessage(`${syncResult.correctedCount} utilisateurs synchronisés`);
        console.log(`✅ Synchronisation globale terminée: ${syncResult.correctedCount} utilisateurs corrigés`);
      } else {
        throw new Error(syncResult.error);
      }
      
      // 3. Marquer comme complété
      setSyncProgress(100);
      setSyncMessage('Synchronisation globale terminée');
      setInitStatus('completed');
      
      // Masquer la notification après 3 secondes
      setTimeout(() => {
        setInitStatus('hidden');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur synchronisation globale:', error);
      
      setInitStatus('error');
      setSyncMessage(`Erreur: ${error.message}`);
      
      // Masquer l'erreur après 5 secondes et continuer quand même
      setTimeout(() => {
        setInitStatus('hidden');
      }, 5000);
    }
  };

  // 🎨 Composant de notification de synchronisation
  const SyncNotification = () => {
    if (initStatus === 'hidden') return null;
    
    const getStatusColor = () => {
      switch (initStatus) {
        case 'initializing': return 'bg-blue-600';
        case 'completed': return 'bg-green-600';
        case 'error': return 'bg-red-600';
        default: return 'bg-gray-600';
      }
    };

    const getStatusIcon = () => {
      switch (initStatus) {
        case 'initializing': return '🔄';
        case 'completed': return '✅';
        case 'error': return '❌';
        default: return '🔄';
      }
    };

    return (
      <div className="fixed top-4 right-4 z-[9999] max-w-sm">
        <div className={`${getStatusColor()} text-white px-4 py-3 rounded-lg shadow-lg`}>
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getStatusIcon()}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">Synchronisation Firebase</div>
              <div className="text-xs opacity-90">{syncMessage}</div>
              
              {initStatus === 'initializing' && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-white h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 opacity-75">{syncProgress}%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {children}
      <SyncNotification />
    </>
  );
};

export default GlobalSyncInitializer;
