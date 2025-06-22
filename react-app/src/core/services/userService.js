import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { USER_LEVELS, XP_REWARDS } from '../constants.js'

class UserService {
  static async createUserProfile(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid)
      const defaultProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName || userData.email,
        photoURL: userData.photoURL || null,
        profile: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          department: userData.department || ''
        },
        gamification: {
          xp: 0,
          totalXp: 0,
          level: 1,
          badges: [],
          tasksCompleted: 0,
          loginStreak: 0
        },
        stats: {
          tasksCompleted: 0,
          projectsCreated: 0,
          helpProvided: 0,
          loginCount: 0,
          badgesEarned: 0,
          lastActionAt: new Date()
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        updatedAt: new Date(),
        ...userData
      }
      
      await setDoc(userRef, defaultProfile)
      return { data: defaultProfile, error: null }
    } catch (error) {
      console.error('Erreur création profil utilisateur:', error)
      return { data: null, error: error.message }
    }
  }

  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return { data: userSnap.data(), error: null }
      }
      return { data: null, error: 'Profil utilisateur introuvable' }
    } catch (error) {
      console.error('Erreur récupération profil utilisateur:', error)
      return { data: null, error: error.message }
    }
  }

  static async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid)
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      
      await updateDoc(userRef, updateData)
      return { success: true, error: null }
    } catch (error) {
      console.error('Erreur mise à jour profil utilisateur:', error)
      return { success: false, error: error.message }
    }
  }

  static async addXP(uid, xpAmount) {
    try {
      const userResult = await this.getUserProfile(uid)
      if (userResult.error) return userResult

      const userProfile = userResult.data
      const currentXP = userProfile.gamification?.xp || 0
      const currentTotalXP = userProfile.gamification?.totalXp || 0
      const newXP = currentXP + xpAmount
      const newTotalXP = currentTotalXP + xpAmount
      const newLevel = this.calculateLevel(newTotalXP)
      const levelUp = newLevel > (userProfile.gamification?.level || 1)

      const updateResult = await this.updateUserProfile(uid, {
        'gamification.xp': newXP,
        'gamification.totalXp': newTotalXP,
        'gamification.level': newLevel
      })

      if (updateResult.error) return updateResult

      return { 
        success: true,
        newXP, 
        newTotalXP,
        newLevel, 
        levelUp,
        error: null
      }
    } catch (error) {
      console.error('Erreur ajout XP:', error)
      return { success: false, error: error.message }
    }
  }

  static calculateLevel(totalXp) {
    for (const [level, data] of Object.entries(USER_LEVELS)) {
      if (totalXp >= data.min && totalXp <= data.max) {
        return parseInt(level)
      }
    }
    return 1
  }

  static async updateLastLogin(uid) {
    try {
      const updateResult = await this.updateUserProfile(uid, {
        lastLogin: new Date(),
        'stats.loginCount': increment(1)
      })
      
      if (!updateResult.error) {
        // Ajouter XP pour connexion quotidienne
        await this.addXP(uid, XP_REWARDS.DAILY_LOGIN)
      }
      
      return updateResult
    } catch (error) {
      console.error('Erreur mise à jour dernière connexion:', error)
      return { success: false, error: error.message }
    }
  }
}

export default UserService
export { UserService }
