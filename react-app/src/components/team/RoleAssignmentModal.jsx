// ==========================================
// 📁 react-app/src/components/team/RoleAssignmentModal.jsx
// MODAL D'ASSIGNATION DE RÔLES ULTRA-INTERACTIF
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Star,
  Crown,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Award,
  Clock,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Rôles Synergia (définis localement pour éviter les imports)
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations',
    permissions: ['maintenance_access', 'repair_management'],
    difficulty: 'Facile',
    taskCount: 100
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients',
    permissions: ['reputation_management', 'review_access'],
    difficulty: 'Moyen',
    taskCount: 100
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements',
    permissions: ['inventory_management', 'stock_access'],
    difficulty: 'Facile',
    taskCount: 100
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes',
    permissions: ['organization_access', 'workflow_management'],
    difficulty: 'Avancé',
    taskCount: 100
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication',
    permissions: ['content_creation', 'design_access'],
    difficulty: 'Moyen',
    taskCount: 100
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes',
    permissions: ['training_access', 'mentoring_rights'],
    difficulty: 'Avancé',
    taskCount: 100
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques',
    permissions: ['partnership_management', 'networking_access'],
    difficulty: 'Expert',
    taskCount: 100
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale',
    permissions: ['social_media_access', 'communication_rights'],
    difficulty: 'Moyen',
    taskCount: 100
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis',
    permissions: ['b2b_access', 'quote_management'],
    difficulty: 'Expert',
    taskCount: 100
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification',
    permissions: ['gamification_admin', 'xp_management'],
    difficulty: 'Expert',
    taskCount: 100
  }
};

// Catégories pour le filtrage
const ROLE_CATEGORIES = {
  operational: {
    name: 'Opérationnel',
    roles: ['maintenance', 'stock', 'organization'],
    color: 'bg-blue-500',
    icon: '⚙️'
  },
  commercial: {
    name: 'Commercial',
    roles: ['reputation', 'partnerships', 'b2b'],
    color: 'bg-green-500',
    icon: '💼'
  },
  creative: {
    name: 'Créatif',
    roles: ['content', 'communication'],
    color: 'bg-purple-500',
    icon: '🎨'
  },
  management: {
    name: 'Management',
    roles: ['mentoring', 'gamification'],
    color: 'bg-orange-500',
    icon: '👑'
  }
};

const RoleAssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedMember, 
  onRoleUpdated 
}) => {
  // États principaux
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // États pour l'assignation
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [selectedRolePreview, setSelectedRolePreview] = useState(null);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCategoryFilter('all');
      setDifficultyFilter('all');
      setShowAdvancedFilters(false);
      setSelectedRolePreview(null);
    }
  }, [isOpen]);

  if (!isOpen || !selectedMember) return null;

  // Vérifier si un rôle est assigné
  const isRoleAssigned = (roleId) => {
    return selectedMember?.synergiaRoles?.some(r => r.roleId === roleId);
  };

  // Obtenir les stats d'un rôle pour le membre
  const getMemberRoleData = (roleId) => {
    return selectedMember?.synergiaRoles?.find(r => r.roleId === roleId);
  };

  // Filtrage des rôles
  const getFilteredRoles = () => {
    let roles = Object.values(SYNERGIA_ROLES);

    // Filtre par recherche
    if (searchTerm) {
      roles = roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      const categoryRoles = ROLE_CATEGORIES[categoryFilter]?.roles || [];
      roles = roles.filter(role => categoryRoles.includes(role.id));
    }

    // Filtre par difficulté
    if (difficultyFilter !== 'all') {
      roles = roles.filter(role => role.difficulty === difficultyFilter);
    }

    return roles;
  };

  // Gestion de l'assignation/suppression de rôle
  const handleRoleToggle = async (roleId, action) => {
    const role = SYNERGIA_ROLES[roleId];
    
    setShowConfirmation({
      action,
      roleId,
      roleName: role.name,
      roleIcon: role.icon,
      roleColor: role.color,
      message: action === 'assign' 
        ? `Voulez-vous assigner le rôle "${role.name}" à ${selectedMember.name} ?`
        : `Voulez-vous retirer le rôle "${role.name}" à ${selectedMember.name} ?`
    });
  };

  // Confirmer l'action
  const confirmAction = async () => {
    if (!showConfirmation) return;

    try {
      setLoading(true);
      
      const { action, roleId, roleName } = showConfirmation;
      
      // Simulation d'une opération async
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ajouter à l'historique
      const newHistoryItem = {
        id: Date.now(),
        action,
        roleId,
        roleName,
        timestamp: new Date(),
        memberName: selectedMember.name
      };
      
      setAssignmentHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);
      
      // Animation de succès
      setShowConfirmation({
        ...showConfirmation,
        success: true
      });
      
      setTimeout(() => {
        setShowConfirmation(null);
        if (onRoleUpdated) onRoleUpdated();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur action rôle:', error);
      alert('Erreur lors de l\'opération');
      setShowConfirmation(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = getFilteredRoles();
  const assignedRoles = selectedMember.synergiaRoles || [];
  const availableRoles = filteredRoles.filter(role => !isRoleAssigned(role.id));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {selectedMember.photoURL ? (
                  <img
                    src={selectedMember.photoURL}
                    alt={selectedMember.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20">
                    {selectedMember.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Gestion des rôles
                </h2>
                <p className="text-gray-300">{selectedMember.name}</p>
                <p className="text-gray-400 text-sm">{selectedMember.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            >
              <X className="w-6 h-6 text-white group-hover:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>{assignedRoles.length} rôles assignés</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Award className="w-4 h-4" />
                <span>Niveau {selectedMember.level}</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Zap className="w-4 h-4" />
                <span>{selectedMember.totalXp} XP total</span>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <Target className="w-4 h-4" />
                <span>{selectedMember.tasksCompleted} tâches</span>
              </div>
            </div>
            
            {assignmentHistory.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Dernière modification : {assignmentHistory[0]?.timestamp.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes catégories</option>
              {Object.entries(ROLE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.icon} {category.name}</option>
              ))}
            </select>

            {/* Bouton filtres avancés */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all text-sm"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
              >
                <option value="all">Toutes difficultés</option>
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>

              <div className="text-sm text-gray-300 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {filteredRoles.length} rôle{filteredRoles.length > 1 ? 's' : ''} disponible{filteredRoles.length > 1 ? 's' : ''}
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setDifficultyFilter('all');
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-6">
            
            {/* Rôles actuels */}
            {assignedRoles.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Rôles actuels ({assignedRoles.length})
                </h3>
                <div className="grid gap-3">
                  {assignedRoles.map((userRole) => {
                    const roleInfo = SYNERGIA_ROLES[userRole.roleId];
                    if (!roleInfo) return null;
                    
                    return (
                      <div
                        key={userRole.roleId}
                        className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 hover:bg-green-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${roleInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
                              {roleInfo.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{roleInfo.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                                <span>Niveau {userRole.level}</span>
                                <span>•</span>
                                <span>{userRole.xpInRole} XP</span>
                                <span>•</span>
                                <span>{userRole.tasksCompleted} tâches</span>
                              </div>
                              
                              {/* Barre de progression */}
                              <div className="w-32 bg-white/20 rounded-full h-1.5 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all"
                                  style={{ width: `${Math.min((userRole.xpInRole / 1000) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRoleToggle(userRole.roleId, 'remove')}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
                          >
                            <Minus className="w-4 h-4" />
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rôles disponibles */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Rôles disponibles ({availableRoles.length})
              </h3>
              
              {categoryFilter !== 'all' && (
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${ROLE_CATEGORIES[categoryFilter]?.color}`}>
                    <Filter className="w-4 h-4" />
                    Catégorie: {ROLE_CATEGORIES[categoryFilter]?.icon} {ROLE_CATEGORIES[categoryFilter]?.name}
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {availableRoles.map((role) => (
                  <div
                    key={role.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all group cursor-pointer"
                    onClick={() => setSelectedRolePreview(selectedRolePreview === role.id ? null : role.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium">{role.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              role.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300' :
                              role.difficulty === 'Moyen' ? 'bg-yellow-500/20 text-yellow-300' :
                              role.difficulty === 'Avancé' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {role.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{role.description}</p>
                          
                          {/* Permissions et stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{role.taskCount} tâches</span>
                            <span>•</span>
                            <span>{role.permissions?.length || 0} permissions</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleToggle(role.id, 'assign');
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 ml-4 shadow-lg"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Assigner
                      </button>
                    </div>

                    {/* Détails étendus */}
                    {selectedRolePreview === role.id && (
                      <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                        <div>
                          <h5 className="text-white font-medium mb-2">Permissions incluses :</h5>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions?.map((permission) => (
                              <span
                                key={permission}
                                className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-white/5 rounded-lg p-3">
                            <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Progression</p>
                            <p className="text-white font-medium">Évolutif</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Équipe</p>
                            <p className="text-white font-medium">Collaborative</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <Shield className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Accès</p>
                            <p className="text-white font-medium">Sécurisé</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message si aucun rôle trouvé */}
              {availableRoles.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">Aucun rôle disponible</h4>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' 
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Tous les rôles sont déjà assignés à ce membre'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Les changements prendront effet immédiatement
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-70 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            {showConfirmation.success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Succès !</h3>
                <p className="text-gray-300">
                  L'opération a été réalisée avec succès.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${showConfirmation.roleColor} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
                    {showConfirmation.roleIcon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirmation</h3>
                  <p className="text-gray-300">{showConfirmation.message}</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(null)}
                    disabled={loading}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Traitement...
                      </>
                    ) : (
                      'Confirmer'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssignmentModal;
