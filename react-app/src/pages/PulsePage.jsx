// ==========================================
// react-app/src/pages/PulsePage.jsx
// PAGE PULSE - SYNERGIA v4.0
// Module Pulse: Check-in quotidien equipe
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  Award,
  Flame,
  Check,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  BarChart3
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { usePulse } from '../shared/hooks/usePulse.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// COMPOSANT CHECK-IN PULSE
// ==========================================
const PulseCheckIn = ({ onSubmit, submitting, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!mood || !energy) return;

    onSubmit({
      mood,
      energy,
      note,
      isAnonymous
    });
  };

  const moodOptions = Object.values(MOOD_LEVELS);
  const energyOptions = Object.values(ENERGY_LEVELS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-4"
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Comment allez-vous ?</h2>
        <p className="text-gray-400">Votre check-in quotidien aide l'equipe a rester connectee</p>
      </div>

      {/* Etape 1: Humeur */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              1. Comment est votre humeur ?
            </h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setMood(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${mood === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className={`text-xs font-medium ${mood === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => mood && setStep(2)}
              disabled={!mood}
              className={`
                w-full py-3 rounded-xl font-semibold transition-all
                ${mood
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continuer
            </button>
          </motion.div>
        )}

        {/* Etape 2: Energie */}
        {step === 2 && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              2. Quel est votre niveau d'energie ?
            </h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {energyOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setEnergy(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                    ${energy === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className={`text-xs font-medium ${energy === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Retour
              </button>
              <button
                onClick={() => energy && setStep(3)}
                disabled={!energy}
                className={`
                  flex-1 py-3 rounded-xl font-semibold transition-all
                  ${energy
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Etape 3: Note optionnelle */}
        {step === 3 && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              3. Un commentaire ? (optionnel)
            </h3>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Partagez ce qui vous preoccupe ou vous motive..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-4"
            />

            {/* Option anonyme */}
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`
                w-full flex items-center justify-center gap-2 p-3 rounded-xl mb-6 transition-all
                ${isAnonymous
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }
              `}
            >
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">
                {isAnonymous ? 'Reponse anonyme' : 'Rendre anonyme'}
              </span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur d'etapes */}
      <div className="flex justify-center gap-2 mt-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-4' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT PULSE FAIT AUJOURD'HUI
// ==========================================
const TodayPulseCard = ({ pulse, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const moodInfo = MOOD_LEVELS[pulse.mood];
  const energyInfo = ENERGY_LEVELS[pulse.energy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-500/30 rounded-xl">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Pulse enregistre !</h3>
          <p className="text-green-300/70 text-sm">+10 XP gagnes pour votre check-in</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Humeur */}
        <div className={`p-4 rounded-xl ${moodInfo?.bgColor || 'bg-gray-500/20'}`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{moodInfo?.emoji || '😐'}</span>
            <div>
              <p className="text-xs text-gray-400">Humeur</p>
              <p className={`font-bold ${moodInfo?.textColor || 'text-white'}`}>
                {moodInfo?.label || 'Correct'}
              </p>
            </div>
          </div>
        </div>

        {/* Energie */}
        <div className="p-4 rounded-xl bg-yellow-500/20">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{energyInfo?.emoji || '🔌'}</span>
            <div>
              <p className="text-xs text-gray-400">Energie</p>
              <p className="font-bold text-yellow-400">
                {energyInfo?.label || 'Moyenne'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pulse.note && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-gray-300 text-sm">{pulse.note}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT STATS EQUIPE
// ==========================================
const TeamPulseStats = ({ teamPulse, MOOD_LEVELS }) => {
  if (!teamPulse || teamPulse.totalResponses === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Pas encore de donnees d'equipe</p>
        <p className="text-gray-500 text-sm mt-1">Les pulses apparaitront ici</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (teamPulse.trend === 'up') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (teamPulse.trend === 'down') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getMoodColor = (value) => {
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Pulse de l'Equipe
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon()}
          <span className={
            teamPulse.trend === 'up' ? 'text-green-400' :
            teamPulse.trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }>
            {teamPulse.trend === 'up' ? 'En hausse' :
             teamPulse.trend === 'down' ? 'En baisse' : 'Stable'}
          </span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <p className={`text-3xl font-bold ${getMoodColor(parseFloat(teamPulse.averageMood))}`}>
            {teamPulse.averageMood}
          </p>
          <p className="text-xs text-gray-400 mt-1">Humeur moy.</p>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <p className="text-3xl font-bold text-yellow-400">{teamPulse.averageEnergy}</p>
          <p className="text-xs text-gray-400 mt-1">Energie moy.</p>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-xl">
          <p className="text-3xl font-bold text-purple-400">{teamPulse.totalResponses}</p>
          <p className="text-xs text-gray-400 mt-1">Reponses</p>
        </div>
      </div>

      {/* Distribution des humeurs */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 mb-3">Distribution des humeurs</p>
        {Object.entries(teamPulse.moodDistribution || {}).map(([moodId, count]) => {
          const moodInfo = MOOD_LEVELS[moodId];
          const percent = (count / teamPulse.totalResponses) * 100;

          return (
            <div key={moodId} className="flex items-center gap-3">
              <span className="text-xl w-8">{moodInfo?.emoji || '😐'}</span>
              <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${moodInfo?.color || 'from-gray-500 to-gray-600'}`}
                />
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Graphique tendance */}
      {teamPulse.dailyData?.length > 1 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Evolution sur 7 jours
          </p>
          <div className="h-20 flex items-end gap-1">
            {teamPulse.dailyData.slice(-7).map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.avgMood / 5) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-full rounded-t bg-gradient-to-t ${
                    day.avgMood >= 4 ? 'from-green-600 to-green-400' :
                    day.avgMood >= 3 ? 'from-yellow-600 to-yellow-400' :
                    'from-red-600 to-red-400'
                  }`}
                  style={{ minHeight: 4 }}
                />
                <span className="text-[10px] text-gray-500">
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT STATS PERSONNELLES
// ==========================================
const UserPulseStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-400" />
        Vos Statistiques
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Serie */}
        <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame className={`w-5 h-5 ${stats.streak >= 7 ? 'text-orange-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-400">Serie</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.streak} <span className="text-sm text-gray-400">jours</span>
          </p>
        </div>

        {/* Total */}
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.totalPulses} <span className="text-sm text-gray-400">pulses</span>
          </p>
        </div>

        {/* Humeur moyenne */}
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-gray-400 mb-1">Humeur moyenne</p>
          <p className="text-xl font-bold text-green-400">{stats.averageMood}/5</p>
        </div>

        {/* Energie moyenne */}
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-gray-400 mb-1">Energie moyenne</p>
          <p className="text-xl font-bold text-yellow-400">{stats.averageEnergy}/5</p>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================
const PulsePage = () => {
  const { user } = useAuthStore();
  const {
    loading,
    submitting,
    hasPulseToday,
    todayPulse,
    userStats,
    teamPulse,
    submitPulse,
    refresh,
    MOOD_LEVELS,
    ENERGY_LEVELS
  } = usePulse({ realTimeTeam: true });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-white text-lg">Chargement du Pulse...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Heart className="w-10 h-10 text-pink-400" />
                  Pulse
                </h1>
                <p className="text-gray-400">
                  Check-in quotidien pour suivre le bien-etre de l'equipe
                </p>
              </div>

              <motion.button
                onClick={refresh}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* XP Bonus Banner */}
            {!hasPulseToday && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4"
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-yellow-300 font-medium">Bonus disponible !</p>
                  <p className="text-yellow-200/70 text-sm">Completez votre pulse pour gagner +10 XP</p>
                </div>
                <div className="text-2xl font-bold text-yellow-400">+10 XP</div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Colonne gauche - Check-in */}
            <div className="space-y-6">
              {hasPulseToday && todayPulse ? (
                <TodayPulseCard
                  pulse={todayPulse}
                  MOOD_LEVELS={MOOD_LEVELS}
                  ENERGY_LEVELS={ENERGY_LEVELS}
                />
              ) : (
                <PulseCheckIn
                  onSubmit={submitPulse}
                  submitting={submitting}
                  MOOD_LEVELS={MOOD_LEVELS}
                  ENERGY_LEVELS={ENERGY_LEVELS}
                />
              )}

              {/* Stats personnelles */}
              <UserPulseStats stats={userStats} />
            </div>

            {/* Colonne droite - Equipe */}
            <div className="space-y-6">
              <TeamPulseStats
                teamPulse={teamPulse}
                MOOD_LEVELS={MOOD_LEVELS}
              />

              {/* Info */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Pourquoi le Pulse ?
                </h4>
                <ul className="space-y-2 text-sm text-purple-200/70">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Suivez votre bien-etre au fil du temps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Aidez l'equipe a detecter les periodes difficiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Gagnez des XP chaque jour (+10 XP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Reponses anonymes si souhaite</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PulsePage;
