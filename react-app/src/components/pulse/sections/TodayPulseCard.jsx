// ==========================================
// TodayPulseCard - Shows today's completed pulse
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Check, MessageSquare } from 'lucide-react';

const TodayPulseCard = ({ pulse, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const moodInfo = MOOD_LEVELS[pulse.mood];
  const energyInfo = ENERGY_LEVELS[pulse.energy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/30 rounded-xl">
          <Check className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Pulse enregistre !</h3>
          <p className="text-green-300/70 text-xs">+10 XP gagnes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl ${moodInfo?.bgColor || 'bg-gray-500/20'}`}>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{moodInfo?.emoji || '😐'}</span>
            <div>
              <p className="text-[10px] text-gray-400">Humeur</p>
              <p className={`font-bold text-sm ${moodInfo?.textColor || 'text-white'}`}>
                {moodInfo?.label || 'Correct'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-yellow-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{energyInfo?.emoji || '🔌'}</span>
            <div>
              <p className="text-[10px] text-gray-400">Energie</p>
              <p className="font-bold text-sm text-yellow-400">
                {energyInfo?.label || 'Moyenne'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pulse.note && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
            <p className="text-gray-300 text-xs">{pulse.note}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TodayPulseCard;
