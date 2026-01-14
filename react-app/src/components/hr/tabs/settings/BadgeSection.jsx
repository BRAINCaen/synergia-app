import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const BadgeSection = ({ badgeSettings, setBadgeSettings }) => {
  return (
    <motion.div
      key="badge"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Configuration de la badgeuse</p>
            <p className="text-gray-400">Paramétrez les règles de mise au réel et les alertes de retard</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CODE PIN */}
        <div>
          <label className="block text-white font-semibold mb-2">Code PIN de la badgeuse</label>
          <input
            type="text"
            value={badgeSettings.pinCode}
            onChange={(e) => setBadgeSettings({ ...badgeSettings, pinCode: e.target.value })}
            className="w-40 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0000"
            maxLength="4"
          />
        </div>

        {/* RÈGLES DE MISE AU RÉEL */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Règles de mise au réel</h3>
          <div className="space-y-3">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son arrivée en retard</label>
              <select
                value={badgeSettings.lateArrival}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, lateArrival: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Pré-remplir avec l'heure planifiée</option>
                <option value="badged">Pré-remplir avec l'heure badgée</option>
              </select>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son arrivée en avance</label>
              <select
                value={badgeSettings.earlyArrival}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, earlyArrival: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Pré-remplir avec l'heure planifiée</option>
                <option value="badged">Pré-remplir avec l'heure badgée</option>
              </select>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son départ en retard</label>
              <select
                value={badgeSettings.lateDeparture}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, lateDeparture: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Pré-remplir avec l'heure planifiée</option>
                <option value="badged">Pré-remplir avec l'heure badgée</option>
              </select>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son départ en avance</label>
              <select
                value={badgeSettings.earlyDeparture}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, earlyDeparture: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Pré-remplir avec l'heure planifiée</option>
                <option value="badged">Pré-remplir avec l'heure badgée</option>
              </select>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge moins de pause que prévu</label>
              <select
                value={badgeSettings.shortBreak}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, shortBreak: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Enregistrer le temps de pause prévu</option>
                <option value="badged">Enregistrer le temps de pause badgé</option>
              </select>
            </div>
          </div>
        </div>

        {/* FRÉQUENCE DES BADGES */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Fréquence des badges</h3>
          <select
            value={badgeSettings.frequency}
            onChange={(e) => setBadgeSettings({ ...badgeSettings, frequency: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="per_shift">Au début et à la fin de chaque shift</option>
            <option value="per_day">Au début et à la fin de la journée</option>
          </select>
        </div>

        {/* ALERTES RETARDS */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Alertes des retards</h3>
          <div className="bg-gray-700/30 rounded-lg p-4">
            <label className="block text-gray-300 mb-3">Notifier les planificateurs par SMS après</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={badgeSettings.alertDelay}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, alertDelay: parseInt(e.target.value) })}
                className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-gray-400">minutes de retard</span>
            </div>
          </div>
        </div>

        {/* PAUSES ET CONTRÔLES */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Pauses et contrôles</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={badgeSettings.badgeBreaks}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, badgeBreaks: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Badger les pauses</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={badgeSettings.requireSignature}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, requireSignature: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Faire signer mes employés lors du badge</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={badgeSettings.takePhoto}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, takePhoto: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-white">Prendre une photo lors du badge</span>
                <p className="text-xs text-orange-400 mt-1">La CNIL considère cela comme une collecte excessive de données</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={badgeSettings.differentTablets}
                onChange={(e) => setBadgeSettings({ ...badgeSettings, differentTablets: e.target.checked })}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-white">Badger le début et la fin d'un shift depuis différentes tablettes</span>
            </label>
          </div>
        </div>

        {/* BADGEUSE MOBILE */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-lg">Badgeuse sur application mobile</h3>
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={badgeSettings.mobileApp}
              onChange={(e) => setBadgeSettings({ ...badgeSettings, mobileApp: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white">J'active la badgeuse sur l'application mobile</span>
          </label>

          {badgeSettings.mobileApp && (
            <div className="space-y-3 ml-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeSettings.mobileBreaks}
                  onChange={(e) => setBadgeSettings({ ...badgeSettings, mobileBreaks: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-white">Badger les pauses</span>
              </label>

              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-2">
                  Collecte des données de géolocalisation : automatiquement effacées après 3 mois
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BadgeSection;
