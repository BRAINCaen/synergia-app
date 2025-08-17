// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT AVEC PREMIUMLAYOUT ET MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Trophy, Medal, TrendingUp, Star, Zap, Award } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month
  const [category, setCategory] = useState('xp'); // xp, tasks, badges

  // Charger les données du classement
  useEffect(() => {
    loadLeaderboard();
  }, [timeRange, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Récupérer les utilisateurs triés par XP
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('totalXp', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }));
      
      setLeaderboard(users);
    } catch (error) {
      console.error('Erreur chargement leaderboard:', error);
      // Données de démonstration en cas d'erreur
      setLeaderboard([
        { id: '1', displayName: 'Alice Champion', totalXp: 2450, level: 8, tasksCompleted: 45, badgesCount: 12, rank: 1 },
        { id: '2', displayName: 'Bob Expert', totalXp: 2100, level: 7, tasksCompleted: 38, badgesCount: 10, rank: 2 },
        { id: '3', displayName: 'Charlie Pro', totalXp: 1950, level: 6, tasksCompleted: 32, badgesCount: 8, rank: 3 },
        { id: '4', displayName: 'Diana Leader', totalXp: 1800, level: 6, tasksCompleted: 28, badgesCount: 7, rank: 4 },
        { id: '5', displayName: 'Eve Master', totalXp: 1650, level: 5, tasksCompleted: 25, badgesCount: 6, rank: 5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Trouver la position de l'utilisateur actuel
  const userPosition = leaderboard.findIndex(u => u.id === user?.uid) + 1;
  const userStats = leaderboard.find(u => u.id === user?.uid);

  // Statistiques pour le header
  const headerStats = [
    { 
      label: "Participants", 
      value: leaderboard.length, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Ma position", 
      value: userPosition > 0 ? `${userPosition}${userPosition === 1 ? 'er' : 'e'}` : 'Non classé', 
      icon: TrendingUp, 
      color: userPosition <= 3 ? "text-green-400" : "text-yellow-400" 
    },
    { 
      label: "Leader XP", 
      value: leaderboard[0]?.totalXp?.toLocaleString() || '0', 
      icon: Crown, 
      color: "text-yellow-400" 
    },
    { 
      label: "Mon XP", 
      value: userStats?.totalXp?.toLocaleString() || '0', 
      icon: Zap, 
      color: "text-purple-400" 
    }
  ];

  // Actions du header
  const headerActions = (
    <PremiumButton variant="primary" icon={Trophy}>
      Voir historique
    </PremiumButton>
  );

  // Fonction pour obtenir l'icône selon le rang
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  // Fonction pour obtenir la couleur de fond selon le rang
  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50';
      default: return 'bg-gray-800/50 border-gray-700/50';
    }
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Classement"
        subtitle="Chargement du classement..."
        icon={Trophy}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Classement"
      subtitle="Tableau de classement de l'équipe par performance"
      icon={Trophy}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Filtre période */}
        <div className="flex gap-2">
          <span className="text-gray-400 text-sm font-medium self-center">Période:</span>
          {['all', 'month', 'week'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeRange(period)}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                timeRange === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {period === 'all' && 'Tout temps'}
              {period === 'month' && 'Ce mois'}
              {period === 'week' && 'Cette semaine'}
            </button>
          ))}
        </div>

        {/* Filtre catégorie */}
        <div className="flex gap-2">
          <span className="text-gray-400 text-sm font-medium self-center">Catégorie:</span>
          {['xp', 'tasks', 'badges'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                category === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {cat === 'xp' && 'XP Total'}
              {cat === 'tasks' && 'Tâches'}
              {cat === 'badges' && 'Badges'}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="mb-8">
          <PremiumCard>
            <h3 className="text-white text-xl font-semibold mb-6 text-center">🏆 Podium</h3>
            <div className="flex justify-center items-end space-x-4">
              {/* 2e place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-16 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg flex items-end justify-center relative">
                  <Medal className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="absolute -top-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">2</span>
                </div>
                <div className="mt-2">
                  <p className="text-white font-semibold text-sm">{leaderboard[1]?.displayName}</p>
                  <p className="text-gray-400 text-xs">{leaderboard[1]?.totalXp} XP</p>
                </div>
              </motion.div>

              {/* 1e place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-24 h-20 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg flex items-end justify-center relative">
                  <Crown className="w-10 h-10 text-yellow-200 mb-2" />
                  <span className="absolute -top-2 bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">1</span>
                </div>
                <div className="mt-2">
                  <p className="text-white font-bold">{leaderboard[0]?.displayName}</p>
                  <p className="text-yellow-400 text-sm font-semibold">{leaderboard[0]?.totalXp} XP</p>
                </div>
              </motion.div>

              {/* 3e place */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-12 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg flex items-end justify-center relative">
                  <Award className="w-6 h-6 text-orange-200 mb-1" />
                  <span className="absolute -top-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">3</span>
                </div>
                <div className="mt-2">
                  <p className="text-white font-semibold text-sm">{leaderboard[2]?.displayName}</p>
                  <p className="text-gray-400 text-xs">{leaderboard[2]?.totalXp} XP</p>
                </div>
              </motion.div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Classement complet */}
      <PremiumCard>
        <h3 className="text-white text-xl font-semibold mb-6">Classement complet</h3>
        
        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                getRankBgColor(player.rank)
              } ${player.id === user?.uid ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rang et icône */}
                  <div className="flex-shrink-0">
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Informations joueur */}
                  <div>
                    <h4 className={`font-semibold ${
                      player.rank <= 3 ? 'text-white' : 'text-gray-200'
                    }`}>
                      {player.displayName || 'Utilisateur'}
                      {player.id === user?.uid && (
                        <span className="ml-2 text-blue-400 text-sm">(Vous)</span>
                      )}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Niveau {player.level || 1} • {player.tasksCompleted || 0} tâches
                    </p>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    player.rank <= 3 ? 'text-white' : 'text-gray-200'
                  }`}>
                    {category === 'xp' && `${player.totalXp?.toLocaleString() || 0} XP`}
                    {category === 'tasks' && `${player.tasksCompleted || 0} tâches`}
                    {category === 'badges' && `${player.badgesCount || 0} badges`}
                  </p>
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{player.totalXp || 0}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Trophy className="w-3 h-3" />
                      <span>{player.badgesCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucun participant */}
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Aucun participant</h3>
            <p className="text-gray-400">Le classement sera disponible dès que des utilisateurs participeront !</p>
          </div>
        )}
      </PremiumCard>

      {/* Ma position (si pas dans le top visible) */}
      {userPosition > 10 && userStats && (
        <div className="mt-6">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4">Ma position</h3>
            <div className="p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-full">
                    #{userPosition}
                  </span>
                  <div>
                    <h4 className="text-white font-semibold">{userStats.displayName}</h4>
                    <p className="text-gray-300 text-sm">Niveau {userStats.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{userStats.totalXp} XP</p>
                  <p className="text-gray-300 text-sm">{userStats.tasksCompleted} tâches</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default LeaderboardPage;
