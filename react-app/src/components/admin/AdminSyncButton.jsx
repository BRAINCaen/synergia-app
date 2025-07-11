// ==========================================
// 📁 react-app/src/components/admin/AdminSyncButton.jsx
// BOUTON D'ACCÈS À LA SYNCHRONISATION ADMIN - CORRIGÉ
// ==========================================

import React, { useState } from 'react';
import { Settings, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore';
import AdminSync from '../../pages/AdminSync';

const AdminSyncButton = () => {
  const { user } = useAuthStore();
  const [showAdminSync, setShowAdminSync] = useState(false);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.profile?.role === 'admin' || user?.isAdmin;

  // ❌ TEMPORAIREMENT DÉSACTIVÉ - Ce bouton causait la ligne rouge
  // On le masque complètement pour le moment
  if (!isAdmin || true) { // Force la désactivation
    return null;
  }

  return (
    <>
      {/* 🚨 BOUTON SUPPRIMÉ TEMPORAIREMENT - Causait la ligne rouge fixe
      
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowAdminSync(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Administration - Synchronisation des données"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
      
      */}

      {/* ✅ NOUVELLE VERSION - Sans position fixed */}
      {/* On peut l'ajouter dans la sidebar ou un menu à la place */}
      
      {/* Modal de synchronisation - garde la fonctionnalité */}
      {showAdminSync && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Administration - Synchronisation des données
              </h2>
              <button
                onClick={() => setShowAdminSync(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <AdminSync />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSyncButton;
