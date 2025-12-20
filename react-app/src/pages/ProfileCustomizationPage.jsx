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
  const [mode, setMode] = useState('builder'); // 'simple' ou 'builder'
  const [activeTab, setActiveTab] = useState('avatars');
  const [avatarBuilderConfig, setAvatarBuilderConfig] = useState(DEFAULT_AVATAR_CONFIG);
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

  // Charger la config avatar builder
  useEffect(() => {
    const loadAvatarBuilderConfig = async () => {
      if (user?.uid) {
        const config = await profileCustomizationService.getAvatarBuilderConfig(user.uid);
        setAvatarBuilderConfig(config);

        // Charger les recommandations
        const normalizedStats = profileCustomizationService.normalizeUserStats(userStats);
        const recommended = profileCustomizationService.getRecommendedItems(normalizedStats);
        setRecommendedItems(recommended);
      }
    };
    loadAvatarBuilderConfig();
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Chargement de la personnalisation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">

          {/* En-tete */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Palette className="w-10 h-10 text-purple-400" />
                  Personnalisation
                </h1>
                <p className="text-gray-400">
                  Creez votre avatar unique et personnalisez votre profil
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Toggle Mode */}
                <div className="flex bg-white/10 rounded-xl p-1">
                  <motion.button
                    onClick={() => setMode('builder')}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${mode === 'builder'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Avatar RPG</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setMode('simple')}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${mode === 'simple'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Classique</span>
                  </motion.button>
                </div>

                <motion.button
                  onClick={refresh}
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Niv. {userStats.level}</p>
                    <p className="text-xs text-gray-400">{userStats.totalXp?.toLocaleString()} XP</p>
                  </div>
                </div>
              </motion.div>

              {mode === 'builder' ? (
                // Stats Avatar Builder
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {builderStats?.classes?.unlocked || 0}/{builderStats?.classes?.total || 0}
                        </p>
                        <p className="text-xs text-gray-400">Classes</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                        <Sword className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {builderStats?.weapons?.unlocked || 0}/{builderStats?.weapons?.total || 0}
                        </p>
                        <p className="text-xs text-gray-400">Armes</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {builderStats?.companions?.unlocked || 0}/{builderStats?.companions?.total || 0}
                        </p>
                        <p className="text-xs text-gray-400">Compagnons</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {builderStats?.effects?.unlocked || 0}/{builderStats?.effects?.total || 0}
                        </p>
                        <p className="text-xs text-gray-400">Effets</p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                // Stats Mode Simple
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {unlockStats?.avatars?.unlocked}/{unlockStats?.avatars?.total}
                        </p>
                        <p className="text-xs text-gray-400">Avatars</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {unlockStats?.titles?.unlocked}/{unlockStats?.titles?.total}
                        </p>
                        <p className="text-xs text-gray-400">Titres</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">
                          {unlockStats?.banners?.unlocked}/{unlockStats?.banners?.total}
                        </p>
                        <p className="text-xs text-gray-400">Bannieres</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center">
                        <Flame className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white">{userStats.streak || 0}</p>
                        <p className="text-xs text-gray-400">Jours de serie</p>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          <AnimatePresence mode="wait">
            {mode === 'builder' ? (
              // MODE AVATAR BUILDER RPG
              <motion.div
                key="builder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AvatarBuilder
                  initialConfig={avatarBuilderConfig}
                  userStats={profileCustomizationService.normalizeUserStats(userStats)}
                  onSave={handleSaveAvatarBuilder}
                  saving={savingBuilder}
                />

                {/* Section recommandations */}
                {recommendedItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <RecommendedUnlocks items={recommendedItems} />
                  </motion.div>
                )}
              </motion.div>
            ) : (
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
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileCustomizationPage;
