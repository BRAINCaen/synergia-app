return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec actions */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-blue-500" />
                Mon Équipe
                <span className="text-lg font-normal text-gray-400">
                  ({stats.totalMembers} membre{stats.totalMembers > 1 ? 's' : ''})
                </span>
              </h1>
              <p className="text-gray-400 mt-2">
                Gérez et collaborez avec votre équipe • {onlinePercentage}% en ligne
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={refreshData}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <Clock size={16} className={loading ? 'animate-spin' : ''} />
                Actualiser
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <UserPlus size={16} />
                Inviter
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur de santé équipe */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Santé de l'équipe</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    teamHealth.activity === 'good' ? 'bg-green-500' : 
                    teamHealth.activity === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-400">Activité</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    teamHealth.productivity === 'good' ? 'bg-green-500' : 
                    teamHealth.productivity === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-400">Productivité</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    teamHealth.growth === 'good' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-400">Croissance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {hasError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-400">
                ⚠️ {error}
              </p>
              <button 
                onClick={clearErrors}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Ignorer
              </button>
            </div>
          </div>
        )}

        {/* Statistiques équipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Membres Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.activeMembers} en ligne • {onlinePercentage}%
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
            <p className="text-blue-400 text-sm mt-2">
              Niveau moyen: {stats.averageLevel}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.completionRate}% terminées
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <Trophy className="text-purple-500" size={24} />
            </div>
            <p className="text-purple-400 text-sm mt-2">
              {stats.activeProjects} actifs
            </p>
          </div>
        </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="online">En ligne</option>
                      <option value="away">Absent</option>
                      <option value="offline">Hors ligne</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                    <select
                      value={filters.role}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tous les rôles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Département</label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tous les départements</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des membres */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users size={24} />
                  Membres de l'équipe
                  <span className="text-sm font-normal text-gray-400">
                    ({filteredMembers.length})
                  </span>
                </h2>
                
                {loading && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Synchronisation...</span>
                  </div>
                )}
              </div>
              
              {/* Vue grille */}
              {selectedView === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                         onClick={() => setSelectedMember(member)}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700 ${
                            getStatusColor(member.status) === 'green' ? 'bg-green-500' :
                            getStatusColor(member.status) === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{member.name}</h3>
                          <p className="text-blue-400 text-sm">{member.role}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            {getLevelBadge(member.level)}
                            <span>Niv. {member.level}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">XP</p>
                          <p className="text-white font-medium">{member.xp?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tâches</p>
                          <p className="text-white font-medium">{member.tasksCompleted || 0}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-400">
                        <p>Dernière activité: {formatLastActivity(member.lastActivity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Vue liste */}
              {selectedView === 'list' && (
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${
                            getStatusColor(member.status) === 'green' ? 'bg-green-500' :
                            getStatusColor(member.status) === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-white">{member.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{member.email}</span>
                            <span>•</span>
                            <span className="text-blue-400">{member.role}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-yellow-400 font-medium">Niv. {member.level}</p>
                          <p className="text-gray-400">{member.xp?.toLocaleString() || 0} XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-green-400 font-medium">{member.tasksCompleted || 0}</p>
                          <p className="text-gray-400">Tâches</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300">{formatLastActivity(member.lastActivity)}</p>
                          <p className="text-gray-400">Dernière activité</p>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* État vide */}
              {isEmpty && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Aucun membre trouvé</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || filters.status !== 'all' || filters.role !== 'all' || filters.department !== 'all'
                      ? 'Aucun membre ne correspond à vos critères de recherche.'
                      : 'Invitez des collègues à rejoindre votre équipe pour commencer à collaborer.'
                    }
                  </p>
                  {(searchTerm || filters.status !== 'all' || filters.role !== 'all' || filters.department !== 'all') && (
                    <button
                      onClick={resetAllFilters}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}

              {/* Pagination ou bouton "Charger plus" si nécessaire */}
              {filteredMembers.length > 0 && filteredMembers.length === 20 && (
                <div className="mt-6 text-center">
                  <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Charger plus de membres
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Top Performers
              </h2>
              
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6">
                      {index === 0 && <span className="text-yellow-400">🥇</span>}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && <span className="text-orange-400">🥉</span>}
                      {index > 2 && <span className="text-gray-500 text-sm">#{index + 1}</span>}
                    </div>
                    
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-gray-400 text-xs">{member.xp?.toLocaleString() || 0} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activités récentes */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={20} />
                Activités récentes
              </h2>
              
              <div className="space-y-3">
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="text-blue-400">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatLastActivity(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
              
              {activities.length > 8 && (
                <div className="mt-4 text-center">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Voir toutes les activités
                  </button>
                </div>
              )}
            </div>

            {/* Membres en ligne */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                En ligne ({onlineMembers.length})
              </h2>
              
              <div className="space-y-2">
                {onlineMembers.slice(0, 6).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded transition-colors">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{member.name}</p>
                      <p className="text-gray-400 text-xs">{member.role}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                ))}
                
                {onlineMembers.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-sm">
                    Aucun membre en ligne
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal détail membre */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Profil de {selectedMember.name}</h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{selectedMember.name}</h4>
                    <p className="text-blue-400">{selectedMember.role}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Mail size={12} />
                      {selectedMember.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-sm">Niveau</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {getLevelBadge(selectedMember.level)} {selectedMember.level}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-sm">XP Total</p>
                    <p className="text-white font-semibold">{selectedMember.xp?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-sm">Tâches</p>
                    <p className="text-white font-semibold">{selectedMember.tasksCompleted || 0}</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-sm">Statut</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {getStatusIcon(selectedMember.status)} 
                      {selectedMember.status === 'online' ? 'En ligne' :
                       selectedMember.status === 'away' ? 'Absent' : 'Hors ligne'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">Dernière activité</p>
                  <p className="text-white">{formatLastActivity(selectedMember.lastActivity)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// Page équipe moderne avec système complet de gestion
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../shared/components/Navigation.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useTeam } from '../shared/hooks/useTeam.js';
import { 
  Users, Trophy, Target, Star, Activity, UserPlus, 
  Search, Filter, TrendingUp, Calendar, MoreVertical,
  Clock, Mail, MapPin, Award
} from 'lucide-react';

const TeamPage = () => {
  // ✅ Utilisation du hook personnalisé avec options
  const {
    members,
    stats,
    activities,
    loading,
    error,
    filteredMembers,
    onlineMembers,
    topPerformers,
    departments,
    roles,
    hasMembers,
    hasError,
    isEmpty,
    onlinePercentage,
    teamHealth,
    searchTerm,
    filters,
    // Actions
    search,
    filter,
    resetSearch,
    refreshData,
    clearErrors,
    // Utilitaires
    formatLastActivity,
    getStatusColor,
    getStatusIcon,
    getLevelBadge
  } = useTeam({
    autoLoad: true,
    realTime: true,
    refreshInterval: 30000 // Rafraîchissement toutes les 30 secondes
  });

  // ✅ États locaux pour l'UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState('grid'); // grid | list
  const [selectedMember, setSelectedMember] = useState(null);

  // ✅ Gestion des filtres
  const handleFilterChange = (key, value) => {
    filter({ [key]: value });
  };

  const handleSearch = (term) => {
    search(term);
  };

  const resetAllFilters = () => {
    resetSearch();
    setShowFilters(false);
  };

  // ✅ Gestion des erreurs
  useEffect(() => {
    if (hasError) {
      console.error('Erreur équipe:', error);
      // Auto-clear les erreurs après 5 secondes
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError, error, clearErrors]);

  // ✅ Rendu du loading
  if (loading && !hasMembers) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // ✅ Fonctions utilitaires
  const getAvatarFromEmail = (email) => {
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊', '🧑‍🔬', '👩‍🔬'];
    const index = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  };

  const getStatusFromActivity = (lastActivity) => {
    if (!lastActivity) return 'offline';
    
    try {
      const now = new Date();
      const lastActiveDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity);
      const diffMinutes = (now - lastActiveDate) / (1000 * 60);
      
      if (diffMinutes < 15) return 'online';
      if (diffMinutes < 60) return 'away';
      return 'offline';
    } catch {
      return 'offline';
    }
  };

  const calculateTeamStats = (members, tasks, projects) => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'online').length;
    const totalXP = members.reduce((sum, member) => sum + (member.xp || 0), 0);
    const averageLevel = totalMembers > 0 ? 
      Math.round(members.reduce((sum, member) => sum + (member.level || 1), 0) / totalMembers) : 1;
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const activeProjects = projects.filter(p => p.status === 'active' || !p.status).length;

    return {
      totalMembers,
      activeMembers,
      totalXP,
      averageLevel,
      totalTasks,
      completedTasks,
      completionRate,
      activeProjects,
      totalProjects: projects.length
    };
  };

  const generateRecentActivities = (members, tasks, projects) => {
    const activities = [];
    
    // Activités des tâches récentes
    tasks.slice(0, 5).forEach(task => {
      const member = members.find(m => m.id === task.userId) || members[0];
      activities.push({
        id: `task-${task.id}`,
        type: task.status === 'completed' ? 'task_completed' : 'task_created',
        user: member.name,
        action: task.status === 'completed' ? 'a terminé la tâche' : 'a créé la tâche',
        target: task.title,
        time: task.createdAt || new Date(),
        icon: task.status === 'completed' ? '✅' : '📝'
      });
    });

    // Activités des projets récents
    projects.slice(0, 3).forEach(project => {
      const member = members.find(m => m.id === project.userId) || members[0];
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        user: member.name,
        action: 'a créé le projet',
        target: project.title,
        time: project.createdAt || new Date(),
        icon: '🚀'
      });
    });

    // Trier par date (plus récent en premier)
    return activities.sort((a, b) => {
      const timeA = a.time.toDate ? a.time.toDate() : new Date(a.time);
      const timeB = b.time.toDate ? b.time.toDate() : new Date(b.time);
      return timeB - timeA;
    }).slice(0, 8);
  };

  const getDefaultTeamData = () => ({
    members: [{
      id: user?.uid || 'current-user',
      name: user?.displayName || user?.email?.split('@')[0] || 'Utilisateur',
      email: user?.email || 'user@example.com',
      role: 'Utilisateur connecté',
      level: 1,
      xp: 0,
      tasksCompleted: 0,
      projectsCreated: 0,
      avatar: user?.photoURL || '👤',
      status: 'online',
      lastActivity: new Date(),
      joinedAt: new Date()
    }],
    stats: {
      totalMembers: 1,
      activeMembers: 1,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0
    },
    projects: [],
    recentActivities: []
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Jamais';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Jamais';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const { members, stats, projects, recentActivities } = teamData;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-blue-500" />
                Mon Équipe
              </h1>
              <p className="text-gray-400 mt-2">
                Gérez et collaborez avec votre équipe
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <UserPlus size={20} />
              Inviter un membre
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">
              ⚠️ Erreur de chargement: {error}
            </p>
          </div>
        )}

        {/* Statistiques équipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Membres Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.activeMembers} en ligne
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
            <p className="text-blue-400 text-sm mt-2">
              Niveau moyen: {stats.averageLevel}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.completionRate}% terminées
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <Trophy className="text-purple-500" size={24} />
            </div>
            <p className="text-purple-400 text-sm mt-2">
              {stats.activeProjects} actifs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des membres */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={24} />
                Membres de l'équipe ({members.length})
              </h2>
              
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`}></div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                        <p className="text-blue-400 text-sm">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div>
                          <span className="text-yellow-400">Niveau {member.level}</span>
                          <br />
                          <span>{member.xp.toLocaleString()} XP</span>
                        </div>
                        <div>
                          <span className="text-green-400">{member.tasksCompleted} tâches</span>
                          <br />
                          <span>{formatDate(member.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton voir plus */}
              {members.length > 5 && (
                <div className="mt-6 text-center">
                  <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Voir tous les membres ({members.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={24} />
                Activités récentes
              </h2>
              
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="text-blue-400">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </div>

            {/* Projets actifs */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy size={24} />
                Projets actifs
              </h2>
              
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <h3 className="font-medium text-white">{project.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.description?.substring(0, 60)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        {project.status || 'Actif'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
                
                {projects.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    Aucun projet actif
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
