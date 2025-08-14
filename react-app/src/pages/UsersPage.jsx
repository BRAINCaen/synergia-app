// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS AVEC DESIGN PREMIUM HARMONISÉ
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  UserPlus,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  Star,
  Trophy,
  Eye,
  MoreVertical,
  RefreshCw,
  Grid,
  List,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  Activity,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES UTILISATEURS (conservées et étendues)
const USER_ROLES = {
  admin: { name: 'Administrateur', icon: Crown, color: 'yellow' },
  moderator: { name: 'Modérateur', icon: Shield, color: 'blue' },
  user: { name: 'Utilisateur', icon: Users, color: 'green' },
  guest: { name: 'Invité', icon: Eye, color: 'gray' }
};

const USER_STATUS = {
  active: { name: 'Actif', color: 'green', icon: CheckCircle },
  inactive: { name: 'Inactif', color: 'gray', icon: Clock },
  suspended: { name: 'Suspendu', color: 'red', icon: UserX }
};

const ACTIVITY_LEVELS = {
  high: { name: 'Très actif', color: 'green', min: 1000 },
  medium: { name: 'Actif', color: 'blue', min: 500 },
  low: { name: 'Peu actif', color: 'yellow', min: 100 },
  inactive: { name: 'Inactif', color: 'gray', min: 0 }
};

/**
 * 👤 COMPOSANT CARTE UTILISATEUR PREMIUM
 */
const PremiumUserCard = ({ user, index, onViewDetails }) => {
  const role = USER_ROLES[user.role] || USER_ROLES.user;
  const status = USER_STATUS[user.status] || USER_STATUS.active;
  const RoleIcon = role.icon;
  const StatusIcon = status.icon;
  
  // Calculer le niveau d'activité
  const totalXP = user.gamification?.totalXp || 0;
  const activityLevel = Object.entries(ACTIVITY_LEVELS)
    .reverse()
    .find(([key, level]) => totalXP >= level.min)?.[1] || ACTIVITY_LEVELS.inactive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
      onClick={() => onViewDetails(user)}
    >
      <PremiumCard className="relative overflow-hidden h-full">
        {/* Badge de statut */}
        <div className="absolute top-3 right-3">
          <div className={`
            p-1 rounded-full
            ${status.color === 'green' ? 'bg-green-500/20 text-green-400' :
              status.color === 'gray' ? 'bg-gray-500/20 text-gray-400' :
              'bg-red-500/20 text-red-400'}
          `}>
            <StatusIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="p-6 text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* Badge niveau d'activité */}
            <div className={`
              absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${activityLevel.color === 'green' ? 'bg-green-500 text-white' :
                activityLevel.color === 'blue' ? 'bg-blue-500 text-white' :
                activityLevel.color === 'yellow' ? 'bg-yellow-500 text-black' :
                'bg-gray-500 text-white'}
            `}>
              {user.gamification?.level || 1}
            </div>
          </div>

          {/* Informations utilisateur */}
          <h3 className="font-semibold text-lg text-white mb-1 truncate">
            {user.displayName || 'Utilisateur'}
          </h3>
          
          <p className="text-gray-400 text-sm mb-3 truncate">
            {user.email}
          </p>

          {/* Rôle */}
          <div className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3
            ${role.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
              role.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
              role.color === 'green' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            <RoleIcon className="w-4 h-4" />
            {role.name}
          </div>

          {/* Métriques */}
          <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-gray-700/50">
            <div className="text-center">
              <p className="text-xs text-gray-400">XP</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {totalXP.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">Badges</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Award className="w-3 h-3 text-purple-400" />
                <span className="text-sm font-medium text-white">
                  {user.badges?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">Tâches</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-sm font-medium text-white">
                  {user.gamification?.tasksCompleted || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Date d'inscription */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3">
            <Calendar className="w-3 h-3" />
            <span>
              Inscrit le {user.createdAt 
                ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString('fr-FR')
                : 'N/A'
              }
            </span>
          </div>

          {/* Niveau d'activité */}
          <div className="mt-3">
            <span className={`
              inline-block px-2 py-1 rounded-full text-xs font-medium
              ${activityLevel.color === 'green' ? 'bg-green-500/20 text-green-400' :
                activityLevel.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                activityLevel.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'}
            `}>
              {activityLevel.name}
            </span>
          </div>
        </div>

        {/* Effet hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </PremiumCard>
    </motion.div>
  );
};

/**
 * 👥 PAGE UTILISATEURS PREMIUM COMPLÈTE
 */
const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  
  // ✅ ÉTATS PRINCIPAUX (conservés)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ ÉTATS UI COMPLETS (conservés et étendus)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ ÉTATS MODALS
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // ✅ CHARGEMENT DES UTILISATEURS (conservé avec listener temps réel)
  useEffect(() => {
    console.log('👥 [USERS] Configuration listener utilisateurs...');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Enrichir les données utilisateur
          usersData.push({
            id: doc.id,
            ...data,
            // Calculs dérivés
            totalXP: data.gamification?.totalXp || 0,
            badgeCount: (data.badges || []).length,
            tasksCompleted: data.gamification?.tasksCompleted || 0,
            level: data.gamification?.level || 1,
            role: data.role || 'user',
            status: data.status || 'active'
          });
        });
        
        console.log(`👥 [USERS] ${usersData.length} utilisateurs chargés`);
        setUsers(usersData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ [USERS] Erreur listener:', error);
        setError('Erreur de chargement des utilisateurs');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ FILTRAGE ET TRI DES UTILISATEURS (étendu)
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Filtre recherche
      if (searchTerm && !user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !user.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtre rôle
      if (filterRole !== 'all' && user.role !== filterRole) {
        return false;
      }
      
      // Filtre statut
      if (filterStatus !== 'all' && user.status !== filterStatus) {
        return false;
      }
      
      // Filtre activité
      if (filterActivity !== 'all') {
        const userActivity = Object.entries(ACTIVITY_LEVELS)
          .reverse()
          .find(([key, level]) => user.totalXP >= level.min)?.[0] || 'inactive';
        if (userActivity !== filterActivity) {
          return false;
        }
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'xp':
          return b.totalXP - a.totalXP;
        case 'level':
          return b.level - a.level;
        case 'recent':
        default:
          const aDate = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
          return bDate - aDate;
      }
    });

    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, filterActivity, sortBy]);

  // ✅ STATISTIQUES CALCULÉES
  const userStats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const totalXP = users.reduce((sum, user) => sum + user.totalXP, 0);
    
    // Nouveau ce mois
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const newThisMonth = users.filter(user => {
      const userDate = user.createdAt 
        ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt)
        : new Date(0);
      return userDate >= oneMonthAgo;
    }).length;

    return { total, active, admins, totalXP, newThisMonth };
  }, [users]);

  // ✅ FONCTION RAFRAÎCHIR
  const handleRefresh = () => {
    setLoading(true);
    // Le listener onSnapshot se rechargera automatiquement
  };

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Total Utilisateurs", 
      value: userStats.total, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Actifs", 
      value: userStats.active, 
      icon: UserCheck, 
      color: "text-green-400" 
    },
    { 
      label: "Administrateurs", 
      value: userStats.admins, 
      icon: Crown, 
      color: "text-yellow-400" 
    },
    { 
      label: "Nouveaux ce mois", 
      value: userStats.newThisMonth, 
      icon: Sparkles, 
      color: "text-purple-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      {/* 🔍 BARRE DE RECHERCHE PREMIUM */}
      <PremiumSearchBar
        placeholder="Rechercher un utilisateur..."
        value={searchTerm}
        onChange={setSearchTerm}
        icon={Search}
        className="w-64"
      />

      {/* 🎛️ BOUTON FILTRES */}
      <PremiumButton
        variant={showFilters ? "primary" : "secondary"}
        icon={Filter}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtres
      </PremiumButton>

      {/* 🔄 ACTUALISER */}
      <PremiumButton
        variant="secondary"
        icon={RefreshCw}
        onClick={handleRefresh}
        loading={loading}
      >
        Actualiser
      </PremiumButton>

      {/* 👤 MODES D'AFFICHAGE */}
      <div className="flex rounded-lg border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <button
          onClick={() => setViewMode('grid')}
          className={`
            p-2 rounded-l-lg transition-colors
            ${viewMode === 'grid' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }
          `}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`
            p-2 rounded-r-lg transition-colors
            ${viewMode === 'list' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }
          `}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (loading && users.length === 0) {
    return (
      <PremiumLayout
        title="Gestion des Utilisateurs"
        subtitle="Chargement des utilisateurs..."
        icon={Users}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation des utilisateurs...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // 🚨 GESTION ERREUR
  if (error) {
    return (
      <PremiumLayout
        title="Gestion des Utilisateurs"
        subtitle="Erreur de chargement"
        icon={Users}
      >
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">
            <UserX className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Erreur de synchronisation</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
          <PremiumButton variant="primary" onClick={handleRefresh} icon={RefreshCw}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Utilisateurs"
      subtitle="Consultez et gérez tous les utilisateurs de l'équipe"
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎛️ PANNEAU DE FILTRES PREMIUM */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterRole('all');
                    setFilterStatus('all');
                    setFilterActivity('all');
                    setSortBy('recent');
                  }}
                >
                  Réinitialiser
                </PremiumButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtre Rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les rôles</option>
                    {Object.entries(USER_ROLES).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    {Object.entries(USER_STATUS).map(([key, status]) => (
                      <option key={key} value={key}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Activité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Activité</label>
                  <select
                    value={filterActivity}
                    onChange={(e) => setFilterActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les niveaux</option>
                    {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
                      <option key={key} value={key}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="name">Nom A-Z</option>
                    <option value="email">Email A-Z</option>
                    <option value="xp">XP (décroissant)</option>
                    <option value="level">Niveau (décroissant)</option>
                  </select>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👥 GRILLE DES UTILISATEURS PREMIUM */}
      <div className="space-y-6">
        {filteredAndSortedUsers.length === 0 ? (
          <PremiumCard className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterActivity !== 'all'
                ? 'Aucun utilisateur ne correspond aux critères'
                : 'Aucun utilisateur trouvé'
              }
            </h3>
            <p className="text-gray-400 mb-4">
              {users.length === 0 
                ? 'Les utilisateurs apparaîtront ici une fois inscrits.'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </p>
            {users.length > 0 && (
              <PremiumButton
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                  setFilterActivity('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
          </PremiumCard>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredAndSortedUsers.map((user, index) => (
              <PremiumUserCard
                key={user.id}
                user={user}
                index={index}
                onViewDetails={(user) => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 📊 STATISTIQUES SUPPLÉMENTAIRES */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="XP Total"
          value={userStats.totalXP.toLocaleString()}
          icon={Zap}
          color="yellow"
          trend="Communauté"
        />
        
        <StatCard
          title="Utilisateurs Actifs"
          value={`${Math.round((userStats.active / userStats.total) * 100)}%`}
          icon={Activity}
          color="green"
          trend="Engagement"
        />
        
        <StatCard
          title="Croissance Mensuelle"
          value={userStats.newThisMonth}
          icon={TrendingUp}
          color="blue"
          trend="Nouveaux membres"
        />
        
        <StatCard
          title="Niveau Moyen"
          value={users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.level, 0) / users.length) : 0}
          icon={Star}
          color="purple"
          trend="Performance"
        />
      </div>

      {/* 🔍 MODAL DÉTAILS UTILISATEUR */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumCard>
                <div className="p-6">
                  {/* Header avec avatar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {selectedUser.photoURL ? (
                        <img 
                          src={selectedUser.photoURL} 
                          alt={selectedUser.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl font-bold">
                          {selectedUser.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{selectedUser.displayName}</h3>
                      <p className="text-gray-400">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${USER_ROLES[selectedUser.role]?.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                            USER_ROLES[selectedUser.role]?.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'}
                        `}>
                          {React.createElement(USER_ROLES[selectedUser.role]?.icon || Users, { className: "w-3 h-3" })}
                          {USER_ROLES[selectedUser.role]?.name || 'Utilisateur'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques détaillées */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{selectedUser.totalXP.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">XP Total</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{selectedUser.level}</p>
                      <p className="text-xs text-gray-400">Niveau</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{selectedUser.badgeCount}</p>
                      <p className="text-xs text-gray-400">Badges</p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{selectedUser.tasksCompleted}</p>
                      <p className="text-xs text-gray-400">Tâches</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <PremiumButton
                      variant="secondary"
                      onClick={() => setShowUserModal(false)}
                    >
                      Fermer
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default UsersPage;
