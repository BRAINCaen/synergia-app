// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT AVEC VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Trophy, Medal, TrendingUp, Star, Zap, Award, RefreshCw } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month
  const [category, setCategory] = useState('xp'); // xp, tasks, badges

  // Fonction pour nettoyer les noms d'affichage
  const cleanDisplayName = (userData) => {
    let cleanName = userData.displayName || userData.profile?.displayName || userData.email || 'Utilisateur';
    
    // Nettoyer les URLs et caractères étranges
    if (cleanName.includes('http') || cleanName.includes('www.')) {
      cleanName = userData.email?.split('@')[0] || 'Utilisateur';
    }
    
    // Limiter la longueur
    if (cleanName.length > 30) {
      cleanName = cleanName.substring(0, 30) + '...';
    }
    
    // Si c'est votre email spécifique, utiliser un nom plus friendly
    if (userData.email === 'alan.boehme61@gmail.com') {
      cleanName = 'Alan Boehme (Admin)';
    }
    
    return cleanName;
  };

  // Charger les données du classement avec VRAIES données Firebase
  useEffect(() => {
    loadLeaderboard();
  }, [timeRange, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      console.log('🏆 Chargement VRAIES données leaderboard depuis Firebase...');
      
      // Construire la requête selon la catégorie
      let orderField;
      switch (category) {
        case 'xp':
          orderField = 'gamification.totalXp';
          break;
        case 'tasks':
          orderField = 'gamification.tasksCompleted';
          break;
        case 'badges':
          orderField = 'gamification.badges';
          break;
        default:
          orderField = 'gamification.totalXp';
      }

      // Requête Firebase pour récupérer les vrais utilisateurs
      const usersQuery = query(
        collection(db, 'users'),
        orderBy(orderField, 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(usersQuery);
      const users = [];
      
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        
        // S'assurer que l'utilisateur a des données de gamification
        if (userData.gamification || userData.totalXp || userData.email) {
          const cleanedName = cleanDisplayName(userData);
          
          users.push({
            id: doc.id,
            rank: index + 1,
            displayName: cleanedName,
            email: userData.email,
            
            // Données XP (essayer plusieurs sources)
            totalXp: userData.gamification?.totalXp || userData.totalXp || 0,
            
            // Données niveau (essayer plusieurs sources)
            level: userData.gamification?.level || userData.level || 1,
            
            // Données tâches (essayer plusieurs sources)
            tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
            
            // Données badges (essayer plusieurs sources)
            badgesCount: Array.isArray(userData.gamification?.badges) 
              ? userData.gamification.badges.length 
              : userData.badgesCount || 0,
            
            // Données additionnelles
            photoURL: userData.photoURL,
            department: userData.profile?.department || 'Général',
            status: userData.status || 'active',
            lastActivity: userData.gamification?.lastActivityDate || userData.lastActivity,
            
            // Marquer l'utilisateur actuel
            isCurrentUser: doc.id === user?.uid
          });
        }
      });
      
      console.log(`✅ Leaderboard chargé avec ${users.length} utilisateurs réels`);
      console.log('📊 Premier utilisateur:', users[0]);
      
      setLeaderboard(users);
      
    } catch (error) {
      console.error('❌ Erreur chargement leaderboard:', error);
      
      // En cas d'erreur, essayer une requête plus simple
      try {
        console.log('🔄 Tentative de requête de fallback...');
        
        const fallbackQuery = query(
          collection(db, 'users'),
          limit(10)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackUsers = [];
        
        fallbackSnapshot.forEach((doc, index) => {
          const userData = doc.data();
          if (userData.email) {
            fallbackUsers.push({
              id: doc.id,
              rank: index + 1,
              displayName: cleanDisplayName(userData),
              email: userData.email,
              totalXp: userData.gamification?.totalXp || userData.totalXp || 0,
              level: userData.gamification?.level || userData.level || 1,
              tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
              badgesCount: 0,
              isCurrentUser: doc.id === user?.uid
            });
          }
        });
        
        setLeaderboard(fallbackUsers);
        console.log('✅ Fallback réussi avec', fallbackUsers.length, 'utilisateurs');
        
      } catch (fallbackError) {
        console.error('❌ Fallback échoué:', fallbackError);
        setLeaderboard([]);
      }
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
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={loadLeaderboard}
        disabled={loading}
      >
        {loading ? 'Actualisation...' : 'Actualiser'}
      </PremiumButton>
      <PremiumButton variant="primary" icon={Trophy}>
        Voir historique
      </PremiumButton>
    </div>
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
          <span className="ml-3 text-gray-400">Récupération des vraies données...</span>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Classement"
      subtitle="Tableau de classement de l'équipe par performance (Données réelles Firebase)"
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
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {period === 'all' ? 'Tout temps' : period === 'month' ? 'Ce mois' : 'Cette semaine'}
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
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat === 'xp' ? 'XP Total' : cat === 'tasks' ? 'Tâches' : 'Badges'}
            </button>
          ))}
        </div>
      </div>

      <PremiumCard>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Classement complet</h2>

          {leaderboard.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01]
                ${getRankBgColor(player.rank)}
                ${player.isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-900/30' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getRankIcon(player.rank)}
                  
                  <div className="flex items-center space-x-3">
                    {player.photoURL ? (
                      <img 
                        src={player.photoURL} 
                        alt={player.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {player.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className={`font-bold ${
                        player.rank <= 3 ? 'text-white' : 'text-gray-200'
                      }`}>
                        {player.displayName}
                        {player.isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">Vous</span>
                        )}
                      </h3>
                      <p className={`text-sm ${
                        player.rank <= 3 ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        Niveau {player.level} • {player.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
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
            <h3 className="text-white text-xl font-semibold mb-2">Aucun participant trouvé</h3>
            <p className="text-gray-400">Vérifiez votre connexion Firebase ou actualisez la page.</p>
            <button 
              onClick={loadLeaderboard}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Réessayer
            </button>
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

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-gray-400 font-mono text-sm mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-500">
            {JSON.stringify({ 
              totalUsers: leaderboard.length, 
              currentUserId: user?.uid,
              userInLeaderboard: !!userStats,
              firstUser: leaderboard[0] 
            }, null, 2)}
          </pre>
        </div>
      )}
    </PremiumLayout>
  );
};

export default LeaderboardPage;
