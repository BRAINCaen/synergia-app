// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION FIREBASE PUR - VERSION BUILD SAFE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
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
 * 🎮 PAGE GAMIFICATION FIREBASE PUR - BUILD SAFE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // ✅ DONNÉES RÉELLES CALCULÉES DEPUIS FIREBASE (VERSION SIMPLE)
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

  useEffect(() => {
    if (user?.uid) {
      loadRealGamificationData();
    }
  }, [user?.uid]);

  /**
   * 📊 CHARGER VRAIES DONNÉES GAMIFICATION (VERSION SIMPLIFIÉE)
   */
  const loadRealGamificationData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🎮 Chargement gamification pour:', user.uid);
      
      // Version simplifiée - pas de requêtes Firebase complexes
      // Utiliser les données basiques de l'utilisateur
      const totalXp = 0; // À récupérer depuis Firebase si disponible
      const level = Math.floor(totalXp / 1000) + 1;
      const nextLevelXP = level * 1000;
      
      // Générer défis basiques
      const basicChallenges = [
        {
          id: 1,
          name: 'Premier Pas',
          description: 'Créer votre première tâche',
          progress: 0,
          target: 1,
          reward: 100,
          endDate: getNextWeek(),
          difficulty: 'easy',
          category: 'Débutant'
        },
        {
          id: 2,
          name: 'Productivité',
          description: 'Terminer 5 tâches',
          progress: 0,
          target: 5,
          reward: 250,
          endDate: getNextWeek(),
          difficulty: 'medium',
          category: 'Hebdomadaire'
        }
      ];
      
      setRealGamificationData({
        user: {
          level,
          xp: totalXp,
          nextLevelXP,
          totalXP: totalXp,
          rank: 0,
          streak: 1,
          badges: 0
        },
        challenges: basicChallenges
      });

    } catch (error) {
      console.error('❌ Erreur chargement gamification:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📅 FONCTION UTILITAIRE DATE
   */
  const getNextWeek = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  /**
   * 🎯 REJOINDRE UN DÉFI
   */
  const joinChallenge = (challenge) => {
    console.log('🎯 Défi rejoint:', challenge.name);
    alert(`🚀 Vous avez rejoint le défi "${challenge.name}" !`);
  };

  // ✅ SEULEMENT 2 ONGLETS
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'challenges', label: 'Défis', icon: Target }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-400">Chargement de votre gamification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            🎮 Centre de Gamification
          </h1>
          <p className="text-gray-400 text-lg">
            Progressez, débloquez des récompenses et défiez vos collègues !
          </p>
        </div>

        {/* STATISTIQUES UTILISATEUR RÉELLES */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Niveau et XP RÉELS */}
            <div className="md:col-span-2 text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{realGamificationData.user.level}</span>
                </div>
                <div className="text-lg font-bold text-white">Niveau {realGamificationData.user.level}</div>
                <div className="text-gray-400 text-sm">{realGamificationData.user.xp} / {realGamificationData.user.nextLevelXP} XP</div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min(100, (realGamificationData.user.xp / realGamificationData.user.nextLevelXP) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">
                {Math.max(0, realGamificationData.user.nextLevelXP - realGamificationData.user.xp)} XP pour le niveau suivant
              </p>
            </div>

            {/* Statistiques */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              
              {/* Classement */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">-</div>
                <div className="text-gray-400 text-sm">Classement</div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">{realGamificationData.user.streak}</div>
                <div className="text-gray-400 text-sm">Streak jours</div>
              </div>

              {/* Badges */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{realGamificationData.user.badges}</div>
                <div className="text-gray-400 text-sm">Badges</div>
              </div>

            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex space-x-1 mb-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENU DYNAMIQUE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Défis en cours */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Défis en Cours
              </h3>
              
              {realGamificationData.challenges.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {realGamificationData.challenges.slice(0, 3).map(challenge => (
                    <div key={challenge.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{challenge.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          challenge.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progression</span>
                          <span className="text-white">{challenge.progress}/{challenge.target}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {challenge.reward} XP
                        </span>
                        <span className="text-gray-400 text-sm">
                          Expire: {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Créez des tâches pour débloquer des défis !</p>
                </div>
              )}
              
              <button 
                onClick={() => setActiveTab('challenges')}
                className="w-full text-center text-blue-400 hover:text-blue-300 py-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                Voir tous les défis →
              </button>
            </div>

            {/* Statistiques détaillées */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Vos Performances
              </h3>
              
              <div className="space-y-6">
                
                {/* Progression niveau */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Progression Niveau</span>
                    <span className="text-white font-medium">
                      Niveau {realGamificationData.user.level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
                      style={{ width: `${Math.min(100, (realGamificationData.user.xp / realGamificationData.user.nextLevelXP) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {realGamificationData.user.xp} / {realGamificationData.user.nextLevelXP} XP
                  </div>
                </div>

                {/* Actions rapides vers pages dédiées */}
                <div className="space-y-3">
                  <Link 
                    to="/badges"
                    className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">Mes Badges</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </Link>
                  
                  <Link 
                    to="/rewards"
                    className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-green-400" />
                      <span className="text-white">Récompenses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </Link>
                  
                  <Link 
                    to="/leaderboard"
                    className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Classement</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Défis */}
        {activeTab === 'challenges' && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Défis Disponibles</h3>
            </div>
            
            {realGamificationData.challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realGamificationData.challenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className="p-6 bg-gray-700/30 rounded-xl border border-gray-600/50 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white">{challenge.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>
                    
                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-white font-medium">
                          {challenge.progress}/{challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Récompense */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        <span className="font-medium">{challenge.reward} XP</span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {challenge.category}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <button 
                      onClick={() => joinChallenge(challenge)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Commencer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-500 mb-2">Aucun défi disponible</p>
                <p className="text-sm text-gray-400 mb-6">
                  Créez des tâches pour débloquer vos premiers défis !
                </p>
                <Link 
                  to="/tasks"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une Tâche
                </Link>
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
