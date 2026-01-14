// ==========================================
// 📁 components/rewards/sections/StatCard.jsx
// CARTE STAT COMPACTE
// ==========================================

import React from 'react';

const StatCard = ({ icon: Icon, label, value, sublabel, color, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} border border-white/10 rounded-xl p-3 sm:p-4`}>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-base sm:text-xl font-bold ${color}`}>{value?.toLocaleString?.() || value}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{label}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
