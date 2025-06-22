import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { USER_LEVELS, XP_REWARDS } from '../constants.js'

export class UserService {
  static async createUserProfile(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid)
      const defaultProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName || userData.email,
        photoURL: userData.photoURL || null,
        xp: 0,
        level: 1,
        badges: [],
        tasksCompleted: 0,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...userData
      }
      
      await setDoc(userRef, defaultProfile)
      return defaultProfile
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return userSnap.data()
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  static async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  static async addXP(uid, xpAmount) {
    try {
      const userProfile = await this.getUserProfile(uid)
      if (!userProfile) return

      const newXP = userProfile.xp + xpAmount
      const newLevel = this.calculateLevel(newXP)

      await this.updateUserProfile(uid, {
        xp: newXP,
        level: newLevel
      })

      return { newXP, newLevel, levelUp: newLevel > userProfile.level }
    } catch (error) {
      console.error('Error adding XP:', error)
      throw error
    }
  }

  static calculateLevel(xp) {
    for (const [level, data] of Object.entries(USER_LEVELS)) {
      if (xp >= data.min && xp <= data.max) {
        return parseInt(level)
      }
    }
    return 1
  }

  static async updateLastLogin(uid) {
    try {
      await this.updateUserProfile(uid, {
        lastLogin: new Date()
      })
      
      // Award daily login XP
      await this.addXP(uid, XP_REWARDS.DAILY_LOGIN)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }
}
