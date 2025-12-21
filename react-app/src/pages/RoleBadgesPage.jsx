// ==========================================
// react-app/src/pages/RoleBadgesPage.jsx
// PAGE BADGES PAR RÔLE - GLASSMORPHISM DESIGN
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Crown, Shield, Construction } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';

const RoleBadgesPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                  Badges par Rôle
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Débloquez les badges spécialisés
                </p>
              </div>
            </div>
          </div>

          {/* Coming soon card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Construction className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Collection en Préparation</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-6">
              Le système de badges par rôle sera bientôt déployé
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Badges Exclusifs</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Badges uniques pour chaque spécialisation</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Niveaux de Maîtrise</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Bronze, Argent, Or et Platine</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Reconnaissance</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Valorisez vos compétences</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default RoleBadgesPage;
