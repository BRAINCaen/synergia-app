import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('xp');
  const [leaderboardData, setLeaderboardData] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = {
        currentUser: {
          rank: 4,
          name: user?.displayName || 'Puck Time',
          xp: 2340,
          level: 6,
          tasksCompleted: 57,
          projectsCompleted: 2,
          streak: 8,
          badges: 12,
          avatar: user?.photoURL
        },
        rankings: {
          xp: [
            { id: '1', name: 'Alice Dubois', xp: 3450, level: 7, avatar: '👩‍💼', badge: '🥇', change: '+2' },
            { id: '2', name: 'Bob Martin', xp: 3120, level: 6, avatar: '👨‍💻', badge: '🥈', change: '0' },
            { id: '3', name: 'Claire Dupont', xp: 2890, level: 6, avatar: '👩‍🎨', badge: '🥉', change: '-1' },
            { id: '4', name: 'Puck Time', xp: 2340, level: 6, avatar: '👤', badge: '', change: '+1', isCurrentUser: true },
            { id: '5', name: 'David Chen', xp: 2180, level: 5, avatar: '👨‍🔬', badge: '', change: '-2' },
            { id: '6', name: 'Emma Wilson', xp: 1950, level: 5, avatar: '👩‍🏫', badge: '', change: '+3' },
            { id: '7', name: 'Frank Rodriguez', xp: 1820, level: 5, avatar: '👨‍🎯', badge: '', change: '0' },
            { id: '8', name: 'Grace Kim', xp: 1650, level: 4, avatar: '👩‍💻', badge: '', change: '+1' }
          ],
          tasks: [
            { id: '1', name: 'Bob Martin', tasksCompleted: 78, xp: 3120, avatar: '👨‍💻', badge: '🥇' },
            { id: '2', name: 'Alice Dubois', tasksCompleted: 72, xp: 3450, avatar: '👩‍💼', badge: '🥈' },
            { id: '3', name: 'Emma Wilson', tasksCompleted: 65, xp: 1950, avatar: '👩‍🏫', badge: '🥉' },
            { id: '4', name: 'Puck Time', tasksCompleted: 57, xp: 2340, avatar: '👤', badge: '', isCurrentUser: true },
            { id: '5', name: 'Claire Dupont', tasksCompleted: 54, xp: 2890, avatar: '👩‍🎨', badge: '' }
          ],
          projects: [
            { id: '1', name: 'Alice Dubois', projectsCompleted: 5, xp: 3450, avatar: '👩‍💼', badge: '🥇' },
            { id: '2', name: 'Frank Rodriguez', projectsCompleted: 4, xp: 1820, avatar: '👨‍🎯', badge: '🥈' },
            { id: '3', name: 'David Chen', projectsCompleted: 3, xp: 2180, avatar: '👨‍🔬', badge: '🥉' },
            { id: '4', name: 'Puck Time', projectsCompleted: 2, xp: 2340, avatar: '👤', badge: '', isCurrentUser: true }
          ],
          streak: [
            { id: '1', name: 'Grace Kim', streak: 28, xp: 1650, avatar: '👩‍💻', badge: '🥇' },
            { id: '2', name: 'David Chen', streak: 21, xp: 2180, avatar: '👨‍🔬', badge: '🥈' },
            { id: '3', name: 'Claire Dupont', streak: 15, xp: 2890, avatar: '👩‍🎨', badge: '🥉' },
            { id: '4', name: 'Puck Time', streak: 8, xp: 2340, avatar: '👤', badge: '', isCurrentUser: true }
          ]
        },
        competitions: [
          {
            id: '1',
            title: 'Défi Sprint Juin',
            description: 'Terminer 50 tâches avant la fin du mois',
            type: 'tasks',
            target: 50,
            current: 42,
            endDate: '2025-06-30',
            reward: '500 XP + Badge "Sprint Master"',
            participants: 12,
            status: 'active'
          },
          {
            id: '2',
            title: 'Marathon Productivité',
            description: 'Maintenir une streak de 30 jours',
            type: 'streak',
            target: 30,
            current: 8,
            endDate: '2025-07-15',
            reward: '1000 XP + Titre "Marathonien"',
            participants: 8,
            status: 'active'
          },
          {
            id: '3',
            title: 'Collaboration Champion',
            description: 'Participer à 3 projets d\'équipe',
            type: 'projects',
            target: 3,
            current: 2,
            endDate: '2025-07-01',
            reward: '750 XP + Badge "Team Player"',
            participants: 15,
            status: 'active'
          }
        ],
        achievements: [
          { name: 'First Steps', description: 'Première tâche terminée', icon: '👶', unlocked: true },
          { name: 'Speed Demon', description: '10 tâches en une journée', icon: '⚡', unlocked: true },
          { name: 'Team Player', description: 'Collaborer sur 5 projets', icon: '🤝', unlocked: true },
          { name: 'Perfectionist', description: '100% de tâches réussies', icon: '💯', unlocked: false },
          { name: 'Marathon Runner', description: 'Streak de 30 jours', icon: '🏃', unlocked: false },
          { name: 'Level Master', description: 'Atteindre le niveau 10', icon: '🏆', unlocked: false }
        ]
      };
      
      setLeaderboardData(mockData);
      setLoading(false);
    };

    loadLeaderboard();
  }, [selectedPeriod, selectedCategory, user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getChangeIndicator = (change) => {
    if (!change || change === '0') return <span className="text-gray-400">—</span>;
    const isPositive = change.startsWith('+');
    return (
      <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '↗' : '↘'} {change.replace(/[+-]/, '')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement du classement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRankings = leaderboardData.rankings[selectedCategory] || [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard Synergia</h1>
          <p className="text-gray-400">Compétitions, classements et défis d'équipe</p>
        </div>

        {/* Position actuelle de l'utilisateur */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {leaderboardData.currentUser.avatar ? (
                  <img src={leaderboardData.currentUser.avatar} alt="Avatar" className="w-full h-full rounded-full" />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{leaderboardData.currentUser.name}</h2>
                <p className="opacity-90">Position #{leaderboardData.currentUser.rank} • Niveau {leaderboardData.currentUser.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{leaderboardData.currentUser.xp.toLocaleString()} XP</p>
              <p className="opacity-90">{leaderboardData.currentUser.badges} badges</p>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Période :</span>
            {[
              { key: 'day', label: 'Aujourd\'hui' },
              { key: 'week', label: 'Cette semaine' },
              { key: 'month', label: 'Ce mois' },
              { key: 'all', label: 'Tout temps' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Catégorie :</span>
            {[
              { key: 'xp', label: '💎 XP', icon: '💎' },
              { key: 'tasks', label: '✅ Tâches', icon: '✅' },
              { key: 'projects', label: '📁 Projets', icon: '📁' },
              { key: 'streak', label: '🔥 Streak', icon: '🔥' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.icon} {category.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classement principal */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  🏆 Top Classement - {selectedCategory === 'xp' ? 'XP' : selectedCategory === 'tasks' ? 'Tâches' : selectedCategory === 'projects' ? 'Projets' : 'Streaks'}
                </h2>
              </div>
              <div className="divide-y divide-gray-700">
                {currentRankings.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-4 flex items-center space-x-4 hover:bg-gray-700 transition-colors ${
                      player.isCurrentUser ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    {/* Rang */}
                    <div className="w-12 text-center">
                      <span className="text-2xl">{getRankIcon(index + 1)}</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                      {player.avatar}
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${player.isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                          {player.name}
                        </h3>
                        {player.isCurrentUser && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Vous</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {selectedCategory === 'xp' && (
                          <>
                            <span>💎 {player.xp.toLocaleString()} XP</span>
                            <span>⭐ Niveau {player.level}</span>
                          </>
                        )}
                        {selectedCategory === 'tasks' && (
                          <>
                            <span>✅ {player.tasksCompleted} tâches</span>
                            <span>💎 {player.xp.toLocaleString()} XP</span>
                          </>
                        )}
                        {selectedCategory === 'projects' && (
                          <>
                            <span>📁 {player.projectsCompleted} projets</span>
                            <span>💎 {player.xp.toLocaleString()} XP</span>
                          </>
                        )}
                        {selectedCategory === 'streak' && (
                          <>
                            <span>🔥 {player.streak} jours</span>
                            <span>💎 {player.xp.toLocaleString()} XP</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Évolution */}
                    <div className="text-right">
                      {player.change && getChangeIndicator(player.change)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compétitions actives */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">🎯 Défis Actifs</h2>
              <div className="space-y-4">
                {leaderboardData.competitions.map(competition => (
                  <div key={competition.id} className="bg-gray-700 rounded-lg p-3">
                    <h3 className="text-white font-medium text-sm mb-2">{competition.title}</h3>
                    <p className="text-gray-400 text-xs mb-3">{competition.description}</p>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{competition.current}/{competition.target}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${(competition.current / competition.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{competition.participants} participants</span>
                      <span className="text-yellow-400">{competition.reward.split(' ')[0]} {competition.reward.split(' ')[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">🏅 Badges</h2>
              <div className="grid grid-cols-3 gap-2">
                {leaderboardData.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                        : 'bg-gray-700'
                    }`}
                    title={achievement.description}
                  >
                    <div className={`text-lg ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <div className={`text-xs mt-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats personnelles */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">📊 Vos Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">XP Total</span>
                  <span className="text-white font-medium">{leaderboardData.currentUser.xp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tâches</span>
                  <span className="text-white font-medium">{leaderboardData.currentUser.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projets</span>
                  <span className="text-white font-medium">{leaderboardData.currentUser.projectsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Streak</span>
                  <span className="text-white font-medium">{leaderboardData.currentUser.streak} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Badges</span>
                  <span className="text-white font-medium">{leaderboardData.currentUser.badges}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
