import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockProfileData = {
        user: {
          id: user?.uid,
          name: user?.displayName || 'Puck Time',
          email: user?.email || 'alan.boehme61@gmail.com',
          avatar: user?.photoURL,
          title: 'Développeur Senior',
          department: 'Équipe Technique',
          joinDate: '2024-03-15',
          bio: 'Passionné de développement et de gamification. Toujours prêt à relever de nouveaux défis !',
          location: 'Bayeux, France',
          timezone: 'Europe/Paris'
        },
        stats: {
          level: 6,
          currentXp: 2340,
          nextLevelXp: 3000,
          totalXp: 12450,
          tasksCompleted: 157,
          projectsCompleted: 8,
          collaborations: 24,
          streak: 8,
          badges: 12,
          hoursWorked: 456,
          avgTasksPerDay: 3.2,
          efficiency: 87
        },
        badges: [
          { id: 1, name: 'First Steps', description: 'Première tâche terminée', icon: '👶', category: 'milestone', unlocked: true, unlockedAt: '2024-03-16' },
          { id: 2, name: 'Speed Demon', description: '10 tâches en une journée', icon: '⚡', category: 'performance', unlocked: true, unlockedAt: '2024-04-02' },
          { id: 3, name: 'Team Player', description: 'Collaborer sur 5 projets', icon: '🤝', category: 'collaboration', unlocked: true, unlockedAt: '2024-04-15' },
          { id: 4, name: 'Streak Master', description: 'Streak de 7 jours', icon: '🔥', category: 'consistency', unlocked: true, unlockedAt: '2024-05-01' },
          { id: 5, name: 'XP Hunter', description: 'Gagner 1000 XP', icon: '💎', category: 'milestone', unlocked: true, unlockedAt: '2024-05-10' },
          { id: 6, name: 'Project Master', description: 'Terminer 5 projets', icon: '📁', category: 'achievement', unlocked: true, unlockedAt: '2024-05-25' },
          { id: 7, name: 'Night Owl', description: 'Travailler après 22h', icon: '🦉', category: 'special', unlocked: true, unlockedAt: '2024-06-01' },
          { id: 8, name: 'Early Bird', description: 'Première tâche avant 7h', icon: '🐦', category: 'special', unlocked: true, unlockedAt: '2024-06-05' },
          { id: 9, name: 'Perfectionist', description: '100% de tâches réussies', icon: '💯', category: 'performance', unlocked: false },
          { id: 10, name: 'Marathon Runner', description: 'Streak de 30 jours', icon: '🏃', category: 'consistency', unlocked: false },
          { id: 11, name: 'Level Master', description: 'Atteindre le niveau 10', icon: '🏆', category: 'milestone', unlocked: false },
          { id: 12, name: 'Innovator', description: 'Proposer 10 idées', icon: '💡', category: 'creativity', unlocked: false }
        ],
        recentActivity: [
          { type: 'task_completed', title: 'Intégrer système notifications', xp: 60, date: '2025-06-24', icon: '✅' },
          { type: 'badge_earned', title: 'Badge "Early Bird" débloqué', xp: 50, date: '2025-06-23', icon: '🏅' },
          { type: 'level_up', title: 'Niveau 6 atteint !', xp: 100, date: '2025-06-22', icon: '⭐' },
          { type: 'project_completed', title: 'Migration Base de Données terminée', xp: 200, date: '2025-06-20', icon: '📁' },
          { type: 'collaboration', title: 'Rejoint l\'équipe Synergia v4.0', xp: 25, date: '2025-06-19', icon: '🤝' }
        ],
        skills: [
          { name: 'React', level: 85, category: 'Frontend' },
          { name: 'Node.js', level: 78, category: 'Backend' },
          { name: 'Firebase', level: 92, category: 'Database' },
          { name: 'Leadership', level: 67, category: 'Soft Skills' },
          { name: 'Problem Solving', level: 89, category: 'Soft Skills' },
          { name: 'Communication', level: 73, category: 'Soft Skills' }
        ],
        goals: [
          { id: 1, title: 'Atteindre niveau 7', progress: 78, target: '2025-07-01', category: 'level' },
          { id: 2, title: 'Streak de 15 jours', progress: 53, target: '2025-06-30', category: 'consistency' },
          { id: 3, title: 'Terminer 200 tâches', progress: 78, target: '2025-08-01', category: 'tasks' },
          { id: 4, title: 'Participer à 10 projets', progress: 80, target: '2025-12-31', category: 'collaboration' }
        ]
      };
      
      setProfileData(mockProfileData);
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const getBadgesByCategory = (category) => {
    return profileData?.badges.filter(badge => badge.category === category) || [];
  };

  const getActivityIcon = (type) => {
    const icons = {
      task_completed: '✅',
      badge_earned: '🏅',
      level_up: '⭐',
      project_completed: '📁',
      collaboration: '🤝'
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header profil */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {profileData.user.avatar ? (
                  <img src={profileData.user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-black">
                {profileData.stats.level}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{profileData.user.name}</h1>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>
              <p className="text-lg opacity-90 mb-1">{profileData.user.title}</p>
              <p className="opacity-75 mb-3">{profileData.user.department} • {profileData.user.location}</p>
              <p className="text-sm opacity-90">{profileData.user.bio}</p>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{profileData.stats.level}</p>
                <p className="text-sm opacity-75">Niveau</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.currentXp}</p>
                <p className="text-sm opacity-75">XP</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.badges}</p>
                <p className="text-sm opacity-75">Badges</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profileData.stats.streak}</p>
                <p className="text-sm opacity-75">Streak</p>
              </div>
            </div>
          </div>

          {/* Barre de progression niveau */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progression vers niveau {profileData.stats.level + 1}</span>
              <span>{profileData.stats.currentXp} / {profileData.stats.nextLevelXp} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(profileData.stats.currentXp / profileData.stats.nextLevelXp) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { key: 'badges', label: 'Badges', icon: '🏅' },
            { key: 'activity', label: 'Activité', icon: '📈' },
            { key: 'skills', label: 'Compétences', icon: '🎯' },
            { key: 'goals', label: 'Objectifs', icon: '🎯' },
            { key: 'settings', label: 'Paramètres', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        <div className="space-y-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Statistiques détaillées */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">📊 Statistiques</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{profileData.stats.tasksCompleted}</p>
                      <p className="text-gray-400 text-sm">Tâches terminées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{profileData.stats.projectsCompleted}</p>
                      <p className="text-gray-400 text-sm">Projets terminés</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{profileData.stats.collaborations}</p>
                      <p className="text-gray-400 text-sm">Collaborations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">{profileData.stats.efficiency}%</p>
                      <p className="text-gray-400 text-sm">Efficacité</p>
                    </div>
                  </div>
                </div>

                {/* Badges récents */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">🏅 Derniers Badges</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {profileData.badges.filter(badge => badge.unlocked).slice(-8).map(badge => (
                      <div
                        key={badge.id}
                        className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-lg text-center"
                        title={badge.description}
                      >
                        <div className="text-2xl text-white mb-1">{badge.icon}</div>
                        <div className="text-xs text-white font-medium">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">👤 Informations</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{profileData.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Membre depuis</span>
                      <span className="text-white">{new Date(profileData.user.joinDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fuseau horaire</span>
                      <span className="text-white">{profileData.user.timezone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP Total</span>
                      <span className="text-white">{profileData.stats.totalXp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">⚡ Actions</h2>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      📊 Voir Analytics
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      🏆 Voir Classement
                    </button>
                    <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      📁 Mes Projets
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">🏅 Collection de Badges</h2>
                
                {['milestone', 'performance', 'collaboration', 'consistency', 'special', 'creativity'].map(category => (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-medium text-white mb-4 capitalize">
                      {category === 'milestone' ? '🎯 Étapes' :
                       category === 'performance' ? '⚡ Performance' :
                       category === 'collaboration' ? '🤝 Collaboration' :
                       category === 'consistency' ? '🔥 Régularité' :
                       category === 'special' ? '⭐ Spéciaux' : '💡 Créativité'}
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {getBadgesByCategory(category).map(badge => (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-lg text-center transition-all ${
                            badge.unlocked
                              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:scale-105'
                              : 'bg-gray-700 opacity-50'
                          }`}
                          title={badge.description}
                        >
                          <div className={`text-3xl mb-2 ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                            {badge.icon}
                          </div>
                          <div className={`text-xs font-medium ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                            {badge.name}
                          </div>
                          {badge.unlocked && badge.unlockedAt && (
                            <div className="text-xs text-white/75 mt-1">
                              {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activité */}
          {activeTab === 'activity' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">📈 Activité Récente</h2>
              <div className="space-y-4">
                {profileData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{activity.title}</h3>
                      <p className="text-gray-400 text-sm">{new Date(activity.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-medium">+{activity.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compétences */}
          {activeTab === 'skills' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">🎯 Compétences</h2>
              <div className="space-y-4">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-32">
                      <h3 className="text-white font-medium">{skill.name}</h3>
                      <p className="text-gray-400 text-sm">{skill.category}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Niveau</span>
                        <span className="text-sm text-white">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectifs */}
          {activeTab === 'goals' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">🎯 Objectifs Personnels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.goals.map(goal => (
                  <div key={goal.id} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">{goal.title}</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Objectif : {goal.target}</span>
                      <span className="text-gray-400">{goal.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">⚙️ Paramètres</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Notifications XP et badges</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Rappels de tâches</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-gray-300">Notifications d'équipe</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Confidentialité</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Profil visible dans le leaderboard</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Partager les statistiques</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-3">
                    Sauvegarder
                  </button>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
