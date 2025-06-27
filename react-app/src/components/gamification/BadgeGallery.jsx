// ==========================================
// 📁 react-app/src/components/gamification/BadgeGallery.jsx  
// Galerie complète des badges avec filtres et animations
// ==========================================

import React, { useState } from 'react';
import { Trophy, Award, Star, Lock, Unlock, Target, Filter, Grid, List, Search, Eye, EyeOff } from 'lucide-react';
import { useBadges } from '../../shared/hooks/useBadges.js';

/**
 * 🏆 COMPOSANT BADGE CARD
 * Carte individuelle pour chaque badge avec animations
 */
const BadgeCard = ({ badge, isUnlocked, progress, onClick }) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600', 
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  const rarityBorder = {
    common: 'border-gray-400',
    uncommon: 'border-green-400',
    rare: 'border-blue-400', 
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  };

  const progressPercentage = progress ? Math.round((progress.current / progress.required) * 100) : 0;

  return (
    <div 
      onClick={() => onClick(badge)}
      className={`
        relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10
        bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 p-6 shadow-lg
        ${isUnlocked ? rarityBorder[badge.rarity] + ' shadow-lg' : 'border-gray-300 opacity-75'}
        ${isUnlocked ? 'hover:shadow-2xl' : 'hover:opacity-90'}
      `}
    >
      {/* Badge d'état et rareté */}
      <div className="absolute top-3 right-3 flex space-x-2">
        {isUnlocked ? (
          <div className={`
            px-2 py-1 rounded-full text-xs font-bold text-white
            bg-gradient-to-r ${rarityColors[badge.rarity]}
          `}>
            {badge.rarity.toUpperCase()}
          </div>
        ) : (
          <div className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
            VERROUILLÉ
          </div>
        )}
      </div>

      {/* Icône du badge */}
      <div className="text-center mb-4">
        <div className={`
          w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl
          transition-all duration-300 group-hover:scale-110
          ${isUnlocked 
            ? `bg-gradient-to-br ${rarityColors[badge.rarity]} text-white shadow-lg` 
            : 'bg-gray-200 text-gray-400'
          }
        `}>
          {isUnlocked ? (
            <span className="animate-pulse">{badge.icon || '🏆'}</span>
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>
      </div>

      {/* Nom du badge */}
      <h3 className={`
        text-lg font-bold text-center mb-2
        ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}
      `}>
        {badge.name}
      </h3>

      {/* Description */}
      <p className={`
        text-sm text-center mb-4 h-10 line-clamp-2
        ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}
      `}>
        {badge.description}
      </p>

      {/* Récompense XP */}
      <div className={`
        flex items-center justify-center space-x-2 mb-4 p-2 rounded-lg
        ${isUnlocked ? 'bg-yellow-50' : 'bg-gray-100'}
      `}>
        <Star className={`w-4 h-4 ${isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
        <span className={`font-bold text-sm ${isUnlocked ? 'text-yellow-700' : 'text-gray-500'}`}>
          +{badge.xpReward || badge.xp || 25} XP
        </span>
      </div>

      {/* Barre de progression pour badges non débloqués */}
      {!isUnlocked && progress && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${rarityColors[badge.rarity]} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          {progress.current !== undefined && progress.required !== undefined && (
            <div className="text-xs text-gray-500 mt-1 text-center">
              {progress.current} / {progress.required}
            </div>
          )}
        </div>
      )}

      {/* Date de déblocage */}
      {isUnlocked && badge.unlockedAt && (
        <div className="text-xs text-gray-500 text-center">
          Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
        </div>
      )}

      {/* Effet de brillance pour badges débloqués */}
      {isUnlocked && (
        <div className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300
          bg-gradient-to-br ${rarityColors[badge.rarity]}
        `} />
      )}
    </div>
  );
};

/**
 * 🎯 MODAL DÉTAILS BADGE
 */
const BadgeModal = ({ badge, isUnlocked, progress, onClose }) => {
  if (!badge) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600', 
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Bouton fermer */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Contenu */}
        <div className="text-center">
          {/* Icône grande */}
          <div className={`
            w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4
            ${isUnlocked 
              ? `bg-gradient-to-br ${rarityColors[badge.rarity]} text-white shadow-lg` 
              : 'bg-gray-200 text-gray-400'
            }
          `}>
            {isUnlocked ? badge.icon || '🏆' : <Lock className="w-10 h-10" />}
          </div>

          {/* Nom et rareté */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{badge.name}</h2>
          <div className={`
            inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-4
            bg-gradient-to-r ${rarityColors[badge.rarity]}
          `}>
            {badge.rarity.toUpperCase()}
          </div>

          {/* Description détaillée */}
          <p className="text-gray-600 mb-6">{badge.description}</p>

          {/* Conditions de déblocage */}
          {badge.condition && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Comment débloquer :</h4>
              <p className="text-blue-700 text-sm">{badge.condition}</p>
            </div>
          )}

          {/* Progression ou récompense */}
          {isUnlocked ? (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Unlock className="w-5 h-5" />
                <span className="font-semibold">Badge débloqué !</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold">+{badge.xpReward || badge.xp || 25} XP</span>
              </div>
            </div>
          ) : progress ? (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Progression :</h4>
              <div className="w-full bg-yellow-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r ${rarityColors[badge.rarity]} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
                />
              </div>
              <div className="text-yellow-700 text-sm">
                {progress.current} / {progress.required} ({Math.round((progress.current / progress.required) * 100)}%)
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Lock className="w-5 h-5" />
                <span>Badge verrouillé</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 🏆 COMPOSANT PRINCIPAL BADGE GALLERY
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des badges
  const filteredBadges = badges?.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
    if (showOnlyUnlocked && !isBadgeUnlocked(badge.id)) return false;
    if (searchTerm && !badge.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const categories = ['all', ...new Set(badges?.map(badge => badge.category).filter(Boolean) || [])];
  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Chargement des badges...</span>
      </div>
    );
  }

  const unlockedCount = getUnlockedBadges()?.length || 0;
  const totalCount = badges?.length || 0;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            Galerie des Badges
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold">{unlockedCount}/{totalCount}</div>
            <div className="text-purple-200 text-sm">Badges débloqués</div>
          </div>
        </div>
        
        {/* Barre de progression globale */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression générale</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-purple-400 bg-opacity-30 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Statistiques par rareté */}
        <div className="grid grid-cols-5 gap-4 text-center">
          {rarities.slice(1).map(rarity => {
            const rarityBadges = getBadgesByRarity(rarity);
            const unlockedInRarity = rarityBadges.filter(b => isBadgeUnlocked(b.id)).length;
            return (
              <div key={rarity} className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-lg font-bold">{unlockedInRarity}/{rarityBadges.length}</div>
                <div className="text-xs opacity-80 capitalize">{rarity}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contrôles et filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Barre de recherche */}
          <div className="relative flex-1 min-w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un badge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mode d'affichage */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Filtre catégorie */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Toutes les catégories' : category.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Filtre rareté */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'Toutes les raretés' : rarity.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Toggle débloqués seulement */}
          <button
            onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
              ${showOnlyUnlocked 
                ? 'bg-green-500 text-white border-green-500' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {showOnlyUnlocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Débloqués seulement</span>
          </button>

          {/* Compteur de résultats */}
          <div className="text-sm text-gray-500">
            {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} affiché{filteredBadges.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Grille des badges */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }
      `}>
        {filteredBadges.map((badge) => {
          const isUnlocked = isBadgeUnlocked(badge.id);
          const progress = getBadgeProgress(badge.id);
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={isUnlocked}
              progress={progress}
              onClick={setSelectedBadge}
            />
          );
        })}
      </div>

      {/* Message si aucun badge trouvé */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun badge trouvé</h3>
          <p className="text-gray-500">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}

      {/* Modal détails badge */}
      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          isUnlocked={isBadgeUnlocked(selectedBadge.id)}
          progress={getBadgeProgress(selectedBadge.id)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default BadgeGallery;
