// ==========================================
// 📁 components/hr/StatCard.jsx
// COMPOSANT CARTE STATISTIQUE RH
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const iconColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    indigo: 'bg-indigo-500/20 text-indigo-400'
  };

  const textColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    indigo: 'text-indigo-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold mb-1 ${textColors[color]}`}>{value}</div>
      {subtitle && <div className="text-xs sm:text-sm text-gray-500">{subtitle}</div>}
    </motion.div>
  );
};

export default StatCard;
