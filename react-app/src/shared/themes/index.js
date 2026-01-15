// ==========================================
// shared/themes/index.js
// Export du système de thèmes Synergia
// ==========================================

export {
  GAMING_THEME,
  CORPORATE_THEME,
  STARTUP_THEME,
  THEME_PRESETS,
  DEFAULT_THEME,
  THEME_LIST,
  getThemeById,
  getVocabulary,
  getEmoji
} from './themePresets.js';

export {
  ThemePresetProvider,
  useThemePreset
} from './ThemePresetContext.jsx';

export {
  ThemeSelector,
  ThemeSelectorMini
} from './ThemeSelector.jsx';
