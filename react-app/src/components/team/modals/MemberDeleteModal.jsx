// ==========================================
// components/team/modals/MemberDeleteModal.jsx
// MODAL SUPPRESSION MEMBRE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const MemberDeleteModal = ({ member, onClose, onDelete }) => {
  if (!member) return null;

  return (
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
        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-6 text-red-500">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Suppression definitive</h3>
        </div>

        <p className="text-gray-300 mb-6">
          Etes-vous absolument certain de vouloir supprimer <strong>{member.name}</strong> ?
          Cette action est irreversible et toutes les donnees seront perdues.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberDeleteModal;
