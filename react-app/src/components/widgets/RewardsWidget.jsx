// ==========================================
// 📁 react-app/src/components/widgets/RewardsWidget.jsx
// WIDGET RÉCOMPENSES POUR LE DASHBOARD
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Gift, 
  Crown, 
  Star, 
  ArrowRight, 
  Sparkles,
  Target,
  Coins,
  Trophy,
  Zap,
  TrendingUp
} from 'lucide-react';

// Hooks
import { useRewards } from '../../shared/hooks/useRewards.js';
import { useGameStore } from '../../shared/stores/gameStore.js';

/**
 * 🎁 WIDGET RÉCOMPENSES POUR LE DASHBOARD
 */
const RewardsWidget = () => {
  const { userStats } = useGameStore();
  const {
    currentUserXP,
    getTopAffordableRewards,
    getNextReward,
    stats,
    loading
  } = useRewards();

  const [topRewards, setTopRewards] = useState([]);
  const [nextReward, setNextReward] = useState(null);

  // Charger les données quand les hooks sont prêts
  useEffect(() => {
    if (currentUserXP > 0) {
      const affordable = getTopAffordableRewards(3);
      const next = getNextReward();
      
      setTopRewards(affordable);
      setNextReward(next);
    }
  }, [currentUserXP, getTopAffordableRewards, getNextReward]);

  // Si en cours de chargement
  if (loading) {
    return (
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-700 rounded-lg mr-3"></div>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* En-tête du widget */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Récompenses</h3>
            <p className="text-gray-400 text-sm">Échangez vos XP</p>
          </div>
        </div>
        
        <Link
          to="/rewards"
          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center text-sm"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">XP Disponibles</p>
              <p className="text-lg font-bold text-blue-400">{currentUserXP.toLocaleString()}</p>
            </div>
            <Coins className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Obtenues</p>
              <p className="text-lg font-bold text-green-400">{stats.totalRedeemed}</p>
            </div>
            <Trophy className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>

      {/* Prochaine récompense accessible */}
      {nextReward && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-purple-400 text-sm font-medium">Prochaine récompense</span>
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">{nextReward.name}</h4>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">
              +{nextReward.xpNeeded} XP requis
            </span>
            <span className="text-yellow-400 text-xs font-bold">
              {nextReward.xpCost} XP
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-3">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((currentUserXP / nextReward.xpCost) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Récompenses accessibles */}
      {topRewards.length > 0 ? (
        <div>
          <div className="flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-yellow-400 text-sm font-medium">Récompenses disponibles</span>
          </div>
          
          <div className="space-y-2">
            {topRewards.slice(0, 3).map((reward, index) => (
              <motion.div
                key={reward.id}
                className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="text-white text-sm font-medium truncate">
                      {reward.name}
                    </h5>
                    <p className="text-gray-400 text-xs truncate">
                      {reward.category}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <span className="text-green-400 text-sm font-bold">
                      {reward.xpCost} XP
                    </span>
                    <p className="text-green-400 text-xs">✅ Disponible</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {topRewards.length > 3 && (
            <Link
              to="/rewards"
              className="block text-center text-purple-400 hover:text-purple-300 text-sm mt-3 transition-colors"
            >
              +{topRewards.length - 3} autres récompenses disponibles
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Star className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h4 className="text-gray-400 font-medium mb-2">Gagnez plus d'XP !</h4>
          <p className="text-gray-500 text-sm">
            Complétez des tâches pour débloquer des récompenses
          </p>
          <Link
            to="/tasks"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm mt-3 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Voir les tâches
          </Link>
        </div>
      )}

      {/* Action rapide */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <Link
          to="/rewards"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <Gift className="w-4 h-4" />
          <span>Boutique des récompenses</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default RewardsWidget;
