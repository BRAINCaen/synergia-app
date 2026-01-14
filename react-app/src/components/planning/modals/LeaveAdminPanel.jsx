// ==========================================
// 📁 components/planning/modals/LeaveAdminPanel.jsx
// PANEL ADMIN VALIDATION DES CONGÉS
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, CheckCircle, XCircle } from 'lucide-react';

const LeaveAdminPanel = ({
  show,
  onClose,
  pendingRequests,
  onApprove,
  onReject,
  LEAVE_TYPES
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-xl">
                <CalendarDays className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Demandes de congés</h2>
                <p className="text-gray-400 text-sm">{pendingRequests.length} en attente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">Aucune demande en attente</p>
              <p className="text-gray-400 text-sm">Toutes les demandes ont été traitées</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const leaveType = LEAVE_TYPES[request.leaveType];
                return (
                  <div
                    key={request.id}
                    className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50"
                  >
                    {/* Header demande */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
                          {request.userAvatar || '👤'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.userName}</p>
                          <p className="text-gray-400 text-xs">
                            {request.createdAt?.toLocaleDateString?.() || 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                      <div
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: `${leaveType?.color}20`, color: leaveType?.color }}
                      >
                        {leaveType?.emoji} {leaveType?.label}
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Période:</span>
                        <span className="text-white font-medium">
                          {new Date(request.startDate).toLocaleDateString('fr-FR')}
                          {request.startDate !== request.endDate && (
                            <> → {new Date(request.endDate).toLocaleDateString('fr-FR')}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Durée:</span>
                        <span className="text-amber-400 font-medium">
                          {request.numberOfDays} jour{request.numberOfDays > 1 ? 's' : ''}
                          {request.halfDay && ` (${request.halfDayPeriod === 'morning' ? 'matin' : 'après-midi'})`}
                        </span>
                      </div>
                      {request.reason && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-gray-400 text-xs">Motif:</p>
                          <p className="text-gray-300 text-sm">{request.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                      <button
                        onClick={() => onApprove(request.id)}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaveAdminPanel;
