// ==========================================
// 📁 react-app/src/components/admin/BadgeAwardModal.jsx
// MODAL ATTRIBUTION BADGE CORRIGÉE - FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trophy, 
  Award, 
  Star, 
  Search,
  Check,
  Gift,
  Zap,
  Crown,
  Target,
  Users,
  Clock,
  Heart,
  Shield,
  Loader
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';

/**
 * 🏆 MODAL D'ATTRIBUTION DE BADGE - VERSION CORRIGÉE
 */
const BadgeAwardModal = ({ 
  isOpen, 
  user, 
  selectedBadge = null, 
  onClose, 
  onBadgeAwarded 
}) => {
  const [availableBadges, setAvailableBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState(selectedBadge?.id || '');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      console.log('🎯 Ouverture modal attribution badge pour:', user);
      loadAvailableBadges();
      setSelectedBadgeId(selectedBadge?.id || '');
      setReason(selectedBadge ? `Badge ${selectedBadge.name} attribué par admin` : '');
      setError('');
    }
  }, [isOpen, selectedBadge, user]);

  const loadAvailableBadges = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement badges disponibles...');
      const badges = await adminBadgeService.getAllBadges();
      console.log('✅ Badges chargés:', badges.length);
      setAvailableBadges(badges || []);
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      setError('Erreur lors du chargement des badges');
      setAvailableBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadgeId || !user) {
      setError('Veuillez sélectionner un badge');
      return;
    }

    if (!reason.trim()) {
      setError('Veuillez indiquer une raison');
      return;
    }

    setAwarding(true);
    setError('');

    try {
      console.log('🏆 Attribution badge:', {
        userId: user.id || user.uid,
        badgeId: selectedBadgeId,
        reason: reason.trim()
      });

      const result = await adminBadgeService.awardBadgeToUser(
        user.id || user.uid, 
        selectedBadgeId, 
        reason.trim()
      );
      
      if (result.success) {
        console.log('✅ Badge attribué avec succès');
        
        // Notifier le parent
        if (onBadgeAwarded) {
          onBadgeAwarded(user.id || user.uid, selectedBadgeId, reason.trim());
        }
        
        // Fermer le modal
        onClose();
      } else {
        console.error('❌ Échec attribution:', result.message);
        setError(result.message || 'Erreur lors de l\'attribution du badge');
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      setError('Erreur lors de l\'attribution du badge : ' + error.message);
    } finally {
      setAwarding(false);
    }
  };

  // Filtrer les badges selon la recherche
  const filteredBadges = availableBadges.filter(badge =>
    (badge.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (badge.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBadgeData = availableBadges.find(b => b.id === selectedBadgeId);

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      uncommon: 'from-green-400 to-green-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-600'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      common: Star,
      uncommon: Target,
      rare: Award,
      epic: Crown,
      legendary: Trophy
    };
    return icons[rarity] || Star;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Attribuer un Badge</h2>
                <p className="text-sm text-gray-600">
                  À {user?.displayName || user?.email || 'Utilisateur'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Recherche de badges */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un badge
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou description du badge..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Liste des badges */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sélectionner un badge ({filteredBadges.length} disponibles)
              </label>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Chargement des badges...</span>
                </div>
              ) : filteredBadges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucun badge trouvé' : 'Aucun badge disponible'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {filteredBadges.map((badge) => {
                    const RarityIcon = getRarityIcon(badge.rarity);
                    const isSelected = selectedBadgeId === badge.id;
                    
                    return (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadgeId(badge.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-white`}>
                            {badge.icon || '🏆'}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{badge.name}</h4>
                              <RarityIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {badge.description || 'Aucune description'}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{badge.xpReward || 50} XP</span>
                              <span className="capitalize">{badge.rarity || 'commun'}</span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Aperçu du badge sélectionné */}
            {selectedBadgeData && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Badge sélectionné</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRarityColor(selectedBadgeData.rarity)} flex items-center justify-center text-white text-lg`}>
                    {selectedBadgeData.icon || '🏆'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBadgeData.name}</p>
                    <p className="text-sm text-gray-600">{selectedBadgeData.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Récompense: {selectedBadgeData.xpReward || 50} XP
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Raison de l'attribution */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de l'attribution *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez pourquoi ce badge est attribué..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={awarding}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleAwardBadge}
              disabled={!selectedBadgeId || !reason.trim() || awarding}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {awarding ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Attribution...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Attribuer le badge
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeAwardModal;
