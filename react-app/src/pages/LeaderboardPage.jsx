// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT - SYNCHRONISATION FIREBASE COMPLÈTE
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
  ChevronDown,
  RefreshCw,
  Eye,
  Activity,
  Filter
} from 'lucide-react';

// Firebase
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Services
import { useAuthStore } from '../shared/stores/authStore.js';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  
  // États pour les données Firebase
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // États pour les filtres
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('xp');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // État pour les statistiques globales
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalXp: 0,
    averageLevel: 0,
    topPerformer: null
  });

  /**
   * 📡 CHARGEMENT TEMPS RÉEL DU LEADERBOARD DEPUIS FIREBASE
   */
  useEffect(() => {
    if (!db) {
      console.warn('⚠️ Firebase non initialisé');
      setLoading(false);
      return;
    }

    console.log('📡 Configuration écoute temps réel leaderboard Firebase...');
    
    // Configuration de la requête selon les filtres
    let orderField = 'gamification.totalXp';
    switch (selectedCategory) {
      case 'level':
        orderField = 'gamification.level';
        break;
      case 'tasks':
        orderField = 'gamification.tasksCompleted';
        break;
      case 'badges':
        orderField = 'gamification.badgesCount';
        break;
      default:
        orderField = 'gamification.totalXp';
    }

    // Requête de base
    let leaderboardQuery = query(
      collection(db, 'users'),
      where('gamification.totalXp', '>', 0), // Seulement les utilisateurs avec XP
      orderBy(orderField, 'desc'),
      limit(50)
    );

    // Ajout filtre département si nécessaire
    if (departmentFilter !== 'all') {
      leaderboardQuery = query(
        collection(db, 'users'),
        where('profile.department', '==', departmentFilter),
        where('gamification.totalXp', '>', 0),
        orderBy(orderField, 'desc'),
        limit(50)
      );
    }

    // Écoute temps réel
    const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
      console.log('📊 Mise à jour leaderboard reçue, utilisateurs:', snapshot.size);
      
      const leaderboard = [];
      let currentUserFound = false;
      let currentUserPosition = null;
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        const gamificationData = userData.gamification || {};
        
        // Calculer rang
        const rank = index + 1;
        
        // Nettoyer nom d'affichage
        const displayName = userData.displayName || 
                           userData.email?.split('@')[0] || 
                           `Utilisateur ${doc.id.slice(-4)}`;
        
        // Préparer données utilisateur
        const userInfo = {
          id: doc.id,
          uid: userData.uid || doc.id,
          rank: rank,
          displayName: displayName,
          email: userData.email || null,
          avatar: userData.photoURL || null,
          department: userData.profile?.department || 'Non défini',
          
          // Données gamification
          level: gamificationData.level || 1,
          totalXp: gamificationData.totalXp || 0,
          tasksCompleted: gamificationData.tasksCompleted || 0,
          projectsCompleted: gamificationData.projectsCompleted || 0,
          badgesCount: gamificationData.badges?.length || 0,
          badges: gamificationData.badges || [],
          
          // Données additionnelles
          currentStreak: gamificationData.currentStreak || 0,
          weeklyXp: gamificationData.weeklyXp || 0,
          monthlyXp: gamificationData.monthlyXp || 0,
          
          // Statut utilisateur actuel
          isCurrentUser: user?.uid === doc.id || user?.uid === userData.uid,
          
          // Métadonnées
          lastActivity: userData.lastLoginAt || null,
          createdAt: userData.createdAt || null
        };
        
        leaderboard.push(userInfo);
        
        // Marquer si utilisateur actuel trouvé
        if (userInfo.isCurrentUser) {
          currentUserFound = true;
          currentUserPosition = rank;
        }
      });
      
      setLeaderboardData(leaderboard);
      setUserRank(currentUserPosition);
      setLastUpdate(new Date());
      setLoading(false);
      
      console.log('✅ Leaderboard Firebase mis à jour:', {
        totalUsers: leaderboard.length,
        currentUserFound: currentUserFound,
        userRank: currentUserPosition,
        topUser: leaderboard[0]?.displayName
      });
    }, (error) => {
      console.error('❌ Erreur écoute leaderboard:', error);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Arrêt écoute leaderboard');
      unsubscribe();
    };
  }, [selectedCategory, departmentFilter, user?.uid]);

  /**
   * 📊 CALCUL STATISTIQUES GLOBALES
   */
  useEffect(() => {
    if (leaderboardData.length === 0) return;

    const totalUsers = leaderboardData.length;
    const totalXp = leaderboardData.reduce((sum, user) => sum + user.totalXp, 0);
    const totalLevels = leaderboardData.reduce((sum, user) => sum + user.level, 0);
    const averageLevel = totalUsers > 0 ? Math.round(totalLevels / totalUsers) : 0;
    const topPerformer = leaderboardData[0] || null;

    setGlobalStats({
      totalUsers,
      totalXp,
      averageLevel,
      topPerformer
    });
  }, [leaderboardData]);

  /**
   * 🔄 FONCTION DE RAFRAÎCHISSEMENT MANUEL
   */
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Forcer une nouvelle requête
      const refreshQuery = query(
        collection(db, 'users'),
        where('gamification.totalXp', '>', 0),
        orderBy('gamification.totalXp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(refreshQuery);
      console.log('🔄 Rafraîchissement manuel:', snapshot.size, 'utilisateurs');
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 FONCTION POUR OBTENIR L'ICÔNE DE RANG
   */
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  /**
   * 🎨 FONCTION POUR OBTENIR LA COULEUR DE RANG
   */
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-red-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  /**
   * 🎨 FONCTION POUR OBTENIR L'AVATAR
   */
  const getAvatar = (user) => {
    if (user.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    
    // Avatar généré depuis le nom
    const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊'];
    const index = user.displayName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const avatar = avatars[index % avatars.length];
    
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
        {avatar}
      </div>
    );
  };

  /**
   * 🎨 FONCTION POUR FORMATER LA VALEUR AFFICHÉE
   */
  const getDisplayValue = (user) => {
    switch (selectedCategory) {
      case 'level':
        return `Niveau ${user.level}`;
      case 'tasks':
        return `${user.tasksCompleted} tâches`;
      case 'badges':
        return `${user.badgesCount} badges`;
      default:
        return `${user.totalXp.toLocaleString()} XP`;
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Chargement du classement...</h2>
          <p className="text-gray-400">Synchronisation avec Firebase en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête avec titre et statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🏆 Classement
              </h1>
              <p className="text-gray-400 text-lg">
                Découvrez les meilleurs performers de l'équipe
              </p>
              {lastUpdate && (
                <p className="text-gray-500 text-sm mt-1">
                  Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{globalStats.totalUsers}</div>
              <div className="text-gray-400 text-sm">Participants</div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{globalStats.totalXp.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">XP Total</div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{globalStats.averageLevel}</div>
              <div className="text-gray-400 text-sm">Niveau Moyen</div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white truncate">
                {globalStats.topPerformer?.displayName || 'N/A'}
              </div>
              <div className="text-gray-400 text-sm">Champion</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Filtre par catégorie */}
            <div className="flex-1">
              <label className="text-gray-400 text-sm font-medium mb-2 block">
                Classement par
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="xp">Experience (XP)</option>
                <option value="level">Niveau</option>
                <option value="tasks">Tâches complétées</option>
                <option value="badges">Badges obtenus</option>
              </select>
            </div>

            {/* Filtre par période */}
            <div className="flex-1">
              <label className="text-gray-400 text-sm font-medium mb-2 block">
                Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tout le temps</option>
                <option value="month">Ce mois</option>
                <option value="week">Cette semaine</option>
                <option value="today">Aujourd'hui</option>
              </select>
            </div>

            {/* Filtre par département */}
            <div className="flex-1">
              <label className="text-gray-400 text-sm font-medium mb-2 block">
                Département
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les départements</option>
                <option value="development">Développement</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Ventes</option>
                <option value="hr">Ressources Humaines</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Position de l'utilisateur actuel */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Votre Position
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">#{userRank}</div>
                <div className="text-gray-400 text-sm">Position</div>
              </div>
              
              {leaderboardData.find(u => u.isCurrentUser) && (
                <>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {leaderboardData.find(u => u.isCurrentUser).totalXp.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">XP Total</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {leaderboardData.find(u => u.isCurrentUser).level}
                    </div>
                    <div className="text-gray-400 text-sm">Niveau</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {leaderboardData.find(u => u.isCurrentUser).badgesCount}
                    </div>
                    <div className="text-gray-400 text-sm">Badges</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Liste du classement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Classement ({leaderboardData.length} participants)
            </h3>
          </div>

          <div className="divide-y divide-gray-700/50">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-700/30 transition-all duration-300 ${
                  user.isCurrentUser ? 'bg-blue-500/10 border-blue-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  
                  {/* Informations utilisateur */}
                  <div className="flex items-center gap-4 flex-1">
                    
                    {/* Rang et icône */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(user.rank)} flex items-center justify-center text-white font-bold`}>
                        {user.rank}
                      </div>
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar */}
                    {getAvatar(user)}

                    {/* Détails utilisateur */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-lg">
                          {user.displayName}
                        </h4>
                        {user.isCurrentUser && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {user.department} • Niveau {user.level}
                      </p>
                      {user.email && (
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">
                      {getDisplayValue(user)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {user.tasksCompleted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {user.badgesCount}
                      </span>
                      {user.currentStreak > 0 && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {user.currentStreak}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message si aucun utilisateur */}
          {leaderboardData.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Aucun participant trouvé
              </h3>
              <p className="text-gray-500">
                {departmentFilter !== 'all' 
                  ? 'Aucun utilisateur trouvé dans ce département.' 
                  : 'Commencez à gagner de l\'XP pour apparaître dans le classement !'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
