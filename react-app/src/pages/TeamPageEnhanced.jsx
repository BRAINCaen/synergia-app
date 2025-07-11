// ==========================================
// 📁 react-app/src/pages/TeamPageEnhanced.jsx
// PAGE ÉQUIPE AMÉLIORÉE - AFFICHAGE EXHAUSTIF DES MEMBRES
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  BarChart3, 
  Settings,
  RefreshCw,
  Filter,
  UserPlus,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTeamEnhanced } from '../hooks/useTeamEnhanced.js';

// Rôles Synergia (données locales)
const SYNERGIA_ROLES = {
  direction: {
    id: 'direction',
    name: 'Direction & Management',
    icon: '👑',
    color: 'bg-yellow-500',
    description: 'Direction générale et prise de décisions stratégiques',
    difficulty: 'Expert',
    permissions: ['all_access']
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial & Vente',
    icon: '💰',
    color: 'bg-emerald-500',
    description: 'Développement commercial et relation client',
    difficulty: 'Moyen',
    permissions: ['sales_access', 'client_management']
  },
  finance: {
    id: 'finance',
    name: 'Finance & Comptabilité',
    icon: '📊',
    color: 'bg-blue-500',
    description: 'Gestion financière et comptabilité',
    difficulty: 'Avancé',
    permissions: ['finance_access', 'accounting']
  },
  rh: {
    id: 'rh',
    name: 'Ressources Humaines',
    icon: '👥',
    color: 'bg-orange-500',
    description: 'Gestion RH et recrutement',
    difficulty: 'Avancé',
    permissions: ['hr_access', 'recruitment']
  },
  technique: {
    id: 'technique',
    name: 'Technique & Maintenance',
    icon: '🔧',
    color: 'bg-gray-500',
    description: 'Support technique et maintenance',
    difficulty: 'Moyen',
    permissions: ['technical_access', 'maintenance']
  },
  logistique: {
    id: 'logistique',
    name: 'Logistique & Stock',
    icon: '📦',
    color: 'bg-teal-500',
    description: 'Gestion logistique et stocks',
    difficulty: 'Facile',
    permissions: ['inventory_management', 'stock_access']
  }
};

/**
 * 🏠 COMPOSANT PAGE ÉQUIPE AMÉLIORÉE
 */
const TeamPageEnhanced = () => {
  const { user } = useAuthStore();
  
  // Hook amélioré pour récupérer tous les membres
  const {
    teamMembers,
    filteredMembers,
    loading,
    error,
    lastUpdated,
    searchTerm,
    statusFilter,
    stats,
    refreshTeam,
    handleSearchChange,
    handleStatusFilterChange,
    totalMembers,
    visibleMembers,
    hasMembers
  } = useTeamEnhanced();

  // États locaux
  const [activeTab, setActiveTab] = useState('members');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'recent': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'away': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status) => {
    const badges = {
      online: 'bg-green-500/20 text-green-400 border-green-500/30',
      recent: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      away: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
      active: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    
    return badges[status] || badges.inactive;
  };

  // Interface des onglets
  const tabs = [
    { 
      id: 'members', 
      label: 'Membres', 
      icon: Users, 
      count: visibleMembers,
      color: 'text-blue-400'
    },
    { 
      id: 'stats', 
      label: 'Statistiques', 
      icon: BarChart3,
      color: 'text-green-400'
    },
    { 
      id: 'roles', 
      label: 'Rôles Synergia', 
      icon: Award, 
      count: Object.keys(SYNERGIA_ROLES).length,
      color: 'text-purple-400'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings,
      color: 'text-gray-400'
    }
  ];

  // Filtres de statut
  const statusFilters = [
    { value: 'all', label: 'Tous', count: totalMembers },
    { value: 'active', label: 'Actifs', count: stats.active },
    { value: 'online', label: 'En ligne', count: stats.online },
    { value: 'recent', label: 'Récents', count: stats.recent },
    { value: 'inactive', label: 'Inactifs', count: stats.inactive }
  ];

  // Affichage de l'état de chargement initial
  if (loading && !hasMembers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement exhaustif des membres...</p>
          <p className="text-gray-400 text-sm mt-2">
            Récupération depuis toutes les sources Firebase
          </p>
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
              Gestion d'Équipe Complète
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            
            {/* Indicateur de connectivité */}
            <div className="flex items-center gap-2 ml-4">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">En ligne</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Hors ligne</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistiques en header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-green-400">{stats.active}</div>
              <div className="text-xs text-gray-400">Actifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-yellow-400">{stats.online}</div>
              <div className="text-xs text-gray-400">En ligne</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-purple-400">{stats.avgLevel}</div>
              <div className="text-xs text-gray-400">Niveau Moy.</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-orange-400">{stats.departments}</div>
              <div className="text-xs text-gray-400">Départements</div>
            </div>
          </div>

          {/* Debug sources */}
          <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
            <span>Sources: </span>
            {Object.entries(stats.sources).map(([source, count]) => (
              <span key={source} className="bg-gray-800/30 px-2 py-1 rounded">
                {source}: {count}
              </span>
            ))}
            {lastUpdated && (
              <span className="text-gray-600">
                Dernière MAJ: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Barre de contrôles */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              
              <button
                onClick={refreshTeam}
                className="px-4 py-2 bg-purple-600 border border-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Filtres de statut */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilterChange(filter.value)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation des onglets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white border border-gray-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${tab.color || 'text-current'}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          
          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Erreur de chargement</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
                    >
                      {/* Header membre */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.avatar || member.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {member.displayName || 'Nom inconnu'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400 truncate">
                              {member.email || 'Email non disponible'}
                            </span>
                          </div>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center gap-1">
                          {getStatusIcon(member.status)}
                        </div>
                      </div>

                      {/* Informations membre */}
                      <div className="space-y-2">
                        {/* Rôle et département */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Rôle:</span>
                          <span className="text-gray-300">{member.role || 'Non défini'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Département:</span>
                          <span className="text-gray-300">{member.department || 'Non spécifié'}</span>
                        </div>

                        {/* XP et niveau */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Niveau:</span>
                          <span className="text-blue-400 font-medium">
                            Niv. {member.level || 1} ({member.xp || 0} XP)
                          </span>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Statut:</span>
                          <span className={`px-2 py-1 rounded border text-xs ${getStatusBadge(member.status)}`}>
                            {member.status || 'inconnu'}
                          </span>
                        </div>

                        {/* Source */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Source:</span>
                          <span className="text-purple-400">{member.source}</span>
                        </div>

                        {/* Rôles Synergia */}
                        {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">Rôles Synergia:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.synergiaRoles.slice(0, 2).map((role, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30"
                                >
                                  {typeof role === 'string' ? role : role.name}
                                </span>
                              ))}
                              {member.synergiaRoles.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{member.synergiaRoles.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Projets */}
                        {member.projects && member.projects.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-400">Projets:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.projects.slice(0, 2).map((project, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-600/30"
                                >
                                  {project.title || project.id}
                                </span>
                              ))}
                              {member.projects.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{member.projects.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    {searchTerm ? 'Aucun membre trouvé' : 'Aucun membre dans l\'équipe'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Essayez de modifier vos critères de recherche' 
                      : 'L\'équipe semble vide pour le moment'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={refreshTeam}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Rafraîchir les données
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ONGLET STATISTIQUES */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Statistiques de l'Équipe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Statistiques générales */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Vue d'ensemble
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total membres:</span>
                      <span className="text-white font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actifs:</span>
                      <span className="text-green-400 font-medium">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inactifs:</span>
                      <span className="text-red-400 font-medium">{stats.inactive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Niveau moyen:</span>
                      <span className="text-purple-400 font-medium">{stats.avgLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP totale:</span>
                      <span className="text-yellow-400 font-medium">{stats.totalXp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Statuts de connexion */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Statuts de connexion
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">En ligne:</span>
                      <span className="text-green-400 font-medium">{stats.online}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Récemment actifs:</span>
                      <span className="text-yellow-400 font-medium">{stats.recent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Absents:</span>
                      <span className="text-orange-400 font-medium">
                        {stats.total - stats.online - stats.recent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sources de données */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Sources de données
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(stats.sources).map(([source, count]) => (
                      <div key={source} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{source}:</span>
                        <span className="text-blue-400 font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graphique de répartition par département */}
              <div className="mt-6 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-3">Répartition par département</h4>
                <div className="text-center text-gray-400 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Graphiques détaillés en cours de développement</p>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET RÔLES SYNERGIA */}
          {activeTab === 'roles' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Rôles Synergia Disponibles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(SYNERGIA_ROLES).map((role) => (
                  <div
                    key={role.id}
                    className={`${role.color} bg-opacity-20 border border-opacity-30 rounded-lg p-4 hover:bg-opacity-30 transition-colors`}
                    style={{
                      borderColor: role.color.replace('bg-', '').replace('-500', '')
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <h4 className="font-medium text-white">{role.name}</h4>
                        <span className="text-xs text-gray-400">{role.difficulty}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{role.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Permissions:</span>
                      <span className="text-gray-300">{role.permissions.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET PARAMÈTRES */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Paramètres de l'Équipe</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Configuration de récupération</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Inclure les membres inactifs</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Synchronisation temps réel</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Récupération multi-sources</span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Actions avancées</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={refreshTeam}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Synchroniser maintenant
                    </button>
                    
                    <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      Exporter données
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal détails membre */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Détails de {selectedMember.displayName}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{selectedMember.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rôle:</span>
                  <span className="text-white ml-2">{selectedMember.role}</span>
                </div>
                <div>
                  <span className="text-gray-400">Département:</span>
                  <span className="text-white ml-2">{selectedMember.department}</span>
                </div>
                <div>
                  <span className="text-gray-400">Niveau:</span>
                  <span className="text-white ml-2">{selectedMember.level} ({selectedMember.xp} XP)</span>
                </div>
                <div>
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white ml-2">{selectedMember.source}</span>
                </div>
                {selectedMember.lastActivity && (
                  <div>
                    <span className="text-gray-400">Dernière activité:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedMember.lastActivity).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPageEnhanced;
