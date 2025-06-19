import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GAMIFICATION, USER_ROLES } from '../../core/constants'

const useUserStore = create(
  persist(
    (set, get) => ({
      // État utilisateur étendu
      profile: null,
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          desktop: true
        },
        dashboard: {
          layout: 'grid',
          widgets: ['stats', 'tasks', 'team']
        }
      },
      stats: {
        level: 1,
        xp: 0,
        totalXP: 0,
        points: 0,
        badges: [],
        achievements: [],
        streak: 0,
        lastLogin: null
      },
      gameData: {
        dailyQuests: [],
        weeklyQuests: [],
        completedQuests: [],
        inventory: [],
        coins: 0
      },

      // Actions de base
      setProfile: (profile) => set({ profile }),
      
      updateProfile: (updates) => set(state => ({
        profile: { ...state.profile, ...updates }
      })),

      updatePreferences: (newPreferences) => set(state => ({
        preferences: { ...state.preferences, ...newPreferences }
      })),

      updateNotificationSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          notifications: { ...state.preferences.notifications, ...settings }
        }
      })),

      updateDashboardSettings: (settings) => set(state => ({
        preferences: {
          ...state.preferences,
          dashboard: { ...state.preferences.dashboard, ...settings }
        }
      })),

      // Actions de gamification
      updateStats: (newStats) => set(state => ({
        stats: { ...state.stats, ...newStats }
      })),

      addXP: (xp, source = 'unknown') => set(state => {
        const newTotalXP = state.stats.totalXP + xp
        const newXP = state.stats.xp + xp
        const currentLevel = state.stats.level
        
        // Calculer le nouveau niveau
        let newLevel = currentLevel
        let remainingXP = newXP
        
        while (remainingXP >= GAMIFICATION.XP_PER_LEVEL && newLevel < GAMIFICATION.MAX_LEVEL) {
          remainingXP -= GAMIFICATION.XP_PER_LEVEL
          newLevel++
        }
        
        const leveledUp = newLevel > currentLevel
        
        return {
          stats: {
            ...state.stats,
            xp: remainingXP,
            totalXP: newTotalXP,
            level: newLevel
          },
          // Si level up, on pourrait ajouter une notification
          ...(leveledUp && { levelUpNotification: { oldLevel: currentLevel, newLevel } })
        }
      }),

      addPoints: (points, source = 'unknown') => set(state => ({
        stats: {
          ...state.stats,
          points: state.stats.points + points
        }
      })),

      addBadge: (badge) => set(state => {
        const existingBadge = state.stats.badges.find(b => b.id === badge.id)
        if (existingBadge) return state // Badge déjà obtenu
        
        return {
          stats: {
            ...state.stats,
            badges: [...state.stats.badges, { ...badge, earnedAt: new Date().toISOString() }]
          }
        }
      }),

      addAchievement: (achievement) => set(state => {
        const existingAchievement = state.stats.achievements.find(a => a.id === achievement.id)
        if (existingAchievement) return state
        
        return {
          stats: {
            ...state.stats,
            achievements: [...state.stats.achievements, { ...achievement, unlockedAt: new Date().toISOString() }]
          }
        }
      }),

      updateStreak: (increment = true) => set(state => ({
        stats: {
          ...state.stats,
          streak: increment ? state.stats.streak + 1 : 0,
          lastLogin: new Date().toISOString()
        }
      })),

      // Actions de quêtes et jeu
      addCoins: (amount) => set(state => ({
        gameData: {
          ...state.gameData,
          coins: state.gameData.coins + amount
        }
      })),

      spendCoins: (amount) => set(state => {
        const newAmount = Math.max(0, state.gameData.coins - amount)
        return {
          gameData: {
            ...state.gameData,
            coins: newAmount
          }
        }
      }),

      completeQuest: (questId, reward) => set(state => {
        const newCompletedQuests = [...state.gameData.completedQuests, {
          questId,
          completedAt: new Date().toISOString(),
          reward
        }]

        // Retirer la quête des quêtes actives
        const newDailyQuests = state.gameData.dailyQuests.filter(q => q.id !== questId)
        const newWeeklyQuests = state.gameData.weeklyQuests.filter(q => q.id !== questId)

        return {
          gameData: {
            ...state.gameData,
            dailyQuests: newDailyQuests,
            weeklyQuests: newWeeklyQuests,
            completedQuests: newCompletedQuests,
            coins: state.gameData.coins + (reward.coins || 0)
          },
          stats: {
            ...state.stats,
            xp: state.stats.xp + (reward.xp || 0),
            totalXP: state.stats.totalXP + (reward.xp || 0),
            points: state.stats.points + (reward.points || 0)
          }
        }
      }),

      addItemToInventory: (item) => set(state => ({
        gameData: {
          ...state.gameData,
          inventory: [...state.gameData.inventory, { ...item, acquiredAt: new Date().toISOString() }]
        }
      })),

      useInventoryItem: (itemId) => set(state => ({
        gameData: {
          ...state.gameData,
          inventory: state.gameData.inventory.filter(item => item.id !== itemId)
        }
      })),

      // Getters utiles
      getters: {
        isAdmin: () => get().profile?.role === USER_ROLES.ADMIN,
        isManager: () => [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(get().profile?.role),
        getProgressToNextLevel: () => {
          const stats = get().stats
          return {
            current: stats.xp,
            required: GAMIFICATION.XP_PER_LEVEL,
            percentage: Math.round((stats.xp / GAMIFICATION.XP_PER_LEVEL) * 100)
          }
        },
        getTotalBadges: () => get().stats.badges.length,
        getActiveQuests: () => {
          const gameData = get().gameData
          return [...gameData.dailyQuests, ...gameData.weeklyQuests]
        },
        getCompletedQuestsToday: () => {
          const today = new Date().toDateString()
          return get().gameData.completedQuests.filter(quest => 
            new Date(quest.completedAt).toDateString() === today
          )
        }
      },

      // Actions de réinitialisation
      resetDailyProgress: () => set(state => ({
        gameData: {
          ...state.gameData,
          dailyQuests: [], // Les nouvelles quêtes seront ajoutées par le système
          completedQuests: state.gameData.completedQuests.filter(quest => {
            const questDate = new Date(quest.completedAt)
            const today = new Date()
            return questDate.toDateString() !== today.toDateString()
          })
        }
      })),

      resetWeeklyProgress: () => set(state => ({
        gameData: {
          ...state.gameData,
          weeklyQuests: [] // Les nouvelles quêtes seront ajoutées par le système
        }
      })),

      // Reset complet du store
      reset: () => set({
        profile: null,
        preferences: {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            desktop: true
          },
          dashboard: {
            layout: 'grid',
            widgets: ['stats', 'tasks', 'team']
          }
        },
        stats: {
          level: 1,
          xp: 0,
          totalXP: 0,
          points: 0,
          badges: [],
          achievements: [],
          streak: 0,
          lastLogin: null
        },
        gameData: {
          dailyQuests: [],
          weeklyQuests: [],
          completedQuests: [],
          inventory: [],
          coins: 0
        }
      })
    }),
    {
      name: 'user-storage',
      version: 1
    }
  )
)

export default useUserStore
