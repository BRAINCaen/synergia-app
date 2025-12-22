// ==========================================
// react-app/src/components/mentoring/SponsorshipSection.jsx
// SECTION PARRAINAGE - SYNERGIA v4.0
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Award, TrendingUp, Calendar, CheckCircle,
  Clock, Star, ChevronRight, X, Plus, MessageSquare, Target,
  Gift, Zap, Heart, Shield
} from 'lucide-react';
import { useSponsorship } from '../../shared/hooks/useSponsorship.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

// ==========================================
// COMPOSANT STATS PARRAINAGE
// ==========================================

const SponsorshipStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Filleuls actifs',
      value: stats.asMentor.active,
      total: stats.asMentor.total,
      emoji: '🤝',
      bgColor: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Parrainages réussis',
      value: stats.asMentor.completed,
      emoji: '🎓',
      bgColor: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Points de suivi',
      value: stats.asMentor.totalMeetings,
      emoji: '📅',
      bgColor: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'XP Parrainage',
      value: stats.overall.totalXpEarned,
      emoji: '⚡',
      bgColor: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${card.bgColor} rounded-xl p-3 sm:p-4 text-white`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.emoji}</span>
            {card.total !== undefined && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {card.total} total
              </span>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
          <div className="text-xs sm:text-sm opacity-90">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// COMPOSANT CARTE PARRAINAGE
// ==========================================

const SponsorshipCard = ({
  sponsorship,
  currentUserId,
  onRecordMeeting,
  onCompleteMilestone,
  onComplete,
  SPONSORSHIP_STATUS,
  MENTEE_MILESTONES
}) => {
  const [expanded, setExpanded] = useState(false);
  const isMentor = sponsorship.mentorId === currentUserId;
  const status = SPONSORSHIP_STATUS[sponsorship.status] || SPONSORSHIP_STATUS.active;

  const startDate = sponsorship.startDate?.toDate?.();
  const daysSinceStart = startDate
    ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const completedMilestones = sponsorship.milestonesCompleted || [];
  const totalMilestones = Object.keys(MENTEE_MILESTONES).length;
  const progressPercent = Math.round((completedMilestones.length / totalMilestones) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-lg rounded-2xl border overflow-hidden ${
        sponsorship.status === 'active'
          ? 'border-purple-500/30'
          : 'border-white/10'
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {isMentor ? sponsorship.menteeAvatar : sponsorship.mentorAvatar}
              </div>
              {sponsorship.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-white">
                {isMentor ? sponsorship.menteeName : sponsorship.mentorName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={status.textColor}>
                  {status.emoji} {isMentor ? 'Votre filleul' : 'Votre parrain'}
                </span>
                <span>•</span>
                <span>{daysSinceStart} jours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress badge */}
            <div className="text-right">
              <div className="text-xs text-gray-400">Progression</div>
              <div className="text-sm font-bold text-purple-400">{progressPercent}%</div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
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
              {/* XP Earned */}
              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300">XP gagnés</span>
                </div>
                <span className="font-bold text-amber-400">
                  +{isMentor ? sponsorship.totalMentorXpEarned : sponsorship.totalMenteeXpEarned} XP
                </span>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Jalons ({completedMilestones.length}/{totalMilestones})
                </h4>
                <div className="space-y-2">
                  {Object.entries(MENTEE_MILESTONES).map(([id, milestone]) => {
                    const isCompleted = completedMilestones.includes(id);
                    const canComplete = isMentor && sponsorship.status === 'active' && !isCompleted && milestone.manual;

                    return (
                      <div
                        key={id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isCompleted ? 'bg-green-500/10' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : 'bg-white/10'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-sm">{milestone.emoji}</span>
                            )}
                          </div>
                          <div>
                            <span className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-300'}`}>
                              {milestone.label}
                            </span>
                            {!isCompleted && (
                              <div className="text-xs text-gray-500">
                                +{milestone.mentorXpBonus} XP parrain | +{milestone.menteeXpBonus} XP filleul
                              </div>
                            )}
                          </div>
                        </div>

                        {canComplete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCompleteMilestone(sponsorship.id, id);
                            }}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors"
                          >
                            Valider
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              {isMentor && sponsorship.status === 'active' && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => onRecordMeeting(sponsorship.id)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Point de suivi
                  </button>

                  {completedMilestones.length >= totalMilestones - 1 && (
                    <button
                      onClick={() => onComplete(sponsorship.id)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      Déclarer autonome
                    </button>
                  )}
                </div>
              )}

              {/* Notes */}
              {sponsorship.goals?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Objectifs</h4>
                  <ul className="space-y-1">
                    {sponsorship.goals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// MODAL CRÉATION PARRAINAGE
// ==========================================

const CreateSponsorshipModal = ({
  isOpen,
  onClose,
  onCreate,
  availableMentees,
  currentUser
}) => {
  const [form, setForm] = useState({
    menteeId: '',
    menteeName: '',
    menteeAvatar: '',
    menteeEmail: '',
    goals: [''],
    notes: '',
    expectedEndDate: ''
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.menteeId) return;

    setCreating(true);
    const result = await onCreate({
      mentorId: currentUser.uid,
      mentorName: currentUser.displayName || currentUser.email,
      mentorEmail: currentUser.email,
      mentorAvatar: currentUser.customization?.avatar || '👤',
      ...form,
      goals: form.goals.filter(g => g.trim())
    });

    if (result.success) {
      onClose();
      setForm({
        menteeId: '',
        menteeName: '',
        menteeAvatar: '',
        menteeEmail: '',
        goals: [''],
        notes: '',
        expectedEndDate: ''
      });
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 w-full sm:max-w-lg max-h-[95vh] sm:max-h-[85vh] flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            Nouveau Parrainage
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Sélection du filleul */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choisir un filleul *
            </label>
            {availableMentees.length === 0 ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                Aucun collaborateur disponible pour être parrainé
              </div>
            ) : (
              <select
                value={form.menteeId}
                onChange={(e) => {
                  const selected = availableMentees.find(u => u.id === e.target.value);
                  setForm(f => ({
                    ...f,
                    menteeId: e.target.value,
                    menteeName: selected?.displayName || selected?.email || 'Utilisateur',
                    menteeAvatar: selected?.avatar || '👤',
                    menteeEmail: selected?.email || ''
                  }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
                required
              >
                <option value="" className="bg-gray-800 text-white">Sélectionnez un collaborateur</option>
                {availableMentees.map(user => {
                  const name = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
                  return (
                    <option key={user.id} value={user.id} className="bg-gray-800 text-white">
                      {user.avatar || '👤'} {name} - Niveau {user.level || 1}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs du parrainage
            </label>
            <div className="space-y-2">
              {form.goals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...form.goals];
                      newGoals[index] = e.target.value;
                      setForm(f => ({ ...f, goals: newGoals }));
                    }}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none text-sm"
                  />
                  {form.goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(f => ({
                          ...f,
                          goals: f.goals.filter((_, i) => i !== index)
                        }));
                      }}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, goals: [...f.goals, ''] }))}
                className="text-pink-400 text-sm hover:text-pink-300 transition-colors"
              >
                + Ajouter un objectif
              </button>
            </div>
          </div>

          {/* Date de fin prévue */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date de fin prévue (optionnel)
            </label>
            <input
              type="date"
              value={form.expectedEndDate}
              onChange={(e) => setForm(f => ({ ...f, expectedEndDate: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Par défaut : 90 jours</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Contexte, points d'attention..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none text-sm"
            />
          </div>

          {/* Info XP */}
          <div className="p-3 sm:p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-medium text-sm">Bonus XP</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Vous gagnerez des XP à chaque jalon. Jusqu'à <span className="text-purple-400 font-bold">+630 XP</span> si mené à terme !
            </p>
          </div>
          </div>

          {/* Boutons - Toujours visible en bas */}
          <div className="flex gap-3 p-4 border-t border-white/10 bg-slate-800 flex-shrink-0 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors text-sm font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating || !form.menteeId}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {creating ? 'Création...' : 'Devenir parrain'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const SponsorshipSection = () => {
  const {
    loading,
    activeSponsorships,
    completedSponsorships,
    stats,
    availableMentees,
    createSponsorship,
    recordMeeting,
    completeMilestone,
    completeSponsorship,
    SPONSORSHIP_STATUS,
    MENTEE_MILESTONES,
    SPONSORSHIP_BADGES
  } = useSponsorship();

  const { user } = useAuthStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  const handleRecordMeeting = async (sponsorshipId) => {
    const notes = prompt('Notes du point de suivi (optionnel):');
    if (notes !== null) {
      await recordMeeting(sponsorshipId, { notes });
      alert('✅ Point de suivi enregistré ! +10 XP');
    }
  };

  const handleCompleteMilestone = async (sponsorshipId, milestoneId) => {
    const milestone = MENTEE_MILESTONES[milestoneId];
    const confirm = window.confirm(
      `Valider le jalon "${milestone.label}" ?\n\n` +
      `Vous gagnerez +${milestone.mentorXpBonus} XP\n` +
      `Votre filleul gagnera +${milestone.menteeXpBonus} XP`
    );

    if (confirm) {
      const result = await completeMilestone(sponsorshipId, milestoneId);
      if (result.success) {
        alert(`🎉 Jalon validé ! +${milestone.mentorXpBonus} XP`);
      }
    }
  };

  const handleComplete = async (sponsorshipId) => {
    const confirm = window.confirm(
      'Déclarer votre filleul comme autonome ?\n\n' +
      'Cela terminera le parrainage et vous attribuera le bonus final de +150 XP !'
    );

    if (confirm) {
      // D'abord valider le jalon "autonomy"
      await completeMilestone(sponsorshipId, 'autonomy');
      alert('🎓 Félicitations ! Parrainage terminé avec succès !');
    }
  };

  const displayedSponsorships = activeTab === 'active' ? activeSponsorships : completedSponsorships;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mx-auto mb-4" />
        <p className="text-gray-400">Chargement des parrainages...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-xl">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Parrainage</h2>
            <p className="text-gray-400 text-sm">Accompagnez les nouveaux collaborateurs</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Devenir parrain
        </motion.button>
      </div>

      {/* Stats */}
      <SponsorshipStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Actifs ({activeSponsorships.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Terminés ({completedSponsorships.length})
        </button>
      </div>

      {/* Liste des parrainages */}
      <div className="space-y-4">
        {displayedSponsorships.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-4">
              {activeTab === 'active' ? '🤝' : '🎓'}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {activeTab === 'active' ? 'Aucun parrainage actif' : 'Aucun parrainage terminé'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {activeTab === 'active'
                ? 'Devenez parrain pour accompagner un nouveau collaborateur'
                : 'Vos parrainages terminés apparaîtront ici'}
            </p>
            {activeTab === 'active' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm"
              >
                Commencer un parrainage
              </motion.button>
            )}
          </div>
        ) : (
          displayedSponsorships.map(sponsorship => (
            <SponsorshipCard
              key={sponsorship.id}
              sponsorship={sponsorship}
              currentUserId={user?.uid}
              onRecordMeeting={handleRecordMeeting}
              onCompleteMilestone={handleCompleteMilestone}
              onComplete={handleComplete}
              SPONSORSHIP_STATUS={SPONSORSHIP_STATUS}
              MENTEE_MILESTONES={MENTEE_MILESTONES}
            />
          ))
        )}
      </div>

      {/* Modal création */}
      <CreateSponsorshipModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSponsorship}
        availableMentees={availableMentees}
        currentUser={user}
      />
    </motion.div>
  );
};

export default SponsorshipSection;
