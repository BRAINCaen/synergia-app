// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC DESIGN PREMIUM HARMONISÉ
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award,
  Medal,
  Trophy,
  Star,
  Crown,
  Shield,
  Zap,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Lock,
  Unlock,
  Eye,
  ChevronRight,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useAuthStore } from '../shared/stores/authStore.js';
import { useBadges } from '../shared/hooks/useBadges.js';

// 📊 CONSTANTES BADGES (conservées et étendues)
const BADGE_CATEGORIES = {
  all: { name: 'Tous', icon: Award, color: 'gray' },
  achievements: { name: 'Succès', icon: Trophy, color: 'yellow' },
  skills: { name: 'Compétences', icon: Star, color: 'blue' },
  teamwork: { name: 'Équipe', icon: Users, color: 'green' },
  milestones: { name: 'Étapes', icon: Target, color: 'purple' },
  special: { name: 'Spéciaux', icon: Crown, color: 'red' }
};

const BADGE_RARITY = {
  common: { 
    name: 'Commun', 
    color: 'from-gray-400 to-gray-600', 
    textColor: 'text-gray-100',
    glow: 'shadow-gray-500/20'
  },
  uncommon: { 
    name: 'Peu commun', 
    color: 'from-green-400 to-green-600', 
    textColor: 'text-green-100',
    glow: 'shadow-green-500/30'
  },
  rare: { 
    name: 'Rare', 
    color: 'from-blue-400 to-blue-600', 
    textColor: 'text-blue-100',
    glow: 'shadow-blue-500/40'
  },
  epic: { 
    name: 'Épique', 
    color: 'from-purple-400 to-purple-600', 
    textColor: 'text-purple-100',
    glow: 'shadow-purple-500/50'
  },
  legendary: { 
    name: 'Légendaire', 
    color: 'from-yellow-400 to-orange-500', 
    textColor: 'text-yellow-100',
    glow: 'shadow-yellow-500/60'
  }
};

/**
 * 🏆 COMPOSANT CARTE BADGE PREMIUM
 */
const PremiumBadgeCard = ({ badge, unlocked, progress, onClick, index }) => {
  const rarity = BADGE_RARITY[badge.rarity] || BADGE_RARITY.common;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: unlocked ? 1.05 : 1.02 }}
      className="group cursor-pointer"
      onClick={() => onClick(badge)}
    >
      <PremiumCard 
        className={`
          relative overflow-hidden h-full
          ${unlocked 
            ? `bg-gradient-to-br ${rarity.color} ${rarity.glow} shadow-lg` 
            : 'bg-gray-700/50 border-gray-600/50'
          }
          transition-all duration-300
        `}
      >
        {/* Effet de brillance pour badges débloqués */}
        {unlocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        )}
        
        {/* Badge rareté (coin supérieur droit) */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`
            px-2 py-1 rounded-full text-xs font-bold
            ${unlocked 
              ? 'bg-white/20 backdrop-blur-sm text-white' 
              : 'bg-gray-600 text-gray-300'
            }
          `}>
            {rarity.name.toUpperCase()}
          </div>
        </div>

        {/* Statut débloqué/verrouillé */}
        <div className="absolute top-2 left-2 z-10">
          {unlocked ? (
            <CheckCircle className="w-5 h-5 text-white drop-shadow-lg" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="p-6 text-center">
          {/* Icône du badge */}
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl
            ${unlocked 
              ? 'bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg' 
              : 'bg-gray-600/50 border-2 border-gray-500/50'
            }
            transition-all duration-300 group-hover:scale-110
          `}>
            {unlocked ? (
              <span className="drop-shadow-lg">{badge.icon}</span>
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Nom du badge */}
          <h3 className={`
            font-bold text-lg mb-2
            ${unlocked ? 'text-white drop-shadow-lg' : 'text-gray-400'}
          `}>
            {badge.name}
          </h3>

          {/* Description */}
          <p className={`
            text-sm mb-3 line-clamp-2
            ${unlocked ? 'text-white/90' : 'text-gray-500'}
          `}>
            {badge.description}
          </p>

          {/* XP Reward */}
          <div className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
            ${unlocked 
              ? 'bg-white/20 backdrop-blur-sm text-white' 
              : 'bg-gray-600/50 text-gray-400'
            }
          `}>
            <Zap className="w-4 h-4" />
            +{badge.xpReward} XP
          </div>

          {/* Barre de progression pour badges non débloqués */}
          {!unlocked && progress && (
            <div className="mt-4">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {progress.current} / {progress.required}
              </p>
            </div>
          )}

          {/* Date d'obtention pour badges débloqués */}
          {unlocked && badge.earnedAt && (
            <div className="mt-3 text-xs text-white/70">
              Débloqué le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Effet hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </PremiumCard>
    </motion.div>
  );
};

/**
 * 🏆 PAGE BADGES PREMIUM COMPLÈTE
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  
  // ✅ HOOKS BADGES (conservés)
  const { 
    badges: systemBadges, 
    userBadges, 
    stats, 
    loading, 
    checkBadges 
  } = useBadges();

  // ✅ ÉTATS UI (conservés)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, unlocked, locked

  // ✅ FUSION DES BADGES (conservée)
  const allAvailableBadges = useMemo(() => {
    // Fusionner badges système et badges utilisateur
    const mergedBadges = systemBadges.map(systemBadge => {
      const userBadge = userBadges.find(ub => ub.id === systemBadge.id);
      return {
        ...systemBadge,
        earnedAt: userBadge?.earnedAt,
        unlocked: !!userBadge
      };
    });
    
    return mergedBadges;
  }, [systemBadges, userBadges]);

  // ✅ FILTRAGE INTELLIGENT (étendu)
  const filteredBadges = useMemo(() => {
    let filtered = allAvailableBadges;

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => 
        badge.category === selectedCategory || badge.role === selectedCategory
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rareté
    if (filterRarity !== 'all') {
      filtered = filtered.filter(badge => badge.rarity === filterRarity);
    }

    // Filtre par statut
    if (filterStatus === 'unlocked') {
      filtered = filtered.filter(badge => badge.unlocked);
    } else if (filterStatus === 'locked') {
      filtered = filtered.filter(badge => !badge.unlocked);
    }

    return filtered;
  }, [allAvailableBadges, selectedCategory, searchTerm, filterRarity, filterStatus]);

  // ✅ STATISTIQUES CALCULÉES
  const badgeStats = useMemo(() => {
    const total = allAvailableBadges.length;
    const unlocked = allAvailableBadges.filter(b => b.unlocked).length;
    const totalXP = allAvailableBadges
      .filter(b => b.unlocked)
      .reduce((sum, badge) => sum + (badge.xpReward || 0), 0);
    
    const rarityStats = Object.keys(BADGE_RARITY).reduce((acc, rarity) => {
      const badges = allAvailableBadges.filter(b => b.rarity === rarity);
      const unlockedCount = badges.filter(b => b.unlocked).length;
      acc[rarity] = { total: badges.length, unlocked: unlockedCount };
      return acc;
    }, {});

    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      totalXP,
      rarityStats
    };
  }, [allAvailableBadges]);

  // ✅ FONCTION VÉRIFICATION BADGES (conservée)
  const handleCheckBadges = async () => {
    try {
      await checkBadges();
      console.log('✅ Vérification badges terminée');
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
    }
  };

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Total Badges", 
      value: badgeStats.total, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Débloqués", 
      value: badgeStats.unlocked, 
      icon: Unlock, 
      color: "text-green-400" 
    },
    { 
      label: "Progression", 
      value: `${badgeStats.percentage}%`, 
      icon: TrendingUp, 
      color: "text-purple-400" 
    },
    { 
      label: "XP Badges", 
      value: badgeStats.totalXP, 
      icon: Zap, 
      color: "text-yellow-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      {/* 🔍 BARRE DE RECHERCHE PREMIUM */}
      <PremiumSearchBar
        placeholder="Rechercher un badge..."
        value={searchTerm}
        onChange={setSearchTerm}
        icon={Search}
        className="w-64"
      />

      {/* 🎛️ BOUTON FILTRES */}
      <PremiumButton
        variant={showFilters ? "primary" : "secondary"}
        icon={Filter}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtres
      </PremiumButton>

      {/* 🔄 VÉRIFIER BADGES */}
      <PremiumButton
        variant="secondary"
        icon={Sparkles}
        onClick={handleCheckBadges}
        loading={loading}
      >
        Vérifier
      </PremiumButton>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (loading) {
    return (
      <PremiumLayout
        title="Collection de Badges"
        subtitle="Chargement de vos badges..."
        icon={Award}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation des badges...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Collection de Badges"
      subtitle="Débloquez des badges en accomplissant des défis"
      icon={Award}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎛️ PANNEAU DE FILTRES PREMIUM */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setFilterRarity('all');
                    setFilterStatus('all');
                  }}
                >
                  Réinitialiser
                </PremiumButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtre Rareté */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rareté</label>
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Toutes raretés</option>
                    {Object.entries(BADGE_RARITY).map(([key, rarity]) => (
                      <option key={key} value={key}>
                        {rarity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Tous les badges</option>
                    <option value="unlocked">Débloqués</option>
                    <option value="locked">Verrouillés</option>
                  </select>
                </div>

                {/* Statistiques rareté */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statistiques</label>
                  <div className="space-y-1">
                    {Object.entries(badgeStats.rarityStats).map(([rarity, data]) => (
                      <div key={rarity} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{BADGE_RARITY[rarity]?.name}:</span>
                        <span className="text-white">{data.unlocked}/{data.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📑 ONGLETS CATÉGORIES PREMIUM */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50">
          {Object.entries(BADGE_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = selectedCategory === key;
            const count = key === 'all' 
              ? allAvailableBadges.length 
              : allAvailableBadges.filter(b => b.category === key || b.role === key).length;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-600 text-gray-300'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏆 GRILLE DES BADGES PREMIUM */}
      <div className="space-y-6">
        {filteredBadges.length === 0 ? (
          <PremiumCard className="text-center py-12">
            <Medal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || filterRarity !== 'all' || filterStatus !== 'all'
                ? 'Aucun badge ne correspond aux critères'
                : 'Aucun badge dans cette catégorie'
              }
            </h3>
            <p className="text-gray-400 mb-4">
              {allAvailableBadges.length === 0 
                ? 'Les badges seront disponibles bientôt.'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </p>
            {allAvailableBadges.length > 0 && (
              <PremiumButton
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRarity('all');
                  setFilterStatus('all');
                  setSelectedCategory('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBadges.map((badge, index) => (
              <PremiumBadgeCard
                key={badge.id}
                badge={badge}
                unlocked={badge.unlocked}
                progress={badge.progress}
                onClick={setSelectedBadge}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* 📊 STATISTIQUES PAR RARETÉ */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(BADGE_RARITY).map(([rarity, rarityData]) => {
          const stats = badgeStats.rarityStats[rarity];
          return (
            <StatCard
              key={rarity}
              title={rarityData.name}
              value={`${stats.unlocked}/${stats.total}`}
              icon={Award}
              color={rarity === 'legendary' ? 'yellow' : 
                     rarity === 'epic' ? 'purple' :
                     rarity === 'rare' ? 'blue' :
                     rarity === 'uncommon' ? 'green' : 'gray'}
              trend={stats.total > 0 ? `${Math.round((stats.unlocked / stats.total) * 100)}%` : '0%'}
              className="text-center"
            />
          );
        })}
      </div>

      {/* 🎉 MESSAGE DE FÉLICITATIONS */}
      {badgeStats.percentage >= 50 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <PremiumCard className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-center py-8">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Excellent Collectionneur !
            </h3>
            <p className="text-gray-300">
              Vous avez débloqué {badgeStats.percentage}% de tous les badges disponibles !
            </p>
          </PremiumCard>
        </motion.div>
      )}

      {/* 🔍 MODAL DÉTAILS BADGE */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumCard className={`
                ${selectedBadge.unlocked 
                  ? `bg-gradient-to-br ${BADGE_RARITY[selectedBadge.rarity]?.color} ${BADGE_RARITY[selectedBadge.rarity]?.glow}` 
                  : 'bg-gray-800'
                }
              `}>
                <div className="text-center p-6">
                  {/* Icône du badge */}
                  <div className={`
                    w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl
                    ${selectedBadge.unlocked 
                      ? 'bg-white/20 backdrop-blur-sm border-2 border-white/30' 
                      : 'bg-gray-600/50 border-2 border-gray-500/50'
                    }
                  `}>
                    {selectedBadge.unlocked ? (
                      <span>{selectedBadge.icon}</span>
                    ) : (
                      <Lock className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Informations */}
                  <h3 className={`text-2xl font-bold mb-2 ${selectedBadge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {selectedBadge.name}
                  </h3>
                  
                  <p className={`mb-4 ${selectedBadge.unlocked ? 'text-white/90' : 'text-gray-500'}`}>
                    {selectedBadge.description}
                  </p>

                  {/* Détails */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-3 rounded-lg ${selectedBadge.unlocked ? 'bg-white/10' : 'bg-gray-700/50'}`}>
                      <div className="text-sm text-gray-300">Rareté</div>
                      <div className={`font-bold ${selectedBadge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {BADGE_RARITY[selectedBadge.rarity]?.name}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedBadge.unlocked ? 'bg-white/10' : 'bg-gray-700/50'}`}>
                      <div className="text-sm text-gray-300">XP Reward</div>
                      <div className={`font-bold ${selectedBadge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        +{selectedBadge.xpReward}
                      </div>
                    </div>
                  </div>

                  {/* Date d'obtention ou progression */}
                  {selectedBadge.unlocked && selectedBadge.earnedAt && (
                    <div className="text-sm text-white/70 mb-4">
                      Débloqué le {new Date(selectedBadge.earnedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}

                  {/* Actions */}
                  <PremiumButton
                    variant="secondary"
                    onClick={() => setSelectedBadge(null)}
                    className="w-full"
                  >
                    Fermer
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default BadgesPage;
