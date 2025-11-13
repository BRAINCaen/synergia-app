// ==========================================
// 📁 react-app/src/core/services/userEmployeeSyncService.js
// SYNCHRONISATION AUTOMATIQUE USERS → EMPLOYEES RH
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION USERS → EMPLOYEES
 */
class UserEmployeeSyncService {
  constructor() {
    console.log('🔄 UserEmployeeSyncService initialisé');
    this.syncInProgress = false;
  }

  /**
   * 🔄 SYNCHRONISER TOUS LES UTILISATEURS VERS EMPLOYEES
   */
  async syncAllUsersToEmployees() {
    if (this.syncInProgress) {
      console.log('⚠️ [SYNC] Synchronisation déjà en cours');
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      this.syncInProgress = true;
      console.log('🔄 [SYNC] Début synchronisation users → employees');

      // 1. Récupérer tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📊 [SYNC] ${users.length} utilisateurs trouvés`);

      // 2. Récupérer tous les employés existants
      const employeesSnapshot = await getDocs(collection(db, 'hr_employees'));
      const existingEmployees = new Map();
      employeesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
          existingEmployees.set(data.userId, { id: doc.id, ...data });
        }
      });

      console.log(`📊 [SYNC] ${existingEmployees.size} employés existants`);

      // 3. Synchroniser chaque user
      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const user of users) {
        try {
          const existingEmployee = existingEmployees.get(user.id);

          const employeeData = {
            userId: user.id,
            email: user.email || '',
            displayName: user.displayName || 'Sans nom',
            photoURL: user.photoURL || '',
            phone: user.phone || '',
            position: user.synergiaRole || 'Game Master',
            status: 'active',
            syncedFromUser: true,
            lastSyncAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          if (existingEmployee) {
            // Mise à jour
            await updateDoc(doc(db, 'hr_employees', existingEmployee.id), employeeData);
            updated++;
            console.log(`✅ [SYNC] Employé mis à jour: ${user.email}`);
          } else {
            // Création
            await setDoc(doc(db, 'hr_employees', user.id), {
              ...employeeData,
              createdAt: serverTimestamp()
            });
            created++;
            console.log(`✅ [SYNC] Nouvel employé créé: ${user.email}`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ [SYNC] Erreur pour ${user.email}:`, error);
        }
      }

      const result = {
        success: true,
        totalUsers: users.length,
        created,
        updated,
        errors,
        message: `Synchronisation terminée: ${created} créés, ${updated} mis à jour, ${errors} erreurs`
      };

      console.log('✅ [SYNC] Synchronisation terminée:', result);
      this.syncInProgress = false;
      return result;

    } catch (error) {
      console.error('❌ [SYNC] Erreur générale:', error);
      this.syncInProgress = false;
      throw error;
    }
  }

  /**
   * 🔄 SYNCHRONISER UN SEUL UTILISATEUR
   */
  async syncSingleUser(userId) {
    try {
      // Récupérer les données user
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
      
      if (userDoc.empty) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = { id: userId, ...userDoc.docs[0].data() };

      // Préparer les données employé
      const employeeData = {
        userId: userData.id,
        email: userData.email || '',
        displayName: userData.displayName || 'Sans nom',
        photoURL: userData.photoURL || '',
        phone: userData.phone || '',
        position: userData.synergiaRole || 'Game Master',
        status: 'active',
        syncedFromUser: true,
        lastSyncAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Vérifier si l'employé existe
      const employeeDoc = await getDocs(
        query(collection(db, 'hr_employees'), where('userId', '==', userId))
      );

      if (!employeeDoc.empty) {
        // Mise à jour
        await updateDoc(doc(db, 'hr_employees', employeeDoc.docs[0].id), employeeData);
        console.log(`✅ [SYNC] Employé ${userData.email} mis à jour`);
      } else {
        // Création
        await setDoc(doc(db, 'hr_employees', userId), {
          ...employeeData,
          createdAt: serverTimestamp()
        });
        console.log(`✅ [SYNC] Nouvel employé ${userData.email} créé`);
      }

      return { success: true, userId };

    } catch (error) {
      console.error(`❌ [SYNC] Erreur sync user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 👂 ÉCOUTER LES CHANGEMENTS USERS EN TEMPS RÉEL
   */
  watchUsersForAutoSync(callback) {
    console.log('👂 [SYNC] Écoute des changements users activée');

    return onSnapshot(collection(db, 'users'), async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          const user = { id: change.doc.id, ...change.doc.data() };
          
          try {
            await this.syncSingleUser(user.id);
            console.log(`✅ [SYNC] User ${user.email} synchronisé automatiquement`);
            
            if (callback) {
              callback({ type: change.type, user });
            }
          } catch (error) {
            console.error(`❌ [SYNC] Erreur sync auto ${user.email}:`, error);
          }
        }
      }
    });
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DE SYNCHRONISATION
   */
  async getSyncStats() {
    try {
      const [usersSnapshot, employeesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'hr_employees'), where('syncedFromUser', '==', true)))
      ]);

      return {
        totalUsers: usersSnapshot.size,
        syncedEmployees: employeesSnapshot.size,
        unsyncedUsers: usersSnapshot.size - employeesSnapshot.size,
        syncPercentage: Math.round((employeesSnapshot.size / usersSnapshot.size) * 100)
      };
    } catch (error) {
      console.error('❌ [SYNC] Erreur stats:', error);
      throw error;
    }
  }
}

// Export singleton
const userEmployeeSyncService = new UserEmployeeSyncService();
export { userEmployeeSyncService };
export default userEmployeeSyncService;
