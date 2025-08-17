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
  Award,
  RefreshCw
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

const UsersPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const userIsAdmin = isAdmin(user);

  // Utilisateurs simulés
  const userData = [
    {
      id: 1,
      name: 'Alice Martin',
      email: 'alice.martin@brain.com',
      role: 'Admin',
      department: 'Management',
      status: 'active',
      lastLogin: new Date('2024-08-17'),
      joinDate: new Date('2024-01-15'),
      avatar: '👩‍💼',
      tasksCompleted: 89,
      xp: 3420,
      level: 12
    },
    {
      id: 2,
      name: 'Thomas Dubois',
      email: 'thomas.dubois@brain.com',
      role: 'Développeur',
      department: 'Tech',
      status: 'active',
      lastLogin: new Date('2024-08-16'),
      joinDate: new Date('2024-02-01'),
      avatar: '👨‍💻',
      tasksCompleted: 76,
      xp: 2850,
      level: 10
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      email: 'sophie.laurent@brain.com',
      role: 'Designer',
      department: 'Design',
      status: 'inactive',
      lastLogin: new Date('2024-08-10'),
      joinDate: new Date('2024-03-10'),
      avatar: '🎨',
      tasksCompleted: 54,
      xp: 2100,
      level: 8
    },
    {
      id: 4,
      name: 'Marc Rousseau',
      email: 'marc.rousseau@brain.com',
      role: 'Analyste',
      department: 'Data',
      status: 'pending',
      lastLogin: new Date('2024-08-15'),
      joinDate: new Date('2024-07-20'),
      avatar: '📊',
      tasksCompleted: 23,
      xp: 890,
      level: 3
    },
    {
      id: 5,
      name: 'Emma Lefebvre',
      email: 'emma.lefebvre@brain.com',
      role: 'QA',
      department: 'Quality',
      status: 'active',
      lastLogin: new Date('2024-08-17'),
      joinDate: new Date('2024-04-15'),
      avatar: '🔍',
      tasksCompleted: 45,
      xp: 1950,
      level: 7
    }
  ];

  useEffect(() => {
    setUsers(userData);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  const headerStats = [
    { label: "Total", value: userStats.total.toString(), icon: Users, color: "text-blue-400" },
    { label: "Actifs", value: userStats.active.toString(), icon: CheckCircle, color: "text-green-400" },
    { label: "En attente", value: userStats.pending.toString(), icon: Clock, color: "text-yellow-400" },
    { label: "Inactifs", value: userStats.inactive.toString(), icon: XCircle, color: "text-red-400" }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={RefreshCw}>
        Actualiser
      </PremiumButton>
      {userIsAdmin && (
        <PremiumButton variant="primary" icon={UserPlus}>
          Inviter utilisateur
        </PremiumButton>
      )}
    </div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'inactive': return 'Inactif';
      default: return 'Inconnu';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Développeur': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Designer': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Analyste': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'QA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <PremiumLayout
      title="Utilisateurs"
      subtitle="Gestion des membres de l'équipe"
      icon={Users}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres et recherche */}
      <div className="mb-6 space-y-4">
        <PremiumCard>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="Admin">Admin</option>
                <option value="Développeur">Développeur</option>
                <option value="Designer">Designer</option>
                <option value="Analyste">Analyste</option>
                <option value="QA">QA</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((userData) => (
          <motion.div
            key={userData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            {/* Header utilisateur */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{userData.avatar}</div>
                <div>
                  <h3 className="text-white font-semibold">{userData.name}</h3>
                  <p className="text-gray-400 text-sm">{userData.email}</p>
                </div>
              </div>
              {userIsAdmin && (
                <div className="relative">
                  <button className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Rôle et statut */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getRoleColor(userData.role)}`}>
                {userData.role}
              </span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(userData.status)}
                <span className="text-sm text-gray-300">{getStatusText(userData.status)}</span>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-blue-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{userData.level}</div>
                <div className="text-xs text-blue-300">Niveau</div>
              </div>
              <div className="text-center bg-yellow-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{userData.xp}</div>
                <div className="text-xs text-yellow-300">XP</div>
              </div>
              <div className="text-center bg-green-500/20 rounded-lg p-2">
                <div className="text-sm font-bold text-white">{userData.tasksCompleted}</div>
                <div className="text-xs text-green-300">Tâches</div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{userData.department}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Rejoint le {userData.joinDate.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Dernière connexion: {userData.lastLogin.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </button>
              {userIsAdmin && (
                <>
                  <button className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm py-2 px-3 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredUsers.length === 0 && (
        <PremiumCard>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-400">Essayez de modifier vos filtres de recherche</p>
          </div>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default UsersPage;
