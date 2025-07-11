import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            {/* Logo Synergia - remplacez par votre logo si vous en avez un */}
            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-600">S</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Synergia</h1>
          <p className="text-primary-100 text-lg">
            Plateforme de gestion d'équipe gamifiée
          </p>
        </div>

        {/* Contenu principal (Login/Signup forms) */}
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {children || <Outlet />}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-primary-100 text-sm">
            © 2024 Synergia. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
