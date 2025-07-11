// ==========================================
// 📁 react-app/src/components/roles/RoleProgressionDashboard.jsx
// DASHBOARD DE PROGRESSION DES RÔLES AVEC DÉVERROUILLAGES
// Interface complète pour voir et gérer la progression dans les rôles
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Target, 
  Crown, 
  Zap,
  ChevronRight,
  ChevronDown,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Gift,
  Sparkles,
  ArrowUp
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import roleUnlockService, { ROLE_UNLOCKS, ROLE_LEVELS, ROLE_EXCLUSIVE_BADGES } from '../../core/services/roleUnlockService.js';
import { SYNERGIA_ROLES } from '../../core/services/synergiaRolesService.js';

const RoleProgressionDashboard = ({ userId }) => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [progressionStats, setProgressionStats] = useState(null);
  const [userUnlocks, setUserUnlocks] = useState(null);
  const [nextUnlocks, setNextUnlocks] = useState({});

  // Données utilisateur simulées (à remplacer par Firebase)
  const userRoles = {
    maintenance: { xp: 750, level: 'APPRENTI' },
    reputation: { xp: 2200, level: 'COMPETENT' },
    content: { xp: 350, level: 'NOVICE' }
  };

  // Chargement des données
  useEffect(() => {
    if (user?.uid || userId) {
      loadProgressionData();
    }
  }, [user?.uid, userId]);

  const loadProgressionData = async () => {
    try {
      // Calculer les statistiques de progression
      const stats = roleUnlockService.getProgressionStats(userRoles);
      setProgressionStats(stats);

      // Obtenir les déverrouillages actuels
      const unlocks = roleUnlockService.getUserUnlocks(userRoles);
      setUserUnlocks(unlocks);

      // Obtenir les prochains déverrouillages
      const next = roleUnlockService.getNextUnlocks(userRoles);
      setNextUnlocks(next);

      console.log('📊 Données de progression chargées:', { stats, unlocks, next });
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
    }
  };

  const toggleRoleExpansion = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const selectRole = (roleId) => {
    setSelectedRole(selectedRole === roleId ? null : roleId);
  };

  const getRoleProgress = (roleId) => {
    const roleData = userRoles[roleId];
    if (!roleData) return { level: 'NOVICE', progress: 0, xp: 0 };

    const currentLevel = roleUnlockService.calculateRoleLevel(roleData.xp);
    const levelData = ROLE_LEVELS[currentLevel];
    
    if (!levelData) return { level: 'NOVICE', progress: 0, xp: roleData.xp };

    const progress = levelData.maxXp === Infinity 
      ? 100 
      : ((roleData.xp - levelData.minXp) / (levelData.maxXp - levelData.minXp)) * 100;

    return {
      level: currentLevel,
      progress: Math.min(progress, 100),
      xp: roleData.xp,
      nextLevelXp: levelData.maxXp === Infinity ? null : levelData.maxXp
    };
  };

  const renderLevelBadge = (level) => {
    const levelData = ROLE_LEVELS[level];
    if (!levelData) return null;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${levelData.color} bg-gray-800`}>
        <span className="text-sm">{levelData.icon}</span>
        {levelData.name}
      </div>
    );
  };

  const renderUnlocksList = (unlocks, type, icon) => {
    if (!unlocks || unlocks.length === 0) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-white font-medium">
          {icon}
          <span className="capitalize">{type}</span>
          <span className="text-gray-400 text-sm">({unlocks.length})</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {unlocks.map((unlock, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm capitalize">
                {unlock.id.replace(/_/g, ' ')}
              </span>
              {unlock.exclusive && (
                <Star className="w-3 h-3 text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNextUnlocks = (roleId) => {
    const next = nextUnlocks[roleId];
    if (!next) return null;

    return (
      <div className="mt-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-indigo-300 font-medium mb-3">
          <Gift className="w-4 h-4" />
          Prochains déverrouillages
          <span className="text-indigo-400">({next.xpNeeded} XP requis)</span>
        </div>

        <div className="space-y-3">
          {next.unlocks.badges && next.unlocks.badges.length > 0 && (
            <div>
              <h5 className="text-yellow-400 font-medium mb-2 flex items-center gap-1">
                <Award className="w-4 h-4" />
                Badges ({next.unlocks.badges.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {next.unlocks.badges.map((badgeId, index) => (
                  <span key={index} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                    {badgeId.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {next.unlocks.tasks && next.unlocks.tasks.length > 0 && (
            <div>
              <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Tâches ({next.unlocks.tasks.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {next.unlocks.tasks.map((taskId, index) => (
                  <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {taskId.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {next.unlocks.features && next.unlocks.features.length > 0 && (
            <div>
              <h5 className="text-purple-400 font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Fonctionnalités ({next.unlocks.features.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {next.unlocks.features.map((featureId, index) => (
                  <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                    {featureId.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!progressionStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de la progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques globales */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Progression des Rôles
          </h2>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progressionStats.totalXp.toLocaleString()} XP</div>
            <div className="text-indigo-300 text-sm">Total accumulé</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{progressionStats.totalRoles}</div>
            <div className="text-indigo-300 text-sm">Rôles actifs</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{userUnlocks?.badges?.length || 0}</div>
            <div className="text-indigo-300 text-sm">Badges débloqués</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userUnlocks?.tasks?.length || 0}</div>
            <div className="text-indigo-300 text-sm">Tâches disponibles</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{Math.round(progressionStats.completionPercentage)}%</div>
            <div className="text-indigo-300 text-sm">Progression globale</div>
          </div>
        </div>
      </div>

      {/* Liste des rôles avec progression */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Mes Rôles Actifs
        </h3>

        {Object.entries(userRoles).map(([roleId, roleData]) => {
          const roleInfo = SYNERGIA_ROLES[roleId.toUpperCase()];
          const progress = getRoleProgress(roleId);
          const isExpanded = expandedRoles[roleId];
          const isSelected = selectedRole === roleId;

          if (!roleInfo) return null;

          return (
            <div
              key={roleId}
              className={`bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* En-tête du rôle */}
              <div
                className={`p-6 cursor-pointer hover:bg-gray-700 transition-colors ${roleInfo.color.replace('bg-', 'border-l-4 border-')}`}
                onClick={() => selectRole(roleId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{roleInfo.icon}</div>
                    
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold text-lg">{roleInfo.name}</h4>
                      <p className="text-gray-400 text-sm">{roleInfo.description}</p>
                      <div className="flex items-center gap-2">
                        {renderLevelBadge(progress.level)}
                        <span className="text-gray-300 text-sm">{progress.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">{Math.round(progress.progress)}%</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRoleExpansion(roleId);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Détails étendus */}
              {isExpanded && (
                <div className="border-t border-gray-700 p-6 space-y-6">
                  {/* Déverrouillages actuels */}
                  <div className="space-y-4">
                    <h5 className="text-white font-medium flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-green-400" />
                      Contenu débloqué
                    </h5>

                    {userUnlocks && (
                      <div className="space-y-4">
                        {renderUnlocksList(
                          userUnlocks.badges.filter(b => b.role === roleId),
                          'badges',
                          <Award className="w-4 h-4 text-yellow-400" />
                        )}
                        
                        {renderUnlocksList(
                          userUnlocks.tasks.filter(t => t.role === roleId),
                          'tâches',
                          <Target className="w-4 h-4 text-blue-400" />
                        )}
                        
                        {renderUnlocksList(
                          userUnlocks.features.filter(f => f.role === roleId),
                          'fonctionnalités',
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prochains déverrouillages */}
                  {renderNextUnlocks(roleId)}

                  {/* Actions rapides */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Target className="w-4 h-4" />
                      Voir les tâches
                    </button>
                    
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" />
                      Galerie badges
                    </button>
                    
                    <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Statistiques
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rôles disponibles mais non assignés */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Autres Rôles Disponibles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(SYNERGIA_ROLES)
            .filter(([roleId]) => !userRoles[roleId.toLowerCase()])
            .map(([roleId, roleInfo]) => (
              <div
                key={roleId}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-600"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl opacity-60">{roleInfo.icon}</div>
                  <div>
                    <h4 className="text-white font-medium">{roleInfo.name}</h4>
                    <p className="text-gray-400 text-sm">{roleInfo.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Non assigné</span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Demander l'accès
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RoleProgressionDashboard;
