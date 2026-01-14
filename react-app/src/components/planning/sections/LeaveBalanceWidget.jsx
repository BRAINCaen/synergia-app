// ==========================================
// 📁 components/planning/sections/LeaveBalanceWidget.jsx
// WIDGET SOLDE CONGÉS
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Palmtree } from 'lucide-react';

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

const LeaveBalanceWidget = ({ leaveBalance, getAvailableBalance }) => {
  if (!leaveBalance) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <GlassCard className="!p-3 sm:!p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Palmtree className="w-5 h-5 text-amber-400" />
            <span className="text-white font-medium text-sm">Mon solde congés :</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <span className="text-amber-300 text-sm">
                🏖️ CP: <span className="font-bold">{getAvailableBalance('paid_leave')}</span> jours
              </span>
            </div>
            {(leaveBalance.bonusOffDays || 0) > 0 && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
                <span className="text-purple-300 text-sm">
                  🎁 Bonus: <span className="font-bold">{getAvailableBalance('bonus_day')}</span> jours
                </span>
              </div>
            )}
            {(leaveBalance.rttDays || 0) > 0 && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                <span className="text-green-300 text-sm">
                  ⏰ RTT: <span className="font-bold">{getAvailableBalance('rtt')}</span> jours
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default LeaveBalanceWidget;
