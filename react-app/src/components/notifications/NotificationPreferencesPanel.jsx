// ==========================================
// react-app/src/components/notifications/NotificationPreferencesPanel.jsx
// PANNEAU DE PRÉFÉRENCES DE NOTIFICATIONS
// Synergia v4.1.0
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Info,
  Loader2,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Settings
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import externalNotificationService, {
  NOTIFICATION_CATEGORIES,
  getDefaultPreferences
} from '../../core/services/externalNotificationService';

// ==========================================
// COMPOSANT TOGGLE SWITCH
// ==========================================
const ToggleSwitch = ({ enabled, onChange, disabled = false, size = 'md' }) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' }
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex ${s.track} items-center rounded-full transition-colors duration-200
        ${enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block ${s.thumb} transform rounded-full bg-white shadow-lg transition-transform duration-200
          ${enabled ? s.translate : 'translate-x-0.5'}
        `}
      />
    </button>
  );
};

// ==========================================
// COMPOSANT CATÉGORIE DE NOTIFICATIONS
// ==========================================
const NotificationCategory = ({
  category,
  preferences,
  onToggleCategory,
  onToggleEvent,
  expanded,
  onToggleExpand
}) => {
  const categoryPrefs = preferences.categories?.[category.id] || { enabled: true, events: {} };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* En-tête catégorie */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h4 className="text-white font-medium">{category.label}</h4>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch
            enabled={categoryPrefs.enabled}
            onChange={(val) => onToggleCategory(category.id, val)}
          />
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Événements de la catégorie */}
      <AnimatePresence>
        {expanded && categoryPrefs.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              {/* En-têtes colonnes */}
              <div className="flex items-center justify-end gap-8 pb-2 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  Push
                </div>
              </div>

              {/* Liste des événements */}
              {category.events.map(event => {
                const eventPrefs = categoryPrefs.events?.[event.id] || {
                  email: event.defaultEmail,
                  push: event.defaultPush
                };

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-gray-300 text-sm">{event.label}</span>
                    <div className="flex items-center gap-8">
                      <ToggleSwitch
                        size="sm"
                        enabled={eventPrefs.email}
                        onChange={(val) => onToggleEvent(category.id, event.id, 'email', val)}
                        disabled={!preferences.emailEnabled}
                      />
                      <ToggleSwitch
                        size="sm"
                        enabled={eventPrefs.push}
                        onChange={(val) => onToggleEvent(category.id, event.id, 'push', val)}
                        disabled={!preferences.pushEnabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
const NotificationPreferencesPanel = () => {
  const { user } = useAuthStore();

  const [preferences, setPreferences] = useState(getDefaultPreferences());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [pushPermission, setPushPermission] = useState('default');
  const [showSaved, setShowSaved] = useState(false);

  // Charger les préférences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const prefs = await externalNotificationService.getUserPreferences(user.uid);
        setPreferences(prefs);

        // Vérifier le support des notifications push
        if ('Notification' in window) {
          setPushPermission(Notification.permission);
        } else {
          setPushSupported(false);
        }
      } catch (error) {
        console.error('Erreur chargement préférences:', error);
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user?.uid]);

  // Sauvegarder les préférences
  const savePreferences = async () => {
    if (!user?.uid || !hasChanges) return;

    setSaving(true);
    try {
      await externalNotificationService.saveUserPreferences(user.uid, preferences);
      setHasChanges(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
    }
    setSaving(false);
  };

  // Demander permission push
  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        // Ici on pourrait initialiser le service worker et récupérer le token FCM
        updatePreference('pushEnabled', true);
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
    }
  };

  // Mise à jour d'une préférence
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Toggle catégorie
  const handleToggleCategory = (categoryId, enabled) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          enabled
        }
      }
    }));
    setHasChanges(true);
  };

  // Toggle événement
  const handleToggleEvent = (categoryId, eventId, channel, enabled) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          events: {
            ...prev.categories[categoryId]?.events,
            [eventId]: {
              ...prev.categories[categoryId]?.events?.[eventId],
              [channel]: enabled
            }
          }
        }
      }
    }));
    setHasChanges(true);
  };

  // Toggle expansion catégorie
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton sauvegarder */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Préférences de Notifications
          </h3>
          <p className="text-gray-400 mt-1">
            Choisissez comment et quand recevoir vos notifications
          </p>
        </div>

        <AnimatePresence mode="wait">
          {hasChanges ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={savePreferences}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Sauvegarder
            </motion.button>
          ) : showSaved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Sauvegardé !
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ========== SECTION GLOBALE ========== */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Paramètres généraux
        </h4>

        <div className="space-y-4">
          {/* Master switch */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-white font-medium">Activer les notifications</span>
                <p className="text-gray-400 text-sm">Désactiver pour ne recevoir aucune notification</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={preferences.enabled}
              onChange={(val) => updatePreference('enabled', val)}
            />
          </div>

          {/* Email notifications */}
          <div className={`flex items-center justify-between p-4 bg-white/5 rounded-xl transition-opacity ${!preferences.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-white font-medium">Notifications par email</span>
                <p className="text-gray-400 text-sm">Recevoir les notifications sur {user?.email}</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={preferences.emailEnabled}
              onChange={(val) => updatePreference('emailEnabled', val)}
              disabled={!preferences.enabled}
            />
          </div>

          {/* Push notifications */}
          <div className={`flex items-center justify-between p-4 bg-white/5 rounded-xl transition-opacity ${!preferences.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <span className="text-white font-medium">Notifications push</span>
                <p className="text-gray-400 text-sm">
                  {!pushSupported ? (
                    'Non supporté par votre navigateur'
                  ) : pushPermission === 'denied' ? (
                    'Bloqué - Modifiez les permissions du navigateur'
                  ) : pushPermission === 'granted' ? (
                    'Recevoir des notifications sur cet appareil'
                  ) : (
                    'Cliquez pour activer les notifications push'
                  )}
                </p>
              </div>
            </div>
            {pushPermission !== 'granted' && pushSupported && pushPermission !== 'denied' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={requestPushPermission}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg"
              >
                Activer
              </motion.button>
            ) : (
              <ToggleSwitch
                enabled={preferences.pushEnabled && pushPermission === 'granted'}
                onChange={(val) => updatePreference('pushEnabled', val)}
                disabled={!preferences.enabled || pushPermission !== 'granted'}
              />
            )}
          </div>
        </div>
      </div>

      {/* ========== SECTION HEURES CALMES ========== */}
      <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-opacity ${!preferences.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-400" />
          Heures calmes
        </h4>

        <div className="space-y-4">
          {/* Toggle heures calmes */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <span className="text-white font-medium">Activer les heures calmes</span>
              <p className="text-gray-400 text-sm">Pause des notifications pendant ces heures</p>
            </div>
            <ToggleSwitch
              enabled={preferences.quietHoursEnabled}
              onChange={(val) => updatePreference('quietHoursEnabled', val)}
            />
          </div>

          {/* Plage horaire */}
          {preferences.quietHoursEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
            >
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-3">
                <span className="text-gray-300">De</span>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                />
                <span className="text-gray-300">à</span>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                />
              </div>
            </motion.div>
          )}

          {/* Weekend */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-white font-medium">Notifications le weekend</span>
                <p className="text-gray-400 text-sm">Recevoir des notifications samedi et dimanche</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={preferences.weekendNotifications}
              onChange={(val) => updatePreference('weekendNotifications', val)}
            />
          </div>
        </div>
      </div>

      {/* ========== SECTION PAR CATÉGORIE ========== */}
      <div className={`space-y-4 transition-opacity ${!preferences.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Notifications par catégorie
        </h4>

        <div className="space-y-3">
          {Object.values(NOTIFICATION_CATEGORIES).map(category => (
            <NotificationCategory
              key={category.id}
              category={category}
              preferences={preferences}
              expanded={expandedCategories[category.id]}
              onToggleCategory={handleToggleCategory}
              onToggleEvent={handleToggleEvent}
              onToggleExpand={() => toggleCategoryExpand(category.id)}
            />
          ))}
        </div>
      </div>

      {/* ========== INFO ========== */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-200 text-sm">
            <strong>Note :</strong> Les notifications par email et push sont envoyées en fonction de vos préférences.
            Assurez-vous que l'adresse email <strong>{user?.email}</strong> est valide pour recevoir les emails.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPanel;
