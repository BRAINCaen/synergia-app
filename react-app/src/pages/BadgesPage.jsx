// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// VRAIE PAGE COLLECTION DE BADGES SYNERGIA AVEC FIREBASE ET DESIGN AUTHENTIQUE
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
  MoreVertical,
  Flame,
  BookOpen,
  Briefcase,
  Heart,
  ThumbsUp,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🏆 DÉFINITIONS DES BADGES SYNERGIA COMPLETS
const BADGE_DEFINITIONS = {
  // 🎯 BADGES ACCOMPLISSEMENT
  chef_de_projet: {
    id: 'chef_de_projet',
    name: 'Chef de Projet',
    description: 'Terminez votre premier projet',
    icon: '📁',
    category: 'Accomplissement',
    rarity: 'Peu commun',
    xpReward: 150,
    requirements: { projectsCompleted: 1 }
  },
  eclair: {
    id: 'eclair',
    name: 'Éclair',
    description: 'Terminez une tâche en moins de 30 minutes',
    icon: '⚡',
    category: 'Accomplissement',
    rarity: 'Rare',
    xpReward: 125,
    requirements: { fastTaskCompletion: 1 }
  },
  esprit_dequipe: {
    id: 'esprit_dequipe',
    name: 'Esprit d\'Équipe',
    description: 'Rejoignez votre première équipe',
    icon: '👥',
    category: 'Collaboration',
    rarity: 'Commun',
    xpReward: 75,
    requirements: { teamsJoined: 1 }
  },
  
  // 🎯 BADGES RARE
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Aidez 5 collègues différents',
    icon: '🎓',
    category: 'Collaboration',
    rarity: 'Rare',
    xpReward: 200,
    requirements: { colleaguesHelped: 5 }
  },
  veteran: {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Atteignez le niveau 10',
    icon: '⭐',
    category: 'Accomplissement',
    rarity: 'Rare',
    xpReward: 300,
    requirements: { level: 10 }
  },
  
  // 🎯 BADGES ÉPIQUE
  maitre_xp: {
    id: 'maitre_xp',
    name: 'Maître XP',
    description: 'Gagnez 1000 points d\'expérience',
    icon: '💎',
    category: 'Performance',
    rarity: 'Épique',
    xpReward: 500,
    requirements: { totalXp: 1000 }
  },
  
  // 🎯 BADGES ADDITIONNELS POUR COMPLÉTER LA COLLECTION
  first_login: {
    id: 'first_login',
    name: 'Bienvenue !',
    description: 'Première connexion à Synergia',
    icon: '👋',
    category: 'Général',
    rarity: 'Commun',
    xpReward: 10,
    requirements: { loginCount: 1 }
  },
  task_master: {
    id: 'task_master',
    name: 'Maître des Tâches',
    description: 'Complétez 25 tâches',
    icon: '✅',
    category: 'Productivité',
    rarity: 'Peu commun',
    xpReward: 100,
    requirements: { tasksCompleted: 25 }
  },
  productivity_legend: {
    id: 'productivity_legend',
    name: 'Légende de Productivité',
    description: 'Complétez 100 tâches',
    icon: '🏆',
    category: 'Productivité',
    rarity: 'Épique',
    xpReward: 400,
    requirements: { tasksCompleted: 100 }
  },
  streak_warrior: {
    id: 'streak_warrior',
    name: 'Guerrier de la Série',
    description: 'Connexion quotidienne pendant 7 jours',
    icon: '🔥',
    category: 'Consistance',
    rarity: 'Peu commun',
    xpReward: 80,
    requirements: { loginStreak: 7 }
  },
  innovator: {
    id: 'innovator',
    name: 'Innovateur',
    description: 'Créez 5 nouvelles idées de projets',
    icon: '💡',
    category: 'Créativité',
    rarity: 'Rare',
    xpReward: 250,
    requirements: { ideasCreated: 5 }
  },
  collaboration_master: {
    id: 'collaboration_master',
    name: 'Maître de la Collaboration',
    description: 'Participez à 10 projets collaboratifs',
    icon: '🤝',
    category: 'Collaboration',
    rarity: 'Rare',
    xpReward: 200,
    requirements: { collaborativeProjects: 10 }
  },
  time_optimizer: {
    id: 'time_optimizer',
    name: 'Optimisateur de Temps',
    description: 'Terminez des tâches en avance 5 fois',
    icon: '⏰',
    category: 'Performance',
    rarity: 'Peu commun',
    xpReward: 120,
    requirements: { earlyCompletions: 5 }
  },
  quality_champion: {
    id: 'quality_champion',
    name: 'Champion de Qualité',
    description: 'Aucune tâche rejetée sur 20 complétées',
    icon: '🎖️',
    category: 'Performance',
    rarity: 'Épique',
    xpReward: 350,
    requirements: { qualityStreak: 20 }
  }
};

// 🎨 CONFIGURATION DES CATÉGORIES
const BADGE_CATEGORIES = {
  all: { label: 'Toutes catégories', icon: Star, color: 'gray' },
  'Général': { label: 'Général', icon: BookOpen, color: 'blue' },
  'Accomplissement': { label: 'Accomplissement', icon: Trophy, color: 'yellow' },
  'Collaboration': { label: 'Collaboration', icon: Users, color: 'green' },
  'Productivité': { label: 'Productivité', icon: Zap, color: 'purple' },
  'Performance': { label: 'Performance', icon: Target, color: 'red' },
  'Consistance': { label: 'Consistance', icon: Flame, color: 'orange' },
  'Créativité': { label: 'Créativité', icon: Gem, color: 'pink' }
};

// 🏆 CONFIGURATION DES RARETÉS
const BADGE_RARITY = {
  'Commun': { 
    label: 'Commun', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-900/20', 
    borderColor: 'border-gray-500/30',
    glowColor: 'shadow-gray-500/20'
  },
  'Peu commun': { 
    label: 'Peu commun', 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/20', 
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20'
  },
  'Rare': { 
    label: 'Rare', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20', 
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20'
  },
  'Épique': { 
    label: 'Épique', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20', 
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20'
  },
  'Légendaire': { 
    label: 'Légendaire', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900/20', 
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20'
  }
};

const BadgesPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS BADGES
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('Par catégorie');
  const [viewMode, setViewMode] = useState('grid');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // 📊 CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [BADGES] Chargement des données badges depuis Firebase...');
    setLoading(true);

    // 1. Charger le profil utilisateur pour récupérer les badges
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', user.uid)
    );
    
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUserProfile(userData);
        
        // Récupérer les badges de l'utilisateur
        const badges = userData.gamification?.badges || [];
        setUserBadges(badges);
        
        console.log('🏆 [BADGES] Profil utilisateur chargé avec', badges.length, 'badges');
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ [BADGES] Erreur chargement profil:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user?.uid]);

  // 📊 CALCUL DES STATISTIQUES BADGES
  const badgeStats = useMemo(() => {
    const totalAvailableBadges = Object.keys(BADGE_DEFINITIONS).length;
    const unlockedBadges = userBadges.length;
    const completionPercentage = totalAvailableBadges > 0 
      ? Math.round((unlockedBadges / totalAvailableBadges) * 100) 
      : 0;

    // Regroupement par catégorie
    const categoryCounts = {};
    Object.values(BADGE_DEFINITIONS).forEach(badge => {
      const category = badge.category || 'Général';
      if (!categoryCounts[category]) {
        categoryCounts[category] = { total: 0, unlocked: 0 };
      }
      categoryCounts[category].total++;
      
      if (userBadges.some(userBadge => userBadge.id === badge.id)) {
        categoryCounts[category].unlocked++;
      }
    });

    return {
      total: totalAvailableBadges,
      unlocked: unlockedBadges,
      completion: completionPercentage,
      categories: categoryCounts
    };
  }, [userBadges]);

  // 🔍 FILTRAGE ET TRI DES BADGES
  const filteredBadges = useMemo(() => {
    let badges = Object.values(BADGE_DEFINITIONS);

    // Filtre par recherche
    if (searchTerm) {
      badges = badges.filter(badge =>
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      badges = badges.filter(badge => badge.category === selectedCategory);
    }

    // Filtre par statut débloqué
    if (showOnlyUnlocked) {
      badges = badges.filter(badge =>
        userBadges.some(userBadge => userBadge.id === badge.id)
      );
    }

    // Tri
    badges.sort((a, b) => {
      switch (sortBy) {
        case 'Par catégorie':
          return a.category.localeCompare(b.category);
        case 'Tous les badges':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return badges;
  }, [searchTerm, selectedCategory, sortBy, showOnlyUnlocked, userBadges]);

  // 🔄 ACTUALISER LES DONNÉES
  const refreshData = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chargement des badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 🏆 HEADER AVEC PROGRESSION */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Titre principal */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Collection de Badges
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Débloquez des badges en accomplissant des défis
                  </p>
                </div>
              </div>

              <button
                onClick={refreshData}
                className="px-4 py-2 bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </button>
            </div>

            {/* Progression globale */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Progression des Badges</h2>
                  <p className="text-purple-100">
                    {badgeStats.unlocked} sur {badgeStats.total} badges débloqués
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white mb-1">
                    {badgeStats.completion}%
                  </div>
                  <div className="text-purple-100 text-sm">Complétion</div>
                </div>
              </div>

              <div className="w-full bg-purple-800/50 rounded-full h-4 mb-6">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${badgeStats.completion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {badgeStats.unlocked}
                  </div>
                  <div className="text-purple-100 text-sm">Badges obtenus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300 mb-1">
                    {badgeStats.total}
                  </div>
                  <div className="text-purple-100 text-sm">À débloquer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-300 mb-1">
                    0
                  </div>
                  <div className="text-purple-100 text-sm">XP des badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300 mb-1">
                    {Object.keys(badgeStats.categories).length}
                  </div>
                  <div className="text-purple-100 text-sm">Catégories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 FILTRES ET RECHERCHE */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des badges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                >
                  {Object.entries(BADGE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="Par catégorie">Par catégorie</option>
                  <option value="Tous les badges">Tous les badges</option>
                </select>

                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle badges débloqués uniquement */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showUnlockedOnly"
                  checked={showOnlyUnlocked}
                  onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="showUnlockedOnly" className="text-gray-300 text-sm">
                  Afficher uniquement les badges débloqués
                </label>
              </div>

              <div className="text-sm text-gray-400">
                {filteredBadges.length} badge{filteredBadges.length > 1 ? 's' : ''} affiché{filteredBadges.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* 🏆 GRILLE DES BADGES */}
          {filteredBadges.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-8xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm ? 'Aucun badge trouvé' : 'Aucun badge disponible'}
              </h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Aucun badge ne correspond à votre recherche. Essayez avec d\'autres mots-clés.'
                  : 'Les badges apparaîtront ici une fois que vous aurez accompli des défis.'
                }
              </p>
            </motion.div>
          ) : (
            <motion.div
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredBadges.map((badge, index) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={userBadges.some(userBadge => userBadge.id === badge.id)}
                  viewMode={viewMode}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// 🏆 COMPOSANT CARTE BADGE
const BadgeCard = ({ badge, isUnlocked, viewMode, index }) => {
  const rarityConfig = BADGE_RARITY[badge.rarity] || BADGE_RARITY['Commun'];
  const categoryConfig = BADGE_CATEGORIES[badge.category] || BADGE_CATEGORIES['Général'];

  const cardContent = (
    <>
      {/* Indicateur de déverrouillage */}
      <div className="absolute top-3 right-3">
        {isUnlocked ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Icône du badge */}
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto
        ${isUnlocked ? rarityConfig.bgColor : 'bg-gray-800/50'}
        ${isUnlocked ? rarityConfig.borderColor : 'border-gray-700'}
        border-2 transition-all duration-300
        ${isUnlocked ? rarityConfig.glowColor : ''}
      `}>
        <span className={isUnlocked ? '' : 'grayscale opacity-50'}>
          {badge.icon}
        </span>
      </div>

      {/* Informations du badge */}
      <div className="text-center mb-4">
        <h3 className={`text-lg font-bold mb-2 ${
          isUnlocked ? 'text-white' : 'text-gray-500'
        }`}>
          {badge.name}
        </h3>
        <p className={`text-sm mb-3 line-clamp-2 ${
          isUnlocked ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {badge.description}
        </p>
      </div>

      {/* Métadonnées */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full font-medium ${
            isUnlocked ? categoryConfig.color === 'blue' 
              ? 'bg-blue-900/30 text-blue-400' 
              : categoryConfig.color === 'green'
              ? 'bg-green-900/30 text-green-400'
              : categoryConfig.color === 'purple'
              ? 'bg-purple-900/30 text-purple-400'
              : categoryConfig.color === 'red'
              ? 'bg-red-900/30 text-red-400'
              : categoryConfig.color === 'yellow'
              ? 'bg-yellow-900/30 text-yellow-400'
              : categoryConfig.color === 'orange'
              ? 'bg-orange-900/30 text-orange-400'
              : categoryConfig.color === 'pink'
              ? 'bg-pink-900/30 text-pink-400'
              : 'bg-gray-900/30 text-gray-400'
            : 'bg-gray-800/30 text-gray-600'
          }`}>
            {badge.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUnlocked ? rarityConfig.color : 'text-gray-600'
          }`}>
            {badge.rarity}
          </span>
        </div>

        {isUnlocked && badge.xpReward && (
          <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm">
            <Zap className="h-4 w-4" />
            <span className="font-medium">+{badge.xpReward} XP</span>
          </div>
        )}
      </div>

      {!isUnlocked && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-center text-xs text-gray-500">
            Badge non débloqué
          </div>
        </div>
      )}
    </>
  );

  return (
    <motion.div
      className={`
        relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6
        hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300
        ${isUnlocked ? 'hover:shadow-2xl hover:shadow-purple-500/10' : ''}
        ${viewMode === 'list' ? 'flex items-center gap-6' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
    >
      {cardContent}
    </motion.div>
  );
};

export default BadgesPage;
