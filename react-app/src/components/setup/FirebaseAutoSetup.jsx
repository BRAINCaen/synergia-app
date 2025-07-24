// ==========================================
// 📁 react-app/src/components/setup/FirebaseAutoSetup.jsx
// COMPOSANT D'AUTO-CONFIGURATION FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Loader, 
  Users, 
  Target, 
  Trophy, 
  Settings,
  Rocket,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore';
import { firebaseDataInitializer } from '../../core/services/firebaseDataInitializer';

/**
 * 🚀 COMPOSANT D'AUTO-CONFIGURATION FIREBASE
 * S'affiche au premier lancement pour initialiser les données
 */
const FirebaseAutoSetup = ({ onComplete }) => {
  const { user } = useAuthStore();
  const [setupStep, setSetupStep] = useState(0);
  const [setupStatus, setSetupStatus] = useState('checking');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const setupSteps = [
    { id: 'check', label: 'Vérification de l\'état', icon: Database },
    { id: 'badges', label: 'Création des badges', icon: Trophy },
    { id: 'categories', label: 'Configuration des catégories', icon: Settings },
    { id: 'admin', label: 'Configuration administrateur', icon: Users },
    { id: 'samples', label: 'Données d\'exemple', icon: Target },
    { id: 'complete', label: 'Finalisation', icon: CheckCircle }
  ];

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  /**
   * 🔍 DÉMARRER LA CONFIGURATION AUTOMATIQUE
   */
  useEffect(() => {
    if (user && setupStatus === 'checking') {
      startAutoSetup();
    }
  }, [user, setupStatus]);

  const startAutoSetup = async () => {
    try {
      setSetupStatus('running');
      addLog('🚀 Début de la configuration automatique', 'info');

      // Étape 1 : Vérifier l'état actuel
      setSetupStep(0);
      addLog('🔍 Vérification de l\'état de la base de données...', 'info');
      
      const health = await firebaseDataInitializer.checkDatabaseHealth();
      addLog(`📊 État: ${health.users} utilisateurs, ${health.tasks} tâches, ${health.badges} badges`, 'success');

      if (health.initialized) {
        addLog('✅ Base de données déjà initialisée', 'success');
        setSetupStatus('already_done');
        onComplete?.();
        return;
      }

      // Étape 2 : Création des badges
      setSetupStep(1);
      addLog('🏆 Création des badges de base...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Animation
      addLog('✅ Badges créés avec succès', 'success');

      // Étape 3 : Configuration des catégories
      setSetupStep(2);
      addLog('🏷️ Configuration des catégories de tâches...', 'info');
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('✅ Catégories configurées', 'success');

      // Étape 4 : Configuration admin
      setSetupStep(3);
      addLog('👤 Configuration de l\'utilisateur administrateur...', 'info');
      
      const adminData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL,
        profile: {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          department: 'Administration'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1200));
      addLog('✅ Administrateur configuré', 'success');

      // Étape 5 : Données d'exemple
      setSetupStep(4);
      addLog('📋 Création des données d\'exemple...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('✅ Données d\'exemple créées', 'success');

      // Étape 6 : Finalisation
      setSetupStep(5);
      addLog('🎉 Finalisation de la configuration...', 'info');
      
      // Lancer la vraie initialisation
      await firebaseDataInitializer.quickDemo(adminData);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('🚀 Configuration terminée avec succès!', 'success');

      setSetupStatus('completed');
      
      // Attendre un peu puis terminer
      setTimeout(() => {
        onComplete?.();
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur configuration:', error);
      setError(error.message);
      setSetupStatus('error');
      addLog(`❌ Erreur: ${error.message}`, 'error');
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  if (setupStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  if (setupStatus === 'already_done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center"
      >
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Synergia est prêt !</h2>
          <p className="text-gray-600">La configuration est déjà terminée.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configuration Automatique</h1>
          </div>
          <p className="text-lg text-gray-600">
            Première utilisation détectée - Configuration de Synergia en cours...
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Étapes de progression */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Étapes de Configuration
            </h2>

            <div className="space-y-4">
              {setupSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = setupStep === index;
                const isCompleted = setupStep > index;
                const isPending = setupStep < index;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-50 border border-blue-200' :
                      isCompleted ? 'bg-green-50 border border-green-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {isActive ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isActive ? 'text-blue-900' :
                        isCompleted ? 'text-green-900' :
                        'text-gray-600'
                      }`}>
                        {step.label}
                      </p>
                      
                      {isActive && (
                        <p className="text-sm text-blue-600">En cours...</p>
                      )}
                      
                      {isCompleted && (
                        <p className="text-sm text-green-600">Terminé</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Barre de progression globale */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progression</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((setupStep / (setupSteps.length - 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(setupStep / (setupSteps.length - 1)) * 100}%` }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Console de logs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-xl shadow-lg p-6 text-white"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Console de Configuration
            </h2>

            <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-2 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className="ml-2">{getLogIcon(log.type)}</span>
                  <span className="ml-2">{log.message}</span>
                </motion.div>
              ))}
              
              {/* Curseur clignotant */}
              {setupStatus === 'running' && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-4 bg-green-400 ml-1"
                />
              )}
            </div>

            {/* Status final */}
            {setupStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-900 rounded-lg border border-green-700"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="font-medium text-green-100">Configuration terminée !</p>
                    <p className="text-sm text-green-200">Synergia est maintenant prêt à être utilisé.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Erreur */}
            {setupStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-red-900 rounded-lg border border-red-700"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-medium text-red-100">Erreur de configuration</p>
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAutoSetup;
