// src/modules/profile/components/Profile.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../core/constants.js';
import useAuthStore from '../../../shared/stores/authStore.js';
import Button from '../../../shared/components/ui/Button.jsx';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header simple */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">👤 Profil</h1>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="outline">
              ← Retour Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenu du profil */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-blue-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.displayName || 'Utilisateur'}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-sm text-blue-400">Membre Synergia</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Informations</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email :</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Statut :</span>
                  <span className="text-green-400">✅ Actif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email vérifié :</span>
                  <span className={user?.emailVerified ? "text-green-400" : "text-yellow-400"}>
                    {user?.emailVerified ? "✅ Oui" : "⏳ En attente"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  ✏️ Modifier le profil
                </Button>
                <Button variant="outline" className="w-full">
                  ⚙️ Paramètres
                </Button>
                <Button variant="outline" className="w-full">
                  🔔 Notifications
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">🚧 Module en développement</h4>
            <p className="text-blue-200 text-sm">
              La page de profil complète sera disponible dans les prochaines versions de Synergia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
