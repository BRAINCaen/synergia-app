// ==========================================
// 📁 react-app/src/components/team/RoleAssignmentModalFixed.jsx
// MODAL D'ASSIGNATION DE RÔLES CORRIGÉE - SANS ERREURS FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Search,
  Star,
  Crown,
  Shield,
  Zap,
  Target,
  Award,
  Users,
  Loader,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { teamRoleAssignmentFixed } from '../../core/services/teamRoleAssignmentFixed.js';

// Rôles Synergia avec données complètes
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
    xpReward: 10
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
    xpReward: 15
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
    xpReward: 12
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
    xpReward: 20
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    permissions: ['content_creation', 'design_access', 'visual_communication'],
    difficulty: 'Moyen',
    taskCount: 95,
    xpReward: 18
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
    xpReward: 25
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    permissions: ['partnership_management', 'networking_access', 'business_development'],
    difficulty: 'Expert',
    taskCount: 67,
    xpReward: 30
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    permissions: ['social_media_access', 'communication_rights', 'digital_marketing'],
    difficulty: 'Moyen',
    taskCount: 102,
    xpReward: 16
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis',
    permissions: ['b2b_access', 'quote_management', 'enterprise_relations'],
    difficulty: 'Expert',
    taskCount: 73,
    xpReward: 28
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification et récompenses',
    permissions: ['gamification_access', 'xp_management', 'reward_system'],
    difficulty: 'Expert',
    taskCount: 45,
    xpReward: 35
  }
};

/**
 * 🎭 MODAL D'ASSIGNATION DE RÔLES CORRIGÉE
 */
const RoleAssignmentModalFixed = ({ 
  isOpen, 
  onClose, 
  user, 
  currentProjectId = null,
  onRoleAssigned = () => {},
  mode = 'synergia' // 'synergia' ou 'project'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentUserRoles, setCurrentUserRoles] = useState([]);
  const [expandedRole, setExpandedRole] = useState(null);

  // Charger les rôles actuels de l'utilisateur
  useEffect(() => {
    if (isOpen && user?.id) {
      loadCurrentUserRoles();
    }
  }, [isOpen, user]);

  const loadCurrentUserRoles = async () => {
    try {
      const result = await teamRoleAssignmentFixed.getMemberRoles(user.id);
      if (result.success) {
        setCurrentUserRoles(result.roles || []);
      }
    } catch (error) {
      console.error('Erreur chargement rôles utilisateur:', error);
    }
  };

  // Filtrer les rôles disponibles
  const availableRoles = Object.values(SYNERGIA_ROLES).filter(role => {
    // Filtrer par recherche
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrer par difficulté
    const matchesDifficulty = difficultyFilter === 'all' || role.difficulty === difficultyFilter;
    
    // Exclure les rôles déjà assignés
    const notAlreadyAssigned = !currentUserRoles.some(userRole => userRole.roleId === role.id);
    
    return matchesSearch && matchesDifficulty && notAlreadyAssigned;
  });

  // Assigner un rôle
  const handleAssignRole = async (role) => {
    setIsAssigning(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🎭 Assignation rôle:', { userId: user.id, role: role.id });

      const result = await teamRoleAssignmentFixed.assignSynergiaRole(
        user.id,
        role,
        'current_user' // TODO: Remplacer par l'ID de l'utilisateur connecté
      );

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || `Rôle "${role.name}" assigné avec succès !` 
        });
        
        // Actualiser la liste des rôles
        await loadCurrentUserRoles();
        
        // Notifier le parent
        onRoleAssigned({
          userId: user.id,
          role: role,
          success: true
        });

        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          onClose();
          setMessage({ type: '', text: '' });
        }, 2000);
        
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Erreur lors de l\'assignation du rôle' 
        });
      }
    } catch (error) {
      console.error('Erreur assignation rôle:', error);
      setMessage({ 
        type: 'error', 
        text: 'Une erreur technique est survenue' 
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Obtenir la couleur de difficulté
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-500/20 text-green-300';
      case 'Moyen': return 'bg-yellow-500/20 text-yellow-300';
      case 'Avancé': return 'bg-orange-500/20 text-orange-300';
      case 'Expert': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
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
                Assigner un rôle Synergia à {user?.displayName || user?.email || 'l\'utilisateur'}
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

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
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

            {/* Filtre difficulté */}
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
                  <AlertCircle className="w-4 h-4" />
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
                  className={`bg-gray-800/50 rounded-xl border transition-all duration-200 ${
                    expandedRole === role.id ? 'border-blue-500/50' : 'border-gray-700'
                  } hover:border-gray-600`}
                >
                  {/* Contenu principal du rôle */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icône et infos principales */}
                      <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center text-white text-xl shrink-0`}>
                        {role.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">{role.name}</h3>
                            <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                            
                            {/* Badges info */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(role.difficulty)}`}>
                                {role.difficulty}
                              </span>
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                {role.taskCount} tâches
                              </span>
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                +{role.xpReward} XP
                              </span>
                            </div>
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                            >
                              {expandedRole === role.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              Détails
                            </button>
                            
                            <button
                              onClick={() => handleAssignRole(role)}
                              disabled={isAssigning}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                              {isAssigning ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              Assigner
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {expandedRole === role.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Permissions */}
                          <div>
                            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Permissions incluses
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions?.map((permission) => (
                                <span
                                  key={permission}
                                  className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full"
                                >
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Statistiques */}
                          <div>
                            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Objectifs & Récompenses
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tâches disponibles:</span>
                                <span className="text-white">{role.taskCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">XP par tâche:</span>
                                <span className="text-purple-300">+{role.xpReward}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Progression:</span>
                                <span className="text-blue-300">Évolutive</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Aucun rôle disponible</h4>
              <p className="text-gray-400 text-sm">
                {searchTerm || difficultyFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Tous les rôles ont déjà été assignés à cet utilisateur'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {currentUserRoles.length > 0 && (
                <span>
                  Rôles actuels: {currentUserRoles.length} | 
                  Disponibles: {availableRoles.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModalFixed;
