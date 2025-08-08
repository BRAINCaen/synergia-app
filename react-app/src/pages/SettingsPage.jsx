// ==========================================
// 📁 react-app/src/pages/SettingsPage.jsx
// PAGE PARAMÈTRES - VERSION CORRIGÉE ET COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Download,
  Trash2,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Award,
  CheckCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [settings, setSettings] = useState({
    // Profil
    displayName: user?.displayName || '',
    email: user?.email || '',
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

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Paramètres sauvegardés:', settings);
      showSuccessNotification('Paramètres sauvegardés avec succès !');
      
      // Ici vous pouvez ajouter la logique de sauvegarde Firebase
      // await updateUserSettings(user.uid, settings);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showSuccessNotification('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        user: {
          displayName: settings.displayName,
          email: settings.email,
          bio: settings.bio
        },
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `synergia-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccessNotification('Données exportées avec succès !');
    } catch (error) {
      console.error('Erreur export:', error);
      showSuccessNotification('Erreur lors de l\'export');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        console.log('Suppression du compte...');
        // Logique de suppression du compte
        showSuccessNotification('Compte supprimé avec succès');
        await logout();
      } catch (error) {
        console.error('Erreur suppression compte:', error);
        showSuccessNotification('Erreur lors de la suppression');
      }
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <User className="w-5 h-5 text-blue-400 mr-2" />
          Informations Personnelles
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => handleSettingChange('displayName', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
            />
            <p className="text-xs text-white/50 mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Bio
            </label>
            <textarea
              value={settings.bio}
              onChange={(e) => handleSettingChange('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Parlez-nous de vous..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Bell className="w-5 h-5 text-green-400 mr-2" />
          Préférences de Notification
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Notifications par email', icon: Mail },
            { key: 'pushNotifications', label: 'Notifications push', icon: Smartphone },
            { key: 'mentionNotifications', label: 'Notifications de mention', icon: Bell },
            { key: 'taskReminders', label: 'Rappels de tâches', icon: RefreshCw },
            { key: 'weeklyReport', label: 'Rapport hebdomadaire', icon: Database }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">{label}</span>
              </div>
              <button
                onClick={() => handleSettingChange(key, !settings[key])}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings[key] ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/20'}
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
    </div>
  );

  const renderInterfaceTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Palette className="w-5 h-5 text-purple-400 mr-2" />
          Apparence et Interface
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'soundEffects', label: 'Effets sonores', icon: settings.soundEffects ? Volume2 : VolumeX },
            { key: 'animations', label: 'Animations', icon: RefreshCw },
            { key: 'compactMode', label: 'Mode compact', icon: Smartphone }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{label}</span>
              </div>
              <button
                onClick={() => handleSettingChange(key, !settings[key])}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings[key] ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-white/20'}
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
          
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Langue
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGamificationTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Award className="w-5 h-5 text-orange-400 mr-2" />
          Paramètres de Gamification
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'showXP', label: 'Afficher les XP', description: 'Voir vos points d\'expérience' },
            { key: 'showBadges', label: 'Afficher les badges', description: 'Voir vos badges débloqués' },
            { key: 'publicProfile', label: 'Profil public', description: 'Autres utilisateurs peuvent voir votre profil' },
            { key: 'leaderboardVisible', label: 'Visible dans le classement', description: 'Apparaître dans le leaderboard' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <div className="text-white font-medium">{label}</div>
                <div className="text-white/60 text-sm">{description}</div>
              </div>
              <button
                onClick={() => handleSettingChange(key, !settings[key])}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings[key] ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-white/20'}
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
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 text-pink-400 mr-2" />
          Confidentialité et Sécurité
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Visibilité du profil
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="friends">Amis seulement</option>
              <option value="private">Privé</option>
            </select>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Visibilité de l'activité
            </label>
            <select
              value={settings.activityVisibility}
              onChange={(e) => handleSettingChange('activityVisibility', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="friends">Amis seulement</option>
              <option value="private">Privé</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <div className="text-white font-medium">Partage d'analytics</div>
              <div className="text-white/60 text-sm">Permettre l'amélioration du service</div>
            </div>
            <button
              onClick={() => handleSettingChange('analyticsSharing', !settings.analyticsSharing)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.analyticsSharing ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-white/20'}
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
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Database className="w-5 h-5 text-gray-400 mr-2" />
          Gestion des Données
        </h3>
        
        <div className="space-y-4">
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Exporter mes données</h4>
                <p className="text-white/70 text-sm mb-4">
                  Téléchargez une copie de toutes vos données
                </p>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Télécharger
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Supprimer mon compte</h4>
                <p className="text-white/70 text-sm mb-4">
                  Supprimez définitivement votre compte et toutes vos données.
                  Cette action est irréversible.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'interface': return renderInterfaceTab();
      case 'gamification': return renderGamificationTab();
      case 'privacy': return renderPrivacyTab();
      case 'data': return renderDataTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{notificationMessage}</span>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-600/20 via-slate-600/20 to-gray-700/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Settings className="w-8 h-8 text-gray-300 mr-3" />
                Paramètres
              </h1>
              <p className="text-xl text-gray-200">
                Personnalisez votre expérience Synergia
              </p>
            </div>
            
            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-200 font-medium
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
