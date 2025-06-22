// ==========================================
// 📁 react-app/src/components/gamification/BadgeCollection.jsx
// Collection complète des badges avec animations
// ==========================================

import React, { useState, useEffect } from 'react';
import Card from '../../shared/components/ui/Card.jsx';
import badgeService from '../../services/badgeService.js';
import useUserStore from '../../shared/stores/userStore.js';

const BadgeCollection = () => {
  const { profile } = useUserStore();
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = {
    all: { name: 'Tous', icon: '🏆', color: 'from-purple-500 to-pink-500' },
    productivity: { name: 'Productivité', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    streaks: { name: 'Régularité', icon: '🔥', color: 'from-orange-500 to-red-500' },
    social: { name: 'Social', icon: '🤝', color: 'from-green-500 to-emerald-500' },
    special: { name: 'Spéciaux', icon: '✨', color: 'from-yellow-500 to-orange-500' },
    creative: { name: 'Créatifs', icon: '🎨', color: 'from-purple-500 to-indigo-500' }
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  useEffect(() => {
    loadBadgeData();
  }, [profile]);

  const loadBadgeData = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    // Charger tous les badges
    const allBadges = badgeService.getAllBadges();
    const userBadges = profile.gamification?.badges || [];
    const userBadgeIds = userBadges.map(b => b.id);
    
    // Marquer les badges débloqués
    const badgesWithStatus = allBadges.map(badge => ({
      ...badge,
      unlocked: userBadgeIds.includes(badge.id),
      unlockedAt: userBadges.find(b => b.id === badge.id)?.unlockedAt
    }));
    
    setBadges(badgesWithStatus);
    
    // Charger la progression
    const progressData = await badgeService.getBadgeProgress(profile.uid);
    setProgress(progressData);
    
    setLoading(false);
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const getProgressForBadge = (badgeId) => {
    return progress.find(p => p.id === badgeId);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <Card.Content>
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600">
        <Card.Content className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🏆 Collection de Badges
              </h2>
              <p className="text-purple-100">
                {badges.filter(b => b.unlocked).length} / {badges.length} badges débloqués
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {Math.round((badges.filter(b => b.unlocked).length / badges.length) * 100)}%
              </div>
              <div className="text-purple-200 text-sm">Complétion</div>
            </div>
          </div>
          
          {/* Barre de progression globale */}
          <div className="mt-4">
            <div className="w-full bg-purple-800/50 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Filtres par catégorie */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Grille des badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBadges.map((badge) => {
          const progressInfo = getProgressForBadge(badge.id);
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              progress={progressInfo}
              onClick={() => {/* Ouvrir modal de détails */}}
            />
          );
        })}
      </div>

      {/* Section des badges en cours */}
      {progress.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>🎯 Badges en Cours</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {progress.slice(0, 5).map((badgeProgress) => (
                <BadgeProgressItem key={badgeProgress.id} badge={badgeProgress} />
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

// Composant pour afficher un badge individuel
const BadgeCard = ({ badge, progress, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Card className={`h-full ${badge.unlocked ? '' : 'opacity-60'}`}>
        <Card.Content className="p-4 text-center">
          {/* Icône du badge */}
          <div className={`relative mb-3 ${badge.unlocked ? 'animate-pulse' : ''}`}>
            <div
              className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${
                rarityColors[badge.rarity]
              } flex items-center justify-center text-2xl font-bold shadow-lg`}
            >
              {badge.icon}
            </div>
            
            {/* Badge de rareté */}
            <div
              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${
                rarityColors[badge.rarity]
              } flex items-center justify-center text-xs font-bold text-white shadow-md`}
            >
              {badge.rarity === 'common' && '●'}
              {badge.rarity === 'uncommon' && '◆'}
              {badge.rarity === 'rare' && '★'}
              {badge.rarity === 'epic' && '♦'}
              {badge.rarity === 'legendary' && '👑'}
            </div>
            
            {/* Effet de brillance pour les badges débloqués */}
            {badge.unlocked && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
            )}
          </div>

          {/* Nom du badge */}
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
            {badge.name}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
            {badge.description}
          </p>

          {/* Progression ou statut */}
          {badge.unlocked ? (
            <div className="flex items-center justify-center space-x-1 text-green-400 text-xs">
              <span>✅</span>
              <span>Débloqué</span>
            </div>
          ) : progress ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{progress.current}</span>
                <span>{progress.target}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`bg-gradient-to-r ${rarityColors[badge.rarity]} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                {progress.progress}%
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-xs">🔒 Verrouillé</div>
          )}

          {/* Récompense XP */}
          <div className="mt-2 text-yellow-400 text-xs font-medium">
            +{badge.xpReward} XP
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

// Composant pour afficher la progression d'un badge
const BadgeProgressItem = ({ badge }) => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
      <div className="text-2xl">{badge.icon}</div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-white">{badge.name}</h4>
          <span className="text-sm text-gray-400">
            {badge.current} / {badge.target}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${badge.progress}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-bold text-white">{badge.progress}%</div>
        <div className="text-xs text-yellow-400">+{badge.xpReward} XP</div>
      </div>
    </div>
  );
};

export default BadgeCollection;

// ==========================================
// 📁 react-app/src/components/gamification/BadgeNotification.jsx
// Notification animée pour nouveaux badges
// ==========================================

import React, { useEffect, useState } from 'react';
import useGameStore from '../../shared/stores/gameStore.js';

const BadgeNotification = () => {
  const { notifications, markNotificationShown } = useGameStore();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher les notifications de badges non montrées
    const badgeNotifications = notifications.filter(
      n => n.type === 'badgeUnlocked' && !n.shown
    );

    if (badgeNotifications.length > 0 && !currentNotification) {
      const notification = badgeNotifications[0];
      setCurrentNotification(notification);
      setIsVisible(true);
      markNotificationShown(notification.id);

      // Masquer après 4 secondes
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setCurrentNotification(null), 300);
      }, 4000);
    }
  }, [notifications, currentNotification, markNotificationShown]);

  if (!currentNotification) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          {/* Animation de célébration */}
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
              {currentNotification.badge?.icon || '🏆'}
            </div>
            
            {/* Particules d'effet */}
            <div className="absolute inset-0 animate-ping">
              <div className="w-12 h-12 bg-yellow-400 rounded-full opacity-20"></div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-300 text-sm font-medium">✨ Nouveau Badge!</span>
            </div>
            <h3 className="text-white font-bold">{currentNotification.badge?.name}</h3>
            <p className="text-purple-100 text-sm">{currentNotification.badge?.description}</p>
            
            {currentNotification.badge?.xpReward && (
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-yellow-300 text-xs">+{currentNotification.badge.xpReward} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;

// ==========================================
// 📁 react-app/src/components/gamification/BadgeMiniDisplay.jsx
// Affichage compact des badges pour dashboard
// ==========================================

import React from 'react';
import useUserStore from '../../shared/stores/userStore.js';

const BadgeMiniDisplay = ({ limit = 6 }) => {
  const { profile } = useUserStore();
  
  if (!profile?.gamification?.badges) return null;

  const badges = profile.gamification.badges
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, limit);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">🏆 Badges Récents</h3>
        <span className="text-sm text-gray-400">
          {profile.gamification.badges.length} badges
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            title={badge.name}
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                rarityColors[badge.rarity] || rarityColors.common
              } flex items-center justify-center text-lg shadow-lg`}
            >
              {badge.icon || '🏆'}
            </div>
            
            {/* Tooltip au hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {badge.name}
            </div>
          </div>
        ))}
        
        {/* Bouton "Voir plus" */}
        {profile.gamification.badges.length > limit && (
          <div className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 cursor-pointer transition-colors duration-200">
            <span className="text-lg">+{profile.gamification.badges.length - limit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeMiniDisplay;
