// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// REMPLACER ENTIÈREMENT LE FICHIER EXISTANT
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';
import { synergiaRolesService, SYNERGIA_ROLES } from '../core/services/synergiaRolesService.js';
import RoleAssignmentModal from '../components/team/RoleAssignmentModal.jsx';
import TeamRoleDashboard from '../components/team/TeamRoleDashboard.jsx';
import { 
  Users, 
  Award, 
  Target, 
  TrendingUp, 
  UserPlus, 
  Settings, 
  Search,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Star,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const TeamPage = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('members');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [globalRoleStats, setGlobalRoleStats] = useState([]);
  
  // États des filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Charger les données de l'équipe
  useEffect(() => {
    loadTeamData();
    loadGlobalRoleStats();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement des membres de l'équipe
      const mockTeamMembers = [
        {
          id: '1',
          name: 'Alice Martin',
          email: 'alice.martin@synergia.com',
          photoURL: null,
          level: 8,
          totalXp: 2850,
          tasksCompleted: 45,
          badges: ['🎯', '🏆', '⭐'],
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'online',
          synergiaRoles: [
            { roleId: 'organization', xpInRole: 1500, level: 'competent', tasksCompleted: 25 },
            { roleId: 'mentoring', xpInRole: 800, level: 'apprenti', tasksCompleted: 12 }
          ]
        },
        {
          id: '2',
          name: 'Bob Durant',
          email: 'bob.durant@synergia.com',
          photoURL: null,
          level: 6,
          totalXp: 1920,
          tasksCompleted: 38,
          badges: ['💻', '🔧', '🎯'],
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          status: 'online',
          synergiaRoles: [
            { roleId: 'maintenance', xpInRole: 1200, level: 'apprenti', tasksCompleted: 20 },
            { roleId: 'stock', xpInRole: 600, level: 'novice', tasksCompleted: 8 }
          ]
        },
        {
          id: '3',
          name: 'Claire Dubois',
          email: 'claire.dubois@synergia.com',
          photoURL: null,
          level: 5,
          totalXp: 1450,
          tasksCompleted: 32,
          badges: ['🎨', '✨', '👥'],
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'away',
          synergiaRoles: [
            { roleId: 'content', xpInRole: 900, level: 'apprenti', tasksCompleted: 18 },
            { roleId: 'communication', xpInRole: 400, level: 'novice', tasksCompleted: 7 }
          ]
        },
        {
          id: user?.uid,
          name: user?.displayName || 'Vous',
          email: user?.email,
          photoURL: user?.photoURL,
          level: userStats?.level || 1,
          totalXp: userStats?.totalXp || 0,
          tasksCompleted: userStats?.tasksCompleted || 0,
          badges: ['🚀', '⚡'],
          lastActive: new Date(),
          status: 'online',
          synergiaRoles: [
            { roleId: 'gamification', xpInRole: 200, level: 'novice', tasksCompleted: 3 }
          ]
        }
      ];
      
      setTeamMembers(mockTeamMembers);
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalRoleStats = async () => {
    try {
      const stats = await synergiaRolesService.getGlobalRoleStats();
      setGlobalRoleStats(stats);
    } catch (error) {
      console.error('❌ Erreur stats globales:', error);
    }
  };

  // Fonctions utilitaires
  const getStatusText = (status) => {
    const statusMap = {
      online: 'En ligne',
      away: 'Absent',
      offline: 'Hors ligne'
    };
    return statusMap[status] || 'Inconnu';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const formatLastActive = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  // Gestion de l'assignation de rôles
  const handleAssignRole = async (memberId, roleId) => {
    try {
      const result = await synergiaRolesService.assignRole(memberId, roleId, user.uid);
      
      if (result.success) {
        await loadTeamData();
        alert('Rôle assigné avec succès !');
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      alert('Erreur lors de l\'assignation du rôle');
    }
  };

  const handleRemoveRole = async (memberId, roleId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce rôle ?')) return;
    
    try {
      const result = await synergiaRolesService.removeRole(memberId, roleId, user.uid);
      
      if (result.success) {
        await loadTeamData();
        alert('Rôle retiré avec succès !');
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      alert('Erreur lors de la suppression du rôle');
    }
  };

  // Filtrage et tri des membres
  const getFilteredAndSortedMembers = () => {
    let filtered = teamMembers.filter(member => {
      // Filtre de recherche
      const matchesSearch = (member.name || member.email || '')
        .toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre de rôle
      const matchesRole = roleFilter === 'all' || 
        member.synergiaRoles?.some(role => role.roleId === roleFilter);
      
      // Filtre de niveau
      const matchesLevel = levelFilter === 'all' || member.level >= parseInt(levelFilter);
      
      // Filtre de statut
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesLevel && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'level':
          valueA = a.level;
          valueB = b.level;
          break;
        case 'xp':
          valueA = a.totalXp;
          valueB = b.totalXp;
          break;
        case 'tasks':
          valueA = a.tasksCompleted;
          valueB = b.tasksCompleted;
          break;
        case 'lastActive':
          valueA = a.lastActive;
          valueB = b.lastActive;
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredMembers = getFilteredAndSortedMembers();

  // Interface des onglets
  const tabs = [
    { id: 'members', label: 'Membres', icon: Users, count: teamMembers.length },
    { id: 'roles', label: 'Rôles Synergia', icon: Award, count: Object.keys(SYNERGIA_ROLES).length },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'management', label: 'Gestion', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'équipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestion d'Équipe
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Gérez votre équipe, assignez des rôles et collaborez efficacement
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Barre de recherche et filtres */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex flex-wrap gap-4 items-center">
                
                {/* Recherche */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher un membre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Filtre par rôle */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white"
                >
                  <option value="all">Tous les rôles</option>
                  {Object.values(SYNERGIA_ROLES).map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                {/* Bouton filtres avancés */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all"
                >
                  <Filter className="w-5 h-5" />
                  Filtres
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Filtres avancés */}
              {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                    >
                      <option value="all">Tous niveaux</option>
                      <option value="1">Niveau 1+</option>
                      <option value="5">Niveau 5+</option>
                      <option value="10">Niveau 10+</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="online">En ligne</option>
                      <option value="away">Absent</option>
                      <option value="offline">Hors ligne</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                    >
                      <option value="name">Trier par nom</option>
                      <option value="level">Trier par niveau</option>
                      <option value="xp">Trier par XP</option>
                      <option value="tasks">Trier par tâches</option>
                      <option value="lastActive">Trier par activité</option>
                    </select>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                    >
                      <option value="asc">Croissant</option>
                      <option value="desc">Décroissant</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Liste des membres */}
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Infos du membre */}
                    <div className="flex items-center gap-4">
                      
                      {/* Avatar */}
                      <div className="relative">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                            {member.name?.charAt(0) || '?'}
                          </div>
                        )}
                        
                        {/* Indicateur de statut */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(member.status)}`}>
                        </div>
                      </div>

                      {/* Détails */}
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {member.name}
                          {member.id === user?.uid && (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          )}
                        </h3>
                        <p className="text-gray-400">{member.email}</p>
                        <p className="text-sm text-gray-500">{getStatusText(member.status)} • {formatLastActive(member.lastActive)}</p>
                      </div>
                    </div>

                    {/* Stats et actions */}
                    <div className="text-right">
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">Niveau {member.level}</p>
                          <p className="text-sm text-gray-400">{member.totalXp} XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.tasksCompleted}</p>
                          <p className="text-sm text-gray-400">Tâches</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.synergiaRoles?.length || 0}</p>
                          <p className="text-sm text-gray-400">Rôles</p>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex gap-2 justify-end mb-3">
                        {member.badges?.map((badge, index) => (
                          <span key={index} className="text-2xl" title={`Badge ${badge}`}>
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRoleAssignment(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Award className="w-4 h-4" />
                          Rôles
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          <Settings className="w-4 h-4" />
                          Options
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rôles actuels */}
                  {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <h4 className="text-white font-medium mb-2">Rôles Synergia :</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.synergiaRoles.map((userRole) => {
                          const roleInfo = synergiaRolesService.getRoleById(userRole.roleId);
                          if (!roleInfo) return null;
                          
                          return (
                            <div
                              key={userRole.roleId}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${roleInfo.color}`}
                            >
                              <span>{roleInfo.icon}</span>
                              <span>{roleInfo.name}</span>
                              <span className="text-xs">({userRole.level})</span>
                              <button
                                onClick={() => handleRemoveRole(member.id, userRole.roleId)}
                                className="ml-1 hover:bg-red-500 rounded-full p-1 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message si aucun membre trouvé */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun membre trouvé</h3>
                <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            
            {/* Grille des rôles Synergia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(SYNERGIA_ROLES).map((role) => {
                const roleStats = globalRoleStats.find(stat => stat.id === role.id);
                
                return (
                  <div
                    key={role.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-2xl`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{role.name}</h3>
                        <p className="text-sm text-gray-400">{role.taskCount} tâches disponibles</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{role.description}</p>
                    
                    {roleStats && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{roleStats.activeUsers}</p>
                          <p className="text-xs text-gray-400">Utilisateurs actifs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{roleStats.averageXp}</p>
                          <p className="text-xs text-gray-400">XP moyenne</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {role.permissions?.map((permission) => (
                        <span
                          key={permission}
                          className="text-xs bg-white/20 text-gray-300 px-2 py-1 rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Voir les détails
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <TeamRoleDashboard teamMembers={teamMembers} />
        )}

        {activeTab === 'management' && (
          <div className="space-y-6">
            
            {/* Actions de gestion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  Inviter des membres
                </h3>
                <p className="text-gray-300 mb-4">
                  Invitez de nouveaux collaborateurs à rejoindre votre équipe Synergia.
                </p>
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Inviter un membre
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Paramètres équipe
                </h3>
                <p className="text-gray-300 mb-4">
                  Configurez les paramètres généraux de votre équipe.
                </p>
                <button className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Configurer
                </button>
              </div>
            </div>

            {/* Permissions et rôles */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Gestion des permissions
              </h3>
              <div className="text-center py-8 text-gray-400">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p>Interface de gestion des permissions à venir</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'assignation de rôles */}
      <RoleAssignmentModal
        isOpen={showRoleAssignment}
        onClose={() => {
          setShowRoleAssignment(false);
          setSelectedMember(null);
        }}
        selectedMember={selectedMember}
        onRoleUpdated={loadTeamData}
      />
    </div>
  );
};

export default TeamPage;
