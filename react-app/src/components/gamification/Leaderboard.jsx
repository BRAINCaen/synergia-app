// src/components/gamification/Leaderboard.jsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const [categoryFilter, setCategoryFilter] = useState('xp'); // xp, tasks, badges

  // Données mock pour démonstration (à remplacer par vraies données Firebase)
  const mockLeaderboardData = [
    {
      rank: 1,
      uid: 'user1',
      displayName: 'Marie Dupont',
      photoURL: null,
      department: 'Développement',
      totalXp: 2850,
      level: 12,
      badges: 15,
      tasksCompleted: 127,
      loginStreak: 23,
      weeklyXp: 340,
      monthlyXp: 1450
    },
    {
      rank: 2,
      uid: 'user2',
      displayName: 'Jean Martin',
      photoURL: null,
      department: 'Design',
      totalXp: 2640,
      level: 11,
      badges: 12,
      tasksCompleted: 98,
      loginStreak: 15,
      weeklyXp: 280,
      monthlyXp: 1200
    },
    {
      rank: 3,
      uid: 'user3',
      displayName: 'Sophie Bernard',
      photoURL: null,
      department: 'Marketing',
      totalXp: 2380,
      level: 10,
      badges: 18,
      tasksCompleted: 156,
      loginStreak: 31,
      weeklyXp: 420,
      monthlyXp: 1380
    },
    {
      rank: 4,
      uid: 'user4',
      displayName: 'Thomas Petit',
      photoURL: null,
      department: 'Développement',
      totalXp: 2180,
      level: 9,
      badges: 8,
      tasksCompleted: 89,
      loginStreak: 12,
      weeklyXp: 180,
      monthlyXp: 980
    },
    {
      rank: 5,
      uid: 'user5',
      displayName: 'Amélie Rousseau',
      photoURL: null,
      department: 'Ressources Humaines',
      totalXp: 1950,
      level: 8,
      badges: 11,
      tasksCompleted: 134,
      loginStreak: 7,
      weeklyXp: 220,
      monthlyXp: 1100
    }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setLoading(true);
    setTimeout(() => {
      setLeaderboardData(mockLeaderboardData);
      setLoading(false);
    }, 1000);
  }, [timeFilter, categoryFilter]);

  // Obtenir la valeur affichée selon le filtre
  const getDisplayValue = (userData) => {
    switch (categoryFilter) {
      case 'xp':
        return timeFilter === 'week' ? userData.weeklyXp : 
               timeFilter === 'month' ? userData.monthlyXp : 
               userData.totalXp;
      case 'tasks':
        return userData.tasksCompleted;
      case 'badges':
        return userData.badges;
      default:
        return userData.totalXp;
    }
  };

  // Obtenir le label de la métrique
  const getMetricLabel = () => {
    switch (categoryFilter) {
      case 'xp':
        return timeFilter === 'week' ? 'XP cette semaine' : 
               timeFilter === 'month' ? 'XP ce mois' : 
               'XP Total';
      case 'tasks':
        return 'Tâches complétées';
      case 'badges':
        return 'Badges obtenus';
      default:
        return 'XP Total';
    }
  };

  // Obtenir l'icône du rang
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // Obtenir la couleur du rang
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Chargement du classement...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header avec filtres */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🏆 Classement Synergia
              </h2>
              <p className="text-gray-400">Découvrez les top performers de l'équipe</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                to="/badges"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                🏅 Mes Badges
              </Link>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre période */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Période</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🏆 Tout temps</option>
                <option value="month">📅 Ce mois</option>
                <option value="week">📊 Cette semaine</option>
              </select>
            </div>

            {/* Filtre catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Classé par</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="xp">⭐ Points d'expérience</option>
                <option value="tasks">✅ Tâches complétées</option>
                <option value="badges">🏅 Badges obtenus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboardData.slice(0, 3).map((userData, index) => (
            <div key={userData.uid} className={`
              bg-gray-800 rounded-xl border p-6 text-center relative overflow-hidden
              ${index === 0 ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-gray-800' :
                index === 1 ? 'border-gray-400 bg-gradient-to-br from-gray-700/20 to-gray-800' :
                'border-orange-500 bg-gradient-to-br from-orange-900/20 to-gray-800'}
            `}>
              {/* Badge de rang */}
              <div className="absolute top-4 right-4 text-2xl">
                {getRankIcon(userData.rank)}
              </div>

              {/* Avatar */}
              <div className="mb-4">
                <img
                  src={userData.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${userData.displayName}`}
                  alt={userData.displayName}
                  className={`w-16 h-16 rounded-full mx-auto border-4 ${
                    index === 0 ? 'border-yellow-400' :
                    index === 1 ? 'border-gray-300' :
                    'border-orange-400'
                  }`}
                />
              </div>

              {/* Infos utilisateur */}
              <h3 className="text-lg font-bold text-white mb-1">{userData.displayName}</h3>
              <p className="text-sm text-gray-400 mb-3">{userData.department}</p>

              {/* Métrique principale */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${getRankColor(userData.rank)}`}>
                  {getDisplayValue(userData).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">{getMetricLabel()}</div>
              </div>

              {/* Stats secondaires */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-purple-400 font-medium">Niv. {userData.level}</div>
                  <div className="text-gray-500">Niveau</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">{userData.loginStreak}</div>
                  <div className="text-gray-500">Jours streak</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Classement complet */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Classement complet</h3>
          </div>

          <div className="divide-y divide-gray-700">
            {leaderboardData.map((userData) => (
              <div key={userData.uid} className={`
                p-4 hover:bg-gray-700/50 transition-colors
                ${userData.uid === user?.uid ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rang */}
                    <div className={`text-xl font-bold w-8 text-center ${getRankColor(userData.rank)}`}>
                      {getRankIcon(userData.rank)}
                    </div>

                    {/* Avatar et infos */}
                    <div className="flex items-center gap-3">
                      <img
                        src={userData.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${userData.displayName}`}
                        alt={userData.displayName}
                        className="w-10 h-10 rounded-full border-2 border-gray-600"
                      />
                      <div>
                        <div className={`font-medium ${userData.uid === user?.uid ? 'text-blue-400' : 'text-white'}`}>
                          {userData.displayName}
                          {userData.uid === user?.uid && <span className="ml-2 text-xs text-blue-400">(Vous)</span>}
                        </div>
                        <div className="text-sm text-gray-400">{userData.department}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-yellow-400 font-medium">{getDisplayValue(userData).toLocaleString()}</div>
                      <div className="text-gray-500">{getMetricLabel()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-medium">Niv. {userData.level}</div>
                      <div className="text-gray-500">Niveau</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-medium">{userData.badges}</div>
                      <div className="text-gray-500">Badges</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message motivationnel */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎯</span>
            <div>
              <h4 className="text-blue-400 font-semibold text-lg">Continuez vos efforts !</h4>
              <p className="text-blue-200">
                Complétez vos tâches, gagnez de l'XP et grimpez dans le classement. 
                Chaque action compte pour améliorer votre rang !
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
