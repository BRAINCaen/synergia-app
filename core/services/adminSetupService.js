// ==========================================
// 📁 react-app/src/core/services/adminSetupService.js
// SERVICE POUR CONFIGURER LES ADMINISTRATEURS
// ==========================================

import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';

class AdminSetupService {
  constructor() {
    this.ADMIN_COLLECTION = 'admins';
    this.USERS_COLLECTION = 'users';
  }

  /**
   * 🛡️ DÉFINIR UN UTILISATEUR COMME ADMINISTRATEUR
   */
  async makeUserAdmin(userId, assignedBy = 'system') {
    try {
      console.log(`🛡️ Configuration admin pour utilisateur: ${userId}`);
      
      // Vérifier que l'utilisateur existe
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Utilisateur introuvable');
      }

      const userData = userSnap.data();
      
      // Mettre à jour le profil utilisateur avec le rôle admin
      await updateDoc(userRef, {
        'profile.role': 'admin',
        role: 'admin', // Double sécurité
        isAdmin: true,
        adminSince: new Date(),
        adminAssignedBy: assignedBy,
        permissions: [
          'admin_access',
          'manage_users',
          'manage_badges',
          'validate_tasks',
          'validate_xp',
          'view_analytics',
          'manage_projects',
          'system_config'
        ],
        updatedAt: new Date()
      });

      // Créer un enregistrement dans la collection admins
      await setDoc(doc(db, this.ADMIN_COLLECTION, userId), {
        userId,
        email: userData.email,
        displayName: userData.displayName,
        assignedBy,
        assignedAt: new Date(),
        permissions: [
          'admin_access',
          'manage_users', 
          'manage_badges',
          'validate_tasks',
          'validate_xp',
          'view_analytics',
          'manage_projects',
          'system_config'
        ],
        isActive: true,
        createdAt: new Date()
      });

      console.log(`✅ Utilisateur ${userId} configuré comme administrateur`);
      
      return {
        success: true,
        message: 'Utilisateur configuré comme administrateur avec succès',
        userId,
        permissions: [
          'admin_access',
          'manage_users',
          'manage_badges', 
          'validate_tasks',
          'validate_xp',
          'view_analytics',
          'manage_projects',
          'system_config'
        ]
      };
      
    } catch (error) {
      console.error('❌ Erreur configuration admin:', error);
      throw error;
    }
  }

  /**
   * 📧 FAIRE ADMIN PAR EMAIL
   */
  async makeUserAdminByEmail(email, assignedBy = 'system') {
    try {
      console.log(`🛡️ Recherche utilisateur par email: ${email}`);
      
      // Chercher l'utilisateur par email
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`);
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      return await this.makeUserAdmin(userId, assignedBy);
      
    } catch (error) {
      console.error('❌ Erreur configuration admin par email:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER SI UN UTILISATEUR EST ADMIN
   */
  async checkIfUserIsAdmin(userId) {
    try {
      // Vérifier dans la collection users
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return { isAdmin: false, reason: 'Utilisateur introuvable' };
      }

      const userData = userSnap.data();
      
      // Vérifier les différentes méthodes de définition admin
      const isAdminByRole = userData.profile?.role === 'admin' || userData.role === 'admin';
      const isAdminByFlag = userData.isAdmin === true;
      const hasAdminPermissions = userData.permissions?.includes('admin_access');
      
      // Vérifier dans la collection admins
      const adminRef = doc(db, this.ADMIN_COLLECTION, userId);
      const adminSnap = await getDoc(adminRef);
      const isInAdminCollection = adminSnap.exists() && adminSnap.data().isActive;
      
      const isAdmin = isAdminByRole || isAdminByFlag || hasAdminPermissions || isInAdminCollection;
      
      return {
        isAdmin,
        methods: {
          roleBasedAdmin: isAdminByRole,
          flagBasedAdmin: isAdminByFlag,
          permissionBasedAdmin: hasAdminPermissions,
          collectionBasedAdmin: isInAdminCollection
        },
        userData,
        adminData: adminSnap.exists() ? adminSnap.data() : null
      };
      
    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      return { isAdmin: false, error: error.message };
    }
  }

  /**
   * 📋 LISTER TOUS LES ADMINISTRATEURS
   */
  async getAllAdmins() {
    try {
      console.log('📋 Récupération de tous les administrateurs...');
      
      // Récupérer depuis la collection admins
      const adminsRef = collection(db, this.ADMIN_COLLECTION);
      const querySnapshot = await getDocs(adminsRef);
      
      const admins = [];
      querySnapshot.forEach(doc => {
        admins.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          assignedAt: doc.data().assignedAt?.toDate()
        });
      });
      
      // Récupérer aussi depuis la collection users (admins définis autrement)
      const usersRef = collection(db, this.USERS_COLLECTION);
      const userAdminsQuery = query(usersRef, where('role', '==', 'admin'));
      const userAdminsSnapshot = await getDocs(userAdminsQuery);
      
      userAdminsSnapshot.forEach(doc => {
        const userData = doc.data();
        const existingAdmin = admins.find(admin => admin.userId === doc.id);
        
        if (!existingAdmin) {
          admins.push({
            id: doc.id,
            userId: doc.id,
            email: userData.email,
            displayName: userData.displayName,
            assignedBy: 'user_role',
            assignedAt: userData.createdAt?.toDate(),
            isActive: true,
            source: 'user_collection'
          });
        }
      });
      
      console.log(`✅ ${admins.length} administrateurs trouvés`);
      return admins;
      
    } catch (error) {
      console.error('❌ Erreur récupération admins:', error);
      throw error;
    }
  }

  /**
   * ❌ RÉVOQUER LES DROITS ADMIN
   */
  async revokeAdminAccess(userId, revokedBy = 'system') {
    try {
      console.log(`❌ Révocation droits admin pour: ${userId}`);
      
      // Mettre à jour le profil utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        'profile.role': 'employee',
        role: 'employee',
        isAdmin: false,
        adminRevokedAt: new Date(),
        adminRevokedBy: revokedBy,
        permissions: [], // Vider les permissions
        updatedAt: new Date()
      });

      // Désactiver dans la collection admins
      const adminRef = doc(db, this.ADMIN_COLLECTION, userId);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        await updateDoc(adminRef, {
          isActive: false,
          revokedAt: new Date(),
          revokedBy
        });
      }

      console.log(`✅ Droits admin révoqués pour ${userId}`);
      
      return {
        success: true,
        message: 'Droits administrateur révoqués avec succès',
        userId
      };
      
    } catch (error) {
      console.error('❌ Erreur révocation admin:', error);
      throw error;
    }
  }

  /**
   * 🔧 CONFIGURATION INITIALE ADMIN
   */
  async setupFirstAdmin(email) {
    try {
      console.log('🔧 Configuration du premier administrateur...');
      
      // Chercher l'utilisateur
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Utilisateur avec l'email ${email} non trouvé. L'utilisateur doit d'abord se connecter à l'application.`);
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      // Vérifier s'il y a déjà des admins
      const existingAdmins = await this.getAllAdmins();
      const assignedBy = existingAdmins.length === 0 ? 'system_initial_setup' : 'manual_setup';
      
      const result = await this.makeUserAdmin(userId, assignedBy);
      
      console.log('✅ Premier administrateur configuré avec succès');
      return {
        ...result,
        isFirstAdmin: existingAdmins.length === 0
      };
      
    } catch (error) {
      console.error('❌ Erreur configuration premier admin:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES ADMIN
   */
  async getAdminStatistics() {
    try {
      const allAdmins = await this.getAllAdmins();
      const activeAdmins = allAdmins.filter(admin => admin.isActive !== false);
      
      return {
        totalAdmins: allAdmins.length,
        activeAdmins: activeAdmins.length,
        adminsList: activeAdmins,
        lastSetup: allAdmins.reduce((latest, admin) => {
          const assignedAt = admin.assignedAt || admin.createdAt;
          return assignedAt > latest ? assignedAt : latest;
        }, new Date(0))
      };
      
    } catch (error) {
      console.error('❌ Erreur statistiques admin:', error);
      throw error;
    }
  }
}

// Export du service
const adminSetupService = new AdminSetupService();
export default adminSetupService;

// Fonctions utilitaires pour faciliter l'usage
export const makeUserAdmin = (userId, assignedBy) => 
  adminSetupService.makeUserAdmin(userId, assignedBy);

export const makeUserAdminByEmail = (email, assignedBy) => 
  adminSetupService.makeUserAdminByEmail(email, assignedBy);

export const checkIfUserIsAdmin = (userId) => 
  adminSetupService.checkIfUserIsAdmin(userId);

export const setupFirstAdmin = (email) => 
  adminSetupService.setupFirstAdmin(email);

export const getAllAdmins = () => 
  adminSetupService.getAllAdmins();

export const getAdminStatistics = () => 
  adminSetupService.getAdminStatistics();
