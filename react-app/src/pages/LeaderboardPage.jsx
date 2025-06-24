// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Star, Crown, Target, TrendingUp, Calendar, 
  Users, Award, Zap, Clock, Filter, RefreshCw, Download,
  ChevronUp, ChevronDown, Flame, Shield, Gem, Sword
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useGameStore } from '../shared/stores/gameStore.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const LeaderboardPage = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('xp'); // xp, tasks, level, badges
  const [timePeriod, setTimePeriod] = useState('all'); // week, month, all
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('overall'); // overall, productivity, consistency
  
  // Stores
  const { 
    leaderboard, 
    loading, 
    loadLeaderboard, 
    userStats, 
    getUserRank 
  } = useGameStore();
  const { user } = useAuthStore();

  // Charger le leaderboard
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard, timePeriod]);

  // Données simulées pour enrichir l'expérience
  const [mockUsers] = useState([
    {
      userId: 'user1',
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      avatar: null,
      totalXp: 2850,
      level: 6,
      tasksCompleted: 127,
      tasksCreated: 145,
      badges: [
        { id: 'early_bird', name: 'Lève-tôt', icon: '🌅', earned: true },
        { id: 'perfectionist', name: 'Perfectionniste', icon: '💎', earned: true },
        { id: 'team_player', name: 'Joueur équipe', icon: '🤝', earned: true }
      ],
      streakDays: 15,
      joinedAt: '2024-01-15',
      lastActive: '2025-06-24',
      monthlyXp: 845,
      weeklyXp: 230,
      position: 1,
      trend: 'up'
    },
    {
      userId: 'user2', 
      name: 'Thomas Martin',
      email: 'thomas.martin@example.com',
      avatar: null,
      totalXp: 2650,
      level: 5,
      tasksCompleted: 98,
      tasksCreated: 115,
      badges: [
        { id: 'speed_demon', name: 'Démon vitesse', icon: '⚡', earned: true },
        { id: 'consistent', name: 'Régulier', icon: '📅', earned: true }
      ],
      streakDays: 8,
      joinedAt: '2024-02-20',
      lastActive: '2025-06-23',
      monthlyXp: 720,
      weeklyXp: 180,
      position: 2,
      trend: 'up'
    },
    {
      userId: user?.uid || 'current_user',
      name: user?.displayName || 'Alan Boehme',
      email: user?.email || 'alan.boehme61@gmail.com',
      avatar: user?.photoURL,
      totalXp: userStats?.totalXp || 155,
      level: userStats?.level || 2,
      tasksCompleted: userStats?.tasksCompleted || 6,
      tasksCreated: 8,
      badges: userStats?.badges || [],
      streakDays: userStats?.streakDays || 1,
      joinedAt: '2025-06-24',
      lastActive: '2025-06-24',
      monthlyXp: userStats?.monthlyXp || 155,
      weeklyXp: userStats?.weeklyXp || 155,
      position: 3,
      trend: 'up'
    },
    {
      userId: 'user4',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@example.com',
      avatar: null,
      totalXp: 1200,
      level: 3,
      tasksCompleted: 45,
      tasksCreated: 60,
      badges: [
        { id: 'newcomer', name: 'Nouveau', icon: '🌟', earned: true }
      ],
      streakDays: 3,
      joinedAt: '2025-05-10',
      lastActive: '2025-06-23',
      monthlyXp: 600,
      weeklyXp: 120,
      position: 4,
      trend: 'down'
    },
    {
      userId: 'user5',
      name: 'Pierre Durand',
      email: 'pierre.durand@example.com',
      avatar: null,
      totalXp: 890,
      level: 2,
      tasksCompleted: 28,
      tasksCreated: 35,
      badges: [
        { id: 'first_steps', name: 'Premiers pas', icon: '👶', earned: true }
      ],
      streakDays: 1,
      joinedAt: '2025-06-01',
      lastActive: '2025-06-24',
      monthlyXp: 450,
      weeklyXp: 95,
      position: 5,
      trend: 'stable'
    }
  ]);

  // Fusionner données réelles et simulées
  const getLeaderboardData = () => {
    return mockUsers.sort((a, b) => {
      switch (activeTab) {
        case 'xp':
          return (timePeriod === 'week' ? b.weeklyXp - a.weeklyXp :
                  timePeriod === 'month' ? b.monthlyXp - a.monthlyXp :
                  b.totalXp - a.totalXp);
        case 'tasks':
          return b.tasksCompleted - a.tasksCompleted;
        case 'level':
          return b.level - a.level;
        case 'badges':
          return (b.badges?.length || 0) - (a.badges?.length || 0);
        default:
          return b.totalXp - a.totalXp;
      }
    });
  };

  const sortedLeaderboard = getLeaderboardData();

  // Refresh leaderboard
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Obtenir le podium (top 3)
  const getPodium = () => sortedLeaderboard.slice(0, 3);
  const getRestOfLeaderboard = () => sortedLeaderboard.slice(3);

  // Fonctions utilitaires
  const getDisplayValue = (userData) => {
    switch (activeTab) {
      case 'xp':
        if (timePeriod === 'week') return `${userData.weeklyXp.toLocaleString()} XP`;
        if (timePeriod === 'month') return `${userData.monthlyXp.toLocaleString()} XP`;
        return `${userData.totalXp.toLocaleString()} XP`;
      case 'tasks':
        return `${userData.tasksCompleted} tâches`;
      case 'level':
        return `Niveau ${userData.level}`;
      case 'badges':
        return `${userData.badges?.length || 0} badges`;
      default:
        return `${userData.totalXp.toLocaleString()} XP`;
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ChevronDown className="w-4 h-4 text-red-400" />;
      default: return <span className="w-4 h-4 text-gray-400">━</span>;
    }
  };

  const getLevelInfo = (level) => {
    const levels = [
      { name: 'Novice', color: '#9CA3AF', icon: '🌱' },
      { name: 'Apprenti', color: '#10B981', icon: '🌿' },
      { name: 'Compétent', color: '#3B82F6', icon: '⚡' },
      { name: 'Expérimenté', color: '#8B5CF6', icon: '🔥' },
      { name: 'Expert', color: '#F59E0B', icon: '💎' },
      { name: 'Maître', color: '#EF4444', icon: '👑' }
    ];
    return levels[Math.min(level - 1, levels.length - 1)] || levels[0];
  };

  const getProductivityScore = (userData) => {
    const completionRate = userData.tasksCreated > 0 ? 
      (userData.tasksCompleted / userData.tasksCreated) * 100 : 0;
    return Math.round(completionRate);
  };

  if (loading || loadingFirebase) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          {loadingFirebase ? 'Chargement données Firebase...' : 'Chargement du classement...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* En-tête */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-yellow-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Leaderboard
              </h1>
              <p className="text-gray-400 text-lg">
                Compétition en temps réel • Performance équipe • {realLeaderboard.length > 0 ? 
                  `${realLeaderboard.length} utilisateurs Firebase` : 
                  'Données simulées'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Période */}
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="all">Tout temps</option>
              </select>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              {/* Export */}
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets de catégories */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-1 border border-gray-700 flex flex-wrap gap-1">
            {[
              { id: 'xp', label: 'Points XP', icon: Star },
              { id: 'tasks', label: 'Tâches complétées', icon: Target },
              { id: 'level', label: 'Niveau', icon: TrendingUp },
              { id: 'badges', label: 'Badges', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Podium (Top 3) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            Podium des Champions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {getPodium().map((userData, index) => {
              const position = index + 1;
              const levelInfo = getLevelInfo(userData.level);
              
              return (
                <div
                  key={userData.userId}
                  className={`relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 transform transition-all duration-300 hover:scale-105 ${
                    position === 1 ? 'border-yellow-400 shadow-yellow-400/20 shadow-2xl md:order-2' :
                    position === 2 ? 'border-gray-300 shadow-gray-300/20 shadow-xl md:order-1 md:mt-8' :
                    'border-orange-400 shadow-orange-400/20 shadow-xl md:order-3 md:mt-8'
                  }`}
                >
                  {/* Badge position */}
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center ${
                    position === 1 ? 'bg-yellow-500' :
                    position === 2 ? 'bg-gray-400' :
                    'bg-orange-500'
                  }`}>
                    {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                  </div>

                  {/* Avatar */}
                  <div className="text-center mb-4 mt-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold border-4 border-gray-600">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        userData.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mt-3">{userData.name}</h3>
                    <p className="text-gray-400 text-sm">{userData.email}</p>
                  </div>

                  {/* Stats principales */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white mb-1">
                      {getDisplayValue(userData)}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <span style={{ color: levelInfo.color }}>{levelInfo.icon}</span>
                        Niveau {userData.level}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        {userData.streakDays}j
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex justify-center gap-1 mb-4">
                    {userData.badges?.slice(0, 3).map((badge, badgeIndex) => (
                      <div
                        key={badgeIndex}
                        className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm border border-gray-600"
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    ))}
                    {userData.badges?.length > 3 && (
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400 border border-gray-600">
                        +{userData.badges.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Métriques additionnelles */}
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="text-gray-400">Productivité</div>
                      <div className="text-white font-semibold">{getProductivityScore(userData)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Badges</div>
                      <div className="text-white font-semibold">{userData.badges?.length || 0}</div>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="absolute top-4 right-4">
                    {getTrendIcon(userData.trend)}
                  </div>

                  {/* Highlight utilisateur connecté */}
                  {userData.userId === user?.uid && (
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-400 bg-blue-400/5 pointer-events-none">
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Vous {userData.isRealUser && '(Firebase)'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Classement complet */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Classement Complet
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rang</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    {activeTab === 'xp' ? 'Points XP' :
                     activeTab === 'tasks' ? 'Tâches' :
                     activeTab === 'level' ? 'Niveau' :
                     'Badges'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Niveau</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Productivité</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Série</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Badges</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedLeaderboard.map((userData, index) => {
                  const position = index + 1;
                  const levelInfo = getLevelInfo(userData.level);
                  const isCurrentUser = userData.userId === user?.uid;
                  
                  return (
                    <tr
                      key={userData.userId}
                      className={`hover:bg-gray-700/50 transition-colors ${
                        isCurrentUser ? 'bg-blue-900/20 border-l-4 border-blue-400' : ''
                      }`}
                    >
                      {/* Rang */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(position)}
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Vous {userData.isRealUser && '(FB)'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Utilisateur */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold border border-gray-600">
                            {userData.avatar ? (
                              <img src={userData.avatar} alt={userData.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              userData.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium">{userData.name}</div>
                            <div className="text-gray-400 text-sm">{userData.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Valeur principale */}
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">
                          {getDisplayValue(userData)}
                        </div>
                      </td>

                      {/* Niveau */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span style={{ color: levelInfo.color }}>{levelInfo.icon}</span>
                          <span className="text-white">{userData.level}</span>
                          <span className="text-gray-400 text-sm">({levelInfo.name})</span>
                        </div>
                      </td>

                      {/* Productivité */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, getProductivityScore(userData))}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium">
                            {getProductivityScore(userData)}%
                          </span>
                        </div>
                      </td>

                      {/* Série */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span className="font-medium">{userData.streakDays}</span>
                          <span className="text-gray-400 text-sm">jours</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {userData.badges?.slice(0, 3).map((badge, badgeIndex) => (
                            <div
                              key={badgeIndex}
                              className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs border border-gray-600"
                              title={badge.name}
                            >
                              {badge.icon}
                            </div>
                          ))}
                          {userData.badges?.length > 3 && (
                            <div className="text-gray-400 text-sm ml-1">
                              +{userData.badges.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tendance */}
                      <td className="px-6 py-4">
                        {getTrendIcon(userData.trend)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{sortedLeaderboard.length}</div>
            <div className="text-gray-400 text-sm">
              Participants {realLeaderboard.length > 0 ? '(Firebase)' : '(Simulés)'}
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {sortedLeaderboard.reduce((sum, user) => sum + user.totalXp, 0).toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">XP total équipe</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {sortedLeaderboard.reduce((sum, user) => sum + user.tasksCompleted, 0)}
            </div>
            <div className="text-gray-400 text-sm">Tâches terminées</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {sortedLeaderboard.reduce((sum, user) => sum + (user.badges?.length || 0), 0)}
            </div>
            <div className="text-gray-400 text-sm">Badges débloqués</div>
          </div>
        </div>

        {/* Message motivationnel */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700/50">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              🎯 {realLeaderboard.length > 0 ? 'Classement temps réel Firebase !' : 'Continuez sur votre lancée !'}
            </h3>
            <p className="text-gray-300">
              {realLeaderboard.length > 0 ? (
                `Leaderboard connecté à Firebase avec ${realLeaderboard.length} utilisateurs réels ! 
                 Les données se mettent à jour automatiquement.`
              ) : (
                user?.uid && sortedLeaderboard.find(u => u.userId === user.uid) ? (
                  `Vous êtes ${sortedLeaderboard.findIndex(u => u.userId === user.uid) + 1}${
                    sortedLeaderboard.findIndex(u => u.userId === user.uid) + 1 === 1 ? 'er' : 'ème'
                  } au classement ! ${
                    sortedLeaderboard.findIndex(u => u.userId === user.uid) + 1 === 1 ? 
                      'Félicitations, vous dominez le leaderboard !' :
                      `Plus que ${
                        sortedLeaderboard[sortedLeaderboard.findIndex(u => u.userId === user.uid) - 1]?.totalXp - 
                        (sortedLeaderboard.find(u => u.userId === user.uid)?.totalXp || 0)
                      } XP pour rattraper la place suivante !`
                  }`
                ) : (
                  'Rejoignez la compétition en complétant des tâches et gagnez des points XP !'
                )
              )}
            </p>
            {realLeaderboard.length === 0 && (
              <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/30">
                <p className="text-blue-200 text-sm">
                  ℹ️ <strong>Mode démo actif</strong> - Les autres utilisateurs sont simulés pour la démonstration.
                  Le leaderboard se connectera automatiquement quand d'autres utilisateurs rejoindront !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
