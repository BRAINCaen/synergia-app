// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// Interface complète du leaderboard avec animations
// ==========================================

import React, { useState, useEffect } from 'react';
import Card from '../../shared/components/ui/Card.jsx';
import leaderboardService from '../../core/services/leaderboardService.js';
import useUserStore from '../../shared/stores/userStore.js';

const Leaderboard = () => {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedRanks, setAnimatedRanks] = useState(new Set());

  const tabs = [
    { id: 'global', name: 'Global', icon: '🌍' },
    { id: 'weekly', name: 'Hebdomadaire', icon: '📅' },
    { id: 'department', name: 'Département', icon: '🏢' }
  ];

  useEffect(() => {
    loadLeaderboardData();
    if (profile) {
      loadUserData();
    }
  }, [activeTab, profile]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    
    try {
      if (activeTab === 'global') {
        const result = await leaderboardService.getGlobalLeaderboard(50);
        if (!result.error) {
          setLeaderboardData(result.data);
          animateRankChanges(result.data);
        }
      } else if (activeTab === 'weekly') {
        const result = await leaderboardService.getWeeklyLeaderboard(20);
        if (!result.error) {
          setWeeklyData(result.data);
        }
      } else if (activeTab === 'department' && profile?.profile?.department) {
        const result = await leaderboardService.getDepartmentLeaderboard(
          profile.profile.department, 20
        );
        if (!result.error) {
          setLeaderboardData(result.data);
        }
      }
    } catch (error) {
      console.error('Erreur chargement leaderboard:', error);
    }
    
    setLoading(false);
  };

  const loadUserData = async () => {
    if (!profile) return;
    
    // Charger le rang de l'utilisateur
    const rankResult = await leaderboardService.getUserRank(profile.uid);
    if (!rankResult.error) {
      setUserRank(rankResult.rank);
    }
    
    // Charger les stats de comparaison
    const statsResult = await leaderboardService.getComparisonStats(profile.uid);
    if (!statsResult.error) {
      setUserStats(statsResult.stats);
    }
  };

  const animateRankChanges = (newData) => {
    const newAnimated = new Set();
    newData.slice(0, 10).forEach(user => {
      if (Math.random() > 0.7) { // Simuler des changements
        newAnimated.add(user.uid);
      }
    });
    setAnimatedRanks(newAnimated);
    
    // Retirer l'animation après 2 secondes
    setTimeout(() => setAnimatedRanks(new Set()), 2000);
  };

  const getCurrentData = () => {
    return activeTab === 'weekly' ? weeklyData : leaderboardData;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-500';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <Card.Content>
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 mb-2">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec stats utilisateur */}
      {profile && userStats && (
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Card.Content className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userRank || '?'}</div>
                <div className="text-purple-200 text-sm">Votre Rang</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.user.xp.toLocaleString()}</div>
                <div className="text-purple-200 text-sm">XP Total</div>
                <div className="text-xs text-purple-300">
                  {userStats.comparisons.xpVsAvg >= 0 ? '+' : ''}{userStats.comparisons.xpVsAvg} vs moyenne
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.comparisons.percentile}%</div>
                <div className="text-purple-200 text-sm">Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{userStats.user.badges}</div>
                <div className="text-purple-200 text-sm">Badges</div>
                <div className="text-xs text-purple-300">
                  {userStats.comparisons.badgesVsAvg >= 0 ? '+' : ''}{userStats.comparisons.badgesVsAvg} vs moyenne
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Onglets */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Podium Top 3 */}
      <Card>
        <Card.Content className="p-6">
          <div className="flex justify-center items-end space-x-4 mb-6">
            {getCurrentData().slice(0, 3).map((user, index) => (
              <PodiumPlace
                key={user.uid}
                user={user}
                position={index + 1}
                animated={animatedRanks.has(user.uid)}
              />
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Liste complète du leaderboard */}
      <Card>
        <Card.Header>
          <Card.Title>
            📊 Classement Complet
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-2">
            {getCurrentData().slice(3).map((user, index) => (
              <LeaderboardRow
                key={user.uid}
                user={user}
                rank={user.rank}
                animated={animatedRanks.has(user.uid)}
                isCurrentUser={profile?.uid === user.uid}
                activeTab={activeTab}
              />
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Stats additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrendingCard data={getCurrentData().slice(0, 5)} />
        <DepartmentStats userDepartment={profile?.profile?.department} />
      </div>
    </div>
  );
};

// Composant pour une place sur le podium
const PodiumPlace = ({ user, position, animated }) => {
  const heights = { 1: 'h-24', 2: 'h-20', 3: 'h-16' };
  const colors = {
    1: 'from-yellow-400 to-orange-500',
    2: 'from-gray-300 to-gray-500', 
    3: 'from-orange-400 to-orange-600'
  };
  
  return (
    <div className={`text-center ${animated ? 'animate-bounce' : ''}`}>
      <div className="relative mb-2">
        <img
          src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.uid}`}
          alt={user.displayName}
          className="w-16 h-16 rounded-full border-4 border-white shadow-lg mx-auto"
        />
        <div
          className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${colors[position]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
        >
          {position === 1 ? '👑' : position}
        </div>
      </div>
      
      <div
        className={`${heights[position]} bg-gradient-to-t ${colors[position]} rounded-t-lg flex flex-col justify-end p-3 min-w-[100px]`}
      >
        <div className="text-white font-bold text-sm truncate">
          {user.displayName}
        </div>
        <div className="text-white text-xs opacity-90">
          {user.xp?.toLocaleString() || user.weeklyXP?.toLocaleString()} XP
        </div>
        <div className="text-white text-xs opacity-75">
          🏆 {user.badges} badges
        </div>
      </div>
    </div>
  );
};

// Composant pour une ligne du leaderboard
const LeaderboardRow = ({ user, rank, animated, isCurrentUser, activeTab }) => {
  return (
    <div
      className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
          : 'bg-gray-800 hover:bg-gray-700'
      } ${animated ? 'animate-pulse border-yellow-400' : ''}`}
    >
      {/* Rang */}
      <div className="w-12 text-center">
        <div
          className={`text-lg font-bold ${
            rank <= 10 ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : `#${rank}`}
        </div>
      </div>

      {/* Avatar et nom */}
      <div className="flex items-center space-x-3 flex-1">
        <img
          src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.uid}`}
          alt={user.displayName}
          className="w-10 h-10 rounded-full border-2 border-gray-600"
        />
        <div>
          <div className="font-medium text-white flex items-center space-x-2">
            <span>{user.displayName}</span>
            {isCurrentUser && <span className="text-blue-400 text-sm">👤 Vous</span>}
          </div>
          <div className="text-sm text-gray-400">
            {user.department || 'Département non défini'}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center">
          <div className="text-white font-bold">
            {activeTab === 'weekly' 
              ? user.weeklyXP?.toLocaleString() 
              : user.xp?.toLocaleString()
            }
          </div>
          <div className="text-xs text-gray-400">
            {activeTab === 'weekly' ? 'XP/semaine' : 'XP total'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-bold">Niv. {user.level}</div>
          <div className="text-xs text-gray-400">Niveau</div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-bold">{user.badges}</div>
          <div className="text-xs text-gray-400">Badges</div>
        </div>
        
        <div className="text-center">
          <div className="text-white font-bold">{user.tasksCompleted}</div>
          <div className="text-xs text-gray-400">Tâches</div>
        </div>
      </div>

      {/* Tendance */}
      {animated && (
        <div className="text-green-400 text-sm animate-bounce">
          📈 +{Math.floor(Math.random() * 3) + 1}
        </div>
      )}
    </div>
  );
};

// Composant des tendances
const TrendingCard = ({ data }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>📈 En Progression</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {data.map((user, index) => (
            <div key={user.uid} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.uid}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white text-sm">{user.displayName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm">
                  +{Math.floor(Math.random() * 100) + 50} XP
                </span>
                <span className="text-green-400">📈</span>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};

// Composant des stats par département
const DepartmentStats = ({ userDepartment }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>🏢 Votre Département</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="text-center space-y-4">
          <div>
            <div className="text-2xl font-bold text-white">
              {userDepartment || 'Non défini'}
            </div>
            <div className="text-gray-400 text-sm">Département</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">
                #{Math.floor(Math.random() * 5) + 1}
              </div>
              <div className="text-xs text-gray-400">Rang département</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">
                {Math.floor(Math.random() * 20) + 10}
              </div>
              <div className="text-xs text-gray-400">Membres actifs</div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Performance équipe</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default Leaderboard;

// ==========================================
// 📁 react-app/src/components/gamification/LeaderboardMini.jsx
// Version compacte pour le dashboard
// ==========================================

import React, { useState, useEffect } from 'react';
import Card from '../../shared/components/ui/Card.jsx';
import leaderboardService from '../../core/services/leaderboardService.js';

const LeaderboardMini = ({ limit = 5 }) => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopUsers();
  }, []);

  const loadTopUsers = async () => {
    const result = await leaderboardService.getGlobalLeaderboard(limit);
    if (!result.error) {
      setTopUsers(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>🏆 Top Performers</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>🏆 Top Performers</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <div key={user.uid} className="flex items-center space-x-3">
              <div className="w-6 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.uid}`}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium truncate">
                  {user.displayName}
                </div>
                <div className="text-gray-400 text-xs">
                  {user.xp.toLocaleString()} XP
                </div>
              </div>
              <div className="text-yellow-400 text-xs">
                🏆 {user.badges}
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};

export default LeaderboardMini;
