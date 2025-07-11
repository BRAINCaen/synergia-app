// ==========================================
// 📁 react-app/src/pages/TeamPageEnhanced.jsx
// PAGE ÉQUIPE AMÉLIORÉE - SPARKLES → STAR CORRIGÉ
// REMPLACER ENTIÈREMENT LE FICHIER EXISTANT
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
  Star, // ✅ CORRIGÉ : Sparkles → Star
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
  const getStatusIcon = (member) => {
    if (!member.lastActive) return <XCircle className="w-4 h-4 text-gray-400" />;
    
    const lastActive = new Date(member.lastActive);
    const now = new Date();
    const diffMinutes = (now - lastActive) / (1000 * 60);
    
    if (diffMinutes < 5) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (diffMinutes < 60) return <Clock className="w-4 h-4 text-yellow-500" />;
    if (diffMinutes < 1440) return <Clock className="w-4 h-4 text-blue-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  // Calcul des statistiques améliorées
  const enhancedStats = {
    total: teamMembers?.length || 0,
    active: teamMembers?.filter(m => m.isOnline)?.length || 0,
    online: teamMembers?.filter(m => m.lastActive && 
      (new Date() - new Date(m.lastActive)) < 5 * 60 * 1000)?.length || 0,
    recent: teamMembers?.filter(m => m.lastActive && 
      (new Date() - new Date(m.lastActive)) < 24 * 60 * 60 * 1000)?.length || 0,
    inactive: teamMembers?.filter(m => !m.lastActive || 
      (new Date() - new Date(m.lastActive)) > 7 * 24 * 60 * 60 * 1000)?.length || 0
  };

  // Options de filtre
  const filterOptions = [
    { value: 'all', label: 'Tous', count: enhancedStats.total },
    { value: 'active', label: 'Actifs', count: enhancedStats.active },
    { value: 'online', label: 'En ligne', count: enhancedStats.online },
    { value: 'recent', label: 'Récents', count: enhancedStats.recent },
    { value: 'inactive', label: 'Inactifs', count: enhancedStats.inactive }
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
            <Star className="w-8 h-8 text-purple-400 animate-pulse" /> {/* ✅ CORRIGÉ : Sparkles → Star */}
            
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
              <div className="text-xl font-bold text-blue-400">{enhancedStats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-green-400">{enhancedStats.active}</div>
              <div className="text-xs text-gray-400">Actifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-emerald-400">{enhancedStats.online}</div>
              <div className="text-xs text-gray-400">En ligne</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-yellow-400">{enhancedStats.recent}</div>
              <div className="text-xs text-gray-400">Récents</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-red-400">{enhancedStats.inactive}</div>
              <div className="text-xs text-gray-400">Inactifs</div>
            </div>
          </div>
        </div>

        {/* Contrôles et filtres */}
        <div className="mb-6 space-y-4">
          {/* Barre de recherche et actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un membre (nom, email, rôle)..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={refreshTeam}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Options</span>
              </button>
            </div>
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusFilterChange(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  statusFilter === option.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{option.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === option.value
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
            <button 
              onClick={refreshTeam}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* État de chargement avec données existantes */}
        {loading && hasMembers && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Actualisation des données en cours...</span>
            </div>
          </div>
        )}

        {/* Grille des membres */}
        {hasMembers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers?.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                roles={SYNERGIA_ROLES}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Il semble qu'aucun membre d'équipe ne soit disponible. 
              Vérifiez votre connexion Firebase ou contactez l'administrateur.
            </p>
            <div className="space-y-3">
              <button 
                onClick={refreshTeam}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Actualiser les données
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 👤 COMPOSANT CARTE MEMBRE
 */
const MemberCard = ({ member, roles, getStatusIcon }) => {
  const role = roles[member.role] || roles.commercial;
  
  // Calculer le statut de présence
  const getPresenceStatus = () => {
    if (!member.lastActive) return { status: 'unknown', label: 'Statut inconnu', color: 'gray' };
    
    const lastActive = new Date(member.lastActive);
    const now = new Date();
    const diffMinutes = (now - lastActive) / (1000 * 60);
    
    if (diffMinutes < 5) return { status: 'online', label: 'En ligne', color: 'green' };
    if (diffMinutes < 60) return { status: 'recent', label: 'Récemment actif', color: 'yellow' };
    if (diffMinutes < 1440) return { status: 'today', label: 'Actif aujourd\'hui', color: 'blue' };
    if (diffMinutes < 10080) return { status: 'week', label: 'Cette semaine', color: 'purple' };
    return { status: 'inactive', label: 'Inactif', color: 'red' };
  };

  const presence = getPresenceStatus();
  
  const statusColors = {
    green: 'text-green-400 bg-green-900/20 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-500/30',
    red: 'text-red-400 bg-red-900/20 border-red-500/30',
    gray: 'text-gray-400 bg-gray-800/20 border-gray-600/30'
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-xl">
      {/* Header avec avatar et statut */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {member.displayName?.[0] || member.email?.[0] || '?'}
            </div>
            {presence.status !== 'unknown' && (
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                presence.status === 'online' ? 'bg-green-400' :
                presence.status === 'recent' ? 'bg-yellow-400' :
                presence.status === 'today' ? 'bg-blue-400' :
                presence.status === 'week' ? 'bg-purple-400' :
                'bg-red-400'
              }`}></div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              {member.displayName || member.email}
            </h3>
            <p className="text-gray-400 text-xs flex items-center">
              <span className="mr-1">{role.icon}</span>
              {role.name}
            </p>
          </div>
        </div>
      </div>

      {/* Statut de présence */}
      <div className={`mb-4 px-3 py-2 rounded-lg border text-xs font-medium ${statusColors[presence.color]}`}>
        <div className="flex items-center justify-between">
          <span>{presence.label}</span>
          {member.lastActive && (
            <span className="text-xs opacity-75">
              {new Date(member.lastActive).toLocaleDateString('fr-FR', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{member.level || 1}</div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{member.totalXP || 0}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{member.badges?.length || 0}</div>
          <div className="text-xs text-gray-500">Badges</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progression</span>
          <span>{Math.min(100, ((member.totalXP || 0) % 1000) / 10)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, ((member.totalXP || 0) % 1000) / 10)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button 
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Voir</span>
        </button>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Mail className="w-3 h-3" />
          <span>Contact</span>
        </div>
      </div>
    </div>
  );
};

export default TeamPageEnhanced;
