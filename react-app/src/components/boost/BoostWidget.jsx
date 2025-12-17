// ==========================================
// react-app/src/components/boost/BoostWidget.jsx
// Widget affichant les stats Boost dans le profil
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Heart, Send, ChevronRight, Bell } from 'lucide-react';
import { boostService, BOOST_TYPES } from '../../core/services/boostService';

const BoostWidget = ({
  userId,
  compact = false,
  showRecent = true,
  className = ''
}) => {
  const [stats, setStats] = useState(null);
  const [recentBoosts, setRecentBoosts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, boostsReceived, unread] = await Promise.all([
          boostService.getBoostStats(userId),
          boostService.getUserBoostsReceived(userId, 5),
          boostService.getUnreadBoostCount(userId)
        ]);

        setStats(statsData);
        setRecentBoosts(boostsReceived);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Erreur chargement BoostWidget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Abonnement temps reel
    const unsubscribe = boostService.subscribeToUserBoosts(userId, (boosts) => {
      setRecentBoosts(boosts.slice(0, 5));
      const newUnread = boosts.filter(b => !b.read).length;
      setUnreadCount(newUnread);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  if (isLoading) {
    return <BoostWidgetSkeleton compact={compact} />;
  }

  if (compact) {
    return (
      <CompactBoostWidget
        stats={stats}
        unreadCount={unreadCount}
        className={className}
      />
    );
  }

  const boostTypes = Object.values(BOOST_TYPES);

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white">Mes Boosts</h3>
              <p className="text-xs text-gray-400">Micro-feedback recu</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Bell size={14} className="text-orange-400" />
              <span className="text-sm font-medium text-orange-400">{unreadCount}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats principales */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            icon={Heart}
            label="Recus"
            value={stats?.totalReceived || 0}
            color="from-pink-500 to-rose-500"
          />
          <StatCard
            icon={Send}
            label="Envoyes"
            value={stats?.totalSent || 0}
            color="from-blue-500 to-cyan-500"
          />
        </div>

        {/* Repartition par type */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Repartition des Boosts recus</h4>
          <div className="grid grid-cols-4 gap-2">
            {boostTypes.map((type) => {
              const count = stats?.receivedByType?.[type.id] || 0;
              const total = stats?.totalReceived || 1;
              const percentage = Math.round((count / total) * 100) || 0;

              return (
                <motion.div
                  key={type.id}
                  className="text-center p-3 bg-gray-900/50 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Boosts recents */}
        {showRecent && recentBoosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-400">Boosts recents</h4>
              {recentBoosts.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  {showAll ? 'Voir moins' : 'Voir tout'}
                  <ChevronRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
                </button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {(showAll ? recentBoosts : recentBoosts.slice(0, 3)).map((boost, index) => (
                <BoostItem key={boost.id} boost={boost} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Message si pas de Boosts */}
        {(!stats?.totalReceived && !stats?.totalSent) && (
          <div className="text-center py-6 text-gray-500">
            <Zap size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucun Boost pour le moment</p>
            <p className="text-xs mt-1">Envoyez un Boost a un collegue pour commencer !</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Carte de stat
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    className="relative p-4 bg-gray-900/50 rounded-xl overflow-hidden"
    whileHover={{ scale: 1.02 }}
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10`} />
    <div className="relative flex items-center gap-3">
      <div className={`p-2 bg-gradient-to-r ${color} rounded-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  </motion.div>
);

// Item de Boost recent
const BoostItem = ({ boost, index }) => {
  const boostType = BOOST_TYPES[boost.type];
  const timeAgo = getTimeAgo(boost.createdAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className={`
        flex items-center gap-3 p-3 mb-2 rounded-xl transition-colors
        ${boost.read ? 'bg-gray-900/30' : 'bg-orange-500/10 border border-orange-500/30'}
      `}
    >
      <div className="text-2xl">{boostType?.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">
            {boost.fromUserName}
          </span>
          {!boost.read && (
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
          )}
        </div>
        {boost.message && (
          <p className="text-sm text-gray-400 truncate">{boost.message}</p>
        )}
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</div>
    </motion.div>
  );
};

// Version compacte pour les cartes
const CompactBoostWidget = ({ stats, unreadCount, className }) => (
  <motion.div
    className={`flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl ${className}`}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-2">
      <Zap size={18} className="text-yellow-500 fill-current" />
      <span className="font-bold text-white">{stats?.totalReceived || 0}</span>
      <span className="text-xs text-gray-400">recus</span>
    </div>
    <div className="w-px h-4 bg-gray-700" />
    <div className="flex items-center gap-2">
      <Send size={14} className="text-blue-400" />
      <span className="font-medium text-gray-300">{stats?.totalSent || 0}</span>
      <span className="text-xs text-gray-400">envoyes</span>
    </div>
    {unreadCount > 0 && (
      <>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex items-center gap-1 text-orange-400">
          <Bell size={14} />
          <span className="text-sm font-medium">{unreadCount}</span>
        </div>
      </>
    )}
  </motion.div>
);

// Skeleton loader
const BoostWidgetSkeleton = ({ compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl animate-pulse">
        <div className="w-20 h-4 bg-gray-700 rounded" />
        <div className="w-px h-4 bg-gray-700" />
        <div className="w-16 h-4 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-700 rounded-xl" />
        <div>
          <div className="w-24 h-4 bg-gray-700 rounded mb-1" />
          <div className="w-32 h-3 bg-gray-700/50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-700/50 rounded-xl" />
        <div className="h-20 bg-gray-700/50 rounded-xl" />
      </div>
    </div>
  );
};

// Helper: temps relatif
function getTimeAgo(date) {
  if (!date) return '';

  const now = new Date();
  const then = date instanceof Date ? date : new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'A l\'instant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  return then.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default BoostWidget;
