// ==========================================
// react-app/src/pages/ChallengesPage.jsx
// PAGE DEFIS D'EQUIPE - SYNERGIA v4.0
// Objectifs collectifs avec XP verses dans la cagnotte
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Trophy,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  Award,
  Coins,
  AlertCircle,
  Shield,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTeamChallenges } from '../shared/hooks/useTeamChallenges.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import TeamChallengeCard from '../components/challenges/TeamChallengeCard.jsx';
import TeamChallengeModal from '../components/challenges/TeamChallengeModal.jsx';
import { isAdmin } from '../core/services/adminService.js';

// Filtres de statut
const STATUS_FILTERS = [
  { id: 'all', label: 'Tous', icon: Target, color: 'gray' },
  { id: 'active', label: 'En cours', icon: Zap, color: 'blue' },
  { id: 'pending_approval', label: 'En attente', icon: Clock, color: 'yellow' },
  { id: 'completed', label: 'Accomplis', icon: Trophy, color: 'green' }
];

const ChallengesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // Hook Defis d'Equipe
  const {
    challenges,
    activeChallenges,
    pendingChallenges,
    stats,
    loading,
    creating,
    contributing,
    createChallenge,
    contributeToChallenge,
    updateValue,
    approveChallenge,
    rejectChallenge,
    deleteChallenge,
    refresh,
    TEAM_CHALLENGE_TYPES
  } = useTeamChallenges({
    autoInit: true,
    realTimeUpdates: true,
    isAdmin: userIsAdmin
  });

  // Hook Cagnotte
  const { stats: poolStats } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true
  });

  // Etats locaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('defis');
  const [searchTerm, setSearchTerm] = useState('');

  // Defis filtres
  const filteredChallenges = useMemo(() => {
    let result = challenges;

    if (activeFilter !== 'all') {
      result = result.filter(c => c.status === activeFilter);
    }

    if (searchTerm) {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [challenges, activeFilter, searchTerm]);

  // Handlers
  const handleCreateChallenge = async (data) => {
    const result = await createChallenge(data);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  const handleContribute = async (challengeId, amount, description) => {
    const result = await contributeToChallenge(challengeId, amount, description);
    if (result.success) {
      if (result.completed) {
        alert(`Felicitations ! Le defi est accompli ! Les XP ont ete verses dans la cagnotte d'equipe.`);
      }
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleUpdateValue = async (challengeId, newValue) => {
    const result = await updateValue(challengeId, newValue);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    } else if (result.completed) {
      alert(`Defi accompli ! XP verses dans la cagnotte.`);
    }
  };

  const handleApprove = async (challengeId) => {
    const result = await approveChallenge(challengeId);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleReject = async (challengeId, reason) => {
    const result = await rejectChallenge(challengeId, reason);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleDelete = async (challengeId) => {
    if (confirm('Supprimer ce defi ?')) {
      const result = await deleteChallenge(challengeId);
      if (!result.success) {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  // Loading
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Chargement des defis d'equipe...</p>
            </div>
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
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-8">
          {/* En-tete */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-2 sm:gap-3">
              <Users className="w-7 h-7 sm:w-10 sm:h-10 text-purple-400" />
              Defis d'Equipe
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Relevez des objectifs collectifs et gagnez des XP pour la cagnotte !
            </p>
          </div>

          {/* Hero Card - Cagnotte + Stats */}
          <div className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden border border-white/20">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {/* Cagnotte */}
              <div className="text-center md:text-left col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                  <span className="text-white/80 font-medium text-sm sm:text-base">Cagnotte</span>
                </div>
                <div className="text-2xl sm:text-4xl font-black text-white">
                  {(poolStats?.totalXP || 0).toLocaleString()} <span className="text-lg sm:text-xl">XP</span>
                </div>
              </div>

              {/* Defis actifs */}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.active}</div>
                <p className="text-white/70 text-xs sm:text-sm">En cours</p>
              </div>

              {/* Defis accomplis */}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.completed}</div>
                <p className="text-white/70 text-xs sm:text-sm">Accomplis</p>
              </div>

              {/* XP gagnes */}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{stats.totalXpEarned.toLocaleString()}</div>
                <p className="text-white/70 text-xs sm:text-sm">XP gagnes</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">Comment fonctionnent les Defis d'Equipe ?</p>
                <p className="leading-relaxed">
                  <span className="text-yellow-400">1.</span> Proposez un defi collectif
                  <span className="text-green-400 ml-1 sm:ml-2">2.</span> L'admin valide
                  <span className="text-blue-400 ml-1 sm:ml-2">3.</span> L'equipe contribue
                  <span className="text-purple-400 ml-1 sm:ml-2">4.</span> XP verses dans la <strong>cagnotte</strong> !
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              Proposer un Defi
            </button>

            <button
              onClick={refresh}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Tabs Admin */}
          {userIsAdmin && (
            <div className="flex gap-2 mb-6 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('defis')}
                className={`flex-1 px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  activeTab === 'defis'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tous les </span>Defis
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                  {challenges.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                A Valider
                {pendingChallenges.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingChallenges.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          {activeTab === 'defis' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un defi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                  />
                </div>

                {/* Filtres par statut */}
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm sm:text-base"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.id} value={filter.id} className="bg-slate-900">
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Badges filtres rapides */}
              <div className="flex flex-wrap gap-2 mt-4">
                {STATUS_FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  const count = filter.id === 'all'
                    ? challenges.length
                    : challenges.filter(c => c.status === filter.id).length;
                  const isActive = activeFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-lg ${
                        isActive ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Defis actifs en vedette */}
          {activeTab === 'defis' && activeChallenges.length > 0 && activeFilter === 'all' && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Defis en cours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {activeChallenges.slice(0, 4).map((challenge) => (
                  <TeamChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onContribute={handleContribute}
                    onUpdateValue={userIsAdmin ? handleUpdateValue : null}
                    onDelete={userIsAdmin ? handleDelete : null}
                    isAdmin={userIsAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Grille des defis */}
          {activeTab === 'defis' ? (
            <div className="space-y-6">
              {activeFilter !== 'all' && (
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-400" />
                  {STATUS_FILTERS.find(f => f.id === activeFilter)?.label}
                </h2>
              )}

              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <Users className="w-12 sm:w-16 h-12 sm:h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
                    {activeFilter === 'all' ? 'Aucun defi d\'equipe' : `Aucun defi "${STATUS_FILTERS.find(f => f.id === activeFilter)?.label}"`}
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base">
                    Proposez un premier defi pour motiver l'equipe !
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm sm:text-base"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Proposer un defi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredChallenges.map((challenge) => (
                    <TeamChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onContribute={challenge.status === 'active' ? handleContribute : null}
                      onUpdateValue={userIsAdmin ? handleUpdateValue : null}
                      onDelete={userIsAdmin ? handleDelete : null}
                      isAdmin={userIsAdmin}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Vue Admin */
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400" />
                  Defis en attente de validation
                </h2>

                {pendingChallenges.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-300">Tous les defis ont ete traites !</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Aucun defi en attente de validation.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {pendingChallenges.map((challenge) => (
                      <TeamChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={handleDelete}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats par type */}
          {activeTab === 'defis' && stats.completed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                Defis accomplis par type
              </h3>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {Object.entries(TEAM_CHALLENGE_TYPES).map(([key, type]) => (
                  <div
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center hover:border-purple-400/30 transition-all"
                  >
                    <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">{type.emoji}</span>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {stats.byType[key] || 0}
                    </p>
                    <p className="text-gray-400 text-[10px] sm:text-xs">{type.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal Creation */}
      <AnimatePresence>
        {showCreateModal && (
          <TeamChallengeModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateChallenge}
            isLoading={creating}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ChallengesPage;
