// ==========================================
// 📁 react-app/src/components/onboarding/FormationGenerale.jsx
// COMPOSANT FORMATION GÉNÉRALE BRAIN ESCAPE & QUIZ GAME - CORRIGÉ
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
  RefreshCw
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../../core/services/onboardingService.js';

// 🎯 TÂCHES PAR PHASE
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

  parcours_client: [
    {
      id: 'observer_accueil',
      name: 'Observer l\'accueil des client·e·s à leur arrivée',
      icon: UserCheck,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'comprendre_briefing',
      name: 'Comprendre le briefing et les consignes données',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'suivre_session',
      name: 'Suivre une session complète depuis la régie',
      icon: Eye,
      xp: 20,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'analyser_debriefing',
      name: 'Analyser le débriefing et les retours client·e·s',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'observer_upselling',
      name: 'Observer les techniques d\'upselling et de vente',
      icon: Target,
      xp: 10,
      required: true,
      estimatedTime: 45
    }
  ],

  securite_procedures: [
    {
      id: 'consignes_securite',
      name: 'Connaître les consignes de sécurité incendie/évacuation',
      icon: Shield,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gestion_materiel',
      name: 'Gestion et entretien du matériel (cadenas, objets, etc.)',
      icon: Wrench,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'procedures_urgence',
      name: 'Procédures d\'urgence et contacts importants',
      icon: AlertCircle,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'ouverture_fermeture',
      name: 'Procédures d\'ouverture/fermeture du local',
      icon: Key,
      xp: 15,
      required: true,
      estimatedTime: 75
    },
    {
      id: 'hygiene_nettoyage',
      name: 'Règles d\'hygiène et procédures de nettoyage',
      icon: Sparkles,
      xp: 10,
      required: true,
      estimatedTime: 60
    }
  ],

  formation_experience: [
    {
      id: 'escape_level1',
      name: 'Maîtriser complètement 1 escape game (niveau débutant)',
      icon: Gamepad2,
      xp: 30,
      required: true,
      estimatedTime: 240
    },
    {
      id: 'quiz_categories',
      name: 'Connaître les différentes catégories de quiz et leurs spécificités',
      icon: BookOpen,
      xp: 20,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'animation_basic',
      name: 'Animer une session avec accompagnement',
      icon: Users,
      xp: 25,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'gestion_indices',
      name: 'Gérer les indices et accompagner les équipes',
      icon: Lightbulb,
      xp: 20,
      required: true,
      estimatedTime: 150
    },
    {
      id: 'troubleshooting',
      name: 'Résoudre les problèmes techniques courants',
      icon: Settings,
      xp: 25,
      required: true,
      estimatedTime: 120
    }
  ],

  taches_quotidien: [
    {
      id: 'gestion_planning',
      name: 'Gérer les plannings et les réservations',
      icon: Calendar,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'accueil_telephonique',
      name: 'Assurer l\'accueil téléphonique et mail',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gestion_caisse',
      name: 'Gérer la caisse et les modes de paiement',
      icon: Target,
      xp: 15,
      required: true,
      estimatedTime: 75
    },
    {
      id: 'preparation_salles',
      name: 'Préparer et reset les salles entre les sessions',
      icon: RotateCcw,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'reporting',
      name: 'Effectuer le reporting quotidien d\'activité',
      icon: FileText,
      xp: 10,
      required: true,
      estimatedTime: 45
    }
  ],

  soft_skills: [
    {
      id: 'communication_equipe',
      name: 'Communiquer efficacement avec l\'équipe',
      icon: Users,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_stress',
      name: 'Gérer le stress et les situations tendues',
      icon: Heart,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'adaptation_public',
      name: 'S\'adapter à différents types de public',
      icon: Users,
      xp: 20,
      required: true,
      estimatedTime: 150
    },
    {
      id: 'prise_initiative',
      name: 'Prendre des initiatives et proposer des améliorations',
      icon: Lightbulb,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'feedback_constructif',
      name: 'Donner et recevoir des feedbacks constructifs',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 60
    }
  ],

  validation_finale: [
    {
      id: 'evaluation_pratique',
      name: 'Évaluation pratique complète sur plusieurs jeux',
      icon: Trophy,
      xp: 50,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'entretien_final',
      name: 'Entretien final avec le·la manager',
      icon: UserCheck,
      xp: 50,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'evaluation_competences',
      name: 'Évaluation complète des compétences acquises',
      icon: CheckCircle,
      xp: 30,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'feedback_parcours',
      name: 'Feedback sur le parcours et axes d\'amélioration',
      icon: MessageSquare,
      xp: 20,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'definition_objectifs',
      name: 'Définition des objectifs pour les 3 prochains mois',
      icon: Target,
      xp: 20,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'integration_complete',
      name: 'Validation de l\'intégration complète',
      icon: Trophy,
      xp: 30,
      required: true,
      estimatedTime: 120
    }
  ]
};

const FormationGenerale = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [activePhase, setActivePhase] = useState('decouverte_brain');
  const [expandedPhases, setExpandedPhases] = useState(['decouverte_brain']);
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
      console.log('📊 Chargement données formation...');
      
      const result = await onboardingService.getFormationProfile(user.uid);
      
      if (result.success) {
        setFormationData(result.data);
        calculateStats(result.data);
        console.log('✅ Données formation chargées');
      } else {
        console.log('📝 Profil formation non trouvé');
        setFormationData(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement formation:', error);
      setFormationData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 Initialiser le profil de formation
  const initializeFormationProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('🚀 Initialisation profil formation...');
      
      const result = await onboardingService.createFormationProfile(user.uid);
      
      if (result.success) {
        console.log('✅ Profil formation créé');
        await loadFormationData();
      } else {
        console.error('❌ Échec création profil formation:', result.error);
        alert(`Erreur lors de la création du profil de formation: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur initialisation formation:', error);
      alert(`Erreur lors de l'initialisation du profil de formation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Toggle une tâche
  const toggleTask = useCallback(async (phaseId, taskId) => {
    if (!user?.uid || !formationData) return;
    
    try {
      console.log('🔄 Toggle tâche:', phaseId, taskId);
      
      const result = await onboardingService.toggleTask(user.uid, phaseId, taskId);
      
      if (result.success) {
        await loadFormationData();
        console.log('✅ Tâche toggleée');
      }
    } catch (error) {
      console.error('❌ Erreur toggle tâche:', error);
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

  // 📝 État sans données - Proposition de création
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
          <button
            onClick={initializeFormationProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            🚀 Commencer la Formation
          </button>
        </div>
      </div>
    );
  }

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

      {/* 📋 Phases de formation */}
      <div className="space-y-4">
        {Object.values(ONBOARDING_PHASES).map((phase, index) => {
          const phaseTasks = PHASE_TASKS[phase.id] || [];
          const phaseData = formationData.phases?.[phase.id];
          const isExpanded = expandedPhases.includes(phase.id);
          
          // Calculer la progression de cette phase
          const completedPhasesTasks = phaseTasks.filter(task => 
            phaseData?.tasks?.[task.id]?.completed
          ).length;
          const phaseProgress = phaseTasks.length > 0 
            ? (completedPhasesTasks / phaseTasks.length) * 100 
            : 0;
          
          const isPhaseComplete = completedPhasesTasks === phaseTasks.length;

          return (
            <div 
              key={phase.id}
              className={`bg-gray-800/50 rounded-lg border transition-all duration-200 ${
                isPhaseComplete 
                  ? 'border-green-500/50 bg-green-900/10' 
                  : 'border-gray-700/50'
              }`}
            >
              {/* En-tête de phase */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => togglePhaseExpansion(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {phase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{phase.name}</h3>
                      <p className="text-gray-400 text-sm">{phase.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-blue-400">
                          {completedPhasesTasks}/{phaseTasks.length} tâches
                        </span>
                        <span className="text-green-400">
                          {phase.xpTotal} XP
                        </span>
                        <span className="text-purple-400">
                          ~{phase.duration} jours
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isPhaseComplete && (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {Math.round(phaseProgress)}%
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Barre de progression de phase */}
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${phaseProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Contenu détaillé de la phase */}
              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-700/50 pt-6">
                    <div className="grid gap-3">
                      {phaseTasks.map((task) => {
                        const taskData = phaseData?.tasks?.[task.id];
                        const isCompleted = taskData?.completed || false;
                        const TaskIcon = task.icon;

                        return (
                          <div 
                            key={task.id}
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                              isCompleted 
                                ? 'bg-green-900/20 border border-green-500/30' 
                                : 'bg-gray-700/30 border border-gray-600/30 hover:bg-gray-600/30'
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(phase.id, task.id)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-400 hover:border-blue-400'
                              }`}
                            >
                              {isCompleted && (
                                <CheckCircle className="w-6 h-6 text-white" />
                              )}
                            </button>

                            <div className="flex-shrink-0">
                              <TaskIcon className={`h-5 w-5 ${
                                isCompleted ? 'text-green-400' : 'text-gray-400'
                              }`} />
                            </div>

                            <div className="flex-1">
                              <div className={`font-medium ${
                                isCompleted ? 'text-green-300 line-through' : 'text-white'
                              }`}>
                                {task.name}
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-sm">
                                <span className="text-blue-400">
                                  +{task.xp} XP
                                </span>
                                <span className="text-gray-400 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  ~{task.estimatedTime}min
                                </span>
                                {task.required && (
                                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                                    Obligatoire
                                  </span>
                                )}
                              </div>
                            </div>

                            {isCompleted && taskData?.completionDate && (
                              <div className="text-xs text-gray-400">
                                Complété le {new Date(taskData.completionDate).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Badge de phase */}
                    {isPhaseComplete && phase.badge && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-500/30">
                        <div className="flex items-center space-x-3">
                          <Award className="h-6 w-6 text-yellow-400" />
                          <div>
                            <div className="font-semibold text-yellow-400">Badge débloqué !</div>
                            <div className="text-yellow-300">{phase.badge}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🏆 Actions rapides */}
      <div className="mt-8 text-center space-y-4">
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
