// ==========================================
// react-app/src/pages/ProfileCustomizationPage.jsx
// PAGE PERSONNALISATION PROFIL - SYNERGIA v4.0
// Module 13: Avatars, Titres, Bannieres + Avatar Builder RPG
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  User,
  Crown,
  Image,
  Sparkles,
  Lock,
  Check,
  Trophy,
  Zap,
  Target,
  RefreshCw,
  Eye,
  ChevronRight,
  Gamepad2,
  Wand2,
  Star,
  Shield,
  Sword,
  Heart,
  Gift,
  Flame
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import AvatarSelector from '../components/customization/AvatarSelector.jsx';
import TitleSelector from '../components/customization/TitleSelector.jsx';
import BannerSelector from '../components/customization/BannerSelector.jsx';
import AvatarBuilder, { AvatarPreview } from '../components/customization/AvatarBuilder.jsx';
import DiceBearAvatarBuilder, { DiceBearAvatarPreview, DEFAULT_DICEBEAR_CONFIG } from '../components/customization/DiceBearAvatar.jsx';
import PixelArtAvatarBuilder, { PixelArtAvatarPreview, DEFAULT_PIXEL_CONFIG, PIXEL_CLASSES, PIXEL_PALETTES, PIXEL_POSES, PIXEL_BACKGROUNDS } from '../components/customization/PixelArtAvatar.jsx';
import { useProfileCustomization } from '../shared/hooks/useProfileCustomization.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { profileCustomizationService, DEFAULT_AVATAR_CONFIG } from '../core/services/profileCustomizationService.js';

// Pattern pour les bannieres
const BannerPattern = ({ pattern }) => {
  if (!pattern) return null;

  switch (pattern) {
    case 'stars':
      return (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
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
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute w-4 h-4 text-yellow-300/40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
};

// Composant pour les elements recommandes a debloquer
const RecommendedUnlocks = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-amber-400" />
        <h4 className="text-sm font-semibold text-amber-300">Bientot disponibles</h4>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.name}</p>
              <p className="text-xs text-gray-400">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-amber-400">{item.progress}%</p>
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileCustomizationPage = () => {
  const { user } = useAuthStore();
  const [mode, setMode] = useState('pixelart'); // 'simple', 'builder', 'dicebear' ou 'pixelart'
  const [activeTab, setActiveTab] = useState('avatars');
  const [avatarBuilderConfig, setAvatarBuilderConfig] = useState(DEFAULT_AVATAR_CONFIG);
  const [diceBearConfig, setDiceBearConfig] = useState(DEFAULT_DICEBEAR_CONFIG);
  const [pixelArtConfig, setPixelArtConfig] = useState(DEFAULT_PIXEL_CONFIG);
  const [savingBuilder, setSavingBuilder] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState([]);

  const {
    userStats,
    customization,
    avatars,
    titles,
    banners,
    unlockStats,
    getCurrentAvatar,
    getCurrentTitle,
    getCurrentBanner,
    getAvatarsByCategory,
    getTitlesByCategory,
    getBannersByCategory,
    loading,
    updating,
    selectAvatar,
    selectTitle,
    selectBanner,
    refresh
  } = useProfileCustomization();

  // Charger la config avatar builder, DiceBear et PixelArt
  useEffect(() => {
    const loadAvatarConfigs = async () => {
      if (user?.uid) {
        // Config classique
        const config = await profileCustomizationService.getAvatarBuilderConfig(user.uid);
        setAvatarBuilderConfig(config);

        // Config DiceBear
        const diceBear = await profileCustomizationService.getDiceBearConfig(user.uid);
        setDiceBearConfig(diceBear || DEFAULT_DICEBEAR_CONFIG);

        // Config PixelArt RPG
        const pixelArt = await profileCustomizationService.getPixelArtConfig(user.uid);
        setPixelArtConfig(pixelArt || DEFAULT_PIXEL_CONFIG);

        // Charger les recommandations
        const normalizedStats = profileCustomizationService.normalizeUserStats(userStats);
        const recommended = profileCustomizationService.getRecommendedItems(normalizedStats);
        setRecommendedItems(recommended);
      }
    };
    loadAvatarConfigs();
  }, [user?.uid, userStats]);

  const currentAvatar = getCurrentAvatar();
  const currentTitle = getCurrentTitle();
  const currentBanner = getCurrentBanner();

  // Sauvegarder la config avatar builder
  const handleSaveAvatarBuilder = useCallback(async (config) => {
    if (!user?.uid) return;

    setSavingBuilder(true);
    try {
      const normalizedStats = profileCustomizationService.normalizeUserStats(userStats);
      const result = await profileCustomizationService.saveAvatarBuilderConfig(
        user.uid,
        config,
        normalizedStats
      );

      if (result.success) {
        setAvatarBuilderConfig(config);
      } else {
        console.error('Erreur sauvegarde:', result.error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde avatar builder:', error);
    } finally {
      setSavingBuilder(false);
    }
  }, [user?.uid, userStats]);

  // Sauvegarder la config DiceBear
  const handleSaveDiceBear = useCallback(async (config) => {
    if (!user?.uid) return;

    setSavingBuilder(true);
    try {
      const normalizedStats = profileCustomizationService.normalizeUserStats(userStats);
      const result = await profileCustomizationService.saveDiceBearConfig(
        user.uid,
        config,
        normalizedStats
      );

      if (result.success) {
        setDiceBearConfig(config);
        alert('✅ Avatar DiceBear sauvegardé !');
      } else {
        console.error('Erreur sauvegarde DiceBear:', result.error);
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde DiceBear:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingBuilder(false);
    }
  }, [user?.uid, userStats]);

  // Sauvegarder la config PixelArt RPG
  const handleSavePixelArt = useCallback(async (config) => {
    if (!user?.uid) return;

    setSavingBuilder(true);
    try {
      const normalizedStats = profileCustomizationService.normalizeUserStats(userStats);
      const result = await profileCustomizationService.savePixelArtConfig(
        user.uid,
        config,
        normalizedStats
      );

      if (result.success) {
        setPixelArtConfig(config);
        alert('✅ Avatar Pixel Art sauvegardé !');
      } else {
        console.error('Erreur sauvegarde PixelArt:', result.error);
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde PixelArt:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingBuilder(false);
    }
  }, [user?.uid, userStats]);

  // Stats pour avatar builder
  const builderStats = profileCustomizationService.getAvatarBuilderUnlockStats(
    profileCustomizationService.normalizeUserStats(userStats)
  );

  const tabs = [
    {
      id: 'avatars',
      label: 'Avatars',
      icon: User,
      count: unlockStats?.avatars,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'titles',
      label: 'Titres',
      icon: Crown,
      count: unlockStats?.titles,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'banners',
      label: 'Bannieres',
      icon: Image,
      count: unlockStats?.banners,
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/30 to-pink-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* En-tete */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                    Personnalisation
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Créez votre avatar unique
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mode Badge RPG */}
                <div className="flex bg-gradient-to-r from-yellow-500 to-orange-500 backdrop-blur-xl border border-white/20 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm">
                    <Sword className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="font-medium">Avatar RPG</span>
                  </div>
                </div>

                <motion.button
                  onClick={refresh}
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 sm:p-3 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Stats Cards - Mobile: 3 columns, Desktop: 5 columns */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-2.5 sm:p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-xl font-bold text-white">N.{userStats.level}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{userStats.totalXp?.toLocaleString()} XP</p>
                  </div>
                </div>
              </motion.div>

                {/* Stats Pixel Art RPG */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-2.5 sm:p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500/30 to-orange-500/20 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                    <Sword className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-xl font-bold text-white">{Object.keys(PIXEL_CLASSES).length}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Classes</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-2.5 sm:p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-xl font-bold text-white">{Object.keys(PIXEL_PALETTES).length}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Couleurs</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-2.5 sm:p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-xl font-bold text-white">{Object.keys(PIXEL_POSES).length}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Poses</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-2.5 sm:p-4 border border-white/10 hidden sm:block"
              >
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-lg flex items-center justify-center mb-1 sm:mb-0">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-base sm:text-xl font-bold text-white">{Object.keys(PIXEL_BACKGROUNDS).length}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Fonds</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Contenu principal - Mode RPG uniquement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PixelArtAvatarBuilder
              initialConfig={pixelArtConfig}
              userStats={profileCustomizationService.normalizeUserStats(userStats)}
              onSave={handleSavePixelArt}
              saving={savingBuilder}
            />
          </motion.div>

          {/* Section masquée - ancien mode simple (conservé pour référence mais non affiché) */}
          {false && (
              // MODE SIMPLE (EXISTANT)
              <motion.div
                key="simple"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Colonne gauche - Apercu du profil */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Carte apercu */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {/* Banniere */}
                    <div className={`relative h-32 bg-gradient-to-r ${currentBanner?.gradient || 'from-slate-800 to-slate-900'}`}>
                      <BannerPattern pattern={currentBanner?.pattern} />
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
                        <span className="text-xs text-white/70">{currentBanner?.name || 'Classique'}</span>
                      </div>
                    </div>

                    {/* Contenu profil */}
                    <div className="relative px-6 pb-6">
                      {/* Avatar */}
                      <div className="relative -mt-12 mb-4">
                        <motion.div
                          key={currentAvatar?.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentAvatar?.gradient || 'from-purple-500 to-pink-500'}
                            flex items-center justify-center text-4xl border-4 border-slate-800 shadow-xl`}
                        >
                          {user?.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            currentAvatar?.emoji || '🔵'
                          )}
                        </motion.div>
                      </div>

                      {/* Nom et titre */}
                      <h3 className="text-xl font-bold text-white mb-1">
                        {user?.displayName || 'Utilisateur'}
                      </h3>

                      <motion.div
                        key={currentTitle?.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                          ${currentTitle?.bgColor || 'bg-gray-500/20'} ${currentTitle?.borderColor || 'border-gray-500/30'} border`}
                      >
                        <Crown className={`w-3 h-3 ${currentTitle?.color || 'text-gray-400'}`} />
                        <span className={currentTitle?.color || 'text-gray-400'}>{currentTitle?.name || 'Membre'}</span>
                      </motion.div>

                      {/* Stats rapides */}
                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-yellow-400">{userStats.totalXp?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-400">XP Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-400">{userStats.tasksCompleted || 0}</p>
                          <p className="text-xs text-gray-400">Taches</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-400">{userStats.badgesCount || 0}</p>
                          <p className="text-xs text-gray-400">Badges</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Elements selectionnes */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Elements actifs
                    </h4>

                    <div className="space-y-3">
                      {/* Avatar actif */}
                      <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentAvatar?.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center text-xl`}>
                          {currentAvatar?.emoji || '🔵'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{currentAvatar?.name || 'Avatar'}</p>
                          <p className="text-xs text-gray-400">Avatar</p>
                        </div>
                        <Check className="w-4 h-4 text-green-400" />
                      </div>

                      {/* Titre actif */}
                      <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg ${currentTitle?.bgColor || 'bg-gray-500/20'} flex items-center justify-center`}>
                          <Crown className={`w-5 h-5 ${currentTitle?.color || 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{currentTitle?.name || 'Membre'}</p>
                          <p className="text-xs text-gray-400">Titre</p>
                        </div>
                        <Check className="w-4 h-4 text-green-400" />
                      </div>

                      {/* Banniere active */}
                      <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentBanner?.gradient || 'from-slate-700 to-slate-800'} flex items-center justify-center`}>
                          <Image className="w-5 h-5 text-white/70" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{currentBanner?.name || 'Banniere'}</p>
                          <p className="text-xs text-gray-400">Banniere</p>
                        </div>
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Info deblocage */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-300">Comment debloquer plus ?</p>
                        <ul className="text-xs text-purple-200/70 mt-2 space-y-1">
                          <li className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Montez en niveau pour de nouveaux avatars
                          </li>
                          <li className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Completez des taches pour des titres
                          </li>
                          <li className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            Essayez le mode Avatar RPG !
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Selection */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Onglets */}
                  <div className="flex gap-3">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            flex-1 p-4 rounded-xl border-2 transition-all
                            ${activeTab === tab.id
                              ? `bg-gradient-to-br ${tab.gradient} border-white/30`
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`}>
                              {tab.label}
                            </span>
                            {tab.count && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                activeTab === tab.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-700 text-gray-400'
                              }`}>
                                {tab.count.unlocked}/{tab.count.total}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Contenu des onglets */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                    >
                      {activeTab === 'avatars' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <User className="w-6 h-6 text-purple-400" />
                              Choisissez votre avatar
                            </h3>
                            {updating && (
                              <div className="flex items-center gap-2 text-purple-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Mise a jour...</span>
                              </div>
                            )}
                          </div>
                          <AvatarSelector
                            avatars={avatars}
                            avatarsByCategory={getAvatarsByCategory()}
                            selectedAvatar={customization?.selectedAvatar}
                            onSelect={selectAvatar}
                            updating={updating}
                          />
                        </div>
                      )}

                      {activeTab === 'titles' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Crown className="w-6 h-6 text-amber-400" />
                              Choisissez votre titre
                            </h3>
                            {updating && (
                              <div className="flex items-center gap-2 text-amber-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Mise a jour...</span>
                              </div>
                            )}
                          </div>
                          <TitleSelector
                            titles={titles}
                            titlesByCategory={getTitlesByCategory()}
                            selectedTitle={customization?.selectedTitle}
                            onSelect={selectTitle}
                            updating={updating}
                          />
                        </div>
                      )}

                      {activeTab === 'banners' && (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Image className="w-6 h-6 text-blue-400" />
                              Choisissez votre banniere
                            </h3>
                            {updating && (
                              <div className="flex items-center gap-2 text-blue-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Mise a jour...</span>
                              </div>
                            )}
                          </div>
                          <BannerSelector
                            banners={banners}
                            bannersByCategory={getBannersByCategory()}
                            selectedBanner={customization?.selectedBanner}
                            onSelect={selectBanner}
                            updating={updating}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfileCustomizationPage;
