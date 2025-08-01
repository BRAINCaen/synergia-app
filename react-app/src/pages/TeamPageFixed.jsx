// ==========================================
// 📁 react-app/src/pages/TeamPageFixed.jsx
// TEAMPAGE CORRIGÉE AVEC ATTRIBUTION DE RÔLES FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTeamStore } from '../shared/stores/teamStore.js';

// Firebase direct
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Rôles Synergia
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations',
    permissions: ['maintenance_access', 'repair_management'],
    difficulty: 'Facile',
    taskCount: 85
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients',
    permissions: ['reputation_management', 'review_access'],
    difficulty: 'Moyen',
    taskCount: 92
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    permissions: ['inventory_management', 'stock_access'],
    difficulty: 'Facile',
    taskCount: 78
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    permissions: ['organization_access', 'workflow_management'],
    difficulty: 'Avancé',
    taskCount: 110
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    permissions: ['content_creation', 'design_access'],
    difficulty: 'Moyen',
    taskCount: 95
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    permissions: ['training_access', 'mentoring_rights'],
    difficulty: 'Avancé',
    taskCount: 88
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    permissions: ['partnership_management', 'networking_access'],
    difficulty: 'Expert',
    taskCount: 67
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    permissions: ['social_media_access', 'communication_rights'],
    difficulty: 'Moyen',
    taskCount: 102
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis',
    permissions: ['b2b_access', 'quote_management'],
    difficulty: 'Expert',
    taskCount: 73
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification',
    permissions: ['gamification_access', 'xp_management'],
    difficulty: 'Expert',
    taskCount: 45
  }
};

/**
 * 🎭 FONCTION D'ATTRIBUTION DE RÔLE CORRIGÉE
 * Utilise directement Firebase sans passer par les services défaillants
 */
const assignRoleDirectly = async (userId, roleData) => {
  try {
    console.log('🎭 [DIRECT] Attribution rôle:', userId, roleData);
    
    const memberRef = doc(db, 'teamMembers', userId);
    const memberDoc = await getDoc(memberRef);
    
    const existingData = memberDoc.exists() ? memberDoc.data() : {};
    const currentRoles = existingData.synergiaRoles || [];
    
    // Vérifier si le rôle existe déjà
    const roleId = roleData.id || roleData.roleId;
    if (currentRoles.some(role => role.roleId === roleId)) {
      return { success: false, error: 'Ce rôle est déjà assigné' };
    }
    
    // Créer le nouveau rôle
    const newRole = {
      roleId: roleId,
      roleName: roleData.name || roleData.roleName,
      assignedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      assignedBy: 'system',
      xpInRole: 0,
      tasksCompleted: 0,
      level: 'novice',
      permissions: roleData.permissions || [],
      lastActivity: new Date().toISOString(), // ✅ String au lieu de serverTimestamp
      isActive: true
    };
    
    const updatedRoles = [...currentRoles, newRole];
    
    // Sauvegarder directement
    await setDoc(memberRef, {
      id: userId,
      synergiaRoles: updatedRoles, // ✅ Pas d'arrayUnion
      teamStats: {
        totalXp: existingData.teamStats?.totalXp || 0,
        level: existingData.teamStats?.level || 1,
        tasksCompleted: existingData.teamStats?.tasksCompleted || 0,
        rolesCount: updatedRoles.length,
        joinedAt: existingData.teamStats?.joinedAt || new Date().toISOString()
      },
      permissions: existingData.permissions || [],
      status: 'active',
      lastUpdate: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ [DIRECT] Rôle assigné avec succès');
    return { success: true, role: newRole };
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur attribution rôle:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🎭 MODAL D'ATTRIBUTION DE RÔLES INTÉGRÉE
 */
const RoleAssignmentModal = ({ isOpen, onClose, member, onRoleAssigned }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Filtrer les rôles disponibles
  const availableRoles = Object.values(SYNERGIA_ROLES).filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || role.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Assigner un rôle
  const handleAssignRole = async (role) => {
    setIsAssigning(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await assignRoleDirectly(member.id, role);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Rôle "${role.name}" assigné avec succès !` 
        });
        
        // Notifier le parent
        if (onRoleAssigned) {
          onRoleAssigned(member.id, role);
        }
        
        // Fermer après 2 secondes
        setTimeout(() => {
          onClose();
        }, 2000);
        
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Erreur lors de l\'assignation' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Une erreur technique est survenue' 
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Attribution de Rôle</h2>
              <p className="text-gray-400 text-sm">
                Assigner un rôle à {member?.displayName || member?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes difficultés</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Avancé">Avancé</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Message de retour */}
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* Liste des rôles */}
        <div className="p-6 overflow-y-auto max-h-96">
          {availableRoles.length > 0 ? (
            <div className="space-y-3">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center text-white text-xl shrink-0`}>
                      {role.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{role.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{role.description}</p>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          role.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300' :
                          role.difficulty === 'Moyen' ? 'bg-yellow-500/20 text-yellow-300' :
                          role.difficulty === 'Avancé' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {role.difficulty}
                        </span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {role.taskCount} tâches
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {role.permissions.length} permissions
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAssignRole(role)}
                      disabled={isAssigning}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAssigning ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Assigner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-2">Aucun rôle trouvé</h4>
              <p className="text-gray-400 text-sm">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 🏠 COMPOSANT PRINCIPAL TEAMPAGE
 */
const TeamPageFixed = () => {
  const { user } = useAuthStore();
  const { members, loading, error, refreshTeam } = useTeamStore();
  
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      refreshTeam();
    }
  }, [user, refreshTeam]);

  // Gestion des messages de succès
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.displayName?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  // Ouvrir modal d'attribution
  const handleOpenRoleAssignment = (member) => {
    setSelectedMember(member);
    setShowRoleAssignment(true);
  };

  // Fermer modal d'attribution
  const handleCloseRoleAssignment = () => {
    setShowRoleAssignment(false);
    setSelectedMember(null);
  };

  // Callback quand un rôle est assigné
  const handleRoleAssigned = (memberId, role) => {
    setSuccessMessage(`Rôle "${role.name}" assigné avec succès !`);
    // Actualiser l'équipe
    setTimeout(() => {
      refreshTeam();
    }, 1000);
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTeam();
    setRefreshing(false);
  };

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestion d'Équipe</h1>
              <p className="text-gray-400">Gérez votre équipe avec Firebase en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {member.displayName?.charAt(0) || member.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {member.displayName || member.email}
                  </h3>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              {/* Rôles actuels */}
              <div className="mb-4">
                <h4 className="text-white text-sm font-medium mb-2">Rôles Synergia :</h4>
                <div className="flex flex-wrap gap-2">
                  {member.synergiaRoles && member.synergiaRoles.length > 0 ? (
                    member.synergiaRoles.map((role, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                      >
                        {role.roleName || role.roleId}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Aucun rôle assigné</span>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Niveau</p>
                  <p className="text-white font-bold">{member.teamStats?.level || 1}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">XP</p>
                  <p className="text-white font-bold">{member.teamStats?.totalXp || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Rôles</p>
                  <p className="text-white font-bold">{member.teamStats?.rolesCount || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenRoleAssignment(member)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Gérer les rôles
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun membre */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Aucun membre trouvé</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Aucun membre ne correspond à votre recherche' : 'Aucun membre dans l\'équipe'}
            </p>
          </div>
        )}
      </div>

      {/* Modal d'attribution de rôles */}
      <RoleAssignmentModal
        isOpen={showRoleAssignment}
        onClose={handleCloseRoleAssignment}
        member={selectedMember}
        onRoleAssigned={handleRoleAssigned}
      />
    </div>
  );
};

export default TeamPageFixed;
