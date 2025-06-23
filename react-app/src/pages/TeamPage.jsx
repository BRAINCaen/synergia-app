// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// CORRECTION : Import depuis le chemin existant
// ==========================================

import React from 'react';
// 🔧 CORRECTION : TeamDashboard est dans components/ directement
import TeamDashboard from '../components/TeamDashboard';

const TeamPage = () => {
  return (
    <div className="w-full">
      <TeamDashboard />
    </div>
  );
};

export default TeamPage;
