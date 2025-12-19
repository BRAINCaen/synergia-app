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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Chargement des informations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Info className="w-8 h-8 text-purple-400" />
                  Informations Équipe
                </h1>
                <p className="text-white/60">
                  Partagez des informations importantes avec toute l'équipe
                </p>
              </div>

              {unvalidatedCount > 0 && (
                <div className="flex items-center gap-3 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl px-4 py-2">
                  <Bell className="w-5 h-5 text-orange-400 animate-pulse" />
                  <span className="text-white font-semibold">
                    {unvalidatedCount} nouvelle{unvalidatedCount > 1 ? 's' : ''} info{unvalidatedCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <button
                onClick={() => { setEditingInfo(null); setShowCreateModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Info
              </button>
            </div>
          </motion.div>

          {/* 💡 SECTION BOÎTE À IDÉES */}
          <div className="mb-8">
            <button
              onClick={() => setShowIdeaBox(!showIdeaBox)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                showIdeaBox
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                  : 'bg-white/5 border-white/20 hover:border-yellow-400/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">Boîte à Idées</h2>
                  <p className="text-gray-400 text-sm">
                    {ideaStats.total} idées • {ideaStats.adopted} adoptées • {ideaStats.implemented} implémentées
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
                  +{IDEA_XP.SUBMIT} XP / idée
                </span>
                {showIdeaBox ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenu Boîte à Idées */}
            <AnimatePresence>
              {showIdeaBox && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    {/* Header + Bouton Nouvelle Idée */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          Workflow des idées
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
                          <span>1. Soumettre (+{IDEA_XP.SUBMIT} XP)</span>
                          <span className="hidden md:inline">→</span>
                          <span>2. Votes équipe</span>
                          <span className="hidden md:inline">→</span>
                          <span>3. Review Admin</span>
                          <span className="hidden md:inline">→</span>
                          <span>4. Adoptée (+{IDEA_XP.ADOPTED} XP)</span>
                          <span className="hidden md:inline">→</span>
                          <span>5. Implémentée (+{IDEA_XP.IMPLEMENTED} XP)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNewIdeaModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Nouvelle Idée
                      </button>
                    </div>

                    {/* Badges liés aux idées - depuis le système unifié */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                      {Object.values(UNIFIED_BADGE_DEFINITIONS)
                        .filter(b => b.category === BADGE_CATEGORIES.IDEAS)
                        .slice(0, 4)
                        .map(badge => (
                          <div key={badge.id} className="text-center">
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <div className="font-medium text-white text-sm">{badge.name}</div>
                            <div className="text-xs text-gray-400">{badge.description}</div>
                          </div>
                        ))
                      }
                    </div>

                    {/* Liste des idées */}
                    {ideasLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                      </div>
                    ) : ideas.length === 0 ? (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Aucune idée pour le moment</p>
                        <p className="text-sm text-gray-500">Soyez le premier à proposer une idée !</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {ideas.map((idea) => {
                          const hasVoted = idea.votes?.some(v => v.oderId === user?.uid);
                          const isAuthor = idea.authorId === user?.uid;
                          const categoryConfig = IDEA_CATEGORIES[idea.category?.toUpperCase()] || IDEA_CATEGORIES.OTHER;

                          return (
                            <div
                              key={idea.id}
                              className={`p-4 rounded-lg border transition-all ${
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
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-lg">{categoryConfig.icon}</span>
                                    <h4 className="font-medium text-white">{idea.title}</h4>
                                    {idea.status === IDEA_STATUS.IMPLEMENTED && (
                                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">Implémentée</span>
                                    )}
                                    {idea.status === IDEA_STATUS.ADOPTED && (
                                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">Adoptée</span>
                                    )}
                                    {idea.status === IDEA_STATUS.REJECTED && (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">Rejetée</span>
                                    )}
                                    {(idea.voteCount || 0) >= 5 && idea.status === IDEA_STATUS.POPULAR && (
                                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Populaire
                                      </span>
                                    )}
                                  </div>
                                  {idea.description && (
                                    <p className="text-sm text-gray-400 mb-2">{idea.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>Par {idea.authorName}</span>
                                    {idea.createdAt && (
                                      <span>{new Date(idea.createdAt).toLocaleDateString('fr-FR')}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Votes et Actions */}
                                <div className="flex items-center gap-2">
                                  {/* Compteur de votes */}
                                  <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
                                    <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'text-yellow-400' : 'text-gray-400'}`} />
                                    <span className="text-white font-medium">{idea.voteCount || 0}</span>
                                  </div>

                                  {/* Bouton voter (si pas auteur et pas terminé) */}
                                  {!isAuthor && ![IDEA_STATUS.IMPLEMENTED, IDEA_STATUS.REJECTED].includes(idea.status) && (
                                    <button
                                      onClick={() => hasVoted ? handleRemoveVote(idea.id) : handleVoteIdea(idea.id)}
                                      className={`p-2 rounded-lg transition-colors ${
                                        hasVoted
                                          ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                      }`}
                                      title={hasVoted ? 'Retirer mon vote' : 'Voter pour cette idée'}
                                    >
                                      {hasVoted ? <ThumbsDown className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                                    </button>
                                  )}

                                  {/* Actions Admin */}
                                  {userIsAdmin && idea.status !== IDEA_STATUS.IMPLEMENTED && idea.status !== IDEA_STATUS.REJECTED && (
                                    <div className="flex gap-1">
                                      {idea.status !== IDEA_STATUS.ADOPTED && (
                                        <button
                                          onClick={() => handleAdoptIdea(idea.id)}
                                          className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                                          title="Adopter cette idée"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                      )}
                                      {idea.status === IDEA_STATUS.ADOPTED && (
                                        <button
                                          onClick={() => handleImplementIdea(idea.id)}
                                          className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                                          title="Marquer comme implémentée"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleRejectIdea(idea.id)}
                                        className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                        title="Rejeter cette idée"
                                      >
                                        <XOctagon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Commentaire de review */}
                              {idea.reviewComment && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-sm text-gray-400 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="font-medium">{idea.reviewerName}:</span>
                                    {idea.reviewComment}
                                  </p>
                                </div>
                              )}
                            </div>
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
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {infos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center"
                >
                  <Info className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">Aucune information pour le moment</p>
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

        {/* 💡 MODAL NOUVELLE IDÉE */}
        <AnimatePresence>
          {showNewIdeaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNewIdeaModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-purple-900 border border-yellow-400/30 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Nouvelle Idée</h3>
                    <p className="text-sm text-gray-400">+{IDEA_XP.SUBMIT} XP automatiquement</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitIdea} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Titre *</label>
                    <input
                      type="text"
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      placeholder="Résumé de votre idée..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                      placeholder="Détaillez votre idée..."
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={ideaForm.category}
                      onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                    >
                      {Object.entries(IDEA_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={cat.id} className="bg-gray-900">
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-300 mb-2">Gamification</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Soumettre une idée: <span className="text-yellow-400">+{IDEA_XP.SUBMIT} XP</span></li>
                      <li>• Si adoptée: <span className="text-purple-400">+{IDEA_XP.ADOPTED} XP</span> + Badge "Innovateur"</li>
                      <li>• Si implémentée par vous: <span className="text-green-400">+{IDEA_XP.IMPLEMENTED} XP</span> + Badge "Bâtisseur"</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewIdeaModal(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Soumettre
                    </button>
                  </div>
                </form>
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
      className={`bg-white/10 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
        isValidated ? 'border-white/20' : 'border-purple-400/50 shadow-lg shadow-purple-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* ✅ AVATAR AVEC PHOTO DE PROFIL */}
          {info.authorAvatar ? (
            <img
              src={info.authorAvatar}
              alt={info.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-purple-500/50">
              {info.authorName?.charAt(0) || '?'}
            </div>
          )}

          <div>
            <p className="text-white font-semibold">{info.authorName}</p>
            <p className="text-white/40 text-sm">
              {info.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button onClick={() => onEdit(info)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit className="w-4 h-4 text-white/60" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(info.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {info.text && <p className="text-white mb-4 whitespace-pre-wrap">{info.text}</p>}

      {info.media && (
        <div className="mb-4 rounded-xl overflow-hidden">
          {info.media.type === 'image' ? (
            <img src={info.media.url} alt="Image" className="w-full max-h-96 object-contain bg-black/20" />
          ) : (
            <video src={info.media.url} controls className="w-full max-h-96 bg-black/20" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        {/* ✅ BOUTON POUR VOIR QUI A VALIDÉ */}
        <button
          onClick={() => setShowValidators(!showValidators)}
          className="flex items-center gap-2 text-white/60 text-sm hover:text-white/80 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>{validatorCount} vue{validatorCount > 1 ? 's' : ''}</span>
          {validatorCount > 0 && (
            showValidators ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )
          )}
        </button>

        {!isValidated ? (
          <button
            onClick={() => onValidate(info.id)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <Check className="w-4 h-4" />
            Marquer comme vu
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Validé</span>
          </div>
        )}
      </div>

      {/* ✅ LISTE DES VALIDEURS (AFFICHÉE SI CLIQUÉ) */}
      <AnimatePresence>
        {showValidators && validatorCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <p className="text-white/60 text-sm mb-3 font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vu par {validatorCount} personne{validatorCount > 1 ? 's' : ''} :
            </p>

            {loadingValidators ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-white/40 ml-2 text-sm">Chargement...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {validatorsWithNames.map((validator, index) => (
                  <div
                    key={validator.odot || index}
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
                  >
                    {/* Avatar du valideur */}
                    {validator.userAvatar ? (
                      <img
                        src={validator.userAvatar}
                        alt={validator.userName}
                        className="w-6 h-6 rounded-full object-cover border border-green-500/50"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {validator.userName?.charAt(0) || '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {validator.userName}
                      </p>
                      <p className="text-white/40 text-xs">
                        {formatValidationDate(validator.validatedAt)}
                      </p>
                    </div>

                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={uploading ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-purple-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {info ? 'Modifier l\'information' : 'Nouvelle information'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-white/80 mb-2 font-semibold">Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre information ici..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            rows={6}
            disabled={uploading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-white/80 mb-2 font-semibold">Fichier (optionnel)</label>

          {filePreview ? (
            <div className="relative rounded-xl overflow-hidden bg-black/20">
              {fileType === 'image' ? (
                <img src={filePreview} alt="Preview" className="w-full max-h-64 object-contain" />
              ) : (
                <video src={filePreview} controls className="w-full max-h-64" />
              )}
              {!uploading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                    setFileType(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-white/10 border-2 border-dashed border-white/30 hover:border-purple-400 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-12 h-12 text-white/60" />
              <p className="text-white/80 font-semibold">Cliquez pour ajouter une image ou vidéo</p>
              <p className="text-white/40 text-sm">Aucune limite de taille</p>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-semibold">{uploadStatus || 'Préparation...'}</span>
              {uploadProgress > 0 && (
                <span className="text-purple-400 text-sm font-bold">{Math.round(uploadProgress)}%</span>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Ne fermez pas cette fenêtre...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm font-semibold mb-1">Erreur</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!text.trim() && !file && !info?.media)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {info ? 'Mettre à jour' : 'Publier'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfosPage;
