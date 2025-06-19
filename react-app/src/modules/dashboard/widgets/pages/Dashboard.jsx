import React, { useEffect } from 'react'
import { StatCard, Card } from '../../../shared/components/ui'
import useAuthStore from '../../../shared/stores/authStore'
import useUserStore from '../../../shared/stores/userStore'
import useNotificationStore from '../../../shared/stores/notificationStore'

const Dashboard = () => {
  const { user } = useAuthStore()
  const { stats, addXP, updateStreak } = useUserStore()
  const { dailyBonus } = useNotificationStore()

  // Bonus de connexion quotidienne
  useEffect(() => {
    const today = new Date().toDateString()
    const lastLogin = stats.lastLogin ? new Date(stats.lastLogin).toDateString() : null
    
    if (lastLogin !== today) {
      // Premier login du jour
      const bonusXP = 50
      addXP(bonusXP, 'daily_login')
      updateStreak(true)
      dailyBonus(bonusXP)
    }
  }, [addXP, updateStreak, dailyBonus, stats.lastLogin])

  const firstName = user?.displayName?.split(' ')[0] || 'Utilisateur'
  
  // Calcul du progrès vers le niveau suivant
  const xpProgress = {
    current: stats.xp,
    required: 1000,
    percentage: Math.round((stats.xp / 1000) * 100)
  }

  const statsData = [
    {
      title: 'Niveau',
      value: stats.level,
      icon: <span className="text-2xl">🎯</span>,
      color: 'primary',
      trend: stats.level > 1 ? { positive: true, value: 'Niveau supérieur !' } : null
    },
    {
      title: 'Expérience',
      value: `${stats.xp} / 1000 XP`,
      icon: <span className="text-2xl">⭐</span>,
      color: 'warning'
    },
    {
      title: 'Points',
      value: stats.points,
      icon: <span className="text-2xl">💎</span>,
      color: 'success'
    },
    {
      title: 'Badges',
      value: stats.badges.length,
      icon: <span className="text-2xl">🏆</span>,
      color: 'danger'
    }
  ]

  const quickActions = [
    {
      title: 'Pointer',
      description: 'Enregistrer votre arrivée',
      icon: '🕐',
      color: 'bg-blue-500',
      action: () => console.log('Pointage')
    },
    {
      title: 'Nouvelle tâche',
      description: 'Créer une nouvelle tâche',
      icon: '✅',
      color: 'bg-green-500',
      action: () => console.log('Nouvelle tâche')
    },
    {
      title: 'Mon équipe',
      description: 'Voir votre équipe',
      icon: '👥',
      color: 'bg-purple-500',
      action: () => console.log('Équipe')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bon retour, {firstName} ! 👋
            </h1>
            <p className="text-primary-100">
              Voici un aperçu de votre activité sur Synergia
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="text-right">
              <p className="text-primary-100 text-sm">Séquence de connexion</p>
              <p className="text-2xl font-bold">{stats.streak} jour{stats.streak > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Barre de progression XP */}
      <Card header="Progression vers le niveau suivant">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Niveau {stats.level}</span>
            <span>Niveau {stats.level + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {xpProgress.current} / {xpProgress.required} XP ({xpProgress.percentage}%)
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions rapides */}
        <Card header="Actions rapides">
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                onClick={action.action}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${action.color}`}>
                    <span className="text-xl">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activité récente */}
        <Card header="Activité récente">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Prêt à commencer !
            </h3>
            <p className="text-gray-600 mb-4">
              Votre activité apparaîtra ici une fois que vous commencerez à utiliser Synergia.
            </p>
            <p className="text-sm text-gray-500">
              Pointez, créez des tâches ou collaborez avec votre équipe pour voir vos statistiques !
            </p>
          </div>
        </Card>
      </div>

      {/* Badges récents */}
      {stats.badges.length > 0 && (
        <Card header="Vos derniers badges">
          <div className="flex flex-wrap gap-3">
            {stats.badges.slice(-5).map((badge, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-2"
              >
                <span className="text-lg">🏆</span>
                <span className="text-sm font-medium text-yellow-800">{badge.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
