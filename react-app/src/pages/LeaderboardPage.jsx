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
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true); // Variable manquante ajoutée
  
  // Stores
  const { 
    leaderboard, 
    loading, 
    loadLeaderboard, 
    userStats, 
    getUserRank 
  } = useGameStore();
  const { user } = useAuthStore();

  // Charger le leaderboard Firebase
  useEffect(() => {
    const loadFirebaseLeaderboard = async () => {
      if (!db) {
        console.log('🔧 Mode déconnecté - Pas de Firebase');
        setLoadingFirebase(false);
        return;
      }

      try {
        setLoadingFirebase(true);
        console.log('📊 Chargement leaderboard Firebase...');

        const usersQuery = query(
          collection(db, 'users'),
          orderBy('gamification.totalXp', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(usersQuery);
        const firebaseUsers = [];

        snapshot.forEach((doc, index) => {
          const userData = doc.data();
          if (userData.email && userData.gamification) {
            firebaseUsers.push({
              userId: doc.id,
              name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
              email: userData.email,
              avatar: userData.photoURL,
              totalXp: userData.gamification.totalXp || 0,
              level: userData.gamification.level || 1,
              tasksCompleted: userData.gamification.tasksCompleted || 0,
              tasksCreated: userData.gamification.tasksCreated || 0,
              badges: userData.gamification.badges || [],
              streakDays: userData.gamification.loginStreak || 0,
              joinedAt: userData.createdAt || '2024-01-01',
              lastActive: new Date().toISOString().split('T')[0],
              monthlyXp: userData.gamification.monthlyXp || 0,
              weeklyXp: userData.gamification.weeklyXp || 0,
              position: index + 1,
              trend: 'stable'
            });
          }
        });

        setRealLeaderboard(firebaseUsers);
        console.log(`✅ ${firebaseUsers.length} utilisateurs Firebase chargés`);

      } catch (error) {
        console.error('❌ Erreur chargement Firebase:', error);
      } finally {
        setLoadingFirebase(false);
      }
    };

    loadFirebaseLeaderboard();
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
      badges: userStats?.badges || [
        { id: 'first_task', name: 'Première tâche', icon: '🎯', earned: true },
        { id: 'level_up', name: 'Montée niveau', icon: '📈', earned: true }
      ],
      streakDays: userStats?.loginStreak || 1,
      joinedAt: '2024-03-01',
      lastActive: '2025-06-24',
      monthlyXp: userStats?.monthlyXp || 155,
      weeklyXp: userStats?.weeklyXp || 175,
      position: 3,
      trend: 'up'
    },
    {
      userId: 'user4',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@example.com',
      avatar: null,
      totalXp: 1950,
      level: 4,
      tasksCompleted: 78,
      tasksCreated: 85,
      badges: [
        { id: 'organizer', name: 'Organisateur', icon: '📋', earned: true }
      ],
      streakDays: 5,
      joinedAt: '2024-01-30',
      lastActive: '2025-06-22',
      monthlyXp: 580,
      weeklyXp: 140,
      position: 4,
      trend: 'down'
    },
    {
      userId: 'user5',
      name: 'Lucas Bernard',
      email: 'lucas.bernard@example.com',
      avatar: null,
      totalXp: 1750,
      level: 4,
      tasksCompleted: 65,
      tasksCreated: 72,
      badges: [
        { id: 'collaborator', name: 'Collaborateur', icon: '🤝', earned: true }
      ],
      streakDays: 12,
      joinedAt: '2024-02-10',
      lastActive: '2025-06-24',
      monthlyXp: 520,
      weeklyXp: 120,
      position: 5,
      trend: 'stable'
    }
  ]);

  // Fusion des données réelles et simulées
  const allUsers = realLeaderboard.length > 0 ? realLeaderboard : mockUsers;

  // Fonction de tri selon l'onglet actif
  const getSortedLeaderboard = () => {
    return [...allUsers].sort((a, b) => {
      switch (activeTab) {
        case 'xp':
          return b.totalXp - a.totalXp;
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

  const sortedLeaderboard = getSortedLeaderboard();

  // Fonctions utilitaires
  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{position}</span>;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ChevronDown className="w-4 h-4 text-red-400" />;
      default:
        return <span className="w-4 h-4 text-gray-400">-</span>;
    }
  };

  const getCompletionRate = (userData) => {
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Colonne principale - Classement */}
          <div className="lg:col-span-3">
            {/* Onglets de tri */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
              <div className="flex border-b border-gray-700">
                {[
                  { id: 'xp', label: 'Points XP', icon: Star },
                  { id: 'tasks', label: 'Tâches', icon: Target },
                  { id: 'level', label: 'Niveau', icon: Zap },
                  { id: 'badges', label: 'Badges', icon: Award }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-700/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste du classement */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6">
                <div className="space-y-4">
                  {sortedLeaderboard.map((userData, index) => {
                    const position = index + 1;
                    const isCurrentUser = userData.userId === user?.uid;
                    
                    return (
                      <div
                        key={userData.userId}
                        className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20'
                            : position <= 3
                            ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30'
                            : 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Utilisateur */}
                          <div className="flex items-center gap-4">
                            {/* Position */}
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-xl">
                              {getPositionIcon(position)}
                            </div>

                            {/* Avatar */}
                            <div className="relative">
                              {userData.avatar ? (
                                <img
                                  src={userData.avatar}
                                  alt={userData.name}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-600"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                  {userData.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {position <= 3 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Crown className="w-3 h-3 text-gray-900" />
                                </div>
                              )}
                            </div>

                            {/* Infos utilisateur */}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-lg">
                                  {userData.name}
                                  {isCurrentUser && (
                                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                      Vous
                                    </span>
                                  )}
                                </h3>
                                {getTrendIcon(userData.trend)}
                              </div>
                              <p className="text-gray-400 text-sm">
                                Niveau {userData.level} • {userData.badges?.length || 0} badges
                              </p>
                            </div>
                          </div>

                          {/* Statistiques */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white mb-1">
                              {activeTab === 'xp' && `${userData.totalXp.toLocaleString()} XP`}
                              {activeTab === 'tasks' && `${userData.tasksCompleted} tâches`}
                              {activeTab === 'level' && `Niveau ${userData.level}`}
                              {activeTab === 'badges' && `${userData.badges?.length || 0} badges`}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {activeTab === 'xp' && `+${userData.weeklyXp} cette semaine`}
                              {activeTab === 'tasks' && `${getCompletionRate(userData)}% de réussite`}
                              {activeTab === 'level' && `${userData.totalXp} XP total`}
                              {activeTab === 'badges' && `${userData.streakDays} jours de suite`}
                            </div>
                          </div>
                        </div>

                        {/* Barre de progression pour l'XP */}
                        {activeTab === 'xp' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progression niveau {userData.level}</span>
                              <span>{userData.totalXp % 500}/500 XP</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(userData.totalXp % 500) / 5}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Statistiques */}
          <div className="space-y-6">
            {/* Top 3 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 3 {realLeaderboard.length > 0 ? '(Firebase)' : '(Simulés)'}
              </h3>
              <div className="space-y-3">
                {sortedLeaderboard.slice(0, 3).map((userData, index) => (
                  <div key={userData.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getPositionIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{userData.name}</div>
                      <div className="text-sm text-gray-400">{userData.totalXp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{sortedLeaderboard.length}</div>
                <div className="text-gray-400 text-sm">Participants actifs</div>
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
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700/50">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
