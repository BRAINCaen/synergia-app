// ==========================================
// PAGE INTÉGRATIONS - GESTION DES CONNEXIONS TIERCES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
  Database,
  Shield,
  FolderOpen,
  Zap,
  Search,
  ChevronDown,
  ChevronRight,
  Link2,
  Unlink,
  TestTube,
  Save,
  Key,
  Globe,
  Server,
  Webhook
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import {
  integrationsService,
  INTEGRATION_CATEGORIES,
  INTEGRATIONS_CONFIG
} from '../core/services/integrations';

// ==========================================
// COMPOSANT CARTE D'INTÉGRATION
// ==========================================

const IntegrationCard = ({ integration, config, onConfigure, onToggle, onDelete, onTest }) => {
  const isConfigured = !!config;
  const isEnabled = config?.enabled;
  const category = INTEGRATION_CATEGORIES[integration.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative bg-gray-800/50 rounded-xl border overflow-hidden
        ${isEnabled ? 'border-green-500/50' : isConfigured ? 'border-yellow-500/30' : 'border-gray-700/50'}
        hover:border-gray-600 transition-all duration-300
      `}
    >
      {/* Badge statut */}
      {isConfigured && (
        <div className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
          ${isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
        `}>
          {isEnabled ? 'Actif' : 'Inactif'}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${integration.color}20` }}
          >
            {category?.emoji || '🔌'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{integration.name}</h3>
            <p className="text-sm text-gray-400 truncate">{integration.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400"
              >
                {feature}
              </span>
            ))}
            {integration.features.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{integration.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Auth type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`
            px-2 py-1 rounded text-xs font-medium flex items-center gap-1
            ${integration.authType === 'oauth2' ? 'bg-blue-500/20 text-blue-400' :
              integration.authType === 'api_key' ? 'bg-purple-500/20 text-purple-400' :
              'bg-amber-500/20 text-amber-400'}
          `}>
            {integration.authType === 'oauth2' && <Globe className="w-3 h-3" />}
            {integration.authType === 'api_key' && <Key className="w-3 h-3" />}
            {integration.authType === 'saml' && <Shield className="w-3 h-3" />}
            {integration.authType === 'oauth2' ? 'OAuth 2.0' :
             integration.authType === 'api_key' ? 'API Key' : 'SAML'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfigure(integration)}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${isConfigured
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
              }
            `}
          >
            {isConfigured ? 'Configurer' : 'Connecter'}
          </button>

          {isConfigured && (
            <>
              <button
                onClick={() => onTest(integration)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-all"
                title="Tester la connexion"
              >
                <TestTube className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggle(integration, !isEnabled)}
                className={`
                  p-2 rounded-lg transition-all
                  ${isEnabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }
                `}
                title={isEnabled ? 'Désactiver' : 'Activer'}
              >
                {isEnabled ? <Link2 className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(integration)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MODAL DE CONFIGURATION
// ==========================================

const ConfigurationModal = ({ integration, config, onSave, onClose }) => {
  const [formData, setFormData] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config?.config) {
      // Décrypter les champs sensibles pour l'affichage
      const decrypted = {};
      integration.configFields.forEach(field => {
        if (field.type === 'password' && config.config[field.key]) {
          try {
            decrypted[field.key] = atob(config.config[field.key]);
          } catch {
            decrypted[field.key] = config.config[field.key];
          }
        } else {
          decrypted[field.key] = config.config[field.key] || '';
        }
      });
      setFormData(decrypted);
    } else {
      const initial = {};
      integration.configFields.forEach(field => {
        initial[field.key] = '';
      });
      setFormData(initial);
    }
  }, [integration, config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const category = INTEGRATION_CATEGORIES[integration.category];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${integration.color}20` }}
            >
              {category?.emoji || '🔌'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{integration.name}</h2>
              <p className="text-sm text-gray-400">Configuration de l'intégration</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {integration.configFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              ) : field.type === 'password' ? (
                <div className="relative">
                  <input
                    type={showSecrets[field.key] ? 'text' : 'password'}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
          ))}

          {/* Sync options pour SIRH */}
          {integration.syncOptions && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Options de synchronisation</h3>
              <div className="space-y-2">
                {integration.syncOptions.map((option) => (
                  <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[option.key] ?? option.default}
                      onChange={(e) => setFormData({ ...formData, [option.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* OAuth info */}
          {integration.authType === 'oauth2' && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Authentification OAuth 2.0</p>
                  <p className="text-xs text-blue-400/70 mt-1">
                    Après avoir sauvegardé, vous devrez autoriser Synergia à accéder à {integration.name}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const IntegrationsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [configuredIntegrations, setConfiguredIntegrations] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [configModal, setConfigModal] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(INTEGRATION_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  // Charger les intégrations configurées
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = user?.companyId || 'default';
      const configs = await integrationsService.getCompanyIntegrations(companyId);

      const configMap = {};
      configs.forEach(config => {
        configMap[config.integrationId] = config;
      });

      setConfiguredIntegrations(configMap);
    } catch (error) {
      console.error('Erreur chargement configurations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  // Filtrer les intégrations
  const getFilteredIntegrations = () => {
    let integrations = Object.values(INTEGRATIONS_CONFIG);

    if (selectedCategory !== 'all') {
      integrations = integrations.filter(i => i.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      integrations = integrations.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
      );
    }

    return integrations;
  };

  // Grouper par catégorie
  const getGroupedIntegrations = () => {
    const filtered = getFilteredIntegrations();
    const grouped = {};

    filtered.forEach(integration => {
      if (!grouped[integration.category]) {
        grouped[integration.category] = [];
      }
      grouped[integration.category].push(integration);
    });

    return grouped;
  };

  // Handlers
  const handleConfigure = (integration) => {
    setConfigModal({
      integration,
      config: configuredIntegrations[integration.id]
    });
  };

  const handleSaveConfig = async (formData) => {
    const companyId = user?.companyId || 'default';
    const result = await integrationsService.saveIntegrationConfig(
      companyId,
      configModal.integration.id,
      formData
    );

    if (result.success) {
      await loadConfigurations();
      setConfigModal(null);
      showNotification('Configuration sauvegardée', 'success');
    } else {
      showNotification('Erreur: ' + result.error, 'error');
    }
  };

  const handleToggle = async (integration, enabled) => {
    const companyId = user?.companyId || 'default';
    const result = await integrationsService.toggleIntegration(companyId, integration.id, enabled);

    if (result.success) {
      await loadConfigurations();
      showNotification(
        enabled ? 'Intégration activée' : 'Intégration désactivée',
        'success'
      );
    }
  };

  const handleDelete = async (integration) => {
    if (!confirm(`Supprimer la configuration de ${integration.name} ?`)) return;

    const companyId = user?.companyId || 'default';
    const result = await integrationsService.deleteIntegration(companyId, integration.id);

    if (result.success) {
      await loadConfigurations();
      showNotification('Intégration supprimée', 'success');
    }
  };

  const handleTest = async (integration) => {
    const companyId = user?.companyId || 'default';
    const result = await integrationsService.testConnection(companyId, integration.id);

    showNotification(
      result.success ? 'Connexion réussie !' : `Erreur: ${result.error}`,
      result.success ? 'success' : 'error'
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Stats
  const stats = {
    total: Object.keys(INTEGRATIONS_CONFIG).length,
    configured: Object.keys(configuredIntegrations).length,
    active: Object.values(configuredIntegrations).filter(c => c.enabled).length
  };

  const grouped = getGroupedIntegrations();

  const categoryIcons = {
    calendar: Calendar,
    communication: MessageSquare,
    sirh: Database,
    sso: Shield,
    storage: FolderOpen
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  Intégrations
                </h1>
                <p className="text-gray-400 mt-2">
                  Connectez Synergia à vos outils existants
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.active}</div>
                  <div className="text-xs text-gray-400">Actives</div>
                </div>
                <div className="px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.configured}</div>
                  <div className="text-xs text-gray-400">Configurées</div>
                </div>
                <div className="px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-gray-400">Disponibles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une intégration..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Toutes
              </button>
              {Object.values(INTEGRATION_CATEGORIES).map((cat) => {
                const Icon = categoryIcons[cat.id] || Settings;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            /* Integrations by category */
            <div className="space-y-6">
              {Object.entries(grouped).map(([categoryId, integrations]) => {
                const category = INTEGRATION_CATEGORIES[categoryId];
                const Icon = categoryIcons[categoryId] || Settings;
                const isExpanded = expandedCategories[categoryId];

                return (
                  <div
                    key={categoryId}
                    className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden"
                  >
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-${category?.color || 'blue'}-500/20
                      `}>
                        <span className="text-xl">{category?.emoji}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <h2 className="text-lg font-semibold text-white">{category?.label}</h2>
                        <p className="text-sm text-gray-400">{category?.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-400">
                          {integrations.length} intégration{integrations.length > 1 ? 's' : ''}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Integrations grid */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {integrations.map((integration) => (
                              <IntegrationCard
                                key={integration.id}
                                integration={integration}
                                config={configuredIntegrations[integration.id]}
                                onConfigure={handleConfigure}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onTest={handleTest}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {Object.keys(grouped).length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400">Aucune intégration trouvée</p>
                </div>
              )}
            </div>
          )}

          {/* API REST Section */}
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Webhook className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">API REST</h3>
                <p className="text-gray-400 mb-4">
                  Intégration personnalisée via notre API REST complète.
                  Accédez à toutes les fonctionnalités de Synergia depuis vos applications.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Server className="w-4 h-4" />
                    Documentation API
                  </a>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Gérer les clés API
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuration */}
      <AnimatePresence>
        {configModal && (
          <ConfigurationModal
            integration={configModal.integration}
            config={configModal.config}
            onSave={handleSaveConfig}
            onClose={() => setConfigModal(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

// Notification helper
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

export default IntegrationsPage;
