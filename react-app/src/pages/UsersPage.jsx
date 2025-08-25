// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS - VERSION CORRIGÉE SANS ERREURS
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
  Mail, 
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Trophy,
  MessageCircle
} from 'lucide-react';

// Imports design system
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// Firebase imports
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  limit,
  where
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎯 CONSTANTES
 */
const USER_STATUS_COLORS = {
  actif: 'text-green-500',
  récent: 'text-yellow-500',
  inactif: 'text-gray-500'
};

const USER_ROLES_COLORS = {
  admin: 'text-red-400',
  manager: 'text-purple-400',
  member: 'text-blue-400',
  guest: 'text-gray-400'
};

/**
 * 👥 PAGE UTILISATEURS SIMPLIFIÉE ET FONCTIONNELLE
 */
const UsersPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // États interface
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  /**
   * 🚀 CHARGEMENT DES UTILISATEURS DEPUIS FIREBASE
   */
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Chargement utilisateurs depuis Firebase...');
      
      // Requête Firebase pour récupérer tous les utilisateurs
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc'),
        limit(100)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Créer un utilisateur propre
        const userProfile = {
          id: doc.id,
          uid: doc.id,
          
          // Informations de base
          name: cleanDisplayName(userData),
          displayName: cleanDisplayName(userData),
          email: userData.email || 'Email non renseigné',
          photoURL: userData.photoURL || null,
          
          // Données gamification
          totalXp: userData.gamification?.totalXp || userData.totalXp || 0,
          level: userData.gamification?.level || userData.level || 1,
          tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
          badges: userData.gamification?.badges || userData.badges || [],
          
          // Informations profil
          role: userData.profile?.role || userData.role || 'member',
          department: userData.profile?.department || userData.department || 'Général',
          position: userData.profile?.position || userData.position || '',
          
          // Statut et activité
          status: calculateUserStatus(userData),
          lastActivity: userData.gamification?.lastActivityDate || userData.lastActivity,
          createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt) || new Date(),
          
          // Statistiques
          loginStreak: userData.gamification?.loginStreak || 0,
          completionRate: calculateCompletionRate(userData),
          
          // Données supplémentaires
          bio: userData.profile?.bio || '',
          skills: userData.profile?.skills || [],
          synergiaRoles: userData.synergiaRoles || [],
          
          source: 'firebase'
        };
        
        usersList.push(userProfile);
      });
      
      console.log(`✅ ${usersList.length} utilisateurs chargés depuis Firebase`);
      setUsers(usersList);
      
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧹 NETTOYER LES NOMS D'AFFICHAGE
   */
  const cleanDisplayName = (userData) => {
    let name = userData.displayName || userData.profile?.displayName || userData.email || 'Utilisateur';
    
    // Nettoyer les URLs et caractères étranges
    if (name.includes('http') || name.includes('www.')) {
      name = userData.email?.split('@')[0] || 'Utilisateur';
    }
    
    // Cas spécifique pour les administrateurs connus
    if (userData.email === 'alan.boehme61@gmail.com') {
      name = 'Alan Boehme (Admin)';
    }
    
    // Limiter la longueur
    return name.length > 30 ? name.substring(0, 30) + '...' : name;
  };

  /**
   * 📊 CALCULER LE STATUT UTILISATEUR
   */
  const calculateUserStatus = (userData) => {
    const lastActivity = userData.gamification?.lastActivityDate || userData.lastActivity;
    if (!lastActivity) return 'inactif';
    
    const daysSinceActivity = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity < 1) return 'actif';
    if (daysSinceActivity < 7) return 'récent';
    return 'inactif';
  };

  /**
   * 📈 CALCULER TAUX DE COMPLÉTION
   */
  const calculateCompletionRate = (userData) => {
    const tasksCompleted = userData.gamification?.tasksCompleted || userData.tasksCompleted || 0;
    const totalTasks = tasksCompleted + 1; // Éviter division par zéro
    return Math.round((tasksCompleted / totalTasks) * 100);
  };

  /**
   * 🔍 FILTRER LES UTILISATEURS
   */
  const filteredUsers = users.filter(userItem => {
    // Filtre recherche
    const matchesSearch = !searchTerm || 
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre statut
    const matchesStatus = statusFilter === 'all' || userItem.status === statusFilter;
    
    // Filtre rôle
    const matchesRole = roleFilter === 'all' || userItem.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  /**
   * 📊 CALCULER LES STATISTIQUES
   */
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'actif').length,
    totalXP: users.reduce((sum, u) => sum + (u.totalXp || 0), 0),
    averageLevel: users.length > 0 
      ? Math.round(users.reduce((sum, u) => sum + (u.level || 0), 0) / users.length)
      : 0,
    admins: users.filter(u => u.role?.toLowerCase().includes('admin')).length,
    newThisMonth: users.filter(u => {
      const createdAt = u.createdAt || new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return createdAt >= oneMonthAgo;
    }).length
  };

  // Statistiques header
  const headerStats = [
    { 
      label: "Utilisateurs Total", 
      value: userStats.total, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Utilisateurs Actifs", 
      value: userStats.active, 
      icon: Activity, 
      color: "text-green-400" 
    },
    { 
      label: "XP Total", 
      value: userStats.totalXP.toLocaleString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Niveau Moyen", 
      value: userStats.averageLevel, 
      icon: TrendingUp, 
      color: "text-purple-400" 
    }
  ];

  // Actions header
  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={loadUsers}
        disabled={loading}
      >
        {loading ? 'Actualisation...' : 'Actualiser'}
      </PremiumButton>
      <PremiumButton variant="primary" icon={UserPlus}>
        Inviter Utilisateur
      </PremiumButton>
    </div>
  );

  // Filtres disponibles
  const statuses = ['all', ...new Set(users.map(u => u.status))];
  const roles = ['all', ...new Set(users.map(u => u.role).filter(Boolean))];

  /**
   * 🎨 RENDU PRINCIPAL
   */
  if (loading) {
    return (
      <PremiumLayout
        title="Utilisateurs"
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
            <p className="text-white">Récupération des utilisateurs Firebase...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="Utilisateurs"
        subtitle="Erreur de chargement"
        icon={Users}
      >
        <PremiumCard className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <PremiumButton variant="primary" onClick={loadUsers}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Utilisateurs"
      subtitle={`Gestion des utilisateurs de la plateforme (${userStats.total} utilisateurs)`}
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres */}
      <PremiumCard className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Tous les statuts' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Filtre rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {roles.slice(0, 6).map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'Tous les rôles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          {/* Bouton reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
          {filteredUsers.length !== users.length && (
            <span> sur {users.length} au total</span>
          )}
        </div>
      </PremiumCard>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((userItem, index) => {
          const isCurrentUser = userItem.id === user?.uid;
          const statusColor = USER_STATUS_COLORS[userItem.status] || 'text-gray-500';
          const roleColor = USER_ROLES_COLORS[userItem.role] || 'text-blue-400';
          
          return (
            <motion.div
              key={userItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 hover:scale-[1.02]
                ${isCurrentUser ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'}
              `}
            >
              {/* Badge utilisateur actuel */}
              {isCurrentUser && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Vous
                </div>
              )}

              {/* Statut utilisateur */}
              <div className="absolute top-3 left-3">
                <div className={`w-3 h-3 rounded-full ${
                  userItem.status === 'actif' ? 'bg-green-500' : 
                  userItem.status === 'récent' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>

              {/* Avatar et informations */}
              <div className="mt-6 text-center">
                <div className="relative inline-block mb-4">
                  {userItem.photoURL ? (
                    <img 
                      src={userItem.photoURL} 
                      alt={userItem.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto"
                    style={{ display: userItem.photoURL ? 'none' : 'flex' }}
                  >
                    <span className="text-white font-bold text-xl">
                      {userItem.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{userItem.name}</h3>
                <p className={`text-sm mb-2 font-medium ${roleColor}`}>{userItem.role}</p>
                <p className="text-gray-500 text-xs mb-3">{userItem.department}</p>

                {/* Statistiques utilisateur */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{userItem.totalXp.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">{userItem.level}</div>
                    <div className="text-xs text-gray-400">Niveau</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{userItem.tasksCompleted}</div>
                    <div className="text-xs text-gray-400">Tâches</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progression</span>
                    <span>{Math.min(100, userItem.completionRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, userItem.completionRate)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => {
                      setSelectedUser(userItem);
                      setShowUserModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Profil
                  </button>
                  
                  {userItem.email && (
                    <a 
                      href={`mailto:${userItem.email}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors"
                      title={`Envoyer un email à ${userItem.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Message si aucun utilisateur trouvé */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-400 mb-4">Essayez de modifier vos critères de recherche</p>
            <PremiumButton 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
            >
              Réinitialiser les filtres
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* Message si pas d'utilisateurs */}
      {users.length === 0 && !loading && (
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-400 mb-4">Il semblerait qu'aucun utilisateur ne soit enregistré sur la plateforme</p>
            <PremiumButton variant="primary" onClick={loadUsers}>
              Actualiser
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* MODAL DÉTAIL UTILISATEUR */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedUser.photoURL ? (
                    <img 
                      src={selectedUser.photoURL} 
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400">{selectedUser.role} • {selectedUser.department}</p>
                    <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{selectedUser.totalXp.toLocaleString()}</div>
                  <div className="text-gray-400">XP Total</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{selectedUser.level}</div>
                  <div className="text-gray-400">Niveau</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{selectedUser.tasksCompleted}</div>
                  <div className="text-gray-400">Tâches</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{selectedUser.badges?.length || 0}</div>
                  <div className="text-gray-400">Badges</div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Informations</h4>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statut :</span>
                      <span className={`capitalize font-medium ${USER_STATUS_COLORS[selectedUser.status]}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taux de complétion :</span>
                      <span className="text-white">{selectedUser.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Membre depuis :</span>
                      <span className="text-white">{selectedUser.createdAt.toLocaleDateString()}</span>
                    </div>
                    {selectedUser.lastActivity && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière activité :</span>
                        <span className="text-white">
                          {new Date(selectedUser.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rôles Synergia */}
                {selectedUser.synergiaRoles?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Rôles Synergia</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.synergiaRoles.map((role, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                          {role.roleName || role.roleId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedUser.email && (
                    <a
                      href={`mailto:${selectedUser.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Envoyer un email
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-gray-400 font-mono text-sm mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-500">
            {JSON.stringify({ 
              totalUsers: users.length,
              filteredUsers: filteredUsers.length,
              loading,
              error: !!error
            }, null, 2)}
          </pre>
        </div>
      )}
    </PremiumLayout>
  );
};

export default UsersPage;
