// ==========================================
// 📁 components/planning/modals/NotesModal.jsx
// MODAL NOTES DE PLANNING
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, StickyNote, History, Save } from 'lucide-react';

const NotesModal = ({
  show,
  onClose,
  weekNumber,
  year,
  editingNoteText,
  setEditingNoteText,
  lastYearNotes,
  savingNote,
  onSave
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border-t sm:border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <StickyNote className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notes de planning</h2>
                <p className="text-gray-400 text-sm">
                  Semaine {weekNumber} / {year}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Notes et remarques pour cette semaine
            </label>
            <p className="text-gray-500 text-xs mb-3">
              Ces notes seront rappelées l'année prochaine sur la même semaine.
            </p>
            <textarea
              value={editingNoteText}
              onChange={(e) => setEditingNoteText(e.target.value)}
              placeholder="Ex: Prévoir plus de personnel le soir, trop de monde pendant les vacances..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Rappel année précédente dans le modal */}
          {lastYearNotes && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">
                  Note de {lastYearNotes.year}
                </span>
              </div>
              <p className="text-amber-200/80 text-sm">{lastYearNotes.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              disabled={savingNote}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingNote ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotesModal;
