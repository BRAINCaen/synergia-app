// ==========================================
// react-app/src/components/customization/AvatarSelector.jsx
// SELECTEUR D'AVATAR - SYNERGIA v4.0
// Module 13: Personnalisation Profil
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target
} from 'lucide-react';

const AvatarSelector = ({
  avatars,
  avatarsByCategory,
  selectedAvatar,
  onSelect,
  updating = false,
  compact = false
}) => {
  const [expandedCategory, setExpandedCategory] = useState('base');

  const handleSelect = async (avatar) => {
    if (!avatar.isUnlocked || updating) return;
    await onSelect(avatar.id);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const categoryOrder = ['base', 'level', 'xp', 'tasks', 'badges', 'special'];
  const categoryIcons = {
    base: '🎨',
    level: '📊',
    xp: '⚡',
    tasks: '✅',
    badges: '🏅',
    special: '✨'
  };

  if (compact) {
    // Version compacte pour sidebar
    const unlockedAvatars = avatars.filter(a => a.isUnlocked);
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Avatars ({unlockedAvatars.length}/{avatars.length})
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {unlockedAvatars.slice(0, 8).map((avatar) => (
            <motion.button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              disabled={updating}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-10 h-10 rounded-lg bg-gradient-to-br ${avatar.gradient}
                flex items-center justify-center text-lg
                border-2 transition-all
                ${selectedAvatar === avatar.id
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                  : 'border-white/20 hover:border-white/40'
                }
              `}
            >
              {avatar.emoji}
              {selectedAvatar === avatar.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryOrder.map((categoryId) => {
        const category = avatarsByCategory[categoryId];
        if (!category || category.items.length === 0) return null;

        const isExpanded = expandedCategory === categoryId;
        const unlockedCount = category.items.filter(a => a.isUnlocked).length;

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
                    {unlockedCount}/{category.items.length} debloques
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Barre de progression */}
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
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
                  <div className="p-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {category.items.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        onClick={() => handleSelect(avatar)}
                        disabled={!avatar.isUnlocked || updating}
                        whileHover={avatar.isUnlocked ? { scale: 1.05 } : {}}
                        whileTap={avatar.isUnlocked ? { scale: 0.95 } : {}}
                        className={`
                          relative aspect-square rounded-xl
                          flex flex-col items-center justify-center gap-1 p-2
                          border-2 transition-all
                          ${!avatar.isUnlocked
                            ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                            : selectedAvatar === avatar.id
                              ? 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                              : 'border-white/20 hover:border-white/40'
                          }
                        `}
                      >
                        {/* Avatar */}
                        <div
                          className={`
                            w-12 h-12 rounded-lg bg-gradient-to-br ${avatar.gradient}
                            flex items-center justify-center text-2xl
                            ${!avatar.isUnlocked ? 'grayscale' : ''}
                          `}
                        >
                          {avatar.emoji}
                        </div>

                        {/* Nom */}
                        <p className={`text-xs font-medium text-center line-clamp-1 ${
                          avatar.isUnlocked ? 'text-white' : 'text-gray-500'
                        }`}>
                          {avatar.name}
                        </p>

                        {/* Badge selectionne */}
                        {selectedAvatar === avatar.id && avatar.isUnlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-black" />
                          </motion.div>
                        )}

                        {/* Cadenas si verrouille */}
                        {!avatar.isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                            <div className="text-center">
                              <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                              <p className="text-[10px] text-gray-400 px-1">
                                {avatar.unlockDescription}
                              </p>
                              {/* Barre de progression */}
                              {avatar.progress && avatar.progress.percent < 100 && (
                                <div className="mt-1 px-2">
                                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-500"
                                      style={{ width: `${avatar.progress.percent}%` }}
                                    />
                                  </div>
                                  <p className="text-[9px] text-gray-500 mt-0.5">
                                    {avatar.progress.current}/{avatar.progress.target}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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

export default AvatarSelector;
