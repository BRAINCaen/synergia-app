// ==========================================
// react-app/src/pages/PulsePage.jsx
// PAGE PULSE + BADGEUSE - SYNERGIA v4.1
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, RefreshCw, Sparkles, Check, Clock, Calendar } from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { usePulse } from '../shared/hooks/usePulse.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import DailyChallenge from '../components/wellbeing/DailyChallenge.jsx';

// Extracted components
import {
  PulseCheckIn,
  TodayPulseCard,
  TeamPulseStats,
  UserPulseStats,
  BadgeuseSection
} from '../components/pulse';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500/30 to-rose-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400" />
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
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-slate-500/30 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <span className="text-2xl sm:text-3xl">🛡️</span>
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Poste de Garde
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Pointez votre arrivée et indiquez votre état
                  </p>
                </div>
              </div>

              <motion.button
                onClick={refresh}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.button>
            </div>

            {/* XP Bonus Banner */}
            {!hasPulseToday && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-yellow-300 font-medium text-sm">Bonus disponible !</p>
                  <p className="text-yellow-200/70 text-xs">Completez votre pulse pour gagner +10 XP</p>
                </div>
                <div className="text-xl font-bold text-yellow-400">+10 XP</div>
              </motion.div>
            )}
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne 1 - Badgeuse */}
            <div className="lg:col-span-1">
              <BadgeuseSection user={user} />
            </div>

            {/* Colonne 2 - Pulse Check-in */}
            <div className="lg:col-span-1 space-y-4">
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

              {/* 🌟 Défi bien-être du jour */}
              <DailyChallenge userId={user?.uid} />
            </div>

            {/* Colonne 3 - Stats Equipe */}
            <div className="lg:col-span-1 space-y-4">
              <TeamPulseStats
                teamPulse={teamPulse}
                MOOD_LEVELS={MOOD_LEVELS}
              />

              {/* Info */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4" />
                  Pourquoi le Pulse ?
                </h4>
                <ul className="space-y-1.5 text-xs text-purple-200/70">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Suivez votre bien-etre au fil du temps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Aidez l'equipe a detecter les periodes difficiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Gagnez des XP chaque jour (+10 XP)</span>
                  </li>
                </ul>
              </div>

              {/* Info Badgeuse */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Badgeuse
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-200/70 mb-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Pointez vos arrivees et departs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Multiple pointages (pause dejeuner)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Synchronise en temps reel avec Firebase</span>
                  </li>
                </ul>
                <a
                  href="/hr"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Voir historique complet (RH)
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PulsePage;
