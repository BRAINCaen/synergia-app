import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileText } from 'lucide-react';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TimesheetExportModal = ({
  showExportModal,
  setShowExportModal,
  exportMonth,
  setExportMonth,
  exportYear,
  setExportYear,
  exportEmployeeId,
  setExportEmployeeId,
  employees,
  handleExportExcel,
  exporting
}) => {
  // Générer les années disponibles (5 ans en arrière)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i <= 5; i++) {
    availableYears.push(currentYear - i);
  }

  return (
    <AnimatePresence>
      {showExportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowExportModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Export des Pointages
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Info box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">Export Excel complet</p>
                  <p className="text-gray-400">
                    Génère un fichier Excel modifiable avec les arrivées, départs, heures travaillées, congés et statistiques.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Mois */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Mois</label>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {MONTHS_FR.map((month, index) => (
                    <option key={index} value={index} className="bg-slate-900">
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Année */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Année</label>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className="bg-slate-900">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employé */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Employé</label>
                <select
                  value={exportEmployeeId}
                  onChange={(e) => setExportEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="all" className="bg-slate-900">Tous les employés</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900">
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimesheetExportModal;
