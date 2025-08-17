import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Globe,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Key,
  RefreshCw
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      bio: '',
      department: '',
      phone: '',
      location: ''
    },
    notifications: {
      email: true,
      push: true,
      taskAssigned: true,
      taskCompleted: false,
      badgeUnlocked: true,
      teamUpdates: true,
      newsletter: false
    },
    appearance: {
      theme: 'dark',
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      compactMode: false
    },
    security: {
      twoFactor: false,
      loginNotifications: true,
      sessionTimeout: '24h',
      allowMultipleSessions: true
    },
    privacy: {
      profileVisibility: 'team',
      activityStatus: true,
      shareStatistics: true,
      allowAnalytics: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={RefreshCw}>
        Réinitialiser
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Save}
        disabled={!hasChanges}
        onClick={handleSave}
      >
        Sauvegarder
      </PremiumButton>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'privacy', label: 'Confidentialité', icon: Eye }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulation de sauvegarde
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      alert('Paramètres sauvegardés avec succès !');
    }, 1000);
  };

  return (
    <PremiumLayout
      title="Paramètres"
      subtitle="Configuration de votre compte et préférences"
      icon={Settings}
      headerActions={headerActions}
    >
      {/* Onglets */}
      <div className="mb-6">
        <PremiumCard>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Contenu Profil */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={settings.profile.displayName}
                  onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Département
                </label>
                <input
                  type="text"
                  value={settings.profile.department}
                  onChange={(e) => updateSetting('profile', 'department', e.target.value)}
                  placeholder="Ex: Développement"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  placeholder="Parlez-nous de vous..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Contenu Notifications */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6">Préférences de notifications</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Canaux de notification</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <span className="text-white font-medium">Notifications par email</span>
                        <p className="text-gray-400 text-sm">Recevoir les notifications importantes par email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <span className="text-white font-medium">Notifications push</span>
                        <p className="text-gray-400 text-sm">Notifications instantanées sur votre appareil</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Types de notifications</h4>
                <div className="space-y-4">
                  {[
                    { key: 'taskAssigned', label: 'Nouvelle tâche assignée', description: 'Quand une tâche vous est assignée' },
                    { key: 'taskCompleted', label: 'Tâche complétée', description: 'Quand quelqu\'un complète une tâche' },
                    { key: 'badgeUnlocked', label: 'Nouveau badge', description: 'Quand vous débloquez un nouveau badge' },
                    { key: 'teamUpdates', label: 'Mises à jour équipe', description: 'Actualités et annonces de l\'équipe' },
                    { key: 'newsletter', label: 'Newsletter', description: 'Newsletter mensuelle et conseils' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">{item.label}</span>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key]}
                        onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Contenu Apparence */}
      {activeTab === 'appearance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6">Personnalisation de l'interface</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thème
                </label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dark">Sombre</option>
                  <option value="light">Clair</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Langue
                </label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={settings.appearance.timezone}
                  onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format de date
                </label>
                <select
                  value={settings.appearance.dateFormat}
                  onChange={(e) => updateSetting('appearance', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">Mode compact</span>
                  <p className="text-gray-400 text-sm">Interface plus dense avec moins d'espacement</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.appearance.compactMode}
                  onChange={(e) => updateSetting('appearance', 'compactMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Contenu Sécurité */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6">Paramètres de sécurité</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <span className="text-white font-medium">Authentification à deux facteurs</span>
                    <p className="text-gray-400 text-sm">Sécurisez votre compte avec une couche supplémentaire</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => updateSetting('security', 'twoFactor', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée de session
                  </label>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1h">1 heure</option>
                    <option value="8h">8 heures</option>
                    <option value="24h">24 heures</option>
                    <option value="7d">7 jours</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Notifications de connexion</span>
                    <p className="text-gray-400 text-sm">Recevoir un email lors des nouvelles connexions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.loginNotifications}
                    onChange={(e) => updateSetting('security', 'loginNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Sessions multiples</span>
                    <p className="text-gray-400 text-sm">Autoriser plusieurs connexions simultanées</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.allowMultipleSessions}
                    onChange={(e) => updateSetting('security', 'allowMultipleSessions', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Contenu Confidentialité */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6">Paramètres de confidentialité</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibilité du profil
                </label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="team">Équipe seulement</option>
                  <option value="private">Privé</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Statut d'activité</span>
                    <p className="text-gray-400 text-sm">Montrer quand vous êtes en ligne</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.activityStatus}
                    onChange={(e) => updateSetting('privacy', 'activityStatus', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Partager les statistiques</span>
                    <p className="text-gray-400 text-sm">Permettre à l'équipe de voir vos performances</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareStatistics}
                    onChange={(e) => updateSetting('privacy', 'shareStatistics', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">Analytics et télémétrie</span>
                    <p className="text-gray-400 text-sm">Aider à améliorer l'application</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.allowAnalytics}
                    onChange={(e) => updateSetting('privacy', 'allowAnalytics', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* Indicateur de modifications */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Modifications non sauvegardées
        </div>
      )}
    </PremiumLayout>
  );
};

export default SettingsPage;
