// ==========================================
// react-app/src/components/ui/ThemeToggle.jsx
// COMPOSANT TOGGLE THEME - SYNERGIA v4.0
// Module 16: Mode Sombre/Clair
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../shared/hooks/useTheme.js';

/**
 * Toggle simple pour switcher entre dark/light
 */
export const ThemeToggleButton = ({ size = 'md', showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: { button: 'w-10 h-10', icon: 'w-4 h-4' },
    md: { button: 'w-12 h-12', icon: 'w-5 h-5' },
    lg: { button: 'w-14 h-14', icon: 'w-6 h-6' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${currentSize.button} rounded-xl flex items-center justify-center gap-2
        transition-all duration-300
        ${isDark
          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-yellow-300 shadow-lg shadow-purple-500/30'
          : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-500/30'
        }
        ${className}
      `}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className={currentSize.icon} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className={currentSize.icon} />
          </motion.div>
        )}
      </AnimatePresence>
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Sombre' : 'Clair'}
        </span>
      )}
    </motion.button>
  );
};

/**
 * Switch style iOS pour toggle dark/light
 */
export const ThemeSwitch = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full transition-colors duration-300
        ${isDark
          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
          : 'bg-gradient-to-r from-yellow-400 to-orange-400'
        }
        ${className}
      `}
    >
      {/* Icons de fond */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Moon className="w-4 h-4 text-white/50" />
        <Sun className="w-4 h-4 text-white/50" />
      </div>

      {/* Toggle circle */}
      <motion.div
        initial={false}
        animate={{
          x: isDark ? 2 : 34
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-purple-600" />
        ) : (
          <Sun className="w-3 h-3 text-orange-500" />
        )}
      </motion.div>
    </button>
  );
};

/**
 * Selecteur de theme complet avec dropdown (dark/light/system)
 */
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme, THEMES, THEME_COLORS } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { id: THEMES.dark, name: 'Sombre', icon: Moon, emoji: '🌙' },
    { id: THEMES.light, name: 'Clair', icon: Sun, emoji: '☀️' },
    { id: THEMES.system, name: 'Systeme', icon: Monitor, emoji: '💻' }
  ];

  const currentOption = themeOptions.find(opt => opt.id === theme) || themeOptions[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
          ${theme === THEMES.dark
            ? 'bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50'
            : theme === THEMES.light
              ? 'bg-white/80 border-gray-200 text-gray-900 hover:bg-gray-100'
              : 'bg-gray-800/50 border-purple-500/30 text-purple-300 hover:bg-gray-700/50'
          }
        `}
      >
        <currentOption.icon className="w-5 h-5" />
        <span className="font-medium">{currentOption.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`
                absolute top-full left-0 right-0 mt-2 z-50
                rounded-xl border shadow-xl overflow-hidden
                ${theme === THEMES.light
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-800 border-gray-700'
                }
              `}
            >
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTheme(option.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 transition-colors
                      ${isSelected
                        ? theme === THEMES.light
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-purple-500/20 text-purple-300'
                        : theme === THEMES.light
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.name}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-purple-500 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Carte de selection de theme pour les parametres
 */
export const ThemeCard = ({ className = '' }) => {
  const { theme, setTheme, isDark, THEMES } = useTheme();

  const themeOptions = [
    {
      id: THEMES.dark,
      name: 'Sombre',
      emoji: '🌙',
      description: 'Reduit la fatigue oculaire',
      gradient: 'from-slate-800 to-purple-900',
      preview: 'bg-slate-900'
    },
    {
      id: THEMES.light,
      name: 'Clair',
      emoji: '☀️',
      description: 'Theme lumineux classique',
      gradient: 'from-gray-100 to-purple-100',
      preview: 'bg-white'
    },
    {
      id: THEMES.system,
      name: 'Systeme',
      emoji: '💻',
      description: 'Suit les preferences OS',
      gradient: 'from-purple-600 to-blue-600',
      preview: 'bg-gradient-to-r from-slate-900 to-white'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {themeOptions.map((option) => {
        const isSelected = theme === option.id;

        return (
          <motion.button
            key={option.id}
            onClick={() => setTheme(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${isSelected
                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                : isDark
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* Preview */}
            <div className={`h-16 rounded-lg mb-3 bg-gradient-to-br ${option.gradient}`}>
              <div className={`h-full w-full rounded-lg ${option.preview} opacity-50`} />
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{option.emoji}</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {option.name}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {option.description}
            </p>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Export par defaut
export default ThemeToggleButton;
