// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING AVEC COMPOSANTS INTÉGRÉS - PLUS DE CACHE
// ==========================================

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award,
  RefreshCw,
  Play,
  Loader,
  Bug,
  XCircle,
  CheckCircle2,
  Building,
  Heart,
  Key,
  Coffee,
  Lightbulb,
  UserCheck,
  Eye,
  FileText
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// 🎯 COMPOSANT FORMATION GÉNÉRALE INTÉGRÉ
const FormationGeneraleIntegree = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true);

  // 📝 Fonction pour ajouter des logs de debug
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(`🔧 [FORMATION-DEBUG] ${logEntry}`);
    setDebugLogs(prev => [...prev, { message: logEntry, type, timestamp }].slice(-10));
  };

  // 📊 Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) {
      addDebugLog('❌ Pas d\'utilisateur connecté', 'error');
      return;
    }
    
    try {
      setLoading(true);
      addDebugLog('🔄 Chargement données formation...');
      
      const result = await onboardingService.getFormationProfile(user.uid);
      addDebugLog(`📊 Résultat: ${result.success ? 'SUCCESS' : 'FAILED - ' + result.error}`);
      
      if (result.success) {
        setFormationData(result.data);
        addDebugLog('✅ Données formation chargées');
      } else {
        addDebugLog('📝 Profil formation non trouvé - normal pour première utilisation');
        setFormationData(null);
      }
    } catch (error) {
      addDebugLog(`❌ Erreur chargement: ${error.message}`, 'error');
      setFormationData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 VERSION SUPER SIMPLE DU BOUTON
  const handleButtonClick = () => {
    addDebugLog('🔥 BOUTON CLIQUÉ !!! Event handler déclenché', 'success');
    
    // Test de base
    if (!user) {
      addDebugLog('❌ User non défini', 'error');
      alert('Erreur: Utilisateur non connecté');
      return;
    }

    if (!user.uid) {
      addDebugLog('❌ User.uid non défini', 'error');
      alert('Erreur: ID utilisateur manquant');
      return;
    }

    addDebugLog(`✅ User OK: ${user.uid}`);
    
    if (!onboardingService) {
      addDebugLog('❌ onboardingService non défini', 'error');
      alert('Erreur: Service non disponible');
      return;
    }

    addDebugLog('✅ OnboardingService disponible');
    
    // Lancer la création
    initializeFormationProfile();
  };

  // 🚀 Initialiser le profil de formation
  const initializeFormationProfile = async () => {
    try {
      setInitializing(true);
      addDebugLog('🚀 DÉBUT initialisation profil...');
      
      // Test Firebase d'abord
      addDebugLog('🧪 Test connexion Firebase...');
      const testResult = await onboardingService.testFirebaseConnection();
      addDebugLog(`🧪 Test Firebase: ${testResult.success ? 'OK' : 'FAILED - ' + testResult.error}`);
      
      if (!testResult.success) {
        alert(`Firebase Error: ${testResult.error}`);
        return;
      }

      // Créer le profil
      addDebugLog('🔧 Création profil formation...');
      const result = await onboardingService.createFormationProfile(user.uid);
      addDebugLog(`🔧 Création result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addDebugLog('🎉 SUCCÈS ! Profil créé', 'success');
        alert('SUCCESS: Profil de formation créé !');
        
        // Recharger après 1 seconde
        setTimeout(() => {
          addDebugLog('🔄 Rechargement des données...');
          loadFormationData();
        }, 1000);
        
      } else {
        addDebugLog(`❌ ÉCHEC création: ${result.error}`, 'error');
        alert(`FAILED: ${result.error}`);
      }
    } catch (error) {
      addDebugLog(`💥 ERREUR CRITIQUE: ${error.message}`, 'error');
      alert(`CRITICAL ERROR: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  // 🎯 Charger les données au montage
  useEffect(() => {
    addDebugLog('🏗️ Composant monté, chargement initial...');
    loadFormationData();
  }, [loadFormationData]);

  // ⏳ État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement de votre parcours formation...</p>
          <p className="text-xs text-gray-500 mt-2">User: {user?.uid || 'Non connecté'}</p>
        </div>
      </div>
    );
  }

  // 📝 État sans données
  if (!formationData) {
    return (
      <div className="space-y-6">
        
        {/* En-tête */}
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Commencez votre Formation Brain !
          </h3>
          <p className="text-gray-400 mb-8">
            Créez votre profil de formation personnalisé pour commencer votre parcours Game Master.
          </p>

          {/* BOUTON PRINCIPAL */}
          <div className="space-y-4">
            <button
              onClick={handleButtonClick}
              disabled={initializing}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border-2 ${
                initializing
                  ? 'bg-gray-600 border-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-blue-600 border-blue-500 hover:bg-blue-700 hover:border-blue-400 hover:scale-105 text-white'
              }`}
              style={{ minWidth: '300px' }}
            >
              {initializing ? (
                <div className="flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin mr-3" />
                  <span>Création en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Play className="h-6 w-6 mr-3" />
                  <span>🚀 COMMENCER LA FORMATION</span>
                </div>
              )}
            </button>

            {/* Boutons de test */}
            <div className="space-x-2">
              <button
                onClick={() => alert('Test bouton basic fonctionne!')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                🧪 Test Bouton
              </button>
              
              <button
                onClick={async () => {
                  try {
                    addDebugLog('🧪 Test Firebase manuel...');
                    const result = await onboardingService.testFirebaseConnection();
                    addDebugLog(`🧪 Résultat: ${JSON.stringify(result)}`);
                    alert(`Firebase Test: ${result.success ? 'SUCCESS' : 'FAILED - ' + result.error}`);
                  } catch (error) {
                    addDebugLog(`❌ Erreur test Firebase: ${error.message}`, 'error');
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                🔥 Test Firebase
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-gray-900/80 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                Debug Panel - Version Intégrée
              </h4>
              <button
                onClick={() => setShowDebug(false)}
                className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
              >
                Hide
              </button>
            </div>

            {/* État du système */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">User Status</div>
                <div className={`text-sm font-medium ${user?.uid ? 'text-green-400' : 'text-red-400'}`}>
                  {user?.uid ? '✅ Connected' : '❌ Not Connected'}
                </div>
                <div className="text-xs text-gray-500">{user?.uid || 'No UID'}</div>
              </div>
              
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">Service Status</div>
                <div className={`text-sm font-medium ${onboardingService ? 'text-green-400' : 'text-red-400'}`}>
                  {onboardingService ? '✅ Available' : '❌ Missing'}
                </div>
                <div className="text-xs text-gray-500">OnboardingService</div>
              </div>

              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">Formation Data</div>
                <div className={`text-sm font-medium ${formationData ? 'text-green-400' : 'text-yellow-400'}`}>
                  {formationData ? '✅ Loaded' : '⚠️ None'}
                </div>
                <div className="text-xs text-gray-500">Profile Status</div>
              </div>
            </div>

            {/* Logs */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun log pour le moment...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded font-mono ${
                      log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                      log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                      'bg-gray-800/30 text-gray-300'
                    }`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 📊 Si on a des données de formation
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          🧠 Formation Générale Brain
        </h2>
        <p className="text-gray-400 mb-6">
          Votre formation a été créée avec succès !
        </p>

        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-400 mb-2">
            🎉 Formation Initialisée !
          </h3>
          <p className="text-green-300">
            Votre profil de formation Brain a été créé avec succès.<br/>
            Vous pouvez maintenant commencer votre parcours Game Master !
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={loadFormationData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT COMPÉTENCES SIMPLIFIÉ
const CompetencesSimple = () => (
  <div className="text-center py-12">
    <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-4">
      🎮 Acquisition de Compétences
    </h3>
    <p className="text-gray-400 mb-8">
      Section en développement - 19 compétences Game Master à venir
    </p>
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
      <p className="text-yellow-300">
        Cette section sera développée après la finalisation de la Formation Générale
      </p>
    </div>
  </div>
);

// 🎯 COMPOSANT ENTRETIENS SIMPLIFIÉ
const EntretiensSimple = () => (
  <div className="text-center py-12">
    <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-4">
      🎤 Entretiens Référent
    </h3>
    <p className="text-gray-400 mb-8">
      Section en développement - Suivi personnalisé à venir
    </p>
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
      <p className="text-yellow-300">
        Le système d'entretiens sera développé après la Formation Générale
      </p>
    </div>
  </div>
);

// 🎯 COMPOSANT PRINCIPAL ONBOARDING
const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('formation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header avec gradient */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🧠 Mon Parcours Game Master Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Escape & Quiz Game - Parcours d'intégration complet
          </p>
          <div className="mt-2 text-sm text-purple-300">
            Utilisateur : {user?.email || 'Non connecté'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Version: OnboardingPage Intégrée - {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Navigation Premium */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Formation Générale */}
            <button
              onClick={() => setActiveSection('formation')}
              className={`p-4 rounded-lg transition-all duration-300 text-left ${
                activeSection === 'formation'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
              }`}
            >
              <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 mr-3" />
                <span className="font-semibold">Formation Générale</span>
              </div>
              <p className="text-sm opacity-80">
                Parcours d'intégration Brain avec debug intégré
              </p>
              <div className="mt-2 text-xs opacity-60">
                💡 7 phases • 🏆 Badges • ⭐ XP • 🔧 Debug
              </div>
            </button>
            
            {/* Acquisition de Compétences */}
            <button
              onClick={() => setActiveSection('competences')}
              className={`p-4 rounded-lg transition-all duration-300 text-left ${
                activeSection === 'competences'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
              }`}
            >
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 mr-3" />
                <span className="font-semibold">Acquisition de Compétences</span>
              </div>
              <p className="text-sm opacity-80">
                En développement - 19 compétences Game Master
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎮 Game Master • 🚧 En cours • ⏳ Bientôt
              </div>
            </button>
            
            {/* Entretiens Référent */}
            <button
              onClick={() => setActiveSection('entretiens')}
              className={`p-4 rounded-lg transition-all duration-300 text-left ${
                activeSection === 'entretiens'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102'
              }`}
            >
              <div className="flex items-center mb-3">
                <MessageSquare className="h-6 w-6 mr-3" />
                <span className="font-semibold">Entretiens Référent</span>
              </div>
              <p className="text-sm opacity-80">
                En développement - Suivi personnalisé
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎤 Entretiens • 🚧 En cours • ⏳ Bientôt
              </div>
            </button>
          </div>
        </div>

        {/* Contenu basé sur la section active */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          {activeSection === 'formation' && <FormationGeneraleIntegree />}
          {activeSection === 'competences' && <CompetencesSimple />}
          {activeSection === 'entretiens' && <EntretiensSimple />}
        </div>

        {/* Footer motivant */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">
              Ta Progression Game Master
            </h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Chaque tâche cochée te fait progresser, te rapporte des XP, et te rapproche de nouveaux badges.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-blue-400 font-semibold">🎯 Objectif</div>
              <div className="text-gray-300">Devenir rapidement autonome</div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-green-400 font-semibold">🚀 Résultat</div>
              <div className="text-gray-300">Épanoui·e et reconnu·e</div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-purple-400 font-semibold">🤝 Support</div>
              <div className="text-gray-300">Aide disponible à chaque étape</div>
            </div>
          </div>
          
          <div className="mt-4 text-purple-300 font-medium">
            💪 Tu fais partie de l'équipe dès maintenant !
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
