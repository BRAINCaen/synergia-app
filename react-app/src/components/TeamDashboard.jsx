// TeamDashboard.jsx - Dashboard équipe collaborative avec imports corrigés
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// 🔧 CORRECTION : Chemin correct vers LoadingSpinner
import LoadingSpinner from './ui/LoadingSpinner'

const TeamDashboard = () => {
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data pour la démonstration
  useEffect(() => {
    const loadTeamData = async () => {
      // Simulation de chargement
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTeamData({
        members: [
          {
            id: 1,
            name: 'Alice Martin',
            role: 'Chef de Projet',
            level: 8,
            xp: 1250,
            tasksCompleted: 45,
            avatar: '👩‍💼',
            status: 'online'
          },
          {
            id: 2,
            name: 'Bob Dupont',
            role: 'Développeur',
            level: 6,
            xp: 890,
            tasksCompleted: 32,
            avatar: '👨‍💻',
            status: 'online'
          },
          {
            id: 3,
            name: 'Claire Durand',
            role: 'Designer',
            level: 7,
            xp: 1100,
            tasksCompleted: 38,
            avatar: '👩‍🎨',
            status: 'away'
          },
          {
            id: 4,
            name: 'David Chen',
            role: 'Analyste',
            level: 5,
            xp: 720,
            tasksCompleted: 28,
            avatar: '👨‍📊',
            status: 'offline'
          }
        ],
        stats: {
          totalMembers: 4,
          activeMembers: 2,
          totalXP: 3960,
          totalTasks: 143,
          avgLevel: 6.5
        }
      })
      
      setLoading(false)
    }

    loadTeamData()
  }, [])

  if (loading) {
    return <LoadingSpinner size="large" text="Chargement des données équipe..." />
  }

  const sortedMembers = teamData.members.sort((a, b) => b.xp - a.xp)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Dashboard Équipe</h1>
          <p className="text-gray-400">Collaboration et performance collective</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            {teamData.stats.activeMembers} membres actifs
          </div>
        </div>
      </div>

      {/* Statistiques équipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Membres Total</p>
              <p className="text-2xl font-bold text-white">{teamData.stats.totalMembers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">XP Total Équipe</p>
              <p className="text-2xl font-bold text-white">{teamData.stats.totalXP.toLocaleString()}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tâches Complétées</p>
              <p className="text-2xl font-bold text-white">{teamData.stats.totalTasks}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Niveau Moyen</p>
              <p className="text-2xl font-bold text-white">{teamData.stats.avgLevel}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Leaderboard équipe */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          🏆 Classement Équipe
        </h3>
        
        <div className="space-y-4">
          {sortedMembers.map((member, index) => (
            <div 
              key={member.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-yellow-900/20 border border-yellow-600/30' :
                index === 1 ? 'bg-gray-700/50 border border-gray-600' :
                index === 2 ? 'bg-orange-900/20 border border-orange-600/30' :
                'bg-gray-700 border border-gray-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  {index === 0 && <span className="text-2xl">🥇</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-3xl">{member.avatar}</span>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      member.status === 'online' ? 'bg-green-500' :
                      member.status === 'away' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-white font-medium">Niveau {member.level}</p>
                  <p className="text-gray-400 text-sm">{member.xp} XP</p>
                </div>
                
                <div>
                  <p className="text-white font-medium">{member.tasksCompleted}</p>
                  <p className="text-gray-400 text-sm">tâches</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions équipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎯 Actions Rapides</h3>
          <div className="space-y-3">
            <Link 
              to="/projects"
              className="block bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📋 Projets Collaboratifs</span>
                <span>→</span>
              </div>
            </Link>
            
            <Link 
              to="/analytics"
              className="block bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>📊 Analytics Équipe</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🔔 Notifications</h3>
          <div className="space-y-3">
            <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
              <p className="text-blue-400 text-sm">📝 3 nouvelles tâches assignées</p>
            </div>
            <div className="bg-green-900/20 border border-green-600/30 p-3 rounded-lg">
              <p className="text-green-400 text-sm">🎉 Alice a atteint le niveau 8 !</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 p-3 rounded-lg">
              <p className="text-purple-400 text-sm">🏆 Nouvel objectif équipe débloqué</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamDashboard
