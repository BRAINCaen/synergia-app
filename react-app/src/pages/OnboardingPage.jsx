// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING AVEC LES 3 SECTIONS RÉACTIVÉES
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

  // 🚀 Initialiser la formation
  const handleButtonClick = async () => {
    if (!user?.uid) {
      alert('Erreur: Utilisateur non connecté');
      return;
    }

    try {
      setInitializing(true);
      addDebugLog('🔥 DÉMARRAGE CRÉATION PROFIL !!!');

      const result = await onboardingService.createFormationProfile(user.uid);
      addDebugLog(`🔧 Résultat création: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addDebugLog('🎉 SUCCÈS ! Profil créé', 'success');
        setTimeout(() => {
          loadFormationData();
        }, 1000);
      } else {
        addDebugLog(`❌ ÉCHEC création: ${result.error}`, 'error');
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      addDebugLog(`💥 ERREUR CRITIQUE: ${error.message}`, 'error');
      alert(`Erreur critique: ${error.message}`);
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
        </div>
      </div>
    );
  }

  // 📝 État sans données
  if (!formationData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Commencez votre Formation Brain !
          </h3>
          <p className="text-gray-400 mb-8">
            Créez votre profil de formation personnalisé pour commencer votre parcours Game Master.
          </p>

          <button
            onClick={handleButtonClick}
            disabled={initializing}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              initializing
                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
            }`}
          >
            {initializing ? (
              <>
                <Loader className="h-5 w-5 animate-spin inline mr-2" />
                Création en cours...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 inline mr-2" />
                Créer mon Profil Formation
              </>
            )}
          </button>
        </div>

        {/* Debug logs */}
        {showDebug && debugLogs.length > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 text-xs space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">🔧 Debug Logs</span>
              <button 
                onClick={() => setShowDebug(false)}
                className="text-gray-500 hover:text-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            {debugLogs.map((log, i) => (
              <div key={i} className={`
                ${log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 'text-gray-300'}
              `}>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 🎉 État avec données - Formation active
  return (
    <div className="space-y-6">
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">
          🎉 Formation Active !
        </h3>
        <p className="text-green-300">
          Votre profil de formation est créé. Vous pouvez maintenant progresser dans votre parcours Game Master !
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
  );
};

// 🎯 COMPOSANT COMPÉTENCES RÉACTIVÉ
const CompetencesSimple = () => (
  <div className="text-center py-12">
    <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-4">
      🎮 Acquisition de Compétences
    </h3>
    <p className="text-gray-300 mb-6">
      En développement - 19 compétences Game Master à venir
    </p>
    
    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="text-left">
          <h4 className="text-green-400 font-semibold mb-2">🎯 Compétences techniques</h4>
          <ul className="text-gray-300 space-y-1">
            <li>• Gestion des équipements</li>
            <li>• Maintenance préventive</li>
            <li>• Résolution de problèmes</li>
            <li>• Sécurité et normes</li>
          </ul>
        </div>
        
        <div className="text-left">
          <h4 className="text-blue-400 font-semibold mb-2">🤝 Compétences relationnelles</h4>
          <ul className="text-gray-300 space-y-1">
            <li>• Communication client</li>
            <li>• Travail en équipe</li>
            <li>• Gestion du stress</li>
            <li>• Leadership</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 text-yellow-300 font-medium">
        📚 Bientôt disponible : Système d'évaluation et badges de compétences
      </div>
    </div>
  </div>
);

// 🎯 COMPOSANT ENTRETIENS RÉACTIVÉ
const EntretiensSimple = () => (
  <div className="text-center py-12">
    <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-white mb-4">
      🎤 Entretiens Référent
    </h3>
    <p className="text-gray-300 mb-6">
      En développement - Suivi personnalisé à venir
    </p>
    
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <h4 className="text-purple-400 font-semibold mb-1">Planification</h4>
          <p className="text-gray-300">Rendez-vous réguliers avec votre référent</p>
        </div>
        
        <div className="text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <h4 className="text-blue-400 font-semibold mb-1">Suivi personnalisé</h4>
          <p className="text-gray-300">Accompagnement adapté à vos besoins</p>
        </div>
        
        <div className="text-center">
          <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <h4 className="text-yellow-400 font-semibold mb-1">Validation</h4>
          <p className="text-gray-300">Certification de vos acquis</p>
        </div>
      </div>
      
      <div className="mt-6 text-purple-300 font-medium">
        🚀 Bientôt disponible : Système de prise de rendez-vous intégré
      </div>
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
            🎯 Intégration Game Master
          </h1>
          <p className="text-gray-300 text-lg">
            Votre parcours personnalisé pour devenir autonome et épanoui·e chez Brain
          </p>
        </div>

        {/* Navigation des sections - LES 3 BOUTONS RÉACTIVÉS */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FORMATION GÉNÉRALE */}
            <button
              onClick={() => setActiveSection('formation')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'formation'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 border-blue-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 mr-3" />
                <span className="font-semibold">Formation Générale</span>
              </div>
              <p className="text-sm opacity-80">
                7 phases complètes avec 38 tâches détaillées
              </p>
              <div className="mt-2 text-xs opacity-60">
                🏆 7 phases • 📋 Badges • ⭐ 710 XP • 🔄 Toggle tasks
              </div>
            </button>

            {/* ACQUISITION DE COMPÉTENCES */}
            <button
              onClick={() => setActiveSection('competences')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'competences'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg scale-105 border-green-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
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
                🎮 Game Master • 🔧 En cours • ⭐ Bientôt
              </div>
            </button>

            {/* ENTRETIENS RÉFÉRENT */}
            <button
              onClick={() => setActiveSection('entretiens')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'entretiens'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105 border-purple-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
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

        {/* Contenu basé sur la section active - LES 3 SECTIONS RÉACTIVÉES */}
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
