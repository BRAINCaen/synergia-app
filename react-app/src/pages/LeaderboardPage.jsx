// ==========================================
// 📁 react-app/src/pages/LeaderboardPage.jsx
// PAGE CLASSEMENT AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Trophy, 
  Medal, 
  TrendingUp, 
  Star, 
  Zap, 
  Award, 
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  Flame,
  BarChart3,
  Filter
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const LeaderboardPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS LEADERBOARD
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Tout temps');
  const [category, setCategory] = useState('XP Total');
  const [userStats, setUserStats] = useState(null);

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

  // 📊 CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (!user?.uid) return;
    
    loadLeaderboard();
  }, [user?.uid, timeRange, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      console.log('🏆 Chargement VRAIES données leaderboard depuis Firebase...');
      
      // Construire la requête selon la catégorie
      let orderField;
      switch (category) {
        case 'XP Total':
          orderField = 'gamification.totalXp';
          break;
        case 'Tâches':
          orderField = 'gamification.tasksCompleted';
          break;
        case 'Badges':
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
        
        // S'assurer que l'utilisateur a des données de gamification ou XP
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
            level: userData.gamification?.level || userData.level || Math.floor((userData.gamification?.totalXp || userData.totalXp || 0) / 100) + 1,
            
            // Données tâches (essayer plusieurs sources)
            tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
            
            // Données badges (essayer plusieurs sources)
            badgesCount: Array.isArray(userData.gamification?.badges) 
              ? userData.gamification.badges.length 
              : (userData.badges?.length || 0),
            
            // Données streak
            loginStreak: userData.gamification?.loginStreak || 0,
            
            // Avatar par défaut basé sur l'initiale du nom
            avatar: cleanedName.charAt(0).toUpperCase(),
            
            // Métadonnées
            lastActive: userData.lastLoginAt || userData.updatedAt,
            department: userData.profile?.department || 'Gestion'
          });
        }
      });

      console.log('✅ [LEADERBOARD] Chargé', users.length, 'utilisateurs depuis Firebase');
      setLeaderboard(users);
      
      // Trouver les stats de l'utilisateur actuel
      const currentUserStats = users.find(u => u.email === user.email || u.id === user.uid);
      setUserStats(currentUserStats);
      
    } catch (error) {
      console.error('❌ [LEADERBOARD] Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 ACTUALISER LES DONNÉES
  const refreshData = () => {
    loadLeaderboard();
  };

  // 🎨 FONCTION POUR OBTENIR L'ICÔNE DE RANG
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return (
        <div className="w-6 h-6 flex items-center justify-center bg-gray-600 text-white text-sm font-bold rounded">
          {rank}
        </div>
      );
    }
  };

  // 🎨 FONCTION POUR OBTENIR LA COULEUR DE FOND DU RANG
  const getRankBgColor = (rank, isCurrentUser = false) => {
    if (isCurrentUser) {
      return 'bg-blue-900/30 border border-blue-500/50';
    }
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30';
      default: return 'bg-gray-800/50 border border-gray-700/50';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement du classement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 🏆 HEADER CLASSEMENT */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre et actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Classement
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Tableau de classement de l'équipe par performance (Données réelles Firebase)
                  </p>
                </div>
              </div>

              {/* Actions du header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </button>
                <button
                  onClick={() => window.location.href = '/analytics'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir historique
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* 🔍 FILTRES */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Filtre période */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm font-medium">Période:</span>
                  <div className="flex gap-2">
                    {['Tout temps', 'Ce mois', 'Cette semaine'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeRange(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          timeRange === period
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtre catégorie */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm font-medium">Catégorie:</span>
                  <div className="flex gap-2">
                    {['XP Total', 'Tâches', 'Badges'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          category === cat
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📈 CLASSEMENT COMPLET */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Classement complet</h2>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun classement disponible</h3>
                <p className="text-gray-400">Les données de classement apparaîtront ici une fois que les utilisateurs auront de l'activité.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((member, index) => {
                  const isCurrentUser = member.email === user?.email || member.id === user?.uid;
                  
                  return (
                    <motion.div
                      key={member.id || index}
                      className={`
                        flex items-center gap-6 p-6 rounded-xl transition-all duration-300
                        ${getRankBgColor(member.rank, isCurrentUser)}
                        hover:scale-[1.01] hover:shadow-xl
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Rang et avatar */}
                      <div className="flex items-center gap-4">
                        {getRankIcon(member.rank)}
                        
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                          ${member.rank === 1 ? 'bg-yellow-500' : 
                            member.rank === 2 ? 'bg-gray-400' :
                            member.rank === 3 ? 'bg-orange-500' :
                            'bg-blue-600'
                          }
                        `}>
                          {member.avatar}
                        </div>
                      </div>

                      {/* Informations utilisateur */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {member.displayName}
                            {isCurrentUser && (
                              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                Vous
                              </span>
                            )}
                          </h3>
                          {member.rank <= 3 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`
                                px-2 py-1 rounded-full font-medium
                                ${member.rank === 1 ? 'bg-yellow-500/20 text-yellow-300' :
                                  member.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                  'bg-orange-500/20 text-orange-300'
                                }
                              `}>
                                {member.rank === 1 ? '👑 Première place' :
                                 member.rank === 2 ? '🥈 Deuxième place' :
                                 '🥉 Troisième place'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Niveau {member.level} • {member.department}</span>
                          {member.loginStreak > 0 && (
                            <div className="flex items-center gap-1">
                              <Flame className="h-4 w-4 text-orange-400" />
                              <span>{member.loginStreak} jours</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">
                          {category === 'XP Total' ? `${member.totalXp} XP` :
                           category === 'Tâches' ? `${member.tasksCompleted}` :
                           `${member.badgesCount}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 justify-end">
                          {category === 'XP Total' && (
                            <>
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{member.totalXp} XP</span>
                            </>
                          )}
                          {category === 'Tâches' && (
                            <>
                              <Target className="h-4 w-4 text-green-400" />
                              <span>{member.tasksCompleted} tâches</span>
                            </>
                          )}
                          {category === 'Badges' && (
                            <>
                              <Award className="h-4 w-4 text-purple-400" />
                              <span>{member.badgesCount} badges</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Footer avec info utilisateur actuel */}
            {userStats && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="text-center text-sm text-gray-400">
                  <span>Votre position actuelle : </span>
                  <span className="text-blue-400 font-medium">#{userStats.rank} sur {leaderboard.length}</span>
                  <span className="mx-2">•</span>
                  <span>{userStats.totalXp} XP total</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
