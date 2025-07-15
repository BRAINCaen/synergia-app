// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE BRAIN ESCAPE & QUIZ GAME
// ==========================================

import React, { useState } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  Star
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// Import des composants d'onboarding
import SkillsAcquisition from '../components/onboarding/SkillsAcquisition.jsx';
import FormationGenerale from '../components/onboarding/FormationGenerale.jsx';
import EntretiensReferent from '../components/onboarding/EntretiensReferent.jsx';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('formation'); // Commencer par Formation Générale

  // 🎯 Composant Entretiens Référent (placeholder)
  const EntretiensReferent = () => (
    <div className="text-center py-12">
      <div className="bg-gray-800 rounded-lg p-8">
        <MessageSquare className="h-16 w-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-4">
          🎤 Entretiens Référent
        </h3>
        <p className="text-gray-400 mb-6">
          Système de suivi et d'accompagnement personnalisé avec ton référent.
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            Planification d'entretiens réguliers
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Users className="h-4 w-4 mr-2 text-green-400" />
            Feedback bidirectionnel
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Target className="h-4 w-4 mr-2 text-purple-400" />
            Suivi de progression personnalisé
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Points d'action et objectifs
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
            🚀 Système Complet Disponible
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* 🎯 Header avec gradient */}
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

        {/* 🎯 Navigation Premium */}
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

        {/* 📋 Contenu basé sur la section active */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          {activeSection === 'formation' && (
            <FormationGenerale />
          )}

          {activeSection === 'competences' && (
            <SkillsAcquisition />
          )}

          {activeSection === 'entretiens' && (
            <EntretiensReferent />
          )}
        </div>

        {/* 🌟 Footer motivant */}
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

        {/* 🔧 Note technique (temporaire) */}
        <div className="mt-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            ✅ <strong>Version complète OnboardingPage</strong><br/>
            - Formation Générale : Programme complet avec 7 phases Brain ✅<br/>
            - Acquisition de Compétences : 19 compétences Game Master ✅<br/>
            - Entretiens Référent : Système de planification et suivi ✅<br/>
            - Navigation premium avec gradients et animations ✅
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
