import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SalarySection = ({ salaryData, setSalaryData, isEditing }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Données salariales</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Temps de travail *</label>
          {isEditing ? (
            <select
              value={salaryData.workingTime}
              onChange={(e) => setSalaryData({ ...salaryData, workingTime: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">Standard</option>
              <option value="Temps partiel">Temps partiel</option>
              <option value="Temps plein">Temps plein</option>
              <option value="Forfait jours">Forfait jours</option>
            </select>
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.workingTime}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Heures par semaine</label>
          {isEditing ? (
            <input
              type="number"
              step="0.5"
              value={salaryData.weeklyHours}
              onChange={(e) => setSalaryData({ ...salaryData, weeklyHours: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.weeklyHours} h / semaine</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-gray-300 mb-2 text-sm font-medium">Avenants au volume horaire</label>
          {isEditing ? (
            <textarea
              value={salaryData.amendments}
              onChange={(e) => setSalaryData({ ...salaryData, amendments: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Aucun avenant ou décrire les avenants..."
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.amendments || 'Aucun avenant'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Salaire mensuel brut</label>
          {isEditing ? (
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={salaryData.monthlyGrossSalary}
                onChange={(e) => setSalaryData({ ...salaryData, monthlyGrossSalary: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
            </div>
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.monthlyGrossSalary.toFixed(2)} €</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Taux horaire brut moyen</label>
          <p className="text-white bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
            {salaryData.hourlyGrossRate.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Calculé automatiquement</p>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Taux horaire moyen chargé</label>
          <p className="text-white bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
            {salaryData.chargedHourlyRate.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-400 mt-1">Avec charges patronales estimées</p>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Coût de transport pour l'employeur</label>
          {isEditing ? (
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={salaryData.transportCost}
                onChange={(e) => setSalaryData({ ...salaryData, transportCost: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
            </div>
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.transportCost.toFixed(2)} €</p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Information</p>
              <p>Le taux horaire brut moyen est calculé automatiquement : Salaire mensuel brut ÷ (Heures hebdomadaires × 52 semaines ÷ 12 mois)</p>
              <p className="mt-2">Le taux horaire chargé inclut une estimation des charges patronales à 43%.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalarySection;
