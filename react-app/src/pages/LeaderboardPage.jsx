// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT UNIFIÉE - HOOK CENTRAL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Award, TrendingUp } from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';

export const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const { leaderboard, getUserRank, loading } = useGamificationSync();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  const userRank = getUserRank();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Classement
          </h1>
          <p className="text-gray-400">
            {leaderboard.length} joueurs • Votre position: #{userRank || '?'}
          </p>
        </div>

        {/* Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2ème place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-6 text-center text-white mt-8"
            >
              <Medal className="w-12 h-12 mx-auto mb-3" />
              <div className="text-6xl mb-2">🥈</div>
              <h3 className="text-xl font-bold mb-1">{leaderboard[1].displayName}</h3>
              <p className="text-2xl font-bold mb-1">{leaderboard[1].totalXp} XP</p>
              <p className="text-sm opacity-75">Niveau {leaderboard[1].level}</p>
            </motion.div>

            {/* 1ère place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-center text-white"
            >
              <Trophy className="w-16 h-16 mx-auto mb-3" />
              <div className="text-6xl mb-2">🏆</div>
              <h3 className="text-2xl font-bold mb-1">{leaderboard[0].displayName}</h3>
              <p className="text-3xl font-bold mb-1">{leaderboard[0].totalXp} XP</p>
              <p className="text-sm opacity-75">Niveau {leaderboard[0].level}</p>
            </motion.div>

            {/* 3ème place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-center text-white mt-8"
            >
              <Award className="w-12 h-12 mx-auto mb-3" />
              <div className="text-6xl mb-2">🥉</div>
              <h3 className="text-xl font-bold mb-1">{leaderboard[2].displayName}</h3>
              <p className="text-2xl font-bold mb-1">{leaderboard[2].totalXp} XP</p>
              <p className="text-sm opacity-75">Niveau {leaderboard[2].level}</p>
            </motion.div>
          </div>
        )}

        {/* Liste complète */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Classement Complet</h2>
          
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  player.id === user?.uid
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : index < 3
                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                    : 'bg-gray-700/30 hover:bg-gray-700/50'
                }`}
              >
                {/* Rang */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>

                {/* Infos joueur */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{player.displayName}</h3>
                    {player.id === user?.uid && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Vous</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Niveau {player.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-blue-400" />
                      {player.badges} badges
                    </span>
                    {player.tasksCompleted > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        {player.tasksCompleted} quêtes
                      </span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{player.totalXp}</div>
                  <div className="text-xs text-gray-400">XP Total</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default LeaderboardPage;






