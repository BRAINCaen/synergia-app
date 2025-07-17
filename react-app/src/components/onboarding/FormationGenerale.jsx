// ==========================================
// 📁 react-app/src/components/onboarding/FormationGenerale.jsx
// COMPOSANT FORMATION GÉNÉRALE - BOUTON CORRIGÉ
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  Award,
  Users,
  Shield,
  Gamepad2,
  Settings,
  Heart,
  Trophy,
  Target,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Badge as BadgeIcon,
  Zap,
  Calendar,
  MessageSquare,
  Eye,
  FileText,
  Key,
  Coffee,
  Lightbulb,
  UserCheck,
  Building,
  Wrench,
  Sparkles,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  Loader,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../../core/services/onboardingService.js';

// 🎯 TÂCHES PAR PHASE (gardé identique)
const PHASE_TASKS = {
  decouverte_brain: [
    {
      id: 'visite_locaux',
      name: 'Visite guidée des locaux et présentation de l\'équipe',
      icon: Building,
      xp: 10,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'comprendre_valeurs',
      name: 'Comprendre les valeurs et la culture d\'entreprise',
      icon: Heart,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'acceder_outils',
      name: 'Accéder aux outils de travail (Slack, Drive, planning)',
      icon: Key,
      xp: 5,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'pause_equipe',
      name: 'Prendre une pause/repas avec l\'équipe',
      icon: Coffee,
      xp: 5,
      required: false,
      estimatedTime: 60
    },
    {
      id: 'questions_reponses',
      name: 'Session questions/réponses avec ton·ta référent·e',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'comprendre_poste',
      name: 'Comprendre ton poste et tes missions',
      icon: Target,
      xp: 10,
      required: true,
      estimatedTime: 60
    }
  ],
  // ... autres phases identiques
};

const FormationGenerale = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [activePhase, setActivePhase] = useState('decouverte_brain');
  const [expandedPhases, setExpandedPhases] = useState(['decouverte_brain']);
  const [initializing, setInitializing] = useState(false);
  const [initError, setInitError] = useState('');
  const [initSuccess, setInitSuccess] = useState('');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalXP: 0,
    earnedXP: 0,
    completedPhases: 0,
    earnedBadges: []
  });

  // 📊 Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📊 [COMPONENT] Chargement données formation...');
      
      const result = await onboardingService.getFormationProfile(user.uid);
      
      if (result.success) {
        setFormationData(result.data);
        calculateStats(result.data);
        console.log('✅ [COMPONENT] Données formation chargées');
      } else {
        console.log('📝 [COMPONENT] Profil formation non trouvé');
        setFormationData(null);
      }
    } catch (error) {
      console.error('❌ [COMPONENT] Erreur chargement formation:', error);
      setFormationData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 Initialiser le profil de formation - VERSION CORRIGÉE
  const initializeFormationProfile = async () => {
    if (!user?.uid) {
      setInitError('Utilisateur non connecté');
      return;
    }
    
    try {
      setInitializing(true);
      setInitError('');
      setInitSuccess('');
      
      console.log('🚀 [COMPONENT] Initialisation profil formation...');
      console.log('🚀 [COMPONENT] User ID:', user.uid);
      console.log('🚀 [COMPONENT] OnboardingService disponible:', !!onboardingService);
      
      // Test de connexion Firebase d'abord
      const testResult = await onboardingService.testFirebaseConnection();
      if (!testResult.success) {
        throw new Error(`Firebase non disponible: ${testResult.error}`);
      }
      console.log('✅ [COMPONENT] Firebase fonctionne');

      const result = await onboardingService.createFormationProfile(user.uid);
      
      console.log('🔧 [COMPONENT] Résultat création profil:', result);
      
      if (result.success) {
        console.log('✅ [COMPONENT] Profil formation créé avec succès');
        setInitSuccess('Profil de formation créé avec succès ! 🎉');
        
        // Attendre un peu puis recharger
        setTimeout(async () => {
          await loadFormationData();
          setInitSuccess('');
        }, 2000);
        
      } else {
        console.error('❌ [COMPONENT] Échec création profil:', result.error);
        setInitError(`Erreur création profil: ${result.error}`);
        
        // Afficher les détails si disponibles
        if (result.details) {
          console.error('❌ [COMPONENT] Détails erreur:', result.details);
        }
      }
    } catch (error) {
      console.error('❌ [COMPONENT] Erreur critique initialisation:', error);
      setInitError(`Erreur critique: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  // 🔄 Toggle une tâche
  const toggleTask = useCallback(async (phaseId, taskId) => {
    if (!user?.uid || !formationData) return;
    
    try {
      console.log('🔄 [COMPONENT] Toggle tâche:', phaseId, taskId);
      
      const result = await onboardingService.toggleTask(user.uid, phaseId, taskId);
      
      if (result.success) {
        await loadFormationData();
        console.log('✅ [COMPONENT] Tâche toggleée');
      }
    } catch (error) {
      console.error('❌ [COMPONENT] Erreur toggle tâche:', error);
    }
  }, [user?.uid, formationData, loadFormationData]);

  // 📊 Calculer les statistiques
  const calculateStats = (data) => {
    if (!data?.phases) return;
    
    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;
    let completedPhases = 0;
    const earnedBadges = [];

    Object.keys(PHASE_TASKS).forEach(phaseId => {
      const phaseTasks = PHASE_TASKS[phaseId];
      const phaseData = data.phases?.[phaseId];
      
      phaseTasks.forEach(task => {
        totalTasks++;
        totalXP += task.xp;
        
        if (phaseData?.tasks?.[task.id]?.completed) {
          completedTasks++;
          earnedXP += task.xp;
        }
      });

      // Vérifier si la phase est complétée
      const phaseTasksCompleted = phaseTasks.filter(task => 
        phaseData?.tasks?.[task.id]?.completed
      ).length;
      
      if (phaseTasksCompleted === phaseTasks.length) {
        completedPhases++;
        const phase = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
        if (phase?.badge) {
          earnedBadges.push(phase.badge);
        }
      }
    });

    setStats({
      totalTasks,
      completedTasks,
      totalXP,
      earnedXP,
      completedPhases,
      earnedBadges
    });
  };

  // 🔄 Toggle expansion d'une phase
  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // 🎯 Charger les données au montage
  useEffect(() => {
    loadFormationData();
  }, [loadFormationData]);

  // 🧪 Fonction de test Firebase (pour debug)
  const testFirebase = async () => {
    try {
      console.log('🧪 [COMPONENT] Test Firebase...');
      const result = await onboardingService.testFirebaseConnection();
      console.log('🧪 [COMPONENT] Résultat test:', result);
      alert(`Test Firebase: ${result.success ? 'SUCCESS' : 'FAILED - ' + result.error}`);
    } catch (error) {
      console.error('🧪 [COMPONENT] Erreur test:', error);
      alert(`Erreur test: ${error.message}`);
    }
  };

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

  // 📝 État sans données - Proposition de création AMÉLIORÉE
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Commencez votre Formation Brain !
          </h3>
          <p className="text-gray-400 mb-8">
            Créez votre profil de formation personnalisé pour commencer votre parcours Game Master.
          </p>

          {/* Messages d'erreur et de succès */}
          {initError && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400 font-medium">Erreur</span>
              </div>
              <p className="text-red-300 text-sm">{initError}</p>
            </div>
          )}

          {initSuccess && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">Succès</span>
              </div>
              <p className="text-green-300 text-sm">{initSuccess}</p>
            </div>
          )}

          {/* Bouton principal */}
          <button
            onClick={initializeFormationProfile}
            disabled={initializing}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              initializing
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            } text-white`}
          >
            {initializing ? (
              <div className="flex items-center">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Création en cours...
              </div>
            ) : (
              <div className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                🚀 Commencer la Formation
              </div>
            )}
          </button>

          {/* Informations sur la formation */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-900/30 rounded-lg p-4">
              <div className="text-blue-400 font-semibold">7 Phases</div>
              <div className="text-gray-400">Parcours complet</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4">
              <div className="text-green-400 font-semibold">42 Tâches</div>
              <div className="text-gray-400">Actions concrètes</div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4">
              <div className="text-purple-400 font-semibold">850 XP</div>
              <div className="text-gray-400">Points d'expérience</div>
            </div>
          </div>

          {/* Bouton de debug (en dev) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6">
              <button
                onClick={testFirebase}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded"
              >
                🧪 Test Firebase (Debug)
              </button>
            </div>
          )}

          {/* Informations de debug */}
          <div className="mt-4 text-xs text-gray-500">
            <p>User ID: {user?.uid || 'Non connecté'}</p>
            <p>Service disponible: {onboardingService ? '✅' : '❌'}</p>
            <p>Firebase: {typeof window !== 'undefined' && window.firebase ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ... Reste du composant identique (interface avec les phases, etc.)
  return (
    <div className="space-y-6">
      {/* 📊 Header avec statistiques */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🧠 Formation Générale Brain
        </h2>
        <p className="text-gray-400 mb-6">
          Parcours d'intégration complet avec 7 phases progressives
        </p>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.completedTasks}</div>
            <div className="text-sm text-gray-400">/{stats.totalTasks} Tâches</div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.earnedXP}</div>
            <div className="text-sm text-gray-400">/{stats.totalXP} XP</div>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.completedPhases}</div>
            <div className="text-sm text-gray-400">/7 Phases</div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.earnedBadges.length}</div>
            <div className="text-sm text-gray-400">Badges</div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Progression Globale</span>
            <span className="text-gray-400">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Message si les données sont chargées */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
          <div>
            <div className="text-green-400 font-medium">Formation active</div>
            <div className="text-green-300 text-sm">
              Votre parcours de formation a été chargé avec succès !
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Actions rapides */}
      <div className="text-center space-y-4">
        <button
          onClick={() => loadFormationData()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mr-4 transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Actualiser
        </button>
        
        {stats.completedPhases === 7 && (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-6 border border-green-500/30">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Félicitations !
            </h3>
            <p className="text-green-300">
              Vous avez terminé toute la formation générale Brain !<br/>
              Vous êtes maintenant un·e Game Master certifié·e.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationGenerale;
