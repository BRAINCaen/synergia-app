// ==========================================
// 📁 components/planning/modals/AddShiftModal.jsx
// MODAL CRÉATION DE SHIFT
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AddShiftModal = ({
  show,
  onClose,
  selectedCell,
  newShift,
  setNewShift,
  complianceAlerts,
  onCheckCompliance,
  shiftTypes,
  onShiftTypeChange,
  onCreateShift,
  getEmployeeName
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">➕ Nouveau Shift</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {selectedCell && (
            <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/50">
              <p className="text-purple-300 text-sm">
                <strong>{getEmployeeName(selectedCell.employeeId)}</strong> -{' '}
                {new Date(selectedCell.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}

          {complianceAlerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {complianceAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'error'
                      ? 'bg-red-500/10 border-red-500/50'
                      : 'bg-yellow-500/10 border-yellow-500/50'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      alert.type === 'error' ? 'text-red-300' : 'text-yellow-300'
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Heure début</label>
                <input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) => {
                    const updated = { ...newShift, startTime: e.target.value };
                    setNewShift(updated);
                    if (selectedCell) {
                      onCheckCompliance(updated, selectedCell.employeeId, selectedCell.date);
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Heure fin</label>
                <input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) => {
                    const updated = { ...newShift, endTime: e.target.value };
                    setNewShift(updated);
                    if (selectedCell) {
                      onCheckCompliance(updated, selectedCell.employeeId, selectedCell.date);
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Poste / Absence</label>
              {shiftTypes.length > 0 ? (
                <select
                  value={newShift.position}
                  onChange={(e) => onShiftTypeChange(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                >
                  {shiftTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.isAbsence ? '🏖️ ' : '📌 '}
                      {type.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-400 text-sm">⚠️ Aucun poste configuré dans HR Settings</p>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Couleur</label>
              <div
                className="w-full h-10 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: newShift.color }}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Notes (optionnel)</label>
              <textarea
                value={newShift.notes}
                onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                placeholder="Ajouter une note..."
                rows={3}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              onClick={onCreateShift}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
            >
              Créer le shift
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddShiftModal;
