// ==========================================
// 📁 react-app/src/components/admin/BadgeAwardModal.jsx
// MODAL POUR ATTRIBUER UN BADGE À UN UTILISATEUR
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
  Shield
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';

/**
 * 🏆 MODAL D'ATTRIBUTION DE BADGE
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

  useEffect(() => {
    if (isOpen) {
      loadAvailableBadges();
      setSelectedBadgeId(selectedBadge?.id || '');
      setReason(selectedBadge ? `Badge ${selectedBadge.name} attribué par admin` : '');
    }
  }, [isOpen, selectedBadge]);

  const loadAvailableBadges = async () => {
    setLoading(true);
    try {
      const badges = await adminBadgeService.getAllBadges();
      setAvailableBadges(badges);
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadgeId || !user) return;

    setAwarding(true);
    try {
      await adminBadgeService.awardBadgeToUser(
        user.id, 
        selectedBadgeId, 
        reason || 'Badge attribué par admin'
      );
      
      // Notifier le parent
      if (onBadgeAwarded) {
        onBadgeAwarded(user.id, selectedBadgeId, reason);
      }
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('❌ Erreur lors de l\'attribution du badge');
    } finally {
      setAwarding(false);
    }
  };

  // Filtrer les badges selon la recherche
  const filteredBadges = availableBadges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getRarityBorder = (rarity) => {
    const colors = {
      common: 'border-gray-300',
      uncommon: 'border-green-300',
      rare: 'border-blue-300',
      epic: 'border-purple-300',
      legendary: 'border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Attribuer un Badge</h2>
                <p className="opacity-90">
                  À {user?.displayName || user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex max-h-[calc(90vh-200px)]">
            {/* Liste des badges */}
            <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Sélectionner un badge ({filteredBadges.length})
                </h3>
                
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un badge..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Chargement des badges...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBadgeId === badge.id
                          ? 'border-blue-500 bg-blue-50'
                          : `hover:border-gray-300 ${getRarityBorder(badge.rarity)}`
                      }`}
                      onClick={() => setSelectedBadgeId(badge.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(badge.rarity)} rounded-full flex items-center justify-center text-white font-bold`}>
                          {badge.imageUrl ? (
                            <img 
                              src={badge.imageUrl} 
                              alt={badge.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">{badge.icon || '🏆'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              {badge.name}
                            </h4>
                            {selectedBadgeId === badge.id && (
                              <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {badge.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                              badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              badge.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {badge.rarity || 'commun'}
                            </span>
                            <div className="flex items-center text-xs text-orange-600">
                              <Zap className="w-3 h-3 mr-1" />
                              +{badge.xpReward || 50} XP
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredBadges.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun badge trouvé</p>
                </div>
              )}
            </div>

            {/* Prévisualisation et attribution */}
            <div className="w-80 p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prévisualisation
              </h3>

              {selectedBadgeData ? (
                <div className="space-y-4">
                  {/* Badge sélectionné */}
                  <div className={`p-6 bg-gradient-to-br ${getRarityColor(selectedBadgeData.rarity)} rounded-xl text-white text-center`}>
                    <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 mb-4">
                      {selectedBadgeData.imageUrl ? (
                        <img 
                          src={selectedBadgeData.imageUrl} 
                          alt={selectedBadgeData.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{selectedBadgeData.icon || '🏆'}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{selectedBadgeData.name}</h3>
                    <p className="text-white/90 text-sm mb-3">{selectedBadgeData.description}</p>
                    <div className="flex items-center justify-center space-x-1 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-bold">+{selectedBadgeData.xpReward || 50} XP</span>
                    </div>
                  </div>

                  {/* Informations du badge */}
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rareté :</span>
                      <span className="font-medium capitalize">{selectedBadgeData.rarity || 'commun'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Catégorie :</span>
                      <span className="font-medium">{selectedBadgeData.category || 'Général'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Récompense XP :</span>
                      <span className="font-medium text-orange-600">+{selectedBadgeData.xpReward || 50}</span>
                    </div>
                  </div>

                  {/* Raison de l'attribution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison de l'attribution
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Pourquoi attribuer ce badge ? (optionnel)"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    />
                  </div>

                  {/* Bouton d'attribution */}
                  <button
                    onClick={handleAwardBadge}
                    disabled={awarding}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
                  >
                    <Gift className="w-5 h-5" />
                    <span>{awarding ? 'Attribution...' : 'Attribuer le Badge'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Sélectionnez un badge</p>
                  <p className="text-sm">pour voir la prévisualisation</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeAwardModal;
