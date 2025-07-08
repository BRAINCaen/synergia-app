// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// VERSION AVEC INTÉGRATION FIREBASE COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  useTeam, 
  useTeamStats, 
  useRoles,
  useTeamCleanup 
} from '../hooks/useTeam.js';
import { 
  Users, 
  Award, 
  Target, 
  Search,
  Crown,
  Star,
  BarChart3,
  Plus,
  Settings,
  UserPlus,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';

// Import du modal d'assignation
import RoleAssignmentModal from '../components/team/RoleAssignmentModal.jsx';

// 🎭 RÔLES SYNERGIA DÉFINIS LOCALEMENT (pour l'affichage)
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations',
    difficulty: 'Facile',
    taskCount: 100,
    permissions: ['maintenance_access', 'repair_management']
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['reputation_management', 'review_access']
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    difficulty: 'Facile',
    taskCount: 100,
    permissions: ['inventory_management', 'stock_access']
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    difficulty: 'Avancé',
    taskCount: 100,
    permissions: ['organization_access', 'workflow_management']
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['content_creation', 'design_access']
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    difficulty: 'Avancé',
    taskCount: 100,
    permissions: ['training_access', 'mentoring_rights']
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['partnership_management', 'networking_access']
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    difficulty: 'Moyen',
    taskCount: 100,
    permissions: ['social_media_access', 'communication_rights']
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['b2b_access', 'quote_management']
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification',
    difficulty: 'Expert',
    taskCount: 100,
    permissions: ['gamification_admin', 'xp_management']
  }
};

const TeamPage = () => {
  const { user } = useAuthStore();
  
  // 🔥 Hooks Firebase pour la gestion d'équipe
  const { teamMembers, loading: teamLoading, error: teamError, refreshTeam } = useTeam();
  const { stats, loading: statsLoading, refreshStats } = useTeamStats();
  const { assignRole, removeRole, loading: roleLoading, error: roleError } = useRoles();
  
  // Nettoyer les listeners au démontage
  useTeamCleanup();
  
  // États locaux
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  // Détecter la connectivité
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Afficher les messages de succès
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Fonctions utilitaires
  const getStatusColor = (status) => {
    const colorMap = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500',
      active: 'bg-green-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const statusMap = {
      online: 'En ligne',
      away: 'Absent',
      offline: 'Hors ligne',
      active: 'Actif'
    };
    return statusMap[status] || 'Inconnu';
  };

  // Ouvrir le modal d'assignation
  const handleOpenRoleAssignment = (member) => {
    setSelectedMember(member);
    setShowRoleAssignment(true);
  };

  // Fermer le modal d'assignation
  const handleCloseRoleAssignment = () => {
    setShowRoleAssignment(false);
    setSelectedMember(null);
  };

  // Callback quand les rôles sont mis à jour
  const handleRoleUpdated = async (action, roleName) => {
    console.log('🔄 Rôle mis à jour:', action, roleName);
    
    // Rafraîchir les données
    await Promise.all([
      refreshTeam(),
      refreshStats()
    ]);
    
    // Afficher un message de succès
    const message = action === 'assign' 
      ? `Rôle "${roleName}" assigné avec succès !`
      : `Rôle "${roleName}" retiré avec succès !`;
    setShowSuccessMessage(message);
  };

  // Gestion de l'assignation de rôle depuis le modal
  const handleAssignRole = async (userId, roleData) => {
    try {
      const success = await assignRole(userId, {
        roleId: roleData.roleId,
        permissions: roleData.permissions || []
      });
      
      if (success) {
        await handleRoleUpdated('assign', roleData.name);
        return { success: true };
      } else {
        return { success: false, error: roleError };
      }
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      return { success: false, error: error.message };
    }
  };

  // Gestion de la suppression de rôle depuis le modal
  const handleRemoveRole = async (userId, roleId) => {
    try {
      const success = await removeRole(userId, roleId);
      
      if (success) {
        const roleInfo = SYNERGIA_ROLES[roleId];
        await handleRoleUpdated('remove', roleInfo?.name || roleId);
        return { success: true };
      } else {
        return { success: false, error: roleError };
      }
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualiser toutes les données
  const handleRefreshAll = async () => {
    await Promise.all([
      refreshTeam(),
      refreshStats()
    ]);
    setShowSuccessMessage('Données actualisées !');
  };

  // Filtrage des membres
  const filteredMembers = teamMembers.filter(member =>
    (member.displayName || member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Interface des onglets
  const tabs = [
    { id: 'members', label: 'Membres', icon: Users, count: teamMembers.length },
    { id: 'roles', label: 'Rôles Synergia', icon: Award, count: Object.keys(SYNERGIA_ROLES).length },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 }
  ];

  // Affichage de l'état de chargement initial
  if (teamLoading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des données Firebase...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec statut Firebase */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestion d'Équipe
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            
            {/* Indicateur de connectivité */}
            <div className="flex items-center gap-2 ml-4">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Wifi className="w-5 h-5" />
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm">Hors ligne</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xl text-gray-300 mb-4">
            Gérez votre équipe avec Firebase en temps réel
          </p>

          {/* Message de succès */}
          {showSuccessMessage && (
            <div className="mb-4 mx-auto max-w-md">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-300">
                {showSuccessMessage}
              </div>
            </div>
          )}

          {/* Messages d'erreur */}
          {(teamError || roleError) && (
            <div className="mb-4 mx-auto max-w-md">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {teamError || roleError}
              </div>
            </div>
          )}
          
          {/* Actions rapides */}
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
              <UserPlus className="w-5 h-5" />
              Inviter un membre
            </button>
            <button 
              onClick={handleRefreshAll}
              disabled={teamLoading || statsLoading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${(teamLoading || statsLoading) ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl">
              <Settings className="w-5 h-5" />
              Paramètres
            </button>
          </div>
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
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
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
            
            {/* Barre de recherche */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des membres */}
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 group"
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Infos du membre */}
                    <div className="flex items-center gap-4">
                      
                      {/* Avatar */}
                      <div className="relative">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.displayName || member.email}
                            className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold group-hover:scale-105 transition-transform">
                            {(member.displayName || member.email)?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        
                        {/* Indicateur de statut */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(member.status || 'active')} animate-pulse`}>
                        </div>
                      </div>

                      {/* Détails */}
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {member.displayName || member.email}
                          {member.id === user?.uid && (
                            <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />
                          )}
                        </h3>
                        <p className="text-gray-400">{member.email}</p>
                        <p className="text-sm text-gray-500">
                          {getStatusText(member.status || 'active')}
                          {member.lastLogin && (
                            <span> • Dernière connexion: {new Date(member.lastLogin.toDate()).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Stats et actions */}
                    <div className="text-right">
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">Niveau {member.teamStats?.level || 1}</p>
                          <p className="text-sm text-gray-400">{member.teamStats?.totalXp || 0} XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.teamStats?.tasksCompleted || 0}</p>
                          <p className="text-sm text-gray-400">Tâches</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.synergiaRoles?.length || 0}</p>
                          <p className="text-sm text-gray-400">Rôles</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenRoleAssignment(member)}
                          disabled={roleLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                        >
                          <Award className="w-4 h-4" />
                          {roleLoading ? 'Traitement...' : 'Gérer les rôles'}
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
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Rôles Synergia :
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {member.synergiaRoles.map((userRole) => {
                          const roleInfo = SYNERGIA_ROLES[userRole.roleId];
                          if (!roleInfo) return null;
                          
                          return (
                            <div
                              key={userRole.roleId}
                              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white ${roleInfo.color} hover:scale-105 transition-transform cursor-pointer shadow-lg`}
                              title={`${roleInfo.description} - Niveau ${userRole.level} - ${userRole.xpInRole} XP`}
                            >
                              <span>{roleInfo.icon}</span>
                              <span className="font-medium">{roleInfo.name}</span>
                              <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                                {userRole.level} • {userRole.xpInRole} XP
                              </div>
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
            {filteredMembers.length === 0 && !teamLoading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun membre trouvé</h3>
                <p className="text-gray-400">
                  {searchTerm ? 'Essayez de modifier votre recherche' : 'Aucun membre dans l\'équipe'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            
            {/* Grille des rôles Synergia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(SYNERGIA_ROLES).map((role) => {
                // Calculer les stats du rôle depuis les données Firebase
                const roleUsers = teamMembers.filter(member =>
                  member.synergiaRoles?.some(r => r.roleId === role.id)
                );
                
                return (
                  <div
                    key={role.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{role.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{role.taskCount} tâches</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            role.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300' :
                            role.difficulty === 'Moyen' ? 'bg-yellow-500/20 text-yellow-300' :
                            role.difficulty === 'Avancé' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {role.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{role.description}</p>
                    
                    {/* Stats en temps réel du rôle */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-white">{roleUsers.length}</p>
                        <p className="text-xs text-gray-400">Utilisateurs</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-white">
                          {roleUsers.reduce((sum, user) => {
                            const userRole = user.synergiaRoles?.find(r => r.roleId === role.id);
                            return sum + (userRole?.xpInRole || 0);
                          }, 0)}
                        </p>
                        <p className="text-xs text-gray-400">XP Total</p>
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                      Voir les détails
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Stats globales avec données Firebase */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:border-white/40 transition-all group">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-white">{stats?.totalMembers || teamMembers.length}</p>
                <p className="text-gray-400">Membres</p>
                {statsLoading && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:border-white/40 transition-all group">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-white">
                  {stats?.totalRoles || teamMembers.reduce((sum, member) => sum + (member.synergiaRoles?.length || 0), 0)}
                </p>
                <p className="text-gray-400">Rôles assignés</p>
                {statsLoading && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:border-white/40 transition-all group">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-white">
                  {stats?.totalTasks || teamMembers.reduce((sum, member) => sum + (member.teamStats?.tasksCompleted || 0), 0)}
                </p>
                <p className="text-gray-400">Tâches complétées</p>
                {statsLoading && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:border-white/40 transition-all group">
                <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-white">
                  {stats?.averageLevel || (teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, member) => sum + (member.teamStats?.level || 1), 0) / teamMembers.length) : 0)}
                </p>
                <p className="text-gray-400">Niveau moyen</p>
                {statsLoading && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>}
              </div>
            </div>

            {/* Top Performers avec données Firebase */}
            {stats?.topPerformers && stats.topPerformers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Top Performers
                </h3>
                <div className="grid gap-3">
                  {stats.topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{performer.name}</p>
                          <p className="text-gray-400 text-sm">{performer.rolesCount} rôle{performer.rolesCount > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{performer.totalXp} XP</p>
                        <p className="text-gray-400 text-sm">Niveau {performer.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Répartition des rôles avec données Firebase */}
            {stats?.roleDistribution && Object.keys(stats.roleDistribution).length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Répartition des Rôles
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.roleDistribution)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .map(([roleId, roleData]) => {
                      const roleInfo = SYNERGIA_ROLES[roleId];
                      if (!roleInfo) return null;
                      
                      const maxCount = Math.max(...Object.values(stats.roleDistribution).map(r => r.count));
                      const percentage = (roleData.count / maxCount) * 100;
                      
                      return (
                        <div key={roleId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${roleInfo.color}`}></div>
                            <span className="text-white">{roleInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-white/20 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${roleInfo.color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-medium w-8 text-right">{roleData.count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Placeholder si pas de stats */}
            {(!stats || statsLoading) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Analytics Firebase
                </h3>
                <div className="text-center py-12 text-gray-400">
                  {statsLoading ? (
                    <>
                      <Database className="w-20 h-20 text-gray-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-lg font-medium">Chargement des statistiques...</p>
                      <p>Calcul des métriques depuis Firebase</p>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">Statistiques en temps réel</p>
                      <p>Données synchronisées avec Firebase</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'assignation de rôles avec intégration Firebase */}
      {showRoleAssignment && (
        <RoleAssignmentModal
          isOpen={showRoleAssignment}
          onClose={handleCloseRoleAssignment}
          selectedMember={selectedMember}
          onRoleUpdated={handleRoleUpdated}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          loading={roleLoading}
        />
      )}
    </div>
  );
};

export default TeamPage;
