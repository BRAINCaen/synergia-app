// ==========================================
// react-app/src/components/exports/ExportReportsPanel.jsx
// PANNEAU EXPORT & RAPPORTS - SYNERGIA v4.0
// Module: Export PDF/Excel avec interface utilisateur
// ==========================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportService } from '../../core/services/exportService';
import { useAuthStore } from '../../shared/stores/authStore';

// ==========================================
// CONFIGURATION DES EXPORTS
// ==========================================
const EXPORT_TYPES = {
  stats: {
    id: 'stats',
    title: 'Statistiques Personnelles',
    description: 'Export complet de votre profil, XP, badges et historique',
    icon: '📊',
    formats: ['PDF', 'Excel', 'JSON', 'CSV'],
    color: 'from-indigo-500 to-purple-500'
  },
  planning: {
    id: 'planning',
    title: 'Planning Hebdomadaire',
    description: 'Export du planning avec tous les créneaux de la semaine',
    icon: '📅',
    formats: ['PDF'],
    color: 'from-blue-500 to-cyan-500',
    managerOnly: true
  },
  monthly: {
    id: 'monthly',
    title: 'Rapport Mensuel Équipe',
    description: 'Rapport complet avec métriques et performances',
    icon: '📈',
    formats: ['PDF'],
    color: 'from-emerald-500 to-teal-500',
    managerOnly: true
  },
  pointages: {
    id: 'pointages',
    title: 'Rapport de Pointages',
    description: 'Historique des heures de travail et présences',
    icon: '⏱️',
    formats: ['PDF'],
    color: 'from-amber-500 to-orange-500'
  },
  quests: {
    id: 'quests',
    title: 'Historique des Quêtes',
    description: 'Liste des quêtes terminées et XP gagné',
    icon: '⚔️',
    formats: ['PDF'],
    color: 'from-purple-500 to-pink-500'
  }
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default function ExportReportsPanel({
  planningData = null,
  teamData = null,
  pointagesData = null,
  questsData = null,
  onClose = null,
  className = ''
}) {
  const { user } = useAuthStore();
  const [selectedExport, setSelectedExport] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  // Options d'export
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeBadges: true,
    includeHistory: true,
    weekStart: new Date(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    period: 'Ce mois'
  });

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleExport = useCallback(async () => {
    if (!selectedExport) return;

    setIsExporting(true);
    setExportSuccess(null);
    setExportError(null);

    try {
      let result;

      switch (selectedExport.id) {
        case 'stats':
          if (selectedFormat === 'PDF') {
            result = await exportService.exportStatsToPDF(user, exportOptions);
          } else if (selectedFormat === 'Excel') {
            result = await exportService.exportStatsToExcel(user, exportOptions);
          } else if (selectedFormat === 'JSON') {
            result = exportService.exportToJSON(user, exportOptions);
          } else if (selectedFormat === 'CSV') {
            result = exportService.exportToCSV(user, exportOptions);
          }
          break;

        case 'planning':
          result = await exportService.exportPlanningToPDF(planningData, {
            weekStart: exportOptions.weekStart,
            employees: planningData?.employees || [],
            shifts: planningData?.shifts || []
          });
          break;

        case 'monthly':
          result = await exportService.exportTeamMonthlyReport(teamData, {
            month: exportOptions.month,
            year: exportOptions.year,
            teamName: teamData?.teamName || 'Mon Équipe',
            employees: teamData?.employees || [],
            metrics: teamData?.metrics || {}
          });
          break;

        case 'pointages':
          result = await exportService.exportPointagesToPDF(pointagesData, {
            employeeName: user?.displayName || 'Employé',
            period: exportOptions.period,
            pointages: pointagesData?.pointages || []
          });
          break;

        case 'quests':
          result = await exportService.exportQuestsToPDF(questsData, {
            userName: user?.displayName || 'Utilisateur',
            quests: questsData?.quests || []
          });
          break;

        default:
          throw new Error('Type d\'export non reconnu');
      }

      if (result?.success) {
        setExportSuccess(`Export réussi: ${result.fileName}`);
        setTimeout(() => setExportSuccess(null), 5000);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      setExportError('Erreur lors de l\'export. Veuillez réessayer.');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  }, [selectedExport, selectedFormat, user, exportOptions, planningData, teamData, pointagesData, questsData]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500
                        rounded-xl flex items-center justify-center text-xl sm:text-2xl">
            📥
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Export & Rapports</h2>
            <p className="text-xs sm:text-sm text-white/60">Téléchargez vos données en PDF ou Excel</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-white/60">✕</span>
          </button>
        )}
      </div>

      {/* Types d'export */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {Object.values(EXPORT_TYPES).map((exportType) => {
          // Cacher les exports manager-only pour les non-managers
          if (exportType.managerOnly && !isManager) return null;

          const isSelected = selectedExport?.id === exportType.id;

          return (
            <motion.button
              key={exportType.id}
              onClick={() => {
                setSelectedExport(exportType);
                setSelectedFormat(exportType.formats[0]);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-gradient-to-br ' + exportType.color + ' border-transparent'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{exportType.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm sm:text-base ${
                    isSelected ? 'text-white' : 'text-white/90'
                  }`}>
                    {exportType.title}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isSelected ? 'text-white/80' : 'text-white/50'
                  }`}>
                    {exportType.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exportType.formats.map((format) => (
                      <span
                        key={format}
                        className={`px-2 py-0.5 rounded text-xs ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Options d'export (si sélectionné) */}
      <AnimatePresence>
        {selectedExport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Options d'export</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Format */}
                {selectedExport.formats.length > 1 && (
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Format</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg
                               text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {selectedExport.formats.map((format) => (
                        <option key={format} value={format} className="bg-slate-800">
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Options spécifiques au type */}
                {selectedExport.id === 'stats' && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeBadges"
                        checked={exportOptions.includeBadges}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeBadges: e.target.checked
                        })}
                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                      />
                      <label htmlFor="includeBadges" className="text-sm text-white/70">
                        Inclure les badges
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeHistory"
                        checked={exportOptions.includeHistory}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeHistory: e.target.checked
                        })}
                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                      />
                      <label htmlFor="includeHistory" className="text-sm text-white/70">
                        Inclure l'historique XP
                      </label>
                    </div>
                  </>
                )}

                {selectedExport.id === 'planning' && (
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Début de semaine</label>
                    <input
                      type="date"
                      value={exportOptions.weekStart.toISOString().split('T')[0]}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        weekStart: new Date(e.target.value)
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg
                               text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {selectedExport.id === 'monthly' && (
                  <>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Mois</label>
                      <select
                        value={exportOptions.month}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          month: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg
                                 text-white text-sm focus:outline-none focus:border-indigo-500"
                      >
                        {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, i) => (
                          <option key={i} value={i} className="bg-slate-800">
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Année</label>
                      <input
                        type="number"
                        value={exportOptions.year}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          year: parseInt(e.target.value)
                        })}
                        min="2020"
                        max="2030"
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg
                                 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {selectedExport.id === 'pointages' && (
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Période</label>
                    <select
                      value={exportOptions.period}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        period: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg
                               text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Cette semaine" className="bg-slate-800">Cette semaine</option>
                      <option value="Ce mois" className="bg-slate-800">Ce mois</option>
                      <option value="Les 3 derniers mois" className="bg-slate-800">3 derniers mois</option>
                      <option value="Cette année" className="bg-slate-800">Cette année</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'export */}
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              whileHover={{ scale: isExporting ? 1 : 1.02 }}
              whileTap={{ scale: isExporting ? 1 : 0.98 }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white
                        flex items-center justify-center gap-2 transition-all ${
                isExporting
                  ? 'bg-white/10 cursor-wait'
                  : 'bg-gradient-to-r ' + selectedExport.color + ' hover:shadow-lg'
              }`}
            >
              {isExporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Export en cours...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Exporter en {selectedFormat}</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages de succès/erreur */}
      <AnimatePresence>
        {exportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg
                     text-emerald-400 text-sm flex items-center gap-2"
          >
            <span>✅</span>
            <span>{exportSuccess}</span>
          </motion.div>
        )}

        {exportError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg
                     text-red-400 text-sm flex items-center gap-2"
          >
            <span>❌</span>
            <span>{exportError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message si rien n'est sélectionné */}
      {!selectedExport && (
        <div className="text-center py-6 text-white/40">
          <span className="text-3xl block mb-2">👆</span>
          <p className="text-sm">Sélectionnez un type d'export ci-dessus</p>
        </div>
      )}
    </div>
  );
}
