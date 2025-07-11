// ==========================================
// 📁 react-app/src/components/core/DataInitializer.jsx
// Composant d'initialisation automatique des données
// ==========================================

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import dataSyncService from '../../core/services/dataSyncService.js';

/**
 * 🚀 INITIALISATEUR AUTOMATIQUE DES DONNÉES
 * S'exécute silencieusement à chaque connexion pour garantir la cohérence
 */
const DataInitializer = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [initializationStatus, setInitializationStatus] = useState('idle');
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.uid && !initializationComplete) {
      initializeUserData();
    }
  }, [isAuthenticated, user?.uid, initializationComplete]);

  const initializeUserData = async () => {
    try {
      setInitializationStatus('initializing');
      
      console.log('🚀 Initialisation automatique des données pour:', user.uid);
      
      // 1. Diagnostic silencieux
      const diagnostic = await dataSyncService.diagnoseDataInconsistencies(user.uid);
      
      // 2. Réparation automatique si nécessaire
      if (diagnostic.status !== 'healthy') {
        console.log(`⚡ Réparation automatique: ${diagnostic.issues.length} problème(s) détecté(s)`);
        
        const repairResult = await dataSyncService.repairUserData(user.uid, user);
        
        if (repairResult.success) {
          console.log('✅ Données réparées automatiquement lors de l\'initialisation');
        } else {
          console.error('❌ Échec réparation automatique:', repairResult.message);
        }
      } else {
        console.log('✅ Données déjà cohérentes - Aucune réparation nécessaire');
      }
      
      // 3. Marquer comme initialisé
      setInitializationComplete(true);
      setInitializationStatus('completed');
      
    } catch (error) {
      console.error('❌ Erreur initialisation automatique:', error);
      setInitializationStatus('error');
      
      // Même en cas d'erreur, laisser l'app continuer
      setInitializationComplete(true);
    }
  };

  // Rendu transparent - l'initialisation se fait en arrière-plan
  return (
    <>
      {children}
      
      {/* Indicateur discret d'initialisation (optionnel) */}
      {initializationStatus === 'initializing' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Synchronisation...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default DataInitializer;
