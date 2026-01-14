// ==========================================
// 📁 components/planning/modals/LeaveRequestModal.jsx
// MODAL DEMANDE DE CONGÉS
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palmtree, Send } from 'lucide-react';

const LeaveRequestModal = ({
  show,
  onClose,
  leaveBalance,
  leaveRequestForm,
  setLeaveRequestForm,
  submitting,
  onSubmit,
  myLeaveRequests,
  LEAVE_TYPES,
  REQUEST_STATUS,
  getAvailableBalance
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
          className="bg-gray-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto border-t sm:border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Palmtree className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Demande de congés</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Solde actuel */}
          <div className="mb-5 p-3 bg-gray-700/30 rounded-xl border border-gray-600/50">
            <p className="text-gray-400 text-xs mb-2">Mon solde disponible (jours complets)</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-amber-400 text-sm">🏖️ CP: {getAvailableBalance('paid_leave')}j</span>
              <span className="text-purple-400 text-sm">🎁 Bonus: {getAvailableBalance('bonus_day')}j</span>
              <span className="text-green-400 text-sm">⏰ RTT: {getAvailableBalance('rtt')}j</span>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4">
            {/* Type de demande */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Type de demande</label>
              <select
                value={leaveRequestForm.leaveType}
                onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, leaveType: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-amber-500 focus:outline-none"
              >
                <optgroup label="📊 Congés comptabilisés (jours complets)">
                  {Object.entries(LEAVE_TYPES)
                    .filter(([_, type]) => type.category === 'counted')
                    .map(([id, type]) => (
                      <option key={id} value={id}>
                        {type.emoji} {type.label} ({getAvailableBalance(id)}j dispo)
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📋 Demandes spécifiques (illimité)">
                  {Object.entries(LEAVE_TYPES)
                    .filter(([_, type]) => type.category === 'specific')
                    .map(([id, type]) => (
                      <option key={id} value={id}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="📝 Absences justifiées">
                  {Object.entries(LEAVE_TYPES)
                    .filter(([_, type]) => type.category === 'justified')
                    .map(([id, type]) => (
                      <option key={id} value={id}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Info demande spécifique */}
            {LEAVE_TYPES[leaveRequestForm.leaveType]?.category === 'specific' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm">
                  💡 Les demandes spécifiques sont <strong>illimitées</strong> et ne déduisent pas de vos compteurs.
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {LEAVE_TYPES[leaveRequestForm.leaveType]?.isHalfDay || LEAVE_TYPES[leaveRequestForm.leaveType]?.isEvening
                    ? 'Date'
                    : 'Date début'}
                </label>
                <input
                  type="date"
                  value={leaveRequestForm.startDate}
                  onChange={(e) => setLeaveRequestForm({
                    ...leaveRequestForm,
                    startDate: e.target.value,
                    endDate: LEAVE_TYPES[leaveRequestForm.leaveType]?.isHalfDay || LEAVE_TYPES[leaveRequestForm.leaveType]?.isEvening
                      ? e.target.value
                      : leaveRequestForm.endDate
                  })}
                  className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-xl border border-gray-600 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
              {!(LEAVE_TYPES[leaveRequestForm.leaveType]?.isHalfDay || LEAVE_TYPES[leaveRequestForm.leaveType]?.isEvening) && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date fin</label>
                  <input
                    type="date"
                    value={leaveRequestForm.endDate}
                    onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, endDate: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-xl border border-gray-600 focus:border-amber-500 focus:outline-none text-sm"
                  />
                </div>
              )}
              {LEAVE_TYPES[leaveRequestForm.leaveType]?.isHalfDay && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Période</label>
                  <select
                    value={leaveRequestForm.halfDayPeriod || 'morning'}
                    onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, halfDayPeriod: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2.5 rounded-xl border border-gray-600 focus:border-amber-500 focus:outline-none text-sm"
                  >
                    <option value="morning">🌅 Matin</option>
                    <option value="afternoon">☀️ Après-midi</option>
                  </select>
                </div>
              )}
            </div>

            {/* Motif */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Motif {LEAVE_TYPES[leaveRequestForm.leaveType]?.category === 'specific' ? '(recommandé)' : '(optionnel)'}
              </label>
              <textarea
                value={leaveRequestForm.reason}
                onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, reason: e.target.value })}
                placeholder={LEAVE_TYPES[leaveRequestForm.leaveType]?.category === 'specific'
                  ? "Ex: RDV médical, obligation personnelle..."
                  : "Ex: Vacances familiales..."}
                rows={2}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-amber-500 focus:outline-none resize-none text-sm"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting || !leaveRequestForm.startDate || !leaveRequestForm.endDate}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>

          {/* Mes demandes récentes */}
          {myLeaveRequests.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-3">Mes demandes récentes</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {myLeaveRequests.slice(0, 3).map((req) => {
                  const status = REQUEST_STATUS[req.status];
                  return (
                    <div
                      key={req.id}
                      className={`p-2 rounded-lg ${status.bgColor} border ${status.borderColor} text-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={status.color}>
                          {status.emoji} {LEAVE_TYPES[req.leaveType]?.label}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(req.startDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaveRequestModal;
