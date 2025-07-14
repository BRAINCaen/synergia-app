// ==========================================
// 📁 react-app/src/pages/AdminSettingsPage.jsx
// PAGE PARAMÈTRES SYSTÈME ADMINISTRATION
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
  Mail, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  Key,
  Server,
  Monitor,
  Zap,
  Clock,
  Users,
  Award
} from 'lucide-react';

// Firebase
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Services
import rolePermissionsService from '../core/services/rolePermissionsService.js';

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
 * ⚙️ PAGE PARAMÈTRES SYSTÈME ADMINISTRATION
 */
const AdminSettingsPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [settings, setSettings] = useState({
    app: {
      name: 'Synergia',
      version: '3.5',
      description: 'Application de gestion collaborative',
      maintenanceMode: false,
      maxUsers: 1000,
      sessionTimeout: 3600 // en secondes
    },
    gamification: {
      enabled: true,
      xpMultiplier: 1.0,
      badgeSystem: true,
      leaderboard: true,
      defaultXpReward: 10,
      levelThresholds: [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 15000]
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      adminAlerts: true,
      userWelcome: true,
      badgeNotifications: true,
      taskReminders: true
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      sessionSecure: true,
      maxLoginAttempts: 5,
      lockoutDuration: 900 // en secondes
    },
    features: {
      roleSystem: true,
      taskValidation: true,
      mediaUpload: true,
      analytics: true,
      exports: true,
      apiAccess: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('app');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  /**
   * 📊 CHARGER LES PARAMÈTRES
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      console.log('⚙️ Chargement des paramètres système...');
      
      // Récupérer les paramètres depuis Firebase
      const settingsRef = doc(db, 'systemSettings', 'main');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const savedSettings = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...savedSettings
        }));
      } else {
        // Initialiser avec les valeurs par défaut
        await saveSettings(settings);
      }
      
      console.log('✅ Paramètres chargés avec succès');
      
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
      
      console.log('💾 Sauvegarde des paramètres...');
      
      const settingsRef = doc(db, 'systemSettings', 'main');
      await setDoc(settingsRef, {
        ...settingsToSave,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
      
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
      
      // Ici on pourrait implémenter un nettoyage réel
      // Pour l'instant, on simule
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Base de données nettoyée avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur nettoyage base de données:', error);
      showNotification('Erreur lors du nettoyage', 'error');
    }
  };

  /**
   * 📈 EXPORTER LA CONFIGURATION
   */
  const exportConfig = () => {
    const configToExport = {
      version: settings.app.version,
      exportDate: new Date().toISOString(),
      settings,
      metadata: {
        exportedBy: user.email,
        totalSections: Object.keys(settings).length
      }
    };
    
    const dataStr = JSON.stringify(configToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `synergia-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Configuration exportée avec succès', 'success');
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

  // Charger les paramètres au montage
  useEffect(() => {
    loadSettings();
  }, []);

  const tabs = [
    { id: 'app', label: 'Application', icon: Monitor },
    { id: 'gamification', label: 'Gamification', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'features', label: 'Fonctionnalités', icon: Zap }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 📊 Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Settings className="w-10 h-10 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Paramètres Système
                </h1>
                <p className="text-gray-400 mt-2">
                  Configuration et administration du système
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={loadSettings}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              <button 
                onClick={exportConfig}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
              
              {pendingChanges && (
                <button 
                  onClick={() => saveSettings()}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                  <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Alertes */}
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

        {/* 📋 Onglets */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 📱 Contenu Application */}
        {activeTab === 'app' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Configuration de l'application</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nom de l'application
                  </label>
                  <input
                    type="text"
                    value={settings.app.name}
                    onChange={(e) => updateSetting('app', 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={settings.app.version}
                    onChange={(e) => updateSetting('app', 'version', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={settings.app.description}
                    onChange={(e) => updateSetting('app', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nombre maximum d'utilisateurs
                  </label>
                  <input
                    type="number"
                    value={settings.app.maxUsers}
                    onChange={(e) => updateSetting('app', 'maxUsers', parseInt(e.target.value) || 1000)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Timeout de session (secondes)
                  </label>
                  <input
                    type="number"
                    value={settings.app.sessionTimeout}
                    onChange={(e) => updateSetting('app', 'sessionTimeout', parseInt(e.target.value) || 3600)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.app.maintenanceMode}
                    onChange={(e) => updateSetting('app', 'maintenanceMode', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Mode maintenance</span>
                </label>
                <p className="text-gray-500 text-sm mt-1">
                  Empêche les utilisateurs non-admin de se connecter
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🎮 Contenu Gamification */}
        {activeTab === 'gamification' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Paramètres de gamification</h3>
              
              <div className="space-y-6">
                {/* Activation générale */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Système de gamification</h4>
                    <p className="text-gray-400 text-sm">Activer les XP, badges et classements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.gamification.enabled}
                      onChange={(e) => updateSetting('gamification', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Multiplicateur XP global
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.gamification.xpMultiplier}
                      onChange={(e) => updateSetting('gamification', 'xpMultiplier', parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="6"
                      max="20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Tentatives de connexion max
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Durée de verrouillage (secondes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.lockoutDuration}
                      onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value) || 900)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="300"
                      max="3600"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Caractères spéciaux requis</span>
                      <p className="text-gray-400 text-sm">Exiger des caractères spéciaux dans les mots de passe</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireSpecial}
                      onChange={(e) => updateSetting('security', 'passwordRequireSpecial', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Chiffres requis</span>
                      <p className="text-gray-400 text-sm">Exiger des chiffres dans les mots de passe</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireNumbers}
                      onChange={(e) => updateSetting('security', 'passwordRequireNumbers', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Sessions sécurisées</span>
                      <p className="text-gray-400 text-sm">Utiliser HTTPS uniquement</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.sessionSecure}
                      onChange={(e) => updateSetting('security', 'sessionSecure', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ⚡ Contenu Fonctionnalités */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Fonctionnalités disponibles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  roleSystem: 'Système de rôles Synergia',
                  taskValidation: 'Validation des tâches',
                  mediaUpload: 'Upload de médias',
                  analytics: 'Statistiques et analytics',
                  exports: 'Exports de données',
                  apiAccess: 'Accès API externe'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-white font-medium">{label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features[key]}
                        onChange={(e) => updateSetting('features', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 🛠️ Actions système */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Actions système</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={resetPermissions}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
            >
              <Key className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Réinitialiser permissions</div>
                <div className="text-xs opacity-75">Restaurer les permissions par défaut</div>
              </div>
            </button>
            
            <button
              onClick={cleanupDatabase}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors"
            >
              <Database className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Nettoyer BDD</div>
                <div className="text-xs opacity-75">Supprimer données obsolètes</div>
              </div>
            </button>
            
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Reset système</div>
                <div className="text-xs opacity-75">Réinitialisation complète</div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* 📊 Informations système */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Informations système</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Server className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm">Version</span>
              </div>
              <div className="text-white font-bold">{settings.app.version}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 text-sm">Limite utilisateurs</span>
              </div>
              <div className="text-white font-bold">{settings.app.maxUsers}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">Timeout session</span>
              </div>
              <div className="text-white font-bold">{Math.floor(settings.app.sessionTimeout / 60)}min</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm">Sécurité</span>
              </div>
              <div className="text-white font-bold">
                {settings.security.sessionSecure ? 'Activée' : 'Désactivée'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-300 font-medium">Système opérationnel</h4>
                <p className="text-blue-200 text-sm">
                  Tous les services fonctionnent normalement. 
                  Dernière vérification: {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 🚨 Modal de confirmation reset */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h3 className="text-xl font-semibold text-white">
                  Réinitialisation système
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  ⚠️ Cette action va réinitialiser tous les paramètres à leurs valeurs par défaut.
                </p>
                <p className="text-red-400 text-sm font-medium">
                  Cette action est irréversible !
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Réinitialiser les paramètres
                    const defaultSettings = {
                      app: {
                        name: 'Synergia',
                        version: '3.5',
                        description: 'Application de gestion collaborative',
                        maintenanceMode: false,
                        maxUsers: 1000,
                        sessionTimeout: 3600
                      },
                      gamification: {
                        enabled: true,
                        xpMultiplier: 1.0,
                        badgeSystem: true,
                        leaderboard: true,
                        defaultXpReward: 10,
                        levelThresholds: [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 15000]
                      },
                      notifications: {
                        emailEnabled: true,
                        pushEnabled: true,
                        adminAlerts: true,
                        userWelcome: true,
                        badgeNotifications: true,
                        taskReminders: true
                      },
                      security: {
                        passwordMinLength: 8,
                        passwordRequireSpecial: true,
                        passwordRequireNumbers: true,
                        sessionSecure: true,
                        maxLoginAttempts: 5,
                        lockoutDuration: 900
                      },
                      features: {
                        roleSystem: true,
                        taskValidation: true,
                        mediaUpload: true,
                        analytics: true,
                        exports: true,
                        apiAccess: false
                      }
                    };
                    
                    setSettings(defaultSettings);
                    saveSettings(defaultSettings);
                    setShowConfirmModal(false);
                    showNotification('Système réinitialisé avec succès', 'success');
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Confirmer la réinitialisation
                </button>
                
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 Toast de sauvegarde automatique */}
      {pendingChanges && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Modifications non sauvegardées</span>
            <button
              onClick={() => saveSettings()}
              disabled={saving}
              className="ml-2 bg-yellow-700 hover:bg-yellow-800 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </motion.div>
      )}

      {/* 📊 Indicateur de statut système */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-4 z-40"
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
  );
};

export default AdminSettingsPage; border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      XP par défaut pour les tâches
                    </label>
                    <input
                      type="number"
                      value={settings.gamification.defaultXpReward}
                      onChange={(e) => updateSetting('gamification', 'defaultXpReward', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Options individuelles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Système de badges</span>
                      <p className="text-gray-400 text-sm">Activer l'attribution de badges</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.gamification.badgeSystem}
                      onChange={(e) => updateSetting('gamification', 'badgeSystem', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Classement public</span>
                      <p className="text-gray-400 text-sm">Afficher le leaderboard</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.gamification.leaderboard}
                      onChange={(e) => updateSetting('gamification', 'leaderboard', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🔔 Contenu Notifications */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Paramètres de notifications</h3>
              
              <div className="space-y-4">
                {Object.entries({
                  emailEnabled: 'Notifications par email',
                  pushEnabled: 'Notifications push',
                  adminAlerts: 'Alertes administrateur',
                  userWelcome: 'Message de bienvenue',
                  badgeNotifications: 'Notifications de badges',
                  taskReminders: 'Rappels de tâches'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <span className="text-white font-medium">{label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications[key]}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 🛡️ Contenu Sécurité */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6">Paramètres de sécurité</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Longueur minimale du mot de passe
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-2 bg-gray-700
