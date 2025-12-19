// ==========================================
// 📁 react-app/src/components/gamification/BadgeLeaderboard.jsx
// LEADERBOARD DES BADGES - CLASSEMENT PAR NOMBRE DE BADGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Award, Crown, Star,
  ChevronUp, ChevronDown, Minus, User
} from 'lucide-react';

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🏆 BADGE LEADERBOARD - Classement par badges
 */
const BadgeLeaderboard = ({
  maxUsers = 10,
  showCurrentUser = true,
  compact = false
}) => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // 📊 Charger le classement
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        // Extraire et trier par nombre de badges
        const usersData = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const badges = data.gamification?.badges || [];
          const badgeCount = badges.length;
          const totalXp = data.gamification?.totalXp || 0;

          usersData.push({
            id: doc.id,
            displayName: data.displayName || data.email?.split('@')[0] || 'Anonyme',
            email: data.email,
            photoURL: data.photoURL,
            badgeCount,
            totalXp,
            level: data.gamification?.level || 1,
            recentBadges: badges.slice(-3) // 3 derniers badges
          });
        });

        // Trier par nombre de badges (desc), puis par XP (desc)
        usersData.sort((a, b) => {
          if (b.badgeCount !== a.badgeCount) {
            return b.badgeCount - a.badgeCount;
          }
          return b.totalXp - a.totalXp;
        });

        // Ajouter les rangs
        usersData.forEach((userData, index) => {
          userData.rank = index + 1;

          // Trouver le rang de l'utilisateur actuel
          if (user && userData.id === user.uid) {
            setCurrentUserRank(userData);
          }
        });

        // Limiter aux N premiers
        setLeaderboard(usersData.slice(0, maxUsers));

        console.log('✅ [LEADERBOARD] Chargé:', usersData.length, 'utilisateurs');

      } catch (error) {
        console.error('❌ [LEADERBOARD] Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [maxUsers, user]);

  // 🏅 Icône de médaille selon le rang
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  // 🎨 Style selon le rang
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-800/50 to-slate-800/50 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-600/50';
      default:
        return 'bg-gray-800/30 border-gray-700/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (compact) {
    // Version compacte pour widgets
    return (
      <div className="space-y-2">
        {leaderboard.slice(0, 5).map((userData, index) => (
          <div
            key={userData.id}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              user?.uid === userData.id ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-gray-800/30'
            }`}
          >
            <div className="w-6 text-center">
              {getRankIcon(userData.rank)}
            </div>
            <div className="flex-1 truncate">
              <span className="text-white text-sm font-medium">{userData.displayName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">{userData.badgeCount}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Classement des Badges
        </h3>
        <span className="text-sm text-gray-400">
          Top {maxUsers}
        </span>
      </div>

      {/* Liste du classement */}
      <div className="space-y-3">
        {leaderboard.map((userData, index) => (
          <motion.div
            key={userData.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
              ${getRankStyle(userData.rank)}
              ${user?.uid === userData.id ? 'ring-2 ring-purple-500/50' : ''}
              hover:scale-[1.02]
            `}
          >
            {/* Rang */}
            <div className="w-12 h-12 flex items-center justify-center">
              {getRankIcon(userData.rank)}
            </div>

            {/* Avatar */}
            <div className="relative">
              {userData.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.displayName}
                  className="w-12 h-12 rounded-full border-2 border-gray-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              {/* Badge niveau */}
              <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full px-1.5 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/50">
                Nv.{userData.level}
              </div>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate">
                  {userData.displayName}
                </span>
                {user?.uid === userData.id && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                    Vous
                  </span>
                )}
              </div>

              {/* Derniers badges */}
              {userData.recentBadges.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {userData.recentBadges.map((badge, i) => (
                    <span key={i} className="text-lg" title={badge.name}>
                      {badge.icon || '🏆'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {userData.badgeCount}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {userData.totalXp.toLocaleString()} XP
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Position de l'utilisateur actuel (si hors top) */}
      {showCurrentUser && currentUserRank && currentUserRank.rank > maxUsers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-4 border-t border-gray-700"
        >
          <p className="text-sm text-gray-400 mb-2">Votre position :</p>
          <div className={`
            flex items-center gap-4 p-4 rounded-xl border
            bg-purple-900/20 border-purple-500/30
          `}>
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-400">
                #{currentUserRank.rank}
              </span>
            </div>

            <div className="relative">
              {currentUserRank.photoURL ? (
                <img
                  src={currentUserRank.photoURL}
                  alt={currentUserRank.displayName}
                  className="w-12 h-12 rounded-full border-2 border-purple-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="font-bold text-white">{currentUserRank.displayName}</span>
              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                Vous
              </span>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {currentUserRank.badgeCount}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BadgeLeaderboard;
