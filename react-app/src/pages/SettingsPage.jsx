// ==========================================
// 📁 react-app/src/pages/SettingsPage.jsx
// PAGE PARAMÈTRES AVEC MENU HAMBURGER - DESIGN PREMIUM
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Award, 
  Database,
  Save,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Volume2,
  VolumeX,
  Globe,
  Lock,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react';

// Layout Premium avec menu hamburger
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase
import { 
  doc, 
  updateDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

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
 * ⚙️ PAGE PARAMÈTRES PRINCIPALE
 */
const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [settings, setSettings] = useState({
    // Profil
    displayName: '',
    email: '',
    bio: '',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    mentionNotifications: true,
    taskReminders: true,
    weeklyReport: true,
    
    // Interface
    darkMode: true,
    language: 'fr',
    soundEffects: true,
    animations: true,
    compactMode: false,
    
    // Gamification
    showXP: true,
    showBadges: true,
    publicProfile: true,
    leaderboardVisible: true,
    
    // Confidentialité
    profileVisibility: 'public',
    activityVisibility: 'friends',
    analyticsSharing: false
  });

  // Configuration des onglets
  const tabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
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

  // Charger les paramètres au montage
  useEffect(() => {
    if (user?.uid) {
      loadUserSettings();
    }
  }, [user?.uid]);

  // Fonction pour charger les paramètres depuis Firebase
  const loadUserSettings = async () => {
    try {
      setLoading(true);
      console.log('📥 Chargement des paramètres depuis Firebase...');
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📊 Données utilisateur chargées:', userData);
        
        // Mapper les données Firebase vers l'état local
        setSettings({
          // Profil
          displayName: userData.displayName || user.displayName || '',
          email: userData.email || user.email || '',
          bio: userData.profile?.bio || '',
          
          // Notifications depuis preferences
          emailNotifications: userData.preferences?.notifications?.email ?? true,
          pushNotifications: userData.preferences?.notifications?.push ?? true,
          mentionNotifications: userData.preferences?.notifications?.mentions ?? true,
          taskReminders: userData.preferences?.notifications?.taskReminders ?? true,
          weeklyReport: userData.preferences?.notifications?.weeklyReport ?? true,
          
          // Interface depuis preferences
          darkMode: userData.preferences?.interface?.darkMode ?? true,
          language: userData.preferences?.interface?.language ?? 'fr',
          soundEffects: userData.preferences?.interface?.soundEffects ?? true,
          animations: userData.preferences?.interface?.animations ?? true,
          compactMode: userData.preferences?.interface?.compactMode ?? false,
          
          // Gamification depuis preferences
          showXP: userData.preferences?.gamification?.showXP ?? true,
          showBadges: userData.preferences?.gamification?.showBadges ?? true,
          publicProfile: userData.preferences?.gamification?.publicProfile ?? true,
          leaderboardVisible: userData.preferences?.gamification?.leaderboardVisible ?? true,
          
          // Confidentialité depuis preferences
          profileVisibility: userData.preferences?.privacy?.profileVisibility ?? 'public',
          activityVisibility: userData.preferences?.privacy?.activityVisibility ?? 'friends',
          analyticsSharing: userData.preferences?.privacy?.analyticsSharing ?? false
        });
        
        console.log('✅ Paramètres chargés avec succès');
      } else {
        console.log('📝 Aucun paramètre existant, utilisation des valeurs par défaut');
        // Utiliser les valeurs par défaut déjà définies
        setSettings(prev => ({
          ...prev,
          displayName: user.displayName || '',
          email: user.email || ''
        }));
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
      showSuccessNotification('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une notification
  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Gérer le changement d'un paramètre
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      console.log('💾 Sauvegarde des paramètres...');

      const userRef = doc(db, 'users', user.uid);

      // Structurer les données pour Firebase
      const updateData = {
        displayName: settings.displayName,
        email: settings.email,
        'profile.bio': settings.bio,
        
        // Préférences notifications
        'preferences.notifications.email': settings.emailNotifications,
        'preferences.notifications.push': settings.pushNotifications,
        'preferences.notifications.mentions': settings.mentionNotifications,
        'preferences.notifications.taskReminders': settings.taskReminders,
        'preferences.notifications.weeklyReport': settings.weeklyReport,
        
        // Préférences interface
        'preferences.interface.darkMode': settings.darkMode,
        'preferences.interface.language': settings.language,
        'preferences.interface.soundEffects': settings.soundEffects,
        'preferences.interface.animations': settings.animations,
        'preferences.interface.compactMode': settings.compactMode,
        
        // Préférences gamification
        'preferences.gamification.showXP': settings.showXP,
        'preferences.gamification.showBadges': settings.showBadges,
        'preferences.gamification.publicProfile': settings.publicProfile,
        'preferences.gamification.leaderboardVisible': settings.leaderboardVisible,
        
        // Préférences confidentialité
        'preferences.privacy.profileVisibility': settings.profileVisibility,
        'preferences.privacy.activityVisibility': settings.activityVisibility,
        'preferences.privacy.analyticsSharing': settings.analyticsSharing,
        
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      console.log('✅ Paramètres sauvegardés avec succès');
      showSuccessNotification('✅ Paramètres sauvegardés avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      showSuccessNotification('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Stats pour l'header
  const headerStats = [
    {
      title: "Paramètres",
      value: Object.keys(settings).length,
      icon: SettingsIcon,
      color: "purple"
    },
    {
      title: "Notifications",
      value: Object.values(settings).filter(v => v === true).length,
      icon: Bell,
      color: "green"
    },
    {
      title: "Confidentialité",
      value: settings.profileVisibility === 'private' ? 'Privé' : 'Public',
      icon: Shield,
      color: "blue"
    }
  ];

  // Actions pour l'header
  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={loadUserSettings}
        disabled={loading}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Save}
        onClick={saveSettings}
        disabled={saving}
        className={saving ? "animate-pulse" : ""}
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </PremiumButton>
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
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{notificationMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Interface de chargement
  if (loading) {
    return (
      <PremiumLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white">Chargement des paramètres...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Paramètres"
      subtitle="Personnalisez votre expérience Synergia"
      icon={SettingsIcon}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      <SuccessNotification />

      {/* Onglets de navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

      {/* Contenu des onglets */}
      <div className="space-y-8">
        
        {/* Onglet Profil */}
        {activeTab === 'profile' && (
          <PremiumCard>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <User className="w-6 h-6 text-blue-400 mr-3" />
              Informations de Profil
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => handleSettingChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Votre nom d'affichage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Onglet Notifications */}
        {activeTab === 'notifications' && (
          <PremiumCard>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Bell className="w-6 h-6 text-green-400 mr-3" />
              Préférences de Notifications
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Notifications par email', icon: Bell },
                { key: 'pushNotifications', label: 'Notifications push', icon: Smartphone },
                { key: 'mentionNotifications', label: 'Notifications de mentions', icon: User },
                { key: 'taskReminders', label: 'Rappels de tâches', icon: AlertTriangle },
                { key: 'weeklyReport', label: 'Rapport hebdomadaire', icon: BarChart3 }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => handleSettingChange(key, !settings[key])}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${settings[key] ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${settings[key] ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {/* Onglet Interface */}
        {activeTab === 'interface' && (
          <PremiumCard>
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
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
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
                  { key: 'soundEffects', label: 'Effets sonores', icon: settings.soundEffects ? Volume2 : VolumeX },
                  { key: 'animations', label: 'Animations', icon: RefreshCw },
                  { key: 'compactMode', label: 'Mode compact', icon: Smartphone }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">{label}</span>
                    </div>
                    <button
                      onClick={() => handleSettingChange(key, !settings[key])}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings[key] ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-gray-600'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings[key] ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Onglet Gamification */}
        {activeTab === 'gamification' && (
          <PremiumCard>
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
                    onClick={() => handleSettingChange(key, !settings[key])}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${settings[key] ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${settings[key] ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </PremiumCard>
        )}

        {/* Onglet Confidentialité */}
        {activeTab === 'privacy' && (
          <PremiumCard>
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
                  value={settings.profileVisibility}
                  onChange={(value) => handleSettingChange('profileVisibility', value)}
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
                  value={settings.activityVisibility}
                  onChange={(value) => handleSettingChange('activityVisibility', value)}
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
                  onClick={() => handleSettingChange('analyticsSharing', !settings.analyticsSharing)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.analyticsSharing ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.analyticsSharing ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Onglet Données */}
        {activeTab === 'data' && (
          <PremiumCard>
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
                <PremiumButton variant="secondary" size="sm" icon={Download}>
                  Télécharger mes données
                </PremiumButton>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <h4 className="text-white font-medium">Supprimer mon compte</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  ⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                <PremiumButton variant="danger" size="sm" icon={Trash2}>
                  Supprimer mon compte
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        )}

      </div>
    </PremiumLayout>
  );
};

export default SettingsPage;
