// ==========================================
// UserPulseStats - User's personal pulse stats
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Flame, Calendar } from 'lucide-react';

const UserPulseStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Vos Stats Pulse
        </h3>
        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
          Cette semaine
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className={`w-4 h-4 ${stats.streak >= 5 ? 'text-orange-400' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-400">Serie</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.streak} <span className="text-xs text-gray-400">j</span>
          </p>
        </div>

        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalPulses}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserPulseStats;
