// ==========================================
// 📁 react-app/src/pages/AdminUsersPage.jsx
// PAGE ADMINISTRATION DES UTILISATEURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Crown, 
  Shield, 
  Eye, 
  EyeOff,
  Mail,
  Calendar,
  Award,
  Star,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Ban,
  UserCheck
} from 'lucide-react';

// Firebase
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Services
import rolePermissionsService from '../core/services/rolePermissionsService.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    max-width: 400px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
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

// Statuts utilisateur
const USER_STATUS = {
  ACTIVE: { id: 'active', name: 'Actif', color: 'bg-green-500', icon: CheckCircle },
  INACTIVE: { id: 'inactive', name: 'Inactif', color: 'bg-gray-500', icon: EyeOff },
  SUSPENDED: { id: 'suspended', name: 'Suspendu', color: 'bg-red-500', icon: Ban },
  PENDING: { id: 'pending', name: 'En attente', color: 'bg-yellow-500', icon: Clock }
};

// Rôles système
const SYSTEM_ROLES = {
  ADMIN: { id: 'admin', name: 'Administrateur', icon: Crown, color: 'text-yellow-400' },
  MODERATOR: { id: 'moderator', name: 'Modérateur', icon: Shield, color: 'text-blue-400' },
  USER: { id: 'user', name: 'Utilisateur', icon: Users, color: 'text-gray-400' }
};

/**
 * 👥 PAGE ADMINISTRATION DES UTILISATEURS
 */
const AdminUsersPage = () => {
  const { user: currentUser } = useAuthStore();
  
  // États principaux
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    newThisMonth: 0
  });

  /**
   * 📊 CHARGER LES UTILISATEURS
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les utilisateurs
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersList = [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      let activeCount = 0;
      let adminCount = 0;
      let newThisMonth = 0;
      
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const createdAt = userData.createdAt?.toDate?.() || new Date();
        
        // Calculer les statistiques
        if (userData.status === 'active' || !userData.status) activeCount++;
        if (userData.role === 'admin' || userData.isAdmin) adminCount++;
        if (createdAt >= oneMonthAgo) newThisMonth++;
        
        // Enrichir avec les permissions
        const userPermissions = await rolePermissionsService.getUserPermissions(doc.id);
        
        usersList.push({
          id: doc.id,
          ...userData,
          createdAt,
          permissions: userPermissions,
          synergiaRoles: userData.synergiaRoles || [],
          status: userData.status || 'active',
          lastActive: userData.lastActive ? new Date(userData.lastActive) : null
        });
      }
      
      setUsers(usersList);
      setStats({
        total: usersList.length,
        active: activeCount,
        admins: adminCount,
        newThisMonth
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      showNotification('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 CHANGER LE STATUT D'UN UTILISATEUR
   */
  const changeUserStatus = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: currentUser.uid
      });
      
      showNotification('Statut utilisateur mis à jour', 'success');
      await loadUsers();
      
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      showNotification('Erreur lors du changement de statut', 'error');
    }
  };

  /**
   * 👑 PROMOUVOIR/RÉTROGRADER UN UTILISATEUR
   */
  const changeUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        isAdmin: newRole === 'admin',
        roleUpdatedAt: new Date(),
        roleUpdatedBy: currentUser.uid
      });
      
      showNotification(`Utilisateur ${newRole === 'admin' ? 'promu' : 'rétrogradé'} avec succès`, 'success');
      await loadUsers();
      
    } catch (error) {
      console.error('❌ Erreur changement rôle:', error);
      showNotification('Erreur lors du changement de rôle', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER UN UTILISATEUR
   */
  const deleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      showNotification('Utilisateur supprimé avec succès', 'success');
      await loadUsers();
      
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 🏆 ATTRIBUER UN BADGE À UN UTILISATEUR
   */
  const awardBadge = async (userId, badgeId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentBadges = userData.badges || [];
        
        if (!currentBadges.includes(badgeId)) {
          await updateDoc(userRef, {
            badges: [...currentBadges, badgeId],
            badgesUpdatedAt: new Date()
          });
          
          showNotification('Badge attribué avec succès', 'success');
          await loadUsers();
        } else {
          showNotification('L\'utilisateur possède déjà ce badge', 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur attribution badge:', error);
      showNotification('Erreur lors de l\'attribution du badge', 'error');
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrer et trier les utilisateurs
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = (user.displayName || user.email || '')
        .toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesRole = filterRole === 'all' || 
        (filterRole === 'admin' && (user.role === 'admin' || user.isAdmin)) ||
        (filterRole === 'user' && user.role !== 'admin' && !user.isAdmin);
      
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || a.email).localeCompare(b.displayName || b.email);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'recent':
        default:
          return b.createdAt - a.createdAt;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 📊 Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Users className="w-10 h-10 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-400 mt-2">
                  Administrer les utilisateurs et leurs permissions
                </p>
              </div>
            </div>
            
            <button 
              onClick={loadUsers}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total utilisateurs</div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                  <div className="text-sm text-gray-400">Actifs</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.admins}</div>
                  <div className="text-sm text-gray-400">Administrateurs</div>
                </div>
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.newThisMonth}</div>
                  <div className="text-sm text-gray-400">Nouveau ce mois</div>
                </div>
                <UserPlus className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Filtres et recherche */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filtre par statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.values(USER_STATUS).map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            
            {/* Filtre par rôle */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
            
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Plus récents</option>
              <option value="name">Par nom</option>
              <option value="email">Par email</option>
            </select>
          </div>
        </div>

        {/* 👥 Liste des utilisateurs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rôles Synergia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map(user => {
                  const userStatus = USER_STATUS[user.status?.toUpperCase()] || USER_STATUS.ACTIVE;
                  const isAdmin = user.role === 'admin' || user.isAdmin;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                      {/* Utilisateur */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </div>
                            {isAdmin && (
                              <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.displayName || 'Sans nom'}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Rôles Synergia */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.synergiaRoles?.slice(0, 2).map(role => (
                            <span key={role.roleId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {role.roleName || role.roleId}
                            </span>
                          )) || (
                            <span className="text-gray-500 text-xs">Aucun rôle</span>
                          )}
                          {user.synergiaRoles?.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{user.synergiaRoles.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Statut */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${userStatus.color}`}>
                          <userStatus.icon className="w-3 h-3 mr-1" />
                          {userStatus.name}
                        </span>
                      </td>
                      
                      {/* Date d'inscription */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.createdAt.toLocaleDateString('fr-FR')}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {user.id !== currentUser.uid && (
                            <>
                              <button
                                onClick={() => changeUserRole(user.id, isAdmin ? 'user' : 'admin')}
                                className="text-yellow-400 hover:text-yellow-300 p-1"
                                title={isAdmin ? 'Rétrograder' : 'Promouvoir admin'}
                              >
                                <Crown className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message si aucun utilisateur */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Aucun utilisateur dans la base de données'
              }
            </p>
          </div>
        )}
      </div>

      {/* 👁️ Modal détails utilisateur */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Profil de {selectedUser.displayName || selectedUser.email}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Informations personnelles</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">
                          Inscrit le {selectedUser.createdAt.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {selectedUser.lastActive && (
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">
                            Dernière activité: {selectedUser.lastActive.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Statistiques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{selectedUser.level || 1}</div>
                        <div className="text-xs text-gray-500">Niveau</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{selectedUser.totalXP || 0}</div>
                        <div className="text-xs text-gray-500">XP Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{selectedUser.badges?.length || 0}</div>
                        <div className="text-xs text-gray-500">Badges</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{selectedUser.synergiaRoles?.length || 0}</div>
                        <div className="text-xs text-gray-500">Rôles</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rôles Synergia */}
                <div>
                  <h4 className="text-white font-medium mb-3">Rôles Synergia</h4>
                  {selectedUser.synergiaRoles?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.synergiaRoles.map(role => (
                        <div key={role.roleId} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">{role.roleName || role.roleId}</h5>
                            <span className="text-xs text-gray-400">
                              {role.xpInRole || 0} XP
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">
                            Assigné le {new Date(role.assignedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Aucun rôle Synergia assigné
                    </div>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-white font-medium mb-3">Permissions</h4>
                  {selectedUser.permissions?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.permissions.map(permission => (
                        <span key={permission} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      Aucune permission spéciale
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
                      changeUserStatus(selectedUser.id, newStatus);
                      setShowUserModal(false);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      selectedUser.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Suspendre' : 'Activer'}
                  </button>
                  
                  {selectedUser.id !== currentUser.uid && (
                    <button
                      onClick={() => {
                        const isAdmin = selectedUser.role === 'admin' || selectedUser.isAdmin;
                        changeUserRole(selectedUser.id, isAdmin ? 'user' : 'admin');
                        setShowUserModal(false);
                      }}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      {selectedUser.role === 'admin' || selectedUser.isAdmin ? 'Rétrograder' : 'Promouvoir Admin'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✏️ Modal édition utilisateur */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Actions rapides - {selectedUser.displayName || selectedUser.email}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Changement de statut */}
                <div>
                  <h4 className="text-white font-medium mb-3">Changer le statut</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(USER_STATUS).map(status => {
                      const StatusIcon = status.icon;
                      const isCurrentStatus = selectedUser.status === status.id;
                      
                      return (
                        <button
                          key={status.id}
                          onClick={() => {
                            if (!isCurrentStatus) {
                              changeUserStatus(selectedUser.id, status.id);
                              setShowEditModal(false);
                            }
                          }}
                          disabled={isCurrentStatus}
                          className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                            isCurrentStatus
                              ? `${status.color} text-white cursor-not-allowed`
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span>{status.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions spéciales */}
                {selectedUser.id !== currentUser.uid && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Actions administratives</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const isAdmin = selectedUser.role === 'admin' || selectedUser.isAdmin;
                          changeUserRole(selectedUser.id, isAdmin ? 'user' : 'admin');
                          setShowEditModal(false);
                        }}
                        className="w-full flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Crown className="w-4 h-4" />
                        <span>
                          {selectedUser.role === 'admin' || selectedUser.isAdmin 
                            ? 'Rétrograder en utilisateur' 
                            : 'Promouvoir administrateur'
                          }
                        </span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                            deleteUser(selectedUser.id);
                            setShowEditModal(false);
                          }
                        }}
                        className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer l'utilisateur</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Annuler */}
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersPage;
