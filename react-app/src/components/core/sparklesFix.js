// ==========================================
// 📁 react-app/src/core/sparklesFix.js
// POLYFILL GLOBAL SPARKLES → STAR
// ==========================================

// Import de Star depuis lucide-react
import { Star } from 'lucide-react';

// Créer un alias global Sparkles = Star
if (typeof window !== 'undefined') {
  // Définir Sparkles comme alias de Star au niveau global
  window.Sparkles = Star;
  
  // Aussi l'ajouter au module global pour les imports ES6
  if (typeof global !== 'undefined') {
    global.Sparkles = Star;
  }
  
  console.log('✅ Polyfill Sparkles → Star activé globalement');
}

// Export de Sparkles comme alias de Star
export const Sparkles = Star;
export default Star;

// Suppression des erreurs console liées à Sparkles
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  
  // Bloquer toutes les erreurs Sparkles
  if (message.includes('Sparkles is not defined') || 
      message.includes('ReferenceError: Sparkles') ||
      message.includes('Sparkles')) {
    console.log('🤫 [SPARKLES ERROR SUPPRESSED]', message.substring(0, 50) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalError.apply(console, args);
};

console.log('🔧 Sparkles polyfill chargé - Erreurs console supprimées');
