// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES UNIFIÉE - HOOK CENTRAL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Star, Trophy, Target } from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';

const BadgesPage = () => {
  const { gamification, loading } = useGamificationSync();

  if (loading || !gamification) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Badges disponibles (à adapter selon ton système)
  const allBadges = [
    { id: 'welcome', name: 'Bienvenue', icon: '👋', description: 'Premier pas', unlocked: true },
    { id: 'first_task', name: 'Première Quête', icon: '🎯', description: 'Compléter une quête', unlocked: gamification.tasksCompleted > 0 },
    { id: 'level_5', name: 'Niveau 5', icon: '⭐', description: 'Atteindre le niveau 5', unlocked: gamification.level >= 5 },
    { id: 'level_10', name: 'Niveau 10', icon: '🌟', description: 'Atteindre le niveau 10', unlocked: gamification.level >= 10 },
    { id: 'streak_7', name: 'Série de 7', icon: '🔥', description: '7 jours consécutifs', unlocked: gamification.loginStreak >= 7 },
    { id: 'tasks_10', name: '10 Quêtes', icon: '🏆', description: 'Compléter 10 quêtes', unlocked: gamification.tasksCompleted >= 10 },
    { id: 'tasks_50', name: '50 Quêtes', icon: '💪', description: 'Compléter 50 quêtes', unlocked: gamification.tasksCompleted >= 50 },
    { id: 'xp_1000', name: '1000 XP', icon: '💎', description: 'Atteindre 1000 XP', unlocked: gamification.totalXp >= 1000 },
  ];

  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const lockedBadges = allBadges.filter(b => !b.unlocked);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-yellow-400" />
            Collection de Badges
          </h1>
          <p className="text-gray-400">
            {unlockedBadges.length} / {allBadges.length} badges débloqués ({Math.round((unlockedBadges.length / allBadges.length) * 100)}%)
          </p>
        </div>

        {/* Progression */}
        <div className="mb-8">
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedBadges.length / allBadges.length) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Badges Débloqués */}
        {unlockedBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Badges Débloqués</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {unlockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6 text-center"
                >
                  <div className="text-6xl mb-3">{badge.icon}</div>
                  <h3 className="text-white font-bold mb-1">{badge.name}</h3>
                  <p className="text-gray-400 text-xs">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Verrouillés */}
        {lockedBadges.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">À Débloquer</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {lockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center opacity-50"
                >
                  <div className="relative">
                    <div className="text-6xl mb-3 filter grayscale">{badge.icon}</div>
                    <Lock className="absolute top-0 right-0 w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-gray-400 font-bold mb-1">{badge.name}</h3>
                  <p className="text-gray-600 text-xs">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default BadgesPage;
