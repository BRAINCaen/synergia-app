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
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des Boosts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Zap className="w-8 h-8 text-white fill-current" />
                </div>
                Mes Boosts
              </h1>
              <p className="text-gray-400">
                Historique des Boosts recus et envoyes
              </p>
            </div>
            <button
              onClick={loadBoostData}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Inbox size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Boosts recus</p>
                <p className="text-2xl font-bold text-white">{stats?.totalReceived || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Send size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Boosts envoyes</p>
                <p className="text-2xl font-bold text-white">{stats?.totalSent || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border border-yellow-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">XP des Boosts</p>
                <p className="text-2xl font-bold text-white">+{stats?.xpFromBoosts || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ratio</p>
                <p className="text-2xl font-bold text-white">
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
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Boosts recus par type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(BOOST_TYPES).map((type) => (
              <div
                key={type.id}
                className="bg-gray-700/30 rounded-lg p-4 text-center"
              >
                <div className="text-3xl mb-2">{type.emoji}</div>
                <div className="text-sm text-gray-400">{type.label}</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats?.receivedByType?.[type.id] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Inbox size={18} />
              Recus ({boostsReceived.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Send size={18} />
              Envoyes ({boostsSent.length})
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {filteredBoosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="text-6xl mb-4">
                  {activeTab === 'received' ? '📭' : '📤'}
                </div>
                <p className="text-gray-400 text-lg">
                  {activeTab === 'received'
                    ? 'Aucun Boost recu pour le moment'
                    : 'Vous n\'avez pas encore envoye de Boost'
                  }
                </p>
                {activeTab === 'sent' && (
                  <p className="text-gray-500 text-sm mt-2">
                    Rendez-vous sur la page Equipe pour envoyer des Boosts !
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-gray-700/50"
              >
                {filteredBoosts.map((boost, index) => (
                  <motion.div
                    key={boost.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                        {activeTab === 'received'
                          ? (boost.fromUserName?.charAt(0) || '?')
                          : (boost.toUserName?.charAt(0) || '?')
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{boost.typeInfo?.emoji || BOOST_TYPES[boost.type]?.emoji}</span>
                          <span className="font-semibold text-white">
                            {activeTab === 'received'
                              ? boost.fromUserName
                              : boost.toUserName
                            }
                          </span>
                          <span className="text-gray-500 text-sm">
                            {activeTab === 'received' ? 'vous a envoye' : 'a recu'} un Boost
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${boost.typeInfo?.color || BOOST_TYPES[boost.type]?.color} text-white`}>
                            {boost.typeInfo?.label || BOOST_TYPES[boost.type]?.label}
                          </span>
                        </div>

                        {boost.message && (
                          <p className="text-gray-300 text-sm mb-2 italic">
                            "{boost.message}"
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
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
        </div>
      </div>
    </Layout>
  );
};

export default BoostsPage;
