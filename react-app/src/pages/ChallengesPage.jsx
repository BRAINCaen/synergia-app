// ==========================================
// react-app/src/pages/ChallengesPage.jsx
// PAGE DEFIS PERSONNELS - SYNERGIA v4.0 MODULE 10
// CHARTE GRAPHIQUE DARK MODE COMPLETE
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
  TrendingUp,
  Zap,
  Award,
  BarChart3,
  Sparkles,
  AlertCircle,
  Shield,
  RefreshCw,
  Search
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useChallenges } from '../shared/hooks/useChallenges.js';
import ChallengeCard from '../components/challenges/ChallengeCard.jsx';
import ChallengeModal from '../components/challenges/ChallengeModal.jsx';
import { isAdmin } from '../core/services/adminService.js';

// FILTRES DE STATUT
const STATUS_FILTERS = [
  { id: 'all', label: 'Tous', icon: Target, color: 'gray' },
  { id: 'active', label: 'En cours', icon: Zap, color: 'blue' },
  { id: 'pending_approval', label: 'En attente', icon: Clock, color: 'yellow' },
  { id: 'pending_validation', label: 'A valider', icon: Award, color: 'purple' },
  { id: 'completed', label: 'Accomplis', icon: Trophy, color: 'green' },
  { id: 'rejected', label: 'Rejetes', icon: XCircle, color: 'red' }
];

const ChallengesPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // HOOK DEFIS
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
    refreshChallenges,
    CHALLENGE_TYPES,
    CHALLENGE_DIFFICULTY
  } = useChallenges({
    autoInit: true,
    realTimeUpdates: true,
    isAdmin: userIsAdmin
  });

  // ETATS LOCAUX
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');

  // DEFIS FILTRES
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

  // HANDLERS
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
      alert(`Defi valide ! ${result.xpAwarded} XP attribues.`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleDelete = async (challengeId) => {
    if (confirm('Supprimer ce defi ?')) {
      await deleteChallenge(challengeId);
    }
  };

  // LOADING
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Chargement des defis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* EN-TETE */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-purple-400" />
              Defis Personnels
            </h1>
            <p className="text-gray-400">
              Relevez des defis personnels pour gagner des XP bonus et progresser !
            </p>
          </div>

          {/* STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-blue-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 font-semibold">En cours</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-yellow-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 font-semibold">En attente</p>
                  <p className="text-2xl font-bold text-white">{stats.pending + stats.pendingValidation}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-green-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 font-semibold">Accomplis</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-purple-400/30 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 font-semibold">XP Gagnes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalXpEarned}</p>
                </div>
              </div>
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-purple-400 mb-1">Comment ca marche ?</p>
                <p>
                  <span className="text-blue-400">1.</span> Creez un defi personnel avec un objectif clair.
                  <span className="text-yellow-400 ml-2">2.</span> L'admin approuve votre defi.
                  <span className="text-green-400 ml-2">3.</span> Accomplissez-le et soumettez une preuve.
                  <span className="text-purple-400 ml-2">4.</span> L'admin valide et vous gagnez les XP !
                </p>
              </div>
            </div>
          </div>

          {/* BOUTON CREER */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Creer un Defi
            </button>

            {userIsAdmin && (
              <button
                onClick={refreshChallenges}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            )}
          </div>

          {/* TABS ADMIN */}
          {userIsAdmin && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg border ${
                  activeTab === 'my'
                    ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-purple-400/30 shadow-lg'
                    : 'bg-white/5 text-gray-400 border-white/20 hover:bg-white/10'
                }`}
              >
                <Target className="w-5 h-5" />
                Mes Defis
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
                A Valider (Admin)
                {pendingChallenges.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingChallenges.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* BARRE DE RECHERCHE ET FILTRES */}
          {activeTab === 'my' && (
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
                          ? `bg-${filter.color}-500/30 text-${filter.color}-300 border border-${filter.color}-400/30`
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

          {/* GRILLE DES DEFIS */}
          {activeTab === 'my' ? (
            <div className="space-y-6">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {activeFilter === 'all' ? 'Aucun defi' : `Aucun defi "${STATUS_FILTERS.find(f => f.id === activeFilter)?.label}"`}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Creez votre premier defi pour commencer a gagner des XP bonus !
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Creer un defi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                    >
                      <ChallengeCard
                        challenge={challenge}
                        onSubmitCompletion={handleSubmitCompletion}
                        onDelete={handleDelete}
                        isAdmin={false}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VUE ADMIN */
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-amber-400/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400" />
                  Panel Administration - Defis a valider
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
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
                      >
                        <ChallengeCard
                          challenge={challenge}
                          isAdmin={true}
                          onApprove={() => handleApprove(challenge.id)}
                          onReject={() => handleReject(challenge.id)}
                          onValidate={() => handleValidate(challenge.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATS PAR TYPE */}
          {activeTab === 'my' && stats.completed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Defis accomplis par type
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(CHALLENGE_TYPES).map(([key, type]) => (
                  <div
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-purple-400/30 transition-all"
                  >
                    <span className="text-4xl mb-2 block">{type.emoji}</span>
                    <p className="text-2xl font-bold text-white">
                      {stats.byType[key] || 0}
                    </p>
                    <p className="text-gray-400 text-sm">{type.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STATS PAR DIFFICULTE */}
          {activeTab === 'my' && stats.completed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                Defis accomplis par difficulte
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {Object.entries(CHALLENGE_DIFFICULTY).map(([key, diff]) => (
                  <div
                    key={key}
                    className={`border rounded-xl p-4 text-center ${
                      key === 'easy' ? 'bg-green-500/10 border-green-400/30' :
                      key === 'medium' ? 'bg-yellow-500/10 border-yellow-400/30' :
                      'bg-red-500/10 border-red-400/30'
                    }`}
                  >
                    <p className={`text-sm font-medium mb-1 ${
                      key === 'easy' ? 'text-green-400' :
                      key === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {diff.label}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {stats.byDifficulty[key] || 0}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">+{diff.xpReward} XP</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* MODAL CREATION */}
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
    </Layout>
  );
};

export default ChallengesPage;
