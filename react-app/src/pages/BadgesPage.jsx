// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES AVEC CHARTE GRAPHIQUE SYNERGIA
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Star, 
  Award,
  CheckCircle,
  Lock,
  Grid3x3,
  List,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Sparkles,
  Crown
} from 'lucide-react';

// Layout Synergia
import Layout from '../components/layout/Layout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Badges par défaut
import { SYNERGIA_BADGES } from '../shared/config/badges.js';

/**
 * 🏆 PAGE BADGES - DESIGN SYNERGIA PREMIUM
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  
  // États
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Charger les badges
  useEffect(() => {
    if (!user) return;
    
    const loadBadges = async () => {
      try {
        // Charger les badges utilisateur
        const userBadgesRef = collection(db, 'userBadges');
        const userBadgesQuery = query(userBadgesRef, where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(userBadgesQuery, (snapshot) => {
          const earnedBadgeIds = snapshot.docs.map(doc => doc.data().badgeId);
          setUserBadges(earnedBadgeIds);
          
          // Combiner avec badges par défaut
          const combinedBadges = SYNERGIA_BADGES.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id)
          }));
          
          setAllBadges(combinedBadges);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur chargement badges:', error);
        setLoading(false);
      }
    };
    
    loadBadges();
  }, [user]);

  // Filtrer les badges
  const filteredBadges = useMemo(() => {
    return allBadges.filter(badge => {
      const matchSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      const matchRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
      
      return matchSearch && matchCategory && matchRarity;
    });
  }, [allBadges, searchTerm, selectedCategory, selectedRarity]);

  // Statistiques
  const badgeStats = useMemo(() => {
    const totalBadges = allBadges.filter(b => b.earned).length;
    const totalPossible = allBadges.length;
    const totalXP = allBadges.filter(b => b.earned).reduce((sum, b) => sum + (b.xpReward || 0), 0);
    
    return {
      totalBadges,
      totalPossible,
      percentage: totalPossible > 0 ? Math.round((totalBadges / totalPossible) * 100) : 0,
      totalXP
    };
  }, [allBadges]);

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(allBadges.map(b => b.category))];
    return ['all', ...cats];
  }, [allBadges]);

  // Couleur par rareté
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      uncommon: 'from-green-400 to-green-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Background gradient Synergia */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* 🏆 EN-TÊTE PREMIUM */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-yellow-400" />
              Collection de Badges
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Débloquez des badges en accomplissant des défis ({badgeStats.totalBadges} obtenus)
            </p>
          </motion.div>

          {/* 📊 STATISTIQUES PREMIUM */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Medal className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-semibold">Badges Obtenus</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalBadges}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold">Badges Disponibles</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalPossible - badgeStats.totalBadges}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-semibold">Progression</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.percentage}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-semibold">XP des Badges</p>
                  <p className="text-2xl font-bold text-white">{badgeStats.totalXP}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 🔍 FILTRES ET RECHERCHE PREMIUM */}
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>

              {/* Rareté */}
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">Toutes les raretés</option>
                <option value="common">Commun</option>
                <option value="uncommon">Peu commun</option>
                <option value="rare">Rare</option>
                <option value="epic">Épique</option>
                <option value="legendary">Légendaire</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400">
                {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} trouvé{filteredBadges.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 🏆 GRILLE DES BADGES PREMIUM */}
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            <AnimatePresence>
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                    badge.earned 
                      ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                      : 'border-gray-700/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Icône du badge */}
                  <div className="text-center mb-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gradient-to-br ${getRarityColor(badge.rarity)} ${
                      badge.earned ? 'shadow-xl' : 'grayscale opacity-50'
                    }`}>
                      {badge.icon}
                    </div>
                    
                    {/* Statut du badge */}
                    <div className="mt-3">
                      {badge.earned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Obtenu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-400 text-xs font-semibold rounded-full">
                          <Lock className="w-3 h-3" />
                          Verrouillé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nom et description */}
                  <h3 className={`font-bold text-lg text-center mb-2 ${
                    badge.earned ? 'text-white' : 'text-gray-400'
                  }`}>
                    {badge.name}
                  </h3>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    {badge.description}
                  </p>

                  {/* Infos badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">
                        +{badge.xpReward} XP
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                        badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                        badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {badge.rarity === 'legendary' ? '⭐ Légendaire' :
                         badge.rarity === 'epic' ? '💎 Épique' :
                         badge.rarity === 'rare' ? '💠 Rare' :
                         badge.rarity === 'uncommon' ? '✨ Peu commun' :
                         '⚪ Commun'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Message si aucun badge trouvé */}
          {filteredBadges.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Aucun badge trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos filtres de recherche
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BadgesPage;
