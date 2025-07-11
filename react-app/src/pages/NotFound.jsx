// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../core/constants.js';
import Button from '../shared/components/ui/Button.jsx';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-600">404</h1>
          <div className="text-6xl mb-4">🤔</div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Page introuvable
        </h2>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md">
          Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="space-y-4">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="primary" size="lg">
              🏠 Retour au Dashboard
            </Button>
          </Link>
          
          <div className="text-gray-500">
            <Link 
              to={ROUTES.LOGIN}
              className="hover:text-gray-300 transition-colors underline"
            >
              Ou retourner à la connexion
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-gray-600 text-sm">
          <p>Synergia v2.0 - Architecture Modulaire</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
