// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT - DESIGN PREMIUM
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Crown,
  Award,
  Zap,
  Target,
  Users,
  Calendar,
  BarChart3,
  Flame,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const { globalStats, loading } = useUnifiedFirebaseData();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('xp');
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Données d'exemple pour le leaderboard
  const sampleLeaderboard = [
    {
      id: '1',
      name: 'Alan Boehme',
      email: 'alan.boehme61@gmail.com',
      avatar: '👨‍💼',
      level: 8,
      xp: 2450,
      tasksCompleted: 47,
      badges: 12,
      streak: 15,
      weeklyProgress: 385,
      isCurrentUser: true
    },
    {
      id: '2',
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      avatar: '👩‍💻',
      level: 7,
      xp: 2180,
      tasksCompleted: 42,
      badges: 10,
      streak: 12,
      weeklyProgress: 320
    },
    {
      id: '3',
      name: 'Thomas Dubois',
      email: 'thomas.dubois@example.com',
      avatar: '👨‍🔬',
      level: 6,
      xp: 1950,
      tasksCompleted: 38,
      badges: 8,
      streak: 9,
      weeklyProgress: 275
    },
    {
      id: '4',
      name: 'Marie Leroy',
      email: 'marie.leroy@example.com',
      avatar: '👩‍🎨',
      level: 6,
      xp: 1720,
      tasksCompleted: 35,
      badges: 7,
      streak: 6,
      weeklyProgress: 210
    },
    {
      id: '5',
      name: 'Pierre Moreau',
      email: 'pierre.moreau@example.com',
      avatar: '👨‍🏫',
      level: 5,
      xp: 1540,
      tasksCompleted: 31,
      badges: 6,
      streak: 8,
      weeklyProgress: 195
    }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setLeaderboardData(sampleLeaderboard);
  }, [selectedPeriod, selectedCategory]);

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{position}</span>;
    }
  };

  const getRankBackground = (position, isCurrentUser) => {
    if (isCurrentUser) {
      return 'bg-blue-500/20 border-blue-500/30 ring-2 ring-blue-500/50';
    }
    
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-gray-800/50 border-gray-700/50';
    }
  };

  const categories = [
    { id: 'xp', label: 'Points XP', icon: Zap },
    { id: 'tasks', label: 'Tâches', icon: Target },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'streak', label: 'Série', icon: Flame }
  ];

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            🏆 Classement des Champions
          </h1>
          <p className="text-gray-400 text-lg">
            Découvrez les leaders de Synergia et suivez votre progression
          </p>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Période */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Podium (Top 3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {leaderboardData.slice(0, 3).map((user, index) => {
            const position = index + 1;
            return (
              <div
                key={user.id}
                className={`${getRankBackground(position, user.isCurrentUser)} 
                  backdrop-blur-sm border rounded-xl p-6 text-center 
                  ${position === 1 ? 'md:order-2 transform md:scale-105' : 
                    position === 2 ? 'md:order-1' : 'md:order-3'}`}
              >
                <div className="flex justify-center mb-4">
                  {getRankIcon(position)}
                </div>
                
                <div className="text-4xl mb-3">{user.avatar}</div>
                
                <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
                <p className="text-gray-400 text-sm mb-4">Niveau {user.level}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP:</span>
                    <span className="text-yellow-400 font-bold">{user.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tâches:</span>
                    <span className="text-green-400 font-bold">{user.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Badges:</span>
                    <span className="text-purple-400 font-bold">{user.badges}</span>
                  </div>
                </div>
                
                {position === 1 && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-4 text-yellow-400"
                  >
                    👑 Champion
                  </motion.div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Classement complet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Classement Complet
            </h2>
          </div>

          <div className="divide-y divide-gray-700/50">
            {leaderboardData.map((user, index) => {
              const position = index + 1;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 hover:bg-gray-700/30 transition-colors ${
                    user.isCurrentUser ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(position)}
                      </div>
                      
                      <div className="text-3xl">{user.avatar}</div>
                      
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                              Vous
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-400 text-sm">Niveau {user.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold">{user.xp.toLocaleString()}</div>
                        <div className="text-gray-500">XP</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-green-400 font-bold">{user.tasksCompleted}</div>
                        <div className="text-gray-500">Tâches</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-purple-400 font-bold">{user.badges}</div>
                        <div className="text-gray-500">Badges</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-orange-400 font-bold">{user.streak}</div>
                        <div className="text-gray-500">Série</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">+{user.weeklyProgress}</span>
                        </div>
                        <div className="text-gray-500">Cette semaine</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Statistiques personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Votre Performance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">1er</div>
              <div className="text-gray-400 text-sm">Position Actuelle</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">+385</div>
              <div className="text-gray-400 text-sm">XP cette semaine</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">15</div>
              <div className="text-gray-400 text-sm">Jours de série</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">⭐</div>
              <div className="text-gray-400 text-sm">Top Performer</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
