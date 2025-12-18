// ==========================================
// react-app/src/components/checkpoints/CheckpointRecap.jsx
// Récap automatique des accomplissements du trimestre
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Target,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const CheckpointRecap = ({ recap, userName }) => {
  if (!recap) {
    return (
      <div className="text-center py-12 text-gray-400">
        Chargement du récap...
      </div>
    );
  }

  const { quests, boosts, badges, level, stats, period } = recap;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header avec période */}
      <motion.div
        className="text-center p-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30"
        variants={itemVariants}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/30 rounded-full mb-4">
          <Calendar size={18} className="text-indigo-400" />
          <span className="text-indigo-300 font-medium">{period?.label}</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Bravo {userName} !
        </h2>
        <p className="text-gray-400">
          Voici ton parcours ce trimestre
        </p>
      </motion.div>

      {/* Stats principales */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        {/* Quêtes accomplies */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Trophy size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{quests?.total || 0}</div>
          <div className="text-sm text-gray-400">Quêtes accomplies</div>
        </div>

        {/* XP gagnés */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{quests?.totalXp || 0}</div>
          <div className="text-sm text-gray-400">XP gagnés</div>
        </div>

        {/* Boosts reçus */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{boosts?.total || 0}</div>
          <div className="text-sm text-gray-400">Boosts reçus</div>
        </div>

        {/* Badges débloqués */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
            <Award size={24} className="text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{badges?.total || 0}</div>
          <div className="text-sm text-gray-400">Badges débloqués</div>
        </div>
      </motion.div>

      {/* Niveau actuel */}
      <motion.div
        className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-6 border border-yellow-500/30"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Star size={32} className="text-white fill-current" />
            </div>
            <div>
              <div className="text-sm text-yellow-400 font-medium">Niveau actuel</div>
              <div className="text-3xl font-bold text-white">Niveau {level?.current || 1}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">XP Total</div>
            <div className="text-2xl font-bold text-yellow-400">{level?.totalXp || 0} XP</div>
          </div>
        </div>
      </motion.div>

      {/* Quêtes accomplies - Liste */}
      {quests?.list && quests.list.length > 0 && (
        <motion.div
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-green-400" />
            Quêtes accomplies ce trimestre
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {quests.list.map((quest, index) => (
              <motion.div
                key={quest.id || index}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target size={16} className="text-green-400" />
                  </div>
                  <span className="text-gray-200">{quest.title}</span>
                </div>
                <span className="text-yellow-400 font-medium">+{quest.xp} XP</span>
              </motion.div>
            ))}
          </div>
          {quests.total > quests.list.length && (
            <div className="text-center mt-4 text-sm text-gray-500">
              ... et {quests.total - quests.list.length} autres quêtes
            </div>
          )}
        </motion.div>
      )}

      {/* Boosts par type */}
      {boosts?.byType && Object.keys(boosts.byType).length > 0 && (
        <motion.div
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-pink-400" />
            Boosts reçus par type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(boosts.byType).map(([type, count]) => {
              const boostConfig = {
                competence: { emoji: '🧠', label: 'Compétence', color: 'from-blue-500 to-cyan-500' },
                effort: { emoji: '💪', label: 'Effort', color: 'from-orange-500 to-yellow-500' },
                collaboration: { emoji: '🤝', label: 'Collaboration', color: 'from-green-500 to-emerald-500' },
                innovation: { emoji: '💡', label: 'Innovation', color: 'from-purple-500 to-pink-500' }
              };
              const config = boostConfig[type] || { emoji: '⚡', label: type, color: 'from-gray-500 to-gray-600' };

              return (
                <div
                  key={type}
                  className={`bg-gradient-to-r ${config.color} p-4 rounded-xl text-center`}
                >
                  <div className="text-2xl mb-1">{config.emoji}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-white/80">{config.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Badges débloqués */}
      {badges?.list && badges.list.length > 0 && (
        <motion.div
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-400" />
            Badges débloqués
          </h3>
          <div className="flex flex-wrap gap-3">
            {badges.list.map((badge, index) => (
              <div
                key={badge.id || index}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30"
              >
                <span className="text-xl">{badge.emoji || '🏆'}</span>
                <span className="text-purple-300 font-medium">{badge.name || badge.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats supplémentaires */}
      {stats && (
        <motion.div
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            Statistiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-400">XP moyen par quête</span>
              <span className="text-white font-medium">{stats.averageXpPerQuest} XP</span>
            </div>
            {stats.mostActiveMonth && (
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-400">Mois le plus actif</span>
                <span className="text-white font-medium">
                  {stats.mostActiveMonth.month} ({stats.mostActiveMonth.count} quêtes)
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Call to action */}
      <motion.div
        className="text-center py-6"
        variants={itemVariants}
      >
        <p className="text-gray-400 mb-2">
          Continue sur ta lancée !
        </p>
        <div className="flex items-center justify-center gap-2 text-indigo-400">
          <span className="font-medium">Passe maintenant à l'auto-réflexion</span>
          <ChevronRight size={20} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckpointRecap;
