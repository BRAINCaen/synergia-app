import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameStore } from '../shared/stores/gameStore';

// Icônes
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Zap,
  Fire,
  ChevronUp,
  ChevronDown,
  Minus,
  Filter,
  RefreshCw
} from 'lucide-react';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState('all'); // all, month, week
  const [category, setCategory] = useState('xp'); // xp, tasks, projects, badges
  const [userRank, setUserRank] = useState(null);
  const [topPerformers, setTopPerformers] = useState({
    mostXP: null,
    mostTasks: null,
    longestStreak: null,
    mostBadges: null
  });

  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  // Charger le leaderboard depuis Firebase
  const loadLeaderboard = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Récupérer tous les utilisateurs avec leurs stats
      const userStatsQuery = query(
        collection(db, 'userStats'),
        orderBy(category === 'xp' ? 'totalXp' : 
                category === 'tasks' ? 'tasksCompleted' :
                category === 'projects' ? 'projectsCreated' : 'totalXp', 'desc'),
        limit(100)
      );

      const statsSnapshot = await getDocs(userStatsQuery);
      const usersData = statsSnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
        isCurrentUser: doc.id === user.uid
      }));

      // 2. Pour chaque utilisateur, récupérer des données supplémentaires si nécessaire
      const enrichedData = await Promise.all(
        usersData.map(async (userData) => {
          try {
            // Récupérer le profil utilisateur pour le nom d'affichage
            const userQuery = query(
              collection(db, 'users'),
              where('userId', '==', userData.id),
              limit(1)
            );
            const userSnapshot = await getDocs(userQuery);
            const userProfile = userSnapshot.docs[0]?.data();

            // Calculer des métriques supplémentaires selon la période
            let periodStats = { ...userData };
            
            if (timeFrame !== 'all') {
              // Ici on pourrait filtrer par période, mais pour simplifier on garde toutes les données
              // Dans une vraie app, on stockerait les métriques par période
            }

            return {
              ...periodStats,
              displayName: userProfile?.displayName || userData.email?.split('@')[0] || 'Utilisateur',
              photoURL: userProfile?.photoURL || null,
              joinedAt: userData.createdAt,
              // Calculer le score selon la catégorie
              score: category === 'xp' ? userData.totalXp :
                     category === 'tasks' ? userData.tasksCompleted :
                     category === 'projects' ? userData.projectsCreated :
                     userData.badges?.length || 0
            };
          } catch (error) {
            console.error('Erreur enrichissement utilisateur:', error);
            return {
              ...userData,
              displayName: userData.email?.split('@')[0] || 'Utilisateur',
              photoURL: null,
              score: 0
            };
          }
        })
      );

      // Trier par score et mettre à jour les rangs
      const sortedData = enrichedData
        .sort((a, b) => b.score - a.score)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          rankChange: 0 // À implémenter avec historique
        }));

      setLeaderboard(sortedData);

      // Trouver le rang de l'utilisateur actuel
      const currentUserRank = sortedData.find(u => u.isCurrentUser);
      setUserRank(currentUserRank);

      // Calculer les top performers
      const allUsers = sortedData;
      setTopPerformers({
        mostXP: allUsers.reduce((max, user) => user.totalXp > (max?.totalXp || 0) ? user : max, null),
        mostTasks: allUsers.reduce((max, user) => user.tasksCompleted > (max?.tasksCompleted || 0) ? user : max, null),
        longestStreak: allUsers.reduce((max, user) => user.loginStreak > (max?.loginStreak || 0) ? user : max, null),
        mostBadges: allUsers.reduce((max, user) => (user.badges?.length || 0) > (max?.badges?.length || 0) ? user : max, null)
      });

    } catch (error) {
      console.error('Erreur chargement leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  // Charger au montage et changements de filtres
  useEffect(() => {
    loadLeaderboard();
  }, [user, category, timeFrame]);

  // Fonctions utilitaires
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const formatScore = (score, cat) => {
    switch (cat) {
      case 'xp': return `${score.toLocaleString()} XP`;
      case 'tasks': return `${score} tâches`;
      case 'projects': return `${score} projets`;
      case 'badges': return `${score} badges`;
      default: return score.toLocaleString();
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'xp': return <Zap className="w-5 h-5" />;
      case 'tasks': return <Target className="w-5 h-5" />;
      case 'projects': return <Users className="w-5 h-5" />;
      case 'badges': return <Trophy className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          Chargement du classement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Classement
              </h1>
              <p className="text-gray-400 mt-2">
                Comparez vos performances avec la communauté
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filtres */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="xp">Points XP</option>
                <option value="tasks">Tâches complétées</option>
                <option value="projects">Projets créés</option>
                <option value="badges">Badges obtenus</option>
              </select>

              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">Tout temps</option>
                <option value="month">Ce mois</option>
                <option value="week">Cette semaine</option>
              </select>

              <button
                onClick={refreshLeaderboard}
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
        {/* Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6 text-center">🏆 Podium</h2>
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2ème place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
                  <Medal className="w-8 h-8 text-gray-200" />
                </div>
                <div className="bg-gray-700 p-4 rounded-b-lg">
                  <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {leaderboard[1]?.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {leaderboard[1]?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatScore(leaderboard[1]?.score || 0, category)}
                  </p>
                </div>
              </div>

              {/* 1ère place */}
              <div className="text-center">
                <div className="w-24 h-20 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                  <Crown className="w-10 h-10 text-yellow-200" />
                </div>
                <div className="bg-yellow-600/20 border border-yellow-400/30 p-4 rounded-b-lg">
                  <div className="w-14 h-14 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-900">
                      {leaderboard[0]?.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {leaderboard[0]?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-yellow-400 font-medium">
                    {formatScore(leaderboard[0]?.score || 0, category)}
                  </p>
                </div>
              </div>

              {/* 3ème place */}
              <div className="text-center">
                <div className="w-20 h-12 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg flex items-end justify-center pb-2">
                  <Award className="w-6 h-6 text-amber-200" />
                </div>
                <div className="bg-gray-700 p-4 rounded-b-lg">
                  <div className="w-12 h-12 bg-amber-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-amber-100">
                      {leaderboard[2]?.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {leaderboard[2]?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatScore(leaderboard[2]?.score || 0, category)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Classement principal */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  {getCategoryIcon(category)}
                  Classement {category === 'xp' ? 'XP' : 
                            category === 'tasks' ? 'Tâches' :
                            category === 'projects' ? 'Projets' : 'Badges'}
                </h2>
              </div>

              <div className="p-6">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 20).map((user, index) => (
                      <div
                        key={user.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          user.isCurrentUser 
                            ? 'bg-blue-500/10 border-blue-400/30 ring-1 ring-blue-400/20' 
                            : getRankColor(user.rank)
                        } hover:border-gray-600`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Rang */}
                            <div className="flex items-center justify-center w-8">
                              {getRankIcon(user.rank)}
                            </div>

                            {/* Avatar et nom */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                {user.photoURL ? (
                                  <img 
                                    src={user.photoURL} 
                                    alt={user.displayName}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {user.displayName?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white flex items-center gap-2">
                                  {user.displayName}
                                  {user.isCurrentUser && (
                                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                      Vous
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Niveau {user.level || 1}
                                  {user.loginStreak > 0 && (
                                    <span className="ml-2 inline-flex items-center gap-1">
                                      <Fire className="w-3 h-3 text-orange-400" />
                                      {user.loginStreak}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Score et progression */}
                          <div className="text-right">
                            <p className="font-bold text-white text-lg">
                              {formatScore(user.score, category)}
                            </p>
                            {user.rankChange !== undefined && (
                              <div className="flex items-center justify-end gap-1 text-sm">
                                {user.rankChange > 0 ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">+{user.rankChange}</span>
                                  </>
                                ) : user.rankChange < 0 ? (
                                  <>
                                    <ChevronDown className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400">{user.rankChange}</span>
                                  </>
                                ) : (
                                  <>
                                    <Minus className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400">0</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar avec stats */}
          <div className="space-y-6">
            {/* Votre position */}
            {userRank && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Votre position</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {user?.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <p className="font-medium text-white mb-1">Rang #{userRank.rank}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    {formatScore(userRank.score, category)}
                  </p>
                  <div className="text-xs text-gray-500">
                    {userRank.rank > 1 ? 
                      `${leaderboard[0]?.score - userRank.score} points du leader` :
                      'Vous êtes en tête !'
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Top performers */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">🌟 Records</h3>
              <div className="space-y-4">
                {topPerformers.mostXP && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Plus XP</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {topPerformers.mostXP.displayName}
                      </p>
                      <p className="text-xs text-yellow-400">
                        {topPerformers.mostXP.totalXp.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                )}

                {topPerformers.mostTasks && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Plus tâches</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {topPerformers.mostTasks.displayName}
                      </p>
                      <p className="text-xs text-blue-400">
                        {topPerformers.mostTasks.tasksCompleted} tâches
                      </p>
                    </div>
                  </div>
                )}

                {topPerformers.longestStreak && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fire className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-400">Plus longue série</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {topPerformers.longestStreak.displayName}
                      </p>
                      <p className="text-xs text-orange-400">
                        {topPerformers.longestStreak.loginStreak} jours
                      </p>
                    </div>
                  </div>
                )}

                {topPerformers.mostBadges && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Plus badges</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {topPerformers.mostBadges.displayName}
                      </p>
                      <p className="text-xs text-purple-400">
                        {topPerformers.mostBadges.badges?.length || 0} badges
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Statistiques</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Utilisateurs actifs</span>
                  <span className="text-white font-medium">{leaderboard.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">XP total communauté</span>
                  <span className="text-white font-medium">
                    {leaderboard.reduce((sum, user) => sum + (user.totalXp || 0), 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tâches complétées</span>
                  <span className="text-white font-medium">
                    {leaderboard.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
