// ==========================================
// 📁 react-app/src/utils/forceAdminAccess.js
// SCRIPT TEMPORAIRE POUR FORCER L'ACCÈS ADMIN
// ==========================================

/**
 * 🚨 SCRIPT TEMPORAIRE - À SUPPRIMER APRÈS TESTS
 * Force l'accès admin pour votre compte
 */

import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🛡️ FORCER L'ACCÈS ADMIN POUR UN UTILISATEUR
 */
export const forceAdminAccess = async (userEmail, userId) => {
  try {
    console.log('🛡️ Forçage accès admin pour:', userEmail);

    // Mettre à jour le document utilisateur avec les droits admin
    const userRef = doc(db, 'users', userId);
    
    const adminData = {
      email: userEmail,
      role: 'admin',
      isAdmin: true,
      permissions: ['admin_access', 'manage_users', 'manage_tasks', 'manage_badges'],
      profile: {
        role: 'admin',
        isAdmin: true
      },
      adminLevel: 'super',
      updatedAt: new Date(),
      forceAdmin: true // Marqueur temporaire
    };

    await setDoc(userRef, adminData, { merge: true });
    
    console.log('✅ Droits admin forcés avec succès');
    
    // Vider le cache auth pour forcer le rechargement
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authStore');
      sessionStorage.clear();
    }
    
    return { success: true, message: 'Droits admin activés' };
    
  } catch (error) {
    console.error('❌ Erreur forçage admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🧪 FONCTION DE TEST À UTILISER EN CONSOLE
 * À utiliser dans la console du navigateur :
 * 
 * import { forceAdminAccess } from '/src/utils/forceAdminAccess.js';
 * forceAdminAccess('alan.boehme61@gmail.com', 'tanguy.caron@gmail.com', 'YOUR_USER_ID');
 */
export const testAdminAccess = () => {
  console.log('🧪 Test d\'accès admin');
  
  // Récupérer l'utilisateur actuel (ajustez selon votre store)
  const user = window.authStore?.user || window.user;
  
  if (user) {
    return forceAdminAccess(user.email, user.uid);
  } else {
    console.error('❌ Aucun utilisateur trouvé');
    return { success: false, error: 'Aucun utilisateur connecté' };
  }
};

// Export pour utilisation globale en développement
if (typeof window !== 'undefined') {
  window.forceAdminAccess = forceAdminAccess;
  window.testAdminAccess = testAdminAccess;
}

/**
 * 📝 INSTRUCTIONS D'UTILISATION :
 * 
 * 1. Importez ce fichier dans App.jsx temporairement :
 *    import './utils/forceAdminAccess.js';
 * 
 * 2. Ouvrez la console du navigateur (F12)
 * 
 * 3. Tapez : window.testAdminAccess()
 * 
 * 4. Rechargez la page
 * 
 * 5. Les pages admin devraient apparaître dans le menu
 */
