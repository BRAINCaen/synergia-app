import React from 'react';

const ContractSection = ({ contractData, setContractData, isEditing }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Données contractuelles</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Type de contrat *</label>
          {isEditing ? (
            <select
              value={contractData.contractType}
              onChange={(e) => setContractData({ ...contractData, contractType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Apprenti">Apprenti</option>
              <option value="Alternance">Alternance</option>
              <option value="Stage">Stage</option>
              <option value="Temps Plein">Temps Plein</option>
              <option value="Temps Partiel">Temps Partiel</option>
            </select>
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractType || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Intitulé du poste</label>
          {isEditing ? (
            <input
              type="text"
              value={contractData.jobTitle}
              onChange={(e) => setContractData({ ...contractData, jobTitle: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Gestion PME PMI"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.jobTitle || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Date d'arrivée dans l'organisation</label>
          {isEditing ? (
            <input
              type="date"
              value={contractData.startDateOrg}
              onChange={(e) => setContractData({ ...contractData, startDateOrg: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.startDateOrg || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Date de début de contrat *</label>
          {isEditing ? (
            <input
              type="datetime-local"
              value={contractData.contractStartDate}
              onChange={(e) => setContractData({ ...contractData, contractStartDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractStartDate || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Date de fin de période d'essai</label>
          {isEditing ? (
            <input
              type="date"
              value={contractData.trialEndDate}
              onChange={(e) => setContractData({ ...contractData, trialEndDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.trialEndDate || '-'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Date de fin de contrat</label>
          {isEditing ? (
            <input
              type="date"
              value={contractData.contractEndDate}
              onChange={(e) => setContractData({ ...contractData, contractEndDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractEndDate || 'CDI'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Statut</label>
          {isEditing ? (
            <select
              value={contractData.status}
              onChange={(e) => setContractData({ ...contractData, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Employé">Employé</option>
              <option value="Cadre">Cadre</option>
              <option value="Agent de maîtrise">Agent de maîtrise</option>
              <option value="Ouvrier">Ouvrier</option>
            </select>
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.status}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Matricule contrat</label>
          {isEditing ? (
            <input
              type="text"
              value={contractData.registrationNumber}
              onChange={(e) => setContractData({ ...contractData, registrationNumber: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: CAR00001"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.registrationNumber || 'Non renseigné'}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-gray-300 mb-2 text-sm font-medium">Code PCS-ESE</label>
          {isEditing ? (
            <input
              type="text"
              value={contractData.pcsCode}
              onChange={(e) => setContractData({ ...contractData, pcsCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 55 Employés de commerce - 553c Autres vendeurs non spécialisés"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.pcsCode || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">DPAE effectuée ?</label>
          {isEditing ? (
            <select
              value={contractData.dpaeCompleted ? 'true' : 'false'}
              onChange={(e) => setContractData({ ...contractData, dpaeCompleted: e.target.value === 'true' })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          ) : (
            <p className={`px-4 py-2 rounded-lg ${contractData.dpaeCompleted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {contractData.dpaeCompleted ? 'Oui' : 'Non'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Date de la dernière visite médicale</label>
          {isEditing ? (
            <input
              type="date"
              value={contractData.lastMedicalVisit}
              onChange={(e) => setContractData({ ...contractData, lastMedicalVisit: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.lastMedicalVisit || 'Non renseigné'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractSection;
