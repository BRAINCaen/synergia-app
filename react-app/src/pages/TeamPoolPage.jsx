// ==========================================
// 📁 react-app/src/pages/TeamPoolPage.jsx
// PAGE CAGNOTTE COLLECTIVE D'ÉQUIPE - V2.0
// CONFORME À LA CHARTE GRAPHIQUE SYNERGIA
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  TrendingUp,
  Crown,
  Target,
  RefreshCw,
  Plus,
  X,
  Sparkles,
  Zap,
  Gift,
  ChevronRight,
  Clock,
  Award,
  Flame
} from 'lucide-react';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { db } from '../core/firebase.js';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * 🏆 PAGE CAGNOTTE COLLECTIVE D'ÉQUIPE V2.0
 * Design conforme à la charte graphique SYNERGIA
 */
const TeamPoolPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // Hook de la cagnotte
  const {
    poolData,
    stats,
    loading,
    error,
    contributing,
    purchasing,
    contributeManually,
    purchaseTeamReward,
    refreshPoolData,
    getAvailableRewards,
    getAffordableRewards,
    autoContributionRate,
    poolLevels
  } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true,
    enableContributions: true
  });

  // États locaux
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(100);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [dynamicRate, setDynamicRate] = useState(autoContributionRate);
  const [showRateModal, setShowRateModal] = useState(false);

  // Charger les top contributeurs
  useEffect(() => {
    loadTopContributors();
    loadRecentContributions();
  }, []);

  const loadTopContributors = async () => {
    try {
      const q = query(
        collection(db, 'teamContributions'),
        orderBy('amount', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);

      // Agréger par utilisateur
      const contributorMap = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const existing = contributorMap.get(data.userId) || {
          total: 0,
          count: 0,
          email: data.userEmail
        };
        existing.total += data.amount;
        existing.count += 1;
        contributorMap.set(data.userId, existing);
      });

      const sorted = Array.from(contributorMap.entries())
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopContributors(sorted);
    } catch (err) {
      console.error('Erreur chargement contributeurs:', err);
    }
  };

  const loadRecentContributions = async () => {
    try {
      const q = query(
        collection(db, 'teamContributions'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setRecentContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  // Récompenses disponibles
  const availableRewards = getAvailableRewards();
  const affordableRewards = getAffordableRewards();

  // 🎨 COULEURS PAR NIVEAU
  const getLevelGradient = (level) => {
    switch (level) {
      case 'BRONZE': return 'from-amber-600 to-amber-800';
      case 'SILVER': return 'from-gray-300 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-amber-500';
      case 'PLATINUM': return 'from-purple-400 to-purple-600';
      case 'DIAMOND': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getLevelEmoji = (level) => {
    switch (level) {
      case 'BRONZE': return '🥉';
      case 'SILVER': return '🥈';
      case 'GOLD': return '🥇';
      case 'PLATINUM': return '💎';
      case 'DIAMOND': return '👑';
      default: return '🏆';
    }
  };

  // 🏪 GÉRER L'ACHAT D'UNE RÉCOMPENSE
  const handlePurchaseReward = async (reward) => {
    if (!userIsAdmin) {
      alert('❌ Seuls les admins peuvent acheter des récompenses d\'équipe');
      return;
    }
    setSelectedReward(reward);
    setShowPurchaseModal(true);
  };

  // ✅ CONFIRMER L'ACHAT
  const confirmPurchase = async () => {
    if (!selectedReward) return;
    const result = await purchaseTeamReward(selectedReward);
    if (result.success) {
      setShowPurchaseModal(false);
      setSelectedReward(null);
      refreshPoolData();
    } else {
      alert(`❌ Erreur: ${result.error}`);
    }
  };

  // 💰 GÉRER LA CONTRIBUTION MANUELLE
  const handleContribution = async () => {
    const result = await contributeManually(contributionAmount);
    if (result.success) {
      setShowContributionModal(false);
      setContributionAmount(100);
      loadRecentContributions();
      loadTopContributors();
    } else {
      alert(`❌ Erreur: ${result.error}`);
    }
  };

  // 🔄 Modifier le taux dynamique (admin only)
  const handleUpdateRate = async () => {
    if (!userIsAdmin) return;
    try {
      const poolRef = doc(db, 'teamPool', 'config');
      await updateDoc(poolRef, { contributionRate: dynamicRate / 100 });
      setShowRateModal(false);
      alert(`✅ Taux de contribution mis à jour: ${dynamicRate}%`);
    } catch (err) {
      console.error('Erreur mise à jour taux:', err);
    }
  };

  // 🔄 FILTRER LES RÉCOMPENSES
  const filteredRewards = selectedCategory === 'all'
    ? availableRewards
    : availableRewards.filter(reward => reward.category === selectedCategory);

  // 📂 CATÉGORIES
  const categories = [
    { id: 'all', name: 'Toutes', icon: '🎁' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'activity', name: 'Activités', icon: '🎯' },
    { id: 'equipment', name: 'Équipement', icon: '🎮' },
    { id: 'travel', name: 'Voyages', icon: '✈️' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-green-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500/30 to-emerald-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
          </motion.div>
          <p className="text-gray-400 text-sm sm:text-lg">Chargement de la cagnotte...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-md">
          <span className="text-4xl sm:text-5xl mb-4 block">❌</span>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">{error}</p>
          <motion.button
            onClick={refreshPoolData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white transition-all text-sm sm:text-base"
          >
            Réessayer
          </motion.button>
        </div>
      </div>
    );
  }

  // Valeurs par défaut si stats est vide
  const safeStats = {
    totalXP: stats?.totalXP || 0,
    currentLevel: stats?.currentLevel || 'BRONZE',
    nextLevel: stats?.nextLevel || 'SILVER',
    progressToNext: stats?.progressToNext || { progress: 0, xpNeeded: 1000 },
    contributorsCount: stats?.contributorsCount || 0,
    totalContributions: stats?.totalContributions || 0,
    weeklyContributions: stats?.weeklyContributions || 0,
    monthlyContributions: stats?.monthlyContributions || 0,
    averageContribution: stats?.averageContribution || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-green-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
                  Cagnotte d'Équipe
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Taux: {autoContributionRate || 20}%
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshPoolData}
              className="p-2.5 sm:p-3 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.button>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowContributionModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Contribuer
            </motion.button>
            {userIsAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRateModal(true)}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold transition-all flex items-center gap-2 text-sm sm:text-base"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Taux</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* 🏆 HERO CARD - CAGNOTTE PRINCIPALE */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 relative overflow-hidden"
        >
          {/* Effets de fond */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Montant principal */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                <span className="text-3xl sm:text-5xl">{getLevelEmoji(safeStats.currentLevel)}</span>
                <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${getLevelGradient(safeStats.currentLevel)} text-white text-xs sm:text-sm font-bold`}>
                  Niveau {safeStats.currentLevel}
                </div>
              </div>
              <motion.div
                key={safeStats.totalXP}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent mb-1 sm:mb-2"
              >
                {safeStats.totalXP.toLocaleString()} <span className="text-xl sm:text-3xl">XP</span>
              </motion.div>
              <p className="text-gray-400 text-xs sm:text-sm">
                {safeStats.contributorsCount} contributeurs • {safeStats.totalContributions} contributions
              </p>
            </div>

            {/* Progression niveau suivant */}
            {safeStats.nextLevel && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 w-full md:w-80">
                <div className="flex justify-between text-gray-400 text-xs sm:text-sm mb-2">
                  <span>Vers {safeStats.nextLevel}</span>
                  <span className="text-green-400">{safeStats.progressToNext.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeStats.progressToNext.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${getLevelGradient(safeStats.nextLevel)}`}
                  />
                </div>
                <p className="text-gray-500 text-xs sm:text-sm text-center">
                  Encore {safeStats.progressToNext.xpNeeded?.toLocaleString() || 0} XP
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 📊 GRILLE STATS + TOP CONTRIBUTEURS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Stats rapides */}
          <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Cette semaine', value: safeStats.weeklyContributions, icon: '📅', gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Ce mois', value: safeStats.monthlyContributions, icon: '📆', gradient: 'from-green-500 to-emerald-500' },
              { label: 'Moyenne', value: safeStats.averageContribution, icon: '📈', gradient: 'from-purple-500 to-pink-500' },
              { label: 'Accessibles', value: affordableRewards.length, icon: '🎁', gradient: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-lg sm:text-xl">{stat.icon}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">{stat.label}</span>
                </div>
                <div className={`text-lg sm:text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {index < 3 && <span className="text-xs sm:text-sm text-gray-400 ml-1">XP</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Top contributeurs */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
          >
            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              Top Contributeurs
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {topContributors.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm text-center py-4">Aucun contributeur</p>
              ) : (
                topContributors.map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <span className="text-gray-300 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">
                        {contributor.email?.split('@')[0] || 'Anonyme'}
                      </span>
                    </div>
                    <span className="text-green-400 font-semibold text-xs sm:text-sm">
                      +{contributor.total?.toLocaleString()} XP
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* 📜 HISTORIQUE RÉCENT */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6"
        >
          <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Contributions récentes
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {recentContributions.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm">Aucune contribution récente</p>
            ) : (
              recentContributions.map((contrib) => (
                <motion.div
                  key={contrib.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="text-green-400 text-sm sm:text-base">+{contrib.amount}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">par</span>
                  <span className="text-gray-300 text-xs sm:text-sm">{contrib.userEmail?.split('@')[0]}</span>
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    contrib.type === 'manual' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {contrib.type === 'manual' ? 'Manuel' : 'Auto'}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* 🎁 SECTION RÉCOMPENSES */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 mb-3 md:mb-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
              Récompenses d'Équipe
            </h2>

            {/* Filtres catégories */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden md:inline">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Grille récompenses */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {filteredRewards.map((reward) => {
              const isAffordable = affordableRewards.some(r => r.id === reward.id);

              return (
                <motion.div
                  key={reward.id}
                  variants={itemVariants}
                  whileHover={{ scale: isAffordable ? 1.02 : 1, y: isAffordable ? -2 : 0 }}
                  className={`bg-white/5 backdrop-blur-xl border rounded-xl overflow-hidden transition-all ${
                    isAffordable
                      ? 'border-green-500/30 hover:border-green-400/50'
                      : 'border-white/10 opacity-60'
                  }`}
                >
                  {/* Badge niveau */}
                  <div className={`px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r ${getLevelGradient(reward.level)} text-white text-xs font-bold`}>
                    {reward.level}
                  </div>

                  <div className="p-2.5 sm:p-4">
                    <div className="text-center mb-2 sm:mb-3">
                      <motion.span
                        className="text-2xl sm:text-4xl block mb-1.5 sm:mb-2"
                        animate={isAffordable ? { y: [0, -5, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {reward.icon}
                      </motion.span>
                      <h4 className="text-white font-semibold text-xs sm:text-base">{reward.name}</h4>
                      <p className="text-gray-400 text-xs mt-0.5 sm:mt-1 line-clamp-2">{reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 sm:mt-4">
                      <div className="text-yellow-400 font-bold text-xs sm:text-base">
                        {reward.cost?.toLocaleString()} XP
                      </div>
                      {userIsAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePurchaseReward(reward)}
                          disabled={!isAffordable}
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-medium transition-all ${
                            isAffordable
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-white/10 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isAffordable ? 'Acheter' : 'Insuffisant'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 💡 COMMENT ÇA MARCHE */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 mt-4 sm:mt-6"
        >
          <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: '🎯', title: 'Contribution Auto', desc: `${autoContributionRate || 20}% de tes XP vont automatiquement à la cagnotte` },
              { icon: '💪', title: 'Garde tes XP', desc: `Tu gardes ${100 - (autoContributionRate || 20)}% pour tes récompenses perso` },
              { icon: '🎁', title: 'Récompenses', desc: 'Les admins achètent des récompenses pour toute l\'équipe' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <div>
                  <h4 className="text-white font-medium text-sm sm:text-base">{item.title}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 🔲 MODAL CONTRIBUTION */}
      <AnimatePresence>
        {showContributionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowContributionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Contribuer à la Cagnotte
                </h3>
                <button onClick={() => setShowContributionModal(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="text-gray-400 text-xs sm:text-sm mb-2 block">Montant XP</label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  min="10"
                  step="10"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg sm:text-xl font-bold text-center focus:border-green-500 focus:outline-none transition-all"
                />
                <div className="flex gap-2 mt-2 sm:mt-3">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setContributionAmount(amount)}
                      className="flex-1 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-all text-xs sm:text-sm"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContribution}
                disabled={contributing}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-sm sm:text-lg hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
              >
                {contributing ? 'Contribution en cours...' : `Contribuer ${contributionAmount} XP`}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔲 MODAL ACHAT */}
      <AnimatePresence>
        {showPurchaseModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md"
            >
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">{selectedReward.icon}</span>
                <h3 className="text-lg sm:text-xl font-bold text-white">{selectedReward.name}</h3>
                <p className="text-gray-400 text-sm mt-2">{selectedReward.description}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Coût</span>
                  <span className="text-yellow-400 font-bold text-lg sm:text-xl">{selectedReward.cost?.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400 text-sm">Cagnotte actuelle</span>
                  <span className="text-white font-semibold text-sm sm:text-base">{safeStats.totalXP.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Après achat</span>
                  <span className="text-green-400 font-semibold text-sm sm:text-base">
                    {(safeStats.totalXP - (selectedReward.cost || 0)).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-semibold hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmPurchase}
                  disabled={purchasing}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  {purchasing ? 'Achat...' : 'Confirmer'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔲 MODAL TAUX DYNAMIQUE (Admin) */}
      <AnimatePresence>
        {showRateModal && userIsAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowRateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Taux de Contribution
                </h3>
                <button onClick={() => setShowRateModal(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="text-gray-400 text-xs sm:text-sm mb-2 block">
                  Pourcentage prélevé sur chaque gain XP
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={dynamicRate}
                    onChange={(e) => setDynamicRate(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-xl sm:text-2xl font-bold text-purple-400 w-14 sm:w-16 text-right">{dynamicRate}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-purple-300 text-xs sm:text-sm">
                  <strong>Impact:</strong> Chaque membre contribuera {dynamicRate}% de ses XP gagnés à la cagnotte d'équipe.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateRate}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-bold hover:shadow-lg transition-all text-sm sm:text-base"
              >
                Appliquer {dynamicRate}%
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPoolPage;
