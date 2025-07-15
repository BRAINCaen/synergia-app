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
  Tool,
  Sparkles
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { onboardingService } from '../../core/services/onboardingService.js';

// 🎯 PHASES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
    duration: 2,
    color: 'from-purple-500 to-pink-500',
    icon: Lightbulb,
    xpTotal: 50,
    badge: 'Bienvenue chez Brain !',
    order: 1
  },
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'L\'objectif : maîtriser toutes les étapes du parcours client·e, de l\'accueil à la sortie.',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: Users,
    xpTotal: 80,
    badge: 'Ambassadeur·rice Brain',
    order: 2
  },
  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Pour assurer la sécurité et la qualité, tu dois être à l\'aise avec les procédures et le matériel.',
    duration: 3,
    color: 'from-orange-500 to-red-500',
    icon: Shield,
    xpTotal: 100,
    badge: 'Gardien·ne du Temple',
    order: 3
  },
  FORMATION_EXPERIENCE: {
    id: 'formation_experience',
    name: '🔎 Formation par expérience',
    description: 'Pour chaque salle ou expérience, tu vas valider plusieurs étapes pour devenir expert·e.',
    duration: 12,
    color: 'from-green-500 to-emerald-500',
    icon: Gamepad2,
    xpTotal: 120,
    badge: 'Expert·e [Salle/Jeu]',
    order: 4
  },
  TACHES_QUOTIDIEN: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Être Game Master, c\'est aussi garantir la qualité du quotidien pour tou·te·s.',
    duration: 5,
    color: 'from-cyan-500 to-blue-500',
    icon: Tool,
    xpTotal: 90,
    badge: 'Pilier du Quotidien',
    order: 5
  },
  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & communication',
    description: 'Ici, tu développes tes qualités humaines et ta capacité à t\'adapter à toutes les situations.',
    duration: 7,
    color: 'from-pink-500 to-rose-500',
    icon: Heart,
    xpTotal: 70,
    badge: 'Esprit Brain',
    order: 6
  },
  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration',
    description: 'C\'est le moment de valider tout ton parcours et de célébrer ton arrivée dans la team Brain !',
    duration: 2,
    color: 'from-violet-500 to-purple-500',
    icon: Trophy,
    xpTotal: 200,
    badge: 'Game Master certifié·e Brain',
    order: 7
  }
};

// 📋 TÂCHES PAR PHASE
const PHASE_TASKS = {
  decouverte_brain: [
    {
      id: 'accueil_officiel',
      name: 'Participer à ton accueil officiel et faire le tour des locaux',
      icon: Building,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'charte_reglement',
      name: 'Lire la charte, le règlement intérieur et l\'histoire de Brain',
      icon: FileText,
      xp: 8,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'decouverte_equipe',
      name: 'Découvrir les membres de l\'équipe (photos, rôles, anecdotes)',
      icon: Users,
      xp: 5,
      required: true,
      estimatedTime: 15
    },
    {
      id: 'organigramme',
      name: 'Comprendre l\'organigramme : qui fait quoi chez Brain ?',
      icon: Target,
      xp: 7,
      required: true,
      estimatedTime: 20
    },
    {
      id: 'outils_internes',
      name: 'Prendre connaissance des outils internes (messagerie, email, planning, réservations)',
      icon: Settings,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'canaux_communication',
      name: 'T\'abonner aux canaux de communication interne',
      icon: MessageSquare,
      xp: 5,
      required: true,
      estimatedTime: 10
    },
    {
      id: 'presentation_equipe',
      name: 'Te présenter à l\'équipe (en live ou par message)',
      icon: UserCheck,
      xp: 5,
      required: true,
      estimatedTime: 15
    }
  ],
  
  parcours_client: [
    {
      id: 'observer_accueil',
      name: 'Observer l\'accueil client·e avec un·e Game Master expérimenté·e',
      icon: Eye,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'observer_briefing',
      name: 'Observer un briefing client·e (Escape et Quiz Game)',
      icon: FileText,
      xp: 12,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'comprendre_parcours',
      name: 'Comprendre le parcours client·e type (accueil, briefing, jeu, débriefing)',
      icon: Target,
      xp: 10,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'accueil_duo',
      name: 'Participer à un accueil en duo',
      icon: Users,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'briefing_fictif',
      name: 'Faire un briefing client·e fictif (jeu de rôle)',
      icon: Play,
      xp: 12,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'debriefing_client',
      name: 'Participer à un débriefing client·e',
      icon: MessageSquare,
      xp: 8,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'notes_session',
      name: 'Prendre des notes sur une session réelle',
      icon: FileText,
      xp: 5,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'retour_experience',
      name: 'Rédiger un retour d\'expérience (points forts & axes d\'amélioration)',
      icon: Sparkles,
      xp: 3,
      required: true,
      estimatedTime: 30
    }
  ],
  
  securite_procedures: [
    {
      id: 'consignes_securite',
      name: 'Lire et comprendre les consignes de sécurité (incendie, évacuation, premiers secours)',
      icon: AlertCircle,
      xp: 15,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'equipements_securite',
      name: 'Repérer tous les équipements de sécurité (extincteurs, issues de secours…)',
      icon: Shield,
      xp: 10,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'procedures_urgence',
      name: 'Comprendre les procédures d\'urgence (coupure courant, alarme, incidents)',
      icon: AlertCircle,
      xp: 15,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'outils_techniques',
      name: 'Prendre en main les outils techniques (caméras, micros, écrans, effets spéciaux)',
      icon: Settings,
      xp: 20,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'reset_salle',
      name: 'Apprendre à faire un reset complet d\'une salle',
      icon: RotateCcw,
      xp: 15,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gestion_materiel',
      name: 'Connaître la gestion du matériel (cadenas, accessoires, maintenance de base)',
      icon: Tool,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'ouverture_fermeture',
      name: 'Réaliser une procédure d\'ouverture/fermeture complète sous supervision',
      icon: Key,
      xp: 10,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'etat_lieux',
      name: 'Faire un état des lieux avant/après chaque session',
      icon: CheckCircle,
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
      id: 'preparer_salle',
      name: 'Préparer une salle avant session (reset, check matériel)',
      icon: Settings,
      xp: 12,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'verifier_stocks',
      name: 'Vérifier et réapprovisionner les stocks (consommables, accessoires)',
      icon: CheckCircle,
      xp: 10,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'nettoyer_entretenir',
      name: 'Nettoyer et entretenir les espaces client·e·s et staff',
      icon: Sparkles,
      xp: 8,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'gerer_caisse',
      name: 'Gérer la caisse, les consommations et le bar',
      icon: Coffee,
      xp: 12,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'outils_numeriques',
      name: 'Utiliser les outils numériques (gestion des réservations, mails, rapports d\'activité)',
      icon: Settings,
      xp: 15,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'ouverture_fermeture_autonome',
      name: 'Effectuer une ouverture/fermeture complète en binôme, puis en autonomie',
      icon: Key,
      xp: 18,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'objets_trouves',
      name: 'Gérer les objets trouvés, le rangement et la propreté',
      icon: Target,
      xp: 8,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'rapport_journalier',
      name: 'Remplir un rapport journalier ou un carnet de bord',
      icon: FileText,
      xp: 7,
      required: true,
      estimatedTime: 15
    }
  ],
  
  soft_skills: [
    {
      id: 'formation_communication',
      name: 'Participer à une formation ou un jeu de rôle sur la communication (gestion de client·e difficile)',
      icon: MessageSquare,
      xp: 15,
      required: true,
      estimatedTime: 120
    },
    {
      id: 'situation_delicate',
      name: 'Observer ou gérer une situation client·e délicate',
      icon: AlertCircle,
      xp: 12,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'feedback_collegue',
      name: 'Donner et recevoir du feedback avec un·e collègue',
      icon: Users,
      xp: 10,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'proposer_amelioration',
      name: 'Proposer une amélioration ou une idée pour l\'équipe',
      icon: Lightbulb,
      xp: 8,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'bilan_personnel',
      name: 'Réaliser un bilan personnel chaque semaine (auto-évaluation rapide)',
      icon: FileText,
      xp: 5,
      required: true,
      estimatedTime: 15
    },
    {
      id: 'prendre_initiative',
      name: 'Prendre l\'initiative sur une tâche (dépanner un·e collègue, animer un moment convivial…)',
      icon: Heart,
      xp: 20,
      required: true,
      estimatedTime: 60
    }
  ],
  
  validation_finale: [
    {
      id: 'session_autonome',
      name: 'Réaliser une session complète (accueil, briefing, gestion, débriefing, reset) en autonomie sous validation',
      icon: Trophy,
      xp: 80,
      required: true,
      estimatedTime: 240
    },
    {
      id: 'synthese_parcours',
      name: 'Présenter une synthèse de ton parcours à un·e manager ou référent·e',
      icon: FileText,
      xp: 30,
      required: true,
      estimatedTime: 60
    },
    {
      id: 'retour_experience_final',
      name: 'Faire un retour d\'expérience (écrit ou oral)',
      icon: MessageSquare,
      xp: 20,
      required: true,
      estimatedTime: 45
    },
    {
      id: 'validation_finale',
      name: 'Obtenir la validation finale',
      icon: CheckCircle,
      xp: 40,
      required: true,
      estimatedTime: 30
    },
    {
      id: 'celebration',
      name: 'Célébrer ton intégration officielle avec l\'équipe !',
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
        console.error('❌ Échec création profil formation');
        alert('Erreur lors de la création du profil de formation');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation formation:', error);
      alert('Erreur lors de l\'initialisation du profil de formation');
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
      const phaseData = data.phases?.[phaseId] || {};
      
      totalTasks += phaseTasks.length;
      
      let phaseCompletedTasks = 0;
      phaseTasks.forEach(task => {
        totalXP += task.xp;
        if (phaseData.tasks?.[task.id]?.completed) {
          completedTasks++;
          phaseCompletedTasks++;
          earnedXP += task.xp;
        }
      });
      
      // Vérifier si la phase est complète
      if (phaseCompletedTasks === phaseTasks.length) {
        completedPhases++;
        const phase = ONBOARDING_PHASES[phaseId];
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

  // Effet de chargement initial
  useEffect(() => {
    loadFormationData();
  }, [loadFormationData]);

  // 🎨 Rendu du composant principal
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Chargement de ta formation...</span>
      </div>
    );
  }

  if (!formationData) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800 rounded-lg p-8">
          <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">
            🧠 Ton Parcours d'Intégration Game Master chez Brain
          </h3>
          <p className="text-gray-400 mb-6">
            Prêt·e à commencer ton aventure de formation ? <br/>
            1 mois de parcours avec XP, badges et certification !
          </p>
          <button
            onClick={initializeFormationProfile}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            🚀 Commencer ma Formation
          </button>
        </div>
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
            <span>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
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
              const phaseData = formationData.phases?.[phase.id] || {};
              const phaseTasks = PHASE_TASKS[phase.id] || [];
              const completedTasks = phaseTasks.filter(task => 
                phaseData.tasks?.[task.id]?.completed
              ).length;
              const isCompleted = completedTasks === phaseTasks.length;
              const IconComponent = phase.icon;
              
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    activePhase === phase.id
                      ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                      : isCompleted
                      ? 'bg-green-900 text-green-100 hover:bg-green-800'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="h-5 w-5" />
                    {isCompleted && <CheckCircle className="h-4 w-4" />}
                  </div>
                  
                  <div className="text-sm font-medium mb-1">
                    {phase.name}
                  </div>
                  
                  <div className="text-xs opacity-80">
                    {completedTasks}/{phaseTasks.length} tâches
                  </div>
                  
                  <div className="text-xs opacity-80">
                    {phase.duration} jour{phase.duration > 1 ? 's' : ''}
                  </div>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* 📋 Tâches de la phase active */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {ONBOARDING_PHASES[activePhase]?.name}
            </h3>
            <p className="text-gray-400 mt-1">
              {ONBOARDING_PHASES[activePhase]?.description}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-purple-400">
              +{ONBOARDING_PHASES[activePhase]?.xpTotal} XP
            </div>
            <div className="text-sm text-gray-400">
              🏅 {ONBOARDING_PHASES[activePhase]?.badge}
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-3">
          {(PHASE_TASKS[activePhase] || []).map(task => {
            const taskData = formationData.phases?.[activePhase]?.tasks?.[task.id] || {};
            const isCompleted = taskData.completed;
            const IconComponent = task.icon;
            
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isCompleted 
                    ? 'bg-green-900 border-green-500' 
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => toggleTask(activePhase, task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3 flex-shrink-0" />
                    )}
                    
                    <IconComponent className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        isCompleted ? 'text-green-100' : 'text-white'
                      }`}>
                        {task.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-blue-400">
                          +{task.xp} XP
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.estimatedTime} min
                        </span>
                        {task.required && (
                          <span className="text-xs text-red-400">
                            Obligatoire
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <BadgeIcon className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progression de la phase */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Progression de cette phase</span>
            <span>
              {(PHASE_TASKS[activePhase] || []).filter(task => 
                formationData.phases?.[activePhase]?.tasks?.[task.id]?.completed
              ).length} / {(PHASE_TASKS[activePhase] || []).length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${ONBOARDING_PHASES[activePhase]?.color} h-2 rounded-full transition-all duration-500`}
              style={{ 
                width: `${((PHASE_TASKS[activePhase] || []).filter(task => 
                  formationData.phases?.[activePhase]?.tasks?.[task.id]?.completed
                ).length / (PHASE_TASKS[activePhase] || []).length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* 🏆 Badges gagnés */}
      {stats.earnedBadges.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Badges Débloqués
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {stats.earnedBadges.map((badge, index) => (
              <div 
                key={index}
                className="bg-black/20 rounded-lg px-4 py-2 flex items-center"
              >
                <BadgeIcon className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-yellow-100 text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📝 Note d'encouragement */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💪 <strong>Bonne aventure, et bienvenue chez Brain !</strong><br/>
          N'hésite pas à demander de l'aide à tes référent·e·s ou collègues à chaque étape. 
          Tu fais partie de l'équipe dès maintenant !
        </p>
      </div>
    </div>
  );
};

export default FormationGenerale;
