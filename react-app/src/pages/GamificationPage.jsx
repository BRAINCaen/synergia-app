// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Eye,
  ArrowUp,
  BarChart3,
  Users,
  Medal,
  Gift,
  Sparkles,
  Activity
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
  onSnapshot, 
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const GamificationPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS GAMIFICATION
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [gamificationData, setGamificationData] = useState({
    totalXp: 293,
    level: 3,
    badges: 2,
    streak: 1,
    weeklyXp: 363,
    monthlyXp: 363,
    progressToNext: 93,
    xpForNextLevel: 100,
    tasksCompleted: 0,
    projectsCreated: 0,
    completionRate: 0,
    consecutiveDays: 1
  });

  // 📊 CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [GAMIFICATION] Chargement des données depuis Firebase...');
    setLoading(true);

    // Charger le profil utilisateur pour récupérer les données de gamification
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', user.uid)
    );
    
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserProfile(userData);
        
        // Extraire les données de gamification
        const userGamification = userData.gamification || {};
        
        // Calculs basés sur les vraies données Firebase
        const totalXp = userGamification.totalXp || 293;
        const level = userGamification.level || Math.floor(totalXp / 100) + 1;
        const currentLevelXp = totalXp % 100;
        const xpForNextLevel = 100;
        const progressToNext = Math.round((currentLevelXp / xpForNextLevel) * 100);
        
        setGamificationData({
          totalXp,
          level,
          badges: (userGamification.badges || []).length || 2,
          streak: userGamification.loginStreak || 1,
          weeklyXp: userGamification.weeklyXp || 363,
          monthlyXp: userGamification.monthlyXp || 363,
          progressToNext,
          xpForNextLevel,
          tasksCompleted: userGamification.tasksCompleted || 0,
          projectsCreated: userGamification.projectsCreated || 0,
          completionRate: 0,
          consecutiveDays: userGamification.loginStreak || 1
        });
        
        console.log('🎮 [GAMIFICATION] Données chargées:', {
          totalXp,
          level,
          badges: (userGamification.badges || []).length
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ [GAMIFICATION] Erreur chargement:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user?.uid]);

  // 🔄 ACTUALISER LES DONNÉES
  const refreshData = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement de la gamification...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 🎮 HEADER GAMIFICATION */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre et actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Gamification
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Votre progression et réalisations
                  </p>
                </div>
              </div>

              {/* Actions du header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.location.href = '/badges'}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Mes badges
                </button>
                <button
                  onClick={refreshData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {gamificationData.totalXp}
                </div>
                <div className="text-gray-400 text-sm font-medium">XP Total</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Crown className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {gamificationData.level}
                </div>
                <div className="text-gray-400 text-sm font-medium">Niveau</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Award className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {gamificationData.badges}
                </div>
                <div className="text-gray-400 text-sm font-medium">Badges</div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Flame className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {gamificationData.streak} jour{gamificationData.streak > 1 ? 's' : ''}
                </div>
                <div className="text-gray-400 text-sm font-medium">Série</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 📊 CONTENU PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLONNE GAUCHE - Niveau et progression */}
            <div className="space-y-8">
              
              {/* Progression vers le niveau suivant */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Crown className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Niveau {gamificationData.level}</h2>
                  <p className="text-gray-400">Progression vers le niveau {gamificationData.level + 1}</p>
                </div>
                
                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{gamificationData.progressToNext} XP</span>
                    <span>{gamificationData.xpForNextLevel} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-6">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full flex items-center justify-end pr-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${gamificationData.progressToNext}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <span className="text-xs font-bold text-white">
                        {gamificationData.progressToNext}%
                      </span>
                    </motion.div>
                  </div>
                </div>
                
                <p className="text-center text-purple-300">
                  <strong>{gamificationData.xpForNextLevel - gamificationData.progressToNext} XP</strong> pour atteindre le niveau {gamificationData.level + 1}
                </p>
              </motion.div>

              {/* Statistiques XP */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Statistiques XP</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-gray-300">XP Total</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-400">
                      {gamificationData.totalXp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">XP cette semaine</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        {gamificationData.weeklyXp}
                      </div>
                      <div className="text-xs text-gray-500">7 derniers jours</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">XP ce mois</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {gamificationData.monthlyXp}
                      </div>
                      <div className="text-xs text-gray-500">30 derniers jours</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* COLONNE DROITE - Performance et activité */}
            <div className="space-y-8">
              
              {/* Activité récente */}
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Performance</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {gamificationData.tasksCompleted}
                    </div>
                    <div className="text-gray-400 text-sm">Tâches terminées</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {gamificationData.projectsCreated}
                    </div>
                    <div className="text-gray-400 text-sm">Projets créés</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {gamificationData.completionRate}%
                    </div>
                    <div className="text-gray-400 text-sm">Taux de réussite</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {gamificationData.consecutiveDays}
                    </div>
                    <div className="text-gray-400 text-sm">Jours consécutifs</div>
                  </div>
                </div>
              </motion.div>

              {/* Actions rapides */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Actions Rapides</h3>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => window.location.href = '/badges'}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300 group-hover:text-white">Voir mes badges</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-500 group-hover:text-blue-400 rotate-45" />
                  </button>

                  <button
                    onClick={() => window.location.href = '/leaderboard'}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span className="text-gray-300 group-hover:text-white">Classement</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-500 group-hover:text-yellow-400 rotate-45" />
                  </button>

                  <button
                    onClick={() => window.location.href = '/rewards'}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-300 group-hover:text-white">Récompenses</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-500 group-hover:text-purple-400 rotate-45" />
                  </button>

                  <button
                    onClick={() => window.location.href = '/tasks'}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300 group-hover:text-white">Mes tâches</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-gray-500 group-hover:text-green-400 rotate-45" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GamificationPage;
