// ==========================================
// 📁 react-app/src/components/test/EscapeProgressionTest.jsx
// COMPOSANT DE TEST POUR VALIDER LA NOUVELLE PAGE
// ==========================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Trophy, 
  Star,
  ChevronRight,
  Play,
  CheckCircle
} from 'lucide-react';

const EscapeProgressionTest = () => {
  const navigate = useNavigate();

  const handleNavigateToEscape = () => {
    navigate('/escape-progression');
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Rocket size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">🚀 Nouvelle Page Escape Progression</h3>
            <p className="text-purple-100 mt-1">
              Page avec les 9 vrais rôles escape game créée !
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle size={16} />
                <span>9 Rôles Authentiques</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span>Système de Progression</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} />
                <span>Interface Interactive</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleNavigateToEscape}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 
                     rounded-lg px-6 py-3 font-medium transition-all duration-200
                     flex items-center gap-2 hover:scale-105"
        >
          <Play size={20} />
          Tester la Page
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <h4 className="font-medium mb-2">🎯 Fonctionnalités disponibles :</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>9 Rôles Escape Game</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Progression par Niveau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Simulation de Données</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Modal de Détail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Compétences & Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>Interface Responsive</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium">URL directe :</span>
          <code className="bg-black/20 px-2 py-1 rounded text-xs">
            /escape-progression
          </code>
        </div>
      </div>
    </div>
  );
};

export default EscapeProgressionTest;
