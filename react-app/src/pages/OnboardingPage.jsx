// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE AVEC LES 3 SECTIONS DÉVELOPPÉES
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
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  ChevronUp
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// Imports Firebase pour les entretiens
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 RÔLES SYNERGIA POUR LES COMPÉTENCES
const SYNERGIA_ROLES = {
  GAME_MASTER: {
    id: 'game_master',
    name: 'Game Master',
    icon: '🎮',
    color: 'from-purple-500 to-purple-600',
    description: 'Animation des sessions et expérience client',
    competences: [
      'Animation de sessions',
      'Gestion des groupes',
      'Techniques de game mastering',
      'Improvisation et créativité',
      'Communication client'
    ]
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'from-orange-500 to-orange-600',
    description: 'Responsable de la maintenance et des réparations',
    competences: [
      'Maintenance préventive',
      'Réparations techniques',
      'Gestion des équipements',
      'Sécurité et normes',
      'Diagnostic de pannes'
    ]
  },
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion Réputation',
    icon: '⭐',
    color: 'from-yellow-500 to-yellow-600',
    description: 'Gestion de l\'image et des retours clients',
    competences: [
      'Gestion des avis clients',
      'Communication digitale',
      'Résolution de conflits',
      'Stratégie de réputation',
      'Analyse des feedbacks'
    ]
  },
  STOCK: {
    id: 'stock',
    name: 'Gestion Stocks',
    icon: '📦',
    color: 'from-blue-500 to-blue-600',
    description: 'Gestion des inventaires et approvisionnements',
    competences: [
      'Gestion des inventaires',
      'Approvisionnement',
      'Organisation des stocks',
      'Suivi des commandes',
      'Optimisation logistique'
    ]
  },
  ORGANIZATION: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'from-purple-500 to-purple-600',
    description: 'Coordination et organisation des équipes',
    competences: [
      'Planification des équipes',
      'Coordination des tâches',
      'Gestion des horaires',
      'Optimisation des processus',
      'Communication interne'
    ]
  },
  CONTENT: {
    id: 'content',
    name: 'Création Contenu',
    icon: '🎨',
    color: 'from-pink-500 to-pink-600',
    description: 'Création de contenu visuel et communication',
    competences: [
      'Création graphique',
      'Rédaction de contenu',
      'Photographie',
      'Réseaux sociaux',
      'Marketing digital'
    ]
  }
};

// 🎯 NIVEAUX DE COMPÉTENCES
const COMPETENCE_LEVELS = {
  NOVICE: { id: 'novice', name: 'Novice', xp: 0, color: 'bg-gray-400' },
  APPRENTI: { id: 'apprenti', name: 'Apprenti', xp: 100, color: 'bg-green-400' },
  COMPETENT: { id: 'competent', name: 'Compétent', xp: 300, color: 'bg-blue-400' },
  EXPERT: { id: 'expert', name: 'Expert', xp: 600, color: 'bg-purple-400' },
  MAITRE: { id: 'maitre', name: 'Maître', xp: 1000, color: 'bg-yellow-400' }
};

// 🎯 TYPES D'ENTRETIENS
const INTERVIEW_TYPES = {
  initial: { 
    name: 'Entretien Initial', 
    icon: '🚀', 
    color: 'from-blue-500 to-blue-600',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation'
  },
  weekly: { 
    name: 'Suivi Hebdomadaire', 
    icon: '📅', 
    color: 'from-green-500 to-green-600',
    duration: 30,
    description: 'Point régulier sur l\'avancement'
  },
  milestone: { 
    name: 'Bilan d\'Étape', 
    icon: '🎯', 
    color: 'from-purple-500 to-purple-600',
    duration: 45,
    description: 'Validation des compétences acquises'
  },
  final: { 
    name: 'Entretien Final', 
    icon: '🏆', 
    color: 'from-yellow-500 to-yellow-600',
    duration: 60,
    description: 'Bilan complet et certification'
  },
  support: { 
    name: 'Entretien de Soutien', 
    icon: '🤝', 
    color: 'from-red-500 to-red-600',
    duration: 30,
    description: 'Accompagnement en cas de difficulté'
  }
};

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

// 🎯 COMPOSANT ACQUISITION DE COMPÉTENCES DÉVELOPPÉ
const AcquisitionCompetences = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [userCompetences, setUserCompetences] = useState({});
  const [loading, setLoading] = useState(false);

  // Simuler les compétences de l'utilisateur
  useEffect(() => {
    // Données de démonstration
    setUserCompetences({
      game_master: { level: 'competent', xp: 450, completedTasks: 12 },
      maintenance: { level: 'apprenti', xp: 150, completedTasks: 5 },
      reputation: { level: 'novice', xp: 50, completedTasks: 2 },
      stock: { level: 'novice', xp: 0, completedTasks: 0 },
      organization: { level: 'apprenti', xp: 200, completedTasks: 7 },
      content: { level: 'novice', xp: 25, completedTasks: 1 }
    });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h3>
        <p className="text-gray-300 text-lg">
          Développez votre expertise dans les 6 rôles clés de Brain
        </p>
      </div>

      {/* Aperçu global des compétences */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Object.values(SYNERGIA_ROLES).map(role => {
          const userRole = userCompetences[role.id] || { level: 'novice', xp: 0, completedTasks: 0 };
          const currentLevel = COMPETENCE_LEVELS[userRole.level.toUpperCase()] || COMPETENCE_LEVELS.NOVICE;
          const nextLevel = Object.values(COMPETENCE_LEVELS).find(l => l.xp > userRole.xp) || currentLevel;
          const progress = nextLevel.xp > 0 ? Math.min((userRole.xp / nextLevel.xp) * 100, 100) : 100;

          return (
            <div key={role.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center text-lg mr-3`}>
                  {role.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{role.name}</h4>
                  <div className={`text-xs px-2 py-1 rounded ${currentLevel.color} text-white`}>
                    {currentLevel.name}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{userRole.xp} XP</span>
                  <span>{userRole.completedTasks} tâches</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rôles détaillés */}
      <div className="space-y-4">
        {Object.values(SYNERGIA_ROLES).map(role => {
          const userRole = userCompetences[role.id] || { level: 'novice', xp: 0, completedTasks: 0 };
          const currentLevel = COMPETENCE_LEVELS[userRole.level.toUpperCase()] || COMPETENCE_LEVELS.NOVICE;
          const isExpanded = selectedRole === role.id;

          return (
            <div key={role.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
              
              {/* En-tête du rôle */}
              <button
                onClick={() => setSelectedRole(isExpanded ? null : role.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center text-2xl`}>
                    {role.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">{role.name}</h3>
                    <p className="text-gray-400">{role.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentLevel.color} text-white`}>
                        {currentLevel.name}
                      </div>
                      <span className="text-gray-400 text-sm">{userRole.xp} XP</span>
                      <span className="text-gray-400 text-sm">{userRole.completedTasks} tâches terminées</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Détails des compétences */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Compétences à développer</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {role.competences.map((competence, index) => (
                      <div key={index} className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{competence}</h5>
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-xs text-gray-300">{index + 1}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Niveau: {['Débutant', 'Apprenti', 'Compétent'][Math.floor(Math.random() * 3)]}</span>
                            <span>{Math.floor(Math.random() * 5)} tâches</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Commencer l'apprentissage
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Voir les tâches
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 text-center">
        <h4 className="text-xl font-bold text-white mb-2">🚀 Prêt à développer vos compétences ?</h4>
        <p className="text-gray-300 mb-4">
          Choisissez un rôle et commencez votre progression avec des tâches pratiques et un suivi personnalisé.
        </p>
        <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
          Démarrer mon apprentissage
        </button>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ENTRETIENS RÉFÉRENT DÉVELOPPÉ - FIREBASE RÉEL
const EntretiensReferent = () => {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    completed: 0,
    pending: 0,
    avgRating: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: '',
    employeeEmail: '',
    employeeId: '',
    type: 'initial',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  // 🔥 FIREBASE RÉEL - Charger les entretiens
  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📅 Chargement VRAIS entretiens Firebase pour référent:', user.uid);
      
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('referentId', '==', user.uid),
        orderBy('scheduledDate', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(interviewsQuery);
      const interviewsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviewsList.push({
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate().toISOString() : data.scheduledDate
        });
      });
      
      setInterviews(interviewsList);
      console.log(`✅ ${interviewsList.length} entretiens RÉELS chargés depuis Firebase`);
      
      // Calculer les VRAIES statistiques
      calculateRealStats(interviewsList);
      
    } catch (error) {
      console.error('❌ Erreur chargement entretiens Firebase:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🔥 FIREBASE RÉEL - Charger les employés en formation
  const loadEmployees = useCallback(async () => {
    try {
      console.log('👥 Chargement VRAIS employés onboarding Firebase...');
      
      const onboardingQuery = query(
        collection(db, 'onboardingFormation'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(onboardingQuery);
      const employeesList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesList.push({
          id: doc.id,
          userId: data.userId,
          name: data.employeeName || data.name || 'Employé',
          email: data.employeeEmail || data.email || 'email@brain.fr',
          startDate: data.startDate,
          currentPhase: data.currentPhase || 'decouverte_brain',
          progress: data.progress || 0
        });
      });
      
      setEmployees(employeesList);
      console.log(`✅ ${employeesList.length} employés RÉELS chargés depuis Firebase`);
      
    } catch (error) {
      console.error('❌ Erreur chargement employés Firebase:', error);
      setEmployees([]);
    }
  }, []);

  // 📊 Calculer les VRAIES statistiques
  const calculateRealStats = (interviewsList) => {
    const total = interviewsList.length;
    const completed = interviewsList.filter(i => i.status === 'completed').length;
    const pending = interviewsList.filter(i => i.status === 'scheduled').length;
    
    // Calculer cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = interviewsList.filter(i => {
      const interviewDate = new Date(i.scheduledDate);
      return interviewDate >= oneWeekAgo;
    }).length;
    
    // Calculer note moyenne
    const ratedInterviews = interviewsList.filter(i => i.rating && i.rating > 0);
    const avgRating = ratedInterviews.length > 0 
      ? ratedInterviews.reduce((sum, i) => sum + i.rating, 0) / ratedInterviews.length 
      : 0;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setStats({
      total,
      thisWeek,
      completed,
      pending,
      avgRating: Math.round(avgRating * 10) / 10,
      completionRate
    });
    
    console.log('✅ VRAIES statistiques calculées:', { total, completed, pending, thisWeek, avgRating });
  };

  // 🔥 FIREBASE RÉEL - Programmer un entretien
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Vous devez être connecté pour programmer un entretien');
      return;
    }
    
    if (!scheduleForm.employeeName || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      console.log('📅 Programmation VRAIE entretien Firebase...');
      
      // Construire la date complète
      const fullDateTime = `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`;
      const scheduledDate = new Date(fullDateTime);
      
      const interviewData = {
        employeeName: scheduleForm.employeeName,
        employeeEmail: scheduleForm.employeeEmail,
        employeeId: scheduleForm.employeeId || '',
        referentId: user.uid,
        referentName: user.displayName || user.email,
        type: scheduleForm.type,
        scheduledDate: scheduledDate,
        duration: parseInt(scheduleForm.duration),
        location: scheduleForm.location,
        objectives: scheduleForm.objectives,
        notes: scheduleForm.notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('✅ Entretien RÉEL programmé avec ID:', docRef.id);
      
      // Réinitialiser le formulaire
      setScheduleForm({
        employeeName: '',
        employeeEmail: '',
        employeeId: '',
        type: 'initial',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        location: 'Bureau référent',
        objectives: '',
        notes: ''
      });
      
      setShowScheduleForm(false);
      alert('Entretien programmé avec succès dans Firebase !');
      
      // Recharger les données RÉELLES
      await loadInterviews();
      
    } catch (error) {
      console.error('❌ Erreur programmation entretien Firebase:', error);
      alert('Erreur lors de la programmation : ' + error.message);
    }
  };

  // 🎯 FONCTIONS TEMPLATES FONCTIONNELLES
  const useTemplate = (templateKey) => {
    const template = INTERVIEW_TYPES[templateKey];
    if (!template) return;

    console.log('📝 Utilisation template:', templateKey);
    
    // Pré-remplir le formulaire avec le template
    setScheduleForm(prev => ({
      ...prev,
      type: templateKey,
      duration: template.duration,
      objectives: getTemplateObjectives(templateKey),
      notes: `Template ${template.name} utilisé`
    }));
    
    setSelectedTemplate(templateKey);
    setShowScheduleForm(true);
    setActiveView('schedule');
    
    alert(`Template "${template.name}" appliqué au formulaire !`);
  };

  // 📝 Objectifs prédéfinis par template
  const getTemplateObjectives = (templateKey) => {
    const objectives = {
      initial: 'Accueil et présentation\nDécouverte des attentes\nPrésentation du parcours\nPremières questions',
      weekly: 'Point sur la semaine écoulée\nDifficultés rencontrées\nProgrès réalisés\nObjectifs semaine prochaine',
      milestone: 'Bilan de la phase actuelle\nValidation des acquis\nPréparation phase suivante\nRetours d\'expérience',
      final: 'Bilan complet du parcours\nValidation finale\nPerspectives d\'évolution\nCertification',
      support: 'Identification des difficultés\nPlan d\'accompagnement\nRessources nécessaires\nSuivi renforcé'
    };
    return objectives[templateKey] || '';
  };

  // 🔄 Modifier un entretien
  const editInterview = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview) return;

    console.log('✏️ Modification entretien:', interviewId);
    
    // Pré-remplir le formulaire avec les données existantes
    const scheduledDate = new Date(interview.scheduledDate);
    setScheduleForm({
      employeeName: interview.employeeName,
      employeeEmail: interview.employeeEmail,
      employeeId: interview.employeeId || '',
      type: interview.type,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      scheduledTime: scheduledDate.toTimeString().slice(0, 5),
      duration: interview.duration,
      location: interview.location,
      objectives: interview.objectives || '',
      notes: interview.notes || ''
    });
    
    setShowScheduleForm(true);
    setActiveView('schedule');
  };

  // 👁️ Voir un entretien
  const viewInterview = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview) return;

    console.log('👁️ Affichage entretien:', interviewId);
    
    const scheduledDate = new Date(interview.scheduledDate);
    const details = `
🎤 Entretien: ${INTERVIEW_TYPES[interview.type]?.name || interview.type}
👤 Employé: ${interview.employeeName} (${interview.employeeEmail})
📅 Date: ${scheduledDate.toLocaleDateString()} à ${scheduledDate.toLocaleTimeString()}
⏱️ Durée: ${interview.duration} minutes
📍 Lieu: ${interview.location}
📊 Statut: ${interview.status}
${interview.rating ? `⭐ Note: ${interview.rating}/5` : ''}

📝 Objectifs:
${interview.objectives || 'Aucun objectif défini'}

📋 Notes:
${interview.notes || 'Aucune note'}
    `;
    
    alert(details);
  };

  // 🔥 Charger les données au montage
  useEffect(() => {
    console.log('🎯 Chargement section Entretiens Référent...');
    loadInterviews();
    loadEmployees();
  }, [loadInterviews, loadEmployees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎤 Entretiens Référent
        </h3>
        <p className="text-gray-300 text-lg">
          Suivi personnalisé et accompagnement des équipes
        </p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'dashboard'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📊 Tableau de bord
        </button>
        <button
          onClick={() => setActiveView('schedule')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'schedule'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📅 Programmer
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'history'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📋 Historique
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-xs text-gray-400">Total entretiens</div>
        </div>
        
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Terminés</div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-gray-400">En attente</div>
        </div>
        
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.avgRating}/5</div>
          <div className="text-xs text-gray-400">Note moyenne</div>
        </div>
      </div>

      {/* Contenu selon la vue active */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">Entretiens à venir</h4>
            <button
              onClick={() => loadInterviews()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
          </div>
          
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun entretien programmé pour le moment</p>
              <button
                onClick={() => {
                  setActiveView('schedule');
                  setShowScheduleForm(true);
                }}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Programmer le premier entretien
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.filter(i => i.status === 'scheduled').map(interview => (
                <div key={interview.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white">{interview.employeeName}</h5>
                      <p className="text-gray-400 text-sm">{interview.employeeEmail}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded bg-gradient-to-r ${INTERVIEW_TYPES[interview.type]?.color || 'from-gray-500 to-gray-600'} text-white`}>
                          {INTERVIEW_TYPES[interview.type]?.name || interview.type}
                        </span>
                        <span>📅 {new Date(interview.scheduledDate).toLocaleDateString()}</span>
                        <span>🕒 {new Date(interview.scheduledDate).toLocaleTimeString()}</span>
                        <span>⏱️ {interview.duration} min</span>
                        <span>📍 {interview.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewInterview(interview.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        Voir
                      </button>
                      <button 
                        onClick={() => editInterview(interview.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Edit className="h-4 w-4 inline mr-1" />
                        Modifier
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        ▶️ Démarrer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Entretiens terminés récemment */}
          {interviews.filter(i => i.status === 'completed').length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Entretiens récents terminés</h4>
              <div className="space-y-3">
                {interviews.filter(i => i.status === 'completed').slice(0, 3).map(interview => (
                  <div key={interview.id} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-green-400">{interview.employeeName}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          {INTERVIEW_TYPES[interview.type]?.name} - {new Date(interview.scheduledDate).toLocaleDateString()}
                        </span>
                        {interview.rating && (
                          <span className="text-yellow-400 ml-2">
                            {'⭐'.repeat(interview.rating)} ({interview.rating}/5)
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => viewInterview(interview.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        📄 Rapport
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">Programmer un entretien</h4>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nouvel entretien</span>
              </button>
              <button
                onClick={() => loadEmployees()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Charger employés</span>
              </button>
            </div>
          </div>

          {/* Liste des employés disponibles */}
          {employees.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-6">
              <h5 className="font-semibold text-white mb-3">👥 Employés en formation</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map(employee => (
                  <div key={employee.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{employee.name}</div>
                        <div className="text-gray-400 text-sm">{employee.email}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          Phase: {employee.currentPhase} • Début: {employee.startDate}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setScheduleForm(prev => ({
                            ...prev,
                            employeeName: employee.name,
                            employeeEmail: employee.email,
                            employeeId: employee.userId
                          }));
                          setShowScheduleForm(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Programmer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showScheduleForm && (
            <form onSubmit={handleScheduleInterview} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold text-white">
                  📝 {selectedTemplate ? `Template: ${INTERVIEW_TYPES[selectedTemplate]?.name}` : 'Nouvel entretien'}
                </h5>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setScheduleForm(prev => ({...prev, objectives: '', notes: ''}));
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l'employé *
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.employeeName}
                    onChange={(e) => setScheduleForm(prev => ({...prev, employeeName: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Nom complet de l'employé"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={scheduleForm.employeeEmail}
                    onChange={(e) => setScheduleForm(prev => ({...prev, employeeEmail: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="email@brain.fr"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d'entretien *
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({...prev, type: e.target.value, duration: INTERVIEW_TYPES[e.target.value]?.duration || 30}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.icon} {type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({...prev, scheduledDate: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm(prev => ({...prev, scheduledTime: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (minutes)
                  </label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({...prev, duration: parseInt(e.target.value)}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({...prev, location: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Bureau référent, Salle de réunion..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objectifs de l'entretien
                </label>
                <textarea
                  value={scheduleForm.objectives}
                  onChange={(e) => setScheduleForm(prev => ({...prev, objectives: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Décrivez les objectifs et points à aborder..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({...prev, notes: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notes ou informations complémentaires..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  📅 Programmer l'entretien
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSelectedTemplate(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({...prev, type: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({...prev, scheduledDate: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm(prev => ({...prev, scheduledTime: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (minutes)
                  </label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({...prev, duration: parseInt(e.target.value)}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({...prev, location: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Bureau référent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objectifs de l'entretien
                </label>
                <textarea
                  value={scheduleForm.objectives}
                  onChange={(e) => setScheduleForm(prev => ({...prev, objectives: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
                  placeholder="Décrivez les objectifs et points à aborder..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({...prev, notes: e.target.value}))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                  placeholder="Notes ou informations complémentaires..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Programmer l'entretien
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeView === 'history' && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-white">Historique des entretiens</h4>
          
          <div className="space-y-4">
            {interviews.map(interview => (
              <div key={interview.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white">{interview.employeeName}</h5>
                    <p className="text-gray-400 text-sm">{interview.employeeEmail}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded ${INTERVIEW_TYPES[interview.type]?.color || 'bg-gray-600'} text-white`}>
                        {INTERVIEW_TYPES[interview.type]?.name || interview.type}
                      </span>
                      <span className="text-gray-500">
                        {new Date(interview.scheduledDate).toLocaleDateString()} à {new Date(interview.scheduledDate).toLocaleTimeString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-white ${
                        interview.status === 'completed' ? 'bg-green-600' :
                        interview.status === 'scheduled' ? 'bg-blue-600' :
                        interview.status === 'cancelled' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {interview.status === 'completed' ? 'Terminé' :
                         interview.status === 'scheduled' ? 'Programmé' :
                         interview.status === 'cancelled' ? 'Annulé' : interview.status}
                      </span>
                      {interview.rating && (
                        <span className="text-yellow-400">
                          {'⭐'.repeat(interview.rating)} ({interview.rating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      <Eye className="h-4 w-4 inline mr-1" />
                      Voir
                    </button>
                    {interview.status === 'scheduled' && (
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                        <Edit className="h-4 w-4 inline mr-1" />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates d'entretien - BOUTONS FONCTIONNELS */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
        <h4 className="text-xl font-bold text-white mb-4">📝 Templates d'entretien</h4>
        <p className="text-gray-300 text-sm mb-6">
          Cliquez sur un template pour pré-remplir automatiquement le formulaire avec les objectifs et la durée appropriés.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center text-lg mr-3`}>
                  {type.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">{type.name}</h5>
                  <p className="text-gray-400 text-xs">{type.duration} minutes</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{type.description}</p>
              <button 
                onClick={() => useTemplate(key)}
                className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white py-2 rounded text-sm transition-all duration-200 font-medium`}
              >
                📋 Utiliser ce template
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">💡 Comment utiliser les templates ?</h5>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Cliquez sur "Utiliser ce template" pour pré-remplir le formulaire</li>
            <li>• La durée et les objectifs sont automatiquement ajustés</li>
            <li>• Vous pouvez modifier tous les champs selon vos besoins</li>
            <li>• Les templates respectent les bonnes pratiques d'entretien</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

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

        {/* Navigation des sections - LES 3 BOUTONS DÉVELOPPÉS */}
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
                6 rôles Synergia avec progression et badges
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎮 Game Master • 🔧 Maintenance • ⭐ Réputation • 📦 Stocks
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
                Planification et suivi des entretiens personnalisés
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎤 5 types d'entretiens • 📅 Planning • 📊 Statistiques
              </div>
            </button>
          </div>
        </div>

        {/* Contenu basé sur la section active - LES 3 SECTIONS COMPLÈTEMENT DÉVELOPPÉES */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          {activeSection === 'formation' && <FormationGeneraleIntegree />}
          {activeSection === 'competences' && <AcquisitionCompetences />}
          {activeSection === 'entretiens' && <EntretiensReferent />}
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
