// ==========================================
// 📁 react-app/src/components/admin/AdminBadgePanel.jsx
// PANEL ADMIN BADGES CORRIGÉ - MÉTHODES EXISTANTES SEULEMENT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings,
  Eye,
  Award,
  Trash2,
  UserPlus,
  CheckSquare,
  Clock,
  ExternalLink,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🏆 PANEL D'ADMINISTRATION DES BADGES COMPLET - VERSION CORRIGÉE
 */
const AdminBadgePanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [statistics, setStatistics] = useState({
    totalBadges: 0,
    totalUsers: 0,
    totalAwarded: 0,
    thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
  });
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('badges');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrer les badges quand search/filter change
  useEffect(() => {
    filterBadges();
  }, [allBadges, searchTerm, filterType]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement données admin...');
      
      // Charger seulement les méthodes qui existent
      const [badges, users] = await Promise.all([
        adminBadgeService.getAllBadges(),
        adminBadgeService.getAllUsers()
      ]);
      
      // Essayer de charger les statistiques, mais avec gestion d'erreur
      let badgeStats = null;
      try {
        badgeStats = await adminBadgeService.getBadgeStatistics();
      } catch (error) {
        console.warn('⚠️ getBadgeStatistics non disponible:', error.message);
      }
      
      setAllBadges(badges || []);
      setAllUsers(users || []);
      
      // Calculer des statistiques basiques si les vraies stats ne sont pas disponibles
      const stats = badgeStats || {
        totalBadges: badges?.length || 0,
        totalUsers: users?.length || 0,
        totalAwarded: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      };
      
      setStatistics(stats);
      
      console.log('✅ Données admin chargées:', {
        badges: (badges || []).length,
        users: (users || []).length,
        stats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setAllBadges([]);
      setAllUsers([]);
      setStatistics({
        totalBadges: 0,
        totalUsers: 0,
        totalAwarded: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBadges = () => {
    let filtered = [...allBadges];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(badge => 
        (badge.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (badge.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(badge => (badge.type || '') === filterType);
    }
    
    setFilteredBadges(filtered);
  };

  // Vérification des permissions
  if (!adminBadgeService.checkAdminPermissions(user)) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions administrateur nécessaires.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement du panel admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-600" />
              Panel Administration Badges
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les badges système et les attributions utilisateur
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Clock className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{statistics.totalBadges}</div>
          <div className="text-sm text-gray-600">Total Badges</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</div>
          <div className="text-sm text-gray-600">Utilisateurs</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{statistics.totalAwarded}</div>
          <div className="text-sm text-gray-600">Badges Attribués</div>
        </div>
        
        <div className="bg-white rounded-lg border p-6 text-center">
          <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{statistics.thisMonth?.newBadges || 0}</div>
          <div className="text-sm text-gray-600">Ce Mois</div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'badges'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Badges ({allBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Utilisateurs ({allUsers.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Contrôles de recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {activeTab === 'badges' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="achievement">Achievement</option>
                <option value="milestone">Milestone</option>
                <option value="special">Spécial</option>
              </select>
            )}
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'badges' ? (
            <div>
              {filteredBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBadges.map((badge) => (
                    <div key={badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{badge.name || 'Badge sans nom'}</h4>
                          <p className="text-sm text-gray-600">{badge.type || 'Type non défini'}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {badge.description || 'Aucune description'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-600 font-medium">
                          +{badge.xpReward || 0} XP
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => console.log('Voir badge:', badge.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucun badge ne correspond à votre recherche' : 'Aucun badge dans le système'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {allUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers.map((userData) => (
                    <div key={userData.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {userData.displayName || userData.email || 'Utilisateur'}
                          </h4>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {userData.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => console.log('Voir profil:', userData.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log('Attribuer badge:', userData.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-gray-600">Aucun utilisateur dans le système</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBadgePanel;
