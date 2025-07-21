// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PROGRAMME FORMATION BRAIN COMPLET - TOUTES PHASES VISIBLES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Target, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Users,
  Gamepad2,
  Settings,
  Calendar,
  User,
  Plus,
  CheckCircle,
  Circle,
  RefreshCw,
  Camera,
  Play,
  Eye,
  Building,
  Heart,
  ChevronRight,
  ChevronDown,
  Shield,
  Zap,
  Send,
  X,
  CalendarDays,
  Phone,
  Video,
  MapPin,
  FileText,
  Brain,
  Home,
  Lock,
  Wrench,
  Lightbulb,
  Flag,
  Trophy,
  CheckSquare,
  Square
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { motion, AnimatePresence } from 'framer-motion';

// 🧠 PROGRAMME FORMATION BRAIN COMPLET
const FORMATION_PROGRAM = {
  decouverte_brain: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
    badge: 'Bienvenue chez Brain !',
    xp: 50,
    color: 'from-blue-500 to-cyan-500',
    icon: Brain,
    tasks: [
      {
        id: 'accueil_officiel',
        name: 'Participer à ton accueil officiel et faire le tour des locaux',
        completed: false
      },
      {
        id: 'lire_charte',
        name: 'Lire la charte, le règlement intérieur et l\'histoire de Brain',
        completed: false
      },
      {
        id: 'decouvrir_equipe',
        name: 'Découvrir les membres de l\'équipe (photos, rôles, anecdotes)',
        completed: false
      },
      {
        id: 'comprendre_organigramme',
        name: 'Comprendre l\'organigramme : qui fait quoi chez Brain ?',
        completed: false
      },
      {
        id: 'outils_internes',
        name: 'Prendre connaissance des outils internes (messagerie, email, planning, réservations)',
        completed: false
      },
      {
        id: 'canaux_communication',
        name: 'T\'abonner aux canaux de communication interne',
        completed: false
      },
      {
        id: 'presentation_equipe',
        name: 'Te présenter à l\'équipe (en live ou par message)',
        completed: false
      }
    ]
  },

  parcours_client: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'L\'objectif : maîtriser toutes les étapes du parcours client·e, de l\'accueil à la sortie.',
    badge: 'Ambassadeur·rice Brain',
    xp: 80,
    color: 'from-green-500 to-emerald-500',
    icon: Users,
    tasks: [
      {
        id: 'observer_accueil',
        name: 'Observer l\'accueil client·e avec un·e Game Master expérimenté·e',
        completed: false
      },
      {
        id: 'observer_briefing',
        name: 'Observer un briefing client·e (Escape et Quiz Game)',
        completed: false
      },
      {
        id: 'comprendre_parcours',
        name: 'Comprendre le parcours client·e type (accueil, briefing, jeu, débriefing)',
        completed: false
      },
      {
        id: 'accueil_duo',
        name: 'Participer à un accueil en duo',
        completed: false
      },
      {
        id: 'briefing_fictif',
        name: 'Faire un briefing client·e fictif (jeu de rôle)',
        completed: false
      },
      {
        id: 'debriefing_client',
        name: 'Participer à un débriefing client·e',
        completed: false
      },
      {
        id: 'notes_session',
        name: 'Prendre des notes sur une session réelle',
        completed: false
      },
      {
        id: 'retour_experience',
        name: 'Rédiger un retour d\'expérience (points forts & axes d\'amélioration)',
        completed: false
      }
    ]
  },

  securite_procedures: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Pour assurer la sécurité et la qualité, tu dois être à l\'aise avec les procédures et le matériel.',
    badge: 'Gardien·ne du Temple',
    xp: 100,
    color: 'from-red-500 to-orange-500',
    icon: Shield,
    tasks: [
      {
        id: 'consignes_securite',
        name: 'Lire et comprendre les consignes de sécurité (incendie, évacuation, premiers secours)',
        completed: false
      },
      {
        id: 'equipements_securite',
        name: 'Repérer tous les équipements de sécurité (extincteurs, issues de secours…)',
        completed: false
      },
      {
        id: 'procedures_urgence',
        name: 'Comprendre les procédures d\'urgence (coupure courant, alarme, incidents)',
        completed: false
      },
      {
        id: 'outils_techniques',
        name: 'Prendre en main les outils techniques (caméras, micros, écrans, effets spéciaux)',
        completed: false
      },
      {
        id: 'reset_salle',
        name: 'Apprendre à faire un reset complet d\'une salle',
        completed: false
      },
      {
        id: 'gestion_materiel',
        name: 'Connaître la gestion du matériel (cadenas, accessoires, maintenance de base)',
        completed: false
      },
      {
        id: 'ouverture_fermeture',
        name: 'Réaliser une procédure d\'ouverture/fermeture complète sous supervision',
        completed: false
      },
      {
        id: 'etat_lieux',
        name: 'Faire un état des lieux avant/après chaque session',
        completed: false
      }
    ]
  },

  formation_experiences: {
    id: 'formation_experiences',
    name: '🔎 Formation par expérience (Escape Game, Quiz Game, etc.)',
    description: 'Pour chaque salle ou expérience, tu vas valider plusieurs étapes pour devenir expert·e.',
    badge: 'Expert·e [Nom de la salle/jeu]',
    xp: 120,
    color: 'from-purple-500 to-pink-500',
    icon: Gamepad2,
    experiences: {
      prison: {
        name: 'Prison Break',
        tasks: [
          { id: 'scenario_prison', name: 'Lire le scénario complet et l\'objectif du jeu', completed: false },
          { id: 'observer_prison', name: 'Observer une session animée par un·e Game Master confirmé·e', completed: false },
          { id: 'enigmes_prison', name: 'Apprendre toutes les énigmes, solutions et points d\'aide', completed: false },
          { id: 'reset_prison', name: 'Maîtriser le reset de la salle', completed: false },
          { id: 'technique_prison', name: 'Prendre en main la gestion technique (caméras, indices, effets)', completed: false },
          { id: 'animation_duo_prison', name: 'Animer une session en duo, puis en autonomie sous supervision', completed: false },
          { id: 'briefing_prison', name: 'Effectuer un briefing et un débriefing complet', completed: false },
          { id: 'incident_prison', name: 'Gérer un incident fictif (clé cassée, client·e bloqué·e, bug technique)', completed: false },
          { id: 'validation_prison', name: 'Réaliser une session complète validée par un·e référent·e', completed: false }
        ]
      },
      psychiatric: {
        name: 'Psychiatric',
        tasks: [
          { id: 'scenario_psychiatric', name: 'Lire le scénario complet et l\'objectif du jeu', completed: false },
          { id: 'observer_psychiatric', name: 'Observer une session animée par un·e Game Master confirmé·e', completed: false },
          { id: 'enigmes_psychiatric', name: 'Apprendre toutes les énigmes, solutions et points d\'aide', completed: false },
          { id: 'reset_psychiatric', name: 'Maîtriser le reset de la salle', completed: false },
          { id: 'technique_psychiatric', name: 'Prendre en main la gestion technique (caméras, indices, effets)', completed: false },
          { id: 'animation_duo_psychiatric', name: 'Animer une session en duo, puis en autonomie sous supervision', completed: false },
          { id: 'briefing_psychiatric', name: 'Effectuer un briefing et un débriefing complet', completed: false },
          { id: 'incident_psychiatric', name: 'Gérer un incident fictif (clé cassée, client·e bloqué·e, bug technique)', completed: false },
          { id: 'validation_psychiatric', name: 'Réaliser une session complète validée par un·e référent·e', completed: false }
        ]
      },
      back_to_80s: {
        name: 'Back to the 80\'s',
        tasks: [
          { id: 'scenario_80s', name: 'Lire le scénario complet et l\'objectif du jeu', completed: false },
          { id: 'observer_80s', name: 'Observer une session animée par un·e Game Master confirmé·e', completed: false },
          { id: 'enigmes_80s', name: 'Apprendre toutes les énigmes, solutions et points d\'aide', completed: false },
          { id: 'reset_80s', name: 'Maîtriser le reset de la salle', completed: false },
          { id: 'technique_80s', name: 'Prendre en main la gestion technique (caméras, indices, effets)', completed: false },
          { id: 'animation_duo_80s', name: 'Animer une session en duo, puis en autonomie sous supervision', completed: false },
          { id: 'briefing_80s', name: 'Effectuer un briefing et un débriefing complet', completed: false },
          { id: 'incident_80s', name: 'Gérer un incident fictif (clé cassée, client·e bloqué·e, bug technique)', completed: false },
          { id: 'validation_80s', name: 'Réaliser une session complète validée par un·e référent·e', completed: false }
        ]
      },
      quiz_game: {
        name: 'Quiz Game',
        tasks: [
          { id: 'scenario_quiz', name: 'Lire le scénario complet et l\'objectif du jeu', completed: false },
          { id: 'observer_quiz', name: 'Observer une session animée par un·e Game Master confirmé·e', completed: false },
          { id: 'questions_quiz', name: 'Apprendre le système de questions et de scoring', completed: false },
          { id: 'reset_quiz', name: 'Maîtriser le reset du plateau de jeu', completed: false },
          { id: 'technique_quiz', name: 'Prendre en main la gestion technique (écrans, buzzers, musique)', completed: false },
          { id: 'animation_duo_quiz', name: 'Animer une session en duo, puis en autonomie sous supervision', completed: false },
          { id: 'briefing_quiz', name: 'Effectuer un briefing et un débriefing complet', completed: false },
          { id: 'incident_quiz', name: 'Gérer un incident fictif (bug technique, équipe difficile)', completed: false },
          { id: 'validation_quiz', name: 'Réaliser une session complète validée par un·e référent·e', completed: false }
        ]
      }
    }
  },

  taches_quotidien: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Être Game Master, c\'est aussi garantir la qualité du quotidien pour tou·te·s.',
    badge: 'Pilier du Quotidien',
    xp: 90,
    color: 'from-orange-500 to-yellow-500',
    icon: Wrench,
    tasks: [
      {
        id: 'preparer_salle',
        name: 'Préparer une salle avant session (reset, check matériel)',
        completed: false
      },
      {
        id: 'stocks',
        name: 'Vérifier et réapprovisionner les stocks (consommables, accessoires)',
        completed: false
      },
      {
        id: 'nettoyage',
        name: 'Nettoyer et entretenir les espaces client·e·s et staff',
        completed: false
      },
      {
        id: 'caisse_bar',
        name: 'Gérer la caisse, les consommations et le bar',
        completed: false
      },
      {
        id: 'outils_numeriques',
        name: 'Utiliser les outils numériques (gestion des réservations, mails, rapports d\'activité)',
        completed: false
      },
      {
        id: 'ouverture_fermeture_autonomie',
        name: 'Effectuer une ouverture/fermeture complète en binôme, puis en autonomie',
        completed: false
      },
      {
        id: 'objets_trouves',
        name: 'Gérer les objets trouvés, le rangement et la propreté',
        completed: false
      },
      {
        id: 'rapport_journalier',
        name: 'Remplir un rapport journalier ou un carnet de bord',
        completed: false
      }
    ]
  },

  soft_skills: {
    id: 'soft_skills',
    name: '🌱 Soft Skills, communication & évolution',
    description: 'Ici, tu développes tes qualités humaines et ta capacité à t\'adapter à toutes les situations.',
    badge: 'Esprit Brain',
    xp: 70,
    color: 'from-green-500 to-teal-500',
    icon: Lightbulb,
    tasks: [
      {
        id: 'formation_communication',
        name: 'Participer à une formation ou un jeu de rôle sur la communication (gestion de client·e difficile)',
        completed: false
      },
      {
        id: 'situation_delicate',
        name: 'Observer ou gérer une situation client·e délicate',
        completed: false
      },
      {
        id: 'feedback',
        name: 'Donner et recevoir du feedback avec un·e collègue',
        completed: false
      },
      {
        id: 'proposition_amelioration',
        name: 'Proposer une amélioration ou une idée pour l\'équipe',
        completed: false
      },
      {
        id: 'bilan_personnel',
        name: 'Réaliser un bilan personnel chaque semaine (auto-évaluation rapide)',
        completed: false
      },
      {
        id: 'initiative',
        name: 'Prendre l\'initiative sur une tâche (dépanner un·e collègue, animer un moment convivial…)',
        completed: false
      }
    ]
  },

  validation_finale: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration officielle',
    description: 'C\'est le moment de valider tout ton parcours et de célébrer ton arrivée dans la team Brain !',
    badge: 'Game Master certifié·e Brain',
    xp: 200,
    color: 'from-yellow-500 to-orange-500',
    icon: Trophy,
    tasks: [
      {
        id: 'session_complete_autonomie',
        name: 'Réaliser une session complète (accueil, briefing, gestion, débriefing, reset) en autonomie sous validation',
        completed: false
      },
      {
        id: 'synthese_parcours',
        name: 'Présenter une synthèse de ton parcours à un·e manager ou référent·e',
        completed: false
      },
      {
        id: 'retour_experience_final',
        name: 'Faire un retour d\'expérience (écrit ou oral)',
        completed: false
      },
      {
        id: 'validation_finale_obtenue',
        name: 'Obtenir la validation finale',
        completed: false
      },
      {
        id: 'celebration',
        name: 'Célébrer ton intégration officielle avec l\'équipe !',
        completed: false
      }
    ]
  }
};

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [formationData, setFormationData] = useState(FORMATION_PROGRAM);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedExperience, setExpandedExperience] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📊 Calculer les statistiques globales
  const calculateStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;

    Object.values(formationData).forEach(phase => {
      if (phase.tasks) {
        totalTasks += phase.tasks.length;
        completedTasks += phase.tasks.filter(task => task.completed).length;
      }
      
      if (phase.experiences) {
        Object.values(phase.experiences).forEach(exp => {
          totalTasks += exp.tasks.length;
          completedTasks += exp.tasks.filter(task => task.completed).length;
        });
      }
      
      totalXP += phase.xp;
      // Calculer XP gagné selon la progression
      if (phase.tasks) {
        const phaseCompletion = phase.tasks.filter(task => task.completed).length / phase.tasks.length;
        earnedXP += Math.round(phase.xp * phaseCompletion);
      }
    });

    return {
      totalTasks,
      completedTasks,
      totalXP,
      earnedXP,
      completionRate: Math.round((completedTasks / totalTasks) * 100)
    };
  };

  // ✅ Toggle completion d'une tâche
  const toggleTaskCompletion = (phaseId, taskId, experienceId = null) => {
    setFormationData(prev => {
      const newData = { ...prev };
      
      if (experienceId) {
        // Tâche dans une expérience
        const task = newData[phaseId].experiences[experienceId].tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
        }
      } else {
        // Tâche normale
        const task = newData[phaseId].tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
        }
      }
      
      return newData;
    });
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de votre formation</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎯 En-tête */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Ton Parcours d'Intégration Game Master chez Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Escape & Quiz Game – 1 mois – coche chaque tâche, gagne des XP et débloque des badges
          </p>
        </div>

        {/* 📊 Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { id: 'formation', name: 'Ma Formation', icon: BookOpen },
                { id: 'competences', name: 'Compétences', icon: Target },
                { id: 'entretiens', name: 'Entretiens', icon: MessageSquare }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📋 Contenu par onglet */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'formation' && (
            <FormationBrainComplete 
              formationData={formationData}
              stats={stats}
              expandedPhase={expandedPhase}
              setExpandedPhase={setExpandedPhase}
              expandedExperience={expandedExperience}
              setExpandedExperience={setExpandedExperience}
              toggleTaskCompletion={toggleTaskCompletion}
            />
          )}
          {activeTab === 'competences' && <AcquisitionCompetences stats={stats} />}
          {activeTab === 'entretiens' && <EntretiensReferent />}
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT FORMATION BRAIN COMPLET
const FormationBrainComplete = ({ 
  formationData, 
  stats, 
  expandedPhase, 
  setExpandedPhase, 
  expandedExperience, 
  setExpandedExperience, 
  toggleTaskCompletion 
}) => {
  return (
    <div className="space-y-8">
      {/* 📊 Vue d'ensemble de la progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">🧠 Ton Parcours Game Master</h3>
            <p className="opacity-90">Ta progression sera visible à chaque étape</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.completionRate}%</div>
            <div className="text-sm opacity-80">complété</div>
          </div>
        </div>
        
        <div className="bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{stats.completedTasks}</div>
            <div className="text-sm opacity-80">Tâches terminées</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{stats.totalTasks}</div>
            <div className="text-sm opacity-80">Tâches totales</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{stats.earnedXP}</div>
            <div className="text-sm opacity-80">XP gagné</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{stats.totalXP}</div>
            <div className="text-sm opacity-80">XP total</div>
          </div>
        </div>
      </div>

      {/* 🗺️ Toutes les phases de formation */}
      <div className="space-y-6">
        {Object.values(formationData).map((phase) => {
          const IconComponent = phase.icon;
          const isExpanded = expandedPhase === phase.id;
          
          // Calculer progression de la phase
          let phaseTasks = [];
          if (phase.tasks) {
            phaseTasks = phase.tasks;
          }
          if (phase.experiences) {
            Object.values(phase.experiences).forEach(exp => {
              phaseTasks = [...phaseTasks, ...exp.tasks];
            });
          }
          
          const completedInPhase = phaseTasks.filter(task => task.completed).length;
          const totalInPhase = phaseTasks.length;
          const phaseProgress = totalInPhase > 0 ? Math.round((completedInPhase / totalInPhase) * 100) : 0;
          
          return (
            <div key={phase.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
              <div className="p-6">
                {/* En-tête de phase - Cliquable */}
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${phase.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{phase.name}</h4>
                      <p className="text-gray-400 text-sm">{phase.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{phaseProgress}%</div>
                      <div className="text-gray-400 text-sm">{completedInPhase}/{totalInPhase} tâches</div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                  <div 
                    className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${phaseProgress}%` }}
                  ></div>
                </div>

                {/* Badge et XP */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">🏅 Badge: {phase.badge}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">+{phase.xp} XP</span>
                  </div>
                </div>

                {/* Contenu expandable */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {/* Tâches normales */}
                      {phase.tasks && (
                        <div className="space-y-3 mb-6">
                          <h5 className="font-semibold text-white mb-3">📋 Ce que tu dois valider :</h5>
                          {phase.tasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={() => toggleTaskCompletion(phase.id, task.id)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Expériences */}
                      {phase.experiences && (
                        <div className="space-y-4">
                          <h5 className="font-semibold text-white mb-3">🎮 Expériences à maîtriser :</h5>
                          {Object.entries(phase.experiences).map(([expId, experience]) => {
                            const isExpExpanded = expandedExperience === `${phase.id}_${expId}`;
                            const expCompleted = experience.tasks.filter(t => t.completed).length;
                            const expTotal = experience.tasks.length;
                            const expProgress = Math.round((expCompleted / expTotal) * 100);
                            
                            return (
                              <div key={expId} className="bg-gray-700/30 rounded-lg border border-gray-600">
                                <div 
                                  className="p-4 cursor-pointer hover:bg-gray-600/20 transition-colors"
                                  onClick={() => setExpandedExperience(isExpExpanded ? null : `${phase.id}_${expId}`)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                                      <div>
                                        <h6 className="font-semibold text-white">{experience.name}</h6>
                                        <p className="text-sm text-gray-400">{expCompleted}/{expTotal} tâches validées</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-white">{expProgress}%</span>
                                      {isExpExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 bg-gray-600 rounded-full h-1">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${expProgress}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isExpExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="px-4 pb-4"
                                    >
                                      <div className="space-y-2">
                                        {experience.tasks.map((task) => (
                                          <TaskItem
                                            key={task.id}
                                            task={task}
                                            small={true}
                                            onToggle={() => toggleTaskCompletion(phase.id, task.id, expId)}
                                          />
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message final */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white text-center">
        <h4 className="text-xl font-bold mb-2">🎉 Objectif</h4>
        <p>Devenir rapidement autonome, épanoui·e et reconnu·e au sein de l'équipe !</p>
        <p className="mt-2 text-sm opacity-80">
          Bonne aventure, et bienvenue chez Brain !<br />
          (N'hésite pas à demander de l'aide à tes référent·e·s ou collègues à chaque étape. Tu fais partie de l'équipe dès maintenant !)
        </p>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT TÂCHE INDIVIDUELLE
const TaskItem = ({ task, onToggle, small = false }) => {
  return (
    <div 
      className={`flex items-start gap-3 ${small ? 'p-2' : 'p-3'} rounded-lg border transition-all duration-200 cursor-pointer ${
        task.completed 
          ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30' 
          : 'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
      }`}
      onClick={onToggle}
    >
      <div className="mt-1">
        {task.completed ? (
          <CheckSquare className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
        ) : (
          <Square className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500 hover:text-gray-400`} />
        )}
      </div>
      <div className="flex-1">
        <p className={`${task.completed ? 'text-green-300 line-through' : 'text-white'} ${small ? 'text-sm' : ''}`}>
          {task.name}
        </p>
      </div>
    </div>
  );
};

// 🎯 IMPORT DU COMPOSANT ENTRETIENS FONCTIONNEL
import EntretiensReferent from '../components/onboarding/EntretiensReferent.jsx';

// 🎯 COMPOSANT COMPÉTENCES SIMPLIFIÉ
const AcquisitionCompetences = ({ stats }) => {
  return (
    <div className="text-center py-12">
      <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-white mb-4">🎮 Acquisition de Compétences</h3>
      <p className="text-gray-300 mb-6">
        Tes compétences se développent automatiquement en validant les tâches de formation !
      </p>
      <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-3xl font-bold text-purple-400">{stats.completionRate}%</div>
        <div className="text-gray-400">Progression globale</div>
        <div className="mt-4 text-sm text-gray-300">
          {stats.completedTasks} / {stats.totalTasks} tâches complétées
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
