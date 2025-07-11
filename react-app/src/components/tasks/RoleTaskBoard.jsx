// ==========================================
// 📁 react-app/src/components/tasks/RoleTaskBoard.jsx
// TABLEAU DE TÂCHES SPÉCIFIQUES PAR RÔLE - SPARKLES → STAR CORRIGÉ
// REMPLACER ENTIÈREMENT LE FICHIER EXISTANT
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
  Star as SparklesReplacement, // ✅ CORRIGÉ : Sparkles → Star (avec alias pour éviter conflit)
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
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger les données au montage
  useEffect(() => {
    loadRoleTaskData();
  }, [user, selectedRole]);

  /**
   * 📥 CHARGEMENT DES DONNÉES DE TÂCHES PAR RÔLE
   */
  const loadRoleTaskData = async () => {
    try {
      setLoading(true);

      // Charger les tâches disponibles pour l'utilisateur
      const tasks = await roleTaskManager.getAvailableTasksForUser(user?.uid);
      setAvailableTasks(tasks);

      // Charger les statistiques des tâches
      const stats = await roleTaskManager.getTaskStats(user?.uid);
      setTaskStats(stats);

      // Charger les recommandations
      const recs = await roleTaskManager.getRecommendedTasks(user?.uid);
      setRecommendations(recs);

      // Charger la progression utilisateur
      const progress = await roleUnlockService.getUserProgress(user?.uid);
      setUserProgress(progress);

      console.log('✅ Données tâches par rôle chargées');

    } catch (error) {
      console.error('❌ Erreur chargement tâches par rôle:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 COULEURS SELON DIFFICULTÉ
   */
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Facile': 'bg-green-500/20 text-green-300',
      'Moyen': 'bg-yellow-500/20 text-yellow-300',
      'Avancé': 'bg-orange-500/20 text-orange-300',
      'Expert': 'bg-red-500/20 text-red-300'
    };
    return colors[difficulty] || 'bg-gray-500/20 text-gray-300';
  };

  /**
   * 🎯 ICÔNE SELON CATÉGORIE
   */
  const getCategoryIcon = (category) => {
    const icons = {
      'Formation': <BookOpen className="w-3 h-3" />,
      'Technique': <Settings className="w-3 h-3" />,
      'Commercial': <Users className="w-3 h-3" />,
      'Créatif': <SparklesReplacement className="w-3 h-3" />, // ✅ CORRIGÉ : Sparkles → SparklesReplacement
      'Leadership': <Crown className="w-3 h-3" />,
      'Collaboration': <Users className="w-3 h-3" />
    };
    return icons[category] || <Target className="w-3 h-3" />;
  };

  /**
   * 🔒 VÉRIFIER SI TÂCHE DÉVERROUILLÉE
   */
  const isTaskUnlocked = (task) => {
    if (!task.prerequisites || task.prerequisites.length === 0) return true;
    
    return task.prerequisites.every(prereq => {
      if (prereq.type === 'task') {
        return userProgress.completedTasks?.includes(prereq.id);
      } else if (prereq.type === 'level') {
        return userProgress.level >= prereq.value;
      } else if (prereq.type === 'role') {
        return userProgress.roles?.includes(prereq.value);
      }
      return false;
    });
  };

  /**
   * ▶️ DÉMARRER UNE TÂCHE
   */
  const startTask = async (taskId) => {
    try {
      await roleTaskManager.startTask(user?.uid, taskId);
      await loadRoleTaskData(); // Recharger les données
      console.log('✅ Tâche démarrée:', taskId);
    } catch (error) {
      console.error('❌ Erreur démarrage tâche:', error);
    }
  };

  /**
   * ✅ COMPLÉTER UNE TÂCHE
   */
  const completeTask = async (taskId) => {
    try {
      await roleTaskManager.completeTask(user?.uid, taskId);
      await loadRoleTaskData(); // Recharger les données
      console.log('✅ Tâche complétée:', taskId);
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  };

  /**
   * 🎨 RENDU D'UNE CARTE DE TÂCHE
   */
  const renderTaskCard = (task) => {
    const isLocked = !isTaskUnlocked(task);
    const isCompleted = userProgress.completedTasks?.includes(task.id);
    const isInProgress = userProgress.activeTasks?.includes(task.id);

    return (
      <div
        key={task.id}
        className={`bg-gray-800 rounded-lg p-4 border transition-all duration-300 ${
          isLocked 
            ? 'border-gray-700 opacity-60' 
            : isCompleted
              ? 'border-green-500/50 bg-green-900/10'
              : isInProgress
                ? 'border-yellow-500/50 bg-yellow-900/10'
                : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        {/* En-tête de tâche */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            {isCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
            {isInProgress && <Play className="w-4 h-4 text-yellow-400" />}
            {!isLocked && !isCompleted && !isInProgress && (
              <Target className="w-4 h-4 text-blue-400" />
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">{task.xpReward}</span>
          </div>
        </div>

        {/* Contenu de la tâche */}
        <div className="space-y-2">
          <h4 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-white'}`}>
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

          {/* Prérequis manquants */}
          {isLocked && task.prerequisites && (
            <div className="mt-3 p-2 bg-gray-700/50 rounded">
              <h6 className="text-xs text-orange-400 mb-1">Prérequis:</h6>
              <div className="space-y-1">
                {task.prerequisites.map((prereq, idx) => (
                  <div key={idx} className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {prereq.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {!isLocked && !isCompleted && !isInProgress && (
            <button
              onClick={() => startTask(task.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3" />
              Démarrer
            </button>
          )}

          {isInProgress && (
            <button
              onClick={() => completeTask(task.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Terminer
            </button>
          )}

          {isCompleted && (
            <div className="flex-1 bg-green-500/20 text-green-300 px-3 py-2 rounded text-sm font-medium text-center">
              ✅ Complété
            </div>
          )}

          {isLocked && (
            <div className="flex-1 bg-gray-600/50 text-gray-400 px-3 py-2 rounded text-sm font-medium text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              Verrouillé
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * 🎯 RENDU D'UNE SECTION PAR RÔLE
   */
  const renderRoleSection = (roleKey, roleGroup) => {
    const role = SYNERGIA_ROLES[roleKey];
    if (!role) return null;

    const isExpanded = expandedRoles[roleKey] !== false; // Expansé par défaut
    const completedCount = roleGroup.filter(task => 
      userProgress.completedTasks?.includes(task.id)
    ).length;

    return (
      <div key={roleKey} className="bg-gray-800 rounded-lg overflow-hidden">
        {/* En-tête de rôle */}
        <button
          onClick={() => setExpandedRoles(prev => ({
            ...prev,
            [roleKey]: !isExpanded
          }))}
          className="w-full p-4 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{role.icon}</span>
            <div className="text-left">
              <h3 className="text-white font-semibold">{role.name}</h3>
              <p className="text-gray-400 text-sm">{roleGroup.length} tâches • {completedCount} complétées</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-gray-400">
              {Math.round((completedCount / roleGroup.length) * 100)}% complété
            </div>
            {isExpanded ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </div>
        </button>

        {/* Contenu du rôle */}
        {isExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleGroup.map(renderTaskCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filtrage des tâches
  const filteredTasks = availableTasks.filter(task => {
    if (selectedRole && task.role !== selectedRole) return false;
    if (activeFilter !== 'all') {
      if (activeFilter === 'unlocked' && !isTaskUnlocked(task)) return false;
      if (activeFilter === 'locked' && isTaskUnlocked(task)) return false;
      if (activeFilter === 'completed' && !userProgress.completedTasks?.includes(task.id)) return false;
      if (activeFilter === 'progress' && !userProgress.activeTasks?.includes(task.id)) return false;
    }
    if (selectedDifficulty !== 'all' && task.difficulty !== selectedDifficulty) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Groupement par rôle
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const roleKey = task.role || 'general';
    if (!acc[roleKey]) acc[roleKey] = [];
    acc[roleKey].push(task);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement des tâches par rôle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      {!compact && (
        <div className="space-y-4">
          {/* Titre et statistiques */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Tâches par Rôle</h2>
              <p className="text-gray-400">
                Développez vos compétences avec des tâches spécialisées
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {userProgress.completedTasks?.length || 0}/{availableTasks.length}
              </div>
              <div className="text-sm text-gray-400">Tâches complétées</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            {/* Filtre par statut */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">Toutes les tâches</option>
              <option value="unlocked">Déverrouillées</option>
              <option value="locked">Verrouillées</option>
              <option value="progress">En cours</option>
              <option value="completed">Complétées</option>
            </select>

            {/* Filtre par difficulté */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">Toutes difficultés</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Avancé">Avancé</option>
              <option value="Expert">Expert</option>
            </select>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded pl-10 pr-3 py-2 text-white text-sm w-64"
              />
            </div>
          </div>
        </div>
      )}

      {/* Liste des tâches groupées par rôle */}
      <div className="space-y-4">
        {Object.keys(groupedTasks).length === 0 ? (
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
