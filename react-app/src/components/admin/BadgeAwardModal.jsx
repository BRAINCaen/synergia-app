// ==========================================
// 📁 react-app/src/components/admin/BadgeAwardModal.jsx
// MODAL POUR ATTRIBUER UN BADGE À UN UTILISATEUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Award, 
  Search, 
  Trophy, 
  User, 
  MessageSquare,
  CheckCircle,
  Star
} from 'lucide-react';

/**
 * 🏆 MODAL ATTRIBUTION DE BADGE
 */
const BadgeAwardModal = ({ 
  isOpen, 
  user, 
  preselectedBadge, 
  allBadges, 
  onClose, 
  onBadgeAwarded 
}) => {
  const [selectedBadge, setSelectedBadge] = useState(preselectedBadge || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [filteredBadges, setFilteredBadges] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Filtrer les badges déjà obtenus par l'utilisateur
      const userBadgeIds = (user?.badges || []).map(b => b.badgeId || b.id);
      const availableBadges = allBadges.filter(badge => 
        !userBadgeIds.includes(badge.id) && badge.isActive !== false
      );
      setFilteredBadges(availableBadges);
      
      // Réinitialiser les champs
      setSelectedBadge(preselectedBadge || null);
      setReason('');
      setSearchTerm('');
    }
  }, [isOpen, user, allBadges, preselectedBadge]);

  // Filtrer par terme de recherche
  useEffect(() => {
    if (!searchTerm) {
      const userBadgeIds = (user?.badges || []).map(b => b.badgeId || b.id);
      const availableBadges = allBadges.filter(badge => 
        !userBadgeIds.includes(badge.id) && badge.isActive !== false
      );
      setFilteredBadges(availableBadges);
    } else {
      const userBadgeIds = (user?.badges || []).map(b => b.badgeId || b.id);
      const filtered = allBadges.filter(badge => 
        !userBadgeIds.includes(badge.id) &&
        badge.isActive !== false &&
        (badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         badge.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBadges(filtered);
    }
  }, [searchTerm, allBadges, user]);

  const handleAward = async () => {
    if (!selectedBadge || !user) {
      alert('Veuillez sélectionner un badge et un utilisateur');
      return;
    }

    setAwarding(true);
    try {
      await onBadgeAwarded(user.id, selectedBadge.id, reason || 'Badge attribué par admin');
      // Le parent gère la fermeture et la notification
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      alert('❌ Erreur lors de l\'attribution du badge');
    } finally {
      setAwarding(false);
    }
  };

  const getBadgeTypeColor = (type) => {
    const colors = {
      achievement: 'bg-yellow-100 text-yellow-800',
      skill: 'bg-blue-100 text-blue-800',
      special: 'bg-purple-100 text-purple-800',
      custom: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Award className="w-5 h-5" />
                Attribuer un Badge
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            
            {/* Utilisateur ciblé */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Utilisateur ciblé
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.displayName || user?.email}</p>
                  <p className="text-sm text-gray-600">
                    {(user?.badges || []).length} badges | {user?.xp || 0} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Recherche de badge */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un badge
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom ou description du badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des badges disponibles */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badges disponibles ({filteredBadges.length})
              </label>
              
              {filteredBadges.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredBadges.map((badge) => (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`cursor-pointer rounded-lg p-3 transition-all ${
                        selectedBadge?.id === badge.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {badge.imageUrl ? (
                          <img
                            src={badge.imageUrl}
                            alt={badge.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-lg">
                            {badge.icon || '🏆'}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">{badge.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${getBadgeTypeColor(badge.type)}`}>
                              {badge.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{badge.description}</p>
                          <p className="text-xs text-blue-600 font-medium">{badge.xpReward} XP</p>
                        </div>
                        
                        {selectedBadge?.id === badge.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm 
                      ? 'Aucun badge trouvé pour cette recherche'
                      : 'Cet utilisateur a déjà tous les badges disponibles'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Badge sélectionné */}
            {selectedBadge && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Badge sélectionné
                </h4>
                <div className="flex items-center gap-3">
                  {selectedBadge.imageUrl ? (
                    <img
                      src={selectedBadge.imageUrl}
                      alt={selectedBadge.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
                      {selectedBadge.icon || '🏆'}
                    </div>
                  )}
                  <div>
                    <h5 className="font-medium text-gray-900">{selectedBadge.name}</h5>
                    <p className="text-sm text-gray-600">{selectedBadge.description}</p>
                    <p className="text-sm text-blue-600 font-medium">+{selectedBadge.xpReward} XP</p>
                  </div>
                </div>
              </div>
            )}

            {/* Raison (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Raison de l'attribution (optionnel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Excellent travail sur le projet X, Performance exceptionnelle..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedBadge ? (
                <span className="text-green-600 font-medium">
                  ✓ Badge sélectionné : {selectedBadge.name}
                </span>
              ) : (
                <span>Sélectionnez un badge à attribuer</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={handleAward}
                disabled={!selectedBadge || awarding}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                {awarding ? 'Attribution...' : 'Attribuer le Badge'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BadgeAwardModal;
