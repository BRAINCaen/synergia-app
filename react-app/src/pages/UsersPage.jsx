// src/pages/UsersPage.jsx
// Page complète de gestion des utilisateurs avec toutes les fonctionnalités
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
  RefreshCw,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Charger tous les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Chargement des utilisateurs...');
      
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const allUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || 'Utilisateur',
          email: data.email || '',
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
          lastLoginAt: data.lastLoginAt?.toDate?.() || null,
          profile: data.profile || {},
          gamification: data.gamification || {
            level: 1,
            totalXp: 0,
            tasksCompleted: 0,
            loginStreak: 0,
            badges: []
          }
        };
      });
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      calculateStats(allUsers);
      
      console.log(`✅ ${allUsers.length} utilisateurs chargés`);
      
    } catch (err) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (usersList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const statistics = {
      totalUsers: usersList.length,
      activeToday: usersList.filter(u => u.lastLoginAt && u.lastLoginAt >= today).length,
      activeThisWeek: usersList.filter(u => u.lastLoginAt && u.lastLoginAt >= weekAgo).length,
      activeThisMonth: usersList.filter(u => u.lastLoginAt && u.lastLoginAt >= monthAgo).length,
      averageXP: usersList.length > 0 ? Math.round(usersList.reduce((sum, u) => sum + (u.gamification?.totalXp || 0), 0) / usersList.length) : 0,
      topLevel: Math.max(...usersList.map(u => u.gamification?.level || 1)),
      recentJoins: usersList.filter(u => u.createdAt && u.createdAt >= weekAgo).length,
      departmentBreakdown: {},
      levelDistribution: {}
    };

    // Répartition par département
    usersList.forEach(user => {
      const dept = user.profile?.department || 'Non défini';
      statistics.departmentBreakdown[dept] = (statistics.departmentBreakdown[dept] || 0) + 1;
      
      const level = user.gamification?.level || 1;
      const levelRange = level >= 10 ? '10+' : level >= 5 ? '5-9' : level >= 2 ? '2-4' : '1';
      statistics.levelDistribution[levelRange] = (statistics.levelDistribution[levelRange] || 0) + 1;
    });

    setStats(statistics);
  };

  // Filtrer et rechercher
  const applyFilters = () => {
    let filtered = [...users];

    // Recherche par texte
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.displayName || '').toLowerCase().includes(search) ||
        (user.email || '').toLowerCase().includes(search) ||
        (user.profile?.department || '').toLowerCase().includes(search)
      );
    }

    // Filtres spéciaux
    if (activeFilter === 'active') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(user => user.lastLoginAt && user.lastLoginAt >= weekAgo);
    } else if (activeFilter === 'new') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(user => user.createdAt && user.createdAt >= monthAgo);
    } else if (activeFilter === 'top') {
      filtered = filtered.filter(user => (user.gamification?.level || 1) >= 3);
    }

    setFilteredUsers(filtered);
  };

  // Obtenir le leaderboard top 5
  const getTopUsers = () => {
    return [...users]
      .sort((a, b) => (b.gamification?.totalXp || 0) - (a.gamification?.totalXp || 0))
      .slice(0, 5)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  };

  // Formater les dates
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

  // Exporter en CSV
  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'Département', 'Niveau', 'XP', 'Tâches', 'Dernière connexion'];
    const csvData = filteredUsers.map(user => [
      user.displayName,
      user.email,
      user.profile?.department || 'Non défini',
      user.gamification?.level || 1,
      user.gamification?.totalXp || 0,
      user.gamification?.tasksCompleted || 0,
      user.lastLoginAt ? user.lastLoginAt.toLocaleDateString('fr-FR') : 'Jamais'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs_synergia_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Effects
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeFilter, users]);

  if (loading) {
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
            onClick={loadUsers}
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
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} 
              {searchTerm && ` trouvé${filteredUsers.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
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
                  <p className="text-sm text-gray-400">Actifs (7j)</p>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      {searchTerm ? 'Aucun résultat' : 'Aucun utilisateur'}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Aucun utilisateur trouvé pour "${searchTerm}"`
                        : 'Aucun utilisateur ne correspond aux filtres sélectionnés'
                      }
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer group"
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
                            <h4 className="font-medium text-white truncate group-hover:text-blue-300">
                              {user.displayName}
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
                            <span className="text-gray-400">Tâches</span>
                            <span className="text-green-400 font-medium">
                              {user.gamification?.tasksCompleted || 0}
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
                        className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group"
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
                            <h4 className="font-medium text-white truncate group-hover:text-blue-300">
                              {user.displayName}
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
                            <span>{user.gamification?.tasksCompleted || 0} tâches</span>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top 5 Leaderboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 5 XP
              </h3>
              <div className="space-y-3">
                {getTopUsers().map((user, index) => (
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
                        {user.gamification?.totalXp || 0} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques de département */}
            {stats?.departmentBreakdown && Object.keys(stats.departmentBreakdown).length > 0 && (
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
                        <span className="text-sm text-gray-300 truncate">{dept}</span>
                        <span className="text-sm font-medium text-white ml-2">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Distribution des niveaux */}
            {stats?.levelDistribution && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  Niveaux
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.levelDistribution)
                    .sort(([a], [b]) => {
                      const order = { '1': 1, '2-4': 2, '5-9': 3, '10+': 4 };
                      return order[a] - order[b];
                    })
                    .map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Niveau {level}</span>
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
