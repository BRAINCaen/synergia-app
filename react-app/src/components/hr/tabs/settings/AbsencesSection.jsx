import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const AbsencesSection = ({ absences, setAbsences }) => {
  return (
    <motion.div
      key="absences"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Configurez les types d'absences</p>
            <p className="text-gray-400">Définissez quelles absences sont incluses dans les compteurs et peuvent être demandées</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {absences.map((absence) => (
          <div key={absence.id} className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={absence.active}
                    onChange={(e) => {
                      const updatedAbsences = absences.map(a =>
                        a.id === absence.id ? { ...a, active: e.target.checked } : a
                      );
                      setAbsences(updatedAbsences);
                    }}
                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-white font-semibold">{absence.name}</span>
                </div>

                <div className="ml-8 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={absence.includeInCounter}
                      onChange={(e) => {
                        const updatedAbsences = absences.map(a =>
                          a.id === absence.id ? { ...a, includeInCounter: e.target.checked } : a
                        );
                        setAbsences(updatedAbsences);
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      disabled={!absence.active}
                    />
                    Inclus dans le compteur d'heures
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={absence.allowsAccrual}
                      onChange={(e) => {
                        const updatedAbsences = absences.map(a =>
                          a.id === absence.id ? { ...a, allowsAccrual: e.target.checked } : a
                        );
                        setAbsences(updatedAbsences);
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      disabled={!absence.active}
                    />
                    Permet l'acquisition de congés
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={absence.employeeRequest}
                      onChange={(e) => {
                        const updatedAbsences = absences.map(a =>
                          a.id === absence.id ? { ...a, employeeRequest: e.target.checked } : a
                        );
                        setAbsences(updatedAbsences);
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      disabled={!absence.active}
                    />
                    Peut être demandée par l'employé
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AbsencesSection;
