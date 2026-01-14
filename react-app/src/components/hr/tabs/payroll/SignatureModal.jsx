// ==========================================
// 📁 components/hr/tabs/payroll/SignatureModal.jsx
// MODAL DE SIGNATURE ÉLECTRONIQUE
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, PenTool } from 'lucide-react';
import SignatureCanvas from '../../SignatureCanvas.jsx';

const SignatureModal = ({
  show,
  onClose,
  onSign,
  selectedMonth,
  selectedYear,
  currentUser,
  MONTHS_FR
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-purple-400" />
                Signature électronique
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium mb-1">
                    Période : {MONTHS_FR[selectedMonth]} {selectedYear}
                  </p>
                  <p className="text-gray-400">
                    En signant, vous certifiez que les pointages affichés sont corrects.
                  </p>
                </div>
              </div>
            </div>

            <SignatureCanvas
              onSave={onSign}
              onCancel={onClose}
              employeeName={currentUser?.displayName || currentUser?.email || 'Employé'}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignatureModal;
