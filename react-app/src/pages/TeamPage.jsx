// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE MISE À JOUR AVEC RÔLES SYNERGIA + BOUTONS FONCTIONNELS
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Settings, 
  Search, 
  Filter,
  Crown,
  Star,
  Award,
  RefreshCw,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Target,
  Clock,
  TrendingUp,
  X,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  UserCheck,
  AlertCircle
} from 'lucide-react';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTeamStore } from '../shared/stores/teamStore.js';

// Services
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Notifications simples remplaçant Toast
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

// ✅ RÔLES SYNERGIA OFFICIELS MIS À JOUR
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations du matériel',
    permissions: ['maintenance_access', 'repair_management', 'equipment_control'],
    difficulty: 'Facile',
    taskCount: 85,
    xpMultiplier: 1.2
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image de marque et des retours clients',
    permissions: ['reputation_management', 'review_access', 'customer_feedback'],
    difficulty: 'Moyen',
    taskCount: 92,
    xpMultiplier: 1.4
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    permissions: ['inventory_management', 'stock_access', 'supplier_relations'],
    difficulty: 'Facile',
    taskCount: 78,
    xpMultiplier: 1.1
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes et workflows',
    permissions: ['organization_access', 'workflow_management', 'team_coordination'],
    difficulty: 'Avancé',
    taskCount: 110,
    xpMultiplier: 1.8
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    permissions: ['content_creation', 'design_access', 'visual_management'],
    difficulty: 'Moyen',
    taskCount: 95,
    xpMultiplier: 1.4
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    permissions: ['training_access', 'mentoring_rights', 'skill_development'],
    difficulty: 'Avancé',
    taskCount: 88,
    xpMultiplier: 1.6
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats et visibilité',
    permissions: ['partnership_management', 'networking_access', 'external_relations'],
    difficulty: 'Expert',
    taskCount: 102,
    xpMultiplier: 1.9
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Gestion des réseaux sociaux et communication',
    permissions: ['social_media_access', 'communication_rights', 'brand_management'],
    difficulty: 'Moyen',
    taskCount: 89,
    xpMultiplier: 1.5
  },
  gamemaster: {
    id: 'gamemaster',
    name: 'Game Master',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Animation des sessions de jeu et accueil clients',
    permissions: ['gamemaster_access', 'session_management', 'customer_experience'],
    difficulty: 'Expert',
    taskCount: 120,
    xpMultiplier: 2.0
  }
};

// Permissions admin selon les rôles
const ADMIN_PERMISSIONS = {
  VIEW_ALL_MEMBERS: ['organization', 'mentoring', 'gamemaster'],
  EDIT_MEMBER_ROLES: ['organization', 'gamemaster'],
  MANAGE_PERMISSIONS: ['organization'],
  VIEW_ANALYTICS: ['organization', 'gamemaster', 'reputation'],
  MODERATE_CONTENT: ['content', 'communication', 'reputation']
};

/**
 * 🏢 COMPOSANT PRINCIPAL - PAGE ÉQUIPE SYNERGIA
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byRole: {},
    totalXP: 0,
    averageLevel: 0
  });

  /**
   * 📊 CHARGEMENT DES MEMBRES D'ÉQUIPE
   */
  const loadTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des membres d\'équipe...');
      
      // Récupérer tous les utilisateurs avec leurs rôles Synergia
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const teamMembers = [];
      let totalXP = 0;
      let totalLevels = 0;
      let roleStats = {};
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const member = {
          id: doc.id,
          ...userData,
          synergiaRoles: userData.synergiaRoles || [],
          totalXP: userData.totalXP || 0,
          level: userData.level || 1,
          lastActive: userData.lastActive || new Date(),
          status: userData.status || 'active'
        };
        
        teamMembers.push(member);
        totalXP += member.totalXP;
        totalLevels += member.level;
        
        // Compter les rôles
        member.synergiaRoles.forEach(role => {
          if (!roleStats[role.roleId]) {
            roleStats[role.roleId] = 0;
          }
          roleStats[role.roleId]++;
        });
      });
      
      setMembers(teamMembers);
      setStats({
        total: teamMembers.length,
        active: teamMembers.filter(m => m.status === 'active').length,
        byRole: roleStats,
        totalXP,
        averageLevel: teamMembers.length > 0 ? Math.round(totalLevels / teamMembers.length) : 0
      });
      
      console.log('✅ Membres chargés:', teamMembers.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError('Erreur lors du chargement de l\'équipe');
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🎭 ASSIGNER UN RÔLE À UN MEMBRE
   */
  const assignRole = async (memberId, roleId) => {
    try {
      console.log('🎯 Assignation rôle:', { memberId, roleId });
      
      if (!SYNERGIA_ROLES[roleId]) {
        throw new Error(`Rôle ${roleId} non reconnu`);
      }
      
      const role = SYNERGIA_ROLES[roleId];
      const memberRef = doc(db, 'users', memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      
      // Vérifier si le rôle n'est pas déjà assigné
      if (currentRoles.find(r => r.roleId === roleId)) {
        showNotification('Ce rôle est déjà assigné à ce membre', 'error');
        return;
      }
      
      // Créer le nouveau rôle
      const newRole = {
        roleId: roleId,
        roleName: role.name,
        assignedAt: new Date().toISOString(),
        assignedBy: user.uid,
        xpInRole: 0,
        tasksCompleted: 0,
        level: 'novice',
        permissions: role.permissions,
        lastActivity: new Date().toISOString()
      };
      
      // Mettre à jour l'utilisateur
      const updatedRoles = [...currentRoles, newRole];
      
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: user.uid
      });
      
      showNotification(`Rôle "${role.name}" assigné avec succès`, 'success');
      await loadTeamMembers();
      setShowRoleModal(false);
      
    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      showNotification('Erreur lors de l\'assignation du rôle', 'error');
    }
  };

  /**
   * 🗑️ RETIRER UN RÔLE D'UN MEMBRE
   */
  const removeRole = async (memberId, roleId) => {
    try {
      const memberRef = doc(db, 'users', memberId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Membre non trouvé');
      }
      
      const memberData = memberDoc.data();
      const currentRoles = memberData.synergiaRoles || [];
      const updatedRoles = currentRoles.filter(r => r.roleId !== roleId);
      
      await updateDoc(memberRef, {
        synergiaRoles: updatedRoles,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: user.uid
      });
      
      const roleName = SYNERGIA_ROLES[roleId]?.name || roleId;
      showNotification(`Rôle "${roleName}" retiré avec succès`, 'success');
      await loadTeamMembers();
      
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      showNotification('Erreur lors de la suppression du rôle', 'error');
    }
  };

  /**
   * ✅ VÉRIFIER LES PERMISSIONS ADMIN
   */
  const hasPermission = (permission) => {
    if (!user?.synergiaRoles) return false;
    
    const allowedRoles = ADMIN_PERMISSIONS[permission] || [];
    return user.synergiaRoles.some(role => 
      allowedRoles.includes(role.roleId)
    );
  };

  // Charger les données au montage
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.displayName || member.email || '')
      .toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || 
      (member.synergiaRoles && member.synergiaRoles.some(role => role.roleId === selectedRole));
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'équipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 📊 Header avec statistiques */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Users className="w-10 h-10 text-blue-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Équipe Synergia
                </h1>
                <p className="text-gray-400 mt-2">
                  Gestion des rôles et permissions de l'équipe
                </p>
              </div>
            </div>
            
            {/* Actions principales */}
            <div className="flex space-x-3">
              <button 
                onClick={loadTeamMembers}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Actualiser</span>
              </button>
              {hasPermission('EDIT_MEMBER_ROLES') && (
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Ajouter Membre</span>
                </button>
              )}
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total membres</div>
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
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.totalXP.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">XP Total</div>
                </div>
                <Star className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.averageLevel}</div>
                  <div className="text-sm text-gray-400">Niveau moyen</div>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Filtres et recherche */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Filtre par rôle */}
            <div className="md:w-64">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {Object.values(SYNERGIA_ROLES).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 👥 Liste des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              {/* Profil membre */}
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(member.displayName?.[0] || member.email?.[0] || '?').toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                    member.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-white font-semibold">
                    {member.displayName || member.email}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Niveau {member.level} • {member.totalXP} XP
                  </p>
                </div>
              </div>

              {/* Rôles assignés */}
              <div className="mb-4">
                <h4 className="text-gray-300 text-sm font-medium mb-2">Rôles assignés</h4>
                {member.synergiaRoles && member.synergiaRoles.length > 0 ? (
                  <div className="space-y-2">
                    {member.synergiaRoles.slice(0, 3).map(memberRole => {
                      const role = SYNERGIA_ROLES[memberRole.roleId];
                      if (!role) return null;
                      
                      return (
                        <div key={memberRole.roleId} className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{role.icon}</span>
                            <div>
                              <div className="text-white text-sm font-medium">{role.name}</div>
                              <div className="text-gray-400 text-xs">{memberRole.xpInRole || 0} XP</div>
                            </div>
                          </div>
                          {hasPermission('EDIT_MEMBER_ROLES') && (
                            <button
                              onClick={() => removeRole(member.id, memberRole.roleId)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {member.synergiaRoles.length > 3 && (
                      <div className="text-gray-400 text-xs text-center">
                        +{member.synergiaRoles.length - 3} autres rôles
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center py-2">
                    Aucun rôle assigné
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowRoleModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Assigner Rôle</span>
                </button>
                
                {hasPermission('VIEW_ALL_MEMBERS') && (
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowPermissionsModal(true);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucun membre */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedRole !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Aucun membre dans l\'équipe pour le moment'
              }
            </p>
          </div>
        )}
      </div>

      {/* 🎭 Modal d'assignation de rôle */}
      <AnimatePresence>
        {showRoleModal && selectedMember && (
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
                  Assigner un rôle à {selectedMember.displayName || selectedMember.email}
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(SYNERGIA_ROLES).map(role => {
                  const isAssigned = selectedMember.synergiaRoles?.some(r => r.roleId === role.id);
                  
                  return (
                    <div
                      key={role.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isAssigned 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => !isAssigned && assignRole(selectedMember.id, role.id)}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{role.icon}</span>
                        <div>
                          <h4 className="text-white font-medium">{role.name}</h4>
                          <p className="text-gray-400 text-sm">{role.difficulty}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{role.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{role.taskCount} tâches</span>
                        {isAssigned ? (
                          <span className="text-green-400 text-xs font-medium">✓ Assigné</span>
                        ) : (
                          <span className="text-blue-400 text-xs">Cliquer pour assigner</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 Modal de consultation des permissions */}
      <AnimatePresence>
        {showPermissionsModal && selectedMember && (
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
              className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-96 overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Profil de {selectedMember.displayName || selectedMember.email}
                </h3>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Informations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">
                        Inscrit le {new Date(selectedMember.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-300">
                        Dernière activité: {new Date(selectedMember.lastActive).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedMember.level || 1}</div>
                      <div className="text-xs text-gray-500">Niveau</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{selectedMember.totalXP || 0}</div>
                      <div className="text-xs text-gray-500">XP Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions détaillées */}
              <div>
                <h4 className="text-white font-medium mb-3">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMember.synergiaRoles?.map(memberRole => {
                    const role = SYNERGIA_ROLES[memberRole.roleId];
                    if (!role) return null;
                    
                    return (
                      <div key={memberRole.roleId} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <span className="text-xl mr-2">{role.icon}</span>
                          <div>
                            <h5 className="text-white font-medium">{role.name}</h5>
                            <p className="text-gray-400 text-xs">
                              Assigné le {new Date(memberRole.assignedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {role.permissions.map(permission => (
                            <div key={permission} className="flex items-center text-xs">
                              <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                              <span className="text-gray-300">{permission.replace('_', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      Aucune permission assignée
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPage;
