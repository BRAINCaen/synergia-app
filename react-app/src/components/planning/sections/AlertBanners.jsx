// ==========================================
// 📁 components/planning/sections/AlertBanners.jsx
// BANNIÈRES D'ALERTES PLANNING
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle } from 'lucide-react';

const getDemandLevelColor = (level) => {
  switch (level) {
    case 'very_high': return 'bg-gradient-to-r from-red-600 to-orange-600';
    case 'high': return 'bg-gradient-to-r from-orange-600 to-amber-600';
    case 'medium': return 'bg-gradient-to-r from-amber-600 to-yellow-600';
    default: return 'bg-gradient-to-r from-blue-600 to-purple-600';
  }
};

const getDemandLevelText = (level) => {
  switch (level) {
    case 'very_high': return 'Affluence très forte attendue';
    case 'high': return 'Affluence forte attendue';
    case 'medium': return 'Affluence modérée attendue';
    default: return 'Période normale';
  }
};

const AlertBanners = ({ shifts, loading, weekAnalysis }) => {
  return (
    <>
      {/* ALERTE AUCUN SHIFT */}
      {shifts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-orange-500/20 rounded-2xl p-6 border-2 border-orange-500/50"
        >
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">⚠️ Aucun shift cette semaine</h3>
              <p className="text-orange-200">
                Utilisez "Diagnostic" pour voir tous vos shifts existants.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ALERTE DEMANDE FORTE */}
      {weekAnalysis && weekAnalysis.summary.hasHighDemand && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 ${getDemandLevelColor(weekAnalysis.summary.demandLevel)} rounded-2xl p-6 border-2 border-white/20`}
        >
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-white flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                ⚠️ {getDemandLevelText(weekAnalysis.summary.demandLevel).toUpperCase()}
              </h3>
              <div className="text-white/90 text-sm space-y-1">
                {weekAnalysis.summary.totalHolidays > 0 && (
                  <p>🎊 {weekAnalysis.summary.totalHolidays} jour(s) férié(s)</p>
                )}
                {weekAnalysis.summary.totalSchoolHolidays > 0 && (
                  <p>🏫 Vacances scolaires Zone Normandie</p>
                )}
                {weekAnalysis.summary.totalBridges > 0 && (
                  <p>🌉 {weekAnalysis.summary.totalBridges} pont(s)</p>
                )}
                <p className="font-semibold mt-2">👥 Prévoir personnel supplémentaire !</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AlertBanners;
