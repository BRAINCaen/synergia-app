import React from 'react';
import {
  Download, Clock, Calendar, FileText, Users, CheckCircle, Printer,
  FileSpreadsheet, Loader2
} from 'lucide-react';
import GlassCard from '../../GlassCard.jsx';

const ExportSection = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedEmployee,
  setSelectedEmployee,
  employees,
  timesheets,
  leaves,
  years,
  exporting,
  exportSuccess,
  onExportExcel,
  onExportCSV,
  onExportPayrollComplete,
  onPrint,
  MONTHS_FR
}) => {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Exports Paie</h2>
          <p className="text-gray-400">Génération des fichiers de paie</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExportCSV}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={onPrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Sélecteurs de période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Mois</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
          >
            {MONTHS_FR.map((month, idx) => (
              <option key={idx} value={idx} className="bg-gray-800">{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Année</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
          >
            {years.map(year => (
              <option key={year} value={year} className="bg-gray-800">{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Employé</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
          >
            <option value="all" className="bg-gray-800">Tous les employés</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id} className="bg-gray-800">
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message de succès */}
      {exportSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300">{exportSuccess}</span>
        </div>
      )}

      {/* Boutons d'export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center py-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <p className="text-white text-lg font-semibold mb-1">Export Paie Complet</p>
          <p className="text-gray-400 text-xs mb-4 px-4">
            Contrats • Détails employés • Pointages • Absences • Compteurs • Solde congés
          </p>
          <button
            onClick={onExportPayrollComplete}
            disabled={exporting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Paie ({MONTHS_FR[selectedMonth]} {selectedYear})
              </>
            )}
          </button>
        </div>

        <div className="text-center py-6 bg-white/5 rounded-xl">
          <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-white text-lg font-semibold mb-1">Export Pointages</p>
          <p className="text-gray-400 text-xs mb-4 px-4">
            Feuille par employé + récapitulatif mensuel
          </p>
          <button
            onClick={onExportExcel}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Pointages
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{employees.length}</p>
          <p className="text-gray-400 text-sm">Employés</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{timesheets.length}</p>
          <p className="text-gray-400 text-sm">Pointages</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{leaves?.filter(l => l.status === 'approved').length || 0}</p>
          <p className="text-gray-400 text-sm">Congés validés</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <FileText className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{MONTHS_FR[selectedMonth]}</p>
          <p className="text-gray-400 text-sm">{selectedYear}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default ExportSection;
