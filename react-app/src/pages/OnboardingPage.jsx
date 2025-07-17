// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING SIMPLIFIÉE - SANS ERREUR INVALIDCHARACTERERROR
// ==========================================

import React, { useState } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  Circle,
  Award,
  Zap,
  Clock,
  PlayCircle,
  User,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('formation');

  // 🎯 COMPOSANT FORMATION GÉNÉRALE SIMPLIFIÉ
  const FormationGeneraleSimple = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🧠 Formation Générale Brain
        </h2>
        <p className="text-gray-400">
          Parcours d'intégration complet avec 7 phases progressives
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">7</div>
          <div className="text-sm text-gray-400">Phases</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">42</div>
          <div className="text-sm text-gray-400">Tâches</div>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">850</div>
          <div className="text-sm text-gray-400">XP Total</div>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">5</div>
          <div className="text-sm text-gray-400">Badges</div>
        </div>
      </div>

      {/* Phases de formation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Phase 1: Découverte Brain */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 rounded-full p-2 mr-3">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Découverte Brain</h3>
              <p className="text-sm text-gray-400">Introduction à l'univers Brain</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              Visite guidée des locaux
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              Présentation de l'équipe
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Découverte des valeurs Brain
            </div>
          </div>
        </div>

        {/* Phase 2: Immersion Escape Game */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 rounded-full p-2 mr-3">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Immersion Escape</h3>
              <p className="text-sm text-gray-400">Découverte des jeux</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Test des différentes salles
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Comprendre les mécaniques
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Observer les Game Masters
            </div>
          </div>
        </div>

        {/* Phase 3: Formation Technique */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 rounded-full p-2 mr-3">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Formation Technique</h3>
              <p className="text-sm text-gray-400">Compétences techniques</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Système de caméras
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Gestion de l'éclairage
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Effets sonores
            </div>
          </div>
        </div>

        {/* Phase 4: Première Animation */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-orange-600 rounded-full p-2 mr-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Première Animation</h3>
              <p className="text-sm text-gray-400">Mise en pratique</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Animation avec mentor
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Accueil des clients
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Circle className="h-4 w-4 text-gray-500 mr-2" />
              Débriefing post-session
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 text-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mr-4 transition-colors">
          Commencer la Formation
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors">
          Voir le Planning
        </button>
      </div>
    </div>
  );

  // 🎯 COMPOSANT COMPÉTENCES SIMPLIFIÉ
  const CompetencesSimple = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h2>
        <p className="text-gray-400">
          19 compétences Game Master à maîtriser
        </p>
      </div>

      {/* Compétences par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Compétences techniques */}
        <div className="bg-blue-900/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Techniques
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Caméras & Audio</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Éclairage & Ambiance</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Effets Spéciaux</span>
            </div>
          </div>
        </div>

        {/* Compétences d'animation */}
        <div className="bg-green-900/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Animation
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Accueil Clients</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Storytelling</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Gestion de Groupe</span>
            </div>
          </div>
        </div>

        {/* Compétences de service */}
        <div className="bg-purple-900/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Service Client
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Relation Client</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Gestion Conflits</span>
            </div>
            <div className="flex items-center text-sm">
              <Circle className="h-3 w-3 text-gray-500 mr-2" />
              <span className="text-gray-300">Upselling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Progression Globale</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Compétences Acquises</span>
              <span className="text-gray-400">3/19</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '16%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">XP Gagné</span>
              <span className="text-gray-400">120/500</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 🎯 COMPOSANT ENTRETIENS SIMPLIFIÉ
  const EntretiensSimple = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🎤 Entretiens Référent
        </h2>
        <p className="text-gray-400">
          Suivi personnalisé avec votre référent
        </p>
      </div>

      {/* Prochains entretiens */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Prochain Entretien
        </h3>
        <div className="bg-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-400">Entretien Initial</div>
              <div className="text-sm text-gray-400">Mercredi 22 Novembre 2024 - 14h00</div>
              <div className="text-sm text-gray-400 flex items-center mt-1">
                <User className="h-4 w-4 mr-1" />
                Référent : Sarah Martin
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Durée</div>
              <div className="font-semibold text-white">30 min</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Historique des Entretiens
        </h3>
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun entretien réalisé pour le moment</p>
          <p className="text-sm mt-2">Votre premier entretien est prévu bientôt</p>
        </div>
      </div>

      {/* Types d'entretiens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-900/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-2">Suivi Hebdomadaire</h4>
          <p className="text-sm text-gray-400">Point régulier sur vos progrès</p>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-4">
          <h4 className="font-semibold text-purple-400 mb-2">Entretien d'Étape</h4>
          <p className="text-sm text-gray-400">Validation de fin de phase</p>
        </div>
      </div>
    </div>
  );

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
                Parcours d'intégration Brain avec 7 phases, tâches et badges
              </p>
              <div className="mt-2 text-xs opacity-60">
                💡 7 phases • 🏆 Badges • ⭐ XP
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
                Formation Game Master avec 19 compétences techniques
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎮 Game Master • 🔧 Compétences • ✅ Validation
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
                Suivi personnalisé et accompagnement avec référent
              </p>
              <div className="mt-2 text-xs opacity-60">
                🎤 Entretiens • 📅 Suivi • 🎯 Objectifs
              </div>
            </button>
          </div>
        </div>

        {/* Contenu basé sur la section active */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          {activeSection === 'formation' && <FormationGeneraleSimple />}
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
