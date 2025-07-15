// ==========================================
// 📁 react-app/src/components/gamification/index.js
// INDEX GAMIFICATION CORRIGÉ - Exports sécurisés
// ==========================================

/**
 * 🔧 CORRECTION GLOBALE POUR TypeError: l is not a function
 * 
 * Problème identifié: Les imports/exports circulaires et conditionnels
 * causent des erreurs dans l'environnement de production Vite
 * 
 * Solution: Simplifier tous les exports et créer des composants fallback
 */

// ✅ Composant Leaderboard simplifié et sécurisé
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Users, Zap, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../core/services/analyticsService.js';

const Leaderboard = ({ limit = 10, showHeader = true }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('xp');

  // 🔥 CHARGER LES VRAIES DONNÉES FIREBASE
  useEffect(() => {
    const loadRealLeaderboard = async () => {
      try {
        setLoading(true);
        
        console.log('🏆 Chargement VRAI leaderboard depuis Firebase...');
        
        // Utiliser le service analytics pour charger les vrais top performers
        const topPerformersData = await analyticsService.getTopPerformers(limit);
        
        console.log('✅ VRAI leaderboard chargé:', topPerformersData?.length || 0);
        
        setLeaderboardData(topPerformersData || []);
      } catch (error) {
        console.error('❌ Erreur chargement leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealLeaderboard();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Classement</h3>
          </div>
          <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {leaderboardData.slice(0, limit).map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
              {index + 1}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-sm text-gray-400">Niveau {user.level}</div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400 font-medium">
                <Zap className="w-4 h-4" />
                {user.xp} XP
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Composant BadgeCollection avec VRAIES données Firebase
const BadgeCollection = ({ userId, limit = 6 }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealBadges = async () => {
      if (!userId) {
        setBadges([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        console.log('🏆 Chargement VRAIS badges pour:', userId);
        
        // Utiliser le service analytics pour charger les vrais badges
        const userBadgesData = await analyticsService.getUserBadges(userId);
        
        console.log('✅ VRAIS badges chargés:', userBadgesData?.length || 0);
        
        setBadges(userBadgesData || []);
      } catch (error) {
        console.error('❌ Erreur chargement badges:', error);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Medal className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Badges</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {badges.slice(0, limit).map(badge => (
          <div
            key={badge.id}
            className={`p-3 rounded-lg text-center ${
              badge.unlocked 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                : 'bg-gray-700/50 border border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <div className={`text-xs font-medium ${
              badge.unlocked ? 'text-yellow-400' : 'text-gray-500'
            }`}>
              {badge.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Composant LevelProgress simplifié
const LevelProgress = ({ currentXp = 0, currentLevel = 1 }) => {
  const xpForNextLevel = currentLevel * 1000;
  const progressPercent = Math.min((currentXp % 1000) / 1000 * 100, 100);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Progression</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-white mb-1">Niveau {currentLevel}</div>
        <div className="text-gray-400 text-sm">{currentXp} XP total</div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{currentXp % 1000} XP</span>
          <span>{xpForNextLevel} XP</span>
        </div>
      </div>
    </div>
  );
};

// ✅ Composant XPDisplay simplifié
const XPDisplay = ({ currentXp = 0, recentGain = 0 }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-yellow-400">{currentXp} XP</div>
          <div className="text-sm text-gray-300">Experience totale</div>
        </div>
        <div className="text-right">
          {recentGain > 0 && (
            <div className="text-green-400 text-sm font-medium">
              +{recentGain} XP récents
            </div>
          )}
          <Zap className="w-8 h-8 text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

// ✅ EXPORTS SÉCURISÉS - Un seul export par composant
export { Leaderboard };
export { BadgeCollection };
export { LevelProgress };
export { XPDisplay };

// ✅ Export default pour compatibilité
export default {
  Leaderboard,
  BadgeCollection, 
  LevelProgress,
  XPDisplay
};

console.log('✅ Gamification index - Tous les composants exports sécurisés');
console.log('🔧 Types disponibles:', typeof Leaderboard, typeof BadgeCollection);
