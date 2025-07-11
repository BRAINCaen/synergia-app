// ==========================================
// 📁 react-app/src/components/gamification/BadgeGallery.jsx
// GALERIE INTERACTIVE DES BADGES - 500+ BADGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Filter, 
  Search, 
  Eye,
  Lock,
  Crown,
  Zap,
  Calendar,
  User
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { badgeEngine, getBadgesByRole, getBadgeStats } from '../../core/services/badgeEngine.js';

/**
 * 🎖️ COMPOSANT CARTE DE BADGE
 */
const BadgeCard = ({ badge, isEarned, onClick, progress }) => {
  const getRarityColor = (xpReward) => {
    if (xpReward >= 200) return 'from-purple-500 to-pink-500 border-purple-300';
    if (xpReward >= 100) return 'from-blue-500 to-cyan-500 border-blue-300';
    if (xpReward >= 50) return 'from-green-500 to-emerald-500 border-green-300';
    return 'from-gray-500 to-slate-500 border-gray-300';
  };

  const getRarityText = (xpReward) => {
    if (xpReward >= 200) return 'LÉGENDAIRE';
    if (xpReward >= 100) return 'RARE';
    if (xpReward >= 50) return 'COMMUN';
    return 'BRONZE';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300
        ${isEarned 
          ? `bg-gradient-to-br ${getRarityColor(badge.xpReward)} border-2` 
          : 'bg-gray-100 border-2 border-gray-200'
        }
      `}
    >
      {/* Badge gagné */}
      {isEarned ? (
        <div className="p-6 text-white relative">
          {/* Badge rareté */}
          <div className="absolute top-2 right-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-xs font-bold">{getRarityText(badge.xpReward)}</span>
            </div>
          </div>
          
          {/* Icône du badge */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-3xl">{badge.icon}</span>
            </div>
          </div>
          
          {/* Infos badge */}
          <h3 className="font-bold text-lg text-center mb-2">{badge.name}</h3>
          <p className="text-white/90 text-sm text-center mb-3">{badge.description}</p>
          
          {/* XP Reward */}
          <div className="flex items-center justify-center space-x-1 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">+{badge.xpReward}</span>
          </div>
          
          {/* Date d'obtention si disponible */}
          {badge.earnedAt && (
            <div className="mt-2 text-center">
              <span className="text-xs bg-white/20 rounded-full px-2 py-1 backdrop-blur-sm">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Badge non gagné */
        <div className="p-6 text-gray-600 relative">
          {/* Icône verrouillée */}
          <div className="absolute top-2 right-2">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Icône du badge (grisée) */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
              <span className="text-3xl opacity-50">{badge.icon}</span>
            </div>
          </div>
          
          {/* Infos badge */}
          <h3 className="font-bold text-lg text-center mb-2 text-gray-700">{badge.name}</h3>
          <p className="text-gray-500 text-sm text-center mb-3">{badge.description}</p>
          
          {/* Progression si disponible */}
          {progress && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* XP Reward */}
          <div className="flex items-center justify-center space-x-1 bg-gray-200 rounded-full px-3 py-1">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-600">+{badge.xpReward}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * 🏆 COMPOSANT PRINCIPAL DE LA GALERIE
 */
const BadgeGallery = () => {
  const { user } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les badges au montage
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const userRole = user?.role || 'Général';
        const allBadges = getBadgesByRole(userRole);
        const earnedBadges = user?.badges || [];
        
        setBadges(allBadges);
        setUserBadges(earnedBadges);
        setFilteredBadges(allBadges);
        setLoading(false);
        
        console.log('🎖️ Badges chargés:', allBadges.length, 'total,', earnedBadges.length, 'gagnés');
      } catch (error) {
        console.error('❌ Erreur chargement badges:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadBadges();
    }
  }, [user]);

  // Filtrer les badges
  useEffect(() => {
    let filtered = badges;

    // Filtre par catégorie/rôle
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => 
        badge.role.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre badges gagnés seulement
    if (showEarnedOnly) {
      filtered = filtered.filter(badge =>
        userBadges.some(ub => ub.id === badge.id)
      );
    }

    setFilteredBadges(filtered);
  }, [badges, userBadges, selectedCategory, searchTerm, showEarnedOnly]);

  // Obtenir les catégories disponibles
  const getCategories = () => {
    const categories = [...new Set(badges.map(badge => badge.role))];
    return [
      { id: 'all', name: 'Tous les badges', count: badges.length },
      ...categories.map(cat => ({
        id: cat,
        name: cat,
        count: badges.filter(b => b.role === cat).length
      }))
    ];
  };

  // Vérifier si un badge est gagné
  const isBadgeEarned = (badgeId) => {
    return userBadges.some(ub => ub.id === badgeId);
  };

  // Obtenir les statistiques
  const stats = getBadgeStats(userBadges, user?.role || 'Général');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement des badges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏆 Galerie de Badges</h2>
            <p className="opacity-90">Découvrez et collectionnez tous les badges disponibles</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.earned}/{stats.total}</div>
            <div className="text-sm opacity-90">Badges collectés</div>
            <div className="mt-2">
              <div className="bg-white/20 rounded-full h-2 w-32">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completion}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{stats.completion}% complété</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un badge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par catégorie */}
          <div className="min-w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {getCategories().map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle badges gagnés */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(e) => setShowEarnedOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium">Badges gagnés uniquement</span>
            </label>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.earned}</div>
          <div className="text-sm text-gray-500">Badges gagnés</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.remaining}</div>
          <div className="text-sm text-gray-500">À débloquer</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.completion}%</div>
          <div className="text-sm text-gray-500">Complété</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <User className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{user?.role || 'Général'}</div>
          <div className="text-sm text-gray-500">Rôle actuel</div>
        </div>
      </div>

      {/* Grille des badges */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {filteredBadges.length} badge{filteredBadges.length !== 1 ? 's' : ''} 
            {selectedCategory !== 'all' && ` - ${selectedCategory}`}
          </h3>
          <div className="text-sm text-gray-500">
            {searchTerm && `Recherche: "${searchTerm}"`}
          </div>
        </div>

        {filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Essayez avec des mots-clés différents'
                : showEarnedOnly 
                  ? 'Vous n\'avez pas encore gagné de badges dans cette catégorie'
                  : 'Aucun badge disponible dans cette catégorie'
              }
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={isBadgeEarned(badge.id)}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{selectedBadge.name}</h3>
                <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rôle :</span>
                    <span className="font-medium">{selectedBadge.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Récompense :</span>
                    <span className="font-medium text-blue-600">+{selectedBadge.xpReward} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className={`font-medium ${isBadgeEarned(selectedBadge.id) ? 'text-green-600' : 'text-orange-600'}`}>
                      {isBadgeEarned(selectedBadge.id) ? 'Débloqué ✅' : 'Verrouillé 🔒'}
                    </span>
                  </div>
                  
                  {/* Date d'obtention si gagné */}
                  {isBadgeEarned(selectedBadge.id) && (
                    <div className="flex justify-between">
                      <span>Obtenu le :</span>
                      <span className="font-medium">
                        {userBadges.find(ub => ub.id === selectedBadge.id)?.earnedAt 
                          ? new Date(userBadges.find(ub => ub.id === selectedBadge.id).earnedAt).toLocaleDateString()
                          : 'Date inconnue'
                        }
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeGallery;
