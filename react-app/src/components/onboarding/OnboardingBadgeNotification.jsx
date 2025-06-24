// react-app/src/components/onboarding/OnboardingBadgeNotification.jsx

import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, Zap } from 'lucide-react';
import { ONBOARDING_BADGES } from '../../core/services/onboardingService';

const OnboardingBadgeNotification = ({ 
  badgeId, 
  xpEarned = 0, 
  questTitle = '',
  isVisible, 
  onClose 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const badge = badgeId ? ONBOARDING_BADGES[badgeId] : null;

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setShowDetails(true);
      
      // Auto-close après 5 secondes
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowDetails(false);
      onClose?.();
    }, 300);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          glow: 'shadow-orange-500/50',
          text: 'text-yellow-100'
        };
      case 'epic':
        return {
          gradient: 'from-purple-400 via-pink-500 to-purple-600',
          glow: 'shadow-purple-500/50',
          text: 'text-purple-100'
        };
      case 'rare':
        return {
          gradient: 'from-blue-400 via-cyan-500 to-blue-600',
          glow: 'shadow-blue-500/50',
          text: 'text-blue-100'
        };
      case 'uncommon':
        return {
          gradient: 'from-green-400 via-emerald-500 to-green-600',
          glow: 'shadow-green-500/50',
          text: 'text-green-100'
        };
      default:
        return {
          gradient: 'from-gray-400 via-gray-500 to-gray-600',
          glow: 'shadow-gray-500/50',
          text: 'text-gray-100'
        };
    }
  };

  if (!isVisible || !showDetails) return null;

  const rarityColors = badge ? getRarityColor(badge.rarity) : getRarityColor('common');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-60' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Notification */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-500 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-90 opacity-0 translate-y-8'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header avec animation */}
        <div className={`bg-gradient-to-r ${rarityColors.gradient} p-6 text-center relative overflow-hidden`}>
          {/* Particules animées */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className={`text-6xl mb-3 animate-bounce ${rarityColors.text}`}>
              🎉
            </div>
            <h2 className={`text-2xl font-bold ${rarityColors.text} mb-2`}>
              {badge ? 'Nouveau Badge !' : 'Quête Terminée !'}
            </h2>
            
            {questTitle && (
              <p className={`text-sm ${rarityColors.text} opacity-90`}>
                {questTitle}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {badge && (
            <div className="text-center mb-6">
              {/* Badge */}
              <div 
                className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg ${rarityColors.glow} animate-pulse`}
                style={{ 
                  backgroundColor: `${badge.color}20`,
                  border: `3px solid ${badge.color}60`
                }}
              >
                {badge.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {badge.name}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {badge.description}
              </p>
              
              {/* Rarity indicator */}
              <div className="mt-4">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${rarityColors.gradient}`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* XP Reward */}
          {xpEarned > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-bold">
                  +{xpEarned} XP Gagnés !
                </span>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleClose}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors bg-gradient-to-r ${rarityColors.gradient} hover:opacity-90`}
          >
            Continuer l'aventure !
          </button>
        </div>

        {/* Celebration effects */}
        <div className="absolute -inset-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['✨', '🌟', '⭐', '💫'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingBadgeNotification;
