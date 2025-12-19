// ==========================================
// react-app/src/components/export/ExportButton.jsx
// COMPOSANT BOUTON EXPORT - SYNERGIA v4.0
// Module 17: Export des donnees
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  ChevronDown,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { useExport } from '../../shared/hooks/useExport.js';

/**
 * Bouton simple d'export
 */
export const ExportButtonSimple = ({
  type = 'pdf',
  label,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const { exportToPDF, exportToExcel, exportToJSON, exportToCSV, exporting, exportType } = useExport();

  const handleExport = async () => {
    switch (type) {
      case 'pdf':
        await exportToPDF();
        break;
      case 'excel':
        await exportToExcel();
        break;
      case 'json':
        await exportToJSON();
        break;
      case 'csv':
        await exportToCSV();
        break;
    }
  };

  const icons = {
    pdf: FileText,
    excel: FileSpreadsheet,
    json: FileJson,
    csv: File
  };

  const labels = {
    pdf: 'PDF',
    excel: 'Excel',
    json: 'JSON',
    csv: 'CSV'
  };

  const Icon = icons[type] || Download;
  const isExporting = exporting && exportType === type;

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/10'
  };

  return (
    <motion.button
      onClick={handleExport}
      disabled={exporting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all ${sizes[size]} ${variants[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span>{label || labels[type]}</span>
    </motion.button>
  );
};

/**
 * Dropdown avec tous les formats d'export
 */
export const ExportDropdown = ({
  className = '',
  buttonLabel = 'Exporter',
  showLabels = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { exportToPDF, exportToExcel, exportToJSON, exportToCSV, exporting, exportType, lastExport } = useExport();

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Rapport PDF',
      description: 'Document complet avec graphiques',
      icon: FileText,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      action: exportToPDF
    },
    {
      id: 'excel',
      label: 'Fichier Excel',
      description: 'Tableur avec plusieurs feuilles',
      icon: FileSpreadsheet,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      action: exportToExcel
    },
    {
      id: 'csv',
      label: 'Fichier CSV',
      description: 'Donnees simples, compatible tous logiciels',
      icon: File,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      action: exportToCSV
    },
    {
      id: 'json',
      label: 'Donnees JSON',
      description: 'Format technique pour developpeurs',
      icon: FileJson,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      action: exportToJSON
    }
  ];

  const handleExport = async (option) => {
    setIsOpen(false);
    await option.action();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={exporting}
        className={`
          inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold
          bg-gradient-to-r from-purple-600 to-blue-600 text-white
          hover:from-purple-700 hover:to-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-purple-500/30 transition-all
        `}
      >
        {exporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>{exporting ? 'Export en cours...' : buttonLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 z-50 rounded-xl bg-gray-800 border border-gray-700 shadow-xl overflow-hidden"
            >
              <div className="p-2">
                {exportOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = exporting && exportType === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleExport(option)}
                      disabled={exporting}
                      className={`
                        w-full flex items-start gap-3 p-3 rounded-lg text-left
                        transition-colors
                        ${isActive
                          ? 'bg-purple-500/20'
                          : 'hover:bg-white/5'
                        }
                        disabled:opacity-50
                      `}
                    >
                      <div className={`p-2 rounded-lg ${option.bgColor}`}>
                        {isActive ? (
                          <Loader2 className={`w-5 h-5 ${option.color} animate-spin`} />
                        ) : (
                          <Icon className={`w-5 h-5 ${option.color}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{option.label}</p>
                        {showLabels && (
                          <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dernier export */}
              {lastExport && (
                <div className="px-4 py-3 border-t border-gray-700 bg-gray-900/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Dernier export: {lastExport.type.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Carte d'export complete pour les parametres
 */
export const ExportCard = ({ className = '' }) => {
  const { exportToPDF, exportToExcel, exportToJSON, exportToCSV, exporting, exportType, lastExport, error } = useExport();
  const [successMessage, setSuccessMessage] = useState(null);

  const handleExport = async (type, action) => {
    const result = await action();
    if (result.success) {
      setSuccessMessage(`${type} exporte avec succes!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Rapport complet',
      icon: FileText,
      color: 'from-red-500 to-rose-600',
      action: () => handleExport('PDF', exportToPDF)
    },
    {
      id: 'excel',
      label: 'Excel',
      description: 'Tableur detaille',
      icon: FileSpreadsheet,
      color: 'from-green-500 to-emerald-600',
      action: () => handleExport('Excel', exportToExcel)
    },
    {
      id: 'csv',
      label: 'CSV',
      description: 'Donnees brutes',
      icon: File,
      color: 'from-blue-500 to-cyan-600',
      action: () => handleExport('CSV', exportToCSV)
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'Format technique',
      icon: FileJson,
      color: 'from-yellow-500 to-amber-600',
      action: () => handleExport('JSON', exportToJSON)
    }
  ];

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Download className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Exporter mes donnees</h3>
          <p className="text-sm text-gray-400">Telechargez vos statistiques</p>
        </div>
      </div>

      {/* Message de succes */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message d'erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boutons d'export */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isActive = exporting && exportType === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={option.action}
              disabled={exporting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                p-4 rounded-xl text-center transition-all
                bg-gradient-to-br ${option.color}
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:shadow-lg hover:shadow-purple-500/20
              `}
            >
              <div className="flex flex-col items-center gap-2">
                {isActive ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Icon className="w-8 h-8 text-white" />
                )}
                <div>
                  <p className="font-bold text-white">{option.label}</p>
                  <p className="text-xs text-white/70">{option.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Vos donnees sont exportees de maniere securisee et ne sont jamais partagees.
      </p>
    </div>
  );
};

// Export par defaut
export default ExportDropdown;
