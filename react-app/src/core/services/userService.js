import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

class UserService {
  constructor() {
    this.listeners = new Map();
  }

  // Créer ou mettre à jour le profil utilisateur
  async createOrUpdateUserProfile(user, additionalData = {}) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const baseProfile = {
        email: user.email,
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL || null,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (!userSnap.exists()) {
        // Nouvel utilisateur - créer profil complet
        const newUserData = {
          ...baseProfile,
          createdAt: serverTimestamp(),
          profile: {
            department: additionalData.department || 'Non défini',
            role: additionalData.role || 'employee',
            phone: additionalData.phone || '',
            bio: additionalData.bio || '',
            ...additionalData.profile
          },
          gamification: {
            totalXp: 0,
            level: 1,
            badges: [],
            tasksCompleted: 0,
            projectsCreated: 0,
            loginStreak: 1,
            lastLoginDate: new Date().toISOString().split('T')[0],
            weeklyXp: 0,
            monthlyXp: 0
          },
          preferences: {
            notifications: true,
            emailUpdates: true,
            theme: 'dark',
            ...additionalData.preferences
          }
        };

        await setDoc(userRef, newUserData);
        console.log('✅ Nouveau profil utilisateur créé:', user.uid);
        return newUserData;
      } else {
        // Utilisateur existant - mettre à jour connexion
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const userData = userSnap.data();
        console.log('✅ Profil utilisateur mis à jour:', user.uid);
        return userData;
      }
    } catch (error) {
      console.error('❌ Erreur création/mise à jour profil:', error);
      throw error;
    }
  }

  // Récupérer le profil utilisateur
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.warn('⚠️ Profil utilisateur non trouvé:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  }

  // Mettre à jour les données de gamification
  async updateGamificationData(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`gamification.${Object.keys(updates)[0]}`]: Object.values(updates)[0],
        updatedAt: serverTimestamp()
      });
      console.log('✅ Données gamification mises à jour:', userId);
    } catch (error) {
      console.error('❌ Erreur mise à jour gamification:', error);
      throw error;
    }
  }

  // Récupérer le leaderboard en temps réel
  getLeaderboard(callback, options = {}) {
    try {
      const {
        orderField = 'gamification.totalXp',
        limitCount = 50,
        department = null
      } = options;

      let q = query(
        collection(db, 'users'),
        orderBy(orderField, 'desc'),
        limit(limitCount)
      );

      // Filtrer par département si spécifié
      if (department) {
        q = query(
          collection(db, 'users'),
          where('profile.department', '==', department),
          orderBy(orderField, 'desc'),
          limit(limitCount)
        );
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leaderboard = [];
        snapshot.forEach((doc, index) => {
          const userData = doc.data();
          leaderboard.push({
            rank: index + 1,
            uid: doc.id,
            displayName: userData.displayName || 'Utilisateur',
            photoURL: userData.photoURL,
            department: userData.profile?.department || 'Non défini',
            totalXp: userData.gamification?.totalXp || 0,
            level: userData.gamification?.level || 1,
            badges: userData.gamification?.badges?.length || 0,
            tasksCompleted: userData.gamification?.tasksCompleted || 0,
            loginStreak: userData.gamification?.loginStreak || 0,
            weeklyXp: userData.gamification?.weeklyXp || 0,
            monthlyXp: userData.gamification?.monthlyXp || 0
          });
        });

        console.log(`📊 Leaderboard mis à jour: ${leaderboard.length} utilisateurs`);
        callback(leaderboard);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur écoute leaderboard:', error);
      callback([]);
      return () => {};
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(searchTerm, department = null) {
    try {
      let q = collection(db, 'users');
      
      if (department) {
        q = query(q, where('profile.department', '==', department));
      }

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        const displayName = userData.displayName || '';
        const email = userData.email || '';
        
        // Recherche simple par nom ou email
        if (displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())) {
          users.push({
            uid: doc.id,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
            department: userData.profile?.department,
            level: userData.gamification?.level || 1
          });
        }
      });

      return users;
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }
}

export default new UserService();
