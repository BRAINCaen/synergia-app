// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// PAGE BADGES COMPLÈTE AVEC MENU HAMBURGER IDENTIQUE AU DASHBOARD
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Crown,
  Shield,
  Gem,
  Medal,
  Gift,
  Search,
  Filter,
  Grid,
  List,
  Lock,
  Unlock,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🏆 CONSTANTES BADGES
const BADGE_CATEGORIES = {
  productivity: { label: 'Productivité', icon: Zap, color: 'yellow' },
  collaboration: { label: 'Collaboration', icon: Users, color: 'blue' },
  achievement: { label: 'Accomplissement', icon: Trophy, color: 'gold' },
  milestone: { label: 'Étapes Clés', icon: Target, color: 'green' },
  special: { label: 'Spéciaux', icon: Crown, color: 'purple' },
  streak: { label: 'Séries', icon: Gem, color: 'red' }
};

const BADGE_RARITY = {
  common: { label: 'Commun', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  uncommon: { label: 'Peu commun', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  rare: { label: 'Rare', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  epic: { label: 'Épique', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  legendary: { label: 'Légendaire', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' }
};

const BadgesPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS BADGES
  const [loading, setLoading] = useState(true);
  const [userBadges, setUserBadges] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, earned, locked
  const [sortBy, setSortBy] = useState('category');
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  // 📊 CHARGEMENT DES BADGES UTILISATEUR
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🏆 [BADGES] Chargement des badges utilisateur...');
    setLoading(true);

    const userBadgesQuery = query(
      collection(db, 'user_badges'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(userBadgesQuery, (snapshot) => {
      const badgesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        earnedAt: doc.data().earnedAt?.toDate()
      }));

      console.log('🏆 [BADGES] Badges utilisateur chargés:', badgesData.length);
      setUserBadges(badgesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🏆 BADGES SYSTÈME (Définition complète)
  const systemBadges = [
    // PRODUCTIVITÉ
    {
      id: 'first_task',
      name: 'Premier Pas',
      description: 'Terminez votre première tâche',
      icon: '🎯',
      category: 'productivity',
      rarity: 'common',
      xpReward: 50,
      requirements: { tasksCompleted: 1 }
    },
    {
      id: 'task_master_10',
      name: 'Maître des Tâches',
      description: 'Terminez 10 tâches',
      icon: '✅',
      category: 'productivity',
      rarity: 'uncommon',
      xpReward: 100,
      requirements: { tasksCompleted: 10 }
    },
    {
      id: 'task_legend_100',
      name: 'Légende des Tâches',
      description: 'Terminez 100 tâches',
      icon: '🏆',
      category: 'productivity',
      rarity: 'epic',
      xpReward: 500,
      requirements: { tasksCompleted: 100 }
    },
    
    // COLLABORATION
    {
      id: 'team_player',
      name: 'Esprit d\'Équipe',
      description: 'Rejoignez votre première équipe',
      icon: '👥',
      category: 'collaboration',
      rarity: 'common',
      xpReward: 75,
      requirements: { teamsJoined: 1 }
    },
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Aidez 5 collègues différents',
      icon: '🎓',
      category: 'collaboration',
      rarity: 'rare',
      xpReward: 200,
      requirements: { helpedColleagues: 5 }
    },
    
    // ACCOMPLISSEMENTS
    {
      id: 'first_project',
      name: 'Chef de Projet',
      description: 'Terminez votre premier projet',
      icon: '📁',
      category: 'achievement',
      rarity: 'uncommon',
      xpReward: 150,
      requirements: { projectsCompleted: 1 }
    },
    {
      id: 'speed_demon',
      name: 'Éclair',
      description: 'Terminez une tâche en moins de 30 minutes',
      icon: '⚡',
      category: 'achievement',
      rarity: 'rare',
      xpReward: 125,
      requirements: { fastTaskCompletion: true }
    },
    
    // ÉTAPES CLÉS
    {
      id: 'level_10',
      name: 'Vétéran',
      description: 'Atteignez le niveau 10',
      icon: '🌟',
      category: 'milestone',
      rarity: 'rare',
      xpReward: 300,
      requirements: { level: 10 }
    },
    {
      id: 'xp_master_1000',
      name: 'Maître XP',
      description: 'Gagnez 1000 points d\'expérience',
      icon: '💎',
      category: 'milestone',
      rarity: 'epic',
      xpReward: 250,
      requirements: { totalXp: 1000 }
    },
    
    // SÉRIES
    {
      id: 'week_streak',
      name: 'Assidu',
      description: 'Connectez-vous 7 jours de suite',
      icon: '🔥',
      category: 'streak',
      rarity: 'uncommon',
      xpReward: 200,
      requirements: { loginStreak: 7 }
    },
    {
      id: 'month_streak',
      name: 'Dévoué',
      description: 'Connectez-vous 30 jours de suite',
      icon: '💯',
      category: 'streak',
      rarity: 'legendary',
      xpReward: 1000,
      requirements: { loginStreak: 30 }
    },
    
    // SPÉCIAUX
    {
      id: 'early_bird',
      name: 'Lève-tôt',
      description: 'Terminez une tâche avant 8h du matin',
      icon: '🌅',
      category: 'special',
      rarity: 'rare',
      xpReward: 175,
      requirements: { earlyTaskCompletion: true }
    },
    {
      id: 'night_owl',
      name: 'Oiseau de Nuit',
      description: 'Terminez une tâche après 22h',
      icon: '🦉',
      category: 'special',
      rarity: 'rare',
      xpReward: 175,
      requirements: { lateTaskCompletion: true }
    },
    {
      id: 'perfectionist',
      name: 'Perfectionniste',
      description: 'Terminez 10 tâches sans erreur',
      icon: '💯',
      category: 'special',
      rarity: 'epic',
      xpReward: 400,
      requirements: { perfectTasks: 10 }
    }
  ];

  // 🔍 VÉRIFIER SI UN BADGE EST DÉBLOQUÉ
  const isBadgeEarned = (badge) => {
    return userBadges.some(ub => ub.badgeId === badge.id);
  };

  // 📊 FILTRER ET TRIER LES BADGES
  const filteredAndSortedBadges = useMemo(() => {
    let filtered = systemBadges;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(badge =>
        badge.name?.toLowerCase().includes(term) ||
        badge.description?.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(badge => badge.category === categoryFilter);
    }

    // Filtre par statut
    if (statusFilter === 'earned') {
      filtered = filtered.filter(badge => isBadgeEarned(badge));
    } else if (statusFilter === 'locked') {
      filtered = filtered.filter(badge => !isBadgeEarned(badge));
    }

    // Tri
    filtered.sort((a, b) => {
      const aEarned = isBadgeEarned(a);
      const bEarned = isBadgeEarned(b);
      
      // Les badges débloqués d'abord
      if (aEarned && !bEarned) return -1;
      if (!aEarned && bEarned) return 1;
      
      // Puis tri par critère choisi
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      } else if (sortBy === 'rarity') {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      } else if (sortBy === 'xp') {
        return b.xpReward - a.xpReward;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [systemBadges, userBadges, searchTerm, categoryFilter, statusFilter, sortBy]);

  // 📊 STATISTIQUES
  const badgeStats = useMemo(() => {
    const total = systemBadges.length;
    const earned = systemBadges.filter(badge => isBadgeEarned(badge)).length;
    const progress = Math.round((earned / total) * 100);
    const totalXpFromBadges = userBadges.reduce((sum, ub) => {
      const badge = systemBadges.find(b => b.id === ub.badgeId);
      return sum + (badge?.xpReward || 0);
    }, 0);

    return { total, earned, progress, totalXpFromBadges };
  }, [systemBadges, userBadges]);

  // 🎨 CARTE BADGE
  const BadgeCard = ({ badge }) => {
    const earned = isBadgeEarned(badge);
    const categoryConfig = BADGE_CATEGORIES[badge.category];
    const rarityConfig = BADGE_RARITY[badge.rarity];
    const CategoryIcon = categoryConfig?.icon || Award;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className={`relative rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
          earned 
            ? 'bg-white border-green-200 hover:shadow-lg' 
            : 'bg-gray-50 border-gray-200 hover:shadow-md opacity-75'
        }`}
        onClick={() => setSelectedBadge(badge)}
      >
        {/* Badge de rareté */}
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${rarityConfig.bgColor} ${rarityConfig.textColor}`}>
          {rarityConfig.label}
        </div>

        {/* Statut débloqué/verrouillé */}
        <div className="absolute top-2 left-2">
          {earned ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Lock className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="p-6">
          {/* Icône du badge */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
              earned ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-300'
            }`}>
              {badge.icon}
            </div>
          </div>

          {/* Nom du badge */}
          <h3 className={`text-lg font-bold text-center mb-2 ${
            earned ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {badge.name}
          </h3>

          {/* Description */}
          <p className={`text-sm text-center mb-4 line-clamp-2 ${
            earned ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {badge.description}
          </p>

          {/* Catégorie et XP */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <CategoryIcon className={`w-4 h-4 ${earned ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${earned ? 'text-blue-600' : 'text-gray-400'}`}>
                {categoryConfig?.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className={`w-4 h-4 ${earned ? 'text-yellow-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-bold ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>
                +{badge.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // 📋 RENDU VUE LISTE
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
          <div className="col-span-1">Statut</div>
          <div className="col-span-4">Badge</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-2">Rareté</div>
          <div className="col-span-2">XP Récompense</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredAndSortedBadges.map(badge => {
          const earned = isBadgeEarned(badge);
          const categoryConfig = BADGE_CATEGORIES[badge.category];
          const rarityConfig = BADGE_RARITY[badge.rarity];
          const CategoryIcon = categoryConfig?.icon || Award;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${!earned && 'opacity-60'}`}
              onClick={() => setSelectedBadge(badge)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Statut */}
                <div className="col-span-1">
                  {earned ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Badge */}
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      earned ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-300'
                    }`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className={`font-medium ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {badge.name}
                      </h4>
                      <p className={`text-sm line-clamp-1 ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Catégorie */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`w-4 h-4 ${earned ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${earned ? 'text-gray-700' : 'text-gray-400'}`}>
                      {categoryConfig?.label}
                    </span>
                  </div>
                </div>

                {/* Rareté */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rarityConfig.bgColor} ${rarityConfig.textColor}`}>
                    {rarityConfig.label}
                  </span>
                </div>

                {/* XP */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <Zap className={`w-4 h-4 ${earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-bold ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* HEADER DE LA PAGE */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Collection de Badges</h1>
              <p className="text-gray-600">Débloquez des badges en accomplissant des défis</p>
            </div>
          </div>

          {/* PROGRESSION GLOBALE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Progression des Badges</h3>
                <p className="text-purple-100">
                  {badgeStats.earned} sur {badgeStats.total} badges débloqués
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{badgeStats.progress}%</div>
                <div className="text-purple-100 text-sm">Complétion</div>
              </div>
            </div>
            
            <div className="w-full bg-purple-800 bg-opacity-30 rounded-full h-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${badgeStats.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{badgeStats.earned}</div>
                <div className="text-purple-100 text-sm">Badges obtenus</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{badgeStats.total - badgeStats.earned}</div>
                <div className="text-purple-100 text-sm">À débloquer</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{badgeStats.totalXpFromBadges}</div>
                <div className="text-purple-100 text-sm">XP des badges</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Object.keys(BADGE_CATEGORIES).length}
                </div>
                <div className="text-purple-100 text-sm">Catégories</div>
              </div>
            </div>
          </motion.div>

          {/* BARRE D'OUTILS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des badges..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtres rapides */}
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Toutes catégories</option>
                  {Object.entries(BADGE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les badges</option>
                  <option value="earned">Débloqués</option>
                  <option value="locked">Verrouillés</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="category">Par catégorie</option>
                  <option value="rarity">Par rareté</option>
                  <option value="xp">Par récompense XP</option>
                  <option value="name">Par nom</option>
                </select>

                {/* Toggle vue */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Vue grille"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Vue liste"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENU PRINCIPAL */}
          <AnimatePresence mode="wait">
            {filteredAndSortedBadges.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
                  <p className="text-gray-600">
                    Essayez de modifier vos filtres ou votre recherche.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedBadges.map(badge => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                ) : (
                  renderListView()
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL DÉTAILS BADGE */}
        {selectedBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails du Badge</h2>
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  {/* Icône du badge */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 ${
                    isBadgeEarned(selectedBadge) 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                      : 'bg-gray-300'
                  }`}>
                    {selectedBadge.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedBadge.name}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {selectedBadge.description}
                  </p>

                  {/* Statut */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {isBadgeEarned(selectedBadge) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700 font-medium">Badge débloqué !</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 font-medium">Badge verrouillé</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Informations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Catégorie</span>
                        <div className="flex items-center gap-2 mt-1">
                          {React.createElement(BADGE_CATEGORIES[selectedBadge.category]?.icon || Award, { className: "w-4 h-4 text-blue-600" })}
                          <span className="text-sm font-medium text-gray-900">
                            {BADGE_CATEGORIES[selectedBadge.category]?.label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Rareté</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_RARITY[selectedBadge.rarity]?.bgColor} ${BADGE_RARITY[selectedBadge.rarity]?.textColor}`}>
                            {BADGE_RARITY[selectedBadge.rarity]?.label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Récompense</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-600">
                            +{selectedBadge.xpReward} XP
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Statut</span>
                        <div className="mt-1">
                          <span className={`text-sm font-medium ${
                            isBadgeEarned(selectedBadge) ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {isBadgeEarned(selectedBadge) ? 'Débloqué' : 'Verrouillé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions pour débloquer */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Conditions de déblocage</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedBadge.requirements).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {key === 'tasksCompleted' && `Terminer ${value} tâche${value > 1 ? 's' : ''}`}
                            {key === 'projectsCompleted' && `Terminer ${value} projet${value > 1 ? 's' : ''}`}
                            {key === 'level' && `Atteindre le niveau ${value}`}
                            {key === 'totalXp' && `Gagner ${value} points d'expérience`}
                            {key === 'loginStreak' && `Se connecter ${value} jours de suite`}
                            {key === 'teamsJoined' && `Rejoindre ${value} équipe${value > 1 ? 's' : ''}`}
                            {key === 'helpedColleagues' && `Aider ${value} collègues`}
                            {key === 'fastTaskCompletion' && 'Terminer une tâche rapidement'}
                            {key === 'earlyTaskCompletion' && 'Terminer une tâche tôt le matin'}
                            {key === 'lateTaskCompletion' && 'Terminer une tâche tard le soir'}
                            {key === 'perfectTasks' && `Terminer ${value} tâches parfaites`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isBadgeEarned(selectedBadge) && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Badge obtenu !</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Félicitations ! Vous avez débloqué ce badge et gagné {selectedBadge.xpReward} points d'expérience.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BadgesPage;
