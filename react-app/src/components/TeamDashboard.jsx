// ==========================================
// 📁 react-app/src/components/TeamDashboard.jsx
// Dashboard équipe moderne avec le nouveau système
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useTeam } from '../shared/hooks/useTeam.js';
import LoadingSpinner from './ui/LoadingSpinner.jsx';
import { 
  Users, Trophy, Target, TrendingUp, UserPlus, Activity, 
  Star, ArrowRight, Clock, Award 
} from 'lucide-react';

const TeamDashboard = () => {
  // ✅ Utilisation du hook spécialisé pour les stats
  const { stats, loading, error, refresh } = useTeamStats();

  // ✅ Utilisation du hook principal avec options minimales
  const {
    members,
    onlineMembers,
    topPerformers,
    activities,
    onlinePercentage,
    teamHealth,
    formatLastActivity,
    getStatusColor,
    getLevelBadge
  } = useTeam({ 
    autoLoad: true, 
    realTime: false // Pas besoin du temps réel pour le dashboard
  });

  if (loading && members.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" />
            Équipe
            {stats.totalMembers > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({stats.totalMembers})
              </span>
            )}
          </h2>
          {onlinePercentage > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              {onlinePercentage}% des membres en ligne
            </p>
          )}
        </div>
        
        <Link
          to="/team"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {/* Message d'erreur compact */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button 
              onClick={refresh}
              className="text-xs text-red-300 hover:text-red-200"
            >
              Réessayer
            </button>
          </p>
        </div>
      )}

      {/* Indicateur de santé équipe compact */}
      {members.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Santé équipe</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  teamHealth.activity === 'good' ? 'bg-green-500' : 
                  teamHealth.activity === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-400">Activité</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  teamHealth.productivity === 'good' ? 'bg-green-500' : 
                  teamHealth.productivity === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-400">Productivité</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-400">En ligne</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.activeMembers}</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-400">XP Total</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.totalXP.toLocaleString()}</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-sm text-gray-400">Tâches</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats.completionRate}%</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-4 h-4 text-purple-400 mr-1" />
            <span className="text-sm text-gray-400">Projets</span>
          </div>
          <p className="text-xl font-bold text-purple-400">{stats.activeProjects}</p>
        </div>
      </div>

      {/* Top performer en vedette */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              {stats.topPerformer.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-yellow-400 font-medium text-sm">🏆 Top Performer</p>
              <p className="text-white font-semibold truncate">{stats.topPerformer.name}</p>
              <p className="text-gray-400 text-xs">
                {stats.topPerformer.xp?.toLocaleString() || 0} XP • Niveau {stats.topPerformer.level || 1}
              </p>
            </div>
            <TrendingUp className="text-yellow-400 flex-shrink-0" size={18} />
          </div>
        </div>
      )}

      {/* Section membres actifs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Membres actifs</h3>
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} className="animate-spin" />
              <span className="text-xs">Sync...</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {(onlineMembers.length > 0 ? onlineMembers : members).slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                    {member.avatar}
                  </div>
                  {member.status && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-700 ${
                      getStatusColor(member.status) === 'green' ? 'bg-green-500' :
                      getStatusColor(member.status) === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-medium text-white text-sm truncate">{member.name}</h4>
                  <p className="text-gray-400 text-xs truncate">{member.role}</p>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-yellow-400 text-xs mb-1">
                  {getLevelBadge(member.level)}
                  <span>Niv. {member.level}</span>
                </div>
                <p className="text-gray-400 text-xs">{member.xp?.toLocaleString() || 0} XP</p>
              </div>
            </div>
          ))}

          {members.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aucun membre trouvé</p>
              <p className="text-gray-500 text-xs mt-1">
                Invitez des collègues à rejoindre votre équipe
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top performers compact */}
      {topPerformers.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="text-yellow-500" size={16} />
            Top 3 Performers
          </h3>
          
          <div className="space-y-2">
            {topPerformers.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                <div className="flex items-center justify-center w-6 h-6 text-xs">
                  {index === 0 && <span>🥇</span>}
                  {index === 1 && <span>🥈</span>}
                  {index === 2 && <span>🥉</span>}
                </div>
                
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                  {member.avatar}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{member.name}</p>
                </div>
                
                <p className="text-yellow-400 text-xs font-medium">
                  {member.xp?.toLocaleString() || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activités récentes compactes */}
      {activities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity size={16} />
            Activités récentes
          </h3>
          
          <div className="space-y-2">
            {activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-700 rounded">
                <span className="text-sm">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}
                  </p>
                  <p className="text-xs text-blue-400 truncate">{activity.target}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatLastActivity(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/team"
            className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Voir l'équipe
          </Link>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <UserPlus size={14} />
            Inviter
          </button>
        </div>
      </div>

      {/* Debug info (dev uniquement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
          Membres: {members.length} | En ligne: {onlineMembers.length} | 
          Stats: {stats.totalMembers ? 'OK' : 'Vide'} | 
          Santé: {teamHealth.activity}/{teamHealth.productivity}
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;

export default TeamDashboard;) => sum + char.charCodeAt(0), 0);
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
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
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
      inProgressTasks,
      completionRate,
      activeProjects,
      totalProjects: projects.length,
      topPerformer: members.reduce((top, member) => 
        (member.xp > (top?.xp || 0)) ? member : top, null)
    };
  };

  const getDefaultTeamData = () => ({
    members: [getCurrentUserData()],
    tasks: [],
    projects: [],
    stats: {
      totalMembers: 1,
      activeMembers: 1,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0,
      topPerformer: null
    },
    lastUpdated: new Date().toISOString()
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
        month: 'short'
      });
    } catch {
      return 'Récent';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          Impossible de charger les données de l'équipe
        </p>
      </div>
    );
  }

  const { members, stats } = teamData;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-blue-500" />
          Équipe ({stats.totalMembers})
        </h2>
        <Link
          to="/team"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.activeMembers}</p>
          <p className="text-gray-400 text-sm">En ligne</p>
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.totalXP}</p>
          <p className="text-gray-400 text-sm">XP Total</p>
          <Star className="w-4 h-4 text-yellow-400 mx-auto mt-1" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.completionRate}%</p>
          <p className="text-gray-400 text-sm">Tâches</p>
          <Target className="w-4 h-4 text-green-400 mx-auto mt-1" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.activeProjects}</p>
          <p className="text-gray-400 text-sm">Projets</p>
          <Trophy className="w-4 h-4 text-purple-400 mx-auto mt-1" />
        </div>
      </div>

      {/* Top performer */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
              {stats.topPerformer.avatar}
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 font-medium">🏆 Top Performer</p>
              <p className="text-white font-semibold">{stats.topPerformer.name}</p>
              <p className="text-gray-400 text-sm">{stats.topPerformer.xp} XP • Niveau {stats.topPerformer.level}</p>
            </div>
            <TrendingUp className="text-yellow-400" size={20} />
          </div>
        </div>
      )}

      {/* Liste des membres */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Membres actifs</h3>
        
        {members.slice(0, 5).map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`}></div>
              </div>
              
              <div>
                <h4 className="font-medium text-white">{member.name}</h4>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-yellow-400 text-sm font-medium">Niv. {member.level}</p>
              <p className="text-gray-400 text-xs">{member.xp} XP</p>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun membre trouvé</p>
            <p className="text-gray-500 text-sm mt-1">
              Invitez des collègues à rejoindre votre équipe
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex gap-3">
          <Link
            to="/team"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Voir l'équipe
          </Link>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <UserPlus size={16} />
            Inviter
          </button>
        </div>
      </div>

      {/* Debug info (dev uniquement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
          Sources: {members.map(m => m.source).join(', ')} | 
          Dernière MAJ: {formatDate(teamData.lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
