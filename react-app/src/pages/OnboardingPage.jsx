// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// INTERFACE COMPLÈTE DES 7 PHASES AVEC TOUTES LES TÂCHES
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
  Zap,
  Badge as BadgeIcon,
  Lock,
  Unlock,
  TrendingUp,
  BarChart3,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// 🎯 TOUTES LES TÂCHES PAR PHASE - VERSION COMPLÈTE
const PHASE_TASKS = {
  decouverte_brain: [
    {
      id: 'visite_locaux',
      name: 'Visite guidée des locaux et présentation de l\'équipe',
      description: 'Tour complet des espaces Brain, rencontre avec chaque membre de l\'équipe',
      icon: Building,
      xp: 15,
      required: true,
      estimatedTime: 90,
      category: 'Integration'
    },
    {
      id: 'comprendre_valeurs',
      name: 'Comprendre les valeurs et la culture d\'entreprise',
      description: 'Découvrir l\'ADN Brain, les valeurs fondamentales et l\'esprit d\'équipe',
      icon: Heart,
      xp: 15,
      required: true,
      estimatedTime: 60,
      category: 'Culture'
    },
    {
      id: 'acceder_outils',
      name: 'Accéder aux outils de travail (Slack, Drive, planning)',
      description: 'Configuration des comptes et première prise en main des outils',
      icon: Key,
      xp: 10,
      required: true,
      estimatedTime: 45,
      category: 'Technique'
    },
    {
      id: 'pause_equipe',
      name: 'Prendre une pause/repas avec l\'équipe',
      description: 'Moment convivial pour mieux connaître les collègues',
      icon: Coffee,
      xp: 5,
      required: false,
      estimatedTime: 60,
      category: 'Social'
    },
    {
      id: 'questions_reponses',
      name: 'Session questions/réponses avec ton·ta référent·e',
      description: 'Moment privilégié pour poser toutes tes questions',
      icon: MessageSquare,
      xp: 10,
      required: true,
      estimatedTime: 45,
      category: 'Accompagnement'
    },
    {
      id: 'comprendre_poste',
      name: 'Comprendre ton poste et tes missions',
      description: 'Définition claire du rôle, des responsabilités et des attentes',
      icon: Target,
      xp: 15,
      required: true,
      estimatedTime: 75,
      category: 'Role'
    }
  ],

  parcours_client: [
    {
      id: 'observer_accueil',
      name: 'Observer l\'accueil des client·e·s à leur arrivée',
      description: 'Comprendre les premiers instants cruciaux de l\'expérience client',
      icon: UserCheck,
      xp: 15,
      required: true,
      estimatedTime: 90,
      category: 'Service Client'
    },
    {
      id: 'comprendre_briefing',
      name: 'Comprendre le briefing et les consignes données',
      description: 'Maîtriser l\'art du briefing qui conditionne la réussite des équipes',
      icon: MessageSquare,
      xp: 20,
      required: true,
      estimatedTime: 120,
      category: 'Animation'
    },
    {
      id: 'suivre_session',
      name: 'Suivre une session complète depuis la régie',
      description: 'Observer le flow complet d\'une session depuis les coulisses',
      icon: Eye,
      xp: 25,
      required: true,
      estimatedTime: 120,
      category: 'Observation'
    },
    {
      id: 'observer_debriefing',
      name: 'Observer le débriefing et la remise de photos',
      description: 'Comprendre l\'importance du moment de décompression et souvenir',
      icon: FileText,
      xp: 15,
      required: true,
      estimatedTime: 60,
      category: 'Service Client'
    },
    {
      id: 'gerer_paiement',
      name: 'Comprendre la gestion du paiement et des extras',
      description: 'Aspects commerciaux et administratifs de la vente',
      icon: Trophy,
      xp: 15,
      required: true,
      estimatedTime: 45,
      category: 'Commercial'
    },
    {
      id: 'accompagner_sortie',
      name: 'Accompagner les client·e·s jusqu\'à leur sortie',
      description: 'Finaliser l\'expérience sur une note positive et mémorable',
      icon: CheckCircle,
      xp: 10,
      required: true,
      estimatedTime: 30,
      category: 'Service Client'
    },
    {
      id: 'types_clientele',
      name: 'Identifier les différents types de clientèle et leurs besoins',
      description: 'Adapter son approche selon les profils de joueurs',
      icon: Users,
      xp: 20,
      required: true,
      estimatedTime: 90,
      category: 'Psychologie'
    }
  ],

  securite_procedures: [
    {
      id: 'connaitre_evacuation',
      name: 'Connaître les procédures d\'évacuation et de sécurité',
      description: 'Maîtriser les protocoles de sécurité et les issues de secours',
      icon: Shield,
      xp: 25,
      required: true,
      estimatedTime: 90,
      category: 'Sécurité'
    },
    {
      id: 'utiliser_materiel',
      name: 'Savoir utiliser le matériel de sécurité (extincteur, etc.)',
      description: 'Formation pratique aux équipements de sécurité',
      icon: Settings,
      xp: 20,
      required: true,
      estimatedTime: 60,
      category: 'Sécurité'
    },
    {
      id: 'gestion_urgence',
      name: 'Protocoles d\'urgence et contacts importants',
      description: 'Savoir réagir en cas de situation d\'urgence',
      icon: AlertCircle,
      xp: 25,
      required: true,
      estimatedTime: 75,
      category: 'Sécurité'
    },
    {
      id: 'maintenance_materiel',
      name: 'Maintenance préventive du matériel de jeu',
      description: 'Entretenir et vérifier le bon fonctionnement des équipements',
      icon: Wrench,
      xp: 20,
      required: true,
      estimatedTime: 120,
      category: 'Technique'
    },
    {
      id: 'ouverture_fermeture',
      name: 'Procédures d\'ouverture et fermeture du centre',
      description: 'Check-lists quotidiennes pour sécuriser le site',
      icon: Key,
      xp: 20,
      required: true,
      estimatedTime: 90,
      category: 'Gestion'
    },
    {
      id: 'hygiene_nettoyage',
      name: 'Standards d\'hygiène et protocoles de nettoyage',
      description: 'Maintenir un environnement propre et sain pour les clients',
      icon: Sparkles,
      xp: 15,
      required: true,
      estimatedTime: 75,
      category: 'Hygiène'
    }
  ],

  formation_experience: [
    {
      id: 'escape_debutant',
      name: 'Maîtriser complètement 1 escape game niveau débutant',
      description: 'Connaître parfaitement tous les mécanismes d\'un escape game',
      icon: Gamepad2,
      xp: 40,
      required: true,
      estimatedTime: 300,
      category: 'Escape Game'
    },
    {
      id: 'quiz_categories',
      name: 'Connaître toutes les catégories de quiz et leurs spécificités',
      description: 'Culture générale, musique, cinéma, sport... maîtriser chaque univers',
      icon: BookOpen,
      xp: 30,
      required: true,
      estimatedTime: 180,
      category: 'Quiz Game'
    },
    {
      id: 'animation_accompagnee',
      name: 'Animer une session avec accompagnement d\'un Game Master',
      description: 'Première expérience d\'animation en binôme avec un expert',
      icon: Users,
      xp: 35,
      required: true,
      estimatedTime: 180,
      category: 'Animation'
    },
    {
      id: 'gestion_indices',
      name: 'Maîtriser la gestion des indices et l\'accompagnement',
      description: 'Doser parfaitement l\'aide apportée aux équipes',
      icon: Lightbulb,
      xp: 30,
      required: true,
      estimatedTime: 150,
      category: 'Game Master'
    },
    {
      id: 'troubleshooting',
      name: 'Résoudre les problèmes techniques et mécaniques courants',
      description: 'Diagnostiquer et réparer rapidement les dysfonctionnements',
      icon: Settings,
      xp: 25,
      required: true,
      estimatedTime: 120,
      category: 'Technique'
    },
    {
      id: 'escape_avance',
      name: 'Maîtriser 1 escape game niveau avancé',
      description: 'Gérer des mécanismes plus complexes et des scénarios élaborés',
      icon: Target,
      xp: 50,
      required: true,
      estimatedTime: 400,
      category: 'Escape Game'
    }
  ],

  taches_quotidien: [
    {
      id: 'gestion_planning',
      name: 'Gérer les plannings et réservations en autonomie',
      description: 'Optimiser l\'occupation des salles et l\'organisation des sessions',
      icon: Calendar,
      xp: 25,
      required: true,
      estimatedTime: 120,
      category: 'Planning'
    },
    {
      id: 'accueil_telephonique',
      name: 'Assurer l\'accueil téléphonique et répondre aux emails',
      description: 'Premier contact avec la clientèle, informations et réservations',
      icon: MessageSquare,
      xp: 20,
      required: true,
      estimatedTime: 90,
      category: 'Communication'
    },
    {
      id: 'gestion_caisse',
      name: 'Maîtriser la caisse et tous les modes de paiement',
      description: 'Encaissements, remboursements, gestion des écarts',
      icon: Trophy,
      xp: 25,
      required: true,
      estimatedTime: 100,
      category: 'Commercial'
    },
    {
      id: 'preparation_salles',
      name: 'Préparer et remettre en état les salles entre sessions',
      description: 'Reset complet et vérification du bon fonctionnement',
      icon: RotateCcw,
      xp: 20,
      required: true,
      estimatedTime: 90,
      category: 'Logistique'
    },
    {
      id: 'reporting_quotidien',
      name: 'Effectuer le reporting quotidien d\'activité',
      description: 'Bilan des ventes, incidents, points d\'amélioration',
      icon: FileText,
      xp: 15,
      required: true,
      estimatedTime: 45,
      category: 'Gestion'
    },
    {
      id: 'marketing_local',
      name: 'Participer aux actions marketing et communication locale',
      description: 'Réseaux sociaux, partenariats, événements promotionnels',
      icon: Star,
      xp: 20,
      required: false,
      estimatedTime: 120,
      category: 'Marketing'
    }
  ],

  soft_skills: [
    {
      id: 'communication_equipe',
      name: 'Développer une communication efficace en équipe',
      description: 'Clarté, bienveillance et assertivité dans les échanges',
      icon: Users,
      xp: 20,
      required: true,
      estimatedTime: 120,
      category: 'Communication'
    },
    {
      id: 'gestion_stress',
      name: 'Maîtriser la gestion du stress et des situations tendues',
      description: 'Techniques de respiration, lâcher-prise et gestion émotionnelle',
      icon: Heart,
      xp: 25,
      required: true,
      estimatedTime: 150,
      category: 'Bien-être'
    },
    {
      id: 'adaptation_public',
      name: 'S\'adapter à tous types de public et personnalités',
      description: 'Flexibilité relationnelle et intelligence situationnelle',
      icon: Users,
      xp: 30,
      required: true,
      estimatedTime: 180,
      category: 'Adaptabilité'
    },
    {
      id: 'leadership_positif',
      name: 'Développer un leadership positif et inspirant',
      description: 'Motiver les équipes de joueurs et créer une dynamique positive',
      icon: Trophy,
      xp: 25,
      required: true,
      estimatedTime: 150,
      category: 'Leadership'
    },
    {
      id: 'creativite_animation',
      name: 'Cultiver la créativité dans l\'animation',
      description: 'Improvisation, storytelling et création d\'ambiances uniques',
      icon: Lightbulb,
      xp: 20,
      required: true,
      estimatedTime: 120,
      category: 'Créativité'
    },
    {
      id: 'feedback_constructif',
      name: 'Maîtriser l\'art du feedback constructif',
      description: 'Donner et recevoir des retours pour progresser ensemble',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 90,
      category: 'Communication'
    }
  ],

  validation_finale: [
    {
      id: 'evaluation_pratique',
      name: 'Évaluation pratique complète multi-jeux',
      description: 'Test d\'animation sur plusieurs types de jeux en situation réelle',
      icon: Trophy,
      xp: 60,
      required: true,
      estimatedTime: 240,
      category: 'Évaluation'
    },
    {
      id: 'entretien_manager',
      name: 'Entretien de validation avec le·la manager',
      description: 'Bilan complet du parcours et validation des compétences acquises',
      icon: UserCheck,
      xp: 40,
      required: true,
      estimatedTime: 90,
      category: 'Validation'
    },
    {
      id: 'auto_evaluation',
      name: 'Auto-évaluation et définition d\'axes de progression',
      description: 'Réflexion personnelle sur les acquis et les points d\'amélioration',
      icon: Target,
      xp: 20,
      required: true,
      estimatedTime: 60,
      category: 'Réflexion'
    },
    {
      id: 'plan_developpement',
      name: 'Création du plan de développement personnel',
      description: 'Objectifs à 3 et 6 mois pour continuer à progresser',
      icon: TrendingUp,
      xp: 25,
      required: true,
      estimatedTime: 75,
      category: 'Développement'
    },
    {
      id: 'certification_brain',
      name: 'Obtention de la certification Game Master Brain',
      description: 'Reconnaissance officielle du statut de Game Master certifié',
      icon: Award,
      xp: 50,
      required: true,
      estimatedTime: 30,
      category: 'Certification'
    },
    {
      id: 'integration_finale',
      name: 'Intégration complète dans l\'équipe Brain',
      description: 'Prise de poste en autonomie totale et accueil dans la famille Brain',
      icon: Heart,
      xp: 25,
      required: true,
      estimatedTime: 60,
      category: 'Intégration'
    }
  ]
};

// 🎯 COMPOSANT FORMATION GÉNÉRALE COMPLÈTE
const FormationGeneraleComplete = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
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

  // 📝 État sans données
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">
          Formation non initialisée
        </h3>
        <p className="text-gray-400 mb-8">
          Votre profil de formation n'a pas encore été créé.
        </p>
        <button
          onClick={loadFormationData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Vérifier à nouveau
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 Header avec statistiques détaillées */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🧠 Formation Générale Brain
        </h2>
        <p className="text-gray-400 mb-6">
          Parcours d'intégration complet avec 7 phases progressives
        </p>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900/30 rounded-lg p-4 text-center border border-blue-700/30">
            <div className="text-3xl font-bold text-blue-400">{stats.completedTasks}</div>
            <div className="text-sm text-gray-400">/{stats.totalTasks} Tâches</div>
            <div className="text-xs text-blue-300 mt-1">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% complété
            </div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-4 text-center border border-green-700/30">
            <div className="text-3xl font-bold text-green-400">{stats.earnedXP}</div>
            <div className="text-sm text-gray-400">/{stats.totalXP} XP</div>
            <div className="text-xs text-green-300 mt-1">
              Points d'expérience
            </div>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-700/30">
            <div className="text-3xl font-bold text-purple-400">{stats.completedPhases}</div>
            <div className="text-sm text-gray-400">/7 Phases</div>
            <div className="text-xs text-purple-300 mt-1">
              Phases terminées
            </div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-4 text-center border border-yellow-700/30">
            <div className="text-3xl font-bold text-yellow-400">{stats.earnedBadges.length}</div>
            <div className="text-sm text-gray-400">Badges</div>
            <div className="text-xs text-yellow-300 mt-1">
              Récompenses gagnées
            </div>
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
          <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Phases de formation détaillées */}
      <div className="space-y-6">
        {Object.values(ONBOARDING_PHASES).map((phase, index) => {
          const phaseTasks = PHASE_TASKS[phase.id] || [];
          const phaseData = formationData.phases?.[phase.id];
          const isExpanded = expandedPhases.includes(phase.id);
          
          // Calculer la progression de cette phase
          const completedPhaseTasks = phaseTasks.filter(task => 
            phaseData?.tasks?.[task.id]?.completed
          ).length;
          const phaseProgress = phaseTasks.length > 0 
            ? (completedPhaseTasks / phaseTasks.length) * 100 
            : 0;
          
          const isPhaseComplete = completedPhaseTasks === phaseTasks.length;
          const isPhaseLocked = index > 0 && !isPhaseComplete && completedPhaseTasks === 0;

          // Calculer XP de la phase
          const phaseXP = phaseTasks.reduce((total, task) => total + task.xp, 0);
          const earnedPhaseXP = phaseTasks
            .filter(task => phaseData?.tasks?.[task.id]?.completed)
            .reduce((total, task) => total + task.xp, 0);

          return (
            <div 
              key={phase.id}
              className={`rounded-xl border transition-all duration-300 ${
                isPhaseComplete 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/50 shadow-lg shadow-green-500/10' 
                  : isPhaseLocked
                  ? 'bg-gray-800/30 border-gray-700/30'
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {/* En-tête de phase */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => togglePhaseExpansion(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-2xl relative`}>
                      {phase.icon}
                      {isPhaseLocked && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Lock className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      {isPhaseComplete && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center">
                        {phase.name}
                        {isPhaseComplete && (
                          <BadgeIcon className="h-5 w-5 text-yellow-400 ml-2" />
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">{phase.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-blue-400 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {completedPhaseTasks}/{phaseTasks.length} tâches
                        </span>
                        <span className="text-green-400 flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          {earnedPhaseXP}/{phaseXP} XP
                        </span>
                        <span className="text-purple-400 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          ~{phase.duration} jours
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(phaseProgress)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {isPhaseComplete ? 'Terminé' : 'En cours'}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Barre de progression de phase */}
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
                    <div 
                      className={`bg-gradient-to-r ${phase.color} h-3 rounded-full transition-all duration-700 relative overflow-hidden`}
                      style={{ width: `${phaseProgress}%` }}
                    >
                      {phaseProgress > 0 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu détaillé de la phase */}
              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-700/50 pt-6">
                    <div className="grid gap-4">
                      {phaseTasks.map((task) => {
                        const taskData = phaseData?.tasks?.[task.id];
                        const isCompleted = taskData?.completed || false;
                        const TaskIcon = task.icon;

                        return (
                          <div 
                            key={task.id}
                            className={`group flex items-start space-x-4 p-4 rounded-lg transition-all duration-200 border ${
                              isCompleted 
                                ? 'bg-green-900/20 border-green-500/30 shadow-md' 
                                : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-600/30 hover:border-gray-500/50'
                            }`}
                          >
                            {/* Checkbox et icône */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleTask(phase.id, task.id)}
                                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-400 hover:border-blue-400 hover:bg-blue-400/10'
                                }`}
                              >
                                {isCompleted && <CheckCircle className="w-5 h-5" />}
                              </button>

                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                isCompleted ? 'bg-green-500/20' : 'bg-gray-600/50'
                              }`}>
                                <TaskIcon className={`h-5 w-5 ${
                                  isCompleted ? 'text-green-400' : 'text-gray-400'
                                }`} />
                              </div>
                            </div>

                            {/* Contenu de la tâche */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-semibold text-base ${
                                    isCompleted ? 'text-green-300 line-through' : 'text-white'
                                  }`}>
                                    {task.name}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {task.description}
                                  </p>
                                  
                                  {/* Métadonnées de la tâche */}
                                  <div className="flex items-center space-x-4 mt-3">
                                    <span className="text-blue-400 text-xs bg-blue-900/30 px-2 py-1 rounded-full flex items-center">
                                      <Zap className="h-3 w-3 mr-1" />
                                      +{task.xp} XP
                                    </span>
                                    <span className="text-purple-400 text-xs bg-purple-900/30 px-2 py-1 rounded-full flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      ~{task.estimatedTime}min
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      task.category === 'Sécurité' ? 'bg-red-900/30 text-red-400' :
                                      task.category === 'Technique' ? 'bg-blue-900/30 text-blue-400' :
                                      task.category === 'Animation' ? 'bg-green-900/30 text-green-400' :
                                      task.category === 'Service Client' ? 'bg-purple-900/30 text-purple-400' :
                                      'bg-gray-900/30 text-gray-400'
                                    }`}>
                                      {task.category}
                                    </span>
                                    {task.required && (
                                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                                        Obligatoire
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Date de completion */}
                                {isCompleted && taskData?.completionDate && (
                                  <div className="text-right ml-4">
                                    <div className="text-xs text-green-400 font-medium">Complété</div>
                                    <div className="text-xs text-gray-400">
                                      {new Date(taskData.completionDate).toLocaleDateString('fr-FR')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Badge de phase */}
                    {isPhaseComplete && phase.badge && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl border border-yellow-500/30">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-yellow-400">🏆 Badge débloqué !</div>
                            <div className="text-lg text-yellow-300 font-medium">{phase.badge}</div>
                            <div className="text-sm text-yellow-200/80">
                              Félicitations ! Vous avez terminé la phase "{phase.name}"
                            </div>
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

      {/* 🏆 Actions et résumé final */}
      <div className="mt-8 space-y-6">
        <div className="text-center">
          <button
            onClick={loadFormationData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="h-5 w-5 inline mr-2" />
            Actualiser ma progression
          </button>
        </div>
        
        {/* Message de félicitations si terminé */}
        {stats.completedPhases === 7 && (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-8 border border-green-500/30 text-center">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              🎉 FÉLICITATIONS ! 🎉
            </h3>
            <p className="text-green-300 text-lg mb-4">
              Vous avez terminé toute la formation générale Brain !<br/>
              Vous êtes maintenant un·e <strong>Game Master certifié·e Brain</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.totalTasks}</div>
                <div className="text-blue-300">Tâches accomplies</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{stats.totalXP}</div>
                <div className="text-green-300">Points d'expérience</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.earnedBadges.length}</div>
                <div className="text-yellow-300">Badges débloqués</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎯 COMPOSANTS AUTRES SECTIONS (inchangés)
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
                7 phases complètes avec 38 tâches détaillées
              </p>
              <div className="mt-2 text-xs opacity-60">
                💡 7 phases • 🏆 Badges • ⭐ 710 XP • ✅ Toggle tasks
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
          {activeSection === 'formation' && <FormationGeneraleComplete />}
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
