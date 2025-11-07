// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// PAGE PROFIL + PARAMÈTRES COMBINÉS AVEC MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Upload,
  Shield,
  Settings,
  Bell,
  Lock,
  Globe,
  Smartphone,
  Briefcase,
  Clock,
  BarChart3,
  Palette,
  Database,
  RefreshCw,
  Check,
  EyeOff,
  Monitor,
  Volume2,
  VolumeX,
  Trash2,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  doc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { uploadUserAvatar } from '../core/services/storageService.js';

/**
 * ⚙️ COMPOSANT SELECT PERSONNALISÉ
 */
const CustomSelect = ({ value, options, onChange, placeholder = "Sélectionner..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-between"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                option.value === value ? 'bg-gray-700 text-purple-400' : 'text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 🏆 COMPOSANT CARTE DE BADGE
 */
const BadgeCard = ({ badge }) => {
  // Déterminer la rareté du badge basée sur l'XP
  const getRarity = (xpReward) => {
    if (xpReward >= 200) return { text: 'ÉPIQUE', color: 'from-purple-500 to-pink-500', border: 'border-purple-400' };
    if (xpReward >= 100) return { text: 'RARE', color: 'from-blue-500 to-cyan-500', border: 'border-blue-400' };
    return { text: 'COMMUN', color: 'from-green-500 to-emerald-500', border: 'border-green-400' };
  };

  const rarity = getRarity(badge.xpReward || 50);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-gradient-to-br ${rarity.color} rounded-xl p-4 border-2 ${rarity.border} shadow-lg`}
    >
      {/* Badge de rareté */}
      <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
        <span className="text-[10px] font-bold text-white">{rarity.text}</span>
      </div>

      {/* Icône du badge */}
      <div className="text-center mb-2">
        <div className="w-12 h-12 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
          <span className="text-2xl">{badge.icon || '🏆'}</span>
        </div>
      </div>

      {/* Nom du badge */}
      <h4 className="text-white font-bold text-center text-sm mb-1 line-clamp-1">
        {badge.name || 'Badge'}
      </h4>

      {/* Description */}
      {badge.description && (
        <p className="text-white/80 text-xs text-center line-clamp-2 mb-2">
          {badge.description}
        </p>
      )}

      {/* Récompense XP */}
      <div className="flex items-center justify-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
        <Zap className="w-3 h-3 text-yellow-400" />
        <span className="text-xs font-bold text-white">+{badge.xpReward || 50} XP</span>
      </div>

      {/* Date d'obtention */}
      {badge.earnedAt && (
        <div className="mt-2 text-center">
          <span className="text-[10px] text-white/70">
            {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}
    </motion.div>
  );
};

const ProfilePage = () => {
  // 👤 AUTHENTIFICATION
  const { user, updateProfile } = useAuthStore();
  
  // 📊 ÉTATS PROFILE PAGE
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  
  const [userProfile, setUserProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    company: '',
    role: 'member',
    skills: [],
    totalXp: 0,
    level: 1,
    badges: [],
    tasksCompleted: 0,
    projectsCreated: 0,
    completionRate: 0,
    streak: 0,
    joinDate: new Date(),
    lastActivity: new Date(),
    preferences: {
      notifications: {
        email: true,
        push: true,
        mentions: true,
        taskReminders: true,
        weeklyReport: true
      },
      interface: {
        darkMode: true,
        language: 'fr',
        soundEffects: true,
        animations: true,
        compactMode: false
      },
      gamification: {
        showXP: true,
        showBadges: true,
        publicProfile: true,
        leaderboardVisible: true
      },
      privacy: {
        profileVisibility: 'public',
        activityVisibility: 'friends',
        analyticsSharing: false
      }
    }
  });
  
  const [formData, setFormData] = useState({ ...userProfile });

  // Configuration des onglets
  const tabs = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: User,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: Edit,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'interface',
      label: 'Interface',
      icon: Palette,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: Award,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      icon: Shield,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'data',
      label: 'Données',
      icon: Database,
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  // 📊 CHARGEMENT DU PROFIL DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [PROFILE] Chargement du profil utilisateur...');
    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const profile = {
          displayName: userData.displayName || user.displayName || '',
          email: userData.email || user.email || '',
          bio: userData.profile?.bio || userData.bio || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          company: userData.company || '',
          role: userData.role || 'member',
          skills: userData.skills || [],
          totalXp: userData.gamification?.totalXp || 0,
          level: userData.gamification?.level || 1,
          badges: userData.gamification?.badges || [],
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          projectsCreated: userData.gamification?.projectsCreated || 0,
          completionRate: userData.gamification?.completionRate || 0,
          streak: userData.gamification?.loginStreak || 0,
          joinDate: userData.createdAt?.toDate() || new Date(),
          lastActivity: userData.lastActivity?.toDate() || new Date(),
          preferences: {
            notifications: {
              email: userData.preferences?.notifications?.email ?? true,
              push: userData.preferences?.notifications?.push ?? true,
              mentions: userData.preferences?.notifications?.mentions ?? true,
              taskReminders: userData.preferences?.notifications?.taskReminders ?? true,
              weeklyReport: userData.preferences?.notifications?.weeklyReport ?? true
            },
            interface: {
              darkMode: userData.preferences?.interface?.darkMode ?? true,
              language: userData.preferences?.interface?.language ?? 'fr',
              soundEffects: userData.preferences?.interface?.soundEffects ?? true,
              animations: userData.preferences?.interface?.animations ?? true,
              compactMode: userData.preferences?.interface?.compactMode ?? false
            },
            gamification: {
              showXP: userData.preferences?.gamification?.showXP ?? true,
              showBadges: userData.preferences?.gamification?.showBadges ?? true,
              publicProfile: userData.preferences?.gamification?.publicProfile ?? true,
              leaderboardVisible: userData.preferences?.gamification?.leaderboardVisible ?? true
            },
            privacy: {
              profileVisibility: userData.preferences?.privacy?.profileVisibility ?? 'public',
              activityVisibility: userData.preferences?.privacy?.activityVisibility ?? 'friends',
              analyticsSharing: userData.preferences?.privacy?.analyticsSharing ?? false
            }
          }
        };
        
        setUserProfile(profile);
        setFormData(profile);
        console.log('✅ [PROFILE] Profil chargé');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid, user?.displayName, user?.email]);

  /**
   * 🎯 NOTIFICATION SYSTÈME
   */
  const showSuccessNotification = (message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  /**
   * 💾 SAUVEGARDE DU PROFIL ET PARAMÈTRES
   */
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      // Mise à jour dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        skills: formData.skills,
        'profile.bio': formData.bio,
        
        // Préférences notifications
        'preferences.notifications.email': formData.preferences.notifications.email,
        'preferences.notifications.push': formData.preferences.notifications.push,
        'preferences.notifications.mentions': formData.preferences.notifications.mentions,
        'preferences.notifications.taskReminders': formData.preferences.notifications.taskReminders,
        'preferences.notifications.weeklyReport': formData.preferences.notifications.weeklyReport,
        
        // Préférences interface
        'preferences.interface.darkMode': formData.preferences.interface.darkMode,
        'preferences.interface.language': formData.preferences.interface.language,
        'preferences.interface.soundEffects': formData.preferences.interface.soundEffects,
        'preferences.interface.animations': formData.preferences.interface.animations,
        'preferences.interface.compactMode': formData.preferences.interface.compactMode,
        
        // Préférences gamification
        'preferences.gamification.showXP': formData.preferences.gamification.showXP,
        'preferences.gamification.showBadges': formData.preferences.gamification.showBadges,
        'preferences.gamification.publicProfile': formData.preferences.gamification.publicProfile,
        'preferences.gamification.leaderboardVisible': formData.preferences.gamification.leaderboardVisible,
        
        // Préférences confidentialité
        'preferences.privacy.profileVisibility': formData.preferences.privacy.profileVisibility,
        'preferences.privacy.activityVisibility': formData.preferences.privacy.activityVisibility,
        'preferences.privacy.analyticsSharing': formData.preferences.privacy.analyticsSharing,
        
        updatedAt: serverTimestamp()
      });

      // Mise à jour du store Auth si nécessaire
      if (formData.displayName !== user.displayName) {
        await updateProfile({ displayName: formData.displayName });
      }

      setUserProfile(formData);
      setShowEditModal(false);
      showSuccessNotification('✅ Profil mis à jour avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ [PROFILE] Erreur sauvegarde:', error);
      showSuccessNotification('❌ Erreur lors de la sauvegarde', 'error');
    }
    setSaving(false);
  };

  /**
   * 📷 UPLOAD AVATAR
   */
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    try {
      const photoURL = await uploadUserAvatar(user.uid, file);
      await updateProfile({ photoURL });
      showSuccessNotification('✅ Avatar mis à jour !', 'success');
    } catch (error) {
      console.error('❌ [PROFILE] Erreur upload avatar:', error);
      showSuccessNotification('❌ Erreur lors de l\'upload', 'error');
    }
    setUploading(false);
  };

  /**
   * 🔧 GESTION DES PARAMÈTRES
   */
  const handlePreferenceChange = (category, key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [key]: value
        }
      }
    }));
  };

  // 📊 CALCULS POUR L'AFFICHAGE
  const level = Math.floor(userProfile.totalXp / 100) + 1;
  const xpForNextLevel = (level * 100) - userProfile.totalXp;
  const progressPercent = ((userProfile.totalXp % 100) / 100) * 100;

  // 📊 STATISTIQUES HEADER
  const headerStats = [
    { 
      label: "XP Total", 
      value: userProfile.totalXp.toLocaleString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau", 
      value: level, 
      icon: Trophy, 
      color: "text-purple-400" 
    },
    { 
      label: "Badges", 
      value: userProfile.badges.length, 
      icon: Award, 
      color: "text-blue-400" 
    },
    { 
      label: "Taux de réussite", 
      value: `${userProfile.completionRate}%`, 
      icon: Target, 
      color: "text-green-400" 
    }
  ];

  // 🎯 ACTIONS HEADER
  const headerActions = (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveProfile}
        disabled={saving}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            Sauvegarde...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Sauvegarder
          </>
        )}
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Exporter
      </motion.button>
    </div>
  );

  // Notification de succès
  const SuccessNotification = () => (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' : 
            notificationType === 'error' ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{notificationMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading && !userProfile.email) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Chargement de votre profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SuccessNotification />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🏆 EN-TÊTE PROFILE PAGE */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <User className="w-8 h-8 text-purple-400" />
                  Mon Profil & Paramètres
                </h1>
                <p className="text-gray-300">
                  Gérez vos informations personnelles et personnalisez votre expérience
                </p>
              </div>
              
              {/* Actions */}
              {headerActions}
            </div>

            {/* 📊 STATISTIQUES PROFIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-300 text-center
                    ${activeTab === tab.id
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg'
                      : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50'
                    }
                  `}
                >
                  <div className={`bg-gradient-to-r ${tab.gradient} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                    {tab.label}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* CONTENU DES ONGLETS */}
          <div className="space-y-8">
            
            {/* ========== ONGLET VUE D'ENSEMBLE ========== */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Colonne principale - Informations */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Carte Profil Principal */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                    <div className="flex items-center space-x-6 mb-8">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                          {user?.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            userProfile.displayName?.charAt(0)?.toUpperCase() || 
                            userProfile.email?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        
                        {/* Bouton changement avatar */}
                        <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarUpload} 
                            className="hidden" 
                            disabled={uploading}
                          />
                        </label>
                        
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Informations de base */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {userProfile.displayName || 'Nom non défini'}
                        </h2>
                        <p className="text-gray-400 mb-2">{userProfile.email}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          {userProfile.role && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {userProfile.role}
                            </div>
                          )}
                          {userProfile.company && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {userProfile.company}
                            </div>
                          )}
                          {userProfile.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {userProfile.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {userProfile.bio && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-3">À propos</h3>
                        <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
                      </div>
                    )}

                    {/* Progression XP */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Progression</h3>
                        <span className="text-sm text-gray-400">
                          Niveau {level} • {xpForNextLevel} XP pour le niveau suivant
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {userProfile.totalXp} XP au total
                      </p>
                    </div>

                    {/* Compétences */}
                    {userProfile.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Compétences</h3>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Activité récente */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Activité récente
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Nouveau niveau atteint !</p>
                          <p className="text-gray-400 text-sm">Vous êtes maintenant niveau {level}</p>
                        </div>
                        <span className="text-gray-500 text-xs ml-auto">
                          {userProfile.lastActivity.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      {userProfile.badges.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Badges obtenus</p>
                            <p className="text-gray-400 text-sm">{userProfile.badges.length} badges collectés</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne latérale - Statistiques */}
                <div className="space-y-6">
                  
                  {/* Résumé des stats */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Statistiques
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tâches terminées</span>
                        <span className="text-white font-semibold">{userProfile.tasksCompleted}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Projets créés</span>
                        <span className="text-white font-semibold">{userProfile.projectsCreated}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Série actuelle</span>
                        <span className="text-yellow-400 font-semibold">{userProfile.streak} jours</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Membre depuis</span>
                        <span className="text-white font-semibold">
                          {userProfile.joinDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges récents */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Badges ({userProfile.badges.length})
                    </h3>
                    
                    {userProfile.badges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {userProfile.badges.slice(0, 6).map((badge, index) => (
                          <BadgeCard key={badge.id || index} badge={badge} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        Aucun badge obtenu pour le moment
                      </p>
                    )}
                    
                    {userProfile.badges.length > 6 && (
                      <button
                        onClick={() => setActiveTab('gamification')}
                        className="w-full mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm font-medium"
                      >
                        Voir tous les badges ({userProfile.badges.length})
                      </button>
                    )}
                  </div>

                  {/* Paramètres rapides */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-400" />
                      Paramètres rapides
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">Notifications</span>
                        </div>
                        <button 
                          onClick={() => handlePreferenceChange('notifications', 'email', !formData.preferences.notifications.email)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            formData.preferences.notifications.email 
                              ? 'bg-purple-600' 
                              : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.notifications.email 
                              ? 'translate-x-6' 
                              : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">Profil public</span>
                        </div>
                        <button 
                          onClick={() => handlePreferenceChange('gamification', 'publicProfile', !formData.preferences.gamification.publicProfile)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            formData.preferences.gamification.publicProfile 
                              ? 'bg-purple-600' 
                              : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.preferences.gamification.publicProfile 
                              ? 'translate-x-6' 
                              : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ONGLET PROFIL ========== */}
            {activeTab === 'profile' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <User className="w-6 h-6 text-blue-400 mr-3" />
                  Informations de Profil
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Votre nom d'affichage"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========== ONGLET NOTIFICATIONS ========== */}
            {activeTab === 'notifications' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Bell className="w-6 h-6 text-green-400 mr-3" />
                  Préférences de Notifications
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Notifications par email', icon: Bell },
                    { key: 'push', label: 'Notifications push', icon: Smartphone },
                    { key: 'mentions', label: 'Notifications de mentions', icon: User },
                    { key: 'taskReminders', label: 'Rappels de tâches', icon: AlertTriangle },
                    { key: 'weeklyReport', label: 'Rapport hebdomadaire', icon: BarChart3 }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">{label}</span>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('notifications', key, !formData.preferences.notifications[key])}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${formData.preferences.notifications[key] ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${formData.preferences.notifications[key] ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== ONGLET INTERFACE ========== */}
            {activeTab === 'interface' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Palette className="w-6 h-6 text-purple-400 mr-3" />
                  Apparence et Interface
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Langue
                    </label>
                    <CustomSelect
                      value={formData.preferences.interface.language}
                      onChange={(value) => handlePreferenceChange('interface', 'language', value)}
                      options={[
                        { value: 'fr', label: '🇫🇷 Français' },
                        { value: 'en', label: '🇺🇸 English' },
                        { value: 'es', label: '🇪🇸 Español' },
                        { value: 'de', label: '🇩🇪 Deutsch' }
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'soundEffects', label: 'Effets sonores', icon: formData.preferences.interface.soundEffects ? Volume2 : VolumeX },
                      { key: 'animations', label: 'Animations', icon: RefreshCw },
                      { key: 'compactMode', label: 'Mode compact', icon: Smartphone }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">{label}</span>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('interface', key, !formData.preferences.interface[key])}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${formData.preferences.interface[key] ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-gray-600'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${formData.preferences.interface[key] ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== ONGLET GAMIFICATION ========== */}
            {activeTab === 'gamification' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Award className="w-6 h-6 text-orange-400 mr-3" />
                  Paramètres de Gamification
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'showXP', label: 'Afficher les points XP', icon: Award },
                    { key: 'showBadges', label: 'Afficher les badges', icon: Shield },
                    { key: 'publicProfile', label: 'Profil public', icon: Globe },
                    { key: 'leaderboardVisible', label: 'Visible dans le classement', icon: Trophy }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-medium">{label}</span>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('gamification', key, !formData.preferences.gamification[key])}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${formData.preferences.gamification[key] ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-600'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${formData.preferences.gamification[key] ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== ONGLET CONFIDENTIALITÉ ========== */}
            {activeTab === 'privacy' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 text-pink-400 mr-3" />
                  Confidentialité et Sécurité
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visibilité du profil
                    </label>
                    <CustomSelect
                      value={formData.preferences.privacy.profileVisibility}
                      onChange={(value) => handlePreferenceChange('privacy', 'profileVisibility', value)}
                      options={[
                        { value: 'public', label: '🌐 Public - Visible par tous' },
                        { value: 'team', label: '👥 Équipe - Visible par l\'équipe' },
                        { value: 'private', label: '🔒 Privé - Visible par moi uniquement' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visibilité de l'activité
                    </label>
                    <CustomSelect
                      value={formData.preferences.privacy.activityVisibility}
                      onChange={(value) => handlePreferenceChange('privacy', 'activityVisibility', value)}
                      options={[
                        { value: 'public', label: '🌐 Publique' },
                        { value: 'friends', label: '👫 Amis uniquement' },
                        { value: 'private', label: '🔒 Privée' }
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-pink-400" />
                      <div>
                        <span className="text-white font-medium">Partage des données analytiques</span>
                        <p className="text-gray-400 text-sm">Aider à améliorer l'application</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('privacy', 'analyticsSharing', !formData.preferences.privacy.analyticsSharing)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${formData.preferences.privacy.analyticsSharing ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gray-600'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${formData.preferences.privacy.analyticsSharing ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ONGLET DONNÉES ========== */}
            {activeTab === 'data' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Database className="w-6 h-6 text-gray-400 mr-3" />
                  Gestion des Données
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-medium">Exporter mes données</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      Téléchargez toutes vos données personnelles au format JSON
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger mes données
                    </motion.button>
                  </div>

                  <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <h4 className="text-white font-medium">Supprimer mon compte</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      ⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer mon compte
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
