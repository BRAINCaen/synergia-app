// ==========================================
// PulseCheckIn - Daily mood/energy check-in
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Eye, EyeOff, RefreshCw } from 'lucide-react';

const PulseCheckIn = ({ onSubmit, submitting, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!mood || !energy) return;
    onSubmit({ mood, energy, note, isAnonymous });
  };

  const moodOptions = Object.values(MOOD_LEVELS);
  const energyOptions = Object.values(ENERGY_LEVELS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
    >
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-3"
        >
          <Heart className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-1">Comment allez-vous ?</h2>
        <p className="text-gray-400 text-sm">Votre check-in quotidien</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              1. Comment est votre humeur ?
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setMood(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    mood === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-[10px] font-medium ${mood === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => mood && setStep(2)}
              disabled={!mood}
              className={`w-full py-2.5 rounded-xl font-semibold transition-all text-sm ${
                mood
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuer
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              2. Quel est votre niveau d'energie ?
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {energyOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setEnergy(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    energy === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-[10px] font-medium ${energy === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
              >
                Retour
              </button>
              <button
                onClick={() => energy && setStep(3)}
                disabled={!energy}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  energy
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              3. Un commentaire ? (optionnel)
            </h3>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Partagez ce qui vous preoccupe ou vous motive..."
              className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-3 text-sm"
            />

            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl mb-4 transition-all text-sm ${
                isAnonymous
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isAnonymous ? 'Reponse anonyme' : 'Rendre anonyme'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-4' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PulseCheckIn;
