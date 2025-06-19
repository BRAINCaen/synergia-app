import React from 'react'
import { cn } from '../../utils/helpers'

// Spinner de chargement
export const Spinner = ({ size = 'md', className, color = 'primary' }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }
  
  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  return (
    <svg 
      className={cn('animate-spin', sizes[size], colors[color], className)} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  )
}

// Page de chargement complète
export const LoadingPage = ({ 
  message = 'Chargement...', 
  description,
  logo = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        {logo && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Synergia</h1>
            <p className="text-gray-500">Plateforme de gestion d'équipe</p>
          </div>
        )}
        
        <Spinner size="xl" className="mx-auto mb-6" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Skeleton pour les cartes
export const CardSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6 animate-pulse', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              'h-3 bg-gray-200 rounded',
              i === lines - 1 ? 'w-1/2' : 'w-full'
            )}
          ></div>
        ))}
      </div>
    </div>
  )
}

// Skeleton pour les listes
export const ListSkeleton = ({ items = 5, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton pour les tableaux
export const TableSkeleton = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant de chargement inline
export const InlineLoading = ({ text = 'Chargement...', size = 'sm' }) => {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

// Export par défaut avec tous les composants
const Loading = { 
  Spinner, 
  LoadingPage, 
  CardSkeleton, 
  ListSkeleton, 
  TableSkeleton, 
  InlineLoading 
}

export default Loading
