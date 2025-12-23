// ==========================================
// 📁 react-app/src/shared/stores/authStore.js
// AUTH STORE AVEC PERSISTENCE LOCALE, CRÉATION AUTO PROFIL FIRESTORE ET TRACKING D'ACTIVITÉ
// ==========================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../../core/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

// 🔑 IMPORT AUTHSERVICE POUR CRÉATION PROFIL FIRESTORE
import AuthService from '../../core/services/authService.js';

/**
 * 🔍 Récupérer les données utilisateur depuis Firestore (role, isAdmin, etc.)
 */
const fetchUserFirestoreData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        role: data.role || 'user',
        isAdmin: data.isAdmin === true,
        modulePermissions: data.modulePermissions || {}
      };
    }

    return { role: 'user', isAdmin: false, modulePermissions: {} };
  } catch (error) {
    console.error('❌ [AUTH] Erreur récupération données Firestore:', error);
    return { role: 'user', isAdmin: false, modulePermissions: {} };
  }
};

// 🎯 IMPORT SERVICE DE TRACKING D'ACTIVITÉ
import activityTrackingService from '../../core/services/activityTrackingService.js';

// Provider Google avec configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Variable pour éviter les initialisations multiples
let authStateInitialized = false;
let unsubscribeAuth = null;

// 🔐 CONFIGURATION PERSISTENCE FIREBASE (LOCAL STORAGE UNIQUEMENT)
const setupFirebaseAuth = async () => {
  try {
    console.log('🔐 Configuration persistence Firebase (localStorage)...');
    
    // ⚠️ IMPORTANT: Utiliser UNIQUEMENT browserLocalPersistence
    // JAMAIS browserSessionPersistence pour éviter l'erreur sessionStorage
    await setPersistence(auth, browserLocalPersistence);
    
    console.log('✅ Firebase Auth persistence configurée (localStorage)');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration Firebase persistence:', error);
    return false;
  }
};

// Store avec persistence Zustand (localStorage uniquement)
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // États de base
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      lastLoginTime: null,
      sessionExpiry: null,
      
      // 🔐 CONNEXION GOOGLE - AVEC TRACKING AUTOMATIQUE
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          console.log('🔍 Tentative connexion Google...');
          
          // Assurer la persistence locale avant connexion
          await setupFirebaseAuth();
          
          // ✅ Utiliser signInWithPopup (PAS signInWithRedirect)
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          
          console.log('✅ Connexion Google réussie:', user.email);
          
          // 🎯 CRÉATION AUTOMATIQUE DU PROFIL FIRESTORE
          console.log('🔄 Création/Vérification profil Firestore pour:', user.uid);
          await AuthService.ensureCompleteUserStructure(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          console.log('✅ Profil Firestore créé/vérifié avec succès !');
          
          // 🎯 TRACKER LA CONNEXION
          await activityTrackingService.logLogin(
            user.uid,
            user.displayName || 'Utilisateur',
            user.email
          );
          console.log('📊 [TRACKING] Connexion Google trackée');

          // 🔑 RÉCUPÉRER LES DONNÉES ADMIN DEPUIS FIRESTORE
          const firestoreData = await fetchUserFirestoreData(user.uid);
          console.log('🔑 [AUTH] Données Firestore chargées:', firestoreData);

          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              // 🔑 INCLURE LES DONNÉES ADMIN
              role: firestoreData.role,
              isAdmin: firestoreData.isAdmin,
              modulePermissions: firestoreData.modulePermissions
            },
            loading: false,
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });

          return user;
          
        } catch (error) {
          console.error('❌ Erreur connexion Google:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 📧 CONNEXION EMAIL/PASSWORD - AVEC TRACKING AUTOMATIQUE
      signInWithEmail: async (email, password) => {
        try {
          set({ loading: true, error: null });
          console.log('📧 Tentative connexion email...');
          
          // Assurer la persistence locale avant connexion
          await setupFirebaseAuth();
          
          const result = await signInWithEmailAndPassword(auth, email, password);
          const user = result.user;
          
          console.log('✅ Connexion email réussie:', user.email);
          
          // 🎯 VÉRIFIER/CRÉER PROFIL FIRESTORE
          console.log('🔄 Vérification profil Firestore pour:', user.uid);
          await AuthService.ensureCompleteUserStructure(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          console.log('✅ Profil Firestore vérifié !');
          
          // 🎯 TRACKER LA CONNEXION
          await activityTrackingService.logLogin(
            user.uid,
            user.displayName || user.email,
            user.email
          );
          console.log('📊 [TRACKING] Connexion email trackée');

          // 🔑 RÉCUPÉRER LES DONNÉES ADMIN DEPUIS FIRESTORE
          const firestoreData = await fetchUserFirestoreData(user.uid);
          console.log('🔑 [AUTH] Données Firestore chargées:', firestoreData);

          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              // 🔑 INCLURE LES DONNÉES ADMIN
              role: firestoreData.role,
              isAdmin: firestoreData.isAdmin,
              modulePermissions: firestoreData.modulePermissions
            },
            loading: false,
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });

          return user;

        } catch (error) {
          console.error('❌ Erreur connexion email:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 📝 INSCRIPTION - AVEC TRACKING AUTOMATIQUE
      signUpWithEmail: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null });
          console.log('📝 Tentative inscription...');
          
          // Assurer la persistence locale
          await setupFirebaseAuth();
          
          const result = await createUserWithEmailAndPassword(auth, email, password);
          const user = result.user;
          
          console.log('✅ Inscription réussie:', user.email);
          
          // 🎯 CRÉATION PROFIL FIRESTORE COMPLET
          console.log('🔄 Création profil Firestore pour nouvel utilisateur:', user.uid);
          await AuthService.createCompleteProfile(user.uid, {
            email: user.email,
            displayName: displayName || user.displayName,
            photoURL: user.photoURL
          });
          console.log('✅ Profil Firestore complet créé !');
          
          // 🎯 TRACKER L'INSCRIPTION
          await activityTrackingService.logActivity({
            type: 'user_signup',
            userId: user.uid,
            userName: displayName || user.email,
            userEmail: user.email,
            category: 'Authentification',
            action: 'Inscription',
            details: 'Nouvel utilisateur créé',
            status: 'success'
          });
          console.log('📊 [TRACKING] Inscription trackée');

          // 🔑 RÉCUPÉRER LES DONNÉES ADMIN DEPUIS FIRESTORE (nouveau user = pas admin)
          const firestoreData = await fetchUserFirestoreData(user.uid);

          // Calculer expiration de session (24h)
          const now = Date.now();
          const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures

          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: displayName || user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              // 🔑 INCLURE LES DONNÉES ADMIN
              role: firestoreData.role,
              isAdmin: firestoreData.isAdmin,
              modulePermissions: firestoreData.modulePermissions
            },
            loading: false,
            error: null,
            isAuthenticated: true,
            lastLoginTime: now,
            sessionExpiry: sessionExpiry
          });

          return user;

        } catch (error) {
          console.error('❌ Erreur inscription:', error);
          set({ 
            error: error.message, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // 🚪 DÉCONNEXION - AVEC TRACKING AUTOMATIQUE
      signOut: async () => {
        try {
          console.log('🔄 Déconnexion...');
          
          // 🎯 TRACKER LA DÉCONNEXION AVANT DE DÉCONNECTER
          const currentUser = get().user;
          if (currentUser) {
            await activityTrackingService.logLogout(
              currentUser.uid,
              currentUser.displayName || 'Utilisateur',
              currentUser.email
            );
            console.log('📊 [TRACKING] Déconnexion trackée');
          }
          
          await firebaseSignOut(auth);
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null, 
            loading: false,
            lastLoginTime: null,
            sessionExpiry: null
          });
          
          // Nettoyer localStorage
          localStorage.removeItem('auth-storage');
          
          console.log('✅ Déconnexion réussie');
          
        } catch (error) {
          console.error('❌ Erreur déconnexion:', error);
          set({ 
            error: error.message, 
            loading: false 
          });
          throw error;
        }
      },

      // 🔄 ACTUALISER TOKEN
      refreshAuthToken: async () => {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const token = await currentUser.getIdToken(true); // Force refresh
            console.log('🔄 Token actualisé');
            return token;
          }
          throw new Error('Aucun utilisateur connecté');
        } catch (error) {
          console.error('❌ Erreur actualisation token:', error);
          throw error;
        }
      },

      // 🕐 VÉRIFIER EXPIRATION SESSION
      checkSessionExpiry: () => {
        const { sessionExpiry, signOut } = get();
        
        if (sessionExpiry && Date.now() > sessionExpiry) {
          console.log('⏰ Session expirée, déconnexion automatique');
          signOut();
          return false;
        }
        
        return true;
      },

      // ✅ INITIALISATION AUTH STATE (UNE SEULE FOIS)
      initializeAuth: () => {
        // Éviter les initialisations multiples
        if (authStateInitialized) {
          console.log('🔒 Auth déjà initialisé, ignorer');
          return;
        }

        console.log('🔍 Initialisation auth state...');
        authStateInitialized = true;
        
        // Configurer Firebase Auth (localStorage uniquement)
        setupFirebaseAuth();
        
        // Observer les changements d'état UNE SEULE FOIS
        unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
          console.log('🔔 Auth state changed:', user ? user.email : 'déconnecté');

          if (user) {
            // 🎯 VÉRIFIER/CRÉER PROFIL FIRESTORE SI NÉCESSAIRE
            console.log('🔄 Vérification profil Firestore au changement auth...');
            try {
              await AuthService.ensureCompleteUserStructure(user.uid, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
              });
              console.log('✅ Profil Firestore synchronisé');
            } catch (error) {
              console.error('❌ Erreur sync profil:', error);
            }

            // 🔑 RÉCUPÉRER LES DONNÉES ADMIN DEPUIS FIRESTORE
            const firestoreData = await fetchUserFirestoreData(user.uid);
            console.log('🔑 [AUTH] Données Firestore chargées au refresh:', firestoreData);

            const now = Date.now();
            const sessionExpiry = now + (24 * 60 * 60 * 1000); // 24 heures

            set({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                // 🔑 INCLURE LES DONNÉES ADMIN
                role: firestoreData.role,
                isAdmin: firestoreData.isAdmin,
                modulePermissions: firestoreData.modulePermissions
              },
              isAuthenticated: true,
              loading: false,
              error: null,
              lastLoginTime: now,
              sessionExpiry: sessionExpiry
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null,
              lastLoginTime: null,
              sessionExpiry: null
            });
          }
        });
      },

      // 🧹 NETTOYER L'OBSERVER
      cleanup: () => {
        if (unsubscribeAuth) {
          console.log('🧹 Nettoyage observer auth');
          unsubscribeAuth();
          unsubscribeAuth = null;
          authStateInitialized = false;
        }
      }
    }),
    {
      name: 'auth-storage', // Clé localStorage
      storage: createJSONStorage(() => localStorage), // ⚠️ UNIQUEMENT localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
        sessionExpiry: state.sessionExpiry
      }),
    }
  )
);

// ✅ FONCTION D'INITIALISATION EXPORTÉE (pour App.jsx)
export const initializeAuthStore = () => {
  console.log('🚀 initializeAuthStore appelé');
  useAuthStore.getState().initializeAuth();
};

// ✅ INITIALISATION AUTOMATIQUE AU CHARGEMENT
if (typeof window !== 'undefined') {
  console.log('🚀 Initialisation automatique auth store...');
  initializeAuthStore();
}

// ✅ EXPORTS
export default useAuthStore;

console.log('✅ Auth Store chargé avec TRACKING D\'ACTIVITÉ AUTOMATIQUE activé');
