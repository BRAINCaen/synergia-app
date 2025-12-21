// ==========================================
// react-app/src/pages/RoleProgressionPage.jsx
// PAGE PROGRESSION RÔLES - GLASSMORPHISM DESIGN
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Construction } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';

const RoleProgressionPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/30 to-indigo-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                  Progression des Rôles
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Suivez votre évolution
                </p>
              </div>
            </div>
          </div>

          {/* Coming soon card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/30 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Construction className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">En cours de développement</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
              Cette page est actuellement en développement. Revenez bientôt pour suivre votre progression dans les différents rôles Synergia.
            </p>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default RoleProgressionPage;
