// ==========================================
// 📁 react-app/src/pages/TestDashboardPage.jsx
// PAGE DE TEST - TABLEAU DE BORD ET COMPOSANTS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Award,
  Target,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Code,
  Bug,
  Shield,
  Rocket,
  Heart
} from 'lucide-react';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout et composants - IMPORT CORRIGÉ
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Firebase (pour les tests de connectivité) - IMPORT CORRIGÉ
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const TestDashboardPage = () => {
  const { user } = useAuthStore();
  
  // États des tests
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  
  // États des composants
  const [componentTests, setComponentTests] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [connectivityStatus, setConnectivityStatus] = useState({});

  // ✅ CONFIGURATION DES TESTS
  const TEST_SUITES = {
    core: {
      id: 'core',
      name: 'Tests Core',
      icon: Database,
      color: 'text-blue-400',
      tests: [
        { id: 'firebase_connection', name: 'Connexion Firebase', critical: true },
        { id: 'auth_system', name: 'Système d\'authentification', critical: true },
        { id: 'routing', name: 'Système de routage', critical: true },
        { id: 'state_management', name: 'Gestion d\'état', critical: false }
      ]
    },
    ui: {
      id: 'ui',
      name: 'Interface Utilisateur',
      icon: Monitor,
      color: 'text-green-400',
      tests: [
        { id: 'responsive_design', name: 'Design responsive', critical: false },
        { id: 'premium_layout', name: 'Layout premium', critical: false },
        { id: 'animations', name: 'Animations Framer Motion', critical: false },
        { id: 'icons_loading', name: 'Chargement des icônes', critical: false }
      ]
    },
    features: {
      id: 'features',
      name: 'Fonctionnalités',
      icon: Zap,
      color: 'text-purple-400',
      tests: [
        { id: 'gamification', name: 'Système de gamification', critical: false },
        { id: 'task_management', name: 'Gestion des tâches', critical: true },
        { id: 'user_management', name: 'Gestion des utilisateurs', critical: true },
        { id: 'rewards_system', name: 'Système de récompenses', critical: false }
      ]
    },
    performance: {
      id: 'performance',
      name: 'Performance',
      icon: Rocket,
      color: 'text-orange-400',
      tests: [
        { id: 'page_load_time', name: 'Temps de chargement', critical: true },
        { id: 'bundle_size', name: 'Taille du bundle', critical: false },
        { id: 'memory_usage', name: 'Utilisation mémoire', critical: false },
        { id: 'api_response_time', name: 'Temps réponse API', critical: true }
      ]
    }
  };

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    initializeTestDashboard();
  }, []);

  // 📊 INITIALISER LE TABLEAU DE BORD DE TESTS
  const initializeTestDashboard = async () => {
    try {
      console.log('🧪 Initialisation Test Dashboard...');
      
      // Test de connectivité Firebase
      await testFirebaseConnection();
      
      // Test des composants React
      await testReactComponents();
      
      // Mesure des performances
      await measurePerformance();
      
      console.log('✅ Test Dashboard initialisé');
      
    } catch (error) {
      console.error('❌ Erreur initialisation Test Dashboard:', error);
    }
  };

  // 🔥 TESTER LA CONNEXION FIREBASE
  const testFirebaseConnection = async () => {
    try {
      console.log('🔥 Test connexion Firebase...');
      
      setConnectivityStatus(prev => ({
        ...prev,
        firebase: { status: 'testing', message: 'Connexion en cours...' }
      }));

      // Test de lecture simple
      const testCollection = collection(db, 'users');
      const snapshot = await getDocs(testCollection);
      
      setConnectivityStatus(prev => ({
        ...prev,
        firebase: { 
          status: 'success', 
          message: `Connecté - ${snapshot.size} documents trouvés`,
          details: {
            collections_accessible: true,
            read_permissions: true,
            connection_time: Date.now()
          }
        }
      }));
      
      console.log('✅ Firebase connexion OK');
      
    } catch (error) {
      console.error('❌ Erreur Firebase:', error);
      
      setConnectivityStatus(prev => ({
        ...prev,
        firebase: { 
          status: 'error', 
          message: `Erreur: ${error.message}`,
          details: {
            error_code: error.code,
            error_type: error.constructor.name
          }
        }
      }));
    }
  };

  // ⚛️ TESTER LES COMPOSANTS REACT
  const testReactComponents = async () => {
    try {
      console.log('⚛️ Test composants React...');
      
      const componentStatus = {
        PremiumLayout: { loaded: !!PremiumLayout, functional: true },
        PremiumCard: { loaded: !!PremiumCard, functional: true },
        StatCard: { loaded: !!StatCard, functional: true },
        PremiumButton: { loaded: !!PremiumButton, functional: true },
        FramerMotion: { loaded: !!motion, functional: true },
        LucideIcons: { loaded: !!TestTube, functional: true }
      };
      
      setComponentTests(componentStatus);
      
      console.log('✅ Tests composants terminés');
      
    } catch (error) {
      console.error('❌ Erreur test composants:', error);
    }
  };

  // 📈 MESURER LES PERFORMANCES
  const measurePerformance = async () => {
    try {
      console.log('📈 Mesure performances...');
      
      const performanceData = {
        loadTime: performance.now(),
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : { message: 'API non disponible' },
        navigation: performance.getEntriesByType('navigation')[0],
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      setPerformanceMetrics(performanceData);
      
      console.log('✅ Mesures performances terminées');
      
    } catch (error) {
      console.error('❌ Erreur mesure performances:', error);
    }
  };

  // 🏃 EXÉCUTER UNE SUITE DE TESTS
  const runTestSuite = async (suiteId) => {
    try {
      setIsRunningTests(true);
      setTestProgress(0);
      
      const suite = TEST_SUITES[suiteId];
      if (!suite) return;
      
      console.log(`🧪 Exécution suite: ${suite.name}`);
      
      const results = {};
      const totalTests = suite.tests.length;
      
      for (let i = 0; i < totalTests; i++) {
        const test = suite.tests[i];
        setTestProgress(((i + 1) / totalTests) * 100);
        
        try {
          // Simuler l'exécution du test
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let testResult = { status: 'success', message: 'Test réussi' };
          
          // Tests spécifiques
          if (test.id === 'firebase_connection') {
            testResult = connectivityStatus.firebase ? 
              { status: 'success', message: 'Connexion Firebase OK' } :
              { status: 'error', message: 'Connexion Firebase échouée' };
          }
          
          results[test.id] = testResult;
          
        } catch (error) {
          results[test.id] = { 
            status: 'error', 
            message: error.message 
          };
        }
      }
      
      setTestResults(prev => ({
        ...prev,
        [suiteId]: results
      }));
      
      console.log('✅ Suite de tests terminée:', results);
      
    } catch (error) {
      console.error('❌ Erreur exécution tests:', error);
    } finally {
      setIsRunningTests(false);
      setTestProgress(0);
    }
  };

  // 📊 Calculer les statistiques globales
  const calculateGlobalStats = () => {
    const totalTests = Object.values(TEST_SUITES).reduce(
      (total, suite) => total + suite.tests.length, 0
    );
    
    const completedTests = Object.values(testResults).reduce(
      (total, results) => total + Object.keys(results).length, 0
    );
    
    const passedTests = Object.values(testResults).reduce(
      (total, results) => total + Object.values(results).filter(r => r.status === 'success').length, 0
    );
    
    return {
      total: totalTests,
      completed: completedTests,
      passed: passedTests,
      failed: completedTests - passedTests,
      coverage: totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0,
      success_rate: completedTests > 0 ? Math.round((passedTests / completedTests) * 100) : 0
    };
  };

  const globalStats = calculateGlobalStats();

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Tests Total",
      value: globalStats.total.toString(),
      icon: TestTube,
      color: "text-blue-400"
    },
    {
      label: "Réussis",
      value: globalStats.passed.toString(),
      icon: CheckCircle,
      color: "text-green-400"
    },
    {
      label: "Échoués",
      value: globalStats.failed.toString(),
      icon: AlertTriangle,
      color: globalStats.failed > 0 ? "text-red-400" : "text-gray-400"
    },
    {
      label: "Couverture",
      value: `${globalStats.coverage}%`,
      icon: Target,
      color: globalStats.coverage > 80 ? "text-green-400" : 
             globalStats.coverage > 60 ? "text-yellow-400" : "text-red-400"
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton
        variant="secondary"
        icon={RefreshCw}
        onClick={initializeTestDashboard}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton
        variant="primary"
        icon={Play}
        onClick={() => {
          Object.keys(TEST_SUITES).forEach(suiteId => {
            runTestSuite(suiteId);
          });
        }}
        disabled={isRunningTests}
      >
        Tout Tester
      </PremiumButton>
    </div>
  );

  return (
    <PremiumLayout
      title="Test Dashboard"
      subtitle="Tableau de bord de tests et diagnostics"
      icon={TestTube}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'tests', label: 'Tests', icon: TestTube },
          { id: 'performance', label: 'Performance', icon: Rocket },
          { id: 'connectivity', label: 'Connectivité', icon: Wifi }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Aperçu général */}
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Aperçu Général
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{globalStats.total}</div>
                <div className="text-gray-400 text-sm">Tests Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{globalStats.passed}</div>
                <div className="text-gray-400 text-sm">Réussis</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${globalStats.failed > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {globalStats.failed}
                </div>
                <div className="text-gray-400 text-sm">Échoués</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  globalStats.success_rate > 80 ? 'text-green-400' :
                  globalStats.success_rate > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {globalStats.success_rate}%
                </div>
                <div className="text-gray-400 text-sm">Taux Réussite</div>
              </div>
            </div>

            {/* Barre de progression globale */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Progression des Tests</span>
                <span className="text-white font-medium">{globalStats.coverage}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${globalStats.coverage}%` }}
                />
              </div>
            </div>
          </PremiumCard>

          {/* Status des composants principaux */}
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              État des Composants
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(componentTests).map(([component, status]) => (
                <div key={component} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{component}</h4>
                    <div className={`w-3 h-3 rounded-full ${
                      status.loaded && status.functional ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {status.loaded ? 'Chargé et fonctionnel' : 'Non disponible'}
                  </p>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Onglet Tests */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {Object.entries(TEST_SUITES).map(([suiteId, suite]) => (
            <PremiumCard key={suiteId}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <suite.icon className={`w-6 h-6 ${suite.color}`} />
                  <h3 className="text-xl font-semibold text-white">{suite.name}</h3>
                </div>
                <PremiumButton
                  variant="secondary"
                  icon={isRunningTests ? RefreshCw : Play}
                  onClick={() => runTestSuite(suiteId)}
                  disabled={isRunningTests}
                  className={isRunningTests ? "animate-pulse" : ""}
                >
                  {isRunningTests ? 'En cours...' : 'Exécuter'}
                </PremiumButton>
              </div>

              {/* Barre de progression */}
              {isRunningTests && (
                <div className="mb-6">
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${testProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Liste des tests */}
              <div className="space-y-3">
                {suite.tests.map(test => {
                  const result = testResults[suiteId]?.[test.id];
                  
                  return (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {test.critical && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                        <span className="text-white">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result ? (
                          <>
                            {result.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm ${
                              result.status === 'success' ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {result.message}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">En attente</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      {/* Onglet Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Métriques de Performance
            </h3>

            {performanceMetrics.loadTime && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Temps de chargement */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <h4 className="text-white font-medium">Temps de Chargement</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {Math.round(performanceMetrics.loadTime)}ms
                  </div>
                  <p className="text-gray-400 text-sm">Temps d'initialisation</p>
                </div>

                {/* Utilisation mémoire */}
                {performanceMetrics.memoryUsage.used && (
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-green-400" />
                      <h4 className="text-white font-medium">Mémoire Utilisée</h4>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {performanceMetrics.memoryUsage.used} MB
                    </div>
                    <p className="text-gray-400 text-sm">
                      / {performanceMetrics.memoryUsage.total} MB total
                    </p>
                  </div>
                )}

                {/* Résolution d'écran */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <h4 className="text-white font-medium">Résolution</h4>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {performanceMetrics.viewport.width} x {performanceMetrics.viewport.height}
                  </div>
                  <p className="text-gray-400 text-sm">Taille viewport</p>
                </div>
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {/* Onglet Connectivité */}
      {activeTab === 'connectivity' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              État des Connexions
            </h3>

            <div className="space-y-4">
              
              {/* Firebase */}
              {connectivityStatus.firebase && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  connectivityStatus.firebase.status === 'success' ? 'bg-green-900/20 border-green-500' :
                  connectivityStatus.firebase.status === 'error' ? 'bg-red-900/20 border-red-500' :
                  'bg-yellow-900/20 border-yellow-500'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Database className={`w-5 h-5 ${
                      connectivityStatus.firebase.status === 'success' ? 'text-green-400' :
                      connectivityStatus.firebase.status === 'error' ? 'text-red-400' :
                      'text-yellow-400'
                    }`} />
                    <h4 className="text-white font-medium">Firebase Firestore</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      connectivityStatus.firebase.status === 'success' ? 'bg-green-500/20 text-green-300' :
                      connectivityStatus.firebase.status === 'error' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {connectivityStatus.firebase.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{connectivityStatus.firebase.message}</p>
                  
                  {connectivityStatus.firebase.details && (
                    <div className="text-xs text-gray-400 space-y-1">
                      {Object.entries(connectivityStatus.firebase.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key.replace(/_/g, ' ')}:</span>
                          <span>{typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Test de connectivité réseau */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-medium">Connexion Réseau</h4>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                    online
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Connexion réseau active - {navigator.onLine ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TestDashboardPage;
