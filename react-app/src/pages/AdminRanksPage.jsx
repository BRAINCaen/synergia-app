// ==========================================
// react-app/src/pages/AdminRanksPage.jsx
// PAGE ADMIN - GESTION DES RANGS
// Permet aux admins de modifier les noms, icônes et descriptions des rangs
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Save,
  RefreshCw,
  Edit,
  X,
  Check,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
  Star,
  Shield,
  Target,
  Gift
} from 'lucide-react';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Firebase & Services
import {
  getRanks,
  updateRank,
  saveAllRanks,
  resetRanksToDefault,
  loadRanksFromFirebase,
  subscribeToRanks,
  DEFAULT_RANKS,
  generateLevelGrid
} from '../core/services/levelService.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

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

// Emojis disponibles pour les rangs
const AVAILABLE_ICONS = [
  '🌱', '⚔️', '🏹', '🛡️', '🏆', '👑', '✨', '🌟', '💎',
  '🎯', '🔥', '⚡', '💪', '🎖️', '🥇', '🥈', '🥉', '🏅',
  '🦁', '🦅', '🐉', '🦊', '🐺', '🦈', '🦋', '🌈', '☀️',
  '🌙', '⭐', '💫', '🎭', '🎪', '🎨', '🎸', '🎵', '🎮'
];

// Couleurs Tailwind disponibles
const AVAILABLE_COLORS = [
  { id: 'gray', gradient: 'from-gray-400 to-gray-500', text: 'text-gray-300' },
  { id: 'green', gradient: 'from-green-500 to-emerald-600', text: 'text-green-400' },
  { id: 'blue', gradient: 'from-blue-500 to-cyan-600', text: 'text-blue-400' },
  { id: 'purple', gradient: 'from-purple-500 to-violet-600', text: 'text-purple-400' },
  { id: 'yellow', gradient: 'from-yellow-500 to-orange-600', text: 'text-yellow-400' },
  { id: 'orange', gradient: 'from-orange-500 to-red-600', text: 'text-orange-400' },
  { id: 'pink', gradient: 'from-pink-500 to-rose-600', text: 'text-pink-400' },
  { id: 'amber', gradient: 'from-amber-400 via-yellow-500 to-amber-600', text: 'text-amber-400' },
  { id: 'cyan', gradient: 'from-cyan-400 via-blue-500 to-purple-600', text: 'text-cyan-300' },
  { id: 'red', gradient: 'from-red-500 to-rose-600', text: 'text-red-400' },
  { id: 'indigo', gradient: 'from-indigo-500 to-purple-600', text: 'text-indigo-400' },
  { id: 'teal', gradient: 'from-teal-500 to-cyan-600', text: 'text-teal-400' }
];

/**
 * Composant carte de rang éditable
 */
const RankCard = ({ rank, onEdit, isEditing, onSave, onCancel, editData, setEditData }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
        isEditing ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700/50 hover:border-gray-600'
      }`}
    >
      {isEditing ? (
        // Mode édition
        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nom du rang</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Icône */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Icône</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setEditData({ ...editData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    editData.icon === icon
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setEditData({ ...editData, color: color.gradient, textColor: color.text })}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.gradient} transition-all ${
                    editData.color === color.gradient ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={2}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Boost XP */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Boost XP (multiplicateur)</label>
            <input
              type="number"
              step="0.05"
              min="1"
              max="3"
              value={editData.boost}
              onChange={(e) => setEditData({ ...editData, boost: parseFloat(e.target.value) || 1 })}
              className="w-32 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Boutons actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      ) : (
        // Mode affichage
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rank.color} flex items-center justify-center text-2xl`}>
                {rank.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{rank.name}</h3>
                <p className="text-sm text-gray-400">Niveaux {rank.minLevel} - {rank.maxLevel}</p>
              </div>
            </div>
            <button
              onClick={() => onEdit(rank)}
              className="p-2 bg-gray-700/50 hover:bg-blue-600/50 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-3">{rank.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span>Boost x{rank.boost || 1}</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span>{rank.maxLevel - rank.minLevel + 1} niveaux</span>
            </div>
          </div>

          {rank.perks && rank.perks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex flex-wrap gap-1">
                {rank.perks.map((perk, i) => (
                  <span key={i} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

/**
 * Page Admin Rangs
 */
const AdminRanksPage = () => {
  const { user } = useAuthStore();
  const [ranks, setRanks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRankId, setEditingRankId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showLevelGrid, setShowLevelGrid] = useState(false);

  // Charger les rangs au montage
  useEffect(() => {
    const loadRanks = async () => {
      setLoading(true);
      try {
        await loadRanksFromFirebase();
        setRanks(getRanks());
      } catch (error) {
        console.error('Erreur chargement rangs:', error);
        showNotification('Erreur lors du chargement des rangs', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadRanks();

    // S'abonner aux changements
    const unsubscribe = subscribeToRanks((updatedRanks) => {
      setRanks(updatedRanks);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Démarrer l'édition d'un rang
  const handleEdit = (rank) => {
    setEditingRankId(rank.id);
    setEditData({ ...rank });
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!editData || !editingRankId) return;

    setSaving(true);
    try {
      await updateRank(editingRankId, editData);
      setRanks(getRanks());
      setEditingRankId(null);
      setEditData(null);
      showNotification(`Rang "${editData.name}" mis à jour avec succès !`, 'success');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setEditingRankId(null);
    setEditData(null);
  };

  // Réinitialiser par défaut
  const handleReset = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les rangs par défaut ?')) {
      return;
    }

    setSaving(true);
    try {
      await resetRanksToDefault();
      setRanks(getRanks());
      showNotification('Rangs réinitialisés par défaut', 'success');
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      showNotification('Erreur lors de la réinitialisation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Trier les rangs par niveau minimum
  const sortedRanks = Object.values(ranks).sort((a, b) => a.minLevel - b.minLevel);

  // Grille des niveaux
  const levelGrid = generateLevelGrid(100);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-400" />
                  Gestion des Rangs
                </h1>
                <p className="text-gray-400 mt-1">
                  Personnalisez les noms, icônes et descriptions des rangs
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLevelGrid(!showLevelGrid)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  {showLevelGrid ? 'Masquer grille' : 'Voir grille niveaux'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Total Rangs</div>
              <div className="text-2xl font-bold text-white">{Object.keys(ranks).length}</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Niveaux Max</div>
              <div className="text-2xl font-bold text-purple-400">100</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">XP par Niveau</div>
              <div className="text-2xl font-bold text-yellow-400">500</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Boost Max</div>
              <div className="text-2xl font-bold text-green-400">x2.0</div>
            </div>
          </div>

          {/* Grille des niveaux */}
          <AnimatePresence>
            {showLevelGrid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Grille des 100 Niveaux
                  </h3>
                  <div className="grid grid-cols-10 gap-1 text-xs">
                    {levelGrid.slice(0, 100).map((item) => {
                      const rank = sortedRanks.find(r => item.level >= r.minLevel && item.level <= r.maxLevel);
                      return (
                        <div
                          key={item.level}
                          className={`p-2 rounded text-center bg-gradient-to-br ${rank?.color || 'from-gray-600 to-gray-700'}`}
                          title={`Niveau ${item.level} - ${rank?.name || 'N/A'} - ${item.xpRequired.toLocaleString()} XP`}
                        >
                          <div className="font-bold text-white">{item.level}</div>
                          <div className="text-white/70">{rank?.icon}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Liste des rangs */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRanks.map((rank) => (
                <RankCard
                  key={rank.id}
                  rank={rank}
                  isEditing={editingRankId === rank.id}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  editData={editingRankId === rank.id ? editData : null}
                  setEditData={setEditData}
                />
              ))}
            </div>
          )}

          {/* Tableau récapitulatif */}
          <div className="mt-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Récapitulatif des Paliers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Rang</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Niveaux</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">XP Requis</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Boost</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Temps estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRanks.map((rank) => {
                    const xpStart = (rank.minLevel - 1) * 500;
                    const xpEnd = (rank.maxLevel - 1) * 500;
                    const monthsStart = Math.round(xpStart / 1250 * 10) / 10;
                    const monthsEnd = Math.round(xpEnd / 1250 * 10) / 10;

                    return (
                      <tr key={rank.id} className="border-t border-gray-700/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{rank.icon}</span>
                            <span className={`font-medium ${rank.textColor}`}>{rank.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white">
                          {rank.minLevel} - {rank.maxLevel}
                        </td>
                        <td className="px-4 py-3 text-yellow-400">
                          {xpStart.toLocaleString()} - {xpEnd.toLocaleString()} XP
                        </td>
                        <td className="px-4 py-3 text-green-400">
                          x{rank.boost || 1}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {monthsStart === 0 ? 'Départ' : `${monthsStart} - ${monthsEnd} mois`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminRanksPage;
