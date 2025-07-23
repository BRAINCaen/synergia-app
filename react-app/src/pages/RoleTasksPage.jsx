// ==========================================
// 📁 react-app/src/pages/RoleTasksPage.jsx
// PAGE TÂCHES PAR RÔLE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Target, Star } from 'lucide-react';

const RoleTasksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            📋 Tâches par Rôle
          </h1>
          <p className="text-gray-400 text-lg">
            Découvrez les tâches spécifiques à chaque rôle et progressez dans votre domaine
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <CheckSquare className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Fonctionnalité en Développement</h2>
          <p className="text-gray-400 mb-6">
            Le système de tâches par rôle sera bientôt disponible. Vous pourrez alors :
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Target className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Tâches Ciblées</h3>
              <p className="text-gray-400 text-sm">Accédez aux tâches spécifiques à votre rôle</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Star className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Progression</h3>
              <p className="text-gray-400 text-sm">Suivez votre évolution dans votre domaine</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <CheckSquare className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Validation</h3>
              <p className="text-gray-400 text-sm">Validez vos compétences acquises</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleTasksPage;
