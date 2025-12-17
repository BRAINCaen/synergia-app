// ==========================================
// react-app/src/components/boost/index.js
// Exports centralises des composants Boost
// ==========================================

export { default as BoostButton } from './BoostButton';
export { default as BoostModal } from './BoostModal';
export { default as BoostWidget } from './BoostWidget';

// Re-export des types et du service pour faciliter l'import
export { boostService, BOOST_TYPES } from '../../core/services/boostService';
