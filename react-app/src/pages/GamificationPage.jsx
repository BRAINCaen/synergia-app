// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION COMPLÈTE - TOUS LES SYSTÈMES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Target, 
  Gift, 
  Crown, 
  Flame, 
  Zap, 
  Award,
  Medal,
  Users,
  Calendar,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Lock,
  Unlock,
  Plus,
  RotateCcw
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎮 PAGE GAMIFICATION ULTRA-COMPLÈTE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [gamificationData, setGamificationData] = useState({
    user: {
      level: 7,
      xp: 1250,
      nextLevelXP: 2000,
      totalXP: 1250,
      rank: 15,
      streak: 5,
      badges: []
    },
    leaderboard: [],
    rewards: [],
    challenges: [],
    achievements: []
  });

  console.log('🎮 GamificationPage rendue pour:', user?.email);

  // Charger les données de gamification
  useEffect(() => {
    loadGamificationData();
  }, [user]);

  const loadGamificationData = async () => {
    try {
      // Données de base utilisateur
      const userXP = user?.gamification?.totalXP || 1250;
      const level = Math.floor(userXP / 1000) + 1;
      const nextLevelXP = level * 1000;

      // Badges disponibles (simulation)
      const allBadges = [
        { id: 1, name: 'Premier Pas', description: 'Première connexion', icon: '🎯', category: 'milestone', rarity: 'common', unlocked: true, unlockedAt: '2024-01-15' },
        { id: 2, name: 'Productif', description: 'Compléter 10 tâches', icon: '⚡', category: 'achievement', rarity: 'uncommon', unlocked: true, unlockedAt: '2024-01-20' },
        { id: 3, name: 'Collaborateur', description: 'Participer à 5 projets', icon: '👥', category: 'social', rarity: 'rare', unlocked: false },
        { id: 4, name: 'Expert', description: 'Atteindre le niveau 10', icon: '🧠', category: 'milestone', rarity: 'epic', unlocked: false },
        { id: 5, name: 'Mentor', description: 'Aider 10 collègues', icon: '🎓', category: 'social', rarity: 'legendary', unlocked: false },
        { id: 6, name: 'Innovateur', description: 'Créer 3 projets innovants', icon: '💡', category: 'creativity', rarity: 'rare', unlocked: false },
        { id: 7, name: 'Persévérant', description: 'Streak de 30 jours', icon: '🔥', category: 'dedication', rarity: 'epic', unlocked: false },
        { id: 8, name: 'Leader', description: 'Diriger 5 projets', icon: '👑', category: 'leadership', rarity: 'legendary', unlocked: false }
      ];

      // Récompenses disponibles
      const rewards = [
        { id: 1, name: 'Formation Premium', description: 'Accès à une formation avancée', cost: 500, icon: '📚', type: 'education', available: true },
        { id: 2, name: 'Journée Home Office', description: 'Une journée de télétravail bonus', cost: 300, icon: '🏠', type: 'benefit', available: true },
        { id: 3, name: 'Bon Restaurant', description: 'Repas d\'équipe offert', cost: 800, icon: '🍽️', type: 'social', available: true },
        { id: 4, name: 'Matériel Bureau', description: 'Upgrade de votre setup', cost: 1000, icon: '💻', type: 'equipment', available: false },
        { id: 5, name: 'Conférence Tech', description: 'Participation à un événement', cost: 1500, icon: '🎤', type: 'education', available: false }
      ];

      // Défis actifs
      const challenges = [
        { id: 1, name: 'Marathon Productivité', description: 'Compléter 20 tâches cette semaine', progress: 12, target: 20, reward: 200, endDate: '2024-01-30', type: 'weekly', difficulty: 'medium' },
        { id: 2, name: 'Collaborateur du Mois', description: 'Participer à 3 nouveaux projets', progress: 1, target: 3, reward: 500, endDate: '2024-01-31', type: 'monthly', difficulty: 'hard' },
        { id: 3, name: 'Streak Master', description: 'Maintenir un streak de 7 jours', progress: 5, target: 7, reward: 150, endDate: '2024-01-25', type: 'daily', difficulty: 'easy' }
      ];

      // Leaderboard (simulation)
      const leaderboard = [
        { rank: 1, name: 'Alice Martin', avatar: '👩‍💼', xp: 3450, level: 4, badge: '👑' },
        { rank: 2, name: 'Thomas Dubois', avatar: '👨‍💻', xp: 3200, level: 4, badge: '🥈' },
        { rank: 3, name: 'Sophie Laurent', avatar: '👩‍🎨', xp: 2980, level: 3, badge: '🥉' },
        { rank: 4, name: 'Marc Bernard', avatar: '👨‍🔬', xp: 2750, level: 3, badge: '⭐' },
        { rank: 15, name: user?.displayName || user?.email?.split('@')[0] || 'Vous', avatar: '👤', xp: userXP, level: level, badge: '🎯', isCurrentUser: true }
      ];

      setGamificationData({
        user: {
          level,
          xp: userXP,
          nextLevelXP,
          totalXP: userXP,
          rank: 15,
          streak: 5,
          badges: allBadges.filter(b => b.unlocked)
        },
        leaderboard,
        rewards,
        challenges,
        achievements: allBadges
      });

      console.log('🎮 Données gamification chargées');
    } catch (error) {
      console.error('❌ Erreur chargement gamification:', error);
    }
  };

  // Réclamer une récompense
  const claimReward = (reward) => {
    if (gamificationData.user.xp >= reward.cost) {
      console.log('🎁 Récompense réclamée:', reward.name);
      // TODO: Intégrer avec le système de récompenses
      alert(`🎉 Récompense "${reward.name}" réclamée ! (-${reward.cost} XP)`);
    } else {
      alert(`❌ XP insuffisant ! Il vous faut ${reward.cost - gamificationData.user.xp} XP de plus.`);
    }
  };

  // Rejoindre un défi
  const joinChallenge = (challenge) => {
    console.log('🎯 Défi rejoint:', challenge.name);
    alert(`🚀 Vous avez rejoint le défi "${challenge.name}" !`);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'rewards', label: 'Récompenses', icon: Gift },
    { id: 'challenges', label: 'Défis', icon: Target },
    { id: 'leaderboard', label: 'Classement', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            🎉 HEADER GAMIFICATION
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            🎮 Centre de Gamification
          </h1>
          <p className="text-gray-400 text-lg">
            Progressez, débloquez des récompenses et défiez vos collègues !
          </p>
        </motion.div>

        {/* ==========================================
            📊 STATISTIQUES UTILISATEUR
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Niveau et XP */}
            <div className="md:col-span-2 text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{gamificationData.user.level}</span>
                </div>
                <div className="text-lg font-bold text-white">Niveau {gamificationData.user.level}</div>
                <div className="text-gray-400 text-sm">{gamificationData.user.xp} / {gamificationData.user.nextLevelXP} XP</div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(gamificationData.user.xp / gamificationData.user.nextLevelXP) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">
                {gamificationData.user.nextLevelXP - gamificationData.user.xp} XP pour le niveau suivant
              </p>
            </div>

            {/* Statistiques */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{gamificationData.user.rank}</div>
                <div className="text-gray-400 text-sm">Classement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{gamificationData.user.streak}</div>
                <div className="text-gray-400 text-sm">Streak jours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{gamificationData.user.badges.length}</div>
                <div className="text-gray-400 text-sm">Badges</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            🔄 NAVIGATION TABS
            ========================================== */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            📄 CONTENU DES TABS
            ========================================== */}
        <AnimatePresence mode="wait">
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Défis actifs */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Défis Actifs
                  </h3>
                  
                  <div className="space-y-4">
                    {gamificationData.challenges.slice(0, 3).map(challenge => (
                      <div key={challenge.id} className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{challenge.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            challenge.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                            challenge.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progression</span>
                            <span className="text-white">{challenge.progress}/{challenge.target}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 text-sm">🏆 {challenge.reward} XP</span>
                          <span className="text-gray-400 text-sm">Expire: {new Date(challenge.endDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to="#challenges"
                    onClick={() => setActiveTab('challenges')}
                    className="block mt-4 text-center text-blue-400 hover:text-blue-300"
                  >
                    Voir tous les défis →
                  </Link>
                </div>

                {/* Badges récents */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Badges Récents
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {gamificationData.user.badges.slice(0, 4).map(badge => (
                      <div key={badge.id} className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h4 className="font-medium text-yellow-400 text-sm">{badge.name}</h4>
                        <p className="text-gray-400 text-xs">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to="#badges"
                    onClick={() => setActiveTab('badges')}
                    className="block text-center text-yellow-400 hover:text-yellow-300"
                  >
                    Voir tous les badges →
                  </Link>
                </div>
              </div>

              {/* Top 5 Leaderboard */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-400" />
                  Top 5 du Classement
                </h3>
                
                <div className="space-y-3">
                  {gamificationData.leaderboard.slice(0, 5).map(player => (
                    <div 
                      key={player.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        player.isCurrentUser ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-gray-700/30'
                      }`}
                    >
                      <div className="text-2xl">{player.badge}</div>
                      <div className="text-lg">{player.avatar}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {player.name} {player.isCurrentUser && '(Vous)'}
                        </div>
                        <div className="text-gray-400 text-sm">Niveau {player.level} • {player.xp.toLocaleString()} XP</div>
                      </div>
                      <div className="text-yellow-400 font-bold">#{player.rank}</div>
                    </div>
                  ))}
                </div>
                
                <Link 
                  to="#leaderboard"
                  onClick={() => setActiveTab('leaderboard')}
                  className="block mt-4 text-center text-purple-400 hover:text-purple-300"
                >
                  Voir le classement complet →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Badges */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Collection de Badges</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gamificationData.achievements.map(badge => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-6 rounded-xl text-center border-2 ${
                        badge.unlocked 
                          ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/50' 
                          : 'bg-gray-700/20 border-gray-600/50'
                      }`}
                    >
                      <div className="text-4xl mb-3">{badge.unlocked ? badge.icon : '🔒'}</div>
                      <h4 className={`font-bold mb-2 ${badge.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          badge.rarity === 'common' ? 'bg-gray-600 text-gray-300' :
                          badge.rarity === 'uncommon' ? 'bg-green-600 text-green-200' :
                          badge.rarity === 'rare' ? 'bg-blue-600 text-blue-200' :
                          badge.rarity === 'epic' ? 'bg-purple-600 text-purple-200' :
                          'bg-yellow-600 text-yellow-200'
                        }`}>
                          {badge.rarity}
                        </span>
                      </div>
                      
                      {badge.unlocked && badge.unlockedAt && (
                        <p className="text-xs text-gray-500">
                          Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Récompenses */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Boutique de Récompenses</h3>
                  <div className="text-yellow-400 font-bold">
                    💰 {gamificationData.user.xp} XP disponibles
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gamificationData.rewards.map(reward => (
                    <motion.div
                      key={reward.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-xl border ${
                        reward.available && gamificationData.user.xp >= reward.cost
                          ? 'bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/50'
                          : 'bg-gray-700/20 border-gray-600/50'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{reward.icon}</div>
                        <h4 className="font-bold text-white mb-1">{reward.name}</h4>
                        <p className="text-gray-400 text-sm">{reward.description}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-3">
                          {reward.cost} XP
                        </div>
                        
                        <button
                          onClick={() => claimReward(reward)}
                          disabled={!reward.available || gamificationData.user.xp < reward.cost}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            reward.available && gamificationData.user.xp >= reward.cost
                              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {!reward.available ? '🔒 Indisponible' :
                           gamificationData.user.xp < reward.cost ? '💰 XP insuffisant' : '🎁 Réclamer'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Défis */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Défis Disponibles</h3>
                
                <div className="space-y-6">
                  {gamificationData.challenges.map(challenge => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-6 bg-gray-700/30 rounded-xl border border-gray-600/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-white">{challenge.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              challenge.type === 'daily' ? 'bg-green-900/50 text-green-400' :
                              challenge.type === 'weekly' ? 'bg-blue-900/50 text-blue-400' :
                              'bg-purple-900/50 text-purple-400'
                            }`}>
                              {challenge.type === 'daily' ? '📅 Quotidien' :
                               challenge.type === 'weekly' ? '📊 Hebdomadaire' : '🗓️ Mensuel'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              challenge.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                              challenge.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {challenge.difficulty === 'easy' ? '😊 Facile' :
                               challenge.difficulty === 'medium' ? '😐 Moyen' : '😤 Difficile'}
                            </span>
                          </div>
                          <p className="text-gray-400 mb-4">{challenge.description}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-lg">🏆 {challenge.reward} XP</div>
                          <div className="text-gray-400 text-sm">Expire: {new Date(challenge.endDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progression</span>
                          <span className="text-white font-medium">
                            {challenge.progress}/{challenge.target} ({Math.round((challenge.progress / challenge.target) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {challenge.progress >= challenge.target ? (
                            <span className="text-green-400 font-medium">✅ Défi complété !</span>
                          ) : (
                            <span>Encore {challenge.target - challenge.progress} à faire</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => joinChallenge(challenge)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            challenge.progress >= challenge.target
                              ? 'bg-green-600 text-white cursor-default'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                          }`}
                          disabled={challenge.progress >= challenge.target}
                        >
                          {challenge.progress >= challenge.target ? '🏆 Complété' : '🚀 Rejoindre'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">🏆 Classement Global</h3>
                
                {/* Podium */}
                <div className="flex items-end justify-center gap-4 mb-8">
                  {gamificationData.leaderboard.slice(0, 3).map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`text-center p-4 rounded-xl ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 h-32' :
                        index === 1 ? 'bg-gradient-to-br from-gray-700/30 to-gray-600/30 border-2 border-gray-400/50 h-28' :
                        'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/50 h-24'
                      }`}
                    >
                      <div className="text-3xl mb-1">{player.badge}</div>
                      <div className="text-lg mb-1">{player.avatar}</div>
                      <div className="font-bold text-white text-sm">{player.name}</div>
                      <div className="text-xs text-gray-400">Niv. {player.level}</div>
                      <div className="text-yellow-400 text-xs font-bold">{player.xp.toLocaleString()} XP</div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Liste complète */}
                <div className="space-y-2">
                  {gamificationData.leaderboard.map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        player.isCurrentUser 
                          ? 'bg-blue-900/30 border border-blue-700/50' 
                          : 'bg-gray-700/20 hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="w-8 text-center">
                        <span className={`font-bold ${
                          player.rank === 1 ? 'text-yellow-400' :
                          player.rank === 2 ? 'text-gray-400' :
                          player.rank === 3 ? 'text-orange-400' :
                          'text-white'
                        }`}>
                          #{player.rank}
                        </span>
                      </div>
                      
                      <div className="text-2xl">{player.badge}</div>
                      <div className="text-xl">{player.avatar}</div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {player.name} {player.isCurrentUser && '(Vous)'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Niveau {player.level} • {player.xp.toLocaleString()} XP
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.min((player.xp / 5000) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    💡 Complétez des tâches et participez à des projets pour grimper dans le classement !
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            🔗 LIENS RAPIDES
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Link
            to="/leaderboard"
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Crown className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Classement Complet</span>
          </Link>
          
          <Link
            to="/badges"
            className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Mes Badges</span>
          </Link>
          
          <Link
            to="/rewards"
            className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Gift className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Mes Récompenses</span>
          </Link>
          
          <Link
            to="/role-progression"
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Target className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Progression Rôles</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationPage;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('🎮 GamificationPage COMPLÈTE chargée');
console.log('🏆 Tous les systèmes: Badges, Récompenses, Défis, Classement');
console.log('🚀 Interface premium avec animations et interactions');
