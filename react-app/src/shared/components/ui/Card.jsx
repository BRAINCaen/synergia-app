import React from 'react'
import { cn } from '../../utils/helpers'

const Card = ({ 
  children, 
  className,
  header,
  footer,
  variant = 'default',
  padding = 'default',
  hover = false,
  ...props 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-md',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200'
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const hoverEffects = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''

  return (
    <div 
      className={cn(
        'rounded-lg',
        variants[variant],
        hoverEffects,
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          {typeof header === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-900">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}
      
      <div className={cn(paddings[padding])}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  )
}

// Composants spécialisés pour différents types de cartes
export const StatCard = ({ title, value, icon, color = 'primary', trend, className }) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100'
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)} padding="default">
      <div className="flex items-center">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('text-xs', trend.positive ? 'text-green-600' : 'text-red-600')}>
              {trend.positive ? '↗' : '↘'} {trend.value}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default Card
