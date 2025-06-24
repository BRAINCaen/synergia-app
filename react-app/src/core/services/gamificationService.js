// gamificationService.js - Version minimale pour corriger le build
class GamificationService {
  constructor() {
    this.listeners = new Map()
    this.cache = new Map()
  }

  // Données mock pour le développement
  getMockUserData() {
    return {
      xp: 240,
      level: 3,
      tasksCompleted: 12,
      projectsCompleted: 2,
      badges: ['first_task', 'streak_warrior'],
      currentStreak: 5,
      lastLoginDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // Initialiser les données utilisateur
  async initializeUserData(userId) {
    console.log('🔧 [MOCK] Initialisation gamification pour:', userId)
    return this.getMockUserData()
  }

  // Ajouter de l'XP
  async addXP(userId, amount, reason = 'Action') {
    console.log(`🎮 [MOCK] +${amount} XP pour ${reason}`)
    return { success: true, newLevel: false, addedXP: amount }
  }

  // Calculer le niveau basé sur l'XP
  calculateLevel(xp) {
    for (let level = 1; level <= 50; level++) {
      if (xp < Math.floor(100 * Math.pow(1.5, level - 1))) {
        return level - 1
      }
    }
    return 50
  }

  // Obtenir l'XP requis pour le prochain niveau
  getXPForNextLevel(currentLevel) {
    if (currentLevel >= 50) return 0
    return Math.floor(100 * Math.pow(1.5, currentLevel))
  }

  // Vérifier et débloquer de nouveaux badges
  async checkAndUnlockBadges(userId) {
    console.log('🏆 [MOCK] Vérification badges pour:', userId)
    return []
  }

  // Écouter les changements en temps réel
  subscribeToUserData(userId, callback) {
    console.log('👂 [MOCK] Abonnement aux données pour:', userId)
    // Mode mock - simuler des données
    callback(this.getMockUserData())
    return () => {}
  }

  // Nettoyer les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // Actions rapides pré-configurées
  async completeTask(userId, taskDifficulty = 'normal') {
    const xpRewards = {
      easy: 20,
      normal: 40,
      hard: 60,
      expert: 100
    }
    
    const xpReward = xpRewards[taskDifficulty] || 40
    return await this.addXP(userId, xpReward, `Tâche ${taskDifficulty} complétée`)
  }

  async dailyLogin(userId) {
    return await this.addXP(userId, 10, 'Connexion quotidienne')
  }
}

// Instance singleton
const gamificationService = new GamificationService()
export default gamificationService
