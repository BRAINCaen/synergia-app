// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION FIREBASE COMPLET - BUILD SAFE
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { 
  Trophy, 
  Star, 
  Target, 
  Gift, 
  Crown, 
  Flame, 
  Award,
  Users,
  ChevronRight,
  Plus,
  BarChart3
} from 'lucide-react';

/**
 * 🎮 PAGE GAMIFICATION FIREBASE COMPLET - BUILD SAFE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // ✅ DONNÉES FIREBASE RÉELLES
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ DONNÉES RÉELLES CALCULÉES DEPUIS FIREBASE
  const [realGamificationData, setRealGamificationData] = useState({
    user: {
      level: 1,
      xp: 0,
      nextLevelXP: 1000,
      totalXP: 0,
      rank: 0,
      streak: 1,
      badges: 0
    },
    challenges: []
  });

  /**
   * 📊 CHARGER VRAIES DONNÉES GAMIFICATION FIREBASE
   * ✅ CORRECTION: Utilisation de useCallback pour éviter la boucle infinie
   */
  const loadRealGamificationData = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🎮 Chargement gamification Firebase pour:', user.uid);
      
      // 🔥 CALCULER LES VRAIS STATS DEPUIS FIREBASE
      const level = gamification?.level || 1;
      const totalXP = gamification?.totalXP || 0;
      const nextLevelXP = Math.floor(100 * Math.pow(1.5, level));
      const currentLevelXP = level > 1 ? Math.floor(100 * Math.pow(1.5, level - 1)) : 0;
      const xp = totalXP - currentLevelXP;
      
      // 🏆 CALCULER LE RANG RÉEL
      const usersQuery = query(collection(db, 'gamification'));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.totalXP) {
          allUsers.push({ uid: doc.id, totalXP: data.totalXP });
        }
      });
      
      allUsers.sort((a, b) => b.totalXP - a.totalXP);
      const userRank = allUsers.findIndex(u => u.uid === user.uid) + 1;
      
      // 🎯 CRÉER LES DÉFIS DYNAMIQUES
      const challenges = [
        {
          id: 'daily_tasks',
          title: 'Compléteur du Jour',
          description: 'Terminer 3 tâches aujourd\'hui',
          progress: Math.min(userStats?.tasksCompletedToday || 0, 3),
          total: 3,
          reward: 50,
          difficulty: 'easy',
          type: 'daily'
        },
        {
          id: 'weekly_xp',
          title: 'Chasseur d\'XP',
          description: 'Gagner 500 XP cette semaine',
          progress: Math.min(gamification?.weeklyXP || 0, 500),
          total: 500,
          reward: 200,
          difficulty: 'medium',
          type: 'weekly'
        },
        {
          id: 'project_completion',
          title: 'Maître des Projets',
          description: 'Terminer un projet complet',
          progress: userStats?.projectsCompleted || 0,
          total: 1,
          reward: 300,
          difficulty: 'hard',
          type: 'project'
        }
      ];
      
      // ✅ METTRE À JOUR L'ÉTAT AVEC LES VRAIES DONNÉES
      setRealGamificationData({
        user: {
          level,
          xp,
          nextLevelXP,
          totalXP,
          rank: userRank || 0,
          streak: gamification?.loginStreak || 1,
          badges: (gamification?.badges || []).length
        },
        challenges
      });
      
      console.log('✅ Gamification data loaded:', {
        level,
        totalXP,
        rank: userRank,
        challengesCount: challenges.length
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement gamification:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, gamification, userStats]); // ✅ CORRECTION: Dépendances spécifiques

  // ✅ CORRECTION: useEffect avec dépendances correctes
  useEffect(() => {
    if (user?.uid && !dataLoading) {
      loadRealGamificationData();
    }
  }, [user?.uid, dataLoading, loadRealGamificationData]);

  // 🎯 FONCTION POUR RÉCLAMER UN DÉFI
  const claimChallenge = async (challengeId) => {
    try {
      console.log('🎯 Réclamation défi:', challengeId);
      // Logique de réclamation ici
    } catch (error) {
      console.error('❌ Erreur réclamation défi:', error);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de votre gamification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Trophy className="w-10 h-10 mr-3 text-yellow-400" />
            Gamification
          </h1>
          <p className="text-purple-200">Votre progression et récompenses</p>
        </div>

        {/* STATS UTILISATEUR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                Niveau {realGamificationData.user.level}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((realGamificationData.user.xp / (realGamificationData.user.nextLevelXP - (realGamificationData.user.level > 1 ? Math.floor(100 * Math.pow(1.5, realGamificationData.user.level - 2)) : 0))) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {realGamificationData.user.xp} / {realGamificationData.user.nextLevelXP - (realGamificationData.user.level > 1 ? Math.floor(100 * Math.pow(1.5, realGamificationData.user.level - 2)) : 0)} XP
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {realGamificationData.user.totalXP.toLocaleString()} XP
              </span>
            </div>
            <p className="text-purple-200 text-sm">Total Experience</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                #{realGamificationData.user.rank}
              </span>
            </div>
            <p className="text-purple-200 text-sm">Classement Global</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">
                {realGamificationData.user.streak} jours
              </span>
            </div>
            <p className="text-purple-200 text-sm">Série Active</p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="mb-8">
          <div className="flex space-x-4 bg-white/10 backdrop-blur-md rounded-lg p-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'challenges', label: 'Défis', icon: Target },
              { id: 'badges', label: 'Badges', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENU DES ONGLETS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PROGRESSION */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Progression
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white mb-2">
                    <span>Niveau actuel</span>
                    <span>Niveau {realGamificationData.user.level}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      style={{ width: `${(realGamificationData.user.xp / (realGamificationData.user.nextLevelXP - (realGamificationData.user.level > 1 ? Math.floor(100 * Math.pow(1.5, realGamificationData.user.level - 2)) : 0))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-purple-200 text-sm">
                  Prochain niveau dans {(realGamificationData.user.nextLevelXP - realGamificationData.user.totalXP).toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* STATISTIQUES */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{realGamificationData.user.badges}</div>
                  <div className="text-purple-200 text-sm">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{realGamificationData.user.streak}</div>
                  <div className="text-purple-200 text-sm">Jours consécutifs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Défis Actifs
            </h3>
            
            {realGamificationData.challenges.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                <Target className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Aucun défi actif</h4>
                <p className="text-purple-200 mb-4">
                  Créez des tâches pour débloquer de nouveaux défis !
                </p>
                <Link 
                  to="/tasks"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une Tâche
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {realGamificationData.challenges.map(challenge => (
                  <div key={challenge.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{challenge.title}</h4>
                        <p className="text-purple-200 text-sm">{challenge.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-white text-sm mb-2">
                        <span>Progression</span>
                        <span>{challenge.progress} / {challenge.total}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((challenge.progress / challenge.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <Gift className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">+{challenge.reward} XP</span>
                      </div>
                      
                      {challenge.progress >= challenge.total ? (
                        <button
                          onClick={() => claimChallenge(challenge.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all"
                        >
                          <Gift className="w-4 h-4 inline mr-1" />
                          Réclamer
                        </button>
                      ) : (
                        <div className="text-purple-300 text-sm">
                          {challenge.total - challenge.progress} restant
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Collection de Badges
            </h3>
            
            {realGamificationData.user.badges === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                <Award className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Aucun badge débloqué</h4>
                <p className="text-purple-200 mb-4">
                  Complétez des tâches et relevez des défis pour gagner vos premiers badges !
                </p>
                <Link 
                  to="/tasks"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une Tâche
                </Link>
              </div>
            ) : (
              <div className="text-center text-purple-200">
                Vous avez {realGamificationData.user.badges} badge(s) !
              </div>
            )}
          </div>
        )}

        {/* LIENS RAPIDES */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/leaderboard"
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Crown className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Classement</span>
          </Link>
          
          <Link
            to="/badges"
            className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Badges</span>
          </Link>
          
          <Link
            to="/rewards"
            className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Gift className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Récompenses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;
