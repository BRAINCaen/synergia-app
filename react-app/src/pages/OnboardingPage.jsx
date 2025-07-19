// ==========================================
// 📁 react-app/src/components/onboarding/FormationGenerale.jsx
// COMPOSANT FORMATION GÉNÉRALE COMPLET AVEC AFFICHAGE DES TÂCHES
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
  XCircle,
  Bug
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../../core/services/onboardingService.js';

// 🎯 TÂCHES PAR PHASE COMPLÈTES
const PHASE_TASKS = {
  decouverte_brain: [
    {
      id: 'visite_locaux',
      name: 'Visite guidée des locaux et présentation de l\'équipe',
      description: 'Tour complet des espaces Brain avec présentation personnalisée de chaque membre de l\'équipe',
      icon: Building,
      xp: 10,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'comprendre_valeurs',
      name: 'Comprendre les valeurs et la culture d\'entreprise',
      description: 'Découverte de l\'ADN Brain, notre vision, nos valeurs et notre façon de travailler ensemble',
      icon: Heart,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'decouvrir_outils',
      name: 'Découvrir les outils et technologies utilisés',
      description: 'Présentation de Synergia, des systèmes de réservation et des outils collaboratifs',
      icon: Settings,
      xp: 15,
      required: true,
      estimatedTime: 45
    }
  ],
  parcours_client: [
    {
      id: 'accueil_client',
      name: 'Maîtriser l\'accueil client de A à Z',
      description: 'Techniques d\'accueil, première impression et gestion de l\'arrivée des groupes',
      icon: Users,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'gestion_reservation',
      name: 'Gérer les réservations et plannings',
      description: 'Système de réservation, modifications et annulations',
      icon: Calendar,
      xp: 20,
      required: true,
      estimatedTime: 90
    }
  ],
  mastering_jeux: [
    {
      id: 'regles_base',
      name: 'Maîtriser les règles de base de tous les jeux',
      description: 'Connaissance approfondie des mécaniques et règles de chaque escape game',
      icon: Gamepad2,
      xp: 25,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'gestion_indices',
      name: 'Donner les bons indices au bon moment',
      description: 'Art du timing et de la progression dans l\'aide aux équipes',
      icon: Lightbulb,
      xp: 20,
      required: true,
      estimatedTime: 120
    }
  ],
  situations_speciales: [
    {
      id: 'gestion_panique',
      name: 'Gérer les situations de panique ou stress',
      description: 'Techniques de désescalade et gestion des participants anxieux',
      icon: Shield,
      xp: 30,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'incidents_techniques',
      name: 'Résoudre les incidents techniques',
      description: 'Diagnostic et résolution des problèmes techniques courants',
      icon: Wrench,
      xp: 25,
      required: true,
      estimatedTime: 60
    }
  ],
  communication: [
    {
      id: 'briefing_equipe',
      name: 'Maîtriser le briefing et débriefing d\'équipe',
      description: 'Techniques de présentation et animation de groupes',
      icon: MessageSquare,
      xp: 20,
      required: true,
      estimatedTime: 75
    },
    {
      id: 'feedback_clients',
      name: 'Recueillir et traiter les retours clients',
      description: 'Écoute active et amélioration continue de l\'expérience',
      icon: Star,
      xp: 15,
      required: false,
      estimatedTime: 45
    }
  ],
  autonomie: [
    {
      id: 'prise_initiative',
      name: 'Prendre des initiatives et résoudre les problèmes',
      description: 'Développer l\'autonomie et la capacité de décision',
      icon: Target,
      xp: 25,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'formation_autres',
      name: 'Former et accompagner d\'autres Game Masters',
      description: 'Transmission des connaissances et mentorat',
      icon: UserCheck,
      xp: 30,
      required: false,
      estimatedTime: 180
    }
  ],
  certification: [
    {
      id: 'evaluation_finale',
      name: 'Évaluation finale des compétences',
      description: 'Test pratique et validation par le référent',
      icon: Trophy,
      xp: 50,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'certification_gamemaster',
      name: 'Obtenir la certification Game Master',
      description: 'Validation officielle et remise du badge Game Master',
      icon: BadgeIcon,
      xp: 100,
      required: true,
      estimatedTime: 30
    }
  ]
};

const FormationGenerale = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalXP: 0,
    earnedXP: 0,
    completedPhases: 0,
    earnedBadges: [],
    completionRate: 0
  });

  // 📝 Fonction pour ajouter des logs de debug
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(`🔧 [FORMATION-DEBUG] ${logEntry}`);
    setDebugLogs(prev => [...prev, { message: logEntry, type, timestamp }].slice(-10));
  };

  // 📊 Calculer les statistiques
  const calculateStats = useCallback((formationProfile) => {
    if (!formationProfile || !formationProfile.phases) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalXP: 0,
        earnedXP: 0,
        completedPhases: 0,
        earnedBadges: [],
        completionRate: 0
      };
    }

    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;
    let completedPhases = 0;

    // Parcourir toutes les phases
    Object.keys(PHASE_TASKS).forEach(phaseKey => {
      const tasks = PHASE_TASKS[phaseKey];
      const phaseData = formationProfile.phases[phaseKey];
      
      if (phaseData && phaseData.completed) {
        completedPhases++;
      }

      tasks.forEach(task => {
        totalTasks++;
        totalXP += task.xp;
        
        if (phaseData && phaseData.tasks && phaseData.tasks[task.id] && phaseData.tasks[task.id].completed) {
          completedTasks++;
          earnedXP += task.xp;
        }
      });
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      totalXP,
      earnedXP,
      completedPhases,
      earnedBadges: formationProfile.earnedBadges || [],
      completionRate
    };
  }, []);

  // 📊 Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) {
      addDebugLog('❌ Pas d\'utilisateur connecté', 'error');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      addDebugLog('🔄 Chargement données formation...');
      
      const result = await onboardingService.getFormationProfile(user.uid);
      addDebugLog(`📊 Résultat: ${result.success ? 'SUCCESS' : 'FAILED - ' + result.error}`);
      
      if (result.success) {
        setFormationData(result.data);
        const calculatedStats = calculateStats(result.data);
        setStats(calculatedStats);
        addDebugLog('✅ Données formation chargées avec stats calculées');
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
  }, [user?.uid, calculateStats]);

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

  // 🚀 Initialiser le profil de formation - VERSION ULTRA SIMPLE
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

  // 🔄 Toggle une tâche
  const toggleTask = async (phaseKey, taskId) => {
    try {
      addDebugLog(`🔄 Toggle tâche: ${phaseKey}.${taskId}`);
      
      const result = await onboardingService.toggleTask(user.uid, phaseKey, taskId);
      
      if (result.success) {
        addDebugLog(`✅ Tâche ${result.newState ? 'validée' : 'dé-validée'}`, 'success');
        // Recharger les données
        loadFormationData();
      } else {
        addDebugLog(`❌ Erreur toggle: ${result.error}`, 'error');
      }
    } catch (error) {
      addDebugLog(`💥 Erreur toggle: ${error.message}`, 'error');
    }
  };

  // 🔽 Toggle l'expansion d'une phase
  const togglePhaseExpansion = (phaseKey) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };

  // 🧹 Nettoyer les logs
  const clearDebugLogs = () => {
    setDebugLogs([]);
    addDebugLog('🧹 Logs nettoyés');
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

  // 📝 État sans données - BOUTON DE CRÉATION
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

          {/* BOUTON PRINCIPAL - VERSION DEBUG */}
          <div className="space-y-4">
            
            {/* Bouton avec event handler simple */}
            <button
              onClick={handleButtonClick}
              disabled={initializing}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border-2 ${
                initializing
                  ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white hover:border-blue-400'
              }`}
            >
              {initializing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin inline mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 inline mr-2" />
                  Commencer la Formation
                </>
              )}
            </button>

            {/* Infos debug */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>🔧 Mode Debug: User {user?.uid ? '✅' : '❌'} | Service {onboardingService ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>

        {/* Debug Console - TOUJOURS VISIBLE */}
        {showDebug && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-gray-300 flex items-center">
                <Bug className="h-4 w-4 mr-2" />
                Debug Console
              </h4>
              <button
                onClick={clearDebugLogs}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-xs text-gray-500">Aucun log pour le moment...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-xs font-mono ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      'text-gray-400'
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

  // 📊 AFFICHAGE AVEC DONNÉES FORMATION
  return (
    <div className="space-y-6">
      
      {/* 📊 En-tête avec stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Formation Game Master</h2>
            <p className="opacity-90">Maîtrisez toutes les expériences Brain</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.completionRate}%</div>
            <div className="text-sm opacity-80">Progression</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold">{stats.completedTasks}</div>
            <div className="text-sm opacity-80">Tâches validées</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{stats.earnedXP}</div>
            <div className="text-sm opacity-80">XP gagnés</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{stats.completedPhases}</div>
            <div className="text-sm opacity-80">Phases terminées</div>
          </div>
        </div>
      </div>

      {/* 📋 Phases et tâches */}
      <div className="space-y-4">
        {Object.entries(PHASE_TASKS).map(([phaseKey, tasks]) => {
          const phaseInfo = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseKey);
          const phaseData = formationData.phases?.[phaseKey];
          const isExpanded = expandedPhases[phaseKey];
          
          // Calculer la progression de la phase
          const completedTasksInPhase = tasks.filter(task => 
            phaseData?.tasks?.[task.id]?.completed
          ).length;
          const progressPercentage = Math.round((completedTasksInPhase / tasks.length) * 100);
          
          return (
            <div key={phaseKey} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
              
              {/* En-tête de phase */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                onClick={() => togglePhaseExpansion(phaseKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{phaseInfo?.icon || '📋'}</div>
                    <div>
                      <h3 className="font-bold text-white">{phaseInfo?.name || phaseKey}</h3>
                      <p className="text-sm text-gray-400">
                        {completedTasksInPhase}/{tasks.length} tâches • {progressPercentage}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {phaseData?.completed && (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    )}
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="mt-3 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Liste des tâches */}
              {isExpanded && (
                <div className="border-t border-gray-700">
                  {tasks.map((task) => {
                    const taskData = phaseData?.tasks?.[task.id];
                    const isCompleted = taskData?.completed || false;
                    const IconComponent = task.icon;
                    
                    return (
                      <div 
                        key={task.id}
                        className={`p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/20 transition-colors ${
                          isCompleted ? 'bg-green-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          
                          {/* Checkbox de validation */}
                          <button
                            onClick={() => toggleTask(phaseKey, task.id)}
                            className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-500 hover:border-gray-400'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="h-4 w-4" />}
                          </button>
                          
                          {/* Icône de la tâche */}
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          
                          {/* Contenu de la tâche */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${
                                isCompleted ? 'text-green-300 line-through' : 'text-white'
                              }`}>
                                {task.name}
                              </h4>
                              
                              <div className="flex items-center space-x-2 text-sm">
                                {task.required && (
                                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                                    Requis
                                  </span>
                                )}
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                  +{task.xp} XP
                                </span>
                                <span className="text-gray-400 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimatedTime}min
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-400">
                              {task.description}
                            </p>
                            
                            {/* Informations de validation */}
                            {isCompleted && taskData.completionDate && (
                              <div className="mt-2 text-xs text-green-400">
                                ✅ Validé le {new Date(taskData.completionDate).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🎉 Message de completion */}
      {stats.completionRate === 100 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">🎉 Formation Terminée !</h3>
          <p>Félicitations ! Vous avez terminé toute votre formation Game Master Brain.</p>
          <p className="text-sm opacity-90 mt-2">
            Vous avez validé {stats.completedTasks} tâches et gagné {stats.earnedXP} XP !
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={loadFormationData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </button>
      </div>

      {/* Debug Console */}
      {showDebug && debugLogs.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-gray-300 flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Debug Console
            </h4>
            <button
              onClick={clearDebugLogs}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugLogs.map((log, index) => (
              <div
                key={index}
                className={`text-xs font-mono ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-400'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationGenerale;
