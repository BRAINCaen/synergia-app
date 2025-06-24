// ==========================================
// 📁 react-app/src/components/gamification/BadgeGallery.jsx
// Galerie complète des badges avec progression et filtres
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import BadgeEngine from '../../core/services/badgeEngine.js';

/**
 * 🏆 GALERIE DE BADGES INTERACTIVE
 * 
 * Affiche tous les badges disponibles avec:
 * - Progression vers les badges non débloqués
 * - Filtres par catégorie et rareté
 * - Tooltips détaillés
 * - Animations et effets visuels
 */
const BadgeGallery = () => {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBadgeData();
    }
  }, [user]);

  /**
   * 📊 CHARGER LES DONNÉES DES BADGES
   */
  const loadBadgeData = async () => {
    try {
      setLoading(true);
      
      // Obtenir tous les badges disponibles
      const allBadges = BadgeEngine.getAllBadges();
      setBadges(allBadges);

      // Obtenir les analytics utilisateur pour déterminer les badges débloqués
      const userData = await BadgeEngine.getUserAnalytics(user.uid);
      setUserBadges(userData.badges || []);

      // Calculer la progression pour chaque badge non débloqué
      const progressData = {};
      for (const badge of allBadges) {
        if (!userData.badges?.includes(badge.id)) {
          const progress = await BadgeEngine.getBadgeProgress(badge.id, user.uid);
          if (progress) {
            progressData[badge.id] = progress;
          }
        }
      }
      setBadgeProgress(progressData);

    } catch (error) {
      console.error('❌ Erreur loadBadgeData:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 FILTRER LES BADGES
   */
  const getFilteredBadges = () => {
    let filtered = badges;

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === selectedCategory);
    }

    // Filtre par rareté
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(badge => badge.rarity === selectedRarity);
    }

    // Filtre débloqués uniquement
    if (showUnlockedOnly) {
      filtered = filtered.filter(badge => userBadges.includes(badge.id));
    }

    return filtered;
  };

  /**
   * 🎨 OBTENIR LE STYLE SELON LA RARETÉ
   */
  const getRarityStyle = (rarity, isUnlocked) => {
    const baseClasses = "rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:scale-105";
    
    if (!isUnlocked) {
      return `${baseClasses} border-gray-300 bg-gray-100 opacity-60`;
    }

    const rarityStyles = {
      common: `${baseClasses} border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-200`,
      uncommon: `${baseClasses} border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-green-200`,
      rare: `${baseClasses} border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-200`,
      epic: `${baseClasses} border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 shadow-purple-200`,
      legendary: `${baseClasses} border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-200 animate-pulse`
    };

    return rarityStyles[rarity] || rarityStyles.common;
  };

  /**
   * 📈 OBTENIR LES STATISTIQUES GLOBALES
   */
  const getStats = () => {
    const unlockedCount = userBadges.length;
    const totalCount = badges.length;
    const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    const rarityStats = badges.reduce((acc, badge) => {
      const isUnlocked = userBadges.includes(badge.id);
      if (!acc[badge.rarity]) {
        acc[badge.rarity] = { total: 0, unlocked: 0 };
      }
      acc[badge.rarity].total++;
      if (isUnlocked) acc[badge.rarity].unlocked++;
      return acc;
    }, {});

    return { unlockedCount, totalCount, percentage, rarityStats };
  };

  /**
   * 📂 OBTENIR LES CATÉGORIES DISPONIBLES
   */
  const getCategories = () => {
    const categories = [...new Set(badges.map(badge => badge.category))];
    return categories.sort();
  };

  /**
   * 💎 OBTENIR LES RARETÉS DISPONIBLES
   */
  const getRarities = () => {
    const rarities = [...new Set(badges.map(badge => badge.rarity))];
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return rarities.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  };

  const filteredBadges = getFilteredBadges();
  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Chargement des badges...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 STATISTIQUES GLOBALES */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🏆 Collection de Badges
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {stats.unlockedCount}/{stats.totalCount}
            </div>
            <div className="text-sm text-gray-500">
              {stats.percentage}% débloqués
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>

        {/* Statistiques par rareté */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats.rarityStats).map(([rarity, data]) => {
            const rarityEmojis = {
              common: '⚪',
              uncommon: '🟢',
              rare: '🔵',
              epic: '🟣',
              legendary: '🟡'
            };
            
            return (
              <div key={rarity} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">{rarityEmojis[rarity]}</div>
                <div className="text-sm font-medium capitalize text-gray-700">
                  {rarity}
                </div>
                <div className="text-xs text-gray-500">
                  {data.unlocked}/{data.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔍 FILTRES */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par rareté */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rareté
            </label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les raretés</option>
              {getRarities().map(rarity => (
                <option key={rarity} value={rarity}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle débloqués uniquement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affichage
            </label>
            <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Débloqués uniquement</span>
            </label>
          </div>

          {/* Bouton reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRarity('all');
                setShowUnlockedOnly(false);
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* 🏆 GRILLE DES BADGES */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Badges ({filteredBadges.length})
          </h3>
          <button
            onClick={loadBadgeData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>

        {filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">Aucun badge trouvé avec ces filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBadges.map(badge => {
              const isUnlocked = userBadges.includes(badge.id);
              const progress = badgeProgress[badge.id];

              return (
                <div
                  key={badge.id}
                  className={getRarityStyle(badge.rarity, isUnlocked)}
                  title={badge.description}
                >
                  <div className="p-4">
                    {/* En-tête du badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full capitalize
                          ${badge.rarity === 'common' ? 'bg-gray-200 text-gray-700' : ''}
                          ${badge.rarity === 'uncommon' ? 'bg-green-200 text-green-700' : ''}
                          ${badge.rarity === 'rare' ? 'bg-blue-200 text-blue-700' : ''}
                          ${badge.rarity === 'epic' ? 'bg-purple-200 text-purple-700' : ''}
                          ${badge.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-700' : ''}
                        `}>
                          {badge.rarity}
                        </span>
                        {isUnlocked && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            ✅ Débloqué
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nom et description */}
                    <div className="mb-3">
                      <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-xs ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                    </div>

                    {/* XP Reward */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${isUnlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                        +{badge.xpReward} XP
                      </span>
                      <span className={isUnlocked ? 'text-yellow-500' : 'text-gray-300'}>⭐</span>
                    </div>

                    {/* Barre de progression pour les badges non débloqués */}
                    {!isUnlocked && progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progression</span>
                          <span>{progress.current}/{progress.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-center text-gray-500">
                          {progress.percentage}% complété
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeGallery;
