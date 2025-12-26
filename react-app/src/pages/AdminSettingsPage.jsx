// ==========================================
// 📁 react-app/src/pages/AdminSettingsPage.jsx
// PAGE PARAMÈTRES SYSTÈME v4.1.0 - TOUS LES MODULES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Database,
  Bell,
  AlertTriangle,
  CheckCircle,
  Download,
  Key,
  Server,
  Monitor,
  Zap,
  Clock,
  Users,
  Award,
  Target,
  TrendingUp,
  Gift,
  Calendar,
  Briefcase,
  Heart,
  GraduationCap,
  Flag,
  Palette,
  Rocket,
  Star,
  TreePine,
  Trophy,
  Sparkles,
  MapPin
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Firebase
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Services
import rolePermissionsService from '../core/services/rolePermissionsService.js';
import { exportService } from '../core/services/exportService.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

/**
 * ⚙️ PAGE PARAMÈTRES SYSTÈME ADMINISTRATION v4.1.0
 */
const AdminSettingsPage = () => {
  const { user } = useAuthStore();

  // États principaux - TOUS LES MODULES
  const [settings, setSettings] = useState({
    // 📱 APPLICATION
    app: {
      name: 'Synergia',
      version: '4.1.0',
      description: 'Plateforme de Gamification RH et Engagement Collaborateur par SARL BOEHME',
      maintenanceMode: false,
      maxUsers: 1000,
      sessionTimeout: 3600,
      defaultLanguage: 'fr',
      timezone: 'Europe/Paris'
    },

    // 🎮 GAMIFICATION
    gamification: {
      enabled: true,
      xpMultiplier: 1.0,
      badgeSystem: true,
      defaultXpReward: 10,
      levelThresholds: [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 15000],
      weeklyXpBonus: true,
      weeklyBonusPercent: 10,
      streakBonusEnabled: true,
      maxStreakBonus: 50
    },

    // 🚀 BOOSTS
    boosts: {
      enabled: true,
      maxActiveBoosts: 3,
      defaultDuration: 24,
      xpBoostMultiplier: 1.5,
      doubleBadgeEnabled: true,
      teamBoostsEnabled: true,
      boostCooldown: 48,
      autoExpireNotification: true
    },

    // 🎯 CHALLENGES
    challenges: {
      enabled: true,
      maxActiveChallenges: 5,
      dailyChallengesEnabled: true,
      weeklyChallengesEnabled: true,
      teamChallengesEnabled: true,
      challengeXpMultiplier: 2.0,
      autoGenerateChallenges: true,
      minParticipants: 2,
      maxParticipants: 10
    },

    // 🌳 SKILL TREE
    skills: {
      enabled: true,
      maxSkillLevel: 10,
      skillPointsPerLevel: 1,
      allowSkillReset: true,
      resetCooldown: 168,
      showSkillProgress: true,
      requirePrerequisites: true,
      bonusXpPerSkill: 5
    },

    // 🏁 CHECKPOINTS
    checkpoints: {
      enabled: true,
      weeklyCheckpoint: true,
      monthlyCheckpoint: true,
      quarterlyCheckpoint: true,
      selfReflectionEnabled: true,
      peerFeedbackEnabled: true,
      goalSettingEnabled: true,
      reminderDaysBefore: 3,
      autoArchiveAfterDays: 90
    },

    // 🎓 MENTORING
    mentoring: {
      enabled: true,
      maxMenteesPerMentor: 5,
      minLevelToMentor: 5,
      mentoringXpBonus: 20,
      sessionDurationMinutes: 60,
      requireApproval: true,
      badgeForMentoring: true,
      feedbackRequired: true
    },

    // 💗 PULSE
    pulse: {
      enabled: true,
      dailyPulseEnabled: true,
      weeklyPulseEnabled: true,
      anonymousFeedback: true,
      moodTrackingEnabled: true,
      suggestionsEnabled: true,
      alertThreshold: 3,
      notifyAdminsOnLowPulse: true
    },

    // 📍 GÉOFENCING (Pointage géolocalisé)
    geofencing: {
      enabled: false,
      latitude: 49.1829,
      longitude: -0.3707,
      radius: 100,
      workplaceName: 'Lieu de travail',
      remoteAuthorizedUsers: [], // Liste des utilisateurs autorisés à pointer à distance
      remoteAuthorizationReason: {} // Raisons d'autorisation par utilisateur { odM: "Déplacement client", ... }
    },

    // 🎖️ RANKS
    ranks: {
      enabled: true,
      showRankBadges: true,
      rankUpNotification: true,
      rankBonusXp: 50,
      seasonalRanks: false,
      seasonDurationWeeks: 12,
      topRankRewards: true,
      displayRankInProfile: true
    },

    // 🎁 REWARDS / SHOP
    rewards: {
      enabled: true,
      shopEnabled: true,
      dualXpSystem: true,
      personalXpEnabled: true,
      teamXpPoolEnabled: true,
      teamPoolContribution: 20,
      maxPurchasesPerDay: 5,
      refundEnabled: false,
      expirationDays: 0
    },

    // 👥 HR MODULE
    hr: {
      enabled: true,
      contractManagement: true,
      leaveManagement: true,
      payrollIntegration: false,
      documentStorage: true,
      performanceReviews: true,
      reviewFrequencyMonths: 6,
      onboardingTracking: true,
      offboardingTracking: true
    },

    // 📅 PLANNING
    planning: {
      enabled: true,
      shiftManagement: true,
      availabilityTracking: true,
      autoScheduling: false,
      conflictDetection: true,
      maxHoursPerWeek: 40,
      minRestBetweenShifts: 11,
      swapRequestsEnabled: true,
      overtimeAlerts: true
    },

    // 🎨 CUSTOMIZATION
    customization: {
      enabled: true,
      avatarUpload: true,
      themeSelection: true,
      profileBanners: true,
      customBadgeDisplay: true,
      titleSelection: true,
      colorSchemes: true,
      animatedAvatars: false,
      premiumThemes: false
    },

    // 🔔 NOTIFICATIONS
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      adminAlerts: true,
      userWelcome: true,
      badgeNotifications: true,
      taskReminders: true,
      challengeReminders: true,
      checkpointReminders: true,
      pulseReminders: true,
      digestFrequency: 'daily'
    },

    // 🔒 SECURITY
    security: {
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      sessionSecure: true,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      twoFactorEnabled: false,
      auditLogging: true
    },

    // ⚡ FEATURES
    features: {
      roleSystem: true,
      taskValidation: true,
      mediaUpload: true,
      analytics: true,
      exports: true,
      apiAccess: false,
      godModEnabled: true,
      debugMode: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('app');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // Liste de tous les utilisateurs pour la sélection

  // Charger la liste des utilisateurs pour le géofencing
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const usersList = usersSnap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setAllUsers(usersList);
        console.log('👥 Utilisateurs chargés:', usersList.length);
      } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
      }
    };
    loadUsers();
  }, []);

  /**
   * 📊 CHARGER LES PARAMÈTRES
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ Chargement des paramètres système v4.1.0...');

      const settingsRef = doc(db, 'systemSettings', 'main');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const savedSettings = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...savedSettings,
          app: { ...prevSettings.app, ...savedSettings.app, version: '4.1.0' }
        }));
      } else {
        await saveSettings(settings);
      }

      console.log('✅ Paramètres v4.1.0 chargés avec succès');
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
      showNotification('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 💾 SAUVEGARDER LES PARAMÈTRES
   */
  const saveSettings = async (settingsToSave = settings) => {
    try {
      setSaving(true);
      console.log('💾 Sauvegarde des paramètres v4.1.0...');

      // Sauvegarder les paramètres principaux
      const settingsRef = doc(db, 'systemSettings', 'main');
      await setDoc(settingsRef, {
        ...settingsToSave,
        updatedAt: new Date(),
        updatedBy: user?.uid || 'system'
      });

      // 📍 Sauvegarder les paramètres de géofencing séparément (pour la badgeuse)
      if (settingsToSave.geofencing) {
        const geofencingRef = doc(db, 'systemSettings', 'geofencing');
        await setDoc(geofencingRef, {
          ...settingsToSave.geofencing,
          updatedAt: new Date(),
          updatedBy: user?.uid || 'system'
        });
        console.log('📍 Paramètres géofencing sauvegardés');
      }

      setPendingChanges(false);
      showNotification('Paramètres sauvegardés avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 🔄 RÉINITIALISER LES PERMISSIONS
   */
  const resetPermissions = async () => {
    try {
      await rolePermissionsService.initializeDefaultPermissions();
      showNotification('Permissions réinitialisées avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur réinitialisation permissions:', error);
      showNotification('Erreur lors de la réinitialisation', 'error');
    }
  };

  /**
   * 🧹 NETTOYER LA BASE DE DONNÉES
   */
  const cleanupDatabase = async () => {
    try {
      console.log('🧹 Nettoyage de la base de données...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('Base de données nettoyée avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur nettoyage base de données:', error);
      showNotification('Erreur lors du nettoyage', 'error');
    }
  };

  /**
   * 📈 EXPORTER LA CONFIGURATION EN PDF
   */
  const exportConfig = async () => {
    try {
      const configToExport = {
        'Version Application': {
          version: settings.app.version,
          exportDate: new Date().toLocaleDateString('fr-FR'),
          exportedBy: user?.email || 'admin'
        },
        ...settings
      };

      await exportService.exportSettingsToPDF(configToExport);
      showNotification('📄 Configuration exportée en PDF', 'success');
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  /**
   * 🔄 METTRE À JOUR UN PARAMÈTRE
   */
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setPendingChanges(true);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // 📑 DÉFINITION DES ONGLETS
  const tabs = [
    { id: 'app', label: 'Application', icon: Monitor, color: 'blue' },
    { id: 'gamification', label: 'Gamification', icon: Award, color: 'yellow' },
    { id: 'boosts', label: 'Boosts', icon: Rocket, color: 'orange' },
    { id: 'challenges', label: 'Challenges', icon: Target, color: 'red' },
    { id: 'skills', label: 'Skills', icon: TreePine, color: 'green' },
    { id: 'checkpoints', label: 'Checkpoints', icon: Flag, color: 'purple' },
    { id: 'mentoring', label: 'Mentoring', icon: GraduationCap, color: 'indigo' },
    { id: 'pulse', label: 'Pulse', icon: Heart, color: 'pink' },
    { id: 'geofencing', label: 'Géofencing', icon: MapPin, color: 'teal' },
    { id: 'ranks', label: 'Rangs', icon: Trophy, color: 'amber' },
    { id: 'rewards', label: 'Rewards', icon: Gift, color: 'emerald' },
    { id: 'hr', label: 'RH', icon: Briefcase, color: 'slate' },
    { id: 'planning', label: 'Planning', icon: Calendar, color: 'cyan' },
    { id: 'customization', label: 'Custom', icon: Palette, color: 'fuchsia' },
    { id: 'notifications', label: 'Notifs', icon: Bell, color: 'sky' },
    { id: 'security', label: 'Sécurité', icon: Shield, color: 'rose' },
    { id: 'features', label: 'Features', icon: Zap, color: 'violet' }
  ];

  // 🎛️ COMPOSANT TOGGLE SWITCH
  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
      <div>
        <span className="text-white font-medium">{label}</span>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  // 🔢 COMPOSANT INPUT NUMBER
  const NumberInput = ({ value, onChange, label, description, min, max, step = 1 }) => (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
      {description && <p className="text-gray-500 text-xs mb-2">{description}</p>}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(step === 1 ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // 📝 COMPOSANT INPUT TEXT
  const TextInput = ({ value, onChange, label, description, placeholder }) => (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
      {description && <p className="text-gray-500 text-xs mb-2">{description}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // 📋 COMPOSANT SELECT
  const SelectInput = ({ value, onChange, label, description, options }) => (
    <div>
      <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
      {description && <p className="text-gray-500 text-xs mb-2">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // 🎨 RENDU DES SECTIONS
  const renderSection = (sectionId) => {
    const sectionData = settings[sectionId];
    if (!sectionData) return null;

    const sectionConfigs = {
      app: {
        title: "Configuration de l'application",
        icon: Monitor,
        fields: [
          { type: 'text', key: 'name', label: "Nom de l'application" },
          { type: 'text', key: 'version', label: "Version", disabled: true },
          { type: 'textarea', key: 'description', label: "Description" },
          { type: 'number', key: 'maxUsers', label: "Nombre maximum d'utilisateurs", min: 1, max: 10000 },
          { type: 'number', key: 'sessionTimeout', label: "Timeout de session (secondes)", min: 300, max: 86400 },
          { type: 'toggle', key: 'maintenanceMode', label: "Mode maintenance", description: "Empêche les utilisateurs non-admin de se connecter" }
        ]
      },
      gamification: {
        title: "Paramètres de gamification",
        icon: Award,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de gamification", description: "Activer les XP, badges et niveaux" },
          { type: 'number', key: 'xpMultiplier', label: "Multiplicateur XP global", min: 0.1, max: 5, step: 0.1 },
          { type: 'toggle', key: 'badgeSystem', label: "Système de badges", description: "Activer l'attribution automatique de badges" },
          { type: 'number', key: 'defaultXpReward', label: "XP par défaut pour les tâches", min: 1, max: 100 },
          { type: 'toggle', key: 'weeklyXpBonus', label: "Bonus XP hebdomadaire" },
          { type: 'number', key: 'weeklyBonusPercent', label: "Pourcentage bonus hebdo (%)", min: 0, max: 100 },
          { type: 'toggle', key: 'streakBonusEnabled', label: "Bonus de série (streak)" },
          { type: 'number', key: 'maxStreakBonus', label: "Bonus streak maximum (%)", min: 0, max: 200 }
        ]
      },
      boosts: {
        title: "Paramètres des Boosts",
        icon: Rocket,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de boosts", description: "Activer les boosts temporaires" },
          { type: 'number', key: 'maxActiveBoosts', label: "Boosts actifs max", min: 1, max: 10 },
          { type: 'number', key: 'defaultDuration', label: "Durée par défaut (heures)", min: 1, max: 168 },
          { type: 'number', key: 'xpBoostMultiplier', label: "Multiplicateur XP boost", min: 1, max: 5, step: 0.1 },
          { type: 'toggle', key: 'doubleBadgeEnabled', label: "Double badge actif" },
          { type: 'toggle', key: 'teamBoostsEnabled', label: "Boosts d'équipe" },
          { type: 'number', key: 'boostCooldown', label: "Cooldown entre boosts (heures)", min: 0, max: 168 },
          { type: 'toggle', key: 'autoExpireNotification', label: "Notification d'expiration" }
        ]
      },
      challenges: {
        title: "Paramètres des Challenges",
        icon: Target,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de challenges", description: "Activer les défis individuels et d'équipe" },
          { type: 'number', key: 'maxActiveChallenges', label: "Challenges actifs max", min: 1, max: 20 },
          { type: 'toggle', key: 'dailyChallengesEnabled', label: "Challenges quotidiens" },
          { type: 'toggle', key: 'weeklyChallengesEnabled', label: "Challenges hebdomadaires" },
          { type: 'toggle', key: 'teamChallengesEnabled', label: "Challenges d'équipe" },
          { type: 'number', key: 'challengeXpMultiplier', label: "Multiplicateur XP challenge", min: 1, max: 5, step: 0.1 },
          { type: 'toggle', key: 'autoGenerateChallenges', label: "Génération automatique" },
          { type: 'number', key: 'minParticipants', label: "Participants min (équipe)", min: 2, max: 10 },
          { type: 'number', key: 'maxParticipants', label: "Participants max (équipe)", min: 2, max: 50 }
        ]
      },
      skills: {
        title: "Paramètres du Skill Tree",
        icon: TreePine,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Arbre de compétences", description: "Activer le système de skills" },
          { type: 'number', key: 'maxSkillLevel', label: "Niveau max par skill", min: 1, max: 20 },
          { type: 'number', key: 'skillPointsPerLevel', label: "Points par niveau", min: 1, max: 5 },
          { type: 'toggle', key: 'allowSkillReset', label: "Autoriser le reset des skills" },
          { type: 'number', key: 'resetCooldown', label: "Cooldown reset (heures)", min: 0, max: 720 },
          { type: 'toggle', key: 'showSkillProgress', label: "Afficher la progression" },
          { type: 'toggle', key: 'requirePrerequisites', label: "Prérequis obligatoires" },
          { type: 'number', key: 'bonusXpPerSkill', label: "Bonus XP par skill (%)", min: 0, max: 50 }
        ]
      },
      checkpoints: {
        title: "Paramètres des Checkpoints",
        icon: Flag,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de checkpoints", description: "Activer les bilans périodiques" },
          { type: 'toggle', key: 'weeklyCheckpoint', label: "Checkpoint hebdomadaire" },
          { type: 'toggle', key: 'monthlyCheckpoint', label: "Checkpoint mensuel" },
          { type: 'toggle', key: 'quarterlyCheckpoint', label: "Checkpoint trimestriel" },
          { type: 'toggle', key: 'selfReflectionEnabled', label: "Auto-réflexion" },
          { type: 'toggle', key: 'peerFeedbackEnabled', label: "Feedback entre pairs" },
          { type: 'toggle', key: 'goalSettingEnabled', label: "Définition d'objectifs" },
          { type: 'number', key: 'reminderDaysBefore', label: "Rappel X jours avant", min: 1, max: 14 },
          { type: 'number', key: 'autoArchiveAfterDays', label: "Archivage auto (jours)", min: 30, max: 365 }
        ]
      },
      mentoring: {
        title: "Paramètres du Mentoring",
        icon: GraduationCap,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de mentoring", description: "Activer le programme de mentorat" },
          { type: 'number', key: 'maxMenteesPerMentor', label: "Mentorés max par mentor", min: 1, max: 10 },
          { type: 'number', key: 'minLevelToMentor', label: "Niveau min pour être mentor", min: 1, max: 20 },
          { type: 'number', key: 'mentoringXpBonus', label: "Bonus XP mentoring", min: 0, max: 100 },
          { type: 'number', key: 'sessionDurationMinutes', label: "Durée session (minutes)", min: 15, max: 180 },
          { type: 'toggle', key: 'requireApproval', label: "Approbation requise" },
          { type: 'toggle', key: 'badgeForMentoring', label: "Badge pour mentoring" },
          { type: 'toggle', key: 'feedbackRequired', label: "Feedback obligatoire" }
        ]
      },
      pulse: {
        title: "Paramètres du Pulse",
        icon: Heart,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système Pulse", description: "Activer le suivi du bien-être" },
          { type: 'toggle', key: 'dailyPulseEnabled', label: "Pulse quotidien" },
          { type: 'toggle', key: 'weeklyPulseEnabled', label: "Pulse hebdomadaire" },
          { type: 'toggle', key: 'anonymousFeedback', label: "Feedback anonyme" },
          { type: 'toggle', key: 'moodTrackingEnabled', label: "Suivi de l'humeur" },
          { type: 'toggle', key: 'suggestionsEnabled', label: "Suggestions activées" },
          { type: 'number', key: 'alertThreshold', label: "Seuil d'alerte (1-5)", min: 1, max: 5 },
          { type: 'toggle', key: 'notifyAdminsOnLowPulse', label: "Alerter admins si pulse bas" }
        ]
      },
      geofencing: {
        title: "Géofencing - Zone de pointage autorisée",
        icon: MapPin,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Activer le géofencing", description: "Obliger les employés à pointer depuis le lieu de travail" },
          { type: 'text', key: 'workplaceName', label: "Nom du lieu de travail" },
          { type: 'number', key: 'latitude', label: "Latitude GPS", min: -90, max: 90, step: 0.0001 },
          { type: 'number', key: 'longitude', label: "Longitude GPS", min: -180, max: 180, step: 0.0001 },
          { type: 'number', key: 'radius', label: "Rayon autorisé (mètres)", min: 10, max: 1000 }
        ]
      },
      ranks: {
        title: "Paramètres des Rangs",
        icon: Trophy,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de rangs", description: "Activer le classement par rangs" },
          { type: 'toggle', key: 'showRankBadges', label: "Afficher les badges de rang" },
          { type: 'toggle', key: 'rankUpNotification', label: "Notification de montée en rang" },
          { type: 'number', key: 'rankBonusXp', label: "Bonus XP par rang", min: 0, max: 200 },
          { type: 'toggle', key: 'seasonalRanks', label: "Rangs saisonniers" },
          { type: 'number', key: 'seasonDurationWeeks', label: "Durée saison (semaines)", min: 4, max: 52 },
          { type: 'toggle', key: 'topRankRewards', label: "Récompenses top rangs" },
          { type: 'toggle', key: 'displayRankInProfile', label: "Afficher rang dans profil" }
        ]
      },
      rewards: {
        title: "Paramètres des Récompenses",
        icon: Gift,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Système de récompenses", description: "Activer la boutique et récompenses" },
          { type: 'toggle', key: 'shopEnabled', label: "Boutique activée" },
          { type: 'toggle', key: 'dualXpSystem', label: "Système dual XP", description: "XP personnel + XP équipe" },
          { type: 'toggle', key: 'personalXpEnabled', label: "XP personnel" },
          { type: 'toggle', key: 'teamXpPoolEnabled', label: "Pool XP équipe" },
          { type: 'number', key: 'teamPoolContribution', label: "Contribution pool équipe (%)", min: 0, max: 50 },
          { type: 'number', key: 'maxPurchasesPerDay', label: "Achats max par jour", min: 1, max: 20 },
          { type: 'toggle', key: 'refundEnabled', label: "Remboursements autorisés" },
          { type: 'number', key: 'expirationDays', label: "Expiration (0=jamais)", min: 0, max: 365 }
        ]
      },
      hr: {
        title: "Paramètres RH",
        icon: Briefcase,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Module RH", description: "Activer la gestion des ressources humaines" },
          { type: 'toggle', key: 'contractManagement', label: "Gestion des contrats" },
          { type: 'toggle', key: 'leaveManagement', label: "Gestion des congés" },
          { type: 'toggle', key: 'payrollIntegration', label: "Intégration paie" },
          { type: 'toggle', key: 'documentStorage', label: "Stockage documents" },
          { type: 'toggle', key: 'performanceReviews', label: "Évaluations de performance" },
          { type: 'number', key: 'reviewFrequencyMonths', label: "Fréquence évaluations (mois)", min: 1, max: 12 },
          { type: 'toggle', key: 'onboardingTracking', label: "Suivi onboarding" },
          { type: 'toggle', key: 'offboardingTracking', label: "Suivi offboarding" }
        ]
      },
      planning: {
        title: "Paramètres Planning",
        icon: Calendar,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Module Planning", description: "Activer la gestion des plannings" },
          { type: 'toggle', key: 'shiftManagement', label: "Gestion des shifts" },
          { type: 'toggle', key: 'availabilityTracking', label: "Suivi des disponibilités" },
          { type: 'toggle', key: 'autoScheduling', label: "Planification automatique" },
          { type: 'toggle', key: 'conflictDetection', label: "Détection des conflits" },
          { type: 'number', key: 'maxHoursPerWeek', label: "Heures max par semaine", min: 1, max: 60 },
          { type: 'number', key: 'minRestBetweenShifts', label: "Repos min entre shifts (h)", min: 8, max: 24 },
          { type: 'toggle', key: 'swapRequestsEnabled', label: "Échanges de shifts" },
          { type: 'toggle', key: 'overtimeAlerts', label: "Alertes heures sup" }
        ]
      },
      customization: {
        title: "Paramètres de Personnalisation",
        icon: Palette,
        fields: [
          { type: 'toggle', key: 'enabled', label: "Personnalisation", description: "Activer la customisation des profils" },
          { type: 'toggle', key: 'avatarUpload', label: "Upload d'avatar" },
          { type: 'toggle', key: 'themeSelection', label: "Sélection de thème" },
          { type: 'toggle', key: 'profileBanners', label: "Bannières de profil" },
          { type: 'toggle', key: 'customBadgeDisplay', label: "Affichage badges personnalisé" },
          { type: 'toggle', key: 'titleSelection', label: "Sélection de titre" },
          { type: 'toggle', key: 'colorSchemes', label: "Schémas de couleurs" },
          { type: 'toggle', key: 'animatedAvatars', label: "Avatars animés" },
          { type: 'toggle', key: 'premiumThemes', label: "Thèmes premium" }
        ]
      },
      notifications: {
        title: "Paramètres de Notifications",
        icon: Bell,
        fields: [
          { type: 'toggle', key: 'emailEnabled', label: "Notifications email" },
          { type: 'toggle', key: 'pushEnabled', label: "Notifications push" },
          { type: 'toggle', key: 'adminAlerts', label: "Alertes administrateur" },
          { type: 'toggle', key: 'userWelcome', label: "Message de bienvenue" },
          { type: 'toggle', key: 'badgeNotifications', label: "Notifications badges" },
          { type: 'toggle', key: 'taskReminders', label: "Rappels de tâches" },
          { type: 'toggle', key: 'challengeReminders', label: "Rappels challenges" },
          { type: 'toggle', key: 'checkpointReminders', label: "Rappels checkpoints" },
          { type: 'toggle', key: 'pulseReminders', label: "Rappels pulse" },
          { type: 'select', key: 'digestFrequency', label: "Fréquence digest", options: [
            { value: 'realtime', label: 'Temps réel' },
            { value: 'hourly', label: 'Toutes les heures' },
            { value: 'daily', label: 'Quotidien' },
            { value: 'weekly', label: 'Hebdomadaire' }
          ]}
        ]
      },
      security: {
        title: "Paramètres de Sécurité",
        icon: Shield,
        fields: [
          { type: 'number', key: 'passwordMinLength', label: "Longueur min mot de passe", min: 6, max: 20 },
          { type: 'toggle', key: 'passwordRequireSpecial', label: "Caractères spéciaux requis" },
          { type: 'toggle', key: 'passwordRequireNumbers', label: "Chiffres requis" },
          { type: 'toggle', key: 'sessionSecure', label: "Sessions sécurisées (HTTPS)" },
          { type: 'number', key: 'maxLoginAttempts', label: "Tentatives connexion max", min: 3, max: 10 },
          { type: 'number', key: 'lockoutDuration', label: "Durée verrouillage (sec)", min: 300, max: 3600 },
          { type: 'toggle', key: 'twoFactorEnabled', label: "Authentification 2FA" },
          { type: 'toggle', key: 'auditLogging', label: "Journalisation audit" }
        ]
      },
      features: {
        title: "Fonctionnalités disponibles",
        icon: Zap,
        fields: [
          { type: 'toggle', key: 'roleSystem', label: "Système de rôles Synergia" },
          { type: 'toggle', key: 'taskValidation', label: "Validation des tâches" },
          { type: 'toggle', key: 'mediaUpload', label: "Upload de médias" },
          { type: 'toggle', key: 'analytics', label: "Statistiques et analytics" },
          { type: 'toggle', key: 'exports', label: "Exports de données" },
          { type: 'toggle', key: 'apiAccess', label: "Accès API externe" },
          { type: 'toggle', key: 'godModEnabled', label: "Mode GodMod" },
          { type: 'toggle', key: 'debugMode', label: "Mode debug" }
        ]
      }
    };

    const config = sectionConfigs[sectionId];
    if (!config) return null;

    const SectionIcon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <SectionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h3 className="text-lg sm:text-xl font-semibold text-white">{config.title}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {config.fields.map((field, index) => {
              const value = sectionData[field.key];

              if (field.type === 'toggle') {
                return (
                  <div key={field.key} className={field.description ? 'md:col-span-2' : ''}>
                    <ToggleSwitch
                      checked={value}
                      onChange={(val) => updateSetting(sectionId, field.key, val)}
                      label={field.label}
                      description={field.description}
                    />
                  </div>
                );
              }

              if (field.type === 'number') {
                return (
                  <NumberInput
                    key={field.key}
                    value={value}
                    onChange={(val) => updateSetting(sectionId, field.key, val)}
                    label={field.label}
                    description={field.description}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                  />
                );
              }

              if (field.type === 'text') {
                return (
                  <TextInput
                    key={field.key}
                    value={value}
                    onChange={(val) => updateSetting(sectionId, field.key, val)}
                    label={field.label}
                    description={field.description}
                  />
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.key} className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">{field.label}</label>
                    <textarea
                      value={value}
                      onChange={(e) => updateSetting(sectionId, field.key, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <SelectInput
                    key={field.key}
                    value={value}
                    onChange={(val) => updateSetting(sectionId, field.key, val)}
                    label={field.label}
                    description={field.description}
                    options={field.options}
                  />
                );
              }

              return null;
            })}
          </div>

          {/* Section spéciale pour le géofencing - Autorisation de pointage à distance */}
          {sectionId === 'geofencing' && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-teal-400" />
                Autorisations de pointage à distance
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Sélectionnez les employés autorisés à pointer en dehors de la zone géofencing (déplacements, télétravail, etc.)
              </p>

              {/* Liste des utilisateurs avec checkbox */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {allUsers.map((u) => {
                  const isAuthorized = (sectionData.remoteAuthorizedUsers || []).includes(u.uid);
                  const reason = (sectionData.remoteAuthorizationReason || {})[u.uid] || '';

                  return (
                    <div
                      key={u.uid}
                      className={`p-3 rounded-lg border ${
                        isAuthorized
                          ? 'bg-teal-500/20 border-teal-500/50'
                          : 'bg-gray-700/50 border-gray-600'
                      } transition-all`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAuthorized}
                          onChange={(e) => {
                            const currentList = sectionData.remoteAuthorizedUsers || [];
                            const newList = e.target.checked
                              ? [...currentList, u.uid]
                              : currentList.filter(id => id !== u.uid);

                            updateSetting('geofencing', 'remoteAuthorizedUsers', newList);

                            // Si on retire l'autorisation, supprimer aussi la raison
                            if (!e.target.checked) {
                              const reasons = { ...(sectionData.remoteAuthorizationReason || {}) };
                              delete reasons[u.uid];
                              updateSetting('geofencing', 'remoteAuthorizationReason', reasons);
                            }
                          }}
                          className="mt-1 w-4 h-4 rounded border-gray-500 text-teal-500 focus:ring-teal-500 bg-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {u.displayName || u.email || 'Sans nom'}
                          </p>
                          <p className="text-gray-400 text-xs truncate">{u.email}</p>
                          {u.role && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-600 rounded text-gray-300">
                              {u.role}
                            </span>
                          )}
                        </div>
                      </label>

                      {/* Champ raison si autorisé */}
                      {isAuthorized && (
                        <div className="mt-2 pl-7">
                          <input
                            type="text"
                            placeholder="Raison (ex: Déplacement client)"
                            value={reason}
                            onChange={(e) => {
                              const reasons = { ...(sectionData.remoteAuthorizationReason || {}) };
                              reasons[u.uid] = e.target.value;
                              updateSetting('geofencing', 'remoteAuthorizationReason', reasons);
                            }}
                            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Résumé des autorisations */}
              {(sectionData.remoteAuthorizedUsers || []).length > 0 && (
                <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                  <p className="text-teal-400 text-sm font-medium">
                    ✅ {(sectionData.remoteAuthorizedUsers || []).length} employé(s) autorisé(s) à pointer à distance
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(sectionData.remoteAuthorizedUsers || []).map(uid => {
                      const u = allUsers.find(user => user.uid === uid);
                      const reason = (sectionData.remoteAuthorizationReason || {})[uid];
                      return u ? (
                        <span key={uid} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-teal-500/20 rounded-full text-teal-300">
                          {u.displayName || u.email?.split('@')[0]}
                          {reason && <span className="text-teal-400/70">({reason})</span>}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des paramètres v4.1.0...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Settings className="w-7 h-7 sm:w-10 sm:h-10 text-blue-400" />
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">Paramètres Système</span>
                    <span className="sm:hidden">Paramètres</span>
                  </h1>
                  <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                    <span className="hidden sm:inline">Configuration et administration du système • v{settings.app.version}</span>
                    <span className="sm:hidden">v{settings.app.version}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:space-x-3">
                <button
                  onClick={loadSettings}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                <button
                  onClick={exportConfig}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </button>

                {pendingChanges && (
                  <button
                    onClick={() => saveSettings()}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                )}
              </div>
            </div>

            {pendingChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300">
                    Vous avez des modifications non sauvegardées
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Onglets en grille */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2 bg-gray-800 p-1.5 sm:p-2 rounded-lg overflow-x-auto">
              {tabs.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs truncate max-w-full">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenu de l'onglet actif */}
          {renderSection(activeTab)}

          {/* Actions système */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 mt-4 sm:mt-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Actions système</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={resetPermissions}
                className="flex items-center space-x-2 sm:space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-lg transition-colors"
              >
                <Key className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm sm:text-base">Réinitialiser permissions</div>
                  <div className="text-xs opacity-75 hidden sm:block">Restaurer les permissions par défaut</div>
                </div>
              </button>

              <button
                onClick={cleanupDatabase}
                className="flex items-center space-x-2 sm:space-x-3 bg-orange-600 hover:bg-orange-700 text-white p-3 sm:p-4 rounded-lg transition-colors"
              >
                <Database className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm sm:text-base">Nettoyer BDD</div>
                  <div className="text-xs opacity-75 hidden sm:block">Supprimer données obsolètes</div>
                </div>
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center space-x-2 sm:space-x-3 bg-red-600 hover:bg-red-700 text-white p-3 sm:p-4 rounded-lg transition-colors sm:col-span-2 lg:col-span-1"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm sm:text-base">Reset système</div>
                  <div className="text-xs opacity-75 hidden sm:block">Réinitialisation complète</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Informations système */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 mt-4 sm:mt-6"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Informations système</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">Version</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">{settings.app.version}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">Limite</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">{settings.app.maxUsers}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">Session</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">{Math.floor(settings.app.sessionTimeout / 60)}min</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">Modules</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">{Object.keys(settings).length}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">XP Multi</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">x{settings.gamification.xpMultiplier}</div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-gray-300 text-xs sm:text-sm">Sécurité</span>
                </div>
                <div className="text-white font-bold text-sm sm:text-base">
                  {settings.security.sessionSecure ? 'Active' : 'Off'}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-300 font-medium text-sm sm:text-base">Système opérationnel</h4>
                  <p className="text-green-200 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Synergia v{settings.app.version} • {Object.keys(settings).length} modules configurés • Dernière vérification: {new Date().toLocaleString('fr-FR')}</span>
                    <span className="sm:hidden">v{settings.app.version} • {Object.keys(settings).length} modules</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modal de confirmation reset */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md border border-gray-700"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Réinitialisation système
                  </h3>
                </div>

                <div className="mb-4 sm:mb-6">
                  <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                    Cette action va réinitialiser tous les paramètres à leurs valeurs par défaut.
                  </p>
                  <p className="text-red-400 text-xs sm:text-sm font-medium">
                    Cette action est irréversible !
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                  <button
                    onClick={() => {
                      loadSettings();
                      setShowConfirmModal(false);
                      showNotification('Système réinitialisé avec succès', 'success');
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    Confirmer
                  </button>

                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast de sauvegarde */}
        {pendingChanges && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-16 sm:bottom-4 right-2 sm:right-4 z-40"
          >
            <div className="bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">Modifications non sauvegardées</span>
              <button
                onClick={() => saveSettings()}
                disabled={saving}
                className="ml-1 sm:ml-2 bg-yellow-700 hover:bg-yellow-800 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
              >
                {saving ? '...' : 'Sauver'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Indicateur de statut système - Caché sur mobile */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 z-40 hidden sm:block"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-xs">Système opérationnel</span>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Synergia v{settings.app.version}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;
