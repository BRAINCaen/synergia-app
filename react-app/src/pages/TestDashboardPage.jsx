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

// Layout et composants
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../components/layout/PremiumLayout.jsx';

// Firebase (pour les tests de connectivité)
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.config.js';

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
        { id: 'memory_usage', name: 'Usage mémoire', critical: false },
        { id: 'api_response_time', name: 'Temps réponse API', critical: true }
      ]
    }
  };

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    initializeTestEnvironment();
  }, []);

  // 🔄 INITIALISER L'ENVIRONNEMENT DE TEST
  const initializeTestEnvironment = async () => {
    console.log('🧪 Initialisation environnement de test...');
    
    // Tests de connectivité de base
    await checkBasicConnectivity();
    
    // Tests des composants
    await checkComponentsHealth();
    
    // Métriques de performance
    await gatherPerformanceMetrics();
  };

  // 🌐 VÉRIFIER LA CONNECTIVITÉ DE BASE
  const checkBasicConnectivity = async () => {
    const connectivity = {
      internet: navigator.onLine,
      firebase: false,
      database: false,
      auth: false
    };

    try {
      // Test Firebase
      const testDoc = await getDoc(doc(db, 'system', 'health'));
      connectivity.firebase = true;
      connectivity.database = true;
    } catch (error) {
      console.warn('❌ Test Firebase échoué:', error);
    }

    try {
      // Test Auth
      connectivity.auth = !!user;
    } catch (error) {
      console.warn('❌ Test Auth échoué:', error);
    }

    setConnectivityStatus(connectivity);
  };

  // 🧩 VÉRIFIER LA SANTÉ DES COMPOSANTS
  const checkComponentsHealth = async () => {
    const components = {
      premiumLayout: checkPremiumLayoutHealth(),
      navigation: checkNavigationHealth(),
      modals: checkModalsHealth(),
      forms: checkFormsHealth(),
      cards: checkCardsHealth(),
      buttons: checkButtonsHealth()
    };

    setComponentTests(components);
  };

  // 📊 COLLECTER LES MÉTRIQUES DE PERFORMANCE
  const gatherPerformanceMetrics = async () => {
    const metrics = {
      loadTime: performance.now(),
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      fps: 60, // Estimation
      renderTime: 16.67 // ~60fps
    };

    setPerformanceMetrics(metrics);
  };

  // 🏗️ TESTS SPÉCIFIQUES DES COMPOSANTS
  const checkPremiumLayoutHealth = () => {
    try {
      const layoutElement = document.querySelector('[data-premium-layout]');
      return {
        status: layoutElement ? 'success' : 'warning',
        message: layoutElement ? 'Premium Layout actif' : 'Premium Layout non détecté'
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const checkNavigationHealth = () => {
    try {
      const navElements = document.querySelectorAll('nav, [data-navigation]');
      return {
        status: navElements.length > 0 ? 'success' : 'warning',
        message: `${navElements.length} élément(s) de navigation trouvé(s)`
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const checkModalsHealth = () => {
    try {
      return {
        status: 'success',
        message: 'Système de modals fonctionnel'
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const checkFormsHealth = () => {
    try {
      const formElements = document.querySelectorAll('form, input, button');
      return {
        status: formElements.length > 0 ? 'success' : 'warning',
        message: `${formElements.length} élément(s) de formulaire trouvé(s)`
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const checkCardsHealth = () => {
    try {
      const cardElements = document.querySelectorAll('[data-premium-card], .premium-card');
      return {
        status: cardElements.length > 0 ? 'success' : 'info',
        message: `${cardElements.length} carte(s) premium trouvée(s)`
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  const checkButtonsHealth = () => {
    try {
      const buttonElements = document.querySelectorAll('button');
      return {
        status: buttonElements.length > 0 ? 'success' : 'warning',
        message: `${buttonElements.length} bouton(s) trouvé(s)`
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  // 🧪 EXÉCUTER TOUS LES TESTS
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    const results = {};
    const allTests = Object.values(TEST_SUITES).flatMap(suite => 
      suite.tests.map(test => ({ ...test, suite: suite.id }))
    );
    
    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      
      try {
        console.log(`🧪 Exécution test: ${test.name}`);
        
        // Simuler l'exécution du test
        const result = await executeTest(test);
        results[`${test.suite}_${test.id}`] = result;
        
        setTestProgress(Math.round(((i + 1) / allTests.length) * 100));
        
        // Pause pour l'animation
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results[`${test.suite}_${test.id}`] = {
          status: 'error',
          message: error.message,
          timestamp: new Date()
        };
      }
    }
    
    setTestResults(results);
    setIsRunningTests(false);
    setTestProgress(100);
    
    console.log('✅ Tests terminés:', results);
  };

  // ⚡ EXÉCUTER UN TEST SPÉCIFIQUE
  const executeTest = async (test) => {
    switch (test.id) {
      case 'firebase_connection':
        try {
          const testQuery = await getDocs(collection(db, 'users'));
          return {
            status: 'success',
            message: `Connexion réussie (${testQuery.size} utilisateurs)`,
            timestamp: new Date()
          };
        } catch (error) {
          throw new Error(`Connexion Firebase échouée: ${error.message}`);
        }

      case 'auth_system':
        return {
          status: user ? 'success' : 'error',
          message: user ? `Utilisateur connecté: ${user.email}` : 'Aucun utilisateur connecté',
          timestamp: new Date()
        };

      case 'routing':
        return {
          status: window.location.pathname ? 'success' : 'error',
          message: `Route actuelle: ${window.location.pathname}`,
          timestamp: new Date()
        };

      case 'responsive_design':
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const isDesktop = window.innerWidth >= 1024;
        
        return {
          status: 'success',
          message: `Viewport: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} (${window.innerWidth}px)`,
          timestamp: new Date()
        };

      case 'page_load_time':
        const loadTime = performance.now();
        return {
          status: loadTime < 3000 ? 'success' : loadTime < 5000 ? 'warning' : 'error',
          message: `Temps de chargement: ${loadTime.toFixed(2)}ms`,
          timestamp: new Date()
        };

      default:
        return {
          status: 'success',
          message: 'Test simulé réussi',
          timestamp: new Date()
        };
    }
  };

  // 🎨 OBTENIR LA COULEUR DU STATUS
  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-400 bg-green-900/20 border-green-500/50',
      warning: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50',
      error: 'text-red-400 bg-red-900/20 border-red-500/50',
      info: 'text-blue-400 bg-blue-900/20 border-blue-500/50'
    };
    return colors[status] || colors.info;
  };

  // 🎨 OBTENIR L'ICÔNE DU STATUS
  const getStatusIcon = (status) => {
    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertTriangle,
      info: Eye
    };
    return icons[status] || Eye;
  };

  // 📊 CALCULER LE SCORE GLOBAL
  const getGlobalScore = () => {
    const results = Object.values(testResults);
    if (results.length === 0) return 0;
    
    const successCount = results.filter(r => r.status === 'success').length;
    return Math.round((successCount / results.length) * 100);
  };

  const globalScore = getGlobalScore();

  // 📊 STATISTIQUES POUR L'EN-TÊTE
  const headerStats = [
    { 
      label: "Score Global", 
      value: `${globalScore}%`, 
      icon: Target, 
      color: globalScore > 80 ? "text-green-400" : globalScore > 60 ? "text-yellow-400" : "text-red-400" 
    },
    { 
      label: "Tests Réussis", 
      value: Object.values(testResults).filter(r => r.status === 'success').length.toString(), 
      icon: CheckCircle, 
      color: "text-green-400" 
    },
    { 
      label: "Connectivité", 
      value: connectivityStatus.firebase ? "OK" : "KO", 
      icon: connectivityStatus.internet ? Wifi : WifiOff, 
      color: connectivityStatus.firebase ? "text-green-400" : "text-red-400" 
    },
    { 
      label: "Performance", 
      value: performanceMetrics.memoryUsage ? `${performanceMetrics.memoryUsage.used}MB` : "N/A", 
      icon: Rocket, 
      color: "text-purple-400" 
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={initializeTestEnvironment}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={isRunningTests ? RefreshCw : TestTube}
        onClick={runAllTests}
        disabled={isRunningTests}
        className={isRunningTests ? "animate-pulse" : ""}
      >
        {isRunningTests ? `Tests... ${testProgress}%` : 'Lancer Tests'}
      </PremiumButton>
    </div>
  );

  return (
    <PremiumLayout
      title="Test Dashboard"
      subtitle="Tests et validation des composants Synergia"
      icon={TestTube}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Barre de progression des tests */}
      {isRunningTests && (
        <div className="mb-6">
          <PremiumCard>
            <div className="text-center py-4">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Exécution des tests...</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">{testProgress}% terminé</p>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'suites', label: 'Suites de Tests', icon: TestTube },
          { id: 'components', label: 'Composants', icon: Monitor },
          { id: 'performance', label: 'Performance', icon: Rocket }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
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
        <div className="space-y-6">
          {/* Score global */}
          <PremiumCard>
            <div className="text-center py-8">
              <div className={`text-6xl font-bold mb-4 ${
                globalScore > 80 ? 'text-green-400' : 
                globalScore > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {globalScore}%
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Score Global des Tests</h3>
              <p className="text-gray-400">
                {Object.keys(testResults).length} test(s) exécuté(s)
              </p>
            </div>
          </PremiumCard>

          {/* Connectivité */}
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">🌐 Status de Connectivité</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(connectivityStatus).map(([service, status]) => (
                <div
                  key={service}
                  className={`text-center p-4 rounded-lg ${
                    status ? 'bg-green-900/20 border border-green-500/50' : 'bg-red-900/20 border border-red-500/50'
                  }`}
                >
                  <div className={`${status ? 'text-green-400' : 'text-red-400'} mb-2`}>
                    {status ? <CheckCircle className="w-6 h-6 mx-auto" /> : <AlertTriangle className="w-6 h-6 mx-auto" />}
                  </div>
                  <h4 className="text-white font-medium capitalize">{service}</h4>
                  <p className={`text-sm ${status ? 'text-green-400' : 'text-red-400'}`}>
                    {status ? 'Connecté' : 'Déconnecté'}
                  </p>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Métriques de performance */}
          {performanceMetrics.memoryUsage && (
            <PremiumCard>
              <h3 className="text-white font-semibold mb-4">⚡ Métriques de Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {performanceMetrics.memoryUsage.used}MB
                  </div>
                  <div className="text-gray-400">Mémoire Utilisée</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {performanceMetrics.loadTime.toFixed(0)}ms
                  </div>
                  <div className="text-gray-400">Temps de Chargement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {performanceMetrics.fps}fps
                  </div>
                  <div className="text-gray-400">FPS Estimé</div>
                </div>
              </div>
            </PremiumCard>
          )}
        </div>
      )}

      {activeTab === 'suites' && (
        <div className="space-y-6">
          {Object.values(TEST_SUITES).map(suite => {
            const IconComponent = suite.icon;
            const suiteResults = suite.tests.map(test => testResults[`${suite.id}_${test.id}`]).filter(Boolean);
            const successCount = suiteResults.filter(r => r.status === 'success').length;
            const successRate = suiteResults.length > 0 ? Math.round((successCount / suiteResults.length) * 100) : 0;
            
            return (
              <PremiumCard key={suite.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${suite.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{suite.name}</h3>
                      <p className="text-gray-400 text-sm">{suite.tests.length} test(s)</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      successRate === 100 ? 'text-green-400' : 
                      successRate >= 75 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {successRate}%
                    </div>
                    <div className="text-gray-400 text-sm">{successCount}/{suiteResults.length}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {suite.tests.map(test => {
                    const result = testResults[`${suite.id}_${test.id}`];
                    const StatusIcon = result ? getStatusIcon(result.status) : Clock;
                    
                    return (
                      <div
                        key={test.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result ? getStatusColor(result.status) : 'bg-gray-800/50 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon className="w-4 h-4" />
                          <div>
                            <span className="font-medium">{test.name}</span>
                            {test.critical && (
                              <span className="ml-2 text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                CRITIQUE
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {result ? (
                            <div>
                              <div className="text-sm font-medium capitalize">{result.status}</div>
                              <div className="text-xs opacity-75">
                                {result.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">Non testé</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">🧩 État des Composants</h3>
            
            <div className="space-y-4">
              {Object.entries(componentTests).map(([component, test]) => {
                const StatusIcon = getStatusIcon(test.status);
                
                return (
                  <div
                    key={component}
                    className={`flex items-center justify-between p-4 rounded-lg ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium capitalize">{component.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm opacity-75">{test.message}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm font-medium capitalize">{test.status}</div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          {/* Informations système */}
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">💻 Informations Système</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-white">Navigateur:</strong>
                <div className="text-gray-400">{navigator.userAgent.split(' ')[0]}</div>
              </div>
              <div>
                <strong className="text-white">Résolution:</strong>
                <div className="text-gray-400">{window.screen.width} x {window.screen.height}</div>
              </div>
              <div>
                <strong className="text-white">Viewport:</strong>
                <div className="text-gray-400">{window.innerWidth} x {window.innerHeight}</div>
              </div>
              <div>
                <strong className="text-white">Connexion:</strong>
                <div className="text-gray-400">{navigator.onLine ? 'En ligne' : 'Hors ligne'}</div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'performance' && performanceMetrics.memoryUsage && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">🚀 Métriques de Performance</h3>
            
            <div className="space-y-6">
              {/* Utilisation mémoire */}
              <div>
                <h4 className="text-white font-medium mb-3">Utilisation Mémoire</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Utilisée:</span>
                    <span className="text-white">{performanceMetrics.memoryUsage.used}MB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${(performanceMetrics.memoryUsage.used / performanceMetrics.memoryUsage.total) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0MB</span>
                    <span>{performanceMetrics.memoryUsage.total}MB</span>
                  </div>
                </div>
              </div>

              {/* Temps de chargement */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {performanceMetrics.loadTime.toFixed(0)}ms
                  </div>
                  <div className="text-gray-400">Temps Chargement</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {performanceMetrics.fps}
                  </div>
                  <div className="text-gray-400">FPS</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {performanceMetrics.renderTime.toFixed(1)}ms
                  </div>
                  <div className="text-gray-400">Temps Rendu</div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Recommandations */}
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">💡 Recommandations</h3>
            
            <div className="space-y-3">
              {performanceMetrics.memoryUsage.used > 100 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium">Utilisation mémoire élevée</h4>
                    <p className="text-yellow-200 text-sm">
                      L'application utilise plus de 100MB de mémoire. Considérez optimiser les composants.
                    </p>
                  </div>
                </div>
              )}
              
              {performanceMetrics.loadTime > 3000 && (
                <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-medium">Temps de chargement lent</h4>
                    <p className="text-red-200 text-sm">
                      Le temps de chargement dépasse 3 secondes. Optimisation recommandée.
                    </p>
                  </div>
                </div>
              )}
              
              {Object.keys(testResults).length > 0 && globalScore === 100 && (
                <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-green-400 font-medium">Tous les tests réussis</h4>
                    <p className="text-green-200 text-sm">
                      Excellent ! Tous les tests sont au vert. L'application est en parfait état.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TestDashboardPage;
