// ==========================================
// react-app/src/pages/MentoringPage.jsx
// PAGE MENTORING - SYNERGIA v4.0
// Module Mentorat: Sessions de coaching
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Clock, Star, Plus, X, Check, Play,
  MessageSquare, Award, TrendingUp, ChevronRight, Filter
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useMentoring } from '../shared/hooks/useMentoring.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// COMPOSANT STATS CARDS
// ==========================================

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Sessions Mentor',
      value: stats.asMentor.completed,
      total: stats.asMentor.total,
      emoji: '🎓',
      iconBg: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Sessions Mentee',
      value: stats.asMentee.completed,
      total: stats.asMentee.total,
      emoji: '📚',
      iconBg: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Temps Total',
      value: `${Math.round(stats.overall.totalMinutes / 60)}h`,
      subtext: `${stats.overall.totalMinutes} min`,
      emoji: '⏱️',
      iconBg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
      label: 'XP Gagne',
      value: stats.overall.totalXP,
      emoji: '⚡',
      iconBg: 'bg-amber-500/20',
      textColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 ${card.iconBg} rounded-xl`}>
              <span className="text-xl sm:text-2xl">{card.emoji}</span>
            </div>
            {card.total !== undefined && (
              <span className="text-[10px] sm:text-xs bg-white/10 border border-white/10 px-2 py-0.5 rounded-full text-gray-400">
                {card.total} total
              </span>
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>{card.value}</div>
          <div className="text-xs sm:text-sm text-gray-400">{card.label}</div>
          {card.subtext && (
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{card.subtext}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// COMPOSANT SESSION CARD
// ==========================================

const SessionCard = ({ session, onStart, onComplete, onCancel, onFeedback, currentUserId }) => {
  const { MENTORING_STATUS, SESSION_TYPES } = useMentoring();
  const [expanded, setExpanded] = useState(false);

  const status = MENTORING_STATUS[session.status] || MENTORING_STATUS.scheduled;
  const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.skill_transfer;
  const isOwner = session.mentorId === currentUserId;
  const scheduledDate = session.scheduledDate?.toDate?.();
  const canGiveFeedback = session.status === 'completed' && (
    (isOwner && !session.mentorFeedback) || (!isOwner && !session.menteeFeedback)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl ${status.bgColor} flex items-center justify-center text-2xl`}>
              {sessionType.emoji}
            </div>
            <div>
              <h3 className="font-bold text-white">{session.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <span className={status.textColor}>{status.emoji} {status.label}</span>
                <span>•</span>
                <span>{sessionType.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{isOwner ? `Mentee: ${session.menteeName}` : `Mentor: ${session.mentorName}`}</span>
                {scheduledDate && (
                  <>
                    <span>•</span>
                    <span>{scheduledDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
              {session.duration} min
            </span>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Description */}
              {session.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                  <p className="text-white text-sm">{session.description}</p>
                </div>
              )}

              {/* Objectifs */}
              {session.objectives?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Objectifs</h4>
                  <div className="space-y-1">
                    {session.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          session.objectivesCompleted?.includes(i) ? 'bg-emerald-500' : 'bg-white/10'
                        }`}>
                          {session.objectivesCompleted?.includes(i) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-gray-300">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Notes</h4>
                  <p className="text-white text-sm bg-white/5 rounded-lg p-3">{session.notes}</p>
                </div>
              )}

              {/* XP Info */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">XP a gagner</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">Mentor: +{sessionType.xpMentor} XP</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-purple-400">Mentee: +{sessionType.xpMentee} XP</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {session.status === 'scheduled' && isOwner && (
                  <>
                    <button
                      onClick={() => onStart(session.id)}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Demarrer
                    </button>
                    <button
                      onClick={() => onCancel(session.id)}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </>
                )}

                {session.status === 'in_progress' && isOwner && (
                  <button
                    onClick={() => onComplete(session.id)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Terminer
                  </button>
                )}

                {canGiveFeedback && (
                  <button
                    onClick={() => onFeedback(session)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Donner un feedback
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// MODAL CREATION SESSION
// ==========================================

const CreateSessionModal = ({ isOpen, onClose, onCreate, availableUsers, currentUser, SESSION_TYPES, MENTORING_TOPICS }) => {
  const [form, setForm] = useState({
    menteeId: '',
    menteeName: '',
    type: 'skill_transfer',
    topic: 'technical',
    title: '',
    description: '',
    objectives: [''],
    scheduledDate: '',
    duration: 45
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    setForm(f => ({ ...f, objectives: [...f.objectives, ''] }));
  };

  const handleRemoveObjective = (index) => {
    setForm(f => ({ ...f, objectives: f.objectives.filter((_, i) => i !== index) }));
  };

  const handleObjectiveChange = (index, value) => {
    setForm(f => ({
      ...f,
      objectives: f.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.menteeId || !form.title) return;

    setCreating(true);
    const result = await onCreate({
      ...form,
      mentorId: currentUser.uid,
      mentorName: currentUser.displayName || currentUser.email,
      objectives: form.objectives.filter(o => o.trim())
    });

    if (result.success) {
      onClose();
      setForm({
        menteeId: '',
        menteeName: '',
        type: 'skill_transfer',
        topic: 'technical',
        title: '',
        description: '',
        objectives: [''],
        scheduledDate: '',
        duration: 45
      });
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Nouvelle Session de Mentorat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mentee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mentee *
            </label>
            <select
              value={form.menteeId}
              onChange={(e) => {
                const selectedUser = availableUsers.find(u => u.id === e.target.value);
                setForm(f => ({
                  ...f,
                  menteeId: e.target.value,
                  menteeName: selectedUser?.displayName || ''
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="">Selectionnez un mentee</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.avatar} {user.displayName} (Niveau {user.level})
                </option>
              ))}
            </select>
          </div>

          {/* Type de session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de session
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = SESSION_TYPES[e.target.value];
                  setForm(f => ({
                    ...f,
                    type: e.target.value,
                    duration: type?.duration || 30
                  }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {Object.values(SESSION_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sujet
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm(f => ({ ...f, topic: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {MENTORING_TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.emoji} {topic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la session *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Introduction aux bonnes pratiques..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Decrivez le contenu de la session..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs
            </label>
            <div className="space-y-2">
              {form.objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  {form.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
              >
                + Ajouter un objectif
              </button>
            </div>
          </div>

          {/* Date et duree */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date et heure
              </label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duree (minutes)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                min={15}
                max={180}
                step={15}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* XP Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-300">XP a gagner a la completion</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">
                  Vous: +{SESSION_TYPES[form.type]?.xpMentor || 40} XP
                </span>
                <span className="text-emerald-400">
                  Mentee: +{SESSION_TYPES[form.type]?.xpMentee || 35} XP
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating || !form.menteeId || !form.title}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creation...' : 'Creer la session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MODAL FEEDBACK
// ==========================================

const FeedbackModal = ({ isOpen, onClose, session, onSubmit, FEEDBACK_RATINGS }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    const result = await onSubmit(session.id, { rating, comment });
    if (result.success) {
      onClose();
      setRating('');
      setComment('');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Feedback Session
          </h2>
          <p className="text-sm text-gray-400 mt-1">{session.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Comment s'est passee la session ?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(FEEDBACK_RATINGS).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRating(r.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    rating === r.id
                      ? 'border-amber-400 bg-amber-500/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl text-center">{r.emoji}</div>
                  <div className="text-xs text-gray-400 text-center mt-1">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre experience..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !rating}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const MentoringPage = () => {
  const { user } = useAuthStore();
  const {
    loading,
    sessions,
    scheduledSessions,
    completedSessions,
    inProgressSessions,
    stats,
    availableUsers,
    createSession,
    startSession,
    completeSession,
    cancelSession,
    submitFeedback,
    SESSION_TYPES,
    MENTORING_TOPICS,
    FEEDBACK_RATINGS
  } = useMentoring();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [filter, setFilter] = useState('all'); // all, mentor, mentee

  // Sessions filtrees
  const filteredSessions = useMemo(() => {
    if (filter === 'mentor') return sessions.filter(s => s.role === 'mentor');
    if (filter === 'mentee') return sessions.filter(s => s.role === 'mentee');
    return sessions;
  }, [sessions, filter]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement des sessions...</p>
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
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8 max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Sessions de Mentorat
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Partagez vos connaissances et developpez-vous
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle Session</span>
              <span className="sm:hidden">Nouvelle</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* Sessions en cours highlight */}
          {inProgressSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <h2 className="text-base sm:text-lg font-bold text-yellow-400 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Play className="w-4 h-4" />
                </div>
                Sessions en cours ({inProgressSessions.length})
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {inProgressSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentUserId={user?.uid}
                    onStart={startSession}
                    onComplete={completeSession}
                    onCancel={cancelSession}
                    onFeedback={setFeedbackSession}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Filtrer:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'mentor', label: 'Mentor' },
                { id: 'mentee', label: 'Mentee' }
              ].map(f => (
                <motion.button
                  key={f.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                <div className="text-4xl sm:text-6xl mb-4">🎓</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Aucune session</h3>
                <p className="text-gray-400 text-sm mb-6 px-4">
                  Commencez a partager vos connaissances ou trouvez un mentor
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm"
                >
                  Creer ma premiere session
                </motion.button>
              </motion.div>
            ) : (
              filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={user?.uid}
                  onStart={startSession}
                  onComplete={completeSession}
                  onCancel={cancelSession}
                  onFeedback={setFeedbackSession}
                />
              ))
            )}
          </div>

        </div>
      </div>

      {/* Modal Creation */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSession}
        availableUsers={availableUsers}
        currentUser={user}
        SESSION_TYPES={SESSION_TYPES}
        MENTORING_TOPICS={MENTORING_TOPICS}
      />

      {/* Modal Feedback */}
      <FeedbackModal
        isOpen={!!feedbackSession}
        onClose={() => setFeedbackSession(null)}
        session={feedbackSession}
        onSubmit={submitFeedback}
        FEEDBACK_RATINGS={FEEDBACK_RATINGS}
      />
    </Layout>
  );
};

export default MentoringPage;
