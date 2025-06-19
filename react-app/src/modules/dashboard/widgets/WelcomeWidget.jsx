// src/modules/dashboard/widgets/WelcomeWidget.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card.jsx";

const WelcomeWidget = ({ user, userProfile }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Prêt à faire la différence aujourd'hui ? 💪",
      "Une nouvelle journée, de nouvelles opportunités ! 🌟",
      "L'équipe Synergia compte sur votre énergie ! ⚡",
      "Ensemble, nous accomplissons de grandes choses ! 🚀",
      "Votre contribution fait toute la différence ! 🎯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card shadow="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {getGreeting()}, {userProfile?.displayName || user?.displayName || 'Équipier'} ! 👋
            </h2>
            <p className="text-blue-100 mb-3">
              {getMotivationalMessage()}
            </p>
            <div className="flex items-center space-x-4 text-blue-200 text-sm">
              <span>📅 {formatDate()}</span>
              {userProfile?.profile?.department && (
                <span>🏢 {userProfile.profile.department}</span>
              )}
              {userProfile?.role && (
                <span className="px-2 py-1 bg-white/20 rounded">
                  {userProfile.role === 'admin' ? '👑 Admin' : 
                   userProfile.role === 'manager' ? '⭐ Manager' : 
                   '👤 Équipier'}
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden md:block">
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg"
            />
          </div>
        </div>

        {/* Barre de progression niveau (pour Phase 2 - Gamification) */}
        {userProfile?.gamification && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span>Niveau {userProfile.gamification.level}</span>
              <span>{userProfile.gamification.xp} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userProfile.gamification.xp % 100), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default WelcomeWidget;
