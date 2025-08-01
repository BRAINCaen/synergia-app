// ==========================================
// 📁 react-app/src/pages/EscapeProgressionPage.jsx
// PAGE ESCAPE PROGRESSION
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Rocket, Zap } from 'lucide-react';

const EscapeProgressionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            🔥 Escape Progression
          </h1>
          <p className="text-gray-400 text-lg">
            Défiez-vous avec des parcours d'apprentissage gamifiés
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Flame className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Mode Escape Game Bientôt Disponible</h2>
          <p className="text-gray-400 mb-6">
            Préparez-vous à vivre une expérience d'apprentissage révolutionnaire avec :
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Rocket className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Défis Chronométrés</h3>
              <p className="text-gray-400 text-sm">Résolvez des énigmes contre la montre</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Progression Rapide</h3>
              <p className="text-gray-400 text-sm">Gagnez de l'XP bonus en mode accéléré</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Flame className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Parcours Immersifs</h3>
              <p className="text-gray-400 text-sm">Vivez des scenarios captivants</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EscapeProgressionPage;
