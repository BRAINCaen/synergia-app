// ==========================================
// SYNERGIA v4.0 - Customization Components
// Module 13: Personnalisation Profil
// ==========================================

// Composants existants
export { default as AvatarSelector } from './AvatarSelector.jsx';
export { default as TitleSelector } from './TitleSelector.jsx';
export { default as BannerSelector } from './BannerSelector.jsx';

// Nouveau systeme Avatar Builder
export { default as AvatarBuilder, AvatarPreview, ItemSelector } from './AvatarBuilder.jsx';

// Re-exports des definitions
export {
  CHARACTER_CLASSES,
  COLOR_VARIANTS,
  HEADGEAR,
  WEAPONS,
  COMPANIONS,
  EFFECTS,
  EMBLEMS,
  BACKGROUNDS,
  isUnlocked,
  getUnlockText,
  getUnlockProgress,
  getCategoryItems,
  getUnlockStats,
  DEFAULT_AVATAR_CONFIG
} from '../../core/services/avatarDefinitions.js';
