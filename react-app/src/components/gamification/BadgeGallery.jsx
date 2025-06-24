// ==========================================
// 📁 react-app/src/components/gamification/BadgeGallery.jsx
// Galerie complète des badges avec filtres et progression
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBadges } from '../../shared/hooks/useBadges.js';

/**
 * 🏆 COMPOSANT GALERIE BADGES
 * 
 * Affiche tous les badges disponibles avec :
 * - Filtres par catégorie et rareté
 * - État débloqué/verrouillé
 * - Barres de progression pour badges en cours
 * - Tooltips avec conditions détaillées
 * - Statistiques globales
 */
const BadgeGallery = () => {
  const {
    badges,
    userBadges,
    badgeProgress,
    getBadgesByCategory,
    getBadgesByRarity,
    getUnlockedBadges,
    getLockedBadges,
    isBadgeUnlocked,
    getBadgeProgress,
    loading,
    stats
  } = useBadges();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Filtrage des badges
  const filteredBadges = badges
    .filter(badge => {
      if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
      if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
      if (showOnlyUnlocked && !isBadgeUnlocked(badge.id)) return false;
      return true;
    });

  const categories = ['all', ...new Set(badges.map(badge => badge.category))];
  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];

  const rarityColors = {
    common: 'border-gray-400 bg-gray-400/10 text-gray-400',
    uncommon: 'border-green-400 bg-green-400/10 text-green-400',
    rare: 'border-blue-400 bg-blue-400/10 text-blue-400',
    epic: 'border-purple-400 bg-purple-400/10 text-purple-400',
    legendary: 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
  };

  const rarityGradients = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🏆 Galerie des Badges</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {getUnlockedBadges().length}
            </div>
            <div className="text-sm text-gray-400">Débloqués</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {getLockedBadges().length}
            </div>
            <div className="text-sm text-gray-400">Verrouillés</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {badges.length}
            </div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((getUnlockedBadges().length / badges.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Complété</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4">
          {/* Filtre catégorie */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Toutes les catégories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Filtre rareté */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'Toutes les raretés' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </option>
            ))}
          </select>

          {/* Toggle débloqués seulement */}
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span>Débloqués seulement</span>
          </label>
        </div>
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredBadges.map((badge, index) => {
            const isUnlocked = isBadgeUnlocked(badge.id);
            const progress = getBadgeProgress(badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`
                  relative bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300
                  border-2 ${isUnlocked ? rarityColors[badge.rarity] : 'border-gray-600'}
                  ${isUnlocked ? 'shadow-lg' : 'opacity-75'}
                  hover:shadow-xl hover:border-blue-500
                `}
                onClick={() => setSelectedBadge(badge)}
              >
                {/* Badge rareté */}
                <div className={`
                  absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold
                  ${rarityColors[badge.rarity]}
                `}>
                  {badge.rarity.toUpperCase()}
                </div>

                {/* Icône */}
                <div className="text-center mb-4">
                  <div className={`
                    text-6xl mb-2 transition-all duration-300
                    ${isUnlocked ? '' : 'grayscale brightness-50'}
                  `}>
                    {badge.icon}
                  </div>
                  
                  {isUnlocked && (
                    <div className="text-green-400 text-lg">✓</div>
                  )}
                </div>

                {/* Nom */}
                <h3 className={`
                  text-lg font-bold text-center mb-2
                  ${isUnlocked ? 'text-white' : 'text-gray-500'}
                `}>
                  {badge.name}
                </h3>

                {/* Description */}
                <p className={`
                  text-sm text-center mb-4 line-clamp-2
                  ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {badge.description}
                </p>

                {/* Progression ou XP */}
                {isUnlocked ? (
                  <div className="text-center">
                    <span className="text-yellow-400 font-bold">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                ) : progress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progression</span>
                      <span className="text-gray-400">
                        {progress.current}/{progress.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${rarityGradients[badge.rarity]}`}
                      />
                    </div>
                    <div className="text-center text-xs text-gray-400">
                      {progress.percentage}% complété
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">Verrouillé</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={`
                bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4
                border-2 ${isBadgeUnlocked(selectedBadge.id) ? rarityColors[selectedBadge.rarity] : 'border-gray-600'}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-8xl mb-4">{selectedBadge.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedBadge.name}
                </h2>
                <div className={`
                  inline-block px-3 py-1 rounded-full text-sm font-bold mb-4
                  ${rarityColors[selectedBadge.rarity]}
                `}>
                  {selectedBadge.rarity.toUpperCase()}
                </div>
                <p className="text-gray-300 mb-6">
                  {selectedBadge.description}
                </p>
                
                {isBadgeUnlocked(selectedBadge.id) ? (
                  <div className="space-y-2">
                    <div className="text-green-400 text-lg font-bold">✓ Débloqué</div>
                    <div className="text-yellow-400">+{selectedBadge.xpReward} XP obtenus</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-gray-400">Conditions :</div>
                    <div className="text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3">
                      {selectedBadge.condition}
                    </div>
                    <div className="text-yellow-400">
                      Récompense : +{selectedBadge.xpReward} XP
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message si aucun badge */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">
            Aucun badge trouvé
          </h3>
          <p className="text-gray-500">
            Essayez de modifier vos filtres
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeGallery;
