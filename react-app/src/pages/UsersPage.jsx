// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS - Version simplifiée qui fonctionne
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
  List
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

  // Charger tous les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

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
          role: data.role || 'user',
          gamification: data.gamification || { level: 1, totalXp: 0, badges: [] },
          isActive: data.isActive !== false
        };
      });
      
      setUsers(allUsers);
      console.log(`✅ ${allUsers.length} utilisateurs chargés`);
      
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

  // Statistiques
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    avgLevel: users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.gamification?.level || 1), 0) / users.length) : 1
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                Utilisateurs
              </h1>
              <p className="text-gray-600 mt-1">Gestion des utilisateurs</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-green-700">Actifs</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                <div className="text-sm text-purple-700">Admins</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.avgLevel}</div>
                <div className="text-sm text-yellow-700">Niveau moyen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredUsers.map((user) => {
            const isCurrentUser = user.id === currentUser?.uid;
            
            return (
              <div
                key={user.id}
                className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                  isCurrentUser ? 'ring-2 ring-blue-500' : ''
                } ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
              >
                {/* Avatar et info de base */}
                <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'text-center mb-4'}`}>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {isCurrentUser && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-lg font-bold text-gray-900">
                      {user.displayName}
                      {isCurrentUser && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Vous</span>}
                    </h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    
                    {/* Rôle */}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                    </span>
                  </div>
                </div>

                {/* Statistiques gamification */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-yellow-500 mb-1">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="font-bold">{user.gamification?.level || 1}</span>
                      </div>
                      <div className="text-xs text-gray-500">Niveau</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-purple-500 mb-1">
                        <Trophy className="w-4 h-4 mr-1" />
                        <span className="font-bold">{user.gamification?.totalXp || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500">XP Total</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-500 mb-1">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="font-bold">{user.gamification?.badges?.length || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500">Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-500 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="font-bold text-xs">
                          {user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Membre depuis</div>
                    </div>
                  </div>
                )}

                {/* Info compacte pour mode liste */}
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1" />
                      Niv. {user.gamification?.level || 1}
                    </div>
                    <div className="flex items-center text-purple-600">
                      <Trophy className="w-4 h-4 mr-1" />
                      {user.gamification?.totalXp || 0} XP
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Award className="w-4 h-4 mr-1" />
                      {user.gamification?.badges?.length || 0} badges
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun utilisateur */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Essayez de modifier votre recherche'
                : 'Aucun utilisateur enregistré dans la base de données'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
