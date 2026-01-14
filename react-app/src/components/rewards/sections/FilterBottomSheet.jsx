// ==========================================
// 📁 components/rewards/sections/FilterBottomSheet.jsx
// BOTTOM SHEET FILTRES MOBILE
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

const INDIVIDUAL_CATEGORIES = [
  'Mini-plaisirs', 'Petits avantages', 'Plaisirs utiles', 'Food & cadeaux',
  'Bien-etre', 'Loisirs', 'Lifestyle', 'Temps offert', 'Grands plaisirs', 'Premium'
];

const FilterBottomSheet = ({ isOpen, onClose, filterCategory, setFilterCategory, activeTab }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 rounded-t-3xl max-h-[70vh] overflow-y-auto"
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
          </div>
          <div className="px-4 pb-8 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                Filtres
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Categorie</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setFilterCategory('all'); onClose(); }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    filterCategory === 'all'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  Toutes
                </button>
                {activeTab === 'individual' ? (
                  INDIVIDUAL_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setFilterCategory(cat); onClose(); }}
                      className={`p-3 rounded-xl text-sm font-medium transition-all truncate ${
                        filterCategory === cat
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-white/5 text-gray-400 border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => { setFilterCategory('Team'); onClose(); }}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      filterCategory === 'Team'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-white/5 text-gray-400 border border-transparent'
                    }`}
                  >
                    Team
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default FilterBottomSheet;
