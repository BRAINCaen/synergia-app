// ==========================================
// 📁 react-app/src/components/team/TeamRoleDashboard.jsx
// DASHBOARD DES RÔLES D'ÉQUIPE - VERSION SIMPLIFIÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { SYNERGIA_ROLES } from '../../core/services/synergiaRolesService.js';
import { 
  Users, 
  Award, 
  TrendingUp, 
  BarChart3,
  Target,
  Star,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';

const TeamRoleDashboard = ({ teamMembers = [] }) => {
  const [roleStats, setRoleStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateRoleStats();
  }, [teamMembers]);

  const calculateRoleStats = () => {
    setLoading(true);
    
    // Simuler un petit délai
    setTimeout(() => {
      const statsMap = {};
      
      // Initialiser tous les rôles
      Object.values(SYNERGIA_ROLES).forEach(role => {
        statsMap[role.id] = {
          ...role,
          totalUsers: 0,
          activeUsers: 0,
          totalXp: 0,
          averageXp: 0,
          totalTasks: 0,
          topPerformers: []
        };
      });

      // Calculer les stats réelles
      teamMembers.forEach(member => {
        if (member.synergiaRoles) {
          member.synergiaRoles.forEach(userRole => {
            const roleId = userRole.roleId;
            if (statsMap[roleId]) {
              statsMap[roleId].totalUsers++;
              if (member.status === 'online' || member.status === 'away') {
                statsMap[roleId].activeUsers++;
              }
              statsMap[roleId].totalXp += userRole.xpInRole || 0;
              statsMap[roleId].totalTasks += userRole.tasksCompleted || 0;
              
              statsMap[roleId].topPerformers.push({
                userId: member.id,
                name: member.name,
                xp: userRole.xpInRole || 0,
                level: userRole.level,
                tasksCompleted: userRole.tasksCompleted || 0
              });
            }
          });
        }
      });

      // Finaliser les calculs
      Object.keys(statsMap).forEach(roleId => {
        const stat = statsMap[roleId];
        if (stat.totalUsers > 0) {
          stat.averageXp = Math.round(stat.totalXp / stat.totalUsers);
          stat.averageTasks = Math.round(stat.totalTasks / stat.totalUsers);
        }
        
        // Trier les top performers
        stat.topPerformers.sort((a, b) => b.xp - a.xp);
        stat.topPerformers = stat.topPerformers.slice(0, 3);
      });

      setRoleStats(Object.values(statsMap));
      setLoading(false);
    }, 500);
  };

  // Métriques globales
  const globalMetrics = {
    totalRoleAssignments: teamMembers.reduce((sum, member) => 
      sum + (member.synergiaRoles?.length || 0), 0
    ),
    averageRolesPerMember: teamMembers.length > 0 
      ? (teamMembers.reduce((sum, member) => sum + (member.synergiaRoles?.length || 0), 0) / teamMembers.length).toFixed(1)
      : 0,
    mostPopularRole: roleStats.length > 0 
      ? roleStats.reduce((max, role) => role.totalUsers > max.totalUsers ? role : max, roleStats[0])
      : null,
    totalRoleXp: roleStats.reduce((sum, role) => sum + role.totalXp, 0)
  };

  return (
    <div className="space-y-6">
      
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard des Rôles</h2>
          <p className="text-gray-400">Analyse des performances et de la répartition des rôles</p>
        </div>
        
        <button
          onClick={calculateRoleStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{globalMetrics.totalRoleAssignments}</p>
          <p className="text-gray-400 text-sm">Rôles assignés</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">{globalMetrics.averageRolesPerMember}</p>
          <p className="text-gray-400 text-sm">Rôles/membre</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <p className="text-lg font-bold text-white">
            {globalMetrics.mostPopularRole?.name.split(' ')[0] || 'N/A'}
          </p>
          <p className="text-gray-400 text-sm">Rôle populaire</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white">
            {globalMetrics.totalRoleXp.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">XP total</p>
        </div>
      </div>

      {/* Répartition des rôles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Répartition des Rôles
          </h3>
          
          <div className="space-y-3">
            {roleStats
              .filter(role => role.totalUsers > 0)
              .sort((a, b) => b.totalUsers - a.totalUsers)
              .map((role) => (
                <div key={role.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                    <span className="text-white">{role.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${role.color}`}
                        style={{ 
                          width: `${(role.totalUsers / Math.max(...roleStats.map(r => r.totalUsers))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-8 text-right">{role.totalUsers}</span>
                  </div>
                </div>
              ))}
          </div>
          
          {roleStats.filter(role => role.totalUsers > 0).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>Aucun rôle assigné pour le moment</p>
            </div>
          )}
        </div>

        {/* Performance par rôle */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Performance Moyenne
          </h3>
          
          <div className="space-y-4">
            {roleStats
              .filter(role => role.totalUsers > 0)
              .sort((a, b) => b.averageXp - a.averageXp)
              .slice(0, 5)
              .map((role) => (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{role.name}</span>
                    <span className="text-gray-400 text-sm">{role.totalUsers} utilisateur{role.totalUsers > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">XP moyen</span>
                        <span className="text-white">{role.averageXp || 0}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(((role.averageTasks || 0) / 50) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Performers par rôle */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Star className="w-6 h-6" />
          Top Performers par Rôle
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleStats
            .filter(role => role.topPerformers.length > 0)
            .slice(0, 6)
            .map((role) => (
              <div key={role.id} className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${role.color} flex items-center justify-center text-lg`}>
                    {role.icon}
                  </div>
                  <h4 className="text-white font-medium">{role.name}</h4>
                </div>
                
                <div className="space-y-2">
                  {role.topPerformers.map((performer, index) => (
                    <div key={performer.userId} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          'bg-orange-600 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white text-sm">{performer.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{performer.xp} XP</p>
                        <p className="text-gray-400 text-xs">{performer.tasksCompleted} tâches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
        
        {roleStats.filter(role => role.topPerformers.length > 0).length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>Aucune donnée de performance disponible</p>
          </div>
        )}
      </div>

      {/* Recommandations */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Recommandations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Rôles sous-représentés */}
          {(() => {
            const underrepresentedRoles = roleStats.filter(role => role.totalUsers === 0);
            if (underrepresentedRoles.length > 0) {
              return (
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <h4 className="text-yellow-400 font-medium mb-2">Rôles non assignés</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Ces rôles n'ont aucun membre assigné :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {underrepresentedRoles.slice(0, 3).map(role => (
                      <span key={role.id} className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full">
                        {role.name.split(' ')[0]}
                      </span>
                    ))}
                    {underrepresentedRoles.length > 3 && (
                      <span className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full">
                        +{underrepresentedRoles.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          })()}

          {/* Membres polyvalents */}
          {(() => {
            const versatileMembers = teamMembers.filter(member => 
              (member.synergiaRoles?.length || 0) >= 3
            );
            if (versatileMembers.length > 0) {
              return (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2">Membres polyvalents</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {versatileMembers.length} membre{versatileMembers.length > 1 ? 's' : ''} avec 3+ rôles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {versatileMembers.slice(0, 3).map(member => (
                      <span key={member.id} className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded-full">
                        {member.name} ({member.synergiaRoles.length})
                      </span>
                    ))}
                    {versatileMembers.length > 3 && (
                      <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded-full">
                        +{versatileMembers.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          })()}

          {/* Équipe équilibrée */}
          {roleStats.filter(role => role.totalUsers > 0).length >= 5 && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">Équipe bien équilibrée</h4>
              <p className="text-gray-300 text-sm">
                Votre équipe couvre {roleStats.filter(role => role.totalUsers > 0).length} rôles différents sur {Object.keys(SYNERGIA_ROLES).length} disponibles.
              </p>
            </div>
          )}

          {/* Besoin d'expansion */}
          {globalMetrics.totalRoleAssignments < teamMembers.length && (
            <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
              <h4 className="text-purple-400 font-medium mb-2">Potentiel d'expansion</h4>
              <p className="text-gray-300 text-sm">
                Certains membres n'ont aucun rôle assigné. Considérez leur assigner des responsabilités.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamRoleDashboard;white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(((role.averageXp || 0) / 3000) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Tâches</span>
                        <span className="text-white">{role.averageTasks || 0}</span>
                      </div>
                      <div className="w-full bg-
