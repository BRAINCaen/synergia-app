// ==========================================
// 📁 react-app/src/pages/InfosPage.jsx
// PAGE INFORMATIONS ÉQUIPE + BOÎTE À IDÉES
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Plus, Upload, X, Edit, Trash2, Check, AlertCircle,
  Loader, Send, CheckCircle, Eye, Bell, Users, ChevronDown, ChevronUp,
  // 💡 BOÎTE À IDÉES
  Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Sparkles, XOctagon
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import infosService from '../core/services/infosService.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin as checkIsAdmin } from '../core/services/adminService.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 💡 SERVICE BOÎTE À IDÉES
import { ideaService, IDEA_XP, IDEA_STATUS, IDEA_CATEGORIES } from '../core/services/ideaService.js';

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
                      Informations Équipe
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                      Partagez des infos importantes
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
                          <span>2. Votes</span>
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
                                  {/* Compteur de votes */}
                                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white/10 rounded-full">
                                    <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 ${hasVoted ? 'text-yellow-400' : 'text-gray-400'}`} />
                                    <span className="text-white font-medium text-xs sm:text-sm">{idea.voteCount || 0}</span>
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
                                  {userIsAdmin && idea.status !== IDEA_STATUS.IMPLEMENTED && idea.status !== IDEA_STATUS.REJECTED && (
                                    <div className="flex gap-1">
                                      {idea.status !== IDEA_STATUS.ADOPTED && (
                                        <motion.button
                                          onClick={() => handleAdoptIdea(idea.id)}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="p-1.5 sm:p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                                          title="Adopter cette idée"
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
                                      <motion.button
                                        onClick={() => handleRejectIdea(idea.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 sm:p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                        title="Rejeter cette idée"
                                      >
                                        <XOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </motion.button>
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

const InfoCard = ({ info, user, isAdmin, onEdit, onDelete, onValidate }) => {
  const isAuthor = info.authorId === user.uid;
  const isValidated = info.validatedBy?.[user.uid];
  const canEdit = isAdmin || isAuthor;
  const canDelete = isAdmin || isAuthor;

  // ✅ ÉTAT POUR AFFICHER/MASQUER LA LISTE DES VALIDEURS
  const [showValidators, setShowValidators] = useState(false);

  // ✅ ÉTAT POUR STOCKER LES INFOS DES VALIDEURS (AVEC VRAIS NOMS)
  const [validatorsWithNames, setValidatorsWithNames] = useState([]);
  const [loadingValidators, setLoadingValidators] = useState(false);

  // ✅ RÉCUPÉRER LES VRAIS NOMS DES VALIDEURS DEPUIS FIREBASE
  useEffect(() => {
    const fetchValidatorNames = async () => {
      if (!info.validatedBy || Object.keys(info.validatedBy).length === 0) {
        setValidatorsWithNames([]);
        return;
      }

      setLoadingValidators(true);

      const validators = [];

      for (const [odot, data] of Object.entries(info.validatedBy)) {
        try {
          // Récupérer les infos utilisateur depuis Firebase
          const userRef = doc(db, 'users', odot);
          const userSnap = await getDoc(userRef);

          let userName = 'Utilisateur';
          let userAvatar = null;
          let validatedAt = null;

          // Récupérer le nom depuis Firebase
          if (userSnap.exists()) {
            const userData = userSnap.data();
            userName = userData.profile?.displayName ||
                       userData.displayName ||
                       userData.email?.split('@')[0] ||
                       'Utilisateur';
            userAvatar = userData.profile?.photoURL || userData.photoURL || null;
          }

          // Gérer la date de validation (ancien format string ou nouveau format objet)
          if (typeof data === 'string') {
            validatedAt = data;
          } else if (data && typeof data === 'object') {
            validatedAt = data.validatedAt;
            // Si le nom n'a pas été trouvé dans Firebase, utiliser celui stocké
            if (userName === 'Utilisateur' && data.userName) {
              userName = data.userName;
            }
            if (!userAvatar && data.userAvatar) {
              userAvatar = data.userAvatar;
            }
          }

          validators.push({
            odot: odot,
            userName,
            userAvatar,
            validatedAt
          });

        } catch (error) {
          console.warn('⚠️ Erreur récupération valideur:', odot, error);
          // Fallback en cas d'erreur
          validators.push({
            odot: odot,
            userName: typeof data === 'object' ? data.userName || 'Utilisateur' : 'Utilisateur',
            userAvatar: typeof data === 'object' ? data.userAvatar : null,
            validatedAt: typeof data === 'string' ? data : data?.validatedAt
          });
        }
      }

      // Trier par date de validation (plus récent en premier)
      validators.sort((a, b) => {
        const dateA = a.validatedAt ? new Date(a.validatedAt) : new Date(0);
        const dateB = b.validatedAt ? new Date(b.validatedAt) : new Date(0);
        return dateB - dateA;
      });

      setValidatorsWithNames(validators);
      setLoadingValidators(false);
    };

    fetchValidatorNames();
  }, [info.validatedBy]);

  const validatorCount = Object.keys(info.validatedBy || {}).length;

  // ✅ FORMATER LA DATE DE VALIDATION
  const formatValidationDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'À l\'instant';
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (hours < 24) return `Il y a ${hours}h`;
      if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white/5 backdrop-blur-xl border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
        isValidated ? 'border-white/10' : 'border-purple-400/50 shadow-lg shadow-purple-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* AVATAR */}
          {info.authorAvatar ? (
            <img
              src={info.authorAvatar}
              alt={info.authorName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-500/50 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-purple-500/50 text-sm sm:text-base flex-shrink-0">
              {info.authorName?.charAt(0) || '?'}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base truncate">{info.authorName}</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {info.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canEdit && (
            <motion.button
              onClick={() => onEdit(info)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </motion.button>
          )}
          {canDelete && (
            <motion.button
              onClick={() => onDelete(info.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            </motion.button>
          )}
        </div>
      </div>

      {info.text && <p className="text-white text-sm sm:text-base mb-3 sm:mb-4 whitespace-pre-wrap">{info.text}</p>}

      {info.media && (
        <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
          {info.media.type === 'image' ? (
            <img src={info.media.url} alt="Image" className="w-full max-h-64 sm:max-h-96 object-contain bg-black/20" />
          ) : (
            <video src={info.media.url} controls className="w-full max-h-64 sm:max-h-96 bg-black/20" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
        {/* BOUTON POUR VOIR QUI A VALIDÉ */}
        <button
          onClick={() => setShowValidators(!showValidators)}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm hover:text-gray-300 transition-colors"
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{validatorCount} vue{validatorCount > 1 ? 's' : ''}</span>
          {validatorCount > 0 && (
            showValidators ? (
              <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )
          )}
        </button>

        {!isValidated ? (
          <motion.button
            onClick={() => onValidate(info.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Marquer comme vu</span>
            <span className="sm:hidden">Vu</span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 text-green-400">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-xs sm:text-sm">Validé</span>
          </div>
        )}
      </div>

      {/* LISTE DES VALIDEURS */}
      <AnimatePresence>
        {showValidators && validatorCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10"
          >
            <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 font-semibold flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Vu par {validatorCount} personne{validatorCount > 1 ? 's' : ''}
            </p>

            {loadingValidators ? (
              <div className="flex items-center justify-center py-3 sm:py-4">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-spin" />
                <span className="text-gray-500 ml-2 text-xs sm:text-sm">Chargement...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-36 sm:max-h-48 overflow-y-auto">
                {validatorsWithNames.map((validator, index) => (
                  <div
                    key={validator.odot || index}
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2"
                  >
                    {/* Avatar du valideur */}
                    {validator.userAvatar ? (
                      <img
                        src={validator.userAvatar}
                        alt={validator.userName}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-green-500/50"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        {validator.userName?.charAt(0) || '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">
                        {validator.userName}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        {formatValidationDate(validator.validatedAt)}
                      </p>
                    </div>

                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CreateInfoModal = ({ info, user, onClose }) => {
  const [text, setText] = useState(info?.text || '');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(info?.media?.url || null);
  const [fileType, setFileType] = useState(info?.media?.type || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Seules les images et vidéos sont acceptées');
      return;
    }

    console.log('📤 Fichier sélectionné:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    setFile(selectedFile);
    setFileType(isVideo ? 'video' : 'image');
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file && !info?.media) {
      setError('Veuillez ajouter du texte ou un fichier');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('');
      setError('');

      console.log('🚀 [MODAL] Début de la soumission');

      let mediaData = info?.media || null;

      // Upload du fichier si présent
      if (file) {
        console.log('📤 [MODAL] Upload du fichier...');
        setUploadStatus('Upload du fichier en cours...');

        try {
          mediaData = await infosService.uploadFile(file, user.uid, (progress) => {
            console.log('📊 [MODAL] Progression:', progress.toFixed(1) + '%');
            setUploadProgress(progress);
          });

          console.log('✅ [MODAL] Upload terminé:', mediaData);
          setUploadStatus('Fichier uploadé, création de l\'information...');
        } catch (uploadError) {
          console.error('❌ [MODAL] Erreur upload fichier:', uploadError);
          throw new Error('Erreur lors de l\'upload du fichier: ' + uploadError.message);
        }
      }

      // Création ou mise à jour de l'info
      console.log('💾 [MODAL] Sauvegarde dans Firestore...');
      setUploadStatus('Enregistrement de l\'information...');

      try {
        if (info) {
          console.log('✏️ [MODAL] Mise à jour info:', info.id);
          await infosService.updateInfo(info.id, { text: text.trim(), media: mediaData }, user);
        } else {
          console.log('➕ [MODAL] Création nouvelle info');
          await infosService.createInfo({ text: text.trim(), media: mediaData }, user);
        }

        console.log('✅ [MODAL] Information enregistrée avec succès');
        setUploadStatus('Terminé !');

        // Petit délai pour montrer le succès
        setTimeout(() => {
          onClose();
        }, 500);

      } catch (firestoreError) {
        console.error('❌ [MODAL] Erreur Firestore:', firestoreError);
        throw new Error('Erreur lors de l\'enregistrement: ' + firestoreError.message);
      }

    } catch (error) {
      console.error('❌ [MODAL] Erreur globale:', error);
      setError(error.message || 'Erreur lors de la soumission');
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={uploading ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-purple-950 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            {info ? 'Modifier l\'information' : 'Nouvelle information'}
          </h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </motion.button>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-300 mb-2 font-semibold text-sm sm:text-base">Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre information ici..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm sm:text-base"
            rows={5}
            disabled={uploading}
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-300 mb-2 font-semibold text-sm sm:text-base">Fichier (optionnel)</label>

          {filePreview ? (
            <div className="relative rounded-xl overflow-hidden bg-black/20">
              {fileType === 'image' ? (
                <img src={filePreview} alt="Preview" className="w-full max-h-48 sm:max-h-64 object-contain" />
              ) : (
                <video src={filePreview} controls className="w-full max-h-48 sm:max-h-64" />
              )}
              {!uploading && (
                <motion.button
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                    setFileType(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-white/5 border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-2 sm:gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
              <p className="text-gray-300 font-semibold text-sm sm:text-base">Ajouter une image ou vidéo</p>
              <p className="text-gray-500 text-xs sm:text-sm">Aucune limite de taille</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* BARRE DE PROGRESSION */}
        {uploading && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-xs sm:text-sm font-semibold">{uploadStatus || 'Préparation...'}</span>
              {uploadProgress > 0 && (
                <span className="text-purple-400 text-xs sm:text-sm font-bold">{Math.round(uploadProgress)}%</span>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span>Ne fermez pas cette fenêtre...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1">Erreur</p>
                <p className="text-red-200/80 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <motion.button
            onClick={onClose}
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Annuler
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={uploading || (!text.trim() && !file && !info?.media)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">En cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                {info ? 'Mettre à jour' : 'Publier'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfosPage;
