// ==========================================
// 📁 react-app/src/components/navigation/AdminQuickAccess.jsx
// COMPOSANT D'ACCÈS RAPIDE ADMIN À AJOUTER AU MENU
// ==========================================

import React, { useState, useEffect } from 'react';
import { Shield, Crown, Settings, Eye } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminBadgeService.js';
import adminSetupService from '../../core/services/adminSetupService.js';

/**
 * 🛡️ BOUTON D'ACCÈS RAPIDE À L'ADMINISTRATION
 * À intégrer dans le menu principal ou comme bouton flottant
 */
const AdminQuickAccess = ({ className = "" }) => {
  const { user } = useAuthStore();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [adminStatusChecked, setAdminStatusChecked] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Vérification rapide avec isAdmin
      const quickCheck = isAdmin(user);
      
      // Vérification complète avec le service
      const fullCheck = await adminSetupService.checkIfUserIsAdmin(user.uid);
      
      setUserIsAdmin(quickCheck || fullCheck.isAdmin);
      setAdminStatusChecked(true);
      
      console.log('🛡️ Statut admin vérifié:', { quickCheck, fullCheck: fullCheck.isAdmin });
      
    } catch (error) {
      console.error('❌ Erreur vérification admin:', error);
      setAdminStatusChecked(true);
    }
  };

  const openAdminTest = () => {
    // Ouvrir dans un nouvel onglet ou redirection
    window.open('/admin-test', '_blank');
    // Ou pour redirection dans le même onglet :
    // window.location.href = '/admin-test';
  };

  if (!adminStatusChecked) {
    return null; // Ou un placeholder de chargement
  }

  return (
    <div className={`${className}`}>
      {/* Bouton principal admin */}
      <button
        onClick={openAdminTest}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          userIsAdmin
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-orange-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={userIsAdmin ? "Accéder au Panel Admin" : "Configurer l'Accès Admin"}
      >
        {userIsAdmin ? (
          <>
            <Crown className="w-5 h-5" />
            <span className="hidden md:inline">Panel Admin</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span className="hidden md:inline">Devenir Admin</span>
          </>
        )}
      </button>
      
      {/* Badge de statut */}
      {userIsAdmin && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default AdminQuickAccess;

// ==========================================
// EXEMPLES D'INTÉGRATION
// ==========================================

/**
 * 1. DANS LE HEADER PRINCIPAL :
 * 
 * import AdminQuickAccess from './components/navigation/AdminQuickAccess.jsx';
 * 
 * <header className="flex items-center justify-between p-4">
 *   <div>Logo</div>
 *   <div className="flex items-center gap-4">
 *     <AdminQuickAccess />
 *     <UserMenu />
 *   </div>
 * </header>
 */

/**
 * 2. DANS LE MENU LATÉRAL :
 * 
 * <nav className="space-y-2">
 *   <NavLink to="/dashboard">Dashboard</NavLink>
 *   <NavLink to="/projects">Projets</NavLink>
 *   <AdminQuickAccess className="w-full" />
 * </nav>
 */

/**
 * 3. COMME BOUTON FLOTTANT :
 * 
 * <div className="fixed bottom-4 right-4 z-50">
 *   <AdminQuickAccess />
 * </div>
 */
