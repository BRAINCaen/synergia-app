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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des defis d'equipe...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tete */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-purple-400" />
              Defis d'Equipe
            </h1>
            <p className="text-gray-400">
              Relevez des objectifs collectifs et gagnez des XP pour la cagnotte d'equipe !
            </p>
          </div>

          {/* Hero Card - Cagnotte + Stats */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Cagnotte */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <Coins className="w-6 h-6 text-yellow-300" />
                  <span className="text-white/80 font-medium">Cagnotte Equipe</span>
                </div>
                <div className="text-4xl font-black text-white">
                  {(poolStats?.totalXP || 0).toLocaleString()} <span className="text-xl">XP</span>
                </div>
              </div>

              {/* Defis actifs */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.active}</div>
                <p className="text-white/70 text-sm">Defis en cours</p>
              </div>

              {/* Defis accomplis */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.completed}</div>
                <p className="text-white/70 text-sm">Defis accomplis</p>
              </div>

              {/* XP gagnes */}
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">{stats.totalXpEarned.toLocaleString()}</div>
                <p className="text-white/70 text-sm">XP gagnes (defis)</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">Comment fonctionnent les Defis d'Equipe ?</p>
                <p>
                  <span className="text-yellow-400">1.</span> N'importe qui peut proposer un defi collectif.
                  <span className="text-green-400 ml-2">2.</span> L'admin valide le defi.
                  <span className="text-blue-400 ml-2">3.</span> Toute l'equipe peut contribuer a l'objectif.
                  <span className="text-purple-400 ml-2">4.</span> Quand l'objectif est atteint, les XP vont dans la <strong>cagnotte d'equipe</strong> !
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Proposer un Defi d'Equipe
            </button>

            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Tabs Admin */}
          {userIsAdmin && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('defis')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg border ${
                  activeTab === 'defis'
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white border-purple-400/30 shadow-lg'
                    : 'bg-white/5 text-gray-400 border-white/20 hover:bg-white/10'
                }`}
              >
                <Target className="w-5 h-5" />
                Tous les Defis
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                  {challenges.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg border ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white border-amber-400/30 shadow-lg'
                    : 'bg-white/5 text-gray-400 border-white/20 hover:bg-white/10'
                }`}
              >
                <Shield className="w-5 h-5" />
                A Valider
                {pendingChallenges.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingChallenges.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          {activeTab === 'defis' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un defi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Filtres par statut */}
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.id} value={filter.id} className="bg-slate-800">
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {filter.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20' : 'bg-gray-700'
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
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Defis en cours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-400" />
                  {STATUS_FILTERS.find(f => f.id === activeFilter)?.label}
                </h2>
              )}

              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {activeFilter === 'all' ? 'Aucun defi d\'equipe' : `Aucun defi "${STATUS_FILTERS.find(f => f.id === activeFilter)?.label}"`}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Proposez un premier defi pour motiver l'equipe !
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Proposer un defi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges
                    .filter(c => activeFilter !== 'all' || c.status !== 'active')
                    .map((challenge) => (
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
              <div className="bg-white/5 backdrop-blur-xl border border-amber-400/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400" />
                  Defis en attente de validation
                </h2>

                {pendingChallenges.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300">Tous les defis ont ete traites !</h3>
                    <p className="text-gray-500">Aucun defi en attente de validation.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Defis accomplis par type
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(TEAM_CHALLENGE_TYPES).map(([key, type]) => (
                  <div
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-purple-400/30 transition-all"
                  >
                    <span className="text-3xl mb-2 block">{type.emoji}</span>
                    <p className="text-2xl font-bold text-white">
                      {stats.byType[key] || 0}
                    </p>
                    <p className="text-gray-400 text-xs">{type.label}</p>
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
