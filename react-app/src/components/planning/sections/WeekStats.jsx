// ==========================================
// 📁 components/planning/sections/WeekStats.jsx
// STATISTIQUES DE LA SEMAINE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users, TrendingUp } from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
  <motion.div
    className={`
      relative bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50
      shadow-2xl shadow-purple-500/10 p-6 ${className}
    `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const WeekStats = ({ stats, employeesCount }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <GlassCard className="!p-3 sm:!p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Heures</p>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalHours}h</p>
          </div>
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
        </div>
      </GlassCard>

      <GlassCard className="!p-3 sm:!p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Shifts</p>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.shiftsCount}</p>
          </div>
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
        </div>
      </GlassCard>

      <GlassCard className="!p-3 sm:!p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Employés</p>
            <p className="text-lg sm:text-2xl font-bold text-white">
              {stats.employeesScheduled}/{employeesCount}
            </p>
          </div>
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
        </div>
      </GlassCard>

      <GlassCard className="!p-3 sm:!p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Couverture</p>
            <p className="text-lg sm:text-2xl font-bold text-white">{stats.coverage}%</p>
          </div>
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
        </div>
      </GlassCard>
    </div>
  );
};

export default WeekStats;
