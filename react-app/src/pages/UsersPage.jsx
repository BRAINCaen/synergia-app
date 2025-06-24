// src/pages/UsersPage.jsx
// Page complète de gestion des utilisateurs
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  Building,
  Star,
  Trophy,
  Eye,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { useUsers, useUserStats, useLeaderboard } from '../shared/hooks/useUsers.js';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedUser, setSelectedUser] = useState(null);

  // Hooks pour les données
  const { users, loading, error, searchUsers, loadMore, hasMore, refresh } = useUsers();
  const { stats, loading: statsLoading } = useUserStats();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard(5);

  // Gestion de la recherche
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchUsers(value);
    } else {
      refresh();
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    if (activeFilter === 'active') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return user.lastLoginAt && user.lastLoginAt >= weekAgo;
    }
    if (activeFilter === 'new') {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return user.createdAt && user.createdAt >= monthAgo;
    }
    if (activeFilter === 'top') {
      return (user.gamification?.level || 1) >= 3;
    }
    return true;
  });

  // Formater la date de dernière connexion
  const formatLastLogin = (date) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-400 mt-1">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} avec connexion Google
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Actifs cette semaine</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeThisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">XP Moyen</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.averageXP}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Nouveaux (7j)</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.recentJoins}</p>
                </div>
                <UserPlus className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section principale */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filtres et recherche */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Barre de recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher par nom, email, département..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtres */}
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Tous', icon: Users },
                    { key: 'active', label: 'Actifs', icon: TrendingUp },
                    { key: 'new', label: 'Nouveaux', icon: UserPlus },
                    { key: 'top', label: 'Top', icon: Trophy }
                  ].map(filter => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                          activeFilter === filter.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <div className="w-4 h-4 flex flex-col gap-1">
                        <div className="bg-current h-0.5 rounded"></div>
                        <div className="bg-current h-0.5 rounded"></div>
                        <div className="bg-current h-0.5 rounded"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">
                              {user.displayName || 'Utilisateur'}
                            </h4>
                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Niveau</span>
                            <span className="text-blue-400 font-medium">
                              {user.gamification?.level || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">XP</span>
                            <span className="text-yellow-400 font-medium">
                              {user.gamification?.totalXp || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Dernière connexion</span>
                            <span className="text-gray-300 text-xs">
                              {formatLastLogin(user.lastLoginAt)}
                            </span>
                          </div>
                        </div>

                        {user.profile?.department && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Building className="w-4 h-4" />
                              {user.profile.department}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">
                              {user.displayName || 'Utilisateur'}
                            </h4>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-400 truncate">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {user.profile?.department && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {user.profile.department}
                              </span>
                            )}
                            <span>Niveau {user.gamification?.level || 1}</span>
                            <span>{user.gamification?.totalXp || 0} XP</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            {formatLastLogin(user.lastLoginAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton charger plus */}
                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                    >
                      {loading ? 'Chargement...' : 'Charger plus'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top 5 Leaderboard */}
            {leaderboard.length > 0 && !leaderboardLoading && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top 5 XP
                </h3>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {user.displayName?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-yellow-400">
                          {user.totalXp} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques de département */}
            {stats?.departmentBreakdown && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Départements
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.departmentBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{dept}</span>
                        <span className="text-sm font-medium text-white">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
