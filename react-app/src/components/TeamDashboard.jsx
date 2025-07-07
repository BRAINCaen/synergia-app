// ==========================================
// 📁 react-app/src/components/team/TeamDashboard.jsx
// DASHBOARD DE GESTION D'ÉQUIPE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Crown, 
  Shield,
  Award,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Mail,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Filter,
  UserCheck,
  Star,
  Calendar
} from 'lucide-react';
import { teamManagementService, TEAM_ROLES, PERMISSION_LEVELS } from '../../core/services/teamManagementService.js';
import { projectService } from '../../core/services/projectService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { Toast } from '../../shared/components/ui/Toast.jsx';

/**
 * 👥 DASHBOARD DE GESTION D'ÉQUIPE
 */
const TeamDashboard = ({ projectId, onClose }) => {
  const { user } = useAuthStore();
  
  // États principaux
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // États modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // États formulaires
  const [inviteForm, setInviteForm] = useState({
    emails: [''],
    role: TEAM_ROLES.CONTRIBUTOR,
    message: ''
  });

  useEffect(() => {
    if (projectId) {
      loadTeamData();
    }
  }, [projectId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [projectData, teamData, statsData, usersData] = await Promise.all([
        projectService.getProject(projectId),
        teamManagementService.getProjectTeam(projectId),
        teamManagementService.getTeamStatistics(projectId),
        projectService.getAvailableUsers()
      ]);
      
      setProject(projectData);
      setTeamMembers(teamData || []);
      setTeamStats(statsData);
      setAvailableUsers(usersData || []);
      
      console.log('👥 Données équipe chargées:', {
        project: projectData?.title,
        members: teamData?.length || 0,
        stats: statsData
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      Toast.show('Erreur lors du chargement de l\'équipe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMembers = async (e) => {
    e.preventDefault();
    
    const validEmails = inviteForm.emails.filter(email => 
      email.trim() && email.includes('@')
    );
    
    if (validEmails.length === 0) {
      Toast.show('Veuillez saisir au moins un email valide', 'error');
      return;
    }

    try {
      const result = await teamManagementService.inviteTeamMembers(
        projectId,
        user.uid,
        validEmails,
        inviteForm.role
      );
      
      if (result.success) {
        const successCount = result.results.filter(r => r.success).length;
        Toast.show(`${successCount} invitation(s) envoyée(s) avec succès`, 'success');
        
        setShowInviteModal(false);
        setInviteForm({
          emails: [''],
          role: TEAM_ROLES.CONTRIBUTOR,
          message: ''
        });
        
        await loadTeamData();
      }
      
    } catch (error) {
      console.error('❌ Erreur invitation membres:', error);
      Toast.show('Erreur lors de l\'invitation', 'error');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await teamManagementService.updateTeamRole(projectId, user.uid, memberId, newRole);
      Toast.show('Rôle mis à jour avec succès', 'success');
      setShowRoleEditor(false);
      setSelectedMember(null);
      await loadTeamData();
    } catch (error) {
      console.error('❌ Erreur mise à jour rôle:', error);
      Toast.show('Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) {
      return;
    }
    
    try {
      await teamManagementService.removeTeamMember(projectId, user.uid, memberId);
      Toast.show('Membre retiré de l\'équipe', 'success');
      await loadTeamData();
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      Toast.show('Erreur lors de la suppression', 'error');
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    if (!confirm('Êtes-vous sûr de vouloir transférer la propriété de ce projet ?')) {
      return;
    }
    
    try {
      await teamManagementService.transferProjectOwnership(projectId, user.uid, newOwnerId);
      Toast.show('Propriété transférée avec succès', 'success');
      setShowTransferOwnership(false);
      await loadTeamData();
    } catch (error) {
      console.error('❌ Erreur transfert propriété:', error);
      Toast.show('Erreur lors du transfert', 'error');
    }
  };

  // Filtrage des membres
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = (member.displayName || member.email || '')
      .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.teamRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Vérification des permissions
  const canManageTeam = teamManagementService.checkActionPermission(
    teamMembers.find(m => m.id === user.uid)?.teamRole || TEAM_ROLES.CONTRIBUTOR,
    'manage_team'
  );

  const isProjectOwner = project?.ownerId === user.uid;

  const tabs = [
    { id: 'members', label: 'Membres', icon: Users, count: teamMembers.length },
    { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement de l'équipe...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            Gestion d'Équipe
          </h2>
          <p className="text-gray-600 mt-1">
            {project?.title} • {teamMembers.length} membre(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {canManageTeam && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Inviter
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Membres</p>
                <p className="text-xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">XP Équipe</p>
                <p className="text-xl font-bold text-gray-900">{teamStats.teamXP}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveau Moyen</p>
                <p className="text-xl font-bold text-gray-900">{teamStats.averageLevel}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rôles Actifs</p>
                <p className="text-xl font-bold text-gray-900">
                  {Object.values(teamStats.roleDistribution).filter(count => count > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        
        {/* Onglet Membres */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Contrôles de filtrage */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {teamManagementService.getAvailableRoles().map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Liste des membres */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
                          {(member.displayName || member.email).charAt(0).toUpperCase()}
                        </div>
                        {member.isOwner && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Informations */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {member.displayName || member.email}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            teamManagementService.getRoleColor(member.teamRole)
                          }`}>
                            {teamManagementService.getRoleIcon(member.teamRole)}
                            {member.teamRole}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Niveau {member.level || 1}</span>
                          <span>•</span>
                          <span>{member.totalXp || 0} XP</span>
                          {member.joinedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Rejoint le {new Date(member.joinedAt.toDate()).toLocaleDateString('fr-FR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Voir profil */}
                      <button
                        onClick={() => {
                          // Fonction pour voir le profil détaillé
                          console.log('Voir profil:', member);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Voir le profil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Modifier rôle */}
                      {canManageTeam && !member.isOwner && (
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRoleEditor(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Modifier le rôle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Supprimer */}
                      {canManageTeam && !member.isOwner && member.id !== user.uid && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Retirer de l'équipe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredMembers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre trouvé</h3>
                  <p className="text-gray-500">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Invitez des membres pour commencer à collaborer'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Rôles & Permissions */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rôles et Permissions</h3>
              
              <div className="space-y-4">
                {teamManagementService.getAvailableRoles().map(role => (
                  <div key={role.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          teamManagementService.getRoleColor(role.value)
                        }`}>
                          {teamManagementService.getRoleIcon(role.value)}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{role.label}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {teamStats?.roleDistribution[role.value] || 0} membre(s)
                      </span>
                    </div>
                    
                    {/* Permissions */}
                    <div className="mt-3 pl-11">
                      <div className="flex flex-wrap gap-2">
                        {teamManagementService.getDefaultPermissions(role.value).actions.map(action => (
                          <span
                            key={action}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {action.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Statistiques */}
        {activeTab === 'stats' && teamStats && (
          <div className="space-y-6">
            
            {/* Répartition des rôles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des rôles</h3>
              
              <div className="space-y-3">
                {Object.entries(teamStats.roleDistribution)
                  .filter(([role, count]) => count > 0)
                  .map(([role, count]) => {
                    const percentage = teamStats.totalMembers > 0 ? 
                      Math.round((count / teamStats.totalMembers) * 100) : 0;
                    
                    return (
                      <div key={role} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          teamManagementService.getRoleColor(role)
                        }`}>
                          {teamManagementService.getRoleIcon(role)}
                        </span>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900 capitalize">{role}</span>
                            <span className="text-gray-600">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top contributeurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Contributeurs</h3>
              
              <div className="space-y-3">
                {teamStats.topContributors.map((contributor, index) => (
                  <div key={contributor.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                      {(contributor.displayName || contributor.email).charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {contributor.displayName || contributor.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {contributor.totalXp || 0} XP • Niveau {contributor.level || 1}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {contributor.totalXp || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {teamStats.topContributors.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucune activité d'équipe pour le moment
                </p>
              )}
            </div>
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres d'équipe</h3>
              
              <div className="space-y-6">
                
                {/* Transfert de propriété */}
                {isProjectOwner && (
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800">Transfert de propriété</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Vous pouvez transférer la propriété de ce projet à un autre membre de l'équipe.
                        </p>
                        <button
                          onClick={() => setShowTransferOwnership(true)}
                          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Transférer la propriété
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paramètres généraux */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Notifications d'équipe</p>
                      <p className="text-sm text-gray-600">Recevoir des notifications pour les changements d'équipe</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Invitations automatiques</p>
                      <p className="text-sm text-gray-600">Permettre aux managers d'inviter de nouveaux membres</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Affichage public</p>
                      <p className="text-sm text-gray-600">Rendre l'équipe visible dans l'annuaire</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INVITATION MEMBRES */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Inviter des membres</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInviteMembers} className="p-6">
                
                {/* Adresses email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresses email
                  </label>
                  <div className="space-y-2">
                    {inviteForm.emails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...inviteForm.emails];
                            newEmails[index] = e.target.value;
                            setInviteForm(prev => ({ ...prev, emails: newEmails }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="email@exemple.com"
                        />
                        {inviteForm.emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newEmails = inviteForm.emails.filter((_, i) => i !== index);
                              setInviteForm(prev => ({ ...prev, emails: newEmails }));
                            }}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setInviteForm(prev => ({ ...prev, emails: [...prev.emails, ''] }));
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Ajouter une adresse
                    </button>
                  </div>
                </div>

                {/* Rôle par défaut */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle par défaut
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {teamManagementService.getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message personnalisé */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message personnalisé (optionnel)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ajoutez un message pour expliquer le projet..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Envoyer les invitations
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ÉDITEUR DE RÔLE */}
      <AnimatePresence>
        {showRoleEditor && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Modifier le rôle</h3>
                <button
                  onClick={() => setShowRoleEditor(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                    {(selectedMember.displayName || selectedMember.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedMember.displayName || selectedMember.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rôle actuel: {selectedMember.teamRole}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {teamManagementService.getAvailableRoles().map(role => (
                    <button
                      key={role.value}
                      onClick={() => handleUpdateRole(selectedMember.id, role.value)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedMember.teamRole === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          teamManagementService.getRoleColor(role.value)
                        }`}>
                          {teamManagementService.getRoleIcon(role.value)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{role.label}</p>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL TRANSFERT DE PROPRIÉTÉ */}
      <AnimatePresence>
        {showTransferOwnership && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTransferOwnership(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transférer la propriété</h3>
                <button
                  onClick={() => setShowTransferOwnership(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Cette action est irréversible. Vous deviendrez manager du projet.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {teamMembers
                    .filter(member => !member.isOwner && member.id !== user.uid)
                    .map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleTransferOwnership(member.id)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                            {(member.displayName || member.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.displayName || member.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.teamRole} • Niveau {member.level || 1}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>

                {teamMembers.filter(member => !member.isOwner && member.id !== user.uid).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Aucun membre éligible pour le transfert
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDashboard;
