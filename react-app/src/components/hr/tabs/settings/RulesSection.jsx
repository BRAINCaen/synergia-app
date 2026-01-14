import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const RulesSection = ({ rules, setRules }) => {
  return (
    <motion.div
      key="rules"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Configurez votre espace selon votre convention collective</p>
            <p className="text-gray-400">Ces règles s'appliquent au planning et aux alertes de conformité</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* CONVENTION COLLECTIVE */}
        <div>
          <label className="block text-white font-semibold mb-3 text-lg">Convention collective</label>
          <select
            value={rules.conventionCollective}
            onChange={(e) => setRules({ ...rules, conventionCollective: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="IDCC 1790 - Espaces de loisirs, d'attractions et culturels">IDCC 1790 - Espaces de loisirs, d'attractions et culturels</option>
            <option value="Convention collective nationale">Convention collective nationale</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* DURÉE DE TRAVAIL AVANT PAUSE */}
        <div>
          <label className="block text-white font-semibold mb-2">Durée de travail avant déclenchement d'une pause</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={rules.workHoursBeforeBreak}
              onChange={(e) => setRules({ ...rules, workHoursBeforeBreak: parseInt(e.target.value) })}
              className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="text-gray-400">heures travaillées</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Temps de pause obligatoire : {rules.breakDuration} minutes
          </p>
        </div>

        {/* RÉMUNÉRATION DES PAUSES */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.payBreaks}
              onChange={(e) => setRules({ ...rules, payBreaks: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-white font-semibold">Activer la rémunération des pauses</span>
              <p className="text-sm text-gray-400">Les pauses seront comptabilisées dans le temps de travail</p>
            </div>
          </label>
        </div>

        {/* TAUX DE CHARGES */}
        <div>
          <label className="block text-white font-semibold mb-2">Taux de charges patronales</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={rules.chargesRate}
              onChange={(e) => setRules({ ...rules, chargesRate: parseInt(e.target.value) })}
              className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
            <span className="text-gray-400">%</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Utilisé pour le calcul du taux horaire chargé
          </p>
        </div>

        {/* INDEMNITÉS REPAS */}
        <div className="border-t border-gray-700 pt-4">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={rules.mealCompensation}
              onChange={(e) => setRules({ ...rules, mealCompensation: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-white font-semibold">Indemniser les repas de mes employés</span>
              <p className="text-sm text-gray-400">Les indemnités sont calculées à partir des plannings</p>
            </div>
          </label>

          {rules.mealCompensation && (
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Règles d'indemnisation</label>
              <textarea
                value={rules.mealRules}
                onChange={(e) => setRules({ ...rules, mealRules: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Définissez les règles pour attribuer les indemnités repas..."
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RulesSection;
