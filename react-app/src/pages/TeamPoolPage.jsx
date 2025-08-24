// ==========================================
// 📁 react-app/src/pages/TeamPoolPage.jsx
// PAGE CAGNOTTE COLLECTIVE D'ÉQUIPE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Star, 
  Coins, 
  Gift, 
  Zap, 
  TrendingUp,
  ShoppingBag,
  Calendar,
  Award,
  Crown,
  Gem,
  Coffee,
  Gamepad2,
  Plane,
  Building,
  Pizza,
  Target,
  Lock,
  Unlock,
  RefreshCw,
  Plus
} from 'lucide-react';
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import PremiumButton from '../components/ui/PremiumButton.jsx';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🏆 PAGE CAGNOTTE COLLECTIVE D'ÉQUIPE
 * Permet à l'équipe de voir la cagnotte commune et acheter des récompenses collectives
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
    isReady,
    contributeManually,
    purchaseTeamReward,
    refreshPoolData,
    getAvailableRewards,
    getAffordableRewards,
    calculateAutoContribution,
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

  // Récompenses disponibles
  const availableRewards = getAvailableRewards();
  const affordableRewards = getAffordableRewards();

  // 🎨 COULEURS PAR NIVEAU
  const getLevelColor = (level) => {
    switch (level) {
      case 'BRONZE': return 'from-yellow-600 to-yellow-800';
      case 'SILVER': return 'from-gray-400 to-gray-600';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'PLATINUM': return 'from-purple-400 to-purple-600';
      case 'DIAMOND': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // 🎯 ICÔNES PAR CATÉGORIE
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food': return Pizza;
      case 'activity': return Target;
      case 'equipment': return Gift;
      case 'travel': return Plane;
      default: return Gift;
    }
  };

  // 📊 STATISTIQUES HEADER
  const headerStats = [
    { 
      label: "Cagnotte XP", 
      value: stats.totalXP.toLocaleString(), 
      icon: Coins, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau", 
      value: stats.currentLevel, 
      icon: Crown, 
      color: "text-purple-400" 
    },
    { 
      label: "Contributeurs", 
      value: stats.contributorsCount.toString(), 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Récompenses accessibles", 
      value: affordableRewards.length.toString(), 
      icon: Trophy, 
      color: "text-green-400" 
    }
  ];

  // 🎮 ACTIONS HEADER
  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={refreshPoolData}
        disabled={loading}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Plus}
        onClick={() => setShowContributionModal(true)}
      >
        Contribuer
      </PremiumButton>
    </div>
  );

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
      alert(`🎉 Récompense "${selectedReward.name}" achetée avec succès ! L'équipe en profitera bientôt !`);
      setShowPurchaseModal(false);
      setSelectedReward(null);
    } else {
      alert(`❌ Erreur lors de l'achat: ${result.error}`);
    }
  };

  // 💰 GÉRER LA CONTRIBUTION MANUELLE
  const handleContribution = async () => {
    const result = await contributeManually(contributionAmount);
    
    if (result.success) {
      alert(`🎉 Merci ! Tu as contribué ${result.contributed} XP à la cagnotte équipe !`);
      setShowContributionModal(false);
      setContributionAmount(100);
    } else {
      alert(`❌ Erreur lors de la contribution: ${result.error}`);
    }
  };

  // 🔄 FILTRER LES RÉCOMPENSES
  const filteredRewards = selectedCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(reward => reward.category === selectedCategory);

  // 📂 CATÉGORIES
  const categories = [
    { id: 'all', name: 'Toutes', icon: Trophy },
    { id: 'food', name: 'Nourriture', icon: Pizza },
    { id: 'activity', name: 'Activités', icon: Target },
    { id: 'equipment', name: 'Équipement', icon: Gift },
    { id: 'travel', name: 'Voyages', icon: Plane }
  ];

  if (loading) {
    return (
      <PremiumLayout title="Cagnotte d'Équipe" subtitle="Chargement..." icon={Users}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Chargement de la cagnotte...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout title="Cagnotte d'Équipe" subtitle="Erreur" icon={Users}>
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">❌ {error}</div>
          <PremiumButton variant="primary" onClick={refreshPoolData}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Cagnotte d'Équipe"
      subtitle="XP collectifs pour des récompenses partagées"
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* 🏆 CAGNOTTE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Montant total et niveau */}
        <div className="lg:col-span-2">
          <PremiumCard>
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getLevelColor(stats.currentLevel)} flex items-center justify-center text-6xl font-bold text-white shadow-2xl`}>
                  <Crown className="w-16 h-16" />
                </div>
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-2">
                {stats.totalXP.toLocaleString()} XP
              </h2>
              
              <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getLevelColor(stats.currentLevel)} text-white font-bold text-lg mb-4`}>
                Niveau {stats.currentLevel}
              </div>
              
              <p className="text-gray-400 mb-6">
                Cagnotte collective alimentée par {autoContributionRate}% des XP de chaque membre
              </p>

              {/* Progression vers niveau suivant */}
              {stats.nextLevel && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progression vers {stats.nextLevel}</span>
                    <span>{stats.progressToNext.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.progressToNext.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-3 rounded-full bg-gradient-to-r ${getLevelColor(stats.nextLevel)}`}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-2">
                    Encore {stats.progressToNext.xpNeeded} XP nécessaires
                  </p>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Statistiques détaillées */}
        <div>
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-6">📊 Statistiques</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Contributions cette semaine</span>
                  <span className="text-white font-semibold">{stats.weeklyContributions} XP</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Contributions ce mois</span>
                  <span className="text-white font-semibold">{stats.monthlyContributions} XP</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Contribution moyenne</span>
                  <span className="text-white font-semibold">{stats.averageContribution} XP</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total contributions</span>
                  <span className="text-white font-semibold">{stats.totalContributions}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <h4 className="text-white font-medium mb-3">💡 Comment ça marche ?</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• {autoContributionRate}% de tes XP vont automatiquement à la cagnotte</li>
                <li>• Tu gardes 95% de tes XP pour tes récompenses perso</li>
                <li>• Plus l'équipe est active, plus la cagnotte grandit</li>
                <li>• Les admins peuvent acheter des récompenses pour tous</li>
              </ul>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* 📂 FILTRES PAR CATÉGORIE */}
      <div className="mb-8">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">🎯 Récompenses d'Équipe</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-400">
            💡 <strong>Astuce :</strong> Les récompenses d'équipe profitent à tous et n'utilisent que la cagnotte collective !
          </div>
        </PremiumCard>
      </div>

      {/* 🏪 GRILLE DES RÉCOMPENSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => {
          const isAffordable = affordableRewards.some(r => r.id === reward.id);
          const IconComponent = getCategoryIcon(reward.category);
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumCard className={`relative overflow-hidden group ${isAffordable ? 'hover:scale-105' : 'opacity-75'} transition-all duration-200`}>
                
                {/* Badge de niveau requis */}
                <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${getLevelColor(reward.level)} text-xs font-bold text-white rounded-bl-lg z-10`}>
                  {reward.level}
                </div>

                {/* Effet brillant pour récompenses accessibles */}
                {isAffordable && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse pointer-events-none"></div>
                )}

                <div className="p-4 relative z-10">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2 group-hover:animate-bounce transition-all duration-200">
                      {reward.icon}
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                      {reward.name}
                    </h4>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-xl">
                        {reward.cost.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">XP Équipe</div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAffordable 
                        ? '
