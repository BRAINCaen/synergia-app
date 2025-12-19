// ==========================================
// SYNERGIA v4.0 - Avatar Builder
// Composant de creation/personnalisation d'avatar
// Style pixel art RPG
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Crown, Sword, Heart, Sparkles, Shield, Image,
  Lock, Check, ChevronRight, Star, Zap, Trophy, RefreshCw,
  Eye, EyeOff, RotateCcw, Save, Info
} from 'lucide-react';

import {
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
  DEFAULT_AVATAR_CONFIG
} from '../../core/services/avatarDefinitions.js';

// ===================
// COMPOSANT AVATAR PREVIEW
// ===================
const AvatarPreview = ({ config, size = 'large', showEffects = true, animated = true }) => {
  const characterClass = CHARACTER_CLASSES[config.class] || CHARACTER_CLASSES.wizard;
  const colorVariant = COLOR_VARIANTS[config.color] || COLOR_VARIANTS.default;
  const headgear = HEADGEAR[config.headgear];
  const weapon = WEAPONS[config.weapon];
  const companion = COMPANIONS[config.companion];
  const effect = EFFECTS[config.effect];
  const emblem = EMBLEMS[config.emblem];
  const background = BACKGROUNDS[config.background] || BACKGROUNDS.default;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
    xlarge: 'w-56 h-56'
  };

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-6xl',
    xlarge: 'text-8xl'
  };

  return (
    <motion.div
      className="relative"
      animate={animated ? { y: [0, -5, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Arriere-plan */}
      <div className={`
        ${sizeClasses[size]} rounded-2xl overflow-hidden
        bg-gradient-to-br ${background.gradient}
        ${background.animated ? 'animate-gradient-slow' : ''}
        border-4 border-white/20 shadow-2xl
      `}>
        {/* Effet d'aura */}
        {showEffects && effect && effect.id !== 'none' && (
          <div className={`absolute inset-0 ${effect.cssClass} opacity-60`} />
        )}

        {/* Personnage principal */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Glow de couleur */}
          <div
            className="absolute w-3/4 h-3/4 rounded-full blur-xl opacity-40"
            style={{ backgroundColor: colorVariant.primary }}
          />

          {/* Container du personnage */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Couvre-chef */}
            {headgear && headgear.id !== 'none' && (
              <motion.span
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`absolute -top-2 ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-2xl'}`}
              >
                {headgear.icon}
              </motion.span>
            )}

            {/* Icone du personnage */}
            <motion.div
              className={`${iconSizes[size]} drop-shadow-lg`}
              style={{
                filter: `drop-shadow(0 0 10px ${colorVariant.primary})`,
                color: colorVariant.primary
              }}
            >
              {characterClass.icon}
            </motion.div>

            {/* Arme */}
            {weapon && weapon.id !== 'none' && (
              <motion.span
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`absolute ${size === 'small' ? 'bottom-1 right-0 text-xs' : 'bottom-2 right-1 text-lg'}`}
              >
                {weapon.icon}
              </motion.span>
            )}
          </div>
        </div>

        {/* Compagnon */}
        {companion && companion.id !== 'none' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute ${size === 'small' ? 'bottom-0 left-0 text-xs' : 'bottom-1 left-1 text-xl'}`}
          >
            {companion.icon}
          </motion.div>
        )}

        {/* Embleme */}
        {emblem && emblem.id !== 'none' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute ${size === 'small' ? 'top-0 right-0 text-xs' : 'top-1 right-1 text-lg'}`}
          >
            {emblem.icon}
          </motion.div>
        )}
      </div>

      {/* Effet d'etincelles */}
      {showEffects && colorVariant.animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 40],
                y: [0, (Math.random() - 0.5) * 40]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ===================
// COMPOSANT ITEM SELECTOR
// ===================
const ItemSelector = ({
  items,
  selectedId,
  onSelect,
  userStats,
  categoryIcon: CategoryIcon,
  columns = 4
}) => {
  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'mythic': return 'border-yellow-500 bg-yellow-500/10 animate-pulse-slow';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'mythic': return 'shadow-yellow-500/50';
      default: return '';
    }
  };

  return (
    <div className={`grid grid-cols-${columns} gap-3`}>
      {items.map((item) => {
        const unlocked = isUnlocked(item, userStats);
        const isSelected = selectedId === item.id;
        const progress = getUnlockProgress(item, userStats);

        return (
          <motion.button
            key={item.id}
            onClick={() => unlocked && onSelect(item.id)}
            disabled={!unlocked}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            className={`
              relative p-3 rounded-xl border-2 transition-all
              ${unlocked
                ? `${getRarityBorder(item.rarity)} hover:bg-white/10 cursor-pointer`
                : 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-60'
              }
              ${isSelected ? `ring-2 ring-offset-2 ring-offset-slate-900 ring-white ${getRarityGlow(item.rarity)} shadow-lg` : ''}
            `}
          >
            {/* Icone */}
            <div className="text-3xl mb-2 flex justify-center">
              {item.icon || <CategoryIcon className="w-8 h-8 text-gray-400" />}
            </div>

            {/* Nom */}
            <p className={`text-xs font-medium text-center truncate ${unlocked ? 'text-white' : 'text-gray-500'}`}>
              {item.name}
            </p>

            {/* Badge de rarete */}
            {item.rarity && (
              <div className={`
                absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center
                ${item.rarity === 'rare' ? 'bg-blue-500' : ''}
                ${item.rarity === 'epic' ? 'bg-purple-500' : ''}
                ${item.rarity === 'mythic' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : ''}
              `}>
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            )}

            {/* Indicateur de selection */}
            {isSelected && unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {/* Verrou */}
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                <div className="text-center">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-400 px-1">{getUnlockText(item)}</p>
                  {/* Barre de progression */}
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-1 mx-auto" style={{ width: '80%' }}>
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// ===================
// COMPOSANT PRINCIPAL
// ===================
const AvatarBuilder = ({
  initialConfig = DEFAULT_AVATAR_CONFIG,
  userStats = {},
  onSave,
  onCancel,
  saving = false
}) => {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('class');
  const [showPreview, setShowPreview] = useState(true);

  // Categories de personnalisation
  const categories = [
    { id: 'class', label: 'Classe', icon: User, items: CHARACTER_CLASSES },
    { id: 'color', label: 'Couleur', icon: Palette, items: COLOR_VARIANTS },
    { id: 'headgear', label: 'Coiffe', icon: Crown, items: HEADGEAR },
    { id: 'weapon', label: 'Arme', icon: Sword, items: WEAPONS },
    { id: 'companion', label: 'Compagnon', icon: Heart, items: COMPANIONS },
    { id: 'effect', label: 'Effet', icon: Sparkles, items: EFFECTS },
    { id: 'emblem', label: 'Embleme', icon: Shield, items: EMBLEMS },
    { id: 'background', label: 'Fond', icon: Image, items: BACKGROUNDS }
  ];

  // Items filtres par classe si applicable
  const getFilteredItems = (category) => {
    const items = Object.values(category.items);
    const currentClass = config.class;

    // Filtrer les items qui sont specifiques a certaines classes
    return items.map(item => {
      // Si l'item a une restriction de classe
      if (item.forClass && !item.forClass.includes(currentClass)) {
        return {
          ...item,
          // On peut toujours le montrer mais avec indication
          classRestricted: true
        };
      }
      return item;
    });
  };

  // Stats de deblocage
  const unlockStats = useMemo(() => {
    let total = 0;
    let unlocked = 0;

    categories.forEach(cat => {
      const items = Object.values(cat.items);
      total += items.length;
      unlocked += items.filter(item => isUnlocked(item, userStats)).length;
    });

    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
  }, [userStats]);

  const handleSelect = (categoryId, itemId) => {
    setConfig(prev => ({
      ...prev,
      [categoryId]: itemId
    }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_AVATAR_CONFIG);
  };

  const handleRandomize = () => {
    const newConfig = { ...config };

    categories.forEach(cat => {
      const items = Object.values(cat.items).filter(item => isUnlocked(item, userStats));
      if (items.length > 0) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        newConfig[cat.id] = randomItem.id;
      }
    });

    setConfig(newConfig);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne gauche - Preview */}
      <div className="lg:col-span-1 space-y-4">
        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Apercu
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
            </button>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center py-6"
              >
                <AvatarPreview config={config} size="xlarge" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info personnage */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{CHARACTER_CLASSES[config.class]?.icon}</span>
              <div>
                <p className="text-white font-semibold">{CHARACTER_CLASSES[config.class]?.name}</p>
                <p className="text-xs text-gray-400">{CHARACTER_CLASSES[config.class]?.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {Object.entries(CHARACTER_CLASSES[config.class]?.baseStats || {}).map(([stat, value]) => (
                <div key={stat} className="text-center p-2 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400 capitalize">{stat}</p>
                  <p className="text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <motion.button
              onClick={handleRandomize}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Aleatoire
            </motion.button>
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Stats de collection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Collection</p>
              <p className="text-xs text-gray-400">{unlockStats.unlocked}/{unlockStats.total} debloques</p>
            </div>
            <span className="text-lg font-bold text-yellow-400">{unlockStats.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${unlockStats.percentage}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </motion.div>

        {/* Bouton sauvegarder */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Sauvegarder
            </>
          )}
        </motion.button>
      </div>

      {/* Colonne droite - Selection */}
      <div className="lg:col-span-2 space-y-4">
        {/* Onglets de categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const itemCount = Object.values(cat.items).filter(i => isUnlocked(i, userStats)).length;
            const totalCount = Object.values(cat.items).length;

            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all
                  ${activeTab === cat.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === cat.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {itemCount}/{totalCount}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Contenu de l'onglet actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            {categories.map((cat) => {
              if (cat.id !== activeTab) return null;

              const Icon = cat.icon;
              const items = getFilteredItems(cat);

              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Icon className="w-6 h-6 text-purple-400" />
                      {cat.label}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Info className="w-4 h-4" />
                      Selection actuelle: {cat.items[config[cat.id]]?.name || 'Aucun'}
                    </div>
                  </div>

                  <ItemSelector
                    items={items}
                    selectedId={config[cat.id]}
                    onSelect={(itemId) => handleSelect(cat.id, itemId)}
                    userStats={userStats}
                    categoryIcon={Icon}
                    columns={cat.id === 'class' ? 5 : 6}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Tip */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-300">Astuce</p>
            <p className="text-xs text-blue-200/70">
              Montez en niveau et completez des taches pour debloquer plus d'options de personnalisation !
              Les items rares necessitent des accomplissements speciaux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AvatarPreview, ItemSelector };
export default AvatarBuilder;
