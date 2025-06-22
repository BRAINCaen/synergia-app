import React from 'react'
import { useAuthStore } from '../../../shared/stores/authStore.js'
import { Card } from '../../../shared/components/ui/Card.jsx'

export default function WelcomeWidget() {
  const { user } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {getGreeting()}, {getDisplayName()} ! 👋
          </h2>
          <p className="text-blue-100">
            Prêt à atteindre vos objectifs aujourd'hui ?
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Niveau</div>
          <div className="text-3xl font-bold">1</div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm text-blue-100 mb-2">
          <span>Progression</span>
          <span>0 / 100 XP</span>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-2">
          <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>
    </Card>
  )
}
