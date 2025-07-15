// ==========================================
// 📁 react-app/src/pages/AdminBadgesPage.jsx
// PAGE ADMINISTRATION DES BADGES AVEC PANEL ADMIN COMPLET INTÉGRÉ
// VERSION CORRIGÉE POUR REMPLACEMENT COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Trophy,
  Users,
  BarChart3,
  Plus,
  Search,
  Filter,
  Shield,
  Award,
  Star,
  Crown,
  Target,
  Medal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Clock,
  CheckSquare,
  Settings,
  ArrowLeft,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Activity,
  TrendingUp,
  Calendar,
  Gift,
  ExternalLink
} from 'lucide-react';

// Services
import { adminBadgeService } from '../core/services/adminBadgeService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Notification système
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// Types de badges
const BADGE_TYPES = {
  ROLE: { id: 'role', name: 'Rôle', icon: Crown, color: 'bg-purple-500' },
  ACHIEVEMENT: { id: 'achievement', name: 'Accomplissement', icon: Trophy, color: 'bg-yellow-500' },
  SKILL: { id: 'skill', name: 'Compétence', icon: Star, color: 'bg-blue-500' },
  MILESTONE: { id: 'milestone', name: 'Étape', icon: Target, color: 'bg-green-500' },
  SPECIAL: { id: 'special', name: 'Spécial', icon: Medal, color: 'bg-red-500' }
};

// Icônes disponibles pour les badges
const BADGE_ICONS = [
  '🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🎯', '🚀', '💪',
  '🎨', '🔧', '📚', '💡', '🎓', '🏅', '🌟', '💯', '🔝', '✨'
];

// Niveaux de rareté
const RARITY_LEVELS = {
  common: { name: 'Commun', color: 'bg-gray-500', multiplier: 1 },
  uncommon: { name: 'Peu Commun', color: 'bg-green-500', multiplier: 1.5 },
  rare: { name: 'Rare', color: 'bg-blue-500', multiplier: 2 },
  epic: { name: 'Épique', color: 'bg-purple-500', multiplier: 3 },
  legendary: { name: 'Légendaire', color: 'bg-yellow-500', multiplier: 5 }
};

/**
 * 🏆 PAGE ADMINISTRATION DES BADGES COMPLÈTE
 */
const AdminBadgesPage = () => {
  const { user } = useAuthStore();
  
  // États principaux - Panel Admin complet
  const [allBadges, setAllBadges] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [statistics, setStatistics] = useState({
    totalBadges: 0,
    totalUsers: 0,
    totalAwarded: 0,
    activeUsers: 0,
    thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
  });
  const [loading, setLoading] = useState(true);
  
  // États UI - Navigation des onglets
  const [activeTab, setActiveTab] = useState('overview'); // overview, badges, users, analytics
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // États modaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Formulaire de création/édition
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    type: 'achievement',
    xpReward: 10,
    rarity: 'common',
    requirements: [],
    isActive: true,
    conditions: {
      minXP: 0,
      minLevel: 0,
      requiredRoles: [],
      completedTasks: 0
    }
  });

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtrer les badges quand les critères changent
  useEffect(() => {
    filterBadges();
  }, [allBadges, searchTerm, filterType, filterStatus]);

  /**
   * 📊 CHARGER TOUTES LES DONNÉES ADMIN
   */
  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement données admin complètes...');
      
      // Charger en parallèle toutes les données
      const [badgesData, usersData, statsData] = await Promise.all([
        loadBadges(),
        loadUsers(),
        loadStatistics()
      ]);
      
      console.log('✅ Données chargées:', {
        badges: badgesData?.length || 0,
        users: usersData?.length || 0,
        stats: statsData
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🏆 CHARGER LES BADGES
   */
  const loadBadges = async () => {
    try {
      // Utiliser le service admin pour récupérer tous les badges
      const badges = await adminBadgeService.getAllBadges();
      setAllBadges(badges || []);
      return badges;
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      
      // Fallback: charger directement depuis Firebase
      try {
        const badgesRef = collection(db, 'badges');
        const badgesSnapshot = await getDocs(query(badgesRef, orderBy('createdAt', 'desc')));
        
        const badgesList = [];
        badgesSnapshot.forEach((doc) => {
          badgesList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          });
        });
        
        setAllBadges(badgesList);
        return badgesList;
      } catch (fallbackError) {
        console.error('❌ Erreur fallback badges:', fallbackError);
        setAllBadges([]);
        return [];
      }
    }
  };

  /**
   * 👥 CHARGER LES UTILISATEURS
   */
  const loadUsers = async () => {
    try {
      // Utiliser le service admin pour récupérer tous les utilisateurs avec leurs badges
      const users = await adminBadgeService.getAllUsersWithBadges();
      setAllUsers(users || []);
      return users;
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      
      // Fallback: charger directement depuis Firebase
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const usersList = [];
        usersSnapshot.forEach((doc) => {
          usersList.push({
            id: doc.id,
            ...doc.data(),
            badgeCount: 0 // À calculer séparément
          });
        });
        
        setAllUsers(usersList);
        return usersList;
      } catch (fallbackError) {
        console.error('❌ Erreur fallback users:', fallbackError);
        setAllUsers([]);
        return [];
      }
    }
  };

  /**
   * 📈 CHARGER LES STATISTIQUES
   */
  const loadStatistics = async () => {
    try {
      // Utiliser le service admin pour récupérer les statistiques
      const stats = await adminBadgeService.getBadgeStatistics();
      
      // Enrichir avec des données calculées
      const enrichedStats = {
        totalBadges: allBadges.length,
        totalUsers: allUsers.length,
        totalAwarded: stats?.totalAwarded || 0,
        activeUsers: allUsers.filter(u => u.lastSeen && 
          (new Date() - new Date(u.lastSeen)) < 7 * 24 * 60 * 60 * 1000).length,
        thisMonth: {
          newBadges: allBadges.filter(b => 
            b.createdAt && (new Date() - b.createdAt) < 30 * 24 * 60 * 60 * 1000).length,
          awarded: stats?.thisMonth?.awarded || 0,
          newUsers: allUsers.filter(u => 
            u.createdAt && (new Date() - new Date(u.createdAt)) < 30 * 24 * 60 * 60 * 1000).length
        }
      };
      
      setStatistics(enrichedStats);
      return enrichedStats;
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
      
      // Fallback: calculer des statistiques de base
      const basicStats = {
        totalBadges: allBadges.length,
        totalUsers: allUsers.length,
        totalAwarded: 0,
        activeUsers: 0,
        thisMonth: { newBadges: 0, awarded: 0, newUsers: 0 }
      };
      
      setStatistics(basicStats);
      return basicStats;
    }
  };

  /**
   * 🔍 FILTRER LES BADGES
   */
  const filterBadges = () => {
    let filtered = [...allBadges];
    
    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.name?.toLowerCase().includes(term) ||
        badge.description?.toLowerCase().includes(term) ||
        badge.type?.toLowerCase().includes(term)
      );
    }
    
    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(badge => badge.type === filterType);
    }
    
    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(badge => {
        if (filterStatus === 'active') return badge.isActive !== false;
        if (filterStatus === 'inactive') return badge.isActive === false;
        return true;
      });
    }
    
    setFilteredBadges(filtered);
  };

  /**
   * 💾 SAUVEGARDER UN BADGE
   */
  const saveBadge = async () => {
    try {
      if (!badgeForm.name.trim()) {
        showNotification('Le nom du badge est requis', 'error');
        return;
      }
      
      const badgeData = {
        ...badgeForm,
        updatedAt: new Date(),
        updatedBy: user.uid,
        ...(editingBadge ? {} : { 
          createdAt: new Date(),
          createdBy: user.uid,
          earnedCount: 0
        })
      };
      
      if (editingBadge) {
        // Mise à jour
        const badgeRef = doc(db, 'badges', editingBadge.id);
        await updateDoc(badgeRef, badgeData);
        showNotification('Badge mis à jour avec succès', 'success');
      } else {
        // Création
        await addDoc(collection(db, 'badges'), badgeData);
        showNotification('Badge créé avec succès', 'success');
      }
      
      // Réinitialiser le formulaire
      resetBadgeForm();
      setShowCreateModal(false);
      setEditingBadge(null);
      await loadAllData();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde badge:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER UN BADGE
   */
  const deleteBadge = async (badgeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) return;
    
    try {
      await deleteDoc(doc(db, 'badges', badgeId));
      showNotification('Badge supprimé avec succès', 'success');
      await loadAllData();
    } catch (error) {
      console.error('❌ Erreur suppression badge:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 🏅 ATTRIBUER UN BADGE À UN UTILISATEUR
   */
  const awardBadgeToUser = async (userId, badgeId) => {
    try {
      await adminBadgeService.awardBadgeToUser(userId, badgeId);
      showNotification('Badge attribué avec succès', 'success');
      await loadAllData();
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      showNotification('Erreur lors de l\'attribution', 'error');
    }
  };

  /**
   * 📝 RÉINITIALISER LE FORMULAIRE
   */
  const resetBadgeForm = () => {
    setBadgeForm({
      name: '',
      description: '',
      icon: '🏆',
      type: 'achievement',
      xpReward: 10,
      rarity: 'common',
      requirements: [],
      isActive: true,
      conditions: {
        minXP: 0,
        minLevel: 0,
        requiredRoles: [],
        completedTasks: 0
      }
    });
  };

  /**
   * ✏️ ÉDITER UN BADGE
   */
  const editBadge = (badge) => {
    setBadgeForm({
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '🏆',
      type: badge.type || 'achievement',
      xpReward: badge.xpReward || 10,
      rarity: badge.rarity || 'common',
      requirements: badge.requirements || [],
      isActive: badge.isActive !== false,
      conditions: badge.conditions || {
        minXP: 0,
        minLevel: 0,
        requiredRoles: [],
        completedTasks: 0
      }
    });
    setEditingBadge(badge);
    setShowCreateModal(true);
  };

  // Vérification des permissions
  if (!adminBadgeService.checkAdminPermissions(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions administrateur nécessaires pour accéder à cette page.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panel administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Administration des Badges
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={loadAllData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Créer Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{statistics.totalBadges}</div>
            <div className="text-sm text-gray-600">Total Badges</div>
            <div className="text-xs text-green-600 mt-1">
              +{statistics.thisMonth.newBadges} ce mois
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs</div>
            <div className="text-xs text-green-600 mt-1">
              {statistics.activeUsers} actifs
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{statistics.totalAwarded}</div>
            <div className="text-sm text-gray-600">Badges Attribués</div>
            <div className="text-xs text-green-600 mt-1">
              +{statistics.thisMonth.awarded} ce mois
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((statistics.totalAwarded / (statistics.totalUsers || 1)) * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Badges par Utilisateur</div>
            <div className="text-xs text-blue-600 mt-1">
              Moyenne globale
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg border mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Vue d'ensemble
              </button>
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
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Badges récents */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Badges Récents
                    </h3>
                    <div className="space-y-3">
                      {allBadges.slice(0, 5).map((badge) => (
                        <div key={badge.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{badge.name}</p>
                            <p className="text-sm text-gray-600 truncate">{badge.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE_TYPES[badge.type?.toUpperCase()]?.color || 'bg-gray-500'} text-white`}>
                            {BADGE_TYPES[badge.type?.toUpperCase()]?.name || badge.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Utilisateurs actifs */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Utilisateurs Actifs
                    </h3>
                    <div className="space-y-3">
                      {allUsers.slice(0, 5).map((userData) => (
                        <div key={userData.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {userData.role === 'admin' ? (
                              <Crown className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <Users className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {userData.displayName || userData.email || 'Utilisateur'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.badgeCount || 0} badges
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Actions Rapides
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Plus className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-medium text-gray-900">Créer un Badge</p>
                      <p className="text-sm text-gray-600">Ajouter un nouveau badge au système</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                    >
                      <UserPlus className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium text-gray-900">Gérer Utilisateurs</p>
                      <p className="text-sm text-gray-600">Attribuer des badges aux utilisateurs</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                    >
                      <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium text-gray-900">Voir Analytics</p>
                      <p className="text-sm text-gray-600">Analyser les performances</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gestion des badges */}
            {activeTab === 'badges' && (
              <div>
                {/* Filtres et recherche */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Rechercher un badge..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les types</option>
                    {Object.values(BADGE_TYPES).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>

                {/* Liste des badges */}
                {filteredBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBadges.map((badge) => (
                      <div key={badge.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{badge.icon}</div>
                              <div>
                                <h4 className="font-medium text-gray-900">{badge.name}</h4>
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${BADGE_TYPES[badge.type?.toUpperCase()]?.color || 'bg-gray-500'} text-white`}>
                                  {BADGE_TYPES[badge.type?.toUpperCase()]?.name || badge.type}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBadge(badge);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => editBadge(badge)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteBadge(badge.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {badge.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {badge.xpReward} XP
                            </span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${badge.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="text-gray-500">
                                {badge.isActive !== false ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </div>
                          
                          {badge.earnedCount !== undefined && (
                            <div className="mt-2 text-xs text-gray-500">
                              Obtenu {badge.earnedCount} fois
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun badge trouvé</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                        ? 'Aucun badge ne correspond à vos critères de recherche' 
                        : 'Aucun badge dans le système'}
                    </p>
                    {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Créer le premier badge
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Gestion des utilisateurs */}
            {activeTab === 'users' && (
              <div>
                {allUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allUsers.map((userData) => (
                      <div key={userData.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              {userData.role === 'admin' ? (
                                <Crown className="w-6 h-6 text-yellow-600" />
                              ) : (
                                <Users className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {userData.displayName || userData.email || 'Utilisateur'}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Rôle:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userData.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {userData.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Badges:</span>
                              <span className="font-medium">{userData.badgeCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">XP Total:</span>
                              <span className="font-medium">{userData.totalXP || 0}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowUserModal(true);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Voir Profil
                            </button>
                            <button
                              onClick={() => {
                                // Ouvrir modal d'attribution de badge
                                setSelectedUser(userData);
                                // TODO: Implémenter modal d'attribution
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              <Award className="w-4 h-4" />
                              Attribuer
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

            {/* Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Répartition par type */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Répartition par Type
                    </h3>
                    <div className="space-y-3">
                      {Object.values(BADGE_TYPES).map(type => {
                        const count = allBadges.filter(b => b.type === type.id).length;
                        const percentage = allBadges.length > 0 ? Math.round((count / allBadges.length) * 100) : 0;
                        
                        return (
                          <div key={type.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{type.name}</span>
                              <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${type.color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badges les plus obtenus */}
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Badges Populaires
                    </h3>
                    <div className="space-y-3">
                      {allBadges
                        .filter(b => b.earnedCount > 0)
                        .sort((a, b) => (b.earnedCount || 0) - (a.earnedCount || 0))
                        .slice(0, 5)
                        .map((badge) => (
                          <div key={badge.id} className="flex items-center gap-3">
                            <div className="text-2xl">{badge.icon}</div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{badge.name}</p>
                              <p className="text-sm text-gray-600">Obtenu {badge.earnedCount} fois</p>
                            </div>
                          </div>
                        ))}
                      {allBadges.filter(b => b.earnedCount > 0).length === 0 && (
                        <p className="text-gray-500 text-sm">Aucun badge encore obtenu</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Graphiques temporels */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Évolution Temporelle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{statistics.thisMonth.newBadges}</div>
                      <div className="text-sm text-blue-700">Nouveaux badges ce mois</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{statistics.thisMonth.awarded}</div>
                      <div className="text-sm text-green-700">Badges attribués ce mois</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{statistics.thisMonth.newUsers}</div>
                      <div className="text-sm text-purple-700">Nouveaux utilisateurs ce mois</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création/édition de badge */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBadge ? 'Modifier le Badge' : 'Créer un Badge'}
              </h3>
              
              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du badge
                  </label>
                  <input
                    type="text"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Super Vendeur"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description du badge..."
                  />
                </div>

                {/* Icône */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icône
                  </label>
                  <div className="grid grid-cols-10 gap-2 mb-2">
                    {BADGE_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setBadgeForm(prev => ({ ...prev, icon }))}
                        className={`text-2xl p-2 rounded-lg border-2 hover:bg-gray-50 ${
                          badgeForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={badgeForm.type}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(BADGE_TYPES).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rareté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rareté
                  </label>
                  <select
                    value={badgeForm.rarity}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, rarity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(RARITY_LEVELS).map(([key, rarity]) => (
                      <option key={key} value={key}>{rarity.name}</option>
                    ))}
                  </select>
                </div>

                {/* Récompense XP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    value={badgeForm.xpReward}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Statut actif */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={badgeForm.isActive}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Badge actif
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBadge(null);
                    resetBadgeForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveBadge}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBadge ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détails de badge */}
      <AnimatePresence>
        {showDetailsModal && selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedBadge.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${BADGE_TYPES[selectedBadge.type?.toUpperCase()]?.color || 'bg-gray-500'} text-white`}>
                  {BADGE_TYPES[selectedBadge.type?.toUpperCase()]?.name || selectedBadge.type}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600">{selectedBadge.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Récompense XP</h4>
                    <p className="text-gray-600">{selectedBadge.xpReward} XP</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Rareté</h4>
                    <p className="text-gray-600">{RARITY_LEVELS[selectedBadge.rarity]?.name || selectedBadge.rarity}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Statut</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedBadge.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600">
                      {selectedBadge.isActive !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>

                {selectedBadge.earnedCount !== undefined && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Statistiques</h4>
                    <p className="text-gray-600">Obtenu {selectedBadge.earnedCount} fois</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    editBadge(selectedBadge);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBadgesPage;
