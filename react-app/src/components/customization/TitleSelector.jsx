// ==========================================
// react-app/src/components/customization/TitleSelector.jsx
// SELECTEUR DE TITRE - SYNERGIA v4.0
// Module 13: Personnalisation Profil
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Award
} from 'lucide-react';

const TitleSelector = ({
  titles,
  titlesByCategory,
  selectedTitle,
  onSelect,
  updating = false,
  compact = false
}) => {
  const [expandedCategory, setExpandedCategory] = useState('level');

  const handleSelect = async (title) => {
    if (!title.isUnlocked || updating) return;
    await onSelect(title.id);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const categoryOrder = ['base', 'level', 'special'];
  const categoryIcons = {
    base: '📝',
    level: '🎖️',
    special: '🌟'
  };

  if (compact) {
    // Version compacte
    const unlockedTitles = titles.filter(t => t.isUnlocked);
    const currentTitle = titles.find(t => t.id === selectedTitle);

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Titre actuel
        </h4>
        {currentTitle && (
          <div className={`px-3 py-2 rounded-lg border ${currentTitle.bgColor} ${currentTitle.borderColor}`}>
            <span className={`font-semibold ${currentTitle.color}`}>
              {currentTitle.name}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-500">
          {unlockedTitles.length}/{titles.length} titres debloques
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryOrder.map((categoryId) => {
        const category = titlesByCategory[categoryId];
        if (!category || category.items.length === 0) return null;

        const isExpanded = expandedCategory === categoryId;
        const unlockedCount = category.items.filter(t => t.isUnlocked).length;

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
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
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
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.items.map((title) => (
                      <motion.button
                        key={title.id}
                        onClick={() => handleSelect(title)}
                        disabled={!title.isUnlocked || updating}
                        whileHover={title.isUnlocked ? { scale: 1.02 } : {}}
                        whileTap={title.isUnlocked ? { scale: 0.98 } : {}}
                        className={`
                          relative p-4 rounded-xl text-left
                          border-2 transition-all
                          ${!title.isUnlocked
                            ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
                            : selectedTitle === title.id
                              ? 'border-yellow-400 shadow-lg shadow-yellow-400/20 bg-yellow-500/10'
                              : `${title.bgColor} ${title.borderColor} hover:bg-white/10`
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Award className={`w-5 h-5 ${title.isUnlocked ? title.color : 'text-gray-500'}`} />
                            <div>
                              <p className={`font-bold ${title.isUnlocked ? title.color : 'text-gray-500'}`}>
                                {title.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {title.unlockDescription}
                              </p>
                            </div>
                          </div>

                          {/* Badge selectionne */}
                          {selectedTitle === title.id && title.isUnlocked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-black" />
                            </motion.div>
                          )}

                          {/* Cadenas */}
                          {!title.isUnlocked && (
                            <div className="flex flex-col items-end">
                              <Lock className="w-4 h-4 text-gray-500" />
                              {title.progress && title.progress.percent < 100 && (
                                <div className="mt-1 w-16">
                                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500"
                                      style={{ width: `${title.progress.percent}%` }}
                                    />
                                  </div>
                                  <p className="text-[9px] text-gray-500 text-right mt-0.5">
                                    {title.progress.current}/{title.progress.target}
                                  </p>
                                </div>
                              )}
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

export default TitleSelector;
