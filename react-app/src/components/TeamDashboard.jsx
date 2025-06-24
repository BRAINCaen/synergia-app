// ==========================================
// 📁 react-app/src/components/TeamDashboard.jsx
// Dashboard équipe moderne avec le nouveau système - VERSION CORRIGÉE
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
  // ✅ Utilisation du hook avec options minimales pour le dashboard
  const {
    members,
    stats,
    onlineMembers,
    topPerformers,
    activities,
    loading,
    error,
    onlinePercentage,
    teamHealth,
    formatLastActivity,
    getStatusColor,
    getLevelBadge,
    refreshData
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
              onClick={refreshData}
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
