// ==========================================
// react-app/src/components/customization/BannerSelector.jsx
// SELECTEUR DE BANNIERE - SYNERGIA v4.0
// Module 13: Personnalisation Profil
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  Image,
  Sparkles
} from 'lucide-react';

// Composant pour les patterns de banniere
const BannerPattern = ({ pattern, className = '' }) => {
  if (!pattern) return null;

  switch (pattern) {
    case 'stars':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      );
    case 'sparkles':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute w-3 h-3 text-yellow-300/40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      );
    case 'waves':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <svg className="absolute bottom-0 w-full h-8 opacity-20" viewBox="0 0 100 20">
            <path
              d="M0 20 Q25 10 50 15 T100 10 L100 20 Z"
              fill="currentColor"
              className="text-white"
            />
          </svg>
        </div>
      );
    case 'aurora':
      return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-green-400/20 via-transparent to-transparent animate-pulse" />
        </div>
      );
    default:
      return null;
  }
};

const BannerSelector = ({
  banners,
  bannersByCategory,
  selectedBanner,
  onSelect,
  updating = false,
  compact = false
}) => {
  const [expandedCategory, setExpandedCategory] = useState('base');

  const handleSelect = async (banner) => {
    if (!banner.isUnlocked || updating) return;
    await onSelect(banner.id);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const categoryOrder = ['base', 'level', 'special'];
  const categoryIcons = {
    base: '🎨',
    level: '🏔️',
    special: '🌈'
  };

  if (compact) {
    // Version compacte - apercu de la banniere actuelle
    const currentBanner = banners.find(b => b.id === selectedBanner);
    const unlockedBanners = banners.filter(b => b.isUnlocked);

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Banniere ({unlockedBanners.length}/{banners.length})
        </h4>
        {currentBanner && (
          <div className={`relative h-12 rounded-lg bg-gradient-to-r ${currentBanner.gradient} overflow-hidden`}>
            <BannerPattern pattern={currentBanner.pattern} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white/70 font-medium">
                {currentBanner.name}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryOrder.map((categoryId) => {
        const category = bannersByCategory[categoryId];
        if (!category || category.items.length === 0) return null;

        const isExpanded = expandedCategory === categoryId;
        const unlockedCount = category.items.filter(b => b.isUnlocked).length;

        return (
          <div
            key={categoryId}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Header categorie */}
            <button
              onClick={() => toggleCategory(categoryId)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{categoryIcons[categoryId]}</span>
                <div className="text-left">
                  <h4 className="font-semibold text-white">{category.label}</h4>
                  <p className="text-xs text-gray-400">
                    {unlockedCount}/{category.items.length} debloquees
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${(unlockedCount / category.items.length) * 100}%` }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Contenu */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map((banner) => (
                      <motion.button
                        key={banner.id}
                        onClick={() => handleSelect(banner)}
                        disabled={!banner.isUnlocked || updating}
                        whileHover={banner.isUnlocked ? { scale: 1.02 } : {}}
                        whileTap={banner.isUnlocked ? { scale: 0.98 } : {}}
                        className={`
                          relative rounded-xl overflow-hidden
                          border-2 transition-all
                          ${!banner.isUnlocked
                            ? 'border-gray-700 opacity-60 cursor-not-allowed'
                            : selectedBanner === banner.id
                              ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
                              : 'border-white/20 hover:border-white/40'
                          }
                        `}
                      >
                        {/* Apercu de la banniere */}
                        <div
                          className={`
                            relative h-24 bg-gradient-to-r ${banner.gradient}
                            ${!banner.isUnlocked ? 'grayscale' : ''}
                          `}
                        >
                          <BannerPattern pattern={banner.pattern} />

                          {/* Overlay avec nom */}
                          <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                            <div className="flex-1">
                              <p className={`font-bold ${banner.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                {banner.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {banner.unlockDescription}
                              </p>
                            </div>

                            {/* Badge selectionne */}
                            {selectedBanner === banner.id && banner.isUnlocked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                              >
                                <Check className="w-5 h-5 text-black" />
                              </motion.div>
                            )}
                          </div>

                          {/* Cadenas si verrouille */}
                          {!banner.isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center">
                                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                {banner.progress && banner.progress.percent < 100 && (
                                  <div className="w-24 mx-auto">
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${banner.progress.percent}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {banner.progress.current}/{banner.progress.target}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default BannerSelector;
