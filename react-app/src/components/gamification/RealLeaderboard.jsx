import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import userService from '../../core/services/userService.js';

const RealLeaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('totalXp');

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Options pour le leaderboard
    const options = {
      orderField: `gamification.${categoryFilter}`,
      limitCount: 50,
      department: departmentFilter !== 'all' ? departmentFilter : null
    };

    // Écouter les changements en temps réel
    const unsubscribe = userService.getLeaderboard((data) => {
      setLeaderboard(data);
      setLoading(false);
    }, options);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, categoryFilter, departmentFilter]);

  const getDisplayValue = (userData) => {
    switch (categoryFilter) {
      case 'weeklyXp':
        return `${userData.weeklyXp} XP`;
      case 'monthlyXp':
        return `${userData.monthlyXp} XP`;
      case 'badges':
        return `${userData.badges} badges`;
      case 'tasksCompleted':
        return `${userData.tasksCompleted} tâches`;
      case 'loginStreak':
        return `${userData.loginStreak} jours`;
      default:
        return `${userData.totalXp} XP`;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const departments = ['all', 'Développement', 'Design', 'Marketing', 'RH'];
  const categories = [
    { value: 'totalXp', label: 'XP Total' },
    { value: 'weeklyXp', label: 'XP Semaine' },
    { value: 'monthlyXp', label: 'XP Mois' },
    { value: 'badges', label: 'Badges' },
    { value: 'tasksCompleted', label: 'Tâches' },
    { value: 'loginStreak', label: 'Connexions' }
  ];

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Département
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Tous les départements</option>
              {departments.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-400">
              <strong>{leaderboard.length}</strong> participants
            </div>
          </div>
        </div>
      </div>

      {/* Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {leaderboard.slice(0, 3).map((userData, index) => (
            <div
              key={userData.uid}
              className={`
                text-center p-4 rounded-lg border relative
                ${index === 0 ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/20 border-yellow-500' :
                  index === 1 ? 'bg-gradient-to-b from-gray-400/20 to-gray-500/20 border-gray-400' :
                  'bg-gradient-to-b from-orange-500/20 to-orange-600/20 border-orange-500'}
              `}
            >
              <div className="text-3xl mb-2">{getRankIcon(userData.rank)}</div>
              <div className="w-16 h-16 rounded-full bg-gray-600 mx-auto mb-3 flex items-center justify-center">
                {userData.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt={userData.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm truncate">
                {userData.displayName}
              </h3>
              <p className="text-xs text-gray-400 mb-2">{userData.department}</p>
              <p className="font-bold text-lg text-white">
                {getDisplayValue(userData)}
              </p>
              <p className="text-xs text-gray-400">Niveau {userData.level}</p>
            </div>
          ))}
        </div>
      )}

      {/* Liste complète */}
      <div className="space-y-2">
        {leaderboard.map((userData) => (
          <div
            key={userData.uid}
            className={`
              flex items-center p-4 rounded-lg border transition-colors
              ${userData.uid === user?.uid 
                ? 'bg-blue-600/20 border-blue-500' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              }
            `}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 text-center mr-4">
                <span className="text-lg font-bold text-gray-300">
                  {getRankIcon(userData.rank)}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-600 mr-4 flex-shrink-0 flex items-center justify-center">
                {userData.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt={userData.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white truncate">
                    {userData.displayName}
                    {userData.uid === user?.uid && (
                      <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                        Vous
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  {userData.department} • Niveau {userData.level}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white">
                {getDisplayValue(userData)}
              </div>
              <div className="text-sm text-gray-400">
                {userData.badges} badges
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Aucun participant trouvé
          </h3>
          <p className="text-gray-400">
            Commencez à utiliser l'application pour apparaître dans le classement !
          </p>
        </div>
      )}
    </div>
  );
};

export default RealLeaderboard;
