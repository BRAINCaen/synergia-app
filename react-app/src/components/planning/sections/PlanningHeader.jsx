// ==========================================
// 📁 components/planning/sections/PlanningHeader.jsx
// HEADER DU PLANNING
// ==========================================

import React from 'react';
import {
  RefreshCw,
  Download,
  Copy,
  AlertCircle,
  Database,
  Palmtree,
  CalendarDays
} from 'lucide-react';

const PlanningHeader = ({
  hrSettings,
  showAnomalies,
  setShowAnomalies,
  loadingAnomalies,
  onDiagnostic,
  diagnosticLoading,
  onRefresh,
  refreshing,
  onExportPDF,
  exporting,
  onDuplicateWeek,
  onOpenLeaveModal,
  onOpenLeaveAdmin,
  pendingLeaveRequestsCount
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            📅 Planning Équipe
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Gestion avancée - Zone Normandie</p>
          {hrSettings.rules.conventionCollective && (
            <p className="text-xs text-gray-500 mt-1">📋 {hrSettings.rules.conventionCollective}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {hrSettings.positions.length > 0 && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                ✅ {hrSettings.positions.length} poste(s)
              </span>
            )}
            {hrSettings.absences.length > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                ✅ {hrSettings.absences.length} absence(s)
              </span>
            )}
            {hrSettings.alerts.filter(a => a.active).length > 0 && (
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                ✅ {hrSettings.alerts.filter(a => a.active).length} alerte(s)
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Toggle Anomalies */}
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`${
              showAnomalies
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-gray-700/50 hover:bg-gray-600/50'
            } text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm`}
          >
            {loadingAnomalies ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {showAnomalies ? 'Anomalies ON' : 'Anomalies OFF'}
            </span>
          </button>

          <button
            onClick={onDiagnostic}
            disabled={diagnosticLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {diagnosticLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Diagnostic</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={onExportPDF}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={onDuplicateWeek}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Dupliquer</span>
          </button>

          <button
            onClick={onOpenLeaveModal}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
          >
            <Palmtree className="w-4 h-4" />
            <span className="hidden sm:inline">Congés</span>
          </button>

          {pendingLeaveRequestsCount > 0 && (
            <button
              onClick={onOpenLeaveAdmin}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm relative"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Demandes</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingLeaveRequestsCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningHeader;
