// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS - Avec affichage des badges attribués
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
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
  Zap
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Charger tous les utilisateurs avec leurs badges
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Chargement des utilisateurs avec badges...');
      
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const allUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // 🏆 RÉCUPÉRER LES BADGES ATTRIBUÉS
        const userBadges = data.badges || [];
        const badgeCount = userBadges.length;
        const totalXpFromBadges = userBadges.reduce((total, badge) => total + (badge.xpReward || 0), 0);
        
        return {
          id: doc.id,
          displayName: data.displayName || 'Utilisateur',
          email: data.email || '',
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate?.() || null,
          role: data.role || 'user',
          
          // 🎯 DONNÉES XP ET BADGES MISES À JOUR
          xp: data.xp || 0,
          badges: userBadges,
          badgeCount: badgeCount,
          totalXpFromBadges: totalXpFromBadges,
          lastBadgeReceived: data.lastBadgeReceived || null,
          
          // Gamification legacy (compatibilité)
          gamification: data.gamification || { 
            level: 1, 
            totalXp: data.xp || 0, 
            badges: userBadges 
          },
          
          isActive: data.isActive !== false
        };
      });
      
      setUsers(allUsers);
      console.log(`✅ ${allUsers.length} utilisateurs chargés avec badges`);
      
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques avec badges
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    totalBadges: users.reduce((sum, u) => sum + u.badgeCount, 0),
    avgXp: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.xp, 0) / users.length) : 0
  };

  // Fonction pour afficher les badges
  const renderUserBadges = (userBadges) => {
    if (!userBadges || userBadges.length === 0) {
      return (
        <div className="text-center py-2">
          <Trophy className="w-6 h-6 text-gray-300 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Aucun badge</p>
        </div>
      );
    }

    // Afficher les 3 premiers badges + compteur si plus
    const visibleBadges = userBadges.slice(0, 3);
    const remainingCount = Math.max(0, userBadges.length - 3);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleBadges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"
            title={`${badge.name} - ${badge.xpReward}XP`}
          >
            <span>{badge.icon || '🏆'}</span>
            <span className="truncate max-w-20">{badge.name}</span>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  // Affichage en cas de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Chargement des utilisateurs...</span>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadUsers}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XP Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgXp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et contrôles */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Utilisateurs ({filteredUsers.length})
            </h3>
            
            {filteredUsers.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Header utilisateur */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {user.displayName || 'Utilisateur'}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {user.role === 'admin' && (
                          <Crown className="h-4 w-4 text-red-500" title="Administrateur" />
                        )}
                        {user.isActive && (
                          <div className="w-3 h-3 bg-green-500 rounded-full" title="Actif" />
                        )}
                      </div>
                    </div>

                    {/* Statistiques utilisateur */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">XP Total</p>
                        <p className="font-semibold text-gray-900">{user.xp || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Badges</p>
                        <p className="font-semibold text-gray-900">{user.badgeCount}</p>
                      </div>
                    </div>

                    {/* Badges de l'utilisateur */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Badges obtenus :</p>
                      {renderUserBadges(user.badges)}
                    </div>

                    {/* Dernier badge reçu */}
                    {user.lastBadgeReceived && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700 mb-1">Dernier badge :</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.lastBadgeReceived.icon || '🏆'}</span>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">{user.lastBadgeReceived.name}</p>
                            <p className="text-xs text-yellow-600">+{user.lastBadgeReceived.xpReward}XP</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date de création */}
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Membre depuis {user.createdAt ? user.createdAt.toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Essayez avec un autre terme de recherche' : 'Les utilisateurs apparaîtront ici'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
