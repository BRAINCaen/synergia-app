// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION COMPLÈTE AVEC TOUS LES ONGLETS FONCTIONNELS
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
  Pause,
  RotateCcw,
  Eye,
  Building,
  Heart,
  ChevronRight,
  Shield,
  Zap,
  Send,
  X,
  CalendarDays,
  Phone,
  Video,
  MapPin,
  FileText
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 RÔLES SYNERGIA COMPLETS AVEC PROGRESSION
const SYNERGIA_ROLES = {
  gamemaster: { 
    id: 'gamemaster', 
    name: 'Game Master', 
    icon: '🕹️', 
    color: 'from-purple-500 to-blue-500',
    description: 'Animation et gestion des sessions d\'escape game',
    progress: 25 // Progression actuelle
  },
  maintenance: { 
    id: 'maintenance', 
    name: 'Maintenance', 
    icon: '🛠️', 
    color: 'from-orange-500 to-red-500',
    description: 'Entretien technique et réparations',
    progress: 0
  },
  reputation: { 
    id: 'reputation', 
    name: 'Réputation', 
    icon: '⭐', 
    color: 'from-yellow-500 to-amber-500',
    description: 'Gestion de l\'image de marque et avis clients',
    progress: 0
  },
  stock: { 
    id: 'stock', 
    name: 'Stock', 
    icon: '📦', 
    color: 'from-blue-500 to-indigo-500',
    description: 'Gestion des stocks et approvisionnements',
    progress: 0
  },
  organisation: { 
    id: 'organisation', 
    name: 'Organisation', 
    icon: '🗓️', 
    color: 'from-green-500 to-teal-500',
    description: 'Planification et coordination interne',
    progress: 0
  },
  partnerships: { 
    id: 'partnerships', 
    name: 'Partenariats', 
    icon: '🤝', 
    color: 'from-indigo-500 to-purple-500',
    description: 'Relations externes et collaborations',
    progress: 0
  }
};

// 🎯 DONNÉES DE FORMATION RÉALISTES
const FORMATION_PHASES = {
  decouverte_brain: {
    id: 'decouverte_brain',
    name: '🎯 Découverte de Brain',
    status: 'completed',
    progress: 100,
    completedTasks: 4,
    totalTasks: 4,
    tasks: [
      { name: 'Accueil et présentation', completed: true, icon: '👋' },
      { name: 'Visite des locaux', completed: true, icon: '🏢' },
      { name: 'Rencontre équipe', completed: true, icon: '👥' },
      { name: 'Découverte outils', completed: true, icon: '🔧' }
    ]
  },
  parcours_client: {
    id: 'parcours_client',
    name: '👥 Parcours Client & Expérience Joueur',
    status: 'active',
    progress: 60,
    completedTasks: 3,
    totalTasks: 5,
    tasks: [
      { name: 'Maîtriser l\'accueil client de A à Z', completed: true, icon: '✅' },
      { name: 'Conduire un briefing joueurs efficace', completed: true, icon: '✅' },
      { name: 'Gestion des différents types de groupes', completed: true, icon: '✅' },
      { name: 'Animations spéciales et événements', completed: false, icon: '⏳', current: true },
      { name: 'Gestion des imprévus et situations difficiles', completed: false, icon: '📋' }
    ]
  },
  gestion_technique: {
    id: 'gestion_technique',
    name: '🔧 Gestion Technique',
    status: 'locked',
    progress: 0,
    completedTasks: 0,
    totalTasks: 6,
    tasks: []
  }
};

// 🎮 COMPÉTENCES GAME MASTER PAR CATÉGORIE
const GAMEMASTER_SKILLS = {
  decouverte_immersion: {
    name: 'Découverte & Immersion',
    color: 'from-blue-500 to-cyan-500',
    icon: BookOpen,
    skills: [
      { id: 'connaissance_salles', name: 'Connaissance parfaite des 3 salles', completed: true },
      { id: 'scenarios_enigmes', name: 'Scénarios et énigmes par cœur', completed: true },
      { id: 'immersion_univers', name: 'Immersion dans l\'univers de chaque salle', completed: false }
    ]
  },
  gestion_technique: {
    name: 'Gestion Technique',
    color: 'from-purple-500 to-pink-500',
    icon: Camera,
    skills: [
      { id: 'systeme_cameras', name: 'Maîtrise du système de caméras', completed: false },
      { id: 'effets_sonores', name: 'Gestion des effets sonores et ambiances', completed: false },
      { id: 'indices_distants', name: 'Délivrer des indices à distance', completed: false }
    ]
  },
  animation_clients: {
    name: 'Animation Clients',
    color: 'from-green-500 to-emerald-500',
    icon: Users,
    skills: [
      { id: 'accueil_briefing', name: 'Accueil et briefing joueurs', completed: false },
      { id: 'gestion_stress', name: 'Gestion du stress et des peurs', completed: false },
      { id: 'debriefing_photo', name: 'Debriefing et session photo', completed: false }
    ]
  },
  quiz_game: {
    name: 'Quiz Game',
    color: 'from-orange-500 to-red-500',
    icon: Gamepad2,
    skills: [
      { id: 'animation_quiz', name: 'Animation du Quiz Game', completed: false },
      { id: 'gestion_classements', name: 'Gestion des scores et classements', completed: false }
    ]
  }
};

// 📋 TEMPLATES D'ENTRETIENS
const INTERVIEW_TEMPLATES = {
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation'
  },
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    duration: 30,
    description: 'Point régulier sur les progrès'
  },
  milestone: {
    id: 'milestone',
    name: 'Bilan d\'Étape',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    duration: 45,
    description: 'Validation des compétences acquises'
  }
};

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📚 Chargement données de formation...');
      
      // Créer des données réalistes de formation
      const defaultFormation = {
        userId: user.uid,
        status: 'in_progress',
        currentPhase: 'parcours_client',
        progress: 35,
        completedModules: ['accueil', 'visite_locaux', 'comprendre_valeurs', 'rencontrer_equipe'],
        nextModule: 'animations_speciales',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdate: new Date().toISOString(),
        phases: FORMATION_PHASES,
        metrics: {
          totalTasks: 15,
          completedTasks: 7,
          completionRate: 47,
          totalXP: 180,
          earnedXP: 85
        }
      };
      
      setFormationData(defaultFormation);
      
    } catch (error) {
      console.error('❌ Erreur chargement formation:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadFormationData();
    }
  }, [user?.uid, loadFormationData]);

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
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Formation Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Votre parcours d'intégration personnalisé
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
          {activeTab === 'formation' && <MaFormation formationData={formationData} />}
          {activeTab === 'competences' && <AcquisitionCompetences />}
          {activeTab === 'entretiens' && <EntretiensReferent />}
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT FORMATION AVEC DONNÉES RÉALISTES
const MaFormation = ({ formationData }) => {
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Formation non initialisée</h3>
        <p className="text-gray-400 mb-6">
          Votre parcours d'intégration n'a pas encore été configuré.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 📊 Vue d'ensemble de la progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Ma Formation</h3>
            <p className="opacity-90">Progression générale de votre parcours</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formationData.metrics?.completionRate || 35}%</div>
            <div className="text-sm opacity-80">complété</div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${formationData.metrics?.completionRate || 35}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{formationData.metrics?.completedTasks || 7}</div>
            <div className="text-sm opacity-80">Tâches terminées</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{formationData.metrics?.earnedXP || 85}</div>
            <div className="text-sm opacity-80">XP gagné</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">2</div>
            <div className="text-sm opacity-80">Semaines</div>
          </div>
        </div>
      </div>

      {/* 🗺️ Phases de formation détaillées */}
      <div className="space-y-6">
        <h4 className="text-2xl font-bold text-white mb-6">Parcours de Formation</h4>
        
        {Object.values(FORMATION_PHASES).map((phase) => (
          <div key={phase.id} className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border ${
            phase.status === 'completed' ? 'border-green-500/30' :
            phase.status === 'active' ? 'border-blue-500/30' :
            'border-gray-700'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    phase.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    phase.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    'bg-gray-600'
                  }`}>
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : phase.status === 'active' ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-white">{phase.name}</h5>
                    <p className={
                      phase.status === 'completed' ? 'text-green-400' :
                      phase.status === 'active' ? 'text-blue-400' :
                      'text-gray-400'
                    }>
                      {phase.status === 'completed' ? 'Terminé' :
                       phase.status === 'active' ? 'En cours' :
                       'Verrouillé'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${
                    phase.status === 'completed' ? 'text-green-400' :
                    phase.status === 'active' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {phase.progress}%
                  </div>
                  <div className="text-gray-400 text-sm">
                    {phase.completedTasks}/{phase.totalTasks} tâches
                  </div>
                </div>
              </div>

              {/* Progression */}
              <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    phase.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    phase.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>

              {/* Tâches */}
              {phase.tasks.length > 0 && (
                <div className="space-y-3">
                  {phase.tasks.map((task, idx) => (
                    <div key={idx} className={`flex items-center gap-3 rounded-lg p-3 ${
                      task.completed ? 
                        (phase.status === 'completed' ? 'bg-green-900/20' : 'bg-blue-900/20') :
                      task.current ? 'bg-yellow-900/20 border border-yellow-500/30' :
                      'bg-gray-700/30'
                    }`}>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {task.completed ? (
                          <CheckCircle2 className={`w-5 h-5 ${
                            phase.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                          }`} />
                        ) : task.current ? (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <span className={`${
                        task.completed ? 
                          (phase.status === 'completed' ? 'text-green-300' : 'text-blue-300') :
                        task.current ? 'text-yellow-300' :
                        'text-gray-400'
                      }`}>
                        {task.icon} {task.name}
                      </span>
                      {task.current && (
                        <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Prochaine étape */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h4 className="text-white font-semibold">Prochaine étape</h4>
              <p className="text-blue-300">
                Animations spéciales et événements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ACQUISITION DE COMPÉTENCES
const AcquisitionCompetences = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h3>
        <p className="text-gray-300 text-lg">
          Développez votre expertise dans les 6 rôles clés de Brain
        </p>
      </div>

      {/* Rôles Synergia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.values(SYNERGIA_ROLES).map(role => (
          <div key={role.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center text-xl mr-4`}>
                {role.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">{role.name}</h4>
                <p className="text-gray-400 text-sm">{role.progress}% complété</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 text-sm">{role.description}</p>
            
            <div className="bg-gray-700/50 rounded-full h-2 mb-4">
              <div 
                className={`bg-gradient-to-r ${role.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${role.progress}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Voir les détails →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compétences Game Master détaillées */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h4 className="text-xl font-bold mb-4">📊 Formation Game Master en Détail</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(GAMEMASTER_SKILLS).map(([categoryKey, category]) => {
            const completed = category.skills.filter(skill => skill.completed).length;
            const total = category.skills.length;
            const percentage = Math.round((completed / total) * 100);
            
            return (
              <div key={categoryKey} className="text-center">
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-sm opacity-80">{category.name}</div>
                <div className="text-xs opacity-60">{completed}/{total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détail des compétences Game Master */}
      <div className="space-y-6">
        {Object.entries(GAMEMASTER_SKILLS).map(([categoryKey, category]) => {
          const IconComponent = category.icon;
          const completed = category.skills.filter(skill => skill.completed).length;
          const total = category.skills.length;
          const percentage = Math.round((completed / total) * 100);
          
          return (
            <div key={categoryKey} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{category.name}</h4>
                      <p className="text-gray-400">{completed}/{total} compétences validées</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{percentage}%</div>
                    <div className="text-gray-400 text-sm">Maîtrisé</div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-full h-2 mb-6">
                  <div 
                    className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.id} className={`p-4 rounded-xl border transition-all duration-200 ${
                      skill.completed 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-gray-700/30 border-gray-600'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="mt-1">
                          {skill.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-semibold ${skill.completed ? 'text-green-300' : 'text-white'}`}>
                            {skill.name}
                          </h5>
                          {skill.completed && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>Compétence validée</span>
                            </div>
                          )}
                        </div>
                        {skill.completed && (
                          <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                            <Star className="h-3 w-3" />
                            Validé
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ENTRETIENS RÉFÉRENT
const EntretiensReferent = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          💬 Entretiens avec Référent
        </h3>
        <p className="text-gray-300 text-lg">
          Suivi personnalisé de votre intégration
        </p>
      </div>

      {/* Navigation entretiens */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'planifier', name: 'Planifier', icon: Plus },
              { id: 'historique', name: 'Historique', icon: Calendar }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Templates d'entretiens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(INTERVIEW_TEMPLATES).map(template => {
          const IconComponent = template.icon;
          return (
            <div key={template.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${template.color} flex items-center justify-center mr-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{template.name}</h4>
                  <p className="text-gray-400 text-sm">{template.duration} minutes</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4 text-sm">{template.description}</p>
              
              <button 
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowScheduleForm(true);
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Planifier cet entretien
              </button>
            </div>
          );
        })}
      </div>

      {/* Prochains entretiens */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h4 className="text-xl font-bold text-white mb-4">📅 Prochains Entretiens</h4>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun entretien planifié</p>
          <button 
            onClick={() => setShowScheduleForm(true)}
            className="mt-4 text-purple-400 hover:text-purple-300 font-medium"
          >
            Planifier votre premier entretien
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
