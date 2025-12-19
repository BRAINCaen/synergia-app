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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Chargement de la cagnotte...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 border border-red-500/30 rounded-xl p-8 text-center max-w-md">
          <span className="text-5xl mb-4 block">❌</span>
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshPoolData}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all"
          >
            Réessayer
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* 🎯 HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">💰</span>
              Cagnotte d'Équipe
            </h1>
            <p className="text-gray-400 mt-2">
              XP collectifs pour des récompenses partagées • Taux: {autoContributionRate || 20}%
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshPoolData}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-600/50 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContributionModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Contribuer
            </motion.button>
            {userIsAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Taux
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* 🏆 HERO CARD - CAGNOTTE PRINCIPALE */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden"
        >
          {/* Effets de fond */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            {/* Montant principal */}
            <div className="text-center md:text-left mb-6 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{getLevelEmoji(safeStats.currentLevel)}</span>
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getLevelGradient(safeStats.currentLevel)} text-white text-sm font-bold`}>
                  Niveau {safeStats.currentLevel}
                </div>
              </div>
              <motion.div
                key={safeStats.totalXP}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-5xl md:text-6xl font-black text-white mb-2"
              >
                {safeStats.totalXP.toLocaleString()} <span className="text-3xl">XP</span>
              </motion.div>
              <p className="text-white/80">
                {safeStats.contributorsCount} contributeurs • {safeStats.totalContributions} contributions
              </p>
            </div>

            {/* Progression niveau suivant */}
            {safeStats.nextLevel && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 w-full md:w-80">
                <div className="flex justify-between text-white/80 text-sm mb-2">
                  <span>Vers {safeStats.nextLevel}</span>
                  <span>{safeStats.progressToNext.progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeStats.progressToNext.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-3 rounded-full bg-gradient-to-r ${getLevelGradient(safeStats.nextLevel)}`}
                  />
                </div>
                <p className="text-white/60 text-sm text-center">
                  Encore {safeStats.progressToNext.xpNeeded?.toLocaleString() || 0} XP
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 📊 GRILLE STATS + TOP CONTRIBUTEURS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats rapides */}
          <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cette semaine', value: safeStats.weeklyContributions, icon: '📅', gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Ce mois', value: safeStats.monthlyContributions, icon: '📆', gradient: 'from-green-500 to-emerald-500' },
              { label: 'Moyenne', value: safeStats.averageContribution, icon: '📈', gradient: 'from-purple-500 to-pink-500' },
              { label: 'Accessibles', value: affordableRewards.length, icon: '🎁', gradient: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-gray-400 text-sm">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {index < 3 && <span className="text-sm text-gray-400 ml-1">XP</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Top contributeurs */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top Contributeurs
            </h3>
            <div className="space-y-3">
              {topContributors.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Aucun contributeur</p>
              ) : (
                topContributors.map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <span className="text-gray-300 text-sm truncate max-w-[120px]">
                        {contributor.email?.split('@')[0] || 'Anonyme'}
                      </span>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">
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
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-8"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Contributions récentes
          </h3>
          <div className="flex flex-wrap gap-3">
            {recentContributions.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune contribution récente</p>
            ) : (
              recentContributions.map((contrib) => (
                <motion.div
                  key={contrib.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-green-400">+{contrib.amount}</span>
                  <span className="text-gray-400 text-sm">par</span>
                  <span className="text-gray-300 text-sm">{contrib.userEmail?.split('@')[0]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4 md:mb-0">
              <Gift className="w-6 h-6 text-pink-400" />
              Récompenses d'Équipe
            </h2>

            {/* Filtres catégories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden md:inline">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Grille récompenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRewards.map((reward) => {
              const isAffordable = affordableRewards.some(r => r.id === reward.id);

              return (
                <motion.div
                  key={reward.id}
                  variants={itemVariants}
                  whileHover={{ scale: isAffordable ? 1.03 : 1, y: isAffordable ? -4 : 0 }}
                  className={`bg-gray-800/50 border rounded-xl overflow-hidden transition-all ${
                    isAffordable
                      ? 'border-green-500/50 hover:border-green-400'
                      : 'border-gray-700/50 opacity-60'
                  }`}
                >
                  {/* Badge niveau */}
                  <div className={`px-3 py-1 bg-gradient-to-r ${getLevelGradient(reward.level)} text-white text-xs font-bold`}>
                    {reward.level}
                  </div>

                  <div className="p-4">
                    <div className="text-center mb-3">
                      <motion.span
                        className="text-4xl block mb-2"
                        animate={isAffordable ? { y: [0, -5, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {reward.icon}
                      </motion.span>
                      <h4 className="text-white font-semibold">{reward.name}</h4>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{reward.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-yellow-400 font-bold">
                        {reward.cost?.toLocaleString()} XP
                      </div>
                      {userIsAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePurchaseReward(reward)}
                          disabled={!isAffordable}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            isAffordable
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mt-8"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Contribution Auto', desc: `${autoContributionRate || 20}% de tes XP vont automatiquement à la cagnotte` },
              { icon: '💪', title: 'Garde tes XP', desc: `Tu gardes ${100 - (autoContributionRate || 20)}% pour tes récompenses perso` },
              { icon: '🎁', title: 'Récompenses', desc: 'Les admins achètent des récompenses pour toute l\'équipe' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContributionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Contribuer à la Cagnotte
                </h3>
                <button onClick={() => setShowContributionModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Montant XP</label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  min="10"
                  step="10"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-xl font-bold text-center focus:border-green-500 focus:outline-none transition-all"
                />
                <div className="flex gap-2 mt-3">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setContributionAmount(amount)}
                      className="flex-1 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-all text-sm"
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
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <span className="text-6xl block mb-4">{selectedReward.icon}</span>
                <h3 className="text-xl font-bold text-white">{selectedReward.name}</h3>
                <p className="text-gray-400 mt-2">{selectedReward.description}</p>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Coût</span>
                  <span className="text-yellow-400 font-bold text-xl">{selectedReward.cost?.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Cagnotte actuelle</span>
                  <span className="text-white font-semibold">{safeStats.totalXP.toLocaleString()} XP</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
                  <span className="text-gray-400">Après achat</span>
                  <span className="text-green-400 font-semibold">
                    {(safeStats.totalXP - (selectedReward.cost || 0)).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl text-gray-300 font-semibold hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmPurchase}
                  disabled={purchasing}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Taux de Contribution
                </h3>
                <button onClick={() => setShowRateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">
                  Pourcentage prélevé sur chaque gain XP
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={dynamicRate}
                    onChange={(e) => setDynamicRate(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-2xl font-bold text-purple-400 w-16 text-right">{dynamicRate}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-purple-300 text-sm">
                  <strong>Impact:</strong> Chaque membre contribuera {dynamicRate}% de ses XP gagnés à la cagnotte d'équipe.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateRate}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-bold hover:shadow-lg transition-all"
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
