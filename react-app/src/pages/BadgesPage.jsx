// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC PREMIUMLAYOUT ET MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Crown, Medal, Shield, Lock, CheckCircle } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useBadges } from '../shared/hooks/useBadges.js';

const BadgesPage = () => {
  const { badges, userBadges, stats, loading, error } = useBadges();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calcul des statistiques pour le header
  const headerStats = [
    { 
      label: "Badges débloqués", 
      value: userBadges?.length || 0, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Total badges", 
      value: badges?.length || 0, 
      icon: Trophy, 
      color: "text-yellow-400" 
    },
    { 
      label: "Progression", 
      value: `${Math.round((userBadges?.length || 0) / (badges?.length || 1) * 100)}%`, 
      icon: Star, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges rares", 
      value: userBadges?.filter(b => b.rarity === 'rare').length || 0, 
      icon: Crown, 
      color: "text-orange-400" 
    }
  ];

  // Actions du header
  const headerActions = (
    <PremiumButton variant="primary" icon={Trophy}>
      Voir tous les badges
    </PremiumButton>
  );

  // Fonction pour obtenir la couleur selon la rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  // Fonction pour vérifier si un badge est débloqué
  const isBadgeUnlocked = (badgeId) => {
    return userBadges?.some(ub => ub.badgeId === badgeId || ub.id === badgeId);
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Mes Badges"
        subtitle="Chargement de vos accomplissements..."
        icon={Trophy}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="Mes Badges"
        subtitle="Erreur lors du chargement"
        icon={Trophy}
      >
        <PremiumCard>
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-gray-400">Impossible de charger les badges. {error}</p>
          </div>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mes Badges"
      subtitle="Collection de vos accomplissements et réalisations"
      icon={Trophy}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres de catégories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {['all', 'unlocked', 'locked', 'rare'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {category === 'all' && 'Tous'}
              {category === 'unlocked' && 'Débloqués'}
              {category === 'locked' && 'Verrouillés'}
              {category === 'rare' && 'Rares'}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {badges?.map((badge, index) => {
          const isUnlocked = isBadgeUnlocked(badge.id);
          const shouldShow = 
            selectedCategory === 'all' ||
            (selectedCategory === 'unlocked' && isUnlocked) ||
            (selectedCategory === 'locked' && !isUnlocked) ||
            (selectedCategory === 'rare' && badge.rarity === 'rare');

          if (!shouldShow) return null;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PremiumCard className={`relative ${getRarityColor(badge.rarity)} border-2 ${
                isUnlocked ? 'hover:scale-105' : 'opacity-60'
              }`}>
                
                {/* Badge de statut */}
                <div className="absolute top-3 right-3">
                  {isUnlocked ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                {/* Contenu du badge */}
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${isUnlocked ? '' : 'grayscale'}`}>
                    {badge.icon || '🏆'}
                  </div>
                  
                  <h3 className={`font-semibold mb-2 ${
                    isUnlocked ? 'text-white' : 'text-gray-500'
                  }`}>
                    {badge.name || 'Badge'}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    isUnlocked ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {badge.description || 'Description du badge'}
                  </p>

                  {/* Rareté */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      badge.rarity === 'common' ? 'bg-gray-600 text-gray-200' :
                      badge.rarity === 'uncommon' ? 'bg-green-600 text-green-200' :
                      badge.rarity === 'rare' ? 'bg-blue-600 text-blue-200' :
                      badge.rarity === 'epic' ? 'bg-purple-600 text-purple-200' :
                      badge.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-200' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {badge.rarity || 'Commun'}
                    </div>
                  </div>

                  {/* Récompense XP */}
                  {badge.xpReward && (
                    <div className="mt-3 text-center">
                      <span className="text-yellow-400 text-sm font-semibold">
                        +{badge.xpReward} XP
                      </span>
                    </div>
                  )}

                  {/* Date de déblocage pour les badges débloqués */}
                  {isUnlocked && (
                    <div className="mt-3 text-center">
                      <span className="text-green-400 text-xs">
                        Débloqué !
                      </span>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          );
        })}
      </div>

      {/* Message si aucun badge */}
      {!badges || badges.length === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Trophy className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Aucun badge disponible</h3>
            <p className="text-gray-400">Les badges seront bientôt disponibles !</p>
          </div>
        </PremiumCard>
      )}

      {/* Progression générale */}
      {badges && badges.length > 0 && (
        <div className="mt-8">
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Progression générale</h3>
              <span className="text-blue-400 font-semibold">
                {userBadges?.length || 0} / {badges.length}
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.round((userBadges?.length || 0) / badges.length * 100)}%` 
                }}
              ></div>
            </div>
            
            <p className="text-gray-400 text-sm mt-2">
              Continuez à accomplir des tâches pour débloquer plus de badges !
            </p>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default BadgesPage;
