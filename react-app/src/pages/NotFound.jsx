// ==========================================
// 📁 react-app/src/pages/NotFound.jsx
// PAGE 404 - VERSION MINIMALE
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page non trouvée</p>
        <Link
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          🏠 Retour au Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// BADGES PAGE - VERSION MINIMALE
// ==========================================

import React from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { Trophy, Award, Star } from 'lucide-react';

const BadgesPage = () => {
  const { user } = useAuthStore();
  
  const sampleBadges = [
    { id: 1, name: 'Premier Pas', description: 'Première connexion', icon: '🎉', earned: true },
    { id: 2, name: 'Productif', description: '10 tâches terminées', icon: '⚡', earned: true },
    { id: 3, name: 'Expert', description: '100 tâches terminées', icon: '🏆', earned: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Mes Badges
          </h1>
          <p className="text-gray-600 mt-1">
            Collection de vos accomplissements et récompenses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBadges.map((badge) => (
            <div 
              key={badge.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                badge.earned ? 'border-2 border-yellow-200' : 'opacity-60'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-gray-900">{badge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                {badge.earned ? (
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Débloqué
                  </span>
                ) : (
                  <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    🔒 Verrouillé
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesPage;

// ==========================================
// 📁 react-app/src/pages/UsersPage.jsx
// USERS PAGE - VERSION MINIMALE
// ==========================================

import React from 'react';
import { Users, User, Mail, Shield } from 'lucide-react';

const UsersPage = () => {
  const sampleUsers = [
    { id: 1, name: 'Admin Synergia', email: 'admin@synergia.com', role: 'admin', xp: 1500 },
    { id: 2, name: 'Manager Test', email: 'manager@synergia.com', role: 'manager', xp: 800 },
    { id: 3, name: 'User Test', email: 'user@synergia.com', role: 'user', xp: 350 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les membres de votre équipe
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.xp} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// ONBOARDING PAGE - VERSION MINIMALE
// ==========================================

import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: 'Bienvenue', description: 'Découvrez Synergia', completed: true },
    { title: 'Profil', description: 'Configurez votre profil', completed: false },
    { title: 'Équipe', description: 'Rejoignez votre équipe', completed: false },
    { title: 'Première tâche', description: 'Créez votre première tâche', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Intégration Synergia
          </h1>
          
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto">
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// TIME TRACK PAGE - VERSION MINIMALE
// ==========================================

import React, { useState } from 'react';
import { Clock, Play, Pause, Square } from 'lucide-react';

const TimeTrackPage = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-8 h-8 text-blue-600" />
            Suivi du Temps
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez le temps passé sur vos tâches
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-900 mb-8">
              00:00:00
            </div>
            
            <div className="space-x-4">
              <button
                onClick={() => setIsTracking(!isTracking)}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-4 h-4 inline mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Démarrer
                  </>
                )}
              </button>
              
              <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                <Square className="w-4 h-4 inline mr-2" />
                Arrêter
