// ==========================================
// 📁 react-app/src/components/onboarding/FormationGenerale.jsx
// COMPOSANT FORMATION GÉNÉRALE BRAIN ESCAPE & QUIZ GAME
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
  Sparkles
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
      estimatedTime: 120
    },
    {
      id: 'observer_debriefing',
      name: 'Observer le débriefing et la remise de photos',
      icon: FileText,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gerer_paiement',
      name: 'Comprendre la gestion du paiement et des extras',
      icon: Trophy,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'accompagner_sortie',
      name: 'Accompagner les client·e·s jusqu\'à leur sortie',
      icon: CheckCircle,
      xp: 5,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'types_clientele',
      name: 'Identifier les différents types de clientèle et leurs besoins',
      icon: Users,
      xp: 15,
      required: true,
      estimatedTime: 90
    }
  ],

  securite_procedures: [
    {
      id: 'connaitre_evacuation',
      name: 'Connaître les procédures d\'évacuation et de sécurité',
      icon: Shield,
      xp: 20,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'utiliser_materiel',
      name: 'Savoir utiliser le matériel de sécurité (extincteur, etc.)',
      icon: AlertCircle,
      xp: 15,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'gestion_incidents',
      name: 'Procédures en cas d\'incident ou d\'urgence médicale',
      icon: Heart,
      xp: 25,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'entretien_materiel',
      name: 'Entretien et vérification du matériel',
      icon: Settings,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'hygiene_nettoyage',
      name: 'Procédures d\'hygiène et de nettoyage',
      icon: Sparkles,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'ouverture_fermeture',
      name: 'Procédures d\'ouverture et de fermeture',
      icon: Key,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_cles',
      name: 'Gestion et sécurisation des clés et accès',
      icon: Shield,
      xp: 5,
      required: true,
      estimatedTime: 30
    }
  ],

  formation_experience: [
    {
      id: 'lire_scenario',
      name: 'Lire le scénario complet et l\'objectif du jeu',
      icon: BookOpen,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'observer_session',
      name: 'Observer une session animée par un·e Game Master confirmé·e',
      icon: Eye,
      xp: 20,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'apprendre_enigmes',
      name: 'Apprendre toutes les énigmes, solutions et points d\'aide',
      icon: Target,
      xp: 25,
      required: true,
      estimatedTime: 180
    },
    {
      id: 'maitriser_reset',
      name: 'Maîtriser le reset de la salle ou du plateau',
      icon: RotateCcw,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_technique',
      name: 'Prendre en main la gestion technique (caméras, indices, effets)',
      icon: Settings,
      xp: 20,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'animation_duo',
      name: 'Animer une session en duo, puis en autonomie sous supervision',
      icon: Users,
      xp: 25,
      required: true,
      estimatedTime: 240
    },
    {
      id: 'briefing_debriefing',
      name: 'Effectuer un briefing et un débriefing complet',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gerer_incident',
      name: 'Gérer un incident fictif (clé cassée, client·e bloqué·e, bug technique)',
      icon: AlertCircle,
      xp: 20,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'session_complete',
      name: 'Réaliser une session complète validée par un·e référent·e',
      icon: Trophy,
      xp: 30,
      required: true,
      estimatedTime: 180
    }
  ],

  taches_quotidien: [
    {
      id: 'ouverture_quotidienne',
      name: 'Effectuer l\'ouverture quotidienne',
      icon: Play,
      xp: 10,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'check_materiel',
      name: 'Vérifier l\'état du matériel et signaler les dysfonctionnements',
      icon: CheckCircle,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'nettoyage_reset',
      name: 'Effectuer le nettoyage et le reset entre chaque session',
      icon: RotateCcw,
      xp: 5,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'gestion_planning',
      name: 'Consulter et comprendre le planning du jour',
      icon: Calendar,
      xp: 5,
      required: true,
      estimatedTime: 15
    },
    {
      id: 'communication_equipe',
      name: 'Communiquer efficacement avec l\'équipe (Slack, briefings)',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'fermeture_quotidienne',
      name: 'Effectuer la fermeture quotidienne',
      icon: Pause,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'gestion_stocks',
      name: 'Vérifier et signaler les besoins en stocks',
      icon: BadgeIcon,
      xp: 5,
      required: true,
      estimatedTime: 20
    },
    {
      id: 'rapport_incidents',
      name: 'Rédiger un rapport en cas d\'incident ou de problème',
      icon: FileText,
      xp: 10,
      required: true,
      estimatedTime: 30
    }
  ],

  soft_skills: [
    {
      id: 'communication_bienveillante',
      name: 'Développer une communication bienveillante et inclusive',
      icon: Heart,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'gestion_stress',
      name: 'Techniques de gestion du stress et de la pression',
      icon: Zap,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'adaptation_public',
      name: 'S\'adapter à différents types de public',
      icon: Users,
      xp: 20,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'resolution_conflits',
      name: 'Gérer les conflits et les situations difficiles',
      icon: Shield,
      xp: 20,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'travail_equipe',
      name: 'Renforcer l\'esprit d\'équipe et la collaboration',
      icon: Users,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'prise_initiative',
      name: 'Développer la prise d\'initiative et l\'autonomie',
      icon: Star,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'feedback_constructif',
      name: 'Donner et recevoir un feedback constructif',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 45
    }
  ],

  validation_finale: [
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
      
      if (phaseData?.completed) {
        completedPhases++;
        const phaseInfo = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
        if (phaseInfo?.badge) {
          earnedBadges.push(phaseInfo.badge);
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

  // 🎨 Icône de phase
  const getPhaseIcon = (phaseId) => {
    const phase = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
    return phase?.icon || BookOpen;
  };

  // 🔄 Charger les données au montage
  useEffect(() => {
    loadFormationData();
  }, [loadFormationData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre formation...</p>
        </div>
      </div>
    );
  }

  // Si aucun profil de formation n'existe
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🧠</div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Formation Générale Brain Escape & Quiz Game
        </h3>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Bienvenue dans ton parcours d'intégration complet ! Tu vas découvrir l'univers Brain, 
          maîtriser toutes les expériences et développer tes compétences de Game Master. <br/>
          <strong className="text-purple-400">1 mois de parcours avec XP, badges et certification !</strong>
        </p>
        <button
          onClick={initializeFormationProfile}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          🚀 Commencer ma Formation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 📊 Statistiques de progression */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          🧠 Ta Progression Formation Brain
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <div className="text-sm text-gray-300">Tâches</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.earnedXP}/{stats.totalXP}
            </div>
            <div className="text-sm text-gray-300">XP</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.completedPhases}/7
            </div>
            <div className="text-sm text-gray-300">Phases</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.earnedBadges.length}
            </div>
            <div className="text-sm text-gray-300">Badges</div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Progression globale</span>
            <span>{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 🎯 Navigation des phases */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Phases de Formation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(ONBOARDING_PHASES)
            .sort((a, b) => a.order - b.order)
            .map(phase => {
              const phaseData = formationData.phases?.[phase.id];
              const isActive = activePhase === phase.id;
              const isCompleted = phaseData?.completed;
              const IconComponent = getPhaseIcon(phase.id);

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : isCompleted
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      Phase {phase.order}
                    </span>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-400" />}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {phase.name}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* 📋 Contenu de la phase active */}
      <div className="bg-gray-800 rounded-lg p-6">
        {(() => {
          const currentPhase = Object.values(ONBOARDING_PHASES).find(p => p.id === activePhase);
          const currentPhaseTasks = PHASE_TASKS[activePhase] || [];
          const phaseData = formationData.phases?.[activePhase];

          return (
            <div>
              {/* En-tête de phase */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {React.createElement(getPhaseIcon(activePhase), { 
                    className: "h-8 w-8 text-blue-400" 
                  })}
                  <h3 className="text-2xl font-bold text-white">
                    {currentPhase?.name}
                  </h3>
                  {phaseData?.completed && (
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      ✅ Terminé
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mb-4">
                  {currentPhase?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>🎯 {currentPhaseTasks.length} tâches</span>
                  <span>⚡ {currentPhaseTasks.reduce((sum, task) => sum + task.xp, 0)} XP</span>
                  <span>🕒 {currentPhase?.duration} jours</span>
                </div>
              </div>

              {/* Liste des tâches */}
              <div className="space-y-3">
                {currentPhaseTasks.map(task => {
                  const taskData = phaseData?.tasks?.[task.id];
                  const isCompleted = taskData?.completed;
                  const IconComponent = task.icon;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(activePhase, task.id)}
                          className={`mt-1 p-2 rounded-lg transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <IconComponent className="h-4 w-4" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-medium ${
                              isCompleted ? 'text-green-400' : 'text-white'
                            }`}>
                              {task.name}
                            </h4>
                            {task.required && (
                              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                                Obligatoire
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>⚡ +{task.xp} XP</span>
                            <span>🕒 ~{task.estimatedTime}min</span>
                            {isCompleted && taskData.completionDate && (
                              <span className="text-green-400">
                                ✅ {new Date(taskData.completionDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default FormationGenerale;
