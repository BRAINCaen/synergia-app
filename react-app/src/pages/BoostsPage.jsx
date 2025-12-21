// ==========================================
// react-app/src/pages/BoostsPage.jsx
// Page d'historique des Boosts recus et envoyes
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Inbox, Users, TrendingUp, Clock, Filter, RefreshCw } from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { boostService, BOOST_TYPES } from '../core/services/boostService.js';

const BoostsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [boostsReceived, setBoostsReceived] = useState([]);
  const [boostsSent, setBoostsSent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Charger les donnees
  useEffect(() => {
    if (!user?.uid) return;
    loadBoostData();
  }, [user?.uid]);

  const loadBoostData = async () => {
    if (!user?.uid) return;

    console.log('📊 [BOOSTS PAGE] Chargement pour user:', user.uid);
    setLoading(true);
    try {
      const [received, sent, boostStats] = await Promise.all([
        boostService.getUserBoostsReceived(user.uid, 100),
        boostService.getUserBoostsSent(user.uid, 100),
        boostService.getBoostStats(user.uid)
      ]);

      console.log('📊 [BOOSTS PAGE] Received:', received.length, received);
      console.log('📊 [BOOSTS PAGE] Sent:', sent.length, sent);
      console.log('📊 [BOOSTS PAGE] Stats:', boostStats);

      setBoostsReceived(received);
      setBoostsSent(sent);
      setStats(boostStats);

      // Marquer tous comme lus
      if (received.some(b => !b.read)) {
        await boostService.markAllBoostsAsRead(user.uid);
      }
    } catch (error) {
      console.error('❌ [BOOSTS PAGE] Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les boosts
  const getFilteredBoosts = () => {
    const boosts = activeTab === 'received' ? boostsReceived : boostsSent;
    if (filterType === 'all') return boosts;
    return boosts.filter(b => b.type === filterType);
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const filteredBoosts = getFilteredBoosts();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement des Boosts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                    Mes Boosts
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Historique des Boosts recus et envoyes
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={loadBoostData}
                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                title="Actualiser"
              >
                <RefreshCw size={18} />
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Inbox size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Boosts recus</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats?.totalReceived || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Send size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Boosts envoyes</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats?.totalSent || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">XP des Boosts</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">+{stats?.xpFromBoosts || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Users size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Ratio</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {stats?.totalSent > 0
                      ? ((stats?.totalReceived || 0) / stats.totalSent).toFixed(1)
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Boosts recus par type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {Object.values(BOOST_TYPES).map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all"
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.emoji}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{type.label}</div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-1">
                    {stats?.receivedByType?.[type.id] || 0}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('received')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                  activeTab === 'received'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Inbox size={16} />
                <span className="hidden sm:inline">Recus</span> ({boostsReceived.length})
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('sent')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                  activeTab === 'sent'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Send size={16} />
                <span className="hidden sm:inline">Envoyes</span> ({boostsSent.length})
              </motion.button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <Filter size={14} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-initial bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
              >
                <option value="all">Tous les types</option>
                {Object.values(BOOST_TYPES).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boost List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {filteredBoosts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 sm:p-12 text-center"
                >
                  <div className="text-4xl sm:text-6xl mb-4">
                    {activeTab === 'received' ? '📭' : '📤'}
                  </div>
                  <p className="text-gray-400 text-sm sm:text-lg">
                    {activeTab === 'received'
                      ? 'Aucun Boost recu pour le moment'
                      : 'Vous n\'avez pas encore envoye de Boost'
                    }
                  </p>
                  {activeTab === 'sent' && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">
                      Rendez-vous sur la page Equipe pour envoyer des Boosts !
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-white/5"
                >
                  {filteredBoosts.map((boost, index) => (
                    <motion.div
                      key={boost.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-3 sm:p-4 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0">
                          {activeTab === 'received'
                            ? (boost.fromUserName?.charAt(0) || '?')
                            : (boost.toUserName?.charAt(0) || '?')
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                            <span className="text-xl sm:text-2xl">{boost.typeInfo?.emoji || BOOST_TYPES[boost.type]?.emoji}</span>
                            <span className="font-semibold text-white text-sm sm:text-base">
                              {activeTab === 'received'
                                ? boost.fromUserName
                                : boost.toUserName
                              }
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                              {activeTab === 'received' ? 'vous a envoye' : 'a recu'} un Boost
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r ${boost.typeInfo?.color || BOOST_TYPES[boost.type]?.color} text-white`}>
                              {boost.typeInfo?.label || BOOST_TYPES[boost.type]?.label}
                            </span>
                          </div>

                          {boost.message && (
                            <p className="text-gray-300 text-xs sm:text-sm mb-2 italic line-clamp-2">
                              "{boost.message}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(boost.createdAt)}
                            </span>
                            <span className={`font-medium ${activeTab === 'received' ? 'text-green-400' : 'text-blue-400'}`}>
                              +{activeTab === 'received' ? boost.xpAwarded : boost.xpGiven} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default BoostsPage;
