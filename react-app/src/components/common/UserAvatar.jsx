// ==========================================
// SYNERGIA v4.1 - Composant UserAvatar Universel
// Affiche l'avatar personnalisé en priorité sur la photo Google
// ==========================================

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import {
  UNLOCKABLE_AVATARS
} from '../../core/services/profileCustomizationService.js';
import {
  PIXEL_CLASSES,
  PIXEL_PALETTES,
  PIXEL_BACKGROUNDS,
  PixelArtAvatarPreview,
  DEFAULT_PIXEL_CONFIG,
  generatePixelCharacter
} from '../customization/PixelArtAvatar.jsx';

// ==========================================
// COMPOSANT USERAVATAR
// ==========================================
const UserAvatar = ({
  user,           // Objet utilisateur complet (avec gamification, customization, etc.)
  size = 'md',    // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showBorder = true,
  showAnimation = false,
  className = '',
  onClick = null,
  fallbackIcon = true  // Afficher icône si aucun avatar
}) => {

  // Tailles prédéfinies
  const sizeConfig = {
    xs: { container: 'w-6 h-6', text: 'text-xs', icon: 'w-3 h-3', border: 'border' },
    sm: { container: 'w-8 h-8', text: 'text-sm', icon: 'w-4 h-4', border: 'border-2' },
    md: { container: 'w-10 h-10', text: 'text-base', icon: 'w-5 h-5', border: 'border-2' },
    lg: { container: 'w-12 h-12', text: 'text-lg', icon: 'w-6 h-6', border: 'border-2' },
    xl: { container: 'w-16 h-16', text: 'text-xl', icon: 'w-8 h-8', border: 'border-3' },
    '2xl': { container: 'w-20 h-20', text: 'text-2xl', icon: 'w-10 h-10', border: 'border-4' },
    '3xl': { container: 'w-24 h-24', text: 'text-3xl', icon: 'w-12 h-12', border: 'border-4' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Déterminer quel type d'avatar afficher
  const avatarInfo = useMemo(() => {
    if (!user) return { type: 'fallback' };

    const avatarType = user.avatarType;

    // 1. Avatar PixelArt RPG (priorité maximale)
    if (avatarType === 'pixelart' && user.pixelArtAvatar) {
      return {
        type: 'pixelart',
        config: user.pixelArtAvatar
      };
    }

    // 2. Avatar DiceBear
    if (avatarType === 'dicebear' && user.diceBearAvatar) {
      return {
        type: 'dicebear',
        config: user.diceBearAvatar
      };
    }

    // 3. Avatar emoji personnalisé
    const selectedAvatarId = user.customization?.selectedAvatar;
    if (selectedAvatarId && UNLOCKABLE_AVATARS[selectedAvatarId]) {
      return {
        type: 'emoji',
        avatar: UNLOCKABLE_AVATARS[selectedAvatarId]
      };
    }

    // 4. Photo uploadée custom (pas Google)
    if (user.customPhotoURL) {
      return {
        type: 'photo',
        url: user.customPhotoURL
      };
    }

    // 5. Fallback: Photo Google (seulement si aucun avatar personnalisé)
    // On vérifie que ce n'est pas la photo Google par défaut
    if (user.photoURL && !user.avatarType) {
      // Si l'utilisateur n'a jamais personnalisé son avatar, on peut montrer Google
      // Mais on préfère ne pas le faire si un avatar par défaut existe
      const hasAnyCustomization = user.customization?.selectedAvatar ||
                                   user.pixelArtAvatar ||
                                   user.diceBearAvatar ||
                                   user.avatarBuilder;

      if (!hasAnyCustomization) {
        return {
          type: 'google',
          url: user.photoURL
        };
      }
    }

    // 6. Avatar par défaut (emoji)
    return {
      type: 'emoji',
      avatar: UNLOCKABLE_AVATARS.default_purple || {
        emoji: '🔵',
        gradient: 'from-purple-500 to-pink-500'
      }
    };

  }, [user]);

  // Obtenir les initiales
  const getInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  // Wrapper avec animation optionnelle
  const Wrapper = showAnimation ? motion.div : 'div';
  const wrapperProps = showAnimation ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  } : {};

  // Rendu selon le type d'avatar
  const renderAvatar = () => {
    switch (avatarInfo.type) {

      // Avatar PixelArt RPG - Utilise la fonction complète avec pose et accessoires
      case 'pixelart': {
        const pixelConfig = avatarInfo.config || DEFAULT_PIXEL_CONFIG;
        const background = PIXEL_BACKGROUNDS[pixelConfig.background] || PIXEL_BACKGROUNDS.dungeon;
        const palette = PIXEL_PALETTES[pixelConfig.palette] || PIXEL_PALETTES.default;
        // Utiliser la fonction complète avec classe, palette ET pose
        const svgContent = generatePixelCharacter(
          pixelConfig.class || 'warrior',
          pixelConfig.palette || 'default',
          pixelConfig.pose || 'idle'
        );

        return (
          <div
            className={`
              ${config.container} rounded-full overflow-hidden
              ${showBorder ? `${config.border} border-purple-500/50` : ''}
              flex items-center justify-center
            `}
            style={{
              background: background.gradient,
              imageRendering: 'pixelated'
            }}
          >
            <svg
              viewBox="0 0 32 32"
              className="w-full h-full scale-110"
              style={{
                filter: palette.filter,
                imageRendering: 'pixelated'
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        );
      }

      // Avatar DiceBear
      case 'dicebear': {
        const diceBearConfig = avatarInfo.config;
        // Construire l'URL DiceBear
        const style = diceBearConfig.style || 'adventurer';
        const seed = diceBearConfig.seed || user?.uid || 'default';
        const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;

        return (
          <img
            src={url}
            alt="Avatar"
            className={`
              ${config.container} rounded-full object-cover
              ${showBorder ? `${config.border} border-blue-500/50` : ''}
            `}
          />
        );
      }

      // Avatar emoji
      case 'emoji': {
        const avatar = avatarInfo.avatar;
        return (
          <div
            className={`
              ${config.container} rounded-full
              bg-gradient-to-br ${avatar.gradient || 'from-purple-500 to-pink-500'}
              ${showBorder ? `${config.border} border-white/20` : ''}
              flex items-center justify-center
            `}
          >
            <span className={config.text}>{avatar.emoji || '🔵'}</span>
          </div>
        );
      }

      // Photo custom ou Google
      case 'photo':
      case 'google': {
        return (
          <img
            src={avatarInfo.url}
            alt="Avatar"
            className={`
              ${config.container} rounded-full object-cover
              ${showBorder ? `${config.border} border-white/20` : ''}
            `}
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        );
      }

      // Fallback
      default: {
        if (fallbackIcon) {
          return (
            <div
              className={`
                ${config.container} rounded-full
                bg-gradient-to-br from-gray-600 to-gray-700
                ${showBorder ? `${config.border} border-white/20` : ''}
                flex items-center justify-center
              `}
            >
              <User className={`${config.icon} text-gray-400`} />
            </div>
          );
        }

        // Initiales comme dernier recours
        return (
          <div
            className={`
              ${config.container} rounded-full
              bg-gradient-to-br from-purple-500 to-blue-500
              ${showBorder ? `${config.border} border-white/20` : ''}
              flex items-center justify-center
            `}
          >
            <span className={`${config.text} font-bold text-white`}>
              {getInitials()}
            </span>
          </div>
        );
      }
    }
  };

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {renderAvatar()}

      {/* Fallback caché pour les erreurs d'image */}
      <div
        className={`
          ${config.container} rounded-full
          bg-gradient-to-br from-purple-500 to-blue-500
          ${showBorder ? `${config.border} border-white/20` : ''}
          items-center justify-center
          hidden
        `}
      >
        <span className={`${config.text} font-bold text-white`}>
          {getInitials()}
        </span>
      </div>
    </Wrapper>
  );
};

// ==========================================
// COMPOSANT SIMPLIFIÉ POUR LES LISTES
// ==========================================
export const UserAvatarSimple = ({
  photoURL,
  displayName,
  email,
  pixelArtAvatar,
  diceBearAvatar,
  customization,
  avatarType,
  size = 'md',
  className = ''
}) => {
  // Créer un objet user minimal
  const user = {
    photoURL,
    displayName,
    email,
    pixelArtAvatar,
    diceBearAvatar,
    customization,
    avatarType
  };

  return <UserAvatar user={user} size={size} className={className} />;
};

// ==========================================
// HOOK POUR OBTENIR L'URL D'AVATAR
// ==========================================
export const getAvatarUrl = (user) => {
  if (!user) return null;

  // PixelArt - pas d'URL simple, besoin du composant
  if (user.avatarType === 'pixelart' && user.pixelArtAvatar) {
    return null; // Utiliser le composant
  }

  // DiceBear
  if (user.avatarType === 'dicebear' && user.diceBearAvatar) {
    const config = user.diceBearAvatar;
    const style = config.style || 'adventurer';
    const seed = config.seed || user.uid || 'default';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  }

  // Photo custom
  if (user.customPhotoURL) {
    return user.customPhotoURL;
  }

  // Photo Google (seulement si pas de customisation)
  if (user.photoURL && !user.customization?.selectedAvatar) {
    return user.photoURL;
  }

  return null;
};

// ==========================================
// COMPOSANT AVATAR AVEC STATUT ONLINE
// ==========================================
export const UserAvatarWithStatus = ({
  user,
  size = 'md',
  isOnline = false,
  showStatus = true,
  ...props
}) => {
  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  return (
    <div className="relative inline-block">
      <UserAvatar user={user} size={size} {...props} />
      {showStatus && (
        <div
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size] || statusSizes.md}
            rounded-full border-2 border-gray-900
            ${isOnline ? 'bg-green-500' : 'bg-gray-500'}
          `}
        />
      )}
    </div>
  );
};

export default UserAvatar;
