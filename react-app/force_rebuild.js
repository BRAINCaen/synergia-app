// ==========================================
// 📁 react-app/force-rebuild.js
// Fichier temporaire pour forcer un rebuild complet Netlify
// ==========================================

console.log('🚀 Force rebuild - Version 2025-06-26-20h30');

// Ce fichier force Netlify à reconstruire complètement l'application
// Il sera supprimé après résolution du problème

export default function forceRebuild() {
  return {
    timestamp: new Date().toISOString(),
    version: '3.5.1-hotfix',
    buildId: Math.random().toString(36).substring(7)
  };
}