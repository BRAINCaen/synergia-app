// src/modules/dashboard/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Card from "../../../shared/components/ui/Card.jsx";
import Button from "../../../shared/components/ui/Button.jsx";
import authService from "../../auth/services/authService.js";
import WelcomeWidget from "../widgets/WelcomeWidget.jsx";
import StatsWidget from "../widgets/StatsWidget.jsx";
import QuickActionsWidget from "../widgets/QuickActionsWidget.jsx";
import RecentActivityWidget from "../widgets/RecentActivityWidget.jsx";

const Dashboard = ({ user, onLogout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (user?.uid) {
      const { profile, error } = await authService.getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        console.error('Erreur lors du chargement du profil:', error);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">⚡ Synergia</h1>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
              v2.0
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-xl">🔔</span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white font-medium">
                {userProfile?.displayName || user.displayName || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <WelcomeWidget user={user} userProfile={userProfile} />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Stats Widget */}
            <div className="lg:col-span-2">
              <StatsWidget userProfile={userProfile} />
            </div>

            {/* Quick Actions */}
            <QuickActionsWidget userProfile={userProfile} />
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <RecentActivityWidget userProfile={userProfile} />
          </div>

          {/* Coming Soon Modules */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">🚀 Modules à venir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Gamification', icon: '🎮', description: 'Système de points et badges', phase: 'Phase 2' },
                { name: 'Pointage', icon: '⏰', description: 'Gestion du temps', phase: 'Phase 3' },
                { name: 'Messagerie', icon: '💬', description: 'Chat d\'équipe', phase: 'Phase 4' },
                { name: 'Boutique', icon: '🛒', description: 'Récompenses', phase: 'Phase 5' }
              ].map((module) => (
                <Card key={module.name} className="opacity-75 hover:opacity-100 transition-opacity">
                  <Card.Content className="text-center p-4">
                    <div className="text-3xl mb-2">{module.icon}</div>
                    <h3 className="font-semibold text-white">{module.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                      {module.phase}
                    </span>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
