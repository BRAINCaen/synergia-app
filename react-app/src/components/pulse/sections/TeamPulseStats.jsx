// ==========================================
// TeamPulseStats - Team pulse statistics
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TeamPulseStats = ({ teamPulse, MOOD_LEVELS }) => {
  if (!teamPulse || teamPulse.totalResponses === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Pas encore de donnees d'equipe</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (teamPulse.trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (teamPulse.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getMoodColor = (value) => {
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Pulse Equipe
        </h3>
        <div className="flex items-center gap-1 text-xs">
          {getTrendIcon()}
          <span className={
            teamPulse.trend === 'up' ? 'text-green-400' :
            teamPulse.trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }>
            {teamPulse.trend === 'up' ? 'Hausse' :
             teamPulse.trend === 'down' ? 'Baisse' : 'Stable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className={`text-2xl font-bold ${getMoodColor(parseFloat(teamPulse.averageMood))}`}>
            {teamPulse.averageMood}
          </p>
          <p className="text-[10px] text-gray-400">Humeur</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-yellow-400">{teamPulse.averageEnergy}</p>
          <p className="text-[10px] text-gray-400">Energie</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-purple-400">{teamPulse.totalResponses}</p>
          <p className="text-[10px] text-gray-400">Reponses</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {Object.entries(teamPulse.moodDistribution || {}).map(([moodId, count]) => {
          const moodInfo = MOOD_LEVELS[moodId];
          const percent = (count / teamPulse.totalResponses) * 100;

          return (
            <div key={moodId} className="flex items-center gap-2">
              <span className="text-lg w-6">{moodInfo?.emoji || '😐'}</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${moodInfo?.color || 'from-gray-500 to-gray-600'}`}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TeamPulseStats;
