// ==========================================
// react-app/src/shared/hooks/useTheme.js
// HOOK THEME - SYNERGIA v4.0
// Module 16: Mode Sombre/Clair
// ==========================================

import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider.jsx';

/**
 * Hook pour utiliser le theme dans les composants
 *
 * @returns {Object} - theme, effectiveTheme, themeColors, isDark, isLight, setTheme, toggleTheme
 *
 * @example
 * const { isDark, toggleTheme, themeColors } = useTheme();
 *
 * return (
 *   <div className={themeColors.background}>
 *     <button onClick={toggleTheme}>
 *       {isDark ? 'Mode Clair' : 'Mode Sombre'}
 *     </button>
 *   </div>
 * );
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    // Valeurs par defaut si pas de provider
    console.warn('useTheme: ThemeProvider non trouve, utilisation des valeurs par defaut');
    return {
      theme: 'dark',
      effectiveTheme: 'dark',
      themeColors: {
        id: 'dark',
        name: 'Sombre',
        emoji: '🌙',
        background: 'from-slate-900 via-purple-900 to-slate-900',
        surface: 'bg-gray-800/50',
        surfaceHover: 'hover:bg-gray-700/50',
        border: 'border-gray-700/50',
        text: 'text-white',
        textMuted: 'text-gray-400',
        accent: 'purple'
      },
      isDark: true,
      isLight: false,
      isSystem: false,
      setTheme: () => {},
      toggleTheme: () => {},
      THEMES: { dark: 'dark', light: 'light', system: 'system' },
      THEME_COLORS: {}
    };
  }

  return context;
};

export default useTheme;
