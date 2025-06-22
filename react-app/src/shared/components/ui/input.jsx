import React from 'react'
import { clsx } from 'clsx'

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  icon,
  error,
  label,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <input
          type={type}
          className={clsx(
            'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            icon && 'pl-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
export { Input }
