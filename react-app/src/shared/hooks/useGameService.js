// Hook useGameService - Interface complète avec gamificationService
import { useState, useEffect, useCallback } from 'react'
import gamificationService, { XP_CONFIG, BADGES_CONFIG } from '../../core/services/gamificationService'

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
      if (!gameData) return 0
      const currentLevel = gameData.level
      const currentXP = gameData.xp
      const xpForCurrentLevel = currentLevel > 1 ? XP_CONFIG.LEVEL_FORMULA(currentLevel) : 0
      const xpForNextLevel = XP_CONFIG.LEVEL_FORMULA(currentLevel + 1)
      const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
      return Math.max(0, Math.min(100, progress))
    },

    // Badges débloqués avec leurs infos
    getUnlockedBadges: () => {
      if (!gameData || !gameData.badges) return []
      return gameData.badges.map(badgeId => BADGES_CONFIG[badgeId.toUpperCase()] || { id: badgeId, name: badgeId, icon: '🎖️' })
    },

    // Badges disponibles à débloquer
    getAvailableBadges: () => {
      if (!gameData) return []
      const unlockedBadges = gameData.badges || []
      return Object.values(BADGES_CONFIG).filter(badge => !unlockedBadges.includes(badge.id))
    },

    // Statistiques générales
    getStats: () => {
      if (!gameData) return {}
      return {
        totalXP: gameData.xp || 0,
        level: gameData.level || 1,
        tasksCompleted: gameData.tasksCompleted || 0,
        projectsCompleted: gameData.projectsCompleted || 0,
        badgesCount: (gameData.badges || []).length,
        currentStreak: gameData.currentStreak || 0
      }
    }
  }

  // Actions rapides pré-configurées
  const quickActions = {
    // Simuler différents types de tâches
    completeEasyTask: () => completeTask('easy'),
    completeNormalTask: () => completeTask('normal'),
    completeHardTask: () => completeTask('hard'),
    completeExpertTask: () => completeTask('expert'),

    // Actions directes d'XP
    addBonusXP: (amount) => addXP(amount, 'Bonus'),
    addDailyBonus: () => addXP(XP_CONFIG.REWARDS.DAILY_LOGIN, 'Bonus quotidien'),

    // Simuler événements
    simulateLevelUp: async () => {
      const currentLevel = gameData?.level || 1
      const xpNeeded = gamificationService.getXPForNextLevel(currentLevel) - (gameData?.xp || 0)
      return await addXP(xpNeeded + 10, 'Simulation level up')
    }
  }

  return {
    // État des données
    gameData,
    isLoading,
    error,
    isConnected,

    // Actions principales
    addXP,
    completeTask,
    dailyLogin,
    unlockBadge,

    // Actions rapides
    quickActions,

    // Calculs et utilitaires
    calculations,

    // Configuration
    config: {
      XP_CONFIG,
      BADGES_CONFIG
    }
  }
}
