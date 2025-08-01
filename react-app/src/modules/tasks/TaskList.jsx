// ==========================================
// 📁 react-app/src/modules/tasks/TaskList.jsx
// LISTE DES TÂCHES - COMPOSANT PRINCIPAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  User,
  Calendar,
  Flag
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useTaskStore } from '../../shared/stores/taskStore.js';

const TaskList = () => {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'pending':
        return matchesSearch && task.status === 'pending';
      case 'in_progress':
        return matchesSearch && task.status === 'in_progress';
      case 'completed':
        return matchesSearch && task.status === 'completed';
      default:
        return matchesSearch;
    }
  });

  // Obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Liste des Tâches</h1>
              <p className="text-gray-600 mt-1">
                Gérez et suivez toutes vos tâches
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Tâche</span>
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Toutes', count: tasks.length },
                { key: 'pending', label: 'En attente', count: tasks.filter(t => t.status === 'pending').length },
                { key: 'in_progress', label: 'En cours', count: tasks.filter(t => t.status === 'in_progress').length },
                { key: 'completed', label: 'Terminées', count: tasks.filter(t => t.status === 'completed').length }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune tâche trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Aucune tâche ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre première tâche.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Créer ma première tâche
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  
                  {/* Contenu principal */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Haute' :
                         task.priority === 'medium' ? 'Moyenne' :
                         task.priority === 'low' ? 'Basse' : task.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {task.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Assigné à {task.assignedTo}</span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Échéance: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {task.xpReward && (
                        <div className="flex items-center space-x-1">
                          <Flag className="w-4 h-4" />
                          <span>{task.xpReward} XP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {/* TODO: Edit task */}}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Delete task */}}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;

// ==========================================
// 📁 react-app/src/components/gamification/BadgeCollection.jsx
// COLLECTION DE BADGES - COMPOSANT PRINCIPAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Crown, 
  Zap, 
  Shield, 
  Flame,
  Lock,
  Info
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../../shared/hooks/useUnifiedFirebaseData.js';

const BadgeCollection = () => {
  const { user } = useAuthStore();
  const { gamification, isLoading } = useUnifiedFirebaseData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Badges disponibles par catégorie
  const badgeCategories = {
    achievement: {
      name: 'Accomplissements',
      icon: Trophy,
      color: 'bg-yellow-500',
      badges: [
        { id: 'first_task', name: 'Premier Pas', description: 'Première tâche terminée', icon: '🎯', rarity: 'common', xp: 25 },
        { id: 'task_master', name: 'Maître des Tâches', description: '50 tâches terminées', icon: '🏆', rarity: 'rare', xp: 100 },
        { id: 'perfectionist', name: 'Perfectionniste', description: '10 tâches parfaites', icon: '⭐', rarity: 'epic', xp: 200 }
      ]
    },
    social: {
      name: 'Social',
      icon: Award,
      color: 'bg-blue-500',
      badges: [
        { id: 'team_player', name: 'Esprit d\'Équipe', description: 'Aidé 5 collègues', icon: '🤝', rarity: 'common', xp: 50 },
        { id: 'mentor', name: 'Mentor', description: 'Formé un nouveau membre', icon: '🎓', rarity: 'rare', xp: 150 },
        { id: 'leader', name: 'Leader', description: 'Dirigé un projet', icon: '👑', rarity: 'legendary', xp: 300 }
      ]
    },
    special: {
      name: 'Spéciaux',
      icon: Crown,
      color: 'bg-purple-500',
      badges: [
        { id: 'innovator', name: 'Innovateur', description: 'Proposé une amélioration', icon: '💡', rarity: 'rare', xp: 75 },
        { id: 'early_bird', name: 'Lève-tôt', description: 'Connecté avant 8h', icon: '🌅', rarity: 'common', xp: 25 },
        { id: 'night_owl', name: 'Couche-tard', description: 'Actif après 22h', icon: '🦉', rarity: 'common', xp: 25 }
      ]
    }
  };

  // Badges utilisateur
  const userBadges = gamification?.badges || [];
  
  // Fonction pour vérifier si un badge est débloqué
  const isBadgeUnlocked = (badgeId) => {
    return userBadges.some(badge => badge.badgeId === badgeId || badge.id === badgeId);
  };

  // Fonction pour obtenir la couleur de rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Tous les badges pour le filtre "all"
  const allBadges = Object.values(badgeCategories).flatMap(category => 
    category.badges.map(badge => ({ ...badge, category: category.name }))
  );

  // Badges filtrés
  const filteredBadges = selectedCategory === 'all' 
    ? allBadges 
    : badgeCategories[selectedCategory]?.badges || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Collection de Badges
          </h1>
          <p className="text-gray-600 mt-1">
            {userBadges.length} badges débloqués sur {allBadges.length} disponibles
          </p>
          
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progression de la collection</span>
              <span>{Math.round((userBadges.length / allBadges.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(userBadges.length / allBadges.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({allBadges.length})
            </button>
            
            {Object.entries(badgeCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name} ({category.badges.length})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const isUnlocked = isBadgeUnlocked(badge.id);
            
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  isUnlocked ? 'border-2 border-yellow-200' : 'opacity-60'
                }`}
              >
                <div className="text-center">
                  {/* Icône du badge */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
                    isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                  </div>
                  
                  {/* Nom du badge */}
                  <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  
                  {/* Rareté et XP */}
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity === 'common' ? 'Commun' :
                       badge.rarity === 'rare' ? 'Rare' :
                       badge.rarity === 'epic' ? 'Épique' :
                       badge.rarity === 'legendary' ? 'Légendaire' : badge.rarity}
                    </span>
                    
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>{badge.xp} XP</span>
                    </div>
                  </div>
                  
                  {/* Statut */}
                  <div className="mt-3">
                    {isUnlocked ? (
                      <span className="inline-flex items-center space-x-1 text-green-600 text-sm font-medium">
                        <Trophy className="w-4 h-4" />
                        <span>Débloqué</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-gray-500 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Verrouillé</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modal détail badge */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center text-3xl">
                {isBadgeUnlocked(selectedBadge.id) ? selectedBadge.icon : <Lock className="w-8 h-8 text-gray-400" />}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h2>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rareté:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRarityColor(selectedBadge.rarity)}`}>
                    {selectedBadge.rarity === 'common' ? 'Commun' :
                     selectedBadge.rarity === 'rare' ? 'Rare' :
                     selectedBadge.rarity === 'epic' ? 'Épique' :
                     selectedBadge.rarity === 'legendary' ? 'Légendaire' : selectedBadge.rarity}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Récompense XP:</span>
                  <span className="flex items-center space-x-1 text-sm font-medium text-yellow-600">
                    <Zap className="w-4 h-4" />
                    <span>{selectedBadge.xp} XP</span>
                  </span>
                </div>
                
                {selectedBadge.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Catégorie:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedBadge.category}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;

// ==========================================
// 📁 react-app/src/components/gamification/Leaderboard.jsx
// CLASSEMENT - COMPOSANT PRINCIPAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  User, 
  Star,
  Zap,
  Target,
  Award,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('xp');
  const [isLoading, setIsLoading] = useState(false);

  // Données simulées pour le leaderboard
  const [leaderboardData, setLeaderboardData] = useState([
    {
      id: 1,
      name: 'Admin Synergia',
      email: 'admin@synergia.com',
      avatar: null,
      xp: 2500,
      level: 15,
      tasksCompleted: 45,
      badges: 12,
      rank: 1,
      trend: 'up',
      weeklyXp: 350
    },
    {
      id: 2,
      name: 'Manager Test',
      email: 'manager@synergia.com',
      avatar: null,
      xp: 1800,
      level: 12,
      tasksCompleted: 32,
      badges: 8,
      rank: 2,
      trend: 'up',
      weeklyXp: 280
    },
    {
      id: 3,
      name: user?.displayName || user?.email?.split('@')[0] || 'Vous',
      email: user?.email || 'user@synergia.com',
      avatar: user?.photoURL,
      xp: 1200,
      level: 8,
      tasksCompleted: 24,
      badges: 6,
      rank: 3,
      trend: 'stable',
      weeklyXp: 180,
      isCurrentUser: true
    },
    {
      id: 4,
      name: 'Utilisateur Demo',
      email: 'demo@synergia.com',
      avatar: null,
      xp: 950,
      level: 6,
      tasksCompleted: 18,
      badges: 4,
      rank: 4,
      trend: 'down',
      weeklyXp: 120
    },
    {
      id: 5,
      name: 'Nouveau Membre',
      email: 'nouveau@synergia.com',
      avatar: null,
      xp: 300,
      level: 2,
      tasksCompleted: 8,
      badges: 2,
      rank: 5,
      trend: 'up',
      weeklyXp: 150
    }
  ]);

  // Fonction pour obtenir l'icône de rang
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  // Fonction pour obtenir la couleur de tendance
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <span className="w-4 h-4 flex items-center justify-center">—</span>;
  };

  // Rafraîchir les données
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-600" />
                Classement de l'Équipe
              </h1>
              <p className="text-gray-600 mt-1">
                Suivez les performances de votre équipe
              </p>
            </div>
            
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Filtre par période */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tout temps</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
              </select>
            </div>

            {/* Filtre par catégorie */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Critère de classement
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="xp">Points XP</option>
                <option value="tasks">Tâches terminées</option>
                <option value="badges">Badges obtenus</option>
                <option value="level">Niveau</option>
              </select>
            </div>
          </div>
        </div>

        {/* Podium (Top 3) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">🏆 Podium</h2>
          
          <div className="flex items-end justify-center space-x-8">
            {leaderboardData.slice(0, 3).map((player, index) => {
              const positions = [1, 0, 2]; // Ordre pour centrer la 1ère place
              const actualIndex = positions[index];
              const actualPlayer = leaderboardData[actualIndex];
              
              return (
                <div key={actualPlayer.id} className="text-center">
                  {/* Hauteur du podium */}
                  <div className={`
                    w-20 h-20 rounded-full bg-gradient-to-b flex items-center justify-center mb-4 mx-auto
                    ${actualPlayer.rank === 1 ? 'from-yellow-400 to-yellow-600' : 
                      actualPlayer.rank === 2 ? 'from-gray-300 to-gray-500' : 
                      'from-amber-400 to-amber-600'}
                  `}>
                    {actualPlayer.avatar ? (
                      <img 
                        src={actualPlayer.avatar} 
                        alt={actualPlayer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  {/* Position */}
                  <div className="mb-2">
                    {getRankIcon(actualPlayer.rank)}
                  </div>
                  
                  {/* Nom */}
                  <h3 className={`font-bold mb-1 ${actualPlayer.isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                    {actualPlayer.name}
                    {actualPlayer.isCurrentUser && <span className="text-xs ml-1">(Vous)</span>}
                  </h3>
                  
                  {/* Stats */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>{actualPlayer.xp} XP</span>
                    </div>
                    <div>Niveau {actualPlayer.level}</div>
                  </div>
                  
                  {/* Bloc du podium */}
                  <div className={`
                    w-24 mt-4 rounded-t-lg
                    ${actualPlayer.rank === 1 ? 'h-16 bg-yellow-200' : 
                      actualPlayer.rank === 2 ? 'h-12 bg-gray-200' : 
                      'h-8 bg-amber-200'}
                  `}>
                    <div className="pt-2 text-xs font-bold text-gray-700">
                      #{actualPlayer.rank}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classement complet */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Classement Complet</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((player) => (
              <div 
                key={player.id} 
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  player.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  
                  {/* Informations utilisateur */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {player.avatar ? (
                        <img 
                          src={player.avatar} 
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`font-semibold ${player.isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                        {player.name}
                        {player.isCurrentUser && <span className="text-sm ml-2 text-blue-500">(Vous)</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{player.email}</p>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center space-x-8 text-sm">
                    <div className="text-center">
                      <div className="flex items-center space-x-1 font-semibold text-gray-900">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>{player.xp}</span>
                      </div>
                      <div className="text-gray-600">XP</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{player.level}</div>
                      <div className="text-gray-600">Niveau</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{player.tasksCompleted}</div>
                      <div className="text-gray-600">Tâches</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{player.badges}</div>
                      <div className="text-gray-600">Badges</div>
                    </div>
                    
                    <div className={`text-center ${getTrendColor(player.trend)}`}>
                      <div className="flex items-center justify-center space-x-1">
                        {getTrendIcon(player.trend)}
                        <span className="font-semibold">{player.weeklyXp}</span>
                      </div>
                      <div className="text-gray-600">Cette semaine</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

// ==========================================
// 📁 react-app/src/modules/profile/components/Profile.jsx
// PROFIL UTILISATEUR - COMPOSANT PRINCIPAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Trophy, 
  Star, 
  Target,
  Zap,
  Award,
  Settings,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../../../shared/hooks/useUnifiedFirebaseData.js';

const Profile = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  const { gamification, isLoading } = useUnifiedFirebaseData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    department: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        department: user.department || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      department: user?.department || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Utilisateur non connecté</p>
        </div>
      </div>
    );
  }

  const userStats = {
    level: gamification?.level || 1,
    xp: gamification?.totalXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    badges: gamification?.badges?.length || 0,
    loginStreak: gamification?.loginStreak || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header du profil */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
                )}
              </div>
              
              {/* Informations de base */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.displayName || user.email?.split('@')[0] || 'Utilisateur'}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
                {user.department && (
                  <p className="text-gray-600 mt-1">{user.department}</p>
                )}
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Bouton d'édition */}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>

        {/* Statistiques de gamification */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Niveau</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.level}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">XP Total</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.xp}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tâches</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.tasksCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-semibold text-gray-900">{userStats.badges}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations Personnelles</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'affichage
                </label>
                <p className="text-gray-900">{user.displayName || 'Non renseigné'}</p>
              </div>
              
              {user.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
              
              {user.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département
                  </label>
                  <p className="text-gray-900">{user.department}</p>
                </div>
              )}
            </div>
          </div>

          {/* Badges récents */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Badges Récents</h2>
            
            {gamification?.badges && gamification.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {gamification.badges.slice(0, 4).map((badge, index) => (
                  <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-xs font-medium text-gray-700 capitalize">
                      {badge.name || badge.type?.replace('_', ' ') || 'Badge'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Aucun badge encore débloqué</p>
                <p className="text-gray-400 text-sm mt-1">Complétez des tâches pour débloquer vos premiers badges</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier le profil</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Modifier le Profil</h2>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Marketing, Développement..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
              
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
