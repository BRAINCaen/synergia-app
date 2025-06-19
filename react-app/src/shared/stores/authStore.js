import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../../core/firebase'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../core/constants'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Actions de base
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      clearError: () => set({ error: null }),

      // Getters
      isAuthenticated: () => !!get().user,
      getCurrentUser: () => get().user,

      // Actions asynchrones
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            emailVerified: userCredential.user.emailVerified,
            createdAt: userCredential.user.metadata.creationTime,
            lastLoginAt: userCredential.user.metadata.lastSignInTime
          }
          set({ user, isLoading: false })
          return { success: true, user }
        } catch (error) {
          console.error('Erreur de connexion:', error)
          let errorMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
          
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage = ERROR_MESSAGES.AUTH.USER_NOT_FOUND
              break
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
              break
            case 'auth/too-many-requests':
              errorMessage = ERROR_MESSAGES.AUTH.TOO_MANY_ATTEMPTS
              break
            case 'auth/user-disabled':
              errorMessage = ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED
              break
            default:
              errorMessage = 'Erreur de connexion. Veuillez réessayer.'
          }
          
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signup: async (email, password, userData) => {
        set({ isLoading: true, error: null })
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          
          // Mettre à jour le profil avec le nom complet
          await updateProfile(userCredential.user, {
            displayName: `${userData.firstName} ${userData.lastName}`
          })

          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: `${userData.firstName} ${userData.lastName}`,
            photoURL: userCredential.user.photoURL,
            emailVerified: userCredential.user.emailVerified,
            createdAt: userCredential.user.metadata.creationTime,
            lastLoginAt: userCredential.user.metadata.lastSignInTime
          }
          
          set({ user, isLoading: false })
          return { success: true, user }
        } catch (error) {
          console.error('Erreur d\'inscription:', error)
          let errorMessage = 'Erreur lors de la création du compte'
          
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS
              break
            case 'auth/weak-password':
              errorMessage = ERROR_MESSAGES.AUTH.WEAK_PASSWORD
              break
            case 'auth/invalid-email':
              errorMessage = ERROR_MESSAGES.AUTH.EMAIL_INVALID
              break
            default:
              errorMessage = 'Erreur lors de la création du compte'
          }
          
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const provider = new GoogleAuthProvider()
          const userCredential = await signInWithPopup(auth, provider)
          
          const user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            emailVerified: userCredential.user.emailVerified,
            createdAt: userCredential.user.metadata.creationTime,
            lastLoginAt: userCredential.user.metadata.lastSignInTime
          }
          
          set({ user, isLoading: false })
          return { success: true, user }
        } catch (error) {
          console.error('Erreur de connexion Google:', error)
          const errorMessage = error.code === 'auth/popup-closed-by-user' 
            ? 'Connexion annulée'
            : 'Erreur de connexion avec Google'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await signOut(auth)
          set({ user: null, isLoading: false, error: null })
          return { success: true, message: SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS }
        } catch (error) {
          console.error('Erreur de déconnexion:', error)
          set({ error: 'Erreur lors de la déconnexion', isLoading: false })
          return { success: false, error: 'Erreur lors de la déconnexion' }
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await sendPasswordResetEmail(auth, email)
          set({ isLoading: false })
          return { success: true, message: SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_SENT }
        } catch (error) {
          console.error('Erreur de réinitialisation:', error)
          let errorMessage = 'Erreur lors de l\'envoi de l\'email'
          
          if (error.code === 'auth/user-not-found') {
            errorMessage = ERROR_MESSAGES.AUTH.USER_NOT_FOUND
          }
          
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      updateUserProfile: async (data) => {
        const currentUser = auth.currentUser
        if (!currentUser) return { success: false, error: 'Utilisateur non connecté' }

        set({ isLoading: true, error: null })
        try {
          await updateProfile(currentUser, data)
          
          const updatedUser = {
            ...get().user,
            displayName: data.displayName || get().user.displayName,
            photoURL: data.photoURL || get().user.photoURL
          }
          
          set({ user: updatedUser, isLoading: false })
          return { success: true, user: updatedUser, message: SUCCESS_MESSAGES.PROFILE.UPDATE_SUCCESS }
        } catch (error) {
          console.error('Erreur de mise à jour du profil:', error)
          set({ error: 'Erreur lors de la mise à jour du profil', isLoading: false })
          return { success: false, error: 'Erreur lors de la mise à jour du profil' }
        }
      },

      // Reset complet du store
      reset: () => set({
        user: null,
        isLoading: false,
        error: null,
        isInitialized: false
      })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized 
      })
    }
  )
)

export default useAuth
