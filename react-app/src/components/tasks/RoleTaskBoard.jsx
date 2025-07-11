// ==========================================
// 📁 react-app/src/components/tasks/RoleTaskBoard.jsx
// TABLEAU DE TÂCHES SPÉCIFIQUES PAR RÔLE AVEC DÉVERROUILLAGE VISUEL
// Interface gamifiée pour explorer et compléter les tâches par rôle
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Star, 
  Clock, 
  Trophy, 
  Target, 
  CheckCircle, 
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Award,
  Zap,
  TrendingUp,
  Users,
  BookOpen,
  Settings,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Flame,
  Crown,
  Gift
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import roleTaskManager, { ROLE_SPECIFIC_TASKS } from '../../core/services/roleTaskManager.js';
import roleUnlockService from '../../core/services/roleUnlockService.js';
import { SYNERGIA_ROLES } from '../../core/services/synergiaRolesService.js';

const RoleTaskBoard = ({ selectedRole = null, compact = false }) => {
  const { user } = useAuthStore();
  
  // États du composant
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRoles, setExpandedRoles] = useState({});
  const [availableTasks, setAvailableTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Données utilisateur simulées (à remplacer par Firebase)
  const userRoles = {
    maintenance: { xp: 750, level: 'APPRENTI' },
    reputation: { xp: 2200, level: 'COMPETENT' },
    content: { xp: 350, level: 'NOVICE' },
    organization: { xp: 1800, level: 'COMPETENT' }
  };

  // Chargement des données
  useEffect(() => {
    if (user?.uid) {
      loadTaskData();
    }
  }, [user?.uid, selectedRole]);

  const loadTaskData = async () => {
    try {
      setLoadingTasks(true);
      
      // Obtenir les tâches disponibles
      const tasks = roleTaskManager.getAvailableTasksForUser(userRoles);
      setAvailableTasks(tasks);

      // Obtenir les recommandations
      const recs = roleTaskManager.getTaskRecommendations(userRoles, selectedRole);
      setRecommendations(recs);

      // Charger les stats pour chaque rôle
      const stats = {};
      for (const roleId of Object.keys(userRoles)) {
        const roleStats = await roleTaskManager.getRoleTaskStats(user.uid, roleId);
        if (roleStats.success) {
          stats[roleId] = roleStats.stats;
        }
      }
      setTaskStats(stats);

      console.log('📊 Données tâches chargées:', { tasks: tasks.length, stats, recs });
      
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Filtrage des tâches
  const filteredTasks = availableTasks.filter(task => {
    // Filtre par rôle sélectionné
    if (selectedRole && task.roleId !== selectedRole) return false;
    
    // Filtre par statut
    if (activeFilter === 'unlocked' && !task.isUnlocked) return false;
    if (activeFilter === 'locked' && task.isUnlocked) return false;
    
    // Filtre par difficulté
    if (selectedDifficulty !== 'all' && task.difficulty !== selectedDifficulty) return false;
    
    // Recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.category.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Groupement des tâches par rôle et niveau
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const key = `${task.roleId}_${task.roleLevel}`;
    if (!groups[key]) {
      groups[key] = {
        roleId: task.roleId,
        roleLevel: task.roleLevel,
        tasks: []
      };
    }
    groups[key].tasks.push(task);
    return groups;
  }, {});

  const toggleRoleExpansion = (roleKey) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleKey]: !prev[roleKey]
    }));
  };

  const handleStartTask = async (task) => {
    try {
      console.log('🚀 Démarrage tâche:', task.title);
      
      // Créer une instance de tâche
      const result = await roleTaskManager.createTaskInstance(user.uid, task);
      
      if (result.success) {
        // Déclencher notification
        if (window.showToast) {
          window.showToast(`Tâche démarrée: ${task.title}`, 'success');
        }
        
        // Recharger les données
        await loadTaskData();
      }
      
    } catch (error) {
      console.error('❌ Erreur démarrage tâche:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-400 bg-green-500/20';
      case 'Moyen': return 'text-yellow-400 bg-yellow-500/20';
      case 'Difficile': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'repair': return <Settings className="w-4 h-4" />;
      case 'inspection': return <Search className="w-4 h-4" />;
      case 'planning': return <Calendar className="w-4 h-4" />;
      case 'design': return <Sparkles className="w-4 h-4" />;
      case 'mentoring': return <Users className="w-4 h-4" />;
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const renderTaskCard = (task, index) => {
    const roleInfo = SYNERGIA_ROLES[task.roleId.toUpperCase()];
    const isLocked = !task.isUnlocked;
    
    return (
      <div
        key={`${task.id}_${index}`}
        className={`relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
          isLocked ? 'opacity-60' : 'hover:shadow-xl hover:shadow-blue-500/20'
        }`}
      >
        {/* Badge de statut */}
        <div className="absolute top-3 right-3 z-10">
          {isLocked ? (
            <div className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Verrouillé
            </div>
          ) : (
            <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Unlock className="w-3 h-3" />
              Disponible
            </div>
          )}
        </div>

        {/* En-tête de la carte */}
        <div className={`p-4 border-l-4 ${roleInfo?.color?.replace('bg-', 'border-') || 'border-gray-500'}`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{roleInfo?.icon || '📋'}</div>
            
            <div className="flex-1 space-y-2">
              <h4 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                {task.title}
              </h4>
              
              <p className={`text-sm ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}>
                {task.description}
              </p>

              {/* Métadonnées de la tâche */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
                
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                  {getCategoryIcon(task.category)}
                  {task.category}
                </span>
                
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimatedTime}min
                </span>
                
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {task.xpReward} XP
                </span>
              </div>

              {/* Compétences requises */}
              {task.skills && task.skills.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-xs text-gray-400 mb-1">Compétences:</h6>
                  <div className="flex flex-wrap gap-1">
                    {task.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                      >
                        {skill.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Livrables attendus */}
              {task.deliverables && task.deliverables.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-xs text-gray-400 mb-1">Livrables:</h6>
                  <div className="space-y-1">
                    {task.deliverables.map((deliverable, idx) => (
                      <div key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {deliverable.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Étapes de la tâche */}
              {task.steps && task.steps.length > 0 && !isLocked && (
                <div className="mt-3">
                  <h6 className="text-xs text-gray-400 mb-1">Étapes:</h6>
                  <div className="space-y-1">
                    {task.steps.slice(0, 3).map((step, idx) => (
                      <div key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        {step}
                      </div>
                    ))}
                    {task.steps.length > 3 && (
                      <div className="text-xs text-gray-400">
                        ... et {task.steps.length - 3} étapes de plus
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-750 border-t border-gray-700">
          {isLocked ? (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Déverrouillez cette tâche en progressant dans le rôle
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Crown className="w-3 h-3" />
                Niveau {task.roleLevel} requis
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleStartTask(task)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Démarrer la tâche
              </button>
              
              {task.recurring && (
                <div className="flex items-center justify-center gap-2 text-xs text-orange-400">
                  <RotateCcw className="w-3 h-3" />
                  Tâche récurrente ({task.recurring})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Effet de verrouillage */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-medium">Niveau {task.roleLevel} requis</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRoleSection = (roleKey, roleGroup) => {
    const roleInfo = SYNERGIA_ROLES[roleGroup.roleId.toUpperCase()];
    const isExpanded = expandedRoles[roleKey];
    const unlockedCount = roleGroup.tasks.filter(t => t.isUnlocked).length;
    const totalCount = roleGroup.tasks.length;
    
    return (
      <div key={roleKey} className="space-y-4">
        {/* En-tête du rôle */}
        <div
          className={`bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors border-l-4 ${
            roleInfo?.color?.replace('bg-', 'border-') || 'border-gray-500'
          }`}
          onClick={() => toggleRoleExpansion(roleKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{roleInfo?.icon || '📋'}</div>
              <div>
                <h3 className="text-white font-semibold">{roleInfo?.name || roleGroup.roleId}</h3>
                <p className="text-gray-400 text-sm">
                  Niveau {roleGroup.roleLevel} • {unlockedCount}/{totalCount} tâches disponibles
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-300">{totalCount} tâches</div>
                <div className="text-xs text-gray-400">
                  {Math.round((unlockedCount / totalCount) * 100)}% débloqué
                </div>
              </div>
              
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Contenu étendu */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleGroup.tasks.map((task, index) => renderTaskCard(task, index))}
          </div>
        )}
      </div>
    );
  };

  if (loadingTasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      {!compact && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-400" />
              Tâches par Rôle
            </h2>
            
            <div className="flex items-center gap-4 text-white">
              <div className="text-center">
                <div className="text-xl font-bold">{filteredTasks.filter(t => t.isUnlocked).length}</div>
                <div className="text-xs text-blue-300">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{filteredTasks.filter(t => !t.isUnlocked).length}</div>
                <div className="text-xs text-purple-300">Verrouillées</div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['all', 'unlocked', 'locked'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-white text-blue-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {filter === 'all' ? 'Toutes' : 
                   filter === 'unlocked' ? 'Disponibles' : 'Verrouillées'}
                </button>
              ))}
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Toutes difficultés</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg pl-10 pr-4 py-1 text-sm w-64"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recommandations rapides */}
      {recommendations.length > 0 && !compact && (
        <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Recommandations pour progresser
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => {
              const roleInfo = SYNERGIA_ROLES[rec.roleId.toUpperCase()];
              return (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{roleInfo?.icon}</span>
                    <span className="text-white font-medium">{roleInfo?.name}</span>
                  </div>
                  <p className="text-orange-200 text-sm mb-3">{rec.priorityMessage}</p>
                  <div className="space-y-1">
                    {rec.recommendedTasks.slice(0, 2).map((task, idx) => (
                      <div key={idx} className="text-xs text-orange-100 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {task.title} ({task.xpReward} XP)
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste des tâches groupées */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-400">
              {searchTerm || selectedDifficulty !== 'all' || activeFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Aucune tâche disponible pour vos rôles actuels'}
            </p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([roleKey, roleGroup]) => 
            renderRoleSection(roleKey, roleGroup)
          )
        )}
      </div>
    </div>
  );
};

export default RoleTaskBoard;
