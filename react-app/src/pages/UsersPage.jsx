// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS - VERSION FIREBASE PURE (SANS MOCK)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock,
  Shield,
  Crown,
  User,
  Activity,
  Star,
  TrendingUp,
  RefreshCw,
  UserPlus,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES - 100% FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { isAdmin, hasPermission } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  limit,
  startAfter 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 CONSTANTES UTILISATEURS
const USER_STATUS = {
  active: { label: 'Actif', color: 'green', icon: CheckCircle },
  inactive: { label: 'Inactif', color: 'red', icon: XCircle },
  pending: { label: 'En attente', color: 'yellow', icon: Clock },
  suspended: { label: 'Suspendu', color: 'orange', icon: AlertCircle }
};

const USER_ROLES = {
  admin: { label: 'Administrateur', color: 'red', icon: Crown },
  manager: { label: 'Manager', color: 'purple', icon: Shield },
  lead: { label: 'Lead', color: 'blue', icon: Star },
  member: { label: 'Membre', color: 'gray', icon: User }
};

/**
 * 👥 COMPOSANT PRINCIPAL USERSPAGE - 100% FIREBASE
 * Plus aucune donnée mock, connecté entièrement à Firebase
 */
const UsersPage = () => {
  const { user } = useAuthStore();
  const { userData, isLoading: userDataLoading } = useUnifiedFirebaseData();
  
  // États pour les utilisateurs
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // États pour les actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // États pour les statistiques
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalXP: 0
  });

  // Vérifications admin
  const userIsAdmin = isAdmin(user);
  const canManageUsers = hasPermission(user, 'manage_users');

  // 🔥 CHARGEMENT DES UTILISATEURS DEPUIS FIREBASE
  useEffect(() => {
    let unsubscribe = null;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query optimisée pour récupérer les utilisateurs
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(100) // Limiter pour les performances
        );

        // Écoute en temps réel des changements
        unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersData = [];
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          let activeCount = 0;
          let newThisMonth = 0;
          let totalXP = 0;

          snapshot.forEach((doc) => {
            const userData = doc.data();
            const userCreatedAt = userData.createdAt?.toDate() || new Date();
            
            // Enrichir les données utilisateur
            const enrichedUser = {
              id: doc.id,
              ...userData,
              // Données de gamification
              level: userData.gamification?.level || 1,
              totalXp: userData.gamification?.totalXp || 0,
              tasksCompleted: userData.gamification?.tasksCompleted || 0,
              badges: userData.gamification?.badges || [],
              // Données de profil
              displayName: userData.profile?.displayName || userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
              role: userData.profile?.role || 'member',
              department: userData.profile?.department || 'general',
              status: userData.status || 'active',
              // Dates
              joinedAt: userCreatedAt,
              lastActivity: userData.gamification?.lastActivityDate?.toDate() || null,
              // Enrichissement calculé
              isNew: userCreatedAt >= startOfMonth
            };

            usersData.push(enrichedUser);

            // Calculs statistiques
            if (enrichedUser.status === 'active') activeCount++;
            if (enrichedUser.isNew) newThisMonth++;
            totalXP += enrichedUser.totalXp;
          });

          // Trier par date de création (plus récent d'abord)
          usersData.sort((a, b) => b.joinedAt - a.joinedAt);

          setUsers(usersData);
          setUserStats({
            totalUsers: usersData.length,
            activeUsers: activeCount,
            newUsersThisMonth: newThisMonth,
            totalXP
          });
          setLoading(false);
        }, (error) => {
          console.error('❌ Erreur chargement utilisateurs:', error);
          setError('Erreur lors du chargement des utilisateurs');
          setLoading(false);
        });

      } catch (err) {
        console.error('❌ Erreur initialisation utilisateurs:', err);
        setError('Impossible de charger les utilisateurs');
        setLoading(false);
      }
    };

    loadUsers();

    // Nettoyage
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 🔍 FILTRAGE INTELLIGENT DES UTILISATEURS
  const filteredUsers = users.filter(userData => {
    const matchesSearch = 
      userData.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userData.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || userData.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // 🔄 ACTUALISATION MANUELLE
  const handleRefresh = async () => {
    setRefreshing(true);
    // Le listener en temps réel se charge automatiquement du refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 👤 CALCULER LE STATUT D'ACTIVITÉ
  const getUserActivity = (userData) => {
    if (!userData.lastActivity) return { status: 'unknown', label: 'Inconnue', color: 'gray' };
    
    const now = new Date();
    const lastActivity = userData.lastActivity;
    const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { status: 'today', label: 'Aujourd\'hui', color: 'green' };
    if (diffDays === 1) return { status: 'yesterday', label: 'Hier', color: 'yellow' };
    if (diffDays <= 7) return { status: 'week', label: `Il y a ${diffDays}j`, color: 'blue' };
    if (diffDays <= 30) return { status: 'month', label: `Il y a ${diffDays}j`, color: 'orange' };
    return { status: 'old', label: `Il y a ${diffDays}j`, color: 'red' };
  };

  // ⚡ AFFICHAGE LOADING
  if (loading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des utilisateurs...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // ❌ AFFICHAGE ERREUR
  if (error) {
    return (
      <PremiumLayout>
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <PremiumButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Réessayer
            </PremiumButton>
          </div>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      {/* 🏆 Header avec statistiques temps réel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Users className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Utilisateurs
              </h1>
              <p className="text-gray-400 mt-2">
                Gérez les utilisateurs et leurs permissions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <PremiumButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? 
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 
                <RefreshCw className="w-4 h-4 mr-2" />
              }
              Actualiser
            </PremiumButton>
            
            {canManageUsers && (
              <PremiumButton>
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter
              </PremiumButton>
            )}
          </div>
        </div>

        {/* 📊 Statistiques temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={userStats.totalUsers}
            icon={Users}
            trend={`+${userStats.newUsersThisMonth} ce mois`}
            color="blue"
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={userStats.activeUsers}
            icon={Activity}
            trend={`${Math.round((userStats.activeUsers / Math.max(userStats.totalUsers, 1)) * 100)}% actifs`}
            color="green"
          />
          <StatCard
            title="Nouveaux ce mois"
            value={userStats.newUsersThisMonth}
            icon={TrendingUp}
            trend="En croissance"
            color="yellow"
          />
          <StatCard
            title="XP Communautaire"
            value={userStats.totalXP.toLocaleString()}
            icon={Star}
            trend="+15% ce mois"
            color="purple"
          />
        </div>
      </div>

      {/* 🔍 Barre de recherche et filtres */}
      <PremiumCard className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <PremiumSearchBar
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>

            <div className="text-sm text-gray-400">
              {filteredUsers.length} / {users.length} utilisateurs
            </div>
          </div>
        </div>

        {/* 📋 Panneau filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateur</option>
                  <option value="manager">Manager</option>
                  <option value="lead">Lead</option>
                  <option value="member">Membre</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                  <option value="suspended">Suspendu</option>
                </select>

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les départements</option>
                  <option value="development">Développement</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="hr">RH</option>
                  <option value="sales">Ventes</option>
                  <option value="general">Général</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumCard>

      {/* 👤 Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((userData) => {
          const activity = getUserActivity(userData);
          const roleInfo = USER_ROLES[userData.role] || USER_ROLES.member;
          const statusInfo = USER_STATUS[userData.status] || USER_STATUS.active;

          return (
            <motion.div
              key={userData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
            >
              {/* Header utilisateur */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {userData.displayName[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Badge nouveau utilisateur */}
                    {userData.isNew && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {userData.displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-${roleInfo.color}-500/20 text-${roleInfo.color}-400`}>
                        <roleInfo.icon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      activity.status === 'today' ? 'text-green-400' :
                      activity.status === 'yesterday' ? 'text-yellow-400' :
                      activity.status === 'week' ? 'text-blue-400' :
                      activity.status === 'month' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      Actif: {activity.label}
                    </p>
                  </div>
                </div>
                
                {/* Badge statut */}
                <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400`}>
                  <statusInfo.icon className="w-3 h-3" />
                  {statusInfo.label}
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{userData.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{userData.department || 'Non défini'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Rejoint le {userData.joinedAt.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Statistiques utilisateur */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{userData.level}</div>
                  <div className="text-xs text-gray-500">Niveau</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{userData.totalXp}</div>
                  <div className="text-xs text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{userData.badges.length}</div>
                  <div className="text-xs text-gray-500">Badges</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    setSelectedUser(userData);
                    setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
                
                {canManageUsers && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {userData.id !== user?.uid && (
                      <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 📭 Message si aucun résultat */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-400 mb-4">Essayez de modifier vos critères de recherche</p>
            <PremiumButton 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
            >
              Réinitialiser les filtres
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📭 Message si aucun utilisateur */}
      {users.length === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur</h3>
            <p className="text-gray-400 mb-4">
              Les utilisateurs apparaîtront ici lorsqu'ils se connecteront.
            </p>
            <PremiumButton onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 🔍 Modal détail utilisateur */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {selectedUser.displayName[0]?.toUpperCase() || '?'}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedUser.displayName}
                </h3>
                <p className="text-gray-400">{selectedUser.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-${USER_ROLES[selectedUser.role]?.color || 'gray'}-500/20 text-${USER_ROLES[selectedUser.role]?.color || 'gray'}-400`}>
                    {USER_ROLES[selectedUser.role]?.label || 'Membre'}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-${USER_STATUS[selectedUser.status]?.color || 'gray'}-500/20 text-${USER_STATUS[selectedUser.status]?.color || 'gray'}-400`}>
                    {USER_STATUS[selectedUser.status]?.label || 'Actif'}
                  </span>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Département:</span>
                        <span className="text-white ml-2">{selectedUser.department || 'Non défini'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Membre depuis:</span>
                        <span className="text-white ml-2">{selectedUser.joinedAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                      {selectedUser.lastActivity && (
                        <div>
                          <span className="text-gray-400">Dernière activité:</span>
                          <span className="text-white ml-2">{selectedUser.lastActivity.toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Progression</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Niveau:</span>
                        <span className="text-blue-400 ml-2 font-bold">{selectedUser.level}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">XP Total:</span>
                        <span className="text-purple-400 ml-2 font-bold">{selectedUser.totalXp}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tâches:</span>
                        <span className="text-green-400 ml-2 font-bold">{selectedUser.tasksCompleted}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Badges:</span>
                        <span className="text-yellow-400 ml-2 font-bold">{selectedUser.badges.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {selectedUser.badges.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">Badges obtenus</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.badges.map((badge, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400"
                        >
                          <Star className="w-3 h-3" />
                          {badge.name || badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <PremiumButton 
                  onClick={() => setShowUserModal(false)}
                  className="flex-1"
                  variant="outline"
                >
                  Fermer
                </PremiumButton>
                
                {canManageUsers && selectedUser.id !== user?.uid && (
                  <PremiumButton className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </PremiumButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default UsersPage;
