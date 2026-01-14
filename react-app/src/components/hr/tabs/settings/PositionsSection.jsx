import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Plus } from 'lucide-react';

const PositionsSection = ({ positions, setPositions }) => {
  const handleAddPosition = () => {
    setPositions([...positions, {
      id: `position_${Date.now()}`,
      name: 'Nouveau poste',
      color: '#3B82F6',
      breakTime: 0
    }]);
  };

  return (
    <motion.div
      key="positions"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Définissez les postes utilisés dans votre planning</p>
            <p className="text-gray-400">Chaque poste peut avoir sa propre couleur et temps de pause</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {positions.map((position, index) => (
          <div key={position.id} className="bg-gray-700/30 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nom du poste</label>
                <input
                  type="text"
                  value={position.name}
                  onChange={(e) => {
                    const updatedPositions = [...positions];
                    updatedPositions[index].name = e.target.value;
                    setPositions(updatedPositions);
                  }}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Couleur</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={position.color}
                    onChange={(e) => {
                      const updatedPositions = [...positions];
                      updatedPositions[index].color = e.target.value;
                      setPositions(updatedPositions);
                    }}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={position.color}
                    onChange={(e) => {
                      const updatedPositions = [...positions];
                      updatedPositions[index].color = e.target.value;
                      setPositions(updatedPositions);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Temps de pause (min)</label>
                <input
                  type="number"
                  value={position.breakTime}
                  onChange={(e) => {
                    const updatedPositions = [...positions];
                    updatedPositions[index].breakTime = parseInt(e.target.value) || 0;
                    setPositions(updatedPositions);
                  }}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddPosition}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Ajouter un poste
      </button>
    </motion.div>
  );
};

export default PositionsSection;
