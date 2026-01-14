import React from 'react';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';

const EstablishmentSection = ({ establishment, setEstablishment }) => {
  return (
    <motion.div
      key="establishment"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Informations légales de l'établissement</p>
            <p className="text-gray-400">Ces données sont utilisées pour la génération des documents officiels</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Nom de l'établissement *</label>
            <input
              type="text"
              value={establishment.name}
              onChange={(e) => setEstablishment({ ...establishment, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Dénomination sociale *</label>
            <input
              type="text"
              value={establishment.legalName}
              onChange={(e) => setEstablishment({ ...establishment, legalName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">Adresse</label>
          <input
            type="text"
            value={establishment.address}
            onChange={(e) => setEstablishment({ ...establishment, address: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Numéro et nom de rue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Code postal</label>
            <input
              type="text"
              value={establishment.postalCode}
              onChange={(e) => setEstablishment({ ...establishment, postalCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Ville</label>
            <input
              type="text"
              value={establishment.city}
              onChange={(e) => setEstablishment({ ...establishment, city: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Numéro de SIRET</label>
            <input
              type="text"
              value={establishment.siret}
              onChange={(e) => setEstablishment({ ...establishment, siret: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="14 chiffres"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Numéro de TVA</label>
            <input
              type="text"
              value={establishment.tva}
              onChange={(e) => setEstablishment({ ...establishment, tva: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="FR..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Code NAF/APE</label>
            <input
              type="text"
              value={establishment.nafCode}
              onChange={(e) => setEstablishment({ ...establishment, nafCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-medium">Code URSSAF</label>
            <input
              type="text"
              value={establishment.urssafCode}
              onChange={(e) => setEstablishment({ ...establishment, urssafCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">Service de Santé au Travail</label>
          <input
            type="text"
            value={establishment.healthService}
            onChange={(e) => setEstablishment({ ...establishment, healthService: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom du service de santé"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EstablishmentSection;
