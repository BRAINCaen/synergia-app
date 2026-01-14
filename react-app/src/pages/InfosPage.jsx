// ==========================================
// 📁 react-app/src/pages/InfosPage.jsx
// PAGE INFORMATIONS ÉQUIPE + BOÎTE À IDÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Plus, Edit, Trash2, AlertCircle,
  Loader, Bell, ChevronDown, ChevronUp,
  // BOITE A IDEES
  Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Sparkles, XOctagon,
  RefreshCw, Vote, X
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import infosService from '../core/services/infosService.js';

// Extracted components
import { InfoCard } from '../components/infos/sections';
import { CreateInfoModal } from '../components/infos/modals';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin as checkIsAdmin } from '../core/services/adminService.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 💡 SERVICE BOÎTE À IDÉES
import { ideaService, IDEA_XP, IDEA_STATUS, IDEA_CATEGORIES, IDEA_THRESHOLDS } from '../core/services/ideaService.js';

// 🏆 BADGES LIÉS AUX IDÉES
import { UNIFIED_BADGE_DEFINITIONS, BADGE_CATEGORIES } from '../core/services/unifiedBadgeSystem.js';

const InfosPage = () => {
  const { user } = useAuthStore();
  const [infos, setInfos] = useState([]);
  const [unvalidatedCount, setUnvalidatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [listenerId, setListenerId] = useState(null);

  // 💡 ÉTATS BOÎTE À IDÉES
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [showIdeaBox, setShowIdeaBox] = useState(false);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [ideaForm, setIdeaForm] = useState({ title: '', description: '', category: 'feature' });
  const [ideaStats, setIdeaStats] = useState({ total: 0, pending: 0, adopted: 0, implemented: 0 });
  const [expandedIdeaIds, setExpandedIdeaIds] = useState(new Set()); // IDs des idées avec description étendue
  const [editingIdea, setEditingIdea] = useState(null); // Idée en cours d'édition

  const isAdmin = infosService.isAdmin(user);
  const userIsAdmin = checkIsAdmin(user);

  useEffect(() => {
    if (!user) return;

    const id = infosService.listenToInfos((updatedInfos) => {
      setInfos(updatedInfos);
      const count = updatedInfos.filter(info => !info.validatedBy?.[user.uid]).length;
      setUnvalidatedCount(count);
      setLoading(false);
    });

    setListenerId(id);
    loadIdeas();

    return () => {
      if (id) infosService.stopListening(id);
    };
  }, [user]);

  // 💡 CHARGER LES IDÉES
  const loadIdeas = async () => {
    try {
      setIdeasLoading(true);
      const [allIdeas, stats] = await Promise.all([
        ideaService.getAllIdeas({ sortBy: 'votes' }),
        ideaService.getIdeaStats()
      ]);
      setIdeas(allIdeas);
      setIdeaStats(stats);
      console.log('✅ Idées chargées:', allIdeas.length);
    } catch (error) {
      console.error('❌ Erreur chargement idées:', error);
    } finally {
      setIdeasLoading(false);
    }
  };

  // 💡 SOUMETTRE UNE IDÉE
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!ideaForm.title.trim()) {
      alert('Le titre est requis');
      return;
    }

    try {
      const result = await ideaService.submitIdea(
        user.uid,
        user.displayName || user.email,
        ideaForm
      );
      alert(`✅ Idée soumise ! +${result.xpAwarded} XP`);
      setShowNewIdeaModal(false);
      setIdeaForm({ title: '', description: '', category: 'feature' });
      loadIdeas();
    } catch (error) {
      console.error('❌ Erreur soumission idée:', error);
      alert('Erreur lors de la soumission');
    }
  };

  // 💡 VOTER POUR UNE IDÉE
  const handleVoteIdea = async (ideaId) => {
    try {
      const result = await ideaService.voteForIdea(ideaId, user.uid, user.displayName || user.email);
      if (result.becamePopular) {
        alert('🔥 Cette idée est maintenant populaire !');
      }
      loadIdeas();
    } catch (error) {
      alert(error.message);
    }
  };

  // 💡 RETIRER SON VOTE
  const handleRemoveVote = async (ideaId) => {
    try {
      await ideaService.removeVote(ideaId, user.uid);
      loadIdeas();
    } catch (error) {
      alert(error.message);
    }
  };

  // 💡 ADOPTER UNE IDÉE (ADMIN)
  const handleAdoptIdea = async (ideaId) => {
    const comment = prompt('Commentaire (optionnel):');
    try {
      const result = await ideaService.adoptIdea(ideaId, user.uid, user.displayName, comment || '');
      alert(`✅ Idée adoptée ! L'auteur gagne +${IDEA_XP.ADOPTED} XP`);
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // 💡 MARQUER COMME IMPLÉMENTÉE (ADMIN)
  const handleImplementIdea = async (ideaId) => {
    try {
      const result = await ideaService.markAsImplemented(ideaId, user.uid, user.displayName);
      if (result.isAuthorImplementing) {
        alert(`✅ Idée implémentée par l'auteur ! +${IDEA_XP.IMPLEMENTED} XP bonus`);
      } else {
        alert('✅ Idée marquée comme implémentée');
      }
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // 💡 REJETER UNE IDÉE (ADMIN)
  const handleRejectIdea = async (ideaId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    try {
      await ideaService.rejectIdea(ideaId, user.uid, user.displayName, reason || '');
      alert('Idée rejetée');
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // 💡 RELANCER LE VOTE (ADMIN)
  const handleRelaunchVote = async (ideaId) => {
    if (!window.confirm('Relancer le vote sur cette idée ? Les votes actuels seront réinitialisés.')) return;
    const reason = prompt('Raison de la relance (optionnel):');
    try {
      const result = await ideaService.relaunchVote(ideaId, user.uid, user.displayName, reason || '');
      alert(`✅ Vote relancé ! (précédemment ${result.previousVoteCount} votes)`);
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // 💡 ÉTENDRE/RÉDUIRE LA DESCRIPTION D'UNE IDÉE
  const toggleExpandIdea = (ideaId) => {
    setExpandedIdeaIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  };

  // 💡 MODIFIER UNE IDÉE (AUTEUR UNIQUEMENT)
  const handleStartEditIdea = (idea) => {
    setEditingIdea({
      id: idea.id,
      title: idea.title,
      description: idea.description || '',
      category: idea.category || 'feature'
    });
  };

  const handleUpdateIdea = async () => {
    if (!editingIdea) return;

    try {
      await ideaService.updateIdea(editingIdea.id, user.uid, {
        title: editingIdea.title,
        description: editingIdea.description,
        category: editingIdea.category
      });
      alert('✅ Idée modifiée !');
      setEditingIdea(null);
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  // 💡 SUPPRIMER UNE IDÉE (AUTEUR UNIQUEMENT)
  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm('Supprimer cette idée ?')) return;

    try {
      await ideaService.deleteIdea(ideaId, user.uid);
      alert('✅ Idée supprimée');
      loadIdeas();
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/30 to-indigo-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Info className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement...</p>
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
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-indigo-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                  >
                    <Info className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                      📢 Le Crieur
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                      Annonces et nouvelles de la guilde
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={() => { setEditingInfo(null); setShowCreateModal(true); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nouvelle Info</span>
                </motion.button>
              </div>

              {unvalidatedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-orange-500/20 backdrop-blur-xl border border-orange-400/30 rounded-xl px-3 sm:px-4 py-2.5"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 animate-pulse" />
                  <span className="text-white font-medium text-sm sm:text-base">
                    {unvalidatedCount} nouvelle{unvalidatedCount > 1 ? 's' : ''} info{unvalidatedCount > 1 ? 's' : ''}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* SECTION BOÎTE À IDÉES */}
          <div className="mb-4 sm:mb-6">
            <motion.button
              onClick={() => setShowIdeaBox(!showIdeaBox)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center justify-between backdrop-blur-xl ${
                showIdeaBox
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                  : 'bg-white/5 border-white/10 hover:border-yellow-400/30'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-base sm:text-xl font-bold text-white">Boîte à Idées</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {ideaStats.total} idées • {ideaStats.adopted} adoptées
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                  +{IDEA_XP.SUBMIT} XP
                </span>
                {showIdeaBox ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </motion.button>

            {/* Contenu Boîte à Idées */}
            <AnimatePresence>
              {showIdeaBox && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 sm:mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    {/* Header + Bouton Nouvelle Idée */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div>
                        <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                          Workflow des idées
                        </h3>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-xs sm:text-sm text-gray-400">
                          <span>1. Soumettre</span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            2. <Vote className="w-3 h-3" /> Votes
                            <span className="text-green-400 font-medium">({IDEA_THRESHOLDS.QUORUM} min)</span>
                          </span>
                          <span>→</span>
                          <span>3. Review</span>
                          <span>→</span>
                          <span className="text-green-400">Adoptée!</span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setShowNewIdeaModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Nouvelle Idée
                      </motion.button>
                    </div>

                    {/* Badges liés aux idées */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                      {Object.values(UNIFIED_BADGE_DEFINITIONS)
                        .filter(b => b.category === BADGE_CATEGORIES.IDEAS)
                        .slice(0, 4)
                        .map(badge => (
                          <div key={badge.id} className="text-center">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{badge.icon}</div>
                            <div className="font-medium text-white text-xs sm:text-sm">{badge.name}</div>
                            <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{badge.description}</div>
                          </div>
                        ))
                      }
                    </div>

                    {/* Liste des idées */}
                    {ideasLoading ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                      </div>
                    ) : ideas.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm sm:text-base">Aucune idée pour le moment</p>
                        <p className="text-xs sm:text-sm text-gray-500">Soyez le premier à proposer une idée !</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                        {ideas.map((idea) => {
                          const hasVoted = idea.votes?.some(v => v.oderId === user?.uid);
                          const isAuthor = idea.authorId === user?.uid;
                          const categoryConfig = IDEA_CATEGORIES[idea.category?.toUpperCase()] || IDEA_CATEGORIES.OTHER;

                          return (
                            <motion.div
                              key={idea.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-3 sm:p-4 rounded-xl border transition-all ${
                                idea.status === IDEA_STATUS.IMPLEMENTED
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : idea.status === IDEA_STATUS.ADOPTED
                                  ? 'bg-purple-500/10 border-purple-500/30'
                                  : idea.status === IDEA_STATUS.REJECTED
                                  ? 'bg-red-500/10 border-red-500/30 opacity-50'
                                  : (idea.voteCount || 0) >= 5
                                  ? 'bg-yellow-500/10 border-yellow-500/30'
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                    <span className="text-base sm:text-lg">{categoryConfig.icon}</span>
                                    <h4 className="font-medium text-white text-sm sm:text-base truncate">{idea.title}</h4>
                                    {idea.status === IDEA_STATUS.IMPLEMENTED && (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-green-500/20 text-green-300 text-[10px] sm:text-xs rounded-full">Implémentée</span>
                                    )}
                                    {idea.status === IDEA_STATUS.ADOPTED && (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs rounded-full">Adoptée</span>
                                    )}
                                    {idea.status === IDEA_STATUS.REJECTED && (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] sm:text-xs rounded-full">Rejetée</span>
                                    )}
                                    {(idea.voteCount || 0) >= 5 && idea.status === IDEA_STATUS.POPULAR && (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Populaire
                                      </span>
                                    )}
                                  </div>
                                  {idea.description && (
                                    <div className="mb-2">
                                      <p
                                        className={`text-xs sm:text-sm text-gray-400 cursor-pointer ${
                                          !expandedIdeaIds.has(idea.id) ? 'line-clamp-2' : ''
                                        }`}
                                        onClick={() => toggleExpandIdea(idea.id)}
                                      >
                                        {idea.description}
                                      </p>
                                      {idea.description.length > 100 && (
                                        <button
                                          onClick={() => toggleExpandIdea(idea.id)}
                                          className="text-purple-400 hover:text-purple-300 text-[10px] sm:text-xs mt-1 flex items-center gap-1"
                                        >
                                          {expandedIdeaIds.has(idea.id) ? (
                                            <>
                                              <ChevronUp className="w-3 h-3" />
                                              Voir moins
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="w-3 h-3" />
                                              Voir plus
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                                    <span>Par {idea.authorName}</span>
                                    {idea.createdAt && (
                                      <span>{new Date(idea.createdAt).toLocaleDateString('fr-FR')}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Votes et Actions */}
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  {/* Compteur de votes avec indicateur de quorum */}
                                  <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full ${
                                    (idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM
                                      ? 'bg-green-500/20 border border-green-500/30'
                                      : 'bg-white/10'
                                  }`}>
                                    <Vote className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                      (idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM ? 'text-green-400' : hasVoted ? 'text-yellow-400' : 'text-gray-400'
                                    }`} />
                                    <span className={`font-medium text-xs sm:text-sm ${
                                      (idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM ? 'text-green-400' : 'text-white'
                                    }`}>
                                      {idea.voteCount || 0}/{IDEA_THRESHOLDS.QUORUM}
                                    </span>
                                  </div>

                                  {/* Bouton voter */}
                                  {!isAuthor && ![IDEA_STATUS.IMPLEMENTED, IDEA_STATUS.REJECTED].includes(idea.status) && (
                                    <motion.button
                                      onClick={() => hasVoted ? handleRemoveVote(idea.id) : handleVoteIdea(idea.id)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                                        hasVoted
                                          ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                      }`}
                                      title={hasVoted ? 'Retirer mon vote' : 'Voter pour cette idée'}
                                    >
                                      {hasVoted ? <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    </motion.button>
                                  )}

                                  {/* Actions Auteur (Modifier/Supprimer) */}
                                  {isAuthor && ![IDEA_STATUS.IMPLEMENTED, IDEA_STATUS.REJECTED].includes(idea.status) && (
                                    <div className="flex gap-1">
                                      <motion.button
                                        onClick={() => handleStartEditIdea(idea)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 sm:p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                                        title="Modifier mon idée"
                                      >
                                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </motion.button>
                                      <motion.button
                                        onClick={() => handleDeleteIdea(idea.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 sm:p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                        title="Supprimer mon idée"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </motion.button>
                                    </div>
                                  )}

                                  {/* Actions Admin */}
                                  {userIsAdmin && idea.status !== IDEA_STATUS.REJECTED && (
                                    <div className="flex gap-1">
                                      {/* Bouton Adopter - désactivé si quorum non atteint */}
                                      {idea.status !== IDEA_STATUS.ADOPTED && idea.status !== IDEA_STATUS.IMPLEMENTED && (
                                        <motion.button
                                          onClick={() => handleAdoptIdea(idea.id)}
                                          whileHover={(idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM ? { scale: 1.1 } : {}}
                                          whileTap={(idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM ? { scale: 0.9 } : {}}
                                          disabled={(idea.voteCount || 0) < IDEA_THRESHOLDS.QUORUM}
                                          className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                                            (idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM
                                              ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                                              : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                          }`}
                                          title={(idea.voteCount || 0) >= IDEA_THRESHOLDS.QUORUM
                                            ? 'Adopter cette idée'
                                            : `Quorum non atteint (${idea.voteCount || 0}/${IDEA_THRESHOLDS.QUORUM} votes)`}
                                        >
                                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </motion.button>
                                      )}
                                      {idea.status === IDEA_STATUS.ADOPTED && (
                                        <motion.button
                                          onClick={() => handleImplementIdea(idea.id)}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="p-1.5 sm:p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                                          title="Marquer comme implémentée"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </motion.button>
                                      )}
                                      {/* Bouton Relancer le vote - visible même pour les idées implémentées */}
                                      <motion.button
                                        onClick={() => handleRelaunchVote(idea.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 sm:p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                                        title="Relancer le vote (réinitialise les votes)"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </motion.button>
                                      {idea.status !== IDEA_STATUS.IMPLEMENTED && (
                                        <motion.button
                                          onClick={() => handleRejectIdea(idea.id)}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="p-1.5 sm:p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                          title="Rejeter cette idée"
                                        >
                                          <XOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </motion.button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Commentaire de review */}
                              {idea.reviewComment && (
                                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="font-medium">{idea.reviewerName}:</span>
                                    {idea.reviewComment}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LISTE DES INFORMATIONS */}
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {infos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 text-center"
                >
                  <Info className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-lg">Aucune information pour le moment</p>
                </motion.div>
              ) : (
                infos.map((info) => (
                  <InfoCard
                    key={info.id}
                    info={info}
                    user={user}
                    isAdmin={isAdmin}
                    onEdit={(i) => { setEditingInfo(i); setShowCreateModal(true); }}
                    onDelete={async (id) => {
                      if (window.confirm('Supprimer cette information ?')) {
                        await infosService.deleteInfo(id, user);
                      }
                    }}
                    onValidate={async (id) => await infosService.validateInfo(
                      id,
                      user.uid,
                      user.displayName || user.email,
                      user.photoURL
                    )}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MODAL CRÉATION/ÉDITION INFO */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateInfoModal
              info={editingInfo}
              user={user}
              onClose={() => { setShowCreateModal(false); setEditingInfo(null); }}
            />
          )}
        </AnimatePresence>

        {/* MODAL NOUVELLE IDÉE */}
        <AnimatePresence>
          {showNewIdeaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={() => setShowNewIdeaModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-yellow-950/30 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Nouvelle Idée</h3>
                    <p className="text-xs sm:text-sm text-gray-400">+{IDEA_XP.SUBMIT} XP automatiquement</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitIdea} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Titre *</label>
                    <input
                      type="text"
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      placeholder="Résumé de votre idée..."
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                      placeholder="Détaillez votre idée..."
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={ideaForm.category}
                      onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 text-sm sm:text-base"
                    >
                      {Object.entries(IDEA_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={cat.id} className="bg-slate-900">
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                    <h4 className="font-medium text-yellow-300 mb-2 text-sm sm:text-base">Gamification</h4>
                    <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
                      <li>• Soumettre: <span className="text-yellow-400">+{IDEA_XP.SUBMIT} XP</span></li>
                      <li>• Si adoptée: <span className="text-purple-400">+{IDEA_XP.ADOPTED} XP</span></li>
                      <li>• Si implémentée: <span className="text-green-400">+{IDEA_XP.IMPLEMENTED} XP</span></li>
                    </ul>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowNewIdeaModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Soumettre
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 💡 MODAL ÉDITION IDÉE */}
        <AnimatePresence>
          {editingIdea && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={() => setEditingIdea(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 to-blue-950/30 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Modifier mon idée</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Corrigez ou complétez votre proposition</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Titre *</label>
                    <input
                      type="text"
                      value={editingIdea.title}
                      onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                      placeholder="Résumé de votre idée..."
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={editingIdea.description}
                      onChange={(e) => setEditingIdea({ ...editingIdea, description: e.target.value })}
                      placeholder="Détaillez votre idée..."
                      rows={5}
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={editingIdea.category}
                      onChange={(e) => setEditingIdea({ ...editingIdea, category: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 text-sm sm:text-base"
                    >
                      {Object.entries(IDEA_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={cat.id} className="bg-slate-900">
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setEditingIdea(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleUpdateIdea}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Check className="w-4 h-4" />
                      Enregistrer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default InfosPage;
