import { useState, useEffect, useCallback } from 'react'
import gamificationService from '../../core/services/gamificationService'

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

  useEffect(() => {
    let unsubscribe = null

    const initializeGameData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const initialData = await gamificationService.initializeUserData(userId)
        setGameData(initialData)
        setIsConnected(true)

        unsubscribe = gamificationService.subscribeToUserData(userId, (data) => {
          setGameData(data)
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Erreur initialisation gamification:', err)
        setError(err.message)
        setIsLoading(false)
        
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

  const calculations = {
    getCurrentLevel: () => {
      if (!gameData) return 1
      return gameData.level || 1
    },

    getXPForNextLevel: () => {
      if (!gameData) return 100
      return gamificationService.getXPForNextLevel(gameData.level)
    },

    getLevelProgress: () => {
      if (!gameData) return 0
      const currentLevel = gameData.level
      const currentXP = gameData.xp
      const xpForCurrentLevel = currentLevel > 1 ? XP_CONFIG.LEVEL_FORMULA(currentLevel) : 0
      const xpForNextLevel = XP_CONFIG.LEVEL_FORMULA(currentLevel + 1)
      const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
      return Math.max(0, Math.min(100, progress))
    },

    getUnlockedBadges: () => {
      if (!gameData || !gameData.badges) return []
      return gameData.badges.map(badgeId => BADGES_CONFIG[badgeId.toUpperCase()] || { id: badgeId, name: badgeId, icon: '🎖️' })
    },

    getAvailableBadges: () => {
      if (!gameData) return []
      const unlockedBadges = gameData.badges || []
      return Object.values(BADGES_CONFIG).filter(badge => !unlockedBadges.includes(badge.id))
    },

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

  const quickActions = {
    completeEasyTask: () => completeTask('easy'),
    completeNormalTask: () => completeTask('normal'),
    completeHardTask: () => completeTask('hard'),
    completeExpertTask: () => completeTask('expert'),

    addBonusXP: (amount) => addXP(amount, 'Bonus'),
    addDailyBonus: () => addXP(XP_CONFIG.REWARDS.DAILY_LOGIN, 'Bonus quotidien'),

    simulateLevelUp: async () => {
      const currentLevel = gameData?.level || 1
      const xpNeeded = gamificationService.getXPForNextLevel(currentLevel) - (gameData?.xp || 0)
      return await addXP(xpNeeded + 10, 'Simulation level up')
    }
  }

  return {
    gameData,
    isLoading,
    error,
    isConnected,
    addXP,
    completeTask,
    dailyLogin,
    unlockBadge,
    quickActions,
    calculations,
    config: {
      XP_CONFIG,
      BADGES_CONFIG
    }
  }
}
