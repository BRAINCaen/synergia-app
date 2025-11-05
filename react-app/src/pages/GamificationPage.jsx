// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION 100% FIREBASE - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy,
  Award,
  Star,
  Crown,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3,
  Users,
  Medal,
  Gift,
  Activity
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎮 PAGE GAMIFICATION - 100% FIREBASE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  
  // 📊 ÉTATS RÉELS (PAS DE VALEURS PAR DÉFAUT HARDCODÉES)
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentBadges, setRecentBadges] = useState([]);

  // 🔥 CHARGEMENT DES DONNÉES FIREBASE EN TEMPS RÉEL
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('🔄 [GAMIFICATION] Chargement des données Firebase...');

    // Écoute en temps réel du profil utilisateur
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const gamification = userData.gamification || {};

        // Calculer le niveau et la progression
        const totalXP = gamification.totalXp || 0;
        const level = Math.floor(totalXP / 100) + 1;
        const currentLevelXP = (level - 1) * 100;
        const nextLevelXP = level * 100;
        const progressXP = totalXP - currentLevelXP;
        const progressPercent = (progressXP / 100) * 100;

        setGamificationData({
          totalXp: totalXP,
          level: level,
          badges: (gamification.badges || []).length,
          streak: gamification.loginStreak || 0,
          weeklyXp: gamification.weeklyXp || 0,
          monthlyXp: gamification.monthlyXp || 0,
          progressToNext: Math.round(progressPercent),
          xpForNextLevel: 100,
          tasksCompleted: gamification.tasksCompleted || 0,
          projectsCreated: gamification.projectsCreated || 0,
          completionRate: gamification.completionRate || 0,
          consecutiveDays: gamification.consecutiveDays || 0,
          badgesList: gamification.badges || []
        });

        console.log('✅ Données gamification chargées:', {
          xp: totalXP,
          level,
          badges: (gamification.badges || []).length
        });
      }

      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur écoute Firebase:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🏆 CHARGER LE LEADERBOARD
  useEffect(() => {
    if (!user?.uid) return;

    const loadLeaderboard = async () => {
      try {
        const usersQuery = query(
          collection(db, 'users')
        );

        const snapshot = await getDocs(usersQuery);
        const users = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const gamification = data.gamification || {};
          
          users.push({
            id: doc.id,
            displayName: data.displayName || data.email || 'Utilisateur',
            photoURL: data.photoURL,
            totalXp: gamification.totalXp || 0,
            level: Math.floor((gamification.totalXp || 0) / 100) + 1,
            badges: (gamification.badges || []).length
          });
        });

        // Trier par XP décroissant
        users.sort((a, b) => b.totalXp - a.totalXp);

        setLeaderboard(users.slice(0, 10));
        console.log('🏆 Leaderboard chargé:', users.length, 'utilisateurs');
      } catch (error) {
        console.error('❌ Erreur chargement leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, [user?.uid]);

  // 🔄 RAFRAÎCHIR LES DONNÉES
  const refreshData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const gamification = userData.gamification || {};

        const totalXP = gamification.totalXp || 0;
        const level = Math.floor(totalXP / 100) + 1;
        const currentLevelXP = (level - 1) * 100;
        const progressXP = totalXP - currentLevelXP;
        const progressPercent = (progressXP / 100) * 100;

        setGamificationData({
          totalXp: totalXP,
          level: level,
          badges: (gamification.badges || []).length,
          streak: gamification.loginStreak || 0,
          weeklyXp: gamification.weeklyXp || 0,
          monthlyXp: gamification.monthlyXp || 0,
          progressToNext: Math.round(progressPercent),
          xpForNextLevel: 100,
          tasksCompleted: gamification.tasksCompleted || 0,
          projectsCreated: gamification.projectsCreated || 0,
          completionRate: gamification.completionRate || 0,
          consecutiveDays: gamification.consecutiveDays || 0,
          badgesList: gamification.badges || []
        });
      }
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 CHARGEMENT
  if (loading || !gamificationData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de la gamification...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* 📊 EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Gamification
              </h1>
              <p className="text-gray-400 mt-2">
                Suivez votre progression et gagnez des récompenses
              </p>
            </div>

            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
          </div>

          {/* 📊 STATISTIQUES RAPIDES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {gamificationData.totalXp}
              </div>
              <div className="text-gray-400 text-sm">XP Total</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Crown className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {gamificationData.level}
              </div>
              <div className="text-gray-400 text-sm">Niveau</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Award className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {gamificationData.badges}
              </div>
              <div className="text-gray-400 text-sm">Badges</div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {gamificationData.streak}
              </div>
              <div className="text-gray-400 text-sm">Jours consécutifs</div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 📈 PROGRESSION DE NIVEAU */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Progression de Niveau</h3>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-purple-400 mb-2">
                  {gamificationData.level}
                </div>
                <p className="text-gray-400">Niveau actuel</p>
              </div>

              <div className="relative">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                    initial={{ width: 0 }}
                    animate={{ width: `${gamificationData.progressToNext}%` }}
                    transition={{ duration: 1 }}
                  >
                    <span className="text-xs font-bold text-white">
                      {gamificationData.progressToNext}%
                    </span>
                  </motion.div>
                </div>
              </div>

              <p className="text-center text-gray-300">
                <strong>{100 - gamificationData.progressToNext} XP</strong> pour le niveau {gamificationData.level + 1}
              </p>
            </div>
          </motion.div>

          {/* 📊 STATISTIQUES XP */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Statistiques XP</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">XP Total</span>
                </div>
                <span className="text-xl font-bold text-yellow-400">
                  {gamificationData.totalXp}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">XP cette semaine</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  {gamificationData.weeklyXp}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">XP ce mois</span>
                </div>
                <span className="text-lg font-bold text-blue-400">
                  {gamificationData.monthlyXp}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 🏆 MES BADGES */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Mes Badges</h3>
              <span className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {gamificationData.badges}
              </span>
            </div>

            {gamificationData.badgesList && gamificationData.badgesList.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {gamificationData.badgesList.slice(0, 6).map((badge, index) => (
                  <div key={index} className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                    <p className="text-xs text-gray-400">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                Complétez des quêtes pour débloquer des badges !
              </p>
            )}
          </motion.div>

          {/* 👥 LEADERBOARD */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Classement</h3>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === user?.uid
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-gray-700/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-white font-semibold">{player.displayName}</p>
                      <p className="text-gray-400 text-sm">Niveau {player.level}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{player.totalXp} XP</p>
                      <p className="text-gray-400 text-sm">{player.badges} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                Chargement du classement...
              </p>
            )}
          </motion.div>

        </div>

        {/* 📈 STATISTIQUES D'ACTIVITÉ */}
        <motion.div
          className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Activité</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Quêtes complétées</span>
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamificationData.tasksCompleted}</p>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Projets créés</span>
                <Gift className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamificationData.projectsCreated}</p>
            </div>

            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Taux de complétion</span>
                <Medal className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{gamificationData.completionRate}%</p>
            </div>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
};

export default GamificationPage;
