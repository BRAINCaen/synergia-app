// ==========================================
// 📁 react-app/src/pages/ChallengesPage.jsx
// PAGE DÉFIS PERSONNELS - SYNERGIA v4.0 MODULE 10
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  Zap,
  Award,
  BarChart3,
  Sparkles
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useChallenges } from '../shared/hooks/useChallenges.js';
import ChallengeCard from '../components/challenges/ChallengeCard.jsx';
import ChallengeModal from '../components/challenges/ChallengeModal.jsx';
import { isAdmin } from '../core/services/adminService.js';

// 🎨 FILTRES DE STATUT
const STATUS_FILTERS = [
  { id: 'all', label: 'Tous', icon: Target, color: 'from-gray-500 to-gray-600' },
  { id: 'active', label: 'En cours', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'pending_approval', label: 'En attente', icon: Clock, color: 'from-yellow-500 to-orange-500' },
  { id: 'pending_validation', label: 'À valider', icon: Award, color: 'from-purple-500 to-pink-500' },
  { id: 'completed', label: 'Accomplis', icon: Trophy, color: 'from-green-500 to-emerald-500' },
  { id: 'rejected', label: 'Rejetés', icon: XCircle, color: 'from-red-500 to-rose-500' }
];

const ChallengesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 🎯 HOOK DÉFIS
  const {
    challenges,
    pendingChallenges,
    stats,
    loading,
    creating,
    submitting,
    createChallenge,
    submitCompletion,
    approveChallenge,
    rejectChallenge,
    validateCompletion,
    deleteChallenge,
    CHALLENGE_TYPES,
    CHALLENGE_DIFFICULTY
  } = useChallenges({
    autoInit: true,
    realTimeUpdates: true,
    isAdmin: userIsAdmin
  });

  // 📊 ÉTATS LOCAUX
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('my'); // 'my' ou 'admin'

  // 📊 DÉFIS FILTRÉS
  const filteredChallenges = useMemo(() => {
    if (activeFilter === 'all') return challenges;
    return challenges.filter(c => c.status === activeFilter);
  }, [challenges, activeFilter]);

  // 🎯 HANDLERS
  const handleCreateChallenge = async (data) => {
    const result = await createChallenge(data);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  const handleSubmitCompletion = async (challengeId, proof) => {
    return await submitCompletion(challengeId, proof);
  };

  const handleApprove = async (challengeId) => {
    const result = await approveChallenge(challengeId);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleReject = async (challengeId) => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      const result = await rejectChallenge(challengeId, reason);
      if (!result.success) {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  const handleValidate = async (challengeId) => {
    const result = await validateCompletion(challengeId);
    if (result.success) {
      alert(`Défi validé ! ${result.xpAwarded} XP attribués.`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleDelete = async (challengeId) => {
    if (confirm('Supprimer ce défi ?')) {
      await deleteChallenge(challengeId);
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* 🎯 HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
              Mes Défis
            </h1>
            <p className="text-gray-400 mt-1">
              Relevez des défis personnels pour gagner des XP bonus
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nouveau Défi
          </motion.button>
        </div>

        {/* 📊 STATS RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">En cours</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">En attente</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending + stats.pendingValidation}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">Accomplis</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-4 col-span-2"
          >
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">XP gagnés (défis)</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalXpEarned} XP</p>
          </motion.div>
        </div>

        {/* 🔀 TABS ADMIN */}
        {userIsAdmin && (
          <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'my'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes Défis
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              À valider
              {pendingChallenges.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingChallenges.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* 🔍 FILTRES */}
        {activeTab === 'my' && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STATUS_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              const count = filter.id === 'all'
                ? challenges.length
                : challenges.filter(c => c.status === filter.id).length;

              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all
                    ${isActive
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-gray-700'
                  }`}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* 📋 LISTE DES DÉFIS */}
        {activeTab === 'my' ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredChallenges.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50"
                >
                  <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">
                    {activeFilter === 'all' ? 'Aucun défi' : `Aucun défi "${STATUS_FILTERS.find(f => f.id === activeFilter)?.label}"`}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Créez votre premier défi pour commencer à gagner des XP bonus !
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Créer un défi
                  </motion.button>
                </motion.div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onSubmitCompletion={handleSubmitCompletion}
                      onDelete={handleDelete}
                      isAdmin={false}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* 👑 VUE ADMIN */
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Défis en attente de validation
            </h2>

            {pendingChallenges.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">Tous les défis ont été traités !</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isAdmin={true}
                    onApprove={() => handleApprove(challenge.id)}
                    onReject={() => handleReject(challenge.id)}
                    onValidate={() => handleValidate(challenge.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📊 STATS PAR TYPE */}
        {activeTab === 'my' && stats.completed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Défis accomplis par type
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(CHALLENGE_TYPES).map(([key, type]) => (
                <div
                  key={key}
                  className={`bg-gradient-to-br ${type.color} bg-opacity-20 rounded-xl p-4 text-center`}
                >
                  <span className="text-3xl">{type.emoji}</span>
                  <p className="text-white font-bold text-xl mt-2">
                    {stats.byType[key] || 0}
                  </p>
                  <p className="text-gray-300 text-sm">{type.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🎯 MODAL CRÉATION */}
        <AnimatePresence>
          {showCreateModal && (
            <ChallengeModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateChallenge}
              isLoading={creating}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ChallengesPage;
