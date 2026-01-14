// ==========================================
// components/team/modals/MemberEditModal.jsx
// MODAL EDITION MEMBRE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const MemberEditModal = ({ member, onMemberChange, onClose, onSave }) => {
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Modifier le membre</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nom</label>
            <input
              type="text"
              value={member.name}
              onChange={(e) => onMemberChange({...member, name: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
            <input
              type="text"
              value={member.role}
              onChange={(e) => onMemberChange({...member, role: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Departement</label>
            <input
              type="text"
              value={member.department}
              onChange={(e) => onMemberChange({...member, department: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
            <select
              value={member.status}
              onChange={(e) => onMemberChange({...member, status: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
            >
              <option value="actif" className="bg-slate-900">Actif</option>
              <option value="inactif" className="bg-slate-900">Inactif</option>
              <option value="suspendu" className="bg-slate-900">Suspendu</option>
              <option value="bloque" className="bg-slate-900">Bloque</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberEditModal;
