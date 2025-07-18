// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING AVEC FORMATION GÉNÉRALE COMPLÈTE RESTAURÉE
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
  FileText,
  Shield,
  Gamepad2,
  Settings,
  Wrench,
  Sparkles,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  Pause,
  RotateCcw,
  Badge as BadgeIcon,
  Zap,
  AlertCircle
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// 🎯 TÂCHES PAR PHASE - STRUCTURE COMPLÈTE RESTAURÉE
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
      id: 'histoire_brain',
      name: 'Connaître l\'histoire et l\'évolution de Brain',
      description: 'Comprendre le parcours de Brain depuis sa création jusqu\'à aujourd\'hui',
      icon: BookOpen,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'outils_communication',
      name: 'Maîtriser les outils de communication interne',
      description: 'Configuration et utilisation des outils (Slack, email, systèmes internes)',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'materiel_attribution',
      name: 'Attribution du matériel et configuration',
      description: 'Récupération et configuration du matériel de travail personnel',
      icon: Settings,
      xp: 10,
      required: true,
      estimatedTime: 60
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
      id: 'briefing_regles',
      name: 'Conduire un briefing et expliquer les règles',
      description: 'Animation du briefing, explication claire des règles et mise en ambiance',
      icon: Eye,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_emotion',
      name: 'Gérer l\'émotion et l\'expérience client',
      description: 'Accompagnement émotionnel, gestion du stress des joueurs et optimisation de l\'expérience',
      icon: Heart,
      xp: 20,
      required: true,
      estimatedTime: 150
    },
    {
      id: 'debriefing_client',
      name: 'Mener un débriefing efficace',
      description: 'Techniques de débriefing, retour d\'expérience et valorisation de la performance',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_conflits',
      name: 'Gérer les situations difficiles et conflits',
      description: 'Techniques de désescalade, gestion des mécontentements et solutions client',
      icon: Shield,
      xp: 15,
      required: true,
      estimatedTime: 120
    }
  ],

  securite_procedures: [
    {
      id: 'procedures_securite',
      name: 'Connaître toutes les procédures de sécurité',
      description: 'Procédures d\'urgence, évacuation, premiers secours et protocoles de sécurité',
      icon: Shield,
      xp: 20,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'gestion_materiel',
      name: 'Maîtriser la gestion du matériel',
      description: 'Inventaire, maintenance, nettoyage et remplacement du matériel de jeu',
      icon: Settings,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'maintenance_espaces',
      name: 'Assurer la maintenance des espaces de jeu',
      description: 'Entretien quotidien, vérifications techniques et préparation des salles',
      icon: Wrench,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'hygiene_proprete',
      name: 'Respecter les standards d\'hygiène et propreté',
      description: 'Protocoles de nettoyage, désinfection et maintien des standards de propreté',
      icon: Sparkles,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'ouverture_fermeture',
      name: 'Maîtriser les procédures d\'ouverture/fermeture',
      description: 'Check-lists d\'ouverture et fermeture, vérifications de sécurité',
      icon: Key,
      xp: 15,
      required: true,
      estimatedTime: 90
    }
  ],

  formation_experience: [
    {
      id: 'connaissance_jeux',
      name: 'Connaître parfaitement tous nos jeux',
      description: 'Maîtrise complète de chaque Escape Game et Quiz Game proposé',
      icon: Gamepad2,
      xp: 25,
      required: true,
      estimatedTime: 300
    },
    {
      id: 'scenarios_alternatifs',
      name: 'Maîtriser les scénarios alternatifs',
      description: 'Gestion des variantes, adaptations selon les groupes et situations particulières',
      icon: BookOpen,
      xp: 20,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'techniques_game_master',
      name: 'Développer ses techniques de Game Master',
      description: 'Art du timing, gestion des indices, création de suspense et animation',
      icon: Trophy,
      xp: 25,
      required: true,
      estimatedTime: 240
    },
    {
      id: 'gestion_groupe',
      name: 'Gérer tous types de groupes',
      description: 'Adaptation selon l\'âge, taille du groupe, niveau et dynamique de groupe',
      icon: Users,
      xp: 20,
      required: true,
      estimatedTime: 150
    },
    {
      id: 'innovation_experience',
      name: 'Innover dans l\'expérience proposée',
      description: 'Créativité, personnalisation et amélioration continue de l\'expérience',
      icon: Lightbulb,
      xp: 15,
      required: false,
      estimatedTime: 120
    }
  ],

  taches_quotidien: [
    {
      id: 'gestion_planning',
      name: 'Gérer efficacement son planning',
      description: 'Organisation personnelle, gestion du temps et priorisation des tâches',
      icon: Calendar,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_reservation',
      name: 'Maîtriser le système de réservation',
      description: 'Utilisation du logiciel de réservation, modifications et optimisation du planning',
      icon: Calendar,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'communication_equipe',
      name: 'Communiquer efficacement avec l\'équipe',
      description: 'Transmission d\'informations, coordination et collaboration interne',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gestion_caisse',
      name: 'Gérer la caisse et les paiements',
      description: 'Encaissements, gestion des moyens de paiement et procédures financières',
      icon: Coffee,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'reporting_quotidien',
      name: 'Effectuer le reporting quotidien',
      description: 'Comptes-rendus d\'activité, incidents et suggestions d\'amélioration',
      icon: FileText,
      xp: 10,
      required: true,
      estimatedTime: 45
    }
  ],

  soft_skills: [
    {
      id: 'intelligence_emotionnelle',
      name: 'Développer son intelligence émotionnelle',
      description: 'Gestion des émotions, empathie et compréhension des autres',
      icon: Heart,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'communication_assertive',
      name: 'Maîtriser la communication assertive',
      description: 'Expression claire de ses besoins, écoute active et communication bienveillante',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_stress',
      name: 'Apprendre à gérer son stress',
      description: 'Techniques de relaxation, gestion de la pression et maintien de la performance',
      icon: Shield,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'esprit_equipe',
      name: 'Cultiver l\'esprit d\'équipe',
      description: 'Collaboration, entraide et contribution positive à l\'ambiance de travail',
      icon: Users,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'initiative_proactivite',
      name: 'Développer son initiative et sa proactivité',
      description: 'Prise d\'initiative, proposition d\'améliorations et autonomie dans l\'action',
      icon: Zap,
      xp: 15,
      required: true,
      estimatedTime: 90
    }
  ],

  validation_finale: [
    {
      id: 'evaluation_competences',
      name: 'Évaluation complète des compétences',
      description: 'Bilan des acquis, test pratique et validation des compétences développées',
      icon: CheckCircle,
      xp: 25,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'entretien_validation',
      name: 'Entretien de validation avec le référent',
      description: 'Échange sur le parcours, retours d\'expérience et perspectives d\'évolution',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'certification_game_master',
      name: 'Obtention de la certification Game Master',
      description: 'Remise officielle de la certification et reconnaissance des compétences',
      icon: BadgeIcon,
      xp: 25,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'plan_developpement',
      name: 'Définition du plan de développement futur',
      description: 'Établissement des objectifs et du plan de développement des compétences',
      icon: Target,
      xp: 15,
      required: true,
      estimatedTime: 90
    }
  ]
};

// 🎯 COMPOSANT FORMATION GÉNÉRALE COMPLET RESTAURÉ
const FormationGeneraleIntegree = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [toggleLoading, setToggleLoading] = useState({});
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalXP: 0,
    earnedXP: 0,
    completedPhases: 0,
    earnedBadges: []
  });

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
        calculateStats(result.data);
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

  // 📊 Calculer les statistiques
  const calculateStats = (data) => {
    if (!data || !data.phases) return;

    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;
    let completedPhases = 0;

    Object.keys(ONBOARDING_PHASES).forEach(phaseKey => {
      const phase = ONBOARDING_PHASES[phaseKey];
      const phaseData = data.phases[phase.id];
      const phaseTasks = PHASE_TASKS[phase.id] || [];

      phaseTasks.forEach(task => {
        totalTasks++;
        totalXP += task.xp;
        
        if (phaseData?.tasks?.[task.id]?.completed) {
          completedTasks++;
          earnedXP += task.xp;
        }
      });

      if (phaseData?.completed) {
        completedPhases++;
      }
    });

    setStats({
      totalTasks,
      completedTasks,
      totalXP,
      earnedXP,
      completedPhases,
      totalPhases: Object.keys(ONBOARDING_PHASES).length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      earnedBadges: data.earnedBadges || []
    });
  };

  // 🔄 Toggle une tâche
  const toggleTask = async (phaseId, taskId) => {
    if (!user?.uid || !formationData) return;

    const toggleKey = `${phaseId}-${taskId}`;
    setToggleLoading(prev => ({ ...prev, [toggleKey]: true }));

    try {
      addDebugLog(`🔄 Toggle tâche: ${phaseId}/${taskId}`);
      
      const result = await onboardingService.toggleTask(user.uid, phaseId, taskId);
      
      if (result.success) {
        addDebugLog(`✅ Tâche toggleée: ${result.newState ? 'COMPLETED' : 'UNCOMPLETED'}`);
        // Recharger les données
        await loadFormationData();
      } else {
        addDebugLog(`❌ Erreur toggle: ${result.error}`, 'error');
      }
    } catch (error) {
      addDebugLog(`💥 Erreur toggle: ${error.message}`, 'error');
    } finally {
      setToggleLoading(prev => ({ ...prev, [toggleKey]: false }));
    }
  };

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

  // 🔄 Toggle l'expansion d'une phase
  const togglePhaseExpansion = (phaseId) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
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

  // 📝 État sans données - Création du profil
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

  // 🎉 État avec données - Formation active avec TOUTES LES PHASES
  return (
    <div className="space-y-6">
      
      {/* En-tête des statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.completedTasks}/{stats.totalTasks}</div>
          <div className="text-xs text-gray-400">Tâches terminées</div>
        </div>
        
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.earnedXP}/{stats.totalXP}</div>
          <div className="text-xs text-gray-400">XP obtenus</div>
        </div>
        
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.completedPhases}/{stats.totalPhases}</div>
          <div className="text-xs text-gray-400">Phases terminées</div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.completionRate}%</div>
          <div className="text-xs text-gray-400">Progression</div>
        </div>
      </div>

      {/* Liste des phases avec toutes les tâches */}
      <div className="space-y-4">
        {Object.values(ONBOARDING_PHASES).sort((a, b) => a.order - b.order).map(phase => {
          const phaseData = formationData.phases[phase.id];
          const phaseTasks = PHASE_TASKS[phase.id] || [];
          const completedTasks = phaseTasks.filter(task => 
            phaseData?.tasks?.[task.id]?.completed
          ).length;
          const isExpanded = expandedPhases[phase.id];

          return (
            <div key={phase.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden">
              
              {/* En-tête de phase */}
              <button
                onClick={() => togglePhaseExpansion(phase.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${phase.color} flex items-center justify-center text-2xl`}>
                    {phase.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{phase.name}</h3>
                    <p className="text-sm text-gray-400">{phase.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>📋 {completedTasks}/{phaseTasks.length} tâches</span>
                      <span>⭐ {phase.xpTotal} XP</span>
                      <span>⏱️ {phase.duration} jours</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {phaseData?.completed && (
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                      ✅ Terminée
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Contenu des tâches */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 p-4 space-y-3">
                  {phaseTasks.map(task => {
                    const taskData = phaseData?.tasks?.[task.id];
                    const isCompleted = taskData?.completed || false;
                    const toggleKey = `${phase.id}-${task.id}`;
                    const isToggling = toggleLoading[toggleKey];

                    return (
                      <div key={task.id} className={`
                        p-3 rounded-lg border transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-green-900/20 border-green-500/30' 
                            : 'bg-gray-700/30 border-gray-600/50 hover:border-gray-500/50'
                        }
                      `}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => toggleTask(phase.id, task.id)}
                              disabled={isToggling}
                              className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isCompleted 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-400 hover:border-gray-300'
                                } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              {isToggling ? (
                                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            
                            <div className="flex-1">
                              <div className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                                {task.name}
                              </div>
                              {task.description && (
                                <div className="text-sm text-gray-400 mt-1">
                                  {task.description}
                                </div>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>⭐ {task.xp} XP</span>
                                <span>⏱️ {task.estimatedTime}min</span>
                                {task.required && <span className="text-orange-400">🔸 Obligatoire</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <task.icon className={`w-5 h-5 ${isCompleted ? 'text-green-400' : 'text-gray-400'}`} />
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

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={loadFormationData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
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
