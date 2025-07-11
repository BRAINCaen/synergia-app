// ==========================================
// 📁 react-app/src/pages/EscapeProgressionPage.jsx
// PAGE ESCAPE PROGRESSION AVEC LES 9 VRAIS RÔLES - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  Users, 
  TrendingUp, 
  Zap,
  Target,
  Crown,
  ChevronRight,
  Play,
  BarChart3,
  Calendar,
  Clock,
  Medal,
  Sparkles,
  Gamepad2,
  Wrench,
  MessageSquare,
  Package,
  CalendarClock,
  Palette,
  GraduationCap,
  Megaphone,
  X
} from 'lucide-react';

// 🎯 LES 9 VRAIS RÔLES ESCAPE GAME DE SYNERGIA
const ESCAPE_GAME_ROLES = {
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🕹️',
    lucideIcon: Gamepad2,
    color: 'from-purple-600 to-pink-600',
    description: 'Animateur·rice des sessions de jeu, garant·e de l\'immersion, de l\'accueil et de la satisfaction client.',
    competences: [
      'Relationnel et sens du service',
      'Capacité à improviser, gérer les imprévus', 
      'Rigueur (préparation, rangement, sécurité)',
      'Acting, créativité, gestion du stress'
    ],
    actions: [
      'Accueil et brief/débrief des équipes',
      'Mastering en live des salles (caméras, sons, énigmes)',
      'Rangement et préparation de la salle',
      'Animation quiz game',
      'Gestion des situations clients : panique, casse, mécontentement'
    ],
    taskCount: 95,
    difficulty: 'Difficile',
    xpMultiplier: 2.0
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🛠️',
    lucideIcon: Wrench,
    color: 'from-orange-600 to-red-600',
    description: 'Garant·e du bon état, de la sécurité et de la qualité des salles et du local.',
    competences: [
      'Bricolage, petites réparations',
      'Sens du détail, rigueur, autonomie',
      'Organisation, initiative'
    ],
    actions: [
      'Vérification quotidienne de l\'état des salles',
      'Maintenance de base : serrures, câbles, mécanismes, déco',
      'Petites réparations, retouches, réaménagements',
      'Gestion des pannes ou incidents techniques'
    ],
    taskCount: 87,
    difficulty: 'Facile',
    xpMultiplier: 1.2
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '🌟',
    lucideIcon: Star,
    color: 'from-yellow-500 to-orange-500',
    description: 'Surveille, répond et valorise les avis clients pour améliorer la réputation du lieu.',
    competences: [
      'Diplomatie, empathie, rédactionnel',
      'Analyse, écoute, communication positive'
    ],
    actions: [
      'Veille et réponses personnalisées aux avis (Google, TripAdvisor, Facebook…)',
      'Gestion des retours négatifs (résolution, analyse)',
      'Valorisation des avis dans la communication interne/externe',
      'Propositions d\'amélioration suite aux feedbacks'
    ],
    taskCount: 73,
    difficulty: 'Moyen',
    xpMultiplier: 1.5
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    lucideIcon: Package,
    color: 'from-blue-600 to-cyan-600',
    description: 'Responsable de la disponibilité et de l\'organisation du matériel et des consommables.',
    competences: [
      'Organisation, rigueur, anticipation',
      'Esprit pratique, gestion des priorités'
    ],
    actions: [
      'Inventaire et suivi du stock (piles, accessoires, produits d\'entretien…)',
      'Commandes et réception de matériel',
      'Organisation des espaces de stockage',
      'Signalement des besoins ou ruptures'
    ],
    taskCount: 68,
    difficulty: 'Facile',
    xpMultiplier: 1.3
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '🗓️',
    lucideIcon: CalendarClock,
    color: 'from-indigo-600 to-purple-600',
    description: 'Garant·e de la fluidité de l\'organisation, du respect des horaires, de la gestion des absences/congés.',
    competences: [
      'Organisation, rigueur, sens du collectif',
      'Diplomatie, autorité bienveillante',
      'Gestion administrative, juridique'
    ],
    actions: [
      'Plannings, horaires, pointages',
      'Congés, absences, remplacements',
      'Suivi des contrats, paies, déclarations',
      'Médiation en cas de tensions',
      'Communication interne équipe'
    ],
    taskCount: 92,
    difficulty: 'Difficile',
    xpMultiplier: 1.8
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    lucideIcon: Palette,
    color: 'from-pink-600 to-rose-600',
    description: 'Responsable de l\'image visuelle, des contenus créatifs et de l\'attractivité du lieu.',
    competences: [
      'Créativité, sens artistique',
      'Maîtrise des outils de création (Canva, Photoshop…)',
      'Vision marketing, sens de l\'esthétique'
    ],
    actions: [
      'Création d\'affiches, flyers, supports visuels',
      'Mise à jour des affichages et décoration',
      'Contenus pour réseaux sociaux (visuels)',
      'Photos/vidéos des espaces et activités',
      'Refonte visuelle, amélioration déco'
    ],
    taskCount: 81,
    difficulty: 'Moyen',
    xpMultiplier: 1.6
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '👨‍🏫',
    lucideIcon: GraduationCap,
    color: 'from-green-600 to-emerald-600',
    description: 'Accompagne les nouveaux·elles, transmet les savoirs et assure la montée en compétence.',
    competences: [
      'Pédagogie, patience, bienveillance',
      'Maîtrise experte des activités',
      'Communication claire, leadership'
    ],
    actions: [
      'Accueil et formation des nouveaux arrivants',
      'Création de supports de formation',
      'Suivi de progression, évaluations',
      'Accompagnement personnalisé',
      'Amélioration continue des processus de formation'
    ],
    taskCount: 76,
    difficulty: 'Difficile',
    xpMultiplier: 1.9
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    lucideIcon: Users,
    color: 'from-teal-600 to-blue-600',
    description: 'Développe les relations externes, partenariats et visibilité du lieu.',
    competences: [
      'Relationnel, networking, négociation',
      'Sens commercial, persuasion',
      'Vision stratégique, analyse'
    ],
    actions: [
      'Recherche et négociation de partenariats',
      'Relations avec offices de tourisme, hôtels…',
      'Référencement sur plateformes (TripAdvisor, Google…)',
      'Participation à des événements/salons',
      'Veille concurrentielle et tendances'
    ],
    taskCount: 64,
    difficulty: 'Avancé',
    xpMultiplier: 1.7
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    lucideIcon: Megaphone,
    color: 'from-violet-600 to-purple-600',
    description: 'Anime la présence en ligne, gère la communication et développe la communauté.',
    competences: [
      'Rédactionnel, créativité, réactivité',
      'Maîtrise des réseaux sociaux',
      'Sens du timing, engagement communautaire'
    ],
    actions: [
      'Animation des réseaux sociaux (posts, stories, interactions)',
      'Rédaction de contenus (articles, newsletters)',
      'Gestion de la communication de crise',
      'Développement de la communauté en ligne',
      'Suivi des performances et analytics'
    ],
    taskCount: 89,
    difficulty: 'Moyen',
    xpMultiplier: 1.4
  }
};

// Niveaux de progression
const PROGRESSION_LEVELS = [
  { id: 'novice', name: 'Novice', xpMin: 0, xpMax: 500, color: 'bg-gray-500' },
  { id: 'apprenti', name: 'Apprenti', xpMin: 501, xpMax: 1500, color: 'bg-green-500' },
  { id: 'competent', name: 'Compétent', xpMin: 1501, xpMax: 3000, color: 'bg-blue-500' },
  { id: 'expert', name: 'Expert', xpMin: 3001, xpMax: 5000, color: 'bg-purple-500' },
  { id: 'maitre', name: 'Maître', xpMin: 5001, xpMax: 10000, color: 'bg-yellow-500' }
];

const EscapeProgressionPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [simulationMode, setSimulationMode] = useState(false);

  // Simulation de progression utilisateur
  const simulateUserProgress = () => {
    const progress = {};
    Object.keys(ESCAPE_GAME_ROLES).forEach(roleId => {
      progress[roleId] = {
        currentXP: Math.floor(Math.random() * 8000),
        tasksCompleted: Math.floor(Math.random() * 50),
        badgesEarned: Math.floor(Math.random() * 15),
        level: PROGRESSION_LEVELS[Math.floor(Math.random() * PROGRESSION_LEVELS.length)]
      };
    });
    setUserProgress(progress);
    setSimulationMode(true);
  };

  // Calculer le niveau basé sur l'XP
  const calculateLevel = (xp) => {
    return PROGRESSION_LEVELS.find(level => 
      xp >= level.xpMin && xp <= level.xpMax
    ) || PROGRESSION_LEVELS[0];
  };

  // Calculer le pourcentage de progression dans le niveau
  const calculateLevelProgress = (xp, level) => {
    const range = level.xpMax - level.xpMin;
    const progress = xp - level.xpMin;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="text-yellow-400" />
                Progression Escape Game
              </h1>
              <p className="text-slate-300 mt-2">
                Suivez votre évolution dans les 9 rôles de l'escape game Synergia
              </p>
            </div>
            <button
              onClick={simulateUserProgress}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                         text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 
                         flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Play size={20} />
              Simuler Progression
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {simulationMode && (
          <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400">
              <Sparkles size={20} />
              <span className="font-medium">Mode simulation activé !</span>
            </div>
            <p className="text-green-300 text-sm mt-1">
              Progression aléatoire générée pour tester l'interface
            </p>
          </div>
        )}

        {/* Grille des rôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(ESCAPE_GAME_ROLES).map((role) => {
            const progress = userProgress[role.id];
            const level = progress ? progress.level : PROGRESSION_LEVELS[0];
            const xp = progress ? progress.currentXP : 0;
            const levelProgress = progress ? calculateLevelProgress(xp, level) : 0;

            return (
              <div
                key={role.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 
                           hover:bg-white/10 transition-all duration-300 cursor-pointer
                           hover:border-white/20 hover:shadow-2xl group"
                onClick={() => setSelectedRole(role)}
              >
                {/* Header du rôle */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} 
                                   flex items-center justify-center text-white text-xl`}>
                      <role.lucideIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {role.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${level.color} text-white`}>
                          {level.name}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {role.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-white transition-colors" size={20} />
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {role.description}
                </p>

                {/* Progression XP */}
                {progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">XP: {xp.toLocaleString()}</span>
                      <span className="text-slate-400">{level.xpMin.toLocaleString()} - {level.xpMax.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${role.color} transition-all duration-500`}
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {progress ? progress.tasksCompleted : 0}
                    </div>
                    <div className="text-slate-400 text-xs">Tâches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {progress ? progress.badgesEarned : 0}
                    </div>
                    <div className="text-slate-400 text-xs">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {role.taskCount}
                    </div>
                    <div className="text-slate-400 text-xs">Total</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal détail rôle */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedRole.color} 
                                   flex items-center justify-center text-white text-2xl`}>
                      <selectedRole.lucideIcon size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedRole.name}
                      </h2>
                      <p className="text-slate-300 mt-1">
                        {selectedRole.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-slate-400 hover:text-white p-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Contenu détaillé */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Compétences */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Star className="text-yellow-400" size={20} />
                      Compétences Clés
                    </h3>
                    <ul className="space-y-2">
                      {selectedRole.competences.map((competence, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          {competence}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Target className="text-green-400" size={20} />
                      Champs d'Action
                    </h3>
                    <ul className="space-y-2">
                      {selectedRole.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Progression si disponible */}
                {userProgress[selectedRole.id] && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="text-purple-400" size={20} />
                      Votre Progression
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {userProgress[selectedRole.id].currentXP.toLocaleString()}
                        </div>
                        <div className="text-slate-400 text-sm">XP Total</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {userProgress[selectedRole.id].level.name}
                        </div>
                        <div className="text-slate-400 text-sm">Niveau</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {userProgress[selectedRole.id].tasksCompleted}
                        </div>
                        <div className="text-slate-400 text-sm">Tâches</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {userProgress[selectedRole.id].badgesEarned}
                        </div>
                        <div className="text-slate-400 text-sm">Badges</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscapeProgressionPage;
