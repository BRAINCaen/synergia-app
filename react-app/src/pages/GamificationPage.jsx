// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// GAMIFICATION SIMPLIFIÉE - VUE D'ENSEMBLE + DÉFIS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Target, 
  Gift, 
  Crown, 
  Flame, 
  Zap, 
  Award,
  Medal,
  Users,
  Calendar,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Lock,
  Unlock,
  Plus,
  RotateCcw
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎮 PAGE GAMIFICATION SIMPLIFIÉE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [gamificationData, setGamificationData] = useState({
    user: {
      level: 2,
      xp: 1250,
      nextLevelXP: 2000,
      totalXP: 1250,
      rank: 15,
      streak: 5,
      badges: []
    },
    challenges: []
  });

  console.log('🎮 GamificationPage rendue pour:', user?.email);

  // Charger les données de gamification
  useEffect(() => {
    loadGamificationData();
  }, [user]);

  const loadGamificationData = async () => {
    try {
      // Données de base utilisateur
      const userXP = user?.gamification?.totalXP || 1250;
      const level = Math.floor(userXP / 1000) + 1;
      const nextLevelXP = level * 1000;

      // Défis actifs (simulation basée sur de vraies données)
      const activeChallenges = [
        { 
          id: 1, 
          name: 'Marathon Productivité', 
          description: 'Compléter 20 tâches cette semaine',
          progress: 12,
          target: 20,
          reward: 200,
          endDate: '2024-01-30',
          difficulty: 'medium',
          category: 'Hebdomadaire'
        },
        { 
          id: 2, 
          name: 'Collaboration Extrême', 
          description: 'Collaborer sur 5 projets différents',
          progress: 2,
          target: 5,
          reward: 500,
          endDate: '2024-02-15',
          difficulty: 'hard',
          category: 'Mensuel'
        },
        { 
          id: 3, 
          name: 'Streak Master', 
          description: '7 jours consécutifs de connexion',
          progress: 5,
          target: 7,
          reward: 150,
          endDate: '2024-01-25',
          difficulty: 'easy',
          category: 'Quotidien'
        }
      ];

      setGamificationData({
        user: {
          level: level,
          xp: userXP,
          nextLevelXP: nextLevelXP,
          totalXP: userXP,
          rank: 15,
          streak: 5,
          badges: 2
        },
        challenges: activeChallenges
      });

    } catch (error) {
      console.error('❌ Erreur chargement gamification:', error);
    }
  };

  // Rejoindre un défi
  const joinChallenge = (challenge) => {
    console.log('🎯 Défi rejoint:', challenge.name);
    alert(`🚀 Vous avez rejoint le défi "${challenge.name}" !`);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Trophy },
    { id: 'challenges', label: 'Défis', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            🎉 HEADER GAMIFICATION
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            🎮 Centre de Gamification
          </h1>
          <p className="text-gray-400 text-lg">
            Progressez, débloquez des récompenses et défiez vos collègues !
          </p>
        </motion.div>

        {/* ==========================================
            📊 STATISTIQUES UTILISATEUR
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Niveau et XP */}
            <div className="md:col-span-2 text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">{gamificationData.user.level}</span>
                </div>
                <div className="text-lg font-bold text-white">Niveau {gamificationData.user.level}</div>
                <div className="text-gray-400 text-sm">{gamificationData.user.xp} / {gamificationData.user.nextLevelXP} XP</div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${(gamificationData.user.xp / gamificationData.user.nextLevelXP) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">
                {gamificationData.user.nextLevelXP - gamificationData.user.xp} XP pour le niveau suivant
              </p>
            </div>

            {/* Statistiques */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
              
              {/* Classement */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">15</div>
                <div className="text-gray-400 text-sm">Classement</div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">5</div>
                <div className="text-gray-400 text-sm">Streak jours</div>
              </div>

              {/* Badges */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">2</div>
                <div className="text-gray-400 text-sm">Badges</div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ==========================================
            🎯 NAVIGATION TABS
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-1 mb-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2"
        >
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
        </motion.div>

        {/* ==========================================
            📱 CONTENU DYNAMIQUE
            ========================================== */}
        <AnimatePresence mode="wait">
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              
              {/* Défis en cours */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Défis en Cours
                </h3>
                
                <div className="space-y-4 mb-4">
                  {gamificationData.challenges.slice(0, 3).map(challenge => (
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
                          <span className="text-white">{challenge.progress}/{challenge.target} ({Math.round((challenge.progress / challenge.target) * 100)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
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
                      
                      {/* Statut */}
                      <div className="mt-3">
                        {challenge.progress >= challenge.target ? (
                          <span className="text-green-400 text-sm">✅ Défi terminé !</span>
                        ) : (
                          <span className="text-blue-400 text-sm">
                            🚀 Encore {challenge.target - challenge.progress} à faire
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
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
                        Niveau {gamificationData.user.level} → {gamificationData.user.level + 1}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full"
                        style={{ width: `${(gamificationData.user.xp / gamificationData.user.nextLevelXP) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {gamificationData.user.xp} / {gamificationData.user.nextLevelXP} XP
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">#15</div>
                      <div className="text-sm text-gray-400">Classement</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg">
                      <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">5</div>
                      <div className="text-sm text-gray-400">Streak jours</div>
                    </div>
                  </div>

                  {/* Actions rapides */}
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
            </motion.div>
          )}

          {/* Défis */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Défis Disponibles</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Filtrer par:</span>
                    <select className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm border border-gray-600">
                      <option>Tous</option>
                      <option>Quotidien</option>
                      <option>Hebdomadaire</option>
                      <option>Mensuel</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gamificationData.challenges.map(challenge => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
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
                            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round((challenge.progress / challenge.target) * 100)}% complété
                        </div>
                      </div>
                      
                      {/* Récompense et échéance */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">{challenge.reward} XP</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Expire: {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      
                      {/* Statut et action */}
                      <div className="space-y-2">
                        {challenge.progress >= challenge.target ? (
                          <div className="text-center">
                            <div className="text-green-400 text-sm mb-2">✅ Défi terminé !</div>
                            <button className="w-full py-2 bg-green-600 text-white rounded-lg font-medium">
                              Récupérer Récompense
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-blue-400 text-sm mb-2 text-center">
                              🚀 Encore {challenge.target - challenge.progress} à accomplir
                            </div>
                            <button 
                              onClick={() => joinChallenge(challenge)}
                              className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                              Rejoindre
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Catégorie */}
                      <div className="mt-3 text-center">
                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded-full text-xs">
                          {challenge.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Ajouter plus de défis */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400 mb-4">Plus de défis arrivent bientôt !</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Suggérer un Défi
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            🔗 LIENS RAPIDES VERS AUTRES PAGES
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            to="/leaderboard"
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Crown className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Classement Complet</span>
          </Link>
          
          <Link
            to="/badges"
            className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Mes Badges</span>
          </Link>
          
          <Link
            to="/rewards"
            className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center hover:scale-105 transition-transform"
          >
            <Gift className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Mes Récompenses</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationPage;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('🎮 GamificationPage SIMPLIFIÉE chargée');
console.log('🏆 Onglets actifs: Vue d\'ensemble + Défis');
console.log('🚀 Interface premium avec liens vers pages dédiées');
