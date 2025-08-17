// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// PAGE UTILISATEURS AVEC PREMIUMLAYOUT ET MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Award
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const UsersPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const userIsAdmin = isAdmin(user);

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName', 'asc')
      );
      
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'active', // Par défaut
        lastSeen: new Date()
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      // Données de démonstration
      setUsers([
        {
          id: '1',
          displayName: 'Alice Champion',
          email: 'alice@synergia.com',
          role: 'admin',
          status: 'active',
          totalXp: 2450,
          level: 8,
          tasksCompleted: 45,
          badgesCount: 12,
          lastSeen: new Date(),
          createdAt: new Date('2024-01-15'),
          department: 'Développement',
          position: 'Lead Developer'
        },
        {
          id: '2',
          displayName: 'Bob Expert',
          email: 'bob@synergia.com',
          role: 'manager',
          status: 'active',
          totalXp: 2100,
          level: 7,
          tasksCompleted: 38,
          badgesCount: 10,
          lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          createdAt: new Date('2024-02-01'),
          department: 'Marketing',
          position: 'Marketing Manager'
        },
        {
          id: '3',
          displayName: 'Charlie Pro',
          email: 'charlie@synergia.com',
          role: 'user',
          status: 'inactive',
          totalXp: 1950,
          level: 6,
          tasksCompleted: 32,
          badgesCount: 8,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          createdAt: new Date('2024-01-20'),
          department: 'Design',
          position: 'UI Designer'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistiques pour le header
  const headerStats = [
    { 
      label: "Total utilisateurs", 
      value: users.length, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Actifs", 
      value: users.filter(u => u.status === 'active').length, 
      icon: CheckCircle, 
      color: "text-green-400" 
    },
    { 
      label: "Administrateurs", 
      value: users.filter(u => u.role === 'admin').length, 
      icon: Crown, 
      color: "text-yellow-400" 
    },
    { 
      label: "Nouveaux (30j)", 
      value: users.filter(u => u.createdAt && (Date.now() - u.createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000).length, 
      icon: UserPlus, 
      color: "text-purple-400" 
    }
  ];

  // Actions du header
  const headerActions = userIsAdmin ? (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={Filter}>
        Exporter
      </PremiumButton>
      <PremiumButton variant="primary" icon={UserPlus}>
        Inviter utilisateur
      </PremiumButton>
    </div>
  ) : null;

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour obtenir le statut coloré
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  // Fonction pour formater la dernière connexion
  const formatLastSeen = (date) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'En ligne';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Utilisateurs"
        subtitle="Chargement des membres de l'équipe..."
        icon={Users}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Utilisateurs"
      subtitle="Gestion des membres de l'équipe et collaboration"
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres et recherche */}
      <div className="mb-8 space-y-4">
        {/* Barre de recherche */}
        <PremiumSearchBar
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filtres */}
        <div className="flex flex-wrap gap-4">
          {/* Filtre par rôle */}
          <div className="flex gap-2">
            <span className="text-gray-400 text-sm font-medium self-center">Rôle:</span>
            {['all', 'admin', 'manager', 'user'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  filterRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {role === 'all' && 'Tous'}
                {role === 'admin' && 'Admin'}
                {role === 'manager' && 'Manager'}
                {role === 'user' && 'Utilisateur'}
              </button>
            ))}
          </div>

          {/* Filtre par statut */}
          <div className="flex gap-2">
            <span className="text-gray-400 text-sm font-medium self-center">Statut:</span>
            {['all', 'active', 'inactive', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {status === 'all' && 'Tous'}
                {status === 'active' && 'Actif'}
                {status === 'inactive' && 'Inactif'}
                {status === 'pending' && 'En attente'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <PremiumCard>
        <div className="space-y-4">
          {filteredUsers.map((userData, index) => (
            <motion.div
              key={userData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-700/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                {/* Informations utilisateur */}
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {userData.displayName?.charAt(0) || userData.email?.charAt(0) || '?'}
                    </span>
                  </div>

                  {/* Détails */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">
                        {userData.displayName || 'Utilisateur'}
                      </h3>
                      {getRoleIcon(userData.role)}
                      <span className={`text-sm ${getStatusColor(userData.status)}`}>
                        ●
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{userData.email}</p>
                    {userData.position && userData.department && (
                      <p className="text-gray-500 text-xs">
                        {userData.position} • {userData.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistiques et actions */}
                <div className="flex items-center space-x-6">
                  {/* Stats */}
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>Niv. {userData.level || 1}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{userData.tasksCompleted || 0}</span>
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatLastSeen(userData.lastSeen)}
                    </p>
                  </div>

                  {/* Actions */}
                  {userIsAdmin && (
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all duration-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-all duration-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Message si aucun utilisateur */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Aucun utilisateur trouvé'
                  : 'Aucun utilisateur'
                }
              </h3>
              <p className="text-gray-400">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les utilisateurs seront affichés ici une fois ajoutés'
                }
              </p>
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Résumé des permissions (pour les admins) */}
      {userIsAdmin && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-4">Résumé des permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-400 font-semibold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-gray-400 text-sm">Administrateurs</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-400 font-semibold">{users.filter(u => u.role === 'manager').length}</p>
                <p className="text-gray-400 text-sm">Managers</p>
              </div>
              <div className="text-center p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
                <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 font-semibold">{users.filter(u => u.role === 'user').length}</p>
                <p className="text-gray-400 text-sm">Utilisateurs</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default UsersPage;
