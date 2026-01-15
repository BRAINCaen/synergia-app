// ==========================================
// shared/themes/ThemeSelector.jsx
// Sélecteur de thème pour les paramètres admin
// Gaming RPG | Corporate | Startup Tech
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useThemePreset } from './ThemePresetContext.jsx';
import { THEME_LIST } from './themePresets.js';

/**
 * Sélecteur de thème complet pour les paramètres admin
 */
export const ThemeSelector = ({ onChangeSuccess }) => {
  const { themeId, setTheme, isChanging } = useThemePreset();
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const handleThemeChange = async (newThemeId) => {
    if (newThemeId === themeId || isChanging) return;

    await setTheme(newThemeId);

    if (onChangeSuccess) {
      onChangeSuccess(newThemeId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Style de l'Application</h3>
          <p className="text-gray-400 text-sm">
            Changez l'apparence et le vocabulaire de Synergia en un clic
          </p>
        </div>
      </div>

      {/* Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THEME_LIST.map((theme) => {
          const isSelected = themeId === theme.id;
          const isHovered = hoveredTheme === theme.id;

          return (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              disabled={isChanging}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
              } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Badge sélectionné */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading indicator */}
              {isChanging && hoveredTheme === theme.id && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              )}

              {/* Icon */}
              <div className="text-5xl mb-4">{theme.icon}</div>

              {/* Title */}
              <h4 className="text-lg font-bold text-white mb-2">{theme.name}</h4>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{theme.description}</p>

              {/* Color Preview */}
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-lg shadow-inner"
                  style={{ backgroundColor: theme.preview.primary }}
                  title="Couleur primaire"
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-inner"
                  style={{ backgroundColor: theme.preview.secondary }}
                  title="Couleur secondaire"
                />
                <div
                  className="w-8 h-8 rounded-lg shadow-inner"
                  style={{ backgroundColor: theme.preview.accent }}
                  title="Couleur accent"
                />
              </div>

              {/* Vocabulary Preview */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Aperçu du vocabulaire :</p>
                <div className="flex flex-wrap gap-2">
                  {theme.id === 'gaming' && (
                    <>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">Quêtes</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">XP</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Guilde</span>
                    </>
                  )}
                  {theme.id === 'corporate' && (
                    <>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Tâches</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Points</span>
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">Équipe</span>
                    </>
                  )}
                  {theme.id === 'startup' && (
                    <>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">Sprints</span>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">Impact</span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">Squad</span>
                    </>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="text-blue-300 font-medium">Changement instantané</p>
            <p className="text-blue-200/70 text-sm">
              Le thème est appliqué immédiatement à toute l'application pour tous les utilisateurs.
              Les données et fonctionnalités restent identiques, seul l'aspect visuel et le vocabulaire changent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Mini sélecteur pour intégration rapide
 */
export const ThemeSelectorMini = ({ className = '' }) => {
  const { themeId, setTheme, theme, isChanging } = useThemePreset();

  return (
    <div className={`flex gap-2 ${className}`}>
      {THEME_LIST.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          disabled={isChanging}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
            themeId === t.id
              ? 'bg-purple-500 shadow-lg scale-110'
              : 'bg-gray-700 hover:bg-gray-600'
          } ${isChanging ? 'opacity-50' : ''}`}
          title={t.name}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
