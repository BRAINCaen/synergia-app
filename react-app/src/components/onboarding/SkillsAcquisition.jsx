// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// COMPOSANT ACQUISITION DE COMPÉTENCES - VERSION ULTRA-MINIMALE TEMPORAIRE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Plus,
  RefreshCw
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';

// 🔧 DÉFINITIONS LOCALES TEMPORAIRES (éviter les imports problématiques)
const TEMP_EXPERIENCES = {
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    description: 'Maîtriser l\'animation et la gestion des sessions de jeu'
  },
  maintenance: {
    id: 'maintenance', 
    name: 'Entretien & Maintenance',
    icon: '🔧',
    description: 'Gérer la maintenance et l\'entretien des salles'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis',
    icon: '⭐',
    description: 'Optimiser la réputation en ligne et gérer les avis clients'
  }
};

const SkillsAcquisition = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // 🚀 Fonction temporaire de test (sans Firebase pour l'instant)
  const handleStartAcquisition = async () => {
    console.log('🚀 Démarrage acquisition compétences pour:', user?.uid);
    setLoading(true);
    
    // Simulation d'action réussie
    setTimeout(() => {
      setLoading(false);
      alert('Profil de compétences créé avec succès ! (version temporaire)');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-white mb-4">
        Acquisition de Compétences
      </h3>
      <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
        Commencez votre parcours d'acquisition de compétences en sélectionnant les expériences 
        qui vous intéressent. (Version temporaire simplifiée)
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        {Object.values(TEMP_EXPERIENCES).map((experience) => (
          <div 
            key={experience.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="text-3xl mb-4">{experience.icon}</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {experience.name}
            </h4>
            <p className="text-gray-400 text-sm">
              {experience.description}
            </p>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleStartAcquisition}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
      >
        {loading ? (
          <>
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Initialisation...
          </>
        ) : (
          <>
            <Plus className="h-5 w-5 mr-2" />
            Commencer l'acquisition de compétences
          </>
        )}
      </button>
      
      <div className="mt-8 p-4 bg-yellow-900 border border-yellow-700 rounded-lg max-w-md mx-auto">
        <p className="text-yellow-300 text-sm">
          ⚠️ Version temporaire simplifiée sans Firebase.<br/>
          Cette version teste uniquement l'affichage sans imports problématiques.
        </p>
      </div>
    </div>
  );
};

export default SkillsAcquisition;
