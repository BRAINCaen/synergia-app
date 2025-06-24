// Hook useGameService - Interface complète avec gamificationService
import { useState, useEffect, useCallback } from 'react'
import gamificationService from '../../core/services/gamificationService'

// Configuration locale (évite les problèmes d'import)
const XP_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: 10,
    TASK_COMPLETE_EASY: 20,
    TASK_COMPLETE_NORMAL: 40,
    TASK_COMPLETE_HARD: 60,
    TASK_COMPLETE_EXPERT: 100,
    PROJECT_COMPLETE: 200,
    BADGE_UNLOCK: 50
  },
  LEVEL_FORMULA: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
  MAX_LEVEL: 50
}

const BADGES_CONFIG = {
  FIRST_TASK: { 
    id: 'first_task', 
    name: 'Premier Pas', 
    description: 'Première tâche complétée',
    icon: '🎯'
  },
  TASK_MASTER: { 
    id: 'task_master', 
    name: 'Maître des Tâches', 
    description: '50 tâches complétées',
    icon: '🏆'
  },
  STREAK_WARRIOR: { 
    id: 'streak_warrior', 
    name: 'Guerrier de la Constance', 
    description: '7 jours consécutifs actif',
    icon: '🔥'
  },
  LEVEL_CHAMPION: { 
    id: 'level_champion', 
    name: 'Champion des Niveaux', 
    description: 'Atteindre le niveau 10',
    icon: '⭐'
  }
}

export const useGameService = (userId = 'demo-user') => {
  const [gameData, setGameData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialiser les données
  useEffect(() => {
    let unsubscribe = null

    const initializeGameData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialiser les données utilisateur
        const initialData = await gamificationService.initializeUserData(userId)
        setGameData(initialData)
        setIsConnected(true)

        // S'abonner aux mises à jour en temps réel
        unsubscribe = gamificationService.subscribeToUserData(userId, (data) => {
          setGameData(data)
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Erreur initialisation gamification:', err)
        setError(err.message)
        setIsLoading(false)
        
        // Fallback avec données mock
        setGameData(gamificationService.getMockUserData())
        setIsConnected(false)
      }
    }

    if (userId) {
      initializeGameData()
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  // Actions gamification
  const addXP = useCallback(async (amount, reason) => {
    try {
      const result = await gamificationService.addXP(userId, amount, reason)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [userId])

  const completeTask = useCallback(async (difficulty = 'normal') => {
    try {
      const result = await gamificationService.completeTask(userId, difficulty)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [userId])

  const dailyLogin = useCallback(async () => {
    try {
      const result = await gamificationService.dailyLogin(userId)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [userId])

  const unlockBadge = useCallback(async () => {
    try {
      const newBadges = await gamificationService.checkAndUnlockBadges(userId)
      return newBadges
    } catch (err) {
      setError(err.message)
      return []
    }
  }, [userId])

  // Calculs utiles
  const calculations = {
    // Calculer le niveau actuel
    getCurrentLevel: () => {
      if (!gameData) return 1
      return gameData.level || 1
    },

    // XP requis pour le prochain niveau
    getXPForNextLevel: () => {
      if (!gameData) return 100
      return gamificationService.getXPForNextLevel(gameData.level)
    },

    // Progression vers le prochain niveau (0-100%)
    getLevelProgress: () => {
