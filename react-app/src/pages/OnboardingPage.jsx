// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION MINIMAL POUR DIAGNOSTIC - SANS SERVICES PROBLÉMATIQUES
// ==========================================

import React, { useState } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// Import du composant d'acquisition de compétences
import SkillsAcquisition from '../components/onboarding/SkillsAcquisition.jsx';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('competences'); // Forcer sur compétences

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* 🎯 Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎮 Mon Parcours Game Master Brain
          </h1>
          <p className="text-gray-400">
            Version diagnostic - Utilisateur : {user?.email || 'Non connecté'}
          </p>
        </div>

        {/* 🔧 Navigation simplifiée */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveSection('formation')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'formation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BookOpen className="h-5 w-5 inline mr-2" />
              Formation Générale
            </button>
            
            <button
              onClick={() => setActiveSection('competences')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'competences'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Target className="h-5 w-5 inline mr-2" />
              Acquisition de Compétences
            </button>
            
            <button
              onClick={() => setActiveSection('entretiens')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'entretiens'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Entretiens Référent
            </button>
          </div>
        </div>

        {/* 📋 Contenu basé sur la section */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeSection === 'formation' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-4">
                Formation Générale
              </h3>
              <p className="text-gray-400">
                Section désactivée pour le diagnostic
              </p>
            </div>
          )}

          {activeSection === 'competences' && (
            <SkillsAcquisition />
          )}

          {activeSection === 'entretiens' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-4">
                Entretiens Référent
              </h3>
              <p className="text-gray-400">
                Section désactivée pour le diagnostic
              </p>
            </div>
          )}
        </div>

        {/* 🚨 Note de diagnostic */}
        <div className="mt-8 bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm">
            🚨 <strong>Version diagnostic OnboardingPage</strong><br/>
            - Pas d'import OnboardingService<br/>
            - Pas d'import InterviewService<br/>
            - Seul l'onglet "Acquisition de Compétences" est actif<br/>
            - Si ça crash, le problème vient du composant SkillsAcquisition
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
